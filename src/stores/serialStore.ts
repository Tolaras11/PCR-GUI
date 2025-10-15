import { create } from 'zustand';
import type { SerialConnectionState, BaudRate } from '../types';

interface SerialStore extends SerialConnectionState {
  availablePorts: string[];
  setPort: (port: SerialPort | null) => void;
  setIsConnected: (connected: boolean) => void;
  setSelectedPort: (port: string) => void;
  setBaudRate: (rate: BaudRate) => void;
  setStatus: (status: string, color: 'success' | 'error') => void;
  setAvailablePorts: (ports: string[]) => void;
  reset: () => void;
}

const initialState: SerialConnectionState = {
  port: null,
  isConnected: false,
  selectedPort: '',
  baudRate: 115200,
  status: 'Disconnected',
  statusColor: 'error',
};

export const useSerialStore = create<SerialStore>((set) => ({
  ...initialState,
  availablePorts: [],

  setPort: (port) => set({ port }),

  setIsConnected: (connected) => set({ isConnected: connected }),

  setSelectedPort: (port) => set({ selectedPort: port }),

  setBaudRate: (rate) => set({ baudRate: rate }),

  setStatus: (status, color) => set({ status, statusColor: color }),

  setAvailablePorts: (ports) => set({ availablePorts: ports }),

  reset: () => set(initialState),
}));
