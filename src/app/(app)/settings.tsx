import { AppBackground } from "@/components/app-background";
import { ResponsiveContainer } from "@/components/responsive-container";
import { ScreenHeader } from "@/components/screen-header";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();

  return (
    <AppBackground>
      <ResponsiveContainer maxWidth={600}>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            icon="settings"
            titlePrefix="Sala de"
            titleAccent="Máquinas"
            showBack={isMobile}
          />
        </View>
      </ResponsiveContainer>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
