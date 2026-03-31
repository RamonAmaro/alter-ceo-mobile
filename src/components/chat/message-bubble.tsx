import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
  isLastInGroup?: boolean;
}

export function MessageBubble({ text, isUser, isLastInGroup = true }: MessageBubbleProps) {
  const bubbleStyle = isUser
    ? [styles.bubble, styles.bubbleUser, isLastInGroup && styles.bubbleUserTail]
    : [styles.bubble, styles.bubbleBot, isLastInGroup && styles.bubbleBotTail];

  return (
    <View style={[styles.row, isUser && styles.rowUser, isLastInGroup && styles.rowGroupEnd]}>
      <View style={isUser ? styles.wrapUser : styles.wrapBot}>
        <View style={bubbleStyle}>
          <ThemedText type="bodyMd" style={isUser ? styles.textUser : styles.textBot}>
            {text}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 2,
    paddingHorizontal: Spacing.three,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowGroupEnd: {
    marginBottom: Spacing.three,
  },
  wrapBot: {
    maxWidth: "85%",
  },
  wrapUser: {
    maxWidth: "75%",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: "rgba(0,255,132,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
  },
  bubbleUserTail: {
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  bubbleBotTail: {
    borderBottomLeftRadius: 4,
  },
  textBot: {
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
  },
  textUser: {
    color: "#ffffff",
    lineHeight: 22,
  },
});
