import type { RunStatus } from "./api";
import type { ExpressOnboardingAnswers, ProfessionalOnboardingAnswers } from "./onboarding";

export type OnboardingMode = "express" | "professional";

export interface PlanRunCreateRequest {
  run_type?: "plan_generation";
  user_id: string;
  onboarding_mode: OnboardingMode;
  answers: ExpressOnboardingAnswers | ProfessionalOnboardingAnswers;
  top_k?: number;
  use_kb?: boolean;
  rebuild_kb_if_missing?: boolean;
  include_business_kernel?: boolean;
}

export interface PlanRunAccepted {
  run_id: string;
  status: RunStatus;
}

export interface PlanRunStatusResponse {
  run_id: string;
  status: RunStatus;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  error_message?: string | null;
  result?: Record<string, unknown> | null;
}

export interface PlanUpsertRequest {
  user_id: string;
  plan: Record<string, unknown>;
  business_kernel?: Record<string, unknown> | null;
}

export interface PlanUpsertResponse {
  plan_id: string;
  user_id: string;
  created_at: string;
}

export interface UserLatestPlanResponse {
  plan_id: string;
  user_id: string;
  source_run_id?: string | null;
  plan: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── Diagnosis ──

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
  rentabilidad?: "Alta" | "Ajustada" | "Critica";
  liquidez?: "Estable" | "Ajustada" | "Riesgo";
  kpis?: "Solidos" | "Basicos" | "Inexistentes";
  planificacion?: "Estrategica" | "Reactiva";
}

export interface PlanCurrentSituation {
  nivel_dependencia_fundador?: "Alto" | "Medio" | "Bajo";
  tipo_consumo?: "Recurrente" | "Esporadico" | "Unico";
  sistema_captacion?: "Predecible" | "Irregular" | "Boca a boca";
}

export type TeamSizeRange =
  | "no_business"
  | "solo"
  | "one_to_three"
  | "four_to_ten"
  | "eleven_to_thirty"
  | "thirty_to_sixty"
  | "sixty_to_hundred"
  | "over_hundred";

export interface PlanBusinessSummary {
  facturacion_mensual_aproximada?: number;
  facturacion_anual_aproximada?: number;
  team_size_range?: TeamSizeRange;
  numero_personas_equipo?: number;
  sector?: string;
  productos_servicios_principales?: string;
}

export interface PlanAreaAnalysis {
  personalidad_negocio: string;
  propuesta_valor: string;
  perfil_cliente_actual: string;
  sistema_comercial_detectado: string;
  dependencia_fundador: string;
  nivel_liderazgo: string;
  operativa_diaria: string;
}

export type ExternalPerception =
  | "Profesional"
  | "Correcta pero mejorable"
  | "Debil"
  | "[No disponible con el contexto actual]";

export type PillarLevel =
  | "Inexistente"
  | "Debil"
  | "Basico"
  | "Aceptable"
  | "Bueno"
  | "Referente"
  | "No se puede evaluar";

export interface PlanPillar {
  nombre: string;
  nivel: PillarLevel;
  resumen?: string;
  justificacion?: string;
}

export interface PlanDiagnosis {
  mensaje_introduccion?: string;
  resumen_negocio?: PlanBusinessSummary | null;
  analisis_por_areas?: PlanAreaAnalysis | null;
  percepcion_externa_scrapping?: ExternalPerception;
  estado_financiero?: PlanFinancialState;
  situacion_actual?: PlanCurrentSituation;
  bloqueos_detectados?: PlanBlocker[];
  oportunidades_mejora?: PlanOpportunity[];
  introduccion_bloqueos?: string;
  introduccion_oportunidades?: string;
  seis_pilares?: PlanPillar[] | null;
}

// ── Sales Plan ──

export interface PlanProposalItem {
  titulo?: string;
  descripcion?: string;
  origen?: string;
  potencial?: string;
  guion?: string;
  puesta_en_marcha?: string;
  a_quien_va_dirigida?: string;
  objetivo?: string;
}

export interface PlanProductImprovement {
  texto_explicativo?: string;
  diagnostico_cliente_objetivo?: string;
  brecha_mensaje_mercado?: string;
  diferenciacion_funcional?: string;
  diferenciacion_experiencial?: string;
  diferenciacion_estrategica?: string;
  propuestas?: PlanProposalItem[];
}

export interface PlanCustomerAcquisition {
  texto_explicativo?: string;
  puertas_entrada?: string[];
  acciones_alcance?: string[];
  sistema_seguimiento?: string[];
  explicacion_enfoque?: string;
  propuestas?: PlanProposalItem[];
}

export interface PlanConversionImprovement {
  texto_explicativo?: string;
  puntos_debiles_actuales?: string[];
  estructura_optimizada?: string[];
  por_que_aumentara_conversion?: string;
  propuestas?: PlanProposalItem[];
}

export interface PlanSales {
  objetivo_facturacion_12_meses?: number;
  introduccion_evolucion_ventas?: string;
  mejorar_producto_servicio?: PlanProductImprovement | null;
  aumentar_captacion_clientes?: PlanCustomerAcquisition | null;
  mejorar_conversion?: PlanConversionImprovement | null;
  proyeccion_mensual_euros?: number[];
  estacionalidad_detectada?: boolean;
  prioridad_inmediata_30_dias?: string[];
}

// ── Leadership Plan ──

export type RoleSnapshot = Record<string, number>;

export interface PlanRoleEvolution {
  situacion_actual?: RoleSnapshot;
  mes_4?: RoleSnapshot;
  mes_8?: RoleSnapshot;
  mes_12?: RoleSnapshot;
}

export type PrimerPasoEscenario =
  | "no_prioritario_por_fase_inicial"
  | "crecer_antes_de_liberar"
  | "delegar_estrategicamente";

export interface PlanFirstStep {
  escenario?: PrimerPasoEscenario;
  mensaje?: string;
}

export interface PlanStep1ReduceTasks {
  titulo: string;
  texto_explicativo: string;
  tareas_a_reducir: string[];
  nota_liberacion_gradual: string;
}

export interface PlanStep2CreateProcesses {
  titulo: string;
  texto_explicativo: string;
  tarea_elegida: string;
  proceso_inicial_delegacion: string;
  nota_version_inicial: string;
}

export interface PlanStep3StrategicTime {
  titulo: string;
  texto_explicativo: string;
  bloques_semanales_minimos: number;
  minutos_por_bloque: number;
  focos_estrategicos: string[];
  cierre: string;
}

export interface PlanRedefineRole {
  paso_1: PlanStep1ReduceTasks;
  paso_2: PlanStep2CreateProcesses;
  paso_3: PlanStep3StrategicTime;
}

export interface PlanLeadership {
  fase_1_profesionalizar?: string;
  fase_2_delegacion?: string;
  fase_3_ceo_estrategico?: string;
  evolucion_rol?: PlanRoleEvolution;
  primer_paso_trabajar_la_mitad?: PlanFirstStep;
  tres_pasos_redefinir_rol?: PlanRedefineRole | null;
}

// ── Root ──

export interface PlanData {
  introduccion_general?: string;
  diagnostico?: PlanDiagnosis;
  plan_ventas?: PlanSales;
  plan_liderazgo?: PlanLeadership;
  conclusion_express?: string;
}
