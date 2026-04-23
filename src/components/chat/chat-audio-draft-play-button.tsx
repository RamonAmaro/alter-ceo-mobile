import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

import { PressableScale } from "@/components/pressable-scale";
import { SemanticColors } from "@/constants/theme";

interface ChatAudioDraftPlayButtonProps {
  readonly isPlaying: boolean;
  readonly onToggle: () => void;
}

export function ChatAudioDraftPlayButton({ isPlaying, onToggle }: ChatAudioDraftPlayButtonProps) {
  return (
    <PressableScale
      style={[styles.button, isPlaying ? styles.buttonActive : null]}
      onPress={onToggle}
      hitSlop={8}
      accessibilityLabel={isPlaying ? "Pausar audio" : "Escuchar audio"}
    >
      <Ionicons
        name={isPlaying ? "pause" : "play"}
        size={16}
        color={isPlaying ? SemanticColors.success : "rgba(255, 255, 255, 0.85)"}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: {
    backgroundColor: "rgba(0, 255, 132, 0.12)",
    borderColor: "rgba(0, 255, 132, 0.4)",
  },
});
