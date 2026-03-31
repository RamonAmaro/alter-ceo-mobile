import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface CheckItemProps {
  text: string;
}

export function CheckItem({ text }: CheckItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Ionicons name="checkmark" size={10} color="#00FF84" />
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
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: "rgba(0,255,132,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  text: {
    color: "rgba(255,255,255,0.8)",
    flex: 1,
    lineHeight: 22,
    fontSize: 13,
    fontFamily: Fonts.montserratMedium,
  },
});
