import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { ChatInput } from "@/components/chat/chat-input";
import { KeyboardView } from "@/components/keyboard-view";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState("");

  const user = useAuthStore((s) => s.user);
  const messages = useChatStore((s) => s.messages);
  const threads = useChatStore((s) => s.threads);
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages);
  const error = useChatStore((s) => s.error);
  const fetchThreads = useChatStore((s) => s.fetchThreads);
  const createThread = useChatStore((s) => s.createThread);
  const selectThread = useChatStore((s) => s.selectThread);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const cancelStream = useChatStore((s) => s.cancelStream);

  useEffect(() => {
    if (!user) return;
    fetchThreads(user.userId);
  }, [user, fetchThreads]);

  useEffect(() => {
    if (threads.length > 0 && !activeThreadId) {
      selectThread(threads[0].thread_id);
    }
  }, [threads, activeThreadId, selectThread]);

  useEffect(() => {
    return () => cancelStream();
  }, [cancelStream]);

  async function handleSend(): Promise<void> {
    const text = inputValue.trim();
    if (!text || !user) return;
    setInputValue("");

    try {
      const threadId = activeThreadId ?? (await createThread(user.userId));
      await sendMessage(threadId, text);
    } catch {
      setInputValue(text);
    }
  }

  return (
    <AppBackground style={{ paddingBottom: insets.bottom }}>
      <KeyboardView>
        <View style={styles.flex}>
          <ScreenHeader
            topInset={insets.top}
            useLogoIcon
            titlePrefix="El Cerebro"
            titleAccent="ALTER CEO"
          />

          {isLoadingMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00FF84" />
            </View>
          ) : (
            <ChatMessageList messages={messages} isStreaming={isStreaming} />
          )}

          {error != null && (
            <ThemedText type="bodySm" style={styles.errorText}>
              {error}
            </ThemedText>
          )}

          <ChatInput
            value={inputValue}
            onChangeText={setInputValue}
            onSend={handleSend}
            disabled={isStreaming}
          />
        </View>
      </KeyboardView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
  },
});
