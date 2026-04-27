import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { ChatAudioDraftBanner } from "@/components/chat/chat-audio-draft-banner";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { EntityProposalStack } from "@/components/chat/entity-proposal/entity-proposal-stack";
import { KeyboardView } from "@/components/keyboard-view";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useChatAudioRecorder } from "@/hooks/use-chat-audio-recorder";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { useChatAudioDraftStore } from "@/stores/chat-audio-draft-store";
import { NEW_THREAD_DRAFT_KEY, useChatStore } from "@/stores/chat-store";
import { goBackOrHome } from "@/utils/navigation";
import { useNavigation } from "expo-router";

function extractInitial(displayName: string | null, email: string | null): string {
  const source = displayName ?? email;
  if (!source) return "?";
  return source[0].toUpperCase();
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const navigation = useNavigation();
  const [inputValue, setInputValue] = useState("");
  const [draftsHydrated, setDraftsHydrated] = useState(false);
  const [isSendingText, setIsSendingText] = useState(false);
  const [isSubmittingAudioDraft, setIsSubmittingAudioDraft] = useState(false);
  const [inputHeight, setInputHeight] = useState(0);
  const [proposalStackHeight, setProposalStackHeight] = useState(0);

  const handleInputLayout = useCallback((event: LayoutChangeEvent) => {
    setInputHeight(event.nativeEvent.layout.height);
  }, []);
  const isSendingTextRef = useRef(false);
  const isSubmittingAudioDraftRef = useRef(false);
  const isPersistingNavigationRef = useRef(false);

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
  const chatBusy = isStreaming || isSubmittingAudio || isSendingText || isSubmittingAudioDraft;
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
    async (draft: { uri: string; durationMs: number }) => {
      if (!user) return;

      await saveAudioDraft(user.userId, draftKey, {
        uri: draft.uri,
        durationMs: draft.durationMs,
        createdAt: new Date().toISOString(),
      });
    },
    [draftKey, saveAudioDraft, user],
  );

  const {
    audioState,
    elapsedMs,
    handleStartRecording: handleStartRecordingRaw,
    handleStopRecording,
    handleCancelRecording,
    persistRecordingDraft,
  } = useChatAudioRecorder({
    disabled: chatBusy,
    onSubmitAudio: handleSubmitAudio,
    onRecordingInterrupted: handleRecordingInterrupted,
  });

  const startFreshRecording = useCallback(async (): Promise<void> => {
    if (user && audioDraft) {
      await clearAudioDraft(user.userId, draftKey);
    }

    handleStartRecordingRaw();
  }, [audioDraft, clearAudioDraft, draftKey, handleStartRecordingRaw, user]);

  const handleStartRecording = useCallback((): void => {
    void startFreshRecording();
  }, [startFreshRecording]);

  const handleBack = useCallback((): void => {
    void (async () => {
      await persistRecordingDraft();
      goBackOrHome();
    })();
  }, [persistRecordingDraft]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (audioState !== "recording" || isPersistingNavigationRef.current) {
        return;
      }

      event.preventDefault();
      isPersistingNavigationRef.current = true;

      void persistRecordingDraft().finally(() => {
        isPersistingNavigationRef.current = false;
        navigation.dispatch(event.data.action);
      });
    });

    return unsubscribe;
  }, [audioState, navigation, persistRecordingDraft]);

  useEffect(() => {
    if (!user) return;
    fetchThreads(user.userId);
  }, [fetchThreads, user]);

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
  }, [activeThreadId, selectThread, threads]);

  useEffect(() => {
    return () => cancelStream();
  }, [cancelStream]);

  useEffect(() => {
    if (!draftsHydrated || !user) return;
    const stored = useChatStore.getState().getDraft(user.userId, draftKey);
    setInputValue(stored);
  }, [draftKey, draftsHydrated, user]);

  const handleChangeText = useCallback(
    (text: string) => {
      setInputValue(text);
      if (user) setDraft(user.userId, draftKey, text);
    },
    [draftKey, setDraft, user],
  );

  async function handleSend(): Promise<void> {
    const text = inputValue.trim();
    if (!text || !user) return;
    if (isSendingTextRef.current) return;
    if (useChatStore.getState().isStreaming || useChatStore.getState().isSubmittingAudio) return;

    isSendingTextRef.current = true;
    setIsSendingText(true);

    setInputValue("");
    clearDraft(user.userId, draftKey);

    try {
      const threadId = activeThreadId ?? (await createThread(user.userId));
      if (threadId !== draftKey) clearDraft(user.userId, draftKey);
      await sendMessage(threadId, text);
    } catch {
      setInputValue(text);
      if (user) setDraft(user.userId, draftKey, text);
    } finally {
      isSendingTextRef.current = false;
      setIsSendingText(false);
    }
  }

  const handleSendAudioDraft = useCallback(async (): Promise<void> => {
    if (!user || !audioDraft || audioDraft.lost) return;
    if (isSubmittingAudioDraftRef.current) return;
    if (useChatStore.getState().isSubmittingAudio) return;

    isSubmittingAudioDraftRef.current = true;
    setIsSubmittingAudioDraft(true);

    try {
      await handleSubmitAudio(audioDraft.uri);

      if (!useChatStore.getState().error) {
        await clearAudioDraft(user.userId, draftKey);
      }
    } finally {
      isSubmittingAudioDraftRef.current = false;
      setIsSubmittingAudioDraft(false);
    }
  }, [audioDraft, clearAudioDraft, draftKey, handleSubmitAudio, user]);

  const handleDiscardAudioDraft = useCallback((): void => {
    if (!user) return;
    void clearAudioDraft(user.userId, draftKey);
  }, [clearAudioDraft, draftKey, user]);

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
            onBack={handleBack}
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
              extraBottomReserve={proposalStackHeight}
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
              isSubmitting={isSubmittingAudio || isSubmittingAudioDraft}
              lost={audioDraft.lost ?? false}
            />
          ) : null}

          <EntityProposalStack bottomOffset={inputHeight} onHeightChange={setProposalStackHeight} />

          <View onLayout={handleInputLayout}>
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
              isSendingText={isSendingText}
            />
          </View>
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
