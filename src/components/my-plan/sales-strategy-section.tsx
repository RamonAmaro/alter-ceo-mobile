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
  sectionNumber?: string;
}

export function SalesStrategySection({
  productImprovement,
  customerAcquisition,
  conversionImprovement,
  sectionNumber,
}: SalesStrategySectionProps) {
  const subNumber = (n: number): string | undefined =>
    sectionNumber ? `${sectionNumber}.${n}` : undefined;

  const blocks = [
    productImprovement ? (
      <SalesProductBlock data={productImprovement} sectionNumber={subNumber(1)} />
    ) : null,
    customerAcquisition ? (
      <SalesAcquisitionBlock data={customerAcquisition} sectionNumber={subNumber(2)} />
    ) : null,
    conversionImprovement ? (
      <SalesConversionBlock data={conversionImprovement} sectionNumber={subNumber(3)} />
    ) : null,
  ].filter(Boolean);

  if (blocks.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        eyebrow="ESTRATEGIA · DE CRECIMIENTO"
        title="Plan para duplicar ventas"
        sectionNumber={sectionNumber}
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
