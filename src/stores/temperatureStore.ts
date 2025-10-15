import { create } from 'zustand';
import type { TemperatureData, TemperatureState } from '../types';

interface TemperatureStore extends TemperatureState {
  addDataPoint: (peltier: number, lid: number) => void;
  setIsParsing: (parsing: boolean) => void;
  clearData: () => void;
}

const initialState: TemperatureState = {
  data: [],
  isParsing: false,
};

export const useTemperatureStore = create<TemperatureStore>((set) => ({
  ...initialState,

  addDataPoint: (peltier, lid) =>
    set((state) => {
      const newPoint: TemperatureData = {
        time: state.data.length,
        peltier,
        lid,
      };
      return {
        data: [...state.data, newPoint],
      };
    }),

  setIsParsing: (parsing) => set({ isParsing: parsing }),

  clearData: () => set({ data: [] }),
}));
