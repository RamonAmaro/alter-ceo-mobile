import type {
  AcquisitionChannel,
  BusinessStatus,
  ConsumptionPattern,
  DailyHoursDedicated,
  FounderEmotionState,
  PainPoint,
  TaskPrioritizationStyle,
  TeamSizeRange,
} from "@/types/api";
import type {
  AudioAnswer,
  ExpressOnboardingAnswers,
  FounderAbsenceImpact,
  GrossMarginKnowledge,
  KPITrackingMaturity,
  LiquidityLevel,
  ProfessionalOnboardingAnswers,
  SalesProcessMaturity,
  TeamMeetingsCadence,
  TeamPerformanceLevel,
} from "@/types/onboarding";
import type { Answer } from "@/stores/onboarding-store";
import type { PlanRunCreateRequest } from "@/types/plan";
import { normalizeWebsiteUrl } from "@/utils/normalize-website-url";

const DAILY_HOURS_MAP: Record<string, DailyHoursDedicated> = {
  "Menos de 6": "lt_6",
  "Entre 6 y 8": "between_6_8",
  "Entre 8 y 10": "between_8_10",
  "Más de 10": "gt_10",
};

const TEAM_SIZE_MAP: Record<string, TeamSizeRange> = {
  Autónomo: "solo",
  "De 1 a 3": "1_3",
  "De 4 a 10": "4_10",
  "De 11 a 30": "11_30",
  "De 30 a 60": "30_60",
  "Más de 60": "60_100",
};

const REVENUE_MAP: Record<string, number | "no_business"> = {
  "Menos de 40.000 €": 20000,
  "De 40.000 € a 100.000 €": 70000,
  "De 100.000 € a 300.000 €": 200000,
  "De 300.000 € a 600.000 €": 450000,
  "De 600.000 € a 1 Millón €": 800000,
  "De 1 a 3 Millones €": 2000000,
  "De 3 a 10 Millones €": 6500000,
  "Más de 10 Millones €": 10000000,
};

const BUSINESS_STATUS_MAP: Record<string, BusinessStatus> = {
  "Negocio estancado pero rentable": "stagnant_profitable",
  "Estancado y poco rentable": "stagnant_low_profit",
  "Creciendo con rentabilidad": "growing_profitable",
  "Creciendo pero sin rentabilidad": "growing_no_profit",
  "Decreciendo y poco rentable": "early_stage",
  "En riesgo de quiebra/cierre": "risk_of_closure",
};

const EMOTION_MAP: Record<string, FounderEmotionState> = {
  "Ilusionado / entusiasmado": "excited",
  "Animado pero perdido": "motivated_but_lost",
  "Animado pero estresado": "motivated_but_stressed",
  "Estresado / agobiado": "stressed",
  "Cansado / desilusionado": "tired_disillusioned",
  "Esclavo del negocio": "business_slave",
};

const PAIN_POINT_MAP: Record<string, PainPoint> = {
  "Crecimiento:": "growth",
  "Ventas:": "sales",
  "Precio:": "price",
  "Equipo:": "team",
  "Tiempo:": "time",
  "Rentabilidad:": "profitability",
  "Escalabilidad:": "scalability",
  "Un poco de todo.": "mixed",
};

const PRIORITIZATION_MAP: Record<string, TaskPrioritizationStyle> = {
  "Tengo objetivos, pero el día a día me come.": "goals_but_day_to_day",
  "Planes estratégicos y análisis de datos.": "strategic_data_driven",
  "Voy decidiendo sobre la marcha.": "ad_hoc",
};

const ACQUISITION_MAP: Record<string, AcquisitionChannel> = {
  "Principalmente por el boca a boca.": "word_of_mouth",
  "Principalmente por la ubicación física.": "physical_location",
  "Principalmente con fuerza comercial.": "sales_force",
  "Campañas de marketing / comunicación / publicidad.": "marketing_campaigns",
  "Mezcla de boca a boca y alguna acción comercial.": "mixed",
  "Alianzas / colaboraciones.": "partnerships",
  "Otros.": "other",
};

const CONSUMPTION_MAP: Record<string, ConsumptionPattern> = {
  "El cliente consume una sola vez.": "one_time",
  "Consumo esporádico.": "sporadic",
  "Consumo frecuente.": "frequent",
  "Cuota o suscripción mensual.": "monthly_subscription",
};

const GROSS_MARGIN_MAP: Record<string, GrossMarginKnowledge> = {
  "Sí, al céntimo.": "exact",
  "Tengo una idea aproximada.": "approximate",
  "No lo sé con seguridad.": "unknown",
  "No lo sé ni tampoco sé cómo obtenerlo.": "unknown_and_not_sure_how",
};

const LIQUIDITY_MAP: Record<string, LiquidityLevel> = {
  "Tengo caja suficiente para aguantar más de 6 meses sin ventas.": "cash_over_6_months",
  "Tengo caja suficiente para aguantar 1-3 meses.": "cash_1_to_3_months",
  "No sabría contestar exactamente a la pregunta.": "unsure",
  "Vivo al día, lo que entra es más o menos lo que sale.": "break_even_day_to_day",
};

const SALES_MATURITY_MAP: Record<string, SalesProcessMaturity> = {
  "Vendemos más por experiencia o intuición.": "intuition_based",
  "Sí, seguimos scripts basados en procesos de decisión del cliente.": "scripted_process",
  "No hay protocolos de ventas definidos.": "no_defined_protocol",
};

const TEAM_PERFORMANCE_MAP: Record<string, TeamPerformanceLevel> = {
  "Tengo que estar encima para que las cosas salgan bien.": "needs_close_supervision",
  "Siento que pasan de todo, estoy frustrado.": "low_engagement",
  "Tengo un equipo autosuficiente y de alto rendimiento.": "high_performance_autonomous",
  "No tengo equipo en este momento.": "no_team",
};

const TEAM_MEETINGS_MAP: Record<string, TeamMeetingsCadence> = {
  "Sí, sagradas y productivas.": "sacred_and_productive",
  "Hacemos reuniones, pero son una pérdida de tiempo.": "unproductive",
  "Hacemos reuniones si hace falta.": "ad_hoc_if_needed",
  "No solemos hacer.": "rarely",
};

const FOUNDER_ABSENCE_MAP: Record<string, FounderAbsenceImpact> = {
  "Funcionaría perfectamente sin mí.": "runs_without_founder",
  "Sobreviviría, pero con dificultades.": "survives_with_difficulty",
  "Los resultados se verían drásticamente afectados.": "results_drop_drastically",
  "Se hundiría, sin duda.": "collapses",
};

const KPI_MAP: Record<string, KPITrackingMaturity> = {
  "Sí, tengo un cuadro de mando detallado.": "detailed_dashboard",
  "Miro de vez en cuando el banco y la facturación.": "occasional_bank_and_revenue_check",
  "Tengo una idea aproximada pero no muy concreta.": "rough_idea",
  "No entiendo bien la pregunta.": "does_not_understand_question",
  "Sinceramente, voy a ciegas.": "blind_management",
};

function mapSingle<T>(map: Record<string, T>, answer: Answer | undefined): T {
  return map[answer as string];
}

function mapMulti<T>(map: Record<string, T>, answer: Answer | undefined): T[] {
  if (!Array.isArray(answer)) return [];
  return answer.map((a) => map[a]).filter(Boolean) as T[];
}

function mapRevenue(answer: Answer | undefined): number | "no_business" {
  if (!answer || typeof answer !== "string") return "no_business";
  return REVENUE_MAP[answer] ?? "no_business";
}

interface BuildExpressPayloadParams {
  answers: Map<number, Answer>;
  primaryOfferAudio: AudioAnswer;
  mainObstacleAudio: AudioAnswer;
  userId: string;
}

interface BuildProfessionalPayloadParams {
  answers: Map<number, Answer>;
  offerAndSalesAudio: AudioAnswer;
  primaryOfferPriceAudio: AudioAnswer;
  userId: string;
}

export function buildExpressPayload(params: BuildExpressPayloadParams): PlanRunCreateRequest {
  const { answers, primaryOfferAudio, mainObstacleAudio, userId } = params;
  const a = (i: number) => answers.get(i);

  const expressAnswers: ExpressOnboardingAnswers = {
    daily_hours_dedicated: mapSingle(DAILY_HOURS_MAP, a(2)),
    team_size_range: mapSingle(TEAM_SIZE_MAP, a(1)),
    monthly_revenue_eur: mapRevenue(a(0)),
    business_status: mapSingle(BUSINESS_STATUS_MAP, a(3)),
    founder_emotion_state: mapSingle(EMOTION_MAP, a(4)),
    main_pain_points: mapMulti(PAIN_POINT_MAP, a(5)),
    task_prioritization_style: mapSingle(PRIORITIZATION_MAP, a(6)),
    new_customer_acquisition_channel: mapSingle(ACQUISITION_MAP, a(7)),
    consumption_pattern: mapSingle(CONSUMPTION_MAP, a(8)),
    business_website_url: normalizeWebsiteUrl((a(9) as string) ?? ""),
    business_instagram: (a(10) as string) ?? "",
    primary_offer_audio: primaryOfferAudio,
    main_daily_obstacle_audio: mainObstacleAudio,
  };

  return {
    user_id: userId,
    onboarding_mode: "express",
    answers: expressAnswers,
    top_k: 6,
    include_business_kernel: false,
  };
}

export function buildProfessionalPayload(
  params: BuildProfessionalPayloadParams,
): PlanRunCreateRequest {
  const { answers, offerAndSalesAudio, primaryOfferPriceAudio, userId } = params;
  const a = (i: number) => answers.get(i);

  const professionalAnswers: ProfessionalOnboardingAnswers = {
    daily_hours_dedicated: mapSingle(DAILY_HOURS_MAP, a(2)),
    team_size_range: mapSingle(TEAM_SIZE_MAP, a(1)),
    monthly_revenue_eur: mapRevenue(a(0)),
    business_status: mapSingle(BUSINESS_STATUS_MAP, a(3)),
    founder_emotion_state: mapSingle(EMOTION_MAP, a(4)),
    main_pain_points: mapMulti(PAIN_POINT_MAP, a(5)),
    task_prioritization_style: mapSingle(PRIORITIZATION_MAP, a(6)),
    new_customer_acquisition_channel: mapSingle(ACQUISITION_MAP, a(7)),
    consumption_pattern: mapSingle(CONSUMPTION_MAP, a(8)),
    gross_margin_knowledge: mapSingle(GROSS_MARGIN_MAP, a(9)),
    liquidity_level: mapSingle(LIQUIDITY_MAP, a(10)),
    sales_process_maturity: mapSingle(SALES_MATURITY_MAP, a(11)),
    team_performance_level: mapSingle(TEAM_PERFORMANCE_MAP, a(12)),
    team_meetings_cadence: mapSingle(TEAM_MEETINGS_MAP, a(13)),
    founder_absence_impact: mapSingle(FOUNDER_ABSENCE_MAP, a(14)),
    kpi_tracking_maturity: mapSingle(KPI_MAP, a(15)),
    business_website_url: normalizeWebsiteUrl((a(16) as string) ?? ""),
    business_instagram: (a(17) as string) ?? "",
    offer_and_sales_obstacle_audio: offerAndSalesAudio,
    primary_offer_price_audio: primaryOfferPriceAudio,
  };

  return {
    user_id: userId,
    onboarding_mode: "professional",
    answers: professionalAnswers,
    top_k: 6,
    include_business_kernel: false,
  };
}
