export type SourceType = "meeting" | "pdf";

export type SourceStatus = "pending" | "processing" | "ready" | "failed";

export type EntityType =
  | "person"
  | "org"
  | "product"
  | "metric"
  | "kpi"
  | "date"
  | "currency_value"
  | "org_value";

export type InsightCategory =
  | "risk"
  | "opportunity"
  | "strategy_signal"
  | "pain_point"
  | "resource"
  | "milestone"
  | "kpi_signal";

export type InsightSeverity = "low" | "medium" | "high";

export interface SourceEntity {
  entity_id: number;
  entity_type: EntityType | string;
  name: string;
  attributes?: Record<string, unknown>;
  context_text?: string | null;
  page_start?: number | null;
  page_end?: number | null;
  section_path?: string[] | null;
  created_at?: string | null;
}

export interface SourceInsight {
  insight_id: number;
  category: InsightCategory | string;
  severity: InsightSeverity | string;
  confidence: number;
  insight_text: string;
  supporting_evidence?: string | null;
  page_start?: number | null;
  page_end?: number | null;
  section_path?: string[] | null;
  metadata?: Record<string, unknown>;
  created_at?: string | null;
}

export interface SourceSummaryOut {
  summary_id: number;
  summary_type: string;
  section_path?: string[] | null;
  page_start?: number | null;
  page_end?: number | null;
  summary_text: string;
  metadata?: Record<string, unknown>;
  created_at?: string | null;
}

export interface SourceChunk {
  chunk_id: number;
  chunk_index: number;
  chunk_text: string;
  token_count?: number | null;
  extraction_method?: string | null;
  metadata?: Record<string, unknown>;
  created_at?: string | null;
}

export interface SourceTable {
  table_id: number;
  caption?: string | null;
  headers?: string[];
  rows?: Record<string, unknown>[];
  serialized_markdown: string;
  page_start?: number | null;
  page_end?: number | null;
  section_path?: string[] | null;
  created_at?: string | null;
}

export interface SourceSummaryItem {
  source_id: string;
  source_type: SourceType | string;
  status: SourceStatus | string;
  title?: string | null;
  filename?: string | null;
  meeting_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SourceListResponse {
  items: SourceSummaryItem[];
  next_before: string | null;
}

export interface PdfSourceIngestAccepted {
  source_id: string;
  run_id: string;
  user_id: string;
  company_name: string;
  title?: string | null;
  filename: string;
  content_type: string;
  size_bytes: number;
  storage_provider: string;
  storage_bucket: string;
  storage_key: string;
  storage_url: string;
  status: string;
}

export interface SourceDetailResponse {
  source_id: string;
  user_id: string;
  company_name: string;
  source_type: SourceType | string;
  status: SourceStatus | string;
  title?: string | null;
  filename?: string | null;
  meeting_id?: string | null;
  recording_id?: string | null;
  storage_bucket?: string | null;
  storage_key?: string | null;
  error_message?: string | null;
  strategy_plan?: Record<string, unknown> | null;
  extraction_metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;

  chunks: SourceChunk[];
  summaries: SourceSummaryOut[];
  entities: SourceEntity[];
  tables: SourceTable[];
  insights: SourceInsight[];
}
