import type {
  BusinessKernelSectionId,
  BusinessKernelSectionResponse,
} from "@/types/business-kernel";

export type StepIconLibrary = "Ionicons" | "MaterialCommunityIcons";

export type FormFieldType = "text" | "textarea" | "select";

export interface StepIconConfig {
  readonly library: StepIconLibrary;
  readonly name: string;
}

export interface FormFieldOption {
  readonly label: string;
  readonly value: string;
}

export interface FormFieldConfig {
  readonly id: string;
  readonly label: string;
  readonly options?: readonly FormFieldOption[];
  readonly placeholder?: string;
  readonly type: FormFieldType;
}

export interface BusinessMemorySectionTemplate {
  readonly id: BusinessKernelSectionId;
  readonly icon: StepIconConfig;
  readonly fields: readonly FormFieldConfig[];
}

export type BusinessMemoryStep = BusinessKernelSectionResponse & {
  icon: StepIconConfig;
  fields: readonly FormFieldConfig[];
};

export const BUSINESS_MEMORY_SECTION_TEMPLATES: readonly BusinessMemorySectionTemplate[] = [
  {
    id: "company_profile",
    icon: { library: "MaterialCommunityIcons", name: "account-edit" },
    fields: [
      { id: "business_name", label: "Nombre del negocio", type: "text" },
      { id: "sector", label: "Sector", type: "text" },
      {
        id: "business_model",
        label: "Modelo de negocio",
        type: "select",
        options: [
          { value: "B2B", label: "B2B" },
          { value: "B2C", label: "B2C" },
          { value: "Hybrid", label: "Híbrido" },
        ],
      },
      { id: "website_url", label: "Sitio web", type: "text" },
      { id: "business_instagram", label: "Instagram del negocio", type: "text" },
      { id: "geography", label: "Geografía principal", type: "text" },
    ],
  },
  {
    id: "commercial_block",
    icon: { library: "MaterialCommunityIcons", name: "bag-personal-outline" },
    fields: [
      { id: "offer_summary", label: "Resumen de la oferta", type: "textarea" },
      {
        id: "pricing_strategy",
        label: "Estrategia de precios",
        type: "select",
        options: [
          { value: "cost_plus", label: "Coste más margen" },
          { value: "competitor_based", label: "Basado en competidores" },
          { value: "value_based", label: "Basado en valor" },
        ],
      },
      {
        id: "differentiation_level",
        label: "Nivel de diferenciación",
        type: "select",
        options: [
          { value: "high", label: "Alta" },
          { value: "medium", label: "Media" },
          { value: "low", label: "Baja" },
        ],
      },
      {
        id: "sales_system",
        label: "Sistema de ventas",
        type: "select",
        options: [
          { value: "structured", label: "Estructurado" },
          { value: "intuitive", label: "Intuitivo" },
          { value: "improvised", label: "Improvisado" },
        ],
      },
      {
        id: "pipeline_conversion_summary",
        label: "Resumen de conversión del embudo",
        type: "textarea",
      },
    ],
  },
  {
    id: "financial_block",
    icon: { library: "MaterialCommunityIcons", name: "file-chart-outline" },
    fields: [
      {
        id: "profitability_level",
        label: "Nivel de rentabilidad",
        type: "select",
        options: [
          { value: "high", label: "Alta" },
          { value: "adjusted", label: "Ajustada" },
          { value: "critical", label: "Crítica" },
        ],
      },
      {
        id: "liquidity_level",
        label: "Nivel de liquidez",
        type: "select",
        options: [
          { value: "stable", label: "Estable" },
          { value: "adjusted", label: "Ajustada" },
          { value: "risk", label: "En riesgo" },
        ],
      },
      {
        id: "gross_margin_level",
        label: "Nivel de margen bruto",
        type: "select",
        options: [
          { value: "precise", label: "Preciso" },
          { value: "approximate", label: "Aproximado" },
        ],
      },
      {
        id: "kpi_maturity",
        label: "Madurez de KPIs",
        type: "select",
        options: [
          { value: "solid", label: "Sólida" },
          { value: "basic", label: "Básica" },
          { value: "none", label: "Ninguna" },
        ],
      },
      {
        id: "monthly_sales_history_eur",
        label: "Histórico mensual de ventas (EUR)",
        type: "textarea",
      },
    ],
  },
  {
    id: "team_block",
    icon: { library: "MaterialCommunityIcons", name: "account-group-outline" },
    fields: [
      {
        id: "founder_dependency_level",
        label: "Dependencia del fundador",
        type: "select",
        options: [
          { value: "high", label: "Alta" },
          { value: "medium", label: "Media" },
          { value: "low", label: "Baja" },
        ],
      },
      {
        id: "founder_dependency_detail",
        label: "Detalle de la dependencia",
        type: "textarea",
        placeholder:
          "Explica en qué decisiones, relaciones o procesos se concentra esa dependencia",
      },
      { id: "leadership_summary", label: "Resumen de liderazgo", type: "textarea" },
    ],
  },
  {
    id: "execution_block",
    icon: { library: "MaterialCommunityIcons", name: "account-tie-outline" },
    fields: [
      { id: "top_bottlenecks", label: "Cuellos de botella principales", type: "textarea" },
      { id: "focus_areas", label: "Áreas de foco", type: "textarea" },
      { id: "active_micro_goals", label: "Microobjetivos activos", type: "textarea" },
    ],
  },
];

const TEMPLATE_BY_ID = new Map(
  BUSINESS_MEMORY_SECTION_TEMPLATES.map((template) => [template.id, template]),
);

const DEFAULT_ICON: StepIconConfig = { library: "MaterialCommunityIcons", name: "shape-outline" };

export function buildBusinessMemoryStep(
  section: BusinessKernelSectionResponse,
): BusinessMemoryStep {
  const template = TEMPLATE_BY_ID.get(section.id);
  return {
    ...section,
    icon: template?.icon ?? DEFAULT_ICON,
    fields: template?.fields ?? [],
  };
}

export function buildBusinessMemorySteps(
  sections: readonly BusinessKernelSectionResponse[],
): BusinessMemoryStep[] {
  return [...sections].sort((left, right) => left.order - right.order).map(buildBusinessMemoryStep);
}

export function findStepById(
  steps: readonly BusinessMemoryStep[],
  stepId: string,
): BusinessMemoryStep | undefined {
  return steps.find((step) => step.id === stepId);
}

export function getStepIndex(steps: readonly BusinessMemoryStep[], stepId: string): number {
  return steps.findIndex((step) => step.id === stepId);
}
