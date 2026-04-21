export type BusinessMemoryFieldTone = "default" | "unknown";

export interface BusinessMemoryFieldPresentation {
  helperText?: string;
  placeholder?: string;
  tone?: BusinessMemoryFieldTone;
  value: string;
}

const UNKNOWN_HELPER_TEXT = "Aun no tenemos informacion suficiente para completar este campo.";
const UNKNOWN_PLACEHOLDER = "Pendiente de completar";

const SIMPLE_VALUE_LABELS: Record<string, string> = {
  absent: "Ausente",
  active: "Activo",
  adjusted: "Ajustada",
  approximate: "Aproximado",
  archived: "Archivado",
  basic: "Basica",
  b2b: "B2B",
  b2c: "B2C",
  clear: "Clara",
  conflict: "En conflicto",
  competitor_based: "Basado en competidores",
  cost_plus: "Coste mas margen",
  critical: "Critica",
  disciplined: "Disciplinada",
  done: "Hecho",
  frequent: "Frecuente",
  healthy: "Saludable",
  high: "Alta",
  hybrid: "Hibrido",
  improvised: "Improvisado",
  in_progress: "En progreso",
  inconsistent: "Inconsistente",
  intuitive: "Intuitivo",
  low: "Baja",
  medium: "Media",
  mixed: "Mixta",
  monthly_subscription: "Suscripcion mensual",
  neutral: "Neutra",
  none: "Ninguna",
  one_time: "Una sola vez",
  partial: "Parcial",
  pending: "Pendiente",
  precise: "Preciso",
  repeatable: "Repetible",
  risk: "En riesgo",
  rough: "Aproximada",
  solid: "Solida",
  stable: "Estable",
  sporadic: "Esporadico",
  strained: "Tensionada",
  structured: "Estructurado",
  unclear: "Poco clara",
  value_based: "Basado en valor",
};

function isUnknownValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value !== "string") return false;
  return value.trim().toLowerCase() === "unknown";
}

function mapSimpleValue(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const direct = SIMPLE_VALUE_LABELS[trimmed];
    if (direct) return direct;

    const lower = trimmed.toLowerCase();
    const mapped = SIMPLE_VALUE_LABELS[lower];
    if (mapped) return mapped;

    return trimmed;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function formatCurrencyValue(value: number | null | undefined): string {
  if (typeof value !== "number" || Number.isNaN(value)) return "Sin dato";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStringList(values: unknown): string {
  if (!Array.isArray(values) || values.length === 0) return "";
  return values
    .map((item) => mapSimpleValue(item))
    .filter((item) => item.length > 0)
    .map((item) => `• ${item}`)
    .join("\n");
}

function formatSalesHistory(values: unknown): string {
  if (!Array.isArray(values) || values.length === 0) return "";
  return values
    .map(
      (item, index) =>
        `Mes ${index + 1}: ${formatCurrencyValue(typeof item === "number" ? item : null)}`,
    )
    .join("\n");
}

function formatTeamAndRoles(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  const roles = (value as { roles?: unknown }).roles;
  if (!Array.isArray(roles) || roles.length === 0) return "";

  return roles
    .map((rawRole) => {
      if (!rawRole || typeof rawRole !== "object") return "";
      const role = rawRole as {
        owner_name?: unknown;
        relationship_status_to_founder?: unknown;
        role_name?: unknown;
      };

      const roleName = typeof role.role_name === "string" ? role.role_name.trim() : "";
      const ownerName = typeof role.owner_name === "string" ? role.owner_name.trim() : "";
      const relationship = mapSimpleValue(role.relationship_status_to_founder);

      const parts = [roleName];
      if (ownerName) parts.push(ownerName);
      if (relationship) parts.push(relationship);

      return parts.filter(Boolean).join(" · ");
    })
    .filter((item) => item.length > 0)
    .map((item) => `• ${item}`)
    .join("\n");
}

function formatMicroGoals(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return "";
  return value
    .map((rawGoal) => {
      if (!rawGoal || typeof rawGoal !== "object") return "";
      const goal = rawGoal as { due_date?: unknown; status?: unknown; title?: unknown };
      const title = typeof goal.title === "string" ? goal.title.trim() : "";
      const status = mapSimpleValue(goal.status);
      const dueDate = typeof goal.due_date === "string" ? goal.due_date.trim() : "";

      const parts = [title];
      if (status) parts.push(status);
      if (dueDate) parts.push(`Para ${dueDate}`);

      return parts.filter(Boolean).join(" · ");
    })
    .filter((item) => item.length > 0)
    .map((item) => `• ${item}`)
    .join("\n");
}

function formatValue(fieldId: string, rawValue: unknown): string {
  if (isUnknownValue(rawValue)) return "";

  switch (fieldId) {
    case "active_micro_goals":
      return formatMicroGoals(rawValue);
    case "focus_areas":
    case "top_bottlenecks":
      return formatStringList(rawValue);
    case "monthly_sales_history_eur":
      return formatSalesHistory(rawValue);
    case "team_and_roles":
      return formatTeamAndRoles(rawValue);
    default:
      return mapSimpleValue(rawValue);
  }
}

export function buildBusinessMemoryFieldPresentation(
  fieldId: string,
  rawValue: unknown,
): BusinessMemoryFieldPresentation {
  if (isUnknownValue(rawValue)) {
    return {
      helperText: UNKNOWN_HELPER_TEXT,
      placeholder: UNKNOWN_PLACEHOLDER,
      tone: "unknown",
      value: "",
    };
  }

  const value = formatValue(fieldId, rawValue);
  return {
    tone: "default",
    value,
  };
}
