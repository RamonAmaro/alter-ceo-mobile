// Backend declara `relationship` no Literal de EntityType, mas ainda não há
// payload class implementado. Quando aparecer, adicionar aqui + no
// EntityPayload + no card.
export type EntityType = "kpi" | "product_service" | "supplier";
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

export interface ProductServicePayload {
  readonly type: "product_service";
  readonly name: string;
  readonly description: string;
  readonly target_customer: string;
  readonly price: string;
  readonly payment_terms: string;
  readonly business_relevance: string;
}

export interface SupplierPayload {
  readonly type: "supplier";
  readonly name: string;
  readonly supplier_type: string;
  readonly supply_description: string;
  readonly purchase_cost: string;
  readonly payment_terms: string;
  readonly business_relevance: string;
  readonly dependency_risk: string;
}

export type EntityPayload = KPIPayload | ProductServicePayload | SupplierPayload;

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
