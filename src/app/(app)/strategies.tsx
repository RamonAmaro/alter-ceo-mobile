import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { StrategiesIntroBlock } from "@/components/strategies/strategies-intro-block";
import { StrategyHistoryList } from "@/components/strategies/strategy-history-list";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { usePlanStore } from "@/stores/plan-store";
import { useStrategiesStore } from "@/stores/strategies-store";
import type { ReportSummary } from "@/types/report";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const POLL_INTERVAL_MS = 4000;

export default function StrategiesScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const userId = useAuthStore((s) => s.user?.userId);

  const latestPlan = usePlanStore((s) => s.latestPlan);
  const fetchLatestPlan = usePlanStore((s) => s.fetchLatestPlan);

  const reports = useStrategiesStore((s) => s.reports);
  const pendingRuns = useStrategiesStore((s) => s.pendingRuns);
  const isLoading = useStrategiesStore((s) => s.isLoading);
  const isLoadingMore = useStrategiesStore((s) => s.isLoadingMore);
  const nextCursor = useStrategiesStore((s) => s.nextCursor);
  const error = useStrategiesStore((s) => s.error);
  const fetchReports = useStrategiesStore((s) => s.fetchReports);
  const fetchMoreReports = useStrategiesStore((s) => s.fetchMoreReports);
  const refreshPendingRuns = useStrategiesStore((s) => s.refreshPendingRuns);
  const hydratePendingRuns = useStrategiesStore((s) => s.hydratePendingRuns);

  useEffect(() => {
    if (!userId) return;
    void hydratePendingRuns(userId);
  }, [userId, hydratePendingRuns]);

  useEffect(() => {
    if (!userId) return;
    void fetchReports();
    if (!latestPlan) void fetchLatestPlan(userId);
  }, [userId, latestPlan, fetchReports, fetchLatestPlan]);

  useEffect(() => {
    if (pendingRuns.length === 0) return;
    void refreshPendingRuns();
    const id = setInterval(() => {
      void refreshPendingRuns();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [pendingRuns.length, refreshPendingRuns]);

  function handleOpenPlan(): void {
    router.push("/(app)/plan-detail");
  }

  function handleOpenReport(report: ReportSummary): void {
    router.push({
      pathname: "/(app)/strategy-detail/[reportId]",
      params: { reportId: report.report_id },
    });
  }

  function handleCreateStrategy(): void {
    router.push("/(app)/strategy");
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>): void {
    if (!nextCursor || isLoadingMore) return;
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const distanceFromEnd = contentSize.height - (layoutMeasurement.height + contentOffset.y);
    if (distanceFromEnd < 200) {
      void fetchMoreReports();
    }
  }

  const showInitialLoader =
    isLoading && reports.length === 0 && !latestPlan && pendingRuns.length === 0;

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="trophy"
          titlePrefix="Estrategias"
          titleAccent="activas"
          showBack={isMobile}
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          onScroll={handleScroll}
          scrollEventThrottle={200}
        >
          <StrategiesIntroBlock onCreatePress={handleCreateStrategy} />

          {showInitialLoader ? (
            <View style={styles.centered}>
              <ActivityIndicator color={SemanticColors.success} size="large" />
            </View>
          ) : (
            <StrategyHistoryList
              hasPlan={Boolean(latestPlan)}
              planDate={latestPlan?.created_at ?? null}
              reports={reports}
              pendingRuns={pendingRuns}
              onOpenPlan={handleOpenPlan}
              onOpenReport={handleOpenReport}
            />
          )}

          {isLoadingMore ? (
            <View style={styles.loadMoreFooter}>
              <ActivityIndicator color={SemanticColors.success} size="small" />
            </View>
          ) : null}

          {error && reports.length === 0 ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : null}
        </ScrollView>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.six,
  },
  loadMoreFooter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.three,
  },
  errorText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.error,
    textAlign: "center",
    marginTop: Spacing.two,
  },
});
