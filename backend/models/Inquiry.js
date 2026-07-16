import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true }, // e.g. rx-verification, fitting, shipping
  message: { type: String, required: true },
  prescriptionFile: { type: String, default: null }, // URL of uploaded prescription image/PDF
}, { timestamps: true });

export default mongoose.model('Inquiry', inquirySchema);
