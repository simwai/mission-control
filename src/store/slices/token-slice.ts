import { StateCreator } from 'zustand'

export interface TokenSlice {
  tokenUsage: any[]
  addTokenUsage: (usage: any) => void
  getTotalCost: (timeframe: 'day' | 'week' | 'month') => number
  getUsageByModel: (timeframe: 'day' | 'week' | 'month') => Record<string, number>
}

export const createTokenSlice: StateCreator<TokenSlice> = (set, get) => ({
  tokenUsage: [],
  addTokenUsage: (usage) => set((state) => ({ tokenUsage: [...state.tokenUsage, usage].slice(-2000) })),
  getTotalCost: (timeframe) => {
    const { tokenUsage } = get() as any
    const now = Date.now()
    const ms = timeframe === 'day' ? 86400000 : timeframe === 'week' ? 604800000 : 2592000000
    return tokenUsage
      .filter((u: any) => new Date(u.date).getTime() > now - ms)
      .reduce((acc: number, u: any) => acc + u.cost, 0)
  },
  getUsageByModel: (timeframe) => {
    const { tokenUsage } = get() as any
    const now = Date.now()
    const ms = timeframe === 'day' ? 86400000 : timeframe === 'week' ? 604800000 : 2592000000
    return tokenUsage
      .filter((u: any) => new Date(u.date).getTime() > now - ms)
      .reduce((acc: any, u: any) => {
        acc[u.model] = (acc[u.model] || 0) + u.totalTokens
        return acc
      }, {})
  },
})
