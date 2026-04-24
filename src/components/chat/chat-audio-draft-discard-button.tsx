import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

import { PressableScale } from "@/components/pressable-scale";

interface ChatAudioDraftDiscardButtonProps {
  readonly onPress: () => void;
}

export function ChatAudioDraftDiscardButton({ onPress }: ChatAudioDraftDiscardButtonProps) {
  return (
    <PressableScale
      style={styles.button}
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel="Descartar borrador"
    >
      <Ionicons name="trash-outline" size={15} color="rgba(255, 120, 120, 0.9)" />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 120, 120, 0.22)",
  },
});
