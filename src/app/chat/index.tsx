import { AppBackground } from "@/components/app-background";
import { Spacing } from "@/constants/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  type TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
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

  const handleContentSizeChange = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
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
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: "Gracias por tu mensaje. Estoy analizando tu consulta para darte la mejor respuesta posible.",
        isUser: false,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1200);
  }

  return (
    <AppBackground style={{ paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            useLogoIcon
            titlePrefix="El Cerebro"
            titleAccent="ALTER CEO"
          />

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const next = messages[index + 1];
              const isLastInGroup = !next || next.isUser !== item.isUser;
              return (
                <MessageBubble
                  text={item.text}
                  isUser={item.isUser}
                  isLastInGroup={isLastInGroup}
                />
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            style={styles.flex}
            onContentSizeChange={handleContentSizeChange}
          />

          <ChatInput
            ref={inputRef}
            value={inputValue}
            onChangeText={setInputValue}
            onSend={handleSend}
          />
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
    justifyContent: "flex-end",
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
