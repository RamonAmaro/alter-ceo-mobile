import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { GlassCard } from "./glass-card";

export function BrainCard() {
  return (
    <GlassCard style={styles.card} outerStyle={styles.outer} onPress={() => {}} highlight>
      <View>
        <ThemedText type="headingMd" style={styles.label}>
          El Cerebro
        </ThemedText>
        <View style={styles.titleRow}>
          <ThemedText type="headingMd" style={styles.title}>
            ALTER CEO
          </ThemedText>
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
    flex: 1.4,
  },
  card: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: "space-between",
  },
  label: {
    fontFamily: Fonts.montserratBold,
    fontSize: 20,
    color: SemanticColors.success,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 20,
    color: SemanticColors.textPrimary,
  },
  description: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.55)",
  },
});
