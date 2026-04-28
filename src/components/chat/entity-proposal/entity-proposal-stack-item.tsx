import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { EntityProposalCard } from "@/components/chat/entity-proposal/entity-proposal-card";
import type { ProposalEntry } from "@/hooks/use-chat-proposals";

const STACK_OFFSET_Y = 10;
const STACK_SCALE_STEP = 0.04;
const STACK_OPACITY_STEP = 0.25;
const ENTER_DURATION_MS = 320;
const EXIT_DURATION_MS = 240;
const REPOSITION_DURATION_MS = 260;

interface EntityProposalStackItemProps {
  readonly entry: ProposalEntry;
  readonly depth: number;
  readonly isExiting: boolean;
  readonly isLayoutAnchor: boolean;
  readonly onConfirm: (entityId: string) => void;
  readonly onReject: (entityId: string) => void;
  readonly onExitComplete: (entityId: string) => void;
}

function targetTranslateY(depth: number): number {
  // Cards de trás "espiam" por cima do anchor: ficam mais altos.
  return -depth * STACK_OFFSET_Y;
}

function targetScale(depth: number): number {
  return Math.max(0.8, 1 - depth * STACK_SCALE_STEP);
}

function targetOpacity(depth: number): number {
  return Math.max(0.3, 1 - depth * STACK_OPACITY_STEP);
}

export function EntityProposalStackItem({
  entry,
  depth,
  isExiting,
  isLayoutAnchor,
  onConfirm,
  onReject,
  onExitComplete,
}: EntityProposalStackItemProps) {
  // Inicia invisível e levemente abaixo/menor para a animação de entrada
  // ser perceptível (fade + slide-up + scale-up).
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(targetTranslateY(depth) + 16)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(targetScale(depth) * 0.92)).current;
  const hasEnteredRef = useRef(false);

  useEffect(() => {
    if (isExiting) return;

    const isFirstAppearance = !hasEnteredRef.current;
    hasEnteredRef.current = true;
    const duration = isFirstAppearance ? ENTER_DURATION_MS : REPOSITION_DURATION_MS;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: targetOpacity(depth),
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: targetTranslateY(depth),
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: targetScale(depth),
        duration,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depth, isExiting]);

  useEffect(() => {
    if (!isExiting) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 80,
        duration: EXIT_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onExitComplete(entry.entityId);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExiting]);

  const interactive = depth === 0 && !isExiting;

  const animatedStyle = {
    opacity,
    transform: [{ translateY }, { translateX }, { scale }],
    // O anchor (depth 0) precisa do maior zIndex; cards de trás ficam abaixo.
    zIndex: 100 - depth,
  } as const;

  return (
    <Animated.View
      style={[isLayoutAnchor ? styles.anchorItem : styles.floatingItem, animatedStyle]}
    >
      <EntityProposalCard
        entry={entry}
        interactive={interactive}
        onConfirm={onConfirm}
        onReject={onReject}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  anchorItem: {
    width: "100%",
  },
  floatingItem: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
});
