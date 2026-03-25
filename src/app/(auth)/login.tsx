import { AppBackground } from "@/components/app-background";
import { AuthTagline } from "@/components/auth-tagline";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { isBiometricsAvailable } from "@/services/biometrics-service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { hasErrors, validateRequiredFields } from "@/utils/validate-auth-form";
import { parseAuthError } from "@/utils/parse-auth-error";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { signIn, enableBiometrics, tryBiometricLogin } = useAuthStore();
  const onboardingCompleted = useOnboardingStore((s) => s.completed);
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: false, password: false });
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    attemptBiometricLogin();
  }, []);

  function navigateAfterLogin() {
    if (onboardingCompleted) {
      router.replace("/(app)/alter");
    } else {
      router.replace("/(onboarding)/welcome");
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
        Alert.alert(
          "Biometría",
          "¿Deseas usar biometría para iniciar sesión más rápido?",
          [
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
          ],
        );
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
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/ui/logo-alterceo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <ThemedText type="bodyLg" style={{ fontFamily: Fonts.montserratSemiBold, color: "#ffffff", textAlign: "center", marginBottom: Spacing.three }}>Iniciar Sesión</ThemedText>

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
                if (errors.password)
                  setErrors((e) => ({ ...e, password: false }));
              }}
              secureTextEntry
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
              <ThemedText type="bodyLg" style={{ fontFamily: Fonts.montserratLight, color: "#ffffff", textAlign: "center" }}>¿No tienes cuenta?</ThemedText>
              <TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
                <ThemedText type="labelMd" style={{ color: "#E8731A", textAlign: "center" }}>Regístrate gratis aquí</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.spacer} />

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
  registerContainer: {
    alignItems: "center",
    marginTop: Spacing.four,
  },
  spacer: {
    flexGrow: 1,
  },
});
