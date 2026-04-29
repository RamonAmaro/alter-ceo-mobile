import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface NoteBlockProps {
  text: string;
}

export function NoteBlock({ text }: NoteBlockProps) {
  return (
    <View style={styles.row}>
      <View style={styles.bar} />
      <ThemedText style={styles.text}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.three,
    paddingVertical: Spacing.one,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: SemanticColors.success,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.72)",
  },
});
