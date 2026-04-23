import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet } from "react-native";

import { PressableScale } from "@/components/pressable-scale";
import { SemanticColors } from "@/constants/theme";

interface ChatAudioDraftSendButtonProps {
  readonly onPress: () => void;
}

export function ChatAudioDraftSendButton({ onPress }: ChatAudioDraftSendButtonProps) {
  return (
    <PressableScale
      style={[styles.button, sendShadow]}
      onPress={onPress}
      accessibilityLabel="Enviar audio"
    >
      <LinearGradient colors={["#00FF84", "#00CC6A"]} style={styles.gradient}>
        <Ionicons name="send" size={14} color={SemanticColors.onSuccess} />
      </LinearGradient>
    </PressableScale>
  );
}

const sendShadow = Platform.select({
  ios: {
    shadowColor: "#00FF84",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  android: { elevation: 4 },
  web: { boxShadow: "0 3px 10px rgba(0, 255, 132, 0.35)" },
});

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
