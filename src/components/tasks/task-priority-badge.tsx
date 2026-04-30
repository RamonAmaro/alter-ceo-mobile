import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors } from "@/constants/theme";
import type { TaskPriority } from "@/types/task";

interface TaskPriorityBadgeProps {
  readonly priority: TaskPriority;
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export const TASK_PRIORITY_COLORS: Record<
  TaskPriority,
  { bg: string; border: string; text: string }
> = {
  low: {
    bg: "rgba(67,188,184,0.12)",
    border: "rgba(67,188,184,0.32)",
    text: SemanticColors.teal,
  },
  medium: {
    bg: "rgba(0,207,255,0.12)",
    border: "rgba(0,207,255,0.28)",
    text: SemanticColors.info,
  },
  high: {
    bg: "rgba(255,149,0,0.14)",
    border: "rgba(255,149,0,0.32)",
    text: SemanticColors.warning,
  },
  urgent: {
    bg: "rgba(255,68,68,0.14)",
    border: "rgba(255,68,68,0.34)",
    text: SemanticColors.error,
  },
};

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const cfg = TASK_PRIORITY_COLORS[priority];
  return (
    <View style={[styles.pill, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <View style={[styles.dot, { backgroundColor: cfg.text }]} />
      <ThemedText style={[styles.label, { color: cfg.text }]}>
        {TASK_PRIORITY_LABELS[priority]}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  label: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
});
