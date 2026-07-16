import assert from 'assert';
import {
  getMaterialDetail,
  getFeatureDetail,
  getLensTypeDetail,
  getOpticianFee,
  getItemPriceBreakdown
} from './utils/lensPricing.js';

// Setup fake store settings
const mockStoreSettings = {
  opticianFee: 750,
  lensTypes: [
    { id: 'single-vision', name: 'Single Vision', price: 0 },
    { id: 'bifocal', name: 'Bifocal Lenses', price: 500 },
    { id: 'progressive', name: 'Progressive Lenses', price: 1600 } // Edited from 1500 to 1600
  ],
  lensMaterials: [
    { id: 'cr39', name: 'CR-39 Plastic', price: 0 },
    { id: 'hi167', name: 'High-Index (Index 1.67)', price: 900 }, // Edited from 600 to 900
    { id: 'custom-gold', name: 'Custom Gold Index', price: 2500 } // Brand new
  ],
  lensFeatures: [
    { id: 'blue-cut', name: 'Blue Cut Shield', price: 450 }, // Edited from 400 to 450
    { id: 'anti-glare', name: 'Anti-Glare Coating', price: 200 },
    { id: 'anti-fog', name: 'Anti-Fog Shield', price: 300 }
  ]
};

console.log('--- Running Lens Pricing Backend Validation Tests ---');

// Test 1: An EXISTING material's price edited by the admin
const matEdited = getMaterialDetail('hi167', mockStoreSettings);
assert.strictEqual(matEdited.price, 900, 'Test 1 Failed: hi167 price should be 900 (edited)');
console.log('Test 1 Passed: Edited material price resolved correctly.');

// Test 2: A BRAND NEW material added by the admin
const matNew = getMaterialDetail('custom-gold', mockStoreSettings);
assert.strictEqual(matNew.price, 2500, 'Test 2 Failed: custom-gold price should be 2500 (new)');
assert.strictEqual(matNew.name, 'Custom Gold Index', 'Test 2 Failed: custom-gold name should match');
console.log('Test 2 Passed: Brand new material resolved correctly.');

// Test 3: An edited optician fee
const feeEdited = getOpticianFee(mockStoreSettings);
assert.strictEqual(feeEdited, 750, 'Test 3 Failed: opticianFee should be 750 (edited)');
console.log('Test 3 Passed: Edited optician fee resolved correctly.');

// Test 4: An UNEDITED lens type/material/feature
// Bifocal is unedited in settings
const typeUnedited = getLensTypeDetail('bifocal', mockStoreSettings);
assert.strictEqual(typeUnedited.price, 500, 'Test 4a Failed: bifocal should be 500');
// Polycarbonate is missing in settings but in hardcoded list
const matUnedited = getMaterialDetail('polycarbonate', mockStoreSettings);
assert.strictEqual(matUnedited.price, 300, 'Test 4b Failed: polycarbonate should fall back to 300');
console.log('Test 4 Passed: Unedited and fallback configs resolved correctly.');

// Test 5: storeSettings being undefined/empty entirely
const matFallback = getMaterialDetail('hi167', undefined);
assert.strictEqual(matFallback.price, 600, 'Test 5a Failed: hi167 fallback should be 600');
const typeFallback = getLensTypeDetail('progressive', null);
assert.strictEqual(typeFallback.price, 1500, 'Test 5b Failed: progressive fallback should be 1500');
const feeFallback = getOpticianFee({});
assert.strictEqual(feeFallback, 500, 'Test 5c Failed: opticianFee default should be 500');
console.log('Test 5 Passed: Fallback to defaults works cleanly.');

// Test 6: One full worked example
// Progressive (+1600) + hi167 (+900) + blue-cut (+450) + anti-glare (+200) + opticianFee (+750)
// Base frame price = 3499
// Expected totalPrice = 3499 + 750 + 1600 + 900 + 450 + 200 = 7399
const mockItem = {
  price: 7399,
  options: {
    lensType: 'Progressive Lenses',
    prescriptionData: {
      lensConfig: {
        material: 'hi167',
        features: ['blue-cut', 'anti-glare']
      }
    }
  }
};
const breakdown = getItemPriceBreakdown(mockItem, mockStoreSettings);
assert.strictEqual(breakdown.isPrescription, true, 'Should be prescription');
assert.strictEqual(breakdown.opticianFee, 750, 'Optician fee should match');
assert.strictEqual(breakdown.addOnPrice, 1600 + 900 + 450 + 200, 'Add on sum should be 3150');
assert.strictEqual(breakdown.basePrice, 3499, 'Base frame price should be 7399 - 750 - 3150 = 3499');
console.log('Test 6 Passed: Full worked example breakdown matched successfully.');

// Test 7: Cart preview case (item.product?.price is the customized total price, item.price is undefined/unset)
const cartItem = {
  product: { price: 7399 },
  options: {
    lensType: 'Progressive Lenses',
    prescriptionData: {
      lensConfig: {
        material: 'hi167',
        features: ['blue-cut', 'anti-glare']
      }
    }
  }
};
const cartBreakdown = getItemPriceBreakdown(cartItem, mockStoreSettings);
assert.strictEqual(cartBreakdown.basePrice, 3499, 'Test 7 Failed: cart preview base frame price should resolve to catalog price (3499)');
console.log('Test 7 Passed: Cart preview base frame price matches catalog value.');

// Test 8: Free gift case
const freeGiftItem = {
  isFreeGift: true,
  price: 0,
  product: { price: 299 },
  options: {
    color: 'Default Standard',
    size: 'One Size'
  }
};
const giftBreakdown = getItemPriceBreakdown(freeGiftItem, mockStoreSettings);
assert.strictEqual(giftBreakdown.basePrice, 0, 'Test 8 Failed: free gift base price should be 0');
console.log('Test 8 Passed: Free gift base price resolves to 0.');

console.log('All backend lens pricing tests PASSED successfully! 🎉');
