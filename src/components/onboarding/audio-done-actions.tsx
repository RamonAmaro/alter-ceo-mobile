import React from "react";
import { StyleSheet, View } from "react-native";

import { CircleButton } from "@/components/circle-button";
import { CheckIcon, RestartIcon } from "@/components/recording-icons";
import { Spacing } from "@/constants/theme";

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
  );
}

const styles = StyleSheet.create({
  doneActions: {
    flexDirection: "row",
    gap: Spacing.five,
    justifyContent: "center",
    width: "100%",
  },
});
