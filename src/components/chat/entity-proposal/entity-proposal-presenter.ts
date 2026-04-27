import type { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

import type { EntityPayload } from "@/types/business-entity";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

export interface ProposalField {
  readonly label: string;
  readonly value: string;
}

export interface ProposalPresentation {
  readonly icon: IoniconName;
  readonly typeLabel: string;
  readonly title: string;
  /** Ordenado por prioridade: o card compacto corta os primeiros N. */
  readonly fields: readonly ProposalField[];
}

function nonEmpty(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pushField(fields: ProposalField[], label: string, value: string | null): void {
  if (value) fields.push({ label, value });
}

function presentKpi(payload: Extract<EntityPayload, { type: "kpi" }>): ProposalPresentation {
  const fields: ProposalField[] = [];
  pushField(fields, "Valor", nonEmpty(payload.numeric_value));
  pushField(fields, "Temporalidad", nonEmpty(payload.temporality));
  pushField(fields, "Cómo se mide", nonEmpty(payload.measurement_process));
  pushField(fields, "Descripción", nonEmpty(payload.description));
  return {
    icon: "analytics",
    typeLabel: "KPI",
    title: payload.title,
    fields,
  };
}

function presentProductService(
  payload: Extract<EntityPayload, { type: "product_service" }>,
): ProposalPresentation {
  const fields: ProposalField[] = [];
  pushField(fields, "Cliente", nonEmpty(payload.target_customer));
  pushField(fields, "Precio", nonEmpty(payload.price));
  pushField(fields, "Relevancia", nonEmpty(payload.business_relevance));
  pushField(fields, "Condiciones", nonEmpty(payload.payment_terms));
  pushField(fields, "Descripción", nonEmpty(payload.description));
  return {
    icon: "cube",
    typeLabel: "Producto",
    title: payload.name,
    fields,
  };
}

function presentSupplier(
  payload: Extract<EntityPayload, { type: "supplier" }>,
): ProposalPresentation {
  const fields: ProposalField[] = [];
  pushField(fields, "Tipo", nonEmpty(payload.supplier_type));
  pushField(fields, "Coste", nonEmpty(payload.purchase_cost));
  pushField(fields, "Riesgo", nonEmpty(payload.dependency_risk));
  pushField(fields, "Relevancia", nonEmpty(payload.business_relevance));
  pushField(fields, "Aporta", nonEmpty(payload.supply_description));
  pushField(fields, "Condiciones", nonEmpty(payload.payment_terms));
  return {
    icon: "people",
    typeLabel: "Proveedor",
    title: payload.name,
    fields,
  };
}

export function presentProposal(payload: EntityPayload): ProposalPresentation {
  switch (payload.type) {
    case "kpi":
      return presentKpi(payload);
    case "product_service":
      return presentProductService(payload);
    case "supplier":
      return presentSupplier(payload);
  }
}
