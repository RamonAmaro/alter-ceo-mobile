import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PlanBusinessSummary } from "@/types/plan";
import { formatEur } from "@/utils/format-currency";
import { teamSizeLabel } from "@/utils/team-size-label";
import { StyleSheet, View } from "react-native";

interface BusinessSummaryProps {
  summary?: PlanBusinessSummary | null;
  introduction?: string;
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

function isMeaningful(value?: string | null): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lowered = trimmed.toLowerCase();
  if (lowered === "desconocido" || lowered === "sin negocio" || lowered === "n/a") return false;
  return true;
}

export function BusinessSummary({ summary, introduction }: BusinessSummaryProps) {
  const sector = summary?.sector;
  const products = summary?.productos_servicios_principales;
  const monthly = summary?.facturacion_mensual_aproximada;
  const annual = summary?.facturacion_anual_aproximada;
  const team = teamSizeLabel(summary?.team_size_range, summary?.numero_personas_equipo);
  const trimmedIntro = introduction?.trim();

  const metrics: MetricProps[] = [];
  if (isMeaningful(sector)) metrics.push({ caption: "Sector", value: sector.trim() });
  if (isMeaningful(products)) {
    metrics.push({ caption: "Producto o servicio", value: products.trim() });
  }
  if (typeof monthly === "number" && monthly > 0) {
    metrics.push({ caption: "Facturación mensual", value: formatEur(monthly) });
  }
  if (typeof annual === "number" && annual > 0) {
    metrics.push({ caption: "Facturación anual", value: formatEur(annual) });
  }
  if (isMeaningful(team)) metrics.push({ caption: "Equipo", value: team });

  if (!trimmedIntro && metrics.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="RESUMEN · DEL NEGOCIO" title="Tu negocio hoy" />

      {trimmedIntro ? <ThemedText style={styles.intro}>{trimmedIntro}</ThemedText> : null}

      {metrics.length > 0 ? (
        <View style={styles.grid}>
          {metrics.map((m) => (
            <Metric key={m.caption} caption={m.caption} value={m.value} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  intro: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textSecondaryLight,
    paddingHorizontal: Spacing.one,
  },
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
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.45)",
  },
  metricValue: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
});
