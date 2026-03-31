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
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: `${accentColor}18` }]}>
          <ThemedText type="caption" style={[styles.badgeNum, { color: accentColor }]}>
            #{index}
          </ThemedText>
        </View>
        <ThemedText type="labelSm" style={styles.title} numberOfLines={2}>
          {title}
        </ThemedText>
      </View>
      <View style={[styles.accentLine, { backgroundColor: `${accentColor}30` }]} />
      <ThemedText type="bodyMd" style={styles.desc}>
        {description}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeNum: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
  },
  title: {
    color: "#ffffff",
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
  },
  accentLine: {
    height: 1,
    borderRadius: 1,
  },
  desc: {
    color: "rgba(255,255,255,0.55)",
    lineHeight: 21,
    fontSize: 13,
  },
});
