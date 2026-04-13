import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";

import Constants from "expo-constants";
import { Redirect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppBackground } from "@/components/app-background";
import { Button } from "@/components/button";
import { ResponsiveContainer } from "@/components/responsive-container";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { API_BASE_URL, API_VERSION } from "@/constants/env";
import { Fonts, SemanticColors, Spacing } from "@/constants/theme";
import * as debugApiService from "@/services/debug-api-service";
import { clearLocalAppData } from "@/services/debug-service";
import {
  CEO_ARCHETYPE_OPTIONS,
  useDebugStore,
  type CeoArchetypeId,
  type DebugProfileId,
} from "@/stores/debug-store";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { usePlanStore } from "@/stores/plan-store";
import type { DebugDefaultProfileSummary } from "@/types/debug";
import { toErrorMessage } from "@/utils/to-error-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface InfoRowProps {
  label: string;
  value: string;
}

interface SectionCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="bodySm" style={styles.infoLabel}>
        {label}
      </ThemedText>
      <ThemedText type="bodySm" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function SectionCard({ title, description, children, style }: SectionCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <ThemedText type="labelMd" style={styles.cardTitle}>
          {title}
        </ThemedText>
        <ThemedText type="bodySm" style={styles.cardDescription}>
          {description}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

export default function DebugScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    isUnlocked,
    isHydrated,
    selectedCeoArchetypeId,
    selectedProfileId,
    setSelectedCeoArchetypeId,
    setSelectedProfileId,
  } = useDebugStore();
  const { isAuthenticated, user } = useAuthStore();
  const onboarding = useOnboardingStore();
  const fetchLatestPlan = usePlanStore((s) => s.fetchLatestPlan);

  const [isProfilePickerOpen, setIsProfilePickerOpen] = useState(false);
  const [isArchetypePickerOpen, setIsArchetypePickerOpen] = useState(false);
  const [isClearingLocalData, setIsClearingLocalData] = useState(false);
  const [isLoadingDefaultProfile, setIsLoadingDefaultProfile] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<DebugDefaultProfileSummary[]>([]);

  const selectedProfile = useMemo(
    () => availableProfiles.find((profile) => profile.profile_id === selectedProfileId),
    [availableProfiles, selectedProfileId],
  );
  const selectedArchetype = useMemo(
    () => CEO_ARCHETYPE_OPTIONS.find((archetype) => archetype.id === selectedCeoArchetypeId),
    [selectedCeoArchetypeId],
  );

  useEffect(() => {
    async function loadProfiles(): Promise<void> {
      setIsLoadingProfiles(true);
      setProfilesError(null);

      try {
        const response = await debugApiService.listDefaultProfiles();
        setAvailableProfiles(response.profiles);

        if (response.profiles.length > 0) {
          const hasSelectedProfile = response.profiles.some(
            (profile) => profile.profile_id === selectedProfileId,
          );
          if (!hasSelectedProfile) {
            await setSelectedProfileId(response.profiles[0].profile_id);
          }
        }
      } catch (err) {
        setProfilesError(toErrorMessage(err));
      } finally {
        setIsLoadingProfiles(false);
      }
    }

    void loadProfiles();
  }, [selectedProfileId, setSelectedProfileId]);

  if (!isHydrated) {
    return null;
  }

  if (!__DEV__ && !isUnlocked) {
    return <Redirect href="/(app)/settings" />;
  }

  async function handleResetOnboarding(): Promise<void> {
    Alert.alert(
      "Reset onboarding",
      "Esto borrará el progreso local del onboarding en este dispositivo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetear",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsResettingOnboarding(true);
              await onboarding.reset();
              setIsResettingOnboarding(false);
            })();
          },
        },
      ],
    );
  }

  async function handleClearLocalData(): Promise<void> {
    Alert.alert(
      "Borrar almacenamiento local",
      "Se borrarán sesión, biometría, onboarding, grabaciones locales y el unlock del modo debug.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsClearingLocalData(true);
              await clearLocalAppData();
              setIsClearingLocalData(false);
              router.replace("/(auth)/login");
            })();
          },
        },
      ],
    );
  }

  async function handleLoadDefaultProfile(): Promise<void> {
    if (!user?.userId) {
      Alert.alert("Sesion no disponible", "No se ha encontrado el usuario autenticado.");
      return;
    }

    if (!selectedProfile) {
      Alert.alert("Perfil no disponible", "Selecciona un default profile valido antes de cargar.");
      return;
    }

    setIsLoadingDefaultProfile(true);
    try {
      await debugApiService.overrideCeoArchetype(selectedCeoArchetypeId);
      await debugApiService.loadDefaultProfile(selectedProfile.profile_id);
      await fetchLatestPlan(user.userId);

      Alert.alert(
        "Perfil cargado",
        `Se ha cargado "${selectedProfile.title}" con el arquetipo "${selectedArchetype?.label ?? "sin seleccionar"}".`,
      );
    } catch (err) {
      Alert.alert("No se pudo cargar el perfil", toErrorMessage(err));
    } finally {
      setIsLoadingDefaultProfile(false);
    }
  }

  function handleSelectProfile(profileId: DebugProfileId): void {
    void setSelectedProfileId(profileId);
    setIsProfilePickerOpen(false);
  }

  function handleSelectArchetype(archetypeId: CeoArchetypeId): void {
    void setSelectedCeoArchetypeId(archetypeId);
    setIsArchetypePickerOpen(false);
  }

  return (
    <AppBackground>
      <ResponsiveContainer maxWidth={720}>
        <View style={styles.container}>
          <ScreenHeader
            topInset={insets.top}
            icon="bug-outline"
            titlePrefix="Modo"
            titleAccent="Debug"
            onBack={() => router.back()}
            showBack
          />

          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            <SectionCard
              title="Entorno"
              description="Resumen del build y la configuracion activa del cliente."
            >
              <InfoRow label="App" value={Constants.expoConfig?.name ?? "Alter CEO"} />
              <InfoRow label="Version" value={Constants.expoConfig?.version ?? "n/a"} />
              <InfoRow label="Dev mode" value={__DEV__ ? "Si" : "No"} />
              <InfoRow label="API base" value={API_BASE_URL} />
              <InfoRow label="API version" value={API_VERSION} />
            </SectionCard>

            <SectionCard
              title="Sesion"
              description="Estado actual de autenticacion del usuario cargado en la app."
            >
              <InfoRow label="Autenticado" value={isAuthenticated ? "Si" : "No"} />
              <InfoRow label="User ID" value={user?.userId ?? "n/a"} />
              <InfoRow label="Email" value={user?.email ?? "n/a"} />
              <InfoRow label="Nombre" value={user?.displayName ?? "n/a"} />
              <InfoRow label="Roles" value={user?.roles.join(", ") || "Sin roles"} />
            </SectionCard>

            <SectionCard
              title="Onboarding"
              description="Resetea rapido el progreso local del onboarding en este dispositivo."
            >
              <Button
                label={isResettingOnboarding ? "Reseteando..." : "Reset onboarding"}
                onPress={() => void handleResetOnboarding()}
                disabled={isResettingOnboarding}
                style={styles.actionButton}
              />
            </SectionCard>

            <SectionCard
              title="Storage local"
              description="Borra el estado persistido del dispositivo y te devuelve al login."
            >
              <Button
                label={isClearingLocalData ? "Borrando..." : "Clear local storage"}
                onPress={() => void handleClearLocalData()}
                disabled={isClearingLocalData}
                style={styles.actionButton}
              />
            </SectionCard>

            <SectionCard
              title="Default profiles"
              description="Selector preparado para cargar business kernel, plan y CEO archetype de prueba cuando el backend lo soporte."
            >
              <Pressable
                style={styles.selectTrigger}
                onPress={() => setIsProfilePickerOpen((current) => !current)}
              >
                <View style={styles.selectContent}>
                  <ThemedText type="labelSm" style={styles.selectLabel}>
                    {selectedProfile?.title ?? "Selecciona un perfil"}
                  </ThemedText>
                  <ThemedText type="bodySm" style={styles.selectHint}>
                    {selectedProfile?.description ?? "Sin perfil seleccionado"}
                  </ThemedText>
                </View>
                <Ionicons
                  name={isProfilePickerOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={SemanticColors.textMuted}
                />
              </Pressable>

              {isProfilePickerOpen ? (
                <View style={styles.dropdown}>
                  {availableProfiles.map((profile) => {
                    const selected = profile.profile_id === selectedProfileId;
                    return (
                      <Pressable
                        key={profile.profile_id}
                        style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                        onPress={() => handleSelectProfile(profile.profile_id)}
                      >
                        <ThemedText type="labelSm" style={styles.dropdownTitle}>
                          {profile.title}
                        </ThemedText>
                        {profile.description ? (
                          <ThemedText type="bodySm" style={styles.dropdownDescription}>
                            {profile.description}
                          </ThemedText>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              {isLoadingProfiles ? (
                <ThemedText type="bodySm" style={styles.footnote}>
                  Cargando perfiles disponibles...
                </ThemedText>
              ) : null}

              {profilesError ? (
                <ThemedText type="bodySm" style={styles.footnote}>
                  No se pudo refrescar la lista desde backend: {profilesError}
                </ThemedText>
              ) : null}

              {!isLoadingProfiles && !profilesError && availableProfiles.length === 0 ? (
                <ThemedText type="bodySm" style={styles.footnote}>
                  No hay default profiles disponibles en backend.
                </ThemedText>
              ) : null}

              <Pressable
                style={styles.selectTrigger}
                onPress={() => setIsArchetypePickerOpen((current) => !current)}
              >
                <View style={styles.selectContent}>
                  <ThemedText type="labelSm" style={styles.selectLabel}>
                    {selectedArchetype?.label ?? "Selecciona un CEO Archetype"}
                  </ThemedText>
                  <ThemedText type="bodySm" style={styles.selectHint}>
                    CEO Archetype detectado por backend
                  </ThemedText>
                </View>
                <Ionicons
                  name={isArchetypePickerOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={SemanticColors.textMuted}
                />
              </Pressable>

              {isArchetypePickerOpen ? (
                <View style={styles.dropdown}>
                  {CEO_ARCHETYPE_OPTIONS.map((archetype) => {
                    const selected = archetype.id === selectedCeoArchetypeId;
                    return (
                      <Pressable
                        key={archetype.id}
                        style={[styles.dropdownItem, selected && styles.dropdownItemSelected]}
                        onPress={() => handleSelectArchetype(archetype.id)}
                      >
                        <ThemedText type="labelSm" style={styles.dropdownTitle}>
                          {archetype.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <Button
                label={isLoadingDefaultProfile ? "Loading..." : "Load default profile"}
                onPress={() => void handleLoadDefaultProfile()}
                disabled={
                  isLoadingDefaultProfile || isLoadingProfiles || availableProfiles.length === 0
                }
                style={styles.actionButton}
              />
              <ThemedText type="bodySm" style={styles.footnote}>
                Carga el plan por defecto y fija el CEO Archetype para el usuario actual.
              </ThemedText>
            </SectionCard>
          </ScrollView>
        </View>
      </ResponsiveContainer>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    backgroundColor: "rgba(8,12,18,0.74)",
    borderWidth: 1,
    borderColor: SemanticColors.borderLight,
    borderRadius: 18,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  cardHeader: {
    gap: Spacing.one,
  },
  cardTitle: {
    color: SemanticColors.textPrimary,
  },
  cardDescription: {
    color: SemanticColors.textMuted,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    paddingVertical: Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  infoLabel: {
    flex: 1,
    color: SemanticColors.textMuted,
  },
  infoValue: {
    flex: 1,
    color: SemanticColors.textPrimary,
    fontFamily: Fonts.montserratSemiBold,
    textAlign: "right",
  },
  actionButton: {
    width: "100%",
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: SemanticColors.border,
  },
  selectContent: {
    flex: 1,
    gap: Spacing.one,
  },
  selectLabel: {
    color: SemanticColors.textPrimary,
  },
  selectHint: {
    color: SemanticColors.textMuted,
  },
  dropdown: {
    gap: Spacing.two,
  },
  dropdownItem: {
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "transparent",
    gap: Spacing.one,
  },
  dropdownItemSelected: {
    borderColor: SemanticColors.success,
    backgroundColor: "rgba(0,255,132,0.08)",
  },
  dropdownTitle: {
    color: SemanticColors.textPrimary,
  },
  dropdownDescription: {
    color: SemanticColors.textMuted,
  },
  footnote: {
    color: SemanticColors.warning,
  },
});
