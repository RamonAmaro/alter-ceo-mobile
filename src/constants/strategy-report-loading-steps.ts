export interface StrategyReportStep {
  readonly percent: number;
  readonly label: string;
}

export type StrategyReportStage = "queued" | "running" | "report_generating" | "complete" | "error";

const CAPTACION_5_FASES_STEPS: readonly StrategyReportStep[] = [
  { percent: 10, label: "Inicializando análisis..." },
  { percent: 20, label: "Procesando tu cuestionario..." },
  { percent: 30, label: "Interpretando hábitos de consumo..." },
  { percent: 40, label: "Analizando tu propuesta actual..." },
  { percent: 50, label: "Detectando oportunidades de captación..." },
  { percent: 60, label: "Diseñando propuestas de captación..." },
  { percent: 70, label: "Ajustando costes y recursos..." },
  { percent: 80, label: "Construyendo plan de acción..." },
  { percent: 90, label: "Proyectando retorno de la inversión..." },
  { percent: 100, label: "Estrategia lista para activar." },
];

const GUION_VENTAS_STEPS: readonly StrategyReportStep[] = [
  { percent: 10, label: "Inicializando análisis..." },
  { percent: 20, label: "Procesando tu cuestionario..." },
  { percent: 30, label: "Comprendiendo tu propuesta..." },
  { percent: 40, label: "Analizando comportamientos..." },
  { percent: 50, label: "Descubriendo el perfil de cliente..." },
  { percent: 60, label: "Diseñando estructura del guion..." },
  { percent: 70, label: "Redactando guion..." },
  { percent: 80, label: "Añadiendo activación emocional..." },
  { percent: 90, label: "Orientando hacia el cierre..." },
  { percent: 100, label: "Guion listo para utilizar." },
];

const ANALISIS_COMPETENCIA_STEPS: readonly StrategyReportStep[] = [
  { percent: 10, label: "Inicializando análisis..." },
  { percent: 20, label: "Procesando tu cuestionario..." },
  { percent: 30, label: "Interpretando hábitos de consumo..." },
  { percent: 40, label: "Analizando propuesta de valor..." },
  { percent: 50, label: "Descubriendo el perfil de cliente..." },
  { percent: 60, label: "Analizando debilidades..." },
  { percent: 70, label: "Analizando fortalezas..." },
  { percent: 80, label: "Decidiendo áreas clave..." },
  { percent: 90, label: "Identificando oportunidades..." },
  { percent: 100, label: "Estrategia lista para activar." },
];

const MENTALIDAD_EMPRESARIAL_STEPS: readonly StrategyReportStep[] = [
  { percent: 10, label: "Inicializando análisis..." },
  { percent: 20, label: "Procesando tus respuestas..." },
  { percent: 30, label: "Calculando tu scorecard..." },
  { percent: 40, label: "Diseccionando creencias limitantes..." },
  { percent: 50, label: "Analizando categorías..." },
  { percent: 60, label: "Detectando patrones de pensamiento..." },
  { percent: 70, label: "Generando recomendaciones..." },
  { percent: 80, label: "Construyendo perfil de personalidad..." },
  { percent: 90, label: "Cerrando conclusiones..." },
  { percent: 100, label: "Diagnóstico listo." },
];

const VALUE_IDEAS_STEPS: readonly StrategyReportStep[] = [
  { percent: 10, label: "Inicializando análisis..." },
  { percent: 20, label: "Procesando tu cuestionario..." },
  { percent: 30, label: "Analizando experiencia del cliente..." },
  { percent: 40, label: "Detectando fricciones..." },
  { percent: 50, label: "Identificando oportunidades de mejora..." },
  { percent: 60, label: "Diseñando microdiferenciaciones..." },
  { percent: 70, label: "Construyendo propuestas de valor..." },
  { percent: 80, label: "Generando ejemplos accionables..." },
  { percent: 90, label: "Refinando recomendaciones..." },
  { percent: 100, label: "Ideas listas para implementar." },
];

const STEPS_BY_REPORT_TYPE: Record<string, readonly StrategyReportStep[]> = {
  captacion_5_fases: CAPTACION_5_FASES_STEPS,
  guion_ventas: GUION_VENTAS_STEPS,
  analisis_competencia: ANALISIS_COMPETENCIA_STEPS,
  mentalidad_empresarial: MENTALIDAD_EMPRESARIAL_STEPS,
  value_ideas: VALUE_IDEAS_STEPS,
};

const FALLBACK_STEPS: readonly StrategyReportStep[] = CAPTACION_5_FASES_STEPS;

export function getStrategyReportSteps(
  reportType: string | null | undefined,
): readonly StrategyReportStep[] {
  if (!reportType) return FALLBACK_STEPS;
  return STEPS_BY_REPORT_TYPE[reportType] ?? FALLBACK_STEPS;
}

const KNOWN_STEP_IDS: readonly string[] = [
  "foundation_block",
  "strategy_block",
  "phase_2_proposal_1",
  "phase_2_proposal_2",
  "phase_2_proposal_3",
  "phase_2_proposal_4",
  "phase_3_proposal_1",
  "phase_3_proposal_2",
  "phase_3_proposal_3",
  "phase_3_proposal_4",
  "strategic_foundation_block",
  "proposal_strategy_block",
  "economics_and_action_block",
  "profile_interpretation",
  "recommendations",
  "conclusions",
];

export function getStepIndexForStrategyReportStage(
  stage: StrategyReportStage,
  steps: readonly StrategyReportStep[] = FALLBACK_STEPS,
): number {
  if (stage === "complete") return Math.max(steps.length - 1, 0);
  if (stage === "queued") return 0;
  if (stage === "running") return Math.min(1, Math.max(steps.length - 1, 0));
  if (stage === "report_generating") return Math.min(2, Math.max(steps.length - 1, 0));
  return 0;
}

export function getStepIndexForStrategyReportStep(
  stepId: string,
  steps: readonly StrategyReportStep[] = FALLBACK_STEPS,
): number | null {
  // Backend emite step_id genéricos por pipeline (varia por estratégia). Mapeamos
  // proporcionalmente para o conjunto local de 10 etapas, garantindo progresso
  // visual mesmo sem correspondência 1:1.
  const idx = KNOWN_STEP_IDS.indexOf(stepId);
  if (idx === -1) return null;

  const lastIndex = Math.max(steps.length - 1, 0);
  const min = Math.min(2, lastIndex);
  const max = Math.max(min, lastIndex - 1);
  const ratio = idx / Math.max(KNOWN_STEP_IDS.length - 1, 1);
  return Math.round(min + (max - min) * ratio);
}
