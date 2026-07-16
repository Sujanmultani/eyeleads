import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false    // ← Password never comes in queries by default
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'   // ← Default always customer, never admin
    },
    phone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Invalid Indian phone number']
    },
    // Admin-login 2FA — a fresh OTP hash is generated per login attempt and
    // cleared after use or expiry. Never store the OTP itself, only its hash.
    otpHash: {
      type: String,
      select: false,
      default: null
    },
    otpExpires: {
      type: Date,
      select: false,
      default: null
    },
    isSuspended: {
      type: Boolean,
      required: true,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    verifiedOptician: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    savedAddress: {
      name: { type: String },
      phone: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String }
    }
  },
  {
    strict: true,     // Extra fields rejected
    timestamps: true
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  // Sync isAdmin field with role
  this.isAdmin = this.role === 'admin';

  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Never return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
