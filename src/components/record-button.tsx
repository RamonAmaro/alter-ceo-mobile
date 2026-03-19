import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

type RecordingState = "idle" | "recording" | "paused";

interface RecordButtonProps {
  state: RecordingState;
  onRecord: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onRestart: () => void;
}

interface CircleButtonProps {
  size?: number;
  gradientId: string;
  colors: [string, string];
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  pulse?: boolean;
}

function CircleButton({
  size = 80,
  gradientId,
  colors,
  icon,
  label,
  onPress,
  pulse = false,
}: CircleButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (pulse) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [pulse]);

  const viewBox = "0 0 139 140";
  const cx = 69.55;
  const cy = 69.67;

  return (
    <View style={styles.actionWrapper}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Animated.View
          style={[
            styles.circleButton,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Svg width={size} height={size} viewBox={viewBox} fill="none">
            <Defs>
              <RadialGradient
                id={gradientId}
                cx={cx}
                cy={cy}
                r="37.69"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor={colors[0]} />
                <Stop offset="1" stopColor={colors[1]} />
              </RadialGradient>
            </Defs>
            <Circle cx={cx} cy={cy} r="44.62" fill="#A8A8A8" />
            <Circle cx={cx} cy={cy} r="39.73" fill="#D8D8D8" />
            <Circle cx={cx} cy={cy} r="37.48" fill={`url(#${gradientId})`} />
            {icon}
          </Svg>
        </Animated.View>
      </TouchableOpacity>
      <ThemedText
        type="caption"
        style={{ color: "#ffffff", textAlign: "center" }}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const MicIcon = (
  <>
    <Path
      d="M69.57 47.65h-.02c-4.75 0-8.6 3.83-8.6 8.56v13.88c0 4.73 3.85 8.56 8.6 8.56h.02c4.75 0 8.6-3.83 8.6-8.56V56.21c0-4.73-3.85-8.56-8.6-8.56Z"
      fill="white"
    />
    <Path
      d="M81.76 66.5c-.77 0-1.39.61-1.39 1.38v2.2c0 5.93-4.86 10.78-10.84 10.78-5.98 0-10.84-4.83-10.84-10.78v-2.2c0-.77-.62-1.38-1.39-1.38-.77 0-1.39.61-1.39 1.38v2.2c0 7 5.37 12.78 12.21 13.46v5.36h-3.59c-.77 0-1.39.61-1.39 1.38v1.38h12.74v-1.38c0-.77-.62-1.38-1.39-1.38h-3.59v-5.36c6.84-.7 12.21-6.47 12.21-13.46v-2.2c0-.77-.62-1.38-1.39-1.38h.04Z"
      fill="white"
    />
  </>
);

const PauseIcon = (
  <>
    <Rect x="55" y="50" width="10" height="40" rx="3" fill="white" />
    <Rect x="74" y="50" width="10" height="40" rx="3" fill="white" />
  </>
);

const PlayIcon = (
  <Path d="M58 48 l30 22 l-30 22 Z" fill="white" />
);

const StopIcon = (
  <Rect x="53" y="53" width="33" height="33" rx="4" fill="white" />
);

const RestartIcon = (
  <Path
    d="M85 70a16 16 0 1 1-4.7-11.3l-4.3 4.3h12v-12l-4.2 4.2A20 20 0 1 0 89 70h-4Z"
    fill="white"
  />
);

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
  const anim = useRef(new Animated.Value(0)).current;
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
        style={[
          styles.layer,
          { opacity: idleOpacity, transform: [{ scale: idleScale }] },
        ]}
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
            label="Finalizar"
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
  actionWrapper: {
    alignItems: "center",
    gap: Spacing.one,
  },
  circleButton: {
    shadowColor: "#00FFF8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
