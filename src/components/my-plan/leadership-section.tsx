import { PhaseItem } from "@/components/my-plan/phase-item";
import { RoleEvolutionCharts } from "@/components/my-plan/role-evolution-charts";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PlanLeadership } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface LeadershipSectionProps {
  phase1?: string;
  phase2?: string;
  phase3?: string;
  roleEvolution?: PlanLeadership["evolucion_rol"];
}

const PHASES = [
  { key: "phase1" as const, label: "Fase 1", sublabel: "Profesionalizar" },
  { key: "phase2" as const, label: "Fase 2", sublabel: "Delegación" },
  { key: "phase3" as const, label: "Fase 3", sublabel: "CEO Estratégico" },
];

export function LeadershipSection({
  phase1,
  phase2,
  phase3,
  roleEvolution,
}: LeadershipSectionProps) {
  const phaseTexts: Record<"phase1" | "phase2" | "phase3", string | undefined> = {
    phase1,
    phase2,
    phase3,
  };
  const activePhases = PHASES.filter((p) => phaseTexts[p.key]);
  const hasEvolution = Boolean(
    roleEvolution &&
    (roleEvolution.situacion_actual ||
      roleEvolution.mes_4 ||
      roleEvolution.mes_8 ||
      roleEvolution.mes_12),
  );

  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="EVOLUCIÓN · DEL CEO" title="Plan de" accent="liderazgo" />

      {activePhases.length > 0 && (
        <View style={styles.phasesBlock}>
          {activePhases.map((p, i) => (
            <PhaseItem
              key={p.key}
              label={p.label}
              sublabel={p.sublabel}
              text={phaseTexts[p.key] ?? ""}
              index={i + 1}
              isLast={i === activePhases.length - 1}
            />
          ))}
        </View>
      )}

      {hasEvolution && roleEvolution && (
        <View style={styles.evolutionBlock}>
          <View style={styles.captionRow}>
            <View style={styles.captionBar} />
            <ThemedText style={styles.evolutionCaption}>
              OBJETIVO · REDEFINE TU ROL EN 12 MESES
            </ThemedText>
          </View>
          <RoleEvolutionCharts evolution={roleEvolution} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  phasesBlock: {
    gap: 0,
  },
  evolutionBlock: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: Spacing.three,
  },
  captionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  captionBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  evolutionCaption: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.2,
  },
});
