import { create } from "zustand";
import type { MeetingResponse, MeetingSummaryResponse } from "@/types/meeting";
import * as meetingService from "@/services/meeting-service";
import { toErrorMessage } from "@/utils/to-error-message";

type UploadStage = "uploading" | "processing" | "completed" | "failed";

const MAX_POLL_ATTEMPTS = 60;

interface UploadProgress {
  meeting_id: string;
  stage: UploadStage;
  error?: string;
}

interface MeetingState {
  meetings: MeetingSummaryResponse[];
  activeMeeting: MeetingResponse | null;
  uploadProgress: UploadProgress | null;
  isLoading: boolean;
  error: string | null;
  _activePoller: { stop: () => void } | null;

  fetchMeetings: (userId: string, limit?: number) => Promise<void>;
  getMeetingDetails: (meetingId: string) => Promise<void>;
  startMeetingUpload: (
    userId: string,
    fileUri: string,
    fileName: string,
    contentType: string,
    sizeBytes: number,
    durationSeconds?: number,
  ) => Promise<void>;
  reset: () => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  activeMeeting: null,
  uploadProgress: null,
  isLoading: false,
  error: null,
  _activePoller: null,

  fetchMeetings: async (userId: string, limit?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await meetingService.listUserMeetings(userId, limit);
      set({ meetings: response.meetings ?? [], isLoading: false });
    } catch (err) {
      set({ error: toErrorMessage(err), isLoading: false });
    }
  },

  getMeetingDetails: async (meetingId: string) => {
    set({ isLoading: true, error: null });
    try {
      const meeting = await meetingService.getMeeting(meetingId);
      set({ activeMeeting: meeting, isLoading: false });
    } catch (err) {
      set({ error: toErrorMessage(err), isLoading: false });
    }
  },

  startMeetingUpload: async (
    userId: string,
    fileUri: string,
    fileName: string,
    contentType: string,
    sizeBytes: number,
    durationSeconds?: number,
  ) => {
    get()._activePoller?.stop();
    set({ _activePoller: null, error: null });

    try {
      const created = await meetingService.createMeeting({
        user_id: userId,
        file_name: fileName,
        content_type: contentType,
      });

      set({
        uploadProgress: {
          meeting_id: created.meeting_id,
          stage: "uploading",
        },
      });

      await meetingService.uploadFileToS3(created.upload, fileUri, contentType);

      set((state) => ({
        uploadProgress: state.uploadProgress
          ? { ...state.uploadProgress, stage: "processing" }
          : null,
      }));

      await meetingService.completeUpload(created.meeting_id, {
        audio_url: created.upload.audio_url,
        audio_bucket: created.upload.audio_bucket,
        audio_key: created.upload.audio_key,
        file_name: fileName,
        content_type: contentType,
        size_bytes: sizeBytes,
        duration_seconds: durationSeconds,
      });

      const poller = meetingService.pollMeetingUntilDone(
        created.meeting_id,
        MAX_POLL_ATTEMPTS,
        () => {
          set({
            _activePoller: null,
            uploadProgress: {
              meeting_id: created.meeting_id,
              stage: "failed",
              error: "Tiempo de procesamiento excedido",
            },
          });
        },
        (meeting) => {
          if (meeting.status === "COMPLETED" || meeting.status === "FAILED") {
            set({
              _activePoller: null,
              uploadProgress: {
                meeting_id: created.meeting_id,
                stage: meeting.status === "COMPLETED" ? "completed" : "failed",
                error: meeting.error_message ?? undefined,
              },
              activeMeeting: meeting,
            });
          }
        },
        (err) => {
          set({
            _activePoller: null,
            uploadProgress: {
              meeting_id: created.meeting_id,
              stage: "failed",
              error: toErrorMessage(err),
            },
          });
        },
      );

      set({ _activePoller: poller });
      poller.start();
    } catch (err) {
      set({
        uploadProgress: get().uploadProgress
          ? {
              meeting_id: get().uploadProgress!.meeting_id,
              stage: "failed",
              error: toErrorMessage(err),
            }
          : null,
        error: toErrorMessage(err),
      });
    }
  },

  reset: () => {
    get()._activePoller?.stop();
    set({
      meetings: [],
      activeMeeting: null,
      uploadProgress: null,
      isLoading: false,
      error: null,
      _activePoller: null,
    });
  },
}));
