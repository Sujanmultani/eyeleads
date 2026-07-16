import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, CheckCircle, Package, Truck, ShieldCheck, MapPin, CreditCard, Calendar, AlertCircle, X, RotateCcw } from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/Toast';
import { getItemPriceBreakdown, getLensTypeDetail, getMaterialDetail, getFeatureDetail } from '../utils/lensPricing';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [storeSettings, setStoreSettings] = useState(null);
  useEffect(() => {
    api.get('/api/settings').then(res => {
      if (res.data?.settings) setStoreSettings(res.data.settings);
    }).catch(() => {});
  }, []);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Self-service Cancel / Modify States
  const [timeLeft, setTimeLeft] = useState('');
  const [isWindowExpired, setIsWindowExpired] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [modifyForm, setModifyForm] = useState({ address: '', city: '', state: '', zipCode: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  // Return / Exchange States
  const [returnRequest, setReturnRequest] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged Product');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnResolution, setReturnResolution] = useState('Replacement');
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Live countdown timer for the 3-hour window
  useEffect(() => {
    if (!order) return;

    const calculateTimeLeft = () => {
      const createdAtTime = new Date(order.createdAt).getTime();
      const limitTime = createdAtTime + 3 * 60 * 60 * 1000; // 3 hours in ms
      const difference = limitTime - Date.now();

      if (difference <= 0) {
        setTimeLeft('');
        setIsWindowExpired(true);
        return;
      }

      const hrs = Math.floor(difference / (1000 * 60 * 60));
      const mins = Math.floor((difference / (1000 * 60)) % 60);
      const secs = Math.floor((difference / 1000) % 60);

      const parts = [];
      if (hrs > 0) parts.push(`${hrs}h`);
      if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
      parts.push(`${secs}s`);

      setTimeLeft(parts.join(' '));
      setIsWindowExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const handleOpenModify = () => {
    if (order && order.shippingAddress) {
      setModifyForm({
        address: order.shippingAddress.address || '',
        city: order.shippingAddress.city || '',
        state: order.shippingAddress.state || '',
        zipCode: order.shippingAddress.zipCode || order.shippingAddress.pincode || '',
        phone: order.shippingAddress.phone || ''
      });
      setIsModifyModalOpen(true);
    }
  };

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.put(`/api/orders/${id}/cancel`, { reason: cancellationReason });
      toast.success('Order cancelled successfully.');
      setIsCancelModalOpen(false);
      if (response.data && response.data.order) {
        setOrder(response.data.order);
      } else {
        setOrder(prev => ({
          ...prev,
          isCancelled: true,
          cancelledAt: new Date(),
          cancelledBy: 'customer',
          cancellationReason
        }));
      }
    } catch (err) {
      console.error('Error cancelling order:', err);
      const msg = err.response?.data?.message || 'Failed to cancel order.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleModifyOrder = async (e) => {
    e.preventDefault();
    if (!modifyForm.address || !modifyForm.city || !modifyForm.state || !modifyForm.zipCode || !modifyForm.phone) {
      toast.error('All address fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.put(`/api/orders/${id}/modify`, { shippingAddress: modifyForm });
      toast.success('Shipping coordinates modified successfully.');
      setIsModifyModalOpen(false);
      if (response.data && response.data.order) {
        setOrder(response.data.order);
      } else {
        setOrder(prev => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            address: modifyForm.address,
            city: modifyForm.city,
            state: modifyForm.state,
            zipCode: modifyForm.zipCode,
            pincode: modifyForm.zipCode,
            phone: modifyForm.phone
          },
          lastModifiedAt: new Date()
        }));
      }
    } catch (err) {
      console.error('Error modifying order:', err);
      const msg = err.response?.data?.message || 'Failed to modify order.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getItemBreakdown = (item) => {
    const result = getItemPriceBreakdown(item, storeSettings);
    return { ...result, totalPrice: item.price };
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/orders/${id}`);
      if (response.data && response.data.order) {
        setOrder(response.data.order);
      } else {
        setOrder(response.data);
      }
    } catch (err) {
      console.error('API error fetching order details:', err);
      setError('The requested order details could not be loaded. Please check your network or server connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnRequest = async () => {
    try {
      const response = await api.get('/api/returns/my');
      const requestForThisOrder = response.data.find(r => 
        (r.order?._id === id || r.order === id)
      );
      setReturnRequest(requestForThisOrder || null);
    } catch (err) {
      console.error('Error fetching return request:', err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (returnPhotos.length + files.length > 4) {
      toast.error('You can upload a maximum of 4 photos.');
      return;
    }

    setUploadingPhotos(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await api.post('/api/upload/returns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data && response.data.urls) {
        setReturnPhotos(prev => [...prev, ...response.data.urls]);
        toast.success('Photos uploaded successfully.');
      }
    } catch (err) {
      console.error('Error uploading photos:', err);
      toast.error(err.response?.data?.message || 'Failed to upload photos.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleSubmitReturnRequest = async (e) => {
    e.preventDefault();
    if (!returnDescription.trim()) {
      toast.error('Problem description is required.');
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post('/api/returns', {
        orderId: id,
        reason: returnReason,
        description: returnDescription,
        photos: returnPhotos,
        resolutionRequested: returnResolution
      });
      toast.success('Return request submitted successfully.');
      setIsReturnModalOpen(false);
      setReturnRequest(response.data);
    } catch (err) {
      console.error('Error submitting return request:', err);
      const msg = err.response?.data?.message || 'Failed to submit return request.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    fetchReturnRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F8FAFC] gap-3 text-slate-400 select-none">
        <Loader className="h-10 w-10 animate-spin text-[#B8952A]" />
        <p className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E]">Feteching Premium Receipt Coordinates...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fadeIn select-none space-y-6">
        <h2 className="text-xl font-light font-serif text-navy-dark">Receipt Could Not Be Loaded</h2>
        <p className="text-sm text-text-muted leading-relaxed">Please check your connection or return to your account profile.</p>
        <Link
          to="/account"
          className="inline-block bg-[#0F2744] hover:bg-[#1B3F6E] text-white text-xs font-extrabold uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-md transition-all"
        >
          Return to Profile
        </Link>
      </div>
    );
  }

  const {
    createdAt,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    shippingAddress,
    orderItems,
    itemsPrice = 0,
    taxPrice = 0,
    shippingPrice = 0,
    discountPrice = 0,
    totalPrice = 0
  } = order;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 animate-fadeIn pb-24 md:pb-16 select-none">
      
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6 mb-8">
        <div className="space-y-1">
          <Link 
            to="/account" 
            className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-[#1B3F6E] transition-colors mb-2 select-none"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>My Account</span>
          </Link>
          <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">Order Details</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Order Reference: {order.orderNumber || id}</p>
        </div>

        <div className="bg-[#B8952A]/10 border border-[#B8952A]/30 px-4 py-2 rounded-xl text-center">
          <span className="text-[11px] text-[#B8952A] font-extrabold uppercase tracking-widest block">Ordered On</span>
          <span className="text-xs font-black text-[#1B3F6E] block mt-0.5">{formattedDate}</span>
        </div>
      </div>

      {/* Main Grid Viewport */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Order details items, receipts, etc. */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Tracking Step indicators or Cancelled Banner */}
          {order.isCancelled ? (
            <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-rose-700 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="h-4.5 w-4.5 text-rose-600 animate-pulse" />
                <span>Order Cancelled</span>
              </h3>
              <div className="text-xs font-semibold text-slate-600 space-y-2 leading-relaxed">
                <p>This order was cancelled on <span className="font-extrabold text-slate-800">{new Date(order.cancelledAt || order.updatedAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</span> by the <span className="font-extrabold text-slate-800">{order.cancelledBy || 'customer'}</span>.</p>
                {order.cancellationReason && (
                  <p className="bg-white/60 p-3 rounded-xl border border-rose-100/60 mt-2 text-slate-700 italic">
                    Reason: "{order.cancellationReason}"
                  </p>
                )}
                {order.isPaid && (
                  <div className="mt-3 text-[11px] text-navy-primary bg-navy-primary/5 border border-navy-primary/10 p-3.5 rounded-xl space-y-1">
                    <p className="font-extrabold">💳 Refund Information</p>
                    <p className="text-slate-500 font-medium">Since this order was paid, a refund of <strong className="text-navy-primary">₹{order.totalPrice.toLocaleString('en-IN')}</strong> has been requested and will be processed manually. Refunds are typically credited back to your original payment source within 7-10 business days.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-widest flex items-center gap-1.5">
                <Package className="h-4.5 w-4.5 text-[#B8952A]" />
                <span>Fulfilment Tracking</span>
              </h3>

              <div className="relative pt-4 pb-2">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0"></div>
                
                {/* Dynamic Progress indicator */}
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-[#B8952A] -translate-y-1/2 z-0 transition-all duration-700"
                  style={{ width: isDelivered ? '100%' : isPaid ? '50%' : '5%' }}
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
                      isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <ShieldCheck className="h-4.5 w-4.5" />
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${isPaid ? 'text-slate-700' : 'text-slate-400'}`}>Assembled</span>
                  </div>

                  {/* Step 3: Out for Delivery */}
                  <div className="flex flex-col items-center gap-2 bg-white px-2">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center border shadow-sm shrink-0 ${
                      isDelivered ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}>
                      <Truck className="h-4.5 w-4.5" />
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${isDelivered ? 'text-slate-700' : 'text-slate-400'}`}>Delivered</span>
                  </div>

                </div>
              </div>

              {/* Tracking Status Note */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xxs font-semibold text-slate-500 leading-relaxed">
                {isDelivered ? (
                  <p>✨ Your handcrafted premium eyewear frame was delivered successfully on {new Date(deliveredAt).toLocaleDateString('en-IN')}. Enjoy the premium optical clarity!</p>
                ) : (
                  <p>🚚 Your custom optical frame is currently undergoing precise lens assembly & in-house medical optician alignment checking. Estimated dispatch within 24-48 hours.</p>
                )}
              </div>

            </div>
          )}

          {/* Purchased Items List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-widest">Eyewear Cart Details</h3>
            
            <div className="divide-y divide-slate-100">
              {orderItems.map((item, idx) => (
                <div key={idx} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <img src={item.image} alt={item.name} loading="lazy" className="h-16 w-16 object-contain rounded-xl bg-slate-50 p-1 border border-slate-100 shrink-0" />
                  <div className="flex-grow min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[#1A1A2E] truncate">{item.name}</h4>
                      {item.isFreeGift && (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                          Free Gift
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider flex-wrap">
                      <span>QTY: {item.qty}</span>
                      <span>·</span>
                      <span>Color: {item.options?.color || 'Classic Classic'}</span>
                      <span>·</span>
                      <span>Size: {item.options?.size || 'Standard (Medium)'}</span>
                    </div>

                    {/* Lens custom metadata options details */}
                    {item.options?.lensType && (
                      <div className="bg-amber-50/15 border border-[#B8952A]/10 p-3 rounded-xl text-[11px] leading-relaxed text-[#B8952A] font-semibold space-y-3">
                        <div className="space-y-0.5">
                          <p>
                            👓 Lens Type: <span className="text-slate-800 font-extrabold">{item.options.lensType}</span>
                            {getLensTypeDetail(item.options.lensType).price > 0 && (
                              <span className="text-slate-400 font-bold ml-1.5">(₹{getLensTypeDetail(item.options.lensType).price})</span>
                            )}
                          </p>
                          {item.options.rxAttached && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <span>📄 Attached Rx:</span>
                              <a 
                                href={item.options.prescriptionData?.rxAttached || item.options.rxAttached} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-bold cursor-pointer"
                              >
                                {item.options.rxAttached.split('/').pop()}
                              </a>
                            </div>
                          )}
                          {item.options.pdEntered && <p>📐 Pupillary Distance (PD): <span className="text-slate-800 font-extrabold">{item.options.pdEntered}</span></p>}
                        </div>

                        {item.options.prescriptionData && getItemBreakdown(item).isPrescription && (
                          <div className="space-y-2.5 border-t border-[#B8952A]/10 pt-2 text-left">
                            <span className="text-[#1B3F6E] text-[11px] uppercase tracking-widest font-black block">Prescription Specifications</span>
                            
                            {/* Table */}
                            {(item.options.prescriptionData.rightSph || item.options.prescriptionData.leftSph) ? (
                              <div className="overflow-x-auto rounded-lg border border-slate-150 bg-white max-w-full">
                                <table className="min-w-full divide-y divide-slate-150 text-left text-[11px]">
                                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-extrabold text-[#1B3F6E]">
                                    <tr>
                                      <th className="py-1 px-2">Eye</th>
                                      <th className="py-1 px-2">SPH</th>
                                      <th className="py-1 px-2">CYL</th>
                                      <th className="py-1 px-2">AXIS</th>
                                      <th className="py-1 px-2">ADD</th>
                                      <th className="py-1 px-2">PRISM</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                                    <tr>
                                      <td className="py-1 px-2 font-extrabold text-slate-400">OD (R)</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.rightSph || '0.00'}</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.rightCyl || '0.00'}</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.rightAxis || '—'}</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.rightAdd || '—'}</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.rightPrism || '—'}</td>
                                    </tr>
                                    <tr>
                                      <td className="py-1 px-2 font-extrabold text-slate-400">OS (L)</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.leftSph || '0.00'}</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.leftCyl || '0.00'}</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.leftAxis || '—'}</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.leftAdd || '—'}</td>
                                      <td className="py-1 px-2 font-mono">{item.options.prescriptionData.leftPrism || '—'}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="p-3 rounded-lg border border-dashed border-slate-200 text-center text-[#1B3F6E] bg-white font-bold text-[11px] animate-fadeIn shadow-xxs">
                                📄 Prescription uploaded via file attachment.
                              </div>
                            )}

                            {/* Extra Metadata */}
                            {(item.options.prescriptionData.doctorName || item.options.prescriptionData.prescriptionDate) && (
                              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-bold bg-white/50 p-2 rounded-lg border border-[#B8952A]/5">
                                {item.options.prescriptionData.doctorName && (
                                  <div>
                                    <span className="text-[11px] uppercase block text-slate-400">Optometrist</span>
                                    <span className="text-slate-700 truncate block">{item.options.prescriptionData.doctorName}</span>
                                  </div>
                                )}
                                {item.options.prescriptionData.prescriptionDate && (
                                  <div>
                                    <span className="text-[11px] uppercase block text-slate-400">Rx Date</span>
                                    <span className="text-slate-700 block">
                                      {new Date(item.options.prescriptionData.prescriptionDate).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Lens Package Configurations */}
                            {item.options.prescriptionData.lensConfig && (
                              <div className="bg-white/60 p-2 rounded-lg border border-[#B8952A]/5 text-[11px] space-y-1 text-slate-500 font-bold">
                                <span className="text-[11px] uppercase block text-[#1B3F6E] font-black">Selected Customizations</span>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-bold">
                                  {item.options.prescriptionData.lensConfig.material && (
                                    <div>
                                      <span className="text-slate-400 text-[11px] uppercase block">Material Index</span>
                                      <span className="text-slate-700">
                                        {getMaterialDetail(item.options.prescriptionData.lensConfig.material).name}
                                        {getMaterialDetail(item.options.prescriptionData.lensConfig.material).price > 0 && (
                                          <span className="text-slate-400 font-bold ml-1">(₹{getMaterialDetail(item.options.prescriptionData.lensConfig.material).price})</span>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  {item.options.prescriptionData.lensConfig.tint && (
                                    <div>
                                      <span className="text-slate-400 text-[11px] uppercase block">Tint Type</span>
                                      <span className="text-slate-700">
                                        {item.options.prescriptionData.lensConfig.tint}
                                        {item.options.prescriptionData.lensConfig.tintPercentage && ` (${item.options.prescriptionData.lensConfig.tintPercentage}%)`}
                                      </span>
                                    </div>
                                  )}
                                  {item.options.prescriptionData.lensConfig.features && item.options.prescriptionData.lensConfig.features.length > 0 && (
                                    <div className="col-span-2 border-t border-slate-100 pt-1">
                                      <span className="text-slate-400 text-[11px] uppercase block">Coatings Package</span>
                                      <div className="flex flex-wrap gap-1 mt-0.5">
                                        {item.options.prescriptionData.lensConfig.features.map((f, fi) => {
                                          const feat = getFeatureDetail(f);
                                          return (
                                            <span key={fi} className="px-1 py-0.5 rounded bg-blue-50 text-blue-600 text-[11px] uppercase tracking-wider font-extrabold border border-blue-100">
                                              {feat.name}
                                              {feat.price > 0 && ` (₹${feat.price})`}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {/* FIXED: Dynamic billing details with lens addon price breakdown */}
                    {(() => {
                      const b = getItemBreakdown(item);
                      if (b.isPrescription) {
                        const { typeDetail, materialDetail, featuresList } = b;
                        
                        return (
                          <div className="mt-2 text-[11px] bg-slate-50/50 border border-slate-100 rounded-xl p-2.5 space-y-1 font-bold text-slate-500 max-w-sm">
                            <span className="text-[11px] uppercase tracking-widest text-[#1B3F6E] block font-black">Item Price Breakdown</span>
                            <div className="flex justify-between">
                              <span>Base Frame:</span>
                              <span className="text-slate-800">₹{b.basePrice.toLocaleString('en-IN')}</span>
                            </div>
                            {b.opticianFee > 0 && (
                              <div className="flex justify-between">
                                <span>Optician Prescription Fee:</span>
                                <span className="text-slate-800">+ ₹{b.opticianFee.toLocaleString('en-IN')}</span>
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
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="text-right shrink-0 flex flex-col justify-start items-end select-none">
                    <span className="text-sm font-black text-[#1B3F6E]">
                      {item.isFreeGift ? 'FREE' : `₹${(item.price * item.qty).toLocaleString('en-IN')}`}
                    </span>
                    {item.qty > 1 && !item.isFreeGift && (
                      <span className="text-[11px] text-slate-400 font-bold mt-1">₹{item.price.toLocaleString('en-IN')} each</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Right Column: Address mapping summary & Payment breakdown receipts */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Shipping Address coordinates card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-[#B8952A]" />
              <span>Shipping Address</span>
            </h3>

            <div className="text-xs font-bold text-[#4A4A6A] space-y-1.5">
              <p className="text-slate-800 text-sm font-black">{shippingAddress.fullName || shippingAddress.name || 'Valued Customer'}</p>
              <p className="leading-relaxed">{shippingAddress.address1 || shippingAddress.address}</p>
              <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode || shippingAddress.zipCode}, {shippingAddress.country || 'India'}</p>
              <p className="text-[11px] text-slate-400 font-bold tracking-wider pt-1 uppercase">📞 Mobile: {shippingAddress.phone || 'Not Logged'}</p>
              {order.deliveryMethod === 'local_hand_delivery' ? (
                <div className="pt-3 border-t border-slate-100 mt-3 space-y-1">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Delivery Mode</p>
                  <p className="text-[#1B3F6E] font-extrabold text-xs">
                    Local Hand Delivery
                  </p>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    {order.isDelivered
                      ? `Delivered by our team on ${new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}`
                      : "Your order will be personally delivered by our team."}
                  </p>
                  {order.handDelivery?.notes && (
                    <p className="text-[10px] text-slate-400 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      Note: "{order.handDelivery.notes}"
                    </p>
                  )}
                </div>
              ) : order.isInternational ? (
                order.manualShipping?.awbCode && (
                  <div className="pt-3 border-t border-slate-100 mt-3 space-y-1">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">🌍 International Shipment</p>
                    <p className="text-[#1B3F6E] font-extrabold text-xs">
                      {order.manualShipping.courierName} ({order.manualShipping.awbCode})
                    </p>
                    {order.manualShipping.trackingUrl && (
                      <a
                        href={order.manualShipping.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline block text-[10px]"
                      >
                        Track Package ↗
                      </a>
                    )}
                  </div>
                )
              ) : (
                order.shiprocket?.awbCode && (
                  <div className="pt-3 border-t border-slate-100 mt-3 space-y-1">
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Shiprocket Tracking</p>
                    <p className="text-[#1B3F6E] font-extrabold text-xs">
                      {order.shiprocket.courierName} ({order.shiprocket.awbCode})
                    </p>
                    <div className="flex gap-3 text-[10px]">
                      {order.shiprocket.trackingUrl && (
                        <a
                          href={order.shiprocket.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Track Package ↗
                        </a>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Payment method receipt details card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard className="h-4.5 w-4.5 text-[#B8952A]" />
              <span>Billing Details</span>
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Payment Mode</span>
                <span className="font-extrabold text-[#1B3F6E]">{paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Payment status</span>
                <span className={`font-black uppercase tracking-wider text-[11px] px-2.5 py-1 rounded-full ${
                  isPaid ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            </div>
          </div>

          {/* Financial cost breakdown list summary receipt */}
          <div className="bg-white rounded-3xl p-6 border border-[#1B3F6E]/10 shadow-md space-y-4 ring-1 ring-[#1B3F6E]/5">
            <h3 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-[#B8952A]" />
              <span>Billing Summary</span>
            </h3>

            {(() => {
              let totalFrames = 0;
              let totalOpticianFees = 0;
              let totalAddOns = 0;

              orderItems.forEach(item => {
                const breakdown = getItemBreakdown(item);
                totalFrames += breakdown.basePrice * item.qty;
                totalOpticianFees += breakdown.opticianFee * item.qty;
                totalAddOns += breakdown.addOnPrice * item.qty;
              });

              return (
                <div className="space-y-3 border-b border-slate-100 pb-4 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Subtotal Items</span>
                    <span>₹{itemsPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {/* FIXED: Dynamic billing details with lens addon price breakdown */}
                  <div className="pl-3 space-y-1.5 text-[11px] text-slate-400 font-bold border-l-2 border-slate-100 ml-1.5">
                    <div className="flex justify-between">
                      <span>Frames Base Total:</span>
                      <span>₹{totalFrames.toLocaleString('en-IN')}</span>
                    </div>
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

                  {discountPrice > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount applied</span>
                      <span>- ₹{discountPrice.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {taxPrice > 0 && (
                    <div className="flex justify-between">
                      <span>Tax Charges (18% GST)</span>
                      <span>₹{taxPrice.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery fees</span>
                    <span>{shippingPrice > 0 ? `₹${shippingPrice}` : 'Free'}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Total cost</span>
              <span className="text-lg font-black text-[#1B3F6E]">₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Order Self-Service Actions (Cancel / Modify) */}
          {!order.isCancelled && !order.isDelivered && (
            <div className="bg-white rounded-3xl p-6 border border-[#B8952A]/10 shadow-md space-y-4 ring-1 ring-[#B8952A]/5">
              <h3 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-widest">
                Order Management
              </h3>
              
              {timeLeft ? (
                <div className="space-y-3.5">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xxs font-bold text-amber-800 leading-relaxed flex flex-col gap-1">
                    <span className="text-[11px] font-black uppercase tracking-widest text-[#B8952A]">Action Window Active</span>
                    <p>You can cancel or modify this order for the next <span className="font-extrabold text-amber-700 font-mono text-xs">{timeLeft}</span>.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={handleOpenModify}
                      className="w-full py-2.5 border border-[#1B3F6E] hover:bg-[#1B3F6E]/5 text-[#1B3F6E] rounded-xl text-xxs font-extrabold uppercase tracking-widest transition-all cursor-pointer text-center"
                    >
                      Edit Shipping Details
                    </button>
                    <button
                      onClick={() => setIsCancelModalOpen(true)}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xxs font-extrabold uppercase tracking-widest transition-all cursor-pointer text-center"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xxs font-bold text-slate-500 leading-relaxed">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Self-Service Closed</span>
                  <p>The 3-hour cancellation and modification window has expired. Please contact support for any further help.</p>
                </div>
              )}
            </div>
          )}

          {/* Post-Delivery Returns and Exchanges Management Panel */}
          {order.isDelivered && (
            <div className="bg-white rounded-3xl p-6 border border-[#B8952A]/10 shadow-md space-y-4 ring-1 ring-[#B8952A]/5">
              <h3 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-widest flex items-center gap-1.5">
                <RotateCcw className="h-4.5 w-4.5 text-[#B8952A]" />
                <span>Return & Exchange Support</span>
              </h3>

              {returnRequest ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-500 space-y-3 text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Request Status</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        ['Rejected'].includes(returnRequest.status) ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        ['Completed', 'Refund Completed'].includes(returnRequest.status) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-amber-50 text-[#B8952A] border border-amber-200'
                      }`}>
                        {returnRequest.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px] font-bold text-navy-dark border-t border-slate-150 pt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Resolution Type:</span>
                        <span>{returnRequest.resolutionRequested}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Reason:</span>
                        <span>{returnRequest.reason}</span>
                      </div>
                      {returnRequest.replacementTrackingNumber && (
                        <div className="flex justify-between border-t border-slate-150/50 pt-2">
                          <span className="text-slate-400">Tracking Number:</span>
                          <span className="font-mono text-xs text-navy-primary select-all">{returnRequest.replacementTrackingNumber}</span>
                        </div>
                      )}
                      {returnRequest.adminNote && (
                        <div className="border-t border-slate-150/50 pt-2 space-y-1">
                          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Note from Store Manager:</span>
                          <p className="text-slate-600 font-medium italic bg-white p-2 rounded-xl border border-slate-150 leading-relaxed">
                            "{returnRequest.adminNote}"
                          </p>
                        </div>
                      )}
                    </div>

                    {returnRequest.status === 'Refund Completed' && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-3 rounded-xl leading-relaxed mt-2">
                        🎉 Your refund has been processed. Depending on your bank, it should reflect in your account within 7-10 business days.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                (() => {
                  const deliveredDate = new Date(order.deliveredAt).getTime();
                  const diffDays = (Date.now() - deliveredDate) / (1000 * 60 * 60 * 24);
                  const isExpired = diffDays > 7;

                  if (isExpired) {
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xxs font-bold text-slate-500 leading-relaxed">
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-1">Return Window Closed</span>
                        <p>The 7-day return and exchange window for this order has expired. Please contact support directly if you need any assistance.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-150 rounded-2xl p-3.5 text-xxs font-bold text-[#1B3F6E] leading-relaxed">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#B8952A] block mb-1">7-Day Window Active</span>
                        <p>If your item arrived damaged, or if the wrong product was received, you can submit a return request for an exchange or a refund.</p>
                      </div>
                      <button
                        onClick={() => {
                          setReturnReason('Damaged Product');
                          setReturnDescription('');
                          setReturnPhotos([]);
                          setReturnResolution('Replacement');
                          setIsReturnModalOpen(true);
                        }}
                        className="w-full py-2.5 bg-[#0F2744] hover:bg-[#1B3F6E] text-white rounded-xl text-xxs font-extrabold uppercase tracking-widest transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1.5"
                      >
                        Report a Problem
                      </button>
                    </div>
                  );
                })()
              )}
            </div>
          )}

        </div>

      </div>

    </div>

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-[#0F2744]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-luxury space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-navy-dark text-sm uppercase tracking-wider">Cancel Order</h3>
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCancelOrder} className="space-y-4">
              <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[11px] font-bold p-3.5 rounded-2xl leading-relaxed">
                ⚠️ <strong>Are you absolutely sure you want to cancel?</strong> This action is destructive and cannot be undone. If you've already paid, your manual refund process will be initiated.
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Reason for Cancellation (Optional)</label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="e.g., Decided to buy a different frame, wrong address, etc."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B8952A] focus:ring-1 focus:ring-[#B8952A]/20 outline-none text-xs font-semibold placeholder:text-slate-300 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xxs font-extrabold uppercase tracking-widest cursor-pointer transition-all"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xxs font-extrabold uppercase tracking-widest cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader className="h-3 w-3 animate-spin" /> : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify Address Modal */}
      {isModifyModalOpen && (
        <div className="fixed inset-0 bg-[#0F2744]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-luxury space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-navy-dark text-sm uppercase tracking-wider">Edit Shipping coordinates</h3>
              <button 
                onClick={() => setIsModifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleModifyOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Address */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Street Address</label>
                  <input
                    type="text"
                    value={modifyForm.address}
                    onChange={(e) => setModifyForm({ ...modifyForm, address: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B8952A] focus:ring-1 focus:ring-[#B8952A]/20 outline-none text-xs font-semibold placeholder:text-slate-300 transition-all"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    value={modifyForm.city}
                    onChange={(e) => setModifyForm({ ...modifyForm, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B8952A] focus:ring-1 focus:ring-[#B8952A]/20 outline-none text-xs font-semibold placeholder:text-slate-300 transition-all"
                  />
                </div>

                {/* State */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    value={modifyForm.state}
                    onChange={(e) => setModifyForm({ ...modifyForm, state: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B8952A] focus:ring-1 focus:ring-[#B8952A]/20 outline-none text-xs font-semibold placeholder:text-slate-300 transition-all"
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Pincode / Zip</label>
                  <input
                    type="text"
                    value={modifyForm.zipCode}
                    onChange={(e) => setModifyForm({ ...modifyForm, zipCode: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B8952A] focus:ring-1 focus:ring-[#B8952A]/20 outline-none text-xs font-semibold placeholder:text-slate-300 transition-all"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Phone number</label>
                  <input
                    type="text"
                    value={modifyForm.phone}
                    onChange={(e) => setModifyForm({ ...modifyForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    maxLength={10}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B8952A] focus:ring-1 focus:ring-[#B8952A]/20 outline-none text-xs font-semibold placeholder:text-slate-300 transition-all"
                  />
                </div>

              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModifyModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xxs font-extrabold uppercase tracking-widest cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#0F2744] hover:bg-[#1B3F6E] text-white rounded-xl text-xxs font-extrabold uppercase tracking-widest cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader className="h-3 w-3 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-[#0F2744]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn select-none">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-lg w-full p-6 shadow-luxury space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-navy-dark text-sm uppercase tracking-wider">Report a Problem</h3>
              <button 
                onClick={() => setIsReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitReturnRequest} className="space-y-4 text-xs font-bold text-text-muted">
              
              {/* Reason Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Reason for Return</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B8952A] focus:ring-1 focus:ring-[#B8952A]/20 outline-none text-xs font-semibold"
                >
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Wrong Product Received">Wrong Product Received</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Problem Description (Required)</label>
                <textarea
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  required
                  placeholder="Please describe the issue in detail..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#B8952A] focus:ring-1 focus:ring-[#B8952A]/20 outline-none text-xs font-semibold placeholder:text-slate-300 transition-all resize-none"
                />
              </div>

              {/* Resolution Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">Requested Resolution</label>
                <div className="flex gap-6 mt-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-navy-dark font-extrabold">
                    <input
                      type="radio"
                      name="resolution"
                      value="Replacement"
                      checked={returnResolution === 'Replacement'}
                      onChange={() => setReturnResolution('Replacement')}
                      className="h-4 w-4 text-gold-accent focus:ring-gold-accent"
                    />
                    <span>Replacement (Exchange)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-navy-dark font-extrabold">
                    <input
                      type="radio"
                      name="resolution"
                      value="Refund"
                      checked={returnResolution === 'Refund'}
                      onChange={() => setReturnResolution('Refund')}
                      className="h-4 w-4 text-gold-accent focus:ring-gold-accent"
                    />
                    <span>Refund</span>
                  </label>
                </div>
              </div>

              {/* Photos Upload */}
              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider block">Evidence Photos (Max 4)</label>
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400 leading-normal font-semibold">Upload photos of the product and packaging highlighting the issue.</p>
                  </div>
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploadingPhotos || returnPhotos.length >= 4}
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      disabled={uploadingPhotos || returnPhotos.length >= 4}
                      className="px-3.5 py-2 bg-[#1B3F6E] hover:bg-[#B8952A] disabled:bg-slate-300 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-lg shadow-sm transition-all"
                    >
                      {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
                    </button>
                  </div>
                </div>

                {/* Photo Previews */}
                {returnPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {returnPhotos.map((url, idx) => (
                      <div key={idx} className="aspect-[4/3] rounded-lg border border-slate-200 overflow-hidden bg-slate-100 relative group">
                        <img src={url} alt={`Evidence ${idx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setReturnPhotos(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded shadow cursor-pointer hover:bg-rose-700"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xxs font-extrabold uppercase tracking-widest cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#0F2744] hover:bg-[#1B3F6E] text-white rounded-xl text-xxs font-extrabold uppercase tracking-widest cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <Loader className="h-3 w-3 animate-spin" /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetail;
