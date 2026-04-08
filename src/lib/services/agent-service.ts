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
   * Fetches agents with filtering and task statistics.
   * Uses DBService for a clean, reusable query interface.
   */
  static async getAgents(
    workspaceId: number,
    filters: {
      status?: string | null;
      role?: string | null;
      showHidden?: boolean;
      limit: number;
      offset: number
    }
  ) {
    const { status, role, showHidden, limit, offset } = filters;

    const query = DBService.table('agents').where('workspace_id', workspaceId);

    if (!showHidden) {
      query.where('hidden', 0);
    }

    if (status) {
      query.where('status', status);
    }

    if (role) {
      query.where('role', role);
    }

    const agents = await query
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .select() as Agent[];

    const agentsWithParsedData = agents.map(agent => ({
      ...agent,
      config: enrichAgentConfigFromWorkspace(agent.config ? JSON.parse(agent.config) : {})
    }));

    // Task statistics aggregation
    const agentNames = agentsWithParsedData.map(agent => agent.name).filter(Boolean);
    const taskStatsByAgent = new Map<string, any>();

    if (agentNames.length > 0) {
      // In a real implementation, DBService would support GROUP BY and complex aggregations.
      // For this refactor, we maintain the logic in the service layer.
      const db = getDatabase();
      const placeholders = agentNames.map(() => '?').join(', ');
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
      `).all(workspaceId, ...agentNames) as any[];

      for (const row of groupedTaskStats) {
        taskStatsByAgent.set(row.assigned_to, {
          total: row.total || 0,
          assigned: row.assigned || 0,
          in_progress: row.in_progress || 0,
          quality_review: row.quality_review || 0,
          done: row.done || 0,
        });
      }
    }

    const agentsWithStats = agentsWithParsedData.map(agent => {
      const taskStats = taskStatsByAgent.get(agent.name) || {
        total: 0,
        assigned: 0,
        in_progress: 0,
        quality_review: 0,
        done: 0,
      };

      return {
        ...agent,
        taskStats: {
          ...taskStats,
          completed: taskStats.done,
        }
      };
    });

    const totalCount = await query.count();

    return {
      agents: agentsWithStats,
      total: totalCount,
    };
  }

  /**
   * Creates a new agent and handles workspace provisioning and gateway synchronization.
   */
  static async createAgent(
    workspaceId: number,
    agentData: any,
    actorUsername: string,
    clientIpAddress: string
  ) {
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
    } = agentData;

    const openclawId = (openclaw_id || name || 'agent')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Template resolution logic
    let finalRole = role;
    let finalConfig: Record<string, any> = { ...config };

    if (template) {
      const agentTemplate = getTemplate(template);
      if (agentTemplate) {
        const builtConfig = buildAgentConfig(agentTemplate, (gateway_config || {}) as any);
        finalConfig = { ...builtConfig, ...finalConfig };
        if (!finalRole) {
          finalRole = agentTemplate.config.identity?.theme || agentTemplate.type;
        }
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

    // OpenClaw workspace provisioning
    if (provision_openclaw_workspace) {
      if (!appConfig.openclawStateDir) {
        throw new Error('OPENCLAW_STATE_DIR is not configured; cannot provision OpenClaw workspace');
      }

      const workspacePath = openclaw_workspace_path
        ? path.resolve(openclaw_workspace_path)
        : resolveWithin(appConfig.openclawStateDir, path.join('workspaces', openclawId));

      try {
        await runOpenClaw(
          ['agents', 'add', openclawId, '--workspace', workspacePath, '--non-interactive'],
          { timeoutMs: 20000 }
        );
      } catch (provisioningError: any) {
        throw new Error(`Failed to provision OpenClaw agent workspace: ${provisioningError.message}`);
      }
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const insertStatement = db.prepare(`
      INSERT INTO agents (
        name, role, session_key, soul_content, status,
        created_at, updated_at, config, workspace_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const executionResult = insertStatement.run(
      name,
      finalRole,
      session_key,
      soul_content,
      status,
      timestamp,
      timestamp,
      JSON.stringify(finalConfig),
      workspaceId
    );

    const newAgentId = executionResult.lastInsertRowid as number;

    // Log the activity
    db_helpers.logActivity(
      'agent_created',
      'agent',
      newAgentId,
      actorUsername,
      `Created agent: ${name} (${finalRole})${template ? ` from template: ${template}` : ''}`,
      {
        name,
        role: finalRole,
        status,
        session_key,
        template: template || null
      },
      workspaceId
    );

    const createdAgent = db
      .prepare('SELECT * FROM agents WHERE id = ? AND workspace_id = ?')
      .get(newAgentId, workspaceId) as Agent;

    const parsedAgent = {
      ...createdAgent,
      config: JSON.parse(createdAgent.config || '{}'),
      taskStats: { total: 0, assigned: 0, in_progress: 0, quality_review: 0, done: 0, completed: 0 }
    };

    // Notify clients
    eventBus.broadcast('agent.created', parsedAgent);

    // Sync with gateway if requested
    if (write_to_gateway && finalConfig) {
      try {
        await writeAgentToConfig({
          id: openclawId,
          name,
          ...finalConfig
        });

        logAuditEvent({
          action: 'agent_gateway_create',
          actor: actorUsername,
          target_type: 'agent',
          target_id: newAgentId,
          detail: { name, openclaw_id: openclawId, template: template || null },
          ip_address: clientIpAddress,
        });
      } catch (gatewaySyncError: any) {
        console.warn(`Agent created in MC but gateway synchronization failed: ${gatewaySyncError.message}`);
      }
    }

    return parsedAgent;
  }
}
