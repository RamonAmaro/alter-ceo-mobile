import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import { Animated, type LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors } from "@/constants/theme";

import type { ProposalField } from "./entity-proposal-presenter";

interface EntityProposalFieldsProps {
  readonly fields: readonly ProposalField[];
}

const COLLAPSED_LINES = 2;

/**
 * Mostra os campos da proposta. Se o conteúdo natural ultrapassa o limite de
 * 2 linhas por campo, exibe um "Ver más" discreto que expande/recolhe com
 * animação de altura.
 *
 * A altura natural é medida na primeira render (quando ainda não há clamp).
 * Se a altura medida for maior que o limite teórico de 2 linhas × N campos,
 * marcamos como expansível e aplicamos o clamp.
 *
 * Nota: animar `height` exige `useNativeDriver: false` (regra do projeto
 * proíbe LayoutAnimation, e height não roda no native driver). Aceitável aqui
 * porque o card aparece em volume baixo (1-3 propostas simultâneas no chat).
 */
export function EntityProposalFields({ fields }: EntityProposalFieldsProps) {
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedReady = useRef(false);

  const handleNaturalLayout = useCallback(
    (event: LayoutChangeEvent) => {
      // Mede uma única vez, na primeira render onde ainda não há clamp.
      if (naturalHeight != null) return;
      const measured = event.nativeEvent.layout.height;
      if (measured <= 0) return;
      setNaturalHeight(measured);
    },
    [naturalHeight],
  );

  const handleClampedLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (collapsedHeight != null) return;
      const measured = event.nativeEvent.layout.height;
      if (measured <= 0) return;
      setCollapsedHeight(measured);
      if (!animatedReady.current) {
        animatedHeight.setValue(measured);
        animatedReady.current = true;
      }
    },
    [collapsedHeight, animatedHeight],
  );

  const canExpand =
    naturalHeight != null && collapsedHeight != null && naturalHeight - collapsedHeight > 1;

  const toggle = useCallback(() => {
    if (!canExpand || naturalHeight == null || collapsedHeight == null) return;
    const next = !expanded;
    setExpanded(next);
    Animated.timing(animatedHeight, {
      toValue: next ? naturalHeight : collapsedHeight,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [canExpand, expanded, naturalHeight, collapsedHeight, animatedHeight]);

  // Fase 1: ainda não medimos a altura natural — render sem clamp para medir.
  if (naturalHeight == null) {
    return (
      <View style={styles.list} onLayout={handleNaturalLayout}>
        {fields.map((field) => (
          <FieldLine key={field.label} field={field} />
        ))}
      </View>
    );
  }

  // Fase 2: já temos a altura natural — aplica clamp e mede colapsado.
  // A partir daqui o componente fica estável.
  const lineLimit = expanded ? undefined : COLLAPSED_LINES;
  const containerStyle = animatedReady.current ? { height: animatedHeight } : null;

  return (
    <TouchableOpacity
      activeOpacity={canExpand ? 0.7 : 1}
      onPress={canExpand ? toggle : undefined}
      accessibilityRole={canExpand ? "button" : undefined}
      accessibilityLabel={canExpand ? (expanded ? "Ver menos" : "Ver más") : undefined}
      accessibilityState={canExpand ? { expanded } : undefined}
    >
      <Animated.View style={[styles.clamp, containerStyle]}>
        <View
          style={styles.list}
          onLayout={collapsedHeight == null ? handleClampedLayout : undefined}
        >
          {fields.map((field) => (
            <FieldLine key={field.label} field={field} numberOfLines={lineLimit} />
          ))}
        </View>
      </Animated.View>

      {canExpand && (
        <View style={styles.toggleRow}>
          <ThemedText type="caption" style={styles.toggleLabel}>
            {expanded ? "Ver menos" : "Ver más"}
          </ThemedText>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={12}
            color={SemanticColors.success}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

interface FieldLineProps {
  readonly field: ProposalField;
  readonly numberOfLines?: number;
}

function FieldLine({ field, numberOfLines }: FieldLineProps) {
  return (
    <ThemedText type="caption" style={styles.fieldLine} numberOfLines={numberOfLines}>
      <ThemedText type="caption" style={styles.fieldLabel}>
        {field.label}
      </ThemedText>
      <ThemedText type="caption" style={styles.fieldValue}>
        {"  "}
        {field.value}
      </ThemedText>
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  clamp: {
    overflow: "hidden",
  },
  list: {
    gap: 2,
  },
  fieldLine: {
    fontSize: 11,
    lineHeight: 15,
  },
  fieldLabel: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  fieldValue: {
    color: SemanticColors.textSecondaryLight,
    fontFamily: Fonts.montserrat,
    fontSize: 11,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  toggleLabel: {
    color: SemanticColors.success,
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
