import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import type { ChatAudioState } from "@/hooks/use-chat-audio-recorder";
import { formatTimer } from "@/utils/format-timer";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAudioPress: () => void;
  audioState: ChatAudioState;
  audioElapsedMs: number;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onAudioPress,
  audioState,
  audioElapsedMs,
  disabled = false,
}: ChatInputProps) {
  const hasText = value.trim().length > 0;
  const isRecording = audioState === "recording";
  const isSubmittingAudio = audioState === "submitting";
  const canSend = hasText && !disabled && !isRecording && !isSubmittingAudio;
  const placeholder = isRecording
    ? `Grabando audio... ${formatTimer(audioElapsedMs)}`
    : isSubmittingAudio
      ? "Transcribiendo audio..."
      : "Escribe tu mensaje...";

  return (
    <View style={styles.container}>
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
            editable={!disabled && !isRecording && !isSubmittingAudio}
          />
          <TouchableOpacity
            style={[
              styles.audioBtn,
              isRecording && styles.audioBtnRecording,
              isSubmittingAudio && styles.audioBtnDisabled,
            ]}
            activeOpacity={0.7}
            onPress={onAudioPress}
            disabled={isSubmittingAudio || disabled}
          >
            {isSubmittingAudio ? (
              <ActivityIndicator size="small" color={SemanticColors.textPrimary} />
            ) : (
              <Ionicons
                name={isRecording ? "stop" : "mic-outline"}
                size={18}
                color={isRecording ? SemanticColors.onSuccess : SemanticColors.textMuted}
              />
            )}
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          activeOpacity={0.8}
          onPress={onSend}
          disabled={!canSend}
        >
          <LinearGradient
            colors={
              canSend ? ["#00FF84", "#00CC6A"] : ["rgba(0,255,132,0.3)", "rgba(0,204,106,0.3)"]
            }
            style={styles.sendGradient}
          >
            <Ionicons name="send" size={18} color={canSend ? "#000000" : "rgba(0,0,0,0.4)"} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
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
  audioBtnRecording: {
    backgroundColor: SemanticColors.success,
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
