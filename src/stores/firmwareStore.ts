import { create } from 'zustand';
import type { FirmwareUploadState } from '../types';

interface FirmwareStore extends FirmwareUploadState {
  setFilePath: (path: string) => void;
  setFileName: (name: string) => void;
  setProgress: (progress: number) => void;
  setStatus: (status: string) => void;
  setIsUploading: (uploading: boolean) => void;
  reset: () => void;
}

const initialState: FirmwareUploadState = {
  filePath: '',
  fileName: '',
  progress: 0,
  status: 'No transfer in progress',
  isUploading: false,
};

export const useFirmwareStore = create<FirmwareStore>((set) => ({
  ...initialState,

  setFilePath: (path) => set({ filePath: path }),

  setFileName: (name) => set({ fileName: name }),

  setProgress: (progress) => set({ progress }),

  setStatus: (status) => set({ status }),

  setIsUploading: (uploading) => set({ isUploading: uploading }),

  reset: () => set(initialState),
}));
