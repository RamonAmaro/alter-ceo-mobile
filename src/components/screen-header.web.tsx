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
  renderIcon?: () => React.ReactNode;
  titlePrefix: string;
  titleAccent: string;
  onBack?: () => void;
  onIconPress?: () => void;
  showBack?: boolean;
}

function HeaderGlyph({
  useLogoIcon,
  renderIcon,
  icon,
}: Pick<ScreenHeaderProps, "useLogoIcon" | "renderIcon" | "icon">): React.ReactNode {
  if (renderIcon) return renderIcon();
  if (useLogoIcon) return <AlterLogo size={20} />;
  return <Ionicons name={icon} size={18} color={SemanticColors.success} />;
}

export function ScreenHeader({
  topInset,
  icon,
  useLogoIcon = false,
  renderIcon,
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
        <Pressable
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={20} color={SemanticColors.textPrimary} />
        </Pressable>
      )}

      <View style={styles.glyphFrame}>
        <View style={styles.glyphGlow} />
        <Pressable
          onPress={onIconPress}
          disabled={!onIconPress}
          style={({ pressed }) => [styles.glyphPress, pressed && styles.glyphPressPressed]}
        >
          <HeaderGlyph useLogoIcon={useLogoIcon} renderIcon={renderIcon} icon={icon} />
        </Pressable>
      </View>

      <View style={styles.titleRow}>
        <ThemedText style={styles.prefix}>{titlePrefix} </ThemedText>
        <ThemedText style={styles.accent}>{titleAccent}</ThemedText>
      </View>
    </View>
  );
}

const GLYPH_SIZE = 40;

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
  glyphFrame: {
    width: GLYPH_SIZE,
    height: GLYPH_SIZE,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
    overflow: "hidden",
  },
  glyphGlow: {
    position: "absolute",
    top: -GLYPH_SIZE / 2,
    left: -GLYPH_SIZE / 2,
    width: GLYPH_SIZE * 2,
    height: GLYPH_SIZE * 2,
    borderRadius: GLYPH_SIZE,
    backgroundColor: "rgba(0,255,132,0.10)",
    opacity: 0.55,
  },
  glyphPress: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer" as never,
  },
  glyphPressPressed: {
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
