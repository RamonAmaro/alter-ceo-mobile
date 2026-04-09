import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";

interface PrefetchBannerProps {
  status: "ok" | "error";
}

export function PrefetchBanner({ status }: PrefetchBannerProps) {
  return (
    <View style={[styles.banner, status === "error" ? styles.bannerError : styles.bannerOk]}>
      <ThemedText type="labelSm" style={styles.text}>
        {status === "ok"
          ? "Contexto web cargado correctamente"
          : "No se pudo cargar el contexto web (401)"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  bannerOk: {
    backgroundColor: SemanticColors.successMuted,
  },
  bannerError: {
    backgroundColor: SemanticColors.errorMuted,
  },
  text: {
    color: SemanticColors.textPrimary,
  },
});
