import { useTaskEventStream } from "@/hooks/use-task-event-stream";
import { useAuthStore } from "@/stores/auth-store";
import { Redirect, Stack } from "expo-router";

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useTaskEventStream();

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "default" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="recording" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="tasks" />
      <Stack.Screen name="task-create" options={{ presentation: "modal" }} />
      <Stack.Screen name="task-edit/[taskId]" options={{ presentation: "modal" }} />
      <Stack.Screen name="settings" />
      <Stack.Screen name="strategies" />
      <Stack.Screen name="plan-detail" />
      <Stack.Screen name="strategy-detail/[reportId]" />
      <Stack.Screen name="strategy" />

      <Stack.Screen name="strategy-intro/[strategyKey]" />
      <Stack.Screen name="strategy-intro/mentalidad-instructions" />

      <Stack.Screen name="strategy-questionnaire" />
      <Stack.Screen name="strategy-questionnaire-loading" />
      <Stack.Screen name="strategy-questionnaire-result" />

      <Stack.Screen name="chat" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="debug" />
      <Stack.Screen name="meeting-detail" />
      <Stack.Screen name="source-detail" />
      <Stack.Screen name="business-memory" />
    </Stack>
  );
}
