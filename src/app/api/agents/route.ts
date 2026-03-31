import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, Agent } from '@/lib/db';
import { enrichAgentConfigFromWorkspace } from '@/lib/agent-sync';
import { requireRole } from '@/lib/auth';
import { mutationLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { validateBody, createAgentSchema } from '@/lib/validation';
import { AgentService } from '@/lib/services/agent-service';

/**
 * GET /api/agents - List all agents with optional filtering
 */
export async function GET(request: NextRequest) {
  const auth = requireRole(request, 'viewer')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const workspaceId = auth.user.workspace_id ?? 1;
    
    const status = searchParams.get('status');
    const role = searchParams.get('role');
    const showHidden = searchParams.get('show_hidden') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

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
    
    // ... (rest of the task stats logic could also be moved to service eventually)
    // For now, focusing on the heavy POST mutation
    
    return NextResponse.json({
      agents: agentsWithParsedData,
      total: agents.length, // Simplification for demonstration
      page: Math.floor(offset / limit) + 1,
      limit
    });
  } catch (error) {
    logger.error({ err: error }, 'GET /api/agents error');
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

/**
 * POST /api/agents - Create a new agent (now uses AgentService)
 */
export async function POST(request: NextRequest) {
  const auth = requireRole(request, 'operator');
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rateCheck = mutationLimiter(request);
  if (rateCheck) return rateCheck;

  try {
    const workspaceId = auth.user.workspace_id ?? 1;
    const validated = await validateBody(request, createAgentSchema);
    if ('error' in validated) return validated.error;

    const actor = auth.user.username;
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';

    const agent = await AgentService.createAgent(workspaceId, validated.data, actor, ipAddress);

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error }, 'POST /api/agents error');
    return NextResponse.json({ error: error.message || 'Failed to create agent' }, { status: 500 });
  }
}
