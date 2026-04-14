import { get, post } from "@/lib/api-client";
import type {
  DebugCEOArchetypeOverrideResponse,
  DebugDefaultProfileLoadResponse,
  DebugDefaultProfilesResponse,
  CeoArchetypeApiValue,
} from "@/types/debug";

export async function listDefaultProfiles(): Promise<DebugDefaultProfilesResponse> {
  return get<DebugDefaultProfilesResponse>("/debug/default-profiles");
}

export async function loadDefaultProfile(
  profileId: string,
): Promise<DebugDefaultProfileLoadResponse> {
  return post<DebugDefaultProfileLoadResponse>("/debug/default-profiles/load", {
    profile_id: profileId,
  });
}

export async function overrideCeoArchetype(
  archetype: CeoArchetypeApiValue,
): Promise<DebugCEOArchetypeOverrideResponse> {
  return post<DebugCEOArchetypeOverrideResponse>("/debug/ceo-archetype", { archetype });
}
