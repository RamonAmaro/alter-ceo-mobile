import React from "react";
import { ActivityIndicator, StyleSheet, TextInput, View } from "react-native";

import { AudioWave } from "@/components/recording/audio-wave";
import { ThemedText } from "@/components/themed-text";
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
  editedTranscript: string;
  onEditTranscript: (text: string) => void;
}

export function AudioRecorderStatus({
  recordState,
  elapsedMs,
  result,
  transcriptionError,
  amplitudeRef,
  isRecordingActive,
  editedTranscript,
  onEditTranscript,
}: AudioRecorderStatusProps): React.ReactElement {
  const isRecordingOrPaused = recordState === "recording" || recordState === "paused";
  const hasTranscription = recordState === "done" && (result?.transcript || editedTranscript);

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

      {hasTranscription ? (
        <View style={styles.transcriptBlock}>
          <View style={styles.transcriptHeader}>
            <View style={styles.transcriptTitleRow}>
              <View style={styles.transcriptDot} />
              <ThemedText type="caption" style={styles.transcriptLabel}>
                TRANSCRIPCIÓN
              </ThemedText>
            </View>
            <ThemedText type="bodySm" style={styles.transcriptHint}>
              Edita el texto antes de confirmar
            </ThemedText>
          </View>
          <TextInput
            value={editedTranscript}
            onChangeText={onEditTranscript}
            style={styles.transcriptInput}
            multiline
            textAlignVertical="top"
            autoCapitalize="sentences"
            autoCorrect
            placeholder="Escribe o edita tu respuesta…"
            placeholderTextColor={SemanticColors.textPlaceholder}
            scrollEnabled
          />
        </View>
      ) : recordState === "done" && transcriptionError ? (
        <ThemedText type="bodySm" style={styles.transcriptionErrorText}>
          {transcriptionError}
        </ThemedText>
      ) : recordState === "done" && result?.uri ? (
        <ThemedText type="bodySm" style={styles.transcriptionWarningText}>
          No pudimos transcribir el audio, pero se grabó correctamente. Puedes escribir tu respuesta
          abajo o reintentar.
        </ThemedText>
      ) : recordState === "done" ? (
        <ThemedText type="bodySm" style={styles.transcriptionErrorText}>
          No detectamos audio suficiente. Pulsa Reintentar y habla durante unos segundos.
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  topArea: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.two,
    justifyContent: "flex-end",
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
  transcriptBlock: {
    width: "100%",
    gap: Spacing.two,
  },
  transcriptHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    paddingHorizontal: 2,
  },
  transcriptTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  transcriptDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  transcriptLabel: {
    color: SemanticColors.success,
    letterSpacing: 2.2,
    fontSize: 10,
    lineHeight: 13,
    fontFamily: Fonts.montserratSemiBold,
  },
  transcriptHint: {
    color: SemanticColors.textMuted,
    fontStyle: "italic",
    fontSize: 11,
    lineHeight: 14,
    flexShrink: 1,
    textAlign: "right",
  },
  transcriptInput: {
    width: "100%",
    minHeight: 110,
    maxHeight: 180,
    backgroundColor: "rgba(8,12,18,0.45)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserrat,
    fontSize: 15,
    lineHeight: 22,
    outlineStyle: "none" as never,
  },
  transcriptionErrorText: {
    color: SemanticColors.warning,
    textAlign: "center",
    fontStyle: "italic",
  },
  transcriptionWarningText: {
    color: SemanticColors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  },
});
