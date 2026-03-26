import { ItemCard } from "@/components/my-plan/item-card";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import type { PlanBlocker } from "@/types/plan-data";
import { StyleSheet, View } from "react-native";

interface BlockersListProps {
  introduction?: string;
  blockers: PlanBlocker[];
}

function deduplicateByTitle(items: PlanBlocker[]): PlanBlocker[] {
  return items.filter((b, i, arr) => arr.findIndex((x) => x.titulo === b.titulo) === i);
}

export function BlockersList({ introduction, blockers }: BlockersListProps) {
  const unique = deduplicateByTitle(blockers);

  return (
    <View style={styles.container}>
      <SectionHeader title="Bloqueos detectados" badge={unique.length} badgeColor="#FF4444" />

      {introduction && (
        <ThemedText type="bodyMd" style={styles.intro}>{introduction}</ThemedText>
      )}

      {unique.map((b, i) => (
        <ItemCard
          key={b.id_bloqueo ?? i}
          index={i + 1}
          title={b.titulo}
          description={b.descripcion_corta}
          accentColor="#FF4444"
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
