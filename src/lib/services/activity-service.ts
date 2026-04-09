import { getDatabase } from '../db/connection';
import { eventBus } from '../event-bus';
import { Activity } from '@/types/entities';

export class ActivityService {
  /**
   * Log an activity to the activity stream
   */
  static logActivity(
    type: string,
    entity_type: string,
    entity_id: number,
    actor: string,
    description: string,
    data?: any,
    workspaceId: number = 1
  ) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO activities (type, entity_type, entity_id, actor, description, data, workspace_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      type,
      entity_type,
      entity_id,
      actor,
      description,
      data ? JSON.stringify(data) : null,
      workspaceId
    );

    const activityPayload = {
      id: result.lastInsertRowid,
      type,
      entity_type,
      entity_id,
      actor,
      description,
      data: data || null,
      created_at: Math.floor(Date.now() / 1000),
      workspace_id: workspaceId,
    };

    eventBus.broadcast('activity.created', activityPayload);
  }

  /**
   * Get recent activities for feed
   */
  static getRecentActivities(limit: number = 50): Activity[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM activities
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(limit) as Activity[];
  }
}
