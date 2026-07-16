import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true
    },
    brand: {
      type: String,
      required: [true, 'Please provide a brand name'],
      default: 'EyeLeads Premium'
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: ['Eyeglasses', 'Sunglasses', 'Computer Glasses', 'Sports', 'Kids']
    },
    frameShape: {
      type: String,
      required: [true, 'Please select a frame shape']
    },
    material: {
      type: String,
      required: [true, 'Please select a frame material']
    },
    gender: {
      type: String,
      required: [true, 'Please specify target gender'],
      enum: ['Men', 'Women', 'Unisex', 'Kids']
    },
    colors: {
      type: [String],
      required: [true, 'Please specify at least one color']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      default: 0.0
    },
    mrp: {
      type: Number,
      required: [true, 'Please provide an MRP']
    },
    discount: {
      type: Number,
      required: true,
      default: 0
    },
    rating: {
      type: Number,
      required: true,
      default: 0.0
    },
    reviews: {
      type: Number,
      required: true,
      default: 0
    },
    badges: {
      type: [String],
      default: []
    },
    // Approximate shipping weight of this product in grams (includes its own
    // packaging, e.g. glasses case). Used to calculate real order weight for
    // Shiprocket courier rate comparison instead of a flat guess.
    weightGrams: {
      type: Number,
      required: [true, 'Product shipping weight in grams is required'],
      default: 250
    },
    image: {
      type: String,
      required: [true, 'Please provide a product image URL']
    },
    images: {
      type: [String],
      default: []
    },
    tryOnAssets: {
      frontPng: { type: String, default: '' },
      anglePng: { type: String, default: '' },
      frameWidthMm: { type: Number, default: 138 }
    },
    prescriptionAvailable: {
      type: Boolean,
      required: true,
      default: false
    },
    inStockOnly: {
      type: Boolean,
      required: true,
      default: true
    },
    onSale: {
      type: Boolean,
      required: true,
      default: false
    },
    warranty: {
      type: String,
      default: '1-Year Warranty'
    },
    isCleaningKit: {
      type: Boolean,
      default: false
    },
    productId: {
      type: String,
      unique: true,
      sparse: true
    },
    videoUrl: {
      type: String,
      default: ''
    },
    videoThumbnail: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to auto-generate SKU Product ID and calculate sale price
productSchema.pre('save', async function (next) {
  // Calculate price based on onSale and discount percentage
  if (this.onSale && this.discount > 0) {
    this.price = Math.round(this.mrp * (1 - this.discount / 100));
  } else {
    this.discount = 0;
  }

  if (!this.productId) {
    const prefix = {
      'Eyeglasses': 'EG',
      'Sunglasses': 'SG',
      'Computer Glasses': 'CG',
      'Sports': 'SP',
      'Kids': 'KD'
    }[this.category] || 'EL';
    const year = new Date().getFullYear().toString().slice(-2);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.productId = `EL-${prefix}${year}-${rand}`;
  }
  next();
});

// Compound and Unique Indexes for Production Performance
productSchema.index({ category: 1, gender: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
