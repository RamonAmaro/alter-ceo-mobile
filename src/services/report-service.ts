import { get, post } from "@/lib/api-client";
import { connectSSE, type SSEConnection } from "@/lib/sse-client";
import type { SSETypedEvent } from "@/types/sse";
import type {
  ReportRunAccepted,
  ReportRunCreateRequest,
  ReportRunStatusResponse,
  ReportTemplate,
} from "@/types/report";

export async function getReportTemplate(reportType: string): Promise<ReportTemplate> {
  return get<ReportTemplate>(`/report-templates/${reportType}`);
}

export async function createReportRun(request: ReportRunCreateRequest): Promise<ReportRunAccepted> {
  return post<ReportRunAccepted>("/report-runs", request);
}

export async function getReportRunStatus(runId: string): Promise<ReportRunStatusResponse> {
  return get<ReportRunStatusResponse>(`/runs/${runId}`);
}

export function streamReportRunEvents(
  runId: string,
  onEvent: (event: SSETypedEvent) => void,
  onError?: (error: Error) => void,
  afterEventId?: string,
): SSEConnection {
  return connectSSE(`/runs/${runId}/events`, { onEvent, onError, afterEventId });
}
