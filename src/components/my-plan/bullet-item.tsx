import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface BulletItemProps {
  text: string;
  color?: string;
}

export function BulletItem({ text, color = "rgba(255,255,255,0.45)" }: BulletItemProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText style={styles.text}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    marginTop: 9,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
  },
});
