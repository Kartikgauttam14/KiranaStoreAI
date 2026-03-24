import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  getNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../controllers/notification.controller';

const router = Router();

// GET /api/notifications - Get notifications for the current user
router.get('/', authenticate, getNotifications);

// GET /api/notifications/stats - Get unread notification count
router.get('/stats', authenticate, getNotificationStats);

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', authenticate, markAllNotificationsAsRead);

// PATCH /api/notifications/:notificationId/read - Mark as read
router.patch('/:notificationId/read', authenticate, markNotificationAsRead);

// DELETE /api/notifications/:notificationId - Delete notification
router.delete('/:notificationId', authenticate, deleteNotification);

// DELETE /api/notifications - Delete all notifications
router.delete('/', authenticate, deleteAllNotifications);

export default router;
