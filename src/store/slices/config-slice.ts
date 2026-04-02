import { StateCreator } from 'zustand'
import { MODEL_CATALOG } from '@/lib/models'

export interface ConfigSlice {
  dashboardMode: 'full' | 'local'
  gatewayAvailable: boolean
  localSessionsAvailable: boolean
  bannerDismissed: boolean
  capabilitiesChecked: boolean
  bootComplete: boolean
  subscription: { type: string; provider?: string; rateLimitTier?: string } | null
  defaultOrgName: string
  availableModels: any[]
  updateAvailable: any | null
  updateDismissedVersion: string | null
  openclawUpdate: any | null
  openclawUpdateDismissedVersion: string | null
  doctorDismissedAt: number | null

  setDashboardMode: (mode: 'full' | 'local') => void
  setGatewayAvailable: (available: boolean) => void
  setLocalSessionsAvailable: (available: boolean) => void
  dismissBanner: () => void
  setCapabilitiesChecked: (checked: boolean) => void
  setBootComplete: () => void
  setSubscription: (sub: any | null) => void
  setDefaultOrgName: (name: string) => void
  setAvailableModels: (models: any[]) => void
  setUpdateAvailable: (info: any | null) => void
  dismissUpdate: (version: string) => void
  setOpenclawUpdate: (info: any | null) => void
  dismissOpenclawUpdate: (version: string) => void
  dismissDoctor: () => void
}

export const createConfigSlice: StateCreator<ConfigSlice> = (set) => ({
  dashboardMode: 'local',
  gatewayAvailable: false,
  localSessionsAvailable: false,
  bannerDismissed: false,
  capabilitiesChecked: false,
  bootComplete: false,
  subscription: null,
  defaultOrgName: 'Default',
  availableModels: [...(MODEL_CATALOG || [])],
  updateAvailable: null,
  updateDismissedVersion: typeof window !== 'undefined' ? localStorage.getItem('mc-update-dismissed-version') : null,
  openclawUpdate: null,
  openclawUpdateDismissedVersion: typeof window !== 'undefined' ? localStorage.getItem('mc-openclaw-update-dismissed') : null,
  doctorDismissedAt: typeof window !== 'undefined' ? Number(localStorage.getItem('mc-doctor-dismissed-at')) || null : null,

  setDashboardMode: (mode) => set({ dashboardMode: mode }),
  setGatewayAvailable: (available) => set({ gatewayAvailable: available }),
  setLocalSessionsAvailable: (available) => set({ localSessionsAvailable: available }),
  dismissBanner: () => set({ bannerDismissed: true }),
  setCapabilitiesChecked: (checked) => set({ capabilitiesChecked: checked }),
  setBootComplete: () => set({ bootComplete: true }),
  setSubscription: (sub) => set({ subscription: sub }),
  setDefaultOrgName: (name) => set({ defaultOrgName: name }),
  setAvailableModels: (models) => set({ availableModels: models }),
  setUpdateAvailable: (info) => set({ updateAvailable: info }),
  dismissUpdate: (version) => {
    if (typeof window !== 'undefined') localStorage.setItem('mc-update-dismissed-version', version)
    set({ updateDismissedVersion: version })
  },
  setOpenclawUpdate: (info) => set({ openclawUpdate: info }),
  dismissOpenclawUpdate: (version) => {
    if (typeof window !== 'undefined') localStorage.setItem('mc-openclaw-update-dismissed', version)
    set({ openclawUpdateDismissedVersion: version })
  },
  dismissDoctor: () => {
    const now = Date.now()
    if (typeof window !== 'undefined') localStorage.setItem('mc-doctor-dismissed-at', String(now))
    set({ doctorDismissedAt: now })
  },
})
