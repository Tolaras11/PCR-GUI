import { create } from 'zustand';
import type { LogMessage } from '../types';

interface LogStore {
  messages: LogMessage[];
  addLog: (message: string, type?: LogMessage['type']) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogStore>((set) => ({
  messages: [],

  addLog: (message, type = 'info') =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          message,
          type,
        },
      ],
    })),

  clearLogs: () => set({ messages: [] }),
}));
