import { AppBackground } from "@/components/app-background";
import { Spacing } from "@/constants/theme";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrainCard } from "@/components/home/brain-card";
import { ChatInputBar } from "@/components/home/chat-input-bar";
import { HomeHeader } from "@/components/home/home-header";
import { MachinesCard } from "@/components/home/machines-card";
import { MeetingSection } from "@/components/home/meeting-section";
import { ProfitabilityColumn } from "@/components/home/profitability-column";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View
        style={[styles.container, { paddingTop: insets.top + Spacing.two }]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <HomeHeader />

          <View style={styles.topRow}>
            <BrainCard />
            <ProfitabilityColumn />
          </View>

          <MachinesCard />
          <MeetingSection />
        </ScrollView>

        <ChatInputBar />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: "row",
    gap: Spacing.three,
  },
});
