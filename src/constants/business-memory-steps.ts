export type StepIconLibrary = "Ionicons" | "MaterialCommunityIcons";

export type FormFieldType = "text" | "textarea";

export interface StepIconConfig {
  readonly library: StepIconLibrary;
  readonly name: string;
}

export interface FormFieldConfig {
  readonly id: string;
  readonly label: string;
  readonly placeholder?: string;
  readonly type: FormFieldType;
}

export interface BusinessMemoryStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly progress: number;
  readonly icon: StepIconConfig;
  readonly fields: readonly FormFieldConfig[];
}

export const BUSINESS_MEMORY_STEPS: readonly BusinessMemoryStep[] = [
  {
    id: "ficha-corporativa",
    title: "Ficha Corporativa Básica",
    description: "Este bloque valida los datos fundacionales y de contacto del negocio.",
    progress: 50,
    icon: { library: "MaterialCommunityIcons", name: "account-edit" },
    fields: [
      { id: "razon-social", label: "Razón Social  |  Nombre Comercial", type: "text" },
      { id: "sector-modelo", label: "Sector y Modelo de Negocio", type: "text" },
      { id: "activos-digitales", label: "Activos Digitales", type: "text" },
      { id: "mercado-geografico", label: "Mercado Geográfico", type: "text" },
      { id: "fase-operativa", label: "Fase Operativa Actual", type: "text" },
    ],
  },
  {
    id: "diagnostico-comercial",
    title: "Diagnóstico Comercial y de Ventas",
    description: "Este bloque evalúa la madurez de la oferta y la tracción en el mercado.",
    progress: 25,
    icon: { library: "MaterialCommunityIcons", name: "bag-personal-outline" },
    fields: [],
  },
  {
    id: "salud-financiera",
    title: "Salud Financiera y Control de Gestión",
    description: "Este bloque mide la solidez económica y la madurez analítica.",
    progress: 30,
    icon: { library: "MaterialCommunityIcons", name: "file-chart-outline" },
    fields: [],
  },
  {
    id: "estructura-organizativa",
    title: "Estructura Organizativa y Liderazgo",
    description: "Este bloque analiza el capital humano y el nivel de delegación.",
    progress: 40,
    icon: { library: "MaterialCommunityIcons", name: "account-group-outline" },
    fields: [],
  },
  {
    id: "eficiencia-operativa",
    title: "Eficiencia Operativa y Ejecución",
    description: "Este bloque enfoca en la capacidad operativa actual y la tracción diaria.",
    progress: 45,
    icon: { library: "MaterialCommunityIcons", name: "account-tie-outline" },
    fields: [],
  },
];

export function findStepById(stepId: string): BusinessMemoryStep | undefined {
  return BUSINESS_MEMORY_STEPS.find((step) => step.id === stepId);
}

export function getStepIndex(stepId: string): number {
  return BUSINESS_MEMORY_STEPS.findIndex((step) => step.id === stepId);
}
