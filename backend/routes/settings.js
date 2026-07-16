import express from 'express';
import Settings from '../models/Settings.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { logActivity } from '../middleware/auditLogger.js';

const router = express.Router();

// Dynamic in-memory configuration state - export default/fallback config
// FIXED: Admin store settings lost on every server restart (no persistence)
export let storeSettings = {
  storeName: 'EyeLeads Luxury Eyewear',
  supportEmail: 'eyeleadscare@gmail.com',
  opticianFee: 500,
  blueCutPremium: 750,
  activeAIModel: 'Claude 3.5 Sonnet',
  allowGuestCheckout: true,
  promoBannerText: 'Complimentary Express Valet Return on all 5-Day Home Trials!',
  warrantyText: '1-Year Warranty',
  // Hero left popup settings
  heroLeftProductId: 'prod-1',
  heroLeftLabel: 'Signature',
  heroLeftTitle: 'The Navigator Elite',
  heroLeftPrice: '₹3,499',
  heroLeftBadge: 'Try-On',
  heroLeftImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&auto=format&fit=crop&q=80',
  // Hero right popup settings
  heroRightProductId: 'prod-14',
  heroRightTitle: 'Zephyr Round',
  heroRightSubtext: 'Titanium Series',
  heroRightPrice: '₹7,499',
  heroRightImage: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=200&auto=format&fit=crop&q=80',
  // Custom prescription configurations
  lensTypes: [
    { id: 'single-vision', name: 'Single Vision', price: 0, desc: 'For distance or reading' },
    { id: 'bifocal', name: 'Bifocal', price: 500, desc: 'Two powers in one lens' },
    { id: 'progressive', name: 'Progressive', price: 1500, desc: 'No-line multifocal' }
  ],
  lensMaterials: [
    { id: 'cr39', name: 'CR-39 Plastic', index: '1.56', price: 0, desc: 'Low powers (below ±2)' },
    { id: 'polycarbonate', name: 'Polycarbonate', index: '1.59', price: 300, desc: 'Kids & sports, impact resistant' },
    { id: 'hi167', name: 'High-Index', index: '1.67', price: 600, desc: 'Medium powers (±2 to ±4)' },
    { id: 'hi174', name: 'High-Index', index: '1.74', price: 1200, desc: 'High powers (above ±4)' },
    { id: 'trivex', name: 'Trivex', index: '—', price: 900, desc: 'Lightest & thinnest' }
  ],
  lensFeatures: [
    { id: 'blue-cut', name: 'Blue Cut', price: 400, desc: 'Blocks blue light from screens' },
    { id: 'photochromic', name: 'Photochromic / Transitions', price: 800, desc: 'Darkens in sunlight' },
    { id: 'polarized', name: 'Polarized', price: 600, desc: 'Reduces glare, ideal for driving' },
    { id: 'uv400', name: 'UV400 Protection', price: 0, desc: 'Blocks 100% UV rays' },
    { id: 'anti-glare', name: 'Anti-Glare / AR Coat', price: 200, desc: 'Reduces reflections' },
    { id: 'scratch-resistant', name: 'Scratch Resistant', price: 0, desc: 'Hard coat protection' },
    { id: 'anti-fog', name: 'Anti-Fog', price: 300, desc: 'Prevents fogging' }
  ]
};

// Helper function to sync loaded DB settings back into memory reference
export const loadSettingsFromDB = async () => {
  try {
    if (process.env.DB_CONNECTED === 'true') {
      const docs = await Settings.find();
      if (docs && docs.length > 0) {
        const dbSettings = {};
        docs.forEach(d => {
          dbSettings[d.key] = d.value;
        });
        Object.assign(storeSettings, dbSettings);
        console.log('[Settings Seeder] Successfully synchronized storeSettings from DB.');
      }
    }
  } catch (err) {
    console.error('[Settings Seeder Error] Failed to load settings from DB:', err.message);
  }
};

// @desc    Get current store configuration
// @route   GET /api/settings
// @access  Public/Private/Admin
router.get('/', async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED === 'true') {
      const docs = await Settings.find();
      const settings = {};
      docs.forEach(d => settings[d.key] = d.value);
      
      const mergedSettings = Object.keys(settings).length > 0
        ? { ...storeSettings, ...settings }
        : storeSettings;

      return res.json({
        status: 'success',
        settings: mergedSettings
      });
    }

    res.json({
      status: 'success',
      settings: storeSettings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update store configuration parameters
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED === 'true') {
      for (const [key, value] of Object.entries(req.body)) {
        await Settings.findOneAndUpdate({ key }, { value }, { upsert: true });
      }
    }

    // Mutate existing object reference so other route modules see updates
    Object.assign(storeSettings, req.body);

    // Log this settings alteration
    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'UPDATE_SETTINGS',
      'Settings Panel',
      `Modified global store settings. Active AI: ${storeSettings.activeAIModel}, Optician Fee: ₹${storeSettings.opticianFee}, Warranty: ${storeSettings.warrantyText}`,
      req.ip
    );

    res.json({
      status: 'success',
      message: 'Store settings updated successfully!',
      settings: storeSettings
    });
  } catch (error) {
    next(error);
  }
});

export default router;
