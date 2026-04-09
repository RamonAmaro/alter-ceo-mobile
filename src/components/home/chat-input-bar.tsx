import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function ChatInputBar() {
  const router = useRouter();

  function handlePress(): void {
    router.push("/(app)/chat");
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inputWrap} onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient
          colors={["rgba(0,255,132,0.18)", "rgba(0,255,132,0.03)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.inputGradient}
        >
          <ThemedText type="bodyMd" style={styles.placeholder}>
            Escribe tu mensaje...
          </ThemedText>
          <Ionicons name="radio-outline" size={20} color={SemanticColors.textMuted} />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sendBtn} activeOpacity={0.8} onPress={handlePress}>
        <LinearGradient colors={["#00FF84", "#00CC6A"]} style={styles.sendGradient}>
          <Ionicons name="send" size={18} color="#000000" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: Spacing.three,
  },
  inputWrap: {
    flex: 1,
  },
  inputGradient: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.2)",
    paddingHorizontal: Spacing.three,
    height: 43,
  },
  placeholder: {
    flex: 1,
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  sendGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
