import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// Public: validate a coupon against live subtotal
// POST /api/coupons/validate { code, subtotal }
router.post('/validate', async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ isValid: false, message: 'Please enter a coupon code.' });

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (!coupon || !coupon.isActive) {
      return res.json({ isValid: false, discount: 0, message: 'Invalid coupon code.' });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.json({ isValid: false, discount: 0, message: 'This coupon has expired.' });
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.json({ isValid: false, discount: 0, message: 'This coupon has reached its usage limit.' });
    }
    if (subtotal < coupon.minSubtotal) {
      return res.json({
        isValid: false, discount: 0,
        message: `Coupon requires a minimum subtotal of ₹${coupon.minSubtotal.toLocaleString('en-IN')}.`
      });
    }

    let discount = coupon.type === 'percentage' ? Math.round(subtotal * (coupon.value / 100)) : coupon.value;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, subtotal);

    res.json({
      isValid: true, discount, code: coupon.code,
      message: `Coupon applied: ${coupon.description || coupon.code} (-₹${discount.toLocaleString('en-IN')})`
    });
  } catch (err) { next(err); }
});

// Admin CRUD
router.get('/', protect, adminOnly, async (req, res, next) => {
  try { res.json(await Coupon.find({}).sort({ createdAt: -1 })); } catch (err) { next(err); }
});

router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const coupon = await Coupon.create({ ...req.body, code: req.body.code.trim().toUpperCase() });
    res.status(201).json(coupon);
  } catch (err) { next(err); }
});

router.put('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (req.body.code) req.body.code = req.body.code.trim().toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) { next(err); }
});

router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (err) { next(err); }
});

export default router;
