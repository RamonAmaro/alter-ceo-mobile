import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { TaskPriorityBadge } from "@/components/tasks/task-priority-badge";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import type { Task } from "@/types/task";

interface ChatTaskProposalCardProps {
  readonly task: Task;
  readonly submitting: boolean;
  readonly errorMessage: string | null;
  readonly onAccept: (taskId: string) => void;
  readonly onReject: (taskId: string) => void;
}

export function ChatTaskProposalCard({
  task,
  submitting,
  errorMessage,
  onAccept,
  onReject,
}: ChatTaskProposalCardProps) {
  const { isMobile } = useResponsiveLayout();
  const handleAccept = useCallback(() => onAccept(task.id), [onAccept, task.id]);
  const handleReject = useCallback(() => onReject(task.id), [onReject, task.id]);

  return (
    <View
      style={[styles.card, isMobile ? styles.cardMobile : styles.cardDesktop]}
      pointerEvents={submitting ? "none" : "auto"}
    >
      <View style={styles.body}>
        <View style={styles.iconBadge}>
          <Ionicons name="checkmark-done" size={16} color={SemanticColors.onSuccess} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.typeChip}>Tarea propuesta</ThemedText>
            <TaskPriorityBadge priority={task.priority} />
          </View>
          <ThemedText style={styles.title} numberOfLines={2}>
            {task.title}
          </ThemedText>
          {task.description ? (
            <ThemedText style={styles.description} numberOfLines={2}>
              {task.description}
            </ThemedText>
          ) : null}
          {errorMessage ? <ThemedText style={styles.error}>{errorMessage}</ThemedText> : null}
        </View>
      </View>

      <View style={[styles.actions, isMobile ? styles.actionsMobile : styles.actionsDesktop]}>
        <TouchableOpacity
          style={[
            styles.btn,
            styles.rejectBtn,
            isMobile && styles.btnFlex,
            submitting && styles.btnDisabled,
          ]}
          onPress={handleReject}
          disabled={submitting}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Descartar propuesta"
        >
          <ThemedText style={styles.rejectLabel}>Descartar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.btn,
            styles.acceptBtn,
            isMobile && styles.btnFlex,
            submitting && styles.btnDisabled,
          ]}
          onPress={handleAccept}
          disabled={submitting}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Convertir en tarea"
        >
          {submitting ? (
            <ActivityIndicator color={SemanticColors.onSuccess} size="small" />
          ) : (
            <ThemedText style={styles.acceptLabel}>Convertir en tarea</ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.35)",
    backgroundColor: "rgba(7,30,18,0.92)",
  },
  cardMobile: {
    flexDirection: "column",
  },
  cardDesktop: {
    flexDirection: "row",
    alignItems: "center",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    minWidth: 0,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: SemanticColors.success,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  typeChip: {
    fontFamily: Fonts.montserratBold,
    fontSize: 9,
    color: SemanticColors.success,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "rgba(0,255,132,0.12)",
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    lineHeight: 17,
    color: SemanticColors.textPrimary,
  },
  description: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 15,
    color: SemanticColors.textSecondaryLight,
  },
  error: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 10,
    color: SemanticColors.error,
    marginTop: 2,
  },
  actions: {
    gap: Spacing.one,
    flexShrink: 0,
  },
  actionsDesktop: {
    flexDirection: "row",
  },
  actionsMobile: {
    flexDirection: "row",
    width: "100%",
  },
  btn: {
    minHeight: 30,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  btnFlex: {
    flex: 1,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  rejectBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "transparent",
  },
  acceptBtn: {
    backgroundColor: SemanticColors.success,
  },
  rejectLabel: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
  },
  acceptLabel: {
    color: SemanticColors.onSuccess,
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
  },
});
