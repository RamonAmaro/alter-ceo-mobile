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
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={16} color="rgba(255,255,255,0.6)" />
        </View>
        <ThemedText type="caption" style={styles.label}>
          {label}
        </ThemedText>
      </View>
      <ThemedText type="bodyMd" style={styles.value}>
        {value}
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
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontSize: 11,
    fontFamily: Fonts.montserratBold,
  },
  value: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 21,
    fontSize: 14,
  },
});
