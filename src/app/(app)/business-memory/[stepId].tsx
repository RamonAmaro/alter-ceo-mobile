import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { CompassBadge } from "@/components/business-memory/compass-badge";
import { MemoryEmptyState } from "@/components/business-memory/memory-empty-state";
import { MemoryForm } from "@/components/business-memory/memory-form";
import { StepDots } from "@/components/business-memory/step-dots";
import { StepHeroRing } from "@/components/business-memory/step-hero-ring";
import { KeyboardAwareScroll } from "@/components/keyboard-aware-scroll";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import type { FormFieldConfig } from "@/constants/business-memory-steps";
import { findStepById, getStepIndex } from "@/constants/business-memory-steps";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import { useBusinessMemoryDashboard } from "@/hooks/use-business-memory-dashboard";
import { patchBusinessKernelSection } from "@/services/business-kernel-service";
import { ApiError } from "@/types/api";
import type { BusinessKernelSectionId } from "@/types/business-kernel";
import { buildBusinessMemoryFieldPresentation } from "@/utils/business-memory-display";
import { toErrorMessage } from "@/utils/to-error-message";
import { Redirect, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
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

function parseMonthlySalesHistory(value: string): Array<number | null> {
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

function buildSectionPayload(
  sectionId: BusinessKernelSectionId,
  originalData: Record<string, unknown>,
  values: Record<string, string>,
): Record<string, unknown> {
  switch (sectionId) {
    case "company_profile":
      return buildCompanyProfilePayload(originalData, values);
    case "commercial_block":
      return buildCommercialBlockPayload(originalData, values);
    case "financial_block":
      return buildFinancialBlockPayload(originalData, values);
    default:
      throw new Error("Esta seccion todavia no tiene serializador de guardado.");
  }
}

export default function BusinessMemoryStepScreen() {
  const insets = useSafeAreaInsets();
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

  if (isLoading) {
    return (
      <AppBackground>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            titlePrefix="Memoria"
            titleAccent="de negocio"
            renderIcon={() => <CompassBadge size={28} />}
            showBack
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
            showBack
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
      getInitialFieldValue(field, currentStep.data[field.id], fieldPresentation[field.id]?.value ?? ""),
    ]),
  );

  async function handleSave(values: Record<string, string>): Promise<void> {
    if (!userId || !version) {
      setSaveError("No pudimos identificar la version actual de la memoria.");
      setSaveSuccess(null);
      return;
    }

    if (
      currentStep.id !== "company_profile" &&
      currentStep.id !== "commercial_block" &&
      currentStep.id !== "financial_block"
    ) {
      setSaveError("Por ahora el guardado solo esta habilitado para Ficha Corporativa, Comercial y Financiera.");
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
      const response = await patchBusinessKernelSection(userId, currentStep.id as BusinessKernelSectionId, {
        expected_version: version,
        data: buildSectionPayload(currentStep.id as BusinessKernelSectionId, currentStep.data, values),
      });
      applySectionPatch(response);
      setSaveSuccess("Cambios guardados correctamente.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setSaveError("La memoria ha cambiado en otro sitio. Recarga el bloque y vuelve a intentarlo.");
      } else {
        setSaveError(toErrorMessage(err));
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppBackground>
      <View style={styles.container}>
        <ScreenHeader
          topInset={insets.top}
          titlePrefix="Memoria"
          titleAccent="de negocio"
          renderIcon={() => <CompassBadge size={28} />}
          showBack
        />

        <KeyboardAwareScroll
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.six }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bottomOffset={24}
        >
          <StepDots total={totalSteps} active={activeDot} hint="Bloque · Memoria" />

          <View style={styles.hero}>
            <StepHeroRing
              step={step}
              index={stepIndex}
              total={totalSteps}
              size={220}
              animate={false}
            />
            <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
            <ThemedText style={styles.stepDescription}>{step.description}</ThemedText>
          </View>

          <View style={styles.formWrapper}>
            {hasFields ? (
              <View style={styles.formSectionHeader}>
                <View style={styles.formAccent} />
                <ThemedText style={styles.formEyebrow}>COMPLETA EL BLOQUE</ThemedText>
              </View>
            ) : null}

            {hasFields ? (
              <MemoryForm
                key={`${currentStep.id}:${version ?? "draft"}`}
                fields={currentStep.fields}
                fieldPresentation={fieldPresentation}
                initialValues={initialValues}
                onSave={handleSave}
                saveLabel={isSaving ? "Guardando..." : "Guardar memoria"}
                saveDisabled={isSaving}
              />
            ) : (
              <MemoryEmptyState />
            )}

            {saveError ? <ThemedText style={styles.saveError}>{saveError}</ThemedText> : null}
            {saveSuccess ? <ThemedText style={styles.saveSuccess}>{saveSuccess}</ThemedText> : null}
          </View>
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
  hero: {
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.one,
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
