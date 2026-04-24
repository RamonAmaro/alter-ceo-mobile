import { getStepIndexForStage, type RunStage } from "@/constants/report-loading-steps";
import { createRun, streamRunEvents } from "@/services/plan-service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ApiError } from "@/types/api";
import type { AudioAnswer } from "@/types/onboarding";
import { buildExpressPayload, buildProfessionalPayload } from "@/utils/build-onboarding-payload";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

const EXPRESS_AUDIO_INDICES = { primaryOffer: 11, mainObstacle: 12 };
const PROFESSIONAL_AUDIO_INDICES = {
  offerAndSales: 18,
  primaryOfferPrice: 19,
};
const MAX_RETRIES = 3;

interface PlanGenerationState {
  readonly stepIndex: number;
  readonly error: string | null;
}

function getAudioAnswer(
  audioRecords: readonly { questionIndex: number; transcript?: string | null }[],
  questionIndex: number,
): AudioAnswer {
  const record = audioRecords.find((r) => r.questionIndex === questionIndex);
  return {
    audio_url: "https://alterceo.com/audio/placeholder.mp3",
    duration_seconds: 1,
    transcript: record?.transcript ?? null,
  };
}

export function usePlanGeneration(): PlanGenerationState {
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const lastEventIdRef = useRef<string | undefined>(undefined);
  const retryCountRef = useRef(0);

  const planType = useOnboardingStore((s) => s.planType);
  const answers = useOnboardingStore((s) => s.answers);
  const audioRecords = useOnboardingStore((s) => s.audioRecords);
  const user = useAuthStore((s) => s.user);

  // Refs to capture latest values for the mount-only effect
  const planTypeRef = useRef(planType);
  const answersRef = useRef(answers);
  const audioRecordsRef = useRef(audioRecords);
  const userRef = useRef(user);
  planTypeRef.current = planType;
  answersRef.current = answers;
  audioRecordsRef.current = audioRecords;
  userRef.current = user;

  useEffect(() => {
    void startGeneration();
    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function advanceToStage(stage: RunStage, progressPct?: number): void {
    const baseIndex = getStepIndexForStage(stage);
    if (progressPct != null && stage === "plan_generating") {
      const range =
        getStepIndexForStage("plan_validating") - getStepIndexForStage("plan_generating");
      const computed = baseIndex + Math.floor((progressPct / 100) * range);
      setStepIndex((prev) => Math.max(prev, computed));
    } else {
      setStepIndex((prev) => Math.max(prev, baseIndex));
    }
  }

  function connectToRun(runId: string): void {
    const connection = streamRunEvents(
      runId,
      (event) => {
        if (event.id) lastEventIdRef.current = event.id;
        const stage = event.event as RunStage;

        if (stage === "complete") {
          advanceToStage("complete");
          connection.abort();
          setTimeout(() => router.replace("/(onboarding)/completion"), 800);
          return;
        }

        if (stage === "error") {
          setError("Error al generar el plan. Por favor, inténtalo de nuevo.");
          return;
        }

        let progressPct: number | undefined;
        try {
          const payload = JSON.parse(event.data) as Record<string, unknown>;
          if (typeof payload.progress_pct === "number") progressPct = payload.progress_pct;
        } catch {
          /* data not JSON, ignore */
        }

        advanceToStage(stage, progressPct);
      },
      () => {
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          setTimeout(() => connectToRun(runId), 1500 * retryCountRef.current);
        } else {
          setError("No se pudo conectar con el servidor. Por favor, inténtalo de nuevo.");
        }
      },
      lastEventIdRef.current,
    );
    abortRef.current = connection;
  }

  async function startGeneration(): Promise<void> {
    const currentUser = userRef.current;
    const currentPlanType = planTypeRef.current;
    const currentAnswers = answersRef.current;
    const currentAudioRecords = audioRecordsRef.current;

    if (!currentUser?.userId) {
      setError("Sesión no válida. Por favor, vuelve a iniciar sesión.");
      return;
    }

    if (!currentPlanType) {
      setError(
        "No se pudo recuperar tu plan de onboarding. Por favor, vuelve a la pantalla anterior e inténtalo de nuevo.",
      );
      return;
    }

    try {
      setStepIndex(0);

      const runRequest =
        currentPlanType === "express"
          ? buildExpressPayload({
              answers: currentAnswers,
              primaryOfferAudio: getAudioAnswer(
                currentAudioRecords,
                EXPRESS_AUDIO_INDICES.primaryOffer,
              ),
              mainObstacleAudio: getAudioAnswer(
                currentAudioRecords,
                EXPRESS_AUDIO_INDICES.mainObstacle,
              ),
              userId: currentUser.userId,
            })
          : buildProfessionalPayload({
              answers: currentAnswers,
              offerAndSalesAudio: getAudioAnswer(
                currentAudioRecords,
                PROFESSIONAL_AUDIO_INDICES.offerAndSales,
              ),
              primaryOfferPriceAudio: getAudioAnswer(
                currentAudioRecords,
                PROFESSIONAL_AUDIO_INDICES.primaryOfferPrice,
              ),
              userId: currentUser.userId,
            });

      const accepted = await createRun(runRequest);
      advanceToStage("running");
      connectToRun(accepted.run_id);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Error al crear el plan (${err.status}). Por favor, inténtalo de nuevo.`);
      } else {
        setError("Error inesperado. Por favor, inténtalo de nuevo.");
      }
    }
  }

  return { stepIndex, error };
}
