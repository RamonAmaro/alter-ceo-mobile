import { buildBusinessMemorySteps, type BusinessMemoryStep } from "@/constants/business-memory-steps";
import { getBusinessKernelDashboard } from "@/services/business-kernel-service";
import { useAuthStore } from "@/stores/auth-store";
import type { BusinessKernelDashboardProgressResponse } from "@/types/business-kernel";
import { toErrorMessage } from "@/utils/to-error-message";
import { useEffect, useState } from "react";

interface UseBusinessMemoryDashboardResult {
  error: string | null;
  isLoading: boolean;
  progress: BusinessKernelDashboardProgressResponse | null;
  refresh: () => void;
  steps: BusinessMemoryStep[];
  userId: string | null;
  version: string | null;
}

export function useBusinessMemoryDashboard(): UseBusinessMemoryDashboardResult {
  const userId = useAuthStore((state) => state.user?.userId ?? null);
  const [steps, setSteps] = useState<BusinessMemoryStep[]>([]);
  const [progress, setProgress] = useState<BusinessKernelDashboardProgressResponse | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard(currentUserId: string): Promise<void> {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getBusinessKernelDashboard(currentUserId);
      setSteps(buildBusinessMemorySteps(response.sections));
      setProgress(response.progress);
      setVersion(response.version);
      setError(null);
    } catch (err) {
      setSteps([]);
      setProgress(null);
      setVersion(null);
      setError(toErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      if (!userId) {
        if (!cancelled) {
          setSteps([]);
          setProgress(null);
          setVersion(null);
          setError("Sesion no valida.");
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await getBusinessKernelDashboard(userId);
        if (cancelled) return;
        setSteps(buildBusinessMemorySteps(response.sections));
        setProgress(response.progress);
        setVersion(response.version);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setSteps([]);
        setProgress(null);
        setVersion(null);
        setError(toErrorMessage(err));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  function refresh(): void {
    if (!userId) {
      setError("Sesion no valida.");
      setIsLoading(false);
      return;
    }
    void loadDashboard(userId);
  }

  return {
    error,
    isLoading,
    progress,
    refresh,
    steps,
    userId,
    version,
  };
}
