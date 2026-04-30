import { del, get, patch, post } from "@/lib/api-client";
import type {
  BulkStatusInput,
  CreateTaskInput,
  ListTasksParams,
  PatchTaskInput,
  Task,
  TaskListResponse,
} from "@/types/task";

function toQuery(params: ListTasksParams = {}): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.status) query.status = params.status;
  if (params.source) query.source = params.source;
  if (params.responsible_role_id) query.responsible_role_id = params.responsible_role_id;
  if (params.due_date_from) query.due_date_from = params.due_date_from;
  if (params.due_date_to) query.due_date_to = params.due_date_to;
  if (params.limit != null) query.limit = String(params.limit);
  if (params.offset != null) query.offset = String(params.offset);
  return query;
}

export async function listTasks(params: ListTasksParams = {}): Promise<TaskListResponse> {
  return get<TaskListResponse>("/tasks", toQuery(params));
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  return post<Task>("/tasks", input);
}

export async function patchTask(taskId: string, body: PatchTaskInput): Promise<Task> {
  return patch<Task>(`/tasks/${taskId}`, body);
}

export async function bulkUpdateTasks(input: BulkStatusInput): Promise<TaskListResponse> {
  return patch<TaskListResponse>("/tasks/bulk", input);
}

export async function listSubtasks(taskId: string): Promise<TaskListResponse> {
  return get<TaskListResponse>(`/tasks/${taskId}/children`);
}

export async function deleteTask(taskId: string): Promise<void> {
  return del(`/tasks/${taskId}`);
}
