import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { MOCK_AUDIT_LOGS } from '../middleware/auditLogger.js';

const router = express.Router();

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      return res.json({
        status: 'success',
        count: MOCK_AUDIT_LOGS.length,
        logs: MOCK_AUDIT_LOGS
      });
    }

    const logs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(100); // Caps at latest 100 entries for efficiency

    res.json({
      status: 'success',
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
});

export default router;
