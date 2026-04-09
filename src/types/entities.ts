/**
 * Unified Domain Entities for Mission Control
 * Single source of truth for all domain objects.
 */

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue | undefined }

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

export interface ChatAttachment {
  name: string
  type: string
  size: number
  dataUrl: string
}

export interface ChatMessage {
  id: number
  conversation_id: string
  from_agent: string
  to_agent: string | null
  content: string
  message_type: 'text' | 'system' | 'handoff' | 'status' | 'command' | 'tool_call'
  metadata?: JsonValue
  attachments?: ChatAttachment[]
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

export interface StandupReport {
  date: string
  generatedAt: string
  summary: {
    totalAgents: number
    totalCompleted: number
    totalInProgress: number
    totalAssigned: number
    totalReview: number
    totalBlocked: number
    totalActivity: number
    overdue: number
  }
  agentReports: Array<{
    agent: {
      name: string
      role: string
      status: string
      last_seen?: number
      last_activity?: string
    }
    completedToday: Task[]
    inProgress: Task[]
    assigned: Task[]
    review: Task[]
    blocked: Task[]
    activity: {
      actionCount: number
      commentsCount: number
    }
  }>
  teamAccomplishments: Task[]
  teamBlockers: Task[]
  overdueTasks: Task[]
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
  is_approved?: number
  created_at: number
  updated_at: number
  last_login_at: number | null
}

export interface UserSession {
  id: number
  token: string
  user_id: number
  workspace_id: number
  tenant_id: number
  expires_at: number
  created_at: number
  ip_address: string | null
  user_agent: string | null
}

export interface Tenant {
  id: number
  slug: string
  display_name: string
  linux_user: string
  plan_tier: string
  status: 'pending' | 'provisioning' | 'active' | 'suspended' | 'error'
  openclaw_home: string
  workspace_root: string
  gateway_port?: number
  dashboard_port?: number
  config?: string
  created_by: string
  owner_gateway?: string
  created_at: number
  updated_at: number
}

export interface Workspace {
  id: number
  slug: string
  name: string
  tenant_id: number
  created_at: number
  updated_at: number
}

export interface ProvisionJob {
  id: number
  tenant_id: number
  job_type: 'bootstrap' | 'update' | 'decommission'
  status: 'queued' | 'approved' | 'running' | 'completed' | 'failed' | 'rejected' | 'cancelled'
  dry_run: 0 | 1
  requested_by: string
  approved_by?: string
  runner_host?: string
  idempotency_key?: string
  request_json?: string
  plan_json?: string
  result_json?: string
  error_text?: string
  started_at?: number
  completed_at?: number
  created_at: number
  updated_at: number
}

export interface ProvisionEvent {
  id: number
  job_id: number
  level: 'info' | 'warn' | 'error'
  step_key?: string
  message: string
  data?: string
  created_at: number
}

export interface OsUser {
  username: string
  uid: number
  home_dir: string
  shell: string
  linked_tenant_id: number | null
  has_claude: boolean
  has_codex: boolean
  has_openclaw: boolean
  is_process_owner: boolean
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

export interface ConnectionStatus {
  isConnected: boolean
  url: string
  lastConnected?: Date
  reconnectAttempts: number
  latency?: number
  sseConnected?: boolean
}

export interface ExecApprovalRequest {
  id: string
  sessionId: string
  agentName?: string
  toolName: string
  toolArgs: Record<string, any>
  command?: string
  cwd?: string
  host?: string
  resolvedPath?: string
  risk: 'low' | 'medium' | 'high' | 'critical'
  createdAt: number
  expiresAt?: number
  status: 'pending' | 'approved' | 'denied' | 'expired'
}

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

export interface LogEntry {
  id: string
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'debug'
  source: string
  session?: string
  message: string
  data?: JsonValue
}

export interface MemoryFile {
  path: string
  name: string
  type: 'file' | 'directory'
  size?: number
  modified?: number
  children?: MemoryFile[]
}

export interface TokenUsage {
  model: string
  sessionId: string
  date: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  cacheReadTokens?: number
  cacheWriteTokens?: number
}

export interface ModelConfig {
  alias: string
  name: string
  provider: string
  description: string
  costPer1k: number
}

export interface CronJob {
  id?: string
  name: string
  schedule: string
  command: string
  model?: string
  agentId?: string
  timezone?: string
  delivery?: string
  enabled: boolean
  lastRun?: number
  nextRun?: number
  lastStatus?: 'success' | 'error' | 'running' | 'pending'
  lastError?: string
}

export interface SpawnRequest {
  id: string
  task: string
  model: string
  label: string
  timeoutSeconds: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: number
  completedAt?: number
  result?: string
  error?: string
}

export interface Skill {
  id: string
  name: string
  source: string
  path: string
  description?: string
  registry_slug?: string | null
  security_status?: string | null
}

export interface SkillGroup {
  source: string
  path: string
  skills: Skill[]
}
