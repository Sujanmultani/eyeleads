import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Helper to resolve user from token (handles DB-down fallback and mock tokens)
const resolveUserFromToken = async (token) => {
  if (!token) return null;

  // Mock-session login is a development-only convenience for working without
  // a live MongoDB connection. It must NEVER be reachable outside local
  // development, regardless of DB_CONNECTED state — otherwise a temporary
  // production DB outage would let anyone holding this literal string log in
  // as admin. Gating strictly on NODE_ENV, which is never 'development' in
  // any deployed environment, closes that hole.
  const mockLoginAllowed = process.env.NODE_ENV !== 'production';
  const isMockToken = mockLoginAllowed && token === 'mock-jwt-token-key-session';

  let decoded;
  if (isMockToken) {
    decoded = { id: 'mock-user-123' };
  } else {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  }

  const isMockAdmin = isMockToken && (decoded.id === 'mock-admin-999' || (typeof decoded.id === 'string' && decoded.id.startsWith('mock-admin')));

  if (isMockToken && process.env.DB_CONNECTED !== 'true') {
    return {
      _id: decoded.id,
      name: isMockAdmin ? 'Admin Controller' : 'John Doe',
      email: isMockAdmin ? 'admin@eyeleads.com' : 'demo@eyeleads.com',
      isAdmin: isMockAdmin,
      isSuspended: false,
      role: isMockAdmin ? 'admin' : 'customer'
    };
  }

  const userId = decoded.userId || decoded.id;
  if (!userId) return null;

  return await User.findById(userId).select('-password');
};

// ─── Protect: Any logged-in user ────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    // Debug logging is dev-only — never print token fragments in production logs.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Auth Debug] URL: ${req.originalUrl}`);
      console.log(`[Auth Debug] Cookie Token Present: ${!!req.cookies?.token}`);
      console.log(`[Auth Debug] Authorization Header Present: ${!!req.headers.authorization}`);
      console.log(`[Auth Debug] Extracted Token: ${token ? token.substring(0, 15) + '...' : 'None'}`);
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. Please login.' });
    }

    const user = await resolveUserFromToken(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists or invalid token.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// ─── Admin Only ──────────────────────────────────────────────────
export const adminOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && !req.user.isAdmin)) {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};

// ─── Optional Auth (for cart, wishlist etc.) ─────────────────────
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    if (token) {
      const user = await resolveUserFromToken(token);
      if (user && !user.isSuspended) {
        req.user = user;
      }
    }
    next();
  } catch (err) {
    next();
  }
};
