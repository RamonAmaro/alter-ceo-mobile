import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PlanBusinessSummary } from "@/types/plan";
import { formatEur } from "@/utils/format-currency";
import { teamSizeLabel } from "@/utils/team-size-label";
import { StyleSheet, View } from "react-native";

interface BusinessSummaryProps {
  summary?: PlanBusinessSummary | null;
}

interface MetricProps {
  caption: string;
  value: string;
}

function Metric({ caption, value }: MetricProps) {
  return (
    <View style={styles.metric}>
      <ThemedText style={styles.metricCaption}>{caption}</ThemedText>
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
    </View>
  );
}

function hasText(value?: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function BusinessSummary({ summary }: BusinessSummaryProps) {
  const sector = summary?.sector;
  const products = summary?.productos_servicios_principales;
  const monthly = summary?.facturacion_mensual_aproximada;
  const annual = summary?.facturacion_anual_aproximada;
  const team = teamSizeLabel(summary?.team_size_range, summary?.numero_personas_equipo);

  const metrics: MetricProps[] = [];
  if (hasText(sector)) metrics.push({ caption: "Sector", value: sector.trim() });
  if (hasText(products)) {
    metrics.push({ caption: "Producto o servicio", value: products.trim() });
  }
  if (typeof monthly === "number") {
    metrics.push({ caption: "Facturación mensual", value: formatEur(monthly) });
  }
  if (typeof annual === "number") {
    metrics.push({ caption: "Facturación anual", value: formatEur(annual) });
  }
  if (hasText(team)) metrics.push({ caption: "Equipo", value: team });

  if (metrics.length === 0) return null;

  return (
    <View style={styles.grid}>
      {metrics.map((m) => (
        <Metric key={m.caption} caption={m.caption} value={m.value} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  metric: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 4,
  },
  metricCaption: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
  metricValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.65)",
  },
});
