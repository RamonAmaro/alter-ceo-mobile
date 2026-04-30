import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { Task } from "@/types/task";
import { formatTaskDueDate } from "@/utils/format-task-date";

import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskSourceBadge } from "./task-source-badge";

interface TaskProposalCardProps {
  readonly task: Task;
  readonly submitting: boolean;
  readonly errorMessage: string | null;
  readonly onAccept: (taskId: string) => void;
  readonly onReject: (taskId: string) => void;
}

export function TaskProposalCard({
  task,
  submitting,
  errorMessage,
  onAccept,
  onReject,
}: TaskProposalCardProps) {
  const handleAccept = useCallback(() => onAccept(task.id), [onAccept, task.id]);
  const handleReject = useCallback(() => onReject(task.id), [onReject, task.id]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.title} numberOfLines={3}>
          {task.title}
        </ThemedText>
        <View style={styles.proposalChip}>
          <Ionicons name="sparkles" size={10} color={SemanticColors.success} />
          <ThemedText style={styles.proposalChipLabel}>Propuesta</ThemedText>
        </View>
      </View>

      {task.description ? (
        <ThemedText style={styles.description} numberOfLines={3}>
          {task.description}
        </ThemedText>
      ) : null}

      <View style={styles.metaRow}>
        <TaskPriorityBadge priority={task.priority} />
        <TaskSourceBadge source={task.source} />
        {task.due_date ? (
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={11} color={SemanticColors.textMuted} />
            <ThemedText style={styles.metaText}>{formatTaskDueDate(task.due_date)}</ThemedText>
          </View>
        ) : null}
        {task.responsible_name ? (
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={11} color={SemanticColors.textMuted} />
            <ThemedText style={styles.metaText}>{task.responsible_name}</ThemedText>
          </View>
        ) : null}
      </View>

      {errorMessage ? <ThemedText style={styles.error}>{errorMessage}</ThemedText> : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.rejectBtn, submitting && styles.btnDisabled]}
          onPress={handleReject}
          disabled={submitting}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Descartar tarea"
        >
          <ThemedText style={styles.rejectLabel}>Descartar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.acceptBtn, submitting && styles.btnDisabled]}
          onPress={handleAccept}
          disabled={submitting}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Aceptar tarea"
        >
          {submitting ? (
            <ActivityIndicator size="small" color={SemanticColors.onSuccess} />
          ) : (
            <>
              <Ionicons name="checkmark" size={14} color={SemanticColors.onSuccess} />
              <ThemedText style={styles.acceptLabel}>Aceptar</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
    backgroundColor: "rgba(0,255,132,0.05)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  proposalChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,132,0.14)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.32)",
  },
  proposalChipLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.success,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  description: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 17,
    color: SemanticColors.textSecondaryLight,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  metaText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.textMuted,
  },
  error: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 15,
    color: SemanticColors.error,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,255,132,0.16)",
  },
  btn: {
    flex: 1,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: Spacing.two,
    borderRadius: 999,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "transparent",
  },
  acceptBtn: {
    backgroundColor: SemanticColors.success,
  },
  rejectLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.4,
  },
  acceptLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    color: SemanticColors.onSuccess,
    letterSpacing: 0.4,
  },
});
