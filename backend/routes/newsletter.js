import express from 'express';
import Newsletter from '../models/Newsletter.js';
import { logActivity } from '../middleware/auditLogger.js';

const router = express.Router();

// @desc    Subscribe email to newsletter
// @route   POST /api/newsletter
// @access  Public
router.post('/', async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      console.log(`[Newsletter Simulation] Subscribed email: ${trimmedEmail} (Mock Mode)`);
      return res.status(201).json({
        status: 'success',
        message: 'Subscribed successfully in Mock Mode!'
      });
    }

    // Standard MongoDB Mode
    const exists = await Newsletter.findOne({ email: trimmedEmail });
    if (exists) {
      return res.status(409).json({
        status: 'fail',
        message: 'You are already subscribed to our newsletter!'
      });
    }

    await Newsletter.create({ email: trimmedEmail });

    // Log the newsletter sign-up activity
    try {
      await logActivity(
        trimmedEmail,
        'NEWSLETTER_SUBSCRIBE',
        'Footer Newsletter',
        `Subscribed to EyeLeads premium newsletter updates`,
        req.ip
      );
    } catch (logErr) {
      console.warn('Newsletter sign up log activity failed:', logErr.message);
    }

    res.status(201).json({
      status: 'success',
      message: 'Thank you for subscribing to our luxury newsletter!'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
