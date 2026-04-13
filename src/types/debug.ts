export interface DebugDefaultProfileSummary {
  profile_id: string;
  title: string;
  description: string;
}

export interface DebugDefaultProfilesResponse {
  profiles: DebugDefaultProfileSummary[];
}

export interface DebugDefaultProfileLoadRequest {
  profile_id: string;
}

export interface DebugDefaultProfileLoadResponse {
  profile_id: string;
  user_id: string;
  plan_id: string;
  created_at: string;
}

export type CeoArchetypeApiValue =
  | "incompetencia_inconsciente"
  | "incompetencia_consciente"
  | "competencia_inconsciente"
  | "competencia_consciente";

export interface DebugCEOArchetypeOverrideRequest {
  archetype: CeoArchetypeApiValue;
}

export interface DebugCEOArchetypeOverrideResponse {
  user_id: string;
  archetype: CeoArchetypeApiValue;
  confidence: number;
  justification: string;
  classified_at: string;
}
