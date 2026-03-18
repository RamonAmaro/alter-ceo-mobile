import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { GlassCard } from "./glass-card";
import { PerformanceChart } from "./performance-chart";

export function MachinesCard() {
  return (
    <GlassCard style={styles.card} onPress={() => {}} highlight>
      <View style={styles.header}>
        <View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Sala de</Text>
            <Ionicons
              name="settings-sharp"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </View>
          <Text style={styles.title}>Máquinas</Text>
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
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "500",
    color: "rgba(255,255,255,0.8)",
  },
  title: {
    fontFamily: Fonts.nexaHeavy,
    fontSize: 28,
    color: "#00FF84",
    letterSpacing: 1,
  },
  chartWrap: {
    marginTop: Spacing.three,
  },
});
