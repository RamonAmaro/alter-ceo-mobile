import { get, post } from "@/lib/api-client";
import { connectSSE, type SSEConnection } from "@/lib/sse-client";
import type { SSETypedEvent } from "@/types/sse";
import type {
  ReportListResponse,
  ReportRecord,
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

interface ListReportsParams {
  type?: string;
  limit?: number;
  cursor?: string;
}

export async function listReports(params: ListReportsParams = {}): Promise<ReportListResponse> {
  const query: Record<string, string> = {};
  if (params.type) query.type = params.type;
  if (params.limit !== undefined) query.limit = String(params.limit);
  if (params.cursor) query.cursor = params.cursor;
  return get<ReportListResponse>("/reports", query);
}

export async function getReportById(reportId: string): Promise<ReportRecord> {
  return get<ReportRecord>(`/reports/${reportId}`);
}

export async function getCurrentReport(reportType: string): Promise<ReportRecord> {
  return get<ReportRecord>("/reports/current", { type: reportType });
}
