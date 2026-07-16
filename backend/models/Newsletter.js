import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    }
  },
  {
    timestamps: true
  }
);

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;
