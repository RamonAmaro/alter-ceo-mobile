export type BusinessStatus =
  | "stagnant_profitable"
  | "stagnant_low_profit"
  | "growing_profitable"
  | "growing_no_profit"
  | "early_stage"
  | "risk_of_closure";

export type PainPoint =
  | "growth"
  | "sales"
  | "price"
  | "team"
  | "time"
  | "profitability"
  | "scalability"
  | "mixed";

export type TeamSizeRange =
  | "no_business"
  | "solo"
  | "1_3"
  | "4_10"
  | "11_30"
  | "30_60"
  | "60_100"
  | "100_plus";

export type DailyHoursDedicated = "lt_6" | "between_6_8" | "between_8_10" | "gt_10";

export type FounderEmotionState =
  | "excited"
  | "motivated_but_lost"
  | "motivated_but_stressed"
  | "stressed"
  | "tired_disillusioned"
  | "business_slave";

export type TaskPrioritizationStyle = "goals_but_day_to_day" | "strategic_data_driven" | "ad_hoc";

export type AcquisitionChannel =
  | "word_of_mouth"
  | "physical_location"
  | "sales_force"
  | "marketing_campaigns"
  | "mixed"
  | "partnerships"
  | "other";

export type ConsumptionPattern = "one_time" | "sporadic" | "frequent" | "monthly_subscription";

export type RunStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";

export type MeetingStatus = "PENDING_UPLOAD" | "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED";

export type MeetingProcessingStage =
  | "pending_upload"
  | "uploaded"
  | "transcribing"
  | "summarizing"
  | "updating_memory"
  | "completed"
  | "failed";

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: unknown;
  ctx?: Record<string, unknown>;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly validationErrors?: ValidationError[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
