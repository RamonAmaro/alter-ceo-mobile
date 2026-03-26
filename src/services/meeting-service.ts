import { get, post, putExternal } from "@/lib/api-client";
import type {
  MeetingCreateRequest,
  MeetingCreateResponse,
  MeetingDirectUploadPayload,
  MeetingProcessingAccepted,
  MeetingResponse,
  MeetingUploadCompletedRequest,
  UserMeetingsResponse,
} from "@/types/meeting";
import {
  EncodingType,
  getInfoAsync,
  readAsStringAsync,
} from "expo-file-system/legacy";

export async function createMeeting(
  request: MeetingCreateRequest,
): Promise<MeetingCreateResponse> {
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
  return post<MeetingProcessingAccepted>(
    `/meetings/${meetingId}/upload-complete`,
    request,
  );
}

export async function uploadFileToS3(
  upload: MeetingDirectUploadPayload,
  fileUri: string,
  contentType: string,
): Promise<void> {
  const fileInfo = await getInfoAsync(fileUri);
  if (!fileInfo.exists) {
    throw new Error(`File not found: ${fileUri}`);
  }

  const base64 = await readAsStringAsync(fileUri, {
    encoding: EncodingType.Base64,
  });

  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    ...upload.headers,
  };

  await putExternal(upload.upload_url, bytes.buffer as ArrayBuffer, headers);
}
