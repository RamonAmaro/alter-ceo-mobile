import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { PlanProductImprovement } from "@/types/plan-data";
import { StyleSheet, View } from "react-native";

interface SalesProductBlockProps {
  data: PlanProductImprovement;
}

function DiffCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.diffCard}>
      <ThemedText type="caption" style={styles.diffLabel}>
        {label}
      </ThemedText>
      <ThemedText type="bodyMd" style={styles.diffValue}>
        {value}
      </ThemedText>
    </View>
  );
}

export function SalesProductBlock({ data }: SalesProductBlockProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="cube-outline" size={18} color="#00FF84" />
        </View>
        <ThemedText type="labelSm" style={styles.title}>
          1. Mejorar tu producto o servicio
        </ThemedText>
      </View>

      <ThemedText type="bodyMd" style={styles.text}>
        {data.texto_explicativo}
      </ThemedText>

      <ThemedText type="caption" style={styles.groupLabel}>
        Marco personalizado
      </ThemedText>
      <ThemedText type="bodyMd" style={styles.bullet}>
        {data.diagnostico_cliente_objetivo}
      </ThemedText>
      <ThemedText type="bodyMd" style={styles.bullet}>
        {data.brecha_mensaje_mercado}
      </ThemedText>

      <ThemedText type="caption" style={styles.groupLabel}>
        Diferenciación
      </ThemedText>
      <DiffCard label="Funcional" value={data.diferenciacion_funcional} />
      <DiffCard label="Experiencial" value={data.diferenciacion_experiencial} />
      <DiffCard label="Estratégica" value={data.diferenciacion_estrategica} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(0,255,132,0.08)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    color: "#ffffff",
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  text: {
    color: "rgba(255,255,255,0.7)",
    lineHeight: 22,
    fontSize: 14,
  },
  groupLabel: {
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 10,
    fontFamily: Fonts.montserratBold,
    marginTop: Spacing.one,
  },
  bullet: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
    fontSize: 14,
    paddingLeft: Spacing.two,
  },
  diffCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    gap: 2,
  },
  diffLabel: {
    color: "#00FF84",
    fontSize: 10,
    fontFamily: Fonts.montserratBold,
    letterSpacing: 0.6,
  },
  diffValue: {
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
    fontSize: 13,
  },
});
