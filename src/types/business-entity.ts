// TODO: backend hoje só emite "kpi"; expandir a união quando novos tipos
// forem suportados (notas do contrato, página 1).
export type EntityType = "kpi";
export type EntityStatus = "proposed" | "active" | "archived";
export type EntitySource = string;
export type EntityDecision = "confirm" | "reject";

export interface KPIPayload {
  readonly type: "kpi";
  readonly title: string;
  readonly description: string;
  readonly measurement_process: string;
  readonly numeric_value: string | null;
  readonly temporality: string;
}

export type EntityPayload = KPIPayload;

export interface BusinessEntity {
  readonly entity_id: string;
  readonly entity_type: EntityType;
  readonly status: EntityStatus;
  readonly source?: EntitySource;
  readonly payload: EntityPayload;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface BusinessEntitiesListResponse {
  readonly items: BusinessEntity[];
}

export interface EntityProposalCreatedEvent {
  readonly entity_id: string;
  readonly entity_type: EntityType;
  readonly status: "proposed";
  readonly payload: EntityPayload;
}

export interface EntityProposalResolvedEvent {
  readonly entity_id: string;
  readonly entity_type: EntityType;
  readonly status: "active" | "archived";
  readonly updated_at: string;
}

export interface EntityDecisionRequest {
  readonly decision: EntityDecision;
}
