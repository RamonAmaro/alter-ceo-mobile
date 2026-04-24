import { useLocalSearchParams } from "expo-router";

import { AppBackground } from "@/components/app-background";
import { SourceDetailContent } from "@/components/sources/source-detail-content";

export default function SourceDetailScreen() {
  const { sourceId } = useLocalSearchParams<{ sourceId: string }>();

  return (
    <AppBackground>
      <SourceDetailContent sourceId={sourceId ?? ""} />
    </AppBackground>
  );
}
