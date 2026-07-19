import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, CheckCircle, AlertTriangle, ArrowRight, UploadCloud, Sparkles, ChevronRight, Gift } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { toast } from '../components/Toast';
import { getItemPriceBreakdown, getLensTypeDetail, getMaterialDetail, getFeatureDetail, isPrescriptionLensType } from '../utils/lensPricing';

const Cart = () => {
  const navigate = useNavigate();
  const [storeSettings, setStoreSettings] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  useEffect(() => {
    api.get('/api/settings').then(res => {
      if (res.data?.settings) setStoreSettings(res.data.settings);
    }).catch(() => {});

    api.get('/api/products').then(res => {
      if (res.data?.products) setAllProducts(res.data.products);
    }).catch(() => {});
  }, []);
  const { 
    cartItems, 
    updateQuantity, 
    updateOptions,
    removeFromCart, 
    clearCart, 
    cartTotal, 
    cartLensCharges, 
    cartSubtotal, 
    cartDelivery 
  } = useCart();

  const updateQty = (productId, qty, options) => {
    updateQuantity(productId, qty, options);
  };
  const removeItem = (productId, options) => {
    removeFromCart(productId, options);
  };
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [appliedDiscountAmount, setAppliedDiscountAmount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState(false);

  // Handle Prescription Uploads to backend and save in cart context options
  const handleUploadPrescription = async (item, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('prescription', file);
    try {
      const response = await api.post('/api/upload/prescription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.status === 'success') {
        const secureUrl = response.data.secure_url;
        updateOptions(item.product._id || item.product.id, item.options, { rxAttached: secureUrl });
        toast.success('Doctor prescription guidelines uploaded successfully!');
      } else {
        toast.error('Completed upload, but failed to retrieve secure link.');
      }
    } catch (error) {
      console.error('Prescription upload error:', error);
      toast.error('Failed to upload prescription. Please try again.');
    }
  };

  const isPrescriptionMissing = (item) => {
    const isRequired = isPrescriptionLensType(item.options?.lensType);
    if (!isRequired) return false;
    
    // 1. If a prescription file is uploaded, it is not missing
    if (item.options?.rxAttached) return false;
    
    // 2. If prescription details are manually entered, it is not missing
    const rx = item.options?.prescriptionData;
    if (rx) {
      const hasRightEye = rx.rightSph || rx.rightCyl || rx.rightAxis;
      const hasLeftEye = rx.leftSph || rx.leftCyl || rx.leftAxis;
      if (hasRightEye || hasLeftEye) {
        return false;
      }
    }
    
    return true;
  };

  // Check if any prescription is missing across all cart items
  const isAnyPrescriptionMissing = cartItems.some(item => isPrescriptionMissing(item));

  const lensCharges = cartLensCharges;
  const subtotal = cartSubtotal;
  const deliveryCharge = cartDelivery;

  const discountAmount = appliedCoupon ? appliedDiscountAmount : 0;

  const finalTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

  // Auto-revalidate coupon if subtotal changes (e.g. quantity updates)
  useEffect(() => {
    const revalidateCoupon = async () => {
      if (appliedCoupon && subtotal > 0) {
        try {
          const res = await api.post('/api/coupons/validate', {
            code: appliedCoupon,
            subtotal
          });
          if (res.data.isValid) {
            setAppliedDiscountAmount(res.data.discount);
          } else {
            setAppliedCoupon('');
            setAppliedDiscountAmount(0);
            setCouponMessage(res.data.message || 'Coupon is no longer valid for this cart total.');
            setCouponError(true);
          }
        } catch (err) {
          console.error('Error revalidating coupon:', err);
        }
      }
    };
    revalidateCoupon();
  }, [subtotal, appliedCoupon]);

  // Apply coupons via API
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError(true);
      setCouponMessage('Please enter a coupon code.');
      return;
    }
    setCouponError(false);
    setCouponMessage('');

    try {
      const res = await api.post('/api/coupons/validate', { code, subtotal });
      if (res.data.isValid) {
        setAppliedCoupon(code);
        setAppliedDiscountAmount(res.data.discount);
        setCouponMessage(res.data.message || 'Coupon applied successfully!');
        toast.success('Coupon applied successfully!');
      } else {
        setAppliedCoupon('');
        setAppliedDiscountAmount(0);
        setCouponError(true);
        setCouponMessage(res.data.message || 'Invalid coupon.');
        toast.error(res.data.message || 'Invalid coupon.');
      }
    } catch (err) {
      setAppliedCoupon('');
      setAppliedDiscountAmount(0);
      setCouponError(true);
      const errMsg = err.response?.data?.message || 'Could not validate coupon right now. Please try again.';
      setCouponMessage(errMsg);
      toast.error(errMsg);
    }
  };

  const getItemKey = (item) => `${item.product._id || item.product.id}-${JSON.stringify(item.options)}`;

  // Cart Recommendations list dynamically loaded from shop (excluding cart items, accessories, and placeholder cards)
  const cartRecommendations = useMemo(() => {
    const fallbacks = [
      {
        _id: 'prod-fallback-1',
        name: 'Zephyr Acetate Round',
        price: 2999,
        mrp: 3999,
        discount: 25,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
        brand: 'EyeLeads Premium',
        category: 'Sunglasses',
        colors: ['Black'],
        badges: ['Bestseller'],
        tryOnAssets: { frameWidthMm: 138 }
      },

      {
        _id: 'prod-fallback-3',
        name: 'Navigator Classic',
        price: 3499,
        mrp: 4999,
        discount: 30,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
        brand: 'EyeLeads Premium',
        category: 'Sunglasses',
        colors: ['Gold', 'Black'],
        badges: ['New Arrival'],
        tryOnAssets: { frameWidthMm: 140 }
      },
      {
        _id: 'prod-fallback-4',
        name: 'Downtown Acetate Eyeglasses',
        price: 4199,
        mrp: 5999,
        discount: 30,
        image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=600&auto=format&fit=crop&q=80',
        brand: 'EyeLeads Premium',
        category: 'Eyeglasses',
        colors: ['Black'],
        badges: ['Bestseller'],
        tryOnAssets: { frameWidthMm: 135 }
      }
    ];

    let list = [];
    if (allProducts.length > 0) {
      const cartProductIds = new Set(
        cartItems.map((item) => item.product?._id || item.product?.id || item.product)
      );
      const filtered = allProducts.filter((p) => {
        // Exclude items already in cart
        if (cartProductIds.has(p._id)) return false;

        // Exclude test products like 'xxx' or 'test'
        const nameLower = (p.name || '').toLowerCase();
        if (nameLower === 'xxx' || nameLower.includes('test')) return false;

        // Exclude accessories/cleaning kits/cloths
        if (nameLower.includes('cleaning') || nameLower.includes('kit') || nameLower.includes('cloth')) return false;

        // Ensure category is eyeglasses or sunglasses or computer glasses (excluding accessories)
        const categoryLower = (p.category || '').toLowerCase();
        if (categoryLower.includes('accessory') || categoryLower.includes('kit') || categoryLower.includes('cleaning')) return false;

        // Filter out black & white or card/lens placeholder images
        const imgUrl = (p.image || '').toLowerCase();
        if (imgUrl.includes('lens-cleaning-kit') || imgUrl.includes('ldgzcp7iiplhamngur9s')) return false;

        return true;
      });

      list = [...filtered];
    }

    // If we have fewer than 4 products from the database, fill the remaining spots with fallbacks
    if (list.length < 4) {
      const needed = 4 - list.length;
      const existingNames = new Set(list.map((p) => p.name.toLowerCase()));
      const availableFallbacks = fallbacks.filter((f) => !existingNames.has(f.name.toLowerCase()));
      list = [...list, ...availableFallbacks.slice(0, needed)];
    }

    return list.slice(0, 4);
  }, [allProducts, cartItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 animate-fadeIn select-none">
      
      {/* Editorial Header */}
      <div className="mb-8 select-none">
        <ol className="flex items-center gap-2 text-xs font-bold text-[#4A4A6A]/60 mb-2">
          <li>
            <Link to="/" className="hover:text-[#1B3F6E]">Home</Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3 text-slate-300" />
          </li>
          <li className="text-[#1B3F6E] font-extrabold">Your Bag</li>
        </ol>
        <h1 className="text-3xl font-extrabold text-[#1B3F6E] tracking-tight">Shopping Bag</h1>
      </div>

      {cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="max-w-md mx-auto text-center py-20 flex flex-col items-center justify-center min-h-[400px]">
          <div className="bg-slate-50 p-6 rounded-full text-[#1B3F6E] mb-6">
            <ShoppingBag className="h-16 w-16 text-[#1B3F6E]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E]">Your cart is empty</h2>
          <p className="text-sm text-[#4A4A6A] mt-2 leading-relaxed">
            Looks like you haven't selected any premium eyewear yet. Shop our collections to find your perfect pair.
          </p>
          <Link
            to="/shop"
            className="mt-8 bg-[#1B3F6E] hover:bg-[#2E6DB4] text-white px-10 py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest shadow transition-all active:scale-95 cursor-pointer block text-center"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        /* Two Column Grid layout */
        <div className="space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* LEFT COLUMN - CART ITEMS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Shipping progress bar */}
              <div className="bg-[#EAF0F8]/50 rounded-2xl p-5 border border-[#1B3F6E]/10 space-y-3 shadow-sm">
                <div className="flex justify-between items-center text-xs font-bold text-[#1B3F6E]">
                  <span>Express Delivery Status</span>
                  <span>Qualified</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out bg-emerald-500"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <p className="text-[11px] text-[#4A4A6A] font-bold leading-relaxed">
                  🎉 Cheers! Your cart qualifies for free express premium shipping.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-luxury border border-slate-100/80 p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <h2 className="text-base font-extrabold text-[#1A1A2E] uppercase tracking-wider">Bag Items</h2>
                  <button
                    onClick={clearCart}
                    className="text-xxs font-extrabold uppercase tracking-wider text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => {
                    const key = getItemKey(item);
                    const missingRX = isPrescriptionMissing(item);
                    const rxRequired = isPrescriptionLensType(item.options?.lensType);

                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center py-6 justify-between gap-6">
                        
                        {/* Product details */}
                        <div className="flex gap-4 items-start flex-1">
                          <div className="h-24 w-24 bg-[#F8FAFC] rounded-xl p-3 flex items-center justify-center shrink-0 border border-slate-100 select-none">
                            <img
                              src={item.product.image || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60'}
                              alt={item.product.name}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>

                          <div className="space-y-2 flex-1 min-w-0">
                            <h3 className="font-extrabold text-[#1A1A2E] text-base leading-tight hover:text-[#2E6DB4] transition-colors truncate">
                              <Link to={`/product/${item.product._id || item.product.id}`}>
                                {item.product.name}
                              </Link>
                            </h3>

                            {/* Info Pills */}
                            <div className="flex flex-wrap gap-2">
                              <span className="bg-[#1B3F6E]/5 text-[#1B3F6E] px-2.5 py-0.5 rounded text-[11px] font-bold uppercase">
                                Color: {item.options?.color || 'Classic'}
                              </span>
                              <span className="bg-[#1B3F6E]/5 text-[#1B3F6E] px-2.5 py-0.5 rounded text-[11px] font-bold uppercase">
                                Size: {item.options?.size || 'Medium'}
                              </span>
                            </div>

                            {/* Lens Pill */}
                            {item.options?.lensType && (
                              <div className="flex flex-wrap gap-2.5 items-center">
                                <span className="bg-amber-50 text-[#B8952A] border border-amber-200/50 px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wide shadow-sm">
                                  Lens: {item.options.lensType}
                                </span>

                                {/* Prescription Check */}
                                {rxRequired && (
                                  <div className="flex items-center gap-1.5 select-none">
                                    {!missingRX ? (
                                      <span className="flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded text-[11px] font-bold">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Uploaded</span>
                                      </span>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1 text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[11px] font-bold">
                                          <AlertTriangle className="h-3 w-3 shrink-0" />
                                          <span>Details Required</span>
                                        </span>
                                        <input
                                          type="file"
                                          accept="image/*,.pdf"
                                          onChange={(e) => handleUploadPrescription(item, e.target.files[0])}
                                          className="hidden"
                                          id={`rx-upload-${key}`}
                                        />
                                        <label
                                          htmlFor={`rx-upload-${key}`}
                                          className="text-[11px] font-extrabold uppercase text-[#1B3F6E] flex items-center gap-1 hover:underline shrink-0 cursor-pointer"
                                        >
                                          <UploadCloud className="h-3.5 w-3.5" />
                                          <span>Upload</span>
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* FIXED: Dynamic billing details with lens addon price breakdown */}
                            {item.options?.lensType && (
                              <div className="mt-2 text-[11px] bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 space-y-1 font-bold text-slate-500 max-w-xs select-none">
                                {(() => {
                                  const { isPrescription, opticianFee, addOnPrice, basePrice, typeDetail, materialDetail, featuresList } = getItemPriceBreakdown(item, storeSettings);
                                  
                                  if (isPrescription) {
                                    return (
                                      <>
                                        <span className="text-[11px] uppercase tracking-widest text-[#1B3F6E] block font-black">Item Unit Breakdown</span>
                                        <div className="flex justify-between">
                                          <span>Base Frame:</span>
                                          <span className="text-slate-800">₹{basePrice.toLocaleString('en-IN')}</span>
                                        </div>
                                        {opticianFee > 0 && (
                                          <div className="flex justify-between text-slate-400">
                                            <span>• Optician Prescription Fee:</span>
                                            <span className="text-slate-800">+ ₹{opticianFee.toLocaleString('en-IN')}</span>
                                          </div>
                                        )}
                                        {typeDetail.price > 0 && (
                                          <div className="flex justify-between text-slate-400">
                                            <span>• {typeDetail.name}:</span>
                                            <span className="text-slate-800">+ ₹{typeDetail.price.toLocaleString('en-IN')}</span>
                                          </div>
                                        )}
                                        {materialDetail.price > 0 && (
                                          <div className="flex justify-between text-slate-400">
                                            <span>• {materialDetail.name}:</span>
                                            <span className="text-slate-800">+ ₹{materialDetail.price.toLocaleString('en-IN')}</span>
                                          </div>
                                        )}
                                        {featuresList.map((feat, fi) => {
                                          if (feat.price <= 0) return null;
                                          return (
                                            <div key={fi} className="flex justify-between text-slate-400">
                                              <span>• {feat.name}:</span>
                                              <span className="text-slate-800">+ ₹{feat.price.toLocaleString('en-IN')}</span>
                                            </div>
                                          );
                                        })}
                                      </>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Controls: Qty Stepper, Price & Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto shrink-0 border-t border-slate-50 pt-4 sm:border-t-0 sm:pt-0">
                          
                          {/* Compact Qty Stepper */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-white select-none overflow-hidden shadow-sm shrink-0">
                            <button
                              onClick={() => updateQty(item.product._id || item.product.id, item.quantity - 1, item.options)}
                              className="px-3 py-1.5 text-slate-400 hover:bg-slate-50 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3.5 py-1.5 font-bold text-xs text-[#1A1A2E]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQty(item.product._id || item.product.id, item.quantity + 1, item.options)}
                              className="px-3 py-1.5 text-slate-400 hover:bg-slate-50 font-bold"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="flex flex-col items-end text-right shrink-0 select-none w-24">
                            <span className="font-extrabold text-base text-[#1B3F6E]">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[11px] text-slate-400 font-bold mt-1">
                                ₹{item.product.price.toLocaleString('en-IN')} each
                              </span>
                            )}
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(item.product._id || item.product.id, item.options)}
                            className="text-slate-300 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-xl transition-all cursor-pointer shrink-0 border border-transparent hover:border-red-100"
                            title="Remove pair"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Summary Items Order Total */}
                <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center text-xs font-extrabold text-[#4A4A6A] uppercase tracking-wider">
                  <span>Subtotal Value:</span>
                  <span className="text-lg text-[#1B3F6E]">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - ORDER SUMMARY */}
            <div className="lg:col-span-1 bg-white rounded-2xl shadow-luxury border border-slate-100 p-6 sticky top-24 space-y-6 select-none">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#1A1A2E] border-b border-slate-100 pb-4">
                Order Summary
              </h3>

              {/* Calculations lines */}
              <div className="space-y-4 text-xs font-semibold text-[#4A4A6A]">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="text-[#1A1A2E] font-extrabold">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>

                {lensCharges > 0 && (
                  <div className="flex justify-between">
                    <span>Optical Lens Surcharge</span>
                    <span className="text-[#1A1A2E] font-extrabold">₹{lensCharges.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span className="text-green-600 font-extrabold uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded border border-green-100">FREE</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 bg-green-50/50 p-2.5 rounded-lg border border-green-100">
                    <span className="flex items-center gap-1.5">
                      <Gift className="h-4 w-4 stroke-[2]" />
                      <span>Promotional Saving</span>
                    </span>
                    <span className="font-extrabold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="h-px bg-slate-100 my-4"></div>

                <div className="flex justify-between items-center text-[#1B3F6E] font-extrabold text-lg sm:text-xl">
                  <span>Total Bill</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Coupon forms */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[11px] uppercase font-extrabold tracking-wider text-[#4A4A6A] block">
                  Promo Coupon Code
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. EYELEADS10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="border border-slate-200 focus:border-[#1B3F6E] focus:outline-none rounded-xl px-3 py-2 text-xs w-full bg-white text-[#1A1A2E] font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-[#B8952A] hover:bg-amber-600 hover:shadow-[0_0_12px_rgba(184,149,42,0.3)] text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer transition-colors shrink-0 active:scale-95"
                  >
                    Apply
                  </button>
                </form>

                {couponMessage && (
                  <div
                    className={`text-xxs font-extrabold p-3 rounded-xl mt-2 border ${
                      couponError
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-green-50 border-green-200 text-green-700'
                    }`}
                  >
                    {couponMessage}
                  </div>
                )}
              </div>

              {/* Prescription warnings */}
              {isAnyPrescriptionMissing && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-xxs font-semibold text-red-700 leading-relaxed shadow-sm">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Prescription Required!</strong> You have custom prescription lenses in your cart. Please upload Doctor RX guidelines before proceeding.
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <button
                onClick={() => {
                  if (isAnyPrescriptionMissing) return;
                  navigate('/checkout', { state: { appliedCoupon } });
                }}
                disabled={isAnyPrescriptionMissing}
                className={`w-full py-4 rounded-xl text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 ${
                  isAnyPrescriptionMissing
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-[#1B3F6E] hover:bg-[#2E6DB4] hover:shadow-[0_0_20px_rgba(27,63,110,0.3)]'
                }`}
              >
                <span>Checkout Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>



            </div>

          </div>

          {/* ========================================================================= */}
          {/* RECOMMENDED PRODUCTS CAROUSEL / SHELF */}
          {/* ========================================================================= */}
          <div className="border-t border-slate-100 pt-10 space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#B8952A] shrink-0" />
              <h2 className="text-lg font-extrabold text-[#1B3F6E] uppercase tracking-wider">Complete Your Look</h2>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${
              cartRecommendations.length === 1
                ? 'lg:grid-cols-1 max-w-sm mx-auto'
                : cartRecommendations.length === 2
                ? 'lg:grid-cols-2 max-w-2xl mx-auto'
                : cartRecommendations.length === 3
                ? 'lg:grid-cols-3 max-w-5xl mx-auto'
                : 'lg:grid-cols-4'
            } gap-6`}>
              {cartRecommendations.map((prod) => (
                <div key={prod._id || prod.id} className="h-full">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Cart;
