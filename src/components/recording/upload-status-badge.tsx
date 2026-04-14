import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";

export type UploadStatus = "local_only" | "uploading" | "processing" | "completed" | "failed";

interface UploadStatusBadgeProps {
  status: UploadStatus;
  onRetry?: () => void;
  onPress?: () => void;
}

const STATUS_CONFIG = {
  local_only: null,
  uploading: { label: "Subiendo...", color: SemanticColors.info, loading: true },
  processing: { label: "Procesando...", color: SemanticColors.warning, loading: true },
  completed: { label: "Completado", color: SemanticColors.success, loading: false },
  failed: { label: "Error", color: SemanticColors.error, loading: false },
} as const;

export function UploadStatusBadge({ status, onRetry, onPress }: UploadStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7, hitSlop: 8 } : {};

  return (
    <Wrapper style={styles.container} {...wrapperProps}>
      {config.loading ? (
        <ActivityIndicator size="small" color={config.color} />
      ) : status === "completed" ? (
        <Ionicons name="checkmark-circle" size={16} color={config.color} />
      ) : (
        <Ionicons name="alert-circle" size={16} color={config.color} />
      )}

      <ThemedText type="caption" style={[styles.label, { color: config.color }]}>
        {config.label}
      </ThemedText>

      {status === "completed" && onPress && (
        <Ionicons name="chevron-forward" size={14} color={config.color} />
      )}

      {status === "failed" && onRetry && (
        <TouchableOpacity onPress={onRetry} hitSlop={8} activeOpacity={0.7}>
          <ThemedText type="caption" style={styles.retryText}>
            Reintentar
          </ThemedText>
        </TouchableOpacity>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  label: {
    fontSize: 11,
  },
  retryText: {
    color: SemanticColors.tealLight,
    fontSize: 11,
    textDecorationLine: "underline",
  },
});
