'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { createTaskSlice, TaskSlice } from './slices/task-slice'
import { createAgentSlice, AgentSlice } from './slices/agent-slice'
import { createUiSlice, UiSlice } from './slices/ui-slice'
import { createAuthSlice, AuthSlice } from './slices/auth-slice'

export type MissionControlStore = TaskSlice & AgentSlice & UiSlice & AuthSlice

export const useMissionControl = create<MissionControlStore>()(
  subscribeWithSelector((...a) => ({
    ...createTaskSlice(...a),
    ...createAgentSlice(...a),
    ...createUiSlice(...a),
    ...createAuthSlice(...a),
  }))
)

export * from '@/types/entities'
