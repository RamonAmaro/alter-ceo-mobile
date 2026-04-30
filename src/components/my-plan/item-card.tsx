import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface ItemCardProps {
  index: number;
  title: string;
  description: string;
  accentColor: string;
}

function withAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export function ItemCard({ index, title, description, accentColor }: ItemCardProps) {
  const indexLabel = String(index).padStart(2, "0");
  const tint15 = withAlpha(accentColor, 0.15);
  const tint35 = withAlpha(accentColor, 0.35);
  const tint55 = withAlpha(accentColor, 0.55);

  return (
    <View style={[styles.wrap, { borderLeftColor: tint55 }]}>
      <View style={styles.header}>
        <View style={[styles.indexBadge, { backgroundColor: tint15, borderColor: tint35 }]}>
          <ThemedText style={[styles.indexLabel, { color: accentColor }]}>{indexLabel}</ThemedText>
        </View>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>

      <ThemedText style={styles.desc}>{description}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingLeft: Spacing.three,
    paddingVertical: Spacing.one,
    borderLeftWidth: 2,
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  indexLabel: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: -0.2,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
  desc: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
  },
});
