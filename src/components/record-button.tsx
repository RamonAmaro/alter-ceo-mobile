import { Spacing } from "@/constants/theme";
import { CircleButton } from "@/components/circle-button";
import { MicIcon, PauseIcon, PlayIcon, StopIcon, RestartIcon } from "@/components/recording-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

type RecordingState = "idle" | "recording" | "paused";

interface RecordButtonProps {
  state: RecordingState;
  onRecord: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onRestart: () => void;
}

const CONTAINER_HEIGHT = 140;
const TRANSITION_MS = 200;

export function RecordButton({
  state,
  onRecord,
  onPause,
  onResume,
  onFinish,
  onRestart,
}: RecordButtonProps) {
  const anim = useRef(new Animated.Value(state !== "idle" ? 1 : 0)).current;
  const prevStateRef = useRef(state);

  useEffect(() => {
    const wasIdle = prevStateRef.current === "idle";
    const isIdle = state === "idle";
    prevStateRef.current = state;

    if (wasIdle && !isIdle) {
      Animated.timing(anim, {
        toValue: 1,
        duration: TRANSITION_MS,
        useNativeDriver: true,
      }).start();
    } else if (!wasIdle && isIdle) {
      Animated.timing(anim, {
        toValue: 0,
        duration: TRANSITION_MS,
        useNativeDriver: true,
      }).start();
    }
  }, [state]);

  const idleOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const idleScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });

  const controlsOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const controlsScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  const isIdle = state === "idle";

  return (
    <View style={styles.buttonContainer}>
      <Animated.View
        style={[styles.layer, { opacity: idleOpacity, transform: [{ scale: idleScale }] }]}
        pointerEvents={isIdle ? "auto" : "none"}
      >
        <CircleButton
          size={120}
          gradientId="gradMic"
          colors={["#00C0EE", "#0060FF"]}
          icon={MicIcon}
          label="Grabar ahora"
          onPress={onRecord}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.layer,
          {
            opacity: controlsOpacity,
            transform: [{ scale: controlsScale }],
          },
        ]}
        pointerEvents={isIdle ? "none" : "auto"}
      >
        <View style={styles.controlsRow}>
          {state === "recording" || isIdle ? (
            <CircleButton
              size={70}
              gradientId="gradPause"
              colors={["#E05555", "#B83030"]}
              icon={PauseIcon}
              label="Pausar"
              onPress={onPause}
              pulse={state === "recording"}
            />
          ) : (
            <CircleButton
              size={70}
              gradientId="gradResume"
              colors={["#00C0EE", "#0060FF"]}
              icon={PlayIcon}
              label="Reanudar"
              onPress={onResume}
            />
          )}

          <CircleButton
            size={70}
            gradientId="gradRestart"
            colors={["#FF9500", "#E68400"]}
            icon={RestartIcon}
            label="Reiniciar"
            onPress={onRestart}
          />

          <CircleButton
            size={70}
            gradientId="gradFinish"
            colors={["#00D68F", "#00A86B"]}
            icon={StopIcon}
            label="Parar"
            onPress={onFinish}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    height: CONTAINER_HEIGHT,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  layer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: Spacing.four,
  },
});
