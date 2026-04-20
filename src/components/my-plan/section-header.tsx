import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface SectionHeaderProps {
  title: string;
  eyebrow?: string;
  accent?: string;
  badge?: string | number;
  badgeColor?: string;
}

export function SectionHeader({
  title,
  eyebrow,
  accent,
  badge,
  badgeColor = SemanticColors.success,
}: SectionHeaderProps) {
  const isDanger = badgeColor === "#FF4444";
  const badgeBg = isDanger ? "rgba(255,68,68,0.12)" : "rgba(0,255,132,0.12)";
  const badgeBorder = isDanger ? "rgba(255,68,68,0.25)" : "rgba(0,255,132,0.25)";
  const accentColor = badgeColor;

  return (
    <View style={styles.wrap}>
      {eyebrow ? (
        <View style={styles.eyebrowRow}>
          <View style={[styles.eyebrowBar, { backgroundColor: accentColor }]} />
          <ThemedText style={styles.eyebrow}>{eyebrow}</ThemedText>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.titleGroup}>
          {!eyebrow ? (
            <View style={[styles.leftAccent, { backgroundColor: accentColor }]} />
          ) : null}
          <ThemedText style={styles.title}>
            {title}
            {accent ? <ThemedText style={styles.titleAccent}>{` ${accent}`}</ThemedText> : null}
          </ThemedText>
        </View>

        {badge !== undefined ? (
          <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
            <ThemedText style={[styles.badgeText, { color: badgeColor }]}>{badge}</ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  eyebrowBar: {
    width: 18,
    height: 2,
    borderRadius: 1,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  leftAccent: {
    width: 3,
    height: 20,
    borderRadius: 99,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
  },
  titleAccent: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 26,
    color: SemanticColors.success,
    fontStyle: "italic",
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
