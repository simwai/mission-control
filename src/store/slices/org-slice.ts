import { StateCreator } from 'zustand'
import { Tenant, Project } from '@/types/entities'

export interface OrgSlice {
  activeTenant: Tenant | null
  tenants: Tenant[]
  activeProject: Project | null
  projects: Project[]
  setActiveTenant: (tenant: Tenant | null) => void
  setTenants: (tenants: Tenant[]) => void
  setActiveProject: (project: Project | null) => void
  setProjects: (projects: Project[]) => void
  fetchTenants: () => Promise<void>
  fetchProjects: () => Promise<void>
}

export const createOrgSlice: StateCreator<OrgSlice> = (set) => ({
  activeTenant: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mc-active-tenant') || 'null') : null,
  tenants: [],
  activeProject: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mc-active-project') || 'null') : null,
  projects: [],

  setActiveTenant: (tenant) => {
    if (typeof window !== 'undefined') {
      if (tenant) localStorage.setItem('mc-active-tenant', JSON.stringify(tenant))
      else localStorage.removeItem('mc-active-tenant')
    }
    set({ activeTenant: tenant })
  },
  setTenants: (tenants) => set({ tenants }),
  setActiveProject: (project) => {
    if (typeof window !== 'undefined') {
      if (project) localStorage.setItem('mc-active-project', JSON.stringify(project))
      else localStorage.removeItem('mc-active-project')
    }
    set({ activeProject: project })
  },
  setProjects: (projects) => set({ projects }),
  fetchTenants: async () => {
    try {
      const res = await fetch('/api/super/tenants', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      set({ tenants: Array.isArray(data?.tenants) ? data.tenants : [] })
    } catch {}
  },
  fetchProjects: async () => {
    try {
      const res = await fetch('/api/projects', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      set({ projects: Array.isArray(data?.projects) ? data.projects : [] })
    } catch {}
  },
})
