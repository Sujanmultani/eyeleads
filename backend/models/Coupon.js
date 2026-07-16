import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'flat'], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null }, // cap for percentage coupons
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('Coupon', couponSchema);
