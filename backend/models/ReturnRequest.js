import mongoose from 'mongoose';

const returnRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['Damaged Product', 'Wrong Product Received', 'Quality Issue', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  photos: {
    type: [String], // Cloudinary URLs, reuse existing upload pipeline
    default: []
  },
  resolutionRequested: {
    type: String,
    enum: ['Replacement', 'Refund'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'Requested',           // customer just submitted it
      'Approved',            // admin approved, resolution pending
      'Rejected',            // admin rejected the request
      'Refund Pending',      // approved as refund, admin hasn't processed it in Razorpay yet
      'Refund Completed',    // admin marked the manual refund as done
      'Replacement Shipped', // approved as exchange, admin has shipped a new unit
      'Completed'            // replacement delivered / refund confirmed received, request closed
    ],
    default: 'Requested'
  },
  adminNote: {
    type: String,
    default: ''
  },
  replacementTrackingNumber: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const ReturnRequest = mongoose.models.ReturnRequest || mongoose.model('ReturnRequest', returnRequestSchema);
export default ReturnRequest;
