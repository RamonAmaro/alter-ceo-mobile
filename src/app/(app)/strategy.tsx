import { AppBackground } from "@/components/app-background";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth-store";
import { usePlanStore } from "@/stores/plan-store";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Bloqueo {
  titulo: string;
  descripcion_corta: string;
}

interface Oportunidad {
  titulo: string;
  propuesta_accion: string;
}

interface Diagnostico {
  mensaje_introduccion?: string;
  bloqueos_detectados?: Bloqueo[];
  oportunidades_mejora?: Oportunidad[];
}

interface PlanVentas {
  objetivo_facturacion_12_meses?: number;
  prioridad_inmediata_30_dias?: string[];
}

interface PlanLiderazgo {
  fase_1_profesionalizar?: string;
  fase_2_delegacion?: string;
  fase_3_ceo_estrategico?: string;
}

interface PlanData {
  diagnostico?: Diagnostico;
  plan_ventas?: PlanVentas;
  plan_liderazgo?: PlanLiderazgo;
}

export default function StrategyScreen() {
  const insets = useSafeAreaInsets();
  const { latestPlan, fetchLatestPlan, error } = usePlanStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user?.userId && !latestPlan) {
      void fetchLatestPlan(user.userId);
    }
  }, [user?.userId]);

  if (!latestPlan && !error) {
    return (
      <AppBackground>
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ActivityIndicator color="#00FF84" size="large" />
        </View>
      </AppBackground>
    );
  }

  if (error || !latestPlan) {
    return (
      <AppBackground>
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ThemedText type="bodyMd" style={styles.errorText}>
            No se encontró ningún plan. Completa el onboarding para generar tu plan.
          </ThemedText>
        </View>
      </AppBackground>
    );
  }

  const plan = latestPlan.plan as PlanData;
  const diagnostico = plan.diagnostico;
  const planVentas = plan.plan_ventas;
  const planLiderazgo = plan.plan_liderazgo;

  return (
    <AppBackground>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.five },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="headingLg" style={styles.pageTitle}>
          Tu plan
        </ThemedText>

        {diagnostico?.mensaje_introduccion ? (
          <View style={styles.section}>
            <ThemedText type="bodyMd" style={styles.intro}>
              {diagnostico.mensaje_introduccion}
            </ThemedText>
          </View>
        ) : null}

        {diagnostico?.bloqueos_detectados?.length ? (
          <View style={styles.section}>
            <ThemedText type="headingMd" style={styles.sectionTitle}>
              Bloqueos detectados
            </ThemedText>
            {diagnostico.bloqueos_detectados.map((b, i) => (
              <View key={i} style={styles.card}>
                <ThemedText type="labelMd" style={styles.cardTitle}>
                  {b.titulo}
                </ThemedText>
                <ThemedText type="bodyMd" style={styles.cardBody}>
                  {b.descripcion_corta}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        {diagnostico?.oportunidades_mejora?.length ? (
          <View style={styles.section}>
            <ThemedText type="headingMd" style={styles.sectionTitle}>
              Oportunidades de mejora
            </ThemedText>
            {diagnostico.oportunidades_mejora.map((o, i) => (
              <View key={i} style={styles.card}>
                <ThemedText type="labelMd" style={styles.cardTitle}>
                  {o.titulo}
                </ThemedText>
                <ThemedText type="bodyMd" style={styles.cardBody}>
                  {o.propuesta_accion}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        {planVentas ? (
          <View style={styles.section}>
            <ThemedText type="headingMd" style={styles.sectionTitle}>
              Plan de ventas
            </ThemedText>
            {planVentas.objetivo_facturacion_12_meses ? (
              <View style={styles.card}>
                <ThemedText type="labelMd" style={styles.cardTitle}>
                  Objetivo 12 meses
                </ThemedText>
                <ThemedText type="headingMd" style={styles.highlight}>
                  {planVentas.objetivo_facturacion_12_meses.toLocaleString("es-ES", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </ThemedText>
              </View>
            ) : null}
            {planVentas.prioridad_inmediata_30_dias?.length ? (
              <View style={styles.card}>
                <ThemedText type="labelMd" style={styles.cardTitle}>
                  Prioridades inmediatas (30 días)
                </ThemedText>
                {planVentas.prioridad_inmediata_30_dias.map((p, i) => (
                  <ThemedText key={i} type="bodyMd" style={styles.listItem}>
                    • {p}
                  </ThemedText>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {planLiderazgo ? (
          <View style={styles.section}>
            <ThemedText type="headingMd" style={styles.sectionTitle}>
              Plan de liderazgo
            </ThemedText>
            {[
              { label: "Fase 1 — Profesionalizar", text: planLiderazgo.fase_1_profesionalizar },
              { label: "Fase 2 — Delegación", text: planLiderazgo.fase_2_delegacion },
              { label: "Fase 3 — CEO estratégico", text: planLiderazgo.fase_3_ceo_estrategico },
            ].map(({ label, text }) =>
              text ? (
                <View key={label} style={styles.card}>
                  <ThemedText type="labelMd" style={styles.cardTitle}>
                    {label}
                  </ThemedText>
                  <ThemedText type="bodyMd" style={styles.cardBody}>
                    {text}
                  </ThemedText>
                </View>
              ) : null,
            )}
          </View>
        ) : null}
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.five,
  },
  pageTitle: {
    color: "#ffffff",
    marginBottom: Spacing.two,
  },
  intro: {
    color: "rgba(255,255,255,0.8)",
    lineHeight: 24,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    color: "#00FF84",
    marginBottom: Spacing.one,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.one,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardTitle: {
    color: "#ffffff",
  },
  cardBody: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
  },
  highlight: {
    color: "#00FF84",
  },
  listItem: {
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
  },
  errorText: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
});
