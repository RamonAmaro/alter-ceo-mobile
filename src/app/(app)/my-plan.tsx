import { PlanContent } from "@/components/my-plan/plan-content";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { usePlanStore } from "@/stores/plan-store";
import type { PlanData } from "@/types/plan";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyPlanScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const user = useAuthStore((s) => s.user);
  const latestPlan = usePlanStore((s) => s.latestPlan);
  const fetchLatestPlan = usePlanStore((s) => s.fetchLatestPlan);
  const error = usePlanStore((s) => s.error);

  useEffect(() => {
    if (user?.userId && !latestPlan) {
      void fetchLatestPlan(user.userId);
    }
  }, [user?.userId, latestPlan, fetchLatestPlan]);

  if (!latestPlan && !error) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="trophy"
          titlePrefix="Mi"
          titleAccent="Plan"
          showBack={isMobile}
        />
        <View style={styles.centered}>
          <ActivityIndicator color={SemanticColors.success} size="large" />
        </View>
      </View>
    );
  }

  if (!latestPlan) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          icon="trophy"
          titlePrefix="Mi"
          titleAccent="Plan"
          showBack={isMobile}
        />
        <View style={styles.centered}>
          <ThemedText type="bodyMd" style={styles.emptyText}>
            Aún no tienes un plan generado.{"\n"}Completa el onboarding para crearlo.
          </ThemedText>
        </View>
      </View>
    );
  }

  return <PlanContent plan={latestPlan.plan as PlanData} insets={insets} />;
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
    color: SemanticColors.textMuted,
    textAlign: "center",
    lineHeight: 26,
  },
});
