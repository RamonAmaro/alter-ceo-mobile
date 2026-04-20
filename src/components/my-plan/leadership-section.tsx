import { PhaseItem } from "@/components/my-plan/phase-item";
import { RoleBarRow } from "@/components/my-plan/role-bar-row";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PlanLeadership, RoleSnapshot } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface LeadershipSectionProps {
  phase1?: string;
  phase2?: string;
  phase3?: string;
  roleEvolution?: PlanLeadership["evolucion_rol"];
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
): { key: string; current: number; target: number }[] {
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
}: LeadershipSectionProps) {
  const phaseTexts: Record<"phase1" | "phase2" | "phase3", string | undefined> = {
    phase1,
    phase2,
    phase3,
  };
  const activePhases = PHASES.filter((p) => phaseTexts[p.key]);

  const topCategories = getTopDiffCategories(
    roleEvolution?.situacion_actual,
    roleEvolution?.mes_12,
  );
  const maxValue = Math.max(...topCategories.flatMap((c) => [c.current, c.target]), 1);

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

      {topCategories.length > 0 && (
        <View style={styles.evolutionBlock}>
          <View style={styles.captionRow}>
            <View style={styles.captionBar} />
            <ThemedText style={styles.evolutionCaption}>ROL · HOY vs MES 12</ThemedText>
          </View>
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
