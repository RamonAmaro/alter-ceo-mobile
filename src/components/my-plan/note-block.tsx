import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface NoteBlockProps {
  text: string;
}

export function NoteBlock({ text }: NoteBlockProps) {
  return (
    <View style={styles.card}>
      <ThemedText type="bodyMd" style={styles.text}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  text: {
    color: SemanticColors.iconMuted,
    lineHeight: 22,
    fontSize: 13,
    fontStyle: "italic",
  },
});
