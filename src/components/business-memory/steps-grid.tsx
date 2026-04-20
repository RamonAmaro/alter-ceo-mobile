import type { BusinessMemoryStep } from "@/constants/business-memory-steps";
import { Spacing } from "@/constants/theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { StyleSheet, View } from "react-native";
import { StepCard } from "./step-card";

interface StepsGridProps {
  steps: readonly BusinessMemoryStep[];
  onStepPress: (step: BusinessMemoryStep) => void;
}

const STAGGER_MS = 90;

export function StepsGrid({ steps, onStepPress }: StepsGridProps) {
  const { isDesktop } = useResponsiveLayout();
  const total = steps.length;

  return (
    <View style={[styles.list, isDesktop ? styles.listDesktop : null]}>
      {steps.map((step, index) => (
        <View key={step.id} style={isDesktop ? styles.itemDesktop : styles.item}>
          <StepCard
            step={step}
            index={index}
            total={total}
            onPress={() => onStepPress(step)}
            animationDelay={index * STAGGER_MS}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  listDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  item: {
    width: "100%",
  },
  itemDesktop: {
    flexGrow: 1,
    flexBasis: "48%",
    minWidth: 320,
  },
});
