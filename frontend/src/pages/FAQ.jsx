import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  AlertCircle, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  FileText, 
  CreditCard, 
  Shield,
  HelpCircle,
  PhoneCall,
  X,
  ArrowRight
} from 'lucide-react';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);

  // FAQ Categories list
  const categoriesList = [
    { id: 'all', label: 'All Questions', count: 12, icon: HelpCircle },
    { id: 'orders', label: 'Orders', count: 2, icon: ShoppingBag },
    { id: 'shipping', label: 'Shipping', count: 2, icon: Truck },
    { id: 'returns', label: 'Returns', count: 2, icon: RotateCcw },
    { id: 'prescription', label: 'Prescription', count: 2, icon: FileText },
    { id: 'payments', label: 'Payments', count: 2, icon: CreditCard },
    { id: 'warranty', label: 'Warranty', count: 2, icon: Shield }
  ];

  // FAQ Mock Dataset
  const faqData = [
    {
      category: 'orders',
      q: 'How do I check my order status?',
      a: 'You can check your active order status instantly in your Account dashboard under "Track Order". We also dispatch real-time shipping notifications via SMS and email with live courier tracking links.'
    },
    {
      category: 'orders',
      q: 'Can I cancel or modify my frame order?',
      a: 'To maintain fast shipping delivery, orders are pushed immediately to our optical lab. You can cancel or modify your frame order within 1 hour of placement by contacting our Tele-Optics hotline.'
    },
    {
      category: 'shipping',
      q: 'What are your estimated delivery times?',
      a: 'For non-prescription sunglasses or fashion frames, delivery takes 2-3 business days. For custom prescription lenses checked by our optometrists, delivery is 4-5 business days.'
    },
    {
      category: 'shipping',
      q: 'Do you offer worldwide express shipping?',
      a: 'Yes, we offer complimentary express shipping worldwide on all orders above ₹999. Inbound shipments are secured and fully insured.'
    },
    {
      category: 'returns',
      q: 'What is your returns and exchange policy?',
      a: 'We offer a 7-day return and exchange policy on non-prescription items (such as sunglasses or standard frames), provided they are unworn, in original packaging, and in resalable condition. Custom-made prescription lenses are excluded from returns for change of mind.'
    },
    {
      category: 'returns',
      q: 'Are custom prescription lenses eligible for return?',
      a: 'No, custom prescription lenses are custom-crafted to your specific focal parameters and cannot be returned for change of mind. However, they are covered under our Lens Adaptation Policy: we mandate a 14 to 21-day adaptation wear period. If discomfort persists after 21 days, contact us within 30 days of receipt. If we made a manufacturing or alignment error, we will remake the lenses at no cost. If your provided prescription was inaccurate, standard remake fees apply.'
    },
    {
      category: 'prescription',
      q: 'How do I securely upload my prescription?',
      a: 'You can easily upload a photo or PDF of your doctor prescription card during checkout, or attach it directly through our uploader on the Contact Us page.'
    },
    {
      category: 'prescription',
      q: 'What is Pupillary Distance (PD) and how is it measured?',
      a: 'Pupillary Distance (PD) is the distance between your pupils in millimeters. If not written on your prescription card, you can measure it in 60 seconds using a ruler in front of a mirror or try our built-in virtual styling camera tool!'
    },
    {
      category: 'payments',
      q: 'What payment options are supported?',
      a: 'We support instant UPI (GPay, PhonePe, Paytm, BHIM), all major Credit/Debit Cards, Net Banking, cash on delivery (COD), and interest-free EMIs up to 12 months.'
    },
    {
      category: 'payments',
      q: 'Can I pay using corporate health insurance or FSA/HSA cards?',
      a: 'Yes. EyeLeads custom prescription eyeglasses qualify as medical devices. We provide official itemized invoices containing doctor prescriptions for instant reimbursement claims.'
    },
    {
      category: 'warranty',
      q: 'What does your 1-Year structural warranty cover?',
      a: 'Leads Care provides a standard 12-month limited warranty on frames and lenses against manufacturing defects (such as peeling of anti-reflective coatings, spontaneous delamination, and frame weld failures). The warranty explicitly excludes scratches from normal wear/tear, dropping, improper cleaning, physical damage, extreme heat, or loss/theft.'
    },
    {
      category: 'warranty',
      q: 'How do I claim a frame replacement under warranty?',
      a: 'Simply file a claim on our contact form with a photo of the defect. Our optical engineers will review it and ship a brand new frame replacement or repair components as soon as verified.'
    }
  ];



  // Search recommendation chips
  const searchSuggestions = [
    'Prescription',
    'Pupillary Distance',
    'Warranty',
    'Returns',
    'Shipping'
  ];

  // Filters logic
  const filteredFaqs = faqData.filter(faq => {
    const matchesSearch = 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      faq.category === selectedCategory;
      
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-text-primary pb-24 select-none relative overflow-hidden">
      <SEO title="Frequently Asked Questions" description="Answers to common questions about EyeLeads orders, shipping, returns, prescriptions, and more." />
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-accent/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-navy-primary/5 rounded-full blur-[100px] -z-10"></div>

      {/* 1. MINIMAL ELEGANT HELP CENTER HERO */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60 bg-white shadow-xxs">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gold-accent/10 border border-gold-accent/20 px-4.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.25em] text-gold-accent">
            <Sparkles className="h-3 w-3" />
            <span>Optics Learning & Care Center</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-light text-navy-dark leading-tight tracking-tight font-serif">
            How can we <span className="italic font-light text-gold-accent font-serif">help you today?</span>
          </h1>
          <p className="text-text-muted text-xs sm:text-sm max-w-xl mx-auto font-medium">
            Search our comprehensive database curated by expert opticians or connect with a dedicated luxury styling concierge.
          </p>

          {/* Premium Search Widget */}
          <div className="relative w-full max-w-xl mx-auto pt-4">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-5 w-5 stroke-[2.2] text-navy-primary" />
              </div>
              <input
                type="text"
                placeholder="Search prescription, warranty, sizing, shipping..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveFaq(null);
                }}
                className="w-full border border-slate-200/80 focus:border-gold-accent focus:outline-none rounded-full pl-12 pr-12 py-4.5 text-xs bg-slate-50/50 focus:bg-white text-text-primary placeholder-slate-400/80 font-semibold shadow-[0_4px_20px_rgba(27,63,110,0.04)] focus:shadow-[0_4px_24px_rgba(184,149,42,0.1)] transition-all duration-350"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveFaq(null);
                  }}
                  className="absolute right-4 p-1.5 rounded-full text-slate-400 hover:text-navy-primary hover:bg-slate-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Quick search suggestion chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Popular:</span>
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setActiveFaq(null);
                  }}
                  className="px-3 py-1 rounded-full bg-slate-100/70 hover:bg-gold-accent/15 text-[11px] font-bold text-navy-primary hover:text-gold-accent transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        
        {/* 2. GRID OF LUXURY CATEGORY CARDS */}
        <section className="space-y-4">
          <div className="text-center">
            <span className="text-gold-accent text-[11px] font-extrabold uppercase tracking-[0.3em] block">Browse by Department</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categoriesList.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setActiveFaq(null);
                  }}
                  className={`px-6 py-4.5 rounded-2xl border text-xxs font-extrabold uppercase tracking-widest flex items-center gap-3 cursor-pointer transition-all duration-300 active-scale-premium relative overflow-hidden ${
                    isActive
                      ? 'bg-navy-dark border-navy-dark text-white shadow-[0_8px_20px_rgba(15,39,68,0.15)]'
                      : 'bg-white border-slate-200/80 hover:border-gold-accent hover:shadow-[0_4px_16px_rgba(184,149,42,0.06)] text-text-muted hover:text-navy-primary'
                  }`}
                >
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-gold-accent"></span>
                  )}
                  <Icon className={`h-4.5 w-4.5 stroke-[1.8] ${isActive ? 'text-gold-accent' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded ${isActive ? 'bg-white/10 text-gold-accent' : 'bg-slate-50 text-slate-400 font-bold'}`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. ACCORDION FAQ ENGINE & STYLING CONCIERGE CTAs */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Premium Accordion UI (Takes 8 columns) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-[32px] border border-slate-200/60 shadow-[0_10px_35px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-navy-dark text-[11px] sm:text-xs uppercase tracking-[0.2em]">
                {selectedCategory === 'all' ? 'All Curated Questions' : `${selectedCategory} Department`}
              </h3>
              <span className="text-[11px] text-slate-400 font-bold">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'Article' : 'Articles'} Found
              </span>
            </div>

            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div
                      key={index}
                      className={`border rounded-2xl overflow-hidden transition-all duration-350 ${
                        isOpen 
                          ? 'border-gold-accent/40 bg-white shadow-[0_8px_24px_rgba(184,149,42,0.04)]' 
                          : 'border-slate-100 bg-[#F8FAFC]/50 hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : index)}
                        className="w-full flex justify-between items-center px-6 py-5 text-left text-xs sm:text-sm font-extrabold text-navy-dark transition-colors cursor-pointer select-none"
                      >
                        <span className={`transition-colors duration-250 ${isOpen ? 'text-gold-accent' : 'group-hover:text-navy-primary'}`}>{faq.q}</span>
                        <div className={`p-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-gold-accent/10 text-gold-accent' : 'bg-slate-100 text-navy-primary'}`}>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4 stroke-[2.5]" />
                          ) : (
                            <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                          )}
                        </div>
                      </button>
                      
                      {/* Buttery smooth CSS transition container */}
                      <div
                        className={`transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                          isOpen ? 'max-h-[300px] opacity-100 border-t border-slate-100/50' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-6 py-5 text-[11px] sm:text-xs leading-relaxed text-text-muted bg-white font-medium">
                          {faq.a}
                          <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-400 font-bold uppercase tracking-wider pt-3 border-t border-slate-50">
                            <span>Was this helpful?</span>
                            <button className="text-gold-accent hover:underline">Yes</button>
                            <span>•</span>
                            <button className="text-slate-400 hover:text-navy-primary hover:underline">No</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 space-y-4 text-slate-400 font-bold">
                  <div className="h-16 w-16 rounded-full bg-gold-accent/10 flex items-center justify-center mx-auto text-gold-accent">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-navy-dark font-extrabold">No matching questions found.</p>
                    <p className="text-[11px] text-slate-400 font-medium max-w-xs mx-auto">Try checking your spelling or selecting a different category from above.</p>
                  </div>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                    className="text-xxs uppercase tracking-widest text-gold-accent hover:underline font-extrabold mt-2"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Contact Concierge CTAs (Takes 4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* WhatsApp Card */}
            <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 select-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                    <MessageCircle className="h-6 w-6 fill-current" />
                  </div>
                  <h4 className="font-extrabold text-navy-dark text-base uppercase tracking-wider pt-3">Optics WhatsApp</h4>
                  <span className="text-[#B8952A] text-[11px] uppercase tracking-widest font-extrabold block">Expert Lens Consultation</span>
                </div>
                
                {/* Active Indicator Pulse */}
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full text-emerald-600 font-extrabold text-[11px] tracking-wider uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Online</span>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed font-semibold">
                Chat directly with our luxury opticians regarding prescription verification, sizing, or progressive lens advice.
              </p>

              <a
                href="https://wa.me/919909934786?text=Hello%20EyeLeads%20Team%20%F0%9F%91%8B%2C%20I%20visited%20your%20website%20and%20would%20like%20assistance"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xxs uppercase tracking-widest py-4.5 rounded-2xl w-full text-center flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(16,185,129,0.3)] active-scale-premium transition-all duration-300"
              >
                <MessageCircle className="h-4.5 w-4.5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Email Stylist Card */}
            <div className="bg-navy-dark p-8 rounded-[32px] shadow-[0_12px_40px_rgba(15,39,68,0.15)] text-white space-y-6 select-none relative overflow-hidden group">
              <div className="absolute -top-12 -left-12 w-36 h-36 bg-gold-accent/10 rounded-full blur-[50px] -z-10 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="space-y-1">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-gold-accent shadow-sm shrink-0 border border-white/5">
                  <Mail className="h-6 w-6" />
                </div>
                <h4 className="font-extrabold text-white text-base uppercase tracking-wider pt-3">Email Stylists</h4>
                <span className="text-gold-accent text-[11px] uppercase tracking-widest font-extrabold block">24/7 Digital Support Ticket</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                Send a ticket regarding order modifications, frame customizations, or special optical coatings. Average reply in under 2 hours.
              </p>

              <Link
                to="/contact"
                className="bg-gold-accent hover:bg-amber-600 text-white font-extrabold text-xxs uppercase tracking-widest py-4.5 rounded-2xl w-full text-center flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(184,149,42,0.3)] active-scale-premium transition-all duration-300"
              >
                <Mail className="h-4.5 w-4.5" />
                <span>Submit Ticket</span>
              </Link>
            </div>

            {/* Direct Concierge Line */}
            <div className="bg-[#EAF0F8]/40 border border-navy-primary/10 p-6.5 rounded-[28px] flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-navy-primary/10 flex items-center justify-center text-navy-primary shrink-0">
                <PhoneCall className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px] font-extrabold uppercase tracking-widest block">Tele-Concierge Hotline</span>
                <span className="text-navy-dark font-extrabold text-xs block">+91 99099 34786</span>
                <span className="text-navy-primary/80 font-bold text-[11px] block">Mon - Sat: 9:00 AM - 6:00 PM (IST)</span>
              </div>
            </div>

          </div>

        </section>



      </div>
    </div>
  );
};

export default FAQ;
