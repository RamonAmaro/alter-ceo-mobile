import { post } from "@/lib/api-client";
import type {
  OnboardingUrlContextPrefetchAccepted,
  OnboardingUrlContextPrefetchRequest,
} from "@/types/onboarding";

export async function prefetchUrlContext(
  request: OnboardingUrlContextPrefetchRequest,
): Promise<OnboardingUrlContextPrefetchAccepted> {
  return post<OnboardingUrlContextPrefetchAccepted>("/onboarding/url-context/prefetch", request);
}
