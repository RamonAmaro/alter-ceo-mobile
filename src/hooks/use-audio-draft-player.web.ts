import { useCallback, useEffect, useRef, useState } from "react";

import { useAudioPlayer, useAudioPlayerStatus } from "@/hooks/use-audio-playback";
import { resolveRecordingBlob } from "@/services/resolve-recording-uri";

// Web: URIs de draft podem ser `blob:` (sessão atual) ou `idb-audio://` (persistido
// no IndexedDB). O `<audio>` HTML consegue tocar `blob:` diretamente mas não
// `idb-audio://` — precisamos resolver o blob via IndexedDB e criar uma blob
// URL viva só para o player. Revogamos a URL ao desmontar ou trocar de áudio
// para não vazar memória.

interface ChatAudioDraftPlayerResult {
  readonly isPlaying: boolean;
  readonly isLoaded: boolean;
  readonly currentTimeMs: number;
  readonly durationMs: number;
  readonly toggle: () => void;
  readonly stop: () => void;
}

export function useChatAudioDraftPlayer(uri: string | null): ChatAudioDraftPlayerResult {
  const [playableUri, setPlayableUri] = useState<string | null>(null);
  // Guarda o URL criado via `createObjectURL` para poder revogar exatamente o
  // mesmo. Se salvássemos em state, um rerender no meio poderia perder a
  // referência certa.
  const createdUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!uri) {
        setPlayableUri(null);
        return;
      }

      if (!uri.startsWith("idb-audio://")) {
        // `blob:` URLs já tocam diretamente.
        setPlayableUri(uri);
        return;
      }

      const blob = await resolveRecordingBlob(uri);
      if (cancelled) return;

      if (!blob) {
        setPlayableUri(null);
        return;
      }
      const next = URL.createObjectURL(blob);
      createdUrlRef.current = next;
      setPlayableUri(next);
    }

    void resolve();

    return () => {
      cancelled = true;
      if (createdUrlRef.current) {
        try {
          URL.revokeObjectURL(createdUrlRef.current);
        } catch {
          // best-effort
        }
        createdUrlRef.current = null;
      }
    };
  }, [uri]);

  const player = useAudioPlayer(playableUri);
  const status = useAudioPlayerStatus(player);

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
