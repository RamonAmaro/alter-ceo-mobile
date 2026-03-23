import { AppBackground } from "@/components/app-background";
import { Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrainCard } from "@/components/home/brain-card";
import { ChatInputBar } from "@/components/home/chat-input-bar";
import { HomeHeader } from "@/components/home/home-header";
import { MachinesCard } from "@/components/home/machines-card";
import { MeetingSection } from "@/components/home/meeting-section";
import { ProfitabilityColumn } from "@/components/home/profitability-column";

export default function AlterScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + Spacing.three },
        ]}
      >
        <HomeHeader />

        <View style={styles.cardsArea}>
          <View style={styles.topRow}>
            <BrainCard />
            <ProfitabilityColumn />
          </View>

          <View style={styles.machinesWrap}>
            <MachinesCard />
          </View>

          <View style={styles.meetingWrap}>
            <MeetingSection />
          </View>
        </View>

        <ChatInputBar />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  cardsArea: {
    flex: 1,
    gap: Spacing.three,
  },
  topRow: {
    flex: 3,
    flexDirection: "row",
    gap: Spacing.three,
  },
  machinesWrap: {
    flex: 4,
  },
  meetingWrap: {
    flex: 3,
  },
});
