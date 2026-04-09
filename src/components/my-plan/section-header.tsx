import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  badge?: string | number;
  badgeColor?: string;
}

export function SectionHeader({ title, badge, badgeColor = "#00FF84" }: SectionHeaderProps) {
  const badgeBg = badgeColor === "#FF4444" ? "rgba(255,68,68,0.12)" : "rgba(0,255,132,0.12)";
  const badgeBorder = badgeColor === "#FF4444" ? "rgba(255,68,68,0.25)" : "rgba(0,255,132,0.25)";

  return (
    <View style={styles.row}>
      <View style={styles.titleGroup}>
        <View style={[styles.accent, { backgroundColor: badgeColor }]} />
        <ThemedText type="headingMd" style={styles.title}>
          {title}
        </ThemedText>
      </View>
      {badge !== undefined && (
        <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
          <ThemedText type="caption" style={[styles.badgeText, { color: badgeColor }]}>
            {badge}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  accent: {
    width: 3,
    height: 20,
    borderRadius: 99,
  },
  title: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
  },
  badge: {
    borderRadius: 99,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
  },
});
