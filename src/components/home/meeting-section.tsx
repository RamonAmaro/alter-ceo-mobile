import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { GlassCard } from "./glass-card";

export function MeetingSection() {
  return (
    <View style={styles.row}>
      <GlassCard
        style={styles.recordCard}
        outerStyle={styles.recordOuter}
        onPress={() => {}}
      >
        <View style={styles.header}>
          <ThemedText type="labelSm" style={styles.label}>Grabar</ThemedText>
          <Ionicons name="mic" size={16} color="rgba(255,255,255,0.5)" />
        </View>
        <ThemedText type="subtitle" style={styles.title}>Reunión</ThemedText>
        <View style={styles.micCircle}>
          <Ionicons
            name="mic-outline"
            size={32}
            color="rgba(255,255,255,0.4)"
          />
        </View>
      </GlassCard>

      <View style={styles.miniColumn}>
        <GlassCard
          style={styles.miniCard}
          outerStyle={styles.miniOuter}
          onPress={() => {}}
        >
          <LinearGradient
            colors={["rgba(0,255,132,0.05)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
        </GlassCard>
        <GlassCard
          style={styles.miniCard}
          outerStyle={styles.miniOuter}
          onPress={() => {}}
        >
          <LinearGradient
            colors={["rgba(0,255,132,0.05)", "transparent"]}
            style={StyleSheet.absoluteFill}
          />
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  recordOuter: {
    flex: 1,
  },
  recordCard: {
    flex: 1,
    padding: Spacing.three,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  title: {
    fontSize: 24,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  micCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.three,
  },
  miniColumn: {
    flex: 1,
    gap: Spacing.three,
  },
  miniOuter: {
    flex: 1,
  },
  miniCard: {
    flex: 1,
    minHeight: 70,
  },
});
