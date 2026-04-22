import { ThemedText } from "@/components/themed-text";
import { USE_NATIVE_DRIVER } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Alert, Animated, Platform, StyleSheet, TouchableOpacity, View } from "react-native";

interface UploadPageProps {
  width: number;
  height: number;
  onUploaded?: () => void;
}

export function UploadPage({ width, height }: UploadPageProps) {
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePick(): void {
    Alert.alert(
      "Próximamente",
      "La subida y análisis de documentos estará disponible en cuanto completemos la integración con el backend.",
    );
  }

  return (
    <View style={[styles.page, { width, height }]}>
      <View style={styles.content}>
        <TouchableOpacity activeOpacity={0.8} onPress={handlePick}>
          <Animated.View style={[styles.heroButton, { transform: [{ scale: pulseScale }] }]}>
            <LinearGradient
              colors={["#00C0EE", "#0060FF"]}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 0.8, y: 0.9 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="cloud-upload" size={64} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.textWrap}>
          <ThemedText style={styles.title}>Adjuntar documento</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sube un PDF, documento o presentación y Alter CEO lo procesa para extraer resumen,
            insights y puntos de acción.
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const heroShadow = Platform.select({
  ios: {
    shadowColor: "#00C0EE",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
  android: { elevation: 14 },
  web: { boxShadow: "0 12px 36px rgba(0,192,238,0.45)" },
});

const styles = StyleSheet.create({
  page: {
    overflow: "hidden",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  heroButton: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...heroShadow,
  },
  textWrap: {
    alignItems: "center",
    gap: Spacing.two,
    maxWidth: 360,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
  },
});
