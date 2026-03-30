import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface AreaAnalysisCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

export function AreaAnalysisCard({ icon, label, value }: AreaAnalysisCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={18} color="rgba(255,255,255,0.5)" />
        </View>
        <View style={styles.textArea}>
          <ThemedText type="caption" style={styles.label}>
            {label}
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.value}>
            {value}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textArea: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontSize: 10,
    fontFamily: Fonts.montserratBold,
  },
  value: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 20,
    fontSize: 13,
  },
});
