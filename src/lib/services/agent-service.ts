import { getDatabase, Agent, db_helpers, logAuditEvent } from '@/lib/db';
import { eventBus } from '@/lib/event-bus';
import { getTemplate, buildAgentConfig } from '@/lib/agent-templates';
import { writeAgentToConfig } from '@/lib/agent-sync';
import { logger } from '@/lib/logger';
import { runOpenClaw } from '@/lib/command';
import { config as appConfig } from '@/lib/config';
import { resolveWithin } from '@/lib/paths';
import path from 'node:path';

export class AgentService {
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

    if (!name || !finalRole) {
      throw new Error('Name and role are required');
    }

    const existingAgent = db
      .prepare('SELECT id FROM agents WHERE name = ? AND workspace_id = ?')
      .get(name, workspaceId);
    if (existingAgent) {
      throw new Error('Agent name already exists');
    }

    if (provision_openclaw_workspace) {
      if (!appConfig.openclawStateDir) {
        throw new Error('OPENCLAW_STATE_DIR is not configured; cannot provision OpenClaw workspace');
      }

      const workspacePath = openclaw_workspace_path
        ? path.resolve(openclaw_workspace_path)
        : resolveWithin(appConfig.openclawStateDir, path.join('workspaces', openclawId));

      await runOpenClaw(
        ['agents', 'add', openclawId, '--workspace', workspacePath, '--non-interactive'],
        { timeoutMs: 20000 }
      );
    }

    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(\`
      INSERT INTO agents (
        name, role, session_key, soul_content, status,
        created_at, updated_at, config, workspace_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    \`);

    const dbResult = stmt.run(
      name,
      finalRole,
      session_key,
      soul_content,
      status,
      now,
      now,
      JSON.stringify(finalConfig),
      workspaceId
    );

    const agentId = dbResult.lastInsertRowid as number;

    db_helpers.logActivity(
      'agent_created',
      'agent',
      agentId,
      actor,
      \`Created agent: \${name} (\${finalRole})\${template ? \` from template: \${template}\` : ''}\`,
      { name, role: finalRole, status, session_key, template: template || null },
      workspaceId
    );

    const createdAgent = db
      .prepare('SELECT * FROM agents WHERE id = ? AND workspace_id = ?')
      .get(agentId, workspaceId) as Agent;

    const parsedAgent = {
      ...createdAgent,
      config: JSON.parse(createdAgent.config || '{}'),
      taskStats: { total: 0, assigned: 0, in_progress: 0, quality_review: 0, done: 0, completed: 0 }
    };

    eventBus.broadcast('agent.created', parsedAgent);

    if (write_to_gateway && finalConfig) {
      await writeAgentToConfig({
        id: openclawId,
        name,
        ...(finalConfig.model && { model: finalConfig.model }),
        ...(finalConfig.identity && { identity: finalConfig.identity }),
        ...(finalConfig.sandbox && { sandbox: finalConfig.sandbox }),
        ...(finalConfig.tools && { tools: finalConfig.tools }),
        ...(finalConfig.subagents && { subagents: finalConfig.subagents }),
        ...(finalConfig.memorySearch && { memorySearch: finalConfig.memorySearch }),
      });

      logAuditEvent({
        action: 'agent_gateway_create',
        actor,
        target_type: 'agent',
        target_id: agentId as number,
        detail: { name, openclaw_id: openclawId, template: template || null },
        ip_address: ipAddress,
      });
    }

    return parsedAgent;
  }
}
