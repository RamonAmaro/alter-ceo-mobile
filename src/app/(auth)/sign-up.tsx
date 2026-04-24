import { useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { router } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { AuthLayout } from "@/components/auth-layout";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { KeyboardView } from "@/components/keyboard-view";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/types/api";
import { parseAuthError } from "@/utils/parse-auth-error";
import { parseValidationErrors } from "@/utils/parse-validation-errors";
import { hasErrors, validateRequiredFields } from "@/utils/validate-auth-form";

interface FormErrors {
  name: string | false;
  email: string | false;
  password: string | false;
}

export default function SignUpScreen() {
  const register = useAuthStore((s) => s.register);
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
    name: false,
    email: false,
    password: false,
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function validate(): boolean {
    const required = validateRequiredFields({ name, email, password });
    const newErrors: FormErrors = {
      name: required.name ? "Introduce tu nombre" : false,
      email: required.email ? "Introduce tu e-mail" : false,
      password: required.password ? "Introduce tu contraseña" : false,
    };
    setErrors(newErrors);
    return !hasErrors(required);
  }

  async function handleSignUp() {
    if (!validate()) return;
    setApiError(null);
    setIsLoading(true);

    try {
      await register(email, password, name);
      router.replace("/");
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.validationErrors) {
        const fieldErrors = parseValidationErrors(error.validationErrors);
        setErrors((prev) => ({
          name: fieldErrors.display_name ?? prev.name,
          email: fieldErrors.email ?? prev.email,
          password: fieldErrors.password ?? prev.password,
        }));
      } else if (error instanceof ApiError && error.status === 409) {
        setErrors((prev) => ({
          ...prev,
          email: "Ya existe una cuenta con este e-mail",
        }));
      } else {
        setApiError(parseAuthError(error));
      }
      setIsLoading(false);
    }
  }

  function clearError(field: keyof FormErrors) {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
      setApiError(null);
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
            {isMobile && <BackButton />}

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
                Crear Cuenta
              </ThemedText>

              <Input
                placeholder="Nombre"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  clearError("name");
                }}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                error={!!errors.name}
                errorMessage={errors.name || undefined}
                style={styles.inputSpacing}
              />

              <Input
                placeholder="E-mail"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError("email");
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                error={!!errors.email}
                errorMessage={errors.email || undefined}
                style={styles.inputSpacing}
              />

              <Input
                placeholder="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError("password");
                }}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                error={!!errors.password}
                errorMessage={errors.password || undefined}
                style={styles.inputSpacing}
              />

              {apiError && (
                <ThemedText type="bodySm" style={styles.apiError}>
                  {apiError}
                </ThemedText>
              )}

              <Button
                label="Crear Cuenta"
                onPress={handleSignUp}
                loading={isLoading}
                style={styles.buttonSpacing}
              />

              <View style={styles.loginContainer}>
                <ThemedText type="bodyLg" style={styles.loginPromptText}>
                  ¿Ya tienes cuenta?
                </ThemedText>
                <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                  <ThemedText type="labelMd" style={styles.loginLinkText}>
                    Inicia sesión aquí
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
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
  loginContainer: {
    alignItems: "center",
    marginTop: Spacing.four,
  },
  formTitle: {
    fontFamily: Fonts.montserratSemiBold,
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginBottom: Spacing.three,
  },
  loginPromptText: {
    fontFamily: Fonts.montserratLight,
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  loginLinkText: {
    color: SemanticColors.accent,
    textAlign: "center",
  },
});
