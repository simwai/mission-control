/**
 * Core Panel Registration
 */
import { registerPanel } from './plugins'
import { Dashboard } from '@/components/dashboard/dashboard'
import { LogViewerPanel } from '@/components/panels/log-viewer-panel'
import { CronManagementPanel } from '@/components/panels/cron-management-panel'
import { MemoryBrowserPanel } from '@/components/panels/memory-browser-panel'
import { CostTrackerPanel } from '@/components/panels/cost-tracker-panel'
import { TaskBoardPanel } from '@/components/panels/task-board-panel'
import { ActivityFeedPanel } from '@/components/panels/activity-feed-panel'
import { AgentSquadPanelPhase3 } from '@/components/panels/agent-squad-panel-phase3'
import { AgentCommsPanel } from '@/components/panels/agent-comms-panel'
import { StandupPanel } from '@/components/panels/standup-panel'
import { NotificationsPanel } from '@/components/panels/notifications-panel'
import { UserManagementPanel } from '@/components/panels/user-management-panel'
import { AuditTrailPanel } from '@/components/panels/audit-trail-panel'
import { WebhookPanel } from '@/components/panels/webhook-panel'
import { SettingsPanel } from '@/components/panels/settings-panel'
import { GatewayConfigPanel } from '@/components/panels/gateway-config-panel'
import { IntegrationsPanel } from '@/components/panels/integrations-panel'
import { AlertRulesPanel } from '@/components/panels/alert-rules-panel'
import { MultiGatewayPanel } from '@/components/panels/multi-gateway-panel'
import { SuperAdminPanel } from '@/components/panels/super-admin-panel'
import { OfficePanel } from '@/components/panels/office-panel'
import { GitHubSyncPanel } from '@/components/panels/github-sync-panel'
import { SkillsPanel } from '@/components/panels/skills-panel'
import { ChannelsPanel } from '@/components/panels/channels-panel'
import { SecurityAuditPanel } from '@/components/panels/security-audit-panel'
import { NodesPanel } from '@/components/panels/nodes-panel'
import { ExecApprovalPanel } from '@/components/panels/exec-approval-panel'
import { SystemMonitorPanel } from '@/components/panels/system-monitor-panel'
import { ChatPagePanel } from '@/components/panels/chat-page-panel'

export function initCorePanels() {
  registerPanel('overview', Dashboard)
  registerPanel('agents', AgentSquadPanelPhase3)
  registerPanel('tasks', TaskBoardPanel)
  registerPanel('chat', ChatPagePanel)
  registerPanel('activity', ActivityFeedPanel)
  registerPanel('logs', LogViewerPanel)
  registerPanel('cost-tracker', CostTrackerPanel)
  registerPanel('memory', MemoryBrowserPanel)
  registerPanel('cron', CronManagementPanel)
  registerPanel('webhooks', WebhookPanel)
  registerPanel('alerts', AlertRulesPanel)
  registerPanel('notifications', NotificationsPanel)
  registerPanel('users', UserManagementPanel)
  registerPanel('audit', AuditTrailPanel)
  registerPanel('settings', SettingsPanel)
  registerPanel('gateways', MultiGatewayPanel)
  registerPanel('gateway-config', GatewayConfigPanel)
  registerPanel('integrations', IntegrationsPanel)
  registerPanel('super-admin', SuperAdminPanel)
  registerPanel('office', OfficePanel)
  registerPanel('github', GitHubSyncPanel)
  registerPanel('skills', SkillsPanel)
  registerPanel('channels', ChannelsPanel)
  registerPanel('nodes', NodesPanel)
  registerPanel('security', SecurityAuditPanel)
  registerPanel('exec-approvals', ExecApprovalPanel)
  registerPanel('monitor', SystemMonitorPanel)
  registerPanel('standup', StandupPanel)
  registerPanel('comms', AgentCommsPanel)
}
