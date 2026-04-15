import type { RunStatus } from "@/types/api";

export type ReportInputType = "single_choice" | "multi_choice" | "integer" | "text";

export interface ReportQuestionOption {
  value: string;
  label: string;
}

export interface ReportQuestion {
  key: string;
  label: string;
  input_type: ReportInputType;
  required: boolean;
  allows_multiple: boolean;
  section?: string | null;
  help_text?: string | null;
  options: ReportQuestionOption[];
}

export interface ReportTemplate {
  report_type: string;
  name: string;
  objective: string;
  language: string;
  version: string;
  is_active: boolean;
  questions: ReportQuestion[];
}

export interface ReportRunCreateRequest {
  run_type?: "report_generation";
  user_id: string;
  report_type: string;
  answers: Record<string, unknown>;
}

export interface ReportRunAccepted {
  run_id: string;
  status: RunStatus;
}

export interface ReportRunStatusResponse {
  run_id: string;
  status: RunStatus;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  error_message?: string | null;
  result?: {
    report_type?: string;
    report?: Captacion5FasesReport;
  } | null;
}

export interface IntroduccionGeneralSection {
  texto: string;
}

export interface Captacion5FasesDiagnosis {
  nivel_agresividad_mas_adecuado: string;
  capacidad_real_de_ejecucion: string;
  valor_del_cliente_en_el_tiempo: string;
  como_decide_el_cliente: string;
  que_emocion_domina_la_compra: string;
  que_friccion_principal_bloquea_la_captacion: string;
  donde_parece_mas_accesible_el_cliente_ideal: string;
  que_fortaleza_percibida_actual_tiene_el_negocio: string;
}

export interface BaseEstrategicaSection {
  explicacion: string;
}

export interface TuOportunidadDeCaptacionSection {
  explicacion_educativa: string;
  resumen_oportunidad: string;
  oportunidad_principal_detectada: string;
  que_conducta_del_cliente_permite_aprovecharla: string;
  que_tipo_de_puerta_de_entrada_parece_mas_prometedora: string;
  que_resultado_puede_empezar_a_mover_si_se_activa_bien: string;
}

export interface Fase1OfertaIrresistibleSection {
  explicacion_educativa: string;
  que_incluye_exactamente: string;
  funcionamiento: string;
  formato_de_entrega: string;
  precio_recomendado: string;
  tiempo_esfuerzo_del_cliente: string;
  patron_de_comportamiento_del_cliente: string;
  guion_de_venta: string;
  recursos_necesarios: string;
  proceso_de_implementacion: string;
  por_que_tiene_sentido_en_este_negocio: string;
  cuando_usarla_y_con_que_perfil_de_cliente: string;
  riesgo_principal_de_ejecutarla_mal: string;
  como_hacerla_mas_fuerte: string;
  frase_comercial_simple: string;
}

export interface GranDensidadPrioritariaSection {
  canal_o_entorno: string;
  tipo_de_cliente_que_habra_ahi: string;
  por_que_tiene_sentido: string;
  que_ventaja_tiene_ese_canal: string;
  que_limitacion_tiene: string;
  que_mensaje_conviene_usar: string;
  que_formato_conviene_usar: string;
  que_ritmo_de_publicacion_o_accion_conviene: string;
  que_error_evitar: string;
}

export interface DistribucionPresupuestoTactico {
  produccion_diseno_eur: number;
  anuncios_eur: number;
  herramientas_eur: number;
  apoyo_externo_eur: number;
  seguimiento_optimizacion_eur: number;
}

export interface PresupuestoTacticoSection {
  presupuesto_minimo_sensato_eur: number;
  presupuesto_recomendado_eur: number;
  presupuesto_agresivo_eur: number;
  distribucion_recomendada: DistribucionPresupuestoTactico;
  explicacion_simple: string;
}

export interface Fase2GrandesDensidadesSection {
  explicacion_educativa: string;
  grandes_densidades_prioritarias: GranDensidadPrioritariaSection[];
  presupuesto_tactico: PresupuestoTacticoSection;
}

export interface Fase3SistemaCaptacionContactosSection {
  explicacion_educativa: string;
  metodo_principal_recomendado: string;
  metodo_secundario_de_apoyo: string;
  que_se_pide_exactamente: string;
  por_que_ese_nivel_de_datos_es_razonable: string;
  como_reducir_la_friccion: string;
  mensaje_sugerido_para_pedirlos: string;
  incentivo_o_promesa_para_dejar_el_contacto: string;
  error_mas_tipico_que_el_negocio_debe_evitar: string;
  como_conectar_esto_con_seguimiento_posterior: string;
}

export interface PropuestaDeCaptacionEn5Fases {
  titulo: string;
  angulo_principal: "sufrimiento" | "placer";
  fase_1_oferta_irresistible: Fase1OfertaIrresistibleSection;
  fase_2_grandes_densidades?: Fase2GrandesDensidadesSection | null;
  fase_3_sistema_de_captacion_de_contactos?: Fase3SistemaCaptacionContactosSection | null;
}

export interface EstrategiaDeCaptacionEn5FasesSection {
  explicacion_educativa: string;
  propuestas: PropuestaDeCaptacionEn5Fases[];
}

export interface Captacion5FasesReport {
  introduccion_general: IntroduccionGeneralSection;
  diagnostico_de_tu_situacion_actual: Captacion5FasesDiagnosis;
  base_estrategica: BaseEstrategicaSection;
  tu_oportunidad_de_captacion: TuOportunidadDeCaptacionSection;
  estrategia_de_captacion_en_5_fases: EstrategiaDeCaptacionEn5FasesSection;
}
