import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { EntityType, SourceEntity } from "@/types/source";

interface MeetingEntitiesSectionProps {
  entities: readonly SourceEntity[];
}

const TYPE_LABEL: Record<EntityType, string> = {
  person: "Personas",
  org: "Organizaciones",
  product: "Productos",
  metric: "Métricas",
  kpi: "KPIs",
  date: "Fechas",
  currency_value: "Valores monetarios",
  org_value: "Valores corporativos",
};

const TYPE_ORDER: EntityType[] = [
  "person",
  "org",
  "product",
  "kpi",
  "metric",
  "currency_value",
  "org_value",
  "date",
];

function labelFor(type: string): string {
  if (type in TYPE_LABEL) return TYPE_LABEL[type as EntityType];
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function groupByType(entities: readonly SourceEntity[]): Map<string, SourceEntity[]> {
  const groups = new Map<string, SourceEntity[]>();
  entities.forEach((entity) => {
    const key = entity.entity_type;
    const existing = groups.get(key);
    if (existing) existing.push(entity);
    else groups.set(key, [entity]);
  });
  return groups;
}

function sortGroupKeys(keys: string[]): string[] {
  const priority = new Map(TYPE_ORDER.map((k, i) => [k as string, i]));
  return [...keys].sort((a, b) => {
    const ai = priority.get(a) ?? 99;
    const bi = priority.get(b) ?? 99;
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b);
  });
}

export function MeetingEntitiesSection({ entities }: MeetingEntitiesSectionProps) {
  if (entities.length === 0) return null;

  const grouped = groupByType(entities);
  const orderedKeys = sortGroupKeys([...grouped.keys()]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.eyebrow}>ENTIDADES · DETECTADAS</ThemedText>
        <ThemedText style={styles.count}>{String(entities.length).padStart(2, "0")}</ThemedText>
      </View>

      <View style={styles.rule} />

      <View style={styles.groups}>
        {orderedKeys.map((key) => {
          const items = grouped.get(key) ?? [];
          return (
            <View key={key} style={styles.group}>
              <View style={styles.groupHeader}>
                <ThemedText style={styles.groupLabel}>{labelFor(key)}</ThemedText>
                <ThemedText style={styles.groupCount}>
                  {String(items.length).padStart(2, "0")}
                </ThemedText>
              </View>
              <View style={styles.chipsWrap}>
                {items.map((item) => (
                  <View key={item.entity_id} style={styles.chip}>
                    <ThemedText style={styles.chipText} numberOfLines={2}>
                      {item.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingBottom: 2,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  count: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 12,
    lineHeight: 14,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
  rule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  groups: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  group: {
    gap: Spacing.two,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.two,
  },
  groupLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    lineHeight: 16,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.1,
  },
  groupCount: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 10,
    lineHeight: 14,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.3,
    fontVariant: ["tabular-nums"],
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
  },
});
