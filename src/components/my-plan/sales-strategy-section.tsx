import { SalesAcquisitionBlock } from "@/components/my-plan/sales-acquisition-block";
import { SalesConversionBlock } from "@/components/my-plan/sales-conversion-block";
import { SalesProductBlock } from "@/components/my-plan/sales-product-block";
import { SectionHeader } from "@/components/my-plan/section-header";
import { Spacing } from "@/constants/theme";
import type {
  PlanConversionImprovement,
  PlanCustomerAcquisition,
  PlanProductImprovement,
} from "@/types/plan-data";
import { StyleSheet, View } from "react-native";

interface SalesStrategySectionProps {
  productImprovement?: PlanProductImprovement | null;
  customerAcquisition?: PlanCustomerAcquisition | null;
  conversionImprovement?: PlanConversionImprovement | null;
}

export function SalesStrategySection({
  productImprovement,
  customerAcquisition,
  conversionImprovement,
}: SalesStrategySectionProps) {
  const hasContent = productImprovement ?? customerAcquisition ?? conversionImprovement;
  if (!hasContent) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title="Plan para duplicar tus ventas" />

      {productImprovement && <SalesProductBlock data={productImprovement} />}
      {customerAcquisition && <SalesAcquisitionBlock data={customerAcquisition} />}
      {conversionImprovement && <SalesConversionBlock data={conversionImprovement} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
});
