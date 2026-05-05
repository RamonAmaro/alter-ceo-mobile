import type { PlanData } from "@/types/plan";

import { AreaAnalysisSection } from "./area-analysis-section";
import { BlockersList } from "./blockers-list";
import { DiagnosisSection } from "./diagnosis-section";
import { FirstStepSection } from "./first-step-section";
import { IndicatorsSection } from "./indicators-section";
import { OpportunitiesList } from "./opportunities-list";
import { PlanConclusion } from "./plan-conclusion";
import { PlanIntroSection } from "./plan-intro-section";
import { PlanSection } from "./plan-section";
import type { PlanFlags, PlanSectionKey } from "./plan-sections-config";
import { SalesSection } from "./sales-section";
import { SalesStrategySection } from "./sales-strategy-section";

interface PlanSectionDescriptor {
  readonly key: PlanSectionKey;
  readonly visible: boolean;
  readonly render: (sectionNumber: string) => React.ReactNode;
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
          {descriptor.render(String(index + 1))}
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
      render: (n) => (
        <PlanIntroSection introduction={plan.introduccion_general} sectionNumber={n} />
      ),
    },
    {
      key: "diagnosis",
      visible: flags.diagnosis,
      render: (n) => (
        <DiagnosisSection
          introduction={diagnosis?.mensaje_introduccion}
          summary={diagnosis?.resumen_negocio}
          sectionNumber={n}
        />
      ),
    },
    {
      key: "indicators",
      visible: flags.indicators,
      render: (n) => <IndicatorsSection pillars={diagnosis?.seis_pilares} sectionNumber={n} />,
    },
    {
      key: "areas",
      visible: flags.areas,
      render: (n) =>
        diagnosis?.analisis_por_areas ? (
          <AreaAnalysisSection areas={diagnosis.analisis_por_areas} sectionNumber={n} />
        ) : null,
    },
    {
      key: "blockers",
      visible: flags.blockers,
      render: (n) =>
        diagnosis?.bloqueos_detectados ? (
          <BlockersList
            introduction={diagnosis.introduccion_bloqueos}
            blockers={diagnosis.bloqueos_detectados}
            sectionNumber={n}
          />
        ) : null,
    },
    {
      key: "opportunities",
      visible: flags.opportunities,
      render: (n) =>
        diagnosis?.oportunidades_mejora ? (
          <OpportunitiesList
            introduction={diagnosis.introduccion_oportunidades}
            opportunities={diagnosis.oportunidades_mejora}
            sectionNumber={n}
          />
        ) : null,
    },
    {
      key: "strategy",
      visible: flags.strategy,
      render: (n) => (
        <SalesStrategySection
          productImprovement={sales?.mejorar_producto_servicio}
          customerAcquisition={sales?.aumentar_captacion_clientes}
          conversionImprovement={sales?.mejorar_conversion}
          sectionNumber={n}
        />
      ),
    },
    {
      key: "sales",
      visible: flags.sales,
      render: (n) =>
        sales?.objetivo_facturacion_12_meses ? (
          <SalesSection
            target={sales.objetivo_facturacion_12_meses}
            projectionIntroduction={sales.introduccion_evolucion_ventas}
            monthlyProjection={sales.proyeccion_mensual_euros ?? []}
            immediatePriorities={sales.prioridad_inmediata_30_dias ?? []}
            sectionNumber={n}
          />
        ) : null,
    },
    {
      key: "firststep",
      visible: flags.firststep,
      render: (n) => {
        const message = leadership?.primer_paso_trabajar_la_mitad?.mensaje;
        return message ? <FirstStepSection message={message} sectionNumber={n} /> : null;
      },
    },
    {
      key: "conclusion",
      visible: flags.conclusion,
      render: (n) =>
        plan.conclusion_express ? (
          <PlanConclusion text={plan.conclusion_express} sectionNumber={n} />
        ) : null,
    },
  ];
}
