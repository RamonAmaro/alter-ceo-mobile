import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useBusinessEntityProposalsStore } from "@/stores/business-entity-proposals-store";
import type { KPIPayload } from "@/types/business-entity";

interface EntityProposalCardProps {
  readonly entityId: string;
  readonly interactive: boolean;
}

function buildMetaLine(payload: KPIPayload): string {
  const parts = [
    payload.numeric_value ? `Valor: ${payload.numeric_value}` : null,
    payload.temporality ? `Temporalidad: ${payload.temporality}` : null,
  ].filter((part): part is string => Boolean(part));
  return parts.join(" · ");
}

export function EntityProposalCard({ entityId, interactive }: EntityProposalCardProps) {
  const entry = useBusinessEntityProposalsStore((s) => s.proposals[entityId]);
  const confirm = useBusinessEntityProposalsStore((s) => s.confirm);
  const reject = useBusinessEntityProposalsStore((s) => s.reject);
  const { isMobile } = useResponsiveLayout();

  const handleConfirm = useCallback(() => {
    void confirm(entityId);
  }, [confirm, entityId]);

  const handleReject = useCallback(() => {
    void reject(entityId);
  }, [reject, entityId]);

  if (!entry) return null;

  const payload = entry.payload;
  const isSubmitting = entry.submission === "submitting";
  const disabled = !interactive || isSubmitting;
  const metaLine = buildMetaLine(payload);

  return (
    <View
      style={[styles.card, isMobile ? styles.cardMobile : styles.cardDesktop]}
      pointerEvents={interactive ? "auto" : "none"}
    >
      <View style={styles.body}>
        <View style={styles.iconBadge}>
          <Ionicons name="analytics" size={20} color={SemanticColors.onSuccess} />
        </View>

        <View style={styles.content}>
          <ThemedText type="bodySm" style={styles.helper}>
            Para darle seguimiento a este objetivo, puedo crear un KPI:
          </ThemedText>
          <ThemedText type="labelSm" style={styles.title}>
            {payload.title}
          </ThemedText>
          {metaLine.length > 0 && (
            <ThemedText type="caption" style={styles.meta}>
              {metaLine}
            </ThemedText>
          )}
          {entry.errorMessage && (
            <ThemedText type="caption" style={styles.error}>
              {entry.errorMessage}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={[styles.actions, isMobile ? styles.actionsMobile : styles.actionsDesktop]}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.rejectButton,
            isMobile && styles.buttonFlex,
            disabled && styles.buttonDisabled,
          ]}
          onPress={handleReject}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="No, gracias"
        >
          <ThemedText type="caption" style={styles.rejectLabel}>
            No, gracias
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.confirmButton,
            isMobile && styles.buttonFlex,
            disabled && styles.buttonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={disabled}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Sí, guardarlo"
        >
          {isSubmitting ? (
            <ActivityIndicator color={SemanticColors.onSuccess} size="small" />
          ) : (
            <ThemedText type="caption" style={styles.confirmLabel}>
              Sí, guardarlo
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.35)",
    backgroundColor: "rgba(7,30,18,0.92)",
  },
  cardMobile: {
    flexDirection: "column",
  },
  cardDesktop: {
    flexDirection: "row",
    alignItems: "center",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    minWidth: 0,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: SemanticColors.success,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  helper: {
    color: SemanticColors.textSecondaryLight,
    fontFamily: Fonts.montserrat,
    fontSize: 11,
  },
  title: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    marginTop: 2,
  },
  meta: {
    color: SemanticColors.textMuted,
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    marginTop: 2,
  },
  error: {
    color: SemanticColors.error,
    fontFamily: Fonts.montserratMedium,
    fontSize: 10,
    marginTop: 2,
  },
  actions: {
    gap: Spacing.one,
    flexShrink: 0,
  },
  actionsDesktop: {
    flexDirection: "row",
  },
  actionsMobile: {
    flexDirection: "row",
    width: "100%",
  },
  button: {
    minHeight: 36,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 84,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "transparent",
  },
  confirmButton: {
    backgroundColor: SemanticColors.success,
  },
  rejectLabel: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
  },
  confirmLabel: {
    color: SemanticColors.onSuccess,
    fontFamily: Fonts.montserratBold,
  },
});
