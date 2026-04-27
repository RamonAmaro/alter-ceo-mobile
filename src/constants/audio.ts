export const AUDIO_MAX_DURATION_MS = 7_500_000;
// Minimum recording duration before "Parar" can be triggered. Whisper needs
// at least ~1s of audio to produce a transcript; below that it returns empty.
export const AUDIO_MIN_DURATION_MS = 2_000;
