import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { ProgressCircle } from "@/components/onboarding/progress-circle";
import { ThemedText } from "@/components/themed-text";
import {
  STEPS,
  getStepIndexForStage,
  type RunStage,
} from "@/constants/report-loading-steps";
import { Spacing } from "@/constants/theme";
import { createRun, streamRunEvents } from "@/services/plan-service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { ApiError } from "@/types/api";
import type { AudioAnswer } from "@/types/onboarding";
import {
  buildExpressPayload,
  buildProfessionalPayload,
} from "@/utils/build-onboarding-payload";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EXPRESS_AUDIO_INDICES = { primaryOffer: 11, mainObstacle: 12 };
const PROFESSIONAL_AUDIO_INDICES = { offerAndSales: 18, primaryOfferPrice: 19 };

export default function ReportLoadingScreen() {
  const insets = useSafeAreaInsets();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const lastEventIdRef = useRef<string | undefined>(undefined);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  const { planType, answers, audioRecords } = useOnboardingStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    void startGeneration();
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  function getAudioAnswer(questionIndex: number, recordingId: string): AudioAnswer {
    const record = audioRecords.find((r) => r.questionIndex === questionIndex);
    return {
      audio_url: `https://example.com/onboarding/${recordingId}.mp3`,
      duration_seconds: 1,
      transcript: record?.transcript ?? null,
    };
  }

  function advanceToStage(stage: RunStage, progressPct?: number): void {
    const baseIndex = getStepIndexForStage(stage);
    if (progressPct != null && stage === "plan_generating") {
      const range = getStepIndexForStage("plan_validating") - getStepIndexForStage("plan_generating");
      const computed = baseIndex + Math.floor((progressPct / 100) * range);
      setStepIndex((prev) => Math.max(prev, computed));
    } else {
      setStepIndex((prev) => Math.max(prev, baseIndex));
    }
  }

  async function startGeneration(): Promise<void> {
    if (!user?.userId || !planType) {
      setError("Sesión no válida. Por favor, vuelve a iniciar sesión.");
      return;
    }

    try {
      setStepIndex(0);

      let runRequest;

      if (planType === "express") {
        const primaryOffer = getAudioAnswer(EXPRESS_AUDIO_INDICES.primaryOffer, "express-primary-offer");
        const mainObstacle = getAudioAnswer(EXPRESS_AUDIO_INDICES.mainObstacle, "express-main-obstacle");
        runRequest = buildExpressPayload({
          answers,
          primaryOfferAudio: primaryOffer,
          mainObstacleAudio: mainObstacle,
          userId: user.userId,
        });
      } else {
        const offerAndSales = getAudioAnswer(PROFESSIONAL_AUDIO_INDICES.offerAndSales, "pro-offer-sales");
        const primaryOfferPrice = getAudioAnswer(PROFESSIONAL_AUDIO_INDICES.primaryOfferPrice, "pro-offer-price");
        runRequest = buildProfessionalPayload({
          answers,
          offerAndSalesAudio: offerAndSales,
          primaryOfferPriceAudio: primaryOfferPrice,
          userId: user.userId,
        });
      }

      const accepted = await createRun(runRequest);
      advanceToStage("running");

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
              console.error("[report-loading] SSE run error event:", event.data);
              setError(`Error al generar el plan: ${event.data || "error desconocido"}`);
              return;
            }

            let progressPct: number | undefined;
            try {
              const payload = JSON.parse(event.data) as Record<string, unknown>;
              if (typeof payload.progress_pct === "number") progressPct = payload.progress_pct;
            } catch { /* data not JSON, ignore */ }

            advanceToStage(stage, progressPct);
          },
          (err) => {
            console.error("[report-loading] SSE stream error:", err);
            if (retryCountRef.current < MAX_RETRIES) {
              retryCountRef.current += 1;
              setTimeout(() => connectToRun(runId), 1500 * retryCountRef.current);
            } else {
              setError(`No se pudo conectar con el servidor después de ${MAX_RETRIES} intentos.\n\n[${err.message}]`);
            }
          },
          lastEventIdRef.current,
        );
        abortRef.current = connection;
      }

      connectToRun(accepted.run_id);
    } catch (err) {
      console.error("[report-loading] startGeneration error:", err);
      if (err instanceof ApiError) {
        setError(`Error ${err.status}: ${err.message}`);
      } else if (err instanceof Error) {
        setError(`Error inesperado: ${err.message}`);
      } else {
        setError(`Error desconocido: ${String(err)}`);
      }
    }
  }

  if (error) {
    return (
      <AppBackground>
        <View
          style={[
            styles.container,
            {
              paddingTop: insets.top + Spacing.five,
              paddingBottom: insets.bottom + Spacing.four,
            },
          ]}
        >
          <View style={styles.content}>
            <ThemedText type="headingMd" style={styles.errorTitle}>
              Algo salió mal
            </ThemedText>
            <ThemedText type="bodyMd" style={styles.errorMessage}>
              {error}
            </ThemedText>
          </View>
          <View style={styles.footer}>
            <Button label="Volver" onPress={() => router.back()} />
          </View>
        </View>
      </AppBackground>
    );
  }

  const step = STEPS[stepIndex];

  return (
    <AppBackground>
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing.five,
            paddingBottom: insets.bottom + Spacing.four,
          },
        ]}
      >
        <View style={styles.content}>
          <ProgressCircle progress={step.percent} />
          <ThemedText type="bodyLg" style={styles.stepLabel}>
            {step.label}
          </ThemedText>
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.five,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  stepLabel: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  errorTitle: {
    color: "#ffffff",
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  errorMessage: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    paddingHorizontal: Spacing.two,
  },
  footer: {
    alignItems: "center",
    paddingTop: Spacing.three,
  },
});
