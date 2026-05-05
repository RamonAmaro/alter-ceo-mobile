import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { StyleSheet, View } from "react-native";
import { Spacing } from "@/constants/theme";
import { STRATEGY_CATALOG, type StrategyKey } from "@/components/strategies/strategy-catalog";
import { StrategyTopicCard } from "./strategy-topic-card";

const STAGGER_MS = 80;

interface StrategyTopicSelectorProps {
  onSelect: (key: StrategyKey) => void;
}

export function StrategyTopicSelector({ onSelect }: StrategyTopicSelectorProps) {
  const { isDesktop } = useResponsiveLayout();
  return (
    <View style={[styles.grid, isDesktop ? styles.gridDesktop : null]}>
      {STRATEGY_CATALOG.map((topic, index) => (
        <View
          key={topic.key}
          style={[styles.cell, isDesktop ? styles.cellDesktop : styles.cellRow]}
        >
          <StrategyTopicCard
            label={topic.title}
            iconName={topic.iconName}
            iconLibrary={topic.iconLibrary}
            comingSoon={!topic.available}
            onPress={() => onSelect(topic.key)}
            animationDelay={index * STAGGER_MS}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  gridDesktop: {
    gap: Spacing.three,
  },
  cell: {
    minHeight: 260,
  },
  cellRow: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 140,
  },
  cellDesktop: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 220,
  },
});
