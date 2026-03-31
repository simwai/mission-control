import { StateCreator } from 'zustand'
import { User } from '@/types/entities'

export interface AuthSlice {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
})
