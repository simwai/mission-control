import { StateCreator } from 'zustand'
import { Session, ConnectionStatus } from '@/types/entities'

export interface SessionSlice {
  sessions: Session[]
  selectedSession: string | null
  connection: ConnectionStatus
  lastMessage: unknown
  setSessions: (sessions: Session[]) => void
  setSelectedSession: (id: string | null) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  setConnection: (conn: Partial<ConnectionStatus>) => void
  setLastMessage: (msg: unknown) => void
}

export const createSessionSlice: StateCreator<SessionSlice> = (set) => ({
  sessions: [],
  selectedSession: null,
  connection: {
    isConnected: false,
    url: '',
    reconnectAttempts: 0
  },
  lastMessage: null,
  setSessions: (sessions) => set({ sessions }),
  setSelectedSession: (id) => set({ selectedSession: id }),
  updateSession: (id, updates) => set((state) => ({
    sessions: state.sessions.map((s) => s.id === id ? { ...s, ...updates } : s)
  })),
  setConnection: (conn) => set((state) => ({
    connection: { ...state.connection, ...conn }
  })),
  setLastMessage: (msg) => set({ lastMessage: msg }),
})
