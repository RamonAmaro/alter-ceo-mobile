import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

interface MeetingTechnicalDetailsProps {
  fileName?: string | null;
  contentType?: string | null;
  sizeBytes?: number | null;
  recordedStartedAt?: string | null;
  recordedFinishedAt?: string | null;
  processingStartedAt?: string | null;
  processingFinishedAt?: string | null;
  processingRunId?: string | null;
  updatedAt: string;
}

function formatBytes(bytes: number | null | undefined): string | null {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface RowProps {
  label: string;
  value: string;
  mono?: boolean;
}

function Row({ label, value, mono = false }: RowProps) {
  return (
    <View style={styles.row}>
      <ThemedText style={styles.rowLabel}>{label}</ThemedText>
      <ThemedText style={[styles.rowValue, mono && styles.rowValueMono]} numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

export function MeetingTechnicalDetails({
  fileName,
  contentType,
  sizeBytes,
  recordedStartedAt,
  recordedFinishedAt,
  processingStartedAt,
  processingFinishedAt,
  processingRunId,
  updatedAt,
}: MeetingTechnicalDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sizeText = formatBytes(sizeBytes);
  const recordedStart = formatDateTime(recordedStartedAt);
  const recordedEnd = formatDateTime(recordedFinishedAt);
  const processingStart = formatDateTime(processingStartedAt);
  const processingEnd = formatDateTime(processingFinishedAt);
  const updated = formatDateTime(updatedAt);

  type Row = { label: string; value: string; mono?: boolean };
  const rows: Row[] = [];
  if (fileName) rows.push({ label: "Archivo", value: fileName, mono: true });
  if (contentType) rows.push({ label: "Formato", value: contentType, mono: true });
  if (sizeText) rows.push({ label: "Tamaño", value: sizeText, mono: true });
  if (recordedStart) rows.push({ label: "Inicio grabación", value: recordedStart });
  if (recordedEnd) rows.push({ label: "Fin grabación", value: recordedEnd });
  if (processingStart) rows.push({ label: "Inicio proceso", value: processingStart });
  if (processingEnd) rows.push({ label: "Fin proceso", value: processingEnd });
  if (updated) rows.push({ label: "Actualizado", value: updated });
  if (processingRunId) rows.push({ label: "Run ID", value: processingRunId, mono: true });

  if (rows.length === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsOpen((v) => !v)}
        activeOpacity={0.6}
        style={styles.header}
        accessibilityRole="button"
        accessibilityLabel={isOpen ? "Ocultar metadatos" : "Mostrar metadatos"}
      >
        <View style={styles.headerLeft}>
          <ThemedText style={styles.eyebrow}>METADATOS · TÉCNICOS</ThemedText>
        </View>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={14}
          color={SemanticColors.textMuted}
        />
      </TouchableOpacity>

      <View style={styles.rule} />

      {isOpen ? (
        <View style={styles.rows}>
          {rows.map((row) => (
            <Row key={row.label} label={row.label} value={row.value} mono={row.mono} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.one,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  eyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  rule: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  rows: {
    paddingTop: Spacing.two,
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  rowLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  rowValue: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.textSecondaryLight,
    textAlign: "right",
  },
  rowValueMono: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 11,
    letterSpacing: 0.3,
    fontVariant: ["tabular-nums"],
  },
});
