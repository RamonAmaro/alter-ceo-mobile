export const STRATEGY_REPORT_STEPS = [
  { percent: 10, label: "Inicializando análisis..." },
  { percent: 18, label: "Preparando tu contexto de captación..." },
  { percent: 28, label: "Interpretando tu cuestionario y situación actual..." },
  { percent: 40, label: "Diseñando propuestas y ofertas irresistibles..." },
  { percent: 48, label: "Afinando grandes densidades para la propuesta 1..." },
  { percent: 56, label: "Afinando grandes densidades para la propuesta 2..." },
  { percent: 64, label: "Afinando grandes densidades para la propuesta 3..." },
  { percent: 72, label: "Afinando grandes densidades para la propuesta 4..." },
  { percent: 78, label: "Construyendo captación de contactos para la propuesta 1..." },
  { percent: 84, label: "Construyendo captación de contactos para la propuesta 2..." },
  { percent: 90, label: "Construyendo captación de contactos para la propuesta 3..." },
  { percent: 96, label: "Construyendo captación de contactos para la propuesta 4..." },
  { percent: 100, label: "Estrategia lista para activar." },
] as const;

export type StrategyReportStage = "queued" | "running" | "report_generating" | "complete" | "error";

const REPORT_STEP_INDEX_BY_ID = {
  foundation_block: 2,
  strategy_block: 3,
  phase_2_proposal_1: 4,
  phase_2_proposal_2: 5,
  phase_2_proposal_3: 6,
  phase_2_proposal_4: 7,
  phase_3_proposal_1: 8,
  phase_3_proposal_2: 9,
  phase_3_proposal_3: 10,
  phase_3_proposal_4: 11,
} as const;

type StrategyReportStepId = keyof typeof REPORT_STEP_INDEX_BY_ID;

export function getStepIndexForStrategyReportStage(stage: StrategyReportStage): number {
  switch (stage) {
    case "queued":
      return 0;
    case "running":
      return 1;
    case "report_generating":
      return 2;
    case "complete":
      return STRATEGY_REPORT_STEPS.length - 1;
    default:
      return 0;
  }
}

export function getStepIndexForStrategyReportStep(stepId: string): number | null {
  if (stepId in REPORT_STEP_INDEX_BY_ID) {
    return REPORT_STEP_INDEX_BY_ID[stepId as StrategyReportStepId];
  }
  return null;
}
