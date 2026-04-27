import type { PlanData } from "@/types/plan";

import { AreaAnalysisSection } from "./area-analysis-section";
import { BlockersList } from "./blockers-list";
import { DiagnosisSection } from "./diagnosis-section";
import { FirstStepSection } from "./first-step-section";
import { LeadershipSection } from "./leadership-section";
import { OpportunitiesList } from "./opportunities-list";
import { PlanHero } from "./plan-hero";
import { PlanSection } from "./plan-section";
import type { PlanFlags, PlanSectionKey } from "./plan-sections-config";
import { RedefineRoleSection } from "./redefine-role-section";
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
      key: "intro",
      visible: flags.intro,
      render: () =>
        plan.introduccion_general ? (
          <PlanHero
            introduction={plan.introduccion_general}
            sector={diagnosis?.resumen_negocio?.sector}
            annualRevenue={diagnosis?.resumen_negocio?.facturacion_anual_aproximada}
            monthlyRevenue={diagnosis?.resumen_negocio?.facturacion_mensual_aproximada}
            teamSizeRange={diagnosis?.resumen_negocio?.team_size_range}
            numeroPersonasEquipo={diagnosis?.resumen_negocio?.numero_personas_equipo}
            productosServicios={diagnosis?.resumen_negocio?.productos_servicios_principales}
          />
        ) : null,
    },
    {
      key: "diagnosis",
      visible: flags.diagnosis,
      render: () =>
        diagnosis?.mensaje_introduccion ? (
          <DiagnosisSection
            introduction={diagnosis.mensaje_introduccion}
            financialState={diagnosis.estado_financiero}
            founderDependency={diagnosis.situacion_actual?.nivel_dependencia_fundador}
            acquisitionSystem={diagnosis.situacion_actual?.sistema_captacion}
            consumptionType={diagnosis.situacion_actual?.tipo_consumo}
            externalPerception={diagnosis.percepcion_externa_scrapping}
          />
        ) : null,
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
            seasonalityDetected={sales.estacionalidad_detectada}
          />
        ) : null,
    },
    {
      key: "firststep",
      visible: flags.firststep,
      render: () => {
        const firstStep = leadership?.primer_paso_trabajar_la_mitad;
        const message = firstStep?.mensaje;
        return message ? (
          <FirstStepSection message={message} escenario={firstStep?.escenario} />
        ) : null;
      },
    },
    {
      key: "redefine",
      visible: flags.redefine,
      render: () =>
        leadership?.tres_pasos_redefinir_rol ? (
          <RedefineRoleSection steps={leadership.tres_pasos_redefinir_rol} />
        ) : null,
    },
    {
      key: "leadership",
      visible: flags.leadership,
      render: () =>
        leadership ? (
          <LeadershipSection
            phase1={leadership.fase_1_profesionalizar}
            phase2={leadership.fase_2_delegacion}
            phase3={leadership.fase_3_ceo_estrategico}
            roleEvolution={leadership.evolucion_rol}
          />
        ) : null,
    },
  ];
}
