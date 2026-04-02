import { StateCreator } from 'zustand'
import { Activity } from '@/types/entities'

export interface ActivitySlice {
  activities: any[]
  setActivities: (activities: any[]) => void
  addActivity: (activity: any) => void
}

export const createActivitySlice: StateCreator<ActivitySlice> = (set) => ({
  activities: [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities].slice(0, 1000) })),
})
