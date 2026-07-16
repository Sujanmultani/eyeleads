import React from 'react';
import { FileText, Award, Truck, AlertTriangle, Shield, Scale, HelpCircle } from 'lucide-react';

const TermsOfService = () => {
  return (
    <div className="animate-fadeIn bg-[#F8FAFC] py-16 sm:py-24 select-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-100 pb-6 space-y-2">
          <span className="text-[#B8952A] text-xxs font-extrabold uppercase tracking-widest block">EyeLeads Legal Desk</span>
          <h1 className="text-3xl font-extrabold text-[#0F2744] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Last Updated: July 2026</p>
        </div>

        {/* Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-start gap-4">
            <Award className="h-6 w-6 text-[#0F2744] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-[#0F2744] uppercase tracking-wider">Corporate & Brand Identity</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                Leads Care is the legal entity operating the website. EyeLeads is the descriptive brand name.
              </p>
            </div>
          </div>
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-start gap-4">
            <Truck className="h-6 w-6 text-[#0F2744] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-[#0F2744] uppercase tracking-wider">12-Month Limited Warranty</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                Frames and lenses are covered for 12 months against manufacturing defects under normal use guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-[#4A4A6A] leading-relaxed font-medium">
          
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>1. Corporate Identity & Acceptance of Terms</span>
            </h3>
            <p>
              By accessing, browsing, or purchasing from this Website, you unconditionally agree to comply with and be bound by these Terms of Service. This Website and all associated operations are legally owned and operated exclusively by <strong>Leads Care</strong>. "Leads Care" is the official business and legal brand name under which all invoices, legal liabilities, billing descriptors, and official communications will reflect. "EyeLeads" (or "Eye Leads") is the descriptive brand presentation used by Leads Care.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>2. Eligibility & Account Security</span>
            </h3>
            <p>
              You must be at least the age of majority in your jurisdiction of residence to create a User Account or place an order. If you are ordering on behalf of a minor, you represent that you are their parent or legal guardian and accept full responsibility for providing accurate prescription and measurement data. You are solely responsible for maintaining the confidentiality of your login credentials.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>3. Terms of Sale, Pricing & Cancellation</span>
            </h3>
            <p>
              The display of Products on the Website constitutes an "invitation to treat" and not a legally binding offer. A contract of sale is only formed when Leads Care dispatches the Product and issues a shipment confirmation. All prices listed on the site are in Indian Rupees (INR) and are inclusive of applicable indirect taxes (such as GST or VAT) unless stated otherwise.
            </p>
            <p>
              <strong>Cancellation Policy:</strong> Orders for prescription lenses may be cancelled only if the lens manufacturing process has not yet begun (typically within 12 hours of order placement). Once cutting has commenced, orders cannot be cancelled.
            </p>
          </div>

          <div className="space-y-3 flex items-start gap-4 p-5 bg-amber-50/15 border border-[#B8952A]/20 rounded-2xl">
            <AlertTriangle className="h-5 w-5 text-[#B8952A] shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-[#0F2744] text-xs uppercase tracking-wider">4. Optical Prescription & Pupillary Distance (PD) Policy</h4>
              <p className="text-[11px] leading-relaxed">
                When ordering prescription eyewear, you must provide a valid, accurate, and unexpired prescription from a qualified, registered optometrist or ophthalmologist. Prescriptions are generally considered valid for two (2) years from the date of examination for adults, and one (1) year for minors.
              </p>
              <p className="text-[11px] leading-relaxed">
                An accurate PD measurement is critical for proper optical dispensing. If a PD is not provided on the prescription, Customers must use our guided digital PD measurement tool or obtain the measurement from an eye care professional. Leads Care is not responsible for visual discomfort resulting from inaccurate PD measurements provided by the Customer.
              </p>
              <p className="text-[11px] leading-relaxed">
                <strong>Medical Disclaimer:</strong> Leads Care acts strictly as an optical dispenser. We do not provide medical advice, diagnosis, or treatment. Our digital platforms and support agents cannot replace a comprehensive eye examination by a qualified clinical professional.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>5. Lens Adaptation Period & Remake Eligibility</span>
            </h3>
            <p>
              It is medically normal to experience a period of visual adjustment when wearing a new prescription, transitioning to a new lens design, or changing frame shapes (especially for Progressive, Bifocal, Anti-fatigue, and Office lenses). We mandate a <strong>14 to 21-day continuous wear adaptation period</strong> before concluding that a lens is non-adaptable.
            </p>
            <p>
              If, after the 21-day adaptation period, you continue to experience visual discomfort, you must contact us within 30 days of receiving the Product. If an error is found on our part, we will remake the lenses at no cost. If the prescription provided to us was inaccurate, standard remake fees will apply.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>6. Returns, Refunds & Exchanges</span>
            </h3>
            <p>
              Because prescription eyewear is customized to your specific measurements and medical requirements, custom-made lenses cannot be returned for a simple change of mind. However, non-prescription items (such as sunglasses or standard frames) may be returned within <strong>7 days of delivery</strong> provided they are unworn, in original packaging, and in resalable condition.
            </p>
            <p>
              Approved refunds will be processed to the original method of payment within <strong>7-10 business days</strong> after inspection of the returned item at our warehouse.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>7. Warranty Coverage & Exclusions</span>
            </h3>
            <p>
              Leads Care provides a standard <strong>12-month limited warranty</strong> on frames and lenses against manufacturing defects. This includes peeling of anti-reflective coatings, spontaneous delamination, and frame weld failures under normal use. 
            </p>
            <p>
              The warranty explicitly excludes: scratches on lenses resulting from normal wear and tear, dropping, or improper cleaning; damage caused by physical impact, sitting on the glasses, or bending the frame beyond its structural limits; damage resulting from exposure to extreme heat (e.g., leaving glasses on a car dashboard) or harsh chemicals; and loss or theft of the Product.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>8. Intellectual Property & Copyright</span>
            </h3>
            <p>
              All content on the Website, including text, graphics, logos, images, digital downloads, and software, is the property of Leads Care or its content suppliers and is protected by international copyright laws. The descriptive presentation "EyeLeads" and the legal name "Leads Care" are proprietary to the Company. Unauthorized reproduction, duplication, copying, or selling of any Website content is strictly prohibited.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>9. Promotions, Coupons & Abuse Prevention</span>
            </h3>
            <p>
              From time to time, Leads Care may offer promotional discounts. Only one discount code may be applied per order. Promotional codes have no cash value, are non-transferable, and cannot be applied retroactively to completed orders. Leads Care reserves the right to modify or withdraw promotions at any time without prior notice. Any attempt to manipulate the Website, create multiple fake accounts to exploit new-user discounts, or abuse referral programs will result in immediate account termination and order cancellation.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>10. Limitation of Liability & Indemnity</span>
            </h3>
            <p>
              To the fullest extent permitted by applicable law, Leads Care, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Website or Products. Our total liability for any claim arising out of or relating to an order shall not exceed the total amount paid by the Customer for that specific order. You agree to indemnify, defend, and hold harmless Leads Care from any third-party claims, liabilities, damages, and costs arising from your breach of these policies.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>11. Force Majeure & Governing Law</span>
            </h3>
            <p>
              Leads Care shall not be held responsible for any failure to fulfill our obligations if such failure is caused by events beyond our reasonable control, including but not limited to acts of God, natural disasters, pandemics, strikes, wars, or catastrophic disruptions to logistics and communications infrastructure.
            </p>
            <p>
              These Terms of Service and all transactions with Leads Care shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts located in Surat, Gujarat, India.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-6">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>12. Contact Information & Grievance Redressal</span>
            </h3>
            <p>
              For general inquiries, order updates, or optical advice, please contact our support team:
            </p>
            <div className="mt-3 bg-[#F8FAFC] border border-slate-100 p-5 rounded-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Support Email</p>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=eyeleadscare@gmail.com" target="_blank" rel="noopener noreferrer" className="font-black text-[#0F2744] text-sm hover:text-[#B8952A] transition-colors hover:underline mt-1 block">eyeleadscare@gmail.com</a>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Direct Helpline / WhatsApp</p>
                  <p className="font-black text-[#0F2744] text-sm mt-1">+91 99099 34786</p>
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

export default TermsOfService;
