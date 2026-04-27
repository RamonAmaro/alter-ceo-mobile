import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

import { EntityProposalCard } from "@/components/chat/entity-proposal/entity-proposal-card";

const STACK_OFFSET_Y = 10;
const STACK_SCALE_STEP = 0.04;
const STACK_OPACITY_STEP = 0.25;
const EXIT_DURATION_MS = 240;
const REPOSITION_DURATION_MS = 260;

interface EntityProposalStackItemProps {
  readonly entityId: string;
  readonly depth: number;
  readonly isExiting: boolean;
  readonly isLayoutAnchor: boolean;
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
  entityId,
  depth,
  isExiting,
  isLayoutAnchor,
  onExitComplete,
}: EntityProposalStackItemProps) {
  const opacity = useRef(new Animated.Value(targetOpacity(depth))).current;
  const translateY = useRef(new Animated.Value(targetTranslateY(depth))).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(targetScale(depth))).current;

  useEffect(() => {
    if (isExiting) return;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: targetTranslateY(depth),
        duration: REPOSITION_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: targetScale(depth),
        duration: REPOSITION_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: targetOpacity(depth),
        duration: REPOSITION_DURATION_MS,
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
      if (finished) onExitComplete(entityId);
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
      <EntityProposalCard entityId={entityId} interactive={interactive} />
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
