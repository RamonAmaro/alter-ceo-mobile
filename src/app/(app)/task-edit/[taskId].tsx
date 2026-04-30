import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { KeyboardAwareScroll } from "@/components/keyboard-aware-scroll";
import { ScreenHeader } from "@/components/screen-header";
import {
  TaskDeleteButton,
  TaskFormFields,
  TaskFormFooter,
  useTaskForm,
  type TaskFormSubmission,
} from "@/components/tasks/task-form";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useTaskStore } from "@/stores/task-store";
import { goBackOrHome } from "@/utils/navigation";

export default function TaskEditScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ taskId: string }>();
  const taskId = typeof params.taskId === "string" ? params.taskId : "";

  const task = useTaskStore((s) => s.byId[taskId]);
  const patchTask = useTaskStore((s) => s.patchTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  async function handleSubmit(values: TaskFormSubmission): Promise<void> {
    await patchTask(taskId, {
      title: values.title,
      description: values.description ?? null,
      status: values.status,
      priority: values.priority,
      due_date: values.dueDateIso ?? null,
      responsible_name: values.responsibleName ?? null,
    });
    goBackOrHome();
  }

  async function handleDelete(): Promise<void> {
    await deleteTask(taskId);
    goBackOrHome();
  }

  const controller = useTaskForm({
    initialValues: task
      ? {
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.due_date,
          responsible: task.responsible_name,
          status: task.status,
        }
      : undefined,
    onSubmit: handleSubmit,
    onDelete: task ? handleDelete : undefined,
  });

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="create-outline"
          titlePrefix="Editar"
          titleAccent="tarea"
        />

        <KeyboardAwareScroll
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {task ? (
            <>
              <TaskFormFields controller={controller} showStatus />
              <TaskDeleteButton controller={controller} />
            </>
          ) : (
            <View style={styles.notFound}>
              <ThemedText style={styles.notFoundText}>
                No hemos podido encontrar esta tarea. Es posible que ya no exista.
              </ThemedText>
            </View>
          )}
        </KeyboardAwareScroll>

        {task ? (
          <TaskFormFooter
            controller={controller}
            submitLabel="Guardar cambios"
            bottomInset={insets.bottom}
          />
        ) : null}
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
  },
  notFound: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
  },
  notFoundText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
  },
});
