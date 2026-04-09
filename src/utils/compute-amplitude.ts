/** Boost factor applied to RMS so that normal speech fills ~60-80% of the bar height. */
const GAIN = 25;

function rmsToAmplitude(rms: number): number {
  return Math.min(rms * GAIN, 1);
}

export function computeAmplitudeFromFloat32(data: Float32Array): number {
  const length = data.length;
  if (length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += data[i] * data[i];
  }
  return rmsToAmplitude(Math.sqrt(sum / length));
}

export function computeAmplitudeFromBase64(base64: string): number {
  try {
    const binary = atob(base64);
    const count = Math.floor(binary.length / 2);
    if (count === 0) return 0;
    let sum = 0;
    for (let i = 0; i < count; i++) {
      const s16 = ((binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8)) << 16) >> 16;
      const norm = s16 / 32768;
      sum += norm * norm;
    }
    return rmsToAmplitude(Math.sqrt(sum / count));
  } catch {
    return 0;
  }
}
