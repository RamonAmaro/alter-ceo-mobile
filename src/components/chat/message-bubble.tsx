import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

export function MessageBubble({ text, isUser, isLastInGroup = true }: MessageBubbleProps) {
  return (
    <View style={[styles.row, isUser && styles.rowUser, isLastInGroup && styles.rowGroupEnd]}>
      <View style={styles.bubbleWrap}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <ThemedText type="bodyMd" style={[styles.text, isUser && styles.textUser]}>
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
  bubbleWrap: {
    maxWidth: "70%",
  },
  bubble: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: "#005C4B",
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: "#1F2C34",
    borderBottomLeftRadius: 4,
  },
  text: {
    color: "#E9EDEF",
    lineHeight: 20,
  },
  textUser: {
    color: "#E9EDEF",
  },
});
