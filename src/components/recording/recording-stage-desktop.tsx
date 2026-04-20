import { StyleSheet, View } from "react-native";

import { GlassCard } from "@/components/ui/glass-card";
import { Spacing } from "@/constants/theme";
import type { AudioRecorderLike } from "@/types/audio";

import { AudioWave } from "./audio-wave";
import { RecordingControls } from "./recording-controls";
import { RecordingTimer } from "./recording-timer";

type RecordingState = "idle" | "recording" | "paused";

interface RecordingStageDesktopProps {
  state: RecordingState;
  recorder: AudioRecorderLike;
  onRecord: () => void;
  onDelete: () => void;
  onSave: () => void;
}

export function RecordingStageDesktop({
  state,
  recorder,
  onRecord,
  onDelete,
  onSave,
}: RecordingStageDesktopProps) {
  const isActive = state === "recording";
  const isReset = state === "idle";

  return (
    <View style={styles.wrap}>
      <GlassCard tone="neutral" padding={Spacing.five} radius={26} style={styles.card}>
        <View style={styles.waveSlot}>
          <AudioWave isActive={isActive} isReset={isReset} recorder={recorder} />
        </View>

        <RecordingTimer isRecording={isActive} isPaused={state === "paused"} />

        <View style={styles.controls}>
          <RecordingControls
            state={state}
            onRecord={onRecord}
            onDelete={onDelete}
            onSave={onSave}
          />
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    alignItems: "stretch",
    gap: Spacing.four,
  },
  waveSlot: {
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    marginTop: Spacing.two,
  },
});
