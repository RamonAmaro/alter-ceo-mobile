import React from "react";
import { StyleSheet, View } from "react-native";

import { CircleButton } from "@/components/circle-button";
import { CheckIcon, RestartIcon } from "@/components/recording-icons";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";

interface AudioDoneActionsProps {
  onRestart: () => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
}

export function AudioDoneActions({
  onRestart,
  onConfirm,
  confirmLoading = false,
}: AudioDoneActionsProps): React.ReactElement {
  return (
    <View style={styles.wrapper}>
      <View style={styles.doneActions}>
        <CircleButton
          size={84}
          gradientId="gradRestart"
          colors={["#FF9500", "#E68400"]}
          icon={RestartIcon}
          label="Reintentar"
          onPress={onRestart}
        />
        <CircleButton
          size={84}
          gradientId="gradConfirm"
          colors={["#00D68F", "#00A86B"]}
          icon={CheckIcon}
          label="Confirmar"
          onPress={onConfirm}
          disabled={confirmLoading}
          loading={confirmLoading}
          pulse
        />
      </View>
      {confirmLoading && (
        <ThemedText type="bodySm" style={styles.disabledHint}>
          Procesando tu respuesta, espera un momento…
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    gap: Spacing.two,
  },
  doneActions: {
    flexDirection: "row",
    gap: Spacing.five,
    justifyContent: "center",
    width: "100%",
  },
  disabledHint: {
    color: SemanticColors.textMuted,
    textAlign: "center",
    fontStyle: "italic",
  },
});
