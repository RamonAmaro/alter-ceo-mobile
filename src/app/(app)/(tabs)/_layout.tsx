import { MemoizedTabBar } from "@/components/navigation/custom-tab-bar";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  const { isMobile } = useResponsiveLayout();

  return (
    <Tabs
      tabBar={(props) => (isMobile ? <MemoizedTabBar {...props} /> : null)}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "transparent" } }}
    >
      <Tabs.Screen name="alter" />
    </Tabs>
  );
}
