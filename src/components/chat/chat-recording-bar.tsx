import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { PressableScale } from "@/components/pressable-scale";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { formatTimer } from "@/utils/format-timer";

interface ChatRecordingBarProps {
  readonly elapsedMs: number;
  readonly onCancel: () => void;
  readonly onSend: () => void;
}

export function ChatRecordingBar({ elapsedMs, onCancel, onSend }: ChatRecordingBarProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.cancelBtn}
        activeOpacity={0.7}
        onPress={onCancel}
        hitSlop={8}
        accessibilityLabel="Cancelar grabación"
      >
        <Ionicons name="trash-outline" size={20} color={SemanticColors.error} />
      </TouchableOpacity>

      <LinearGradient
        colors={["rgba(255,80,80,0.2)", "rgba(255,80,80,0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.bar}
      >
        <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]} />
        <ThemedText type="bodyMd" style={styles.timer}>
          {formatTimer(elapsedMs)}
        </ThemedText>
        <ThemedText type="bodySm" style={styles.hint}>
          Grabando...
        </ThemedText>
      </LinearGradient>

      <PressableScale style={styles.sendBtn} onPress={onSend} accessibilityLabel="Enviar audio">
        <LinearGradient colors={["#00FF84", "#00CC6A"]} style={styles.sendGradient}>
          <Ionicons name="send" size={18} color={SemanticColors.onSuccess} />
        </LinearGradient>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  cancelBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,80,80,0.1)",
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.2)",
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SemanticColors.error,
  },
  timer: {
    fontFamily: Fonts.montserratSemiBold,
    color: SemanticColors.textPrimary,
    minWidth: 48,
  },
  hint: {
    color: SemanticColors.textMuted,
    flex: 1,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  sendGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
