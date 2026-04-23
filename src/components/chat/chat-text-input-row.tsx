import { StyleSheet, TextInput, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { PressableScale } from "@/components/pressable-scale";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface ChatTextInputRowProps {
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly onSend: () => void;
  readonly onStartRecording: () => void;
  readonly disabled?: boolean;
}

export function ChatTextInputRow({
  value,
  onChangeText,
  onSend,
  onStartRecording,
  disabled = false,
}: ChatTextInputRowProps) {
  const hasText = value.trim().length > 0;
  const canSend = hasText && !disabled;
  const placeholder = "Escribe tu mensaje...";

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={["rgba(0,255,132,0.18)", "rgba(0,255,132,0.03)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.inputWrap}
      >
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSend}
          returnKeyType="send"
          multiline={false}
          editable={!disabled}
        />
      </LinearGradient>

      {hasText ? (
        <PressableScale
          style={[styles.actionBtn, !canSend && styles.actionBtnDisabled]}
          onPress={onSend}
          disabled={!canSend}
          accessibilityLabel="Enviar mensaje"
        >
          <LinearGradient
            colors={
              canSend ? ["#00FF84", "#00CC6A"] : ["rgba(0,255,132,0.3)", "rgba(0,204,106,0.3)"]
            }
            style={styles.actionGradient}
          >
            <Ionicons name="send" size={18} color={canSend ? "#000000" : "rgba(0,0,0,0.4)"} />
          </LinearGradient>
        </PressableScale>
      ) : (
        <PressableScale
          style={[styles.actionBtn, disabled && styles.actionBtnDisabled]}
          onPress={onStartRecording}
          disabled={disabled}
          accessibilityLabel="Grabar audio"
        >
          <LinearGradient colors={["#00FF84", "#00CC6A"]} style={styles.actionGradient}>
            <Ionicons name="mic" size={20} color={SemanticColors.onSuccess} />
          </LinearGradient>
        </PressableScale>
      )}
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
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.2)",
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    color: SemanticColors.textPrimary,
    outlineStyle: "none" as never,
  },
  actionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
