import { AppBackground } from "@/components/app-background";
import { ProfileMenuCard } from "@/components/profile/profile-menu-card";
import { ScreenHeader } from "@/components/screen-header";
import { EyebrowPill } from "@/components/ui/eyebrow-pill";
import { HeroOverviewCard } from "@/components/ui/hero-overview-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Spacing } from "@/constants/theme";
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
          icon="construct"
          titlePrefix="Sala de"
          titleAccent="Máquinas"
          onIconPress={() => void handleHiddenDebugTap()}
          showBack={isMobile}
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={false}
        >
          <EyebrowPill label="AJUSTES · MOTOR" />

          <HeroOverviewCard
            eyebrow="ENTORNO"
            headline="Afina tu copiloto"
            subhead="Aquí vivirán las preferencias de la aplicación y las herramientas avanzadas."
          />

          <View style={styles.sectionWrap}>
            <SectionHeading
              eyebrow="HERRAMIENTAS"
              titlePrefix="Accesos"
              titleAccent="avanzados"
            />
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
  sectionWrap: {
    marginTop: -Spacing.one,
  },
  menuList: {
    gap: Spacing.two,
  },
});
