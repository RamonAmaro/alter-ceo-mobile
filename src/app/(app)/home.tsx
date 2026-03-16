import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts, Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { useTheme } from "@/hooks/use-theme";
import { router } from "expo-router";

export default function HomeScreen() {
  const signOut = useAuthStore((s) => s.signOut);
  const theme = useTheme();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>Hola!</ThemedText>
          <ThemedText type="title" style={styles.brandTitle}>
            AlterCEO
          </ThemedText>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <ThemedText type="subtitle" style={styles.cardTitle}>
              Bienvenido
            </ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.cardText}>
              Todo el control que necesitas, con la simplicidad que mereces.
            </ThemedText>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.signOutButton,
              { borderColor: theme.textSecondary },
            ]}
            onPress={handleSignOut}
          >
            <ThemedText style={styles.signOutText}>Cerrar Sesión</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    marginTop: Spacing.four,
  },
  greeting: {
    fontFamily: Fonts.montserrat,
    fontSize: 16,
    fontWeight: "500",
  },
  brandTitle: {
    fontSize: 36,
    marginTop: Spacing.one,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    borderRadius: 16,
    padding: Spacing.four,
  },
  cardTitle: {
    fontSize: 24,
    marginBottom: Spacing.two,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    marginBottom: Spacing.five,
    alignItems: "center",
  },
  signOutButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: 25,
    borderWidth: 1,
  },
  signOutText: {
    fontFamily: Fonts.montserrat,
    fontSize: 14,
    fontWeight: "600",
  },
});
