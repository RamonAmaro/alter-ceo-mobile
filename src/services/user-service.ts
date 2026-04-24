import { get, post } from "@/lib/api-client";
import type { UserCreateRequest, UserResponse } from "@/types/user";

export async function createUser(request: UserCreateRequest): Promise<UserResponse> {
  return post<UserResponse>("/users", request);
}

export async function getUser(userId: string): Promise<UserResponse> {
  if (!userId) {
    throw new Error("getUser called without userId");
  }
  return get<UserResponse>(`/users/${userId}`);
}
