import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function RecordingHeader() {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={28} color="#ffffff" />
      </TouchableOpacity>

      <View style={styles.titleSection}>
        <Ionicons name="mic" size={22} color="#00FF84" />
        <ThemedText type="labelMd" style={{ color: "#ffffff", fontFamily: Fonts.montserratBold }}>
          Grabar{" "}
        </ThemedText>
        <ThemedText type="labelMd" style={{ color: "#00FF84", fontFamily: Fonts.montserratBold }}>
          Reunión
        </ThemedText>
      </View>

      <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
        <View style={styles.settingsCircle}>
          <Ionicons name="settings-outline" size={20} color="rgba(255,255,255,0.7)" />
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
});
