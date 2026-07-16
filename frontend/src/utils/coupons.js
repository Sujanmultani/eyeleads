/**
 * Centralized promo coupons config and validation engine for EyeLeads Store
 */
export const COUPON_RULES = {
  EYELEADS10: {
    code: 'EYELEADS10',
    type: 'percentage',
    value: 0.1,
    minSubtotal: 0,
    description: '10% off on all premium eyewear',
  },
  LUXURY10: {
    code: 'LUXURY10',
    type: 'percentage',
    value: 0.1,
    minSubtotal: 0,
    description: '10% off on luxury frames and lenses',
  },
  SAVE500: {
    code: 'SAVE500',
    type: 'flat',
    value: 500,
    minSubtotal: 2000,
    description: '₹500 off on order subtotals of ₹2,000 or more',
  },
  FIRSTBUY: {
    code: 'FIRSTBUY',
    type: 'flat',
    value: 500,
    minSubtotal: 0,
    description: 'Flat ₹500 off for first-time customers',
  },
};

/**
 * Validates a promo coupon code and calculates the discount amount.
 * @param {string} code - The raw input coupon code.
 * @param {number} subtotal - The current order subtotal.
 * @returns {object} { isValid: boolean, discount: number, message: string }
 */
export const validateAndCalculateDiscount = (code, subtotal) => {
  if (!code || typeof code !== 'string') {
    return { isValid: false, discount: 0, message: 'Please enter a coupon code.' };
  }

  const normalizedCode = code.trim().toUpperCase();
  const rule = COUPON_RULES[normalizedCode];

  if (!rule) {
    return {
      isValid: false,
      discount: 0,
      message: 'Invalid coupon code. Try "EYELEADS10" or "LUXURY10".',
    };
  }

  if (subtotal < rule.minSubtotal) {
    return {
      isValid: false,
      discount: 0,
      message: `Coupon requires a minimum subtotal of ₹${rule.minSubtotal.toLocaleString('en-IN')}.`,
    };
  }

  let discount = 0;
  if (rule.type === 'percentage') {
    discount = Math.round(subtotal * rule.value);
  } else if (rule.type === 'flat') {
    discount = rule.value;
  }

  // Discount cannot exceed subtotal
  discount = Math.min(discount, subtotal);

  return {
    isValid: true,
    discount,
    message: `Success! Coupon applied: ${rule.description} (-₹${discount.toLocaleString('en-IN')})`,
  };
};
