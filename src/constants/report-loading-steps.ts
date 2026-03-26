export const STEPS = [
  { percent: 10, label: "Recibiendo información..." },
  { percent: 20, label: "Analizando tu negocio..." },
  { percent: 30, label: "Ejecutando diagnóstico estratégico..." },
  { percent: 40, label: "Evaluando tu modelo de ingresos..." },
  { percent: 50, label: "Diseñando tu plan estratégico..." },
  { percent: 60, label: "Identificando oportunidades de crecimiento..." },
  { percent: 70, label: "Desarrollando tu plan de ventas..." },
  { percent: 80, label: "Redefiniendo tu rol como CEO..." },
  { percent: 90, label: "Guardando tu plan..." },
  { percent: 100, label: "¡Tu plan está listo!" },
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
