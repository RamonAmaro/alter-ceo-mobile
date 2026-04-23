import { Platform } from "react-native";

export const AUDIO_MAX_DURATION_MS = 7_500_000;

/**
 * TODO: No iOS/Android o rascunho de áudio ao sair do chat e voltar ainda não é
 * confiável (ex.: `SharedObject<AudioRecorder>`, ordem blur/unmount vs. persistência).
 * Na web o fluxo tende a funcionar. Quando arrumar a captura nativa, revisar este
 * sinalizador — pode voltar a `false` ou ser removido.
 *
 * @see `use-chat-audio-recorder` (capture ao blur) e `chat` (draft `__new__`).
 */
export const CHAT_AUDIO_DRAFT_ON_LEAVE_UNSTABLE_ON_NATIVE = Platform.OS !== "web";
