import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
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
          {selected && multi ? (
            <Ionicons name="checkmark" size={14} color={SemanticColors.textPrimary} />
          ) : null}
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
    backgroundColor: SemanticColors.glassBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
  },
  optionSelected: {
    backgroundColor: SemanticColors.accent,
    borderColor: SemanticColors.accent,
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
    borderColor: SemanticColors.textDisabled,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: SemanticColors.textPrimary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SemanticColors.textPrimary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: SemanticColors.textDisabled,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: SemanticColors.textPrimary,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
  },
  label: {
    color: SemanticColors.textPrimary,
  },
  labelSelected: {
    color: SemanticColors.textPrimary,
  },
  subtitle: {
    color: SemanticColors.textSecondaryLight,
    marginTop: 2,
  },
  subtitleSelected: {
    color: "rgba(255,255,255,0.9)",
  },
});
