import { PlanNavTabs } from "@/components/my-plan/plan-nav-tabs";
import { PlanSectionsList } from "@/components/my-plan/plan-sections-list";
import { ScreenHeader } from "@/components/screen-header";
import { SHOW_SCROLL_INDICATOR } from "@/constants/platform";
import { SemanticColors, Spacing } from "@/constants/theme";
import { useSectionScroll } from "@/hooks/use-section-scroll";
import type { PlanData } from "@/types/plan";
import { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";

import { getPlanFlags, getPlanTabs } from "./plan-sections-config";

interface PlanContentProps {
  plan: PlanData;
  insets: { top: number; bottom: number };
}

export function PlanContent({ plan, insets }: PlanContentProps) {
  const flags = useMemo(() => getPlanFlags(plan), [plan]);
  const tabs = useMemo(() => getPlanTabs(flags), [flags]);
  const { scrollRef, activeTab, handleSectionLayout, handleTabPress, handleScroll } =
    useSectionScroll(tabs);

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock}>
        <ScreenHeader
          topInset={insets.top}
          icon="trophy"
          titlePrefix="Estrategias"
          titleAccent="activas"
        />
        <PlanNavTabs tabs={tabs} activeKey={activeTab} onPress={handleTabPress} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.six },
        ]}
        showsVerticalScrollIndicator={SHOW_SCROLL_INDICATOR}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <PlanSectionsList plan={plan} flags={flags} onSectionLayout={handleSectionLayout} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    backgroundColor: Platform.OS === "web" ? "transparent" : SemanticColors.surfaceCard,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.four,
  },
});
