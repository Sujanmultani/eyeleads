import express from 'express';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { logActivity } from '../middleware/auditLogger.js';

const router = express.Router();

// Persistent in-memory registry for Mock Mode (DB_CONNECTED !== 'true')
export const MOCK_PRESCRIPTIONS = [];

const RX_FIELDS = [
  'rightSph', 'rightCyl', 'rightAxis', 'rightAdd', 'rightPrism',
  'leftSph', 'leftCyl', 'leftAxis', 'leftAdd', 'leftPrism',
  'pd', 'prescriptionDate', 'doctorName', 'rxFileUrl', 'notes'
];

// @desc    Get logged-in user's own prescription profile
// @route   GET /api/prescriptions/my
// @access  Private
router.get('/my', protect, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      const rx = MOCK_PRESCRIPTIONS.find(p => p.user === req.user._id.toString() || p.user === req.user._id);
      return res.json({ success: true, prescription: rx || null });
    }

    const rx = await Prescription.findOne({ user: req.user._id });
    res.json({ success: true, prescription: rx || null });
  } catch (err) {
    next(err);
  }
});

// @desc    Create or update logged-in user's own prescription profile
// @route   PUT /api/prescriptions/my
// @access  Private
router.put('/my', protect, async (req, res, next) => {
  try {
    const payload = {};
    RX_FIELDS.forEach(f => {
      if (req.body[f] !== undefined) payload[f] = req.body[f];
    });
    payload.lastUpdatedBy = 'customer';
    payload.verificationStatus = 'Not Reviewed'; // any customer edit requires re-verification
    payload.verifiedBy = '';
    payload.verifiedAt = null;

    if (process.env.DB_CONNECTED !== 'true') {
      const userId = req.user._id.toString();
      let rx = MOCK_PRESCRIPTIONS.find(p => p.user === userId);
      if (rx) {
        Object.assign(rx, payload, { updatedAt: new Date() });
      } else {
        rx = {
          _id: `mock-rx-${Date.now()}`,
          user: userId,
          adminNote: '',
          ...payload,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        MOCK_PRESCRIPTIONS.push(rx);
      }

      await logActivity(req.user.email, 'UPDATE_PRESCRIPTION', 'User Prescription', `Customer ${req.user.email} updated their prescription profile (Mock Mode)`, req.ip);

      return res.json({ success: true, message: 'Prescription saved successfully.', prescription: rx });
    }

    const rx = await Prescription.findOneAndUpdate(
      { user: req.user._id },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await logActivity(req.user.email, 'UPDATE_PRESCRIPTION', 'User Prescription', `Customer ${req.user.email} updated their prescription profile`, req.ip);

    // Notify admin so they know a prescription needs review
    try {
      await Notification.create({
        type: 'prescription_updated',
        user: req.user._id,
        message: `${req.user.name} (${req.user.email}) added/updated their prescription profile and needs review.`
      });
    } catch (notifErr) {
      console.error('Prescription notification failed:', notifErr.message);
    }

    res.json({ success: true, message: 'Prescription saved successfully.', prescription: rx });
  } catch (err) {
    next(err);
  }
});

// @desc    Admin: list all prescription profiles (review queue)
// @route   GET /api/prescriptions
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      return res.json({ success: true, prescriptions: MOCK_PRESCRIPTIONS });
    }
    const prescriptions = await Prescription.find({})
      .populate('user', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (err) {
    next(err);
  }
});

// @desc    Admin: get any user's prescription profile
// @route   GET /api/prescriptions/user/:userId
// @access  Private/Admin
router.get('/user/:userId', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      const rx = MOCK_PRESCRIPTIONS.find(p => p.user === req.params.userId);
      return res.json({ success: true, prescription: rx || null });
    }

    const rx = await Prescription.findOne({ user: req.params.userId });
    res.json({ success: true, prescription: rx || null });
  } catch (err) {
    next(err);
  }
});

// @desc    Admin: update/verify any user's prescription profile
// @route   PUT /api/prescriptions/user/:userId
// @access  Private/Admin
router.put('/user/:userId', protect, adminOnly, async (req, res, next) => {
  try {
    const { adminNote, verificationStatus, ...rxFields } = req.body;
    const payload = {};
    RX_FIELDS.forEach(f => {
      if (rxFields[f] !== undefined) payload[f] = rxFields[f];
    });
    if (adminNote !== undefined) payload.adminNote = adminNote;
    if (verificationStatus !== undefined) {
      payload.verificationStatus = verificationStatus;
      payload.verifiedBy = req.user.email;
      payload.verifiedAt = new Date();
    }
    payload.lastUpdatedBy = 'admin';

    if (process.env.DB_CONNECTED !== 'true') {
      let rx = MOCK_PRESCRIPTIONS.find(p => p.user === req.params.userId);
      if (!rx) {
        rx = { _id: `mock-rx-${Date.now()}`, user: req.params.userId, createdAt: new Date() };
        MOCK_PRESCRIPTIONS.push(rx);
      }
      Object.assign(rx, payload, { updatedAt: new Date() });

      await logActivity(req.user.email, 'VERIFY_PRESCRIPTION', 'User Prescription', `Admin updated prescription profile for user ID: ${req.params.userId} (Mock Mode)`, req.ip);

      return res.json({ success: true, message: 'Prescription profile updated.', prescription: rx });
    }

    const rx = await Prescription.findOneAndUpdate(
      { user: req.params.userId },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await logActivity(req.user.email, 'VERIFY_PRESCRIPTION', 'User Prescription', `Admin updated prescription profile for user ID: ${req.params.userId}`, req.ip);

    res.json({ success: true, message: 'Prescription profile updated.', prescription: rx });
  } catch (err) {
    next(err);
  }
});

export default router;
