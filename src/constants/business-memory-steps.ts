import type {
  BusinessKernelSectionId,
  BusinessKernelSectionResponse,
} from "@/types/business-kernel";

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
      { id: "business_model", label: "Modelo de negocio", type: "text" },
      { id: "website_url", label: "Sitio web", type: "text" },
      { id: "business_instagram", label: "Instagram del negocio", type: "text" },
      { id: "geography", label: "Geografia", type: "text" },
    ],
  },
  {
    id: "commercial_block",
    icon: { library: "MaterialCommunityIcons", name: "bag-personal-outline" },
    fields: [
      { id: "offer_summary", label: "Resumen de la oferta", type: "textarea" },
      { id: "pricing_strategy", label: "Estrategia de precios", type: "text" },
      { id: "differentiation_level", label: "Nivel de diferenciacion", type: "text" },
      { id: "sales_system", label: "Sistema de ventas", type: "text" },
      { id: "pipeline_conversion_summary", label: "Resumen de conversion del pipeline", type: "textarea" },
    ],
  },
  {
    id: "financial_block",
    icon: { library: "MaterialCommunityIcons", name: "file-chart-outline" },
    fields: [
      { id: "profitability_level", label: "Nivel de rentabilidad", type: "text" },
      { id: "liquidity_level", label: "Nivel de liquidez", type: "text" },
      { id: "gross_margin_level", label: "Nivel de margen bruto", type: "text" },
      { id: "kpi_maturity", label: "Madurez de KPIs", type: "text" },
      { id: "monthly_sales_history_eur", label: "Historico mensual de ventas (EUR)", type: "textarea" },
    ],
  },
  {
    id: "team_block",
    icon: { library: "MaterialCommunityIcons", name: "account-group-outline" },
    fields: [
      { id: "team_and_roles", label: "Equipo y roles", type: "textarea" },
      { id: "founder_dependency_level", label: "Dependencia del founder", type: "text" },
      { id: "leadership_summary", label: "Resumen de liderazgo", type: "textarea" },
    ],
  },
  {
    id: "execution_block",
    icon: { library: "MaterialCommunityIcons", name: "account-tie-outline" },
    fields: [
      { id: "top_bottlenecks", label: "Cuellos de botella principales", type: "textarea" },
      { id: "focus_areas", label: "Areas de foco", type: "textarea" },
      { id: "active_micro_goals", label: "Micro objetivos activos", type: "textarea" },
    ],
  },
];

const TEMPLATE_BY_ID = new Map(
  BUSINESS_MEMORY_SECTION_TEMPLATES.map((template) => [template.id, template]),
);

const DEFAULT_ICON: StepIconConfig = { library: "MaterialCommunityIcons", name: "shape-outline" };

export function buildBusinessMemorySteps(
  sections: readonly BusinessKernelSectionResponse[],
): BusinessMemoryStep[] {
  return [...sections]
    .sort((left, right) => left.order - right.order)
    .map((section) => {
      const template = TEMPLATE_BY_ID.get(section.id);
      return {
        ...section,
        icon: template?.icon ?? DEFAULT_ICON,
        fields: template?.fields ?? [],
      };
    });
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
