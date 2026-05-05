import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  badge?: string | number;
  sectionNumber?: string;
}

export function SectionHeader({ title, eyebrow, badge, sectionNumber }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText> : null}

      <View style={styles.titleRow}>
        <ThemedText style={styles.title}>
          {sectionNumber ? (
            <ThemedText style={styles.sectionNumber}>{sectionNumber}. </ThemedText>
          ) : null}
          {title}
        </ThemedText>
        {badge !== undefined ? (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>{badge}</ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  eyebrow: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.2,
  },
  sectionNumber: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.success,
    letterSpacing: -0.2,
  },
  badge: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: Spacing.one,
    borderRadius: 6,
    backgroundColor: "rgba(0,255,132,0.16)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    color: SemanticColors.success,
  },
});
