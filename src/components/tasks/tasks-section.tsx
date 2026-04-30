import type { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { Spacing } from "@/constants/theme";
import type { Task, TaskStatus } from "@/types/task";

import { TaskListItem } from "./task-list-item";
import { TaskProposalCard } from "./task-proposal-card";
import { TasksEmptyState } from "./tasks-empty-state";
import { TasksSectionHeader } from "./tasks-section-header";

interface TasksSectionProps {
  readonly title: string;
  readonly tasks: readonly Task[];
  readonly emptyMessage: string;
  readonly emptyIcon?: React.ComponentProps<typeof Ionicons>["name"];
  readonly accent?: boolean;
  readonly collapsible?: boolean;
  readonly collapsed?: boolean;
  readonly onToggleCollapsed?: () => void;
  readonly variant: "proposal" | "list";
  readonly submittingIds: ReadonlySet<string>;
  readonly errors: Readonly<Record<string, string>>;
  readonly onAccept?: (taskId: string) => void;
  readonly onReject?: (taskId: string) => void;
  readonly onPress?: (taskId: string) => void;
  readonly onChangeStatus?: (taskId: string, status: TaskStatus) => void;
  readonly onDelete?: (taskId: string) => void;
}

export function TasksSection({
  title,
  tasks,
  emptyMessage,
  emptyIcon,
  accent = false,
  collapsible = false,
  collapsed = false,
  onToggleCollapsed,
  variant,
  submittingIds,
  errors,
  onAccept,
  onReject,
  onPress,
  onChangeStatus,
  onDelete,
}: TasksSectionProps) {
  const showBody = !collapsible || !collapsed;

  return (
    <View style={styles.section}>
      <TasksSectionHeader
        title={title}
        count={tasks.length}
        accent={accent}
        collapsible={collapsible}
        collapsed={collapsed}
        onToggle={onToggleCollapsed}
      />
      {showBody ? (
        tasks.length === 0 ? (
          <TasksEmptyState message={emptyMessage} icon={emptyIcon} />
        ) : (
          <View style={styles.list}>
            {tasks.map((task) =>
              variant === "proposal" ? (
                <TaskProposalCard
                  key={task.id}
                  task={task}
                  submitting={submittingIds.has(task.id)}
                  errorMessage={errors[task.id] ?? null}
                  onAccept={onAccept ?? noopId}
                  onReject={onReject ?? noopId}
                />
              ) : (
                <TaskListItem
                  key={task.id}
                  task={task}
                  submitting={submittingIds.has(task.id)}
                  errorMessage={errors[task.id] ?? null}
                  onPress={onPress ?? noopId}
                  onChangeStatus={onChangeStatus ?? noopStatus}
                  onDelete={onDelete ?? noopId}
                />
              ),
            )}
          </View>
        )
      ) : null}
    </View>
  );
}

function noopId(_id: string): void {}
function noopStatus(_id: string, _s: TaskStatus): void {}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  list: {
    gap: Spacing.two,
  },
});
