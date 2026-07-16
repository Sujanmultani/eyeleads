import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

let toastFn = null;

export const toast = {
  success: (msg) => toastFn?.('success', msg),
  error: (msg) => toastFn?.('error', msg),
  info: (msg) => toastFn?.('info', msg),
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastFn = (type, message) => {
      // Date.now() alone can collide if two toasts fire in the same millisecond.
      // Appending a random suffix guarantees a unique id every time.
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts(prev => [...prev, { id, type, message }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(({ id, type, message }) => {
        const isSuccess = type === 'success';
        const isError = type === 'error';
        
        return (
          <div 
            key={id} 
            className={`pointer-events-auto w-full bg-white rounded-2xl border p-4 shadow-luxury flex items-start gap-3 transition-all duration-300 animate-slideInRight animate-fadeIn ${
              isSuccess 
                ? 'border-emerald-100 bg-emerald-50/20 text-emerald-800' 
                : isError 
                ? 'border-rose-100 bg-rose-50/20 text-rose-800' 
                : 'border-blue-100 bg-blue-50/20 text-blue-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : isError ? (
                <AlertCircle className="h-5 w-5 text-rose-600" />
              ) : (
                <Info className="h-5 w-5 text-blue-600" />
              )}
            </div>
            
            <div className="flex-grow min-w-0">
              <p className="text-xs font-bold leading-relaxed">{message}</p>
            </div>

            <button 
              onClick={() => removeToast(id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
