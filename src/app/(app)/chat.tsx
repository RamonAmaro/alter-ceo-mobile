import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { ChatAudioDraftBanner } from "@/components/chat/chat-audio-draft-banner";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { KeyboardView } from "@/components/keyboard-view";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useChatAudioRecorder } from "@/hooks/use-chat-audio-recorder";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useChatAudioDraftStore } from "@/stores/chat-audio-draft-store";
import { NEW_THREAD_DRAFT_KEY, useChatStore } from "@/stores/chat-store";

function extractInitial(displayName: string | null, email: string | null): string {
  const source = displayName ?? email;
  if (!source) return "?";
  return source[0].toUpperCase();
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const [inputValue, setInputValue] = useState("");
  const [draftsHydrated, setDraftsHydrated] = useState(false);

  const user = useAuthStore((s) => s.user);
  const userInitial = useMemo(
    () => extractInitial(user?.displayName ?? null, user?.email ?? null),
    [user?.displayName, user?.email],
  );
  const messages = useChatStore((s) => s.messages);
  const threads = useChatStore((s) => s.threads);
  const activeThreadId = useChatStore((s) => s.activeThreadId);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isSubmittingAudio = useChatStore((s) => s.isSubmittingAudio);
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages);
  const error = useChatStore((s) => s.error);
  const failedMessageId = useChatStore((s) => s.failedMessageId);

  const fetchThreads = useChatStore((s) => s.fetchThreads);
  const createThread = useChatStore((s) => s.createThread);
  const selectThread = useChatStore((s) => s.selectThread);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const sendAudioMessage = useChatStore((s) => s.sendAudioMessage);
  const retryMessage = useChatStore((s) => s.retryMessage);
  const cancelStream = useChatStore((s) => s.cancelStream);
  const loadDrafts = useChatStore((s) => s.loadDrafts);
  const setDraft = useChatStore((s) => s.setDraft);
  const clearDraft = useChatStore((s) => s.clearDraft);

  const audioDraftsHydrated = useChatAudioDraftStore((s) => s.hydrated);
  const loadAudioDrafts = useChatAudioDraftStore((s) => s.loadDrafts);
  const saveAudioDraft = useChatAudioDraftStore((s) => s.saveDraft);
  const clearAudioDraft = useChatAudioDraftStore((s) => s.clearDraft);
  const audioDraftsByUser = useChatAudioDraftStore((s) => s.drafts);

  const draftKey = activeThreadId ?? NEW_THREAD_DRAFT_KEY;

  const chatBusy = isStreaming || isSubmittingAudio;

  const audioDraft = user ? (audioDraftsByUser[user.userId]?.[draftKey] ?? null) : null;

  const handleSubmitAudio = useCallback(
    async (uri: string): Promise<void> => {
      if (!user) return;
      const threadId = activeThreadId ?? (await createThread(user.userId));
      await sendAudioMessage(threadId, uri);
    },
    [activeThreadId, createThread, sendAudioMessage, user],
  );

  const handleRecordingInterrupted = useCallback(
    (draft: { uri: string; durationMs: number }) => {
      if (!user) return;
      // Snapshot do draftKey no momento da interrupção. Usar closure do React é
      // seguro aqui porque o componente é desmontado em seguida e o valor
      // capturado era o corrente.
      void saveAudioDraft(user.userId, draftKey, {
        uri: draft.uri,
        durationMs: draft.durationMs,
        createdAt: new Date().toISOString(),
      });
    },
    [user, draftKey, saveAudioDraft],
  );

  const {
    audioState,
    elapsedMs,
    handleStartRecording: handleStartRecordingRaw,
    handleStopRecording,
    handleCancelRecording,
  } = useChatAudioRecorder({
    disabled: chatBusy,
    onSubmitAudio: handleSubmitAudio,
    onRecordingInterrupted: handleRecordingInterrupted,
  });

  const handleStartRecording = useCallback((): void => {
    // Se há draft antigo e o usuário decide gravar algo novo, ele está
    // efetivamente abandonando o draft. Limpar antes evita que, ao terminar,
    // o banner reapareça oferecendo o audio antigo.
    if (user && audioDraft) {
      void clearAudioDraft(user.userId, draftKey);
    }
    handleStartRecordingRaw();
  }, [user, audioDraft, draftKey, clearAudioDraft, handleStartRecordingRaw]);

  useEffect(() => {
    if (!user) return;
    fetchThreads(user.userId);
  }, [user, fetchThreads]);

  useEffect(() => {
    void loadDrafts().finally(() => setDraftsHydrated(true));
  }, [loadDrafts]);

  useEffect(() => {
    if (!audioDraftsHydrated) {
      void loadAudioDrafts();
    }
  }, [audioDraftsHydrated, loadAudioDrafts]);

  useEffect(() => {
    if (threads.length > 0 && !activeThreadId) {
      selectThread(threads[0].thread_id);
    }
  }, [threads, activeThreadId, selectThread]);

  useEffect(() => {
    return () => cancelStream();
  }, [cancelStream]);

  useEffect(() => {
    if (!draftsHydrated || !user) return;
    const stored = useChatStore.getState().getDraft(user.userId, draftKey);
    setInputValue(stored);
  }, [draftsHydrated, user, draftKey]);

  const handleChangeText = useCallback(
    (text: string) => {
      setInputValue(text);
      if (user) setDraft(user.userId, draftKey, text);
    },
    [user, draftKey, setDraft],
  );

  async function handleSend(): Promise<void> {
    const text = inputValue.trim();
    if (!text || !user) return;
    setInputValue("");
    clearDraft(user.userId, draftKey);

    try {
      const threadId = activeThreadId ?? (await createThread(user.userId));
      // Move draft from "__new__" bucket to the real threadId once the thread exists.
      if (threadId !== draftKey) clearDraft(user.userId, draftKey);
      await sendMessage(threadId, text);
    } catch {
      setInputValue(text);
      if (user) setDraft(user.userId, draftKey, text);
    }
  }

  const handleSendAudioDraft = useCallback(async (): Promise<void> => {
    if (!user || !audioDraft) return;
    // Draft marcado como perdido não tem bytes no IndexedDB (ou é blob legado).
    // Tentar enviar falharia com mensagem de erro; melhor bloquear de vez.
    if (audioDraft.lost) return;
    // Guard contra double-tap: `disabled` em TouchableOpacity não bloqueia
    // cliques rápidos de forma confiável, então checamos explicitamente se já
    // há um envio em andamento para evitar disparar `createAudioTurn` duas
    // vezes com o mesmo arquivo (criaria mensagens duplicadas no backend).
    if (useChatStore.getState().isSubmittingAudio) return;
    const uri = audioDraft.uri;
    await handleSubmitAudio(uri);
    // `sendAudioMessage` não re-throw: trata o erro internamente e grava em
    // `chat-store.error`. Checamos aqui se o envio deu certo antes de apagar
    // o draft. Se falhou, o banner continua visível e o usuário pode tentar
    // novamente ou descartar manualmente — áudio nunca se perde sem intenção.
    //
    // Edge case: o stream SSE pode ter setado `error` entre o await retornar e
    // esta leitura. Nesse caso tratamos como falha (conservador: mantemos o
    // draft), mesmo que o backend já tenha o áudio. Preferir não perder
    // audio > preferir não mostrar banner redundante.
    const submitError = useChatStore.getState().error;
    if (!submitError) {
      await clearAudioDraft(user.userId, draftKey);
    }
  }, [user, audioDraft, draftKey, clearAudioDraft, handleSubmitAudio]);

  const handleDiscardAudioDraft = useCallback((): void => {
    if (!user) return;
    void clearAudioDraft(user.userId, draftKey);
  }, [user, draftKey, clearAudioDraft]);

  return (
    <AppBackground style={{ paddingBottom: insets.bottom }}>
      <KeyboardView>
        <View style={styles.flex}>
          <ScreenHeader
            topInset={insets.top}
            useLogoIcon
            titlePrefix="El Cerebro"
            titleAccent="ALTER CEO"
            showBack={isMobile}
          />

          {isLoadingMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={SemanticColors.success} />
            </View>
          ) : (
            <ChatMessageList
              messages={messages}
              isStreaming={isStreaming}
              userInitial={userInitial}
              failedMessageId={failedMessageId}
              onRetry={retryMessage}
            />
          )}

          {error != null && (
            <ThemedText type="bodySm" style={styles.errorText}>
              {error}
            </ThemedText>
          )}

          {audioDraft && audioState === "idle" && !isStreaming ? (
            <ChatAudioDraftBanner
              uri={audioDraft.lost ? null : audioDraft.uri}
              durationMs={audioDraft.durationMs}
              onSend={handleSendAudioDraft}
              onDiscard={handleDiscardAudioDraft}
              isSubmitting={isSubmittingAudio}
              lost={audioDraft.lost ?? false}
            />
          ) : null}

          <ChatInput
            value={inputValue}
            onChangeText={handleChangeText}
            onSend={handleSend}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onCancelRecording={handleCancelRecording}
            audioState={audioState}
            audioElapsedMs={elapsedMs}
            disabled={chatBusy}
          />
        </View>
      </KeyboardView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.one,
  },
});
