import type { PropsWithChildren } from "react";
import { ImageBackground, StyleSheet, View, type DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AlterBrand } from "@/components/alter-brand";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

export function AuthLayout({ children }: PropsWithChildren) {
  const { isMobile } = useResponsiveLayout();

  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <View style={styles.row}>
      <View style={styles.bannerSide}>
        <LinearGradient
          colors={["#0c1511", "#06080c", "#050f13"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.auraOne} />
        <View style={styles.auraTwo} />

        <View style={styles.bannerContent}>
          <AlterBrand iconSize={128} wordmarkSize={36} orientation="vertical" gap={Spacing.three} />

          <View style={styles.accentLine} />

          <ThemedText style={styles.bannerTitle}>Tu copiloto estratégico</ThemedText>

          <ThemedText style={styles.bannerSubtitle}>
            Inteligencia artificial diseñada para CEOs y directivos que quieren tomar mejores
            decisiones, más rápido.
          </ThemedText>
        </View>
      </View>

      <ImageBackground
        source={require("@/assets/ui/app-background.png")}
        style={styles.formSide}
        imageStyle={styles.formBgImage}
        resizeMode="cover"
      >
        <View style={styles.formOverlay} />
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
  },
  bannerSide: {
    flex: 1,
    backgroundColor: "#06080c",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  auraOne: {
    position: "absolute",
    top: "15%",
    left: "-15%",
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: "rgba(0,255,132,0.06)",
  },
  auraTwo: {
    position: "absolute",
    bottom: "-10%",
    right: "-10%",
    width: 440,
    height: 440,
    borderRadius: 220,
    backgroundColor: "rgba(0,207,255,0.04)",
  },
  bannerContent: {
    alignItems: "center",
    gap: Spacing.four,
    paddingHorizontal: Spacing.six,
    maxWidth: 480,
  },
  accentLine: {
    width: 72,
    height: 3,
    borderRadius: 2,
    backgroundColor: SemanticColors.success,
    opacity: 0.7,
    marginTop: Spacing.two,
  },
  bannerTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 28,
    lineHeight: 34,
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginTop: Spacing.two,
  },
  bannerSubtitle: {
    fontFamily: Fonts.montserrat,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    maxWidth: 380,
  },
  formSide: {
    flexBasis: 520,
    flexShrink: 0,
    flexGrow: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
  },
  formBgImage: {
    width: "100%" as DimensionValue,
    height: "100%" as DimensionValue,
  },
  formOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,8,12,0.35)",
  },
});
