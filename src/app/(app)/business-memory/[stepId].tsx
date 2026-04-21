import { AppBackground } from "@/components/app-background";
import { CompassBadge } from "@/components/business-memory/compass-badge";
import {
  ExecutionBlockForm,
  type ExecutionMicroGoalDraft,
} from "@/components/business-memory/execution-block-form";
import { MemoryEmptyState } from "@/components/business-memory/memory-empty-state";
import { MemoryForm } from "@/components/business-memory/memory-form";
import { StepDots } from "@/components/business-memory/step-dots";
import { StepHeroRing } from "@/components/business-memory/step-hero-ring";
import { TeamBlockForm } from "@/components/business-memory/team-block-form";
import type { TeamRoleDraft } from "@/components/business-memory/team-roles-editor";
import { Button } from "@/components/button";
import { KeyboardAwareScroll } from "@/components/keyboard-aware-scroll";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import type { FormFieldConfig } from "@/constants/business-memory-steps";
import { findStepById, getStepIndex } from "@/constants/business-memory-steps";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useBusinessMemoryDashboard } from "@/hooks/use-business-memory-dashboard";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { patchBusinessKernelSection } from "@/services/business-kernel-service";
import { ApiError } from "@/types/api";
import type { BusinessKernelSectionId } from "@/types/business-kernel";
import { buildBusinessMemoryFieldPresentation } from "@/utils/business-memory-display";
import { toErrorMessage } from "@/utils/to-error-message";
import { ulid } from "@/utils/ulid";
import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getInitialFieldValue(
  field: FormFieldConfig,
  rawValue: unknown,
  formattedValue: string,
): string {
  if (field.type !== "select") {
    return formattedValue;
  }
  if (typeof rawValue !== "string") {
    return "";
  }
  return field.options?.some((option) => option.value === rawValue) ? rawValue : "";
}

function buildCompanyProfilePayload(
  originalData: Record<string, unknown>,
  values: Record<string, string>,
): Record<string, unknown> {
  const next = { ...originalData };

  const businessName = values.business_name?.trim();
  if (businessName) next.business_name = businessName;

  const sector = values.sector?.trim();
  if (sector) next.sector = sector;

  const businessModel = values.business_model?.trim();
  if (businessModel) next.business_model = businessModel;

  const websiteUrl = values.website_url?.trim();
  if (websiteUrl) next.website_url = websiteUrl;

  const businessInstagram = values.business_instagram?.trim();
  if (businessInstagram) next.business_instagram = businessInstagram;

  const geography = values.geography?.trim();
  if (geography) next.geography = geography;

  return next;
}

function buildCommercialBlockPayload(
  originalData: Record<string, unknown>,
  values: Record<string, string>,
): Record<string, unknown> {
  const next = { ...originalData };

  const offerSummary = values.offer_summary?.trim();
  if (offerSummary) next.offer_summary = offerSummary;

  const pricingStrategy = values.pricing_strategy?.trim();
  if (pricingStrategy) next.pricing_strategy = pricingStrategy;

  const differentiationLevel = values.differentiation_level?.trim();
  if (differentiationLevel) next.differentiation_level = differentiationLevel;

  const salesSystem = values.sales_system?.trim();
  if (salesSystem) next.sales_system = salesSystem;

  const pipelineConversionSummary = values.pipeline_conversion_summary?.trim();
  if (pipelineConversionSummary) next.pipeline_conversion_summary = pipelineConversionSummary;

  return next;
}

function parseEuroNumber(rawValue: string): number | null | undefined {
  const normalized = rawValue
    .replace(/^mes\s*\d+\s*:\s*/i, "")
    .replace(/€/gi, "")
    .replace(/\beur\b/gi, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .trim();

  if (!normalized || normalized.toLowerCase() === "sindato") return null;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function parseMonthlySalesHistory(value: string): (number | null)[] {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return [];

  return lines.map((line) => {
    if (line.toLowerCase().includes("sin dato")) return null;
    return parseEuroNumber(line) ?? null;
  });
}

function validateMonthlySalesHistory(value: string): string | null {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const [index, line] of lines.entries()) {
    if (line.toLowerCase().includes("sin dato")) continue;
    if (parseEuroNumber(line) === undefined) {
      return `La linea ${index + 1} del historico mensual no tiene un importe valido.`;
    }
  }

  return null;
}

function buildFinancialBlockPayload(
  originalData: Record<string, unknown>,
  values: Record<string, string>,
): Record<string, unknown> {
  const next = { ...originalData };

  const profitabilityLevel = values.profitability_level?.trim();
  if (profitabilityLevel) next.profitability_level = profitabilityLevel;

  const liquidityLevel = values.liquidity_level?.trim();
  if (liquidityLevel) next.liquidity_level = liquidityLevel;

  const grossMarginLevel = values.gross_margin_level?.trim();
  if (grossMarginLevel) next.gross_margin_level = grossMarginLevel;

  const kpiMaturity = values.kpi_maturity?.trim();
  if (kpiMaturity) next.kpi_maturity = kpiMaturity;

  if (typeof values.monthly_sales_history_eur === "string") {
    next.monthly_sales_history_eur = parseMonthlySalesHistory(values.monthly_sales_history_eur);
  }

  return next;
}

function buildInitialTeamRoleDrafts(rawValue: unknown): TeamRoleDraft[] {
  if (!rawValue || typeof rawValue !== "object") return [];
  const roles = (rawValue as { roles?: unknown }).roles;
  if (!Array.isArray(roles)) return [];

  return roles
    .map((role) => {
      if (!role || typeof role !== "object") return null;
      const item = role as Record<string, unknown>;
      const roleId = typeof item.role_id === "string" ? item.role_id.trim() : "";
      const roleName = typeof item.role_name === "string" ? item.role_name.trim() : "";
      if (!roleId) return null;

      return {
        owner_name: typeof item.owner_name === "string" ? item.owner_name : "",
        relationship_status_to_founder:
          typeof item.relationship_status_to_founder === "string"
            ? item.relationship_status_to_founder
            : "",
        reports_to_role_id:
          typeof item.reports_to_role_id === "string" ? item.reports_to_role_id : "",
        role_id: roleId,
        role_name: roleName,
      };
    })
    .filter((role): role is TeamRoleDraft => role !== null);
}

function validateTeamRoles(roles: TeamRoleDraft[]): string | null {
  for (const [index, role] of roles.entries()) {
    if (!role.role_name.trim()) {
      return `El rol ${index + 1} necesita un nombre antes de guardar.`;
    }
  }
  return null;
}

function buildTeamBlockPayload(
  originalData: Record<string, unknown>,
  values: Record<string, string>,
  roles: TeamRoleDraft[],
): Record<string, unknown> {
  const next = { ...originalData };

  next.team_and_roles = {
    roles: roles.map((role) => ({
      role_id: role.role_id,
      role_name: role.role_name.trim(),
      owner_name: role.owner_name.trim() || null,
      reports_to_role_id: role.reports_to_role_id.trim() || null,
      relationship_status_to_founder: role.relationship_status_to_founder.trim() || null,
    })),
  };

  const founderDependencyLevel = values.founder_dependency_level?.trim();
  if (founderDependencyLevel) next.founder_dependency_level = founderDependencyLevel;

  const founderDependencyDetail = values.founder_dependency_detail?.trim();
  if (founderDependencyDetail) next.founder_dependency_detail = founderDependencyDetail;

  const leadershipSummary = values.leadership_summary?.trim();
  if (leadershipSummary) next.leadership_summary = leadershipSummary;

  return next;
}

function buildInitialExecutionItems(rawValue: unknown): string[] {
  if (!Array.isArray(rawValue)) return [];
  return rawValue
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);
}

function buildInitialMicroGoalDrafts(rawValue: unknown): ExecutionMicroGoalDraft[] {
  if (!Array.isArray(rawValue)) return [];

  return rawValue
    .map((goal) => {
      if (!goal || typeof goal !== "object") return null;
      const item = goal as Record<string, unknown>;
      const title = typeof item.title === "string" ? item.title.trim() : "";
      const status = typeof item.status === "string" ? item.status.trim() : "pending";
      const dueDate = typeof item.due_date === "string" ? item.due_date.trim() : "";

      return {
        client_id: ulid(),
        due_date: dueDate,
        status: status || "pending",
        title,
      };
    })
    .filter((goal): goal is ExecutionMicroGoalDraft => goal !== null);
}

function buildExecutionBlockPayload(
  originalData: Record<string, unknown>,
  payload: {
    bottlenecks: string[];
    focusAreas: string[];
    microGoals: ExecutionMicroGoalDraft[];
  },
): Record<string, unknown> {
  const next = { ...originalData };

  next.top_bottlenecks = payload.bottlenecks
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  next.focus_areas = payload.focusAreas
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  next.active_micro_goals = payload.microGoals
    .map((goal) => ({
      due_date: goal.due_date.trim() || null,
      status: goal.status.trim(),
      title: goal.title.trim(),
    }))
    .filter((goal) => goal.title.length > 0);

  return next;
}

function validateExecutionList(label: string, items: string[]): string | null {
  for (const [index, item] of items.entries()) {
    if (!item.trim()) {
      return `${label} ${index + 1} esta vacio. Complétalo o borralo antes de guardar.`;
    }
  }

  return null;
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString().slice(0, 10) === value;
}

function validateMicroGoals(goals: ExecutionMicroGoalDraft[]): string | null {
  for (const [index, goal] of goals.entries()) {
    if (!goal.title.trim()) {
      return `El microobjetivo ${index + 1} necesita un titulo antes de guardar.`;
    }

    const dueDate = goal.due_date.trim();
    if (dueDate && !isIsoDate(dueDate)) {
      return `La fecha del microobjetivo ${index + 1} debe tener formato YYYY-MM-DD.`;
    }
  }

  return null;
}

function buildSectionPayload(
  sectionId: BusinessKernelSectionId,
  originalData: Record<string, unknown>,
  values: Record<string, string>,
  roles?: TeamRoleDraft[],
): Record<string, unknown> {
  switch (sectionId) {
    case "company_profile":
      return buildCompanyProfilePayload(originalData, values);
    case "commercial_block":
      return buildCommercialBlockPayload(originalData, values);
    case "financial_block":
      return buildFinancialBlockPayload(originalData, values);
    case "team_block":
      return buildTeamBlockPayload(originalData, values, roles ?? []);
    default:
      throw new Error("Esta seccion todavia no tiene serializador de guardado.");
  }
}

export default function BusinessMemoryStepScreen() {
  const insets = useSafeAreaInsets();
  const { isDesktop, isMobile } = useResponsiveLayout();
  const { stepId } = useLocalSearchParams<{ stepId: string }>();
  const { applySectionPatch, error, isLoading, refresh, steps, userId, version } =
    useBusinessMemoryDashboard();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const step = findStepById(steps, stepId ?? "");

  if (!isLoading && !error && !step) {
    return <Redirect href={"/(app)/business-memory" as Href} />;
  }

  const isWideWeb = Platform.OS === "web" && isDesktop;
  const ringSize = isWideWeb ? 250 : 220;

  if (isLoading) {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            titlePrefix="Memoria"
            titleAccent="de negocio"
            renderIcon={() => <CompassBadge size={28} />}
            showBack={isMobile}
          />

          <View style={styles.feedbackWrap}>
            <ThemedText style={styles.feedbackTitle}>Cargando bloque</ThemedText>
            <ThemedText style={styles.feedbackDescription}>
              Estamos trayendo el detalle de este bloque desde el backend.
            </ThemedText>
          </View>
        </View>
      </AppBackground>
    );
  }

  if (error || !step) {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            titlePrefix="Memoria"
            titleAccent="de negocio"
            renderIcon={() => <CompassBadge size={28} />}
            showBack={isMobile}
          />

          <View style={styles.feedbackWrap}>
            <ThemedText style={styles.feedbackTitle}>No pudimos cargar este bloque</ThemedText>
            <ThemedText style={styles.feedbackDescription}>
              {error ?? "Intentalo de nuevo en unos segundos."}
            </ThemedText>
            <Button label="Reintentar" onPress={refresh} style={styles.retryButton} />
          </View>
        </View>
      </AppBackground>
    );
  }

  const currentStep = step;
  const stepIndex = getStepIndex(steps, step.id);
  const totalSteps = steps.length;
  const activeDot = stepIndex + 1;
  const hasFields = currentStep.fields.length > 0;
  const fieldPresentation = Object.fromEntries(
    currentStep.fields.map((field) => [
      field.id,
      buildBusinessMemoryFieldPresentation(field.id, currentStep.data[field.id]),
    ]),
  );
  const initialValues = Object.fromEntries(
    currentStep.fields.map((field) => [
      field.id,
      getInitialFieldValue(
        field,
        currentStep.data[field.id],
        fieldPresentation[field.id]?.value ?? "",
      ),
    ]),
  );
  const initialRoleDrafts = buildInitialTeamRoleDrafts(currentStep.data.team_and_roles);
  const initialBottlenecks = buildInitialExecutionItems(currentStep.data.top_bottlenecks);
  const initialFocusAreas = buildInitialExecutionItems(currentStep.data.focus_areas);
  const initialMicroGoalDrafts = buildInitialMicroGoalDrafts(currentStep.data.active_micro_goals);

  async function handleSave(values: Record<string, string>): Promise<void> {
    if (!userId || !version) {
      setSaveError("No pudimos identificar la version actual de la memoria.");
      setSaveSuccess(null);
      return;
    }

    if (
      currentStep.id !== "company_profile" &&
      currentStep.id !== "commercial_block" &&
      currentStep.id !== "financial_block" &&
      currentStep.id !== "team_block"
    ) {
      setSaveError(
        "Por ahora el guardado solo esta habilitado para Ficha Corporativa, Comercial, Financiera y Equipo.",
      );
      setSaveSuccess(null);
      return;
    }

    if (currentStep.id === "financial_block") {
      const historyError = validateMonthlySalesHistory(values.monthly_sales_history_eur ?? "");
      if (historyError) {
        setSaveError(historyError);
        setSaveSuccess(null);
        return;
      }
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const response = await patchBusinessKernelSection(
        userId,
        currentStep.id as BusinessKernelSectionId,
        {
          expected_version: version,
          data: buildSectionPayload(
            currentStep.id as BusinessKernelSectionId,
            currentStep.data,
            values,
          ),
        },
      );
      applySectionPatch(response);
      setSaveSuccess("Cambios guardados correctamente.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSaveError(
          "La memoria ha cambiado en otro sitio. Recarga el bloque y vuelve a intentarlo.",
        );
      } else {
        setSaveError(toErrorMessage(err));
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTeamBlockSave(payload: {
    roles: TeamRoleDraft[];
    values: Record<string, string>;
  }): Promise<void> {
    if (!userId || !version) {
      setSaveError("No pudimos identificar la version actual de la memoria.");
      setSaveSuccess(null);
      return;
    }

    if (currentStep.id !== "team_block") {
      setSaveError("Este bloque no corresponde a la edicion del equipo.");
      setSaveSuccess(null);
      return;
    }

    const rolesError = validateTeamRoles(payload.roles);
    if (rolesError) {
      setSaveError(rolesError);
      setSaveSuccess(null);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const response = await patchBusinessKernelSection(userId, currentStep.id, {
        expected_version: version,
        data: buildSectionPayload(currentStep.id, currentStep.data, payload.values, payload.roles),
      });
      applySectionPatch(response);
      setSaveSuccess("Equipo actualizado correctamente.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSaveError(
          "La memoria ha cambiado en otro sitio. Recarga el bloque y vuelve a intentarlo.",
        );
      } else {
        setSaveError(toErrorMessage(err));
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleExecutionBlockSave(payload: {
    bottlenecks: string[];
    focusAreas: string[];
    microGoals: ExecutionMicroGoalDraft[];
  }): Promise<void> {
    if (!userId || !version) {
      setSaveError("No pudimos identificar la version actual de la memoria.");
      setSaveSuccess(null);
      return;
    }

    if (currentStep.id !== "execution_block") {
      setSaveError("Este bloque no corresponde a la edicion de ejecucion.");
      setSaveSuccess(null);
      return;
    }

    const bottlenecksError = validateExecutionList("El cuello de botella", payload.bottlenecks);
    if (bottlenecksError) {
      setSaveError(bottlenecksError);
      setSaveSuccess(null);
      return;
    }

    const focusAreasError = validateExecutionList("El area de foco", payload.focusAreas);
    if (focusAreasError) {
      setSaveError(focusAreasError);
      setSaveSuccess(null);
      return;
    }

    const microGoalsError = validateMicroGoals(payload.microGoals);
    if (microGoalsError) {
      setSaveError(microGoalsError);
      setSaveSuccess(null);
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const response = await patchBusinessKernelSection(userId, currentStep.id, {
        expected_version: version,
        data: buildExecutionBlockPayload(currentStep.data, payload),
      });
      applySectionPatch(response);
      setSaveSuccess("Bloque de ejecucion actualizado correctamente.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSaveError(
          "La memoria ha cambiado en otro sitio. Recarga el bloque y vuelve a intentarlo.",
        );
      } else {
        setSaveError(toErrorMessage(err));
      }
    } finally {
      setIsSaving(false);
    }
  }

  function renderFormBlock() {
    return (
      <>
        {hasFields ? (
          <View style={styles.formSectionHeader}>
            <View style={styles.formAccent} />
            <ThemedText style={styles.formEyebrow}>COMPLETA EL BLOQUE</ThemedText>
          </View>
        ) : null}

        {hasFields && currentStep.id === "team_block" ? (
          <TeamBlockForm
            key={`${currentStep.id}:${version ?? "draft"}`}
            fields={currentStep.fields}
            fieldPresentation={fieldPresentation}
            initialRoleDrafts={initialRoleDrafts}
            initialValues={initialValues}
            onSave={handleTeamBlockSave}
            saveDisabled={isSaving}
            saveLabel={isSaving ? "Guardando..." : "Guardar equipo"}
          />
        ) : null}

        {hasFields && currentStep.id === "execution_block" ? (
          <ExecutionBlockForm
            key={`${currentStep.id}:${version ?? "draft"}`}
            initialBottlenecks={initialBottlenecks}
            initialFocusAreas={initialFocusAreas}
            initialMicroGoals={initialMicroGoalDrafts}
            onSave={handleExecutionBlockSave}
            saveDisabled={isSaving}
            saveLabel={isSaving ? "Guardando..." : "Guardar ejecucion"}
          />
        ) : null}

        {hasFields && currentStep.id !== "team_block" && currentStep.id !== "execution_block" ? (
          <MemoryForm
            key={`${currentStep.id}:${version ?? "draft"}`}
            fields={currentStep.fields}
            fieldPresentation={fieldPresentation}
            initialValues={initialValues}
            onSave={handleSave}
            saveLabel={isSaving ? "Guardando..." : "Guardar memoria"}
            saveDisabled={isSaving}
          />
        ) : null}

        {!hasFields ? <MemoryEmptyState /> : null}

        {saveError ? <ThemedText style={styles.saveError}>{saveError}</ThemedText> : null}
        {saveSuccess ? <ThemedText style={styles.saveSuccess}>{saveSuccess}</ThemedText> : null}
      </>
    );
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          titlePrefix="Memoria"
          titleAccent="de negocio"
          icon="briefcase"
          showBack={isMobile}
        />

        <KeyboardAwareScroll
          contentContainerStyle={[
            styles.content,
            isWideWeb && styles.contentDesktop,
            { paddingBottom: insets.bottom + Spacing.six },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bottomOffset={24}
        >
          {isWideWeb ? (
            <View style={styles.desktopGrid}>
              <View style={styles.desktopHeroColumn}>
                <StepDots total={totalSteps} active={activeDot} hint="Bloque · Memoria" />

                <View style={[styles.hero, styles.heroDesktop]}>
                  <StepHeroRing
                    step={currentStep}
                    index={stepIndex}
                    total={totalSteps}
                    size={ringSize}
                    animate={false}
                  />
                  <ThemedText style={styles.stepTitle}>{currentStep.title}</ThemedText>
                  <ThemedText style={styles.stepDescription}>{currentStep.description}</ThemedText>
                </View>
              </View>

              <View style={styles.desktopFormColumn}>
                <View style={[styles.formWrapper, styles.formWrapperDesktop]}>
                  {renderFormBlock()}
                </View>
              </View>
            </View>
          ) : (
            <>
              <StepDots total={totalSteps} active={activeDot} hint="Bloque · Memoria" />

              <View style={styles.hero}>
                <StepHeroRing
                  step={currentStep}
                  index={stepIndex}
                  total={totalSteps}
                  size={ringSize}
                  animate={false}
                />
                <ThemedText style={styles.stepTitle}>{currentStep.title}</ThemedText>
                <ThemedText style={styles.stepDescription}>{currentStep.description}</ThemedText>
              </View>

              <View style={styles.formWrapper}>{renderFormBlock()}</View>
            </>
          )}
        </KeyboardAwareScroll>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: Spacing.two,
    gap: Spacing.four,
  },
  contentDesktop: {
    paddingHorizontal: Spacing.three,
  },
  desktopGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.five,
  },
  desktopHeroColumn: {
    width: 340,
    gap: Spacing.three,
    paddingTop: Spacing.one,
  },
  desktopFormColumn: {
    flex: 1,
    minWidth: 0,
  },
  hero: {
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.one,
  },
  heroDesktop: {
    paddingHorizontal: Spacing.one,
  },
  stepTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
    textAlign: "center",
    marginTop: Spacing.two,
  },
  stepDescription: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    maxWidth: 340,
  },
  formWrapper: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  formWrapperDesktop: {
    paddingHorizontal: 0,
    paddingTop: Spacing.one,
  },
  formSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  formAccent: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: SemanticColors.success,
  },
  formEyebrow: {
    fontFamily: Fonts.montserratSemiBold,
    fontSize: 10,
    lineHeight: 14,
    color: SemanticColors.textMuted,
    letterSpacing: 2.4,
  },
  feedbackWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  feedbackTitle: {
    fontFamily: Fonts.montserratBold,
    fontSize: 22,
    lineHeight: 26,
    color: SemanticColors.textPrimary,
    textAlign: "center",
  },
  feedbackDescription: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 13,
    lineHeight: 19,
    color: SemanticColors.textSecondaryLight,
    textAlign: "center",
    maxWidth: 320,
  },
  retryButton: {
    marginTop: Spacing.two,
  },
  saveError: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 17,
    color: SemanticColors.error,
    textAlign: "center",
  },
  saveSuccess: {
    fontFamily: Fonts.montserratMedium,
    fontSize: 12,
    lineHeight: 17,
    color: SemanticColors.success,
    textAlign: "center",
  },
});
