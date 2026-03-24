import { MessageBubble } from "@/components/chat/message-bubble";
import { Spacing } from "@/constants/theme";
import { useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import { StrategyResultCard } from "./strategy-result-card";

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

interface StrategyChatViewProps {
  messages: ChatMessage[];
}

const BOT_GREETING: ChatMessage[] = [
  { id: "bot-1", text: "¿Qué tarea es?", isUser: false },
  { id: "bot-2", text: "¿A quién?", isUser: false },
  { id: "bot-3", text: "¿Cuándo?", isUser: false },
];

const RESULT_ITEM_ID = "result-card";

type ListItem = ChatMessage | { id: string; type: "result" };

function isResultItem(item: ListItem): item is { id: string; type: "result" } {
  return "type" in item && item.type === "result";
}

export function StrategyChatView({ messages }: StrategyChatViewProps) {
  const listRef = useRef<FlatList<ListItem>>(null);

  const data: ListItem[] = [
    ...BOT_GREETING,
    { id: RESULT_ITEM_ID, type: "result" },
    ...messages,
  ];

  function renderItem({ item, index }: { item: ListItem; index: number }) {
    const next = data[index + 1];

    const currentIsUser = isResultItem(item) ? false : item.isUser;
    const nextIsUser = next && !isResultItem(next) ? next.isUser : null;

    const isLastInGroup =
      !next ||
      isResultItem(next) ||
      nextIsUser !== currentIsUser;

    if (isResultItem(item)) {
      return <StrategyResultCard isUser={false} isLastInGroup={isLastInGroup} />;
    }

    return (
      <MessageBubble
        text={item.text}
        isUser={item.isUser}
        isLastInGroup={isLastInGroup}
      />
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="interactive"
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
});
