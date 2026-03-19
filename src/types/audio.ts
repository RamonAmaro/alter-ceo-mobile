export interface AudioRecordingTranscriptionResponse {
  recording_id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  audio_url: string;
  storage_bucket: string;
  storage_key: string;
  storage_provider: string;
  transcription_provider: string;
  transcript: string;
  language?: string | null;
  duration_seconds?: number | null;
}
