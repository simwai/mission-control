import { StateCreator } from 'zustand'

export interface UiSlice {
  activeTab: string
  sidebarExpanded: boolean
  setActiveTab: (tab: string) => void
  toggleSidebar: () => void
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  activeTab: 'overview',
  sidebarExpanded: true,
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
})
