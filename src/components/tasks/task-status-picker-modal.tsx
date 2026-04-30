import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { TASK_STATUSES, type TaskStatus } from "@/types/task";

import { TASK_STATUS_COLORS, TASK_STATUS_LABELS } from "./task-status-pill";

interface TaskStatusPickerModalProps {
  readonly visible: boolean;
  readonly currentStatus: TaskStatus;
  readonly onSelect: (status: TaskStatus) => void;
  readonly onClose: () => void;
  readonly excludeStatuses?: readonly TaskStatus[];
}

export function TaskStatusPickerModal({
  visible,
  currentStatus,
  onSelect,
  onClose,
  excludeStatuses = ["draft"],
}: TaskStatusPickerModalProps) {
  const options = TASK_STATUSES.filter((s) => !excludeStatuses.includes(s));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.handle} />
          <ThemedText style={styles.title}>Cambiar estado</ThemedText>

          <View style={styles.list}>
            {options.map((status) => {
              const cfg = TASK_STATUS_COLORS[status];
              const isCurrent = status === currentStatus;
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.option, isCurrent && styles.optionCurrent]}
                  onPress={() => {
                    onSelect(status);
                    onClose();
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isCurrent }}
                >
                  <View style={[styles.dot, { backgroundColor: cfg.text }]} />
                  <ThemedText style={[styles.optionLabel, { color: cfg.text }]}>
                    {TASK_STATUS_LABELS[status]}
                  </ThemedText>
                  {isCurrent ? (
                    <Ionicons name="checkmark" size={16} color={cfg.text} />
                  ) : (
                    <View style={styles.spacer} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <ThemedText style={styles.cancelLabel}>Cancelar</ThemedText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: SemanticColors.surfaceOverlay,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  handle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: Spacing.two,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
    paddingHorizontal: Spacing.one,
    marginBottom: Spacing.one,
  },
  list: {
    gap: 6,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  optionCurrent: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    flex: 1,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 14,
    lineHeight: 18,
  },
  spacer: {
    width: 16,
  },
  cancelBtn: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  cancelLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 13,
    color: SemanticColors.textSecondaryLight,
    letterSpacing: 0.6,
  },
});
