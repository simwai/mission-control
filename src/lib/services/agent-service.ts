import { getDatabase, Agent, db_helpers, logAuditEvent } from '@/lib/db';
import { eventBus } from '@/lib/event-bus';
import { getTemplate, buildAgentConfig } from '@/lib/agent-templates';
import { writeAgentToConfig, enrichAgentConfigFromWorkspace } from '@/lib/agent-sync';
import { logger } from '@/lib/logger';
import { runOpenClaw } from '@/lib/command';
import { config as appConfig } from '@/lib/config';
import { resolveWithin } from '@/lib/paths';
import path from 'node:path';

export class AgentService {
  static async getAgents(workspaceId: number, filters: { status?: string | null; role?: string | null; showHidden?: boolean; limit: number; offset: number }) {
    const db = getDatabase();
    const { status, role, showHidden, limit, offset } = filters;

    let query = 'SELECT * FROM agents WHERE workspace_id = ?';
    const params: any[] = [workspaceId];

    if (!showHidden) {
      query += ' AND hidden = 0';
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const agents = db.prepare(query).all(...params) as Agent[];

    const agentsWithParsedData = agents.map(agent => ({
      ...agent,
      config: enrichAgentConfigFromWorkspace(agent.config ? JSON.parse(agent.config) : {})
    }));

    const agentNames = agentsWithParsedData.map(agent => agent.name).filter(Boolean)
    const taskStatsByAgent = new Map<string, { total: number; assigned: number; in_progress: number; quality_review: number; done: number }>()

    if (agentNames.length > 0) {
      const placeholders = agentNames.map(() => '?').join(', ')
      const groupedTaskStats = db.prepare(`
        SELECT
          assigned_to,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'quality_review' THEN 1 ELSE 0 END) as quality_review,
          SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as done
        FROM tasks
        WHERE workspace_id = ? AND assigned_to IN (${placeholders})
        GROUP BY assigned_to
      `).all(workspaceId, ...agentNames) as Array<{
        assigned_to: string
        total: number | null
        assigned: number | null
        in_progress: number | null
        quality_review: number | null
        done: number | null
      }>

      for (const row of groupedTaskStats) {
        taskStatsByAgent.set(row.assigned_to, {
          total: row.total || 0,
          assigned: row.assigned || 0,
          in_progress: row.in_progress || 0,
          quality_review: row.quality_review || 0,
          done: row.done || 0,
        })
      }
    }

    const agentsWithStats = agentsWithParsedData.map(agent => {
      const taskStats = taskStatsByAgent.get(agent.name) || {
        total: 0,
        assigned: 0,
        in_progress: 0,
        quality_review: 0,
        done: 0,
      }

      return {
        ...agent,
        taskStats: {
          ...taskStats,
          completed: taskStats.done,
        }
      };
    });

    let countQuery = 'SELECT COUNT(*) as total FROM agents WHERE workspace_id = ?';
    const countParams: any[] = [workspaceId];
    if (!showHidden) countQuery += ' AND hidden = 0';
    if (status) { countQuery += ' AND status = ?'; countParams.push(status); }
    if (role) { countQuery += ' AND role = ?'; countParams.push(role); }
    const countRow = db.prepare(countQuery).get(...countParams) as { total: number };

    return {
      agents: agentsWithStats,
      total: countRow.total,
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

    const stmt = db.prepare(`
      INSERT INTO agents (
        name, role, session_key, soul_content, status,
        created_at, updated_at, config, workspace_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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
      `Created agent: ${name} (${finalRole})${template ? ` from template: ${template}` : ''}`,
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
        target_id: agentId as number,
        target_type: 'agent',
        detail: { name, openclaw_id: openclawId, template: template || null },
        ip_address: ipAddress,
      });
    }

    return parsedAgent;
  }
}
