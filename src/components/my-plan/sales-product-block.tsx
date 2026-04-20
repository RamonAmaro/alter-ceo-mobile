import { ThemedText } from "@/components/themed-text";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { PlanProductImprovement } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface SalesProductBlockProps {
  data: PlanProductImprovement;
}

function DiffCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.diffCard}>
      <View style={styles.diffHeader}>
        <View style={styles.diffBar} />
        <ThemedText style={styles.diffLabel}>{label.toUpperCase()}</ThemedText>
      </View>
      <ThemedText style={styles.diffValue}>{value}</ThemedText>
    </View>
  );
}

export function SalesProductBlock({ data }: SalesProductBlockProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(0,255,132,0.05)", "rgba(255,255,255,0.01)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <MonumentalIndex label="01" size={130} opacity={0.05} right={-10} bottom={-24} />

      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="cube" size={18} color={SemanticColors.success} />
        </View>
        <View style={styles.headerText}>
          <ThemedText style={styles.meta}>MEJORAR · 01</ThemedText>
          <ThemedText style={styles.title}>Producto o servicio</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.text}>{data.texto_explicativo}</ThemedText>

      <View style={styles.groupRow}>
        <View style={styles.groupBar} />
        <ThemedText style={styles.groupLabel}>MARCO PERSONALIZADO</ThemedText>
      </View>
      <ThemedText style={styles.bullet}>{data.diagnostico_cliente_objetivo}</ThemedText>
      <ThemedText style={styles.bullet}>{data.brecha_mensaje_mercado}</ThemedText>

      <View style={styles.groupRow}>
        <View style={styles.groupBar} />
        <ThemedText style={styles.groupLabel}>DIFERENCIACIÓN</ThemedText>
      </View>
      <DiffCard label="Funcional" value={data.diferenciacion_funcional} />
      <DiffCard label="Experiencial" value={data.diferenciacion_experiencial} />
      <DiffCard label="Estratégica" value={data.diferenciacion_estrategica} />
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
  bullet: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.75)",
    paddingLeft: Spacing.two,
  },
  diffCard: {
    backgroundColor: "rgba(0,255,132,0.06)",
    borderRadius: 14,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.14)",
    gap: Spacing.one,
  },
  diffHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  diffBar: {
    width: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  diffLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 9,
    lineHeight: 12,
    color: SemanticColors.success,
    letterSpacing: 2,
  },
  diffValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: SemanticColors.textSecondaryLight,
  },
});
