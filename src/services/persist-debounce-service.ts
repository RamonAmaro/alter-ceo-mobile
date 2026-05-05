interface PersistDebouncer<T> {
  readonly schedule: (getValue: () => T) => void;
  readonly cancel: () => void;
  readonly flush: () => Promise<void>;
}

export function createPersistDebouncer<T>(
  saveFn: (value: T) => Promise<void>,
  delayMs = 400,
): PersistDebouncer<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingGetValue: (() => T) | null = null;
  let inFlight: Promise<void> = Promise.resolve();

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function runSave(value: T): Promise<void> {
    const next = inFlight.then(() => saveFn(value));
    inFlight = next.catch(() => undefined);
    return next;
  }

  return {
    schedule: (getValue) => {
      clearTimer();
      pendingGetValue = getValue;
      timer = setTimeout(() => {
        timer = null;
        const get = pendingGetValue;
        pendingGetValue = null;
        if (!get) return;
        void runSave(get());
      }, delayMs);
    },

    cancel: () => {
      clearTimer();
      pendingGetValue = null;
    },

    flush: async () => {
      const get = pendingGetValue;
      clearTimer();
      pendingGetValue = null;
      if (!get) {
        await inFlight;
        return;
      }
      await runSave(get());
    },
  };
}
