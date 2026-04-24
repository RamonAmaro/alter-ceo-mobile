import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { LocalRecording } from "@/stores/recordings-store";

import { UploadStatusBadge } from "./upload-status-badge";

interface PendingRecordingItemProps {
  recording: LocalRecording;
  onRetry: (recording: LocalRecording) => void;
  onDiscard: (recordingId: string) => void;
}

export function PendingRecordingItem({ recording, onRetry, onDiscard }: PendingRecordingItemProps) {
  const status = recording.uploadStatus ?? "local_only";

  const handleDiscard = () => {
    Alert.alert("Descartar grabación", "Se eliminará la grabación local. No podrás recuperarla.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Descartar", style: "destructive", onPress: () => onDiscard(recording.id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {recording.title}
        </ThemedText>
        <ThemedText style={styles.subtitle}>{recording.date}</ThemedText>
        {recording.errorMessage && status === "failed" ? (
          <ThemedText style={styles.error} numberOfLines={2}>
            {recording.errorMessage}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.actions}>
        <UploadStatusBadge status={status} onRetry={() => onRetry(recording)} />
        {status !== "uploading" && status !== "processing" ? (
          <TouchableOpacity onPress={handleDiscard} hitSlop={8} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={16} color={SemanticColors.textMuted} />
          </TouchableOpacity>
        ) : null}
        {status === "local_only" ? (
          <TouchableOpacity
            onPress={() => onRetry(recording)}
            hitSlop={8}
            activeOpacity={0.7}
            style={styles.sendButton}
          >
            <Ionicons name="cloud-upload-outline" size={16} color={SemanticColors.tealLight} />
            <ThemedText style={styles.sendLabel}>Enviar</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
    color: SemanticColors.textPrimary,
  },
  subtitle: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    color: SemanticColors.textMuted,
  },
  error: {
    fontFamily: Fonts.montserrat,
    fontSize: 10,
    color: SemanticColors.error,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
  sendLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    color: SemanticColors.tealLight,
  },
});
