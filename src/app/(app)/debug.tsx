import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";

import Constants from "expo-constants";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
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
  const params = useLocalSearchParams<{ source?: string }>();
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
  const [isApplyingCeoArchetype, setIsApplyingCeoArchetype] = useState(false);
  const [isClearingLocalData, setIsClearingLocalData] = useState(false);
  const [isLoadingDefaultProfile, setIsLoadingDefaultProfile] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isResettingOnboarding, setIsResettingOnboarding] = useState(false);
  const [profilesError, setProfilesError] = useState<string | null>(null);
  const [availableProfiles, setAvailableProfiles] = useState<DebugDefaultProfileSummary[]>([]);
  const openedFromOnboarding = params.source === "onboarding";

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
      "Reiniciar onboarding",
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
      Alert.alert("Sesión no disponible", "No se ha encontrado el usuario autenticado.");
      return;
    }

    if (!selectedProfile) {
      Alert.alert(
        "Perfil no disponible",
        "Selecciona un perfil por defecto válido antes de cargarlo.",
      );
      return;
    }

    setIsLoadingDefaultProfile(true);
    try {
      await debugApiService.loadDefaultProfile(selectedProfile.profile_id);
      await fetchLatestPlan(user.userId);

      if (openedFromOnboarding) {
        router.replace("/(app)/(tabs)/alter");
        return;
      }

      Alert.alert("Perfil cargado", `Se ha cargado "${selectedProfile.title}" para el usuario actual.`);
    } catch (err) {
      Alert.alert("No se pudo cargar el perfil", toErrorMessage(err));
    } finally {
      setIsLoadingDefaultProfile(false);
    }
  }

  async function handleApplyCeoArchetype(): Promise<void> {
    if (!user?.userId) {
      Alert.alert("Sesión no disponible", "No se ha encontrado el usuario autenticado.");
      return;
    }

    setIsApplyingCeoArchetype(true);
    try {
      await debugApiService.overrideCeoArchetype(selectedCeoArchetypeId);
      Alert.alert(
        "Arquetipo CEO aplicado",
        `Se ha aplicado "${selectedArchetype?.label ?? "sin seleccionar"}" al usuario actual.`,
      );
    } catch (err) {
      Alert.alert("No se pudo aplicar el arquetipo CEO", toErrorMessage(err));
    } finally {
      setIsApplyingCeoArchetype(false);
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
              description="Resumen de la configuración activa del cliente."
            >
              <InfoRow label="App" value={Constants.expoConfig?.name ?? "Alter CEO"} />
              <InfoRow label="Versión" value={Constants.expoConfig?.version ?? "n/a"} />
              <InfoRow label="Modo desarrollo" value={__DEV__ ? "Sí" : "No"} />
              <InfoRow label="Base de la API" value={API_BASE_URL} />
              <InfoRow label="Versión de la API" value={API_VERSION} />
            </SectionCard>

            <SectionCard
              title="Sesion"
              description="Estado actual de autenticación del usuario cargado en la app."
            >
              <InfoRow label="Autenticado" value={isAuthenticated ? "Sí" : "No"} />
              <InfoRow label="User ID" value={user?.userId ?? "n/a"} />
              <InfoRow label="Email" value={user?.email ?? "n/a"} />
              <InfoRow label="Nombre" value={user?.displayName ?? "n/a"} />
              <InfoRow label="Roles" value={user?.roles.join(", ") || "Sin roles"} />
            </SectionCard>

            <SectionCard
              title="Onboarding"
              description="Reinicia rápidamente el progreso local del onboarding en este dispositivo."
            >
              <Button
                label={isResettingOnboarding ? "Reiniciando..." : "Reiniciar onboarding"}
                onPress={() => void handleResetOnboarding()}
                disabled={isResettingOnboarding}
                style={styles.actionButton}
              />
            </SectionCard>

            <SectionCard
              title="Almacenamiento local"
              description="Borra el estado persistido del dispositivo y te devuelve al login."
            >
              <Button
                label={isClearingLocalData ? "Borrando..." : "Borrar almacenamiento local"}
                onPress={() => void handleClearLocalData()}
                disabled={isClearingLocalData}
                style={styles.actionButton}
              />
            </SectionCard>

            <SectionCard
              title="Arquetipo CEO"
              description="Aplica manualmente un arquetipo CEO al usuario actual."
            >
              <Pressable
                style={styles.selectTrigger}
                onPress={() => setIsArchetypePickerOpen((current) => !current)}
              >
                <View style={styles.selectContent}>
                  <ThemedText type="labelSm" style={styles.selectLabel}>
                    {selectedArchetype?.label ?? "Selecciona un arquetipo CEO"}
                  </ThemedText>
                  <ThemedText type="bodySm" style={styles.selectHint}>
                    Arquetipo detectado por el backend
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
                label={isApplyingCeoArchetype ? "Aplicando..." : "Aplicar arquetipo CEO"}
                onPress={() => void handleApplyCeoArchetype()}
                disabled={isApplyingCeoArchetype}
                style={styles.actionButton}
              />
              <ThemedText type="bodySm" style={styles.footnote}>
                Solo modifica el arquetipo CEO del usuario actual.
              </ThemedText>
            </SectionCard>

            <SectionCard
              title="Perfiles por defecto"
              description="Carga un business kernel y un plan de prueba para el usuario actual."
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
                  No se pudo actualizar la lista desde el backend: {profilesError}
                </ThemedText>
              ) : null}

              {!isLoadingProfiles && !profilesError && availableProfiles.length === 0 ? (
                <ThemedText type="bodySm" style={styles.footnote}>
                  No hay perfiles por defecto disponibles en el backend.
                </ThemedText>
              ) : null}

              <Button
                label={isLoadingDefaultProfile ? "Cargando..." : "Cargar perfil por defecto"}
                onPress={() => void handleLoadDefaultProfile()}
                disabled={
                  isLoadingDefaultProfile || isLoadingProfiles || availableProfiles.length === 0
                }
                style={styles.actionButton}
              />
              <ThemedText type="bodySm" style={styles.footnote}>
                Solo carga el business kernel y el plan desde el backend.
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
