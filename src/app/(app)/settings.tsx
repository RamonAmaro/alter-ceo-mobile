import { AppBackground } from "@/components/app-background";
import { ProfileMenuCard } from "@/components/profile/profile-menu-card";
import { ScreenHeader } from "@/components/screen-header";
import { InfoAccordion } from "@/components/settings/info-accordion";
import { ThemedText } from "@/components/themed-text";
import { EyebrowPill } from "@/components/ui/eyebrow-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useDebugStore } from "@/stores/debug-store";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isMobile } = useResponsiveLayout();
  const isDebugUnlocked = useDebugStore((s) => s.isUnlocked);
  const unlockDebug = useDebugStore((s) => s.unlock);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  async function handleHiddenDebugTap(): Promise<void> {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    tapCountRef.current += 1;
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      tapTimerRef.current = null;
      await unlockDebug();
      Alert.alert("Modo debug desbloqueado", "Ya puedes acceder a las herramientas internas.");
      router.push("/(app)/debug");
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
      tapTimerRef.current = null;
    }, 1500);
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="settings"
          titlePrefix="Ajustes"
          titleAccent="Alter CEO"
          onIconPress={() => void handleHiddenDebugTap()}
          showBack={isMobile}
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <EyebrowPill label="AJUSTES · ALTER CEO" />

          <SectionHeading eyebrow="INFORMACIÓN" titlePrefix="Qué es" titleAccent="Alter CEO" />

          <View style={styles.accordionList}>
            <InfoAccordion title="Qué es Alter CEO" initiallyOpen>
              <ThemedText style={styles.body}>
                Alter CEO es tu copiloto estratégico de bolsillo: un asistente inteligente que
                observa tu negocio, escucha tus reuniones, lee tus documentos y te ayuda a tomar
                decisiones más rápidas y acertadas. No sustituye al CEO, lo potencia. Actúa como un
                segundo cerebro que organiza la información crítica de la empresa, detecta bloqueos,
                sugiere próximos pasos y te acompaña al diseñar planes de crecimiento. Piensa en él
                como un consultor siempre disponible, formado con la memoria de tu negocio, que
                convierte conversaciones y archivos en acción concreta.
              </ThemedText>
            </InfoAccordion>

            <InfoAccordion title="Menús">
              <ThemedText style={styles.bodyLabel}>Reuniones</ThemedText>
              <ThemedText style={styles.body}>
                Graba tus reuniones desde el móvil. Alter transcribe, resume y extrae decisiones,
                bloqueos y puntos de acción. En el Historial revisas todas las sesiones pasadas.
              </ThemedText>

              <ThemedText style={styles.bodyLabel}>Subir documento</ThemedText>
              <ThemedText style={styles.body}>
                Adjunta informes, contratos o PDFs y Alter los procesa: obtienes resumen ejecutivo,
                temas tratados, implicaciones estratégicas y puntos de acción listos para ejecutar.
              </ThemedText>

              <ThemedText style={styles.bodyLabel}>Planes de negocio</ThemedText>
              <ThemedText style={styles.body}>
                Consulta y gestiona tus planes estratégicos generados con Alter, con objetivos,
                métricas y prioridades claras para hacer crecer el negocio.
              </ThemedText>

              <ThemedText style={styles.bodyLabel}>Gestor de tareas</ThemedText>
              <ThemedText style={styles.body}>
                Centraliza los puntos de acción extraídos de reuniones, documentos y planes en una
                sola bandeja, con responsables y fechas límite para no perder foco.
              </ThemedText>

              <ThemedText style={styles.bodyLabel}>Nueva estrategia</ThemedText>
              <ThemedText style={styles.body}>
                Lanza nuevas estrategias (captación, posicionamiento, expansión) guiadas por Alter,
                con preguntas clave y un informe final accionable.
              </ThemedText>
            </InfoAccordion>

            <InfoAccordion title="Tips">
              <ThemedText style={styles.body}>
                Los mejores consejos para sacar partido de Alter CEO llegarán pronto en esta
                sección.
              </ThemedText>
            </InfoAccordion>
          </View>

          <View style={styles.sectionWrap}>
            <SectionHeading eyebrow="HERRAMIENTAS" titlePrefix="Accesos" titleAccent="avanzados" />
          </View>

          <View style={styles.menuList}>
            {isDebugUnlocked ? (
              <ProfileMenuCard
                icon="bug-outline"
                label="Herramientas de debug"
                description="Inspecciona estado interno y feature flags"
                tone="emerald"
                onPress={() => router.push("/(app)/debug")}
              />
            ) : (
              <ProfileMenuCard
                icon="lock-closed-outline"
                label="Sin herramientas avanzadas"
                description="Contacta a tu equipo para desbloquear el modo debug"
                disabled
              />
            )}
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
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: Spacing.four,
  },
  accordionList: {
    gap: Spacing.two,
  },
  body: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: SemanticColors.textSecondaryLight,
  },
  bodyLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 12,
    lineHeight: 16,
    color: SemanticColors.success,
    marginTop: Spacing.one,
    letterSpacing: 0.5,
  },
  sectionWrap: {
    marginTop: -Spacing.one,
  },
  menuList: {
    gap: Spacing.two,
  },
});
