import { SectionHeader } from "@/components/my-plan/section-header";
import {
  StatusRing,
  statusToColor,
  statusToDisplayLabel,
  statusToValue,
} from "@/components/my-plan/status-ring";
import { ThemedText } from "@/components/themed-text";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import type { PlanFinancialState } from "@/types/plan";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

interface DiagnosisSectionProps {
  introduction: string;
  financialState?: PlanFinancialState;
  founderDependency?: string;
  acquisitionSystem?: string;
}

export function DiagnosisSection({
  introduction,
  financialState,
  founderDependency,
  acquisitionSystem,
}: DiagnosisSectionProps) {
  const { isMobile } = useResponsiveLayout();

  const rings = [
    financialState?.rentabilidad && {
      label: financialState.rentabilidad,
      caption: "Rentabilidad",
    },
    financialState?.liquidez && { label: financialState.liquidez, caption: "Liquidez" },
    financialState?.kpis && { label: financialState.kpis, caption: "KPIs" },
    financialState?.planificacion && {
      label: financialState.planificacion,
      caption: "Planificación",
    },
    founderDependency && { label: founderDependency, caption: "Dependencia" },
    acquisitionSystem && { label: acquisitionSystem, caption: "Captación" },
  ].filter(Boolean) as { label: string; caption: string }[];

  const ringSize = isMobile ? 70 : 82;

  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="ESTADO · ACTUAL" title="Diagnóstico" accent="del negocio" />

      <ThemedText style={styles.intro}>{introduction}</ThemedText>

      {rings.length > 0 && (
        <View style={styles.ringCard}>
          <LinearGradient
            colors={["rgba(0,255,132,0.05)", "rgba(255,255,255,0.01)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <MonumentalIndex label="DX" size={160} opacity={0.04} right={-20} bottom={-32} />

          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowBar} />
            <ThemedText style={styles.eyebrowText}>INDICADORES · {rings.length}</ThemedText>
          </View>

          <View style={styles.ringGrid}>
            {rings.map((r, i) => (
              <View
                key={`${r.caption}-${i}`}
                style={[styles.ringCell, isMobile ? styles.ringCellMobile : styles.ringCellDesktop]}
              >
                <StatusRing
                  size={ringSize}
                  value={statusToValue(r.label)}
                  color={statusToColor(r.label)}
                  label={statusToDisplayLabel(r.label)}
                  caption={r.caption}
                />
              </View>
            ))}
          </View>
        </View>
      )}
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
  },
  ringCard: {
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 22,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    gap: Spacing.three,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  eyebrowBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  eyebrowText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.2,
  },
  ringGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: Spacing.four,
    columnGap: 0,
    justifyContent: "flex-start",
  },
  ringCell: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringCellMobile: {
    flexBasis: "33.333%",
  },
  ringCellDesktop: {
    flexBasis: "16.66%",
  },
});
