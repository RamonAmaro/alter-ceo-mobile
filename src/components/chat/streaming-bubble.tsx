import { memo } from "react";
import type { JSX } from "react";

import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { useChatStore } from "@/stores/chat-store";

interface StreamingBubbleProps {
  userInitial?: string;
}

export const StreamingBubble = memo(function StreamingBubble({
  userInitial,
}: StreamingBubbleProps): JSX.Element {
  const streamingText = useChatStore((s) => s.streamingText);

  if (streamingText === "") {
    return <TypingIndicator />;
  }

  return <MessageBubble text={streamingText} isUser={false} userInitial={userInitial} />;
});
