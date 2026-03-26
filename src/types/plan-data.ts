export interface PlanBlocker {
  id_bloqueo?: number;
  titulo: string;
  descripcion_corta: string;
}

export interface PlanOpportunity {
  id_mejora?: number;
  titulo: string;
  propuesta_accion: string;
}

export interface PlanFinancialState {
  rentabilidad?: string;
  liquidez?: string;
  kpis?: string;
  planificacion?: string;
}

export interface PlanCurrentSituation {
  nivel_dependencia_fundador?: string;
  sistema_captacion?: string;
}

export interface PlanBusinessSummary {
  sector?: string;
  facturacion_anual_aproximada?: number;
}

export interface PlanDiagnosis {
  mensaje_introduccion?: string;
  resumen_negocio?: PlanBusinessSummary | null;
  estado_financiero?: PlanFinancialState;
  situacion_actual?: PlanCurrentSituation;
  bloqueos_detectados?: PlanBlocker[];
  oportunidades_mejora?: PlanOpportunity[];
  introduccion_bloqueos?: string;
  introduccion_oportunidades?: string;
}

export interface PlanSales {
  objetivo_facturacion_12_meses?: number;
  proyeccion_mensual_euros?: number[];
  prioridad_inmediata_30_dias?: string[];
  introduccion_evolucion_ventas?: string;
}

export type RoleSnapshot = Record<string, number>;

export interface PlanRoleEvolution {
  situacion_actual?: RoleSnapshot;
  mes_4?: RoleSnapshot;
  mes_8?: RoleSnapshot;
  mes_12?: RoleSnapshot;
}

export interface PlanLeadership {
  fase_1_profesionalizar?: string;
  fase_2_delegacion?: string;
  fase_3_ceo_estrategico?: string;
  evolucion_rol?: PlanRoleEvolution;
  primer_paso_trabajar_la_mitad?: { mensaje?: string };
  tres_pasos_redefinir_rol?: string[];
}

export interface PlanData {
  introduccion_general?: string;
  diagnostico?: PlanDiagnosis;
  plan_ventas?: PlanSales;
  plan_liderazgo?: PlanLeadership;
}
