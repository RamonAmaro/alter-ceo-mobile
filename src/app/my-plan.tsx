import { AppBackground } from "@/components/app-background";
import { BlockersList } from "@/components/my-plan/blockers-list";
import { DiagnosisSection } from "@/components/my-plan/diagnosis-section";
import { LeadershipSection } from "@/components/my-plan/leadership-section";
import { OpportunitiesList } from "@/components/my-plan/opportunities-list";
import { PlanHero } from "@/components/my-plan/plan-hero";
import { SalesSection } from "@/components/my-plan/sales-section";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { usePlanStore } from "@/stores/plan-store";
import type { PlanData } from "@/types/plan-data";
import { type ReactNode, useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
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

  const plan = latestPlan.plan as PlanData;
  const diagnosis = plan.diagnostico;
  const salesPlan = plan.plan_ventas;
  const leadershipPlan = plan.plan_liderazgo;

  const hasBlockers = (diagnosis?.bloqueos_detectados?.length ?? 0) > 0;
  const hasOpportunities = (diagnosis?.oportunidades_mejora?.length ?? 0) > 0;
  const hasSales = Boolean(salesPlan?.objetivo_facturacion_12_meses);
  const hasLeadership = Boolean(leadershipPlan);

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader topInset={insets.top} icon="trophy" titlePrefix="Mi" titleAccent="Plan" />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {plan.introduccion_general && (
            <SectionBlock>
              <PlanHero
                introduction={plan.introduccion_general}
                sector={diagnosis?.resumen_negocio?.sector}
                annualRevenue={diagnosis?.resumen_negocio?.facturacion_anual_aproximada}
              />
            </SectionBlock>
          )}

          {diagnosis?.mensaje_introduccion && (
            <>
              <SectionDivider />
              <SectionBlock>
                <DiagnosisSection
                  introduction={diagnosis.mensaje_introduccion}
                  financialState={diagnosis.estado_financiero}
                  founderDependency={diagnosis.situacion_actual?.nivel_dependencia_fundador}
                  acquisitionSystem={diagnosis.situacion_actual?.sistema_captacion}
                />
              </SectionBlock>
            </>
          )}

          {hasBlockers && (
            <>
              <SectionDivider />
              <SectionBlock>
                <BlockersList
                  introduction={diagnosis?.introduccion_bloqueos}
                  blockers={diagnosis!.bloqueos_detectados!}
                />
              </SectionBlock>
            </>
          )}

          {hasOpportunities && (
            <>
              <SectionDivider />
              <SectionBlock>
                <OpportunitiesList
                  introduction={diagnosis?.introduccion_oportunidades}
                  opportunities={diagnosis!.oportunidades_mejora!}
                />
              </SectionBlock>
            </>
          )}

          {hasSales && (
            <>
              <SectionDivider />
              <SectionBlock>
                <SalesSection
                  target={salesPlan!.objetivo_facturacion_12_meses!}
                  projectionIntroduction={salesPlan!.introduccion_evolucion_ventas}
                  monthlyProjection={salesPlan!.proyeccion_mensual_euros ?? []}
                  immediatePriorities={salesPlan!.prioridad_inmediata_30_dias ?? []}
                />
              </SectionBlock>
            </>
          )}

          {hasLeadership && (
            <>
              <SectionDivider />
              <SectionBlock>
                <LeadershipSection
                  phase1={leadershipPlan!.fase_1_profesionalizar}
                  phase2={leadershipPlan!.fase_2_delegacion}
                  phase3={leadershipPlan!.fase_3_ceo_estrategico}
                  roleEvolution={leadershipPlan!.evolucion_rol}
                  firstStepMessage={leadershipPlan!.primer_paso_trabajar_la_mitad?.mensaje}
                />
              </SectionBlock>
            </>
          )}
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
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
});
