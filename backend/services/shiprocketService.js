import { calculateOrderWeightKg, estimateDimensionsCm } from '../utils/shippingWeight.js';

const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let cachedPickupLocation = null;

let cachedToken = null;
let tokenExpiresAt = 0;

// In-flight login request — every caller awaits THIS SAME promise instead of
// firing a new /auth/login request. Prevents the race condition where several
// functions (checkServiceability, createShiprocketOrder, assignAWB, etc.)
// each try to log in at the same moment, which Shiprocket's security system
// flags as a brute-force pattern and blocks the account for.
let inFlightLogin = null;

// Cooldown after a failed auth attempt — stops the app from immediately
// hammering Shiprocket's login endpoint again (which extends any lockout).
let authCooldownUntil = 0;
const AUTH_COOLDOWN_MS = 60 * 1000; // 1 minute

function formatShiprocketPhone(phoneStr) {
  if (!phoneStr) return '9999999999';
  
  // 1. Remove all non-digits
  let digits = phoneStr.replace(/\D/g, '');
  
  // 2. If it starts with 91, strip it ONLY if that leaves 10 or 11 digits
  if (digits.startsWith('91') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }
  
  // 3. Strip any leading zeros
  while (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  // 4. Force to 10 digits
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  
  // 5. Pad if too short
  if (digits.length < 10) {
    const padding = '9999999999';
    digits = (padding + digits).slice(-10);
  }
  
  // 6. Ensure it starts with 6, 7, 8, or 9
  const firstChar = digits.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstChar)) {
    digits = '9' + digits.slice(1);
  }
  
  return digits;
}

async function performLogin() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    })
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    // Start a cooldown so a burst of calls right after a failure doesn't
    // trigger more login attempts and prolong any account lockout.
    authCooldownUntil = Date.now() + AUTH_COOLDOWN_MS;
    throw new Error(`Shiprocket auth failed: ${data.message || res.statusText}`);
  }

  cachedToken = data.token;
  // Cache for 9 days to stay safely under the ~10 day expiry.
  tokenExpiresAt = Date.now() + 9 * 24 * 60 * 60 * 1000;
  return cachedToken;
}

/**
 * Returns a valid Shiprocket auth token, re-authenticating only when the
 * cached one is missing or close to expiry (Shiprocket tokens last ~10 days).
 * Concurrent callers share a single in-flight login request instead of each
 * firing their own — this is what prevents the "too many failed login
 * attempts" account lockout.
 */
async function getAuthToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  if (now < authCooldownUntil) {
    const waitSeconds = Math.ceil((authCooldownUntil - now) / 1000);
    throw new Error(`Shiprocket auth is cooling down after a recent failure. Try again in ${waitSeconds}s.`);
  }

  // If a login is already in progress, reuse it instead of starting a new one.
  if (!inFlightLogin) {
    inFlightLogin = performLogin().finally(() => {
      inFlightLogin = null;
    });
  }

  return inFlightLogin;
}

async function shiprocketFetch(path, options = {}) {
  const token = await getAuthToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Shiprocket API error (${path}): ${data.message || res.statusText}`);
  }
  return data;
}

/**
 * Fetches the exact pickup_location nickname registered on this Shiprocket
 * account, instead of relying on it being manually typed correctly into
 * .env (which is error-prone — Shiprocket's nickname format isn't always
 * obvious from the dashboard UI). Caches the result for the process lifetime.
 */
async function getPickupLocationName() {
  if (cachedPickupLocation) {
    return cachedPickupLocation;
  }

  const data = await shiprocketFetch('/settings/company/pickup');
  const locations = data?.data?.shipping_address || [];

  if (locations.length === 0) {
    throw new Error('No pickup locations are registered on this Shiprocket account. Add one in Settings → Pickup Addresses first.');
  }

  // If SHIPROCKET_PICKUP_LOCATION is set in .env, try to find an exact match
  // (case-insensitive, trimmed) among the registered locations first.
  const configuredName = (process.env.SHIPROCKET_PICKUP_LOCATION || '').trim().toLowerCase();
  const matched = locations.find((loc) => (loc.pickup_location || '').trim().toLowerCase() === configuredName);

  if (matched) {
    cachedPickupLocation = matched.pickup_location;
  } else {
    // Fall back to the first registered location — logged clearly so it's
    // obvious in the terminal which one is actually being used.
    cachedPickupLocation = locations[0].pickup_location;
    console.warn(
      `[Shiprocket] SHIPROCKET_PICKUP_LOCATION ("${process.env.SHIPROCKET_PICKUP_LOCATION}") did not match any registered pickup location. ` +
      `Falling back to the first registered one: "${cachedPickupLocation}". ` +
      `Registered locations: ${locations.map((l) => `"${l.pickup_location}"`).join(', ')}`
    );
  }

  return cachedPickupLocation;
}

/**
 * Creates a Shiprocket adhoc order right after payment success.
 * `order` is a Mongoose Order document (populated, isPaid = true).
 * Returns { shiprocketOrderId, shipmentId }.
 */
export async function createShiprocketOrder(order) {
  const addr = order.shippingAddress;
  const weightKg = await calculateOrderWeightKg(order.orderItems);
  const dims = estimateDimensionsCm(order.orderItems);

  // Shiprocket rejects/ignores a duplicate order_id if the same reference was
  // already sent before (e.g. from an earlier failed test). Suffixing with a
  // short timestamp on every call guarantees a fresh, unique reference each
  // time this function runs, so retries always create a real new shipment.
  const uniqueOrderId = `${order.orderNumber}-${Date.now().toString(36)}`;

  const pickupLocation = await getPickupLocationName();

  const payload = {
    order_id: uniqueOrderId,
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 19).replace('T', ' '),
    pickup_location: pickupLocation,
    billing_customer_name: addr.name || 'Customer',
    billing_last_name: '',
    billing_address: addr.address,
    billing_city: addr.city,
    billing_pincode: addr.zipCode,
    billing_state: addr.state,
    billing_country: 'India',
    billing_email: addr.email || 'noreply@eyeleads.com',
    billing_phone: formatShiprocketPhone(addr.phone),
    shipping_is_billing: true,
    order_items: order.orderItems.map((item) => ({
      name: item.name,
      sku: item.product?.toString() || item._id?.toString() || 'ITEM',
      units: item.qty,
      selling_price: item.price
    })),
    payment_method: 'Prepaid', // Razorpay is always prepaid
    sub_total: order.totalPrice,
    length: dims.length,
    breadth: dims.breadth,
    height: dims.height,
    weight: weightKg
  };

  const data = await shiprocketFetch('/orders/create/adhoc', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  // Always log the raw response — Shiprocket sometimes returns HTTP 200 with
  // an error/duplicate message instead of a real order_id/shipment_id, and
  // this is the only way to see exactly what came back when that happens.
  console.log(`[Shiprocket] Create order response for ${order.orderNumber}:`, JSON.stringify(data));

  if (!data.order_id || !data.shipment_id) {
    throw new Error(
      `Shiprocket did not return an order_id/shipment_id. Raw response: ${JSON.stringify(data)}`
    );
  }

  return {
    shiprocketOrderId: data.order_id,
    shipmentId: data.shipment_id
  };
}

/**
 * Fetches courier options + rates for a shipment so the admin can compare
 * and pick one on the "Ready to Ship" screen.
 * Returns an array of { courier_id, courier_name, rate, etd (days), rating }.
 */
export async function checkServiceability({ pickupPincode, deliveryPincode, weight, codAmount = 0 }) {
  const data = await shiprocketFetch(
    `/courier/serviceability/?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${codAmount > 0 ? 1 : 0}`
  );

  const couriers = data?.data?.available_courier_companies || [];
  return couriers
    .map((c) => ({
      courierId: c.courier_company_id,
      courierName: c.courier_name,
      rate: c.rate,
      etd: c.etd,
      rating: c.rating
    }))
    .sort((a, b) => a.rate - b.rate);
}

/**
 * Assigns AWB to a shipment for the courier the admin selected.
 * Returns { awbCode, courierName }.
 */
export async function assignAWB(shipmentId, courierId) {
  const data = await shiprocketFetch('/courier/assign/awb', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: shipmentId, courier_id: courierId })
  });

  // Always log the raw response — same reasoning as createShiprocketOrder:
  // Shiprocket can return HTTP 200 with an error/info message instead of a
  // real awb_code, and this is the only way to see what it actually said.
  console.log(`[Shiprocket] Assign AWB response for shipment ${shipmentId}, courier ${courierId}:`, JSON.stringify(data));

  const response = data?.response?.data;
  const awbCode = response?.awb_code;
  const courierName = response?.courier_name;

  if (!awbCode) {
    // Surface Shiprocket's own message if it gave one, instead of a generic error.
    const shiprocketMessage = data?.message || response?.awb_assign_error || JSON.stringify(data);
    throw new Error(`Shiprocket AWB assignment failed: ${shiprocketMessage}`);
  }

  return { awbCode, courierName };
}

/**
 * Requests pickup for a shipment that already has an AWB assigned.
 */
export async function generatePickup(shipmentId) {
  return shiprocketFetch('/courier/generate/pickup', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: [shipmentId] })
  });
}

/**
 * Generates the printable shipping label PDF for a shipment.
 * Returns the label PDF URL.
 */
export async function generateLabel(shipmentId) {
  const data = await shiprocketFetch('/courier/generate/label', {
    method: 'POST',
    body: JSON.stringify({ shipment_id: [shipmentId] })
  });
  return data?.label_url || null;
}

/**
 * Creates a reverse pickup (return) order — pickup address = customer,
 * delivery address = our warehouse (same as our Shiprocket pickup location).
 */
export async function createReversePickup(order, returnRequest) {
  const addr = order.shippingAddress;
  const weightKg = await calculateOrderWeightKg(order.orderItems);
  const dims = estimateDimensionsCm(order.orderItems);

  // Unique order_id for the same reason as forward orders — avoids Shiprocket
  // silently ignoring a duplicate reference if a return was retried.
  const uniqueReturnOrderId = `RET-${order.orderNumber}-${Date.now().toString(36)}`;

  const payload = {
    order_id: uniqueReturnOrderId,
    order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    pickup_customer_name: addr.name || 'Customer',
    pickup_address: addr.address,
    pickup_city: addr.city,
    pickup_state: addr.state,
    pickup_country: 'India',
    pickup_pincode: addr.zipCode,
    pickup_email: addr.email || 'noreply@eyeleads.com',
    pickup_phone: formatShiprocketPhone(addr.phone),
    shipping_customer_name: 'EyeLeads Warehouse',
    shipping_address: await getPickupLocationName(),
    shipping_country: 'India',
    order_items: order.orderItems.map((item) => ({
      name: item.name,
      sku: item.product?.toString() || item._id?.toString() || 'ITEM',
      units: item.qty,
      selling_price: item.price
    })),
    payment_method: 'Prepaid',
    sub_total: order.totalPrice,
    length: dims.length,
    breadth: dims.breadth,
    height: dims.height,
    weight: weightKg
  };

  const data = await shiprocketFetch('/orders/create/return', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  console.log(`[Shiprocket] Reverse pickup response for return on ${order.orderNumber}:`, JSON.stringify(data));

  const shipmentId = data.shipment_id || null;
  const awbCode = data?.awb_code || null;

  // Try to generate a label immediately if we got a shipment id — best-effort,
  // never blocks the return approval if it fails.
  let labelUrl = null;
  if (shipmentId) {
    try {
      labelUrl = await generateLabel(shipmentId);
    } catch (err) {
      console.error('[Shiprocket] Reverse pickup label generation failed:', err.message);
    }
  }

  return {
    shiprocketOrderId: data.order_id,
    shipmentId,
    awbCode,
    labelUrl,
    trackingUrl: awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null
  };
}
