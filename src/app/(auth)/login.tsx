import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { AuthLayout } from "@/components/auth-layout";
import { AuthTagline } from "@/components/auth-tagline";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { KeyboardView } from "@/components/keyboard-view";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { isBiometricsAvailable } from "@/services/biometrics-service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { parseAuthError } from "@/utils/parse-auth-error";
import { hasErrors, validateRequiredFields } from "@/utils/validate-auth-form";

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const enableBiometrics = useAuthStore((s) => s.enableBiometrics);
  const tryBiometricLogin = useAuthStore((s) => s.tryBiometricLogin);
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    attemptBiometricLogin();
  }, []);

  function navigateAfterLogin() {
    if (!onboardingCompleted) {
      router.replace("/(onboarding)/welcome");
    } else {
      router.replace("/(app)/(tabs)/alter");
    }
  }

  async function attemptBiometricLogin() {
    const success = await tryBiometricLogin();
    if (success) {
      navigateAfterLogin();
    }
  }

  function validate(): boolean {
    const newErrors = validateRequiredFields({ email, password }) as {
      email: boolean;
      password: boolean;
    };
    setErrors(newErrors);
    return !hasErrors(newErrors);
  }

  async function handleLogin() {
    if (!validate()) return;
    setApiError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);

      const available = await isBiometricsAvailable();
      if (available) {
        Alert.alert("Biometría", "¿Deseas usar biometría para iniciar sesión más rápido?", [
          {
            text: "No, gracias",
            style: "cancel",
            onPress: navigateAfterLogin,
          },
          {
            text: "Sí, activar",
            onPress: async () => {
              await enableBiometrics(email, password);
              navigateAfterLogin();
            },
          },
        ]);
      } else {
        navigateAfterLogin();
      }
    } catch (error) {
      setApiError(parseAuthError(error));
      setIsLoading(false);
    }
  }

  return (
    <AppBackground>
      <AuthLayout>
        <KeyboardView>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: isMobile ? insets.top + Spacing.four : Spacing.five,
                paddingBottom: isMobile ? insets.bottom + Spacing.four : Spacing.five,
                justifyContent: isMobile ? undefined : "center",
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {isMobile && (
              <View style={styles.logoContainer}>
                <Image
                  source={require("@/assets/ui/logo-alterceo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.formContainer}>
              <ThemedText type="bodyLg" style={styles.formTitle}>
                Iniciar Sesión
              </ThemedText>

              <Input
                placeholder="Usuario"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((e) => ({ ...e, email: false }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.email}
                errorMessage="Introduce tu usuario"
                style={styles.inputSpacing}
              />

              <Input
                placeholder="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((e) => ({ ...e, password: false }));
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.password}
                errorMessage="Introduce tu contraseña"
                style={styles.inputSpacing}
              />

              {apiError && (
                <ThemedText type="bodySm" style={styles.apiError}>
                  {apiError}
                </ThemedText>
              )}

              <Button
                label="Continuar"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.buttonSpacing}
              />

              <View style={styles.registerContainer}>
                <ThemedText type="bodyLg" style={styles.registerText}>
                  ¿No tienes cuenta?
                </ThemedText>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/sign-up")}
                  activeOpacity={0.7}
                >
                  <ThemedText type="labelMd" style={styles.linkText}>
                    Regístrate gratis aquí
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {isMobile && (
              <>
                <View style={styles.spacer} />
                <AuthTagline
                  text={"Todo el control que\nnecesitas, con la simplicidad\nque mereces"}
                />
              </>
            )}
          </ScrollView>
        </KeyboardView>
      </AuthLayout>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.five,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 197,
    height: 185,
  },
  formContainer: {
    width: 276,
    alignSelf: "center",
    alignItems: "center",
  },
  inputSpacing: {
    marginBottom: Spacing.three,
  },
  apiError: {
    color: SemanticColors.error,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  buttonSpacing: {
    marginTop: Spacing.two,
  },
  formTitle: {
    fontFamily: Fonts.montserratSemiBold,
    color: SemanticColors.textPrimary,
    textAlign: "center" as const,
    marginBottom: Spacing.three,
  },
  registerContainer: {
    alignItems: "center",
    marginTop: Spacing.four,
  },
  registerText: {
    fontFamily: Fonts.montserratLight,
    color: SemanticColors.textPrimary,
    textAlign: "center" as const,
  },
  linkText: {
    color: SemanticColors.accent,
    textAlign: "center" as const,
  },
  spacer: {
    flexGrow: 1,
  },
});
