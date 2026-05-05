import { ItemCard } from "@/components/my-plan/item-card";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PlanOpportunity } from "@/types/plan";
import { deduplicateByTitle } from "@/utils/deduplicate-by-title";
import { StyleSheet, View } from "react-native";

interface OpportunitiesListProps {
  introduction?: string;
  opportunities: PlanOpportunity[];
  sectionNumber?: string;
}

export function OpportunitiesList({
  introduction,
  opportunities,
  sectionNumber,
}: OpportunitiesListProps) {
  const unique = deduplicateByTitle(opportunities).filter(
    (o) => o.titulo?.trim() && o.propuesta_accion?.trim(),
  );
  const trimmedIntro = introduction?.trim();

  if (unique.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        eyebrow="PALANCAS · DE CRECIMIENTO"
        title="Oportunidades de mejora"
        badge={unique.length}
        sectionNumber={sectionNumber}
      />

      {trimmedIntro ? <ThemedText style={styles.intro}>{trimmedIntro}</ThemedText> : null}

      <View style={styles.list}>
        {unique.map((o, i) => (
          <ItemCard
            key={o.id_mejora ?? i}
            index={i + 1}
            badgeLabel={sectionNumber ? `${sectionNumber}.${i + 1}` : undefined}
            title={o.titulo.trim()}
            description={o.propuesta_accion.trim()}
            accentColor={SemanticColors.success}
          />
        ))}
      </View>
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
    color: "rgba(255,255,255,0.72)",
    paddingHorizontal: Spacing.one,
  },
  list: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
});
