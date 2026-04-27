import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_PREFIX = "plan_reading_notice_shown:";
const NOTICE_DELAY_MS = 10_000;

function buildStorageKey(userId: string | null, planId: string | null): string | null {
  if (!userId || !planId) return null;
  return `${STORAGE_PREFIX}${userId}:${planId}`;
}

interface UsePlanReadingNotificationParams {
  readonly userId: string | null;
  readonly planId: string | null;
}

interface UsePlanReadingNotificationResult {
  readonly visible: boolean;
  readonly dismiss: () => void;
}

export function usePlanReadingNotification({
  userId,
  planId,
}: UsePlanReadingNotificationParams): UsePlanReadingNotificationResult {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    const storageKey = buildStorageKey(userId, planId);
    if (!storageKey) return;

    async function scheduleNotice(): Promise<void> {
      try {
        const alreadyShown = await AsyncStorage.getItem(storageKey as string);
        if (alreadyShown === "1" || cancelledRef.current) return;
        timerRef.current = setTimeout(() => {
          if (!cancelledRef.current) setVisible(true);
        }, NOTICE_DELAY_MS);
      } catch {
        // best-effort: si falla la lectura del storage, simplemente no mostramos
      }
    }

    void scheduleNotice();

    return () => {
      cancelledRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [userId, planId]);

  const dismiss = useCallback(() => {
    setVisible(false);
    const storageKey = buildStorageKey(userId, planId);
    if (!storageKey) return;
    void AsyncStorage.setItem(storageKey, "1").catch(() => {
      // best-effort
    });
  }, [userId, planId]);

  return { visible, dismiss };
}
