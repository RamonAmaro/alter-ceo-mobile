import { get } from "@/lib/api-client";
import type {
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
