import { create } from "zustand";

import * as taskService from "@/services/task-service";
import { startTaskEventStream, type TaskEventStreamHandle } from "@/services/task-events-service";
import type { CreateTaskInput, PatchTaskInput, Task, TaskStatus } from "@/types/task";
import { toErrorMessage } from "@/utils/to-error-message";

const FETCH_LIMIT = 200;

interface MutationState {
  readonly submitting: ReadonlySet<string>;
  readonly errors: Readonly<Record<string, string>>;
}

interface TaskState {
  byId: Readonly<Record<string, Task>>;
  order: readonly string[];
  isLoading: boolean;
  initialLoaded: boolean;
  error: string | null;
  mutation: MutationState;

  _eventStream: TaskEventStreamHandle | null;
  _streamUserId: string | null;

  fetchAll: (options?: { silent?: boolean }) => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<Task>;
  patchTask: (taskId: string, patch: PatchTaskInput) => Promise<Task>;
  acceptProposal: (taskId: string) => Promise<void>;
  rejectProposal: (taskId: string) => Promise<void>;
  toggleComplete: (taskId: string, complete: boolean) => Promise<void>;
  updateStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;

  startEventStream: (userId: string) => void;
  stopEventStream: () => void;
  reset: () => void;
}

const EMPTY_MUTATION: MutationState = { submitting: new Set(), errors: {} };

function withSubmitting(prev: MutationState, taskId: string, on: boolean): MutationState {
  const next = new Set(prev.submitting);
  if (on) next.add(taskId);
  else next.delete(taskId);
  return { submitting: next, errors: prev.errors };
}

function withError(prev: MutationState, taskId: string, message: string | null): MutationState {
  if (message == null) {
    if (!(taskId in prev.errors)) return prev;
    const { [taskId]: _removed, ...rest } = prev.errors;
    return { submitting: prev.submitting, errors: rest };
  }
  return {
    submitting: prev.submitting,
    errors: { ...prev.errors, [taskId]: message },
  };
}

function upsert(
  byId: Readonly<Record<string, Task>>,
  order: readonly string[],
  task: Task,
): { byId: Readonly<Record<string, Task>>; order: readonly string[] } {
  const existed = task.id in byId;
  const nextById = { ...byId, [task.id]: { ...byId[task.id], ...task } };
  const nextOrder = existed ? order : [task.id, ...order];
  return { byId: nextById, order: nextOrder };
}

function removeFrom(
  byId: Readonly<Record<string, Task>>,
  order: readonly string[],
  taskId: string,
): { byId: Readonly<Record<string, Task>>; order: readonly string[] } {
  if (!(taskId in byId)) return { byId, order };
  const { [taskId]: _removed, ...rest } = byId;
  return { byId: rest, order: order.filter((id) => id !== taskId) };
}

export const useTaskStore = create<TaskState>((set, get) => ({
  byId: {},
  order: [],
  isLoading: false,
  initialLoaded: false,
  error: null,
  mutation: EMPTY_MUTATION,

  _eventStream: null,
  _streamUserId: null,

  fetchAll: async (options) => {
    const silent = options?.silent === true;
    if (!silent) set({ isLoading: true, error: null });
    try {
      const items = await taskService.listTasks({ limit: FETCH_LIMIT });
      set((state) => {
        const submitting = state.mutation.submitting;
        const byId: Record<string, Task> = {};
        const order: string[] = [];
        for (const task of items) {
          if (submitting.has(task.id)) {
            // In-flight mutation: keep local state. If task was removed optimistically, don't re-add.
            const existing = state.byId[task.id];
            if (existing) {
              byId[task.id] = existing;
              order.push(task.id);
            }
          } else {
            byId[task.id] = task;
            order.push(task.id);
          }
        }
        return {
          byId,
          order,
          isLoading: false,
          initialLoaded: true,
          error: null,
        };
      });
    } catch (err) {
      if (silent) return;
      set({ error: toErrorMessage(err), isLoading: false, initialLoaded: true });
    }
  },

  createTask: async (input: CreateTaskInput) => {
    const created = await taskService.createTask(input);
    set((state) => upsert(state.byId, state.order, created));
    return created;
  },

  patchTask: async (taskId: string, body: PatchTaskInput) => {
    set((state) => ({
      mutation: withError(withSubmitting(state.mutation, taskId, true), taskId, null),
    }));
    try {
      const updated = await taskService.patchTask(taskId, body);
      set((state) => ({
        ...upsert(state.byId, state.order, updated),
        mutation: withSubmitting(state.mutation, taskId, false),
      }));
      return updated;
    } catch (err) {
      const message = toErrorMessage(err);
      set((state) => ({
        mutation: withError(withSubmitting(state.mutation, taskId, false), taskId, message),
      }));
      throw err;
    }
  },

  acceptProposal: async (taskId: string) => {
    const original = get().byId[taskId];
    if (!original) return;
    set((state) => ({
      byId: { ...state.byId, [taskId]: { ...original, status: "todo" } },
      mutation: withError(withSubmitting(state.mutation, taskId, true), taskId, null),
    }));
    try {
      const updated = await taskService.patchTask(taskId, { status: "todo" });
      set((state) => ({
        byId: { ...state.byId, [taskId]: updated },
        mutation: withSubmitting(state.mutation, taskId, false),
      }));
    } catch (err) {
      set((state) => ({
        byId: { ...state.byId, [taskId]: original },
        mutation: withError(
          withSubmitting(state.mutation, taskId, false),
          taskId,
          toErrorMessage(err),
        ),
      }));
    }
  },

  rejectProposal: async (taskId: string) => {
    const original = get().byId[taskId];
    if (!original) return;
    set((state) => ({
      byId: { ...state.byId, [taskId]: { ...original, status: "archived" } },
      mutation: withError(withSubmitting(state.mutation, taskId, true), taskId, null),
    }));
    try {
      const updated = await taskService.patchTask(taskId, { status: "archived" });
      set((state) => ({
        byId: { ...state.byId, [taskId]: updated },
        mutation: withSubmitting(state.mutation, taskId, false),
      }));
    } catch (err) {
      set((state) => ({
        byId: { ...state.byId, [taskId]: original },
        mutation: withError(
          withSubmitting(state.mutation, taskId, false),
          taskId,
          toErrorMessage(err),
        ),
      }));
    }
  },

  toggleComplete: async (taskId: string, complete: boolean) => {
    return get().updateStatus(taskId, complete ? "completed" : "todo");
  },

  updateStatus: async (taskId: string, status: TaskStatus) => {
    const original = get().byId[taskId];
    if (!original || original.status === status) return;
    set((state) => ({
      byId: { ...state.byId, [taskId]: { ...original, status } },
      mutation: withError(withSubmitting(state.mutation, taskId, true), taskId, null),
    }));
    try {
      const updated = await taskService.patchTask(taskId, { status });
      set((state) => ({
        byId: { ...state.byId, [taskId]: updated },
        mutation: withSubmitting(state.mutation, taskId, false),
      }));
    } catch (err) {
      set((state) => ({
        byId: { ...state.byId, [taskId]: original },
        mutation: withError(
          withSubmitting(state.mutation, taskId, false),
          taskId,
          toErrorMessage(err),
        ),
      }));
    }
  },

  deleteTask: async (taskId: string) => {
    const snapshot = get();
    const original = snapshot.byId[taskId];
    if (!original) return;
    const removed = removeFrom(snapshot.byId, snapshot.order, taskId);
    // submitting flag prevents a concurrent fetchAll from re-adding the task before DELETE commits.
    set({
      ...removed,
      mutation: withSubmitting(snapshot.mutation, taskId, true),
    });
    try {
      await taskService.deleteTask(taskId);
      set((state) => ({ mutation: withSubmitting(state.mutation, taskId, false) }));
    } catch (err) {
      set((state) => ({
        ...upsert(state.byId, state.order, original),
        mutation: withError(
          withSubmitting(state.mutation, taskId, false),
          taskId,
          toErrorMessage(err),
        ),
      }));
      throw err;
    }
  },

  startEventStream: (userId: string) => {
    const { _streamUserId, _eventStream } = get();
    if (_eventStream && _streamUserId === userId) return;

    get().stopEventStream();

    const handle = startTaskEventStream({
      onTaskUpsert: (task) => {
        set((state) => upsert(state.byId, state.order, task));
      },
    });

    set({ _eventStream: handle, _streamUserId: userId });
    void get().fetchAll();
  },

  stopEventStream: () => {
    get()._eventStream?.stop();
    set({ _eventStream: null, _streamUserId: null });
  },

  reset: () => {
    get().stopEventStream();
    set({
      byId: {},
      order: [],
      isLoading: false,
      initialLoaded: false,
      error: null,
      mutation: EMPTY_MUTATION,
    });
  },
}));
