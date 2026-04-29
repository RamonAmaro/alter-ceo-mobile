import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface BlockSubHeaderProps {
  label: string;
  tone?: "neutral" | "danger";
}

export function BlockSubHeader({ label, tone = "neutral" }: BlockSubHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.line, tone === "danger" ? styles.lineDanger : null]} />
      <ThemedText style={[styles.label, tone === "danger" ? styles.labelDanger : null]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  lineDanger: {
    backgroundColor: "rgba(255,122,69,0.25)",
  },
  label: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.55)",
  },
  labelDanger: {
    color: "#FF7A45",
  },
});
