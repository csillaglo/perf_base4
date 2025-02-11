import { create } from 'zustand';

interface CycleStore {
  selectedCycleId: string;
  setSelectedCycleId: (id: string) => void;
}

export const useCycleStore = create<CycleStore>((set) => ({
  selectedCycleId: '',
  setSelectedCycleId: (id) => set({ selectedCycleId: id }),
}));