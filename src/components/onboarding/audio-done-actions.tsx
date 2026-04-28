import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

interface AudioDoneActionsProps {
  onRestart: () => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
}

export function AudioDoneActions({
  onRestart,
  onConfirm,
  confirmLoading = false,
  confirmDisabled = false,
}: AudioDoneActionsProps): React.ReactElement {
  const isConfirmBlocked = confirmLoading || confirmDisabled;

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Pressable
          onPress={onRestart}
          disabled={confirmLoading}
          hitSlop={8}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
            confirmLoading && styles.buttonLoading,
          ]}
        >
          <Ionicons name="refresh" size={16} color={SemanticColors.warning} />
          <ThemedText type="labelMd" style={styles.secondaryLabel}>
            Reintentar
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={onConfirm}
          disabled={isConfirmBlocked}
          hitSlop={8}
          style={({ pressed }) => [
            styles.primaryButton,
            isConfirmBlocked && styles.primaryButtonDisabled,
            pressed && !isConfirmBlocked && styles.primaryButtonPressed,
          ]}
        >
          {confirmLoading ? (
            <ActivityIndicator color={SemanticColors.onSuccess} size="small" />
          ) : (
            <Ionicons name="checkmark" size={16} color={SemanticColors.onSuccess} />
          )}
          <ThemedText type="labelMd" style={styles.primaryLabel}>
            Confirmar
          </ThemedText>
        </Pressable>
      </View>

      {confirmLoading ? (
        <ThemedText type="bodySm" style={styles.hint}>
          Procesando tu respuesta…
        </ThemedText>
      ) : confirmDisabled ? (
        <ThemedText type="bodySm" style={styles.hint}>
          Escribe o edita la transcripción para confirmar.
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,149,0,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,149,0,0.30)",
    minHeight: 42,
  },
  secondaryButtonPressed: {
    backgroundColor: "rgba(255,149,0,0.16)",
    borderColor: "rgba(255,149,0,0.45)",
  },
  secondaryLabel: {
    color: SemanticColors.warning,
    letterSpacing: 0.4,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: SemanticColors.success,
    minHeight: 42,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonDisabled: {
    backgroundColor: "rgba(0,255,132,0.25)",
  },
  primaryLabel: {
    color: SemanticColors.onSuccess,
  },
  buttonLoading: {
    opacity: 0.6,
  },
  hint: {
    color: SemanticColors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  },
});
