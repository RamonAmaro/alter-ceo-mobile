import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

import { getStrategyByReportType } from "./strategy-catalog";
import { StrategyHistoryItem, type HistoryItemStatus } from "./strategy-history-item";

import type { PendingStrategyRun } from "@/stores/strategies-store";
import type { ReportSummary } from "@/types/report";

interface StrategyHistoryListProps {
  hasPlan: boolean;
  planDate: string | null;
  reports: ReportSummary[];
  pendingRuns: PendingStrategyRun[];
  onOpenPlan: () => void;
  onOpenReport: (report: ReportSummary) => void;
}

interface HistoryRow {
  id: string;
  title: string;
  iconName: string;
  date: string;
  status: HistoryItemStatus;
  errorMessage?: string | null;
  onPress?: () => void;
}

function formatHistoryDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function StrategyHistoryList({
  hasPlan,
  planDate,
  reports,
  pendingRuns,
  onOpenPlan,
  onOpenReport,
}: StrategyHistoryListProps) {
  const rows: HistoryRow[] = [];

  if (hasPlan) {
    rows.push({
      id: "plan",
      title: "Plan de Duplicación",
      iconName: "rocket-outline",
      date: planDate ? formatHistoryDate(planDate) : "—",
      status: "completed",
      onPress: onOpenPlan,
    });
  }

  pendingRuns.forEach((run) => {
    const entry = getStrategyByReportType(run.reportType);
    rows.push({
      id: `pending:${run.runId}`,
      title: entry?.title ?? run.reportType,
      iconName: entry?.iconName ?? "hourglass-outline",
      date: formatHistoryDate(run.startedAt),
      status:
        run.status === "FAILED" ? "failed" : run.status === "QUEUED" ? "queued" : "processing",
      errorMessage: run.errorMessage,
    });
  });

  reports.forEach((report) => {
    const entry = getStrategyByReportType(report.report_type);
    rows.push({
      id: report.report_id,
      title: entry?.title ?? report.report_type,
      iconName: entry?.iconName ?? "document-text-outline",
      date: formatHistoryDate(report.created_at),
      status: "completed",
      onPress: () => onOpenReport(report),
    });
  });

  if (rows.length === 0) {
    return (
      <View style={styles.empty}>
        <LinearGradient
          colors={["rgba(0,255,132,0.06)", "rgba(255,255,255,0.01)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.emptyIconWrap}>
          <Ionicons name="trophy-outline" size={28} color={SemanticColors.success} />
        </View>
        <ThemedText style={styles.emptyTitle}>Aún no tienes estrategias</ThemedText>
        <ThemedText style={styles.emptyText}>
          Cuando crees una nueva estrategia desde el panel de control, aparecerá aquí en tu
          historial.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {rows.map((row) => (
        <StrategyHistoryItem
          key={row.id}
          title={row.title}
          iconName={row.iconName}
          date={row.date}
          status={row.status}
          errorMessage={row.errorMessage}
          onPress={row.onPress}
        />
      ))}
    </View>
  );
}

const emptyShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
  web: { boxShadow: "0 4px 14px rgba(0,0,0,0.16)" },
});

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    gap: Spacing.two,
    ...emptyShadow,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
    marginBottom: Spacing.one,
  },
  emptyTitle: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 15,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 17,
    color: SemanticColors.textMuted,
    textAlign: "center",
    maxWidth: 320,
  },
});
