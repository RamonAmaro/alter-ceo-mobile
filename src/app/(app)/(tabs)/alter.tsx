import { AlterHeroButton } from "@/components/home/alter-hero-button";
import { AppBackground } from "@/components/app-background";
import { HomeHeader } from "@/components/home/home-header";
import { Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AlterScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AppBackground>
      <View style={[styles.container, { paddingTop: insets.top + Spacing.two }]}>
        <HomeHeader />
        <AlterHeroButton />
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
});
