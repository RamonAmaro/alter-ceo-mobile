import type { PlanData } from "@/types/plan";

import type { PlanTab } from "./plan-nav-tabs";

export type PlanSectionKey =
  | "intro"
  | "diagnosis"
  | "areas"
  | "blockers"
  | "opportunities"
  | "strategy"
  | "sales"
  | "firststep"
  | "redefine"
  | "leadership";

export type PlanFlags = Readonly<Record<PlanSectionKey, boolean>>;

export function getPlanFlags(plan: PlanData): PlanFlags {
  const diagnosis = plan.diagnostico;
  const sales = plan.plan_ventas;
  const leadership = plan.plan_liderazgo;

  return {
    intro: Boolean(plan.introduccion_general),
    diagnosis: Boolean(diagnosis?.mensaje_introduccion),
    areas: Boolean(diagnosis?.analisis_por_areas),
    blockers: (diagnosis?.bloqueos_detectados?.length ?? 0) > 0,
    opportunities: (diagnosis?.oportunidades_mejora?.length ?? 0) > 0,
    strategy: hasAnySalesStrategy(sales),
    sales: Boolean(sales?.objetivo_facturacion_12_meses),
    firststep: Boolean(leadership?.primer_paso_trabajar_la_mitad?.mensaje),
    redefine: Boolean(leadership?.tres_pasos_redefinir_rol),
    leadership: Boolean(leadership),
  };
}

function hasAnySalesStrategy(sales: PlanData["plan_ventas"]): boolean {
  if (!sales) return false;
  return Boolean(
    sales.mejorar_producto_servicio ??
    sales.aumentar_captacion_clientes ??
    sales.mejorar_conversion,
  );
}

const TAB_DEFINITIONS: readonly (readonly [PlanSectionKey, string])[] = [
  ["intro", "Introducción"],
  ["diagnosis", "Diagnóstico"],
  ["areas", "Áreas"],
  ["blockers", "Bloqueos"],
  ["opportunities", "Oportunidades"],
  ["strategy", "Plan ventas"],
  ["sales", "Proyección"],
  ["firststep", "Primer paso"],
  ["redefine", "Redefinir rol"],
  ["leadership", "Liderazgo"],
];

export function getPlanTabs(flags: PlanFlags): readonly PlanTab[] {
  return TAB_DEFINITIONS.filter(([key]) => flags[key]).map(([key, label]) => ({ key, label }));
}
