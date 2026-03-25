import { AppBackground } from "@/components/app-background";
import { AuthTagline } from "@/components/auth-tagline";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/types/api";
import { parseAuthError } from "@/utils/parse-auth-error";
import { parseValidationErrors } from "@/utils/parse-validation-errors";
import { hasErrors, validateRequiredFields } from "@/utils/validate-auth-form";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface FormErrors {
  name: string | false;
  email: string | false;
  password: string | false;
}

export default function SignUpScreen() {
  const register = useAuthStore((s) => s.register);
  const insets = useSafeAreaInsets();
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
      router.replace("/(onboarding)/welcome");
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + Spacing.four,
              paddingBottom: insets.bottom + Spacing.four,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BackButton />

          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/ui/logo-alterceo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <ThemedText type="bodyLg" style={{ fontFamily: Fonts.montserratSemiBold, color: "#ffffff", textAlign: "center", marginBottom: Spacing.three }}>Crear Cuenta</ThemedText>

            <Input
              placeholder="Nombre"
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearError("name");
              }}
              autoCapitalize="words"
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
              <ThemedText type="bodyLg" style={{ fontFamily: Fonts.montserratLight, color: "#ffffff", textAlign: "center" }}>¿Ya tienes cuenta?</ThemedText>
              <TouchableOpacity onPress={() => router.back()}>
                <ThemedText type="labelMd" style={{ color: "#E8731A", textAlign: "center" }}>Inicia sesión aquí</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <AuthTagline text={"Todo el control que\nnecesitas, con la simplicidad\nque mereces"} />
        </ScrollView>
      </KeyboardAvoidingView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
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
    alignItems: "center",
  },
  inputSpacing: {
    marginBottom: Spacing.three,
  },
  apiError: {
    color: "#FF4444",
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
});
