const Notification = require('../models/Notification');

/**
 * Get all notifications for a user
 * GET /api/v1/notifications
 */
exports.getNotifications = async (req, res) => {
  try {
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;
    const userId = req.userId || 'default-user';

    const query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const unreadCount = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch notifications'
      }
    });
  }
};

/**
 * Get unread notification count
 * GET /api/v1/notifications/unread-count
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId || 'default-user';
    
    const count = await Notification.countDocuments({ 
      userId, 
      isRead: false 
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch unread count'
      }
    });
  }
};

/**
 * Mark notification as read
 * PUT /api/v1/notifications/:id/read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'default-user';

    const notification = await Notification.findOne({ _id: id, userId });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to mark notification as read'
      }
    });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/v1/notifications/read-all
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId || 'default-user';

    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to mark all notifications as read'
      }
    });
  }
};

/**
 * Delete a notification
 * DELETE /api/v1/notifications/:id
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'default-user';

    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    res.json({
      success: true,
      data: { message: 'Notification deleted successfully' }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete notification'
      }
    });
  }
};

/**
 * Delete all notifications
 * DELETE /api/v1/notifications
 */
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.userId || 'default-user';

    const result = await Notification.deleteMany({ userId });

    res.json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete all notifications'
      }
    });
  }
};

/**
 * Create a notification (internal use or webhook)
 * POST /api/v1/notifications
 */
exports.createNotification = async (req, res) => {
  try {
    const { type, title, message, profileId, profileName, metadata, priority, actionUrl, expiresAt } = req.body;
    const userId = req.userId || 'default-user';

    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: type, title, message'
        }
      });
    }

    const notification = await Notification.createNotification({
      userId,
      type,
      title,
      message,
      profileId,
      profileName,
      metadata,
      priority,
      actionUrl,
      expiresAt
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create notification'
      }
    });
  }
};

