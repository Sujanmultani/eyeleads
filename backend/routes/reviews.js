import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { MOCK_PRODUCTS } from './products.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import xss from 'xss';

const router = express.Router();

// Persistent in-memory fallback reviews array for high-fidelity Mock Mode
export let MOCK_REVIEWS = [];

// =========================================================================
// 1. ADMIN ROUTES (FIRST to prevent wildcard routes matching first)
// =========================================================================

// @desc    Get all reviews (admin only)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      return res.json({
        status: 'success',
        count: MOCK_REVIEWS.length,
        reviews: MOCK_REVIEWS
      });
    }

    const reviews = await Review.find()
      .populate('product', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Approve a review (admin only)
// @route   PUT /api/reviews/admin/:id/approve
// @access  Private/Admin
router.put('/admin/:id/approve', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (process.env.DB_CONNECTED !== 'true') {
      const idx = MOCK_REVIEWS.findIndex(r => r._id === id);
      if (idx !== -1) {
        MOCK_REVIEWS[idx].approved = true;

        // FIXED: Product rating and reviews count never update from real Review documents
        const mockProduct = MOCK_PRODUCTS.find(p => p._id === MOCK_REVIEWS[idx].product || p.id === MOCK_REVIEWS[idx].product);
        if (mockProduct) {
          const approvedReviews = MOCK_REVIEWS.filter(r => r.product === MOCK_REVIEWS[idx].product && r.approved === true);
          const avgRating = approvedReviews.length > 0
            ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
            : 0;
          mockProduct.rating = Math.round(avgRating * 10) / 10;
          mockProduct.reviews = approvedReviews.length;
        }

        return res.json({
          status: 'success',
          message: 'Review approved successfully',
          review: MOCK_REVIEWS[idx]
        });
      } else {
        res.status(404);
        throw new Error('Review not found in Mock database');
      }
    }

    const review = await Review.findById(id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    review.approved = true;
    const updatedReview = await review.save();

    // FIXED: Product rating and reviews count never update from real Review documents
    const allApprovedReviews = await Review.find({ product: review.product, approved: true });
    const avgRating = allApprovedReviews.length > 0
      ? allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) / allApprovedReviews.length
      : 0;

    await Product.findByIdAndUpdate(review.product, {
      rating: Math.round(avgRating * 10) / 10,
      reviews: allApprovedReviews.length
    });

    res.json({
      status: 'success',
      message: 'Review approved successfully',
      review: updatedReview
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a review (admin only)
// @route   DELETE /api/reviews/admin/:id
// @access  Private/Admin
router.delete('/admin/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (process.env.DB_CONNECTED !== 'true') {
      const initialLength = MOCK_REVIEWS.length;
      const targetReview = MOCK_REVIEWS.find(r => r._id === id);
      MOCK_REVIEWS = MOCK_REVIEWS.filter(r => r._id !== id);
      if (MOCK_REVIEWS.length < initialLength) {
        // FIXED: Product rating and reviews count never update from real Review documents
        if (targetReview) {
          const mockProduct = MOCK_PRODUCTS.find(p => p._id === targetReview.product || p.id === targetReview.product);
          if (mockProduct) {
            const approvedReviews = MOCK_REVIEWS.filter(r => r.product === targetReview.product && r.approved === true);
            const avgRating = approvedReviews.length > 0
              ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
              : 0;
            mockProduct.rating = Math.round(avgRating * 10) / 10;
            mockProduct.reviews = approvedReviews.length;
          }
        }
        return res.json({
          status: 'success',
          message: 'Review deleted successfully (Mock database)'
        });
      } else {
        res.status(404);
        throw new Error('Review not found in Mock database');
      }
    }

    const review = await Review.findById(id);
    if (!review) {
      res.status(404);
      throw new Error('Review not found');
    }

    const productId = review.product;
    await review.deleteOne();

    // FIXED: Product rating and reviews count never update from real Review documents
    const allApprovedReviews = await Review.find({ product: productId, approved: true });
    const avgRating = allApprovedReviews.length > 0
      ? allApprovedReviews.reduce((sum, r) => sum + r.rating, 0) / allApprovedReviews.length
      : 0;

    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviews: allApprovedReviews.length
    });

    res.json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// =========================================================================
// 2. PRODUCT-SPECIFIC ROUTES
// =========================================================================

// @desc    Submit a review (public, no auth required)
// @route   POST /api/reviews/:productId
// @access  Public
router.post('/:productId', async (req, res, next) => {
  try {
    const { guestName, rating, title, body, reviewImages } = req.body;
    const { productId } = req.params;

    if (!rating || !body) {
      res.status(400);
      throw new Error('Rating and review description are required fields');
    }

    const cleanBody = xss(body);
    const cleanTitle = xss(title || '');

    let isVerified = false;

    // Check if MongoDB is connected or running in Fallback Mock Mode
    if (process.env.DB_CONNECTED !== 'true') {
      const mockReview = {
        _id: `mock-rev-${Date.now()}`,
        product: productId,
        productName: req.body.productName || 'Navigator Frame',
        guestName: guestName || 'Anonymous',
        rating: Number(rating),
        title: cleanTitle,
        body: cleanBody,
        reviewImages: reviewImages || [],
        verified: isVerified,
        approved: false, // Must be approved by admin
        createdAt: new Date()
      };

      MOCK_REVIEWS.unshift(mockReview);

      return res.status(201).json({
        status: 'success',
        message: 'Review submitted successfully! Pending admin approval.',
        review: mockReview
      });
    }

    // Database Mode
    const review = new Review({
      product: productId,
      guestName: guestName || 'Anonymous',
      rating: Number(rating),
      title: cleanTitle,
      body: cleanBody,
      reviewImages: reviewImages || [],
      verified: isVerified,
      approved: false // Starts unapproved
    });

    const savedReview = await review.save();

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully! Pending admin approval.',
      review: savedReview
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get approved reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
router.get('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (process.env.DB_CONNECTED !== 'true') {
      const approvedMockReviews = MOCK_REVIEWS.filter(
        r => r.product === productId && r.approved === true
      );
      return res.json({
        status: 'success',
        count: approvedMockReviews.length,
        reviews: approvedMockReviews
      });
    }

    const reviews = await Review.find({ product: productId, approved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
});

export default router;
