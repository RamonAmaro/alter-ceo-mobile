import { MetricCard } from "@/components/my-plan/metric-card";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { PlanFinancialState } from "@/types/plan-data";
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
  const metrics = [
    financialState?.rentabilidad && { label: "Rentabilidad", value: financialState.rentabilidad },
    financialState?.liquidez && { label: "Liquidez", value: financialState.liquidez },
    financialState?.kpis && { label: "KPIs", value: financialState.kpis },
    financialState?.planificacion && {
      label: "Planificación",
      value: financialState.planificacion,
    },
    founderDependency && { label: "Depend. fundador", value: founderDependency },
    acquisitionSystem && { label: "Captación", value: acquisitionSystem },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <View style={styles.container}>
      <SectionHeader title="Diagnóstico" />

      <ThemedText type="bodyMd" style={styles.intro}>
        {introduction}
      </ThemedText>

      {metrics.length > 0 && (
        <View style={styles.grid}>
          {metrics.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} />
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
    color: "rgba(255,255,255,0.7)",
    lineHeight: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
});
