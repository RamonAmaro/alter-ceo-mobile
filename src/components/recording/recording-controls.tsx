import { CircleButton } from "@/components/circle-button";
import { MicIcon, PauseIcon } from "@/components/recording-icons";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type RecordingState = "idle" | "recording";

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
}

function SideButton({ icon, label, onPress }: SideButtonProps) {
  return (
    <View style={styles.sideWrapper}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.sideButton}
      >
        {icon}
      </TouchableOpacity>
      <ThemedText type="caption" style={styles.sideLabel}>
        {label}
      </ThemedText>
    </View>
  );
}

export function RecordingControls({
  state,
  onRecord,
  onDelete,
  onSave,
}: RecordingControlsProps) {
  const isIdle = state === "idle";

  return (
    <View style={styles.container}>
      <SideButton
        icon={<Ionicons name="close" size={26} color="#ffffff" />}
        label="Eliminar"
        onPress={onDelete}
      />

      {isIdle ? (
        <CircleButton
          size={120}
          gradientId="gradMicRec"
          colors={["#00C0EE", "#0060FF"]}
          icon={MicIcon}
          label="Grabar ahora"
          onPress={onRecord}
        />
      ) : (
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

      <SideButton
        icon={<Ionicons name="download-outline" size={26} color="#ffffff" />}
        label="Guardar"
        onPress={onSave}
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
  },
  sideLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});
