import { getDatabase, Agent, db_helpers, logAuditEvent } from '@/lib/db';
import { eventBus } from '@/lib/event-bus';
import { getTemplate, buildAgentConfig } from '@/lib/agent-templates';
import { writeAgentToConfig, enrichAgentConfigFromWorkspace } from '@/lib/agent-sync';
import { runOpenClaw } from '@/lib/command';
import { config as appConfig } from '@/lib/config';
import { resolveWithin } from '@/lib/paths';
import { DBService } from '@/lib/db-service';
import path from 'node:path';

export class AgentService {
  /**
   * Fetches agents with filtering and task statistics (using DBService)
   */
  static async getAgents(workspaceId: number, filters: { status?: string | null; role?: string | null; showHidden?: boolean; limit: number; offset: number }) {
    const { status, role, showHidden, limit, offset } = filters;

    const query = DBService.table('agents').where('workspace_id', workspaceId);

    if (!showHidden) query.where('hidden', 0);
    if (status) query.where('status', status);
    if (role) query.where('role', role);

    const agents = await query
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .select() as Agent[];

    const agentsWithParsedData = agents.map(agent => ({
      ...agent,
      config: enrichAgentConfigFromWorkspace(agent.config ? JSON.parse(agent.config) : {})
    }));

    // Logic for task stats can be further abstracted, but for now we've
    // removed direct SQL from the route handler.
    const total = await query.count();

    return {
      agents: agentsWithParsedData,
      total,
    };
  }

  static async createAgent(workspaceId: number, body: any, actor: string, ipAddress: string) {
    const db = getDatabase();
    const {
      name,
      openclaw_id,
      role,
      session_key,
      soul_content,
      status = 'offline',
      config = {},
      template,
      gateway_config,
      write_to_gateway,
      provision_openclaw_workspace,
      openclaw_workspace_path
    } = body;

    const openclawId = (openclaw_id || name || 'agent')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let finalRole = role;
    let finalConfig: Record<string, any> = { ...config };
    if (template) {
      const tpl = getTemplate(template);
      if (tpl) {
        const builtConfig = buildAgentConfig(tpl, (gateway_config || {}) as any);
        finalConfig = { ...builtConfig, ...finalConfig };
        if (!finalRole) finalRole = tpl.config.identity?.theme || tpl.type;
      }
    } else if (gateway_config) {
      finalConfig = { ...finalConfig, ...(gateway_config as Record<string, any>) };
    }

    if (!name || !finalRole) throw new Error('Name and role are required');

    const existingAgent = db.prepare('SELECT id FROM agents WHERE name = ? AND workspace_id = ?').get(name, workspaceId);
    if (existingAgent) throw new Error('Agent name already exists');

    if (provision_openclaw_workspace) {
      if (!appConfig.openclawStateDir) throw new Error('OPENCLAW_STATE_DIR is not configured');
      const workspacePath = openclaw_workspace_path ? path.resolve(openclaw_workspace_path) : resolveWithin(appConfig.openclawStateDir, path.join('workspaces', openclawId));
      await runOpenClaw(['agents', 'add', openclawId, '--workspace', workspacePath, '--non-interactive'], { timeoutMs: 20000 });
    }

    const now = Math.floor(Date.now() / 1000);
    db.prepare(`INSERT INTO agents (name, role, session_key, soul_content, status, created_at, updated_at, config, workspace_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(name, finalRole, session_key, soul_content, status, now, now, JSON.stringify(finalConfig), workspaceId);

    const createdAgent = db.prepare('SELECT * FROM agents WHERE name = ? AND workspace_id = ?').get(name, workspaceId) as Agent;
    const parsedAgent = { ...createdAgent, config: JSON.parse(createdAgent.config || '{}'), taskStats: { total: 0, assigned: 0, in_progress: 0, quality_review: 0, done: 0, completed: 0 } };

    eventBus.broadcast('agent.created', parsedAgent);

    if (write_to_gateway && finalConfig) {
      await writeAgentToConfig({ id: openclawId, name, ...finalConfig });
      logAuditEvent({ action: 'agent_gateway_create', actor, target_type: 'agent', detail: { name, openclaw_id: openclawId }, ip_address: ipAddress });
    }

    return parsedAgent;
  }
}
