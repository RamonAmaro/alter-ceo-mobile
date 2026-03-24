import { AppBackground } from "@/components/app-background";
import { ScreenHeader } from "@/components/screen-header";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="reader"
          titlePrefix="Mis"
          titleAccent="Tareas"
        />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
