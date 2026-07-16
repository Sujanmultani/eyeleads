import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import api from '../utils/api';
import { toast } from './Toast';
import { Mail, Loader } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const response = await api.post('/api/newsletter', { email: email.trim() });
      if (response.data && response.data.success) {
        setSubscribed(true);
        toast.success(response.data.message || 'Subscribed successfully!');
        setEmail('');
      } else {
        toast.error(response.data.message || 'Subscription failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <footer className="bg-[#0F2744] text-white pt-16 pb-8 border-t border-[#B8952A]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Column 1: Branding */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center select-none overflow-hidden h-9 w-40 justify-start">
              <img
                src={logo}
                alt="EyeLeads Logo"
                loading="lazy"
                className="h-8 w-auto object-contain invert mix-blend-screen"
              />
            </Link>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xs">
              Elevating vision through architectural design and clinical excellence. EyeLeads is India's premier D2C destination for high-fashion eyewear.
            </p>

            {/* Social Icons row */}
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/eye.leadscare?igsh=NHY5MDcxdWU4cWJi"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1B3F6E] flex items-center justify-center text-slate-300 hover:bg-[#B8952A] hover:text-white transition-all transform hover:scale-110 cursor-pointer"
                aria-label="Instagram"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/share/19MPxVeKWL/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1B3F6E] flex items-center justify-center text-slate-300 hover:bg-[#B8952A] hover:text-white transition-all transform hover:scale-110 cursor-pointer"
                aria-label="Facebook"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@eye.leadscare"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1B3F6E] flex items-center justify-center text-slate-300 hover:bg-[#B8952A] hover:text-white transition-all transform hover:scale-110 cursor-pointer"
                aria-label="YouTube"
              >
                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                  <polygon points="9.7 15 9.7 9 15 12 9.7 15" />
                </svg>
              </a>
              <a
                href="https://wa.me/919909934786"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#1B3F6E] flex items-center justify-center text-slate-300 hover:bg-[#B8952A] hover:text-white transition-all transform hover:scale-110 cursor-pointer"
                aria-label="WhatsApp"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.736.001-2.599-1.013-5.045-2.853-6.887C16.64 2.14 14.194 1.12 11.597 1.12c-5.441 0-9.866 4.372-9.87 9.739 0 1.712.47 3.382 1.36 4.867l-1.006 3.676 3.966-.998z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop links */}
          <div className="space-y-6">
            <h4 className="text-[#B8952A] text-xs font-bold uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3 text-slate-300 text-xs sm:text-sm">
              <li>
                <Link to="/shop?gender=men" className="hover:text-white transition-colors">
                  Men's Eyewear
                </Link>
              </li>
              <li>
                <Link to="/shop?gender=women" className="hover:text-white transition-colors">
                  Women's Eyewear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Computer+Blue+Light" className="hover:text-white transition-colors">
                  Blue Light Glasses
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Sunglasses" className="hover:text-white transition-colors">
                  Classic Sunglasses
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-6">
            <h4 className="text-[#B8952A] text-xs font-bold uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-slate-300 text-xs sm:text-sm">
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/shipping-returns" className="hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h4 className="text-[#B8952A] text-xs font-bold uppercase tracking-wider">Stay in Vision</h4>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xs">
              Subscribe to receive exclusive drops, private sales, and optical updates.
            </p>
            {subscribed ? (
              <div className="bg-[#B8952A]/10 border border-[#B8952A]/30 p-4 rounded-xl text-[#B8952A] text-xs font-bold leading-normal">
                ✓ Thank you for subscribing to our luxury updates!
              </div>
            ) : (
              <form onSubmit={handleSubscribeSubmit} className="space-y-2.5">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-[#1B3F6E]/50 border border-slate-700/50 focus:border-[#B8952A] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none pr-10 font-bold"
                  />
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#B8952A] hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader className="h-3.5 w-3.5 animate-spin" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <span>Subscribe</span>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar: Gold Separator + copyright & payments */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} Leads Care. All rights reserved.
          </p>

          {/* Secure Payment Badges with real assets */}
          <div className="flex items-center gap-6 opacity-80 scale-90 md:scale-100">
            <img
              alt="Visa secure payment"
              loading="lazy"
              className="h-4 brightness-200"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsiwDDAH-2xqFlz_3G197KwIkLYNh70S7iqBgcmUoilIxF3I-o-EhZ1OuxlPyqWAEuO1HMhIZhiXY6vbSFTguncrQJ3Glhb0_N7609qNKE4Qk0qz_zQqYTkqZU7ZmexZGo_hLKLclix53vDYLOrmEzIY85ZfEYpbXi5qdL-pt8BGs9ZVEDFalNcxM5yRMIeRAf-F_aSLIhKg0YsqIe1RL2_uRthEdC58zab_16j3SP2dy2USUeHX2V0TEWQwHEjPkWZPzhp0V94bcY"
            />
            <img
              alt="Mastercard secure payment"
              loading="lazy"
              className="h-5 brightness-200"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC31ucGYVSBafPSTttolYXIEmYWltYO2MfeaxphsggejJDLLcnIODmy1ibUpHTAadkP-3UdSv_29tvHYB9IKYLNHfTvKXUHIoH_vIQjKuEHU_iW8mgcfPJStnwzkb4MbZyPiWmDg4ddWUaC98AvjI_qcSqim-2jyokfj-1Fghgvfw8yh-HRBTYyc0Z4Yqg6iSynbjZsjc1PXsRYfp9S43qazHmnD0GL3kcftZIxKtnFHX1NFOLDoiWZIfodOmawJ71O7-7q1AN_PTZU"
            />
            <img
              alt="UPI instantaneous transaction"
              loading="lazy"
              className="h-5 brightness-200"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH344KIMzakoc2jtNoDDz6VNuejf_Z5hS15L23im4AloFw9mjDWEPZirtfurZvJxzPIXm61O2BE7zPtEGiSr4ecrgLIfCvTGYvOiox5pIakcjuDez-cPCT3tEB9tzS0f8gTJCIDBsUlv4YtEHH1VIO6KJ2lhAvyzgfRbRN0i9UDi_Q7P7vw0rkZ43cy6u88-xt5XgWdKubMFgJE2XFxz9JfNpl-ZIHO4NXomeKTQovD8fmGx4T7OfdTW1Hs7JS6SBlljpShUMrGfHc"
            />
            <div className="h-4 w-px bg-white/10 mx-1"></div>
            <span className="font-bold text-white text-xs tracking-tighter uppercase select-none opacity-60">
              Razorpay Secured
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
