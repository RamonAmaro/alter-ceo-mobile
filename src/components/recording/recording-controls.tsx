import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { useCallback, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { CircleButton } from "@/components/circle-button";
import { MicIcon, PauseIcon, PlayIcon } from "@/components/recording-icons";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

type RecordingState = "idle" | "recording" | "paused";

interface RecordingControlsProps {
  state: RecordingState;
  onRecord: () => void;
  onDelete: () => void;
  onSave: () => void;
}

interface SideButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  scaleAnim: Animated.Value;
  glowOpacity: Animated.Value;
  glowColor: string;
}

function SideButton({ icon, label, onPress, scaleAnim, glowOpacity, glowColor }: SideButtonProps) {
  return (
    <View style={styles.sideWrapper}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Animated.View style={[styles.sideButton, { transform: [{ scale: scaleAnim }] }]}>
          {icon}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { borderRadius: 28, backgroundColor: glowColor, opacity: glowOpacity },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
      <ThemedText type="caption" style={styles.sideLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

export function RecordingControls({ state, onRecord, onDelete, onSave }: RecordingControlsProps) {
  const deleteScale = useRef(new Animated.Value(1)).current;
  const deleteGlow = useRef(new Animated.Value(0)).current;
  const saveScale = useRef(new Animated.Value(1)).current;
  const saveGlow = useRef(new Animated.Value(0)).current;
  const isActive = state === "recording" || state === "paused";

  const animateButton = useCallback(
    (scale: Animated.Value, glow: Animated.Value, callback: () => void) => {
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1.4,
            useNativeDriver: USE_NATIVE_DRIVER,
            speed: 50,
            bounciness: 6,
          }),
          Animated.timing(glow, {
            toValue: 0.55,
            duration: 120,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: USE_NATIVE_DRIVER,
            speed: 20,
            bounciness: 14,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 350,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]).start(() => {
        callback();
        deleteScale.setValue(1);
        deleteGlow.setValue(0);
        saveScale.setValue(1);
        saveGlow.setValue(0);
      });
    },
    [deleteScale, deleteGlow, saveScale, saveGlow],
  );

  const handleDelete = useCallback(() => {
    if (!isActive) return;
    animateButton(deleteScale, deleteGlow, onDelete);
  }, [isActive, animateButton, deleteScale, deleteGlow, onDelete]);

  const handleSave = useCallback(() => {
    if (!isActive) return;
    animateButton(saveScale, saveGlow, onSave);
  }, [isActive, animateButton, saveScale, saveGlow, onSave]);

  return (
    <View style={styles.container}>
      <SideButton
        icon={<Ionicons name="close" size={26} color={SemanticColors.textPrimary} />}
        label="Eliminar"
        onPress={isActive ? handleDelete : onDelete}
        scaleAnim={deleteScale}
        glowOpacity={deleteGlow}
        glowColor="#FF4444"
      />

      {state === "idle" && (
        <CircleButton
          size={120}
          gradientId="gradMicRec"
          colors={["#00C0EE", "#0060FF"]}
          icon={MicIcon}
          label="Grabar ahora"
          onPress={onRecord}
        />
      )}

      {state === "recording" && (
        <CircleButton
          size={120}
          gradientId="gradPauseRec"
          colors={["#E05555", "#B83030"]}
          icon={PauseIcon}
          label="Parar"
          onPress={onRecord}
          pulse
        />
      )}

      {state === "paused" && (
        <CircleButton
          size={120}
          gradientId="gradResumeRec"
          colors={["#00C0EE", "#0060FF"]}
          icon={PlayIcon}
          label="Continuar"
          onPress={onRecord}
        />
      )}

      <SideButton
        icon={<Ionicons name="download-outline" size={26} color={SemanticColors.textPrimary} />}
        label="Guardar"
        onPress={isActive ? handleSave : onSave}
        scaleAnim={saveScale}
        glowOpacity={saveGlow}
        glowColor="#00FF84"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: Spacing.four,
    paddingBottom: Spacing.two,
  },
  sideWrapper: {
    alignItems: "center",
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  sideLabel: {
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
  },
});
