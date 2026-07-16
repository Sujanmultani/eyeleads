import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import anime from 'animejs';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import BackToTop from './components/BackToTop';
import { ToastContainer } from './components/Toast';
import { Loader } from 'lucide-react';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Account = lazy(() => import('./pages/Account'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ShippingReturns = lazy(() => import('./pages/ShippingReturns'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));

import WhatsAppButton from './components/WhatsAppButton';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
function AppContent() {
  const { loading } = useAuth();
  const location = useLocation();
  const mainRef = React.useRef(null);

  React.useEffect(() => {
    if (mainRef.current) {
      anime({
        targets: mainRef.current,
        opacity: [0, 1],
        translateY: [15, 0],
        duration: 400,
        easing: 'easeOutQuad',
      });
    }
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-3 text-slate-400 select-none">
        <Loader className="h-10 w-10 animate-spin text-[#B8952A]" />
        <p className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E]">Loading EyeLeads Experience...</p>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        {/* Promotion banner at the very top */}
        <AnnouncementBar />

        {/* Sticky header navbar */}
        <Navbar />

        {/* Main content viewport */}
        <main ref={mainRef} className="flex-grow">
          <Suspense fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#F8FAFC] gap-3 text-slate-400 select-none">
              <Loader className="h-10 w-10 animate-spin text-[#B8952A]" />
              <p className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E]">Loading content...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/shipping-returns" element={<ShippingReturns />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        {/* Multi-column website footer */}
        <Footer />

        {/* Floating WhatsApp Action Widget */}
        <WhatsAppButton />

        {/* Floating Back to Top Anchor */}
        <BackToTop />

        {/* Toast micro-notification popup system */}
        <ToastContainer />
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
