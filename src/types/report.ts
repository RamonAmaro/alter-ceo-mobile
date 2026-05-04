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

export interface PrefilledField {
  key: string;
  label: string;
  value: unknown;
  kernel_source: string;
}

export interface ReportTemplate {
  report_type: string;
  name: string;
  objective: string;
  language: string;
  version: string;
  is_active: boolean;
  questions: ReportQuestion[];
  prefilled?: PrefilledField[];
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
    report_id?: string;
  } | null;
}

export interface IntroduccionSection {
  texto: string;
}

export interface BaseEstrategicaSection {
  explicacion: string;
}

export interface ClavesDelDiagnostico {
  nivel_de_agresividad_deseado: string;
  capacidad_real_de_ejecucion: string;
  valor_del_cliente_en_el_tiempo: string;
  como_decide_el_cliente: string;
  que_emocion_activa_la_compra: string;
  friccion_principal: string;
  canal_mas_accesible: string;
  fortaleza_percibida_actual: string;
}

export interface DiagnosticoDeSituacionActualSection {
  como_estas_en_este_momento: string;
  claves_del_diagnostico: ClavesDelDiagnostico;
}

export interface TuOportunidadDeCaptacionSection {
  oportunidad_principal_detectada: string;
  conducta_del_cliente: string;
  tipo_de_propuesta_de_captacion: string;
  objetivo_deseado: string;
}

export interface Fase1OfertaIrresistibleSection {
  nombre_de_la_oferta: string;
  descripcion_breve: string;
  funcionamiento: string;
  precio_recomendado: string;
  alternativa_precio_conservador: string;
  tiempo_esfuerzo_del_cliente: string;
  patron_de_comportamiento_del_cliente: string;
  guion_de_venta: string;
  recursos_necesarios: string;
  proceso_de_implementacion: string;
}

export interface GranDensidadPrioritariaSection {
  canal_o_entorno: string;
  tipo_de_cliente: string;
  ventaja_principal: string;
  limitacion: string;
  tipo_de_comunicacion: string;
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
  que_datos_pedir: string;
  como_pedirlos: string;
  donde_se_recogen: string;
  frase_para_pedirlos: string;
  como_reducir_sensacion_de_formulario_pesado: string;
  que_hacer_despues_de_capturar_el_contacto: string;
}

export interface VentaAdicionalSection {
  que_ofrecer: string;
  cuando_ofrecerlo: string;
  quien_lo_comunica: string;
  como_se_comunica: string;
  por_que_encaja_con_la_oferta_inicial: string;
}

export interface DescuentoOIncentivoFuturoSection {
  que_incentivo_ofrecer: string;
  durante_cuanto_tiempo: string;
  para_que_producto_o_servicio: string;
  como_comunicarlo: string;
  por_que_ayuda_a_generar_recurrencia: string;
}

export interface Fase4VentaAdicionalSection {
  venta_adicional: VentaAdicionalSection;
  descuento_o_incentivo_futuro: DescuentoOIncentivoFuturoSection;
}

export interface LimitacionEstrategicaItem {
  en_que_consiste: string;
  por_que_tiene_sentido: string;
  como_se_comunica_al_cliente: string;
  que_riesgo_evita: string;
}

export interface Fase5LimitacionEstrategicaSection {
  limitaciones: LimitacionEstrategicaItem[];
}

export interface DetallePorPartidas {
  preparacion_eur: number;
  diseno_o_produccion_eur: number;
  publicidad_eur: number;
  herramientas_eur: number;
  entrega_de_la_oferta_eur: number;
  personal_interno_eur: number;
  apoyo_externo_eur: number;
  seguimiento_eur: number;
  optimizacion_eur: number;
}

export interface CostesDeLaEstrategiaSection {
  explicacion_general: string;
  costes_imprescindibles: string;
  costes_recomendables: string;
  costes_opcionales: string;
  coste_total_estimado_eur: number;
  detalle_por_partidas: DetallePorPartidas;
}

export interface RetornoDeLaEstrategiaSection {
  explicacion_general: string;
  lectura_del_retorno: string;
  advertencia_de_estimacion: string;
  coste_total_estimado_eur: number;
  contactos_generados: number;
  primeros_consumos_esperados: number;
  clientes_convertidos: number;
  repeticion_esperada: number;
  valor_acumulado_por_cliente_eur: number;
  negocio_potencial_4_meses_eur: number;
  negocio_potencial_12_meses_eur: number;
  roi_aproximado_pct: number;
}

export interface PlanDeAccionSemana {
  semana: string;
  foco_principal: string;
  tareas_clave: string;
  responsable_sugerido: string;
  que_debe_quedar_terminado: string;
}

export interface PlanDeAccionSection {
  duracion_dias: number;
  semanas: PlanDeAccionSemana[];
}

export interface PropuestaDeCaptacionEn5Fases {
  numero: number;
  titulo: string;
  fase_1_oferta_irresistible: Fase1OfertaIrresistibleSection;
  fase_2_grandes_densidades: Fase2GrandesDensidadesSection;
  fase_3_sistema_de_captacion_de_contactos: Fase3SistemaCaptacionContactosSection;
  fase_4_venta_adicional_y_consumo_futuro: Fase4VentaAdicionalSection;
  fase_5_limitacion_estrategica: Fase5LimitacionEstrategicaSection;
  costes_de_la_estrategia: CostesDeLaEstrategiaSection;
  retorno_de_la_estrategia: RetornoDeLaEstrategiaSection;
  plan_de_accion: PlanDeAccionSection;
}

export interface EstrategiaDeCaptacionEn5FasesSection {
  explicacion_educativa: string;
  propuestas: PropuestaDeCaptacionEn5Fases[];
}

export interface ProximosPasosSection {
  texto: string;
  pasos: string[];
}

export interface Captacion5FasesReport {
  titulo: string;
  introduccion: IntroduccionSection;
  base_estrategica: BaseEstrategicaSection;
  diagnostico_de_situacion_actual: DiagnosticoDeSituacionActualSection;
  tu_oportunidad_de_captacion: TuOportunidadDeCaptacionSection;
  estrategia_de_captacion_en_5_fases: EstrategiaDeCaptacionEn5FasesSection;
  proximos_pasos: ProximosPasosSection;
}

export interface ValueIdeaProposal {
  palanca_evaluada: string;
  explicacion_palanca: string;
  idea: {
    nombre_idea: string;
    que_hacer_y_como_aplicarlo: string;
    ejemplo_texto_venta: string;
    por_que_funciona: string;
  };
}

export interface ValueIdeasReport {
  introduccion: { texto: string };
  propuestas_micro_diferenciacion: ValueIdeaProposal[];
  puesta_en_marcha: { texto: string };
}

export interface SalesScriptBlock {
  titulo: string;
  peso_porcentual: number | null;
  palabras_orientativas: number | null;
  texto_guion: string;
  notas_de_uso: string;
}

export interface SalesScriptDevelopedScript {
  previo_a_la_presentacion: SalesScriptBlock;
  logo: SalesScriptBlock;
  nombre_producto_servicio: SalesScriptBlock;
  problema: SalesScriptBlock;
  solucion: SalesScriptBlock;
  caracteristicas_y_detalles_de_funcionamiento: SalesScriptBlock;
  precio_y_condiciones: SalesScriptBlock;
  para_quien_es_y_para_quien_no_es: SalesScriptBlock;
  credenciales: SalesScriptBlock;
  casos_reales: SalesScriptBlock;
  primera_llamada_a_la_accion: SalesScriptBlock;
  limitacion: SalesScriptBlock;
  bonus_o_regalos: SalesScriptBlock;
  segunda_llamada_a_la_accion: SalesScriptBlock;
  gestion_de_objeciones: SalesScriptBlock;
  repeticion_o_ampliacion: SalesScriptBlock;
  llamada_a_la_accion_final: SalesScriptBlock;
}

export interface SalesScriptOptimizedScript {
  texto_introductorio_del_guion: string;
  guion_desarrollado: SalesScriptDevelopedScript;
}

export interface SalesScriptReport {
  titulo: string;
  introduccion: { texto: string };
  base_estrategica: { texto: string };
  guion_optimizado_de_ventas: SalesScriptOptimizedScript;
  uso_y_particularidades: { texto: string };
}

export type BusinessMindsetLevel =
  | "Mentalidad limitante"
  | "Mentalidad en transición"
  | "Mentalidad expansiva";

export type BusinessMindsetCategoryKey =
  | "responsabilidad"
  | "dinero"
  | "accion"
  | "mercado"
  | "liderazgo";

export interface BusinessMindsetQuestionScore {
  question_id: string;
  raw_answer: number;
  limiting_score: number;
}

export interface BusinessMindsetCategoryScore {
  key: BusinessMindsetCategoryKey;
  name: string;
  score: number;
  level: BusinessMindsetLevel;
  question_ids: string[];
  limiting_score_mean: number;
}

export interface BusinessMindsetScorecard {
  global_score: number;
  global_level: BusinessMindsetLevel;
  strongest_category: BusinessMindsetCategoryKey;
  weakest_category: BusinessMindsetCategoryKey;
  question_scores: Record<string, BusinessMindsetQuestionScore>;
  categories: Record<BusinessMindsetCategoryKey, BusinessMindsetCategoryScore>;
}

export interface BusinessMindsetCategoryDiagnosisSection {
  score: number;
  level: BusinessMindsetLevel;
  analysis: string;
}

export interface BusinessMindsetRadiographySection {
  responsabilidad: BusinessMindsetCategoryDiagnosisSection;
  dinero: BusinessMindsetCategoryDiagnosisSection;
  accion: BusinessMindsetCategoryDiagnosisSection;
  mercado: BusinessMindsetCategoryDiagnosisSection;
  liderazgo: BusinessMindsetCategoryDiagnosisSection;
}

export interface BusinessMindsetRecommendationsBlock {
  responsabilidad: { recomendaciones: string[] };
  dinero: { recomendaciones: string[] };
  accion: { recomendaciones: string[] };
  mercado: { recomendaciones: string[] };
  liderazgo: { recomendaciones: string[] };
}

export interface BusinessMindsetConclusionsBlock {
  perfil_de_personalidad_empresarial: string;
  bloqueos_y_consecuencias_en_tus_resultados: string;
  evolucion_y_oportunidades_de_crecimiento: string;
}

export interface BusinessMindsetReport {
  titulo: string;
  scorecard: BusinessMindsetScorecard;
  introduccion: { texto: string };
  resultado_global: {
    score: number;
    level: BusinessMindsetLevel;
    strongest_category: BusinessMindsetCategoryKey;
    weakest_category: BusinessMindsetCategoryKey;
    analysis: string;
  };
  radiografia_del_perfil: BusinessMindsetRadiographySection;
  recomendaciones_de_mejora: BusinessMindsetRecommendationsBlock;
  conclusiones_finales: BusinessMindsetConclusionsBlock;
}

export interface ReportSummary {
  report_id: string;
  user_id: string;
  report_type: string;
  version: number;
  is_pinned: boolean;
  source_run_id?: string | null;
  template_version?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportRecord extends ReportSummary {
  answers: Record<string, unknown>;
  report: Record<string, unknown>;
}

export interface ReportListResponse {
  items: ReportSummary[];
  next_cursor?: string | null;
}
