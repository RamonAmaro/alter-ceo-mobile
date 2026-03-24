import { create } from "zustand";

interface ActiveRecordingState {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

export const useActiveRecordingStore = create<ActiveRecordingState>((set) => ({
  activeId: null,
  setActiveId: (id) => set({ activeId: id }),
}));
