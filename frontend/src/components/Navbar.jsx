import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Search, Heart, ShoppingBag, Menu, X, Home, Compass, Camera, User } from 'lucide-react';
import logo from '../assets/logo.png';
import * as Dialog from '@radix-ui/react-dialog';


const Navbar = () => {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [animateCart, setAnimateCart] = useState(false);
  const [animateWishlist, setAnimateWishlist] = useState(false);

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  useEffect(() => {
    if (wishlistCount > 0) {
      setAnimateWishlist(true);
      const timer = setTimeout(() => setAnimateWishlist(false), 400);
      return () => clearTimeout(timer);
    }
  }, [wishlistCount]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Monitor scroll for premium sticky effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Track Order', path: '/track-order' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'py-2 shadow-md backdrop-blur-md bg-white/95' : 'py-3.5 shadow-sm'
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Left: Brand Logo */}
        <div className="flex-shrink-0 flex items-center">
          <Link to="/" className="flex items-center select-none py-1">
            <img
              src={logo}
              alt="EyeLeads - Premium Eyewear"
              className={`w-auto object-contain transition-all duration-300 ${scrolled ? 'h-8 sm:h-9' : 'h-9 sm:h-10 lg:h-11'
                }`}
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <ul className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => {
            // Since Collections is a hash anchor, we can link it as standard href or Link
            if (link.path.startsWith('/#')) {
              return (
                <li key={link.name}>
                  <a
                    href={link.path}
                    className="text-xs font-bold uppercase tracking-wider text-[#4A4A6A] hover:text-[#1B3F6E] transition-colors hover-underline-navbar pb-1"
                  >
                    {link.name}
                  </a>
                </li>
              );
            }
            return (
              <li key={link.name}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `text-xs font-bold uppercase tracking-wider pb-1 transition-colors hover-underline-navbar ${isActive
                      ? 'active-nav-link'
                      : 'text-[#4A4A6A] hover:text-[#1B3F6E]'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Right: Actions Cluster */}
        <div className="hidden lg:flex items-center space-x-6">
          <div className="flex items-center space-x-5 text-[#4A4A6A]">
            <button onClick={() => setSearchOpen(true)} className="hover:text-[#1B3F6E] transition-colors focus:outline-none shrink-0 cursor-pointer hover-scale-bounce">
              <Search className="h-5 w-5" />
            </button>
            <Link to="/wishlist" className="relative hover:text-red-500 transition-colors shrink-0 hover-scale-bounce">
              <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-current text-red-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className={`absolute -top-2 -right-2 bg-red-500 text-white text-[11px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${animateWishlist ? 'animate-badge-pop' : ''}`}>
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative block text-[#4A4A6A] hover:text-[#1B3F6E] transition-colors hover-scale-bounce">
              <ShoppingBag className="h-5.5 w-5.5" />
              {cartCount > 0 && (
                <span className={`absolute -top-2 -right-2 bg-[#1B3F6E] text-white text-[11px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${animateCart ? 'animate-badge-pop' : ''}`}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
          <div className="h-5 w-px bg-slate-200"></div>

          <Link
            to={user ? (user.isAdmin ? "/admin" : "/account") : "/login"}
            className="text-xs font-bold uppercase tracking-wider text-[#1B3F6E] hover:text-[#2E6DB4] transition-colors border border-[#1B3F6E]/20 px-4 py-2 rounded hover-lift"
          >
            {user ? (user.isAdmin ? 'Admin' : 'Account') : 'Login'}
          </Link>
        </div>

        {/* Mobile Hamburger toggle button */}
        <div className="flex items-center lg:hidden space-x-4">
          <Link to="/cart" className="relative text-[#4A4A6A] hover-scale-bounce">
            <ShoppingBag className="h-5.5 w-5.5" />
            {cartCount > 0 && (
              <span className={`absolute -top-2 -right-2 bg-[#1B3F6E] text-white text-[11px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${animateCart ? 'animate-badge-pop' : ''}`}>
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#1B3F6E] hover:text-[#2E6DB4] focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>
    </header>

    {/* Mobile Menu via Radix Dialog */}
      <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[9998] data-[state=open]:animate-fadeIn" />
          <Dialog.Content
            className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[9999] shadow-2xl
                       data-[state=open]:animate-slideInRight data-[state=closed]:animate-slideOutRight
                       flex flex-col p-6 space-y-4"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <Dialog.Title className="text-sm font-extrabold text-[#1B3F6E] uppercase tracking-wider">
                Menu
              </Dialog.Title>
              <Dialog.Close className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer">
                <X className="h-6 w-6" />
              </Dialog.Close>
            </div>
            <div className="flex flex-col space-y-3 pt-4">
              {navLinks.map((link) => {
                if (link.path.startsWith('/#')) {
                  return (
                    <a
                      key={link.name}
                      href={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-sm font-bold uppercase tracking-wider text-[#4A4A6A] hover:text-[#1B3F6E]"
                    >
                      {link.name}
                    </a>
                  );
                }
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block py-2 text-sm font-bold uppercase tracking-wider ${isActive ? 'text-[#1B3F6E] font-extrabold' : 'text-[#4A4A6A] hover:text-[#1B3F6E]'}`
                    }
                  >
                    {link.name}
                  </NavLink>
                );
              })}
              <div className="h-px bg-slate-100 my-4"></div>
              <Link
                to={user ? (user.isAdmin ? "/admin" : "/account") : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider text-[#1B3F6E] border border-[#1B3F6E]/20 rounded"
              >
                {user ? (user.isAdmin ? 'Admin' : 'Account') : 'Login'}
              </Link>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Mobile Ergonomic Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 py-2.5 px-4 lg:hidden flex justify-around items-center shadow-[0_-8px_30px_rgba(15,39,68,0.05)] select-none">
        <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/' ? 'text-[#1B3F6E]' : 'text-[#4A4A6A] hover:text-[#1B3F6E]'}`}>
          <Home className={`h-5 w-5 ${pathname === '/' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link to="/shop" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/shop' ? 'text-[#1B3F6E]' : 'text-[#4A4A6A] hover:text-[#1B3F6E]'}`}>
          <Compass className={`h-5 w-5 ${pathname === '/shop' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Shop</span>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/cart' ? 'text-[#1B3F6E]' : 'text-[#4A4A6A] hover:text-[#1B3F6E]'} relative`}>
          <ShoppingBag className={`h-5 w-5 ${pathname === '/cart' ? 'stroke-[2.5]' : ''}`} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-2.5 bg-[#1B3F6E] text-white text-[11px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
          <span className="text-[11px] font-bold uppercase tracking-wider">Cart</span>
        </Link>
        <Link to={user ? (user.isAdmin ? "/admin" : "/account") : "/login"} className={`flex flex-col items-center gap-1 transition-colors ${(pathname === '/account' || pathname === '/admin' || pathname === '/login') ? 'text-[#1B3F6E]' : 'text-[#4A4A6A] hover:text-[#1B3F6E]'}`}>
          <User className={`h-5 w-5 ${(pathname === '/account' || pathname === '/admin' || pathname === '/login') ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider">{user ? (user.isAdmin ? 'Admin' : 'Account') : 'Account'}</span>
        </Link>
      </div>

      {/* Global Search Overlay Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[9999] flex items-start justify-center pt-24 px-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={handleSearchSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-slideDown"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search premium frames, shapes, lenses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm font-bold text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-3.5 text-xxs text-slate-400 font-extrabold uppercase tracking-widest bg-white">
              Trending: "Aviator", "Titanium", "Blue-Cut", "Sunglasses", "Kids"
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Navbar;
