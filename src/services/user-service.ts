import { get, post } from "@/lib/api-client";
import type { UserCreateRequest, UserResponse } from "@/types/user";

export async function createUser(
  request: UserCreateRequest,
): Promise<UserResponse> {
  return post<UserResponse>("/users", request);
}

export async function getUser(userId: string): Promise<UserResponse> {
  return get<UserResponse>(`/users/${userId}`);
}
