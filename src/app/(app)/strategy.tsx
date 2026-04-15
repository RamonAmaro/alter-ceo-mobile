import { AppBackground } from "@/components/app-background";
import { ResponsiveContainer } from "@/components/responsive-container";
import { StrategyHeader } from "@/components/strategy/strategy-header";
import { StrategyTopicSelector } from "@/components/strategy/strategy-topic-selector";
import { Spacing } from "@/constants/theme";
import { useStrategyReportStore } from "@/stores/strategy-report-store";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StrategyScreen() {
  const insets = useSafeAreaInsets();
  const beginDraft = useStrategyReportStore((s) => s.beginDraft);

  function handleSelectTopic(topic: string): void {
    if (topic !== "captacion") return;
    beginDraft("captacion_5_fases");
    router.push("/(app)/strategy-captacion");
  }

  return (
    <AppBackground>
      <ResponsiveContainer maxWidth={900}>
        <View style={styles.container}>
          <StrategyHeader topInset={insets.top} />

          <View style={[styles.body, { paddingBottom: insets.bottom || Spacing.three }]}>
            <StrategyTopicSelector onSelect={handleSelectTopic} />
          </View>
        </View>
      </ResponsiveContainer>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    justifyContent: "center",
  },
});
