import { get } from "@/lib/api-client";
import type { UserBusinessKernelResponse } from "@/types/business-kernel";

export async function getBusinessKernel(userId: string): Promise<UserBusinessKernelResponse> {
  return get<UserBusinessKernelResponse>(`/users/${userId}/business-kernel`);
}
