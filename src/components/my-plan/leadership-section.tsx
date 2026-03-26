import { PhaseItem } from "@/components/my-plan/phase-item";
import { RoleBarRow } from "@/components/my-plan/role-bar-row";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import type { PlanLeadership, RoleSnapshot } from "@/types/plan-data";
import { StyleSheet, View } from "react-native";

interface LeadershipSectionProps {
  phase1?: string;
  phase2?: string;
  phase3?: string;
  roleEvolution?: PlanLeadership["evolucion_rol"];
  firstStepMessage?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  desarrollo_estrategia_comercial: "Estrategia comercial",
  control_gestion_kpis: "Control y KPIs",
  liderazgo_efectivo: "Liderazgo",
  mejora_experiencia_cliente: "Exp. cliente",
  vision_planificacion_largo_plazo: "Visión y planificación",
  apagar_fuegos_incidencias: "Apagar fuegos",
  microgestion_equipo: "Microgestión",
  atencion_gestion_clientes: "Atención clientes",
  presupuestos_ventas_operativas: "Ventas operativas",
  entrega_producto_servicio: "Entrega servicio",
};

const PHASES = [
  { key: "phase1" as const, label: "Fase 1", sublabel: "Profesionalizar" },
  { key: "phase2" as const, label: "Fase 2", sublabel: "Delegación" },
  { key: "phase3" as const, label: "Fase 3", sublabel: "CEO Estratégico" },
];

function getTopDiffCategories(
  current?: RoleSnapshot,
  target?: RoleSnapshot,
  count = 6,
): Array<{ key: string; current: number; target: number }> {
  if (!current || !target) return [];
  return Object.keys(current)
    .map((key) => ({ key, current: current[key] ?? 0, target: target[key] ?? 0 }))
    .sort((a, b) => Math.abs(b.target - b.current) - Math.abs(a.target - a.current))
    .slice(0, count);
}

export function LeadershipSection({
  phase1,
  phase2,
  phase3,
  roleEvolution,
  firstStepMessage,
}: LeadershipSectionProps) {
  const phaseTexts: Record<"phase1" | "phase2" | "phase3", string | undefined> = { phase1, phase2, phase3 };
  const activePhases = PHASES.filter((p) => phaseTexts[p.key]);

  const topCategories = getTopDiffCategories(
    roleEvolution?.situacion_actual,
    roleEvolution?.mes_12,
  );
  const maxValue = Math.max(...topCategories.flatMap((c) => [c.current, c.target]), 1);

  return (
    <View style={styles.container}>
      <SectionHeader title="Plan de liderazgo" />

      {firstStepMessage && (
        <View style={styles.alertCard}>
          <ThemedText type="caption" style={styles.alertBadge}>PRIMER PASO</ThemedText>
          <ThemedText type="bodyMd" style={styles.alertText}>{firstStepMessage}</ThemedText>
        </View>
      )}

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

      {topCategories.length > 0 && (
        <View style={styles.evolutionBlock}>
          <ThemedText type="caption" style={styles.evolutionCaption}>
            EVOLUCIÓN DE TU ROL — HOY vs MES 12
          </ThemedText>
          {topCategories.map((c) => (
            <RoleBarRow
              key={c.key}
              label={CATEGORY_LABELS[c.key] ?? c.key}
              current={c.current}
              target={c.target}
              maxValue={maxValue}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  alertCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: Spacing.two,
    borderLeftWidth: 3,
    borderLeftColor: "#00FF84",
  },
  alertBadge: {
    color: "#00FF84",
    fontFamily: Fonts.montserratBold,
    letterSpacing: 1,
    fontSize: 10,
  },
  alertText: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
  },
  phasesBlock: {
    gap: 0,
  },
  evolutionBlock: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: Spacing.three,
  },
  evolutionCaption: {
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 1,
    fontSize: 10,
    fontFamily: Fonts.montserratBold,
  },
});
