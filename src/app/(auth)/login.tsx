import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { isBiometricsAvailable } from "@/services/biometrics-service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
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

  useEffect(() => {
    attemptBiometricLogin();
  }, []);

  function navigateAfterLogin() {
    if (onboardingCompleted) {
      router.replace("/(app)/home");
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
    const newErrors = {
      email: email.trim().length === 0,
      password: password.trim().length === 0,
    };
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  }

  async function handleLogin() {
    if (!validate()) return;

    signIn(email, password);

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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo-alterceo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Form */}
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

            <Button
              label="Continuar"
              onPress={handleLogin}
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

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <View style={styles.taglineAccent} />
            <ThemedText type="headingMd" style={{ color: "#ffffff", flex: 1 }}>
              Todo el control que{`\n`}necesitas, con la simplicidad{`\n`}que
              mereces
            </ThemedText>
          </View>
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
  taglineContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.two,
  },
  taglineAccent: {
    width: 4,
    height: 74,
    backgroundColor: "#D9D9D9",
    borderRadius: 2,
    marginRight: Spacing.three,
  },
});
