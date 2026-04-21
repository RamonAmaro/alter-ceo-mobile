import { Alert } from "react-native";

import { openAppSettings, requestAudioPermission } from "@/services/audio-service";

interface EnsureMicrophonePermissionOptions {
  readonly deniedMessage?: string;
}

export async function ensureMicrophonePermission(
  options: EnsureMicrophonePermissionOptions = {},
): Promise<boolean> {
  const { granted, canAskAgain } = await requestAudioPermission();
  if (granted) return true;

  if (!canAskAgain) {
    Alert.alert(
      "Micrófono desactivado",
      "Activa el permiso de micrófono en los ajustes de tu dispositivo para poder grabar.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Ir a ajustes", onPress: openAppSettings },
      ],
    );
  } else {
    Alert.alert(
      "Permiso requerido",
      options.deniedMessage ?? "Necesitamos acceso al micrófono para grabar.",
    );
  }

  return false;
}
