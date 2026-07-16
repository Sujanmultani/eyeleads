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
import { baseURL } from './utils/api';
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
  const isProduction = import.meta.env.PROD;
  const isLocalhostApi = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');
  const isLocalhostPage = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isProduction && isLocalhostApi && !isLocalhostPage) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
        boxSizing: 'border-box',
        zIndex: 999999
      }}>
        <div style={{
          maxWidth: '540px',
          width: '100%',
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(16px)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: '#EF4444'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '32px', height: '32px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            marginBottom: '12px',
            color: '#EF4444',
            letterSpacing: '-0.025em',
            textTransform: 'uppercase'
          }}>Configuration Error</h1>
          <p style={{
            fontSize: '15px',
            color: '#94A3B8',
            lineHeight: '1.6',
            marginBottom: '24px',
            fontWeight: 500
          }}>
            The application is not connected to a live backend. <br />
            Please configure the <code style={{ color: '#F8FAFC', backgroundColor: '#334155', padding: '2px 6px', borderRadius: '4px' }}>VITE_API_URL</code> environment variable in Vercel and redeploy.
          </p>
          <div style={{
            fontSize: '13px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            padding: '16px',
            borderRadius: '12px',
            fontFamily: 'monospace',
            color: '#94A3B8',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            textAlign: 'left',
            wordBreak: 'break-all',
            lineHeight: '1.5'
          }}>
            <span style={{ color: '#F43F5E', fontWeight: 'bold' }}>[Diagnostic Information]</span><br />
            <span style={{ color: '#E2E8F0' }}>API URL:</span> {baseURL}<br />
            <span style={{ color: '#E2E8F0' }}>Hostname:</span> {typeof window !== 'undefined' ? window.location.hostname : 'unknown'}
          </div>
        </div>
      </div>
    );
  }

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
