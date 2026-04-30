import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  type GestureResponderEvent,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { Task, TaskStatus } from "@/types/task";
import { formatTaskDueDate } from "@/utils/format-task-date";

import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskSourceBadge } from "./task-source-badge";
import { TaskStatusPickerModal } from "./task-status-picker-modal";
import { TaskStatusPill } from "./task-status-pill";

interface TaskListItemProps {
  readonly task: Task;
  readonly submitting: boolean;
  readonly errorMessage: string | null;
  readonly onPress: (taskId: string) => void;
  readonly onChangeStatus: (taskId: string, status: TaskStatus) => void;
  readonly onDelete: (taskId: string) => void;
}

function confirmDelete(onConfirm: () => void): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm("¿Eliminar esta tarea?")) onConfirm();
    return;
  }
  Alert.alert(
    "¿Eliminar esta tarea?",
    "Esta acción no se puede deshacer.",
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: onConfirm },
    ],
    { cancelable: true },
  );
}

export function TaskListItem({
  task,
  submitting,
  errorMessage,
  onPress,
  onChangeStatus,
  onDelete,
}: TaskListItemProps) {
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const isCompleted = task.status === "completed";
  const dueDateLabel = formatTaskDueDate(task.due_date);

  function handlePress(): void {
    onPress(task.id);
  }

  function handleStatusPress(event?: GestureResponderEvent): void {
    event?.stopPropagation();
    setIsStatusPickerOpen(true);
  }

  function handleStatusSelect(status: TaskStatus): void {
    onChangeStatus(task.id, status);
  }

  function handleDeletePress(event?: GestureResponderEvent): void {
    event?.stopPropagation();
    confirmDelete(() => onDelete(task.id));
  }

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          isCompleted && styles.cardCompleted,
          pressed && styles.cardPressed,
        ]}
        onPress={handlePress}
        accessibilityRole="link"
        accessibilityLabel={`Editar tarea: ${task.title}`}
      >
        <View style={styles.headerRow}>
          <ThemedText
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </ThemedText>
          {submitting ? (
            <ActivityIndicator size="small" color={SemanticColors.success} />
          ) : (
            <TaskStatusPill status={task.status} onPress={handleStatusPress} compact />
          )}
        </View>

        {task.description ? (
          <ThemedText style={styles.description} numberOfLines={2}>
            {task.description}
          </ThemedText>
        ) : null}

        <View style={styles.metaRow}>
          <TaskPriorityBadge priority={task.priority} />
          <TaskSourceBadge source={task.source} />
          {dueDateLabel ? (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={11} color={SemanticColors.textMuted} />
              <ThemedText style={styles.metaText}>{dueDateLabel}</ThemedText>
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

        <View style={styles.footerRow}>
          <View style={styles.footerHint}>
            <Ionicons name="create-outline" size={12} color={SemanticColors.textMuted} />
            <ThemedText style={styles.footerHintLabel}>Tocar para editar</ThemedText>
          </View>
          <TouchableOpacity
            onPress={handleDeletePress}
            style={styles.deleteBtn}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Eliminar tarea"
          >
            <Ionicons name="trash-outline" size={14} color={SemanticColors.textMuted} />
          </TouchableOpacity>
        </View>
      </Pressable>

      <TaskStatusPickerModal
        visible={isStatusPickerOpen}
        currentStatus={task.status}
        onSelect={handleStatusSelect}
        onClose={() => setIsStatusPickerOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardCompleted: {
    opacity: 0.7,
  },
  cardPressed: {
    opacity: 0.85,
    backgroundColor: "rgba(255,255,255,0.06)",
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
  titleCompleted: {
    color: SemanticColors.textSecondaryLight,
    textDecorationLine: "line-through",
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
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  footerHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerHintLabel: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 10,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 0.4,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
