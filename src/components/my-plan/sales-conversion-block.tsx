import { BlockSubHeader } from "@/components/my-plan/block-sub-header";
import { BulletItem } from "@/components/my-plan/bullet-item";
import { CheckItem } from "@/components/my-plan/check-item";
import { NoteBlock } from "@/components/my-plan/note-block";
import { ProposalCard } from "@/components/my-plan/proposal-card";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PlanConversionImprovement } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface SalesConversionBlockProps {
  data: PlanConversionImprovement;
  sectionNumber?: string;
}

function cleanList(list?: string[]): string[] {
  if (!list) return [];
  return list.map((s) => s.trim()).filter(Boolean);
}

export function SalesConversionBlock({ data, sectionNumber }: SalesConversionBlockProps) {
  const explanatory = data.texto_explicativo?.trim();
  const debiles = cleanList(data.puntos_debiles_actuales);
  const estructura = cleanList(data.estructura_optimizada);
  const porQue = data.por_que_aumentara_conversion?.trim();
  const proposals = (data.propuestas ?? []).filter(
    (p) => p && (p.titulo?.trim() || p.descripcion?.trim()),
  );

  if (
    !explanatory &&
    debiles.length === 0 &&
    estructura.length === 0 &&
    !porQue &&
    proposals.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.indexBadge}>
          <ThemedText style={styles.indexLabel}>{sectionNumber ?? "03"}</ThemedText>
        </View>
        <ThemedText style={styles.title}>Mejorar la conversión</ThemedText>
      </View>

      {explanatory ? <ThemedText style={styles.text}>{explanatory}</ThemedText> : null}

      {debiles.length > 0 ? (
        <View style={styles.group}>
          <BlockSubHeader label="Puntos débiles actuales" tone="danger" />
          {debiles.map((item, i) => (
            <BulletItem key={`debil-${i}`} text={item} color="#FF7A45" />
          ))}
        </View>
      ) : null}

      {estructura.length > 0 ? (
        <View style={styles.group}>
          <BlockSubHeader label="Estructura optimizada" />
          {estructura.map((item, i) => (
            <CheckItem key={`opt-${i}`} text={item} />
          ))}
        </View>
      ) : null}

      {porQue ? <NoteBlock text={porQue} /> : null}

      {proposals.length > 0 ? (
        <View style={styles.group}>
          <BlockSubHeader label="Propuestas de conversión" />
          <View style={styles.proposals}>
            {proposals.map((p, i) => (
              <ProposalCard key={`prop-${i}`} item={p} />
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
    minWidth: 28,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  indexLabel: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"],
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
});
