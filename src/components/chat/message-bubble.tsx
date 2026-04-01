import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { MarkdownText } from "@/components/chat/markdown-text";
import { MessageBubbleHeader } from "@/components/chat/message-bubble-header";
import { RetryBadge } from "@/components/chat/retry-badge";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
  isLastInGroup?: boolean;
  showSender?: boolean;
  userInitial?: string;
  timestamp?: string;
  failed?: boolean;
  onRetry?: () => void;
}

const AVATAR_SPACER_WIDTH = 28 + Spacing.two;

export const MessageBubble = memo(function MessageBubble({
  text,
  isUser,
  isLastInGroup = true,
  showSender = false,
  userInitial,
  timestamp,
  failed = false,
  onRetry,
}: MessageBubbleProps) {
  const bubbleStyle = isUser
    ? [styles.bubble, styles.bubbleUser, isLastInGroup && styles.bubbleUserTail]
    : [styles.bubble, styles.bubbleBot, isLastInGroup && styles.bubbleBotTail];

  return (
    <View style={[styles.container, isLastInGroup && styles.containerGroupEnd]}>
      {showSender && (
        <MessageBubbleHeader isUser={isUser} timestamp={timestamp} userInitial={userInitial} />
      )}

      <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
        {!isUser && <View style={styles.avatarSpacer} />}
        <View style={isUser ? styles.wrapUser : styles.wrapBot}>
          <View style={bubbleStyle}>
            {isUser ? (
              <ThemedText type="bodyMd" style={styles.textUser}>
                {text}
              </ThemedText>
            ) : (
              <MarkdownText text={text} color="rgba(255,255,255,0.9)" />
            )}
          </View>
          {failed && onRetry && <RetryBadge onRetry={onRetry} />}
        </View>
        {isUser && <View style={styles.avatarSpacer} />}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 2,
    paddingHorizontal: Spacing.three,
  },
  containerGroupEnd: {
    marginBottom: Spacing.three,
  },
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  avatarSpacer: {
    width: AVATAR_SPACER_WIDTH,
  },
  wrapBot: {
    maxWidth: "80%",
  },
  wrapUser: {
    maxWidth: "75%",
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: "rgba(0,255,132,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
  },
  bubbleUserTail: {
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  bubbleBotTail: {
    borderBottomLeftRadius: 4,
  },
  textUser: {
    color: "#ffffff",
    lineHeight: 22,
  },
});
