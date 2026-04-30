import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View, type GestureResponderEvent } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors } from "@/constants/theme";
import type { TaskStatus } from "@/types/task";

interface TaskStatusPillProps {
  readonly status: TaskStatus;
  readonly onPress?: (event?: GestureResponderEvent) => void;
  readonly disabled?: boolean;
  readonly compact?: boolean;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "Propuesta",
  todo: "Pendiente",
  in_progress: "En curso",
  blocked: "Bloqueada",
  completed: "Completada",
  cancelled: "Cancelada",
  archived: "Archivada",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, { bg: string; border: string; text: string }> =
  {
    draft: {
      bg: "rgba(0,255,132,0.10)",
      border: "rgba(0,255,132,0.32)",
      text: SemanticColors.success,
    },
    todo: {
      bg: "rgba(0,207,255,0.12)",
      border: "rgba(0,207,255,0.30)",
      text: SemanticColors.info,
    },
    in_progress: {
      bg: "rgba(67,188,184,0.14)",
      border: "rgba(67,188,184,0.34)",
      text: SemanticColors.teal,
    },
    blocked: {
      bg: "rgba(255,149,0,0.14)",
      border: "rgba(255,149,0,0.34)",
      text: SemanticColors.warning,
    },
    completed: {
      bg: "rgba(0,255,132,0.14)",
      border: "rgba(0,255,132,0.34)",
      text: SemanticColors.success,
    },
    cancelled: {
      bg: "rgba(255,255,255,0.06)",
      border: "rgba(255,255,255,0.16)",
      text: SemanticColors.textSecondaryLight,
    },
    archived: {
      bg: "rgba(255,255,255,0.04)",
      border: "rgba(255,255,255,0.12)",
      text: SemanticColors.textMuted,
    },
  };

export function TaskStatusPill({ status, onPress, disabled, compact }: TaskStatusPillProps) {
  const cfg = TASK_STATUS_COLORS[status];
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={[
        styles.pill,
        compact && styles.pillCompact,
        { backgroundColor: cfg.bg, borderColor: cfg.border },
        disabled && styles.disabled,
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={
        onPress ? `Cambiar estado, actual: ${TASK_STATUS_LABELS[status]}` : undefined
      }
    >
      <View style={[styles.dot, { backgroundColor: cfg.text }]} />
      <ThemedText style={[styles.label, { color: cfg.text }]}>
        {TASK_STATUS_LABELS[status]}
      </ThemedText>
      {onPress ? <Ionicons name="chevron-down" size={11} color={cfg.text} /> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.6,
  },
});
