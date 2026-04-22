import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface DocumentsHistoryPageProps {
  width: number;
  height: number;
}

export function DocumentsHistoryPage({ width, height }: DocumentsHistoryPageProps) {
  return (
    <View style={[styles.page, { width, height }]}>
      <View style={styles.listContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.accentBar} />
            <ThemedText style={styles.sectionLabel}>TUS DOCUMENTOS</ThemedText>
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="document-outline" size={28} color="rgba(255,255,255,0.2)" />
          </View>
          <ThemedText style={styles.emptyTitle}>No hay documentos</ThemedText>
          <ThemedText style={styles.emptyText}>
            Aún no has subido ningún documento. Cuando subas uno, aparecerá aquí.
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    overflow: "hidden",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.three,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  accentBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  sectionLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
    paddingTop: Spacing.six,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 20,
    color: SemanticColors.textSecondaryLight,
  },
  emptyText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textMuted,
    textAlign: "center",
    paddingHorizontal: Spacing.four,
  },
});
