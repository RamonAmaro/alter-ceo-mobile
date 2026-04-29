import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  badge?: string | number;
}

export function SectionHeader({ title, eyebrow, badge }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={["rgba(0,255,132,0.10)", "rgba(0,255,132,0.02)", "rgba(0,0,0,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {eyebrow ? (
        <View style={styles.eyebrowRow}>
          <View style={styles.dot} />
          <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText>
        </View>
      ) : null}

      <View style={styles.titleRow}>
        <ThemedText style={styles.title}>{title}</ThemedText>
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.15)",
    backgroundColor: "rgba(255,255,255,0.02)",
    overflow: "hidden",
    gap: Spacing.one,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  eyebrow: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
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
    fontSize: 20,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
  },
  badge: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: Spacing.one,
    borderRadius: 6,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    color: SemanticColors.success,
  },
});
