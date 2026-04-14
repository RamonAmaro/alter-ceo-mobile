import { useLocalSearchParams } from "expo-router";

import { MeetingDetailContent } from "@/components/meeting/meeting-detail-content";

export default function MeetingDetailScreen() {
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();

  return <MeetingDetailContent meetingId={meetingId ?? ""} />;
}
