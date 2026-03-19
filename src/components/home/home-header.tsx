import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function HomeHeader() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => router.push("/profile")}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color="rgba(255,255,255,0.5)" />
        </View>
        <View>
          <ThemedText type="bodyMd" style={styles.greeting}>Hola, (Nombre)</ThemedText>
          <ThemedText type="bodyMd" style={styles.company}>(Nombre de Empresa)</ThemedText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.notificationBtn} activeOpacity={0.7}>
        <Ionicons name="notifications" size={20} color="#00FF84" />
        <View style={styles.badge} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing.two,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  company: {
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "bold",
  },
  notificationBtn: {
    position: "relative",
    padding: Spacing.one,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
    borderWidth: 1.5,
    borderColor: "#0A0F14",
  },
});
