import { useCallback, useEffect } from "react";

import { useAudioPlayer, useAudioPlayerStatus } from "@/hooks/use-audio-playback";

// Native: URIs de draft são `file:///.../recordings/xxx.m4a` e `expo-audio`
// consegue tocar diretamente. Sem necessidade de resolver ou criar blob URLs.
// Web tem um `.web.ts` irmão que resolve `idb-audio://` para blob URL.

interface ChatAudioDraftPlayerResult {
  readonly isPlaying: boolean;
  readonly isLoaded: boolean;
  readonly currentTimeMs: number;
  readonly durationMs: number;
  readonly toggle: () => void;
  readonly stop: () => void;
}

export function useChatAudioDraftPlayer(uri: string | null): ChatAudioDraftPlayerResult {
  const player = useAudioPlayer(uri ?? null);
  const status = useAudioPlayerStatus(player);

  // Quando o áudio termina naturalmente, o `expo-audio` não volta para o
  // início sozinho — os próximos `play()` continuariam do fim. Voltamos para
  // 0 manualmente para que um segundo clique toque do começo.
  useEffect(() => {
    if (status.didJustFinish) {
      player.seekTo(0);
    }
  }, [status.didJustFinish, player]);

  const toggle = useCallback(() => {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.didJustFinish) {
      player.seekTo(0);
    }
    player.play();
  }, [player, status.playing, status.didJustFinish]);

  const stop = useCallback(() => {
    player.pause();
    player.seekTo(0);
  }, [player]);

  return {
    isPlaying: status.playing,
    isLoaded: status.isLoaded,
    currentTimeMs: status.currentTime * 1000,
    durationMs: status.duration * 1000,
    toggle,
    stop,
  };
}
