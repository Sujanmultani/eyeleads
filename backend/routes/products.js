import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { logActivity } from '../middleware/auditLogger.js';

const router = express.Router();
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name required').escape(),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Valid stock quantity required'),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('weightGrams').isFloat({ min: 1 }).withMessage('Valid product shipping weight (in grams) is required')
];

// Persistent in-memory catalog database for high-fidelity fallback when MongoDB is offline
export const MOCK_PRODUCTS = [
  {
    _id: "6a3b818b2a05ea8223c4644c",
    name: "xyz",
    brand: "EyeLeads Premium",
    category: "Sunglasses",
    frameShape: "Square",
    material: "Acetate",
    gender: "Unisex",
    colors: ["Black"],
    price: 2999,
    mrp: 3999,
    discount: 0,
    rating: 4.5,
    reviews: 12,
    badges: [],
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80"
    ],
    tryOnAssets: {
      frontPng: "https://res.cloudinary.com/dipzblkrd/image/upload/v1782287511/eyeleads_tryon/jyf395zzoytecwhpkajb.png",
      anglePng: "https://res.cloudinary.com/dipzblkrd/image/upload/v1782287517/eyeleads_tryon/yer4zoogjvkqv5ftl9in.png",
      frameWidthMm: 138
    },
    prescriptionAvailable: true,
    inStockOnly: true,
    onSale: false,
    warranty: "1-Year Warranty",
    videoUrl: "",
    videoThumbnail: "",
    productId: "EL-SG26-F230"
  },
  {
    _id: "6a3be9c9a1b92762c4e6b57d",
    name: "xxx",
    brand: "EyeLeads Premium",
    category: "Computer Glasses",
    frameShape: "Round",
    material: "Acetate",
    gender: "Men",
    colors: [
      "Black",
      "black & white",
      "green & black"
    ],
    price: 2849,
    mrp: 2999,
    discount: 5,
    rating: 0,
    reviews: 0,
    badges: [],
    image: "https://res.cloudinary.com/dipzblkrd/image/upload/v1782311214/eyeleads_products/ldgzcp7iiplhamngur9s.png",
    images: [
      "https://res.cloudinary.com/dipzblkrd/image/upload/v1782311214/eyeleads_products/ldgzcp7iiplhamngur9s.png"
    ],
    tryOnAssets: {
      frontPng: "",
      anglePng: "",
      frameWidthMm: 136
    },
    prescriptionAvailable: true,
    inStockOnly: true,
    onSale: true,
    warranty: "6 month",
    videoUrl: "https://res.cloudinary.com/dipzblkrd/video/upload/v1782311171/eyeleads_videos/fhgwtu4wbzwx1fsw1yga.mp4",
    videoThumbnail: "best eyewear",
    productId: "EL-CG26-SXJC"
  },
];

// @desc    Get all products with advanced filtering and pagination
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      let filtered = [...MOCK_PRODUCTS];

      if (req.query.category) {
        const cats = req.query.category.split(',').map(c => c.trim().toLowerCase());

        // 1. Handle Sale filter
        if (cats.includes('sale')) {
          filtered = filtered.filter(p => p.onSale === true || (p.discount && p.discount > 0));
        }

        // 2. Handle standard category filters (including kids category/gender match)
        const activeCats = cats.filter(c => c !== 'sale');
        if (activeCats.length > 0) {
          filtered = filtered.filter(p => {
            return activeCats.some(cat => {
              if (cat === 'kids') {
                return p.category.toLowerCase() === 'kids' || (p.gender && p.gender.toLowerCase() === 'kids');
              }
              return p.category.toLowerCase() === cat;
            });
          });
        }
      }

      if (req.query.onSale === 'true') {
        filtered = filtered.filter(p => p.onSale === true || (p.discount && p.discount > 0));
      }

      if (req.query.frameShape) {
        const shapes = req.query.frameShape.split(',').map(s => s.trim().toLowerCase());
        filtered = filtered.filter(p => shapes.includes(p.frameShape.toLowerCase()));
      }

      if (req.query.material) {
        const mats = req.query.material.split(',').map(m => m.trim().toLowerCase());
        filtered = filtered.filter(p => mats.includes(p.material.toLowerCase()));
      }

      if (req.query.gender) {
        const targetGenders = req.query.gender.split(',').map(g => g.trim().toLowerCase());
        filtered = filtered.filter(p => {
          const pGender = (p.gender || '').toLowerCase();
          return targetGenders.some(tg => {
            if (tg === 'men' || tg === 'male' || tg === 'man') {
              return pGender === 'men' || pGender === 'male' || pGender === 'unisex';
            }
            if (tg === 'women' || tg === 'female' || tg === 'woman') {
              return pGender === 'women' || pGender === 'female' || pGender === 'unisex';
            }
            return pGender === tg;
          });
        });
      }

      if (req.query.colors) {
        const cols = req.query.colors.split(',').map(c => c.trim().toLowerCase());
        filtered = filtered.filter(p => p.colors.some(c => cols.includes(c.toLowerCase())));
      }

      const minPrice = parseFloat(req.query.minPrice) || 0;
      const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
      filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

      if (req.query.prescriptionAvailable === 'true') {
        filtered = filtered.filter(p => p.prescriptionAvailable === true);
      }
      if (req.query.inStockOnly === 'true') {
        filtered = filtered.filter(p => p.inStockOnly === true);
      }
      if (req.query.tryOnOnly === 'true') {
        filtered = filtered.filter(p => p.tryOnAssets && p.tryOnAssets.frontPng && p.tryOnAssets.frontPng !== '');
      }
      if (req.query.hasVideo === 'true') {
        filtered = filtered.filter(p => p.videoUrl && p.videoUrl !== '');
      }

      if (req.query.search) {
        const searchRegex = req.query.search.trim().toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(searchRegex) ||
          p.brand.toLowerCase().includes(searchRegex)
        );
      }

      const sort = req.query.sort || 'newest';
      if (sort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (sort === 'bestselling') {
        filtered.sort((a, b) => b.rating - a.rating);
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);

      return res.json({
        status: 'success',
        count: total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        products: paginated
      });
    }

    // Standard MongoDB Mode
    const query = {};
    const andConditions = [];

    if (req.query.category) {
      const cats = req.query.category.split(',').map(c => c.trim());

      // 1. Handle Sale Condition
      const hasSale = cats.some(c => c.toLowerCase() === 'sale');
      if (hasSale) {
        andConditions.push({ $or: [{ onSale: true }, { discount: { $gt: 0 } }] });
      }

      // 2. Handle Category/Kids Conditions
      const activeCats = cats.filter(c => c.toLowerCase() !== 'sale');
      if (activeCats.length > 0) {
        const categoryConditions = [];
        const normalCats = activeCats.filter(c => c.toLowerCase() !== 'kids');

        if (normalCats.length > 0) {
          categoryConditions.push({ category: { $in: normalCats.map(c => new RegExp(`^${c}$`, 'i')) } });
        }

        if (activeCats.some(c => c.toLowerCase() === 'kids')) {
          categoryConditions.push({ category: /^Kids$/i });
          categoryConditions.push({ gender: /^Kids$/i });
        }

        if (categoryConditions.length > 0) {
          andConditions.push({ $or: categoryConditions });
        }
      }
    }

    if (req.query.onSale === 'true') {
      andConditions.push({ $or: [{ onSale: true }, { discount: { $gt: 0 } }] });
    }

    if (req.query.frameShape) {
      const shapes = req.query.frameShape.split(',').map(s => s.trim());
      query.frameShape = { $in: shapes.map(s => new RegExp(`^${s}$`, 'i')) };
    }

    if (req.query.material) {
      const mats = req.query.material.split(',').map(m => m.trim());
      query.material = { $in: mats.map(m => new RegExp(`^${m}$`, 'i')) };
    }

    if (req.query.gender) {
      const targetGenders = req.query.gender.split(',').map(g => g.trim().toLowerCase());
      const genderRegexes = [];

      targetGenders.forEach(tg => {
        if (tg === 'men' || tg === 'male' || tg === 'man') {
          genderRegexes.push(/^Men$/i, /^Male$/i, /^Unisex$/i);
        } else if (tg === 'women' || tg === 'female' || tg === 'woman') {
          genderRegexes.push(/^Women$/i, /^Female$/i, /^Unisex$/i);
        } else {
          genderRegexes.push(new RegExp(`^${tg}$`, 'i'));
        }
      });

      query.gender = { $in: genderRegexes };
    }

    if (req.query.colors) {
      const cols = req.query.colors.split(',').map(c => c.trim());
      query.colors = { $in: cols.map(c => new RegExp(`^${c}$`, 'i')) };
    }

    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;
    query.price = { $gte: minPrice, $lte: maxPrice };

    if (req.query.prescriptionAvailable === 'true') {
      query.prescriptionAvailable = true;
    }
    if (req.query.inStockOnly === 'true') {
      query.inStockOnly = true;
    }
    if (req.query.tryOnOnly === 'true') {
      query['tryOnAssets.frontPng'] = { $ne: '', $exists: true };
    }
    if (req.query.hasVideo === 'true') {
      query.videoUrl = { $ne: '', $exists: true };
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      andConditions.push({
        $or: [
          { name: searchRegex },
          { brand: searchRegex }
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    let sortOptions = {};
    const sort = req.query.sort || 'newest';
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'bestselling') {
      sortOptions = { rating: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    res.json({
      status: 'success',
      count: total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      products
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Bulk update product weights
// @route   PUT /api/products/bulk-weight
// @access  Private/Admin
router.put('/bulk-weight', protect, adminOnly, async (req, res, next) => {
  const { updates } = req.body;
  if (!Array.isArray(updates)) {
    return res.status(400).json({ success: false, message: 'Updates must be an array of { id, weightGrams }' });
  }

  try {
    if (process.env.DB_CONNECTED !== 'true') {
      for (const update of updates) {
        const prod = MOCK_PRODUCTS.find(p => p._id === update.id);
        if (prod) {
          prod.weightGrams = Number(update.weightGrams);
        }
      }
      return res.json({ status: 'success', message: 'Bulk updated weights in mock mode.' });
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: { weightGrams: Number(update.weightGrams) } }
      }
    }));

    await Product.bulkWrite(bulkOps);

    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'BULK_UPDATE_PRODUCT_WEIGHTS',
      'Product Catalog',
      `Bulk updated weights for ${updates.length} products`,
      req.ip
    );

    res.json({ status: 'success', message: 'Product weights updated successfully.' });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single product details with related products populated
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const product = MOCK_PRODUCTS.find(p => p._id === req.params.id);
      if (product) {
        const related = MOCK_PRODUCTS.filter(p => p.category === product.category && p._id !== product._id).slice(0, 4);
        return res.json({
          status: 'success',
          product,
          related
        });
      } else {
        res.status(404);
        throw new Error('Eyewear product not found in Mock Mode');
      }
    }

    // Standard MongoDB Mode
    const product = await Product.findById(req.params.id);

    if (product) {
      const related = await Product.find({
        category: product.category,
        _id: { $ne: product._id }
      }).limit(4);

      res.json({
        status: 'success',
        product,
        related
      });
    } else {
      res.status(404);
      throw new Error('Eyewear product not found');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, adminOnly, productValidation, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const mrp = Number(req.body.mrp) || 3999;
      const discount = Number(req.body.discount) || 0;
      const onSale = req.body.onSale === true;
      const price = onSale && discount > 0 ? Math.round(mrp * (1 - discount / 100)) : (Number(req.body.price) || mrp);

      const mockProduct = {
        _id: `mock-prod-${Date.now()}`,
        brand: 'EyeLeads Premium',
        rating: 4.5,
        reviews: 0,
        badges: [],
        prescriptionAvailable: true,
        inStockOnly: true,
        ...req.body,
        price,
        discount: onSale ? discount : 0
      };
      MOCK_PRODUCTS.unshift(mockProduct);

      await logActivity(
        req.user?.email || 'admin@eyeleads.com',
        'CREATE_PRODUCT',
        'Product Catalog',
        `Created frame: "${mockProduct.name}" in category "${mockProduct.category}" priced at ₹${mockProduct.price} (Mock Mode)`,
        req.ip
      );

      return res.status(201).json({
        status: 'success',
        product: mockProduct
      });
    }

    // Standard MongoDB Mode
    const product = new Product(req.body);
    const createdProduct = await product.save();

    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'CREATE_PRODUCT',
      'Product Catalog',
      `Created frame: "${createdProduct.name}" in category "${createdProduct.category}" priced at ₹${createdProduct.price}`,
      req.ip
    );

    res.status(201).json({
      status: 'success',
      product: createdProduct
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update an eyewear product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, productValidation, async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  try {
    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const idx = MOCK_PRODUCTS.findIndex(p => p._id === req.params.id);
      if (idx !== -1) {
        const updatedBody = { ...req.body };
        const mrp = Number(updatedBody.mrp !== undefined ? updatedBody.mrp : MOCK_PRODUCTS[idx].mrp);
        const discount = Number(updatedBody.discount !== undefined ? updatedBody.discount : MOCK_PRODUCTS[idx].discount);
        const onSale = updatedBody.onSale !== undefined ? updatedBody.onSale === true : MOCK_PRODUCTS[idx].onSale === true;
        const currentPrice = updatedBody.price !== undefined ? Number(updatedBody.price) : MOCK_PRODUCTS[idx].price;
        updatedBody.price = onSale && discount > 0 ? Math.round(mrp * (1 - discount / 100)) : currentPrice;
        updatedBody.discount = onSale ? discount : 0;

        MOCK_PRODUCTS[idx] = {
          ...MOCK_PRODUCTS[idx],
          ...updatedBody
        };
        const updatedProduct = MOCK_PRODUCTS[idx];

        await logActivity(
          req.user?.email || 'admin@eyeleads.com',
          'UPDATE_PRODUCT',
          'Product Catalog',
          `Updated frame: "${updatedProduct.name}" (ID: ${updatedProduct._id}) (Mock Mode)`,
          req.ip
        );

        return res.json({
          status: 'success',
          product: updatedProduct
        });
      } else {
        res.status(404);
        throw new Error('Product not found in Mock Mode');
      }
    }

    // Standard MongoDB Mode
    const product = await Product.findById(req.params.id);

    if (product) {
      Object.assign(product, req.body);
      const updatedProduct = await product.save();

      await logActivity(
        req.user?.email || 'admin@eyeleads.com',
        'UPDATE_PRODUCT',
        'Product Catalog',
        `Updated frame: "${updatedProduct.name}" (ID: ${updatedProduct._id})`,
        req.ip
      );

      res.json({
        status: 'success',
        product: updatedProduct
      });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Delete an eyewear product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const idx = MOCK_PRODUCTS.findIndex(p => p._id === req.params.id);
      if (idx !== -1) {
        const deletedName = MOCK_PRODUCTS[idx].name;
        MOCK_PRODUCTS.splice(idx, 1);

        await logActivity(
          req.user?.email || 'admin@eyeleads.com',
          'DELETE_PRODUCT',
          'Product Catalog',
          `Deleted frame frame: "${deletedName}" (ID: ${req.params.id}) (Mock Mode)`,
          req.ip
        );

        return res.json({
          status: 'success',
          message: 'Product removed successfully in Mock Mode'
        });
      } else {
        res.status(404);
        throw new Error('Product not found in Mock Mode');
      }
    }

    // Standard MongoDB Mode
    const product = await Product.findById(req.params.id);

    if (product) {
      const deletedName = product.name;
      await product.deleteOne();

      await logActivity(
        req.user?.email || 'admin@eyeleads.com',
        'DELETE_PRODUCT',
        'Product Catalog',
        `Deleted frame frame: "${deletedName}" (ID: ${req.params.id})`,
        req.ip
      );

      res.json({
        status: 'success',
        message: 'Product removed successfully'
      });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
});

export default router;
