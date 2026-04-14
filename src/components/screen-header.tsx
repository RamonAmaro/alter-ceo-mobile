import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

interface ScreenHeaderProps {
  topInset: number;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  useLogoIcon?: boolean;
  titlePrefix: string;
  titleAccent: string;
  onBack?: () => void;
  onIconPress?: () => void;
  showBack?: boolean;
}

export function ScreenHeader({
  topInset,
  icon,
  useLogoIcon = false,
  titlePrefix,
  titleAccent,
  onBack,
  onIconPress,
  showBack = true,
}: ScreenHeaderProps) {
  function handleBack(): void {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  }

  return (
    <View style={[styles.container, { paddingTop: topInset + Spacing.two }]}>
      {showBack && (
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={SemanticColors.textPrimary} />
        </TouchableOpacity>
      )}

      {useLogoIcon ? (
        <Pressable
          onPress={onIconPress}
          disabled={!onIconPress}
          style={styles.iconBtn}
          hitSlop={12}
        >
          <AlterLogo size={20} />
        </Pressable>
      ) : (
        <Pressable
          onPress={onIconPress}
          disabled={!onIconPress}
          style={styles.iconBtn}
          hitSlop={12}
        >
          <Ionicons name={icon} size={18} color={SemanticColors.success} />
        </Pressable>
      )}

      <View style={styles.titleRow}>
        <ThemedText style={styles.prefix}>{titlePrefix} </ThemedText>
        <ThemedText style={styles.accent}>{titleAccent}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: SemanticColors.surfaceCard,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    marginBottom: Spacing.three,
  },
  backBtn: {
    marginRight: Spacing.one,
  },
  titleRow: {
    flexDirection: "row",
  },
  iconBtn: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  prefix: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 25,
    color: SemanticColors.textPrimary,
  },
  accent: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 25,
    color: SemanticColors.success,
  },
});
