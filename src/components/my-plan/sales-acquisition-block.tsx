import { BulletItem } from "@/components/my-plan/bullet-item";
import { CheckItem } from "@/components/my-plan/check-item";
import { NoteBlock } from "@/components/my-plan/note-block";
import { ThemedText } from "@/components/themed-text";
import { MonumentalIndex } from "@/components/ui/monumental-index";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { PlanCustomerAcquisition } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface SalesAcquisitionBlockProps {
  data: PlanCustomerAcquisition;
}

export function SalesAcquisitionBlock({ data }: SalesAcquisitionBlockProps) {
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={["rgba(0,255,132,0.05)", "rgba(255,255,255,0.01)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <MonumentalIndex label="02" size={130} opacity={0.05} right={-10} bottom={-24} />

      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="megaphone" size={18} color={SemanticColors.success} />
        </View>
        <View style={styles.headerText}>
          <ThemedText style={styles.meta}>AUMENTAR · 02</ThemedText>
          <ThemedText style={styles.title}>Captación de clientes</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.text}>{data.texto_explicativo}</ThemedText>

      <View style={styles.groupRow}>
        <View style={styles.groupBar} />
        <ThemedText style={styles.groupLabel}>PUERTAS DE ENTRADA</ThemedText>
      </View>
      {data.puertas_entrada.map((item, i) => (
        <BulletItem key={`puerta-${i}`} text={item} />
      ))}

      <View style={styles.groupRow}>
        <View style={styles.groupBar} />
        <ThemedText style={styles.groupLabel}>ACCIONES DE ALCANCE</ThemedText>
      </View>
      {data.acciones_alcance.map((item, i) => (
        <BulletItem key={`accion-${i}`} text={item} color={SemanticColors.success} />
      ))}

      <View style={styles.groupRow}>
        <View style={styles.groupBar} />
        <ThemedText style={styles.groupLabel}>SISTEMA DE SEGUIMIENTO</ThemedText>
      </View>
      {data.sistema_seguimiento.map((item, i) => (
        <CheckItem key={`seguimiento-${i}`} text={item} />
      ))}

      <NoteBlock text={data.explicacion_enfoque} />
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
