import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { MarkdownText } from "@/components/chat/markdown-text";
import { MessageBubbleHeader } from "@/components/chat/message-bubble-header";
import { RetryBadge } from "@/components/chat/retry-badge";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { MessageKind } from "@/types/chat";

const KIND_LABELS: Record<MessageKind, string> = {
  assistant_gap_prompt: "COMPLETANDO KERNEL",
};

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
  isLastInGroup?: boolean;
  showSender?: boolean;
  userInitial?: string;
  timestamp?: string;
  failed?: boolean;
  onRetry?: () => void;
  messageKind?: MessageKind;
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
  messageKind,
}: MessageBubbleProps) {
  const isGapPrompt = messageKind === "assistant_gap_prompt";
  const bubbleStyle = isUser
    ? [styles.bubble, styles.bubbleUser, isLastInGroup && styles.bubbleUserTail]
    : [
        styles.bubble,
        isGapPrompt ? styles.bubbleGapPrompt : styles.bubbleBot,
        isLastInGroup && styles.bubbleBotTail,
      ];

  const kindLabel = messageKind ? KIND_LABELS[messageKind] : undefined;

  return (
    <View style={[styles.container, isLastInGroup && styles.containerGroupEnd]}>
      {showSender && (
        <MessageBubbleHeader isUser={isUser} timestamp={timestamp} userInitial={userInitial} />
      )}

      <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
        {!isUser && <View style={styles.avatarSpacer} />}
        <View style={isUser ? styles.wrapUser : styles.wrapBot}>
          {kindLabel && (
            <View style={styles.kindBadge}>
              <ThemedText type="caption" style={styles.kindBadgeText}>
                {kindLabel}
              </ThemedText>
            </View>
          )}
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
  bubbleGapPrompt: {
    backgroundColor: "rgba(232,115,26,0.08)",
    borderWidth: 1,
    borderColor: "rgba(232,115,26,0.35)",
  },
  bubbleBotTail: {
    borderBottomLeftRadius: 4,
  },
  kindBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: SemanticColors.accent,
    borderRadius: 12,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    marginBottom: Spacing.one,
  },
  kindBadgeText: {
    color: SemanticColors.accent,
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  textUser: {
    color: SemanticColors.textPrimary,
    lineHeight: 22,
  },
});
