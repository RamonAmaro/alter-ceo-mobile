import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface QuestionOptionProps {
  label: string;
  subtitle?: string;
  selected: boolean;
  multi?: boolean;
  onPress: () => void;
}

export function QuestionOption({
  label,
  subtitle,
  selected,
  multi = false,
  onPress,
}: QuestionOptionProps) {
  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.optionSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View
          style={[
            multi ? styles.checkbox : styles.radio,
            selected && (multi ? styles.checkboxSelected : styles.radioSelected),
          ]}
        >
          {selected && multi ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
          {selected && !multi ? <View style={styles.radioDot} /> : null}
        </View>

        <View style={styles.textContainer}>
          <ThemedText type="labelSm" style={[styles.label, selected && styles.labelSelected]}>
            {label}
          </ThemedText>
          {subtitle ? (
            <ThemedText
              type="bodySm"
              style={[styles.subtitle, selected && styles.subtitleSelected]}
            >
              {subtitle}
            </ThemedText>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  optionSelected: {
    backgroundColor: "#E8731A",
    borderColor: "#E8731A",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#ffffff",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: "#ffffff",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
  },
  label: {
    color: "#ffffff",
  },
  labelSelected: {
    color: "#ffffff",
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  subtitleSelected: {
    color: "rgba(255,255,255,0.9)",
  },
});
