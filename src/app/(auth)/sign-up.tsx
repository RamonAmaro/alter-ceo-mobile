import { AppBackground } from "@/components/app-background";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Fonts, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
    const newErrors: FormErrors = {
      name: name.trim().length === 0,
      email: email.trim().length === 0,
      password: password.trim().length === 0,
    };
    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.password;
  }

  function handleSignUp() {
    if (!validate()) return;
    // TODO: call sign-up service
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
          {/* Header */}
          <BackButton />

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
            <Text style={styles.formTitle}>Crear Cuenta</Text>

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
              <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.loginLink}>Inicia sesión aquí</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <View style={styles.taglineAccent} />
            <Text style={styles.tagline}>
              Todo el control que necesitas, con la simplicidad que mereces
            </Text>
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
  formTitle: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: Spacing.three,
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
  loginText: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "300",
    color: "#ffffff",
    textAlign: "center",
  },
  loginLink: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "700",
    color: "#E8731A",
    textAlign: "center",
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
  tagline: {
    fontFamily: Fonts.montserrat,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
    color: "#ffffff",
    flex: 1,
  },
});
