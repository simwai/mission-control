/**
 * Agent Templates Library
 *
 * Defines agent archetypes that can be used as starting points for new deployments.
 */

export interface AgentToolsConfig {
  allow: string[]
  deny: string[]
}

export interface AgentSandboxConfig {
  mode: 'all' | 'non-main'
  workspaceAccess: 'rw' | 'ro' | 'none'
  scope: 'agent'
  docker?: {
    network: 'none' | 'bridge'
  }
}

export interface AgentModelConfig {
  primary: string
  fallbacks: string[]
}

export interface AgentIdentityConfig {
  name: string
  theme: string
  emoji: string
}

export interface AgentSubagentsConfig {
  allowAgents?: string[]
  model?: string
}

export interface AgentMemorySearchConfig {
  sources: string[]
  experimental?: {
    sessionMemory?: boolean
  }
}

export interface OpenClawAgentConfig {
  id: string
  name?: string
  workspace?: string
  agentDir?: string
  model: AgentModelConfig
  identity: AgentIdentityConfig
  subagents?: AgentSubagentsConfig
  sandbox: AgentSandboxConfig
  tools: AgentToolsConfig
  memorySearch?: AgentMemorySearchConfig
}

export interface AgentTemplate {
  type: string
  label: string
  description: string
  emoji: string
  modelTier: 'opus' | 'sonnet' | 'haiku'
  toolCount: number
  config: Omit<OpenClawAgentConfig, 'id' | 'workspace' | 'agentDir'>
}

import { getPluginToolProviders } from '@/lib/plugins'

// Tool groups for template composition
const TOOL_GROUPS: Record<string, readonly string[]> = {
  coding: ['read', 'write', 'edit', 'apply_patch', 'exec', 'bash', 'process'],
  browser: ['browser', 'web'],
  memory: ['memory_search', 'memory_get'],
  session: ['agents_list', 'sessions_list', 'sessions_history', 'sessions_send', 'sessions_spawn', 'session_status'],
  subagent: ['subagents', 'lobster', 'llm-task'],
  thinking: ['thinking', 'reactions', 'skills'],
  readonly: ['read', 'memory_search', 'memory_get', 'agents_list'],
}

/** Merge base TOOL_GROUPS with tools from plugin tool providers */
export function getEffectiveToolGroups(): Record<string, readonly string[]> {
  const merged: Record<string, string[]> = {}
  for (const [key, tools] of Object.entries(TOOL_GROUPS)) {
    merged[key] = [...tools]
  }
  for (const provider of getPluginToolProviders()) {
    const groupId = provider.id
    if (merged[groupId]) {
      const existing = new Set(merged[groupId])
      for (const tool of provider.tools) {
        if (!existing.has(tool)) merged[groupId].push(tool)
      }
    } else {
      merged[groupId] = [...provider.tools]
    }
  }
  return merged
}

const COMMON_DENY = ['clawhub', 'cron', 'gateway', 'nodes']

const SONNET_FALLBACKS = [
  'anthropic/claude-3-5-sonnet-latest',
  'openai/gpt-4o',
]

const _templates: AgentTemplate[] = [
  {
    type: 'orchestrator',
    label: 'Orchestrator',
    description: 'Primary coordinator with full tool access.',
    emoji: '🧭',
    modelTier: 'opus',
    toolCount: 23,
    config: {
      model: { primary: 'anthropic/claude-3-opus-latest', fallbacks: [] },
      identity: { name: '', theme: 'operator strategist', emoji: '🧭' },
      sandbox: { mode: 'non-main', workspaceAccess: 'rw', scope: 'agent' },
      tools: { allow: [...TOOL_GROUPS.coding, ...TOOL_GROUPS.browser], deny: COMMON_DENY },
    }
  },
  {
    type: 'developer',
    label: 'Developer',
    description: 'Full-stack builder with Docker access.',
    emoji: '🛠️',
    modelTier: 'sonnet',
    toolCount: 21,
    config: {
      model: { primary: 'anthropic/claude-3-5-sonnet-latest', fallbacks: SONNET_FALLBACKS },
      identity: { name: '', theme: 'builder engineer', emoji: '🛠️' },
      sandbox: { mode: 'all', workspaceAccess: 'rw', scope: 'agent', docker: { network: 'bridge' } },
      tools: { allow: [...TOOL_GROUPS.coding, 'agents_list'], deny: COMMON_DENY },
    }
  }
]

export function registerAgentTemplate(template: AgentTemplate) {
  _templates.push(template)
}

export function getAgentTemplates(): AgentTemplate[] {
  return [..._templates]
}

export function getTemplate(type: string): AgentTemplate | undefined {
  return _templates.find(t => t.type === type)
}

export function buildAgentConfig(template: AgentTemplate, overrides: any): OpenClawAgentConfig {
  const config = structuredClone(template.config)
  return {
    id: overrides.id,
    name: overrides.name,
    ...config,
    identity: { ...config.identity, name: overrides.name }
  } as any
}

export const MODEL_TIERS = {
  opus: { label: 'Opus', color: 'purple', costIndicator: '$$$' },
  sonnet: { label: 'Sonnet', color: 'blue', costIndicator: '$$' },
  haiku: { label: 'Haiku', color: 'green', costIndicator: '$' },
} as const
