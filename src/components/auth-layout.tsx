import type { PropsWithChildren } from "react";
import { Image, ImageBackground, StyleSheet, View, type DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.decoCircle3} />

        <LinearGradient
          colors={["rgba(0,255,132,0.05)", "transparent", "rgba(0,207,255,0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.bannerContent}>
          <Image
            source={require("@/assets/ui/logo-alterceo.png")}
            style={styles.bannerLogo}
            resizeMode="contain"
          />

          <View style={styles.accentLine} />

          <ThemedText type="headingLg" style={styles.bannerTitle}>
            Tu copiloto{"\n"}estratégico
          </ThemedText>

          <ThemedText type="bodyMd" style={styles.bannerSubtitle}>
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
    backgroundColor: "#09090b",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  decoCircle1: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.08)",
  },
  decoCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.06)",
  },
  decoCircle3: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "rgba(0,207,255,0.06)",
  },
  bannerContent: {
    alignItems: "center",
    gap: Spacing.four,
    paddingHorizontal: Spacing.six,
  },
  bannerLogo: {
    width: 200,
    height: 188,
  },
  accentLine: {
    width: 96,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00FF84",
    opacity: 0.6,
  },
  bannerTitle: {
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
    textAlign: "center",
  },
  bannerSubtitle: {
    color: SemanticColors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 360,
  },
  formSide: {
    flexBasis: 480,
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
});
