import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useRetryUpload } from "@/hooks/use-retry-upload";
import { useAuthStore } from "@/stores/auth-store";
import { useRecordingsStore } from "@/stores/recordings-store";

import { PendingRecordingItem } from "./pending-recording-item";

export function PendingRecordingsSection() {
  const userId = useAuthStore((s) => s.user?.userId);
  const recordings = useRecordingsStore((s) => s.recordings);
  const loadRecordings = useRecordingsStore((s) => s.loadRecordings);
  const { retryUpload, discardRecording } = useRetryUpload();

  useEffect(() => {
    if (!userId) return;
    void loadRecordings(userId);
  }, [userId, loadRecordings]);

  const pending = recordings.filter(
    (r) => r.uploadStatus === "local_only" || r.uploadStatus === "failed",
  );

  if (pending.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.accentBar} />
        <ThemedText style={styles.label}>PENDIENTES DE ENVÍO</ThemedText>
      </View>
      <View style={styles.list}>
        {pending.map((rec) => (
          <PendingRecordingItem
            key={rec.id}
            recording={rec}
            onRetry={retryUpload}
            onDiscard={discardRecording}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  accentBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.warning,
  },
  label: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  list: {
    gap: Spacing.two,
  },
});
