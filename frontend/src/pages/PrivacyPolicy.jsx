import React from 'react';
import { ShieldCheck, Lock, Eye, Database } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="animate-fadeIn bg-[#F8FAFC] py-16 sm:py-24 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-100 pb-6 space-y-2">
          <span className="text-[#B8952A] text-xxs font-extrabold uppercase tracking-widest block">EyeLeads Legal Desk</span>
          <h1 className="text-3xl font-extrabold text-[#0F2744] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Last Updated: June 2026</p>
        </div>

        {/* Section 1: Security Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-2.5">
            <Lock className="h-6 w-6 text-[#0F2744]" />
            <h4 className="text-xs font-black text-[#0F2744] uppercase tracking-wider">Secure SSL Encryption</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">All transaction packets are secured via industry-standard SSL 256-bit encryption layers.</p>
          </div>
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-2.5">
            <ShieldCheck className="h-6 w-6 text-[#0F2744]" />
            <h4 className="text-xs font-black text-[#0F2744] uppercase tracking-wider">HIPAA Prescription Care</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">Prescription file assets are stored in encrypted Cloudinary buckets, accessible only by verified optometrists.</p>
          </div>
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-2.5">
            <Eye className="h-6 w-6 text-[#0F2744]" />
            <h4 className="text-xs font-black text-[#0F2744] uppercase tracking-wider">Zero Scrap Selling</h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">We hold a strict policy of never selling or renting client address metrics or search history to third-parties.</p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-[#4A4A6A] leading-relaxed font-medium">
          
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>1. Information We Collect</span>
            </h3>
            <p>
              To process your premium eyewear purchases, we collect the necessary personal identity parameters you provide. This includes your name, delivery address coordinates, mobile phone contact, registered account email address, and clinical prescription files (when ordering powered eyeglasses or progressive lenses). Payments are securely routed through Razorpay, meaning your card or bank account credentials never touch our database servers.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>2. How We Utilize Your Data</span>
            </h3>
            <p>
              Your contact details are used exclusively to coordinate express shipping dispatches, send purchase receipts, and communicate delivery timelines. If you choose powered single vision or progressive configurations, your uploaded prescription details are reviewed in-house by licensed optician experts to ensure absolute alignment accuracy before optical assembly.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>3. Data Sharing & Cloud Storage</span>
            </h3>
            <p>
              We limit data transfers strictly to our premium service partners required to fulfill your orders:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li><strong>MongoDB Atlas</strong> — Secure, encrypted database clusters storing client profiles and orders history.</li>
              <li><strong>Razorpay Payment Suite</strong> — Direct gateway verifying instantaneous transactions under rigorous security compliance.</li>
              <li><strong>Cloudinary CDN</strong> — High-security file repository encrypting custom optometrist Rx prescription files.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>4. Prescription File Security</span>
            </h3>
            <p>
              Custom medical optics mandate maximum privacy parameters. All prescription attachments are stored under secure UUID naming tokens on our media network and deleted from system memory once optical alignment and lens cutting are verified. Only accounts registered as `verifiedOptician` have credentials to inspect these files during assembly.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>5. Consumer Rights & Contact Information</span>
            </h3>
            <p>
              You maintain full ownership of your records. You may request access, modification, or complete database purging of your profile parameters at any time. This Website is operated by <strong>Leads Care</strong>. For general inquiries, support, or privacy questions, please contact our support desk:
            </p>
            <div className="mt-3 bg-[#F8FAFC] border border-slate-100 p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Customer Care Desk</p>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=eyeleadscare@gmail.com" target="_blank" rel="noopener noreferrer" className="font-black text-[#0F2744] text-sm hover:text-[#B8952A] transition-colors hover:underline">eyeleadscare@gmail.com</a>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Direct Helpline</p>
                  <p className="font-black text-[#0F2744] text-sm">+91 99099 34786</p>
                </div>
              </div>
              <div className="border-t border-slate-200/60 pt-4 space-y-2">
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Grievance Officer Escalation</p>
                <div className="text-[11px] text-[#4A4A6A] space-y-1 mt-2">
                  <p><strong>Name:</strong> Grievance Redressal Officer</p>
                  <p><strong>Entity:</strong> Leads Care</p>
                  <p><strong>Email:</strong> eyeleadscare@gmail.com</p>
                  <p><strong>Address:</strong> Corporate Compliance Department, Leads Care, Surat, Gujarat, India.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
