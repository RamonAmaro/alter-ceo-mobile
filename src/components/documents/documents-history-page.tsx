import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type ListRenderItem,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useSourcesStore } from "@/stores/sources-store";
import type { SourceSummaryItem } from "@/types/source";
import { formatShortDate } from "@/utils/format-date";

interface DocumentsHistoryPageProps {
  width: number;
  height: number;
}

function statusLabel(status: string): string {
  if (status === "ready") return "LISTO";
  if (status === "processing") return "PROCESANDO";
  if (status === "pending") return "EN COLA";
  if (status === "failed") return "ERROR";
  return status.toUpperCase();
}

function statusColor(status: string): string {
  if (status === "ready") return SemanticColors.success;
  if (status === "failed") return SemanticColors.error;
  return SemanticColors.warning;
}

function displayTitle(item: SourceSummaryItem): string {
  return item.title?.trim() || item.filename?.trim() || "Documento sin título";
}

function displayDate(item: SourceSummaryItem): string {
  const iso = item.created_at ?? item.updated_at;
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return formatShortDate(d);
}

function notifyProcessing(status: string): void {
  const message =
    status === "failed"
      ? "El análisis de este documento ha fallado. Puedes subirlo de nuevo."
      : "El documento aún se está procesando. Te avisamos cuando esté listo.";
  if (Platform.OS === "web") {
    window.alert(message);
    return;
  }
  Alert.alert("Documento", message);
}

export function DocumentsHistoryPage({ width, height }: DocumentsHistoryPageProps) {
  const router = useRouter();
  const userId = useAuthStore((s) => s.user?.userId);
  const pdfs = useSourcesStore((s) => s.pdfs);
  const isLoading = useSourcesStore((s) => s.isLoading);
  const listError = useSourcesStore((s) => s.listError);
  const ensurePdfsLoaded = useSourcesStore((s) => s.ensurePdfsLoaded);
  const refreshPdfs = useSourcesStore((s) => s.refreshPdfs);

  useEffect(() => {
    if (!userId) return;
    ensurePdfsLoaded(userId);
  }, [userId, ensurePdfsLoaded]);

  const handleRetry = useCallback(() => {
    if (!userId) return;
    refreshPdfs(userId);
  }, [userId, refreshPdfs]);

  const handleOpen = useCallback(
    (item: SourceSummaryItem) => {
      if (item.status !== "ready") {
        notifyProcessing(item.status);
        return;
      }
      router.push({
        pathname: "/(app)/source-detail",
        params: { sourceId: item.source_id },
      });
    },
    [router],
  );

  const renderItem: ListRenderItem<SourceSummaryItem> = useCallback(
    ({ item }) => {
      const color = statusColor(item.status);
      const isInteractive = item.status === "ready";
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleOpen(item)}
          style={[styles.card, !isInteractive && styles.cardDisabled]}
        >
          <View style={styles.cardIcon}>
            <Ionicons name="document-text-outline" size={18} color={SemanticColors.textPrimary} />
          </View>
          <View style={styles.cardBody}>
            <ThemedText style={styles.cardTitle} numberOfLines={2}>
              {displayTitle(item)}
            </ThemedText>
            <View style={styles.cardMeta}>
              <View style={[styles.statusDot, { backgroundColor: color }]} />
              <ThemedText style={[styles.cardStatus, { color }]}>
                {statusLabel(item.status)}
              </ThemedText>
              {displayDate(item) ? (
                <>
                  <View style={styles.metaDivider} />
                  <ThemedText style={styles.cardDate}>{displayDate(item)}</ThemedText>
                </>
              ) : null}
            </View>
          </View>
          {isInteractive ? (
            <Ionicons name="chevron-forward" size={16} color={SemanticColors.textMuted} />
          ) : null}
        </TouchableOpacity>
      );
    },
    [handleOpen],
  );

  const keyExtractor = useCallback((item: SourceSummaryItem) => item.source_id, []);

  return (
    <View style={[styles.page, { width, height }]}>
      <View style={styles.listContainer}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.accentBar} />
            <ThemedText style={styles.sectionLabel}>TUS DOCUMENTOS</ThemedText>
          </View>
        </View>

        {isLoading && pdfs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator color={SemanticColors.tealLight} />
          </View>
        ) : listError && pdfs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={28} color={SemanticColors.error} />
            <ThemedText style={styles.emptyTitle}>No se pudo cargar</ThemedText>
            <ThemedText style={styles.emptyText}>{listError}</ThemedText>
            <TouchableOpacity onPress={handleRetry} style={styles.retryButton} activeOpacity={0.7}>
              <Ionicons name="refresh" size={14} color={SemanticColors.textPrimary} />
              <ThemedText style={styles.retryText}>Reintentar</ThemedText>
            </TouchableOpacity>
          </View>
        ) : pdfs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="document-outline" size={28} color="rgba(255,255,255,0.2)" />
            </View>
            <ThemedText style={styles.emptyTitle}>No hay documentos</ThemedText>
            <ThemedText style={styles.emptyText}>
              Aún no has subido ningún documento. Cuando subas uno, aparecerá aquí.
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={pdfs}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginTop: Spacing.two,
  },
  retryText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textPrimary,
    letterSpacing: 0.3,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardDisabled: {
    opacity: 0.7,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,192,238,0.12)",
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardStatus: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.6,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  cardDate: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textMuted,
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
