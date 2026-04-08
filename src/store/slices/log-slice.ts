import { StateCreator } from 'zustand'
import { LogEntry } from '@/types/entities'

export interface LogSlice {
  logs: LogEntry[]
  logFilters: { level?: string; source?: string; session?: string; search?: string }
  addLog: (log: LogEntry) => void
  setLogFilters: (filters: Partial<LogSlice['logFilters']>) => void
  clearLogs: () => void
}

export const createLogSlice: StateCreator<LogSlice> = (set) => ({
  logs: [],
  logFilters: {},
  addLog: (log) => set((state) => {
    const existingIndex = state.logs.findIndex(l => l.id === log.id)
    if (existingIndex !== -1) {
      const updated = [...state.logs]
      updated[existingIndex] = log
      return { logs: updated }
    }
    return { logs: [log, ...state.logs].slice(0, 1000) }
  }),
  setLogFilters: (filters) => set((state) => ({ logFilters: { ...state.logFilters, ...filters } })),
  clearLogs: () => set({ logs: [] }),
})
