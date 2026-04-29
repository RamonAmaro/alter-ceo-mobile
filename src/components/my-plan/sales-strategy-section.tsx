import { SalesAcquisitionBlock } from "@/components/my-plan/sales-acquisition-block";
import { SalesConversionBlock } from "@/components/my-plan/sales-conversion-block";
import { SalesProductBlock } from "@/components/my-plan/sales-product-block";
import { SectionHeader } from "@/components/my-plan/section-header";
import { Spacing } from "@/constants/theme";
import type {
  PlanConversionImprovement,
  PlanCustomerAcquisition,
  PlanProductImprovement,
} from "@/types/plan";
import { Fragment } from "react";
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
  const blocks = [
    productImprovement ? <SalesProductBlock data={productImprovement} /> : null,
    customerAcquisition ? <SalesAcquisitionBlock data={customerAcquisition} /> : null,
    conversionImprovement ? <SalesConversionBlock data={conversionImprovement} /> : null,
  ].filter(Boolean);

  if (blocks.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        eyebrow="ESTRATEGIA · DE CRECIMIENTO"
        title="Plan para duplicar ventas"
      />

      {blocks.map((block, i) => (
        <Fragment key={i}>
          {i > 0 ? <View style={styles.divider} /> : null}
          {block}
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: Spacing.one,
  },
});
