import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const AnnouncementBar = () => {
  const [promoText, setPromoText] = useState('🚚 FREE Express Delivery On All Orders | 7-Day Easy Returns | 100% Authentic Frames');

  useEffect(() => {
    api.get('/api/settings')
      .then(res => {
        if (res.data && res.data.settings && res.data.settings.promoBannerText) {
          setPromoText(`🎉 ${res.data.settings.promoBannerText}`);
        }
      })
      .catch(err => {
        console.warn('Could not load dynamic announcement bar promo text. Falling back to default.');
      });
  }, []);

  return (
    <div className="bg-[#0F2744] h-[40px] w-full flex items-center justify-center border-b border-white/5 px-4 text-center select-none">
      <p className="text-[#B8952A] text-[12px] sm:text-[13px] font-semibold tracking-[0.05em] uppercase truncate">
        {promoText}
      </p>
    </div>
  );
};

export default AnnouncementBar;
