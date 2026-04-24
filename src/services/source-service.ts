import { get, postFormData } from "@/lib/api-client";
import { buildPdfFormData, type PdfUploadSource } from "@/services/pdf-upload";
import type {
  PdfSourceIngestAccepted,
  SourceDetailResponse,
  SourceListResponse,
  SourceType,
} from "@/types/source";

export async function getSourceDetail(sourceId: string): Promise<SourceDetailResponse> {
  return get<SourceDetailResponse>(`/sources/${sourceId}`);
}

export interface ListSourcesParams {
  userId: string;
  companyName?: string;
  sourceType?: SourceType;
  limit?: number;
  before?: string;
}

export async function listSources(params: ListSourcesParams): Promise<SourceListResponse> {
  const query: Record<string, string> = { user_id: params.userId };
  if (params.companyName) query.company_name = params.companyName;
  if (params.sourceType) query.source_type = params.sourceType;
  if (params.limit != null) query.limit = String(params.limit);
  if (params.before) query.before = params.before;
  return get<SourceListResponse>("/sources/me", query);
}

export interface UploadPdfParams {
  userId: string;
  // Transitional: on the pre-merge API `company_name` is required; on the
  // post-merge API it's ignored. Keep it optional so the caller can omit it
  // when the user has no company set up yet — the post-merge backend no
  // longer rejects that case.
  companyName?: string;
  title?: string;
  file: PdfUploadSource;
}

export async function uploadPdfSource(params: UploadPdfParams): Promise<PdfSourceIngestAccepted> {
  const formData = await buildPdfFormData(params.file, {
    user_id: params.userId,
    company_name: params.companyName,
    title: params.title,
  });
  return postFormData<PdfSourceIngestAccepted>("/sources/pdf", formData);
}
