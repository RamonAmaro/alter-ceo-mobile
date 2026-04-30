export const TASK_STATUSES = [
  "draft",
  "todo",
  "in_progress",
  "blocked",
  "completed",
  "cancelled",
  "archived",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_SOURCES = [
  "manual",
  "chat",
  "plan",
  "meeting",
  "report",
  "documents",
  "audio",
  "llm",
] as const;
export type TaskSource = (typeof TASK_SOURCES)[number];

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly source: TaskSource;
  readonly source_id: string | null;
  readonly due_date: string | null;
  readonly responsible_role_id: string | null;
  readonly responsible_name: string | null;
  readonly parent_task_id: string | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

export type TaskListResponse = readonly Task[];

export interface ListTasksParams {
  readonly status?: TaskStatus;
  readonly source?: TaskSource;
  readonly responsible_role_id?: string;
  readonly due_date_from?: string;
  readonly due_date_to?: string;
  readonly limit?: number;
  readonly offset?: number;
}

export interface CreateTaskInput {
  readonly user_id: string;
  readonly title: string;
  readonly description?: string;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
  readonly source?: TaskSource;
  readonly due_date?: string;
  readonly responsible_role_id?: string;
  readonly responsible_name?: string;
}

export interface PatchTaskInput {
  readonly title?: string;
  readonly description?: string | null;
  readonly status?: TaskStatus;
  readonly priority?: TaskPriority;
  readonly due_date?: string | null;
  readonly responsible_role_id?: string | null;
  readonly responsible_name?: string | null;
  readonly parent_task_id?: string | null;
  readonly source?: TaskSource;
  readonly source_id?: string | null;
}

export interface BulkStatusInput {
  readonly task_ids: readonly string[];
  readonly status: TaskStatus;
}

// SSE payloads on /users/me/events
export interface TaskProposalCreatedEvent {
  readonly task: Task;
}

export interface TaskProposalResolvedEvent {
  readonly task: Task;
}
