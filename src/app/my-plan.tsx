import { AppBackground } from "@/components/app-background";
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
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { usePlanStore } from "@/stores/plan-store";
import type { PlanData } from "@/types/plan-data";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SectionBlock({ children }: { children: ReactNode }) {
  return <View style={blockStyles.block}>{children}</View>;
}

function SectionDivider() {
  return <View style={blockStyles.divider} />;
}

const blockStyles = StyleSheet.create({
  block: {
    marginBottom: Spacing.five,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: Spacing.five,
  },
});

export default function MyPlanScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { latestPlan, fetchLatestPlan, error } = usePlanStore();

  useEffect(() => {
    if (user?.userId && !latestPlan) {
      void fetchLatestPlan(user.userId);
    }
  }, [user?.userId]);

  if (!latestPlan && !error) {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader topInset={insets.top} icon="trophy" titlePrefix="Mi" titleAccent="Plan" />
          <View style={styles.centered}>
            <ActivityIndicator color="#00FF84" size="large" />
          </View>
        </View>
      </AppBackground>
    );
  }

  if (!latestPlan) {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader topInset={insets.top} icon="trophy" titlePrefix="Mi" titleAccent="Plan" />
          <View style={styles.centered}>
            <ThemedText type="bodyMd" style={styles.emptyText}>
              Aún no tienes un plan generado.{"\n"}Completa el onboarding para crearlo.
            </ThemedText>
          </View>
        </View>
      </AppBackground>
    );
  }

  return <PlanContent plan={latestPlan.plan as PlanData} insets={insets} />;
}

interface PlanContentProps {
  plan: PlanData;
  insets: { top: number; bottom: number };
}

function PlanContent({ plan, insets }: PlanContentProps) {
  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState("intro");

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
    const result: PlanTab[] = [];
    if (plan.introduccion_general) result.push({ key: "intro", label: "Introducción" });
    if (diagnosis?.mensaje_introduccion) result.push({ key: "diagnosis", label: "Diagnóstico" });
    if (hasAreaAnalysis) result.push({ key: "areas", label: "Áreas" });
    if (hasBlockers) result.push({ key: "blockers", label: "Bloqueos" });
    if (hasOpportunities) result.push({ key: "opportunities", label: "Oportunidades" });
    if (hasSalesStrategy) result.push({ key: "strategy", label: "Plan ventas" });
    if (hasSales) result.push({ key: "sales", label: "Proyección" });
    if (hasFirstStep) result.push({ key: "firststep", label: "Primer paso" });
    if (hasRedefineRole) result.push({ key: "redefine", label: "Redefinir rol" });
    if (hasLeadership) result.push({ key: "leadership", label: "Liderazgo" });
    return result;
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

  const handleSectionLayout = useCallback((key: string, y: number) => {
    sectionOffsets.current[key] = y;
  }, []);

  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const isScrollingToTab = useRef(false);

  const handleTabPress = useCallback((key: string) => {
    setActiveTab(key);
    isScrollingToTab.current = true;
    const offset = sectionOffsets.current[key];
    if (offset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: offset - 8, animated: true });
      setTimeout(() => {
        isScrollingToTab.current = false;
      }, 600);
    } else {
      isScrollingToTab.current = false;
    }
  }, []);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isScrollingToTab.current) return;
      const scrollY = e.nativeEvent.contentOffset.y + 60;
      const keys = tabs.map((t) => t.key);
      let current = keys[0];
      for (const key of keys) {
        const offset = sectionOffsets.current[key];
        if (offset !== undefined && scrollY >= offset) {
          current = key;
        }
      }
      if (current && current !== activeTabRef.current) {
        setActiveTab(current);
      }
    },
    [tabs],
  );

  return (
    <AppBackground>
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
          scrollEventThrottle={32}
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
                <FirstStepSection
                  message={leadershipPlan!.primer_paso_trabajar_la_mitad!.mensaje!}
                />
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
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 26,
  },
  headerBlock: {
    backgroundColor: "#202F3F",
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
});
