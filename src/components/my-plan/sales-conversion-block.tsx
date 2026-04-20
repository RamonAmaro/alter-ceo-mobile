import { BulletItem } from "@/components/my-plan/bullet-item";
import { CheckItem } from "@/components/my-plan/check-item";
import { NoteBlock } from "@/components/my-plan/note-block";
import { ThemedText } from "@/components/themed-text";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { PlanConversionImprovement } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface SalesConversionBlockProps {
  data: PlanConversionImprovement;
}

export function SalesConversionBlock({ data }: SalesConversionBlockProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(0,255,132,0.05)", "rgba(255,255,255,0.01)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <MonumentalIndex label="03" size={130} opacity={0.05} right={-10} bottom={-24} />

      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="trending-up" size={18} color={SemanticColors.success} />
        </View>
        <View style={styles.headerText}>
          <ThemedText style={styles.meta}>MEJORAR · 03</ThemedText>
          <ThemedText style={styles.title}>Conversión</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.text}>{data.texto_explicativo}</ThemedText>

      <View style={styles.groupRow}>
        <View style={[styles.groupBar, { backgroundColor: "#FF4444" }]} />
        <ThemedText style={styles.groupLabel}>PUNTOS DÉBILES · ACTUALES</ThemedText>
      </View>
      {data.puntos_debiles_actuales.map((item, i) => (
        <BulletItem key={`debil-${i}`} text={item} color="rgba(255,68,68,0.6)" />
      ))}

      <View style={styles.groupRow}>
        <View style={styles.groupBar} />
        <ThemedText style={styles.groupLabel}>ESTRUCTURA · OPTIMIZADA</ThemedText>
      </View>
      {data.estructura_optimizada.map((item, i) => (
        <CheckItem key={`opt-${i}`} text={item} />
      ))}

      <NoteBlock text={data.por_que_aumentara_conversion} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.14)",
    gap: Spacing.two,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,255,132,0.14)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  meta: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 12,
    color: SemanticColors.textMuted,
    letterSpacing: 2,
  },
  title: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 20,
    color: SemanticColors.textPrimary,
  },
  text: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: SemanticColors.textSecondaryLight,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  groupBar: {
    width: 14,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  groupLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.2,
  },
});
