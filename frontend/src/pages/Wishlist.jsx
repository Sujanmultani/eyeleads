import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowLeft, HeartOff } from 'lucide-react';

const Wishlist = () => {
  const { wishlistItems, wishlistCount } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 animate-fadeIn pb-24 md:pb-16 select-none">
      
      {/* Editorial Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6 mb-10">
        <div>
          <nav className="mb-3 select-none">
            <ol className="flex items-center gap-2 text-xs font-bold text-[#4A4A6A]/60">
              <li>
                <Link to="/" className="hover:text-[#1B3F6E] transition-colors">Home</Link>
              </li>
              <li>
                <span className="text-slate-300">/</span>
              </li>
              <li className="text-[#1B3F6E] font-black">Wishlist</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 border border-rose-100 shrink-0">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#1A1A2E] tracking-tight">My Favorites</h1>
              <p className="text-xs text-slate-500 mt-1">Saved premium frames & custom prescription eyewear styles</p>
            </div>
          </div>
        </div>

        <Link
          to="/shop"
          className="flex items-center gap-2 text-xs font-black text-[#1B3F6E] border border-[#1B3F6E]/20 hover:border-[#1B3F6E] px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all select-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* Wishlist Items Display */}
      {wishlistCount > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
          {wishlistItems.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto py-20 text-center space-y-6">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100 shadow-xxs mx-auto">
            <HeartOff className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-light font-serif text-navy-dark">Your Wishlist is Empty</h2>
            <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
              Explore our handcrafted eyewear designs, screen protec lenses, and classic luxury aviators to curate your dream frame list.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-block bg-[#0F2744] hover:bg-[#1B3F6E] text-white text-xs font-extrabold uppercase tracking-widest px-7 py-4 rounded-xl shadow-md transition-all select-none"
          >
            Explore Frames
          </Link>
        </div>
      )}

    </div>
  );
};

export default Wishlist;
