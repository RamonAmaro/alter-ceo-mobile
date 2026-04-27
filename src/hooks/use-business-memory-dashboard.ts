import {
  buildBusinessMemoryStep,
  buildBusinessMemorySteps,
  type BusinessMemoryStep,
} from "@/constants/business-memory-steps";
import { getBusinessKernelDashboard } from "@/services/business-kernel-service";
import { useAuthStore } from "@/stores/auth-store";
import type {
  BusinessKernelDashboardProgressResponse,
  BusinessKernelSectionPatchResponse,
} from "@/types/business-kernel";
import { toErrorMessage } from "@/utils/to-error-message";
import { useEffect, useRef, useState } from "react";

interface UseBusinessMemoryDashboardResult {
  applySectionPatch: (payload: BusinessKernelSectionPatchResponse) => void;
  error: string | null;
  isLoading: boolean;
  progress: BusinessKernelDashboardProgressResponse | null;
  refresh: () => Promise<void>;
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
  const refreshInFlightRef = useRef(false);

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
          setError("Sesión no válida.");
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

  async function refresh(): Promise<void> {
    if (!userId) {
      setError("Sesión no válida.");
      setIsLoading(false);
      return;
    }
    if (refreshInFlightRef.current) return;

    refreshInFlightRef.current = true;
    try {
      await loadDashboard(userId);
    } finally {
      refreshInFlightRef.current = false;
    }
  }

  function applySectionPatch(payload: BusinessKernelSectionPatchResponse): void {
    setVersion(payload.version);
    setProgress(payload.progress);
    setSteps((currentSteps) => {
      const nextStep = buildBusinessMemoryStep(payload.section);
      const existingIndex = currentSteps.findIndex((step) => step.id === payload.section.id);
      if (existingIndex < 0) {
        return [...currentSteps, nextStep].sort((left, right) => left.order - right.order);
      }
      const nextSteps = [...currentSteps];
      nextSteps[existingIndex] = nextStep;
      return nextSteps;
    });
    setError(null);
  }

  return {
    applySectionPatch,
    error,
    isLoading,
    progress,
    refresh,
    steps,
    userId,
    version,
  };
}
