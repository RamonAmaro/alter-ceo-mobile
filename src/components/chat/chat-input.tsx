import { StyleSheet, View } from "react-native";

import { ChatRecordingBar } from "@/components/chat/chat-recording-bar";
import { ChatSubmittingBar } from "@/components/chat/chat-submitting-bar";
import { ChatTextInputRow } from "@/components/chat/chat-text-input-row";
import { Spacing } from "@/constants/theme";
import type { ChatAudioState } from "@/hooks/use-chat-audio-recorder";

interface ChatInputProps {
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly onSend: () => void;
  readonly onStartRecording: () => void;
  readonly onStopRecording: () => void;
  readonly onCancelRecording: () => void;
  readonly audioState: ChatAudioState;
  readonly audioElapsedMs: number;
  readonly disabled?: boolean;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  audioState,
  audioElapsedMs,
  disabled = false,
}: ChatInputProps) {
  return (
    <View style={styles.container}>
      {audioState === "recording" ? (
        <ChatRecordingBar
          elapsedMs={audioElapsedMs}
          onCancel={onCancelRecording}
          onSend={onStopRecording}
        />
      ) : audioState === "submitting" ? (
        <ChatSubmittingBar />
      ) : (
        <ChatTextInputRow
          value={value}
          onChangeText={onChangeText}
          onSend={onSend}
          onStartRecording={onStartRecording}
          disabled={disabled}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
});
