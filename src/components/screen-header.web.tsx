import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { goBackOrHome } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";

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
  showBack,
}: ScreenHeaderProps) {
  const { isMobile } = useResponsiveLayout();
  const shouldShowBack = showBack ?? isMobile;

  function handleBack(): void {
    if (onBack) {
      onBack();
      return;
    }
    goBackOrHome();
  }

  return (
    <View style={[styles.container, isMobile && { paddingTop: topInset + Spacing.two }]}>
      {shouldShowBack && (
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={SemanticColors.textPrimary} />
        </Pressable>
      )}

      {useLogoIcon ? (
        <Pressable
          onPress={onIconPress}
          disabled={!onIconPress}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        >
          <AlterLogo size={20} />
        </Pressable>
      ) : (
        <Pressable
          onPress={onIconPress}
          disabled={!onIconPress}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  backButton: {
    cursor: "pointer" as never,
    marginRight: Spacing.one,
  },
  iconBtn: {
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer" as never,
  },
  iconBtnPressed: {
    opacity: 0.8,
  },
  titleRow: {
    flexDirection: "row",
  },
  prefix: {
    fontFamily: Fonts.montserratBold,
    fontSize: 18,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
  },
  accent: {
    fontFamily: Fonts.montserratBold,
    fontSize: 18,
    lineHeight: 26,
    color: SemanticColors.success,
  },
});
