import type { PlanData } from "@/types/plan";

import type { PlanTab } from "./plan-nav-tabs";

export type PlanSectionKey =
  | "summary"
  | "diagnosis"
  | "indicators"
  | "areas"
  | "blockers"
  | "opportunities"
  | "strategy"
  | "sales"
  | "firststep"
  | "conclusion";

export type PlanFlags = Readonly<Record<PlanSectionKey, boolean>>;

export function getPlanFlags(plan: PlanData): PlanFlags {
  const diagnosis = plan.diagnostico;
  const sales = plan.plan_ventas;
  const leadership = plan.plan_liderazgo;
  const summary = diagnosis?.resumen_negocio;

  const hasDiagnosisData = Boolean(
    diagnosis?.mensaje_introduccion?.trim() ||
    summary?.sector?.trim() ||
    summary?.productos_servicios_principales?.trim() ||
    typeof summary?.facturacion_mensual_aproximada === "number" ||
    typeof summary?.facturacion_anual_aproximada === "number" ||
    summary?.team_size_range ||
    typeof summary?.numero_personas_equipo === "number",
  );

  const pillars = diagnosis?.seis_pilares ?? [];
  const hasIndicators = pillars.some((p) => p?.nombre?.trim() && p?.nivel);

  return {
    summary: Boolean(plan.introduccion_general?.trim()),
    diagnosis: hasDiagnosisData,
    indicators: hasIndicators,
    areas: Boolean(diagnosis?.analisis_por_areas),
    blockers: (diagnosis?.bloqueos_detectados?.length ?? 0) > 0,
    opportunities: (diagnosis?.oportunidades_mejora?.length ?? 0) > 0,
    strategy: hasAnySalesStrategy(sales),
    sales: Boolean(sales?.objetivo_facturacion_12_meses),
    firststep: Boolean(leadership?.primer_paso_trabajar_la_mitad?.mensaje),
    conclusion: Boolean(plan.conclusion_express),
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
  ["summary", "Resumen"],
  ["diagnosis", "Diagnóstico"],
  ["indicators", "Indicadores"],
  ["areas", "Áreas"],
  ["blockers", "Bloqueos"],
  ["opportunities", "Oportunidades"],
  ["strategy", "Plan ventas"],
  ["sales", "Proyección"],
  ["firststep", "Primer paso"],
  ["conclusion", "Conclusión"],
];

export function getPlanTabs(flags: PlanFlags): readonly PlanTab[] {
  return TAB_DEFINITIONS.filter(([key]) => flags[key]).map(([key, label]) => ({ key, label }));
}
