import { StateCreator } from 'zustand'

export interface UiSlice {
  activeTab: string
  sidebarExpanded: boolean
  collapsedGroups: string[]
  liveFeedOpen: boolean
  headerDensity: 'focus' | 'compact'
  interfaceMode: 'essential' | 'full'
  dashboardLayout: string[] | null

  setActiveTab: (tab: string) => void
  toggleSidebar: () => void
  setSidebarExpanded: (expanded: boolean) => void
  toggleGroup: (groupId: string) => void
  toggleLiveFeed: () => void
  setHeaderDensity: (mode: 'focus' | 'compact') => void
  setInterfaceMode: (mode: 'essential' | 'full') => void
  setDashboardLayout: (layout: string[] | null | ((curr: string[] | null) => string[] | null)) => void
}

export const createUiSlice: StateCreator<UiSlice> = (set, get) => ({
  activeTab: 'overview',
  sidebarExpanded: typeof window !== 'undefined' ? localStorage.getItem('mc-sidebar-expanded') === 'true' : false,
  collapsedGroups: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mc-sidebar-groups') || '[]') : [],
  liveFeedOpen: typeof window !== 'undefined' ? localStorage.getItem('mc-livefeed-open') !== 'false' : true,
  headerDensity: typeof window !== 'undefined' ? (localStorage.getItem('mc-header-density') as any) || 'focus' : 'focus',
  interfaceMode: 'essential',
  dashboardLayout: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mc-dashboard-layout') || 'null') : null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => {
    const next = !state.sidebarExpanded
    if (typeof window !== 'undefined') localStorage.setItem('mc-sidebar-expanded', String(next))
    return { sidebarExpanded: next }
  }),
  setSidebarExpanded: (expanded) => {
    if (typeof window !== 'undefined') localStorage.setItem('mc-sidebar-expanded', String(expanded))
    set({ sidebarExpanded: expanded })
  },
  toggleGroup: (groupId) => set((state) => {
    const next = state.collapsedGroups.includes(groupId)
      ? state.collapsedGroups.filter(g => g !== groupId)
      : [...state.collapsedGroups, groupId]
    if (typeof window !== 'undefined') localStorage.setItem('mc-sidebar-groups', JSON.stringify(next))
    return { collapsedGroups: next }
  }),
  toggleLiveFeed: () => set((state) => {
    const next = !state.liveFeedOpen
    if (typeof window !== 'undefined') localStorage.setItem('mc-livefeed-open', String(next))
    return { liveFeedOpen: next }
  }),
  setHeaderDensity: (mode) => {
    if (typeof window !== 'undefined') localStorage.setItem('mc-header-density', mode)
    set({ headerDensity: mode })
  },
  setInterfaceMode: (mode) => set({ interfaceMode: mode }),
  setDashboardLayout: (layoutOrUpdater) => {
    const current = (get() as any).dashboardLayout
    const next = typeof layoutOrUpdater === 'function' ? layoutOrUpdater(current) : layoutOrUpdater
    if (typeof window !== 'undefined') {
      if (next) localStorage.setItem('mc-dashboard-layout', JSON.stringify(next))
      else localStorage.removeItem('mc-dashboard-layout')
    }
    set({ dashboardLayout: next })
  },
})
