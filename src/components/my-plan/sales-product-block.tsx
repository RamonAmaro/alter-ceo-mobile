import { BlockSubHeader } from "@/components/my-plan/block-sub-header";
import { ProposalCard } from "@/components/my-plan/proposal-card";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PlanProductImprovement } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface SalesProductBlockProps {
  data: PlanProductImprovement;
}

interface DiffRowProps {
  label: string;
  value?: string;
}

function nonEmpty(value?: string): value is string {
  return Boolean(value && value.trim());
}

function DiffRow({ label, value }: DiffRowProps) {
  if (!nonEmpty(value)) return null;
  return (
    <View style={styles.diffRow}>
      <ThemedText style={styles.diffLabel}>{label}</ThemedText>
      <ThemedText style={styles.diffValue}>{value.trim()}</ThemedText>
    </View>
  );
}

export function SalesProductBlock({ data }: SalesProductBlockProps) {
  const explanatory = data.texto_explicativo?.trim();
  const clientDiag = data.diagnostico_cliente_objetivo?.trim();
  const messageGap = data.brecha_mensaje_mercado?.trim();
  const hasMarco = Boolean(clientDiag || messageGap);
  const hasDiff = Boolean(
    nonEmpty(data.diferenciacion_funcional) ||
    nonEmpty(data.diferenciacion_experiencial) ||
    nonEmpty(data.diferenciacion_estrategica),
  );
  const proposals = (data.propuestas ?? []).filter(
    (p) => p && (p.titulo?.trim() || p.descripcion?.trim()),
  );

  if (!explanatory && !hasMarco && !hasDiff && proposals.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.indexBadge}>
          <ThemedText style={styles.indexLabel}>01</ThemedText>
        </View>
        <ThemedText style={styles.title}>Mejorar producto o servicio</ThemedText>
      </View>

      {explanatory ? <ThemedText style={styles.text}>{explanatory}</ThemedText> : null}

      {hasMarco ? (
        <View style={styles.group}>
          <BlockSubHeader label="Marco personalizado" />
          {clientDiag ? <ThemedText style={styles.bullet}>{clientDiag}</ThemedText> : null}
          {messageGap ? <ThemedText style={styles.bullet}>{messageGap}</ThemedText> : null}
        </View>
      ) : null}

      {hasDiff ? (
        <View style={styles.group}>
          <BlockSubHeader label="Diferenciación" />
          <DiffRow label="Funcional" value={data.diferenciacion_funcional} />
          <DiffRow label="Experiencial" value={data.diferenciacion_experiencial} />
          <DiffRow label="Estratégica" value={data.diferenciacion_estrategica} />
        </View>
      ) : null}

      {proposals.length > 0 ? (
        <View style={styles.group}>
          <BlockSubHeader label="Propuestas de mejora" />
          <View style={styles.proposals}>
            {proposals.map((p, i) => (
              <ProposalCard key={`prop-${i}`} index={i + 1} item={p} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: Spacing.one,
    gap: Spacing.three,
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
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
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
    fontSize: 17,
    lineHeight: 24,
    color: SemanticColors.textPrimary,
  },
  text: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
  },
  group: {
    gap: Spacing.two,
  },
  proposals: {
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  bullet: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
  },
  diffRow: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 4,
  },
  diffLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
  },
  diffValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.82)",
  },
});
