import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { mutationLimiter } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { validateBody, createAgentSchema } from '@/lib/validation';
import { AgentService } from '@/lib/services/agent-service';

/**
 * GET /api/agents - List all agents with optional filtering (Service Layer)
 */
export async function GET(request: NextRequest) {
  const auth = requireRole(request, 'viewer')
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = auth.user.workspace_id ?? 1;
    
    const filters = {
      status: searchParams.get('status'),
      role: searchParams.get('role'),
      showHidden: searchParams.get('show_hidden') === 'true',
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 200),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const { agents, total } = await AgentService.getAgents(workspaceId, filters);

    return NextResponse.json({
      agents,
      total,
      page: Math.floor(filters.offset / filters.limit) + 1,
      limit: filters.limit
    });
  } catch (error) {
    logger.error({ err: error }, 'GET /api/agents error');
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

/**
 * POST /api/agents - Create a new agent (Service Layer)
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
