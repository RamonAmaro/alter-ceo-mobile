import { AppBackground } from "@/components/app-background";
import { ProfileHeroCard } from "@/components/profile/profile-hero-card";
import { ProfileMenuCard } from "@/components/profile/profile-menu-card";
import { ScreenHeader } from "@/components/screen-header";
import { EyebrowPill } from "@/components/ui/eyebrow-pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useRouter, type Href } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MenuKey = "edit" | "security" | "help" | "onboarding" | "settings";

interface MenuEntry {
  key: MenuKey;
  icon: React.ComponentProps<typeof ProfileMenuCard>["icon"];
  label: string;
  description: string;
  tone?: React.ComponentProps<typeof ProfileMenuCard>["tone"];
  disabled?: boolean;
}

const MENU_ITEMS: readonly MenuEntry[] = [
  {
    key: "edit",
    icon: "person-outline",
    label: "Editar perfil",
    description: "Nombre, contacto y datos personales",
    disabled: true,
  },
  {
    key: "security",
    icon: "shield-checkmark-outline",
    label: "Seguridad",
    description: "Contraseña y biometría",
    disabled: true,
  },
  {
    key: "onboarding",
    icon: "clipboard-outline",
    label: "Configurar mi plan",
    description: "Vuelve al onboarding estratégico",
    tone: "emerald",
  },
  {
    key: "settings",
    icon: "construct-outline",
    label: "Ajustes",
    description: "Sala de máquinas",
    tone: "emerald",
  },
  {
    key: "help",
    icon: "help-circle-outline",
    label: "Ayuda",
    description: "Soporte y documentación",
    disabled: true,
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isSigningOutRef = useRef(false);

  function handleMenuPress(key: MenuKey): void {
    switch (key) {
      case "onboarding":
        router.push("/(onboarding)/welcome");
        return;
      case "settings":
        router.push("/(app)/settings" as Href);
        return;
      default:
        return;
    }
  }

  async function handleSignOut(): Promise<void> {
    if (isSigningOutRef.current) return;
    isSigningOutRef.current = true;
    setIsSigningOut(true);

    try {
      await signOut();
      router.replace("/");
    } finally {
      isSigningOutRef.current = false;
      setIsSigningOut(false);
    }
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="person-circle-outline"
          titlePrefix="Mi"
          titleAccent="Perfil"
          showBack
        />

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        >
          <EyebrowPill label="IDENTIDAD · CONFIGURACIÓN" />

          <ProfileHeroCard name="(Nombre)" company="(Nombre de Empresa)" completeness={35} />

          <View style={styles.sectionWrap}>
            <SectionHeading
              eyebrow="ACCESOS RÁPIDOS"
              titlePrefix="Gestiona tu"
              titleAccent="cuenta"
            />
          </View>

          <View style={styles.menuList}>
            {MENU_ITEMS.map((item, index) => (
              <ProfileMenuCard
                key={item.key}
                icon={item.icon}
                label={item.label}
                description={item.description}
                tone={item.tone}
                disabled={item.disabled}
                onPress={item.disabled ? undefined : () => handleMenuPress(item.key)}
                animationDelay={index * 60}
              />
            ))}
          </View>

          <View style={styles.dangerWrap}>
            <ProfileMenuCard
              icon="log-out-outline"
              label={isSigningOut ? "Cerrando sesión" : "Cerrar sesión"}
              description={
                isSigningOut ? "Estamos cerrando tu sesión..." : "Saldrás de tu cuenta ALTER CEO"
              }
              tone="danger"
              onPress={() => void handleSignOut()}
              disabled={isSigningOut}
              loading={isSigningOut}
              animationDelay={MENU_ITEMS.length * 60}
            />
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
  dangerWrap: {
    marginTop: Spacing.three,
  },
});
