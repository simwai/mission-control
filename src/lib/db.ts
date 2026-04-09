/**
 * Main DB Barrel Module
 * Forwards to modular services while maintaining backward compatibility.
 */
export * from './db/connection';
import { getDatabase } from './db/connection';
import { runMigrations } from './migrations';
import { logger } from './logger';
import { ActivityService } from './services/activity-service';
import { NotificationService } from './services/notification-service';

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const isTestMode = process.env.MISSION_CONTROL_TEST_MODE === '1'

let webhookListenerInitialized = false;

export function initializeDatabase() {
  const db = getDatabase();
  if (typeof window === 'undefined' && !isBuildPhase) {
    try {
      runMigrations(db);
      // seedAdminUserFromEnv(db); // Ported logic in reference

      if (!webhookListenerInitialized) {
        webhookListenerInitialized = true;
        import('./webhooks').then(({ initWebhookListener }) => {
          initWebhookListener();
        }).catch(() => {});

        if (!isBuildPhase && !isTestMode) {
          import('./scheduler').then(({ initScheduler }) => {
            initScheduler();
          }).catch(() => {});
        }
      }
      logger.info('Database initialized successfully');
    } catch (error) {
      logger.error({ err: error }, 'Failed to initialize database');
      throw error;
    }
  }
}

// Backward compatible db_helpers forwarding to new services
export const db_helpers = {
  logActivity: ActivityService.logActivity,
  createNotification: NotificationService.createNotification,
  getRecentActivities: ActivityService.getRecentActivities,
  getUnreadNotifications: NotificationService.getUnreadNotifications,
  markNotificationRead: NotificationService.markNotificationRead,

  ensureTaskSubscription: (taskId: number, agentName: string, workspaceId: number = 1) => {
    if (!agentName) return;
    const db = getDatabase();
    db.prepare(`INSERT OR IGNORE INTO task_subscriptions (task_id, agent_name) SELECT t.id, ? FROM tasks t WHERE t.id = ? AND t.workspace_id = ?`).run(agentName, taskId, workspaceId);
  }
};

export function needsFirstTimeSetup(): boolean {
  try { return (getDatabase().prepare('SELECT COUNT(*) as count FROM users').get() as any).count === 0 } catch { return false }
}

if (typeof window === 'undefined' && !isBuildPhase) {
  initializeDatabase();
}
