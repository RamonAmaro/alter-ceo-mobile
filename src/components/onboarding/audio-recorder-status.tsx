import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { LiveTranscriptBox } from "@/components/onboarding/live-transcript-box";
import { AudioWave } from "@/components/recording/audio-wave";
import { ThemedText } from "@/components/themed-text";
import { AUDIO_MAX_DURATION_MS } from "@/constants/audio";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { RecordingResult, RecordingState } from "@/hooks/use-onboarding-recorder";
import { formatTimer } from "@/utils/format-timer";

interface AudioRecorderStatusProps {
  recordState: RecordingState;
  elapsedMs: number;
  result: RecordingResult | null;
  transcriptionError: string | null;
  amplitudeRef: React.RefObject<number>;
  isRecordingActive: boolean;
}

export function AudioRecorderStatus({
  recordState,
  elapsedMs,
  result,
  transcriptionError,
  amplitudeRef,
  isRecordingActive,
}: AudioRecorderStatusProps): React.ReactElement {
  const isRecordingOrPaused = recordState === "recording" || recordState === "paused";

  return (
    <View style={styles.topArea}>
      {recordState === "preparing" && (
        <View style={styles.preparingBlock}>
          <ActivityIndicator color={SemanticColors.info} size="large" />
          <ThemedText type="labelMd" style={styles.preparingTitle}>
            Preparando grabación...
          </ThemedText>
        </View>
      )}

      {isRecordingOrPaused && (
        <>
          <AudioWave isActive={isRecordingActive} isReset={false} amplitudeRef={amplitudeRef} />
          <View style={styles.timerRow}>
            <ThemedText
              type="headingMd"
              style={[
                styles.timerText,
                isRecordingActive && styles.timerRecording,
                recordState === "paused" && styles.timerPaused,
              ]}
            >
              {formatTimer(elapsedMs)}
            </ThemedText>
            <ThemedText type="bodyMd" style={styles.timerLimit}>
              / {formatTimer(AUDIO_MAX_DURATION_MS)}
            </ThemedText>
          </View>
        </>
      )}

      {recordState === "finishing" && (
        <View style={styles.finishingBlock}>
          <ActivityIndicator color={SemanticColors.success} size="large" />
          <ThemedText type="labelMd" style={styles.finishingTitle}>
            Transcribiendo audio...
          </ThemedText>
          <ThemedText type="bodySm" style={styles.finishingSubtitle}>
            Espera un momento, estamos procesando tu respuesta
          </ThemedText>
        </View>
      )}

      {recordState === "done" &&
        (result?.transcript ? (
          <>
            <ThemedText type="labelMd" style={styles.transcriptLabel}>
              Transcripción
            </ThemedText>
            <LiveTranscriptBox text={result.transcript} />
          </>
        ) : transcriptionError ? (
          <ThemedText type="bodySm" style={styles.transcriptionErrorText}>
            {transcriptionError}
          </ThemedText>
        ) : (
          <ThemedText type="bodySm" style={styles.noTranscriptText}>
            Audio grabado correctamente
          </ThemedText>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  topArea: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.two,
    minHeight: 160,
    justifyContent: "flex-end",
    marginBottom: Spacing.two,
  },
  preparingBlock: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  preparingTitle: {
    color: SemanticColors.info,
    textAlign: "center",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.two,
  },
  timerText: {
    fontFamily: Fonts.montserratSemiBold,
    color: SemanticColors.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  timerRecording: {
    color: SemanticColors.success,
  },
  timerPaused: {
    color: SemanticColors.warning,
  },
  timerLimit: {
    color: SemanticColors.textDisabled,
    fontVariant: ["tabular-nums"],
  },
  finishingBlock: {
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  finishingTitle: {
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  finishingSubtitle: {
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 18,
  },
  transcriptLabel: {
    color: SemanticColors.textMuted,
  },
  noTranscriptText: {
    color: SemanticColors.textDisabled,
    fontStyle: "italic",
  },
  transcriptionErrorText: {
    color: SemanticColors.warning,
    textAlign: "center",
    fontStyle: "italic",
  },
});
