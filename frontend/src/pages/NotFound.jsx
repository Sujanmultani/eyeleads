import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShoppingBag, ArrowRight } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#F8FAFC] px-4 select-none">
      <div className="max-w-md w-full bg-white rounded-[32px] border border-slate-100 shadow-luxury p-8 sm:p-12 text-center space-y-8 animate-fadeIn">
        
        {/* Floating animated icon */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-[#1B3F6E]/5 rounded-full text-[#1B3F6E] animate-pulse">
          <Compass className="h-12 w-12 text-[#1B3F6E] animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 border-2 border-dashed border-[#B8952A]/30 rounded-full animate-spin" style={{ animationDuration: '15s' }}></div>
        </div>

        {/* Error text details */}
        <div className="space-y-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#B8952A]">Error 404</span>
          <h1 className="text-3xl font-extrabold text-[#1B3F6E] tracking-tight">Page Not Found</h1>
          <p className="text-xs font-semibold text-[#4A4A6A] leading-relaxed max-w-sm mx-auto">
            The premium optical corridor you are trying to view does not exist or has been relocated to another collection folder.
          </p>
        </div>

        {/* Action button triggers */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/shop"
            className="flex-1 bg-[#1B3F6E] hover:bg-[#2E6DB4] hover:shadow-[0_0_15px_rgba(27,63,110,0.2)] text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Shop Frames</span>
          </Link>
          <Link
            to="/"
            className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-[#1B3F6E] py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Back to Home</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
