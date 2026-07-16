import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from './Toast';
import { Plus, Edit2, Trash2, Loader, X } from 'lucide-react';

const CouponManagementPanel = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage',
    value: 0,
    minSubtotal: 0,
    maxDiscount: '',
    description: '',
    isActive: true,
    expiresAt: '',
    usageLimit: ''
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/coupons');
      setCoupons(res.data);
    } catch (err) {
      toast.error('Could not fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : null
      };
      await api.post('/api/coupons', payload);
      toast.success('Coupon created successfully!');
      setIsAddModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create coupon.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt) : null
      };
      await api.put(`/api/coupons/${selectedCoupon._id}`, payload);
      toast.success('Coupon updated successfully!');
      setIsEditModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update coupon.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/api/coupons/${id}`);
      toast.success('Coupon deleted successfully!');
      fetchCoupons();
    } catch (err) {
      toast.error('Could not delete coupon.');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await api.put(`/api/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      toast.success(`Coupon ${coupon.isActive ? 'deactivated' : 'activated'} successfully!`);
      fetchCoupons();
    } catch (err) {
      toast.error('Could not update coupon status.');
    }
  };

  const resetForm = () => {
    setForm({
      code: '',
      type: 'percentage',
      value: 0,
      minSubtotal: 0,
      maxDiscount: '',
      description: '',
      isActive: true,
      expiresAt: '',
      usageLimit: ''
    });
    setSelectedCoupon(null);
  };

  const openEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minSubtotal: coupon.minSubtotal || 0,
      maxDiscount: coupon.maxDiscount || '',
      description: coupon.description || '',
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || ''
    });
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center text-slate-400">
        <Loader className="h-8 w-8 animate-spin text-gold-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-black text-[#1B3F6E] uppercase tracking-widest">Coupon Registry</h3>
        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="bg-navy-dark hover:bg-[#1B3F6E] text-white font-extrabold text-xxs uppercase tracking-widest py-3 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                <th className="py-4.5 px-6">Code</th>
                <th className="py-4.5 px-6">Type</th>
                <th className="py-4.5 px-6">Value</th>
                <th className="py-4.5 px-6">Min Subtotal</th>
                <th className="py-4.5 px-6">Max Discount</th>
                <th className="py-4.5 px-6">Usage</th>
                <th className="py-4.5 px-6">Expiry</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    No coupons configured
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-extrabold text-[#1B3F6E] uppercase tracking-wider">{coupon.code}</td>
                    <td className="py-4.5 px-6 font-semibold text-slate-500 capitalize">{coupon.type}</td>
                    <td className="py-4.5 px-6 font-black text-navy-dark">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value.toLocaleString('en-IN')}`}
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-slate-500">₹{coupon.minSubtotal.toLocaleString('en-IN')}</td>
                    <td className="py-4.5 px-6 font-semibold text-slate-500">
                      {coupon.maxDiscount ? `₹${coupon.maxDiscount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-slate-500">
                      {coupon.usedCount} {coupon.usageLimit !== null ? `/ ${coupon.usageLimit}` : ''}
                    </td>
                    <td className="py-4.5 px-6 font-semibold text-slate-500">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="py-4.5 px-6">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        className={`inline-flex px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider cursor-pointer ${
                          coupon.isActive
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}
                      >
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="h-8 w-8 rounded-lg bg-slate-100 text-navy-primary hover:bg-gold-accent hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xxs"
                          title="Edit Coupon"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xxs"
                          title="Delete Coupon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Coupon Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-navy-dark/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-[32px] border border-slate-100 w-full max-w-lg shadow-luxury overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-[#1B3F6E] uppercase tracking-widest text-xs">
                {isAddModalOpen ? 'Create New Coupon' : 'Edit Coupon'}
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate} className="p-6 space-y-4 overflow-y-auto flex-grow">
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER50"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 text-text-primary text-xs font-bold uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Discount Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 text-text-primary text-xs font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 text-text-primary text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Min Subtotal (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minSubtotal}
                    onChange={(e) => setForm({ ...form, minSubtotal: Number(e.target.value) })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 text-text-primary text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                    placeholder="None (unlimited)"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 text-text-primary text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="None (unlimited)"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 text-text-primary text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 text-text-primary text-xs font-bold"
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Description</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Get 10% off on premium frames above ₹3,000"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 text-text-primary text-xs font-bold"
                  />
                </div>

                <div className="flex items-center gap-2 col-span-2 pt-2">
                  <input
                    type="checkbox"
                    id="couponIsActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                  />
                  <label htmlFor="couponIsActive" className="text-[10px] font-bold uppercase tracking-wider cursor-pointer text-slate-500">
                    Coupon is Active and Redeemable
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-5 py-3 border border-slate-200 text-[#4A4A6A] hover:bg-slate-50 rounded-xl text-xxs font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#1B3F6E] hover:bg-navy-dark text-white rounded-xl text-xxs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md"
                >
                  {isAddModalOpen ? 'Create Coupon' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagementPanel;
