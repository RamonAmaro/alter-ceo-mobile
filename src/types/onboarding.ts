import type {
  AcquisitionChannel,
  BusinessStatus,
  ConsumptionPattern,
  DailyHoursDedicated,
  FounderEmotionState,
  PainPoint,
  TaskPrioritizationStyle,
  TeamSizeRange,
} from "./api";

export type GrossMarginKnowledge =
  | "exact"
  | "approximate"
  | "unknown"
  | "unknown_and_not_sure_how";

export type LiquidityLevel =
  | "cash_over_6_months"
  | "cash_1_to_3_months"
  | "unsure"
  | "break_even_day_to_day";

export type SalesProcessMaturity =
  | "intuition_based"
  | "scripted_process"
  | "no_defined_protocol";

export type TeamPerformanceLevel =
  | "needs_close_supervision"
  | "low_engagement"
  | "high_performance_autonomous"
  | "no_team";

export type TeamMeetingsCadence =
  | "sacred_and_productive"
  | "unproductive"
  | "ad_hoc_if_needed"
  | "rarely";

export type FounderAbsenceImpact =
  | "runs_without_founder"
  | "survives_with_difficulty"
  | "results_drop_drastically"
  | "collapses";

export type KPITrackingMaturity =
  | "detailed_dashboard"
  | "occasional_bank_and_revenue_check"
  | "rough_idea"
  | "does_not_understand_question"
  | "blind_management";

export interface AudioAnswer {
  audio_url: string;
  duration_seconds: number;
  transcript?: string | null;
}

export interface ExpressOnboardingAnswers {
  daily_hours_dedicated: DailyHoursDedicated;
  team_size_range: TeamSizeRange;
  monthly_revenue_eur: number | "no_business";
  business_status: BusinessStatus;
  founder_emotion_state: FounderEmotionState;
  main_pain_points: PainPoint[];
  task_prioritization_style: TaskPrioritizationStyle;
  new_customer_acquisition_channel: AcquisitionChannel;
  consumption_pattern: ConsumptionPattern;
  business_website_url: string;
  business_instagram: string;
  primary_offer_audio: AudioAnswer;
  main_daily_obstacle_audio: AudioAnswer;
}

export interface ProfessionalOnboardingAnswers {
  daily_hours_dedicated: DailyHoursDedicated;
  team_size_range: TeamSizeRange;
  monthly_revenue_eur: number | "no_business";
  business_status: BusinessStatus;
  founder_emotion_state: FounderEmotionState;
  main_pain_points: PainPoint[];
  task_prioritization_style: TaskPrioritizationStyle;
  new_customer_acquisition_channel: AcquisitionChannel;
  consumption_pattern: ConsumptionPattern;
  gross_margin_knowledge: GrossMarginKnowledge;
  liquidity_level: LiquidityLevel;
  sales_process_maturity: SalesProcessMaturity;
  team_performance_level: TeamPerformanceLevel;
  team_meetings_cadence: TeamMeetingsCadence;
  founder_absence_impact: FounderAbsenceImpact;
  kpi_tracking_maturity: KPITrackingMaturity;
  business_website_url: string;
  business_instagram: string;
  offer_and_sales_obstacle_audio: AudioAnswer;
  primary_offer_price_audio: AudioAnswer;
}

export interface OnboardingUrlContextPrefetchRequest {
  user_id: string;
  business_website_url: string;
  business_instagram: string;
}

export type PrefetchStatus = "scheduled" | "cached" | "disabled" | "unavailable";

export interface OnboardingUrlContextPrefetchAccepted {
  status: PrefetchStatus;
  cache_key: string;
  urls?: string[];
}
