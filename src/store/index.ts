'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { createTaskSlice, TaskSlice } from './slices/task-slice'
import { createAgentSlice, AgentSlice } from './slices/agent-slice'
import { createUiSlice, UiSlice } from './slices/ui-slice'
import { createAuthSlice, AuthSlice } from './slices/auth-slice'
import { createNotificationSlice, NotificationSlice } from './slices/notification-slice'
import { createConfigSlice, ConfigSlice } from './slices/config-slice'
import { createChatSlice, ChatSlice } from './slices/chat-slice'
import { createOrgSlice, OrgSlice } from './slices/org-slice'
import { createSessionSlice, SessionSlice } from './slices/session-slice'
import { createApprovalSlice, ApprovalSlice } from './slices/approval-slice'
import { createLogSlice, LogSlice } from './slices/log-slice'
import { createSpawnSlice, SpawnSlice } from './slices/spawn-slice'
import { createTokenSlice, TokenSlice } from './slices/token-slice'
import { createActivitySlice, ActivitySlice } from './slices/activity-slice'

/**
 * Base Mission Control Store
 */
export type MissionControlStore =
  TaskSlice &
  AgentSlice &
  UiSlice &
  AuthSlice &
  NotificationSlice &
  ConfigSlice &
  ChatSlice &
  OrgSlice &
  SessionSlice &
  ApprovalSlice &
  LogSlice &
  SpawnSlice &
  TokenSlice &
  ActivitySlice &
  { plugins: Record<string, any> } // Dynamic plugin state area
  registerPluginState: (id: string, initialState: any) => void

export const useMissionControl = create<MissionControlStore>()(
  subscribeWithSelector((...a) => ({
    ...createTaskSlice(...a),
    ...createAgentSlice(...a),
    ...createUiSlice(...a),
    ...createAuthSlice(...a),
    ...createNotificationSlice(...a),
    ...createConfigSlice(...a),
    ...createChatSlice(...a),
    ...createOrgSlice(...a),
    ...createSessionSlice(...a),
    ...createApprovalSlice(...a),
    ...createLogSlice(...a),
    ...createSpawnSlice(...a),
    ...createTokenSlice(...a),
    ...createActivitySlice(...a),
    plugins: {},

    // Action for plugins to inject their own state/actions
    registerPluginState: (id: string, initialState: any) => {
      const set = a[0]
      set((state: any) => ({
        plugins: { ...state.plugins, [id]: initialState }
      }))
    }
  }))
)

export * from '@/types/entities'
