import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { MessageBubble } from "@/components/chat/message-bubble";
import { ScrollToBottomButton } from "@/components/chat/scroll-to-bottom-button";
import { StreamingBubble } from "@/components/chat/streaming-bubble";
import { Spacing } from "@/constants/theme";
import type { ChatMessageResponse } from "@/types/chat";

interface ChatMessageListProps {
  messages: readonly ChatMessageResponse[];
  isStreaming: boolean;
}

interface DisplayMessage {
  readonly id: string;
  readonly text: string;
  readonly isUser: boolean;
  readonly isLastInGroup: boolean;
}

const SCROLL_THRESHOLD = 150;

export function ChatMessageList({ messages, isStreaming }: ChatMessageListProps) {
  const listRef = useRef<FlatList<DisplayMessage>>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const displayMessages = useMemo(() => {
    const items: DisplayMessage[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const next = messages[i + 1];
      items.push({
        id: msg.id,
        text: msg.text,
        isUser: msg.role === "user",
        isLastInGroup: !next || next.role !== msg.role,
      });
    }
    return items;
  }, [messages]);

  const handleScroll = useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      setIsNearBottom(e.nativeEvent.contentOffset.y < SCROLL_THRESHOLD);
    },
    [],
  );

  const renderMessage = useCallback(
    ({ item }: { item: DisplayMessage }) => (
      <MessageBubble text={item.text} isUser={item.isUser} isLastInGroup={item.isLastInGroup} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: DisplayMessage) => item.id, []);

  function scrollToBottom(): void {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }

  const listHeader = isStreaming ? <StreamingBubble /> : null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={displayMessages}
        keyExtractor={keyExtractor}
        renderItem={renderMessage}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        style={styles.container}
        inverted
        onScroll={handleScroll}
        scrollEventThrottle={100}
      />
      <ScrollToBottomButton visible={!isNearBottom} onPress={scrollToBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
});
