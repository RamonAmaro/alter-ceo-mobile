/**
 * Factory para um "debouncer" de persist em AsyncStorage.
 *
 * Stores Zustand não devem conter setTimeout/setInterval (regra
 * .claude/rules/state-management.md). Toda a orquestração de tempo
 * fica encapsulada aqui — o store só chama `schedule()` ou `cancel()`.
 */

interface PersistDebouncer<T> {
  /** Agenda uma persistência. Cancela pendências anteriores. */
  readonly schedule: (getValue: () => T) => void;
  /** Cancela qualquer persistência pendente sem executá-la. */
  readonly cancel: () => void;
  /** Executa imediatamente o último valor agendado, se houver. */
  readonly flush: () => Promise<void>;
}

export function createPersistDebouncer<T>(
  saveFn: (value: T) => Promise<void>,
  delayMs = 400,
): PersistDebouncer<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingGetValue: (() => T) | null = null;

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
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
        void saveFn(get());
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
      if (!get) return;
      await saveFn(get());
    },
  };
}
