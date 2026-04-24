import { View, type LayoutChangeEvent } from "react-native";

import { SectionBlock, SectionDivider } from "./section-layout";
import type { PlanSectionKey } from "./plan-sections-config";

interface PlanSectionProps {
  sectionKey: PlanSectionKey;
  isFirst: boolean;
  onLayout: (key: PlanSectionKey, y: number) => void;
  children: React.ReactNode;
}

export function PlanSection({ sectionKey, isFirst, onLayout, children }: PlanSectionProps) {
  function handleLayout(event: LayoutChangeEvent): void {
    onLayout(sectionKey, event.nativeEvent.layout.y);
  }

  return (
    <View onLayout={handleLayout}>
      {!isFirst && <SectionDivider />}
      <SectionBlock>{children}</SectionBlock>
    </View>
  );
}
