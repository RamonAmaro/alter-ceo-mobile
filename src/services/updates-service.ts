import * as Updates from "expo-updates";
import { Platform } from "react-native";

export async function checkAndApplyUpdate(): Promise<void> {
  if (__DEV__) return;
  if (Platform.OS === "web") return;
  if (!Updates.isEnabled) return;

  try {
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) return;

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
  } catch {
    // Silent failure: OTA check should never block app startup.
  }
}
