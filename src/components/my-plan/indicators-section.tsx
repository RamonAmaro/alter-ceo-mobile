import { SectionHeader } from "@/components/my-plan/section-header";
import { ThemedText } from "@/components/themed-text";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import type { PillarLevel, PlanPillar } from "@/types/plan";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface IndicatorsSectionProps {
  pillars?: PlanPillar[] | null;
}

interface LevelMeta {
  pct: number;
  color: string;
  label: string;
}

const LEVEL_MAP: Record<PillarLevel, LevelMeta> = {
  Inexistente: { pct: 0, color: "#FF4444", label: "Inexistente" },
  Debil: { pct: 20, color: "#FFD000", label: "Débil" },
  Basico: { pct: 40, color: "#FF9500", label: "Básico" },
  Aceptable: { pct: 60, color: "#A86F3C", label: "Aceptable" },
  Bueno: { pct: 80, color: "#4FA8FF", label: "Bueno" },
  Referente: { pct: 100, color: "#00FF84", label: "Referente" },
  "No se puede evaluar": { pct: 0, color: "rgba(255,255,255,0.25)", label: "Sin datos" },
};

const INTRO_TEXT =
  "A continuación tienes el análisis de los 6 pilares más importantes de la actividad de tu negocio. No trabajaremos en todos ellos a corto plazo, pero queremos que tengas una visión general del punto en el que estás.";

const RING_SIZE = 56;
const STROKE = 5;

function PillarRing({ pillar }: { pillar: PlanPillar }) {
  const meta = LEVEL_MAP[pillar.nivel] ?? LEVEL_MAP["No se puede evaluar"];
  const radius = (RING_SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (meta.pct / 100) * circumference;
  const summary = pillar.resumen?.trim() || pillar.justificacion?.trim();

  return (
    <View style={[styles.pillarWrap, { borderLeftColor: `${meta.color}99` }]}>
      <View style={styles.pillarHeader}>
        <View style={styles.ringWrap}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={radius}
              stroke={meta.color}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
        </View>
        <View style={styles.pillarMeta}>
          <ThemedText style={styles.pillarName}>{pillar.nombre}</ThemedText>
          <View
            style={[
              styles.levelChip,
              {
                backgroundColor: `${meta.color}1F`,
                borderColor: `${meta.color}40`,
              },
            ]}
          >
            <ThemedText style={[styles.levelChipText, { color: meta.color }]}>
              {meta.label}
            </ThemedText>
          </View>
        </View>
      </View>
      {summary ? <ThemedText style={styles.pillarSummary}>{summary}</ThemedText> : null}
    </View>
  );
}

export function IndicatorsSection({ pillars }: IndicatorsSectionProps) {
  const valid = (pillars ?? []).filter((p) => p?.nombre?.trim() && p?.nivel);
  if (valid.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader eyebrow="VISIÓN · GENERAL" title="Indicadores principales" />
      <ThemedText style={styles.intro}>{INTRO_TEXT}</ThemedText>
      <View style={styles.list}>
        {valid.map((p) => (
          <PillarRing key={p.nombre} pillar={p} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  intro: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: SemanticColors.textMuted,
    paddingHorizontal: Spacing.one,
  },
  list: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  pillarWrap: {
    paddingLeft: Spacing.three,
    paddingVertical: Spacing.one,
    borderLeftWidth: 2,
    gap: Spacing.two,
  },
  pillarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
  },
  pillarMeta: {
    flex: 1,
    gap: 6,
    alignItems: "flex-start",
  },
  pillarName: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 20,
    color: SemanticColors.textPrimary,
  },
  levelChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  levelChipText: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 14,
  },
  pillarSummary: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
  },
});
