import { useCallback, useEffect, useRef } from "react";
import { Animated } from "react-native";

import { useChatAudioDraftPlayer } from "@/hooks/use-audio-draft-player";
import { useBannerEnterExitAnimation } from "@/hooks/use-banner-enter-exit-animation";

import { ChatAudioDraftCard } from "./chat-audio-draft-card";
import { ChatAudioDraftLostCard } from "./chat-audio-draft-lost-card";

interface ChatAudioDraftBannerProps {
  // URI do arquivo/blob persistido. `null` desliga o player (ex: draft lost).
  readonly uri: string | null;
  readonly durationMs: number;
  readonly onSend: () => void;
  readonly onDiscard: () => void;
  readonly isSubmitting?: boolean;
  // Quando true, o áudio não está mais acessível (blob foi recolhido pelo
  // navegador) — banner avisa e só oferece Descartar.
  readonly lost?: boolean;
}

export function ChatAudioDraftBanner({
  uri,
  durationMs,
  onSend,
  onDiscard,
  isSubmitting = false,
  lost = false,
}: ChatAudioDraftBannerProps) {
  const { style, animateExit } = useBannerEnterExitAnimation();
  // Player só é ativado quando o áudio é tocável (não em `lost`, não em
  // `submitting`). Passar null aqui evita carregar e tentar tocar um blob
  // inexistente.
  const playerEnabled = !lost && !isSubmitting;
  const { isPlaying, isLoaded, currentTimeMs, toggle, stop } = useChatAudioDraftPlayer(
    playerEnabled ? uri : null,
  );
  // Sempre usamos `durationMs` do store (valor medido no momento da gravação).
  // Antes, caíamos no `player.durationMs` quando disponível, mas isso causava
  // um "pulo" visível no timer: o banner montava com o valor do store, e
  // algumas centenas de ms depois trocava para o valor do player (os dois
  // valores divergem ligeiramente porque o MediaRecorder descarta os últimos
  // frames ao parar). O valor do store é estável entre renders e já está
  // disponível no primeiro frame — então é a fonte de verdade para o header.

  // Ação pendente que roda após a animação de saída terminar. Guardada em ref
  // para que um unmount inesperado dispare a ação mesmo assim — evita vazar a
  // intenção do usuário (ex: usuário clica discard, navega de aba: draft
  // precisa ser limpo mesmo sem animação concluir).
  const pendingActionRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    return () => {
      const pending = pendingActionRef.current;
      pendingActionRef.current = null;
      pending?.();
    };
  }, []);

  const handleDiscard = useCallback(() => {
    pendingActionRef.current = onDiscard;
    stop();
    animateExit(() => {
      const pending = pendingActionRef.current;
      pendingActionRef.current = null;
      pending?.();
    });
  }, [onDiscard, stop, animateExit]);

  const handleSend = useCallback(() => {
    // Não animamos saída no Enviar: a própria transição visual
    // "BORRADOR → ENVIANDO" (spinner + texto) já dá feedback, e remover o
    // banner agora deixaria o usuário sem pista de que o envio está em curso.
    // O banner só some naturalmente quando o envio completa com sucesso (o pai
    // limpa o draft e o `ChatAudioDraftBanner` é desmontado).
    stop();
    onSend();
  }, [onSend, stop]);

  if (lost) {
    return (
      <Animated.View style={style} pointerEvents="box-none">
        <ChatAudioDraftLostCard durationMs={durationMs} onDiscard={handleDiscard} />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={style} pointerEvents="box-none">
      <ChatAudioDraftCard
        durationMs={durationMs}
        currentTimeMs={currentTimeMs}
        isSubmitting={isSubmitting}
        isPlaying={isPlaying}
        canPlay={isLoaded && uri !== null}
        onTogglePlay={toggle}
        onSend={handleSend}
        onDiscard={handleDiscard}
      />
    </Animated.View>
  );
}
