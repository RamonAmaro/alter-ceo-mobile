import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { GlassCard } from "./glass-card";
import { PerformanceChart } from "./performance-chart";

export function MachinesCard() {
  return (
    <GlassCard style={styles.card} onPress={() => {}} highlight>
      <View style={styles.header}>
        <View>
          <View style={styles.labelRow}>
            <ThemedText type="labelSm" style={styles.label}>Sala de</ThemedText>
            <Ionicons
              name="settings-sharp"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </View>
          <ThemedText type="subtitle" style={styles.title}>Máquinas</ThemedText>
        </View>
      </View>
      <View style={styles.chartWrap}>
        <PerformanceChart />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.four,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  label: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  title: {
    fontSize: 28,
    color: "#00FF84",
    letterSpacing: 1,
  },
  chartWrap: {
    marginTop: Spacing.three,
  },
});
