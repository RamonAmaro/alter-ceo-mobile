import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { GlassCard } from "./glass-card";
import { PerformanceChart } from "./performance-chart";

export function MachinesCard() {
  return (
    <GlassCard
      style={styles.card}
      outerStyle={styles.outer}
      onPress={() => {}}
      highlight
    >
      <View style={styles.labelRow}>
        <ThemedText type="headingMd" style={styles.label}>
          Sala de
        </ThemedText>
        <Ionicons
          name="settings-sharp"
          size={14}
          color="rgba(255,255,255,0.3)"
        />
      </View>
      <ThemedText type="headingMd" style={styles.title}>Máquinas</ThemedText>
      <View style={styles.chartWrap}>
        <PerformanceChart />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  card: {
    flex: 1,
    padding: Spacing.three,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  label: {
    fontFamily: Fonts.montserratBold,
    fontSize: 20,
    lineHeight: 20,
    color: "rgba(255,255,255,0.8)",
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 20,
    lineHeight: 20,
    color: "#00FF73",
  },
  chartWrap: {
    flex: 1,
    marginTop: Spacing.two,
    marginHorizontal: -Spacing.three,
    marginBottom: -Spacing.three,
  },
});
