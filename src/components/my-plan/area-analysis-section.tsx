import { AreaAnalysisCard } from "@/components/my-plan/area-analysis-card";
import { SectionHeader } from "@/components/my-plan/section-header";
import { Spacing } from "@/constants/theme";
import type { Ionicons } from "@expo/vector-icons";
import type { PlanAreaAnalysis } from "@/types/plan";
import { StyleSheet, View } from "react-native";

const AREA_CONFIG: {
  key: keyof PlanAreaAnalysis;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "personalidad_negocio", label: "Personalidad del negocio", icon: "business-outline" },
  { key: "propuesta_valor", label: "Propuesta de valor", icon: "diamond-outline" },
  { key: "perfil_cliente_actual", label: "Perfil de cliente actual", icon: "people-outline" },
  {
    key: "sistema_comercial_detectado",
    label: "Sistema comercial",
    icon: "cart-outline",
  },
  { key: "dependencia_fundador", label: "Dependencia del fundador", icon: "person-outline" },
  { key: "nivel_liderazgo", label: "Nivel de liderazgo", icon: "flag-outline" },
  { key: "operativa_diaria", label: "Operativa diaria", icon: "time-outline" },
];

interface AreaAnalysisSectionProps {
  areas: PlanAreaAnalysis;
}

export function AreaAnalysisSection({ areas }: AreaAnalysisSectionProps) {
  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="CARTOGRAFÍA · ÁREAS" title="Análisis por" accent="áreas" />

      <View style={styles.list}>
        {AREA_CONFIG.map(({ key, label, icon }) => {
          const value = areas[key];
          if (!value) return null;
          return <AreaAnalysisCard key={key} icon={icon} label={label} value={value} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
});
