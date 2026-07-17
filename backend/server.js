import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import User from './models/User.js';

// Route Imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';
import aiRoutes from './routes/ai.js';
import auditRoutes from './routes/auditLogs.js';
import settingsRoutes, { loadSettingsFromDB } from './routes/settings.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import reviewRoutes from './routes/reviews.js';
import returnRoutes from './routes/returns.js';
import couponRoutes from './routes/coupons.js';
import prescriptionRoutes from './routes/prescriptions.js';
import { crawlerPreviewMiddleware } from './middleware/crawlerPreview.js';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Comprehensive Startup Environment Validation Checks - Trigger DB Counts v2
const REQUIRED_ENV = [
  'JWT_SECRET',
  'MONGODB_URI',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'ADMIN_NOTIFICATION_EMAIL'
];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.warn(`⚠️  WARNING: Environment parameter ${key} is not set. Some features may fail silently.`);
    if (process.env.NODE_ENV === 'production' && (key === 'RAZORPAY_KEY_ID' || key === 'RAZORPAY_KEY_SECRET')) {
      console.error(`FATAL: Production mode requires ${key} env variable. Server startup aborted.`);
      process.exit(1);
    }
  }
}

// JWT SECRET Fail-fast validation check
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined in environment variables. Server startup aborted.');
  process.exit(1);
}

// In production, ensure CLIENT_URL and BACKEND_URL are defined
if (process.env.NODE_ENV === 'production') {
  if (!process.env.CLIENT_URL) {
    console.error('FATAL: CLIENT_URL environment variable is missing in production mode. Server startup aborted.');
    process.exit(1);
  }
  if (!process.env.BACKEND_URL) {
    console.error('FATAL: BACKEND_URL environment variable is missing in production mode. Server startup aborted.');
    process.exit(1);
  }
}

const seedAccessories = async () => {
  try {
    const kitId = '6a3c5d6e7f8a9b0c1d2e3f4b';
    const existing = await Product.findById(kitId);
    if (!existing) {
      await Product.create({
        _id: kitId,
        name: 'Eco-Friendly Lens Cleaning Kit',
        brand: 'EyeLeads Premium',
        category: 'Computer Glasses',
        frameShape: 'Accessory',
        material: 'Liquid & Cloth',
        gender: 'Unisex',
        colors: ['Clear'],
        price: 299,
        mrp: 299,
        discount: 0,
        rating: 4.8,
        reviews: 15,
        image: `${BACKEND_URL}/uploads/lens-cleaning-kit.png`,
        prescriptionAvailable: false,
        inStockOnly: true,
        onSale: false,
        warranty: 'No Warranty',
        isCleaningKit: true
      });
      console.log('Seeded Eco-Friendly Lens Cleaning Kit successfully.');
    } else {
      let updated = false;
      if (existing.image !== `${BACKEND_URL}/uploads/lens-cleaning-kit.png`) {
        existing.image = `${BACKEND_URL}/uploads/lens-cleaning-kit.png`;
        updated = true;
      }
      if (!existing.isCleaningKit) {
        existing.isCleaningKit = true;
        updated = true;
      }
      if (updated) {
        await existing.save();
        console.log('Updated Eco-Friendly Lens Cleaning Kit metadata successfully.');
      }
    }
  } catch (err) {
    console.error('Error seeding accessories:', err.message);
  }
};

const seedAdminUser = async () => {
  try {
    const email = 'syst@elcadmin.sup';
    const password = 'ELC/gap93572tap{close&@pp$€\\<my@£#^_\\at;w074';
    let admin = await User.findOne({ email });
    if (admin) {
      admin.password = password;
      admin.role = 'admin';
      admin.isAdmin = true;
      await admin.save();
      console.log('Seeding: Admin user password/role successfully synchronized.');
    } else {
      await User.create({
        name: 'Super Admin',
        email: email,
        password: password,
        role: 'admin',
        isAdmin: true
      });
      console.log('Seeding: Admin user created successfully.');
    }
  } catch (err) {
    console.error('Seeding: Admin user creation failed:', err.message);
  }
};

// Database Connection & Settings Loader
connectDB().then(async () => {
  // FIXED: Admin store settings lost on every server restart (no persistence)
  await loadSettingsFromDB();
  await seedAccessories();
  await seedAdminUser();
});

const app = express();

// Trust reverse proxy in production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─── 1. SECURITY HEADERS ────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:5173"]
    }
  }
}));

app.use(compression());

// ─── 2. CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.PROD_CLIENT_URL,
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://eyeleads.vercel.app',
  'http://localhost:3000'
].filter(Boolean);

// FIXED: CORS blocked on network access
const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;

    // Allow localhost loopback variants
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') {
      return true;
    }

    // Allow private IPv4 address spaces (LAN)
    // 192.168.0.0 - 192.168.255.255
    // 10.0.0.0 - 10.255.255.255
    // 172.16.0.0 - 172.31.255.255
    if (
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname))
    ) {
      return true;
    }
  } catch (err) {
    // Ignore URL parsing errors
  }

  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// ─── 3. BODY PARSING ────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));        // Payload size limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── 4. MONGO INJECTION SANITIZE ────────────────────────────────
app.use(mongoSanitize());

// ─── 5. HTTP LOGGING ────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── 6. GLOBAL RATE LIMITER ─────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again after 15 minutes.' },
  skip: () => process.env.NODE_ENV !== 'production'
});
app.use('/api/', globalLimiter);

// ─── 7. HTTPS REDIRECT (Production only) ────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// Serve local static file uploads
app.use('/uploads', express.static('uploads', {
  maxAge: '30d',
  immutable: true
}));

// ─── 8. ROUTES ──────────────────────────────────────────────────
app.use(crawlerPreviewMiddleware);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api', contactRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Root Health Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'EyeLeads Eyewear Store API Server is running smoothly!',
    databaseConnected: process.env.DB_CONNECTED === 'true',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  const dbConnected = process.env.DB_CONNECTED === 'true';
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    databaseConnected: dbConnected,
    timestamp: new Date()
  });
});

// ─── 9. GLOBAL ERROR HANDLER ────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;

  console.error(`[ERROR] ${err.stack}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`EyeLeads Express server listening in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
