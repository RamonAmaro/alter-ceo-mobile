import { Platform, StyleSheet, View } from "react-native";

import { Spacing } from "@/constants/theme";

import { ChatAudioDraftDiscardButton } from "./chat-audio-draft-discard-button";
import { ChatAudioDraftIcon } from "./chat-audio-draft-icon";
import { ChatAudioDraftLabel } from "./chat-audio-draft-label";
import { ChatAudioDraftPlayButton } from "./chat-audio-draft-play-button";
import { ChatAudioDraftProgress } from "./chat-audio-draft-progress";
import { ChatAudioDraftSendButton } from "./chat-audio-draft-send-button";

interface ChatAudioDraftCardProps {
  readonly durationMs: number;
  readonly currentTimeMs: number;
  readonly isSubmitting: boolean;
  readonly isPlaying: boolean;
  readonly canPlay: boolean;
  readonly onTogglePlay: () => void;
  readonly onSend: () => void;
  readonly onDiscard: () => void;
}

export function ChatAudioDraftCard({
  durationMs,
  currentTimeMs,
  isSubmitting,
  isPlaying,
  canPlay,
  onTogglePlay,
  onSend,
  onDiscard,
}: ChatAudioDraftCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, cardShadow]}>
        <ChatAudioDraftIcon variant={isSubmitting ? "submitting" : "idle"} />

        {isSubmitting ? (
          <ChatAudioDraftLabel variant="submitting" durationMs={durationMs} />
        ) : (
          <ChatAudioDraftProgress
            currentMs={currentTimeMs}
            totalMs={durationMs}
            isPlaying={isPlaying}
          />
        )}

        {!isSubmitting ? (
          <View style={styles.actions}>
            {canPlay ? (
              <ChatAudioDraftPlayButton isPlaying={isPlaying} onToggle={onTogglePlay} />
            ) : null}
            <ChatAudioDraftDiscardButton onPress={onDiscard} />
            <ChatAudioDraftSendButton onPress={onSend} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#00FF84",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  android: { elevation: 4 },
  web: { boxShadow: "0 6px 18px rgba(0, 255, 132, 0.08), 0 2px 6px rgba(0, 0, 0, 0.4)" },
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(14, 24, 22, 0.88)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
});
