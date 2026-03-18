import { AlterLogo } from "@/components/alter-logo";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
        <Text style={styles.labelItalic}>El Cerebro </Text>
        <Text style={styles.labelBold}>ALTER CEO</Text>
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
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "500",
    fontStyle: "italic",
    color: "#00FF84",
  },
  labelBold: {
    fontFamily: Fonts.nexaHeavy,
    fontSize: 16,
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  spacer: {
    width: 32,
  },
});
