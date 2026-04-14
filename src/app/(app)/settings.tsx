import { MenuItem } from "@/components/menu-item";
import { ScreenHeader } from "@/components/screen-header";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useDebugStore } from "@/stores/debug-store";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Alert, StyleSheet, View } from "react-native";
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
    <View style={styles.container}>
      <ScreenHeader
        topInset={insets.top}
        icon="settings"
        titlePrefix="Sala de"
        titleAccent="Máquinas"
        onIconPress={() => void handleHiddenDebugTap()}
        showBack={isMobile}
      />

      <View style={styles.content}>
        {isDebugUnlocked ? (
          <MenuItem
            icon="bug-outline"
            label="Herramientas de debug"
            onPress={() => router.push("/(app)/debug")}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
});
