import { useEffect } from "react";

import { useAuthStore } from "@/stores/auth-store";
import { useTaskStore } from "@/stores/task-store";

export function useTaskEventStream(): void {
  const userId = useAuthStore((s) => (s.isAuthenticated ? (s.user?.userId ?? null) : null));

  useEffect(() => {
    if (!userId) return;
    const start = useTaskStore.getState().startEventStream;
    const stop = useTaskStore.getState().stopEventStream;
    start(userId);
    return () => stop();
  }, [userId]);
}
