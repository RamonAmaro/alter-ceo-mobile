import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";

import type { PrefilledField } from "@/types/report";

interface PrefilledDisclosureProps {
  fields: readonly PrefilledField[];
}

export function PrefilledDisclosure({ fields }: PrefilledDisclosureProps) {
  if (fields.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={["rgba(0,255,132,0.08)", "rgba(0,255,132,0.02)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.iconWrap}>
        <Ionicons name="sparkles" size={14} color={SemanticColors.success} />
      </View>

      <View style={styles.body}>
        <ThemedText style={styles.title}>Sugerido por ALTER CEO</ThemedText>
        <ThemedText style={styles.subtitle}>
          Hemos rellenado {fields.length === 1 ? "1 campo" : `${fields.length} campos`} con datos de
          tu negocio: {fields.map((f) => f.label).join(", ")}.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.22)",
    backgroundColor: "rgba(255,255,255,0.04)",
    overflow: "hidden",
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
    marginTop: 2,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  subtitle: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 17,
    color: SemanticColors.textPrimary,
  },
});
