import { useAuthStore } from "@/stores/auth-store";
import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
