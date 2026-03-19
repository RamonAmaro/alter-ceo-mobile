import { AlterLogo } from "@/components/alter-logo";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function ChatHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={24} color="#ffffff" />
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <AlterLogo size={20} />
        <ThemedText type="labelSm" style={styles.labelItalic}>El Cerebro </ThemedText>
        <ThemedText type="subtitle" style={styles.labelBold}>ALTER CEO</ThemedText>
      </View>

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backBtn: {
    padding: Spacing.one,
    marginRight: Spacing.two,
  },
  titleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  labelItalic: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#00FF84",
  },
  labelBold: {
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  spacer: {
    width: 32,
  },
});
