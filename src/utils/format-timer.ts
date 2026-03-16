/**
 * Formats elapsed milliseconds as "00 : SS , CC" (seconds and centiseconds).
 * Counts up from 00:00 to max duration.
 */
export function formatTimer(elapsedMs: number): string {
  const totalCentis = Math.min(3000, Math.floor(elapsedMs / 10));
  const seconds = Math.floor(totalCentis / 100);
  const centis = totalCentis % 100;

  const ss = String(seconds).padStart(2, "0");
  const cc = String(centis).padStart(2, "0");

  return `00 : ${ss} , ${cc}`;
}
