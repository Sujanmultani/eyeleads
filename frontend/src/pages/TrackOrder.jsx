import React, { useState } from 'react';
import { Search, Loader, AlertCircle, CheckCircle, Package, Truck, ShieldCheck, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!orderNumber || !email) return;
    
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await api.get(`/api/orders/track`, {
        params: {
          orderNumber: orderNumber.trim().toUpperCase(),
          email: email.trim().toLowerCase()
        }
      });

      if (response.data && response.data.status === 'success') {
        setOrderData(response.data);
      } else {
        setError('Order details could not be parsed.');
      }
    } catch (err) {
      console.error('Tracking query failed:', err);
      setError(err.response?.data?.message || 'Order not found. Please double-check your Order Reference and Email address.');
    } finally {
      setLoading(false);
    }
  };

  // Maps the new deliveryStatus enum to a 4-stage timeline:
  // 1 = Placed, 2 = Assembled/Processing, 3 = Shipped/In Transit/Out for Delivery, 4 = Delivered
  const getFulfillmentStep = (statusLabel) => {
    if (statusLabel === 'Delivered') return 4;
    if (['Pickup Scheduled', 'Shipped', 'In Transit', 'Out for Delivery'].includes(statusLabel)) return 3;
    if (['Processing', 'Ready to Ship'].includes(statusLabel)) return 2;
    return 1; // Payment Pending / Not Ready
  };

  const formattedDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="animate-fadeIn bg-[#F8FAFC] py-16 sm:py-24 select-none min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {!orderData ? (
          /* SEARCH WIDGET CARD */
          <div className="bg-white p-8 sm:p-12 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[#B8952A] text-xxs font-extrabold uppercase tracking-widest block">EyeLeads Logistics</span>
              <h1 className="text-2xl font-extrabold text-[#0F2744] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Track Your Order
              </h1>
              <p className="text-xs text-slate-400 font-semibold max-w-xs mx-auto mt-1 leading-normal">
                Enter your reference order number and email address to view delivery timeline logs.
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="space-y-5 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="space-y-2">
                <label className="text-[11px]">Order Reference Number</label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. EL-20260601-XK9P2"
                  className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary placeholder-slate-300 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px]">Registered Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@gmail.com"
                  className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary placeholder-slate-300 font-bold"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-150 rounded-xl text-rose-700 text-[11px] font-semibold tracking-normal normal-case leading-relaxed select-text">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-600 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1B3F6E] hover:bg-amber-600 hover:shadow-lg disabled:opacity-50 text-white py-4 rounded-xl font-extrabold text-xs uppercase tracking-widest shadow cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin text-white" />
                    <span>Locating Package...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 text-white" />
                    <span>Locate My Order</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ORDER TIMELINE DETAILS */
          <div className="bg-white p-8 sm:p-12 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-8 animate-fadeIn">
            
            {/* Header / Subtitles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
              <div className="space-y-1">
                <button 
                  onClick={() => setOrderData(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-[#1B3F6E] transition-colors mb-2 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Search Again</span>
                </button>
                <h2 className="text-2xl font-extrabold text-[#0F2744] tracking-tight">Fulfillment Status</h2>
                <p className="text-xs text-slate-400 font-mono">Reference: {orderData.orderNumber}</p>
              </div>

              <div className="bg-[#B8952A]/10 border border-[#B8952A]/30 px-4 py-2 rounded-xl text-center">
                <span className="text-[11px] text-[#B8952A] font-extrabold uppercase tracking-widest block">Ordered On</span>
                <span className="text-xs font-black text-[#1B3F6E] block mt-0.5">{formattedDate(orderData.createdAt)}</span>
              </div>
            </div>

            {/* Fulfilment Timeline Step Indicator */}
            <div className="relative py-6 max-w-xl mx-auto">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-[#B8952A] -translate-y-1/2 z-0 transition-all duration-700"
                style={{ 
                  width: `${Math.max((getFulfillmentStep(orderData.statusLabel) - 1) / 3 * 100, 5)}%`
                }}
              ></div>

              <div className="relative z-10 flex justify-between">
                {/* Step 1: Placed */}
                <div className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                    <CheckCircle className="h-4.5 w-4.5 fill-current" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Placed</span>
                </div>

                {/* Step 2: Custom Optical assembly */}
                <div className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center border shadow-sm shrink-0 ${
                    getFulfillmentStep(orderData.statusLabel) >= 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    getFulfillmentStep(orderData.statusLabel) >= 2 ? 'text-slate-700' : 'text-slate-400'
                  }`}>Assembled</span>
                </div>

                {/* Step 3: Shipped */}
                <div className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center border shadow-sm shrink-0 ${
                    getFulfillmentStep(orderData.statusLabel) >= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    getFulfillmentStep(orderData.statusLabel) >= 3 ? 'text-slate-700' : 'text-slate-400'
                  }`}>Shipped</span>
                </div>

                {/* Step 4: Delivered */}
                <div className="flex flex-col items-center gap-2 bg-white px-2">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center border shadow-sm shrink-0 ${
                    getFulfillmentStep(orderData.statusLabel) === 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <CheckCircle className="h-4.5 w-4.5" />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    getFulfillmentStep(orderData.statusLabel) === 4 ? 'text-slate-700' : 'text-slate-400'
                  }`}>Delivered</span>
                </div>
              </div>
            </div>

            {/* Details Split Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-t border-slate-100 pt-8">
              
              {/* Shipping Address coordinates */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-[#0F2744] uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2">
                  <Package className="h-4.5 w-4.5 text-[#B8952A]" />
                  <span>Shipment Destination</span>
                </h3>
                {orderData.shippingAddress ? (
                  <div className="text-xs font-bold text-[#4A4A6A] space-y-1.5">
                    <p className="text-slate-800 text-sm font-black">{orderData.shippingAddress.fullName || orderData.shippingAddress.name}</p>
                    <p className="leading-relaxed">{orderData.shippingAddress.address}</p>
                    <p>{orderData.shippingAddress.city}, {orderData.shippingAddress.state} - {orderData.shippingAddress.pincode || orderData.shippingAddress.zipCode}</p>
                    <p className="text-[11px] text-slate-400 font-bold tracking-wider pt-1 uppercase">📞 Mobile: {orderData.shippingAddress.phone}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-xs">No address coordinates logged.</p>
                )}
              </div>

              {/* Billing Summary cost */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-[#0F2744] uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2">
                  <Calendar className="h-4.5 w-4.5 text-[#B8952A]" />
                  <span>Transaction Overview</span>
                </h3>
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-2.5 text-xs text-[#4A4A6A] font-bold">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 uppercase">Fulfillment State</span>
                    <span className="text-[#0F2744] font-black uppercase tracking-wider text-[11px] bg-[#0F2744]/10 px-2 py-0.5 rounded">
                      {orderData.statusLabel}
                    </span>
                  </div>
                  {orderData.prescriptionStatus && orderData.prescriptionStatus !== 'Not Applicable' && (
                    <div className="flex justify-between items-center border-t border-slate-100/50 pt-2">
                      <span className="text-[11px] text-slate-400 uppercase">Prescription Verification</span>
                      <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        orderData.prescriptionStatus === 'Verified'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-[#B8952A] border-amber-200'
                      }`}>
                        {orderData.prescriptionStatus}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-slate-100/50 pt-2 text-sm">
                    <span className="text-slate-800 font-extrabold">Amount Paid</span>
                    <span className="text-[#1B3F6E] font-black">₹{orderData.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

            </div>

            {orderData.deliveryMethod === 'local_hand_delivery' ? (
              <div className="border-t border-slate-100 pt-8 mt-8">
                <h3 className="text-xs font-extrabold text-[#0F2744] uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2 mb-4">
                  <Truck className="h-4.5 w-4.5 text-[#B8952A]" />
                  <span>Courier & Tracking</span>
                </h3>
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
                  <div className="text-xs font-bold text-[#4A4A6A] space-y-1">
                    <p className="text-slate-800 text-sm font-black">Local Hand Delivery</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      {orderData.isDelivered
                        ? `Delivered by our team on ${new Date(orderData.deliveredAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}!`
                        : "Your order will be personally delivered by our team."}
                    </p>
                    {orderData.handDelivery?.notes && (
                      <p className="text-[10px] text-slate-400 italic mt-1 bg-white p-2 rounded-lg border border-slate-200">
                        Delivery Note: "{orderData.handDelivery.notes}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (orderData.awbCode || orderData.courierName) && (
              <div className="border-t border-slate-100 pt-8 mt-8">
                <h3 className="text-xs font-extrabold text-[#0F2744] uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-50 pb-2 mb-4">
                  <Truck className="h-4.5 w-4.5 text-[#B8952A]" />
                  <span>Courier & Tracking</span>
                </h3>
                <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs font-bold text-[#4A4A6A] space-y-1">
                    <p className="text-slate-800 text-sm font-black">{orderData.courierName || 'Courier assigned'}</p>
                    {orderData.awbCode && <p className="font-mono text-[11px] text-slate-500">AWB: {orderData.awbCode}</p>}
                  </div>
                  {orderData.trackingUrl && (
                    <a
                      href={orderData.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1B3F6E] hover:bg-amber-600 text-white text-[11px] font-extrabold uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-sm transition-all active-scale-premium shrink-0 text-center"
                    >
                      Track Live Shipment
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Back Button */}
            <div className="flex justify-center border-t border-slate-100 pt-6">
              <button
                onClick={() => setOrderData(null)}
                className="bg-[#0F2744] hover:bg-[#1B3F6E] text-white text-xs font-extrabold uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-md transition-all active-scale-premium cursor-pointer"
              >
                Track Another Order
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default TrackOrder;
