import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PlanProposalItem } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface ProposalCardProps {
  index: number;
  item: PlanProposalItem;
}

interface FieldDef {
  label: string;
  value?: string;
}

export function ProposalCard({ index, item }: ProposalCardProps) {
  const indexLabel = String(index).padStart(2, "0");
  const title = item.titulo?.trim();

  const fields: FieldDef[] = [
    { label: "Descripción", value: item.descripcion?.trim() },
    { label: "Origen", value: item.origen?.trim() },
    { label: "Potencial", value: item.potencial?.trim() },
    { label: "Guion de venta", value: item.guion?.trim() },
    { label: "Puesta en marcha", value: item.puesta_en_marcha?.trim() },
    { label: "A quién va dirigida", value: item.a_quien_va_dirigida?.trim() },
    { label: "Objetivo", value: item.objetivo?.trim() },
  ].filter((f) => f.value);

  if (!title && fields.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.indexBadge}>
          <ThemedText style={styles.indexLabel}>{indexLabel}</ThemedText>
        </View>
        {title ? (
          <ThemedText style={styles.title}>{title}</ThemedText>
        ) : (
          <ThemedText style={styles.proposalTag}>Propuesta</ThemedText>
        )}
      </View>

      <View style={styles.body}>
        {fields.map((f) => (
          <View key={f.label} style={styles.field}>
            <ThemedText style={styles.fieldLabel}>{f.label}</ThemedText>
            <ThemedText style={styles.fieldValue}>{f.value}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingLeft: Spacing.three,
    paddingVertical: Spacing.one,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(0,255,132,0.55)",
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(0,255,132,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  indexLabel: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 12,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: -0.2,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
  proposalTag: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 0.3,
  },
  body: {
    gap: Spacing.two,
    marginTop: 2,
  },
  field: {
    gap: 2,
  },
  fieldLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.2,
  },
  fieldValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.88)",
  },
});
