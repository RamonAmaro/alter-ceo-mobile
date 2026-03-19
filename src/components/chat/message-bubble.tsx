import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
}

export function MessageBubble({ text, isUser }: MessageBubbleProps) {
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={styles.bubbleWrap}>
        <LinearGradient
          colors={
            isUser
              ? ["rgba(0,255,132,0.15)", "rgba(0,255,132,0.05)"]
              : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleBot,
          ]}
        >
          <ThemedText type="bodyMd" style={styles.text}>{text}</ThemedText>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  bubbleWrap: {
    maxWidth: "80%",
  },
  bubble: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderWidth: 1,
  },
  bubbleUser: {
    borderRadius: 20,
    borderBottomRightRadius: 6,
    borderColor: "rgba(0,255,132,0.15)",
  },
  bubbleBot: {
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    borderColor: "rgba(255,255,255,0.08)",
  },
  text: {
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
  },
});
