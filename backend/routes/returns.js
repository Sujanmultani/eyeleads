import express from 'express';
import ReturnRequest from '../models/ReturnRequest.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { logActivity } from '../middleware/auditLogger.js';
import { sendEmail } from '../utils/sendEmail.js';
import { MOCK_ORDERS } from './orders.js';
import { MOCK_NOTIFICATIONS } from './notifications.js';

const router = express.Router();
const RETURN_WINDOW_DAYS = 7;

// Persistent in-memory return requests registry for Mock Mode
export const MOCK_RETURNS = [];

// @desc    Submit a return/exchange request for a delivered order
// @route   POST /api/returns
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { orderId, reason, description, photos, resolutionRequested } = req.body;

    if (!reason || !description || !resolutionRequested) {
      res.status(400);
      throw new Error('Please provide reason, description, and resolution requested.');
    }

    // ─── 1. MOCK MODE FALLBACK ─────────────────────────────────────
    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(o => o._id === orderId);
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      const isOwner = order.user && (
        (typeof order.user === 'string' && order.user === req.user._id.toString()) ||
        (order.user._id && order.user._id.toString() === req.user._id.toString())
      );
      if (!isOwner) {
        return res.status(403).json({ message: 'Not authorized for this order.' });
      }

      if (!order.isDelivered) {
        return res.status(400).json({ message: 'Returns can only be requested for delivered orders.' });
      }

      const deliveredAtTime = order.deliveredAt ? new Date(order.deliveredAt).getTime() : Date.now();
      const daysSinceDelivery = (Date.now() - deliveredAtTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
        return res.status(400).json({
          message: `The ${RETURN_WINDOW_DAYS}-day return window for this order has passed. Please contact support directly for help.`
        });
      }

      const existing = MOCK_RETURNS.find(r => 
        (r.order === orderId || (r.order && r.order._id === orderId)) && 
        !['Rejected', 'Completed'].includes(r.status)
      );
      if (existing) {
        return res.status(400).json({ message: 'A return request is already in progress for this order.' });
      }

      const returnRequest = {
        _id: `mock-return-${Date.now()}`,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          paymentResult: order.paymentResult,
          isPaid: order.isPaid
        },
        user: req.user._id,
        reason,
        description,
        photos: photos || [],
        resolutionRequested,
        status: 'Requested',
        adminNote: '',
        replacementTrackingNumber: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MOCK_RETURNS.push(returnRequest);

      await logActivity(
        req.user.email || req.user._id.toString(),
        'RETURN_REQUESTED',
        'ReturnRequest',
        `Return requested for order ${order.orderNumber} (Mock Mode). Reason: ${reason}. Wants: ${resolutionRequested}.`,
        req.ip
      );

      // Add mock in-app notification
      MOCK_NOTIFICATIONS.unshift({
        _id: `mock-notif-${Date.now()}`,
        type: 'return_requested',
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          paymentResult: order.paymentResult,
          isPaid: order.isPaid
        },
        message: `New return request for order ${order.orderNumber} — ${reason} (wants ${resolutionRequested}).`,
        isRead: false,
        createdAt: new Date()
      });

      // Email Dispatch Simulation
      sendEmail({
        to: order.shippingAddress?.email || req.user.email || 'customer@example.com',
        subject: `We've received your return request for order ${order.orderNumber}`,
        html: `<p>Hi ${order.shippingAddress?.name || req.user.name || 'Valued Customer'},</p><p>We've received your return request and will review it shortly. We'll email you once it's approved.</p>`
      });

      if (process.env.ADMIN_NOTIFICATION_EMAIL) {
        sendEmail({
          to: process.env.ADMIN_NOTIFICATION_EMAIL,
          subject: `New Return Request: ${order.orderNumber}`,
          html: `<p>Order <strong>${order.orderNumber}</strong> — customer reports: <strong>${reason}</strong>.</p>
                 <p>Requested resolution: <strong>${resolutionRequested}</strong></p>
                 <p>Description: ${description}</p>
                 <p>Photos: ${(photos || []).map(p => `<a href="${p}">${p}</a>`).join('<br/>') || 'none uploaded'}</p>`
        });
      }

      return res.status(201).json(returnRequest);
    }

    // ─── 2. MONGODB MODE ──────────────────────────────────────────
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this order.' });
    }

    if (!order.isDelivered) {
      return res.status(400).json({ message: 'Returns can only be requested for delivered orders.' });
    }

    const daysSinceDelivery = (Date.now() - order.deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > RETURN_WINDOW_DAYS) {
      return res.status(400).json({
        message: `The ${RETURN_WINDOW_DAYS}-day return window for this order has passed. Please contact support directly for help.`
      });
    }

    const existing = await ReturnRequest.findOne({ 
      order: orderId, 
      status: { $nin: ['Rejected', 'Completed'] } 
    });
    if (existing) {
      return res.status(400).json({ message: 'A return request is already in progress for this order.' });
    }

    const returnRequest = await ReturnRequest.create({
      order: orderId,
      user: req.user._id,
      reason,
      description,
      photos: photos || [],
      resolutionRequested
    });

    await logActivity(
      req.user.email || req.user._id.toString(),
      'RETURN_REQUESTED',
      'ReturnRequest',
      `Return requested for order ${order.orderNumber}. Reason: ${reason}. Wants: ${resolutionRequested}.`,
      req.ip
    );

    await Notification.create({
      type: 'return_requested',
      order: order._id,
      message: `New return request for order ${order.orderNumber} — ${reason} (wants ${resolutionRequested}).`
    });

    sendEmail({
      to: order.shippingAddress.email,
      subject: `We've received your return request for order ${order.orderNumber}`,
      html: `<p>Hi ${order.shippingAddress.name},</p><p>We've received your return request and will review it shortly. We'll email you once it's approved.</p>`
    });

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `New Return Request: ${order.orderNumber}`,
        html: `<p>Order <strong>${order.orderNumber}</strong> — customer reports: <strong>${reason}</strong>.</p>
               <p>Requested resolution: <strong>${resolutionRequested}</strong></p>
               <p>Description: ${description}</p>
               <p>Photos: ${(photos || []).map(p => `<a href="${p}">${p}</a>`).join('<br/>') || 'none uploaded'}</p>`
      });
    }

    res.status(201).json(returnRequest);
  } catch (err) {
    next(err);
  }
});

// @desc    Get the current user's own return requests
// @route   GET /api/returns/my
// @access  Private
router.get('/my', protect, async (req, res, next) => {
  try {
    // Mock Mode
    if (process.env.DB_CONNECTED !== 'true') {
      const requests = MOCK_RETURNS
        .filter(r => r.user.toString() === req.user._id.toString())
        .sort((a, b) => b.createdAt - a.createdAt);
      return res.json(requests);
    }

    // DB Mode
    const requests = await ReturnRequest.find({ user: req.user._id })
      .populate('order', 'orderNumber totalPrice paymentResult isPaid')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { 
    next(err); 
  }
});

// @desc    Get all return requests (admin)
// @route   GET /api/returns
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const statusFilter = req.query.status;

    // Mock Mode
    if (process.env.DB_CONNECTED !== 'true') {
      let requests = [...MOCK_RETURNS];
      if (statusFilter) {
        requests = requests.filter(r => r.status === statusFilter);
      }
      // Populate user info mock
      requests = requests.map(r => ({
        ...r,
        user: { name: 'Store customer', email: 'customer@gmail.com' }
      }));
      return res.json(requests.sort((a, b) => b.createdAt - a.createdAt));
    }

    // DB Mode
    const filter = statusFilter ? { status: statusFilter } : {};
    const requests = await ReturnRequest.find(filter)
      .populate('order')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) { 
    next(err); 
  }
});

// @desc    Update a return request's status (admin)
// @route   PUT /api/returns/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, adminNote, replacementTrackingNumber } = req.body;

    if (!status) {
      res.status(400);
      throw new Error('Please provide a status.');
    }

    // Mock Mode
    if (process.env.DB_CONNECTED !== 'true') {
      const returnRequest = MOCK_RETURNS.find(r => r._id === req.params.id);
      if (!returnRequest) return res.status(404).json({ message: 'Return request not found.' });

      returnRequest.status = status;
      if (adminNote !== undefined) returnRequest.adminNote = adminNote;
      if (replacementTrackingNumber !== undefined) returnRequest.replacementTrackingNumber = replacementTrackingNumber;
      returnRequest.updatedAt = new Date();

      await logActivity(
        req.user.email || req.user._id.toString(),
        'RETURN_STATUS_UPDATED',
        'ReturnRequest',
        `Return request for order ${returnRequest.order?.orderNumber || 'mock'} set to ${status} (Mock Mode).`,
        req.ip
      );

      const statusEmailCopy = {
        'Approved': `Good news — your return request for order ${returnRequest.order?.orderNumber} has been approved. We'll follow up shortly with next steps.`,
        'Rejected': `Your return request for order ${returnRequest.order?.orderNumber} could not be approved. ${adminNote || ''}`,
        'Replacement Shipped': `A replacement for your order ${returnRequest.order?.orderNumber} has been shipped.${replacementTrackingNumber ? ' Tracking: ' + replacementTrackingNumber : ''}`,
        'Refund Completed': `Your refund for order ${returnRequest.order?.orderNumber} has been processed.`,
        'Completed': `Your return request for order ${returnRequest.order?.orderNumber} is now complete. Thank you for your patience.`
      };

      const customerEmail = 'customer@gmail.com'; // Mock email fallback
      if (statusEmailCopy[status]) {
        sendEmail({
          to: customerEmail,
          subject: `Update on your return request — order ${returnRequest.order?.orderNumber || 'mock'}`,
          html: `<p>${statusEmailCopy[status]}</p>`
        });
      }

      const notifIndex = MOCK_NOTIFICATIONS.findIndex(n => n.order?._id === returnRequest.order?._id && n.type === 'return_requested');
      if (notifIndex !== -1) MOCK_NOTIFICATIONS.splice(notifIndex, 1);

      return res.json(returnRequest);
    }

    // DB Mode
    const returnRequest = await ReturnRequest.findById(req.params.id).populate('order');
    if (!returnRequest) return res.status(404).json({ message: 'Return request not found.' });

    returnRequest.status = status;
    if (adminNote !== undefined) returnRequest.adminNote = adminNote;
    if (replacementTrackingNumber !== undefined) returnRequest.replacementTrackingNumber = replacementTrackingNumber;
    await returnRequest.save();

    if (status === 'Approved') {
      if (returnRequest.resolutionRequested === 'Refund' || returnRequest.resolutionRequested === 'Replacement') {
        const relatedOrder = await Order.findById(returnRequest.order._id);
        if (relatedOrder && !relatedOrder.isInternational) {
          try {
            const { createReversePickup } = await import('../services/shiprocketService.js');
            const { shiprocketOrderId, shipmentId, awbCode, labelUrl, trackingUrl } = await createReversePickup(relatedOrder, returnRequest);
            relatedOrder.reversePickup.shiprocketOrderId = shiprocketOrderId;
            relatedOrder.reversePickup.shipmentId = shipmentId;
            relatedOrder.reversePickup.awbCode = awbCode;
            relatedOrder.reversePickup.labelUrl = labelUrl;
            relatedOrder.reversePickup.trackingUrl = trackingUrl;
            relatedOrder.reversePickup.status = awbCode ? 'Scheduled' : 'Failed';
            await relatedOrder.save();
          } catch (err) {
            console.error('[Shiprocket] Reverse pickup creation failed:', err.message);
          }
        }
        // International orders: no automatic pickup — admin uses the manual
        // reverse-pickup entry route below after arranging it with the courier.
      }
    }

    await logActivity(
      req.user.email || req.user._id.toString(),
      'RETURN_STATUS_UPDATED',
      'ReturnRequest',
      `Return request for order ${returnRequest.order.orderNumber} set to ${status}.`,
      req.ip
    );

    const statusEmailCopy = {
      'Approved': `Good news — your return request for order ${returnRequest.order.orderNumber} has been approved. We'll follow up shortly with next steps.`,
      'Rejected': `Your return request for order ${returnRequest.order.orderNumber} could not be approved. ${adminNote || ''}`,
      'Replacement Shipped': `A replacement for your order ${returnRequest.order.orderNumber} has been shipped.${replacementTrackingNumber ? ' Tracking: ' + replacementTrackingNumber : ''}`,
      'Refund Completed': `Your refund for order ${returnRequest.order.orderNumber} has been processed.`,
      'Completed': `Your return request for order ${returnRequest.order.orderNumber} is now complete. Thank you for your patience.`
    };

    if (statusEmailCopy[status]) {
      sendEmail({
        to: returnRequest.order.shippingAddress.email,
        subject: `Update on your return request — order ${returnRequest.order.orderNumber}`,
        html: `<p>${statusEmailCopy[status]}</p>`
      });
    }

    await Notification.deleteMany({ order: returnRequest.order._id, type: 'return_requested' });

    res.json(returnRequest);
  } catch (err) { 
    next(err); 
  }
});

// @desc    Admin manually enters reverse pickup details for an international
//          order's return (no Shiprocket automation for international).
// @route   PUT /api/returns/:id/manual-reverse-pickup
// @access  Private/Admin
router.put('/:id/manual-reverse-pickup', protect, adminOnly, async (req, res, next) => {
  const { courierName, awbCode, trackingUrl } = req.body;

  try {
    if (!courierName || !awbCode) {
      res.status(400);
      throw new Error('courierName and awbCode are required.');
    }

    const returnRequest = await ReturnRequest.findById(req.params.id).populate('order');
    if (!returnRequest) {
      res.status(404);
      throw new Error('Return request not found.');
    }

    const relatedOrder = await Order.findById(returnRequest.order._id);
    if (!relatedOrder) {
      res.status(404);
      throw new Error('Related order not found.');
    }
    if (!relatedOrder.isInternational) {
      res.status(400);
      throw new Error('This is a domestic order — reverse pickup is handled automatically via Shiprocket.');
    }

    relatedOrder.manualReversePickup.courierName = courierName;
    relatedOrder.manualReversePickup.awbCode = awbCode;
    relatedOrder.manualReversePickup.trackingUrl = trackingUrl || null;
    relatedOrder.manualReversePickup.scheduledAt = new Date();
    await relatedOrder.save();

    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'RETURN_MANUAL_PICKUP',
      'Fulfillment Desk',
      `Manually scheduled return pickup for international order ${relatedOrder.orderNumber} via ${courierName} (AWB ${awbCode})`,
      req.ip
    );

    res.json({ status: 'success', order: relatedOrder });
  } catch (error) {
    next(error);
  }
});

export default router;
