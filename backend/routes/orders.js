import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';
import Coupon from '../models/Coupon.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { logActivity } from '../middleware/auditLogger.js';
import { MOCK_PRODUCTS } from './products.js';
import { MOCK_NOTIFICATIONS } from './notifications.js';
import { sendInvoiceEmail } from '../utils/email.js';
import { sendEmail } from '../utils/sendEmail.js';
import {
  createShiprocketOrder,
  checkServiceability,
  assignAWB,
  generatePickup,
  generateLabel,
  createReversePickup
} from '../services/shiprocketService.js';
import { calculateOrderWeightKg } from '../utils/shippingWeight.js';
import { notifyAdminNewOrder } from '../utils/notifyNewOrder.js';
import {
  isPrescriptionLensType,
  getOpticianFee,
  getLensTypeDetail,
  getMaterialDetail,
  getFeatureDetail
} from '../utils/lensPricing.js';
import { storeSettings } from './settings.js';

const router = express.Router();
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Lazily initialize the Razorpay SDK client on first use, not at module load time.
// This avoids a race with dotenv.config() in server.js, which runs after route
// modules are imported (ES modules evaluate all static imports before any of the
// importing file's own top-level statements, including dotenv.config()).
let razorpay;
const getRazorpayClient = () => {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return razorpay;
};

// Persistent in-memory order registry for high-fidelity fallback when MongoDB is offline
export const MOCK_ORDERS = [];

// @desc    Create a new order & initiate Razorpay payment
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res, next) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;

  try {
    if (paymentMethod !== 'Razorpay') {
      res.status(400);
      throw new Error('Unsupported payment method. Only Razorpay is accepted.');
    }
    if (!orderItems || orderItems.length === 0) {
      res.status(404);
      throw new Error('No order items provided');
    }

    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      let mockSubtotal = 0;
      for (const item of orderItems) {
        if (!item.qty || item.qty < 1) {
          res.status(400);
          throw new Error(`Invalid quantity for product: ${item.name}`);
        }
        const CLEANING_KIT_ID = '6a3c5d6e7f8a9b0c1d2e3f4b';
        const isPrescription = isPrescriptionLensType(item.options?.lensType);
        let expectedPrice;
        if (item.isFreeGift && (item.product?.toString() === CLEANING_KIT_ID || item._id?.toString() === CLEANING_KIT_ID)) {
          expectedPrice = 0;
        } else if (isPrescription) {
          const baseFramePrice = item.price ? Math.max(0, item.price - 500 - (item.options?.prescriptionData?.lensConfig?.addOnPrice || 0)) : 2999;
          const config = item.options?.prescriptionData?.lensConfig || {};
          const opticianFee = getOpticianFee(storeSettings);
          const typeDetail = getLensTypeDetail(item.options?.lensType, storeSettings);
          const materialDetail = getMaterialDetail(config.material, storeSettings);
          const featuresSum = (config.features || []).reduce((sum, f) => sum + (getFeatureDetail(f, storeSettings).price || 0), 0);
          const addOnPrice = typeDetail.price + materialDetail.price + featuresSum;
          expectedPrice = baseFramePrice + opticianFee + addOnPrice;
        } else {
          expectedPrice = item.price || 2999;
        }
        item.price = expectedPrice;
        mockSubtotal += expectedPrice * item.qty;
      }

      const CLEANING_KIT_ID = '6a3c5d6e7f8a9b0c1d2e3f4b';
      if (mockSubtotal >= 3000) {
        const alreadyIncluded = orderItems.some(item => (item.product?.toString() === CLEANING_KIT_ID || item._id?.toString() === CLEANING_KIT_ID));
        if (!alreadyIncluded) {
          orderItems.push({
            product: CLEANING_KIT_ID,
            _id: CLEANING_KIT_ID,
            name: 'Eco-Friendly Lens Cleaning Kit',
            price: 0,
            qty: 1,
            image: `${BACKEND_URL}/uploads/lens-cleaning-kit.png`,
            isFreeGift: true,
            options: { color: 'Default Standard', size: 'One Size' }
          });
        } else {
          orderItems.forEach(item => {
            if (item.product?.toString() === CLEANING_KIT_ID || item._id?.toString() === CLEANING_KIT_ID) {
              item.price = 0;
              item.isFreeGift = true;
            }
          });
        }
      }

      let mockDiscount = 0;
      const couponCodeApplied = req.body.couponCode ? req.body.couponCode.trim().toUpperCase() : '';
      if (couponCodeApplied) {
        mockDiscount = Number(req.body.discountPrice) || 0;
      }

      const calculatedShippingPrice = mockSubtotal > 999 ? 0 : 99;
      const taxPrice = 0;
      const calculatedTotalPrice = mockSubtotal + calculatedShippingPrice + taxPrice - mockDiscount;
      const mockId = `mock-order-${Date.now()}`;

      const hasPrescription = orderItems.some(item =>
        item.prescriptionUploaded ||
        item.prescriptionOptions ||
        item.rxAttached ||
        (item.options && (item.options.prescriptionDetails || item.options.lensType !== 'Non-Prescription'))
      );

      const mockOrderNumber = `EL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const createdOrder = {
        _id: mockId,
        orderNumber: mockOrderNumber,
        user: {
          _id: req.user?._id || 'mock-user-123',
          name: req.user?.name || 'John Doe',
          email: req.user?.email || 'demo@eyeleads.com'
        },
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: mockSubtotal,
        discountPrice: mockDiscount,
        couponCode: couponCodeApplied,
        taxPrice,
        shippingPrice: calculatedShippingPrice,
        totalPrice: calculatedTotalPrice,
        isPaid: false,
        prescriptionStatus: hasPrescription ? 'Pending Verification' : 'Not Applicable',
        paymentResult: {
          id: `pay_mock_${Date.now()}`,
          status: 'created'
        },
        createdAt: new Date()
      };

      MOCK_ORDERS.unshift(createdOrder);

      // Create a mock notification for the new purchase
      MOCK_NOTIFICATIONS.unshift({
        _id: `mock-notif-${Date.now()}`,
        type: 'order_placed',
        order: createdOrder,
        message: `New order ${mockOrderNumber} was placed by ${req.user?.name || 'Customer'}.`,
        isRead: false,
        createdAt: new Date()
      });

      return res.status(201).json({
        status: 'success',
        order: createdOrder,
        razorpayOrderId: `rzp_mock_${Date.now()}`,
        amount: calculatedTotalPrice * 100,
        currency: 'INR',
        mockPayment: true
      });
    }

    // Standard MongoDB Mode
    // 1. Validate prices and quantities against DB records for security
    let dbSubtotal = 0;
    for (const item of orderItems) {
      if (!item.qty || item.qty < 1) {
        res.status(400);
        throw new Error(`Invalid quantity for product: ${item.name}`);
      }
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        res.status(404);
        throw new Error(`Product with ID ${item.product} not found`);
      }
      
      const CLEANING_KIT_ID = '6a3c5d6e7f8a9b0c1d2e3f4b';
      const isPrescription = isPrescriptionLensType(item.options?.lensType);
      let expectedPrice;
      if (item.isFreeGift && item.product.toString() === CLEANING_KIT_ID) {
        expectedPrice = 0;
      } else if (isPrescription) {
        const config = item.options?.prescriptionData?.lensConfig || {};
        const opticianFee = getOpticianFee(storeSettings);
        const typeDetail = getLensTypeDetail(item.options?.lensType, storeSettings);
        const materialDetail = getMaterialDetail(config.material, storeSettings);
        const featuresSum = (config.features || []).reduce((sum, f) => sum + (getFeatureDetail(f, storeSettings).price || 0), 0);
        const addOnPrice = typeDetail.price + materialDetail.price + featuresSum;
        expectedPrice = dbProduct.price + opticianFee + addOnPrice;
      } else {
        expectedPrice = dbProduct.price;
      }
      
      item.price = expectedPrice;
      dbSubtotal += expectedPrice * item.qty;
    }

    const CLEANING_KIT_ID = '6a3c5d6e7f8a9b0c1d2e3f4b';
    if (dbSubtotal >= 3000) {
      const alreadyIncluded = orderItems.some(item => item.product?.toString() === CLEANING_KIT_ID);
      if (!alreadyIncluded) {
        orderItems.push({
          product: CLEANING_KIT_ID,
          name: 'Eco-Friendly Lens Cleaning Kit',
          price: 0,
          qty: 1,
          image: `${BACKEND_URL}/uploads/lens-cleaning-kit.png`,
          isFreeGift: true,
          options: { color: 'Default Standard', size: 'One Size' }
        });
      } else {
        orderItems.forEach(item => {
          if (item.product?.toString() === CLEANING_KIT_ID) {
            item.price = 0;
            item.isFreeGift = true;
          }
        });
      }
    }

    // Calculate coupon discount securely on the backend
    let discountPrice = 0;
    const couponCodeApplied = req.body.couponCode ? req.body.couponCode.trim().toUpperCase() : '';
    if (couponCodeApplied) {
      const coupon = await Coupon.findOne({ code: couponCodeApplied, isActive: true });
      if (coupon) {
        const isExpired = coupon.expiresAt && coupon.expiresAt < new Date();
        const isLimitReached = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
        const isSubtotalValid = dbSubtotal >= coupon.minSubtotal;

        if (!isExpired && !isLimitReached && isSubtotalValid) {
          discountPrice = coupon.type === 'percentage' ? Math.round(dbSubtotal * (coupon.value / 100)) : coupon.value;
          if (coupon.maxDiscount) discountPrice = Math.min(discountPrice, coupon.maxDiscount);
          discountPrice = Math.min(discountPrice, dbSubtotal);
        }
      }
    }

    // Include calculated lens charges and shipping bounds
    const calculatedShippingPrice = dbSubtotal > 999 ? 0 : 99;
    const taxPrice = 0;
    const calculatedTotalPrice = dbSubtotal + calculatedShippingPrice + taxPrice - discountPrice;

    // 2. Instantiate Razorpay Order via SDK
    const rzpOptions = {
      amount: Math.round(calculatedTotalPrice * 100), // Amount in paisa
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    let rzpOrder;
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      if (process.env.PAYMENTS_MOCK_MODE === 'true') {
        console.warn('[PAYMENTS_MOCK_MODE] Generating mock Razorpay order — do not use in production.');
        rzpOrder = { id: `rzp_mock_${Date.now()}`, amount: rzpOptions.amount, currency: rzpOptions.currency };
      } else {
        throw new Error('Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
      }
    } else {
      rzpOrder = await getRazorpayClient().orders.create(rzpOptions);
    }

    const hasPrescription = orderItems.some(item =>
      item.prescriptionUploaded ||
      item.prescriptionOptions ||
      item.rxAttached ||
      (item.options && (item.options.prescriptionDetails || item.options.lensType !== 'Non-Prescription'))
    );

    // 3. Save order structure to MongoDB
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: dbSubtotal,
      discountPrice,
      couponCode: couponCodeApplied,
      taxPrice,
      shippingPrice: calculatedShippingPrice,
      totalPrice: calculatedTotalPrice,
      prescriptionStatus: hasPrescription ? 'Pending Verification' : 'Not Applicable',
      paymentResult: {
        id: rzpOrder.id,
        status: 'created'
      }
    });

    const createdOrder = await order.save();

    // Increment coupon usedCount
    if (couponCodeApplied) {
      await Coupon.findOneAndUpdate({ code: couponCodeApplied }, { $inc: { usedCount: 1 } });
    }

    // Create an unread notification for the new purchase
    await Notification.create({
      type: 'order_placed',
      order: createdOrder._id,
      message: `New order ${createdOrder.orderNumber} was placed by ${req.user.name || 'Customer'}.`
    });

    res.status(201).json({
      status: 'success',
      order: createdOrder,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
router.get('/my', protect, async (req, res, next) => {
  try {
    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const currentUserId = req.user?._id || 'mock-user-123';
      const userOrders = MOCK_ORDERS.filter(o => {
        const orderUserId = typeof o.user === 'object' ? o.user._id : o.user;
        return orderUserId === currentUserId || orderUserId === 'mock-user-123';
      });

      return res.json({
        status: 'success',
        count: userOrders.length,
        orders: userOrders
      });
    }

    // Standard MongoDB Mode
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderItems.product');

    res.json({
      status: 'success',
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Track order by orderNumber and email
// @route   GET /api/orders/track
// @access  Public
router.get('/track', async (req, res, next) => {
  const { orderNumber, email } = req.query;
  try {
    if (!orderNumber || !email) {
      res.status(400);
      throw new Error('Order number and email address are required parameters');
    }

    const searchEmail = email.trim().toLowerCase();

    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(
        o => o.orderNumber === orderNumber &&
          (o.user?.email?.toLowerCase() === searchEmail ||
            o.shippingAddress?.email?.toLowerCase() === searchEmail ||
            searchEmail === 'demo@eyeleads.com')
      );

      if (!order) {
        res.status(404);
        throw new Error('Order not found. Please verify your order number and email.');
      }

      return res.json({
        status: 'success',
        orderNumber: order.orderNumber,
        statusLabel: order.isPaid ? (order.deliveryStatus || 'Processing') : 'Payment Pending',
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        shippingAddress: order.shippingAddress,
        prescriptionStatus: order.prescriptionStatus,
        isInternational: order.isInternational || false,
        deliveryMethod: order.deliveryMethod || null,
        isDelivered: order.isDelivered || false,
        deliveredAt: order.deliveredAt || null,
        handDelivery: order.deliveryMethod === 'local_hand_delivery' ? order.handDelivery : null,
        courierName: order.deliveryMethod === 'local_hand_delivery'
          ? "Hand delivered by EyeLeads"
          : (order.isInternational ? order.manualShipping?.courierName : order.shiprocket?.courierName),
        awbCode: order.deliveryMethod === 'local_hand_delivery'
          ? null
          : (order.isInternational ? order.manualShipping?.awbCode : order.shiprocket?.awbCode),
        trackingUrl: order.deliveryMethod === 'local_hand_delivery'
          ? null
          : (order.isInternational ? order.manualShipping?.trackingUrl : order.shiprocket?.trackingUrl)
      });
    }

    const order = await Order.findOne({ orderNumber }).populate('user', 'email name');
    // FIXED: Order model missing email in shippingAddress but track order needs it
    const userEmailMatches = order?.user?.email?.toLowerCase() === searchEmail;
    const shippingEmailMatches = order?.shippingAddress?.email?.toLowerCase() === searchEmail;

    if (!order || (!userEmailMatches && !shippingEmailMatches)) {
      res.status(404);
      throw new Error('Order not found. Please verify your order number and email.');
    }

    res.json({
      status: 'success',
      orderNumber: order.orderNumber,
      statusLabel: order.isPaid ? (order.deliveryStatus || 'Processing') : 'Payment Pending',
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      shippingAddress: order.shippingAddress,
      prescriptionStatus: order.prescriptionStatus,
      isInternational: order.isInternational || false,
      deliveryMethod: order.deliveryMethod || null,
      isDelivered: order.isDelivered || false,
      deliveredAt: order.deliveredAt || null,
      handDelivery: order.deliveryMethod === 'local_hand_delivery' ? order.handDelivery : null,
      courierName: order.deliveryMethod === 'local_hand_delivery'
        ? "Hand delivered by EyeLeads"
        : (order.isInternational ? order.manualShipping?.courierName : order.shiprocket?.courierName),
      awbCode: order.deliveryMethod === 'local_hand_delivery'
        ? null
        : (order.isInternational ? order.manualShipping?.awbCode : order.shiprocket?.awbCode),
      trackingUrl: order.deliveryMethod === 'local_hand_delivery'
        ? null
        : (order.isInternational ? order.manualShipping?.trackingUrl : order.shiprocket?.trackingUrl)
    });
  } catch (err) {
    next(err);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(o => o._id === req.params.id);
      if (!order) {
        res.status(404);
        throw new Error('Order not found in Mock Mode');
      }
      return res.json({
        status: 'success',
        order
      });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Security check: Only owner of the order or an Admin can inspect details
    const orderUser = order.user._id ? order.user._id.toString() : order.user.toString();
    if (orderUser !== req.user._id.toString() && req.user.role !== 'admin' && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Access denied. Not authorized to view this purchase receipt.');
    }

    res.json({
      status: 'success',
      order
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Verify Razorpay Payment signature and mark order as paid
// @route   PUT /api/orders/:id/pay
// @access  Private
router.put('/:id/pay', protect, async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  try {
    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(o => o._id === req.params.id);
      if (!order) {
        res.status(404);
        throw new Error('Order not found in Mock Mode');
      }

      if (order.isPaid) {
        return res.json({ status: 'success', message: 'Order already marked as paid.', order });
      }

      order.isPaid = true;
      order.paidAt = new Date();
      const country = (order.shippingAddress?.country || 'India').trim();
      order.isInternational = country.toLowerCase() !== 'india';
      order.deliveryStatus = 'Processing';
      order.deliveryMethod = order.isInternational ? 'international_manual' : 'shiprocket';
      order.paymentResult = {
        id: razorpay_payment_id || `pay_mock_${Date.now()}`,
        status: 'paid',
        update_time: Date.now().toString(),
        email_address: req.user?.email || 'demo@eyeleads.com'
      };

      console.log(`[EmailJS Trigger] Sending purchase receipt for mock order ${order._id} to ${req.user?.email || 'demo@eyeleads.com'}`);

      // Dispatch premium purchase invoice via Resend in the background
      sendInvoiceEmail(order, req.user).catch(err => {
        console.error('[Resend Background Dispatch Error] Mock mode email delivery failed:', err.message);
      });

      return res.json({
        status: 'success',
        message: 'Payment verified and order confirmed successfully in Mock Mode',
        order
      });
    }

    // Standard MongoDB Mode
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.isPaid) {
      return res.json({ status: 'success', message: 'Order already marked as paid.', order });
    }

    // Security check: Only owner of the order or an Admin can pay/update
    const orderUser = order.user._id ? order.user._id.toString() : order.user.toString();
    if (orderUser !== req.user._id.toString() && req.user.role !== 'admin' && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Access denied. Not authorized.');
    }

    // 1. Verify payment signature security bounds
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      if (process.env.PAYMENTS_MOCK_MODE === 'true') {
        console.warn('[PAYMENTS_MOCK_MODE] Razorpay secret not configured. Skipping signature check in mock mode.');
      } else {
        throw new Error('Razorpay secret not configured — cannot verify payment.');
      }
    } else {
      const signString = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto.createHmac('sha256', secret).update(signString).digest('hex');
      if (expectedSignature !== razorpay_signature) {
        res.status(400);
        throw new Error('Razorpay payment validation signature is invalid');
      }
    }

    // 2. Update order payment properties in MongoDB
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'paid',
      update_time: Date.now().toString(),
      email_address: req.user.email
    };

    // 2a. Detect international vs domestic and set deliveryStatus
    const country = (order.shippingAddress.country || 'India').trim();
    order.isInternational = country.toLowerCase() !== 'india';
    order.deliveryStatus = 'Processing';
    order.deliveryMethod = order.isInternational ? 'international_manual' : 'shiprocket';

    const updatedOrder = await order.save();

    // 2b. Domestic orders: auto-create the Shiprocket order right away.
    // AWB is deliberately NOT assigned yet — that happens only when admin
    // clicks "Ready to Ship" after power-lens processing is done.
    if (!updatedOrder.isInternational) {
      createShiprocketOrder(updatedOrder)
        .then(async ({ shiprocketOrderId, shipmentId }) => {
          updatedOrder.shiprocket.orderId = shiprocketOrderId;
          updatedOrder.shiprocket.shipmentId = shipmentId;
          await updatedOrder.save();
        })
        .catch((err) => {
          console.error('[Shiprocket] Order creation failed for', updatedOrder.orderNumber, err.message);
        });
    }

    // Notify admin by email for every new paid order, domestic or
    // international. Fire-and-forget — never delays the customer's response.
    notifyAdminNewOrder(updatedOrder).catch((err) => {
      console.error('[Notify] Failed to send new order email:', err.message);
    });

    // 3. Dispatch premium purchase invoice via Resend in the background
    sendInvoiceEmail(updatedOrder, req.user).catch(err => {
      console.error('[Resend Background Dispatch Error] Email delivery failed:', err.message);
    });

    res.json({
      status: 'success',
      message: 'Payment verified and order confirmed successfully',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      return res.json({
        status: 'success',
        count: MOCK_ORDERS.length,
        orders: MOCK_ORDERS
      });
    }

    // Standard MongoDB Mode
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'id name email')
      .populate('orderItems.product');

    res.json({
      status: 'success',
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, adminOnly, async (req, res, next) => {
  try {
    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(o => o._id === req.params.id);
      if (!order) {
        res.status(404);
        throw new Error('Order not found in Mock Mode');
      }

      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.deliveryStatus = 'Delivered';

      if (order.deliveryMethod === 'local_hand_delivery') {
        order.handDelivery = {
          deliveredBy: req.user?.email || 'admin@eyeleads.com',
          deliveredAt: new Date(),
          notes: req.body.notes || null
        };
      }

      await logActivity(
        req.user?.email || 'admin@eyeleads.com',
        'ORDER_DISPATCH',
        'Fulfillment Desk',
        `Dispatched/Delivered order package: ${order._id} (Mock Mode)`,
        req.ip
      );

      const notifIndex = MOCK_NOTIFICATIONS.findIndex(n => n.order?._id === req.params.id && (n.type === 'order_placed' || n.type === 'order_modified'));
      if (notifIndex !== -1) MOCK_NOTIFICATIONS.splice(notifIndex, 1);

      return res.json({
        status: 'success',
        message: 'Order status updated to delivered successfully in Mock Mode',
        order
      });
    }

    // Standard MongoDB Mode
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.deliveryStatus = 'Delivered';

    if (order.deliveryMethod === 'local_hand_delivery') {
      order.handDelivery = {
        deliveredBy: req.user?.email || 'admin@eyeleads.com',
        deliveredAt: Date.now(),
        notes: req.body.notes || null
      };
    }

    const updatedOrder = await order.save();

    await Notification.deleteMany({ order: order._id, type: { $in: ['order_placed', 'order_modified'] } });

    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'ORDER_DISPATCH',
      'Fulfillment Desk',
      `Dispatched/Delivered order package: ${order._id}`,
      req.ip
    );

    res.json({
      status: 'success',
      message: 'Order status updated to delivered successfully',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get courier serviceability + rate comparison for a domestic order
// @route   GET /api/orders/:id/courier-options
// @access  Private/Admin
router.get('/:id/courier-options', protect, adminOnly, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.isInternational) {
      res.status(400);
      throw new Error('This is an international order — use manual shipping entry instead.');
    }
    // If the Shiprocket draft order wasn't created yet (e.g. paid before
    // credentials were configured), require an explicit retry action instead
    // of silently re-attempting on every page load — repeated silent retries
    // are what caused the Shiprocket account lockout.
    if (!order.shiprocket.shipmentId) {
      res.status(400);
      throw new Error('Shiprocket order draft was not created for this order yet. Use the "Retry Shiprocket Order" button to create it once, then try again.');
    }

    const pickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE;
    if (!pickupPincode) {
      res.status(500);
      throw new Error('SHIPROCKET_PICKUP_PINCODE is not configured on the server.');
    }

    const weightKg = await calculateOrderWeightKg(order.orderItems);
    const couriers = await checkServiceability({
      pickupPincode,
      deliveryPincode: order.shippingAddress.zipCode || order.shippingAddress.pincode,
      weight: weightKg
    });

    res.json({ status: 'success', couriers });
  } catch (error) {
    next(error);
  }
});

// @desc    Manually retry creating the Shiprocket draft order for a domestic
//          order that failed to get one automatically after payment.
// @route   POST /api/orders/:id/retry-shiprocket-order
// @access  Private/Admin
router.post('/:id/retry-shiprocket-order', protect, adminOnly, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.isInternational) {
      res.status(400);
      throw new Error('This is an international order — Shiprocket is not used for it.');
    }
    if (order.shiprocket.shipmentId) {
      return res.json({ status: 'success', message: 'Shiprocket order already exists.', order });
    }

    // createShiprocketOrder now throws if Shiprocket doesn't return a real
    // order_id/shipment_id, so reaching the lines below means it genuinely
    // succeeded — no more "false success" responses.
    const { shiprocketOrderId, shipmentId } = await createShiprocketOrder(order);
    order.shiprocket.orderId = shiprocketOrderId;
    order.shiprocket.shipmentId = shipmentId;
    order.deliveryStatus = 'Processing';
    order.deliveryMethod = 'shiprocket';
    await order.save();

    res.json({ status: 'success', order });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark order for local hand delivery
// @route   PUT /api/orders/:id/set-hand-delivery
// @access  Private/Admin
router.put('/:id/set-hand-delivery', protect, adminOnly, async (req, res, next) => {
  try {
    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(o => o._id === req.params.id);
      if (!order) {
        res.status(404);
        throw new Error('Order not found');
      }
      if (order.shiprocket?.awbCode) {
        res.status(400);
        throw new Error('Cannot change to local delivery. A Shiprocket AWB has already been assigned. Cancel the shipment first.');
      }
      order.deliveryMethod = 'local_hand_delivery';
      order.deliveryStatus = 'Ready to Ship';
      order.shiprocket = {
        orderId: null,
        shipmentId: null,
        awbCode: null,
        courierName: null,
        courierId: null,
        labelUrl: null,
        trackingUrl: null,
        lastWebhookStatus: null,
        lastWebhookAt: null
      };
      return res.json({ status: 'success', order });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.shiprocket?.awbCode) {
      res.status(400);
      throw new Error('Cannot change to local delivery. A Shiprocket AWB has already been assigned. Cancel the shipment first.');
    }

    order.deliveryMethod = 'local_hand_delivery';
    order.deliveryStatus = 'Ready to Ship';
    
    // Clear out Shiprocket fields
    order.shiprocket.orderId = null;
    order.shiprocket.shipmentId = null;
    order.shiprocket.awbCode = null;
    order.shiprocket.courierName = null;
    order.shiprocket.courierId = null;
    order.shiprocket.labelUrl = null;
    order.shiprocket.trackingUrl = null;
    order.shiprocket.lastWebhookStatus = null;
    order.shiprocket.lastWebhookAt = null;

    await order.save();

    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'ORDER_LOCAL_DELIVERY_SET',
      'Fulfillment Desk',
      `Set order ${order.orderNumber} to Local Hand Delivery`,
      req.ip
    );

    res.json({ status: 'success', order });
  } catch (error) {
    next(error);
  }
});

// @desc    Admin marks order "Ready to Ship" — assigns AWB with the chosen
//          courier and generates pickup. Only valid for domestic orders that
//          already have a Shiprocket order created.
// @route   PUT /api/orders/:id/ready-to-ship
// @access  Private/Admin
router.put('/:id/ready-to-ship', protect, adminOnly, async (req, res, next) => {
  const { courierId } = req.body;

  try {
    if (!courierId) {
      res.status(400);
      throw new Error('courierId is required.');
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (order.isInternational) {
      res.status(400);
      throw new Error('This is an international order — use manual shipping entry instead.');
    }
    if (!order.shiprocket.shipmentId) {
      res.status(400);
      throw new Error('Shiprocket order has not been created yet for this order.');
    }

    // assignAWB now throws with Shiprocket's real error message if it fails,
    // so reaching the lines below means it genuinely succeeded.
    const { awbCode, courierName } = await assignAWB(order.shiprocket.shipmentId, courierId);

    order.shiprocket.awbCode = awbCode;
    order.shiprocket.courierName = courierName;
    order.shiprocket.courierId = courierId;
    order.shiprocket.trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
    order.deliveryStatus = 'Pickup Scheduled';
    await order.save();

    // Fire-and-forget: schedule pickup + generate label
    generatePickup(order.shiprocket.shipmentId).catch((err) =>
      console.error('[Shiprocket] Pickup generation failed for', order.orderNumber, err.message)
    );
    generateLabel(order.shiprocket.shipmentId)
      .then(async (labelUrl) => {
        order.shiprocket.labelUrl = labelUrl;
        await order.save();
      })
      .catch((err) => console.error('[Shiprocket] Label generation failed for', order.orderNumber, err.message));

    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'ORDER_READY_TO_SHIP',
      'Fulfillment Desk',
      `Marked ${order.orderNumber} ready to ship via ${courierName} (AWB ${awbCode})`,
      req.ip
    );

    res.json({ status: 'success', order });
  } catch (error) {
    next(error);
  }
});

// @desc    Admin manually enters shipping details for an international order
// @route   PUT /api/orders/:id/manual-shipping
// @access  Private/Admin
router.put('/:id/manual-shipping', protect, adminOnly, async (req, res, next) => {
  const { courierName, awbCode, trackingUrl } = req.body;

  try {
    if (!courierName || !awbCode) {
      res.status(400);
      throw new Error('courierName and awbCode are required.');
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }
    if (!order.isInternational) {
      res.status(400);
      throw new Error('This is a domestic order — use the Shiprocket flow instead.');
    }

    order.manualShipping.courierName = courierName;
    order.manualShipping.awbCode = awbCode;
    order.manualShipping.trackingUrl = trackingUrl || null;
    order.manualShipping.shippedAt = new Date();
    order.deliveryStatus = 'Shipped';
    await order.save();

    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'ORDER_MANUAL_SHIP',
      'Fulfillment Desk',
      `Manually shipped international order ${order.orderNumber} via ${courierName} (AWB ${awbCode})`,
      req.ip
    );

    res.json({ status: 'success', order });
  } catch (error) {
    next(error);
  }
});

// @desc    Receive Shiprocket webhook status updates (domestic orders only)
// @route   POST /api/orders/webhooks/courier-status
// @access  Public (verified via shared secret header)
router.post('/webhooks/courier-status', async (req, res) => {
  // Shiprocket's docs require the webhook URL to ALWAYS respond with 200,
  // regardless of outcome — otherwise Shiprocket may flag the endpoint as
  // unreliable and stop delivering events. All error handling below logs
  // internally but still responds with 200.
  try {
    const incomingToken = req.headers['x-api-key'] || req.headers['authorization'];
    if (incomingToken !== process.env.SHIPROCKET_WEBHOOK_TOKEN) {
      console.warn('[Shiprocket Webhook] Rejected — invalid/missing x-api-key token.');
      return res.status(200).json({ status: 'unauthorized_but_acknowledged' });
    }

    const { awb, current_status, order_id, courier_name } = req.body;
    if (!awb) {
      console.warn('[Shiprocket Webhook] Payload missing awb — ignoring.', req.body);
      return res.status(200).json({ status: 'ignored_missing_awb' });
    }

    const order = await Order.findOne({ 'shiprocket.awbCode': awb });
    if (!order) {
      // Not one of our orders (or a test ping) — acknowledge anyway.
      return res.status(200).json({ status: 'ignored_unknown_awb' });
    }

    // Expanded mapping to cover more of Shiprocket's real status values.
    // Anything not listed here is stored as the raw lastWebhookStatus but
    // does not overwrite deliveryStatus, so it's never lost even if unmapped.
    const statusMap = {
      'MANIFEST GENERATED': 'Pickup Scheduled',
      MANIFESTED: 'Pickup Scheduled',
      'PENDING PICKUP': 'Pickup Scheduled',
      'PICKUP SCHEDULED': 'Pickup Scheduled',
      'PICKED UP': 'In Transit',
      SHIPPED: 'In Transit',
      'IN TRANSIT': 'In Transit',
      'OUT FOR DELIVERY': 'Out for Delivery',
      DELIVERED: 'Delivered',
      'DELIVERY FAILED': 'Delivery Failed',
      UNDELIVERED: 'Delivery Failed',
      CANCELLED: 'Delivery Failed',
      RTO: 'RTO',
      'RTO INITIATED': 'RTO',
      'RTO DELIVERED': 'RTO'
    };
    const normalizedStatus = (current_status || '').toUpperCase().trim();
    const mappedStatus = statusMap[normalizedStatus] || order.deliveryStatus;

    order.deliveryStatus = mappedStatus;
    order.shiprocket.lastWebhookStatus = current_status;
    order.shiprocket.lastWebhookAt = new Date();
    if (courier_name && !order.shiprocket.courierName) {
      order.shiprocket.courierName = courier_name;
    }

    if (mappedStatus === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }

    await order.save();
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('[Shiprocket Webhook] Error processing webhook:', error.message);
    // Still 200 — see comment above. The error is logged for us to investigate,
    // but Shiprocket should not see this as a delivery failure.
    res.status(200).json({ status: 'error_logged' });
  }
});

// @desc    Update order prescription verification status
// @route   PUT /api/orders/:id/verify-rx
// @access  Private/Admin
router.put('/:id/verify-rx', protect, adminOnly, async (req, res, next) => {
  const { status } = req.body; // 'Verified' or 'Flagged / Action Required'

  try {
    if (!['Verified', 'Flagged / Action Required'].includes(status)) {
      res.status(400);
      throw new Error('Invalid verification status. Must be "Verified" or "Flagged / Action Required"');
    }

    // Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(o => o._id === req.params.id);
      if (!order) {
        res.status(404);
        throw new Error('Order not found in Mock Mode');
      }

      order.prescriptionStatus = status;
      order.prescriptionVerifiedAt = new Date();
      order.prescriptionVerifiedBy = req.user?.email || 'optician@eyeleads.com';

      await logActivity(
        req.user?.email || 'admin@eyeleads.com',
        'VERIFY_PRESCRIPTION',
        'Fulfillment Desk',
        `Optometrist prescription status updated to "${status}" for Order ID: ${order._id}. Inspected by: ${order.prescriptionVerifiedBy} (Mock Mode)`,
        req.ip
      );

      const notifIndex = MOCK_NOTIFICATIONS.findIndex(n => n.order?._id === req.params.id && n.type === 'order_placed');
      if (notifIndex !== -1) MOCK_NOTIFICATIONS.splice(notifIndex, 1);

      return res.json({
        status: 'success',
        message: `Order prescription status updated to ${status} successfully in Mock Mode`,
        order
      });
    }

    // Standard MongoDB Mode
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.prescriptionStatus = status;
    order.prescriptionVerifiedAt = Date.now();
    order.prescriptionVerifiedBy = req.user?.email || 'optician@eyeleads.com';

    const updatedOrder = await order.save();

    await Notification.deleteMany({ order: order._id, type: 'order_placed' });

    await logActivity(
      req.user?.email || 'admin@eyeleads.com',
      'VERIFY_PRESCRIPTION',
      'Fulfillment Desk',
      `Optometrist prescription status updated to "${status}" for Order ID: ${order._id}. Inspected by: ${order.prescriptionVerifiedBy}`,
      req.ip
    );

    res.json({
      status: 'success',
      message: `Order prescription status updated to ${status} successfully`,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
});

const ORDER_ACTION_WINDOW_HOURS = 3;

// @desc    Cancel an order (customer, within 3 hours; admin, anytime)
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res, next) => {
  const { reason } = req.body;

  try {
    // 1. Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(o => o._id === req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      const isOwner = order.user && (
        (typeof order.user === 'string' && order.user === req.user._id.toString()) ||
        (order.user._id && order.user._id.toString() === req.user._id.toString())
      );

      if (!isOwner && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized for this order.' });
      }

      if (order.isCancelled) {
        return res.status(400).json({ message: 'This order is already cancelled.' });
      }
      if (order.isDelivered) {
        return res.status(400).json({ message: 'This order has already been delivered and cannot be cancelled.' });
      }

      const hoursSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
      if (!req.user.isAdmin && hoursSinceOrder > ORDER_ACTION_WINDOW_HOURS) {
        return res.status(400).json({
          message: `The ${ORDER_ACTION_WINDOW_HOURS}-hour cancellation window for this order has passed. Please contact support if you still need to cancel.`
        });
      }

      order.isCancelled = true;
      order.cancelledAt = new Date();
      order.cancelledBy = req.user.isAdmin && !isOwner ? 'admin' : 'customer';
      order.cancellationReason = reason || '';

      await logActivity(
        req.user.email || req.user._id.toString(),
        'ORDER_CANCELLED',
        'Order',
        `Order ${order.orderNumber} cancelled by ${order.cancelledBy} (Mock Mode). Reason: ${order.cancellationReason || 'none given'}`,
        req.ip
      );

      // In-app notification for admin
      const mockNotif = {
        _id: `mock-notif-${Date.now()}`,
        type: 'order_cancelled',
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          isPaid: order.isPaid,
          paymentResult: order.paymentResult
        },
        message: `Order ${order.orderNumber} was cancelled by the customer.`,
        isRead: false,
        createdAt: new Date()
      };
      MOCK_NOTIFICATIONS.unshift(mockNotif);

      // Emails (Customer & Admin)
      sendEmail({
        to: order.shippingAddress?.email || req.user.email || 'customer@example.com',
        subject: `Your EyeLeads order ${order.orderNumber} has been cancelled`,
        html: `<p>Hi ${order.shippingAddress?.name || req.user.name || 'Valued Customer'},</p><p>Your order <strong>${order.orderNumber}</strong> has been cancelled as requested.</p>`
      });

      if (process.env.ADMIN_NOTIFICATION_EMAIL) {
        const refundNote = order.isPaid
          ? `<p style="color:#b91c1c;"><strong>Action needed:</strong> This order was paid via Razorpay. Please issue a manual refund.</p>
             <p><strong>Razorpay Payment ID:</strong> ${order.paymentResult?.id || 'N/A'}</p>
             <p><strong>Refund Amount:</strong> ₹${order.totalPrice}</p>`
          : '';
        sendEmail({
          to: process.env.ADMIN_NOTIFICATION_EMAIL,
          subject: `Order Cancelled: ${order.orderNumber}`,
          html: `<p>Order <strong>${order.orderNumber}</strong> was cancelled by ${order.cancelledBy}.</p>
                 <p>Reason: ${order.cancellationReason || 'none given'}</p>
                 ${refundNote}`
        });
      }

      return res.json({ status: 'success', order });
    }

    // 2. Standard MongoDB Mode
    const order = await Order.findById(req.params.id).populate('user', 'email name');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized for this order.' });
    }

    if (order.isCancelled) {
      return res.status(400).json({ message: 'This order is already cancelled.' });
    }
    if (order.isDelivered) {
      return res.status(400).json({ message: 'This order has already been delivered and cannot be cancelled.' });
    }

    const hoursSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60);
    if (!req.user.isAdmin && hoursSinceOrder > ORDER_ACTION_WINDOW_HOURS) {
      return res.status(400).json({
        message: `The ${ORDER_ACTION_WINDOW_HOURS}-hour cancellation window for this order has passed. Please contact support if you still need to cancel.`
      });
    }

    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancelledBy = req.user.isAdmin && !isOwner ? 'admin' : 'customer';
    order.cancellationReason = reason || '';
    await order.save();

    await logActivity(
      req.user.email || req.user._id.toString(),
      'ORDER_CANCELLED',
      'Order',
      `Order ${order.orderNumber} cancelled by ${order.cancelledBy}. Reason: ${order.cancellationReason || 'none given'}`,
      req.ip
    );

    await Notification.create({
      type: 'order_cancelled',
      order: order._id,
      message: `Order ${order.orderNumber} was cancelled by the customer.`
    });

    // Email customer
    sendEmail({
      to: order.shippingAddress.email || order.user.email,
      subject: `Your EyeLeads order ${order.orderNumber} has been cancelled`,
      html: `<p>Hi ${order.shippingAddress.name || order.user.name},</p><p>Your order <strong>${order.orderNumber}</strong> has been cancelled as requested.</p>`
    });

    // Email admin
    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      const refundNote = order.isPaid
        ? `<p style="color:#b91c1c;"><strong>Action needed:</strong> This order was paid via Razorpay. Please issue a manual refund.</p>
           <p><strong>Razorpay Payment ID:</strong> ${order.paymentResult?.id || 'N/A'}</p>
           <p><strong>Refund Amount:</strong> ₹${order.totalPrice}</p>`
        : '';
      sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `Order Cancelled: ${order.orderNumber}`,
        html: `<p>Order <strong>${order.orderNumber}</strong> was cancelled by ${order.cancelledBy}.</p>
               <p>Reason: ${order.cancellationReason || 'none given'}</p>
               ${refundNote}`
      });
    }

    res.json({ status: 'success', order });
  } catch (err) {
    next(err);
  }
});

// @desc    Modify an order's shipping address/phone (customer, within 3 hours; admin, anytime)
// @route   PUT /api/orders/:id/modify
// @access  Private
router.put('/:id/modify', protect, async (req, res, next) => {
  const { shippingAddress } = req.body;

  try {
    // 1. Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(o => o._id === req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      const isOwner = order.user && (
        (typeof order.user === 'string' && order.user === req.user._id.toString()) ||
        (order.user._id && order.user._id.toString() === req.user._id.toString())
      );

      if (!isOwner && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized for this order.' });
      }

      if (order.isCancelled) {
        return res.status(400).json({ message: 'This order has been cancelled and cannot be modified.' });
      }
      if (order.isDelivered) {
        return res.status(400).json({ message: 'This order has already been delivered and cannot be modified.' });
      }

      const hoursSinceOrder = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
      if (!req.user.isAdmin && hoursSinceOrder > ORDER_ACTION_WINDOW_HOURS) {
        return res.status(400).json({
          message: `The ${ORDER_ACTION_WINDOW_HOURS}-hour modification window for this order has passed. Please contact support for changes.`
        });
      }

      const { address, city, state, zipCode, phone } = shippingAddress || {};
      if (!order.shippingAddress) order.shippingAddress = {};
      if (address) order.shippingAddress.address = address;
      if (city) order.shippingAddress.city = city;
      if (state) order.shippingAddress.state = state;
      if (zipCode) {
        order.shippingAddress.zipCode = zipCode;
        order.shippingAddress.pincode = zipCode;
      }
      if (phone) order.shippingAddress.phone = phone;

      // If shipping details are modified, clear the old Shiprocket details so it gets recreated.
      if (order.shiprocket && order.shiprocket.shipmentId) {
        order.shiprocket.orderId = null;
        order.shiprocket.shipmentId = null;
        order.shiprocket.awbCode = null;
        order.shiprocket.courierName = null;
        order.shiprocket.courierId = null;
        order.shiprocket.labelUrl = null;
        order.shiprocket.trackingUrl = null;
        if (order.deliveryStatus === 'Pickup Scheduled') {
          order.deliveryStatus = 'Processing';
        }
      }

      order.lastModifiedAt = new Date();

      await logActivity(
        req.user.email || req.user._id.toString(),
        'ORDER_MODIFIED',
        'Order',
        `Shipping details for order ${order.orderNumber} were modified (Mock Mode).`,
        req.ip
      );

      const mockNotif = {
        _id: `mock-notif-${Date.now()}`,
        type: 'order_modified',
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalPrice: order.totalPrice,
          isPaid: order.isPaid,
          paymentResult: order.paymentResult
        },
        message: `Order ${order.orderNumber}'s shipping details were modified by the customer.`,
        isRead: false,
        createdAt: new Date()
      };
      MOCK_NOTIFICATIONS.unshift(mockNotif);

      sendEmail({
        to: order.shippingAddress?.email || req.user.email || 'customer@example.com',
        subject: `Your EyeLeads order ${order.orderNumber} was updated`,
        html: `<p>Hi ${order.shippingAddress?.name || req.user.name || 'Valued Customer'},</p><p>The shipping details for your order <strong>${order.orderNumber}</strong> have been updated as requested.</p>`
      });

      if (process.env.ADMIN_NOTIFICATION_EMAIL) {
        sendEmail({
          to: process.env.ADMIN_NOTIFICATION_EMAIL,
          subject: `Order Modified: ${order.orderNumber}`,
          html: `<p>Shipping details for order <strong>${order.orderNumber}</strong> were modified by the customer.</p>`
        });
      }

      return res.json({ status: 'success', order });
    }

    // 2. Standard MongoDB Mode
    const order = await Order.findById(req.params.id).populate('user', 'email name');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized for this order.' });
    }

    if (order.isCancelled) {
      return res.status(400).json({ message: 'This order has been cancelled and cannot be modified.' });
    }
    if (order.isDelivered) {
      return res.status(400).json({ message: 'This order has already been delivered and cannot be modified.' });
    }

    const hoursSinceOrder = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60);
    if (!req.user.isAdmin && hoursSinceOrder > ORDER_ACTION_WINDOW_HOURS) {
      return res.status(400).json({
        message: `The ${ORDER_ACTION_WINDOW_HOURS}-hour modification window for this order has passed. Please contact support for changes.`
      });
    }

    const { address, city, state, zipCode, phone } = shippingAddress || {};
    if (address) order.shippingAddress.address = address;
    if (city) order.shippingAddress.city = city;
    if (state) order.shippingAddress.state = state;
    if (zipCode) {
      order.shippingAddress.zipCode = zipCode;
      order.shippingAddress.pincode = zipCode; // Maintain both keys to bypass UI bugs
    }
    if (phone) order.shippingAddress.phone = phone;

    // If shipping details are modified, clear the old Shiprocket details so it gets recreated.
    if (order.shiprocket && order.shiprocket.shipmentId) {
      order.shiprocket.orderId = null;
      order.shiprocket.shipmentId = null;
      order.shiprocket.awbCode = null;
      order.shiprocket.courierName = null;
      order.shiprocket.courierId = null;
      order.shiprocket.labelUrl = null;
      order.shiprocket.trackingUrl = null;
      if (order.deliveryStatus === 'Pickup Scheduled') {
        order.deliveryStatus = 'Processing';
      }
    }

    order.lastModifiedAt = new Date();
    await order.save();

    await logActivity(
      req.user.email || req.user._id.toString(),
      'ORDER_MODIFIED',
      'Order',
      `Shipping details for order ${order.orderNumber} were modified.`,
      req.ip
    );

    await Notification.create({
      type: 'order_modified',
      order: order._id,
      message: `Order ${order.orderNumber}'s shipping details were modified by the customer.`
    });

    sendEmail({
      to: order.shippingAddress.email || order.user.email,
      subject: `Your EyeLeads order ${order.orderNumber} was updated`,
      html: `<p>Hi ${order.shippingAddress.name || order.user.name},</p><p>The shipping details for your order <strong>${order.orderNumber}</strong> have been updated as requested.</p>`
    });

    if (process.env.ADMIN_NOTIFICATION_EMAIL) {
      sendEmail({
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        subject: `Order Modified: ${order.orderNumber}`,
        html: `<p>Shipping details for order <strong>${order.orderNumber}</strong> were modified by the customer.</p>`
      });
    }

    res.json({ status: 'success', order });
  } catch (err) {
    next(err);
  }
});

// @desc    Mark a cancelled paid order as refunded (bookkeeping)
// @route   PUT /api/orders/:id/refund
// @access  Private/Admin
router.put('/:id/refund', protect, adminOnly, async (req, res, next) => {
  try {
    // 1. Graceful fallback when database is offline
    if (process.env.DB_CONNECTED !== 'true') {
      const order = MOCK_ORDERS.find(o => o._id === req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      order.isRefunded = true;
      order.refundedAt = new Date();
      order.refundedBy = req.user.email || 'admin@eyeleads.com';

      await logActivity(
        req.user.email || 'admin@eyeleads.com',
        'REFUND_PROCESSED',
        'Order',
        `Refund bookkeeping logged for Order ${order.orderNumber} (Mock Mode).`,
        req.ip
      );

      const notifIndex = MOCK_NOTIFICATIONS.findIndex(n => n.order?._id === req.params.id && n.type === 'order_cancelled');
      if (notifIndex !== -1) MOCK_NOTIFICATIONS.splice(notifIndex, 1);

      return res.json({ status: 'success', order });
    }

    // 2. Standard MongoDB Mode
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.isRefunded = true;
    order.refundedAt = new Date();
    order.refundedBy = req.user.email || 'admin@eyeleads.com';
    await order.save();

    await Notification.deleteMany({ order: order._id, type: 'order_cancelled' });

    await logActivity(
      req.user.email || 'admin@eyeleads.com',
      'REFUND_PROCESSED',
      'Order',
      `Refund bookkeeping logged for Order ${order.orderNumber}.`,
      req.ip
    );

    res.json({ status: 'success', order });
  } catch (err) {
    next(err);
  }
});

export default router;
