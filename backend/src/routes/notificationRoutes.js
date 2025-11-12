const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get all notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all as read
router.put('/read-all', notificationController.markAllAsRead);

// Mark single notification as read
router.put('/:id/read', notificationController.markAsRead);

// Delete all notifications
router.delete('/', notificationController.deleteAllNotifications);

// Delete single notification
router.delete('/:id', notificationController.deleteNotification);

// Create notification (for internal use or webhooks)
router.post('/', notificationController.createNotification);

module.exports = router;

