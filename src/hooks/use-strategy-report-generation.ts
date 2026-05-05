import {
  getStepIndexForStrategyReportStage,
  getStepIndexForStrategyReportStep,
  getStrategyReportSteps,
  type StrategyReportStage,
} from "@/constants/strategy-report-loading-steps";
import {
  createReportRun,
  getReportById,
  getReportRunStatus,
  streamReportRunEvents,
} from "@/services/report-service";
import { useAuthStore } from "@/stores/auth-store";
import { useStrategiesStore } from "@/stores/strategies-store";
import { useStrategyReportStore } from "@/stores/strategy-report-store";
import { ApiError } from "@/types/api";
import type { ReportRunCreateRequest } from "@/types/report";
import { buildStrategyAnswersPayload } from "@/utils/build-strategy-answers-payload";
import { toErrorMessage } from "@/utils/to-error-message";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

const MAX_RETRIES = 3;

interface StrategyReportGenerationState {
  readonly stepIndex: number;
  readonly error: string | null;
}

interface ReportStepStartedPayload {
  readonly step_id?: string;
  readonly step_index?: number;
  readonly step_count?: number;
}

function extractReportId(payload: string): string | null {
  try {
    const parsed = JSON.parse(payload) as { report_id?: string };
    return parsed.report_id ?? null;
  } catch {
    return null;
  }
}

export function useStrategyReportGeneration(): StrategyReportGenerationState {
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const lastEventIdRef = useRef<string | undefined>(undefined);
  const retryCountRef = useRef(0);

  const user = useAuthStore((s) => s.user);
  const reportType = useStrategyReportStore((s) => s.reportType);
  const template = useStrategyReportStore((s) => s.template);
  const answers = useStrategyReportStore((s) => s.answers);
  const setRunId = useStrategyReportStore((s) => s.setRunId);
  const setGeneratedReport = useStrategyReportStore((s) => s.setGeneratedReport);

  const userRef = useRef(user);
  const reportTypeRef = useRef(reportType);
  const templateRef = useRef(template);
  const answersRef = useRef(answers);
  userRef.current = user;
  reportTypeRef.current = reportType;
  templateRef.current = template;
  answersRef.current = answers;

  useEffect(() => {
    void startGeneration();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function advanceToStage(stage: StrategyReportStage): void {
    const steps = getStrategyReportSteps(reportTypeRef.current);
    const nextIndex = getStepIndexForStrategyReportStage(stage, steps);
    setStepIndex((prev) => Math.max(prev, nextIndex));
  }

  function advanceToReportStep(stepId: string): void {
    const steps = getStrategyReportSteps(reportTypeRef.current);
    const nextIndex = getStepIndexForStrategyReportStep(stepId, steps);
    if (nextIndex === null) return;
    setStepIndex((prev) => Math.max(prev, nextIndex));
  }

  function parseReportStepPayload(payload: string): ReportStepStartedPayload | null {
    try {
      return JSON.parse(payload) as ReportStepStartedPayload;
    } catch {
      return null;
    }
  }

  function handleFailure(message: string): void {
    setError(message);
  }

  async function loadAndShowReport(reportId: string): Promise<void> {
    try {
      const record = await getReportById(reportId);
      setGeneratedReport(record.report);
      advanceToStage("complete");
      router.replace("/(app)/strategy-questionnaire-result");
    } catch (fetchError) {
      handleFailure(toErrorMessage(fetchError));
    }
  }

  function connectToRun(runId: string): void {
    const connection = streamReportRunEvents(
      runId,
      (event) => {
        if (event.id) lastEventIdRef.current = event.id;

        if (event.event === "complete") {
          const reportId = extractReportId(event.data);
          if (!reportId) {
            handleFailure("La ejecución terminó, pero no hemos podido leer el informe.");
            return;
          }

          connection.abort();
          void loadAndShowReport(reportId);
          return;
        }

        if (event.event === "error") {
          let message = "Error al generar el informe. Por favor, inténtalo de nuevo.";
          try {
            const payload = JSON.parse(event.data) as { message?: string };
            if (payload.message) {
              message = payload.message;
            }
          } catch {
            /* ignore parse error */
          }
          handleFailure(message);
          return;
        }

        if (event.event === "report_generating") {
          advanceToStage("report_generating");
          return;
        }

        if (event.event === "report_step_started") {
          const payload = parseReportStepPayload(event.data);
          if (payload?.step_id) {
            advanceToReportStep(payload.step_id);
          }
          return;
        }

        if (event.event === "queued" || event.event === "running") {
          advanceToStage(event.event);
        }
      },
      async () => {
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          setTimeout(() => connectToRun(runId), 1500 * retryCountRef.current);
          return;
        }

        try {
          const status = await getReportRunStatus(runId);
          if (status.status === "COMPLETED" && status.result?.report_id) {
            await loadAndShowReport(status.result.report_id);
            return;
          }
          handleFailure(
            status.error_message ?? "No se pudo reconectar con la ejecución del informe.",
          );
        } catch (statusError) {
          handleFailure(toErrorMessage(statusError));
        }
      },
      lastEventIdRef.current,
    );
    abortRef.current = connection;
  }

  async function startGeneration(): Promise<void> {
    const currentUser = userRef.current;
    const currentReportType = reportTypeRef.current;
    const currentTemplate = templateRef.current;
    const currentAnswers = answersRef.current;

    if (!currentUser?.userId || !currentReportType || !currentTemplate) {
      handleFailure("No hay suficiente contexto para generar el informe.");
      return;
    }

    try {
      setError(null);
      setGeneratedReport(null);
      setRunId(null);
      setStepIndex(0);

      const request: ReportRunCreateRequest = {
        user_id: currentUser.userId,
        report_type: currentReportType,
        answers: buildStrategyAnswersPayload(
          currentTemplate.questions,
          currentTemplate.prefilled ?? [],
          currentAnswers,
        ),
      };

      const accepted = await createReportRun(request);
      setRunId(accepted.run_id);
      void useStrategiesStore
        .getState()
        .trackPendingRun(currentUser.userId, accepted.run_id, currentReportType);
      advanceToStage("queued");
      connectToRun(accepted.run_id);
    } catch (generationError) {
      if (generationError instanceof ApiError) {
        handleFailure(`Error al crear el informe (${generationError.status}).`);
      } else {
        handleFailure(toErrorMessage(generationError));
      }
    }
  }

  return { stepIndex, error };
}
