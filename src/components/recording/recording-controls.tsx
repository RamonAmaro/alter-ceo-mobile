import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { useCallback, useRef } from "react";
import { Animated, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { CircleButton } from "@/components/circle-button";
import { MicIcon } from "@/components/recording-icons";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { Ionicons } from "@expo/vector-icons";

type RecordingState = "idle" | "recording" | "paused";

interface RecordingControlsProps {
  state: RecordingState;
  onRecord: () => void;
  onPauseResume: () => void;
  onDelete: () => void;
  onSave: () => void;
}

type ActionTone = "danger" | "warning" | "info" | "success";

interface ActionButtonProps {
  tone: ActionTone;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
  size: number;
  iconSize: number;
}

const TONE_STYLES: Record<ActionTone, { background: string; border: string }> = {
  danger: { background: "#FF4444", border: "rgba(255,255,255,0.15)" },
  warning: { background: "#FF9500", border: "rgba(255,255,255,0.15)" },
  info: { background: "#0060FF", border: "rgba(255,255,255,0.18)" },
  success: { background: "#00B864", border: "rgba(255,255,255,0.18)" },
};

function ActionButton({ tone, icon, label, onPress, size, iconSize }: ActionButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const toneStyle = TONE_STYLES[tone];
  const radius = size / 2;

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 90,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 20,
        bounciness: 10,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();
    onPress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPress]);

  return (
    <View style={styles.actionWrapper}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.actionButton,
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: toneStyle.background,
              borderColor: toneStyle.border,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
      <ThemedText style={styles.actionLabel}>{label}</ThemedText>
    </View>
  );
}

export function RecordingControls({
  state,
  onRecord,
  onPauseResume,
  onDelete,
  onSave,
}: RecordingControlsProps) {
  const { isMobile } = useResponsiveLayout();
  const mainSize = isMobile ? 96 : 80;
  const actionSize = isMobile ? 64 : 56;
  const actionIconSize = isMobile ? 26 : 22;

  if (state === "idle") {
    return (
      <View style={styles.container}>
        <CircleButton
          size={mainSize}
          gradientId="gradMicRec"
          colors={["#00C0EE", "#0060FF"]}
          icon={MicIcon}
          label="Grabar"
          onPress={onRecord}
        />
      </View>
    );
  }

  const pauseOrResume: ActionButtonProps =
    state === "recording"
      ? {
          tone: "warning",
          icon: "pause",
          label: "Pausar",
          onPress: onPauseResume,
          size: actionSize,
          iconSize: actionIconSize,
        }
      : {
          tone: "info",
          icon: "play",
          label: "Reanudar",
          onPress: onPauseResume,
          size: actionSize,
          iconSize: actionIconSize,
        };

  return (
    <View style={styles.container}>
      <ActionButton
        tone="danger"
        icon="trash"
        label="Eliminar"
        onPress={onDelete}
        size={actionSize}
        iconSize={actionIconSize}
      />
      <ActionButton {...pauseOrResume} />
      <ActionButton
        tone="success"
        icon="checkmark"
        label="Finalizar"
        onPress={onSave}
        size={actionSize}
        iconSize={actionIconSize}
      />
    </View>
  );
}

const actionShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  android: { elevation: 8 },
  web: { boxShadow: "0 6px 18px rgba(0,0,0,0.35)" },
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: Spacing.four,
    paddingBottom: Spacing.two,
  },
  actionWrapper: {
    alignItems: "center",
    gap: Spacing.one,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...actionShadow,
  },
  actionLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.textPrimary,
    letterSpacing: 0.3,
  },
});
