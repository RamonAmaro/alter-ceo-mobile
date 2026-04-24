import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { SemanticColors } from "@/constants/theme";

interface ChatAudioDraftIconProps {
  readonly variant: "idle" | "submitting" | "lost";
}

export function ChatAudioDraftIcon({ variant }: ChatAudioDraftIconProps) {
  if (variant === "submitting") {
    return (
      <View style={[styles.wrap, styles.wrapSubmitting]}>
        <ActivityIndicator size="small" color={SemanticColors.success} />
      </View>
    );
  }

  if (variant === "lost") {
    return (
      <View style={[styles.wrap, styles.wrapLost]}>
        <Ionicons name="alert-circle" size={18} color={SemanticColors.error} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Ionicons name="mic" size={18} color="rgba(255, 255, 255, 0.75)" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  wrapSubmitting: {
    backgroundColor: "rgba(0, 255, 132, 0.1)",
    borderColor: "rgba(0, 255, 132, 0.28)",
  },
  wrapLost: {
    backgroundColor: "rgba(255, 80, 80, 0.14)",
    borderColor: "rgba(255, 80, 80, 0.3)",
  },
});
