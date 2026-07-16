import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, Eye, ShoppingCart, Camera } from 'lucide-react';
import { toast } from './Toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const [animateHeart, setAnimateHeart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Destructure and normalize between MongoDB fields and Stitch AI props
  const {
    _id,
    id = _id,
    name,
    price = 0,
    mrp = Math.round(price * 1.4), // Fallback calculation if not specified
    discount = Math.round(((mrp - price) / mrp) * 100),
    image,
    category,
    brand = 'Handcrafted Acetate',
    colors = ['black', 'gold'], // Default colors
    badges = product.badges || (category ? [category] : [])
  } = product;

  const wishlisted = isWishlisted(id);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        _id: id,
        name,
        price,
        image,
        category: category || 'Eyewear',
        brand,
        colors
      });
    }
    setAnimateHeart(true);
    setTimeout(() => setAnimateHeart(false), 800);
  };

  // Map standard color names or codes to Tailwind hex values safely
  const colorMap = {
    'gold': '#B8952A',
    'yellow': '#FACC15',
    'black': '#1A1A2E',
    'slate': '#4A5F7F',
    'silver': '#CBD5E1',
    'pink': '#EC4899',
    'blue': '#2E6DB4',
    'red': '#BA1A1A',
    'brown': '#78350F',
    'grey': '#64748B',
    'gray': '#64748B',
    'green': '#15803D',
    'tortoise': '#4A2C0F',
    'clear': '#E2E8F0',
    'transparent': '#F1F5F9',
    'rose': '#FB7185',
    'purple': '#7C3AED',
    'orange': '#EA580C',
    'amber': '#D97706',
    'navy': '#0F2744',
    'white': '#FFFFFF',
    'charcoal': '#334155',
    'teal': '#0D9488',
    'rose gold': '#B76E79',
    'rosegold': '#B76E79',
    'gunmetal': '#535C68',
    'demi': '#5C4033',
    'tortoiseshell': '#4A2C0F',
    'crystal': '#E2E8F0',
    'cream': '#FFFDD0',
    'beige': '#F5F5DC',
    'bronze': '#CD7F32',
    'copper': '#B87333',
    'peach': '#FFDAB9',
    'olive': '#808000',
    'khaki': '#F0E68C',
    'wine': '#722F37',
    'burgundy': '#800020',
    'smoke': '#94A3B8'
  };

  const getColorHex = (name) => {
    if (!name) return '#94A3B8';
    const c = name.toString().trim().toLowerCase();

    // Check if it's a multi-color combination (e.g. contains "&", "/", "and", or "-")
    // Do not split on spaces alone so unified names like "Rose Gold" or "Matte Black" stay solid.
    const words = c.split(/\s*(?:\/|&|-|\band\b)\s*/).filter(w => w !== '');

    const matchedHexes = [];
    for (const w of words) {
      if (colorMap[w]) {
        matchedHexes.push(colorMap[w]);
      } else if (w.startsWith('#')) {
        matchedHexes.push(w);
      } else {
        // Fallback: check if the word contains any color key
        for (const key of Object.keys(colorMap)) {
          if (w.includes(key)) {
            matchedHexes.push(colorMap[key]);
            break;
          }
        }
      }
    }

    if (matchedHexes.length >= 2) {
      const uniqueHexes = [...new Set(matchedHexes)];
      if (uniqueHexes.length >= 2) {
        if (uniqueHexes.length === 2) {
          return `linear-gradient(to bottom, ${uniqueHexes[0]} 50%, ${uniqueHexes[1]} 50%)`;
        } else {
          const steps = uniqueHexes.map((hex, i) => `${hex} ${(i * 100) / uniqueHexes.length}%, ${hex} ${((i + 1) * 100) / uniqueHexes.length}%`).join(', ');
          return `linear-gradient(to bottom, ${steps})`;
        }
      }
    }

    if (c.startsWith('#')) return c;
    if (colorMap[c]) return colorMap[c];

    // Check if the full name contains any mapped color key
    for (const key of Object.keys(colorMap)) {
      if (c.includes(key)) return colorMap[key];
    }

    return c || '#94A3B8';
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const standardProduct = {
      _id: id,
      name,
      price,
      image,
      category: category || 'Eyewear'
    };
    addToCart(standardProduct, 1);
    setAddedToCart(true);
    toast.success(`${name} added to cart!`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const badgeColors = {
    'Bestseller': 'bg-amber-50 text-[#B8952A] border border-[#B8952A]/30',
    'Best Seller': 'bg-amber-50 text-[#B8952A] border border-[#B8952A]/30',
    'New Arrival': 'bg-[#1B3F6E]/5 text-[#1B3F6E] border border-[#1B3F6E]/20',
    'Limited Edition': 'bg-[#0F2744] text-white border border-[#0F2744]'
  };

  const getBadgeStyle = (badge) => {
    return badgeColors[badge] || 'bg-slate-100 text-[#4A4A6A] border border-slate-200';
  };

  return (
    <article className="group relative bg-white rounded-[24px] overflow-hidden shadow-luxury shadow-luxury-hover border border-slate-100/40 flex flex-col justify-between h-full luxury-shimmer select-none card-glow">
      {/* Product Image Section */}
      <div className="relative h-44 sm:h-64 md:h-72 lg:h-80 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] overflow-hidden flex items-center justify-center shrink-0">
        
        {/* Badges / Discount on top left */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-1 items-start">
          {badges.slice(0, 1).map((badge, idx) => (
            <span
              key={idx}
              className={`text-[11px] px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-extrabold uppercase tracking-widest shadow-sm ${getBadgeStyle(badge)}`}
            >
              {badge}
            </span>
          ))}
          {product.tryOnAssets?.frontPng && (
            <span
              className="text-[11px] px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-extrabold uppercase tracking-widest shadow-sm bg-gradient-to-r from-[#B8952A] to-[#D9A736] text-white border border-[#B8952A]/30 flex items-center gap-1"
              title="3D Virtual Try-On Available"
            >
              <Camera className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
              <span>3D Try-On</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Button on top right */}
        <button 
          onClick={toggleWishlist}
          className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white/70 backdrop-blur rounded-full transition-all duration-300 shadow-sm border border-white/40 cursor-pointer hover:bg-white hover:scale-105 active:scale-95 text-[#1B3F6E] ${
            wishlisted ? 'text-red-500 bg-white ring-1 ring-red-200' : 'text-slate-500 hover:text-red-500'
          } ${animateHeart ? 'heart-pop' : ''}`}
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 transition-colors ${wishlisted ? 'fill-current text-red-500' : ''}`} />
        </button>

        {/* Floating Glassmorphic Price Tag (Corner of Image Area) */}
        <div className="hidden sm:block absolute bottom-4 right-4 z-10 bg-white/75 backdrop-blur-md border border-white/45 px-3.5 py-2 rounded-2xl shadow-sm text-xs font-black text-[#1B3F6E] select-none hover:scale-105 transition-transform duration-300">
          ₹{price.toLocaleString('en-IN')}
        </div>

        {/* Product Image */}
        <Link to={`/product/${id}`} className="w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 z-0">
          <img
            src={image || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60'}
            alt={name}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-110 group-hover:rotate-1"
          />
        </Link>

        {/* Action overlay on Hover (Quick Add + Quick View) - Displays with smooth slide-up effect */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-gradient-to-t from-slate-900/15 via-slate-900/5 to-transparent z-20 gap-2">
          <button
            onClick={handleQuickAdd}
            disabled={addedToCart}
            className={`flex-1 backdrop-blur-sm text-white py-3 rounded-2xl font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 btn-shimmer ${
              addedToCart 
                ? 'bg-emerald-600 hover:bg-emerald-600 cursor-default shadow-none' 
                : 'bg-[#1B3F6E]/95 hover:bg-[#B8952A]'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{addedToCart ? '✓ Added!' : 'Add to Bag'}</span>
          </button>
          
          <Link
            to={`/product/${id}`}
            className="bg-white/85 backdrop-blur-sm border border-white/30 hover:bg-[#1B3F6E] text-[#1B3F6E] hover:text-white p-3 rounded-2xl transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
            title="Quick View"
          >
            <Eye className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-3 sm:p-5 flex flex-col justify-between flex-grow">
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-4">
            <div className="flex-grow min-w-0">
              <Link to={`/product/${id}`} className="hover:text-[#2E6DB4] transition-colors block underline-grow">
                <h3 className="font-extrabold text-xs sm:text-[15px] text-[#1A1A2E] leading-snug hover-underline-luxury truncate">
                  {name}
                </h3>
              </Link>
              <p className="text-[11px] text-[#B8952A] font-extrabold uppercase tracking-widest mt-1 sm:mt-1.5">{brand}</p>
              {product.productId && (
                <p className="text-[11px] text-slate-400 font-mono mt-1">SKU: {product.productId}</p>
              )}
            </div>
            
            {/* Jewelry-Inspired Color Swatches */}
            {colors && colors.length > 0 && (
              <div className="flex gap-1 sm:gap-1.5 shrink-0 pt-0.5 sm:pt-1 select-none">
                {colors.map((color, idx) => (
                  <span
                    key={idx}
                    className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-white shadow-sm ring-1 ring-slate-200/80 hover:ring-[#B8952A] transition-all cursor-pointer duration-300"
                    style={{ background: getColorHex(color) }}
                    title={`Color option ${color}`}
                  ></span>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Comparison for Premium Aesthetics */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 pt-2 sm:pt-3 border-t border-slate-100">
            <span className="font-black text-[#1B3F6E] text-xs sm:text-[15px]">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {mrp > price && (
              <>
                <span className="text-[11px] sm:text-xs text-[#4A4A6A]/45 line-through">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#B8952A] font-extrabold bg-[#B8952A]/10 px-1.5 sm:px-2 py-0.5 rounded-full border border-[#B8952A]/30 tracking-wider">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Premium Star Ratings Display */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2 pt-1 select-none">
              <div className="flex items-center gap-0.2 sm:gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star} 
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${star <= Math.round(product.rating) ? 'fill-[#B8952A] text-[#B8952A]' : 'fill-slate-200 text-slate-200'}`}
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[11px] text-[#4A4A6A] font-semibold mt-0.5">
                {product.rating} ({product.reviews || 0})
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
