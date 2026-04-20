export interface UserBusinessKernelResponse {
  user_id: string;
  business_kernel: Record<string, unknown>;
}

export type BusinessKernelSectionId =
  | "company_profile"
  | "commercial_block"
  | "financial_block"
  | "team_block"
  | "execution_block";

export type BusinessKernelSectionStatus = "not_started" | "in_progress" | "complete";

export interface BusinessKernelSectionResponse {
  id: BusinessKernelSectionId;
  order: number;
  title: string;
  description: string;
  completion_pct: number;
  status: BusinessKernelSectionStatus;
  data: Record<string, unknown>;
}

export interface BusinessKernelDashboardProgressResponse {
  completion_pct: number;
  completed_sections: number;
  total_sections: number;
}

export interface UserBusinessKernelDashboardResponse {
  user_id: string;
  version: string | null;
  progress: BusinessKernelDashboardProgressResponse;
  sections: BusinessKernelSectionResponse[];
}
