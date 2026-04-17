import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { goBackOrHome } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function RecordingHeader() {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => goBackOrHome()}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={28} color={SemanticColors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleSection}>
        <Ionicons name="mic" size={22} color={SemanticColors.success} />
        <ThemedText type="labelMd" style={styles.titleWhite}>
          Grabar{" "}
        </ThemedText>
        <ThemedText type="labelMd" style={styles.titleGreen}>
          Reunión
        </ThemedText>
      </View>

      <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
        <View style={styles.settingsCircle}>
          <Ionicons name="settings-outline" size={20} color={SemanticColors.textSecondaryLight} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  backButton: {
    padding: Spacing.one,
  },
  titleSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  settingsButton: {
    padding: Spacing.one,
  },
  settingsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWhite: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
  },
  titleGreen: {
    color: SemanticColors.success,
    fontFamily: Fonts.montserratBold,
  },
});
