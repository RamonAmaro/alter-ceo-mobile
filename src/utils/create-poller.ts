interface PollerOptions<T> {
  fn: () => Promise<T>;
  interval: number;
  shouldStop: (result: T) => boolean;
  onUpdate: (result: T) => void;
  onError: (error: unknown) => void;
}

interface Poller {
  start: () => void;
  stop: () => void;
}

export function createPoller<T>(options: PollerOptions<T>): Poller {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  async function poll(): Promise<void> {
    if (stopped) return;
    try {
      const result = await options.fn();
      if (stopped) return;
      options.onUpdate(result);
      if (options.shouldStop(result)) return;
      timeoutId = setTimeout(poll, options.interval);
    } catch (error) {
      if (!stopped) options.onError(error);
    }
  }

  return {
    start: () => {
      stopped = false;
      poll();
    },
    stop: () => {
      stopped = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}
