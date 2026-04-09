import { SectionHeader } from "@/components/my-plan/section-header";
import { StatusRing, statusToColor, statusToValue } from "@/components/my-plan/status-ring";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import type { PlanFinancialState } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface DiagnosisSectionProps {
  introduction: string;
  financialState?: PlanFinancialState;
  founderDependency?: string;
  acquisitionSystem?: string;
}

export function DiagnosisSection({
  introduction,
  financialState,
  founderDependency,
  acquisitionSystem,
}: DiagnosisSectionProps) {
  const rings = [
    financialState?.rentabilidad && {
      label: financialState.rentabilidad,
      caption: "Rentabilidad",
    },
    financialState?.liquidez && { label: financialState.liquidez, caption: "Liquidez" },
    financialState?.kpis && { label: financialState.kpis, caption: "KPIs" },
    financialState?.planificacion && {
      label: financialState.planificacion,
      caption: "Planificación",
    },
    founderDependency && { label: founderDependency, caption: "Depend." },
    acquisitionSystem && { label: acquisitionSystem, caption: "Captación" },
  ].filter(Boolean) as { label: string; caption: string }[];

  return (
    <View style={styles.container}>
      <SectionHeader title="Diagnóstico" />

      <ThemedText type="bodyMd" style={styles.intro}>
        {introduction}
      </ThemedText>

      {rings.length > 0 && (
        <View style={styles.ringRow}>
          {rings.map((r) => (
            <StatusRing
              key={r.caption}
              value={statusToValue(r.label)}
              color={statusToColor(r.label)}
              label={r.label}
              caption={r.caption}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  intro: {
    color: SemanticColors.textSecondaryLight,
    lineHeight: 24,
  },
  ringRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    rowGap: Spacing.four,
    columnGap: Spacing.two,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
});
