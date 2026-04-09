import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface RoleBarRowProps {
  label: string;
  current: number;
  target: number;
  maxValue: number;
}

function BarLine({
  value,
  maxValue,
  color,
  trackColor,
  valueLabel,
  rowLabel,
}: {
  value: number;
  maxValue: number;
  color: string;
  trackColor: string;
  valueLabel: string;
  rowLabel: string;
}) {
  const pct = Math.max((value / maxValue) * 100, 2);
  return (
    <View style={barStyles.row}>
      <ThemedText type="caption" style={barStyles.rowLabel}>
        {rowLabel}
      </ThemedText>
      <View style={[barStyles.track, { backgroundColor: trackColor }]}>
        <View style={[barStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <ThemedText type="caption" style={[barStyles.value, { color }]}>
        {valueLabel}
      </ThemedText>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  rowLabel: {
    width: 44,
    color: "rgba(255,255,255,0.35)",
    fontSize: 10,
    fontFamily: Fonts.montserratMedium,
    textAlign: "right",
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 99,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 99,
  },
  value: {
    width: 32,
    fontSize: 11,
    fontFamily: Fonts.montserratBold,
    textAlign: "right",
  },
});

export function RoleBarRow({ label, current, target, maxValue }: RoleBarRowProps) {
  return (
    <View style={styles.container}>
      <ThemedText type="caption" style={styles.label} numberOfLines={1}>
        {label}
      </ThemedText>
      <BarLine
        value={current}
        maxValue={maxValue}
        color={SemanticColors.iconMuted}
        trackColor="rgba(255,255,255,0.06)"
        valueLabel={`${current}h`}
        rowLabel="Hoy"
      />
      <BarLine
        value={target}
        maxValue={maxValue}
        color="rgba(0,255,132,0.7)"
        trackColor="rgba(0,255,132,0.06)"
        valueLabel={`${target}h`}
        rowLabel="Mes 12"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    color: SemanticColors.textSecondaryLight,
    fontSize: 12,
    fontFamily: Fonts.montserratSemiBold,
    marginBottom: 2,
  },
});
