import { ItemCard } from "@/components/my-plan/item-card";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import type { PlanBlocker } from "@/types/plan";
import { deduplicateByTitle } from "@/utils/deduplicate-by-title";
import { StyleSheet, View } from "react-native";

const BLOCKER_COLOR = "#FF7A45";

interface BlockersListProps {
  introduction?: string;
  blockers: PlanBlocker[];
}

export function BlockersList({ introduction, blockers }: BlockersListProps) {
  const unique = deduplicateByTitle(blockers).filter(
    (b) => b.titulo?.trim() && b.descripcion_corta?.trim(),
  );
  const trimmedIntro = introduction?.trim();

  if (unique.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        eyebrow="FRENOS · DETECTADOS"
        title="Puntos de bloqueo"
        badge={unique.length}
      />

      {trimmedIntro ? <ThemedText style={styles.intro}>{trimmedIntro}</ThemedText> : null}

      <View style={styles.list}>
        {unique.map((b, i) => (
          <ItemCard
            key={b.id_bloqueo ?? i}
            index={i + 1}
            title={b.titulo.trim()}
            description={b.descripcion_corta.trim()}
            accentColor={BLOCKER_COLOR}
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
