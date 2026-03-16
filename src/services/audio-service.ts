import {
  AudioModule,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from "expo-audio";

const MAX_DURATION_MS = 30_000;

export async function requestAudioPermission(): Promise<boolean> {
  try {
    const { granted } = await requestRecordingPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
}

export async function enableRecordingMode(): Promise<void> {
  await AudioModule.setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });
}

export { MAX_DURATION_MS, RecordingPresets, useAudioRecorder };
