/**
 * Formats elapsed milliseconds as "0:SS" (minutes:seconds).
 */
export function formatTimer(elapsedMs: number): string {
  const totalSeconds = Math.min(Math.floor(elapsedMs / 1000), 99);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
