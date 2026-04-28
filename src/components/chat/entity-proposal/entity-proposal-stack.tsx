import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, View, type LayoutChangeEvent } from "react-native";

import { EntityProposalCounter } from "@/components/chat/entity-proposal/entity-proposal-counter";
import { EntityProposalStackItem } from "@/components/chat/entity-proposal/entity-proposal-stack-item";
import { Spacing } from "@/constants/theme";
import type { ProposalEntry } from "@/hooks/use-chat-proposals";

const MAX_VISIBLE_DEPTH = 3;
const APPEAR_DURATION_MS = 280;
const DISAPPEAR_DURATION_MS = 220;

interface DerivedItem {
  readonly entry: ProposalEntry;
  readonly depth: number;
  readonly isExiting: boolean;
}

interface EntityProposalStackProps {
  /** Mapa id → entry. Vem do state local do chat. */
  readonly proposals: Record<string, ProposalEntry>;
  /** Ordem de exibição. */
  readonly order: readonly string[];
  /** Aceitar/rejeitar — fluxo via callback do chat. */
  readonly onConfirm: (entityId: string) => void;
  readonly onReject: (entityId: string) => void;
  /** Remove a proposta resolvida do state após terminar a animação de saída. */
  readonly onRemove: (entityId: string) => void;
  /** Offset em pixels para subir o stack (ex.: altura do ChatInput). */
  readonly bottomOffset?: number;
  /** Callback chamado quando a altura do stack muda. */
  readonly onHeightChange?: (height: number) => void;
}

export function EntityProposalStack({
  proposals,
  order,
  onConfirm,
  onReject,
  onRemove,
  bottomOffset = 0,
  onHeightChange,
}: EntityProposalStackProps) {
  const [exiting, setExiting] = useState<readonly string[]>([]);
  // Conjunto de ids já processados pela animação de saída — evita reentrar
  // em loop caso o state demore para remover ou volte a emitir o id.
  const processedExitsRef = useRef<Set<string>>(new Set());

  const handleExitComplete = useCallback(
    (entityId: string) => {
      setExiting((current) => current.filter((id) => id !== entityId));
      onRemove(entityId);
    },
    [onRemove],
  );

  // Detecta novas resoluções (status passou para active/archived) e adiciona
  // ao conjunto `exiting` uma única vez.
  useEffect(() => {
    const newlyResolved: string[] = [];
    for (const id of order) {
      const entry = proposals[id];
      if (!entry) continue;
      if (entry.status === "proposed") continue;
      if (processedExitsRef.current.has(id)) continue;
      processedExitsRef.current.add(id);
      newlyResolved.push(id);
    }
    if (newlyResolved.length === 0) return;
    setExiting((current) => [...current, ...newlyResolved]);
  }, [proposals, order]);

  const pendingIds = useMemo(
    () =>
      order.filter((id) => {
        const entry = proposals[id];
        return entry != null && entry.status === "proposed";
      }),
    [order, proposals],
  );

  const items = useMemo<DerivedItem[]>(() => {
    const visiblePending = pendingIds.slice(0, MAX_VISIBLE_DEPTH).map((entityId, index) => {
      const entry = proposals[entityId];
      if (!entry) return null;
      return { entry, depth: index, isExiting: false };
    });

    const exitingItems = exiting.map((entityId) => {
      const entry = proposals[entityId];
      if (!entry) return null;
      return { entry, depth: 0, isExiting: true };
    });

    const all = [...exitingItems, ...visiblePending];
    return all.filter((item): item is DerivedItem => item !== null);
  }, [proposals, exiting, pendingIds]);

  // Visibilidade animada do wrapper inteiro: o componente fica montado durante
  // a animação de saída e só desmonta depois para evitar "pop" abrupto.
  const shouldShow = items.length > 0;
  const [mounted, setMounted] = useState(shouldShow);
  const wrapperOpacity = useRef(new Animated.Value(shouldShow ? 1 : 0)).current;
  const wrapperTranslateY = useRef(new Animated.Value(shouldShow ? 0 : 12)).current;

  useEffect(() => {
    if (shouldShow) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(wrapperOpacity, {
          toValue: 1,
          duration: APPEAR_DURATION_MS,
          useNativeDriver: true,
        }),
        Animated.timing(wrapperTranslateY, {
          toValue: 0,
          duration: APPEAR_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(wrapperOpacity, {
        toValue: 0,
        duration: DISAPPEAR_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(wrapperTranslateY, {
        toValue: 12,
        duration: DISAPPEAR_DURATION_MS,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setMounted(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  // Reporta a altura do stack para o chat reservar espaço. Reporta 0 quando
  // desmonta (transição final). Usa um ref para evitar reportar valores
  // idênticos consecutivos — onLayout pode disparar a cada render.
  const lastReportedHeightRef = useRef<number>(0);

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
    if (!mounted) reportHeight(0);
  }, [mounted, reportHeight]);

  if (!mounted) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          opacity: wrapperOpacity,
          transform: [{ translateY: wrapperTranslateY }],
        },
      ]}
      pointerEvents="box-none"
      onLayout={handleLayout}
    >
      <View style={styles.stack} pointerEvents="box-none">
        <EntityProposalCounter current={1} total={pendingIds.length} />
        {items.map((item, index) => (
          <EntityProposalStackItem
            key={item.entry.entityId}
            entry={item.entry}
            depth={item.depth}
            isExiting={item.isExiting}
            isLayoutAnchor={index === 0}
            onConfirm={onConfirm}
            onReject={onReject}
            onExitComplete={handleExitComplete}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    overflow: "visible",
    zIndex: 50,
  },
  stack: {
    width: "100%",
    position: "relative",
    overflow: "visible",
  },
});
