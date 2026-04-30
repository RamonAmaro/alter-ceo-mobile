import type { ReactNode } from "react";
import { Fragment, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { BlockSubHeader } from "@/components/my-plan/block-sub-header";
import { SectionBlock } from "@/components/my-plan/section-layout";
import { SectionHeader } from "@/components/my-plan/section-header";
import { ResponsiveContainer } from "@/components/responsive-container";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useStrategyReportStore } from "@/stores/strategy-report-store";
import type {
  Captacion5FasesDiagnosis,
  Captacion5FasesReport,
  DistribucionPresupuestoTactico,
  Fase1OfertaIrresistibleSection,
  Fase2GrandesDensidadesSection,
  Fase3SistemaCaptacionContactosSection,
  GranDensidadPrioritariaSection,
  PropuestaDeCaptacionEn5Fases,
  ValueIdeaProposal,
  ValueIdeasReport,
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
    <SectionBlock>
      <SectionHeader title={title} eyebrow={eyebrow} />
      <View style={styles.sectionBody}>{children}</View>
    </SectionBlock>
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

function phaseThreeCoreItems(section: Fase3SistemaCaptacionContactosSection): KeyValueItem[] {
  return [
    {
      label: "Qué se pide exactamente",
      value: section.que_se_pide_exactamente,
    },
    {
      label: "Por qué ese nivel de datos es razonable",
      value: section.por_que_ese_nivel_de_datos_es_razonable,
    },
    {
      label: "Cómo reducir la fricción",
      value: section.como_reducir_la_friccion,
    },
    {
      label: "Cómo conectarlo con seguimiento posterior",
      value: section.como_conectar_esto_con_seguimiento_posterior,
    },
  ];
}

function ContactMethodCard({
  title,
  text,
  accent,
}: {
  title: string;
  text: string;
  accent: string;
}) {
  return (
    <View style={[styles.contactMethodCard, { borderColor: accent }]}>
      <View style={[styles.contactMethodAccent, { backgroundColor: accent }]} />
      <ThemedText type="labelSm" style={styles.contactMethodTitle}>
        {title}
      </ThemedText>
      <ThemedText type="bodyMd" style={styles.contactMethodText}>
        {text}
      </ThemedText>
    </View>
  );
}

function PhaseThreePanel({
  section,
  isMobile,
}: {
  section: Fase3SistemaCaptacionContactosSection;
  isMobile: boolean;
}) {
  return (
    <View style={styles.phaseThreePanel}>
      <TextBlock text={section.explicacion_educativa} />

      <View style={[styles.contactMethodGrid, !isMobile && styles.contactMethodGridDesktop]}>
        <ContactMethodCard
          title="Método principal"
          text={section.metodo_principal_recomendado}
          accent={SemanticColors.teal}
        />
        <ContactMethodCard
          title="Método secundario"
          text={section.metodo_secundario_de_apoyo}
          accent={SemanticColors.accent}
        />
      </View>

      <View style={styles.messagePanel}>
        <ThemedText type="labelSm" style={styles.messagePanelTitle}>
          Mensaje sugerido
        </ThemedText>
        <ThemedText type="bodyLg" style={styles.messagePanelText}>
          {section.mensaje_sugerido_para_pedirlos}
        </ThemedText>
      </View>

      <InsightGrid
        items={[
          {
            label: "Incentivo / promesa",
            value: section.incentivo_o_promesa_para_dejar_el_contacto,
          },
          {
            label: "Error a evitar",
            value: section.error_mas_tipico_que_el_negocio_debe_evitar,
          },
        ]}
      />

      <KeyValueList items={phaseThreeCoreItems(section)} />
    </View>
  );
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

      <KeyValueList
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
  const phaseThree = proposal.fase_3_sistema_de_captacion_de_contactos;

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
        <BlockSubHeader label="FASE 1 · OFERTA IRRESISTIBLE" />
        <TextBlock text={proposal.fase_1_oferta_irresistible.explicacion_educativa} />
        <InsightGrid items={phaseOneSnapshot(proposal.fase_1_oferta_irresistible)} />
        <KeyValueList items={phaseOneExecution(proposal.fase_1_oferta_irresistible)} />
      </View>

      {phaseTwo ? (
        <View style={styles.phaseSection}>
          <BlockSubHeader label="FASE 2 · GRANDES DENSIDADES" />
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

      {phaseThree ? (
        <View style={styles.phaseSection}>
          <BlockSubHeader label="FASE 3 · SISTEMA DE CAPTACIÓN DE CONTACTOS" />
          <PhaseThreePanel section={phaseThree} isMobile={isMobile} />
        </View>
      ) : null}
    </View>
  );
}

export function renderCaptacionReport(report: Captacion5FasesReport, isMobile: boolean) {
  return renderReport(report, isMobile);
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

function ValueIdeaCard({ proposal, index }: { proposal: ValueIdeaProposal; index: number }) {
  const palancaLabel = humanizeKey(proposal.palanca_evaluada);
  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <View style={styles.ideaCard}>
      <View style={styles.ideaHeader}>
        <View style={styles.ideaIndexBadge}>
          <ThemedText style={styles.ideaIndexText}>{indexLabel}</ThemedText>
        </View>
        <View style={styles.ideaHeaderCopy}>
          <ThemedText style={styles.ideaPalancaEyebrow}>{palancaLabel}</ThemedText>
          <ThemedText style={styles.ideaTitle}>{proposal.idea.nombre_idea}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.ideaPalancaExplanation}>{proposal.explicacion_palanca}</ThemedText>

      <KeyValueList
        items={[
          {
            label: "Qué hacer y cómo aplicarlo",
            value: proposal.idea.que_hacer_y_como_aplicarlo,
          },
        ]}
      />

      <View style={styles.messagePanel}>
        <ThemedText style={styles.messagePanelTitle}>Ejemplo de venta</ThemedText>
        <ThemedText style={styles.messagePanelText}>
          “{proposal.idea.ejemplo_texto_venta}”
        </ThemedText>
      </View>

      <KeyValueList
        items={[
          {
            label: "Por qué funciona",
            value: proposal.idea.por_que_funciona,
          },
        ]}
      />
    </View>
  );
}

export function renderValueIdeasReport(report: ValueIdeasReport) {
  return (
    <>
      <LinearGradient
        colors={["rgba(67,188,184,0.22)", "rgba(0,255,132,0.12)", "rgba(255,255,255,0.05)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <ThemedText style={styles.heroEyebrow}>Informe listo</ThemedText>
        <ThemedText style={styles.heroTitle}>
          Pequeñas palancas que elevan tu valor percibido.
        </ThemedText>
        <ThemedText style={styles.heroBody}>{report.introduccion.texto}</ThemedText>
      </LinearGradient>

      <SectionCard
        title="Propuestas de micro-diferenciación"
        eyebrow="Ideas para aplicar"
      >
        <View style={styles.ideasList}>
          {report.propuestas_micro_diferenciacion.map((proposal, index) => (
            <ValueIdeaCard key={`${proposal.palanca_evaluada}-${index}`} proposal={proposal} index={index} />
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Puesta en marcha" eyebrow="Próximos pasos">
        <TextBlock text={report.puesta_en_marcha.texto} />
      </SectionCard>
    </>
  );
}

function humanizeKey(key: string): string {
  return key
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function renderGenericValue(value: unknown, depth: number): ReactNode {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    return value.trim() ? <TextBlock text={value} /> : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return <TextBlock text={String(value)} />;
  }
  if (Array.isArray(value)) {
    return (
      <>
        {value.map((entry, index) => (
          <Fragment key={index}>{renderGenericValue(entry, depth + 1)}</Fragment>
        ))}
      </>
    );
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <>
        {entries.map(([key, child]) => (
          <SectionCard key={key} title={humanizeKey(key)}>
            {renderGenericValue(child, depth + 1)}
          </SectionCard>
        ))}
      </>
    );
  }
  return null;
}

export function renderGenericReport(report: Record<string, unknown>): ReactNode {
  return Object.entries(report).map(([key, value]) => (
    <SectionCard key={key} title={humanizeKey(key)}>
      {renderGenericValue(value, 1)}
    </SectionCard>
  ));
}

export default function StrategyQuestionnaireResultScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const generatedReport = useStrategyReportStore((s) => s.generatedReport);
  const reportType = useStrategyReportStore((s) => s.reportType);
  const discardDraft = useStrategyReportStore((s) => s.discardDraft);

  useEffect(() => {
    if (!generatedReport) {
      router.replace("/(app)/strategy");
    }
  }, [generatedReport]);

  if (!generatedReport) return null;

  function handleGoToHistory(): void {
    discardDraft();
    router.replace("/(app)/strategies");
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
            showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          >
            {reportType === "captacion_5_fases"
              ? renderReport(generatedReport as unknown as Captacion5FasesReport, isMobile)
              : reportType === "value_ideas"
                ? renderValueIdeasReport(generatedReport as unknown as ValueIdeasReport)
                : renderGenericReport(generatedReport)}
          </ScrollView>

          <FooterActionBar>
            <Button label="Finalizar" onPress={handleGoToHistory} />
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
    borderRadius: 24,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    overflow: "hidden",
  },
  heroEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  heroTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
  },
  heroBody: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
  },
  sectionBody: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  paragraph: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.78)",
  },
  list: {
    gap: Spacing.three,
  },
  listItem: {
    gap: Spacing.one,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  listLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  listValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.85)",
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
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.12)",
    padding: Spacing.three,
    gap: Spacing.one,
  },
  insightLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.success,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  insightValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.85)",
  },
  proposalCard: {
    gap: Spacing.three,
  },
  proposalHero: {
    borderRadius: 20,
    padding: Spacing.four,
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
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.32)",
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  proposalNumberText: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.textPrimary,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  anglePill: {
    borderRadius: 999,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
  },
  anglePillText: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.textPrimary,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  proposalTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 20,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
  },
  proposalHint: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.72)",
  },
  phaseSection: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  densityGrid: {
    gap: Spacing.two,
  },
  densityGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  densityCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.12)",
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
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
  },
  densityRankText: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
  },
  densityHeaderCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  densityTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 20,
    color: SemanticColors.textPrimary,
  },
  densitySubtitle: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.65)",
  },
  budgetCard: {
    backgroundColor: "rgba(7,18,16,0.48)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.12)",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  budgetTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 20,
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
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: Spacing.three,
    gap: Spacing.one,
  },
  budgetLevelRecommended: {
    borderColor: "rgba(0,255,132,0.32)",
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  budgetLevelLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.success,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  budgetLevelValue: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 18,
    lineHeight: 24,
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
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.78)",
  },
  distributionValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.65)",
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
  phaseThreePanel: {
    gap: Spacing.two,
  },
  contactMethodGrid: {
    gap: Spacing.two,
  },
  contactMethodGridDesktop: {
    flexDirection: "row",
  },
  contactMethodCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
    overflow: "hidden",
  },
  contactMethodAccent: {
    width: 36,
    height: 3,
    borderRadius: 999,
    marginBottom: Spacing.one,
  },
  contactMethodTitle: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  contactMethodText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 21,
    color: "rgba(255,255,255,0.85)",
  },
  messagePanel: {
    backgroundColor: "rgba(14, 35, 30, 0.58)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    padding: Spacing.three,
    gap: Spacing.one,
  },
  messagePanelTitle: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.success,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  messagePanelText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 15,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
    fontStyle: "italic",
  },
  ideasList: {
    gap: Spacing.three,
  },
  ideaCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  ideaHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  ideaIndexBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.32)",
  },
  ideaIndexText: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 12,
    lineHeight: 14,
    color: SemanticColors.success,
  },
  ideaHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  ideaPalancaEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.success,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  ideaTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
  ideaPalancaExplanation: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.65)",
    fontStyle: "italic",
  },
});
