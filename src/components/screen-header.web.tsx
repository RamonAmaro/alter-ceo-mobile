import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface ScreenHeaderProps {
  topInset: number;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  useLogoIcon?: boolean;
  titlePrefix: string;
  titleAccent: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function ScreenHeader({
  icon,
  useLogoIcon = false,
  titlePrefix,
  titleAccent,
  onBack,
  showBack = false,
}: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {showBack && onBack && (
        <Ionicons
          name="arrow-back"
          size={20}
          color={SemanticColors.textPrimary}
          onPress={onBack}
          style={styles.backButton}
        />
      )}

      {useLogoIcon ? (
        <AlterLogo size={20} />
      ) : (
        <Ionicons name={icon} size={18} color={SemanticColors.success} />
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
