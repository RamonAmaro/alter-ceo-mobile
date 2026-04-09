import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface AuthTaglineProps {
  text: string;
}

export function AuthTagline({ text }: AuthTaglineProps) {
  return (
    <View style={styles.container}>
      <View style={styles.accent} />
      <ThemedText type="headingMd" style={styles.taglineText}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.two,
  },
  accent: {
    width: 4,
    height: 74,
    backgroundColor: "#D9D9D9",
    borderRadius: 2,
    marginRight: Spacing.three,
  },
  taglineText: {
    color: SemanticColors.textPrimary,
    flex: 1,
  },
});
