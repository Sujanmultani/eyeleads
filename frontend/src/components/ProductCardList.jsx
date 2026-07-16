import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, Eye, ShoppingCart, Star, Camera } from 'lucide-react';
import { toast } from './Toast';

const ProductCardList = ({ product }) => {
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();
  const [animateHeart, setAnimateHeart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const {
    _id,
    id = _id,
    name,
    price = 0,
    mrp = Math.round(price * 1.4),
    discount = Math.round(((mrp - price) / mrp) * 100),
    image,
    category,
    brand = 'Handcrafted Acetate',
    colors = ['black', 'gold'],
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
    <article className="group relative bg-white rounded-[24px] overflow-hidden shadow-luxury shadow-luxury-hover border border-slate-100/40 p-4 flex flex-col sm:flex-row items-center gap-6 select-none h-auto w-full transition-all duration-300">
      
      {/* Left Column: Image Area */}
      <div className="relative w-full sm:w-48 h-40 sm:h-48 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
        
        {/* Badges / Discount on top left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {badges.slice(0, 1).map((badge, idx) => (
            <span
              key={idx}
              className={`text-[11px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-widest shadow-sm ${getBadgeStyle(badge)}`}
            >
              {badge}
            </span>
          ))}
          {product.tryOnAssets?.frontPng && (
            <span
              className="text-[11px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-widest shadow-sm bg-gradient-to-r from-[#B8952A] to-[#D9A736] text-white border border-[#B8952A]/30 flex items-center gap-1"
              title="3D Virtual Try-On Available"
            >
              <Camera className="h-3 w-3 text-white" />
              <span>3D Try-On</span>
            </span>
          )}
        </div>

        {/* Product Image */}
        <Link to={`/product/${id}`} className="w-full h-full flex items-center justify-center p-3 sm:p-4">
          <img
            src={image || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&auto=format&fit=crop&q=60'}
            alt={name}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-108"
          />
        </Link>
      </div>

      {/* Right Column: Title, Rating, Brand, Swatches, Pricing, CTA Buttons */}
      <div className="flex-grow w-full flex flex-col justify-between self-stretch space-y-4">
        
        <div className="space-y-2">
          {/* Header row: Brand, Swatches, Wishlist Button */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-[11px] text-[#B8952A] font-extrabold uppercase tracking-widest leading-none">{brand}</p>
              <Link to={`/product/${id}`} className="hover:text-[#2E6DB4] transition-colors mt-1.5 block">
                <h3 className="font-extrabold text-base text-[#1A1A2E] leading-snug hover-underline-luxury">
                  {name}
                </h3>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Wishlist Heart */}
              <button 
                onClick={toggleWishlist}
                className={`w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-white rounded-full transition-all duration-300 shadow-sm border border-slate-100 cursor-pointer text-[#1B3F6E] ${
                  wishlisted ? 'text-red-500 bg-white ring-1 ring-red-200' : 'text-slate-500 hover:text-red-500'
                } ${animateHeart ? 'animate-heart-beat' : ''}`}
              >
                <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'fill-current text-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Rating Summary */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2 select-none">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-3 w-3 ${star <= Math.round(product.rating) ? 'fill-[#B8952A] text-[#B8952A]' : 'text-slate-200 fill-slate-200'}`} />
                ))}
              </div>
              <span className="text-[11px] text-[#4A4A6A] font-semibold">
                {product.rating} ({product.reviews || 0} reviews)
              </span>
            </div>
          )}

          {/* Swatches */}
          {colors && colors.length > 0 && (
            <div className="flex gap-1.5 pt-1 select-none">
              {colors.map((color, idx) => (
                <span
                  key={idx}
                  className="w-3 h-3 rounded-full border border-white shadow-sm ring-1 ring-slate-200/80 hover:ring-[#B8952A] transition-all cursor-pointer duration-300"
                  style={{ background: getColorHex(color) }}
                  title={`Color option ${color}`}
                ></span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Call to Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-slate-100 flex-wrap">
          {/* Price */}
          <div className="flex items-baseline gap-2.5">
            <span className="font-black text-[#1B3F6E] text-base">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {mrp > price && (
              <>
                <span className="text-xs text-[#4A4A6A]/45 line-through">
                  ₹{mrp.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-[#B8952A] font-extrabold bg-[#B8952A]/10 px-2 py-0.5 rounded-full border border-[#B8952A]/30 tracking-wider">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* CTA Cluster */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleQuickAdd}
              disabled={addedToCart}
              className={`flex-grow sm:flex-grow-0 px-5 py-2.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-300 uppercase tracking-widest shadow-sm hover:shadow-md active:scale-95 ${
                addedToCart 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-600 cursor-default shadow-none' 
                  : 'bg-[#1B3F6E] hover:bg-[#B8952A] text-white'
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>{addedToCart ? '✓ Added!' : 'Add to Bag'}</span>
            </button>

            <Link
              to={`/product/${id}`}
              className="bg-slate-50 border border-slate-100 hover:bg-[#1B3F6E] text-[#1B3F6E] hover:text-white px-4 py-2.5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center"
              title="Quick View"
            >
              <Eye className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>

    </article>
  );
};

export default ProductCardList;
