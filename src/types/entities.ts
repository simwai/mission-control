/**
 * Single source of truth for all domain entities in Mission Control.
 */

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue | undefined }

export interface Session {
  id: string
  key: string
  agent?: string
  channel?: string
  kind: string
  age: string
  model: string
  tokens: string
  flags: string[]
  active: boolean
  startTime?: number
  lastActivity?: number
  messageCount?: number
  cost?: number
  label?: string
}

export interface Task {
  id: number
  title: string
  description?: string
  status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'quality_review' | 'done' | 'awaiting_owner'
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent'
  project_id?: number
  project_ticket_no?: number
  project_name?: string
  project_prefix?: string
  ticket_ref?: string
  assigned_to?: string
  created_by: string
  created_at: number
  updated_at: number
  due_date?: number
  estimated_hours?: number
  actual_hours?: number
  outcome?: 'success' | 'failed' | 'partial' | 'abandoned'
  error_message?: string
  resolution?: string
  feedback_rating?: number
  feedback_notes?: string
  retry_count?: number
  completed_at?: number
  tags?: string[]
  metadata?: JsonValue
  github_issue_number?: number
  github_repo?: string
  github_synced_at?: number
  github_branch?: string
  github_pr_number?: number
  github_pr_state?: string
}

export interface Agent {
  id: number
  name: string
  role: string
  session_key?: string
  soul_content?: string
  working_memory?: string
  status: 'offline' | 'idle' | 'busy' | 'error'
  last_seen?: number
  last_activity?: string
  created_at: number
  updated_at: number
  hidden?: number
  config?: JsonValue
  taskStats?: {
    total: number
    assigned: number
    in_progress: number
    quality_review: number
    done: number
    completed: number
  }
}

export interface Activity {
  id: number
  type: string
  entity_type: string
  entity_id: number
  actor: string
  description: string
  data?: JsonValue
  created_at: number
  entity?: {
    type: string
    id?: number
    title?: string
    name?: string
    status?: string
    content_preview?: string
    task_title?: string
  }
}

export interface Notification {
  id: number
  recipient: string
  type: string
  title: string
  message: string
  source_type?: string
  source_id?: number
  read_at?: number
  delivered_at?: number
  created_at: number
  source?: {
    type: string
    id?: number
    title?: string
    name?: string
    status?: string
    content_preview?: string
    task_title?: string
  }
}

export interface Comment {
  id: number
  task_id: number
  author: string
  content: string
  created_at: number
  parent_id?: number
  mentions?: string[]
  replies?: Comment[]
}

export interface ChatMessage {
  id: number
  conversation_id: string
  from_agent: string
  to_agent: string | null
  content: string
  message_type: 'text' | 'system' | 'handoff' | 'status' | 'command' | 'tool_call'
  metadata?: JsonValue
  attachments?: {
    name: string
    type: string
    size: number
    dataUrl: string
  }[]
  read_at?: number
  created_at: number
  pendingStatus?: 'sending' | 'sent' | 'failed'
}

export interface Conversation {
  id: string
  name?: string
  kind?: string
  source?: 'chat' | 'session'
  session?: {
    prefKey?: string
    sessionId: string
    sessionKey?: string
    sessionKind: 'claude-code' | 'codex-cli' | 'hermes' | 'gateway'
    agent?: string
    displayName?: string
    colorTag?: string
    model?: string
    tokens?: string
    workingDir?: string | null
    lastUserPrompt?: string | null
    active?: boolean
    age?: string
  }
  participants: string[]
  lastMessage?: ChatMessage
  unreadCount: number
  updatedAt: number
}

export interface User {
  id: number
  username: string
  display_name: string
  role: 'admin' | 'operator' | 'viewer'
  workspace_id?: number
  tenant_id?: number
  provider?: 'local' | 'google'
  email?: string | null
  avatar_url?: string | null
}

export interface Project {
  id: number
  name: string
  slug: string
  description?: string
  ticket_prefix: string
  status: string
  github_repo?: string
  deadline?: number
  color?: string
  task_count?: number
  assigned_agents?: string[]
  github_sync_enabled?: boolean
  github_labels_initialized?: boolean
  github_default_branch?: string
}

export interface Tenant {
  id: number
  slug: string
  display_name: string
  status: string
  linux_user: string
  gateway_port?: number | null
  owner_gateway?: string
}
