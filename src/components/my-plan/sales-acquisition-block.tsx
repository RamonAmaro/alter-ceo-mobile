import { BlockSubHeader } from "@/components/my-plan/block-sub-header";
import { BulletItem } from "@/components/my-plan/bullet-item";
import { CheckItem } from "@/components/my-plan/check-item";
import { NoteBlock } from "@/components/my-plan/note-block";
import { ProposalCard } from "@/components/my-plan/proposal-card";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PlanCustomerAcquisition } from "@/types/plan";
import { StyleSheet, View } from "react-native";

interface SalesAcquisitionBlockProps {
  data: PlanCustomerAcquisition;
}

function cleanList(list?: string[]): string[] {
  if (!list) return [];
  return list.map((s) => s.trim()).filter(Boolean);
}

export function SalesAcquisitionBlock({ data }: SalesAcquisitionBlockProps) {
  const explanatory = data.texto_explicativo?.trim();
  const puertas = cleanList(data.puertas_entrada);
  const acciones = cleanList(data.acciones_alcance);
  const seguimiento = cleanList(data.sistema_seguimiento);
  const enfoque = data.explicacion_enfoque?.trim();
  const proposals = (data.propuestas ?? []).filter(
    (p) => p && (p.titulo?.trim() || p.descripcion?.trim()),
  );

  if (
    !explanatory &&
    puertas.length === 0 &&
    acciones.length === 0 &&
    seguimiento.length === 0 &&
    !enfoque &&
    proposals.length === 0
  ) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.indexBadge}>
          <ThemedText style={styles.indexLabel}>02</ThemedText>
        </View>
        <ThemedText style={styles.title}>Aumentar la captación de clientes</ThemedText>
      </View>

      {explanatory ? <ThemedText style={styles.text}>{explanatory}</ThemedText> : null}

      {puertas.length > 0 ? (
        <View style={styles.group}>
          <BlockSubHeader label="Puertas de entrada" />
          {puertas.map((item, i) => (
            <BulletItem key={`puerta-${i}`} text={item} color={SemanticColors.success} />
          ))}
        </View>
      ) : null}

      {acciones.length > 0 ? (
        <View style={styles.group}>
          <BlockSubHeader label="Acciones de alcance" />
          {acciones.map((item, i) => (
            <BulletItem key={`accion-${i}`} text={item} color={SemanticColors.success} />
          ))}
        </View>
      ) : null}

      {seguimiento.length > 0 ? (
        <View style={styles.group}>
          <BlockSubHeader label="Sistema de seguimiento" />
          {seguimiento.map((item, i) => (
            <CheckItem key={`seguimiento-${i}`} text={item} />
          ))}
        </View>
      ) : null}

      {enfoque ? <NoteBlock text={enfoque} /> : null}

      {proposals.length > 0 ? (
        <View style={styles.group}>
          <BlockSubHeader label="Propuestas de captación" />
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
});
