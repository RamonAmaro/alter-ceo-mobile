import { AlterLogo } from "@/components/alter-logo";
import { AlterWordmark } from "@/components/alter-wordmark";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { goBackOrHome } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export function ChatHeader() {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => goBackOrHome()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={24} color={SemanticColors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleRow}>
        <AlterLogo size={20} />
        <ThemedText type="labelSm" style={styles.labelItalic}>
          El Cerebro{" "}
        </ThemedText>
        <AlterWordmark size={14} />
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
    color: SemanticColors.success,
  },
  spacer: {
    width: 32,
  },
});
