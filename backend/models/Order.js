import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        isFreeGift: { type: Boolean, default: false },
        options: {
          lensType: { type: String },
          prescriptionDetails: { type: String },
          color: { type: String },
          size: { type: String },
          rxAttached: { type: String },
          pdEntered: { type: String },
          prescriptionData: {
            rightSph: { type: String },
            rightCyl: { type: String },
            rightAxis: { type: String },
            rightAdd: { type: String },
            rightPrism: { type: String },
            leftSph: { type: String },
            leftCyl: { type: String },
            leftAxis: { type: String },
            leftAdd: { type: String },
            leftPrism: { type: String },
            pd: { type: String },
            prescriptionDate: { type: String },
            doctorName: { type: String },
            rxAttached: { type: String },
            lensConfig: {
              material: { type: String },
              features: { type: [String] },
              tint: { type: String },
              tintPercentage: { type: Number, default: null },
              addOnPrice: { type: Number }
            }
          }
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product'
        }
      }
    ],
    shippingAddress: {
      name: { type: String },
      // FIXED: Order model missing email in shippingAddress but track order needs it
      email: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true, default: 'India' },
      phone: { type: String, required: true }
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Razorpay'],
      default: 'Razorpay'
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String }
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    discountPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    couponCode: {
      type: String,
      default: ''
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },
    paidAt: {
      type: Date
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false
    },
    deliveredAt: {
      type: Date
    },

    // ─── International Detection ───────────────────────────────────
    isInternational: {
      type: Boolean,
      default: false
    },

    // ─── Delivery / Shipping (domestic: Shiprocket-driven, international: manual) ───
    deliveryStatus: {
      type: String,
      enum: [
        'Not Ready',        // default, still waiting on payment/lens processing
        'Processing',       // paid, power lens being made, Shiprocket order created (domestic) if applicable
        'Ready to Ship',    // admin marked ready but courier not yet assigned (domestic)
        'Pickup Scheduled', // AWB assigned + pickup generated (domestic) or manually shipped (international)
        'Shipped',
        'In Transit',
        'Out for Delivery',
        'Delivered',
        'Delivery Failed',
        'RTO'                // Return to Origin
      ],
      default: 'Not Ready'
    },

    // Shiprocket fields (domestic only — left blank for international orders)
    shiprocket: {
      orderId: { type: String, default: null },
      shipmentId: { type: String, default: null },
      awbCode: { type: String, default: null },
      courierName: { type: String, default: null },
      courierId: { type: String, default: null },
      labelUrl: { type: String, default: null },
      trackingUrl: { type: String, default: null },
      lastWebhookStatus: { type: String, default: null },
      lastWebhookAt: { type: Date, default: null }
    },

    // Manual tracking fields (international orders — filled in by admin)
    manualShipping: {
      courierName: { type: String, default: null },
      awbCode: { type: String, default: null },
      trackingUrl: { type: String, default: null },
      shippedAt: { type: Date, default: null }
    },

    deliveryMethod: {
      type: String,
      enum: ['shiprocket', 'international_manual', 'local_hand_delivery'],
      default: null
    },

    handDelivery: {
      deliveredBy: { type: String, default: null },
      deliveredAt: { type: Date, default: null },
      notes: { type: String, default: null }
    },

    // Reverse pickup (returns) — domestic only, via Shiprocket
    reversePickup: {
      shiprocketOrderId: { type: String, default: null },
      shipmentId: { type: String, default: null },
      awbCode: { type: String, default: null },
      labelUrl: { type: String, default: null },
      trackingUrl: { type: String, default: null },
      status: { type: String, default: null }
    },

    // Manual reverse pickup (returns) — international orders, admin-entered
    manualReversePickup: {
      courierName: { type: String, default: null },
      awbCode: { type: String, default: null },
      trackingUrl: { type: String, default: null },
      scheduledAt: { type: Date, default: null }
    },
    prescriptionStatus: {
      type: String,
      required: true,
      enum: ['Not Applicable', 'Pending Verification', 'Verified', 'Flagged / Action Required'],
      default: 'Not Applicable'
    },
    prescriptionVerifiedAt: {
      type: Date
    },
    prescriptionVerifiedBy: {
      type: String
    },
    orderNumber: {
      type: String,
      unique: true
    },
    isCancelled: {
      type: Boolean,
      required: true,
      default: false
    },
    cancelledAt: {
      type: Date
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin']
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    lastModifiedAt: {
      type: Date
    },
    isRefunded: {
      type: Boolean,
      required: true,
      default: false
    },
    refundedAt: {
      type: Date
    },
    refundedBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to auto-generate Order Number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.orderNumber = `EL-${datePart}-${rand}`;
  }
  next();
});

// Production Database Performance Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ deliveryStatus: 1 });
orderSchema.index({ isInternational: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
