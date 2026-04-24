import { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlterBrand } from "@/components/alter-brand";
import { AppBackground } from "@/components/app-background";
import { AuthLayout } from "@/components/auth-layout";
import { AuthTagline } from "@/components/auth-tagline";
import { Button } from "@/components/button";
import { FormCheckbox } from "@/components/form-checkbox";
import { Input } from "@/components/input";
import { KeyboardView } from "@/components/keyboard-view";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { isBiometricsAvailable } from "@/services/biometrics-service";
import { useAuthStore } from "@/stores/auth-store";
import { parseAuthError } from "@/utils/parse-auth-error";
import {
  clearRememberedEmail,
  getRememberedEmail,
  setRememberedEmail,
} from "@/utils/remembered-email";
import { hasErrors, validateRequiredFields } from "@/utils/validate-auth-form";

const IS_WEB = Platform.OS === "web";

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const enableBiometrics = useAuthStore((s) => s.enableBiometrics);
  const tryBiometricLogin = useAuthStore((s) => s.tryBiometricLogin);
  const shouldAutoBiometrics = useAuthStore((s) => s.shouldAutoBiometrics);
  const consumeAutoBiometrics = useAuthStore((s) => s.consumeAutoBiometrics);
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  useEffect(() => {
    if (shouldAutoBiometrics) {
      setSessionExpiredNotice(true);
      consumeAutoBiometrics();
    }
  }, [shouldAutoBiometrics, consumeAutoBiometrics]);

  useEffect(() => {
    async function attemptBiometricLogin() {
      const success = await tryBiometricLogin();
      if (success) {
        router.replace("/");
      }
    }

    void attemptBiometricLogin();
  }, [tryBiometricLogin]);

  useEffect(() => {
    if (!IS_WEB) return;
    void getRememberedEmail().then((stored) => {
      if (stored) {
        setEmail(stored);
        setRememberEmail(true);
      }
    });
  }, []);

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

      if (IS_WEB) {
        if (rememberEmail) await setRememberedEmail(email);
        else await clearRememberedEmail();
      }

      const available = await isBiometricsAvailable();
      if (available) {
        Alert.alert("Biometría", "¿Deseas usar biometría para iniciar sesión más rápido?", [
          {
            text: "No, gracias",
            style: "cancel",
            onPress: () => router.replace("/"),
          },
          {
            text: "Sí, activar",
            onPress: async () => {
              await enableBiometrics(email, password);
              router.replace("/");
            },
          },
        ]);
      } else {
        router.replace("/");
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
            showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          >
            {isMobile && (
              <View style={styles.logoContainer}>
                <AlterBrand
                  iconSize={96}
                  wordmarkSize={28}
                  orientation="vertical"
                  gap={Spacing.three}
                />
              </View>
            )}

            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <ThemedText style={styles.eyebrow}>BIENVENIDO</ThemedText>
                <ThemedText style={styles.formTitle}>Iniciar sesión</ThemedText>
                <ThemedText style={styles.formSubtitle}>
                  Accede a tu copiloto estratégico
                </ThemedText>
              </View>

              {sessionExpiredNotice && (
                <View style={styles.expiredNotice}>
                  <ThemedText style={styles.expiredNoticeText}>
                    Tu sesión ha caducado. Vuelve a entrar con tu biometría o tu contraseña.
                  </ThemedText>
                </View>
              )}

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
                autoComplete="email"
                textContentType="username"
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
                autoComplete="current-password"
                textContentType="password"
                error={errors.password}
                errorMessage="Introduce tu contraseña"
                style={styles.inputSpacing}
              />

              {IS_WEB && (
                <View style={styles.rememberRow}>
                  <FormCheckbox
                    label="Recordar mi correo"
                    checked={rememberEmail}
                    onToggle={() => setRememberEmail((v) => !v)}
                  />
                </View>
              )}

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
  formContainer: {
    width: 320,
    alignSelf: "center",
    alignItems: "center",
  },
  formHeader: {
    alignItems: "center",
    marginBottom: Spacing.four,
    gap: Spacing.one,
  },
  eyebrow: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    letterSpacing: 3,
    color: SemanticColors.success,
    textAlign: "center",
  },
  formTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 24,
    lineHeight: 30,
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  formSubtitle: {
    fontFamily: Fonts.montserrat,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    marginTop: Spacing.half,
  },
  inputSpacing: {
    marginBottom: Spacing.three,
  },
  rememberRow: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: -Spacing.one,
    marginBottom: Spacing.two,
  },
  apiError: {
    color: SemanticColors.error,
    textAlign: "center",
    marginBottom: Spacing.two,
  },
  buttonSpacing: {
    marginTop: Spacing.two,
    width: "100%",
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
    marginTop: Spacing.half,
  },
  spacer: {
    flexGrow: 1,
  },
  expiredNotice: {
    width: "100%",
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    backgroundColor: "rgba(0, 207, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(0, 207, 255, 0.25)",
    marginBottom: Spacing.three,
  },
  expiredNoticeText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 18,
    color: SemanticColors.textSubtle,
    textAlign: "center",
  },
});
