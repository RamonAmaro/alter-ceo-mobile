import type { ReactNode } from "react";
import { Fragment, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { FooterActionBar } from "@/components/footer-action-bar";
import { BlockSubHeader } from "@/components/my-plan/block-sub-header";
import { SectionHeader } from "@/components/my-plan/section-header";
import { SectionBlock } from "@/components/my-plan/section-layout";
import { ResponsiveContainer } from "@/components/responsive-container";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useStrategyReportStore } from "@/stores/strategy-report-store";
import type {
  BusinessMindsetCategoryKey,
  BusinessMindsetReport,
  Captacion5FasesReport,
  CostesDeLaEstrategiaSection,
  DescuentoOIncentivoFuturoSection,
  DiagnosticoDeSituacionActualSection,
  DistribucionPresupuestoTactico,
  Fase1OfertaIrresistibleSection,
  Fase2GrandesDensidadesSection,
  Fase3SistemaCaptacionContactosSection,
  GranDensidadPrioritariaSection,
  LimitacionEstrategicaItem,
  PlanDeAccionSection,
  PropuestaDeCaptacionEn5Fases,
  RetornoDeLaEstrategiaSection,
  SalesScriptBlock,
  SalesScriptDevelopedScript,
  SalesScriptReport,
  TuOportunidadDeCaptacionSection,
  ValueIdeaProposal,
  ValueIdeasReport,
  VentaAdicionalSection,
} from "@/types/report";

interface KeyValueItem {
  label: string;
  value: string;
}

const BUSINESS_MINDSET_CATEGORIES: readonly BusinessMindsetCategoryKey[] = [
  "responsabilidad",
  "dinero",
  "accion",
  "mercado",
  "liderazgo",
] as const;

const BUSINESS_MINDSET_CATEGORY_LABELS: Record<BusinessMindsetCategoryKey, string> = {
  responsabilidad: "Responsabilidad",
  dinero: "Dinero",
  accion: "Acción",
  mercado: "Mercado",
  liderazgo: "Liderazgo",
};

const EURO_FORMATTER = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number): string {
  return EURO_FORMATTER.format(amount);
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

function TextSection({
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
      <View style={styles.textSectionHeader}>
        {eyebrow ? <ThemedText style={styles.textSectionEyebrow}>{eyebrow}</ThemedText> : null}
        <ThemedText style={styles.textSectionTitle}>{title}</ThemedText>
      </View>
      <View style={styles.textSectionBody}>{children}</View>
    </SectionBlock>
  );
}

function HeroCard({ report, isMobile }: { report: Captacion5FasesReport; isMobile: boolean }) {
  return (
    <View style={styles.heroBlock}>
      <View style={styles.heroDivider} />
      <View style={styles.heroEyebrowRow}>
        <View style={styles.heroDot} />
        <ThemedText style={styles.heroEyebrow}>Informe listo</ThemedText>
      </View>
      <ThemedText style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
        {report.titulo}
      </ThemedText>
      <ThemedText style={styles.heroBody}>{report.introduccion.texto}</ThemedText>
    </View>
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
      {items.map((item, index) => (
        <View key={item.label} style={styles.listItem}>
          <ThemedText style={styles.listBullet}>–</ThemedText>
          <View style={styles.listCopy}>
            <ThemedText style={styles.listLabel}>{item.label}</ThemedText>
            <ThemedText style={[styles.listValue, index === 0 && styles.listValueLead]}>
              {item.value}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

function InsightList({ items }: { items: KeyValueItem[] }) {
  return (
    <View style={styles.insightList}>
      {items.map((item, index) => (
        <View key={item.label} style={[styles.insightRow, index === 0 && styles.insightRowLead]}>
          <ThemedText style={styles.insightIndex}>{String(index + 1).padStart(2, "0")}</ThemedText>
          <View style={styles.insightCopy}>
            <ThemedText style={styles.insightLabel}>{item.label}</ThemedText>
            <ThemedText style={[styles.insightValue, index === 0 && styles.insightValueLead]}>
              {item.value}
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

function diagnosticoClavesItems(diagnostico: DiagnosticoDeSituacionActualSection): KeyValueItem[] {
  const claves = diagnostico.claves_del_diagnostico;
  return [
    { label: "Nivel de agresividad deseado", value: claves.nivel_de_agresividad_deseado },
    { label: "Capacidad real de ejecución", value: claves.capacidad_real_de_ejecucion },
    { label: "Valor del cliente en el tiempo", value: claves.valor_del_cliente_en_el_tiempo },
    { label: "Cómo decide el cliente", value: claves.como_decide_el_cliente },
    { label: "Emoción que activa la compra", value: claves.que_emocion_activa_la_compra },
    { label: "Fricción principal", value: claves.friccion_principal },
    { label: "Canal más accesible", value: claves.canal_mas_accesible },
    { label: "Fortaleza percibida actual", value: claves.fortaleza_percibida_actual },
  ];
}

function oportunidadItems(oportunidad: TuOportunidadDeCaptacionSection): KeyValueItem[] {
  return [
    {
      label: "Oportunidad principal detectada",
      value: oportunidad.oportunidad_principal_detectada,
    },
    { label: "Conducta del cliente", value: oportunidad.conducta_del_cliente },
    { label: "Tipo de propuesta de captación", value: oportunidad.tipo_de_propuesta_de_captacion },
    { label: "Objetivo deseado", value: oportunidad.objetivo_deseado },
  ];
}

function phaseOneItems(section: Fase1OfertaIrresistibleSection): KeyValueItem[] {
  return [
    { label: "Nombre de la oferta", value: section.nombre_de_la_oferta },
    { label: "Descripción breve", value: section.descripcion_breve },
    { label: "Funcionamiento", value: section.funcionamiento },
    { label: "Precio recomendado", value: section.precio_recomendado },
    { label: "Alternativa precio conservador", value: section.alternativa_precio_conservador },
    { label: "Tiempo / esfuerzo del cliente", value: section.tiempo_esfuerzo_del_cliente },
    {
      label: "Patrón de comportamiento del cliente",
      value: section.patron_de_comportamiento_del_cliente,
    },
    { label: "Guion de venta", value: section.guion_de_venta },
    { label: "Recursos necesarios", value: section.recursos_necesarios },
    { label: "Proceso de implementación", value: section.proceso_de_implementacion },
  ];
}

function phaseThreeItems(section: Fase3SistemaCaptacionContactosSection): KeyValueItem[] {
  return [
    { label: "Qué datos pedir", value: section.que_datos_pedir },
    { label: "Cómo pedirlos", value: section.como_pedirlos },
    { label: "Dónde se recogen", value: section.donde_se_recogen },
    { label: "Frase para pedirlos", value: section.frase_para_pedirlos },
    {
      label: "Cómo reducir sensación de formulario pesado",
      value: section.como_reducir_sensacion_de_formulario_pesado,
    },
    {
      label: "Qué hacer después de capturar el contacto",
      value: section.que_hacer_despues_de_capturar_el_contacto,
    },
  ];
}

function ventaAdicionalItems(section: VentaAdicionalSection): KeyValueItem[] {
  return [
    { label: "Qué ofrecer", value: section.que_ofrecer },
    { label: "Cuándo ofrecerlo", value: section.cuando_ofrecerlo },
    { label: "Quién lo comunica", value: section.quien_lo_comunica },
    { label: "Cómo se comunica", value: section.como_se_comunica },
    {
      label: "Por qué encaja con la oferta inicial",
      value: section.por_que_encaja_con_la_oferta_inicial,
    },
  ];
}

function descuentoFuturoItems(section: DescuentoOIncentivoFuturoSection): KeyValueItem[] {
  return [
    { label: "Qué incentivo ofrecer", value: section.que_incentivo_ofrecer },
    { label: "Durante cuánto tiempo", value: section.durante_cuanto_tiempo },
    { label: "Para qué producto o servicio", value: section.para_que_producto_o_servicio },
    { label: "Cómo comunicarlo", value: section.como_comunicarlo },
    {
      label: "Por qué ayuda a generar recurrencia",
      value: section.por_que_ayuda_a_generar_recurrencia,
    },
  ];
}

function limitacionItems(limitacion: LimitacionEstrategicaItem): KeyValueItem[] {
  return [
    { label: "En qué consiste", value: limitacion.en_que_consiste },
    { label: "Por qué tiene sentido", value: limitacion.por_que_tiene_sentido },
    { label: "Cómo se comunica al cliente", value: limitacion.como_se_comunica_al_cliente },
    { label: "Qué riesgo evita", value: limitacion.que_riesgo_evita },
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
            {density.tipo_de_cliente}
          </ThemedText>
        </View>
      </View>

      <KeyValueList
        items={[
          { label: "Ventaja principal", value: density.ventaja_principal },
          { label: "Limitación", value: density.limitacion },
          { label: "Tipo de comunicación", value: density.tipo_de_comunicacion },
        ]}
      />
    </View>
  );
}

function CostesPanel({ costes }: { costes: CostesDeLaEstrategiaSection }) {
  const detalle = costes.detalle_por_partidas;
  return (
    <View style={styles.costesPanel}>
      <View style={styles.costesTotalCard}>
        <ThemedText style={styles.costesTotalLabel}>COSTE TOTAL ESTIMADO</ThemedText>
        <ThemedText style={styles.costesTotalValue}>
          {formatCurrency(costes.coste_total_estimado_eur)}
        </ThemedText>
      </View>

      <TextBlock text={costes.explicacion_general} />

      <KeyValueList
        items={[
          { label: "Costes imprescindibles", value: costes.costes_imprescindibles },
          { label: "Costes recomendables", value: costes.costes_recomendables },
          { label: "Costes opcionales", value: costes.costes_opcionales },
        ]}
      />

      <View style={styles.costesBreakdown}>
        <ThemedText style={styles.costesBreakdownTitle}>DETALLE POR PARTIDAS</ThemedText>
        <View style={styles.costesGrid}>
          <CostItem label="Preparación" value={detalle.preparacion_eur} />
          <CostItem label="Diseño / producción" value={detalle.diseno_o_produccion_eur} />
          <CostItem label="Publicidad" value={detalle.publicidad_eur} />
          <CostItem label="Herramientas" value={detalle.herramientas_eur} />
          <CostItem label="Entrega de la oferta" value={detalle.entrega_de_la_oferta_eur} />
          <CostItem label="Personal interno" value={detalle.personal_interno_eur} />
          <CostItem label="Apoyo externo" value={detalle.apoyo_externo_eur} />
          <CostItem label="Seguimiento" value={detalle.seguimiento_eur} />
          <CostItem label="Optimización" value={detalle.optimizacion_eur} />
        </View>
      </View>
    </View>
  );
}

function CostItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.costItem}>
      <ThemedText style={styles.costItemLabel}>{label}</ThemedText>
      <ThemedText style={styles.costItemValue}>{formatCurrency(value)}</ThemedText>
    </View>
  );
}

function RetornoPanel({ retorno }: { retorno: RetornoDeLaEstrategiaSection }) {
  return (
    <View style={styles.retornoPanel}>
      <View style={styles.retornoKpis}>
        <RetornoKpi
          label="ROI APROXIMADO"
          value={`${retorno.roi_aproximado_pct.toFixed(0)}%`}
          highlight
        />
        <RetornoKpi
          label="NEGOCIO 12M"
          value={formatCurrency(retorno.negocio_potencial_12_meses_eur)}
        />
        <RetornoKpi
          label="NEGOCIO 4M"
          value={formatCurrency(retorno.negocio_potencial_4_meses_eur)}
        />
      </View>

      <TextBlock text={retorno.explicacion_general} />

      <KeyValueList
        items={[
          { label: "Lectura del retorno", value: retorno.lectura_del_retorno },
          { label: "Advertencia de estimación", value: retorno.advertencia_de_estimacion },
        ]}
      />

      <View style={styles.retornoMetrics}>
        <RetornoMetric label="Contactos generados" value={String(retorno.contactos_generados)} />
        <RetornoMetric
          label="Primeros consumos"
          value={String(retorno.primeros_consumos_esperados)}
        />
        <RetornoMetric label="Clientes convertidos" value={String(retorno.clientes_convertidos)} />
        <RetornoMetric label="Repetición esperada" value={String(retorno.repeticion_esperada)} />
        <RetornoMetric
          label="Valor por cliente"
          value={formatCurrency(retorno.valor_acumulado_por_cliente_eur)}
        />
        <RetornoMetric
          label="Coste total estimado"
          value={formatCurrency(retorno.coste_total_estimado_eur)}
        />
      </View>
    </View>
  );
}

function RetornoKpi({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.retornoKpi, highlight && styles.retornoKpiHighlight]}>
      <ThemedText style={styles.retornoKpiLabel}>{label}</ThemedText>
      <ThemedText style={[styles.retornoKpiValue, highlight && styles.retornoKpiValueHighlight]}>
        {value}
      </ThemedText>
    </View>
  );
}

function RetornoMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.retornoMetric}>
      <ThemedText style={styles.retornoMetricLabel}>{label}</ThemedText>
      <ThemedText style={styles.retornoMetricValue}>{value}</ThemedText>
    </View>
  );
}

function PlanDeAccionPanel({ plan }: { plan: PlanDeAccionSection }) {
  return (
    <View style={styles.planAccionPanel}>
      <View style={styles.planAccionDuration}>
        <ThemedText style={styles.planAccionDurationLabel}>DURACIÓN</ThemedText>
        <ThemedText style={styles.planAccionDurationValue}>{plan.duracion_dias} días</ThemedText>
      </View>

      {plan.semanas.map((semana, index) => (
        <View key={`${semana.semana}-${index}`} style={styles.planAccionSemana}>
          <View style={styles.planAccionSemanaHeader}>
            <View style={styles.planAccionSemanaBadge}>
              <ThemedText style={styles.planAccionSemanaBadgeText}>
                {String(index + 1).padStart(2, "0")}
              </ThemedText>
            </View>
            <View style={styles.planAccionSemanaCopy}>
              <ThemedText style={styles.planAccionSemanaTitle}>{semana.semana}</ThemedText>
              <ThemedText style={styles.planAccionSemanaFoco}>{semana.foco_principal}</ThemedText>
            </View>
          </View>
          <KeyValueList
            items={[
              { label: "Tareas clave", value: semana.tareas_clave },
              { label: "Responsable sugerido", value: semana.responsable_sugerido },
              { label: "Resultado esperado", value: semana.que_debe_quedar_terminado },
            ]}
          />
        </View>
      ))}
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
  isMobile,
}: {
  proposal: PropuestaDeCaptacionEn5Fases;
  isMobile: boolean;
}) {
  const phaseTwo = proposal.fase_2_grandes_densidades;
  const phaseThree = proposal.fase_3_sistema_de_captacion_de_contactos;
  const phaseFour = proposal.fase_4_venta_adicional_y_consumo_futuro;
  const phaseFive = proposal.fase_5_limitacion_estrategica;

  return (
    <View style={styles.proposalCard}>
      <View style={styles.proposalHero}>
        <ThemedText style={styles.proposalMonumental}>
          {String(proposal.numero).padStart(2, "0")}
        </ThemedText>
        <View style={styles.proposalHeroCopy}>
          <ThemedText style={styles.proposalEyebrow}>PROPUESTA {proposal.numero}</ThemedText>
          <ThemedText style={styles.proposalTitle}>{proposal.titulo}</ThemedText>
        </View>
      </View>

      <View style={styles.phaseSection}>
        <BlockSubHeader label="FASE 1 · OFERTA IRRESISTIBLE" />
        <KeyValueList items={phaseOneItems(proposal.fase_1_oferta_irresistible)} />
      </View>

      <View style={styles.phaseSection}>
        <BlockSubHeader label="FASE 2 · GRANDES DENSIDADES" />
        <TextBlock text={phaseTwo.explicacion_educativa} />

        <View style={[styles.densityGrid, !isMobile && styles.densityGridDesktop]}>
          {phaseTwo.grandes_densidades_prioritarias.map((density, densityIndex) => (
            <DensityCard
              key={`${proposal.numero}-${density.canal_o_entorno}-${densityIndex}`}
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

      <View style={styles.phaseSection}>
        <BlockSubHeader label="FASE 3 · SISTEMA DE CAPTACIÓN DE CONTACTOS" />
        <KeyValueList items={phaseThreeItems(phaseThree)} />
      </View>

      <View style={styles.phaseSection}>
        <BlockSubHeader label="FASE 4 · VENTA ADICIONAL Y CONSUMO FUTURO" />
        <View style={styles.subBlock}>
          <ThemedText style={styles.subBlockTitle}>Venta adicional</ThemedText>
          <KeyValueList items={ventaAdicionalItems(phaseFour.venta_adicional)} />
        </View>
        <View style={styles.subBlock}>
          <ThemedText style={styles.subBlockTitle}>Descuento o incentivo futuro</ThemedText>
          <KeyValueList items={descuentoFuturoItems(phaseFour.descuento_o_incentivo_futuro)} />
        </View>
      </View>

      <View style={styles.phaseSection}>
        <BlockSubHeader label="FASE 5 · LIMITACIÓN ESTRATÉGICA" />
        {phaseFive.limitaciones.map((limitacion, limitIndex) => (
          <View key={`limitacion-${limitIndex}`} style={styles.limitacionCard}>
            <View style={styles.limitacionHeader}>
              <View style={styles.limitacionBadge}>
                <ThemedText style={styles.limitacionBadgeText}>
                  {String(limitIndex + 1).padStart(2, "0")}
                </ThemedText>
              </View>
              <ThemedText style={styles.limitacionTitle}>{limitacion.en_que_consiste}</ThemedText>
            </View>
            <KeyValueList items={limitacionItems(limitacion).slice(1)} />
          </View>
        ))}
      </View>

      <View style={styles.phaseSection}>
        <BlockSubHeader label="COSTES DE LA ESTRATEGIA" />
        <CostesPanel costes={proposal.costes_de_la_estrategia} />
      </View>

      <View style={styles.phaseSection}>
        <BlockSubHeader label="RETORNO DE LA ESTRATEGIA" />
        <RetornoPanel retorno={proposal.retorno_de_la_estrategia} />
      </View>

      <View style={styles.phaseSection}>
        <BlockSubHeader label="PLAN DE ACCIÓN" />
        <PlanDeAccionPanel plan={proposal.plan_de_accion} />
      </View>
    </View>
  );
}

function isLegacyCaptacionReport(report: Captacion5FasesReport): boolean {
  // Old reports use `introduccion_general` and `diagnostico_de_tu_situacion_actual`.
  // New reports use `introduccion` + `diagnostico_de_situacion_actual` (with claves nested).
  // If the new fields are missing, the report follows the legacy schema.
  return (
    !report.diagnostico_de_situacion_actual?.claves_del_diagnostico || !report.introduccion?.texto
  );
}

export function renderCaptacionReport(report: Captacion5FasesReport, isMobile: boolean) {
  if (isLegacyCaptacionReport(report)) {
    return renderGenericReport(report as unknown as Record<string, unknown>);
  }
  return renderReport(report, isMobile);
}

function renderReport(report: Captacion5FasesReport, isMobile: boolean) {
  return (
    <>
      <HeroCard report={report} isMobile={isMobile} />

      <TextSection title="Base estratégica" eyebrow="Por qué este enfoque">
        <TextBlock text={report.base_estrategica.explicacion} />
      </TextSection>

      <TextSection title="Diagnóstico de situación actual" eyebrow="Lectura de negocio">
        <TextBlock text={report.diagnostico_de_situacion_actual.como_estas_en_este_momento} />
        <InsightList items={diagnosticoClavesItems(report.diagnostico_de_situacion_actual)} />
      </TextSection>

      <TextSection title="Tu oportunidad de captación" eyebrow="Dónde está el desbloqueo">
        <InsightList items={oportunidadItems(report.tu_oportunidad_de_captacion)} />
      </TextSection>

      <TextSection title="Estrategia de captación en 5 fases" eyebrow="Arquitectura general">
        <TextBlock text={report.estrategia_de_captacion_en_5_fases.explicacion_educativa} />
      </TextSection>

      {report.estrategia_de_captacion_en_5_fases.propuestas.map((proposal) => (
        <ProposalCard
          key={`propuesta-${proposal.numero}`}
          proposal={proposal}
          isMobile={isMobile}
        />
      ))}

      <TextSection title="Próximos pasos" eyebrow="Cómo empezar">
        <TextBlock text={report.proximos_pasos.texto} />
        <View style={styles.pasosList}>
          {report.proximos_pasos.pasos.map((paso, index) => (
            <View key={`paso-${index}`} style={styles.pasoItem}>
              <ThemedText style={styles.pasoIndex}>{String(index + 1).padStart(2, "0")}</ThemedText>
              <ThemedText style={styles.pasoText}>{paso}</ThemedText>
            </View>
          ))}
        </View>
      </TextSection>
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

interface SalesScriptBlockEntry {
  key: keyof SalesScriptDevelopedScript;
  label: string;
}

const SALES_SCRIPT_BLOCK_ORDER: readonly SalesScriptBlockEntry[] = [
  { key: "previo_a_la_presentacion", label: "Previo a la presentación" },
  { key: "logo", label: "Logo" },
  { key: "nombre_producto_servicio", label: "Nombre del producto / servicio" },
  { key: "problema", label: "Problema" },
  { key: "solucion", label: "Solución" },
  {
    key: "caracteristicas_y_detalles_de_funcionamiento",
    label: "Características y funcionamiento",
  },
  { key: "precio_y_condiciones", label: "Precio y condiciones" },
  { key: "para_quien_es_y_para_quien_no_es", label: "Para quién es / no es" },
  { key: "credenciales", label: "Credenciales" },
  { key: "casos_reales", label: "Casos reales" },
  { key: "primera_llamada_a_la_accion", label: "Primera llamada a la acción" },
  { key: "limitacion", label: "Limitación" },
  { key: "bonus_o_regalos", label: "Bonus o regalos" },
  { key: "segunda_llamada_a_la_accion", label: "Segunda llamada a la acción" },
  { key: "gestion_de_objeciones", label: "Gestión de objeciones" },
  { key: "repeticion_o_ampliacion", label: "Repetición / ampliación" },
  { key: "llamada_a_la_accion_final", label: "Llamada a la acción final" },
];

function ScriptBlockCard({
  index,
  eyebrow,
  block,
}: {
  index: number;
  eyebrow: string;
  block: SalesScriptBlock;
}) {
  return (
    <View style={styles.scriptBlockCard}>
      <View style={styles.scriptBlockHeader}>
        <View style={styles.scriptBlockBadge}>
          <ThemedText style={styles.scriptBlockBadgeText}>
            {String(index + 1).padStart(2, "0")}
          </ThemedText>
        </View>
        <View style={styles.scriptBlockHeaderCopy}>
          <ThemedText style={styles.scriptBlockEyebrow}>{eyebrow}</ThemedText>
          <ThemedText style={styles.scriptBlockTitle}>{block.titulo}</ThemedText>
        </View>
      </View>

      {(block.peso_porcentual !== null || block.palabras_orientativas !== null) && (
        <View style={styles.scriptBlockMetrics}>
          {block.peso_porcentual !== null && (
            <View style={styles.scriptBlockMetric}>
              <ThemedText style={styles.scriptBlockMetricLabel}>PESO</ThemedText>
              <ThemedText style={styles.scriptBlockMetricValue}>
                {block.peso_porcentual}%
              </ThemedText>
            </View>
          )}
          {block.palabras_orientativas !== null && (
            <View style={styles.scriptBlockMetric}>
              <ThemedText style={styles.scriptBlockMetricLabel}>PALABRAS</ThemedText>
              <ThemedText style={styles.scriptBlockMetricValue}>
                ~{block.palabras_orientativas}
              </ThemedText>
            </View>
          )}
        </View>
      )}

      <View style={styles.scriptQuotePanel}>
        <ThemedText style={styles.scriptQuoteLabel}>Texto del guion</ThemedText>
        <ThemedText style={styles.scriptQuoteText}>“{block.texto_guion}”</ThemedText>
      </View>

      <View style={styles.scriptNotesPanel}>
        <ThemedText style={styles.scriptNotesLabel}>Notas de uso</ThemedText>
        <ThemedText style={styles.scriptNotesText}>{block.notas_de_uso}</ThemedText>
      </View>
    </View>
  );
}

export function renderSalesScriptReport(report: SalesScriptReport, isMobile: boolean) {
  const developed = report.guion_optimizado_de_ventas.guion_desarrollado;

  return (
    <>
      <View style={styles.heroBlock}>
        <View style={styles.heroDivider} />
        <View style={styles.heroEyebrowRow}>
          <View style={styles.heroDot} />
          <ThemedText style={styles.heroEyebrow}>Informe listo</ThemedText>
        </View>
        <ThemedText style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
          {report.titulo}
        </ThemedText>
        <ThemedText style={styles.heroBody}>{report.introduccion.texto}</ThemedText>
      </View>

      <TextSection title="Base estratégica" eyebrow="Por qué este enfoque">
        <TextBlock text={report.base_estrategica.texto} />
      </TextSection>

      <TextSection title="Guion optimizado de ventas" eyebrow="Cómo leerlo">
        <TextBlock text={report.guion_optimizado_de_ventas.texto_introductorio_del_guion} />
      </TextSection>

      <View style={styles.scriptBlocksList}>
        {SALES_SCRIPT_BLOCK_ORDER.map((entry, index) => (
          <ScriptBlockCard
            key={entry.key}
            index={index}
            eyebrow={entry.label}
            block={developed[entry.key]}
          />
        ))}
      </View>

      <TextSection title="Uso y particularidades" eyebrow="Cómo aplicarlo">
        <TextBlock text={report.uso_y_particularidades.texto} />
      </TextSection>
    </>
  );
}

export function renderValueIdeasReport(report: ValueIdeasReport) {
  return (
    <>
      <View style={styles.heroBlock}>
        <View style={styles.heroDivider} />
        <View style={styles.heroEyebrowRow}>
          <View style={styles.heroDot} />
          <ThemedText style={styles.heroEyebrow}>Informe listo</ThemedText>
        </View>
        <ThemedText style={styles.heroTitle}>
          Pequeñas palancas que elevan tu valor percibido.
        </ThemedText>
        <ThemedText style={styles.heroBody}>{report.introduccion.texto}</ThemedText>
      </View>

      <SectionCard title="Propuestas de micro-diferenciación" eyebrow="Ideas para aplicar">
        <View style={styles.ideasList}>
          {report.propuestas_micro_diferenciacion.map((proposal, index) => (
            <ValueIdeaCard
              key={`${proposal.palanca_evaluada}-${index}`}
              proposal={proposal}
              index={index}
            />
          ))}
        </View>
      </SectionCard>

      <TextSection title="Puesta en marcha" eyebrow="Próximos pasos">
        <TextBlock text={report.puesta_en_marcha.texto} />
      </TextSection>
    </>
  );
}

function categoryLabel(category: BusinessMindsetCategoryKey): string {
  return BUSINESS_MINDSET_CATEGORY_LABELS[category];
}

function MindsetScoreCard({
  label,
  value,
  helper,
  highlight,
}: {
  label: string;
  value: string;
  helper?: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.mindsetScoreCard, highlight && styles.mindsetScoreCardHighlight]}>
      <ThemedText style={styles.mindsetScoreLabel}>{label}</ThemedText>
      <ThemedText style={styles.mindsetScoreValue}>{value}</ThemedText>
      {helper ? <ThemedText style={styles.mindsetScoreHelper}>{helper}</ThemedText> : null}
    </View>
  );
}

function MindsetRecommendationList({
  title,
  recommendations,
}: {
  title: string;
  recommendations: string[];
}) {
  return (
    <View style={styles.mindsetRecommendationGroup}>
      <ThemedText style={styles.mindsetRecommendationTitle}>{title}</ThemedText>
      <InsightList
        items={recommendations.map((recommendation, index) => ({
          label: `Recomendación ${index + 1}`,
          value: recommendation,
        }))}
      />
    </View>
  );
}

export function renderBusinessMindsetReport(report: BusinessMindsetReport, isMobile: boolean) {
  const global = report.resultado_global;
  const scorecard = report.scorecard;

  return (
    <>
      <View style={styles.heroBlock}>
        <View style={styles.heroDivider} />
        <View style={styles.heroEyebrowRow}>
          <View style={styles.heroDot} />
          <ThemedText style={styles.heroEyebrow}>Informe listo</ThemedText>
        </View>
        <ThemedText style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>
          {report.titulo}
        </ThemedText>
        <ThemedText style={styles.heroBody}>{report.introduccion.texto}</ThemedText>
      </View>

      <SectionCard title="Resultado global" eyebrow="Mentalidad empresarial">
        <View style={styles.mindsetScoreGrid}>
          <MindsetScoreCard
            label="Score global"
            value={`${global.score}/100`}
            helper={global.level}
            highlight
          />
          <MindsetScoreCard
            label="Categoría más fuerte"
            value={categoryLabel(global.strongest_category)}
            helper={scorecard.categories[global.strongest_category]?.level}
          />
          <MindsetScoreCard
            label="Categoría más débil"
            value={categoryLabel(global.weakest_category)}
            helper={scorecard.categories[global.weakest_category]?.level}
          />
        </View>
        <TextBlock text={global.analysis} />
      </SectionCard>

      <SectionCard title="Radiografía del perfil" eyebrow="Diagnóstico por categoría">
        <View style={styles.mindsetCategoryList}>
          {BUSINESS_MINDSET_CATEGORIES.map((category) => {
            const diagnosis = report.radiografia_del_perfil[category];
            const score = scorecard.categories[category]?.score ?? diagnosis.score;

            return (
              <View key={category} style={styles.mindsetCategoryCard}>
                <View style={styles.mindsetCategoryHeader}>
                  <View style={styles.mindsetCategoryTitleWrap}>
                    <ThemedText style={styles.mindsetCategoryTitle}>
                      {categoryLabel(category)}
                    </ThemedText>
                    <ThemedText style={styles.mindsetCategoryLevel}>{diagnosis.level}</ThemedText>
                  </View>
                  <ThemedText style={styles.mindsetCategoryScore}>{score}/100</ThemedText>
                </View>
                <TextBlock text={diagnosis.analysis} />
              </View>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title="Recomendaciones de mejora" eyebrow="Tres acciones por área">
        <View style={styles.mindsetRecommendations}>
          {BUSINESS_MINDSET_CATEGORIES.map((category) => (
            <MindsetRecommendationList
              key={category}
              title={categoryLabel(category)}
              recommendations={report.recomendaciones_de_mejora[category].recomendaciones}
            />
          ))}
        </View>
      </SectionCard>

      <TextSection title="Conclusiones finales" eyebrow="Lectura ejecutiva">
        <KeyValueList
          items={[
            {
              label: "Perfil de personalidad empresarial",
              value: report.conclusiones_finales.perfil_de_personalidad_empresarial,
            },
            {
              label: "Bloqueos y consecuencias en tus resultados",
              value: report.conclusiones_finales.bloqueos_y_consecuencias_en_tus_resultados,
            },
            {
              label: "Evolución y oportunidades de crecimiento",
              value: report.conclusiones_finales.evolucion_y_oportunidades_de_crecimiento,
            },
          ]}
        />
      </TextSection>
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

function renderGeneratedStrategyReport({
  reportType,
  generatedReport,
  isMobile,
}: {
  reportType: string | null;
  generatedReport: Record<string, unknown>;
  isMobile: boolean;
}) {
  if (reportType === "captacion_5_fases") {
    return renderReport(generatedReport as unknown as Captacion5FasesReport, isMobile);
  }
  if (reportType === "value_ideas") {
    return renderValueIdeasReport(generatedReport as unknown as ValueIdeasReport);
  }
  if (reportType === "guion_ventas") {
    return renderSalesScriptReport(generatedReport as unknown as SalesScriptReport, isMobile);
  }
  if (reportType === "mentalidad_empresarial") {
    return renderBusinessMindsetReport(
      generatedReport as unknown as BusinessMindsetReport,
      isMobile,
    );
  }
  return renderGenericReport(generatedReport);
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
            showBack
          />

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + Spacing.five },
            ]}
            showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
          >
            {renderGeneratedStrategyReport({ reportType, generatedReport, isMobile })}
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
    gap: Spacing.four,
  },
  heroBlock: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: Spacing.two,
  },
  heroEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: SemanticColors.success,
  },
  heroEyebrow: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    textTransform: "uppercase",
    letterSpacing: 1.8,
  },
  heroTitle: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 30,
    lineHeight: 36,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.4,
    marginTop: Spacing.one,
  },
  heroTitleMobile: {
    fontSize: 24,
    lineHeight: 30,
  },
  heroBody: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 15,
    lineHeight: 24,
    color: "rgba(255,255,255,0.78)",
    marginTop: Spacing.two,
  },
  textSectionHeader: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.one,
  },
  textSectionEyebrow: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  textSectionTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.2,
  },
  textSectionBody: {
    paddingHorizontal: Spacing.one,
    paddingTop: Spacing.two,
    gap: Spacing.two,
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
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  listBullet: {
    fontFamily: Fonts.montserratBold,
    fontSize: 18,
    lineHeight: 22,
    color: "rgba(0,255,132,0.55)",
    minWidth: 16,
    textAlign: "center",
  },
  listCopy: {
    flex: 1,
    gap: 4,
  },
  listLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  listValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.88)",
  },
  listValueLead: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: SemanticColors.textPrimary,
  },
  insightList: {
    gap: Spacing.three,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    paddingLeft: Spacing.three,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255,255,255,0.06)",
  },
  insightRowLead: {
    borderLeftColor: SemanticColors.success,
    paddingVertical: Spacing.one,
  },
  insightIndex: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 22,
    lineHeight: 26,
    color: "rgba(0,255,132,0.35)",
    letterSpacing: -0.5,
    minWidth: 32,
  },
  insightCopy: {
    flex: 1,
    gap: 6,
  },
  insightLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  insightValue: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 15,
    lineHeight: 23,
    color: "rgba(255,255,255,0.88)",
  },
  insightValueLead: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 17,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
  },
  mindsetScoreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  mindsetScoreCard: {
    flexGrow: 1,
    flexBasis: 180,
    gap: 6,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  mindsetScoreCardHighlight: {
    borderColor: "rgba(0,255,132,0.28)",
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  mindsetScoreLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 10,
    lineHeight: 13,
    color: "rgba(255,255,255,0.55)",
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  mindsetScoreValue: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 26,
    lineHeight: 30,
    color: SemanticColors.textPrimary,
  },
  mindsetScoreHelper: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 12,
    lineHeight: 17,
    color: "rgba(255,255,255,0.72)",
  },
  mindsetCategoryList: {
    gap: Spacing.two,
  },
  mindsetCategoryCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.12)",
    backgroundColor: "rgba(255,255,255,0.025)",
  },
  mindsetCategoryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  mindsetCategoryTitleWrap: {
    flex: 1,
    gap: 4,
  },
  mindsetCategoryTitle: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 16,
    lineHeight: 21,
    color: SemanticColors.textPrimary,
  },
  mindsetCategoryLevel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  mindsetCategoryScore: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 24,
    lineHeight: 28,
    color: "rgba(0,255,132,0.8)",
    minWidth: 72,
    textAlign: "right",
  },
  mindsetRecommendations: {
    gap: Spacing.four,
  },
  mindsetRecommendationGroup: {
    gap: Spacing.two,
  },
  mindsetRecommendationTitle: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 16,
    lineHeight: 21,
    color: SemanticColors.textPrimary,
  },
  proposalCard: {
    gap: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,255,132,0.18)",
  },
  proposalHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingHorizontal: Spacing.one,
  },
  proposalMonumental: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 72,
    lineHeight: 72,
    color: "rgba(0,255,132,0.18)",
    letterSpacing: -2,
  },
  proposalHeroCopy: {
    flex: 1,
    gap: 4,
  },
  proposalEyebrow: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 1.8,
  },
  proposalTitle: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 22,
    lineHeight: 28,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.2,
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
  subBlock: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
  subBlockTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 13,
    lineHeight: 18,
    color: SemanticColors.success,
    letterSpacing: 0.4,
  },
  limitacionCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.14)",
    padding: Spacing.three,
    gap: Spacing.two,
  },
  limitacionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  limitacionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
  },
  limitacionBadgeText: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
  },
  limitacionTitle: {
    flex: 1,
    fontFamily: Fonts.montserratBold,
    fontSize: 15,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
  costesPanel: {
    gap: Spacing.three,
  },
  costesTotalCard: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
    backgroundColor: "rgba(0,255,132,0.06)",
  },
  costesTotalLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: SemanticColors.success,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    flexShrink: 1,
  },
  costesTotalValue: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 28,
    lineHeight: 34,
    color: SemanticColors.textPrimary,
    letterSpacing: -0.4,
  },
  costesBreakdown: {
    gap: Spacing.two,
  },
  costesBreakdownTitle: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.4,
  },
  costesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  costItem: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "30%",
    minWidth: 140,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  costItemLabel: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.65)",
  },
  costItemValue: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  retornoPanel: {
    gap: Spacing.three,
  },
  retornoKpis: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  retornoKpi: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "30%",
    minWidth: 140,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    gap: 4,
  },
  retornoKpiHighlight: {
    backgroundColor: "rgba(0,255,132,0.10)",
    borderColor: "rgba(0,255,132,0.32)",
  },
  retornoKpiLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.4,
  },
  retornoKpiValue: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 20,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
  },
  retornoKpiValueHighlight: {
    color: SemanticColors.success,
  },
  retornoMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  retornoMetric: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "30%",
    minWidth: 140,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  retornoMetricLabel: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.65)",
  },
  retornoMetricValue: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  planAccionPanel: {
    gap: Spacing.three,
  },
  planAccionDuration: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
    backgroundColor: "rgba(0,255,132,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
  },
  planAccionDurationLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.success,
    letterSpacing: 1.4,
  },
  planAccionDurationValue: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 13,
    lineHeight: 16,
    color: SemanticColors.textPrimary,
  },
  planAccionSemana: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.14)",
    padding: Spacing.three,
    gap: Spacing.two,
  },
  planAccionSemanaHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  planAccionSemanaBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.28)",
  },
  planAccionSemanaBadgeText: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 12,
    lineHeight: 14,
    color: SemanticColors.success,
  },
  planAccionSemanaCopy: {
    flex: 1,
    gap: 2,
  },
  planAccionSemanaTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 14,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  planAccionSemanaFoco: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(255,255,255,0.65)",
  },
  pasosList: {
    gap: Spacing.three,
    paddingTop: Spacing.two,
  },
  pasoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.three,
    paddingLeft: Spacing.three,
    borderLeftWidth: 2,
    borderLeftColor: "rgba(0,255,132,0.32)",
  },
  pasoIndex: {
    fontFamily: Fonts.octosquaresBlack,
    fontSize: 22,
    lineHeight: 26,
    color: "rgba(0,255,132,0.45)",
    letterSpacing: -0.5,
    minWidth: 32,
  },
  pasoText: {
    flex: 1,
    fontFamily: Fonts.montserratMedium,
    fontSize: 15,
    lineHeight: 24,
    color: "rgba(255,255,255,0.88)",
  },
  scriptBlocksList: {
    gap: Spacing.three,
  },
  scriptBlockCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    padding: Spacing.three,
    gap: Spacing.three,
  },
  scriptBlockHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  scriptBlockBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,255,132,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.32)",
  },
  scriptBlockBadgeText: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 13,
    lineHeight: 16,
    color: SemanticColors.success,
  },
  scriptBlockHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  scriptBlockEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.success,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  scriptBlockTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 16,
    lineHeight: 22,
    color: SemanticColors.textPrimary,
  },
  scriptBlockMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  scriptBlockMetric: {
    flexGrow: 0,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: 2,
  },
  scriptBlockMetricLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.4,
  },
  scriptBlockMetricValue: {
    fontFamily: Fonts.montserratExtraBold,
    fontSize: 15,
    lineHeight: 18,
    color: SemanticColors.textPrimary,
  },
  scriptQuotePanel: {
    backgroundColor: "rgba(14, 35, 30, 0.58)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,255,132,0.18)",
    padding: Spacing.three,
    gap: Spacing.one,
  },
  scriptQuoteLabel: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 13,
    color: SemanticColors.success,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  scriptQuoteText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 15,
    lineHeight: 24,
    color: SemanticColors.textPrimary,
    fontStyle: "italic",
  },
  scriptNotesPanel: {
    gap: 4,
  },
  scriptNotesLabel: {
    fontFamily: Fonts.montserratBold,
    fontSize: 11,
    lineHeight: 14,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  scriptNotesText: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 20,
    color: "rgba(255,255,255,0.78)",
  },
});
