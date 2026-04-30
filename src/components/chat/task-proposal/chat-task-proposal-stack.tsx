import { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { useShallow } from "zustand/react/shallow";

import { Spacing } from "@/constants/theme";
import { useTaskStore } from "@/stores/task-store";
import type { Task } from "@/types/task";

import { ChatTaskProposalCard } from "./chat-task-proposal-card";

const MAX_VISIBLE = 3;

interface ChatTaskProposalStackProps {
  readonly bottomOffset?: number;
  readonly onHeightChange?: (height: number) => void;
}

export function ChatTaskProposalStack({
  bottomOffset = 0,
  onHeightChange,
}: ChatTaskProposalStackProps) {
  const { byId, order, mutation } = useTaskStore(
    useShallow((s) => ({ byId: s.byId, order: s.order, mutation: s.mutation })),
  );
  const acceptProposal = useTaskStore((s) => s.acceptProposal);
  const rejectProposal = useTaskStore((s) => s.rejectProposal);

  const visibleTasks = useMemo<readonly Task[]>(() => {
    const tasks: Task[] = [];
    for (const id of order) {
      const task = byId[id];
      if (task && task.status === "draft" && task.source === "chat") {
        tasks.push(task);
        if (tasks.length === MAX_VISIBLE) break;
      }
    }
    return tasks;
  }, [byId, order]);

  const lastReportedHeightRef = useRef(0);
  const reportHeight = useCallback(
    (height: number) => {
      if (lastReportedHeightRef.current === height) return;
      lastReportedHeightRef.current = height;
      onHeightChange?.(height);
    },
    [onHeightChange],
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      reportHeight(event.nativeEvent.layout.height);
    },
    [reportHeight],
  );

  useEffect(() => {
    if (visibleTasks.length === 0) reportHeight(0);
  }, [visibleTasks.length, reportHeight]);

  if (visibleTasks.length === 0) return null;

  return (
    <View
      style={[styles.container, { bottom: bottomOffset }]}
      pointerEvents="box-none"
      onLayout={handleLayout}
    >
      <View style={styles.stack} pointerEvents="box-none">
        {visibleTasks.map((task) => (
          <ChatTaskProposalCard
            key={task.id}
            task={task}
            submitting={mutation.submitting.has(task.id)}
            errorMessage={mutation.errors[task.id] ?? null}
            onAccept={acceptProposal}
            onReject={rejectProposal}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    zIndex: 49,
  },
  stack: {
    width: "100%",
    gap: Spacing.two,
  },
});
