import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { Spacing } from "@/constants/theme";
import { StrategyTopicCard } from "./strategy-topic-card";

interface TopicConfig {
  key: string;
  label: string;
  image: ImageSourcePropType;
  enabled: boolean;
}

const TOPICS: TopicConfig[] = [
  {
    key: "captacion",
    label: "CAPTACIÓN",
    image: require("@/assets/ui/strategy-captacion.png"),
    enabled: true,
  },
  {
    key: "ventas",
    label: "GUIÓN DE VENTAS",
    image: require("@/assets/ui/strategy-ventas.png"),
    enabled: false,
  },
  {
    key: "equipo",
    label: "EQUIPO",
    image: require("@/assets/ui/strategy-equipo.png"),
    enabled: false,
  },
  {
    key: "delegar",
    label: "DELEGAR",
    image: require("@/assets/ui/strategy-delegar.png"),
    enabled: false,
  },
];

const STAGGER_MS = 80;

interface StrategyTopicSelectorProps {
  onSelect: (key: string) => void;
}

export function StrategyTopicSelector({ onSelect }: StrategyTopicSelectorProps) {
  const { isDesktop } = useResponsiveLayout();
  const total = TOPICS.length;

  return (
    <View style={[styles.grid, isDesktop ? styles.gridDesktop : null]}>
      {TOPICS.map((topic, index) => (
        <View
          key={topic.key}
          style={[styles.cell, isDesktop ? styles.cellDesktop : styles.cellRow]}
        >
          <StrategyTopicCard
            index={index}
            total={total}
            label={topic.label}
            image={topic.image}
            disabled={!topic.enabled}
            actionLabel={topic.enabled ? "Comenzar" : "Próximamente"}
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
    flexBasis: "22%",
    minWidth: 220,
  },
});
