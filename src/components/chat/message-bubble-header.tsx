import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { ChatAvatar } from "@/components/chat/chat-avatar";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { formatMessageTime } from "@/utils/format-date";

interface MessageBubbleHeaderProps {
  isUser: boolean;
  timestamp?: string;
  userInitial?: string;
}

export const MessageBubbleHeader = memo(function MessageBubbleHeader({
  isUser,
  timestamp,
  userInitial,
}: MessageBubbleHeaderProps) {
  const time = timestamp ? formatMessageTime(timestamp) : "";

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && <ChatAvatar isUser={false} />}
      <ThemedText type="labelSm" style={isUser ? styles.nameUser : styles.nameBot}>
        {isUser ? "Tú" : "Asesor"}
      </ThemedText>
      {time !== "" && (
        <ThemedText type="caption" style={styles.time}>
          {time}
        </ThemedText>
      )}
      {isUser && <ChatAvatar isUser userInitial={userInitial} />}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: 6,
    paddingLeft: 2,
  },
  rowUser: {
    justifyContent: "flex-end",
    paddingLeft: 0,
    paddingRight: 2,
  },
  nameBot: {
    color: "rgba(0,255,132,0.7)",
    fontFamily: Fonts.montserratSemiBold,
  },
  nameUser: {
    color: SemanticColors.textMuted,
    fontFamily: Fonts.montserratMedium,
  },
  time: {
    color: "rgba(255,255,255,0.3)",
  },
});
