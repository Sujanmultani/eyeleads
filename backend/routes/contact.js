import express from 'express';
import { logActivity } from '../middleware/auditLogger.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import Inquiry from '../models/Inquiry.js';

const router = express.Router();

// Persistent in-memory fallback inquiries array for high-fidelity Mock Mode
export let MOCK_INQUIRIES = [
  {
    _id: 'mock-inq-1',
    name: 'Siddharth Sharma',
    email: 'siddharth@example.com',
    subject: 'rx-verification',
    message: 'Hi, I just uploaded my optical prescription card. Can you please check if it supports progressive lenses with a high index 1.74? The SPH is -4.50 on both eyes.',
    prescriptionFile: 'https://res.cloudinary.com/dipzblkrd/image/upload/v1782312428/eyeleads_prescription_sample.png',
    createdAt: new Date(Date.now() - 3 * 3600000) // 3 hours ago
  },
  {
    _id: 'mock-inq-2',
    name: 'Ananya Goel',
    email: 'ananya@example.com',
    subject: 'fitting',
    message: 'I love your Signature Navigator Elite frames! But I have a slightly narrow face. Do you recommend getting the default size or do you offer a smaller size variant?',
    prescriptionFile: null,
    createdAt: new Date(Date.now() - 24 * 3600000) // 1 day ago
  }
];

// =========================================================================
// 1. PUBLIC ROUTES
// =========================================================================

// @desc    Submit a contact stylist inquiry
// @route   POST /api/contact
// @access  Public
router.post('/contact', async (req, res, next) => {
  const { name, email, subject, message, prescriptionFile } = req.body;
  try {
    if (!name || !email || !message) {
      res.status(400);
      throw new Error('Please provide name, email, and message');
    }

    if (process.env.DB_CONNECTED === 'true') {
      const inquiry = new Inquiry({
        name,
        email,
        subject,
        message,
        prescriptionFile
      });
      await inquiry.save();
    } else {
      const mockInquiry = {
        _id: `mock-inq-${Date.now()}`,
        name,
        email,
        subject,
        message,
        prescriptionFile,
        createdAt: new Date()
      };
      MOCK_INQUIRIES.unshift(mockInquiry);
    }

    // Log the contact activity
    await logActivity(
      email,
      'CONTACT_SUBMIT',
      'Contact Form',
      `Inquiry from ${name} on subject: "${subject}". Msg: "${message.substring(0, 100)}..."${prescriptionFile ? ` [Rx: ${prescriptionFile}]` : ''}`,
      req.ip
    );

    res.status(201).json({
      status: 'success',
      message: 'Inquiry received successfully!'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Book a private showroom styling session
// @route   POST /api/appointments
// @access  Public
router.post('/appointments', async (req, res, next) => {
  const { date, time, name, email, phone } = req.body;
  try {
    if (!date || !time || !name || !email || !phone) {
      res.status(400);
      throw new Error('Please fill in all appointment fields');
    }

    // Log the appointment booking activity
    await logActivity(
      email,
      'APPOINTMENT_BOOK',
      'Appointment Booker',
      `Private styling session booked by ${name} (Phone: ${phone}) for ${date} at ${time}`,
      req.ip
    );

    res.status(201).json({
      status: 'success',
      message: 'Appointment booked successfully!'
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 2. ADMIN ONLY ROUTES
// =========================================================================

// @desc    Get all inquiries (admin only)
// @route   GET /api/contact/admin/all
// @access  Private/Admin
router.get('/contact/admin/all', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      return res.json({
        status: 'success',
        count: MOCK_INQUIRIES.length,
        inquiries: MOCK_INQUIRIES
      });
    }

    const inquiries = await Inquiry.find().sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: inquiries.length,
      inquiries
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete/Resolve an inquiry (admin only)
// @route   DELETE /api/contact/admin/:id
// @access  Private/Admin
router.delete('/contact/admin/:id', protect, adminOnly, async (req, res, next) => {
  const { id } = req.params;
  try {
    let email = 'unknown';
    let subject = 'unknown';

    if (process.env.DB_CONNECTED !== 'true') {
      const idx = MOCK_INQUIRIES.findIndex(i => i._id === id);
      if (idx !== -1) {
        email = MOCK_INQUIRIES[idx].email;
        subject = MOCK_INQUIRIES[idx].subject;
        MOCK_INQUIRIES.splice(idx, 1);
      } else {
        res.status(404);
        throw new Error('Inquiry not found in Mock database');
      }
    } else {
      const inquiry = await Inquiry.findById(id);
      if (!inquiry) {
        res.status(404);
        throw new Error('Inquiry not found');
      }
      email = inquiry.email;
      subject = inquiry.subject;
      await inquiry.deleteOne();
    }

    // Log the inquiry deletion activity
    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'INQUIRY_DELETE',
      'Inquiries Panel',
      `Deleted customer stylist inquiry ID: ${id} from ${email} regarding subject "${subject}"`,
      req.ip
    );

    res.json({
      status: 'success',
      message: 'Inquiry deleted successfully!'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
