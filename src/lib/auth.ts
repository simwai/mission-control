/**
 * Auth Shell
 * Forwards to modular services while maintaining backward compatibility.
 */
import { AuthService } from './auth-service';
import { parseMcSessionCookieHeader } from './session-cookie';
import { createHash } from 'crypto';

export * from './auth-service';

export async function getUserFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = parseMcSessionCookieHeader(cookieHeader);

  if (token) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return await AuthService.validateSession(tokenHash);
  }

  return null;
}

// ... other wrapper functions ported from legacy-auth-reference ...
