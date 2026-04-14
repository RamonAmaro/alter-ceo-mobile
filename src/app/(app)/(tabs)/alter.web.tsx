import { AppBackground } from "@/components/app-background";
import { ResponsiveContainer } from "@/components/responsive-container";
import { Spacing } from "@/constants/theme";
import { ScrollView, StyleSheet, View } from "react-native";

import { BrainCard } from "@/components/home/brain-card";
import { ChatInputBar } from "@/components/home/chat-input-bar";
import { HomeHeader } from "@/components/home/home-header";
import { MachinesCard } from "@/components/home/machines-card";
import { MeetingSection } from "@/components/home/meeting-section";
import { ProfitabilityColumn } from "@/components/home/profitability-column";

export default function AlterScreen() {
  return (
    <AppBackground>
      <ResponsiveContainer maxWidth={900}>
        <View style={styles.container}>
          <HomeHeader />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>

          <ChatInputBar />
        </View>
      </ResponsiveContainer>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  topRow: {
    flexDirection: "row",
    gap: Spacing.three,
    minHeight: 160,
  },
  machinesWrap: {
    minHeight: 280,
  },
  meetingWrap: {
    minHeight: 200,
  },
});
