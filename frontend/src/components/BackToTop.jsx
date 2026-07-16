import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 md:bottom-6 left-6 z-40 bg-white border border-slate-200 text-[#1B3F6E] p-3 rounded-full shadow-lg hover:bg-[#1B3F6E] hover:text-white hover:border-[#1B3F6E] transition-all duration-300 active:scale-95 cursor-pointer select-none"
      title="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
};

export default BackToTop;
