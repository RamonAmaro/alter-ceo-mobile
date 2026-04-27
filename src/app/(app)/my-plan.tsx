import { AppBackground } from "@/components/app-background";
import { PlanChatDock } from "@/components/my-plan/plan-chat-dock";
import { PlanContent } from "@/components/my-plan/plan-content";
import { PlanModifyDialog } from "@/components/my-plan/plan-modify-dialog";
import { PlanReadingNotice } from "@/components/my-plan/plan-reading-notice";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { SemanticColors } from "@/constants/theme";
import { usePlanReadingNotification } from "@/hooks/use-plan-reading-notification";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useAuthStore } from "@/stores/auth-store";
import { usePlanStore } from "@/stores/plan-store";
import type { PlanData } from "@/types/plan";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyPlanScreen() {
  const insets = useSafeAreaInsets();
  const { isMobile } = useResponsiveLayout();
  const user = useAuthStore((s) => s.user);
  const latestPlan = usePlanStore((s) => s.latestPlan);
  const fetchLatestPlan = usePlanStore((s) => s.fetchLatestPlan);
  const error = usePlanStore((s) => s.error);
  const [modifyOpen, setModifyOpen] = useState(false);

  const { visible: noticeVisible, dismiss: dismissNotice } = usePlanReadingNotification({
    userId: user?.userId ?? null,
    planId: latestPlan?.plan_id ?? null,
  });

  useEffect(() => {
    if (user?.userId && !latestPlan) {
      void fetchLatestPlan(user.userId);
    }
  }, [user?.userId, latestPlan, fetchLatestPlan]);

  function handleAcceptPlan(): void {
    // Backend pendiente: endpoint para generar tareas calendarizadas a partir
    // del plan aceptado. Por ahora navegamos a la pantalla de tareas existente.
    router.push("/(app)/tasks");
  }

  function handleModifyPlan(): void {
    setModifyOpen(true);
  }

  function handleContinueChat(): void {
    setModifyOpen(false);
    router.push("/(app)/chat");
  }

  function handleOpenChatText(): void {
    router.push("/(app)/chat");
  }

  function handleOpenChatAudio(): void {
    router.push("/(app)/chat");
  }

  if (!latestPlan && !error) {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            icon="trophy"
            titlePrefix="Planes de"
            titleAccent="negocio"
            showBack={isMobile}
          />
          <View style={styles.centered}>
            <ActivityIndicator color={SemanticColors.success} size="large" />
          </View>
        </View>
      </AppBackground>
    );
  }

  if (!latestPlan) {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            icon="trophy"
            titlePrefix="Planes de"
            titleAccent="negocio"
            showBack={isMobile}
          />
          <View style={styles.centered}>
            <ThemedText type="bodyMd" style={styles.emptyText}>
              Aún no tienes un plan generado.{"\n"}Completa el onboarding para crearlo.
            </ThemedText>
          </View>
        </View>
      </AppBackground>
    );
  }

  const dockBottomInset = insets.bottom;

  return (
    <AppBackground>
      <PlanContent
        plan={latestPlan.plan as PlanData}
        insets={{ top: insets.top, bottom: insets.bottom + DOCK_HEIGHT }}
        onAcceptPlan={handleAcceptPlan}
        onModifyPlan={handleModifyPlan}
      />
      <PlanReadingNotice visible={noticeVisible} topInset={insets.top} onDismiss={dismissNotice} />
      <PlanChatDock
        bottomInset={dockBottomInset}
        onOpenText={handleOpenChatText}
        onOpenAudio={handleOpenChatAudio}
      />
      <PlanModifyDialog
        visible={modifyOpen}
        onClose={() => setModifyOpen(false)}
        onContinueChat={handleContinueChat}
      />
    </AppBackground>
  );
}

const DOCK_HEIGHT = 60;

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
