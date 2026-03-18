import { AlterLogo } from "@/components/alter-logo";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { GlassCard } from "./glass-card";

export function BrainCard() {
  return (
    <GlassCard
      style={styles.card}
      outerStyle={styles.outer}
      onPress={() => {}}
      highlight
    >
      <Text style={styles.label}>El Cerebro</Text>
      <View style={styles.titleRow}>
        <Text style={styles.title}>ALTER CEO</Text>
        <View style={styles.logoWrap}>
          <AlterLogo size={18} />
        </View>
      </View>
      <Text style={styles.description}>
        Conversa con tu mejor compañero a la hora de hacer crecer tu negocio.
      </Text>
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
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    fontWeight: "500",
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
    fontFamily: Fonts.nexaHeavy,
    fontSize: 20,
    color: "#ffffff",
    letterSpacing: 1,
  },
  logoWrap: {
    marginTop: 2,
  },
  description: {
    fontFamily: Fonts.montserrat,
    fontSize: 11,
    fontWeight: "400",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 16,
    marginTop: Spacing.two,
  },
});
