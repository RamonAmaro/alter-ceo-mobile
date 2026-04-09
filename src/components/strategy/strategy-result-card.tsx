import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const ACTION_BUTTONS = [
  { key: "copy", label: "Copiar", icon: "copy-outline" as const },
  { key: "email", label: "Enviar por Email", icon: "mail-outline" as const },
  { key: "refine", label: "Refinar", icon: "sparkles-outline" as const },
];

interface StrategyResultCardProps {
  isUser?: boolean;
  isLastInGroup?: boolean;
}

export function StrategyResultCard({
  isUser = false,
  isLastInGroup = true,
}: StrategyResultCardProps) {
  return (
    <View style={[styles.row, isUser && styles.rowUser, isLastInGroup && styles.rowGroupEnd]}>
      <View style={styles.bubbleWrap}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <View style={styles.docPreview}>
            <View style={styles.docHeader}>
              <View style={styles.docLines}>
                <View style={[styles.docLine, styles.docLineWide]} />
                <View style={[styles.docLine, styles.docLineMid]} />
                <View style={[styles.docLine, styles.docLineShort]} />
              </View>
              <Ionicons name="document-text" size={22} color="rgba(0,0,0,0.12)" />
            </View>
            <ThemedText style={styles.docTitle}>DOCUMENTO MAESTRO: PARTE 1</ThemedText>
            <ThemedText style={styles.docSubtitle}>1. Resumen Ejecutivo</ThemedText>
            <ThemedText style={styles.docBody}>
              Estrategia de delegación optimizada para maximizar la eficiencia...
            </ThemedText>
          </View>

          <View style={styles.pdfRow}>
            <View style={styles.pdfIconWrap}>
              <Ionicons name="document" size={16} color="#FF3B30" />
            </View>
            <View style={styles.pdfInfo}>
              <ThemedText style={styles.pdfLabel}>Email de Delegación para Juan</ThemedText>
              <ThemedText style={styles.pdfMeta}>PDF · 24 KB</ThemedText>
            </View>
            <Ionicons name="download-outline" size={14} color="rgba(255,255,255,0.4)" />
          </View>

          <View style={styles.divider} />

          <View style={styles.actions}>
            {ACTION_BUTTONS.map((btn) => (
              <TouchableOpacity key={btn.key} style={styles.actionBtn} activeOpacity={0.7}>
                <Ionicons name={btn.icon} size={9} color={SemanticColors.success} />
                <ThemedText style={styles.actionLabel}>{btn.label}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 2,
    paddingHorizontal: Spacing.three,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowGroupEnd: {
    marginBottom: Spacing.three,
  },
  bubbleWrap: {
    maxWidth: "75%",
  },
  bubble: {
    padding: Spacing.three,
    gap: Spacing.two,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: "#005C4B",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: "#1F2C34",
  },
  docPreview: {
    backgroundColor: SemanticColors.textPrimary,
    borderRadius: 6,
    padding: Spacing.two,
    gap: 3,
  },
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  docLines: {
    gap: 4,
    flex: 1,
    marginRight: Spacing.two,
  },
  docLine: {
    height: 3,
    backgroundColor: "rgba(0,0,0,0.12)",
    borderRadius: 2,
  },
  docLineWide: { width: "85%" },
  docLineMid: { width: "60%" },
  docLineShort: { width: "40%" },
  docTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 8,
    color: "#000000",
    lineHeight: 11,
    letterSpacing: 0.2,
  },
  docSubtitle: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 7,
    color: "#333333",
    lineHeight: 10,
  },
  docBody: {
    fontFamily: Fonts.montserrat,
    fontSize: 6,
    color: "#666666",
    lineHeight: 9,
  },
  pdfRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 6,
    padding: Spacing.one,
  },
  pdfIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 5,
    backgroundColor: "rgba(255,59,48,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  pdfInfo: {
    flex: 1,
    gap: 1,
  },
  pdfLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 8,
    color: SemanticColors.textPrimary,
    lineHeight: 11,
  },
  pdfMeta: {
    fontFamily: Fonts.montserrat,
    fontSize: 7,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 9,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.one,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.5)",
    borderRadius: 20,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
  },
  actionLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 8,
    color: SemanticColors.textPrimary,
    lineHeight: 10,
  },
});
