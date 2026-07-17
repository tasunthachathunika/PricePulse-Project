const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET user notifications
router.get('/', notificationController.getNotifications);

// POST new notification (Admin)
router.post('/', notificationController.createNotification);

// PUT mark as read
router.put('/:id/read', notificationController.markAsRead);

// DELETE notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
