import { StateCreator } from 'zustand'
import { MODEL_CATALOG } from '@/lib/models'
import { ModelConfig } from '@/types/entities'

export interface ConfigSlice {
  // Dashboard Mode (local vs full gateway)
  dashboardMode: 'full' | 'local'
  gatewayAvailable: boolean
  localSessionsAvailable: boolean
  bannerDismissed: boolean
  capabilitiesChecked: boolean
  bootComplete: boolean
  subscription: { type: string; provider?: string; rateLimitTier?: string } | null
  defaultOrgName: string
  setDashboardMode: (mode: 'full' | 'local') => void
  setGatewayAvailable: (available: boolean) => void
  setLocalSessionsAvailable: (available: boolean) => void
  dismissBanner: () => void
  setCapabilitiesChecked: (checked: boolean) => void
  setBootComplete: () => void
  setSubscription: (sub: { type: string; provider?: string; rateLimitTier?: string } | null) => void
  setDefaultOrgName: (name: string) => void

  // Update availability
  updateAvailable: { latestVersion: string; releaseUrl: string; releaseNotes: string } | null
  updateDismissedVersion: string | null
  setUpdateAvailable: (info: { latestVersion: string; releaseUrl: string; releaseNotes: string } | null) => void
  dismissUpdate: (version: string) => void

  // OpenClaw update availability
  openclawUpdate: { installed: string; latest: string; releaseUrl: string; releaseNotes: string; updateCommand: string } | null
  openclawUpdateDismissedVersion: string | null
  setOpenclawUpdate: (info: { installed: string; latest: string; releaseUrl: string; releaseNotes: string; updateCommand: string } | null) => void
  dismissOpenclawUpdate: (version: string) => void

  // OpenClaw Doctor banner dismiss (persisted with 24h expiry)
  doctorDismissedAt: number | null
  dismissDoctor: () => void

  // Model Configuration
  availableModels: ModelConfig[]
  setAvailableModels: (models: ModelConfig[]) => void

  // Security Posture
  securityPosture?: { score: number; level: string }
  setSecurityPosture: (posture: { score: number; level: string } | undefined) => void
}

export const createConfigSlice: StateCreator<ConfigSlice> = (set) => ({
  // Dashboard Mode
  dashboardMode: 'local',
  gatewayAvailable: false,
  localSessionsAvailable: false,
  bannerDismissed: false,
  capabilitiesChecked: false,
  bootComplete: false,
  subscription: null,
  defaultOrgName: 'Default',
  setDashboardMode: (mode) => set({ dashboardMode: mode }),
  setGatewayAvailable: (available) => set({ gatewayAvailable: available }),
  setLocalSessionsAvailable: (available) => set({ localSessionsAvailable: available }),
  dismissBanner: () => set({ bannerDismissed: true }),
  setCapabilitiesChecked: (checked) => set({ capabilitiesChecked: checked }),
  setBootComplete: () => set({ bootComplete: true }),
  setSubscription: (sub) => set({ subscription: sub }),
  setDefaultOrgName: (name) => set({ defaultOrgName: name }),

  // Update availability
  updateAvailable: null,
  updateDismissedVersion: typeof window !== 'undefined' ? localStorage.getItem('mc-update-dismissed-version') : null,
  setUpdateAvailable: (info) => set({ updateAvailable: info }),
  dismissUpdate: (version) => {
    try { if (typeof window !== 'undefined') localStorage.setItem('mc-update-dismissed-version', version) } catch {}
    set({ updateDismissedVersion: version })
  },

  // OpenClaw update availability
  openclawUpdate: null,
  openclawUpdateDismissedVersion: typeof window !== 'undefined' ? localStorage.getItem('mc-openclaw-update-dismissed') : null,
  setOpenclawUpdate: (info) => set({ openclawUpdate: info }),
  dismissOpenclawUpdate: (version) => {
    try { if (typeof window !== 'undefined') localStorage.setItem('mc-openclaw-update-dismissed', version) } catch {}
    set({ openclawUpdateDismissedVersion: version })
  },

  // OpenClaw Doctor banner dismiss
  doctorDismissedAt: typeof window !== 'undefined' ? Number(localStorage.getItem('mc-doctor-dismissed-at')) || null : null,
  dismissDoctor: () => {
    const now = Date.now()
    try { if (typeof window !== 'undefined') localStorage.setItem('mc-doctor-dismissed-at', String(now)) } catch {}
    set({ doctorDismissedAt: now })
  },

  // Model Configuration
  availableModels: [...(MODEL_CATALOG || [])],
  setAvailableModels: (models) => set({ availableModels: models }),

  // Security Posture
  securityPosture: undefined,
  setSecurityPosture: (posture) => set({ securityPosture: posture }),
})
