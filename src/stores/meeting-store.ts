import * as meetingService from "@/services/meeting-service";
import * as sourceService from "@/services/source-service";
import type { MeetingResponse, MeetingSummaryResponse } from "@/types/meeting";
import type { SourceDetailResponse } from "@/types/source";
import { toErrorMessage } from "@/utils/to-error-message";
import { create } from "zustand";

type UploadStage = "uploading" | "processing" | "completed" | "failed";

const MAX_POLL_ATTEMPTS = 60;

function toSummary(meeting: MeetingResponse): MeetingSummaryResponse {
  return {
    meeting_id: meeting.meeting_id,
    user_id: meeting.user_id,
    title: meeting.title,
    status: meeting.status,
    processing_stage: meeting.processing_stage,
    processing_run_id: meeting.processing_run_id,
    duration_seconds: meeting.duration_seconds,
    updated_at: meeting.updated_at,
    error_message: meeting.error_message,
  };
}

function upsertMeetingSummary(
  meetings: MeetingSummaryResponse[],
  next: MeetingSummaryResponse,
): MeetingSummaryResponse[] {
  const index = meetings.findIndex((m) => m.meeting_id === next.meeting_id);
  if (index === -1) return [next, ...meetings];
  const copy = meetings.slice();
  copy[index] = next;
  return copy;
}

interface UploadProgress {
  meeting_id: string;
  stage: UploadStage;
  error?: string;
}

interface MeetingState {
  meetings: MeetingSummaryResponse[];
  activeMeeting: MeetingResponse | null;
  activeSource: SourceDetailResponse | null;
  isSourceLoading: boolean;
  uploadProgress: UploadProgress | null;
  isLoading: boolean;
  error: string | null;
  _activePoller: { stop: () => void } | null;

  fetchMeetings: (userId: string, limit?: number) => Promise<void>;
  getMeetingDetails: (meetingId: string) => Promise<void>;
  fetchSourceDetail: (sourceId: string) => Promise<void>;
  renameMeeting: (meetingId: string, title: string) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  startMeetingUpload: (
    userId: string,
    title: string,
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
  activeSource: null,
  isSourceLoading: false,
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
    const { activeMeeting } = get();
    const isDifferentMeeting = activeMeeting?.meeting_id !== meetingId;
    set({
      isLoading: true,
      error: null,
      ...(isDifferentMeeting ? { activeSource: null } : {}),
    });
    try {
      const meeting = await meetingService.getMeeting(meetingId);
      set({ activeMeeting: meeting, isLoading: false });
    } catch (err) {
      set({ error: toErrorMessage(err), isLoading: false });
    }
  },

  fetchSourceDetail: async (sourceId: string) => {
    set({ isSourceLoading: true });
    try {
      const source = await sourceService.getSourceDetail(sourceId);
      set({ activeSource: source, isSourceLoading: false });
    } catch (err) {
      set({ error: toErrorMessage(err), isSourceLoading: false });
    }
  },

  renameMeeting: async (meetingId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const { activeMeeting, meetings } = get();
    try {
      const updated = await meetingService.updateMeeting(meetingId, { title: trimmed });
      set({
        activeMeeting: activeMeeting?.meeting_id === meetingId ? updated : activeMeeting,
        meetings: meetings.map((m) =>
          m.meeting_id === meetingId ? { ...m, title: updated.title } : m,
        ),
      });
    } catch (err) {
      set({ error: toErrorMessage(err) });
      throw err;
    }
  },

  deleteMeeting: async (meetingId: string) => {
    const { activeMeeting, meetings, _activePoller } = get();
    try {
      await meetingService.deleteMeeting(meetingId);
      if (_activePoller && activeMeeting?.meeting_id === meetingId) {
        _activePoller.stop();
      }
      set({
        meetings: meetings.filter((m) => m.meeting_id !== meetingId),
        activeMeeting: activeMeeting?.meeting_id === meetingId ? null : activeMeeting,
        _activePoller:
          _activePoller && activeMeeting?.meeting_id === meetingId ? null : _activePoller,
      });
    } catch (err) {
      set({ error: toErrorMessage(err) });
      throw err;
    }
  },

  startMeetingUpload: async (
    userId: string,
    title: string,
    fileUri: string,
    fileName: string,
    contentType: string,
    sizeBytes: number,
    durationSeconds?: number,
  ) => {
    const currentUpload = get().uploadProgress;
    if (currentUpload?.stage === "uploading" || currentUpload?.stage === "processing") return;

    get()._activePoller?.stop();
    set({ _activePoller: null, error: null });

    try {
      const created = await meetingService.createMeeting({
        user_id: userId,
        title,
        file_name: fileName,
        content_type: contentType,
      });

      set((state) => ({
        uploadProgress: {
          meeting_id: created.meeting_id,
          stage: "uploading",
        },
        meetings: upsertMeetingSummary(state.meetings, {
          meeting_id: created.meeting_id,
          user_id: created.user_id,
          title: created.title,
          status: created.status,
          processing_stage: created.processing_stage,
          duration_seconds: durationSeconds ?? null,
          updated_at: created.updated_at,
        }),
      }));

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
          const summary = toSummary(meeting);
          set((state) => ({
            meetings: upsertMeetingSummary(state.meetings, summary),
          }));
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
      activeSource: null,
      isSourceLoading: false,
      uploadProgress: null,
      isLoading: false,
      error: null,
      _activePoller: null,
    });
  },
}));
