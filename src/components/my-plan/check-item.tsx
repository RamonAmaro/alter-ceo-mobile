import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface CheckItemProps {
  text: string;
}

export function CheckItem({ text }: CheckItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name="checkmark" size={11} color={SemanticColors.success} />
      </View>
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
  icon: {
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: "rgba(0,255,132,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 3,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.82)",
  },
});
