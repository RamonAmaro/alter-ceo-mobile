export type StrategyKey =
  | "plan_duplicacion"
  | "guion_ventas"
  | "test_mentalidad"
  | "analisis_competencia"
  | "captacion_5_fases"
  | "value_ideas";

export type StrategyIconLibrary = "ionicons" | "feather";

export interface StrategyCatalogEntry {
  key: StrategyKey;
  title: string;
  shortTitle: string;
  iconName: string;
  iconLibrary?: StrategyIconLibrary;
  reportType: string | null;
  available: boolean;
}

export const STRATEGY_CATALOG: readonly StrategyCatalogEntry[] = [
  {
    key: "plan_duplicacion",
    title: "Plan de Duplicación",
    shortTitle: "PLAN DE DUPLICACIÓN",
    iconName: "rocket-outline",
    reportType: null,
    available: true,
  },
  {
    key: "guion_ventas",
    title: "Crear Guion de Ventas",
    shortTitle: "GUION DE VENTAS",
    iconName: "dollar-sign",
    iconLibrary: "feather",
    reportType: "guion_ventas",
    available: true,
  },
  {
    key: "test_mentalidad",
    title: "Test de Mentalidad",
    shortTitle: "MENTALIDAD",
    iconName: "bulb-outline",
    reportType: "mentalidad_empresarial",
    available: true,
  },
  {
    key: "analisis_competencia",
    title: "Análisis de la Competencia",
    shortTitle: "COMPETENCIA",
    iconName: "stats-chart-outline",
    reportType: null,
    available: false,
  },
  {
    key: "captacion_5_fases",
    title: "Captación de Clientes",
    shortTitle: "CAPTACIÓN",
    iconName: "magnet-outline",
    reportType: "captacion_5_fases",
    available: true,
  },
  {
    key: "value_ideas",
    title: "Crear Ideas de Valor",
    shortTitle: "IDEAS DE VALOR",
    iconName: "sparkles-outline",
    reportType: "value_ideas",
    available: true,
  },
] as const;

export function getStrategyByReportType(reportType: string): StrategyCatalogEntry | undefined {
  return STRATEGY_CATALOG.find((entry) => entry.reportType === reportType);
}
