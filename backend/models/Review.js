import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestName: { type: String, default: 'Anonymous' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  body: { type: String, required: true },
  reviewImages: { type: [String], default: [] }, // customer uploaded photos
  verified: { type: Boolean, default: false },
  approved: { type: Boolean, default: false } // admin must approve
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
