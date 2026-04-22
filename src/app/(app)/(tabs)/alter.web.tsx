import { AlterHeroButton } from "@/components/home/alter-hero-button";
import { AppBackground } from "@/components/app-background";
import { HomeHeader } from "@/components/home/home-header";
import { Spacing } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

export default function AlterScreen() {
  return (
    <AppBackground>
      <View style={styles.container}>
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
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
  },
});
