import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import {
  ROLE_SNAPSHOT_HIGH_KEYS,
  ROLE_SNAPSHOT_LOW_KEYS,
  type PlanRoleEvolution,
  type RoleSnapshot,
} from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface RoleEvolutionChartsProps {
  evolution: PlanRoleEvolution;
}

interface SnapshotEntry {
  readonly key: keyof PlanRoleEvolution;
  readonly title: string;
  readonly snapshot: RoleSnapshot;
}

const COLORS = {
  low: "#FF4444",
  high: SemanticColors.success,
  trackLow: "rgba(255,68,68,0.12)",
  trackHigh: "rgba(0,255,132,0.12)",
} as const;

function sumKeys(snapshot: RoleSnapshot, keys: readonly (keyof RoleSnapshot)[]): number {
  return keys.reduce((acc, key) => acc + (snapshot[key] ?? 0), 0);
}

function StackedBar({ low, high }: { low: number; high: number }) {
  const total = Math.max(low + high, 1);
  const lowPct = (low / total) * 100;
  const highPct = (high / total) * 100;
  return (
    <View style={styles.barRow}>
      <View style={styles.barTrack}>
        <View style={[styles.barLow, { width: `${lowPct}%` }]} />
        <View style={[styles.barHigh, { width: `${highPct}%` }]} />
      </View>
      <View style={styles.barLabels}>
        <ThemedText type="caption" style={[styles.barValue, { color: COLORS.low }]}>
          {Math.round(low)}%
        </ThemedText>
        <ThemedText type="caption" style={[styles.barValue, { color: COLORS.high }]}>
          {Math.round(high)}%
        </ThemedText>
      </View>
    </View>
  );
}

function SnapshotCard({ title, snapshot }: { title: string; snapshot: RoleSnapshot }) {
  const lowTotal = sumKeys(snapshot, ROLE_SNAPSHOT_LOW_KEYS);
  const highTotal = sumKeys(snapshot, ROLE_SNAPSHOT_HIGH_KEYS);

  return (
    <View style={styles.card}>
      <ThemedText style={styles.cardTitle}>{title}</ThemedText>
      <StackedBar low={lowTotal} high={highTotal} />
    </View>
  );
}

export function RoleEvolutionCharts({ evolution }: RoleEvolutionChartsProps) {
  const entries: SnapshotEntry[] = [];
  if (evolution.situacion_actual) {
    entries.push({
      key: "situacion_actual",
      title: "Situación actual",
      snapshot: evolution.situacion_actual,
    });
  }
  if (evolution.mes_4) {
    entries.push({ key: "mes_4", title: "Mes 4", snapshot: evolution.mes_4 });
  }
  if (evolution.mes_8) {
    entries.push({ key: "mes_8", title: "Mes 8", snapshot: evolution.mes_8 });
  }
  if (evolution.mes_12) {
    entries.push({ key: "mes_12", title: "Mes 12", snapshot: evolution.mes_12 });
  }

  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.low }]} />
          <ThemedText style={styles.legendText}>Gestión poco efectiva</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.high }]} />
          <ThemedText style={styles.legendText}>Gestión profesional</ThemedText>
        </View>
      </View>

      {entries.map((entry) => (
        <SnapshotCard key={entry.key} title={entry.title} snapshot={entry.snapshot} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
    marginBottom: Spacing.one,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textSecondaryLight,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: Spacing.two,
  },
  cardTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    lineHeight: 16,
    color: SemanticColors.textPrimary,
    letterSpacing: 0.6,
  },
  barRow: {
    gap: Spacing.one,
  },
  barTrack: {
    height: 14,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
    flexDirection: "row",
  },
  barLow: {
    height: "100%",
    backgroundColor: COLORS.low,
  },
  barHigh: {
    height: "100%",
    backgroundColor: COLORS.high,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barValue: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
  },
});
