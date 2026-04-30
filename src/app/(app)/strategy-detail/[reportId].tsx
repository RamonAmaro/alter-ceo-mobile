import { AppBackground } from "@/components/app-background";
import { ResponsiveContainer } from "@/components/responsive-container";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { getReportById } from "@/services/report-service";
import type { Captacion5FasesReport, ReportRecord, ValueIdeasReport } from "@/types/report";
import { toErrorMessage } from "@/utils/to-error-message";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  renderCaptacionReport,
  renderGenericReport,
  renderValueIdeasReport,
} from "../strategy-questionnaire-result";

export default function StrategyDetailScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const { reportId } = useLocalSearchParams<{ reportId: string }>();

  const [record, setRecord] = useState<ReportRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    getReportById(reportId)
      .then((res) => {
        if (cancelled) return;
        setRecord(res);
        setIsLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(toErrorMessage(err));
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reportId]);

  return (
    <AppBackground>
      <ResponsiveContainer maxWidth={1100}>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            icon="bar-chart"
            titlePrefix="Informe"
            titleAccent="estrategia"
            showBack={isMobile}
          />

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + Spacing.five },
            ]}
            showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          >
            {isLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator color={SemanticColors.success} size="large" />
              </View>
            ) : error ? (
              <View style={styles.centered}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : record ? (
              renderRecord(record, isMobile)
            ) : null}
          </ScrollView>
        </View>
      </ResponsiveContainer>
    </AppBackground>
  );
}

function renderRecord(record: ReportRecord, isMobile: boolean) {
  if (record.report_type === "captacion_5_fases") {
    return renderCaptacionReport(record.report as unknown as Captacion5FasesReport, isMobile);
  }
  if (record.report_type === "value_ideas") {
    return renderValueIdeasReport(record.report as unknown as ValueIdeasReport);
  }
  return renderGenericReport(record.report);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  centered: {
    paddingVertical: Spacing.six,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    color: SemanticColors.error,
    textAlign: "center",
  },
});
