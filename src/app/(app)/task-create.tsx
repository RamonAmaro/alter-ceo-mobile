import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { KeyboardAwareScroll } from "@/components/keyboard-aware-scroll";
import { ScreenHeader } from "@/components/screen-header";
import {
  TaskFormFields,
  TaskFormFooter,
  useTaskForm,
  type TaskFormSubmission,
} from "@/components/tasks/task-form";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useTaskStore } from "@/stores/task-store";
import { goBackOrHome } from "@/utils/navigation";

export default function TaskCreateScreen() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.user?.userId ?? null);
  const createTask = useTaskStore((s) => s.createTask);

  async function handleSubmit(values: TaskFormSubmission): Promise<void> {
    if (!userId) {
      throw new Error("No hemos podido identificar tu sesión. Vuelve a iniciar sesión.");
    }
    await createTask({
      user_id: userId,
      title: values.title,
      description: values.description,
      status: values.status,
      priority: values.priority,
      source: "manual",
      due_date: values.dueDateIso,
      responsible_name: values.responsibleName,
    });
    goBackOrHome();
  }

  const controller = useTaskForm({ onSubmit: handleSubmit });

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="add-circle-outline"
          titlePrefix="Nueva"
          titleAccent="tarea"
        />

        <KeyboardAwareScroll
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <TaskFormFields controller={controller} showStatus={false} />
        </KeyboardAwareScroll>

        <TaskFormFooter
          controller={controller}
          submitLabel="Crear tarea"
          bottomInset={insets.bottom}
        />
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
});
