import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface ChatTextInputRowProps {
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly onSend: () => void;
  readonly onStartRecording: () => void;
  readonly disabled?: boolean;
  readonly submitting?: boolean;
}

export function ChatTextInputRow({
  value,
  onChangeText,
  onSend,
  onStartRecording,
  disabled = false,
  submitting = false,
}: ChatTextInputRowProps) {
  const hasText = value.trim().length > 0;
  const canSend = hasText && !disabled && !submitting;
  const placeholder = submitting ? "Transcribiendo audio..." : "Escribe tu mensaje...";

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
          editable={!disabled && !submitting}
        />
        <TouchableOpacity
          style={[styles.audioBtn, submitting && styles.audioBtnDisabled]}
          activeOpacity={0.7}
          onPress={onStartRecording}
          disabled={submitting || disabled}
          hitSlop={8}
        >
          <Ionicons name="mic-outline" size={18} color={SemanticColors.textMuted} />
        </TouchableOpacity>
      </LinearGradient>

      <TouchableOpacity
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        activeOpacity={0.8}
        onPress={onSend}
        disabled={!canSend}
      >
        <LinearGradient
          colors={canSend ? ["#00FF84", "#00CC6A"] : ["rgba(0,255,132,0.3)", "rgba(0,204,106,0.3)"]}
          style={styles.sendGradient}
        >
          <Ionicons name="send" size={18} color={canSend ? "#000000" : "rgba(0,0,0,0.4)"} />
        </LinearGradient>
      </TouchableOpacity>
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
  audioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  audioBtnDisabled: {
    opacity: 0.7,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
