import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

interface MemoryEmptyStateProps {
  title?: string;
  description?: string;
}

export function MemoryEmptyState({
  title = "En preparación",
  description = "Este bloque estará disponible muy pronto. Seguimos cartografiando las preguntas clave.",
}: MemoryEmptyStateProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(0,255,132,0.06)", "rgba(255,255,255,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.iconWrap}>
        <Ionicons name="construct-outline" size={22} color={SemanticColors.success} />
      </View>

      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.description}>{description}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    padding: Spacing.four,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderStyle: "dashed",
    overflow: "hidden",
    gap: Spacing.two,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.24)",
    marginBottom: Spacing.one,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 20,
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  description: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 18,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    maxWidth: 280,
  },
});
