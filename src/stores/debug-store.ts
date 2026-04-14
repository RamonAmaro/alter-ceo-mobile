import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

export const DEBUG_STORAGE_KEY = "alterceo_debug_state";

export const CEO_ARCHETYPE_OPTIONS = [
  {
    id: "incompetencia_inconsciente",
    label: "Incompetente inconsciente",
  },
  {
    id: "incompetencia_consciente",
    label: "Incompetente consciente",
  },
  {
    id: "competencia_inconsciente",
    label: "Competente inconsciente",
  },
  {
    id: "competencia_consciente",
    label: "Competente consciente",
  },
] as const;

export type DebugProfileId = string;
export type CeoArchetypeId = (typeof CEO_ARCHETYPE_OPTIONS)[number]["id"];

interface PersistedDebugState {
  isUnlocked: boolean;
  selectedProfileId: DebugProfileId;
  selectedCeoArchetypeId: CeoArchetypeId;
}

interface DebugState extends PersistedDebugState {
  isHydrated: boolean;
  load: () => Promise<void>;
  unlock: () => Promise<void>;
  lock: () => Promise<void>;
  setSelectedProfileId: (profileId: DebugProfileId) => Promise<void>;
  setSelectedCeoArchetypeId: (archetypeId: CeoArchetypeId) => Promise<void>;
}

const DEFAULT_STATE: PersistedDebugState = {
  isUnlocked: false,
  selectedProfileId: "",
  selectedCeoArchetypeId: CEO_ARCHETYPE_OPTIONS[0].id,
};

function normalizeProfileId(profileId?: string): DebugProfileId {
  const value = (profileId ?? "").trim().toLowerCase().replace(/-/g, "_");
  return value;
}

function normalizeCeoArchetypeId(archetypeId?: string): CeoArchetypeId {
  const value = (archetypeId ?? "").trim().toLowerCase().replace(/-/g, "_");
  const legacyMap: Record<string, CeoArchetypeId> = {
    incompetente_inconsciente: "incompetencia_inconsciente",
    incompetente_consciente: "incompetencia_consciente",
    competente_inconsciente: "competencia_inconsciente",
    competente_consciente: "competencia_consciente",
  };
  const normalized = legacyMap[value] ?? value;
  const matched = CEO_ARCHETYPE_OPTIONS.find((option) => option.id === normalized);
  return matched?.id ?? DEFAULT_STATE.selectedCeoArchetypeId;
}

async function persistDebugState(state: PersistedDebugState): Promise<void> {
  await AsyncStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(state));
}

export const useDebugStore = create<DebugState>((set, get) => ({
  ...DEFAULT_STATE,
  isHydrated: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(DEBUG_STORAGE_KEY);
      if (!raw) {
        set({ ...DEFAULT_STATE, isHydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PersistedDebugState>;
      set({
        isUnlocked: parsed.isUnlocked ?? DEFAULT_STATE.isUnlocked,
        selectedProfileId: normalizeProfileId(parsed.selectedProfileId),
        selectedCeoArchetypeId: normalizeCeoArchetypeId(parsed.selectedCeoArchetypeId),
        isHydrated: true,
      });
    } catch {
      set({ ...DEFAULT_STATE, isHydrated: true });
    }
  },

  unlock: async () => {
    const nextState = { ...get(), isUnlocked: true };
    set({ isUnlocked: true });
    await persistDebugState({
      isUnlocked: true,
      selectedProfileId: nextState.selectedProfileId,
      selectedCeoArchetypeId: nextState.selectedCeoArchetypeId,
    });
  },

  lock: async () => {
    set({ ...DEFAULT_STATE });
    await persistDebugState(DEFAULT_STATE);
  },

  setSelectedProfileId: async (profileId: DebugProfileId) => {
    set({ selectedProfileId: profileId });
    await persistDebugState({
      isUnlocked: get().isUnlocked,
      selectedProfileId: profileId,
      selectedCeoArchetypeId: get().selectedCeoArchetypeId,
    });
  },

  setSelectedCeoArchetypeId: async (archetypeId: CeoArchetypeId) => {
    set({ selectedCeoArchetypeId: archetypeId });
    await persistDebugState({
      isUnlocked: get().isUnlocked,
      selectedProfileId: get().selectedProfileId,
      selectedCeoArchetypeId: archetypeId,
    });
  },
}));
