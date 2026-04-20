import { ItemCard } from "@/components/my-plan/item-card";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import type { PlanOpportunity } from "@/types/plan";
import { deduplicateByTitle } from "@/utils/deduplicate-by-title";
import { StyleSheet, View } from "react-native";

interface OpportunitiesListProps {
  introduction?: string;
  opportunities: PlanOpportunity[];
}

export function OpportunitiesList({ introduction, opportunities }: OpportunitiesListProps) {
  const unique = deduplicateByTitle(opportunities);

  return (
    <View style={styles.container}>
      <SectionHeader
        eyebrow="PALANCAS · DE CRECIMIENTO"
        title="Oportunidades"
        accent="a capturar"
        badge={unique.length}
        badgeColor="#00FF84"
      />

      {introduction && (
        <ThemedText type="bodyMd" style={styles.intro}>
          {introduction}
        </ThemedText>
      )}

      {unique.map((o, i) => (
        <ItemCard
          key={o.id_mejora ?? i}
          index={i + 1}
          title={o.titulo}
          description={o.propuesta_accion}
          accentColor="#00FF84"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  intro: {
    color: SemanticColors.iconMuted,
    lineHeight: 22,
  },
});
