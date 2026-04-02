import { StateCreator } from 'zustand'

export interface SpawnSlice {
  spawnRequests: any[]
  addSpawnRequest: (request: any) => void
  updateSpawnRequest: (id: string, updates: any) => void
}

export const createSpawnSlice: StateCreator<SpawnSlice> = (set) => ({
  spawnRequests: [],
  addSpawnRequest: (request) => set((state) => ({ spawnRequests: [request, ...state.spawnRequests].slice(0, 500) })),
  updateSpawnRequest: (id, updates) => set((state) => ({
    spawnRequests: state.spawnRequests.map(r => r.id === id ? { ...r, ...updates } : r)
  })),
})
