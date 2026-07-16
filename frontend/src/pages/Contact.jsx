import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  Check, 
  Upload, 
  Calendar, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Navigation, 
  Car, 
  AlertCircle, 
  Compass, 
  Heart, 
  Share2, 
  ArrowRight,
  TrendingUp,
  FileText,
  Globe,
  HelpCircle,
  Loader
} from 'lucide-react';
import api from '../utils/api';
import { toast } from '../components/Toast';

const Contact = () => {
  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'rx-verification', message: '' });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  // Interactive booking state
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');

  // FAQ Accordion states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);

  const getSupportStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0=Sun, 6=Sat
    const isBusinessHours = hour >= 9 && hour < 18;
    const isWeekday = day >= 1 && day <= 5;
    return isBusinessHours && isWeekday;
  };

  const isOnline = getSupportStatus();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('prescription', file);
    try {
      const res = await api.post('/api/upload/prescription', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
      setUploadedFileUrl(res.data.secure_url);
      toast.success('Prescription uploaded successfully!');
    } catch (err) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/api/contact', {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        prescriptionFile: uploadedFileUrl || null
      });
      setFormSubmitted(true);
      toast.success('Your message has been sent successfully!');
      setFormData({ name: '', email: '', subject: 'rx-verification', message: '' });
      setUploadedFile(null);
      setUploadedFileUrl(null);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send your message. Please try again or email us directly at eyeleadscare@gmail.com';
      setFormError(errMsg);
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime || !bookingName || !bookingEmail || !bookingPhone) {
      toast.error('Please fill in all appointment fields.');
      return;
    }
    
    const selectedDateTime = new Date(`${bookingDate}T${bookingTime}`);
    if (selectedDateTime < new Date()) {
      setBookingError('Please select a future date and time.');
      toast.error('Please select a future date and time.');
      return;
    }
    
    setBookingLoading(true);
    setBookingError('');
    try {
      await api.post('/api/appointments', {
        date: bookingDate,
        time: bookingTime,
        name: bookingName,
        email: bookingEmail,
        phone: bookingPhone
      });
      setBookingSubmitted(true);
      toast.success('Appointment requested successfully!');
      setBookingName('');
      setBookingEmail('');
      setBookingPhone('');
      setBookingDate('');
      setBookingTime('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Could not book appointment. Please message us on WhatsApp at +91 99099 34786.';
      setBookingError(errMsg);
      toast.error(errMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  // Support categories
  const categories = [
    { id: 'rx-verification', title: 'Prescription Verification', description: 'Expert optometrist review of your focal metrics.' },
    { id: 'fitting', title: 'Hinge & Fit Adjustments', description: 'Accurate alignment and structural face fitting.' },
    { id: 'shipping', title: 'Corporate Gifting & Orders', description: 'Corporate custom engravings or batch tracking.' }
  ];

  // FAQ Mock Dataset
  const faqs = [
    {
      q: 'Can I upload my existing optical prescription card?',
      a: 'Absolutely. You can upload any valid prescription card using the uploader in our contact form or during checkout. Our certified in-house optometrists check and verify every single prescription before custom diamond-cut lens fitting.'
    },
    {
      q: 'What structural warranty covers the premium frames?',
      a: 'Leads Care provides a standard 12-month limited warranty on frames and lenses against manufacturing defects (such as anti-reflective coating peeling, spontaneous delamination, and frame weld failures). The warranty explicitly excludes scratches from normal wear/tear, physical damage, extreme heat, or loss.'
    },
    {
      q: 'Do you offer progressive or blue-light filter lenses?',
      a: 'Yes. We offer single-vision, progressive (multifocal), digital screen blue-cut, and transition lenses engineered from high-index, scratch-proof polymers with absolute anti-reflective coats.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] animate-fadeIn pb-20 select-none">
      <SEO title="Contact Us" description="Get in touch with EyeLeads for order support, prescription questions, or general inquiries. We're here to help." />
      
      {/* 1. HERO SECTION WITH IMAGE OVERLAY */}
      <section className="relative h-[380px] sm:h-[420px] flex items-center justify-center text-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1600&auto=format&fit=crop&q=80" 
            alt="EyeLeads Premium eyewear backdrop" 
            className="w-full h-full object-cover opacity-35 grayscale-[0.1]"
          />
          {/* Dark luxury gradient mesh overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#F5F7FA] via-slate-900/60 to-slate-950/90"></div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex flex-wrap justify-center items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-sm
              ${isOnline
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-slate-500/10 border border-slate-500/30 text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`}></span>
              {isOnline ? 'Support Active: Online Now' : 'Support: Offline — Opens 9AM'}
            </span>
            <span className="bg-white/5 border border-white/10 text-slate-300 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest backdrop-blur-sm">
              Response Time: &lt; 15 Mins
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Visionary Support, <br />
            <span className="font-serif italic font-light text-[#B8952A]">Tailored for You.</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto">
            Have questions about lens measurements, progressive upgrades, or custom face fitting? Connect with our dedicated opticians and style curators.
          </p>
        </div>
      </section>

      {/* Main Grid Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-20 space-y-16">
        
        {/* 2. DOCKABLE CONTACT CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* Card 1: Email Opticians */}
          <div className="glassmorphism hover-lift p-8 rounded-[24px] border border-white/50 shadow-luxury flex flex-col justify-between h-full bg-white/70">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#1B3F6E]/10 flex items-center justify-center text-[#1B3F6E] shadow-sm border border-white/40">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-navy-dark text-sm uppercase tracking-wider">Email Concierge</h4>
                <p className="text-xxs text-slate-400 font-extrabold uppercase tracking-widest mt-1">Guaranteed &lt; 12 Hour response</p>
                <p className="text-xs text-[#4A4A6A] leading-relaxed mt-2">
                  Send details of your doctor prescriptions or request details regarding custom frame sizes.
                </p>
              </div>
            </div>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=eyeleadscare@gmail.com" target="_blank" rel="noopener noreferrer" className="text-[#1B3F6E] hover:text-[#B8952A] font-black text-sm hover:underline mt-6 block w-fit">
              eyeleadscare@gmail.com
            </a>
          </div>

          {/* Card 2: Live Chat card */}
          <div className="glassmorphism hover-lift p-8 rounded-[24px] border border-white/50 shadow-luxury flex flex-col justify-between h-full bg-white/70">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-[#B8952A]/15 flex items-center justify-center text-[#B8952A] shadow-sm border border-white/40">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-navy-dark text-sm uppercase tracking-wider">Optics Live Chat</h4>
                <p className="text-xxs text-[#B8952A] font-extrabold uppercase tracking-widest mt-1">Interactive Styling Assistant</p>
                <p className="text-xs text-[#4A4A6A] leading-relaxed mt-2">
                  Connect instantly to clear questions about materials, titanium coatings, or shipping times.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/919909934786?text=Hi%20EyeLeads%2C%20I%20have%20a%20question%20about%20your%20premium%20eyewear"
              target="_blank"
              rel="noreferrer"
              className="text-[#1B3F6E] hover:text-[#B8952A] font-black text-sm mt-6 block hover:underline text-left cursor-pointer active-scale-premium"
            >
              Launch Live Chat →
            </a>
          </div>

        </section>

        {/* 3. DOUBLE COLUMN CONTACT FORM & INSTANT WHATSAPP CARD */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Form (Takes 7 columns on desktop) */}
          <div className="lg:col-span-8 bg-white p-8 sm:p-10 rounded-[32px] border border-slate-100 shadow-luxury relative overflow-hidden select-none">
            
            {formSubmitted ? (
              <div className="py-20 text-center space-y-4 animate-fadeIn">
                <div className="h-14 w-14 rounded-full bg-green-50 border border-green-150 flex items-center justify-center text-green-600 mx-auto shadow-sm">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
                <h3 className="text-xl font-extrabold text-navy-dark">Message Dispatched</h3>
                <p className="text-xs text-[#4A4A6A] max-w-sm mx-auto leading-relaxed font-semibold">
                  Thank you! Your optical inquiry has been logged successfully. A certified eye stylist has been assigned and will connect shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 pb-5 mb-8">
                  <h3 className="font-extrabold text-navy-dark text-lg uppercase tracking-widest">
                    Submit Stylist Inquiry
                  </h3>
                  <p className="text-slate-400 text-xxs mt-1 uppercase font-bold tracking-widest">optometrist & style advice desk</p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl px-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                      />
                    </div>
                    
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Your email address"
                        className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl px-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setFormData(prev => ({ ...prev, subject: cat.id }))}
                        className={`p-3 text-left border rounded-2xl transition-all cursor-pointer flex flex-col justify-between h-20 select-none ${
                          formData.subject === cat.id
                            ? 'border-[#1B3F6E] bg-[#1B3F6E]/5 text-[#1B3F6E] ring-1 ring-[#1B3F6E] shadow-sm'
                            : 'border-slate-200/80 hover:border-slate-300 bg-white text-[#4A4A6A]'
                        }`}
                      >
                        <span className="text-[11px] font-black leading-tight uppercase tracking-wider block">{cat.title}</span>
                        <span className="text-[11px] text-slate-400 font-semibold leading-normal block mt-1 line-clamp-2">{cat.description}</span>
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Specify framing dimensions, focal requirements, or structural details..."
                      className="w-full border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl px-4 py-3.5 text-xs bg-[#F8FAFC] focus:bg-white text-[#1A1A2E] placeholder-slate-400 font-bold leading-relaxed"
                    ></textarea>
                  </div>

                  {/* Drag and Drop prescription uploader */}
                  <div className="border-2 border-dashed border-slate-200 rounded-[20px] p-5 bg-[#F8FAFC] space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#B8952A] shadow-sm shrink-0">
                        {uploading ? (
                          <Loader className="h-4.5 w-4.5 animate-spin" />
                        ) : (
                          <Upload className="h-4.5 w-4.5" />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold text-[#1B3F6E] uppercase tracking-wider block leading-none">Focal Prescription Uploader</span>
                        <span className="text-[11px] text-slate-400 font-semibold block mt-1 leading-none">Securely attach prescription PDF or photos</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <label className={`w-full flex items-center justify-center gap-3 px-4 py-4 bg-white rounded-xl border border-slate-200 hover:border-[#B8952A]/50 transition-all cursor-pointer group shadow-sm text-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <FileText className="h-4.5 w-4.5 text-slate-400 group-hover:text-[#B8952A] transition-colors shrink-0" />
                        <span className="text-xxs font-extrabold uppercase tracking-widest text-[#1B3F6E]">
                          {uploading ? 'Uploading Prescription...' : 'Attach Doctor Rx Prescription (Optional)'}
                        </span>
                        <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg" disabled={uploading} />
                      </label>

                      {uploadedFile && (
                        <div className="bg-[#B8952A]/10 border border-[#B8952A]/30 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xxs font-bold text-[#B8952A] animate-fadeIn select-none">
                          <div className="flex items-center gap-2 min-w-0">
                            <Check className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{uploadedFile.name}</span>
                          </div>
                          <span className="text-[11px] shrink-0 text-slate-400 font-extrabold">({uploadedFile.size})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-600 text-xxs font-bold flex items-center gap-2 animate-fadeIn">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    className={`bg-[#1B3F6E] hover:bg-amber-600 hover:shadow-lg text-white font-extrabold text-xs uppercase tracking-widest px-8 py-4.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md active-scale-premium ${(submitting || uploading) ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {submitting ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span>Sending Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Stylist Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Right: Instant WhatsApp support card (Takes 4 columns on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-luxury space-y-6 select-none relative overflow-hidden">
              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
              
              <div className="space-y-2">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                  <MessageCircle className="h-5.5 w-5.5 fill-current" />
                </div>
                <h4 className="font-extrabold text-navy-dark text-base uppercase tracking-wider pt-2">Direct WhatsApp Stylist</h4>
                <p className="text-slate-400 text-xxs uppercase tracking-widest font-extrabold block">Instant optic chat desk</p>
              </div>

              <p className="text-xs text-[#4A4A6A] leading-relaxed font-semibold">
                Chat directly with our luxury eyewear consultants on WhatsApp. Send photos of your face shape, ask sizing queries, or check shipping status.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xxs font-bold text-[#4A4A6A] space-y-2 select-none">
                <div className="flex justify-between">
                  <span>Stylists Online</span>
                  <span className="text-emerald-600 font-extrabold uppercase">3 Consultants</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span>Est. Response</span>
                  <span className="text-emerald-600 font-extrabold uppercase">&lt; 5 minutes</span>
                </div>
              </div>

              <a
                href="https://wa.me/919909934786?text=Hello%20EyeLeads%20Team%20%F0%9F%91%8B%2C%20I%20visited%20your%20website%20and%20would%20like%20assistance"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xxs uppercase tracking-widest py-4.5 rounded-xl w-full text-center flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active-scale-premium"
              >
                <MessageCircle className="h-4.5 w-4.5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Inbound Contact Resolution Timeline */}
            <div className="bg-[#1B3F6E] p-8 rounded-[32px] shadow-luxury text-white space-y-6 select-none relative overflow-hidden">
              <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#B8952A]/5 rounded-full blur-[80px] -z-10"></div>
              
              <div className="space-y-1">
                <span className="text-[#B8952A] text-[11px] font-extrabold uppercase tracking-widest block leading-none">Timeline</span>
                <h4 className="font-extrabold text-base uppercase tracking-wider mt-1.5">Inquiry Resolution Flow</h4>
              </div>

              <div className="space-y-6 relative border-l border-white/10 pl-6 select-none ml-2">
                
                {/* Step 1 */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 h-4 w-4 rounded-full bg-[#B8952A] border border-[#1B3F6E] flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-white block" />
                  </span>
                  <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-[#B8952A]">01. Inquiry Logged</h5>
                  <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-1">Ticket dispatched to optical desk immediately with notification.</p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 h-4 w-4 rounded-full bg-white/20 border border-[#1B3F6E] flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#B8952A] block animate-pulse" />
                  </span>
                  <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-white">02. Stylist Assignment</h5>
                  <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-1">Optician review and lens compatibility check completed in &lt; 10 minutes.</p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-0 h-4 w-4 rounded-full bg-white/20 border border-[#1B3F6E] flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20 block" />
                  </span>
                  <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-white">03. Expert Advice</h5>
                  <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-1">Stylist matches frames, resolves measurements, and sends custom booking routes.</p>
                </div>

              </div>
            </div>
          </div>

        </section>

        {/* 4. FAQ RESOLUTION ROUTE */}
        <section className="bg-white p-8 rounded-[32px] border border-slate-100 text-center space-y-4 shadow-luxury select-none max-w-4xl mx-auto">
          <HelpCircle className="h-10 w-10 text-[#1B3F6E] mx-auto animate-pulse" />
          <h2 className="text-2xl font-extrabold text-[#1B3F6E]" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>Got Questions?</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Browse our comprehensive, search-verified FAQ database for instant answers regarding shipments, custom lens options, and optician verification.</p>
          <Link to="/faq" className="bg-[#1B3F6E] hover:bg-[#B8952A] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest inline-block transition-colors duration-300 active-scale-premium shadow-md hover:shadow-lg">
            View All FAQs →
          </Link>
        </section>

        {/* 5. INTERACTIVE MAP SECTION & BOOKING FORM */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch select-none">
          
          {/* Left: Online Only store info card (Takes 7 columns on desktop) */}
          <div className="lg:col-span-7 bg-[#0F2744] rounded-[32px] border border-slate-800 shadow-luxury flex flex-col justify-between p-8 text-center text-white relative overflow-hidden select-none">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#B8952A]/10 rounded-full blur-[90px] -z-10 animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#1B3F6E]/20 rounded-full blur-[90px] -z-10 animate-pulse"></div>
            
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <Globe className="h-12 w-12 text-[#B8952A] mb-4" />
              <h4 className="font-extrabold text-xl tracking-wide uppercase" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>100% Digital-First Store</h4>
              <p className="text-slate-300 text-xs mt-3 max-w-md mx-auto leading-relaxed font-semibold">
                EyeLeads is engineered as a direct-to-consumer digital boutique. By removing physical showroom overhead, we pass 100% of the savings directly to you, offering premium aerospace titanium and Italian acetate frames at unparalleled prices. We deliver free express across India with an unconditional structural warranty.
              </p>
            </div>
          </div>

          {/* Right: appointment booker (Takes 5 columns) */}
          <div className="lg:col-span-5 bg-white p-8 rounded-[32px] border border-slate-100 shadow-luxury flex flex-col justify-between select-none">
            
            {bookingSubmitted ? (
              <div className="py-24 text-center space-y-4 animate-fadeIn">
                <div className="h-12 w-12 rounded-full bg-green-50 border border-green-150 flex items-center justify-center text-green-600 mx-auto shadow-sm">
                  <Check className="h-5 w-5 stroke-[3]" />
                </div>
                <h4 className="text-sm font-extrabold text-navy-dark uppercase tracking-wider">Styling Session Confirmed</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed font-semibold">
                  A personalized booking confirmation has been dispatched. An eye care specialist will call you at your selected date and time for your private digital consultation.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="border-b border-slate-50 pb-4">
                    <h3 className="font-extrabold text-navy-dark text-sm uppercase tracking-widest">
                      Boutique Styling Session
                    </h3>
                    <span className="text-[11px] text-[#B8952A] font-extrabold uppercase tracking-widest block mt-1">Virtual Private Styling Session</span>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={bookingName}
                        onChange={(e) => setBookingName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full border border-slate-200 focus:border-[#B8952A] rounded-xl px-3 py-2 text-xxs font-bold bg-[#F8FAFC]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          placeholder="Your email"
                          className="w-full border border-slate-200 focus:border-[#B8952A] rounded-xl px-3 py-2 text-xxs font-bold bg-[#F8FAFC]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={bookingPhone}
                          onChange={(e) => setBookingPhone(e.target.value)}
                          placeholder="Mobile number"
                          className="w-full border border-slate-200 focus:border-[#B8952A] rounded-xl px-3 py-2 text-xxs font-bold bg-[#F8FAFC]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Select Date</label>
                        <input
                          type="date"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full border border-slate-200 focus:border-[#B8952A] rounded-xl px-3 py-2 text-xxs font-bold bg-[#F8FAFC]"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">Select Time</label>
                        <input
                          type="time"
                          required
                          min="10:00"
                          max="20:00"
                          step="1800"
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full border border-slate-200 focus:border-[#B8952A] rounded-xl px-3 py-2 text-xxs font-bold bg-[#F8FAFC]"
                        />
                      </div>
                    </div>

                    {bookingError && (
                      <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{bookingError}</span>
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className={`bg-[#B8952A] hover:bg-amber-600 text-white font-extrabold text-xxs uppercase tracking-widest py-3.5 rounded-xl w-full flex items-center justify-center gap-2 cursor-pointer shadow active-scale-premium ${bookingLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {bookingLoading ? (
                        <>
                          <Loader className="h-3.5 w-3.5 animate-spin" />
                          <span>Requesting Session...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Book Private Session</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 text-xxs font-bold text-[#4A4A6A] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 uppercase tracking-widest">Consultation Hours</span>
                    <span className="text-navy-dark font-extrabold uppercase">10 AM - 8 PM IST</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-2">
                    <span className="text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-[#B8952A] shrink-0" />
                      <span>Avg Call Duration</span>
                    </span>
                    <span className="text-green-600 font-extrabold uppercase">15 Minutes</span>
                  </div>
                </div>
              </>
            )}
          </div>

        </section>

      </div>



    </div>
  );
};

export default Contact;
