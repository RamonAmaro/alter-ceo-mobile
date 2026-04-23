import type { MeetingProcessingStage, MeetingStatus } from "./api";

export interface MeetingCreateRequest {
  user_id: string;
  title?: string | null;
  file_name: string;
  content_type: string;
}

export interface MeetingDirectUploadPayload {
  provider: "s3";
  method: "PUT";
  upload_url: string;
  headers?: Record<string, string>;
  audio_url: string;
  audio_bucket: string;
  audio_key: string;
  expires_in_seconds: number;
}

export interface MeetingCreateResponse {
  meeting_id: string;
  user_id: string;
  title: string;
  status: MeetingStatus;
  processing_stage: MeetingProcessingStage;
  created_at: string;
  updated_at: string;
  upload: MeetingDirectUploadPayload;
}

export interface MeetingUploadCompletedRequest {
  audio_url: string;
  audio_bucket?: string | null;
  audio_key?: string | null;
  file_name: string;
  content_type: string;
  size_bytes: number;
  duration_seconds?: number | null;
  recorded_started_at?: string | null;
  recorded_finished_at?: string | null;
}

export interface MeetingProcessingAccepted {
  meeting_id: string;
  status: MeetingStatus;
  processing_stage: MeetingProcessingStage;
  processing_run_id: string;
}

export interface MeetingSummaryPayload {
  headline: string;
  executive_summary: string;
  decisions?: string[];
  blockers?: string[];
  next_steps?: string[];
  business_kernel_signals?: string[];
}

export interface MeetingResponse {
  meeting_id: string;
  user_id: string;
  title: string;
  status: MeetingStatus;
  processing_stage: MeetingProcessingStage;
  processing_run_id?: string | null;
  audio_url?: string | null;
  audio_bucket?: string | null;
  audio_key?: string | null;
  file_name?: string | null;
  content_type?: string | null;
  size_bytes?: number | null;
  duration_seconds?: number | null;
  recorded_started_at?: string | null;
  recorded_finished_at?: string | null;
  transcript?: string | null;
  summary?: MeetingSummaryPayload | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  processing_started_at?: string | null;
  processing_finished_at?: string | null;
}

export interface MeetingSummaryResponse {
  meeting_id: string;
  user_id: string;
  title: string;
  status: MeetingStatus;
  processing_stage: MeetingProcessingStage;
  processing_run_id?: string | null;
  duration_seconds?: number | null;
  updated_at: string;
  error_message?: string | null;
}

export interface UserMeetingsResponse {
  user_id: string;
  meetings?: MeetingSummaryResponse[];
}
