import Product from '../models/Product.js';

const OUTER_PACKAGING_GRAMS = 100; // shared box/padding weight added on top of item weights
const DEFAULT_ITEM_WEIGHT_GRAMS = 250; // fallback if a product's weight isn't set or item was deleted

/**
 * Calculates the total shipping weight (in kg) for an order based on its
 * actual items, looking up each product's weightGrams. Falls back to a
 * sensible default per item if a product can't be found.
 */
export async function calculateOrderWeightKg(orderItems) {
  const productIds = orderItems.map((item) => item.product).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } }).select('weightGrams');
  const weightById = new Map(products.map((p) => [p._id.toString(), p.weightGrams || DEFAULT_ITEM_WEIGHT_GRAMS]));

  let totalGrams = OUTER_PACKAGING_GRAMS;
  for (const item of orderItems) {
    const productId = item.product?.toString();
    const perItemWeight = weightById.get(productId) || DEFAULT_ITEM_WEIGHT_GRAMS;
    totalGrams += perItemWeight * (item.qty || 1);
  }

  return Math.max(totalGrams / 1000, 0.1); // Shiprocket needs a non-zero weight in kg
}

/**
 * Rough box dimensions (cm) that scale a little with number of items —
 * good enough for rate calculation; adjust once you have real packaging sizes.
 */
export function estimateDimensionsCm(orderItems) {
  const totalQty = orderItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  if (totalQty <= 1) return { length: 15, breadth: 10, height: 5 };
  if (totalQty <= 3) return { length: 20, breadth: 15, height: 8 };
  return { length: 25, breadth: 20, height: 12 };
}
