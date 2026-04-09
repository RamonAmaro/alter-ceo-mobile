import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

import { GlassCard } from "./glass-card";

export function MeetingSection() {
  return (
    <View style={styles.row}>
      <GlassCard style={styles.card} outerStyle={styles.cardOuter} onPress={() => {}}>
        <View>
          <ThemedText type="bodyLg" style={styles.label}>
            Grabar
          </ThemedText>
          <ThemedText type="headingMd" style={styles.title}>
            Reunión
          </ThemedText>
        </View>
        <View style={styles.micArea}>
          <Ionicons name="mic" size={64} color="rgba(255,255,255,0.15)" />
        </View>
      </GlassCard>

      <GlassCard style={styles.card} outerStyle={styles.cardOuterLarge} onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.three,
  },
  cardOuter: {
    flex: 4,
  },
  cardOuterLarge: {
    flex: 5,
  },
  card: {
    flex: 1,
    padding: Spacing.three,
    justifyContent: "space-between",
  },
  label: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    color: SemanticColors.textPrimary,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 20,
    color: SemanticColors.success,
  },
  micArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
