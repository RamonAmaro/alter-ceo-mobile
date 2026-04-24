import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="file-tray-full-outline"
          titlePrefix="Gestor"
          titleAccent="de tareas"
          showBack={isMobile}
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <Ionicons name="file-tray-full-outline" size={44} color={SemanticColors.success} />
            </View>
            <ThemedText style={styles.title}>Tus tareas, en un único lugar</ThemedText>
            <ThemedText style={styles.subtitle}>
              Pronto podrás centralizar aquí todos los puntos de acción extraídos de tus reuniones,
              documentos y planes estratégicos, con responsables y fechas límite.
            </ThemedText>
          </View>

          <View style={styles.pillRow}>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <ThemedText style={styles.pillLabel}>EN CONSTRUCCIÓN</ThemedText>
            </View>
          </View>
        </ScrollView>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
    alignItems: "center",
  },
  hero: {
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    maxWidth: 420,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(0,255,132,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.two,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
  },
  pillRow: {
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  pillLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.success,
    letterSpacing: 2.2,
  },
});
