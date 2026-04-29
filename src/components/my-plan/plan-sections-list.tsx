import type { PlanData } from "@/types/plan";

import { AreaAnalysisSection } from "./area-analysis-section";
import { BlockersList } from "./blockers-list";
import { BusinessSummary } from "./business-summary";
import { DiagnosisSection } from "./diagnosis-section";
import { FirstStepSection } from "./first-step-section";
import { IndicatorsSection } from "./indicators-section";
import { OpportunitiesList } from "./opportunities-list";
import { PlanConclusion } from "./plan-conclusion";
import { PlanSection } from "./plan-section";
import type { PlanFlags, PlanSectionKey } from "./plan-sections-config";
import { SalesSection } from "./sales-section";
import { SalesStrategySection } from "./sales-strategy-section";

interface PlanSectionDescriptor {
  readonly key: PlanSectionKey;
  readonly visible: boolean;
  readonly render: () => React.ReactNode;
}

interface PlanSectionsListProps {
  plan: PlanData;
  flags: PlanFlags;
  onSectionLayout: (key: PlanSectionKey, y: number) => void;
}

export function PlanSectionsList({ plan, flags, onSectionLayout }: PlanSectionsListProps) {
  const descriptors = buildSectionDescriptors(plan, flags);
  const visible = descriptors.filter((descriptor) => descriptor.visible);

  return (
    <>
      {visible.map((descriptor, index) => (
        <PlanSection
          key={descriptor.key}
          sectionKey={descriptor.key}
          isFirst={index === 0}
          onLayout={onSectionLayout}
        >
          {descriptor.render()}
        </PlanSection>
      ))}
    </>
  );
}

function buildSectionDescriptors(
  plan: PlanData,
  flags: PlanFlags,
): readonly PlanSectionDescriptor[] {
  const diagnosis = plan.diagnostico;
  const sales = plan.plan_ventas;
  const leadership = plan.plan_liderazgo;

  return [
    {
      key: "summary",
      visible: flags.summary,
      render: () => (
        <BusinessSummary
          summary={diagnosis?.resumen_negocio}
          introduction={plan.introduccion_general}
        />
      ),
    },
    {
      key: "diagnosis",
      visible: flags.diagnosis,
      render: () =>
        diagnosis?.mensaje_introduccion ? (
          <DiagnosisSection introduction={diagnosis.mensaje_introduccion} />
        ) : null,
    },
    {
      key: "indicators",
      visible: flags.indicators,
      render: () => <IndicatorsSection pillars={diagnosis?.seis_pilares} />,
    },
    {
      key: "areas",
      visible: flags.areas,
      render: () =>
        diagnosis?.analisis_por_areas ? (
          <AreaAnalysisSection areas={diagnosis.analisis_por_areas} />
        ) : null,
    },
    {
      key: "blockers",
      visible: flags.blockers,
      render: () =>
        diagnosis?.bloqueos_detectados ? (
          <BlockersList
            introduction={diagnosis.introduccion_bloqueos}
            blockers={diagnosis.bloqueos_detectados}
          />
        ) : null,
    },
    {
      key: "opportunities",
      visible: flags.opportunities,
      render: () =>
        diagnosis?.oportunidades_mejora ? (
          <OpportunitiesList
            introduction={diagnosis.introduccion_oportunidades}
            opportunities={diagnosis.oportunidades_mejora}
          />
        ) : null,
    },
    {
      key: "strategy",
      visible: flags.strategy,
      render: () => (
        <SalesStrategySection
          productImprovement={sales?.mejorar_producto_servicio}
          customerAcquisition={sales?.aumentar_captacion_clientes}
          conversionImprovement={sales?.mejorar_conversion}
        />
      ),
    },
    {
      key: "sales",
      visible: flags.sales,
      render: () =>
        sales?.objetivo_facturacion_12_meses ? (
          <SalesSection
            target={sales.objetivo_facturacion_12_meses}
            projectionIntroduction={sales.introduccion_evolucion_ventas}
            monthlyProjection={sales.proyeccion_mensual_euros ?? []}
            immediatePriorities={sales.prioridad_inmediata_30_dias ?? []}
          />
        ) : null,
    },
    {
      key: "firststep",
      visible: flags.firststep,
      render: () => {
        const message = leadership?.primer_paso_trabajar_la_mitad?.mensaje;
        return message ? <FirstStepSection message={message} /> : null;
      },
    },
    {
      key: "conclusion",
      visible: flags.conclusion,
      render: () =>
        plan.conclusion_express ? <PlanConclusion text={plan.conclusion_express} /> : null,
    },
  ];
}
