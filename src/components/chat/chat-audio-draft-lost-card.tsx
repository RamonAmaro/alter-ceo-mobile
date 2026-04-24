import { Platform, StyleSheet, View } from "react-native";

import { Spacing } from "@/constants/theme";

import { ChatAudioDraftDiscardButton } from "./chat-audio-draft-discard-button";
import { ChatAudioDraftIcon } from "./chat-audio-draft-icon";
import { ChatAudioDraftLabel } from "./chat-audio-draft-label";

interface ChatAudioDraftLostCardProps {
  readonly durationMs: number;
  readonly onDiscard: () => void;
}

export function ChatAudioDraftLostCard({ durationMs, onDiscard }: ChatAudioDraftLostCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, cardShadow]}>
        <ChatAudioDraftIcon variant="lost" />
        <ChatAudioDraftLabel variant="lost" durationMs={durationMs} />
        <ChatAudioDraftDiscardButton onPress={onDiscard} />
      </View>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#FF5050",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  android: { elevation: 3 },
  web: { boxShadow: "0 4px 14px rgba(255, 80, 80, 0.12), 0 2px 6px rgba(0, 0, 0, 0.4)" },
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
    borderColor: "rgba(255, 80, 80, 0.25)",
    backgroundColor: "rgba(24, 14, 14, 0.88)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
