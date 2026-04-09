import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import { MessageBubble } from "@/components/chat/message-bubble";
import { ScrollToBottomButton } from "@/components/chat/scroll-to-bottom-button";
import { StreamingBubble } from "@/components/chat/streaming-bubble";
import { Spacing } from "@/constants/theme";
import type { ChatMessageResponse, MessageKind } from "@/types/chat";

interface ChatMessageListProps {
  messages: readonly ChatMessageResponse[];
  isStreaming: boolean;
  userInitial?: string;
  failedMessageId?: string | null;
  onRetry?: () => void;
}

interface DisplayMessage {
  readonly id: string;
  readonly text: string;
  readonly isUser: boolean;
  readonly isLastInGroup: boolean;
  readonly isFirstInGroup: boolean;
  readonly timestamp: string;
  readonly messageKind?: MessageKind;
}

const SCROLL_THRESHOLD = 150;

export function ChatMessageList({
  messages,
  isStreaming,
  userInitial,
  failedMessageId,
  onRetry,
}: ChatMessageListProps) {
  const listRef = useRef<FlatList<DisplayMessage>>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const displayMessages = useMemo(() => {
    const items: DisplayMessage[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const next = messages[i + 1];
      const prev = messages[i - 1];
      items.push({
        id: msg.id,
        text: msg.text,
        isUser: msg.role === "user",
        isLastInGroup: !next || next.role !== msg.role,
        isFirstInGroup: !prev || prev.role !== msg.role,
        timestamp: msg.created_at,
        messageKind: msg.message_kind,
      });
    }
    return items;
  }, [messages]);

  const handleScroll = useCallback((e: { nativeEvent: { contentOffset: { y: number } } }) => {
    setIsNearBottom(e.nativeEvent.contentOffset.y < SCROLL_THRESHOLD);
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: DisplayMessage }) => (
      <MessageBubble
        text={item.text}
        isUser={item.isUser}
        isLastInGroup={item.isLastInGroup}
        showSender={item.isFirstInGroup}
        userInitial={userInitial}
        timestamp={item.isFirstInGroup ? item.timestamp : undefined}
        failed={item.id === failedMessageId}
        onRetry={item.id === failedMessageId ? onRetry : undefined}
        messageKind={item.messageKind}
      />
    ),
    [userInitial, failedMessageId, onRetry],
  );

  const keyExtractor = useCallback((item: DisplayMessage) => item.id, []);

  function scrollToBottom(): void {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }

  const listHeader = isStreaming ? <StreamingBubble userInitial={userInitial} /> : null;

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
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
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
