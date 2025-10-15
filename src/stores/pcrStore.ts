import { create } from 'zustand';
import type { PCRFormData, PCRProtocol } from '../types';

interface PCRStore {
  formData: PCRFormData;
  selectedDrive: string;
  availableDrives: string[];
  updateField: (field: keyof PCRFormData, value: string) => void;
  setSelectedDrive: (drive: string) => void;
  setAvailableDrives: (drives: string[]) => void;
  getProtocol: () => PCRProtocol;
  reset: () => void;
}

const initialFormData: PCRFormData = {
  protocolName: '',
  introTemp: '',
  introCycles: '',
  introSec: '',
  denatureTemp: '',
  denatureCycles: '',
  denatureSec: '',
  annealTemp: '',
  annealCycles: '',
  annealSec: '',
  extensionTemp: '',
  extensionCycles: '',
  extensionSec: '',
  finalTemp: '',
  finalCycles: '',
  finalSec: '',
};

export const usePCRStore = create<PCRStore>((set, get) => ({
  formData: initialFormData,
  selectedDrive: '',
  availableDrives: [],

  updateField: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),

  setSelectedDrive: (drive) => set({ selectedDrive: drive }),

  setAvailableDrives: (drives) => set({ availableDrives: drives }),

  getProtocol: () => {
    const data = get().formData;
    return {
      protocolName: data.protocolName,
      introDenaturing: {
        name: 'Intro Denaturing',
        temperature: parseFloat(data.introTemp) || 0,
        cycles: parseInt(data.introCycles) || 0,
        seconds: parseInt(data.introSec) || 0,
      },
      denaturing: {
        name: 'Denaturing',
        temperature: parseFloat(data.denatureTemp) || 0,
        cycles: parseInt(data.denatureCycles) || 0,
        seconds: parseInt(data.denatureSec) || 0,
      },
      annealing: {
        name: 'Annealing',
        temperature: parseFloat(data.annealTemp) || 0,
        cycles: parseInt(data.annealCycles) || 0,
        seconds: parseInt(data.annealSec) || 0,
      },
      extension: {
        name: 'Extension',
        temperature: parseFloat(data.extensionTemp) || 0,
        cycles: parseInt(data.extensionCycles) || 0,
        seconds: parseInt(data.extensionSec) || 0,
      },
      finalExtension: {
        name: 'Final Extension',
        temperature: parseFloat(data.finalTemp) || 0,
        cycles: parseInt(data.finalCycles) || 0,
        seconds: parseInt(data.finalSec) || 0,
      },
    };
  },

  reset: () => set({ formData: initialFormData }),
}));
