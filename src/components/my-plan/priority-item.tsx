import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface PriorityItemProps {
  text: string;
}

export function PriorityItem({ text }: PriorityItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name="checkmark" size={12} color={SemanticColors.success} />
      </View>
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
  icon: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: "rgba(0,255,132,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  text: {
    color: "rgba(255,255,255,0.8)",
    flex: 1,
    lineHeight: 22,
    fontSize: 14,
    fontFamily: Fonts.montserratMedium,
  },
});
