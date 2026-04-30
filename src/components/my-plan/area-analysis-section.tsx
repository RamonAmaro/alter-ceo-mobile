import { AreaAnalysisCard } from "@/components/my-plan/area-analysis-card";
import { SectionHeader } from "@/components/my-plan/section-header";
import { Spacing } from "@/constants/theme";
import type { PlanAreaAnalysis } from "@/types/plan";
import { StyleSheet, View } from "react-native";

const AREA_CONFIG: { key: keyof PlanAreaAnalysis; label: string }[] = [
  { key: "personalidad_negocio", label: "Personalidad del negocio" },
  { key: "propuesta_valor", label: "Propuesta de valor" },
  { key: "perfil_cliente_actual", label: "Perfil de cliente actual" },
  { key: "sistema_comercial_detectado", label: "Sistema comercial" },
  { key: "dependencia_fundador", label: "Dependencia del fundador" },
  { key: "nivel_liderazgo", label: "Nivel de liderazgo" },
  { key: "operativa_diaria", label: "Operativa diaria" },
];

interface AreaAnalysisSectionProps {
  areas: PlanAreaAnalysis;
}

export function AreaAnalysisSection({ areas }: AreaAnalysisSectionProps) {
  const items = AREA_CONFIG.map(({ key, label }) => {
    const raw = areas[key];
    const value = raw?.trim();
    return value ? { key, label, value } : null;
  }).filter(
    (item): item is { key: keyof PlanAreaAnalysis; label: string; value: string } => item !== null,
  );

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="CARTOGRAFÍA · ÁREAS" title="Análisis por áreas" />

      <View style={styles.list}>
        {items.map(({ key, label, value }) => (
          <AreaAnalysisCard key={key} label={label} value={value} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
});
