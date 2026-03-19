export interface UserCreateRequest {
  display_name?: string | null;
  source?: string | null;
}

export interface UserResponse {
  user_id: string;
  display_name: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
}
