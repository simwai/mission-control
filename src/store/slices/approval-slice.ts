import { StateCreator } from 'zustand'
import { ExecApprovalRequest } from '@/types/entities'

export interface ApprovalSlice {
  execApprovals: ExecApprovalRequest[]
  setExecApprovals: (approvals: ExecApprovalRequest[]) => void
  addExecApproval: (approval: ExecApprovalRequest) => void
  updateExecApproval: (id: string, updates: Partial<ExecApprovalRequest>) => void
}

export const createApprovalSlice: StateCreator<ApprovalSlice> = (set) => ({
  execApprovals: [],
  setExecApprovals: (approvals) => set({ execApprovals: approvals }),
  addExecApproval: (approval) => set((state) => {
    if (state.execApprovals.some(a => a.id === approval.id)) return state
    return { execApprovals: [approval, ...state.execApprovals].slice(0, 200) }
  }),
  updateExecApproval: (id, updates) => set((state) => ({
    execApprovals: state.execApprovals.map(a => a.id === id ? { ...a, ...updates } : a)
  })),
})
