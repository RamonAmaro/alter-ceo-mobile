import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface PhaseItemProps {
  label: string;
  sublabel: string;
  text: string;
  index: number;
  isLast: boolean;
}

export function PhaseItem({ label, sublabel, text, index, isLast }: PhaseItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.timeline}>
        <View style={styles.dot}>
          <ThemedText type="caption" style={styles.dotNum}>
            {index}
          </ThemedText>
        </View>
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={[styles.content, isLast && styles.contentLast]}>
        <View style={styles.header}>
          <ThemedText type="labelSm" style={styles.label}>
            {label}
          </ThemedText>
          <ThemedText type="caption" style={styles.sublabel}>
            {sublabel}
          </ThemedText>
        </View>
        <ThemedText type="bodyMd" style={styles.text}>
          {text}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.three,
  },
  timeline: {
    alignItems: "center",
    width: 24,
    flexShrink: 0,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  dotNum: {
    color: SemanticColors.textMuted,
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
  },
  line: {
    flex: 1,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginTop: 4,
    marginBottom: -4,
  },
  content: {
    flex: 1,
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  contentLast: {
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingTop: 3,
  },
  label: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
  },
  sublabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 12,
    fontFamily: Fonts.montserratMedium,
  },
  text: {
    color: "rgba(255,255,255,0.65)",
    lineHeight: 22,
    fontSize: 14,
  },
});
