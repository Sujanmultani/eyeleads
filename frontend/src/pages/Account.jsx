import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Package, Settings, MapPin, Loader, AlertCircle, RotateCcw, Eye, Upload, ShieldCheck } from 'lucide-react';
import api from '../utils/api';

const Account = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
    }
  }, [user]);

  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchMyOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/api/orders/my');
        if (response.data && response.data.orders) {
          setOrders(response.data.orders);
        }
      } catch (err) {
        console.error('Error fetching dynamic orders:', err);
        setError('Unable to fetch your order history. Please check backend connection.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyOrders();
    } else {
      loading && setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'returns' && user) {
      const fetchMyReturns = async () => {
        setReturnsLoading(true);
        try {
          const response = await api.get('/api/returns/my');
          setReturnRequests(response.data);
        } catch (err) {
          console.error('Error fetching returns:', err);
        } finally {
          setReturnsLoading(false);
        }
      };
      fetchMyReturns();
    }
  }, [activeTab, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn">
      <div className="border-b border-slate-100 pb-6 mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">My Account</h1>
          <p className="text-sm text-text-muted mt-1">Manage your profiles, track shipment orders, and update details.</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-center"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left side: navigation tabs */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-100 p-6 h-fit space-y-2 shadow-luxury">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left cursor-pointer ${activeTab === 'profile'
                ? 'bg-[#0F2744] text-white shadow-md'
                : 'text-text-muted hover:bg-slate-50 hover:text-[#0F2744]'
              }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left cursor-pointer ${activeTab === 'orders'
                ? 'bg-[#0F2744] text-white shadow-md'
                : 'text-text-muted hover:bg-slate-50 hover:text-[#0F2744]'
              }`}
          >
            <Package className="h-4 w-4" />
            <span>Order History</span>
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left cursor-pointer ${activeTab === 'returns'
                ? 'bg-[#0F2744] text-white shadow-md'
                : 'text-text-muted hover:bg-slate-50 hover:text-[#0F2744]'
              }`}
          >
            <RotateCcw className="h-4 w-4" />
            <span>My Returns</span>
          </button>
          <button 
            onClick={() => setActiveTab('prescription')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left cursor-pointer ${
              activeTab === 'prescription' 
                ? 'bg-[#0F2744] text-white shadow-md' 
                : 'text-text-muted hover:bg-slate-50 hover:text-[#0F2744]'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>My Prescription</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left cursor-pointer ${activeTab === 'addresses'
                ? 'bg-[#0F2744] text-white shadow-md'
                : 'text-text-muted hover:bg-slate-50 hover:text-[#0F2744]'
              }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Saved Addresses</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left cursor-pointer ${activeTab === 'settings'
                ? 'bg-[#0F2744] text-white shadow-md'
                : 'text-text-muted hover:bg-slate-50 hover:text-[#0F2744]'
              }`}
          >
            <Settings className="h-4 w-4" />
            <span>Account Settings</span>
          </button>
        </div>

        {/* Right side: account detailed overview */}
        <div className="lg:col-span-3 space-y-8">
          {/* User profile card */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fadeIn">
              <h3 className="font-bold text-navy-dark text-base uppercase tracking-wider border-b border-slate-100 pb-4 mb-6">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-xs text-text-muted font-bold block mb-1">Full Name</span>
                  <span className="text-text-primary font-semibold">{user?.name || 'Guest User'}</span>
                </div>
                <div>
                  <span className="text-xs text-text-muted font-bold block mb-1">Email Address</span>
                  <span className="text-text-primary font-semibold">{user?.email || 'guest@eyeleads.com'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Real Order List */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fadeIn">
              <h3 className="font-bold text-navy-dark text-base uppercase tracking-wider border-b border-slate-100 pb-4 mb-6">
                Recent Orders
              </h3>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <Loader className="h-6 w-6 animate-spin text-[#B8952A]" />
                  <p className="text-xs font-bold uppercase tracking-wider">Loading purchase history...</p>
                </div>
              ) : error ? (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                  <p>{error}</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-text-muted">
                    <thead>
                      <tr className="border-b border-slate-100 font-bold text-navy-dark text-xs uppercase tracking-wider pb-3">
                        <th className="py-3">Order ID</th>
                        <th className="py-3">Date</th>
                        <th className="py-3">Total Amount</th>
                        <th className="py-3">Payment</th>
                        <th className="py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 font-bold text-navy-primary">
                            <Link to={`/orders/${order._id}`} className="hover:underline hover:text-[#B8952A] transition-colors">
                              {order.orderNumber || order._id}
                            </Link>
                          </td>
                          <td className="py-3.5">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 font-bold text-text-primary">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                          <td className="py-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase ${order.isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {order.isCancelled ? (
                              <span className="inline-block px-2.5 py-1 rounded-full text-xxs font-extrabold uppercase border bg-rose-50 text-rose-700 border-rose-200">
                                Cancelled
                              </span>
                            ) : (
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xxs font-extrabold uppercase border ${order.isDelivered ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-[#B8952A] border-amber-200'
                                }`}>
                                {order.isDelivered ? 'Delivered' : 'Pending dispatch'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-6">You have not placed any orders yet.</p>
              )}
            </div>
          )}

          {/* Return Requests Panel */}
          {activeTab === 'returns' && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fadeIn text-left">
              <h3 className="font-bold text-navy-dark text-base uppercase tracking-wider border-b border-slate-100 pb-4 mb-6">
                My Return & Exchange Requests
              </h3>

              {returnsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <Loader className="h-6 w-6 animate-spin text-[#B8952A]" />
                  <p className="text-xs font-bold uppercase tracking-wider">Loading return requests...</p>
                </div>
              ) : returnRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-text-muted">
                    <thead>
                      <tr className="border-b border-slate-100 font-bold text-navy-dark text-xs uppercase tracking-wider pb-3">
                        <th className="py-3">Order Number</th>
                        <th className="py-3">Reason</th>
                        <th className="py-3">Resolution</th>
                        <th className="py-3">Requested Date</th>
                        <th className="py-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnRequests.map((req) => (
                        <tr key={req._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 font-bold text-navy-primary">
                            <Link to={`/orders/${req.order?._id || req.order}`} className="hover:underline hover:text-[#B8952A] transition-colors">
                              {req.order?.orderNumber || 'View Order'}
                            </Link>
                          </td>
                          <td className="py-3.5 font-semibold text-slate-700">{req.reason}</td>
                          <td className="py-3.5 font-bold text-[#1B3F6E]">{req.resolutionRequested}</td>
                          <td className="py-3.5">
                            {new Date(req.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 text-right">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xxs font-extrabold uppercase border ${['Rejected'].includes(req.status) ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                ['Completed', 'Refund Completed'].includes(req.status) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  'bg-amber-50 text-[#B8952A] border-amber-200'
                              }`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted leading-relaxed font-bold">No active return requests found.</p>
                    <p className="text-slate-400 text-[11px] leading-normal font-semibold">You can request a return or replacement directly from the Order Details page within 7 days of delivery.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prescription Profile Panel */}
          {activeTab === 'prescription' && (
            <PrescriptionPanel />
          )}

          {/* Saved Addresses Panel */}
          {activeTab === 'addresses' && (
            <SavedAddressPanel user={user} setUser={setUser} />
          )}

          {/* Account Settings Panel */}
          {activeTab === 'settings' && (
            <div className="bg-white p-6 rounded-xl border border-slate-100 space-y-6 shadow-sm animate-fadeIn text-left">
              <h3 className="font-bold text-navy-dark text-base uppercase tracking-wider border-b border-slate-100 pb-4 mb-4">
                Account Settings
              </h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Update Account Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="New display name"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold"
                  />
                </div>
                <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4">
                  <button
                    disabled={savingSettings}
                    onClick={async () => {
                      setSavingSettings(true);
                      const { toast } = await import('../components/Toast');
                      try {
                        if (displayName && displayName !== user?.name) {
                          const profileRes = await api.put('/api/auth/profile', { name: displayName });
                          if (profileRes.data && profileRes.data.user) {
                            setUser(profileRes.data.user);
                          } else {
                            setUser(prev => ({ ...prev, name: displayName }));
                          }
                        }
                        if (currentPassword && newPassword) {
                          await api.put('/api/auth/change-password', { currentPassword, newPassword });
                          setCurrentPassword('');
                          setNewPassword('');
                        }
                        toast.success('Your settings have been updated!');
                      } catch (err) {
                        toast.error(err.response?.data?.message || 'Could not update settings.');
                      } finally {
                        setSavingSettings(false);
                      }
                    }}
                    className="btn-primary text-xs px-5 py-2.5 rounded-lg cursor-pointer disabled:opacity-50 font-extrabold uppercase tracking-wider"
                  >
                    {savingSettings ? 'Saving...' : 'Save Modifications'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    Sign Out Immediately
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SavedAddressPanel = ({ user, setUser }) => {
  const [form, setForm] = useState({
    name: user?.savedAddress?.name || '',
    phone: user?.savedAddress?.phone || '',
    address: user?.savedAddress?.address || '',
    city: user?.savedAddress?.city || '',
    state: user?.savedAddress?.state || '',
    zipCode: user?.savedAddress?.zipCode || ''
  });
  const [saving, setSaving] = useState(false);
  const hasAddress = !!user?.savedAddress?.address;

  useEffect(() => {
    if (user?.savedAddress) {
      setForm({
        name: user.savedAddress.name || '',
        phone: user.savedAddress.phone || '',
        address: user.savedAddress.address || '',
        city: user.savedAddress.city || '',
        state: user.savedAddress.state || '',
        zipCode: user.savedAddress.zipCode || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.state || !form.zipCode) {
      const { toast } = await import('../components/Toast');
      toast.error('All address fields are required.');
      return;
    }
    setSaving(true);
    const { toast } = await import('../components/Toast');
    try {
      const res = await api.put('/api/auth/profile', { savedAddress: form });
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(prev => ({ ...prev, savedAddress: form }));
      }
      toast.success('Address saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 space-y-4 shadow-sm animate-fadeIn text-left">
      <h3 className="font-bold text-navy-dark text-base uppercase tracking-wider border-b border-slate-100 pb-4">
        {hasAddress ? 'Saved Address' : 'Add Your Address'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Full Name</label>
          <input className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold" placeholder="Full Name"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Phone</label>
          <input className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold" placeholder="Phone"
            value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Address Line</label>
          <input className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold" placeholder="Address Line"
            value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">City</label>
          <input className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold" placeholder="City"
            value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">State</label>
          <input className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold" placeholder="State"
            value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase">Pincode</label>
          <input className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold" placeholder="Pincode"
            value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
        </div>
      </div>
      <div className="pt-2">
        <button disabled={saving} onClick={handleSave} className="btn-accent text-xs px-5 py-2.5 font-bold rounded-lg disabled:opacity-50 cursor-pointer">
          {saving ? 'Saving...' : hasAddress ? 'Update Address' : 'Save Address'}
        </button>
      </div>
    </div>
  );
};

// Generates a stepped numeric range as display strings, e.g. -20.00 ... +20.00
const generateRxRange = (min, max, step, showPlus = false) => {
  const values = [];
  const stepsCount = Math.round((max - min) / step);
  for (let i = 0; i <= stepsCount; i++) {
    const raw = parseFloat((min + i * step).toFixed(2));
    const normalized = raw === 0 ? 0 : raw; // avoid "-0.00"
    const label = (showPlus && normalized > 0 ? '+' : '') + normalized.toFixed(2);
    values.push(label);
  }
  return values;
};

const SPH_OPTIONS = generateRxRange(-20, 20, 0.25, true);
const CYL_OPTIONS = generateRxRange(-10, 10, 0.25, true);
const AXIS_OPTIONS = Array.from({ length: 181 }, (_, i) => String(i)); // 0 to 180 degrees
const ADD_OPTIONS = generateRxRange(0, 4, 0.25, true);
const PRISM_OPTIONS = generateRxRange(0, 5, 0.25);
const PD_OPTIONS = generateRxRange(40, 80, 0.5).map(v => `${v}mm`);

const RX_SELECT_OPTIONS = {
  Sph: SPH_OPTIONS,
  Cyl: CYL_OPTIONS,
  Axis: AXIS_OPTIONS,
  Add: ADD_OPTIONS,
  Prism: PRISM_OPTIONS
};

const RX_EMPTY_FORM = {
  rightSph: '', rightCyl: '', rightAxis: '', rightAdd: '', rightPrism: '',
  leftSph: '', leftCyl: '', leftAxis: '', leftAdd: '', leftPrism: '',
  pd: '', prescriptionDate: '', doctorName: '', rxFileUrl: '', notes: ''
};

const PrescriptionPanel = () => {
  const [form, setForm] = useState(RX_EMPTY_FORM);
  const [meta, setMeta] = useState(null); // verificationStatus, adminNote, updatedAt etc.
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchRx = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/prescriptions/my');
        const rx = res.data?.prescription;
        if (rx) {
          setForm({
            rightSph: rx.rightSph || '', rightCyl: rx.rightCyl || '', rightAxis: rx.rightAxis || '',
            rightAdd: rx.rightAdd || '', rightPrism: rx.rightPrism || '',
            leftSph: rx.leftSph || '', leftCyl: rx.leftCyl || '', leftAxis: rx.leftAxis || '',
            leftAdd: rx.leftAdd || '', leftPrism: rx.leftPrism || '',
            pd: rx.pd || '', prescriptionDate: rx.prescriptionDate || '', doctorName: rx.doctorName || '',
            rxFileUrl: rx.rxFileUrl || '', notes: rx.notes || ''
          });
          setMeta({
            verificationStatus: rx.verificationStatus,
            adminNote: rx.adminNote,
            updatedAt: rx.updatedAt
          });
        }
      } catch (err) {
        console.error('Error fetching prescription:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRx();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const { toast } = await import('../components/Toast');
    const formData = new FormData();
    formData.append('prescription', file);
    try {
      const response = await api.post('/api/upload/prescription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data && response.data.secure_url) {
        setForm(prev => ({ ...prev, rxFileUrl: response.data.secure_url }));
        toast.success('Prescription file uploaded! Click Save to attach it to your profile.');
      }
    } catch (err) {
      console.error('Prescription file upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload file. Please verify file type (jpg/png/pdf, max 5MB).');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { toast } = await import('../components/Toast');
    try {
      const res = await api.put('/api/prescriptions/my', form);
      if (res.data?.prescription) {
        setMeta({
          verificationStatus: res.data.prescription.verificationStatus,
          adminNote: res.data.prescription.adminNote,
          updatedAt: res.data.prescription.updatedAt
        });
      }
      toast.success('Your prescription profile has been saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save prescription.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fadeIn flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
        <Loader className="h-6 w-6 animate-spin text-[#B8952A]" />
        <p className="text-xs font-bold uppercase tracking-wider">Loading your prescription...</p>
      </div>
    );
  }

  const statusStyles = {
    'Verified': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Flagged / Action Required': 'bg-rose-50 text-rose-700 border-rose-200',
    'Not Reviewed': 'bg-amber-50 text-[#B8952A] border-amber-200'
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm animate-fadeIn text-left space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <h3 className="font-bold text-navy-dark text-base uppercase tracking-wider">
          My Prescription
        </h3>
        {meta?.verificationStatus && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${statusStyles[meta.verificationStatus] || statusStyles['Not Reviewed']}`}>
            <ShieldCheck className="h-3 w-3" />
            {meta.verificationStatus}
          </span>
        )}
      </div>

      {meta?.adminNote && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-[#1B3F6E] font-semibold">
          <span className="font-extrabold uppercase text-[11px] block mb-1">Note from our optometrist</span>
          {meta.adminNote}
        </div>
      )}

      <p className="text-xs text-text-muted leading-relaxed">
        Save your eye prescription here once — reuse it for every order and let our admin/optician team review it in advance.
      </p>

      <div className="space-y-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase block">Right Eye (OD)</span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['rightSph', 'rightCyl', 'rightAxis', 'rightAdd', 'rightPrism'].map((key) => {
            const label = key.replace('right', '');
            return (
              <div key={key} className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase block">{label}</label>
                <select className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-2 py-2 text-xs bg-white text-text-primary font-bold cursor-pointer"
                  value={form[key]} onChange={(e) => updateField(key, e.target.value)}>
                  <option value="">—</option>
                  {RX_SELECT_OPTIONS[label].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase block">Left Eye (OS)</span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {['leftSph', 'leftCyl', 'leftAxis', 'leftAdd', 'leftPrism'].map((key) => {
            const label = key.replace('left', '');
            return (
              <div key={key} className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase block">{label}</label>
                <select className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-2 py-2 text-xs bg-white text-text-primary font-bold cursor-pointer"
                  value={form[key]} onChange={(e) => updateField(key, e.target.value)}>
                  <option value="">—</option>
                  {RX_SELECT_OPTIONS[label].map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase block">Pupillary Distance (PD)</label>
          <select className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold cursor-pointer"
            value={form.pd} onChange={(e) => updateField('pd', e.target.value)}>
            <option value="">Select PD</option>
            {PD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase block">Prescription Date</label>
          <input type="date" className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold"
            value={form.prescriptionDate} onChange={(e) => updateField('prescriptionDate', e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase block">Doctor Name</label>
          <input className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-bold"
            value={form.doctorName} onChange={(e) => updateField('doctorName', e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-400 uppercase block">Notes (optional)</label>
        <textarea rows={2} className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-md px-4 py-2 text-sm bg-white text-text-primary font-semibold"
          value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase block">Prescription Card (Photo/PDF)</label>
        {form.rxFileUrl ? (
          <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg text-xs">
            <a href={form.rxFileUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-[#1B3F6E] hover:underline truncate">
              View uploaded file
            </a>
            <label className="ml-auto px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer text-[11px] font-bold uppercase">
              Replace
              <input type="file" accept="image/*,.pdf" className="hidden" disabled={uploading}
                onChange={(e) => handleFileUpload(e.target.files[0])} />
            </label>
          </div>
        ) : (
          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-lg text-xs text-slate-400 font-bold cursor-pointer hover:border-gold-accent hover:text-[#B8952A] transition-colors">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload Prescription Photo or PDF'}
            <input type="file" accept="image/*,.pdf" className="hidden" disabled={uploading}
              onChange={(e) => handleFileUpload(e.target.files[0])} />
          </label>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button disabled={saving} onClick={handleSave}
          className="btn-primary text-xs px-5 py-2.5 rounded-lg cursor-pointer disabled:opacity-50 font-extrabold uppercase tracking-wider">
          {saving ? 'Saving...' : 'Save Prescription'}
        </button>
      </div>
    </div>
  );
};

export default Account;
