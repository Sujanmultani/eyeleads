import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingReturns = () => {
  return (
    <div className="animate-fadeIn bg-[#F8FAFC] py-16 sm:py-24 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-100 pb-6 space-y-2">
          <span className="text-[#B8952A] text-xxs font-extrabold uppercase tracking-widest block">EyeLeads Logistics</span>
          <h1 className="text-3xl font-extrabold text-[#0F2744] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Shipping & Returns
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Fulfillment Desk Specifications</p>
        </div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#B8952A] shadow-sm">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-xs font-black text-[#0F2744] uppercase tracking-wider">Express Dispatch</h4>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Standard orders are processed immediately. Complimentary Express shipping applies to all orders above ₹999.
            </p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#B8952A] shadow-sm">
              <RotateCcw className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-xs font-black text-[#0F2744] uppercase tracking-wider">7-Day Returns</h4>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Sunglasses and standard frames can be returned within 7 days. Custom prescription lenses are non-refundable for change of mind.
            </p>
          </div>
        </div>

        {/* Core Content */}
        <div className="space-y-8 text-xs sm:text-sm text-[#4A4A6A] leading-relaxed font-medium">
          
          {/* Shipping Timelines */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>Shipping Speeds & Cost Matrix</span>
            </h3>
            
            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xxs">
              <table className="w-full text-left border-collapse text-xxs sm:text-xs">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50/50 text-[#0F2744] font-black uppercase tracking-wider">
                    <th className="py-3 px-4">Order Value</th>
                    <th className="py-3 px-4">Delivery Speed</th>
                    <th className="py-3 px-4 text-right">Valet Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-slate-700">Below ₹999</td>
                    <td className="py-3.5 px-4">5–7 Business Days</td>
                    <td className="py-3.5 px-4 text-right font-black text-[#0F2744]">₹99</td>
                  </tr>
                  <tr className="bg-slate-50/10">
                    <td className="py-3.5 px-4 font-bold text-slate-700">₹999 & Above</td>
                    <td className="py-3.5 px-4">5–7 Business Days</td>
                    <td className="py-3.5 px-4 text-right font-black text-green-600">FREE Express</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-[#0F2744]">Prescription Lenses</td>
                    <td className="py-3.5 px-4 text-amber-600 font-semibold">Add 3–5 Days for Lens Cutting & Optometry verification</td>
                    <td className="py-3.5 px-4 text-right font-black text-green-600">FREE Express</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Refund Details */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>Our 7-Day Return & Refund Policy</span>
            </h3>
            <p>
              This Website is legally owned and operated by <strong>Leads Care</strong>. We want you to be completely satisfied with your EyeLeads purchase. We accept returns for non-prescription items (such as sunglasses or standard frames) within <strong>7 days of delivery</strong>, subject to the following requirements:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>The frame must be completely unworn, scratch-free, in original packaging, and in resalable condition.</li>
              <li>Must be returned inside the original leather case box with the micro-fiber wiping cloth.</li>
              <li><strong>Prescription Lenses Exclusion:</strong> Because prescription lenses are custom-made to your specific measurements and optical requirements, they cannot be returned for a simple change of mind. Custom-made lenses are non-refundable unless they suffer from manufacturing defects or alignment errors on arrival.</li>
            </ul>
          </div>

          {/* Return Coordination */}
          <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="font-extrabold text-[#0F2744] text-xs uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-[#B8952A]" />
              <span>How to Initiate a Return</span>
            </h4>
            <p className="text-[11px] leading-relaxed">
              To initiate a return pickup, simply drop an email to our support desk at <a href="https://mail.google.com/mail/?view=cm&fs=1&to=eyeleadscare@gmail.com" target="_blank" rel="noopener noreferrer" className="font-bold text-[#0F2744] hover:text-[#B8952A] transition-colors hover:underline">eyeleadscare@gmail.com</a> or contact our WhatsApp helpline at <strong className="text-[#0F2744]">+91 99099 34786</strong> with your order details. Once approved, our logistics valet will arrange doorstep pickup. Refunds will be processed to the original method of payment within <strong>7-10 business days</strong> after inspection of the returned item at our warehouse.
            </p>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#0F2744]/10 text-[#0F2744] flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Support Desk Email</p>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=eyeleadscare@gmail.com" target="_blank" rel="noopener noreferrer" className="font-bold text-[#0F2744] hover:text-[#B8952A] transition-colors hover:underline mt-1 block">eyeleadscare@gmail.com</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#0F2744]/10 text-[#0F2744] flex items-center justify-center shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Operation Hours</p>
                <p className="font-bold text-[#0F2744] mt-1">Mon–Sat, 9:00 AM – 6:00 PM IST</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ShippingReturns;
