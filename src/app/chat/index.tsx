import { AppBackground } from "@/components/app-background";
import { Spacing } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageBubble } from "@/components/chat/message-bubble";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  text: "¡Hola! Soy el Cerebro ALTER CEO. ¿En qué puedo ayudarte hoy?",
  isUser: false,
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  function handleSend(): void {
    const text = inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Simulate AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: "Gracias por tu mensaje. Estoy analizando tu consulta para darte la mejor respuesta posible.",
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1200);
  }

  return (
    <AppBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={[styles.container, { paddingTop: insets.top + Spacing.two }]}
        >
          <ChatHeader />

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble text={item.text} isUser={item.isUser} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            style={styles.flex}
          />

          <View style={{ paddingBottom: insets.bottom }}>
            <ChatInput
              ref={inputRef}
              value={inputValue}
              onChangeText={setInputValue}
              onSend={handleSend}
            />
          </View>
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
  listContent: {
    flexGrow: 1,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
