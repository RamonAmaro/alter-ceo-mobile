import { Ionicons } from "@expo/vector-icons";
import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useBusinessEntityProposalsStore } from "@/stores/business-entity-proposals-store";

import { EntityProposalFields } from "./entity-proposal-fields";
import { presentProposal } from "./entity-proposal-presenter";

interface EntityProposalCardProps {
  readonly entityId: string;
  readonly interactive: boolean;
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

  const isSubmitting = entry.submission === "submitting";
  const disabled = !interactive || isSubmitting;
  const presentation = presentProposal(entry.payload);

  return (
    <View
      style={[styles.card, isMobile ? styles.cardMobile : styles.cardDesktop]}
      pointerEvents={interactive ? "auto" : "none"}
    >
      <View style={styles.body}>
        <View style={styles.iconBadge}>
          <Ionicons name={presentation.icon} size={16} color={SemanticColors.onSuccess} />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="labelSm" style={styles.title} numberOfLines={1}>
              {presentation.title}
            </ThemedText>
            <ThemedText type="caption" style={styles.typeChip}>
              {presentation.typeLabel}
            </ThemedText>
          </View>

          <EntityProposalFields fields={presentation.fields} />

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
            No
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
              Guardar
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
    borderRadius: 12,
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
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: SemanticColors.success,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    flexWrap: "wrap",
  },
  typeChip: {
    color: SemanticColors.success,
    fontFamily: Fonts.montserratBold,
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: "rgba(0,255,132,0.12)",
  },
  title: {
    flexShrink: 1,
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
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
    minHeight: 30,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
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
    fontSize: 11,
  },
  confirmLabel: {
    color: SemanticColors.onSuccess,
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
  },
});
