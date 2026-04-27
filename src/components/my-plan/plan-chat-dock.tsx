import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, View } from "react-native";

interface PlanChatDockProps {
  onOpenText: () => void;
  onOpenAudio: () => void;
  bottomInset: number;
}

export function PlanChatDock({ onOpenText, onOpenAudio, bottomInset }: PlanChatDockProps) {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { paddingBottom: bottomInset + Spacing.two }]}
    >
      <View style={styles.row}>
        <Pressable
          style={styles.input}
          onPress={onOpenText}
          accessibilityRole="button"
          accessibilityLabel="Abrir chat con Alter CEO"
        >
          <Ionicons name="chatbubble-outline" size={16} color={SemanticColors.textMuted} />
          <ThemedText style={styles.placeholder}>Pregúntale a Alter CEO…</ThemedText>
        </Pressable>

        <Pressable
          style={styles.audioButton}
          onPress={onOpenAudio}
          accessibilityRole="button"
          accessibilityLabel="Hablar con Alter CEO"
        >
          <Ionicons name="mic" size={20} color={SemanticColors.onSuccess} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    backgroundColor: Platform.OS === "web" ? "rgba(8,12,18,0.78)" : "rgba(8,12,18,0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: Spacing.three,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  placeholder: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 18,
    color: SemanticColors.textMuted,
    flex: 1,
  },
  audioButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SemanticColors.success,
  },
});
