export const STRATEGY_REPORT_STEPS = [
  { percent: 10, label: "Recibiendo tus respuestas..." },
  { percent: 25, label: "Analizando tu situación de captación..." },
  { percent: 50, label: "Detectando tu oportunidad principal..." },
  { percent: 72, label: "Diseñando propuestas de oferta irresistible..." },
  { percent: 88, label: "Redactando tu informe de captación..." },
  { percent: 100, label: "Informe listo." },
] as const;

export type StrategyReportStage = "queued" | "running" | "report_generating" | "complete" | "error";

export function getStepIndexForStrategyReportStage(stage: StrategyReportStage): number {
  switch (stage) {
    case "queued":
      return 0;
    case "running":
      return 1;
    case "report_generating":
      return 2;
    case "complete":
      return 5;
    default:
      return 0;
  }
}
