import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

interface ChipConfig {
  key: string;
  label: string;
}

const CHIPS: ChipConfig[] = [
  { key: "captacion", label: "Captación" },
  { key: "ventas", label: "Ventas" },
  { key: "equipo", label: "Equipo" },
  { key: "delegar", label: "Delegar" },
];

interface StrategyCategoryChipsProps {
  onSend: (text: string) => void;
}

export function StrategyCategoryChips({ onSend }: StrategyCategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {CHIPS.map((chip) => (
        <TouchableOpacity
          key={chip.key}
          style={styles.chip}
          onPress={() => onSend(chip.label)}
          activeOpacity={0.7}
        >
          <ThemedText type="labelSm" style={styles.label}>
            {chip.label}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    alignItems: "center",
  },
  chip: {
    height: 26,
    paddingHorizontal: Spacing.three,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: "Montserrat-Bold",
    fontSize: 10,
    lineHeight: 13,
    color: "rgba(255,255,255,0.5)",
  },
});
