import { ItemCard } from "@/components/my-plan/item-card";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { PlanOpportunity } from "@/types/plan-data";
import { StyleSheet, View } from "react-native";

interface OpportunitiesListProps {
  introduction?: string;
  opportunities: PlanOpportunity[];
}

function deduplicateByTitle(items: PlanOpportunity[]): PlanOpportunity[] {
  return items.filter((o, i, arr) => arr.findIndex((x) => x.titulo === o.titulo) === i);
}

export function OpportunitiesList({ introduction, opportunities }: OpportunitiesListProps) {
  const unique = deduplicateByTitle(opportunities);

  return (
    <View style={styles.container}>
      <SectionHeader title="Oportunidades" badge={unique.length} badgeColor="#00FF84" />

      {introduction && (
        <ThemedText type="bodyMd" style={styles.intro}>{introduction}</ThemedText>
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
    color: "rgba(255,255,255,0.6)",
    lineHeight: 22,
  },
});
