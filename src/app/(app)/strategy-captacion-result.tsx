import type { ReactNode } from "react";
import { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { ResponsiveContainer } from "@/components/responsive-container";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useStrategyReportStore } from "@/stores/strategy-report-store";
import type {
  Captacion5FasesDiagnosis,
  Captacion5FasesReport,
  DistribucionPresupuestoTactico,
  Fase1OfertaIrresistibleSection,
  Fase2GrandesDensidadesSection,
  GranDensidadPrioritariaSection,
  PropuestaDeCaptacionEn5Fases,
} from "@/types/report";

interface KeyValueItem {
  label: string;
  value: string;
}

const EURO_FORMATTER = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number): string {
  return EURO_FORMATTER.format(amount);
}

function angleCopy(angle: PropuestaDeCaptacionEn5Fases["angulo_principal"]) {
  if (angle === "sufrimiento") {
    return {
      label: "Ángulo sufrimiento",
      hint: "Activa la propuesta desde una fricción que el cliente ya siente y quiere resolver.",
      colors: ["rgba(232,115,26,0.36)", "rgba(255,149,0,0.08)"] as const,
      borderColor: "rgba(232,115,26,0.35)",
    };
  }

  return {
    label: "Ángulo placer",
    hint: "Activa la propuesta desde una mejora deseable, visible o emocionalmente atractiva.",
    colors: ["rgba(67,188,184,0.34)", "rgba(42,240,225,0.08)"] as const,
    borderColor: "rgba(67,188,184,0.35)",
  };
}

function SectionCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      {eyebrow ? (
        <ThemedText type="caption" style={styles.eyebrow}>
          {eyebrow}
        </ThemedText>
      ) : null}
      <ThemedText type="headingMd" style={styles.cardTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function HeroCard({ report }: { report: Captacion5FasesReport }) {
  const oportunidad = report.tu_oportunidad_de_captacion;

  return (
    <LinearGradient
      colors={["rgba(67,188,184,0.22)", "rgba(0,255,132,0.12)", "rgba(255,255,255,0.05)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <ThemedText type="caption" style={styles.heroEyebrow}>
        Informe listo
      </ThemedText>
      <ThemedText type="subtitle" style={styles.heroTitle}>
        Tu mapa de captación ya tiene puerta de entrada, densidades y foco táctico.
      </ThemedText>
      <ThemedText type="bodyLg" style={styles.heroBody}>
        {oportunidad.resumen_oportunidad}
      </ThemedText>

      <View style={styles.heroHighlights}>
        <View style={styles.heroHighlightChip}>
          <ThemedText type="labelSm" style={styles.heroHighlightLabel}>
            Oportunidad principal
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.heroHighlightValue}>
            {oportunidad.oportunidad_principal_detectada}
          </ThemedText>
        </View>
        <View style={styles.heroHighlightChip}>
          <ThemedText type="labelSm" style={styles.heroHighlightLabel}>
            Puerta de entrada
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.heroHighlightValue}>
            {oportunidad.que_tipo_de_puerta_de_entrada_parece_mas_prometedora}
          </ThemedText>
        </View>
      </View>
    </LinearGradient>
  );
}

function TextBlock({ text }: { text: string }) {
  return (
    <ThemedText type="bodyMd" style={styles.paragraph}>
      {text}
    </ThemedText>
  );
}

function KeyValueList({ items }: { items: KeyValueItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.label} style={styles.listItem}>
          <ThemedText type="labelSm" style={styles.listLabel}>
            {item.label}
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.listValue}>
            {item.value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function InsightGrid({ items }: { items: KeyValueItem[] }) {
  return (
    <View style={styles.insightGrid}>
      {items.map((item) => (
        <View key={item.label} style={styles.insightCard}>
          <ThemedText type="caption" style={styles.insightLabel}>
            {item.label}
          </ThemedText>
          <ThemedText type="bodyMd" style={styles.insightValue}>
            {item.value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function PhaseTag({ label }: { label: string }) {
  return (
    <View style={styles.phaseTag}>
      <ThemedText type="labelSm" style={styles.phaseTagText}>
        {label}
      </ThemedText>
    </View>
  );
}

function diagnosisItems(diagnosis: Captacion5FasesDiagnosis): KeyValueItem[] {
  return [
    {
      label: "Nivel de agresividad más adecuado",
      value: diagnosis.nivel_agresividad_mas_adecuado,
    },
    {
      label: "Capacidad real de ejecución",
      value: diagnosis.capacidad_real_de_ejecucion,
    },
    {
      label: "Valor del cliente en el tiempo",
      value: diagnosis.valor_del_cliente_en_el_tiempo,
    },
    {
      label: "Cómo decide el cliente",
      value: diagnosis.como_decide_el_cliente,
    },
    {
      label: "Emoción que domina la compra",
      value: diagnosis.que_emocion_domina_la_compra,
    },
    {
      label: "Fricción principal",
      value: diagnosis.que_friccion_principal_bloquea_la_captacion,
    },
    {
      label: "Canal más accesible",
      value: diagnosis.donde_parece_mas_accesible_el_cliente_ideal,
    },
    {
      label: "Fortaleza percibida actual",
      value: diagnosis.que_fortaleza_percibida_actual_tiene_el_negocio,
    },
  ];
}

function phaseOneSnapshot(section: Fase1OfertaIrresistibleSection): KeyValueItem[] {
  return [
    { label: "Qué incluye", value: section.que_incluye_exactamente },
    { label: "Formato", value: section.formato_de_entrega },
    { label: "Precio", value: section.precio_recomendado },
    { label: "Tiempo del cliente", value: section.tiempo_esfuerzo_del_cliente },
  ];
}

function phaseOneExecution(section: Fase1OfertaIrresistibleSection): KeyValueItem[] {
  return [
    { label: "Funcionamiento", value: section.funcionamiento },
    {
      label: "Patrón de comportamiento",
      value: section.patron_de_comportamiento_del_cliente,
    },
    { label: "Guion de venta", value: section.guion_de_venta },
    { label: "Recursos necesarios", value: section.recursos_necesarios },
    { label: "Proceso de implementación", value: section.proceso_de_implementacion },
    { label: "Por qué tiene sentido", value: section.por_que_tiene_sentido_en_este_negocio },
    {
      label: "Cuándo usarla",
      value: section.cuando_usarla_y_con_que_perfil_de_cliente,
    },
    { label: "Riesgo principal", value: section.riesgo_principal_de_ejecutarla_mal },
    { label: "Cómo hacerla más fuerte", value: section.como_hacerla_mas_fuerte },
    { label: "Frase comercial", value: section.frase_comercial_simple },
  ];
}

function budgetDistributionItems(distribution: DistribucionPresupuestoTactico) {
  return [
    { label: "Producción / diseño", value: distribution.produccion_diseno_eur, color: "#43BCB8" },
    { label: "Anuncios", value: distribution.anuncios_eur, color: "#E8731A" },
    { label: "Herramientas", value: distribution.herramientas_eur, color: "#00CFFF" },
    { label: "Apoyo externo", value: distribution.apoyo_externo_eur, color: "#FF9500" },
    {
      label: "Seguimiento / optimización",
      value: distribution.seguimiento_optimizacion_eur,
      color: "#00FF84",
    },
  ];
}

function DensityCard({
  density,
  index,
  isMobile,
}: {
  density: GranDensidadPrioritariaSection;
  index: number;
  isMobile: boolean;
}) {
  return (
    <View style={[styles.densityCard, !isMobile && styles.densityCardDesktop]}>
      <View style={styles.densityHeader}>
        <View style={styles.densityRankBadge}>
          <ThemedText type="labelSm" style={styles.densityRankText}>
            #{index + 1}
          </ThemedText>
        </View>
        <View style={styles.densityHeaderCopy}>
          <ThemedText type="headingMd" style={styles.densityTitle}>
            {density.canal_o_entorno}
          </ThemedText>
          <ThemedText type="bodySm" style={styles.densitySubtitle}>
            {density.tipo_de_cliente_que_habra_ahi}
          </ThemedText>
        </View>
      </View>

      <TextBlock text={density.por_que_tiene_sentido} />

      <InsightGrid
        items={[
          { label: "Ventaja", value: density.que_ventaja_tiene_ese_canal },
          { label: "Limitación", value: density.que_limitacion_tiene },
          { label: "Mensaje", value: density.que_mensaje_conviene_usar },
          { label: "Formato", value: density.que_formato_conviene_usar },
          { label: "Ritmo", value: density.que_ritmo_de_publicacion_o_accion_conviene },
          { label: "Error a evitar", value: density.que_error_evitar },
        ]}
      />
    </View>
  );
}

function BudgetPanel({
  phaseTwo,
  isMobile,
}: {
  phaseTwo: Fase2GrandesDensidadesSection;
  isMobile: boolean;
}) {
  const budget = phaseTwo.presupuesto_tactico;
  const recommended = budget.presupuesto_recomendado_eur || 1;
  const distributionItems = budgetDistributionItems(budget.distribucion_recomendada);

  return (
    <View style={styles.budgetPanel}>
      <View style={[styles.budgetLevels, !isMobile && styles.budgetLevelsDesktop]}>
        <View style={styles.budgetLevelCard}>
          <ThemedText type="caption" style={styles.budgetLevelLabel}>
            Mínimo sensato
          </ThemedText>
          <ThemedText type="headingMd" style={styles.budgetLevelValue}>
            {formatCurrency(budget.presupuesto_minimo_sensato_eur)}
          </ThemedText>
        </View>
        <View style={[styles.budgetLevelCard, styles.budgetLevelRecommended]}>
          <ThemedText type="caption" style={styles.budgetLevelLabel}>
            Recomendado
          </ThemedText>
          <ThemedText type="headingMd" style={styles.budgetLevelValue}>
            {formatCurrency(budget.presupuesto_recomendado_eur)}
          </ThemedText>
        </View>
        <View style={styles.budgetLevelCard}>
          <ThemedText type="caption" style={styles.budgetLevelLabel}>
            Agresivo
          </ThemedText>
          <ThemedText type="headingMd" style={styles.budgetLevelValue}>
            {formatCurrency(budget.presupuesto_agresivo_eur)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.distributionPanel}>
        {distributionItems.map((item) => {
          const ratio = recommended > 0 ? item.value / recommended : 0;
          return (
            <View key={item.label} style={styles.distributionRow}>
              <View style={styles.distributionLabelRow}>
                <ThemedText type="labelSm" style={styles.distributionLabel}>
                  {item.label}
                </ThemedText>
                <ThemedText type="bodySm" style={styles.distributionValue}>
                  {formatCurrency(item.value)}
                </ThemedText>
              </View>
              <View style={styles.distributionTrack}>
                <View
                  style={[
                    styles.distributionFill,
                    {
                      width: `${Math.max(ratio * 100, item.value > 0 ? 8 : 0)}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      <TextBlock text={budget.explicacion_simple} />
    </View>
  );
}

function ProposalCard({
  proposal,
  index,
  isMobile,
}: {
  proposal: PropuestaDeCaptacionEn5Fases;
  index: number;
  isMobile: boolean;
}) {
  const angle = angleCopy(proposal.angulo_principal);
  const phaseTwo = proposal.fase_2_grandes_densidades;

  return (
    <View style={styles.proposalCard}>
      <LinearGradient
        colors={angle.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.proposalHero, { borderColor: angle.borderColor }]}
      >
        <View style={styles.proposalHeroTop}>
          <View style={styles.proposalNumberBadge}>
            <ThemedText type="labelSm" style={styles.proposalNumberText}>
              Propuesta {index + 1}
            </ThemedText>
          </View>
          <View style={[styles.anglePill, { borderColor: angle.borderColor }]}>
            <ThemedText type="labelSm" style={styles.anglePillText}>
              {angle.label}
            </ThemedText>
          </View>
        </View>

        <ThemedText type="subtitle" style={styles.proposalTitle}>
          {proposal.titulo}
        </ThemedText>
        <ThemedText type="bodyMd" style={styles.proposalHint}>
          {angle.hint}
        </ThemedText>
      </LinearGradient>

      <View style={styles.phaseSection}>
        <PhaseTag label="Fase 1 · Oferta irresistible" />
        <TextBlock text={proposal.fase_1_oferta_irresistible.explicacion_educativa} />
        <InsightGrid items={phaseOneSnapshot(proposal.fase_1_oferta_irresistible)} />
        <KeyValueList items={phaseOneExecution(proposal.fase_1_oferta_irresistible)} />
      </View>

      {phaseTwo ? (
        <View style={styles.phaseSection}>
          <PhaseTag label="Fase 2 · Grandes densidades" />
          <TextBlock text={phaseTwo.explicacion_educativa} />

          <View style={[styles.densityGrid, !isMobile && styles.densityGridDesktop]}>
            {phaseTwo.grandes_densidades_prioritarias.map((density, densityIndex) => (
              <DensityCard
                key={`${proposal.titulo}-${density.canal_o_entorno}-${densityIndex}`}
                density={density}
                index={densityIndex}
                isMobile={isMobile}
              />
            ))}
          </View>

          <View style={styles.budgetCard}>
            <ThemedText type="headingMd" style={styles.budgetTitle}>
              Presupuesto táctico recomendado
            </ThemedText>
            <BudgetPanel phaseTwo={phaseTwo} isMobile={isMobile} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function renderReport(report: Captacion5FasesReport, isMobile: boolean) {
  return (
    <>
      <HeroCard report={report} />

      <SectionCard title="Introducción general" eyebrow="Contexto">
        <TextBlock text={report.introduccion_general.texto} />
      </SectionCard>

      <SectionCard title="Diagnóstico de tu situación actual" eyebrow="Lectura de negocio">
        <InsightGrid items={diagnosisItems(report.diagnostico_de_tu_situacion_actual)} />
      </SectionCard>

      <SectionCard title="Base estratégica" eyebrow="Por qué este enfoque">
        <TextBlock text={report.base_estrategica.explicacion} />
      </SectionCard>

      <SectionCard title="Tu oportunidad de captación" eyebrow="Dónde está el desbloqueo">
        <TextBlock text={report.tu_oportunidad_de_captacion.explicacion_educativa} />
        <InsightGrid
          items={[
            {
              label: "Oportunidad principal",
              value: report.tu_oportunidad_de_captacion.oportunidad_principal_detectada,
            },
            {
              label: "Conducta del cliente",
              value:
                report.tu_oportunidad_de_captacion.que_conducta_del_cliente_permite_aprovecharla,
            },
            {
              label: "Puerta de entrada",
              value:
                report.tu_oportunidad_de_captacion
                  .que_tipo_de_puerta_de_entrada_parece_mas_prometedora,
            },
            {
              label: "Resultado a mover",
              value:
                report.tu_oportunidad_de_captacion
                  .que_resultado_puede_empezar_a_mover_si_se_activa_bien,
            },
          ]}
        />
      </SectionCard>

      <SectionCard title="Estrategia de captación en 5 fases" eyebrow="Arquitectura general">
        <TextBlock text={report.estrategia_de_captacion_en_5_fases.explicacion_educativa} />
      </SectionCard>

      {report.estrategia_de_captacion_en_5_fases.propuestas.map((proposal, index) => (
        <ProposalCard
          key={`${proposal.titulo}-${index}`}
          proposal={proposal}
          index={index}
          isMobile={isMobile}
        />
      ))}
    </>
  );
}

export default function StrategyCaptacionResultScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const generatedReport = useStrategyReportStore((s) => s.generatedReport);
  const reset = useStrategyReportStore((s) => s.reset);

  useEffect(() => {
    if (!generatedReport) {
      router.replace("/(app)/strategy");
    }
  }, [generatedReport]);

  if (!generatedReport) return null;

  function handleStartAgain(): void {
    reset();
    router.replace("/(app)/strategy");
  }

  return (
    <AppBackground>
      <ResponsiveContainer maxWidth={1100}>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            icon="bar-chart"
            titlePrefix="Informe"
            titleAccent="Captación"
            showBack={isMobile}
          />

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + Spacing.five },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {renderReport(generatedReport, isMobile)}
          </ScrollView>

          <FooterActionBar>
            <Button label="Crear otro informe" onPress={handleStartAgain} />
          </FooterActionBar>
        </View>
      </ResponsiveContainer>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  heroCard: {
    borderRadius: 28,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    overflow: "hidden",
  },
  heroEyebrow: {
    color: SemanticColors.tealLight,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: SemanticColors.textPrimary,
  },
  heroBody: {
    color: SemanticColors.textSubtle,
  },
  heroHighlights: {
    gap: Spacing.two,
  },
  heroHighlightChip: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: Spacing.three,
    gap: Spacing.one,
  },
  heroHighlightLabel: {
    color: SemanticColors.tealLight,
  },
  heroHighlightValue: {
    color: SemanticColors.textPrimary,
  },
  card: {
    backgroundColor: SemanticColors.glassBackground,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    borderRadius: 22,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  eyebrow: {
    color: SemanticColors.tealLight,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardTitle: {
    color: SemanticColors.textPrimary,
  },
  paragraph: {
    color: SemanticColors.textSecondaryLight,
  },
  list: {
    gap: Spacing.two,
  },
  listItem: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: SemanticColors.border,
  },
  listLabel: {
    color: SemanticColors.success,
  },
  listValue: {
    color: SemanticColors.textSubtle,
  },
  insightGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  insightCard: {
    minWidth: 220,
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SemanticColors.border,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  insightLabel: {
    color: SemanticColors.tealLight,
  },
  insightValue: {
    color: SemanticColors.textSubtle,
  },
  proposalCard: {
    gap: Spacing.three,
  },
  proposalHero: {
    borderRadius: 24,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
  },
  proposalHeroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.two,
    flexWrap: "wrap",
  },
  proposalNumberBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
  proposalNumberText: {
    color: SemanticColors.textPrimary,
  },
  anglePill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.16)",
  },
  anglePillText: {
    color: SemanticColors.textPrimary,
  },
  proposalTitle: {
    color: SemanticColors.textPrimary,
  },
  proposalHint: {
    color: SemanticColors.textSecondaryLight,
  },
  phaseSection: {
    backgroundColor: SemanticColors.glassBackground,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  phaseTag: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  phaseTagText: {
    color: SemanticColors.tealLight,
  },
  densityGrid: {
    gap: Spacing.two,
  },
  densityGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  densityCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SemanticColors.border,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  densityCardDesktop: {
    width: "48%",
  },
  densityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  densityRankBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SemanticColors.successMuted,
  },
  densityRankText: {
    color: SemanticColors.success,
  },
  densityHeaderCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  densityTitle: {
    color: SemanticColors.textPrimary,
  },
  densitySubtitle: {
    color: SemanticColors.textSecondaryLight,
  },
  budgetCard: {
    backgroundColor: "rgba(7,18,16,0.48)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.12)",
    padding: Spacing.three,
    gap: Spacing.two,
  },
  budgetTitle: {
    color: SemanticColors.textPrimary,
  },
  budgetPanel: {
    gap: Spacing.three,
  },
  budgetLevels: {
    gap: Spacing.two,
  },
  budgetLevelsDesktop: {
    flexDirection: "row",
  },
  budgetLevelCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SemanticColors.border,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  budgetLevelRecommended: {
    borderColor: "rgba(0,255,132,0.28)",
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  budgetLevelLabel: {
    color: SemanticColors.textSecondaryLight,
  },
  budgetLevelValue: {
    color: SemanticColors.textPrimary,
  },
  distributionPanel: {
    gap: Spacing.two,
  },
  distributionRow: {
    gap: Spacing.one,
  },
  distributionLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  distributionLabel: {
    color: SemanticColors.textSubtle,
  },
  distributionValue: {
    color: SemanticColors.textSecondaryLight,
  },
  distributionTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  distributionFill: {
    height: "100%",
    borderRadius: 999,
  },
});
