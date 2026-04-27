export const STEPS = [
  { percent: 10, label: "Inicializando análisis" },
  { percent: 20, label: "Procesando datos clave" },
  { percent: 30, label: "Ejecutando diagnóstico" },
  { percent: 40, label: "Evaluando tu competencia" },
  { percent: 50, label: "Descifrando tu modelo de negocio" },
  { percent: 60, label: "Identificando puntos de bloqueo" },
  { percent: 70, label: "Detectando oportunidades" },
  { percent: 80, label: "Redefiniendo tu rol como CEO" },
  { percent: 90, label: "Optimizando plan de crecimiento" },
  { percent: 100, label: "Plan de acción listo para despegar 🚀" },
];

export type RunStage =
  | "queued"
  | "running"
  | "business_kernel"
  | "plan_generating"
  | "plan_validating"
  | "persisting"
  | "complete"
  | "error";

export function getStepIndexForStage(stage: RunStage): number {
  switch (stage) {
    case "queued":
      return 0;
    case "running":
      return 1;
    case "business_kernel":
      return 3;
    case "plan_generating":
      return 4;
    case "plan_validating":
      return 7;
    case "persisting":
      return 8;
    case "complete":
      return 9;
    default:
      return 0;
  }
}
