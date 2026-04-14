import { AreaAnalysisSection } from "@/components/my-plan/area-analysis-section";
import { BlockersList } from "@/components/my-plan/blockers-list";
import { DiagnosisSection } from "@/components/my-plan/diagnosis-section";
import { FirstStepSection } from "@/components/my-plan/first-step-section";
import { LeadershipSection } from "@/components/my-plan/leadership-section";
import { OpportunitiesList } from "@/components/my-plan/opportunities-list";
import { PlanConclusion } from "@/components/my-plan/plan-conclusion";
import { PlanHero } from "@/components/my-plan/plan-hero";
import { PlanNavTabs, type PlanTab } from "@/components/my-plan/plan-nav-tabs";
import { RedefineRoleSection } from "@/components/my-plan/redefine-role-section";
import { SalesSection } from "@/components/my-plan/sales-section";
import { SalesStrategySection } from "@/components/my-plan/sales-strategy-section";
import { SectionBlock, SectionDivider } from "@/components/my-plan/section-layout";
import { ScreenHeader } from "@/components/screen-header";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useSectionScroll } from "@/hooks/use-section-scroll";
import type { PlanData } from "@/types/plan";
import { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";

interface PlanContentProps {
  plan: PlanData;
  insets: { top: number; bottom: number };
}

export function PlanContent({ plan, insets }: PlanContentProps) {
  const diagnosis = plan.diagnostico;
  const salesPlan = plan.plan_ventas;
  const leadershipPlan = plan.plan_liderazgo;

  const hasBlockers = (diagnosis?.bloqueos_detectados?.length ?? 0) > 0;
  const hasOpportunities = (diagnosis?.oportunidades_mejora?.length ?? 0) > 0;
  const hasAreaAnalysis = Boolean(diagnosis?.analisis_por_areas);
  const hasSalesStrategy = Boolean(
    salesPlan?.mejorar_producto_servicio ??
    salesPlan?.aumentar_captacion_clientes ??
    salesPlan?.mejorar_conversion,
  );
  const hasSales = Boolean(salesPlan?.objetivo_facturacion_12_meses);
  const hasRedefineRole = Boolean(leadershipPlan?.tres_pasos_redefinir_rol);
  const hasLeadership = Boolean(leadershipPlan);
  const hasFirstStep = Boolean(leadershipPlan?.primer_paso_trabajar_la_mitad?.mensaje);

  const tabs = useMemo(() => {
    const candidates: readonly (readonly [boolean, PlanTab])[] = [
      [Boolean(plan.introduccion_general), { key: "intro", label: "Introducción" }],
      [Boolean(diagnosis?.mensaje_introduccion), { key: "diagnosis", label: "Diagnóstico" }],
      [hasAreaAnalysis, { key: "areas", label: "Áreas" }],
      [hasBlockers, { key: "blockers", label: "Bloqueos" }],
      [hasOpportunities, { key: "opportunities", label: "Oportunidades" }],
      [hasSalesStrategy, { key: "strategy", label: "Plan ventas" }],
      [hasSales, { key: "sales", label: "Proyección" }],
      [hasFirstStep, { key: "firststep", label: "Primer paso" }],
      [hasRedefineRole, { key: "redefine", label: "Redefinir rol" }],
      [hasLeadership, { key: "leadership", label: "Liderazgo" }],
    ];
    return candidates.filter(([visible]) => visible).map(([, tab]) => tab);
  }, [
    plan.introduccion_general,
    diagnosis?.mensaje_introduccion,
    hasAreaAnalysis,
    hasBlockers,
    hasOpportunities,
    hasSalesStrategy,
    hasSales,
    hasFirstStep,
    hasRedefineRole,
    hasLeadership,
  ]);

  const { scrollRef, activeTab, handleSectionLayout, handleTabPress, handleScroll } =
    useSectionScroll(tabs);

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <ScreenHeader topInset={insets.top} icon="trophy" titlePrefix="Mi" titleAccent="Plan" />
        <PlanNavTabs tabs={tabs} activeKey={activeTab} onPress={handleTabPress} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {plan.introduccion_general && (
          <View onLayout={(e) => handleSectionLayout("intro", e.nativeEvent.layout.y)}>
            <SectionBlock>
              <PlanHero
                introduction={plan.introduccion_general}
                sector={diagnosis?.resumen_negocio?.sector}
                annualRevenue={diagnosis?.resumen_negocio?.facturacion_anual_aproximada}
              />
            </SectionBlock>
          </View>
        )}

        {diagnosis?.mensaje_introduccion && (
          <View onLayout={(e) => handleSectionLayout("diagnosis", e.nativeEvent.layout.y)}>
            <SectionDivider />
            <SectionBlock>
              <DiagnosisSection
                introduction={diagnosis.mensaje_introduccion}
                financialState={diagnosis.estado_financiero}
                founderDependency={diagnosis.situacion_actual?.nivel_dependencia_fundador}
                acquisitionSystem={diagnosis.situacion_actual?.sistema_captacion}
              />
            </SectionBlock>
          </View>
        )}

        {hasAreaAnalysis && (
          <View onLayout={(e) => handleSectionLayout("areas", e.nativeEvent.layout.y)}>
            <SectionDivider />
            <SectionBlock>
              <AreaAnalysisSection areas={diagnosis!.analisis_por_areas!} />
            </SectionBlock>
          </View>
        )}

        {hasBlockers && (
          <View onLayout={(e) => handleSectionLayout("blockers", e.nativeEvent.layout.y)}>
            <SectionDivider />
            <SectionBlock>
              <BlockersList
                introduction={diagnosis?.introduccion_bloqueos}
                blockers={diagnosis!.bloqueos_detectados!}
              />
            </SectionBlock>
          </View>
        )}

        {hasOpportunities && (
          <View onLayout={(e) => handleSectionLayout("opportunities", e.nativeEvent.layout.y)}>
            <SectionDivider />
            <SectionBlock>
              <OpportunitiesList
                introduction={diagnosis?.introduccion_oportunidades}
                opportunities={diagnosis!.oportunidades_mejora!}
              />
            </SectionBlock>
          </View>
        )}

        {hasSalesStrategy && (
          <View onLayout={(e) => handleSectionLayout("strategy", e.nativeEvent.layout.y)}>
            <SectionDivider />
            <SectionBlock>
              <SalesStrategySection
                productImprovement={salesPlan?.mejorar_producto_servicio}
                customerAcquisition={salesPlan?.aumentar_captacion_clientes}
                conversionImprovement={salesPlan?.mejorar_conversion}
              />
            </SectionBlock>
          </View>
        )}

        {hasSales && (
          <View onLayout={(e) => handleSectionLayout("sales", e.nativeEvent.layout.y)}>
            <SectionDivider />
            <SectionBlock>
              <SalesSection
                target={salesPlan!.objetivo_facturacion_12_meses!}
                projectionIntroduction={salesPlan!.introduccion_evolucion_ventas}
                monthlyProjection={salesPlan!.proyeccion_mensual_euros ?? []}
                immediatePriorities={salesPlan!.prioridad_inmediata_30_dias ?? []}
              />
            </SectionBlock>
          </View>
        )}

        {hasFirstStep && (
          <View onLayout={(e) => handleSectionLayout("firststep", e.nativeEvent.layout.y)}>
            <SectionDivider />
            <SectionBlock>
              <FirstStepSection message={leadershipPlan!.primer_paso_trabajar_la_mitad!.mensaje!} />
            </SectionBlock>
          </View>
        )}

        {hasRedefineRole && (
          <View onLayout={(e) => handleSectionLayout("redefine", e.nativeEvent.layout.y)}>
            <SectionDivider />
            <SectionBlock>
              <RedefineRoleSection steps={leadershipPlan!.tres_pasos_redefinir_rol!} />
            </SectionBlock>
          </View>
        )}

        {hasLeadership && (
          <View onLayout={(e) => handleSectionLayout("leadership", e.nativeEvent.layout.y)}>
            <SectionDivider />
            <SectionBlock>
              <LeadershipSection
                phase1={leadershipPlan!.fase_1_profesionalizar}
                phase2={leadershipPlan!.fase_2_delegacion}
                phase3={leadershipPlan!.fase_3_ceo_estrategico}
                roleEvolution={leadershipPlan!.evolucion_rol}
              />
            </SectionBlock>
          </View>
        )}

        <PlanConclusion />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    ...Platform.select({
      web: {},
      default: { backgroundColor: SemanticColors.surfaceCard },
    }),
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.six,
  },
});
