import { get } from "@/lib/api-client";
import type { SourceDetailResponse } from "@/types/source";

export async function getSourceDetail(sourceId: string): Promise<SourceDetailResponse> {
  return get<SourceDetailResponse>(`/sources/${sourceId}`);
}
