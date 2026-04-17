import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
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
    label: "GUIÓN\nDE VENTAS",
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

interface StrategyTopicSelectorProps {
  onSelect: (key: string) => void;
}

export function StrategyTopicSelector({ onSelect }: StrategyTopicSelectorProps) {
  const topRow = TOPICS.slice(0, 2);
  const bottomRow = TOPICS.slice(2, 4);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.heading}>ELIGE UN TEMA</ThemedText>

      <View style={styles.grid}>
        <View style={styles.row}>
          {topRow.map((topic) => (
            <StrategyTopicCard
              key={topic.key}
              label={topic.label}
              image={topic.image}
              disabled={!topic.enabled}
              actionLabel={topic.enabled ? "Comenzar" : "Próximamente"}
              onPress={() => onSelect(topic.key)}
            />
          ))}
        </View>

        <View style={styles.row}>
          {bottomRow.map((topic) => (
            <StrategyTopicCard
              key={topic.key}
              label={topic.label}
              image={topic.image}
              disabled={!topic.enabled}
              actionLabel={topic.enabled ? "Comenzar" : "Próximamente"}
              onPress={() => onSelect(topic.key)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.two,
  },
  heading: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 15,
    lineHeight: 19,
    textAlign: "center",
    letterSpacing: 2,
    color: SemanticColors.textPrimary,
    marginVertical: Spacing.four,
  },
  grid: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.two,
    height: 253,
  },
});
