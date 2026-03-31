import { AppBackground } from "@/components/app-background";
import { ChatInput } from "@/components/chat/chat-input";
import { StrategyCategoryChips } from "@/components/strategy/strategy-category-chips";
import { StrategyChatView, type ChatMessage } from "@/components/strategy/strategy-chat-view";
import { StrategyHeader } from "@/components/strategy/strategy-header";
import { StrategyTopicSelector } from "@/components/strategy/strategy-topic-selector";
import { Spacing } from "@/constants/theme";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StrategyScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  function handleBack(): void {
    setSelectedTopic(null);
    setMessages([]);
  }

  function handleSelectTopic(topic: string): void {
    setSelectedTopic(topic);
  }

  function sendMessage(text: string): void {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: text.trim(), isUser: true },
    ]);
  }

  const handleSend = useCallback((): void => {
    sendMessage(inputValue);
    setInputValue("");
  }, [inputValue]);

  return (
    <AppBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <StrategyHeader
            topInset={insets.top}
            onBack={selectedTopic !== null ? handleBack : undefined}
          />

          <View style={[styles.body, selectedTopic !== null && styles.bodyChat]}>
            {selectedTopic === null ? (
              <StrategyTopicSelector onSelect={handleSelectTopic} />
            ) : (
              <StrategyChatView messages={messages} />
            )}
          </View>

          {selectedTopic !== null && (
            <View style={[styles.footer, { paddingBottom: insets.bottom || Spacing.three }]}>
              <StrategyCategoryChips onSend={sendMessage} />
              <ChatInput
                value={inputValue}
                onChangeText={setInputValue}
                onSend={handleSend}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    justifyContent: "center",
  },
  bodyChat: {
    paddingHorizontal: 0,
    paddingTop: 0,
    justifyContent: "flex-start",
  },
  footer: {
    paddingTop: Spacing.one,
  },
});
