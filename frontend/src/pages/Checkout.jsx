import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import { getItemPriceBreakdown } from '../utils/lensPricing';
import {
  Check,
  CreditCard,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Calendar,
  ArrowRight,
  Compass,
  AlertCircle,
  Tag,
  MapPin,
  HelpCircle,
  Clock,
  ChevronRight,
  User,
  Phone,
  Hash,
  Building2,
  Map,
  Home,
  MapPinned
} from 'lucide-react';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cartItems,
    cartTotal,
    clearCart,
    cartLensCharges,
    cartSubtotal,
    cartDelivery
  } = useCart();
  const { user } = useAuth();
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [purchasedSubtotal, setPurchasedSubtotal] = useState(0);
  const [purchasedDelivery, setPurchasedDelivery] = useState(0);
  const [purchasedDiscount, setPurchasedDiscount] = useState(0);
  const [purchasedTotal, setPurchasedTotal] = useState(0);

  // Steps configuration: 0 = Info/Delivery, 1 = Payment, 2 = Confirmation
  const [currentStep, setCurrentStep] = useState(0);

  const checkoutItems = currentStep === 2 ? purchasedItems : cartItems;

  const [storeSettings, setStoreSettings] = useState(null);
  useEffect(() => {
    api.get('/api/settings').then(res => {
      if (res.data?.settings) setStoreSettings(res.data.settings);
    }).catch(() => { });
  }, []);

  const lensCharges = cartLensCharges;
  const subtotal = currentStep === 2 ? purchasedSubtotal : cartSubtotal;
  const deliveryCharge = currentStep === 2 ? purchasedDelivery : cartDelivery;

  // If no pricing data exists, boot back to cart safely
  useEffect(() => {
    if (checkoutItems.length === 0 && currentStep !== 2) {
      navigate('/cart');
    }
  }, [checkoutItems, currentStep, navigate]);

  // ==========================================
  // SHIPPING & ADDRESS FORM STATE
  // ==========================================
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    saveAddress: false
  });

  // Autofill address if user has a saved address
  useEffect(() => {
    if (user?.savedAddress) {
      const saved = user.savedAddress;
      let addr1 = saved.address || '';
      let addr2 = '';
      
      const commaParts = addr1.split(',').map(p => p.trim());
      if (commaParts.length > 1) {
        addr2 = commaParts.pop();
        addr1 = commaParts.join(', ');
      }

      setShippingAddress(prev => ({
        ...prev,
        fullName: saved.name || prev.fullName || user?.name || '',
        phone: saved.phone || prev.phone || '',
        address1: addr1,
        address2: addr2,
        city: saved.city || prev.city || '',
        state: saved.state || prev.state || '',
        pincode: saved.zipCode || prev.pincode || '',
        country: saved.country || 'India'
      }));
    }
  }, [user]);

  const [focusedField, setFocusedField] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Indian Pincodes lookup using postal API
  const handlePincodeChange = async (e) => {
    const pin = shippingAddress.country === 'India'
      ? e.target.value.replace(/\D/g, '').slice(0, 6)
      : e.target.value.slice(0, 10);
    setShippingAddress(prev => ({ ...prev, pincode: pin }));

    if (shippingAddress.country !== 'India') {
      setPincodeError('');
      return;
    }

    if (pin.length === 6) {
      setPincodeError(''); // Clear error immediately since length is valid
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success') {
          const offices = data[0].PostOffice || [];
          const postOffice = offices[0];
          // Use Block (Taluk) as the real locality name — District is the broader admin
          // district and is frequently a DIFFERENT, larger place than the actual town
          // (e.g. pincode 394160 → District "Surat" but the real town is "Mandvi",
          // which lives in postOffice.Block). Fall back to Name if Block is missing/"NA".
          const localTown = (postOffice.Block && postOffice.Block !== 'NA') ? postOffice.Block : postOffice.Name;
          setShippingAddress(prev => ({
            ...prev,
            city: localTown,
            state: postOffice.State
          }));
          toast.success(`Verified: ${localTown}, ${postOffice.State}`);
        } else {
          // Soft warning so the user can manually fill without getting blocked
          toast.info('Could not verify pincode automatically. Please type City and State manually.');
        }
      } catch (err) {
        // Soft warning for network down / blocked APIs
        toast.info('Postal directory service offline. Please type City and State manually.');
      }
    } else if (pin.length > 0) {
      setPincodeError('Pincode must be exactly 6 digits.');
    } else {
      setPincodeError('');
    }
  };

  // Live reverse geocoding Geolocation lookup
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    const isSecureContext = window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (!isSecureContext) {
      toast.error('Location detection needs a secure (https://) connection. Please open the site via https:// to use this feature.');
      return;
    }

    setIsDetectingLocation(true);

    const onSuccess = async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18&addressdetails=1`
        );
        const data = await res.json();
        if (data && data.address) {
          const detectedPin = data.address.postcode || '';
          setShippingAddress(prev => ({
            ...prev,
            address1: data.address.road || data.address.suburb || data.address.neighbourhood || prev.address1,
            pincode: detectedPin || prev.pincode
          }));

          if (detectedPin && detectedPin.length === 6) {
            // Reuse the same authoritative postal lookup as manual pincode entry
            await handlePincodeChange({ target: { value: detectedPin } });
          } else {
            setShippingAddress(prev => ({
              ...prev,
              city: data.address.city || data.address.town || data.address.county || prev.city,
              state: data.address.state || prev.state
            }));
          }
          
          if (position.coords.accuracy > 100) {
            toast.info(`Location accuracy is approximately ${Math.round(position.coords.accuracy)}m — please double-check the filled address.`);
          } else {
            toast.success('Location detected! Please double-check the filled address.');
          }
        } else {
          toast.error('Could not determine your address. Please fill manually.');
        }
      } catch (err) {
        toast.error('Could not fetch address details. Please fill manually.');
      } finally {
        setIsDetectingLocation(false);
      }
    };

    const onError = (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setIsDetectingLocation(false);
          toast.error('Location permission denied. Please enable location access in your browser settings.');
          break;
        case error.POSITION_UNAVAILABLE:
          // If high accuracy failed, try standard accuracy
          toast.info('High accuracy location unavailable. Retrying with standard accuracy...');
          navigator.geolocation.getCurrentPosition(onSuccess, (err) => {
            setIsDetectingLocation(false);
            toast.error('Location information is unavailable. Please fill manually.');
          }, { enableHighAccuracy: false, timeout: 8000 });
          break;
        case error.TIMEOUT:
          // If high accuracy timed out, try standard accuracy
          toast.info('Location request timed out. Retrying with standard accuracy...');
          navigator.geolocation.getCurrentPosition(onSuccess, (err) => {
            setIsDetectingLocation(false);
            toast.error('Location request timed out. Please fill manually.');
          }, { enableHighAccuracy: false, timeout: 8000 });
          break;
        default:
          setIsDetectingLocation(false);
          toast.error('Could not get your location. Please fill manually.');
          break;
      }
    };

    // Try with high accuracy first
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  };
  // Address Line 1 input handler
  const handleAddress1Change = (e) => {
    const val = e.target.value;
    setShippingAddress(prev => ({ ...prev, address1: val }));
  };

  // ==========================================
  // COUPON ENGINE STATE
  // ==========================================
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    return location.state?.appliedCoupon || '';
  });
  const [couponError, setCouponError] = useState('');
  const [appliedDiscountAmount, setAppliedDiscountAmount] = useState(0);

  // Validate coupon code carried over from Cart page on mount
  useEffect(() => {
    const validateCarriedCoupon = async () => {
      if (location.state?.appliedCoupon && subtotal > 0) {
        try {
          const res = await api.post('/api/coupons/validate', {
            code: location.state.appliedCoupon.trim().toUpperCase(),
            subtotal
          });
          if (res.data.isValid) {
            setAppliedCoupon(location.state.appliedCoupon.trim().toUpperCase());
            setAppliedDiscountAmount(res.data.discount);
          } else {
            setAppliedCoupon('');
            setAppliedDiscountAmount(0);
          }
        } catch (err) {
          console.error('Failed to validate carried coupon on checkout mount:', err);
          setAppliedCoupon('');
          setAppliedDiscountAmount(0);
        }
      }
    };
    validateCarriedCoupon();
  }, [location.state?.appliedCoupon, subtotal]);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code.'); return; }
    try {
      const res = await api.post('/api/coupons/validate', { code, subtotal });
      if (res.data.isValid) {
        setAppliedCoupon(code);
        setAppliedDiscountAmount(res.data.discount);
        setCouponError('');
      } else {
        setAppliedCoupon('');
        setAppliedDiscountAmount(0);
        setCouponError(res.data.message);
      }
    } catch (err) {
      setCouponError('Could not validate coupon right now. Please try again.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    setAppliedDiscountAmount(0);
    setCouponCode('');
  };

  const discountAmount = currentStep === 2 ? purchasedDiscount : (appliedCoupon ? appliedDiscountAmount : 0);

  // Calculations derived dynamically from applied coupons
  // GST completely removed from frontend checkout
  const finalSubtotal = subtotal;
  const finalDiscount = discountAmount;
  const finalShipping = deliveryCharge;
  const gstRate = 0;
  const gstAmount = 0;
  const totalDue = currentStep === 2 ? purchasedTotal : Math.max(0, finalSubtotal - finalDiscount + finalShipping);

  // ==========================================
  // STEP 2 - PAYMENT STATE (UPI-First)
  // ==========================================
  const [payMethod, setPayMethod] = useState('Razorpay');
  const [emiTenure, setEmiTenure] = useState('3');

  // Confirmation Order credentials
  const [orderId, setOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

  // Submit delivery form
  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (pincodeError) return;

    // FIXED: "Save address to profile" checkbox does nothing
    if (shippingAddress.saveAddress && user) {
      try {
        await api.put('/api/auth/profile', {
          savedAddress: {
            name: shippingAddress.fullName,
            phone: shippingAddress.phone,
            address: shippingAddress.address1 + (shippingAddress.address2 ? ', ' + shippingAddress.address2 : ''),
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.pincode,
            country: shippingAddress.country
          }
        });
        toast.success('Address saved to your profile!');
      } catch (err) {
        console.error('Could not save address:', err);
      }
    }

    setCurrentStep(1); // Proceed to Payment
  };

  // Submit payment form
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Map local cart elements to the exact backend order schema items structure
      const orderItems = checkoutItems.map(item => ({
        name: item.product.name,
        qty: item.quantity,
        image: item.product.image,
        price: item.product.price,
        options: {
          lensType: item.options?.lensType || '',
          prescriptionDetails: item.options?.prescriptionDetails || '',
          color: item.options?.color || 'Default Classic',
          size: item.options?.size || 'Medium (Standard)',
          rxAttached: item.options?.rxAttached || '',
          pdEntered: item.options?.pdEntered || '',
          prescriptionData: item.options?.prescriptionData || null
        },
        product: item.product._id || item.product.id
      }));

      // 2. Format shipping address for both Mongoose model storage and Admin view rendering
      // FIXED: Order model missing email in shippingAddress but track order needs it
      const mappedAddress = {
        name: shippingAddress.fullName,
        email: user?.email || '',
        address: shippingAddress.address1 + (shippingAddress.address2 ? ', ' + shippingAddress.address2 : ''),
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.pincode,
        pincode: shippingAddress.pincode,
        phone: shippingAddress.phone,
        country: shippingAddress.country
      };

      // 3. Fire POST request to register the new order on the backend registry using central api
      const response = await api.post('/api/orders', {
        orderItems,
        shippingAddress: mappedAddress,
        paymentMethod: 'Razorpay',
        itemsPrice: finalSubtotal,
        discountPrice: finalDiscount,
        couponCode: appliedCoupon,
        shippingPrice: finalShipping,
        totalPrice: totalDue
      });

      if (response.data && response.data.status === 'success') {
        const createdOrder = response.data.order;
        const newOrderId = createdOrder._id || createdOrder.id;

        if (response.data.mockPayment) {
          // Database was offline when this order was created — do not open the real
          // Razorpay widget with a fake order_id, it will be rejected by Razorpay's servers.
          toast.error('Payment system is temporarily in demo mode. Please try again shortly or contact support.');
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_razorpay_key_id',
          amount: response.data.amount,
          currency: response.data.currency,
          order_id: response.data.razorpayOrderId,
          name: 'EyeLeads',
          description: `Order ${createdOrder.orderNumber}`,
          prefill: {
            name: shippingAddress.fullName,
            email: user?.email || '',
            // Razorpay expects the phone number in full +{country code}{number} format.
            // shippingAddress.phone is stored as a plain 10-digit string (see the onChange
            // handler at ~L629), so explicitly prefix +91 rather than relying on Razorpay's
            // undocumented fallback behavior, which can pick up the wrong country.
            contact: shippingAddress.phone ? `+91${shippingAddress.phone}` : ''
          },
          handler: async function (rzpResponse) {
            try {
              await api.put(`/api/orders/${newOrderId}/pay`, {
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_signature: rzpResponse.razorpay_signature
              });
              setOrderId(newOrderId);
              setOrderNumber(createdOrder.orderNumber || '');

              // Save items and summary for confirmation screen display before clearing cart
              setPurchasedItems(cartItems);
              setPurchasedSubtotal(cartSubtotal);
              setPurchasedDelivery(cartDelivery);
              setPurchasedDiscount(appliedCoupon ? appliedDiscountAmount : 0);
              setPurchasedTotal(totalDue);

              // Compute delivery window (approx 4 days out)
              const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
              const date = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', dateOptions);
              setEstimatedDeliveryDate(date);

              setCurrentStep(2);
              clearCart();
            } catch (verifyErr) {
              toast.error('Payment verification failed. Please contact support with your order number.');
            }
          },
          modal: {
            ondismiss: function () {
              toast.info('Payment cancelled. You can try again.');
            }
          },
          theme: { color: '#1B3F6E' }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failResponse) {
          toast.error('Payment failed: ' + (failResponse.error?.description || 'Please try again.'));
        });
        rzp.open();
      } else {
        throw new Error('API server returned unsuccessful creation status');
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  // Dynamic delivery estimate for order recap card
  const getRecapDeliveryDay = () => {
    const options = { month: 'short', day: 'numeric' };
    const date = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', options);
    return date;
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] animate-fadeIn pb-24 select-none">

      {/* 1. COMPACT PREMIUM HEADER */}
      <header className="bg-white border-b border-slate-100 py-6 mb-10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1">
            <span className="font-extrabold text-navy-dark text-lg uppercase tracking-widest" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
              Eye<span className="text-[#B8952A] italic">Lead</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xxs font-bold uppercase tracking-wider text-slate-400">
            <Lock className="h-3.5 w-3.5 text-[#B8952A]" />
            <span>Secure 256-Bit SSL Checkout</span>
          </div>
        </div>
      </header>

      {/* 2. SLICK PROGRESS LINE INDICATOR */}
      <div className="max-w-xl mx-auto mb-10 px-4 select-none">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 -z-10"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#1B3F6E] transition-all duration-500 -z-10"
            style={{ width: `${currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : '100%'}` }}
          ></div>

          {['Delivery', 'Payment', 'Review'].map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div key={step} className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${isCompleted
                      ? 'bg-[#1B3F6E] border-[#1B3F6E] text-white shadow-sm'
                      : isActive
                        ? 'bg-[#1B3F6E] border-[#1B3F6E] text-white ring-4 ring-[#1B3F6E]/10'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : idx + 1}
                </div>
                <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isActive ? 'text-[#1B3F6E]' : 'text-slate-400'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ==========================================
            STEP 1 — DELIVERY INFO FLOW
           ========================================== */}
        {currentStep === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Shipping Details Form (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Standard Form Container */}
              <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-slate-100 shadow-luxury space-y-8 select-none relative">

                {/* Header: eyebrow + serif heading + Use Current Location */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-1">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B8952A] block mb-1.5">
                      Step 01 · Delivery Details
                    </span>
                    <h3 className="font-serif text-xl text-[#0F2744] flex items-center gap-2.5">
                      <Truck className="h-5 w-5 text-[#1B3F6E] shrink-0" />
                      Shipping Information
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1B3F6E] border border-[#1B3F6E]/15 hover:border-[#B8952A] hover:text-[#B8952A] bg-[#EAF0F8] hover:bg-amber-50 px-3.5 py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-50 select-none active-scale-premium shrink-0"
                  >
                    <MapPin className={`h-3.5 w-3.5 ${isDetectingLocation ? 'animate-pulse' : ''}`} />
                    <span>{isDetectingLocation ? 'Locating...' : 'Use Current Location'}</span>
                  </button>
                </div>

                <form onSubmit={handleDeliverySubmit} className="space-y-8">

                  {/* ===== Group: Contact Details ===== */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B8952A] shrink-0">Contact Details</span>
                      <div className="h-px flex-1 bg-slate-100"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div>
                        <label className="flex items-center gap-1 text-[11px] font-bold text-[#4A4A6A] uppercase tracking-wider mb-1.5">
                          Full Name <span className="text-[#B8952A]">*</span>
                        </label>
                        <div className="relative">
                          <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${focusedField === 'fullName' ? 'text-[#B8952A]' : 'text-slate-300'}`} />
                          <input
                            type="text"
                            required
                            value={shippingAddress.fullName}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                            onFocus={() => setFocusedField('fullName')}
                            onBlur={() => setFocusedField('')}
                            placeholder="e.g. Priya Sharma"
                            className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="flex items-center gap-1 text-[11px] font-bold text-[#4A4A6A] uppercase tracking-wider mb-1.5">
                          Phone Number <span className="text-[#B8952A]">*</span>
                        </label>
                        <div className="relative">
                          <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${focusedField === 'phone' ? 'text-[#B8952A]' : 'text-slate-300'}`} />
                          <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            maxLength={10}
                            value={shippingAddress.phone}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField('')}
                            placeholder="10-digit mobile number"
                            className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ===== Group: Delivery Address ===== */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B8952A] shrink-0">Delivery Address</span>
                      <div className="h-px flex-1 bg-slate-100"></div>
                    </div>

                    {/* Country selection */}
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-bold text-[#4A4A6A] uppercase tracking-wider mb-1.5">
                        Country <span className="text-[#B8952A]">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${focusedField === 'country' ? 'text-[#B8952A]' : 'text-slate-300'}`} />
                        <select
                          required
                          value={shippingAddress.country}
                          onChange={(e) => {
                            const newCountry = e.target.value;
                            setShippingAddress(prev => ({ 
                              ...prev, 
                              country: newCountry,
                              pincode: '', 
                              city: '', 
                              state: '' 
                            }));
                            setPincodeError('');
                          }}
                          onFocus={() => setFocusedField('country')}
                          onBlur={() => setFocusedField('')}
                          className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] font-bold appearance-none cursor-pointer"
                        >
                          <option value="India">India (Domestic)</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Other">Other International Country</option>
                        </select>
                      </div>
                    </div>

                    {/* Pincode */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="flex items-center gap-1 text-[11px] font-bold text-[#4A4A6A] uppercase tracking-wider">
                          Pincode <span className="text-[#B8952A]">*</span>
                        </label>
                        {shippingAddress.country === 'India' && shippingAddress.city && !pincodeError && (
                          <span className="flex items-center gap-1 text-[11px] font-extrabold text-green-600 uppercase tracking-wide">
                            <Check className="h-3 w-3 stroke-[3]" />
                            Verified via India Post
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Hash className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${focusedField === 'pincode' ? 'text-[#B8952A]' : 'text-slate-300'}`} />
                        <input
                          type="text"
                          required
                          maxLength="6"
                          value={shippingAddress.pincode}
                          onChange={handlePincodeChange}
                          onFocus={() => setFocusedField('pincode')}
                          onBlur={() => setFocusedField('')}
                          placeholder="6-digit PIN, e.g. 394160"
                          className={`w-full border focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold ${pincodeError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-[#B8952A]'
                            }`}
                        />
                      </div>
                      {pincodeError && (
                        <span className="text-[11px] text-red-500 font-semibold mt-1.5 flex items-center gap-1 select-none">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          <span>{pincodeError}</span>
                        </span>
                      )}
                    </div>

                    {/* City + State */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="flex items-center gap-1 text-[11px] font-bold text-[#4A4A6A] uppercase tracking-wider mb-1.5">
                          City <span className="text-[#B8952A]">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${focusedField === 'city' ? 'text-[#B8952A]' : 'text-slate-300'}`} />
                          <input
                            type="text"
                            required
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                            onFocus={() => setFocusedField('city')}
                            onBlur={() => setFocusedField('')}
                            placeholder="City"
                            className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-1 text-[11px] font-bold text-[#4A4A6A] uppercase tracking-wider mb-1.5">
                          State <span className="text-[#B8952A]">*</span>
                        </label>
                        <div className="relative">
                          <Map className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${focusedField === 'state' ? 'text-[#B8952A]' : 'text-slate-300'}`} />
                          <input
                            type="text"
                            required
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                            onFocus={() => setFocusedField('state')}
                            onBlur={() => setFocusedField('')}
                            placeholder="State"
                            className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Line 1 */}
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-bold text-[#4A4A6A] uppercase tracking-wider mb-1.5">
                        Address Line 1 <span className="text-[#B8952A]">*</span>
                      </label>
                      <div className="relative">
                        <Home className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${focusedField === 'address1' ? 'text-[#B8952A]' : 'text-slate-300'}`} />
                        <input
                          type="text"
                          required
                          value={shippingAddress.address1}
                          onChange={handleAddress1Change}
                          onFocus={() => setFocusedField('address1')}
                          onBlur={() => setTimeout(() => setFocusedField(''), 250)}
                          placeholder="Flat / House No., Building, Landmark"
                          className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                        />
                      </div>
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label className="flex items-center gap-1 text-[11px] font-bold text-[#4A4A6A] uppercase tracking-wider mb-1.5">
                        Address Line 2 <span className="text-slate-300 font-semibold normal-case tracking-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <MapPinned className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                        <input
                          type="text"
                          value={shippingAddress.address2}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, address2: e.target.value })}
                          placeholder="Area, Street, Locality"
                          className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl pl-10 pr-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save address + Submit */}
                  <div className="space-y-5 pt-1">
                    <label htmlFor="saveAddress" className="flex items-center gap-2.5 cursor-pointer select-none group">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={shippingAddress.saveAddress}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, saveAddress: e.target.checked })}
                        className="rounded text-[#1B3F6E] focus:ring-[#1B3F6E] h-4.5 w-4.5 border-slate-300"
                      />
                      <span className="text-xs font-semibold text-[#4A4A6A] group-hover:text-[#1A1A2E] transition-colors">
                        Save this address to my profile
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="w-full bg-[#1B3F6E] hover:bg-[#0F2744] hover:shadow-lg text-white py-4.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow active-scale-premium transform transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Continue to Payment</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>

              </div>
            </div>

            {/* Right: Sticky Order Summary & Coupon Engine (4 Columns) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

              {/* Coupon Engine */}
              <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-luxury space-y-4 select-none">
                <h4 className="text-xxs font-extrabold uppercase tracking-widest text-[#1B3F6E]">Have a Promocode?</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter Coupon (e.g. LUXURY10)"
                    className="flex-1 border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl px-3.5 py-2 text-xxs bg-slate-50 focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="bg-[#1B3F6E] hover:bg-sky-hover text-white px-4 py-2 rounded-xl text-xxs font-extrabold uppercase tracking-wider cursor-pointer active-scale-premium shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-500 font-semibold flex items-center gap-1 select-none">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}
                {appliedCoupon && (
                  <div className="bg-green-50 border border-green-200 px-3.5 py-2 rounded-xl flex justify-between items-center text-xxs font-bold text-green-700 animate-fadeIn select-none">
                    <span>Applied: {appliedCoupon}</span>
                    <button type="button" onClick={removeCoupon} className="text-[11px] text-red-500 uppercase hover:underline shrink-0">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Order Recap summary details */}
              <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-luxury space-y-6 select-none">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-navy-dark text-sm uppercase tracking-widest">
                    Order Summary
                  </h3>
                  <span className="text-[11px] text-[#B8952A] font-extrabold uppercase tracking-widest block mt-1">Est. Delivery: {getRecapDeliveryDay()}</span>
                </div>

                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                  {checkoutItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 justify-between items-start text-xs">
                      <div className="flex gap-3 items-start min-w-0">
                        <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl p-1 flex items-center justify-center shrink-0">
                          <img src={item.product.image} alt={item.product.name} loading="lazy" className="max-h-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-[#1A1A2E] leading-tight truncate">{item.product.name}</h4>
                          <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">Qty: {item.quantity} · {item.options?.lensType || 'Frame'}</span>

                          {/* Lens add-ons breakdown */}
                          {item.options?.lensType && (
                            <div className="mt-1.5 pl-2 border-l-2 border-slate-100 space-y-0.5 text-[11px] font-bold text-slate-400 select-none">
                              {(() => {
                                const { isPrescription, opticianFee, addOnPrice, basePrice, typeDetail, materialDetail, featuresList } = getItemPriceBreakdown(item, storeSettings);

                                if (isPrescription) {
                                  return (
                                    <>
                                      <div className="flex justify-between gap-4">
                                        <span>• Base Frame:</span>
                                        <span className="text-slate-500">₹{basePrice.toLocaleString('en-IN')}</span>
                                      </div>
                                      {opticianFee > 0 && (
                                        <div className="flex justify-between gap-4">
                                          <span>• Optician Prescription Fee:</span>
                                          <span className="text-slate-500">+₹{opticianFee.toLocaleString('en-IN')}</span>
                                        </div>
                                      )}
                                      {typeDetail.price > 0 && (
                                        <div className="flex justify-between gap-4">
                                          <span>• {typeDetail.name}:</span>
                                          <span className="text-slate-500">+₹{typeDetail.price.toLocaleString('en-IN')}</span>
                                        </div>
                                      )}
                                      {materialDetail.price > 0 && (
                                        <div className="flex justify-between gap-4">
                                          <span>• {materialDetail.name}:</span>
                                          <span className="text-slate-500">+₹{materialDetail.price.toLocaleString('en-IN')}</span>
                                        </div>
                                      )}
                                      {featuresList.map((feat, fi) => {
                                        if (feat.price <= 0) return null;
                                        return (
                                          <div key={fi} className="flex justify-between gap-4">
                                            <span>• {feat.name}:</span>
                                            <span className="text-slate-500">+₹{feat.price.toLocaleString('en-IN')}</span>
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
                      <span className="font-extrabold text-[#1B3F6E] shrink-0 pt-0.5">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-[#4A4A6A]">
                  <div className="flex justify-between">
                    <span>Cart Subtotal</span>
                    <span className="text-[#1A1A2E] font-extrabold">₹{finalSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {finalDiscount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Total Savings</span>
                      <span className="font-extrabold">-₹{finalDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-green-600 font-extrabold uppercase">FREE Express</span>
                  </div>
                  {/* GST removed */}
                  <div className="flex justify-between text-[#1B3F6E] font-black text-[15px] pt-3 border-t border-slate-100/60">
                    <span>Total Due</span>
                    <span>₹{totalDue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Secure trust indicators list */}
              <div className="grid grid-cols-2 gap-3 text-center text-[11px] text-[#4A4A6A] font-bold uppercase tracking-wider select-none">
                <div className="flex flex-col items-center gap-1.5 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xxs">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#1B3F6E]" />
                  <span>Money-back Guarantee</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xxs">
                  <Truck className="h-4.5 w-4.5 text-[#1B3F6E]" />
                  <span>FREE express shipping</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            STEP 2 — PAYMENT SECTOR (UPI-First)
           ========================================== */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Razorpay Simulated Gateway (8 Columns) */}
            <div className="lg:col-span-8 bg-white p-8 sm:p-10 rounded-[32px] border border-slate-100 shadow-luxury space-y-6 select-none relative">
              <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-[#1B3F6E] text-sm uppercase tracking-widest">
                    Simulated Payment Gateway
                  </h3>
                  <span className="text-slate-400 text-xxs font-extrabold uppercase tracking-widest mt-1 block">Razorpay Secures transaction</span>
                </div>
                <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#B8952A] shadow-sm shrink-0">
                  <Lock className="h-4.5 w-4.5" />
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">

                <div className="space-y-4">
                  {/* Razorpay Main Option */}
                  <div
                    onClick={() => setPayMethod('Razorpay')}
                    className={`border rounded-2xl p-5 cursor-pointer flex flex-col gap-4 transition-all ${payMethod === 'Razorpay'
                        ? 'border-[#1B3F6E] bg-[#1B3F6E]/5 ring-1 ring-[#1B3F6E] shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-3 font-extrabold text-xs uppercase tracking-wider text-[#1A1A2E]">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${payMethod === 'Razorpay' ? 'border-[#1B3F6E] bg-[#1B3F6E]' : 'border-slate-300'
                        }`}>
                        {payMethod === 'Razorpay' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                      </div>
                      <span>Razorpay Secure Checkout</span>
                    </div>
                    {payMethod === 'Razorpay' && (
                      <p className="pl-8 text-xxs text-[#4A4A6A] leading-relaxed font-semibold animate-fadeIn">
                        You'll securely enter your payment details (UPI, Card, Netbanking, Wallets) in the next step via Razorpay.
                      </p>
                    )}
                  </div>

                  {/* Easy EMI Option */}
                  <div
                    onClick={() => setPayMethod('emi')}
                    className={`border rounded-2xl p-5 cursor-pointer flex flex-col gap-4 transition-all ${payMethod === 'emi'
                        ? 'border-[#1B3F6E] bg-[#1B3F6E]/5 ring-1 ring-[#1B3F6E] shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center gap-3 font-extrabold text-xs uppercase tracking-wider text-[#1A1A2E]">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${payMethod === 'emi' ? 'border-[#1B3F6E] bg-[#1B3F6E]' : 'border-slate-300'
                        }`}>
                        {payMethod === 'emi' && <Check className="h-3 w-3 text-white stroke-[3]" />}
                      </div>
                      <span>Simulated Easy EMI Installments</span>
                    </div>
                    {payMethod === 'emi' && (
                      <div className="pl-8 animate-fadeIn">
                        <label className="text-[11px] uppercase font-extrabold tracking-widest text-[#4A4A6A] block mb-1.5">
                          Choose Installment Tenure
                        </label>
                        <select
                          value={emiTenure}
                          onChange={(e) => setEmiTenure(e.target.value)}
                          className="max-w-xs w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl px-4 py-3 text-xs bg-white text-[#1A1A2E] font-bold cursor-pointer"
                        >
                          <option value="3">3 Months @ ₹{(totalDue / 3).toFixed(0)}/month</option>
                          <option value="6">6 Months @ ₹{(totalDue / 6).toFixed(0)}/month</option>
                          <option value="9">9 Months @ ₹{(totalDue / 9).toFixed(0)}/month</option>
                          <option value="12">12 Months @ ₹{(totalDue / 12).toFixed(0)}/month</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-green-700 text-xxs font-extrabold uppercase tracking-wider">
                    <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                    <span>256-bit secure gateway</span>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#1B3F6E] hover:bg-amber-600 hover:shadow-lg text-white px-10 py-4.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow active-scale-premium transform transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>Securely Pay ₹{totalDue.toLocaleString('en-IN')}</span>
                  </button>
                </div>
              </form>

            </div>

            {/* Right Column: Sticky Summary and address verification (4 Columns) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-[24px] border border-slate-100 shadow-luxury space-y-6 sticky top-24 select-none">

              {/* Destination */}
              <div>
                <h3 className="font-extrabold text-navy-dark text-sm uppercase tracking-widest border-b border-slate-50 pb-3 mb-4">
                  Delivery Destination
                </h3>
                <div className="text-xxs font-extrabold text-[#4A4A6A] space-y-1.5 leading-relaxed uppercase tracking-wider">
                  <p className="font-black text-[#1A1A2E]">{shippingAddress.fullName}</p>
                  <p>+91 {shippingAddress.phone}</p>
                  <p className="line-clamp-2">{shippingAddress.address1}, {shippingAddress.address2}</p>
                  <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(0)}
                className="text-xxs font-extrabold text-[#B8952A] uppercase tracking-widest hover:underline block cursor-pointer select-none active-scale-premium"
              >
                Edit Shipping Address
              </button>

              <div className="border-t border-slate-100 pt-5 space-y-3 select-none">
                <h4 className="text-[11px] font-extrabold text-[#1B3F6E] uppercase tracking-widest">Order Summary</h4>
                {(() => {
                  let totalFrames = 0;
                  let totalOpticianFees = 0;
                  let totalAddOns = 0;

                  checkoutItems.forEach(item => {
                    const { isPrescription, opticianFee, addOnPrice, basePrice } = getItemPriceBreakdown(item, storeSettings);

                    totalFrames += basePrice * item.quantity;
                    totalOpticianFees += opticianFee * item.quantity;
                    totalAddOns += addOnPrice * item.quantity;
                  });

                  return (
                    <div className="space-y-2 text-xxs font-bold text-[#4A4A6A]">
                      <div className="flex justify-between font-black text-slate-700">
                        <span>Subtotal</span>
                        <span>₹{finalSubtotal.toLocaleString('en-IN')}</span>
                      </div>

                      {subtotal >= 3000 && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-800 text-[11px] font-bold leading-relaxed flex items-center gap-2">
                          <span>🎁 You've unlocked a FREE Eco-Friendly Lens Cleaning Kit (worth ₹299)!</span>
                        </div>
                      )}

                      {/* FIXED: Dynamic billing details with lens addon price breakdown */}
                      <div className="pl-3.5 space-y-1.5 text-[11px] text-slate-400 font-bold border-l-2 border-slate-100 ml-1">
                        {checkoutItems.map((item, idx) => {
                          const { basePrice } = getItemPriceBreakdown(item, storeSettings);
                          return (
                            <div key={idx} className="flex justify-between gap-4">
                              <span className="truncate max-w-[170px]">• {item.product.name} Base:</span>
                              <span>₹{(basePrice * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          );
                        })}
                        {totalOpticianFees > 0 && (
                          <div className="flex justify-between">
                            <span>Optician Prescription Fees:</span>
                            <span>+ ₹{totalOpticianFees.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {totalAddOns > 0 && (
                          <div className="flex justify-between">
                            <span>Lens Premium Add-ons:</span>
                            <span>+ ₹{totalAddOns.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                      </div>

                      {finalDiscount > 0 && (
                        <div className="flex justify-between text-green-700">
                          <span>Applied Savings</span>
                          <span>-₹{finalDiscount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Express Shipping</span>
                        <span className="text-green-600 font-extrabold uppercase">FREE</span>
                      </div>
                      {/* GST removed */}
                      <div className="flex justify-between text-[#1B3F6E] font-black text-xs pt-2.5 border-t border-slate-100">
                        <span>Final Amount Due</span>
                        <span>₹{totalDue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            STEP 3 — CONFIRMATION PAGE
           ========================================== */}
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto bg-white rounded-[32px] border border-slate-100 p-8 sm:p-12 text-center space-y-8 animate-fadeIn select-none shadow-luxury">

            {/* Animated checkout ring checkmark */}
            <div className="flex justify-center select-none animate-float">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600 shadow-sm">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-[#1B3F6E] tracking-tight">Order Placed Successfully! 🎉</h2>
              <p className="text-xs text-[#4A4A6A] leading-relaxed max-w-sm mx-auto font-semibold">
                Thank you for choosing EyeLeads. Your transaction is approved and order details have been dispatched to your email address.
              </p>
            </div>

            {/* Simulated Order Number display */}
            <div className="bg-[#F5F7FA] rounded-2xl p-4.5 max-w-xs mx-auto border border-slate-100 space-y-1">
              <span className="text-[11px] uppercase font-extrabold text-[#4A4A6A] tracking-widest block leading-none">Order Reference Number</span>
              <span className="font-mono font-black text-[#1B3F6E] text-base sm:text-lg block tracking-wider mt-1">{orderNumber || orderId}</span>
            </div>

            {/* List ordered items in detail */}
            <div className="border border-slate-100 rounded-2xl overflow-hidden text-left text-xs select-none">
              <div className="bg-slate-50 px-4 py-3 font-extrabold text-[#1B3F6E] text-[11px] uppercase tracking-widest border-b border-slate-100">
                Purchased Items Summary
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                {checkoutItems.map((item, idx) => (
                  <div key={idx} className="px-4 py-3.5 flex flex-col gap-2 bg-white">
                    <div className="flex justify-between items-center gap-4 text-slate-700 font-bold">
                      <div className="flex items-center gap-3">
                        <span className="text-xxs text-slate-400 font-extrabold uppercase">x{item.quantity}</span>
                        <span className="truncate max-w-[180px]">{item.product.name}</span>
                      </div>
                      <span className="font-extrabold text-[#1B3F6E]">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                    {/* Itemized pricing breakdown on confirmation */}
                    {item.options?.lensType && (
                      <div className="pl-6 text-[11px] text-slate-400 space-y-0.5 font-bold">
                        {(() => {
                          const { isPrescription, opticianFee, addOnPrice, basePrice, typeDetail, materialDetail, featuresList } = getItemPriceBreakdown(item, storeSettings);

                          if (isPrescription) {
                            return (
                              <>
                                <div className="flex justify-between max-w-xs">
                                  <span>Base Frame:</span>
                                  <span className="text-slate-600">₹{basePrice.toLocaleString('en-IN')}</span>
                                </div>
                                {opticianFee > 0 && (
                                  <div className="flex justify-between max-w-xs">
                                    <span>• Optician Prescription Fee:</span>
                                    <span className="text-slate-600">+ ₹{opticianFee.toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                {typeDetail.price > 0 && (
                                  <div className="flex justify-between max-w-xs">
                                    <span>• {typeDetail.name}:</span>
                                    <span className="text-slate-600">+ ₹{typeDetail.price.toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                {materialDetail.price > 0 && (
                                  <div className="flex justify-between max-w-xs">
                                    <span>• {materialDetail.name}:</span>
                                    <span className="text-slate-600">+ ₹{materialDetail.price.toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                {featuresList.map((feat, fi) => {
                                  if (feat.price <= 0) return null;
                                  return (
                                    <div key={fi} className="flex justify-between max-w-xs">
                                      <span>• {feat.name}:</span>
                                      <span className="text-slate-600">+ ₹{feat.price.toLocaleString('en-IN')}</span>
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
                ))}
              </div>
              <div className="bg-slate-50/70 px-4 py-3.5 flex justify-between items-center font-black text-[#1B3F6E] border-t border-slate-100 text-xs select-none">
                <span>Total Amount Dispatched</span>
                <span>₹{totalDue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Final dynamic delivery date slider */}
            <div className="flex justify-center items-center gap-4 border border-slate-100 p-4 rounded-2xl max-w-md mx-auto bg-slate-50/50">
              <div className="bg-[#EAF0F8] p-3 rounded-full text-[#1B3F6E] inline-block shrink-0">
                <Calendar className="h-6 w-6 text-[#1B3F6E]" />
              </div>
              <div className="text-left text-xs select-none">
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Optimum delivery window</span>
                <p className="text-navy-dark font-extrabold block mt-1.5 leading-tight">Arriving on {estimatedDeliveryDate}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 select-none">
              <Link
                to={`/orders/${orderId}`}
                className="bg-[#1B3F6E] hover:bg-[#2E6DB4] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow active-scale-premium text-center"
              >
                Track Order
              </Link>
              <Link
                to="/shop"
                className="border border-slate-200 hover:bg-slate-50 text-[#4A4A6A] px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest active-scale-premium text-center"
              >
                Continue Shopping
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Checkout;
