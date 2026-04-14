import { useLocalSearchParams } from "expo-router";

import { AppBackground } from "@/components/app-background";
import { MeetingDetailContent } from "@/components/meeting/meeting-detail-content";

export default function MeetingDetailScreen() {
  const { meetingId } = useLocalSearchParams<{ meetingId: string }>();

  return (
    <AppBackground>
      <MeetingDetailContent meetingId={meetingId ?? ""} />
    </AppBackground>
  );
}
