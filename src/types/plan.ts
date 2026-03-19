import type { RunStatus } from "./api";
import type {
  ExpressOnboardingAnswers,
  ProfessionalOnboardingAnswers,
} from "./onboarding";

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
