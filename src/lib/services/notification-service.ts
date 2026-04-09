import { getDatabase } from '../db/connection';
import { eventBus } from '../event-bus';
import { Notification } from '@/types/entities';

export class NotificationService {
  /**
   * Create notification for @mentions or assignments
   */
  static createNotification(
    recipient: string,
    type: string,
    title: string,
    message: string,
    source_type?: string,
    source_id?: number,
    workspaceId: number = 1
  ) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO notifications (recipient, type, title, message, source_type, source_id, workspace_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(recipient, type, title, message, source_type, source_id, workspaceId);

    const notificationPayload = {
      id: result.lastInsertRowid,
      recipient,
      type,
      title,
      message,
      source_type: source_type || null,
      source_id: source_id || null,
      created_at: Math.floor(Date.now() / 1000),
      workspace_id: workspaceId,
    };

    eventBus.broadcast('notification.created', notificationPayload);

    return result;
  }

  /**
   * Get unread notifications for recipient
   */
  static getUnreadNotifications(recipient: string, workspaceId: number = 1): Notification[] {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM notifications
      WHERE recipient = ? AND read_at IS NULL AND workspace_id = ?
      ORDER BY created_at DESC
    `);

    return stmt.all(recipient, workspaceId) as Notification[];
  }

  /**
   * Mark notification as read
   */
  static markNotificationRead(notificationId: number, workspaceId: number = 1) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE notifications
      SET read_at = ?
      WHERE id = ? AND workspace_id = ?
    `);

    stmt.run(Math.floor(Date.now() / 1000), notificationId, workspaceId);
  }
}
