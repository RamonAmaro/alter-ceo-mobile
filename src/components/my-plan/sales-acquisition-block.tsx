import { ThemedText } from "@/components/themed-text";
import { Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { PlanCustomerAcquisition } from "@/types/plan-data";
import { StyleSheet, View } from "react-native";

interface SalesAcquisitionBlockProps {
  data: PlanCustomerAcquisition;
}

function BulletItem({ text, color }: { text: string; color: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText type="bodyMd" style={styles.bulletText}>
        {text}
      </ThemedText>
    </View>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.checkIcon}>
        <Ionicons name="checkmark" size={10} color="#00FF84" />
      </View>
      <ThemedText type="bodyMd" style={styles.bulletText}>
        {text}
      </ThemedText>
    </View>
  );
}

export function SalesAcquisitionBlock({ data }: SalesAcquisitionBlockProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="megaphone-outline" size={18} color="#00FF84" />
        </View>
        <ThemedText type="labelSm" style={styles.title}>
          2. Aumentar captación de clientes
        </ThemedText>
      </View>

      <ThemedText type="bodyMd" style={styles.text}>
        {data.texto_explicativo}
      </ThemedText>

      <ThemedText type="caption" style={styles.groupLabel}>
        Puertas de entrada
      </ThemedText>
      {data.puertas_entrada.map((item) => (
        <BulletItem key={item} text={item} color="rgba(255,255,255,0.35)" />
      ))}

      <ThemedText type="caption" style={styles.groupLabel}>
        Acciones de alcance
      </ThemedText>
      {data.acciones_alcance.map((item) => (
        <BulletItem key={item} text={item} color="#00FF84" />
      ))}

      <ThemedText type="caption" style={styles.groupLabel}>
        Sistema de seguimiento
      </ThemedText>
      {data.sistema_seguimiento.map((item) => (
        <CheckItem key={item} text={item} />
      ))}

      <View style={styles.noteCard}>
        <ThemedText type="bodyMd" style={styles.noteText}>
          {data.explicacion_enfoque}
        </ThemedText>
      </View>
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
  bulletRow: {
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "flex-start",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 99,
    marginTop: 8,
    flexShrink: 0,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: "rgba(0,255,132,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  bulletText: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
    fontSize: 13,
    flex: 1,
  },
  noteCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: Spacing.two,
    borderLeftWidth: 3,
    borderLeftColor: "rgba(255,255,255,0.15)",
  },
  noteText: {
    color: "rgba(255,255,255,0.6)",
    lineHeight: 22,
    fontSize: 13,
    fontStyle: "italic",
  },
});
