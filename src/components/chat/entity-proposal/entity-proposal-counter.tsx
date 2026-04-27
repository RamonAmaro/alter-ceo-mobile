import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface EntityProposalCounterProps {
  readonly current: number;
  readonly total: number;
}

export function EntityProposalCounter({ current, total }: EntityProposalCounterProps) {
  if (total <= 1) return null;

  return (
    <View style={styles.root}>
      <ThemedText type="caption" style={styles.label}>
        {current}/{total}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: -Spacing.one,
    right: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: SemanticColors.success,
    zIndex: 200,
  },
  label: {
    color: SemanticColors.onSuccess,
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
