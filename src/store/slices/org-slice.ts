import { StateCreator } from 'zustand'
import { Tenant, Project, OsUser } from '@/types/entities'

export interface OrgSlice {
  // Tenant / Organization context
  activeTenant: Tenant | null
  tenants: Tenant[]
  osUsers: OsUser[]
  setActiveTenant: (tenant: Tenant | null) => void
  setTenants: (tenants: Tenant[]) => void
  fetchTenants: () => Promise<void>
  fetchOsUsers: () => Promise<void>

  // Project context (scoped within current tenant/workspace)
  activeProject: Project | null
  projects: Project[]
  setActiveProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  fetchProjects: () => Promise<void>

  // Project Manager Modal (global)
  showProjectManagerModal: boolean
  setShowProjectManagerModal: (show: boolean) => void

  // Onboarding
  showOnboarding: boolean
  setShowOnboarding: (show: boolean) => void

  // Skills (persisted across tab switches)
  skillsList: any[] | null
  skillGroups: any[] | null
  skillsTotal: number
  setSkillsData: (skills: any[], groups: any[], total: number) => void

  // Memory Graph (persisted across tab switches)
  memoryGraphAgents: any[] | null
  setMemoryGraphAgents: (agents: any[]) => void
}

export const createOrgSlice: StateCreator<OrgSlice> = (set) => ({
  // Tenant / Organization context
  activeTenant: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mc-active-tenant') || 'null') : null,
  tenants: [],
  osUsers: [],
  setActiveTenant: (tenant) => {
    try {
      if (typeof window !== 'undefined') {
        if (tenant) localStorage.setItem('mc-active-tenant', JSON.stringify(tenant))
        else localStorage.removeItem('mc-active-tenant')
      }
    } catch {}
    set({ activeTenant: tenant })
  },
  setTenants: (tenants) => set({ tenants }),
  fetchTenants: async () => {
    try {
      const res = await fetch('/api/super/tenants', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      set({ tenants: Array.isArray(data?.tenants) ? data.tenants : [] })
    } catch {}
  },
  fetchOsUsers: async () => {
    try {
      const res = await fetch('/api/super/os-users', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      set({ osUsers: Array.isArray(data?.users) ? data.users : [] })
    } catch {}
  },

  // Project context
  activeProject: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mc-active-project') || 'null') : null,
  projects: [],
  setActiveProject: (project) => {
    try {
      if (typeof window !== 'undefined') {
        if (project) localStorage.setItem('mc-active-project', JSON.stringify(project))
        else localStorage.removeItem('mc-active-project')
      }
    } catch {}
    set({ activeProject: project })
  },
  setProjects: (projects) => set({ projects }),
  fetchProjects: async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      set({ projects: Array.isArray(data?.projects) ? data.projects : [] })
    } catch {}
  },

  // Project Manager Modal
  showProjectManagerModal: false,
  setShowProjectManagerModal: (show) => set({ showProjectManagerModal: show }),

  // Onboarding
  showOnboarding: false,
  setShowOnboarding: (show) => set({ showOnboarding: show }),

  // Skills
  skillsList: null,
  skillGroups: null,
  skillsTotal: 0,
  setSkillsData: (skills, groups, total) => set({ skillsList: skills, skillGroups: groups, skillsTotal: total }),

  // Memory Graph
  memoryGraphAgents: null,
  setMemoryGraphAgents: (agents) => set({ memoryGraphAgents: agents }),
})
