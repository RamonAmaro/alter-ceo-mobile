import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { forwardRef } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export const ChatInput = forwardRef<TextInput, ChatInputProps>(
  function ChatInput({ value, onChangeText, onSend }, ref) {
    const hasText = value.trim().length > 0;

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
              ref={ref}
              style={styles.input}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={value}
              onChangeText={onChangeText}
              onSubmitEditing={onSend}
              returnKeyType="send"
              multiline={false}
            />
            <TouchableOpacity style={styles.audioBtn} activeOpacity={0.6}>
              <Ionicons
                name="radio-outline"
                size={20}
                color="rgba(255,255,255,0.5)"
              />
            </TouchableOpacity>
          </LinearGradient>

          <TouchableOpacity
            style={[styles.sendBtn, !hasText && styles.sendBtnDisabled]}
            activeOpacity={0.8}
            onPress={onSend}
            disabled={!hasText}
          >
            <LinearGradient
              colors={
                hasText
                  ? ["#00FF84", "#00CC6A"]
                  : ["rgba(0,255,132,0.3)", "rgba(0,204,106,0.3)"]
              }
              style={styles.sendGradient}
            >
              <Ionicons
                name="send"
                size={18}
                color={hasText ? "#000000" : "rgba(0,0,0,0.4)"}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

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
    color: "#ffffff",
  },
  audioBtn: {
    padding: Spacing.two,
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
