import { ThemedText } from "@/components/themed-text";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, View } from "react-native";

interface ItemCardProps {
  index: number;
  title: string;
  description: string;
  accentColor: string;
}

export function ItemCard({ index, title, description, accentColor }: ItemCardProps) {
  const isDanger = accentColor === "#FF4444";
  const indexLabel = String(index).padStart(2, "0");
  const gradient: readonly [string, string] = isDanger
    ? ["rgba(255,68,68,0.08)", "rgba(255,255,255,0.01)"]
    : ["rgba(0,255,132,0.08)", "rgba(255,255,255,0.01)"];

  return (
    <View style={[styles.card, { borderColor: `${accentColor}22` }]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <MonumentalIndex
        label={indexLabel}
        size={120}
        opacity={isDanger ? 0.05 : 0.06}
        right={-10}
        bottom={-22}
      />

      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: `${accentColor}18`, borderColor: `${accentColor}33` }]}>
          <ThemedText style={[styles.badgeNum, { color: accentColor }]}>#{index}</ThemedText>
        </View>
        <View style={styles.metaRow}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <ThemedText style={styles.meta}>
            {isDanger ? "BLOQUEO" : "OPORTUNIDAD"} · {indexLabel}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.title}>{title}</ThemedText>

      <View style={[styles.divider, { backgroundColor: `${accentColor}22` }]} />

      <ThemedText style={styles.desc}>{description}</ThemedText>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  android: { elevation: 3 },
  web: { boxShadow: "0 4px 14px rgba(0,0,0,0.22)" },
});

const styles = StyleSheet.create({
  card: {
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 1,
    gap: Spacing.two,
    overflow: "hidden",
    ...cardShadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderWidth: 1,
  },
  badgeNum: {
    fontFamily: Fonts.montserratExtraBold,
    fontStyle: "italic",
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.3,
  },
  metaRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  accentBar: {
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  meta: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 20,
    color: SemanticColors.textPrimary,
  },
  divider: {
    height: 1,
    borderRadius: 1,
  },
  desc: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: SemanticColors.textSecondaryLight,
  },
});
