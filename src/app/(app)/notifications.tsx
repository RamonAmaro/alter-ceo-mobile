import { AppBackground } from "@/components/app-background";
import { Fonts, Spacing } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.four }]}>
        <Text style={styles.title}>Notificaciones</Text>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontFamily: Fonts.montserrat,
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
});
