import { get, patch } from "@/lib/api-client";
import type {
  BusinessKernelSectionId,
  BusinessKernelSectionPatchRequest,
  BusinessKernelSectionPatchResponse,
  UserBusinessKernelDashboardResponse,
  UserBusinessKernelResponse,
} from "@/types/business-kernel";

export async function getBusinessKernel(userId: string): Promise<UserBusinessKernelResponse> {
  return get<UserBusinessKernelResponse>(`/users/${userId}/business-kernel`);
}

export async function getBusinessKernelDashboard(
  userId: string,
): Promise<UserBusinessKernelDashboardResponse> {
  return get<UserBusinessKernelDashboardResponse>(`/users/${userId}/business-kernel/dashboard`);
}

export async function patchBusinessKernelSection(
  userId: string,
  sectionId: BusinessKernelSectionId,
  body: BusinessKernelSectionPatchRequest,
): Promise<BusinessKernelSectionPatchResponse> {
  return patch<BusinessKernelSectionPatchResponse>(
    `/users/${userId}/business-kernel/sections/${sectionId}`,
    body,
  );
}
