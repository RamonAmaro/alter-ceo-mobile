import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { GlassCard } from "@/components/ui/glass-card";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface FirstStepSectionProps {
  message: string;
}

export function FirstStepSection({ message }: FirstStepSectionProps) {
  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="ACCIÓN INMEDIATA" title="Primer paso para" accent="arrancar" />

      <GlassCard tone="emerald" padding={Spacing.four} radius={22}>
        <MonumentalIndex label="01" size={130} opacity={0.06} right={-10} bottom={-24} />

        <View style={styles.iconRow}>
          <View style={styles.iconBox}>
            <Ionicons name="footsteps" size={20} color={SemanticColors.success} />
          </View>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <ThemedText style={styles.pillText}>ACCIÓN INMEDIATA</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.text}>{message}</ThemedText>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,255,132,0.14)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  pillText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.success,
    letterSpacing: 2,
  },
  text: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 23,
    color: SemanticColors.textSecondaryLight,
  },
});
