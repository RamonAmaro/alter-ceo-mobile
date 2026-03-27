import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface ItemCardProps {
  index: number;
  title: string;
  description: string;
  accentColor: string;
}

export function ItemCard({ index, title, description, accentColor }: ItemCardProps) {
  const badgeBg = accentColor === "#FF4444" ? "rgba(255,68,68,0.12)" : "rgba(0,255,132,0.1)";
  const cardBg = accentColor === "#FF4444" ? "rgba(255,68,68,0.04)" : "rgba(0,255,132,0.03)";
  const cardBorder = accentColor === "#FF4444" ? "rgba(255,68,68,0.1)" : "rgba(0,255,132,0.08)";

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: `${accentColor}44` }]}>
        <ThemedText type="caption" style={[styles.badgeNum, { color: accentColor }]}>
          {index}
        </ThemedText>
      </View>
      <View style={styles.content}>
        <ThemedText type="labelSm" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText type="bodyMd" style={styles.desc}>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: Spacing.three,
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeNum: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    color: "#ffffff",
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 20,
  },
  desc: {
    color: "rgba(255,255,255,0.6)",
    lineHeight: 20,
    fontSize: 13,
  },
});
