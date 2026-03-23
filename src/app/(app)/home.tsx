import { AppBackground } from "@/components/app-background";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View
        style={[styles.container, { paddingTop: insets.top + Spacing.four }]}
      >
        <ThemedText type="headingLg" style={styles.title}>
          Inicio
        </ThemedText>
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
    color: "#ffffff",
  },
});
