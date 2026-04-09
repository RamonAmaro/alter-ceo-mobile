import { BulletItem } from "@/components/my-plan/bullet-item";
import { CheckItem } from "@/components/my-plan/check-item";
import { NoteBlock } from "@/components/my-plan/note-block";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Fonts, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { PlanCustomerAcquisition } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface SalesAcquisitionBlockProps {
  data: PlanCustomerAcquisition;
}

export function SalesAcquisitionBlock({ data }: SalesAcquisitionBlockProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="megaphone-outline" size={18} color={SemanticColors.success} />
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
      {data.puertas_entrada.map((item, i) => (
        <BulletItem key={`puerta-${i}`} text={item} />
      ))}

      <ThemedText type="caption" style={styles.groupLabel}>
        Acciones de alcance
      </ThemedText>
      {data.acciones_alcance.map((item, i) => (
        <BulletItem key={`accion-${i}`} text={item} color={SemanticColors.success} />
      ))}

      <ThemedText type="caption" style={styles.groupLabel}>
        Sistema de seguimiento
      </ThemedText>
      {data.sistema_seguimiento.map((item, i) => (
        <CheckItem key={`seguimiento-${i}`} text={item} />
      ))}

      <NoteBlock text={data.explicacion_enfoque} />
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
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  text: {
    color: SemanticColors.textSecondaryLight,
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
});
