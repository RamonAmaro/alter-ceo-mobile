import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { Fonts } from "@/constants/theme";

interface ChatAvatarProps {
  isUser: boolean;
  userInitial?: string;
}

const AVATAR_SIZE = 28;

export const ChatAvatar = memo(function ChatAvatar({ isUser, userInitial }: ChatAvatarProps) {
  if (!isUser) {
    return (
      <View style={[styles.avatar, styles.avatarBot]}>
        <AlterLogo size={14} />
      </View>
    );
  }

  const hasInitial = userInitial && userInitial !== "?";

  return (
    <View style={[styles.avatar, styles.avatarUser]}>
      {hasInitial ? (
        <ThemedText type="labelSm" style={styles.initial}>
          {userInitial}
        </ThemedText>
      ) : (
        <Ionicons name="person" size={14} color="rgba(255,255,255,0.6)" />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBot: {
    backgroundColor: "rgba(0,255,132,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.3)",
  },
  avatarUser: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  initial: {
    color: "#ffffff",
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 14,
  },
});
