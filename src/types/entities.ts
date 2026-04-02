/**
 * Unified Domain Entities for Mission Control
 */

export type JsonPrimitive = string | number | boolean | null
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue | undefined }

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'quality_review' | 'done' | 'awaiting_owner';
  priority: 'low' | 'medium' | 'high' | 'critical' | 'urgent';
  project_id?: number;
  project_ticket_no?: number;
  project_name?: string;
  project_prefix?: string;
  ticket_ref?: string;
  assigned_to?: string;
  created_by: string;
  created_at: number;
  updated_at: number;
  due_date?: number;
  estimated_hours?: number;
  actual_hours?: number;
  outcome?: 'success' | 'failed' | 'partial' | 'abandoned';
  error_message?: string;
  resolution?: string;
  feedback_rating?: number;
  feedback_notes?: string;
  retry_count?: number;
  completed_at?: number;
  tags?: string[];
  metadata?: JsonValue;
}

export interface Agent {
  id: number;
  name: string;
  role: string;
  session_key?: string;
  soul_content?: string;
  working_memory?: string;
  status: 'offline' | 'idle' | 'busy' | 'error';
  last_seen?: number;
  last_activity?: string;
  created_at: number;
  updated_at: number;
  hidden?: number;
  config?: JsonValue;
  taskStats?: {
    total: number;
    assigned: number;
    in_progress: number;
    quality_review: number;
    done: number;
    completed: number;
  };
}

export interface Comment {
  id: number;
  task_id: number;
  author: string;
  content: string;
  created_at: number;
  parent_id?: number;
  mentions?: string[];
  replies?: Comment[];
}

export interface User {
  id: number;
  username: string;
  display_name: string;
  role: 'admin' | 'operator' | 'viewer';
  workspace_id?: number;
  tenant_id?: number;
  provider?: 'local' | 'google';
  email?: string | null;
  avatar_url?: string | null;
}

export interface Notification {
  id: number;
  recipient: string;
  type: string;
  title: string;
  message: string;
  source_type?: string;
  source_id?: number;
  read_at?: number;
  delivered_at?: number;
  created_at: number;
}

export interface ChatMessage {
  id: number;
  conversation_id: string;
  from_agent: string;
  to_agent: string | null;
  content: string;
  message_type: 'text' | 'system' | 'handoff' | 'status' | 'command' | 'tool_call';
  metadata?: JsonValue;
  read_at?: number;
  created_at: number;
  pendingStatus?: 'sending' | 'sent' | 'failed';
}

export interface Conversation {
  id: string;
  name?: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  url: string;
  lastConnected?: Date;
  reconnectAttempts: number;
  latency?: number;
  sseConnected?: boolean;
}

export interface Session {
  id: string;
  key: string;
  agent?: string;
  kind: string;
  model: string;
  active: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  data?: JsonValue;
}

export interface ExecApprovalRequest {
  id: string;
  sessionId: string;
  toolName: string;
  toolArgs: Record<string, any>;
  risk: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'denied' | 'expired';
}

export interface Tenant {
  id: number;
  slug: string;
  display_name: string;
}

export interface Project {
  id: number;
  name: string;
  ticket_prefix: string;
}
