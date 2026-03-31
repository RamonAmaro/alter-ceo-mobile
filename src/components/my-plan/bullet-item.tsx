import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface BulletItemProps {
  text: string;
  color?: string;
}

export function BulletItem({ text, color = "rgba(255,255,255,0.35)" }: BulletItemProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="bodyMd" style={styles.text}>
        {text}
      </ThemedText>
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
    width: 5,
    height: 5,
    borderRadius: 99,
    marginTop: 8,
    flexShrink: 0,
  },
  text: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
    fontSize: 13,
    flex: 1,
  },
});
