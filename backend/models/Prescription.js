import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    rightSph: { type: String, default: '' },
    rightCyl: { type: String, default: '' },
    rightAxis: { type: String, default: '' },
    rightAdd: { type: String, default: '' },
    rightPrism: { type: String, default: '' },
    leftSph: { type: String, default: '' },
    leftCyl: { type: String, default: '' },
    leftAxis: { type: String, default: '' },
    leftAdd: { type: String, default: '' },
    leftPrism: { type: String, default: '' },
    pd: { type: String, default: '' },
    prescriptionDate: { type: String, default: '' },
    doctorName: { type: String, default: '' },
    rxFileUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
    adminNote: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['Not Reviewed', 'Verified', 'Flagged / Action Required'],
      default: 'Not Reviewed'
    },
    verifiedBy: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    lastUpdatedBy: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    }
  },
  { timestamps: true }
);

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
