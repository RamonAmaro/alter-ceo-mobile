import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { StrategyTopicCard } from "./strategy-topic-card";

interface TopicConfig {
  key: string;
  label: string;
  image: ImageSourcePropType;
}

const TOPICS: TopicConfig[] = [
  {
    key: "captacion",
    label: "CAPTACIÓN",
    image: require("@/assets/ui/strategy-captacion.png"),
  },
  {
    key: "ventas",
    label: "GUIÓN\nDE VENTAS",
    image: require("@/assets/ui/strategy-ventas.png"),
  },
  {
    key: "equipo",
    label: "EQUIPO",
    image: require("@/assets/ui/strategy-equipo.png"),
  },
  {
    key: "delegar",
    label: "DELEGAR",
    image: require("@/assets/ui/strategy-delegar.png"),
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
    color: "#ffffff",
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
