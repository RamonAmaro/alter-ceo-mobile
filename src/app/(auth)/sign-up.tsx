import { AppBackground } from "@/components/app-background";
import { AuthTagline } from "@/components/auth-tagline";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
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
  name: boolean;
  email: boolean;
  password: boolean;
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({
    name: false,
    email: false,
    password: false,
  });

  function validate(): boolean {
    const newErrors = validateRequiredFields({ name, email, password });
    setErrors(newErrors);
    return !hasErrors(newErrors);
  }

  function handleSignUp() {
    if (!validate()) return;
  }

  function clearError(field: keyof FormErrors) {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
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
              source={require("@/assets/images/logo-alterceo.png")}
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
              error={errors.name}
              errorMessage="Introduce tu nombre"
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
              error={errors.email}
              errorMessage="Introduce tu e-mail"
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
              error={errors.password}
              errorMessage="Introduce tu contraseña"
              style={styles.inputSpacing}
            />

            <Button
              label="Crear Cuenta"
              onPress={handleSignUp}
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
  buttonSpacing: {
    marginTop: Spacing.two,
  },
  loginContainer: {
    alignItems: "center",
    marginTop: Spacing.four,
  },
});
