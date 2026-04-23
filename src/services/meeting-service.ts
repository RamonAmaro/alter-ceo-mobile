import { del, get, patch, post } from "@/lib/api-client";
import { uploadFileToS3 } from "@/services/file-upload";
import { createPoller } from "@/utils/create-poller";
import { POLL_INTERVAL } from "@/constants/env";
import type {
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingProcessingAccepted,
  MeetingResponse,
  MeetingUpdateRequest,
  MeetingUploadCompletedRequest,
  UserMeetingsResponse,
} from "@/types/meeting";

export async function createMeeting(request: MeetingCreateRequest): Promise<MeetingCreateResponse> {
  return post<MeetingCreateResponse>("/meetings", request);
}

export async function getMeeting(meetingId: string): Promise<MeetingResponse> {
  return get<MeetingResponse>(`/meetings/${meetingId}`);
}

export async function listUserMeetings(
  userId: string,
  limit?: number,
): Promise<UserMeetingsResponse> {
  const params: Record<string, string> = {};
  if (limit != null) params.limit = String(limit);
  return get<UserMeetingsResponse>(`/users/${userId}/meetings`, params);
}

export async function completeUpload(
  meetingId: string,
  request: MeetingUploadCompletedRequest,
): Promise<MeetingProcessingAccepted> {
  return post<MeetingProcessingAccepted>(`/meetings/${meetingId}/upload-complete`, request);
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  return del(`/meetings/${meetingId}`);
}

export async function updateMeeting(
  meetingId: string,
  request: MeetingUpdateRequest,
): Promise<MeetingResponse> {
  return patch<MeetingResponse>(`/meetings/${meetingId}`, request);
}

export { uploadFileToS3 };

export function pollMeetingUntilDone(
  meetingId: string,
  maxAttempts: number,
  onMaxAttemptsReached: () => void,
  onUpdate: (meeting: MeetingResponse) => void,
  onError: (err: unknown) => void,
): { start: () => void; stop: () => void } {
  let attempts = 0;
  return createPoller<MeetingResponse>({
    fn: () => getMeeting(meetingId),
    interval: POLL_INTERVAL,
    shouldStop: (meeting) => {
      attempts += 1;
      if (meeting.status === "COMPLETED" || meeting.status === "FAILED") return true;
      if (attempts >= maxAttempts) {
        onMaxAttemptsReached();
        return true;
      }
      return false;
    },
    onUpdate,
    onError,
  });
}
