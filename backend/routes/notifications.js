import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Persistent in-memory notification registry for high-fidelity fallback when MongoDB is offline
export const MOCK_NOTIFICATIONS = [];

// @desc    Get latest 50 notifications, populated with order, and unreadCount
// @route   GET /api/notifications
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      const sortedMock = [...MOCK_NOTIFICATIONS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
      return res.json({
        notifications: sortedMock.slice(0, 50),
        unreadCount
      });
    }

    const notifications = await Notification.find({})
      .populate('order', 'orderNumber totalPrice isPaid paymentResult')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ isRead: false });

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Mark one notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Admin
router.put('/:id/read', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      const notif = MOCK_NOTIFICATIONS.find(n => n._id === req.params.id);
      if (!notif) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      notif.isRead = true;
      return res.json({ success: true, notification: notif });
    }

    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notif.isRead = true;
    await notif.save();

    res.json({ success: true, notification: notif });
  } catch (err) {
    next(err);
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private/Admin
router.put('/read-all', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      MOCK_NOTIFICATIONS.forEach(n => {
        n.isRead = true;
      });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    await Notification.updateMany({ isRead: false }, { isRead: true });

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      const index = MOCK_NOTIFICATIONS.findIndex(n => n._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      MOCK_NOTIFICATIONS.splice(index, 1);
      return res.json({ success: true, message: 'Notification deleted successfully' });
    }

    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notif.deleteOne();

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
