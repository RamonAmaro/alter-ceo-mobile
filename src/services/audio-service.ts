import {
  AudioModule,
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  useAudioRecorder,
} from "expo-audio";
import { Linking, Platform } from "react-native";

export interface AudioPermissionResult {
  readonly granted: boolean;
  readonly canAskAgain: boolean;
}

export async function checkAudioPermission(): Promise<AudioPermissionResult> {
  try {
    const { granted, canAskAgain } = await getRecordingPermissionsAsync();
    return { granted, canAskAgain };
  } catch {
    return { granted: false, canAskAgain: true };
  }
}

export async function requestAudioPermission(): Promise<AudioPermissionResult> {
  try {
    const { granted, canAskAgain } = await requestRecordingPermissionsAsync();
    return { granted, canAskAgain };
  } catch {
    return { granted: false, canAskAgain: true };
  }
}

export function openAppSettings(): void {
  if (Platform.OS === "ios") {
    void Linking.openURL("app-settings:");
  } else {
    void Linking.openSettings();
  }
}

export async function enableRecordingMode(): Promise<void> {
  await AudioModule.setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });
}

interface Recorder {
  readonly uri: string | null;
  stop(): Promise<unknown>;
}

export async function stopRecorderAndGetUri(recorder: Recorder): Promise<string | null> {
  // expo-audio resolves stop() after the URI is available on `recorder.uri`.
  await recorder.stop();
  return recorder.uri;
}

export { RecordingPresets, useAudioRecorder };
