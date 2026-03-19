import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { GlassCard } from "./glass-card";

export function BrainCard() {
  return (
    <GlassCard
      style={styles.card}
      outerStyle={styles.outer}
      onPress={() => {}}
      highlight
    >
      <ThemedText type="labelSm" style={styles.label}>El Cerebro</ThemedText>
      <View style={styles.titleRow}>
        <ThemedText type="subtitle" style={styles.title}>ALTER CEO</ThemedText>
        <View style={styles.logoWrap}>
          <AlterLogo size={18} />
        </View>
      </View>
      <ThemedText type="bodyMd" style={styles.description}>
        Conversa con tu mejor compañero a la hora de hacer crecer tu negocio.
      </ThemedText>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1.1,
  },
  card: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: "space-between",
  },
  label: {
    color: "#00FF84",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: 2,
  },
  title: {
    fontSize: 20,
    color: "#ffffff",
    letterSpacing: 1,
  },
  logoWrap: {
    marginTop: 2,
  },
  description: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 16,
    marginTop: Spacing.two,
  },
});
