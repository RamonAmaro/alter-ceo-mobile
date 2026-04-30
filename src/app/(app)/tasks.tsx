import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";

import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { TaskFab } from "@/components/tasks/task-fab";
import { TasksErrorState } from "@/components/tasks/tasks-error-state";
import { TasksSection } from "@/components/tasks/tasks-section";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useTaskStore } from "@/stores/task-store";
import type { Task } from "@/types/task";

const FAB_HEIGHT = 48;

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const [completedCollapsed, setCompletedCollapsed] = useState(true);
  const [archivedCollapsed, setArchivedCollapsed] = useState(true);

  const { byId, order, isLoading, initialLoaded, error, mutation } = useTaskStore(
    useShallow((s) => ({
      byId: s.byId,
      order: s.order,
      isLoading: s.isLoading,
      initialLoaded: s.initialLoaded,
      error: s.error,
      mutation: s.mutation,
    })),
  );

  const fetchAll = useTaskStore((s) => s.fetchAll);
  const acceptProposal = useTaskStore((s) => s.acceptProposal);
  const rejectProposal = useTaskStore((s) => s.rejectProposal);
  const updateStatus = useTaskStore((s) => s.updateStatus);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  useEffect(() => {
    if (!initialLoaded && !isLoading) void fetchAll();
  }, [initialLoaded, isLoading, fetchAll]);

  const { drafts, pending, inProgress, blocked, completed, archived } = useMemo(() => {
    const allTasks = order.map((id) => byId[id]).filter((t): t is Task => t != null);
    return {
      drafts: allTasks.filter((t) => t.status === "draft"),
      pending: allTasks.filter((t) => t.status === "todo"),
      inProgress: allTasks.filter((t) => t.status === "in_progress"),
      blocked: allTasks.filter((t) => t.status === "blocked"),
      completed: allTasks.filter((t) => t.status === "completed"),
      archived: allTasks.filter((t) => t.status === "archived" || t.status === "cancelled"),
    };
  }, [byId, order]);

  function handleEditTask(taskId: string): void {
    router.push(`/(app)/task-edit/${taskId}`);
  }

  function handleNewTask(): void {
    router.push("/(app)/task-create");
  }

  const showSpinner = isLoading && !initialLoaded;
  const showError = !!error && !isLoading && drafts.length === 0 && pending.length === 0;
  const fabBottom = insets.bottom + Spacing.three;
  const contentBottom = fabBottom + FAB_HEIGHT + Spacing.four;

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="file-tray-full-outline"
          titlePrefix="Gestor"
          titleAccent="de tareas"
        />

        {showSpinner ? (
          <View style={styles.center}>
            <ActivityIndicator color={SemanticColors.success} size="large" />
          </View>
        ) : showError ? (
          <View style={styles.center}>
            <TasksErrorState message={error ?? ""} onRetry={fetchAll} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: contentBottom }]}
            showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchAll}
                tintColor={SemanticColors.success}
                colors={[SemanticColors.success]}
              />
            }
          >
            <TasksSection
              title="Propuestas de AlterCEO"
              tasks={drafts}
              emptyMessage="No hay propuestas pendientes. Cuando AlterCEO detecte tareas en tus reuniones, planes o conversaciones, aparecerán aquí."
              emptyIcon="sparkles-outline"
              accent
              variant="proposal"
              submittingIds={mutation.submitting}
              errors={mutation.errors}
              onAccept={acceptProposal}
              onReject={rejectProposal}
            />

            <TasksSection
              title="Pendientes"
              tasks={pending}
              emptyMessage="No tienes tareas pendientes. ¡Disfruta del momento o crea una nueva!"
              emptyIcon="checkmark-done-outline"
              variant="list"
              submittingIds={mutation.submitting}
              errors={mutation.errors}
              onPress={handleEditTask}
              onChangeStatus={updateStatus}
              onDelete={deleteTask}
            />

            {inProgress.length > 0 ? (
              <TasksSection
                title="En curso"
                tasks={inProgress}
                emptyMessage=""
                variant="list"
                submittingIds={mutation.submitting}
                errors={mutation.errors}
                onPress={handleEditTask}
                onChangeStatus={updateStatus}
                onDelete={deleteTask}
              />
            ) : null}

            {blocked.length > 0 ? (
              <TasksSection
                title="Bloqueadas"
                tasks={blocked}
                emptyMessage=""
                variant="list"
                submittingIds={mutation.submitting}
                errors={mutation.errors}
                onPress={handleEditTask}
                onChangeStatus={updateStatus}
                onDelete={deleteTask}
              />
            ) : null}

            <TasksSection
              title="Completadas"
              tasks={completed}
              emptyMessage="Aún no has completado ninguna tarea."
              emptyIcon="trophy-outline"
              variant="list"
              collapsible
              collapsed={completedCollapsed}
              onToggleCollapsed={() => setCompletedCollapsed((v) => !v)}
              submittingIds={mutation.submitting}
              errors={mutation.errors}
              onPress={handleEditTask}
              onChangeStatus={updateStatus}
              onDelete={deleteTask}
            />

            <TasksSection
              title="Archivadas"
              tasks={archived}
              emptyMessage="Sin tareas archivadas."
              emptyIcon="archive-outline"
              variant="list"
              collapsible
              collapsed={archivedCollapsed}
              onToggleCollapsed={() => setArchivedCollapsed((v) => !v)}
              submittingIds={mutation.submitting}
              errors={mutation.errors}
              onPress={handleEditTask}
              onChangeStatus={updateStatus}
              onDelete={deleteTask}
            />
          </ScrollView>
        )}

        <TaskFab onPress={handleNewTask} bottomOffset={fabBottom} />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    gap: Spacing.three,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
});
