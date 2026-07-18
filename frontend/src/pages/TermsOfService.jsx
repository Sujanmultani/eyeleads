import React from 'react';
import { FileText, Award, Truck, AlertTriangle, Shield, Scale, HelpCircle, Heart, ShieldCheck, Mail, MapPin } from 'lucide-react';
import SEO from '../components/SEO';

const TermsOfService = () => {
  return (
    <div className="animate-fadeIn bg-[#F8FAFC] py-16 sm:py-24 select-none">
      <SEO 
        title="Terms & Conditions" 
        description="Read the official Website Policies, Terms & Conditions of Leads Care (Eye Leads) — covering sales, prescriptions, refunds, warranties, and dispute resolution." 
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-8">
        
        {/* Page Header */}
        <div className="border-b border-slate-100 pb-6 space-y-2">
          <span className="text-[#B8952A] text-xxs font-extrabold uppercase tracking-widest block">Leads Care Legal Desk</span>
          <h1 className="text-3xl font-extrabold text-[#0F2744] tracking-tight" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
            Website Policies, Terms & Conditions
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span>Effective Date: July 17, 2026</span>
            <span className="hidden sm:inline">•</span>
            <span>Brand Presentation: Eye Leads</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            © 2026 Leads Care. All rights reserved.
          </p>
        </div>

        {/* Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-start gap-4">
            <Award className="h-6 w-6 text-[#0F2744] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-[#0F2744] uppercase tracking-wider">Corporate & Brand Identity</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                Leads Care is the official legal entity. Eye Leads is a descriptive brand presentation indicating eye care and optical services.
              </p>
            </div>
          </div>
          <div className="p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-start gap-4">
            <Truck className="h-6 w-6 text-[#0F2744] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-[#0F2744] uppercase tracking-wider">12-Month Limited Warranty</h4>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-1">
                Standard 12-month limited warranty on spectacle frames and lenses against manufacturing defects.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-[#4A4A6A] leading-relaxed font-medium">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>1. Definitions, General Interpretation & Customer Consent</span>
            </h3>
            <div className="space-y-2">
              <h4 className="font-bold text-[#0F2744] text-xs">Definitions:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li><strong>"Company", "We", "Us", "Our"</strong> refers to Leads Care, the official legal entity operating the website.</li>
                <li><strong>"Brand"</strong> refers to "Eye Leads," the descriptive brand presentation used by Leads Care.</li>
                <li><strong>"Website"</strong> refers to the online portal, digital optical clinic, and e-commerce platform operated by Leads Care.</li>
                <li><strong>"Customer", "User", "You", "Your"</strong> refers to any individual, business, or entity that accesses, browses, or makes a purchase through the Website.</li>
                <li><strong>"Product(s)"</strong> refers to optical frames, prescription lenses, contact lenses, sunglasses, eye care accessories, and any other items offered for sale on the Website.</li>
                <li><strong>"Prescription"</strong> refers to a valid, unexpired written order from a qualified, registered optometrist or ophthalmologist detailing the refractive correction required for a Customer.</li>
                <li><strong>"PD" or "Pupillary Distance"</strong> refers to the distance in millimeters between the centers of the pupils in each eye, necessary for accurate lens centering.</li>
                <li><strong>"Dispensing"</strong> refers to the professional process of interpreting a prescription, selecting appropriate frames and lenses, manufacturing, and fitting the final optical appliance.</li>
              </ul>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">General Interpretation:</h4>
              <p>
                Words importing the singular number include the plural and vice versa. Headings are for convenience only and shall not affect the interpretation of these terms. Any reference to a statutory provision includes a reference to that provision as modified, replaced, or re-enacted from time to time.
              </p>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">Customer Consent & Acceptance:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>By accessing this website, placing an order, purchasing any product/service, or using any service provided through this website, the customer confirms that they have read, understood, and agreed to these Terms & Conditions.</li>
                <li>The customer accepts that these Terms & Conditions form a legally binding agreement between the customer and the company.</li>
                <li>The customer confirms that all information provided by them is accurate and complete.</li>
                <li>Continued use of the website, products, or services shall be considered as acceptance of these Terms & Conditions and any updates made to them from time to time.</li>
                <li>If the customer does not agree with these Terms & Conditions, they should not use the website or place an order.</li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>2. Corporate & Legal Policies</span>
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Company Information & Legal Identity:</strong> The Website and all associated digital and physical retail operations are legally owned and operated exclusively by Leads Care. Leads Care operates as a premium digital optical clinic and eyewear e-commerce business, providing high-quality optical products and dispensing services directly to consumers.
              </p>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">Brand Clarification Clause:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>"Leads Care" is the official business and legal brand name. All invoices, legal liabilities, billing descriptors, and official communications will reflect this entity.</li>
                <li>"Eye Leads" is a descriptive brand presentation. The prefix "Eye" is used solely as a descriptive indicator of our eye care and optical services.</li>
                <li>This presentation does not imply ownership of, affiliation with, endorsement by, or association with any third-party trademark, company, domain name, or intellectual property containing the words "Eye" or "Leads".</li>
              </ul>
              <p className="mt-2">
                <strong>Website Governance & Use:</strong> Access to and use of this Website is subject to these terms. By accessing the Website, you agree to be bound by this manual in its entirety. If you do not agree with any part of these policies, you must immediately cease using the Website.
              </p>
              <p>
                <strong>Eligibility:</strong> You must be at least the age of majority in your jurisdiction of residence to create a User Account or place an order. If you are ordering on behalf of a minor, you represent that you are their parent or legal guardian and accept full responsibility for providing accurate prescription and measurement data.
              </p>
              <p>
                <strong>User Accounts:</strong> Customers may be required to register an account to access certain features. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Leads Care reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or exhibit abusive behavior.
              </p>
              <p>
                <strong>Intellectual Property (Copyright & Trademarks):</strong> All content on the Website, including text, graphics, logos, images, digital downloads, and software, is the property of Leads Care or its content suppliers and is protected by international copyright laws. The descriptive presentation "Eye Leads" and the legal name "Leads Care" are proprietary to the Company. Unauthorized reproduction, duplication, copying, or selling of any Website content is strictly prohibited.
              </p>
              <p>
                <strong>Electronic Communication & Third-Party Services:</strong> When you visit the Website, send emails, or communicate via our digital channels, you are communicating with us electronically. You consent to receive communications from us electronically, satisfying any legal requirement that such communications be in writing. The Website may integrate third-party services (e.g., payment gateways, logistics providers). We are not liable for the actions, errors, or omissions of these third-party services.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>3. E-Commerce & Ordering Policies</span>
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Terms of Sale & Ordering Process:</strong> The display of Products on the Website constitutes an "invitation to treat" and not a legally binding offer. An order placed by you represents an offer to purchase. A contract of sale is only formed when Leads Care dispatches the Product and issues a shipment confirmation.
              </p>
              <p>
                <strong>Pricing, Taxes, and Billing:</strong> All prices are listed in the applicable local currency and are subject to change without notice. Prices are inclusive of applicable indirect taxes (such as GST or VAT) unless stated otherwise. If a pricing error occurs, we reserve the right to cancel the order and issue a full refund. Billing is processed securely through authorized payment gateways. You agree to provide current, complete, and accurate purchase and account information for all purchases.
              </p>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">Customer Information Accuracy:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Customers are solely responsible for providing correct and complete information, including Name and contact details, Delivery address, Prescription (Rx) details, Lens specifications, Measurements, and other order-related information.</li>
                <li>The company shall not be responsible for delays, incorrect products, or issues caused due to incorrect or incomplete information provided by the customer.</li>
              </ul>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">Order Modification, Cancellation & Fraud Prevention:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Orders may be modified or cancelled within 24 hours of order placement.</li>
                <li>After 24 hours, or once an order has entered processing, manufacturing customization, or dispatch, modification or cancellation requests may not be accepted.</li>
                <li>Orders for prescription lenses may be cancelled only if the manufacturing process has not yet begun (typically within 12 hours of order placement).</li>
                <li>We employ stringent fraud prevention mechanisms. We reserve the right to hold, verify, or cancel any order flagged by our security systems as potentially fraudulent, and may require further identification before processing.</li>
              </ul>
              <p className="mt-2">
                <strong>Shipping, Delivery, and Risk of Loss:</strong> Estimated delivery times are provided as guidelines and are not legally binding deadlines. Leads Care is not liable for delays caused by logistics partners, customs clearance, or unforeseen circumstances. The risk of loss and title for items purchased pass to you upon our delivery to the carrier.
              </p>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">Refund & Replacement Policy:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Refund or replacement requests shall be considered only for genuine reasons, including but not limited to receiving an incorrect product, manufacturing defects, or other issues approved by the company.</li>
                <li>Customers must provide a complete and uninterrupted unboxing video recorded from the opening of the sealed package until the product and all contents are clearly visible.</li>
                <li>Claims without a valid unboxing video may be considered invalid and may not qualify for refund or replacement.</li>
                <li>Because prescription eyewear is customized to your specific measurements and medical requirements, custom-made lenses cannot be returned for a simple change of mind.</li>
                <li>Non-prescription items (such as sunglasses or standard frames) may be returned within 14 days of delivery provided they are unworn, in original packaging, and in resalable condition.</li>
                <li>Refunds will be processed to the original method of payment within 7-10 business days after inspection of the returned item.</li>
              </ul>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">Return Requirements for Refund/Replacement:</h4>
              <p>For any approved refund or replacement request:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>The customer must return the product along with all accessories, packaging materials, complimentary items, and other items received with the order.</li>
                <li>A valid unboxing video of the received order must be provided.</li>
                <li>All original tags, labels, stickers, and protective markings attached to spectacles, frames, sunglasses, or other products must remain intact.</li>
                <li>Removal, tampering, or damage to original tags/labels may result in rejection of the refund or replacement claim.</li>
                <li>Products returned with missing accessories, removed tags, customer-caused damage, or without required proof may not be accepted.</li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>4. Customer Service Policies</span>
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Customer Support & Communication:</strong> Leads Care is committed to providing exceptional, empathetic, and professional customer support. Our support channels include email, phone, and integrated website chat.
              </p>
              <p>
                <strong>Service Standards & Response Time:</strong> We aim to acknowledge all customer queries within 24 hours of receipt during standard business days. Complex queries requiring clinical verification or manufacturing checks may take up to 48-72 hours for a comprehensive resolution.
              </p>
              <p>
                <strong>Complaint Handling, Escalation, & Grievance Redressal:</strong> If you are dissatisfied with a Product or service, you may raise a formal complaint via our designated support channels. If the initial support agent cannot resolve the issue to your satisfaction within 5 business days, the matter will be automatically escalated to a Senior Support Manager. For unresolved issues, customers may contact the dedicated Grievance Officer (details in Section 15).
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 flex items-start gap-4 p-5 bg-amber-50/15 border border-[#B8952A]/20 rounded-2xl">
            <AlertTriangle className="h-5 w-5 text-[#B8952A] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-extrabold text-[#0F2744] text-xs uppercase tracking-wider">5. Prescription & Clinical Policies</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 text-[11px] leading-relaxed">
                <li>Customers are solely responsible for providing accurate prescription (Rx) details, lens requirements, measurements, pupillary distance (PD), and any other information required for manufacturing or dispensing spectacles.</li>
                <li>The company shall not be responsible for any issue arising due to incorrect, incomplete, or inaccurate information provided by the customer.</li>
                <li>If any prescription error occurs due to incorrect information provided by the customer, all replacement, remake, lens change, and related charges shall be borne by the customer.</li>
              </ul>
              <p className="text-[11px] leading-relaxed">
                <strong>Prescription Requirements & Verification:</strong> Customers purchasing prescription lenses must provide a valid, accurate, and unexpired prescription. Leads Care reserves the right to contact your prescribing eye care professional to verify the prescription details if they appear anomalous or incomplete.
              </p>
              <p className="text-[11px] leading-relaxed">
                <strong>Prescription Validity:</strong> Prescriptions are generally considered valid for two (2) years from the date of examination for adults, and one (1) year for minors or individuals with specific ocular conditions, unless otherwise specified by the prescriber. We will not fulfill orders using expired prescriptions.
              </p>
              <p className="text-[11px] leading-relaxed">
                <strong>Pupillary Distance (PD) Policy:</strong> An accurate PD measurement is critical for proper optical dispensing. If a PD is not provided on the prescription, Customers must use our guided digital PD measurement tool or obtain the measurement from an eye care professional. Leads Care is not responsible for visual discomfort resulting from inaccurate PD measurements provided by the Customer.
              </p>
              <p className="text-[11px] leading-relaxed">
                <strong>Medical Disclaimer & Clinical Limitations:</strong> Leads Care acts strictly as an optical dispenser. We do not provide medical advice, diagnosis, or treatment. Our digital platforms and customer service agents cannot replace a comprehensive eye examination by a qualified clinical professional. Regular eye health examinations are strongly recommended to detect ocular diseases and monitor vision changes.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>6. Optical Dispensing Policies</span>
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Standards and Accuracy:</strong> All eyewear dispensed by Leads Care adheres to stringent international optical standards (such as ISO or ANSI tolerances for ophthalmic lenses). The dispensing process includes the precise calculation of base curves, lens decentration, and thickness optimization based on your selected frame and prescription.
              </p>
              <p>
                <strong>Verification and Quality Check:</strong> Before dispatch, every pair of prescription eyewear undergoes a rigorous multi-point verification process by trained technicians. We utilize digital lensmeters to ensure that the sphere, cylinder, axis, and optical center (PD) exactly match the provided prescription within acceptable legal and clinical tolerances.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>7. Lens Adaptation Policies</span>
            </h3>
            <div className="space-y-2">
              <p>
                <strong>The Adaptation Period:</strong> It is medically normal to experience a period of visual adjustment when wearing a new prescription, transitioning to a new lens design, or changing frame shapes. This is especially true for Progressive, Multifocal, Anti-fatigue, and Office lenses. We mandate a 14 to 21-day continuous wear adaptation period before concluding that a lens is non-adaptable.
              </p>
              <p>
                <strong>Non-Adaptation & Remake Eligibility:</strong> If, after the 21-day adaptation period, you continue to experience visual discomfort, distortion, or dizziness, you must contact us within 30 days of receiving the Product. Our optical team will conduct a clinical assessment of your order data. If an error is found on our part, we will remake the lenses at no cost. If the prescription provided to us was inaccurate, remake fees will apply.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>8. Manufacturing & Quality Policies</span>
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Manufacturing Standards:</strong> Lenses are surfaced, coated, and edged using state-of-the-art digital optical machinery. Our frames undergo structural integrity tests and hinge durability checks before being approved for patient use.
              </p>
              <p>
                <strong>Cosmetic Standards and Tolerances:</strong> Lenses and frames are inspected under standard lighting conditions. Micro-imperfections that are invisible to the naked eye at a standard conversational distance (approximately 40 cm) and do not interfere with the optical zone are not considered manufacturing defects. Tolerances for prescription accuracy strictly follow recognized ophthalmic guidelines.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>9. Warranty & After-Sales Service Policies</span>
            </h3>
            <div className="space-y-2">
              <h4 className="font-bold text-[#0F2744] text-xs">Warranty Policy Coverage:</h4>
              <p>Warranty on spectacle frames, spectacle lenses, and contact lenses shall be applicable only in cases of:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Manufacturing defects confirmed by the respective manufacturer; or</li>
                <li>Defects identified at the time of dispensing/delivery.</li>
                <li>Leads Care provides a standard 12-month limited warranty on frames and lenses against manufacturing defects. This includes peeling of anti-reflective coatings, spontaneous delamination, and frame weld failures under normal use.</li>
              </ul>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">Warranty Exclusions:</h4>
              <p>Warranty does not cover:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Accidental damage;</li>
                <li>Physical damage after delivery;</li>
                <li>Scratches, breakage, misuse, improper handling, or normal wear and tear;</li>
                <li>Damage caused due to negligence or external factors after delivery.</li>
                <li>Any external damage occurring after successful delivery shall be the sole responsibility of the customer.</li>
                <li>Damage caused by physical impact, sitting on the glasses, or bending the frame beyond its structural limits.</li>
                <li>Damage resulting from exposure to extreme heat (e.g., leaving glasses on a car dashboard) or harsh chemicals.</li>
                <li>Loss or theft of the Product.</li>
              </ul>
              <p className="mt-2">
                <strong>Service Requests and Spare Parts:</strong> Out-of-warranty repairs, such as replacing nose pads or temple screws, may be offered complimentary or at a nominal service charge, depending on component availability and shipping costs.
              </p>
            </div>
          </div>

          {/* Section 10 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>10. Product Care & Maintenance Policies</span>
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Product Handling Responsibility:</strong> Once the product has been delivered in proper condition, any damage caused due to handling, usage, accidents, or negligence by the customer shall be the customer's responsibility. The company shall not be liable for damages occurring after delivery except where covered under the applicable warranty policy.
              </p>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">Care Instructions:</h4>
              <p>To ensure the longevity of your eyewear, Customers must adhere to the following maintenance guidelines:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li><strong>Cleaning:</strong> Use only the provided microfiber cloth and a dedicated optical lens cleaner or mild, lotion-free dish soap with lukewarm water. Never use paper towels, clothing, or tissues, as their abrasive fibers will permanently scratch lens coatings.</li>
                <li><strong>Handling:</strong> Always put on and remove your eyewear using both hands to prevent frame misalignment or hinge damage.</li>
                <li><strong>Storage:</strong> When not in use, always store your eyewear in the protective hard case provided by Leads Care.</li>
              </ul>
            </div>
          </div>

          {/* Section 11 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>11. Product Information & Transparency Policies</span>
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Descriptions, Specifications, and Images:</strong> We strive to display Product colors, textures, and measurements as accurately as possible. However, due to varying monitor calibrations, lighting conditions during photography, and manufacturing batch variations, the actual Product color may differ slightly from your screen. All dimensions (e.g., lens width, bridge width, temple length) are approximate and provided to assist with fitment.
              </p>
              <p>
                <strong>Availability and Limitations:</strong> All Products are subject to availability. In the rare event that a purchased frame is out of stock or fails our final quality inspection, we will notify you immediately and offer an alternative of equal value or a full refund.
              </p>
            </div>
          </div>

          {/* Section 12 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>12. Promotions, Offers & Loyalty Policies</span>
            </h3>
            <div className="space-y-2">
              <h4 className="font-bold text-[#0F2744] text-xs">Offers, Coupons & Discounts:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>Only one offer, discount, coupon code, or promotional benefit can be applied to a single order unless specifically mentioned otherwise.</li>
                <li>Coupon codes, promotional offers, sale discounts, and other benefits are separate entities and cannot be combined or used simultaneously.</li>
                <li>Multiple offers cannot be held or applied together on the same purchase.</li>
                <li>Promotional codes have no cash value, are non-transferable, and cannot be applied retroactively to completed orders.</li>
                <li>Leads Care reserves the right to modify or withdraw promotions at any time without prior notice.</li>
              </ul>
              <p className="mt-2">
                <strong>Abuse Prevention:</strong> Any attempt to manipulate the Website, create multiple fake accounts to exploit new-user discounts, or abuse referral programs will result in immediate account termination and order cancellation.
              </p>
            </div>
          </div>

          {/* Section 13 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>13. Legal Liability, Compliance & Dispute Resolution Policies</span>
            </h3>
            <div className="space-y-2">
              <p>
                <strong>Limitation of Liability:</strong> To the fullest extent permitted by applicable law, Leads Care, its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Website or Products. Our total liability for any claim arising out of or relating to an order shall not exceed the total amount paid by the Customer for that specific order.
              </p>
              <p>
                <strong>Indemnity:</strong> You agree to indemnify, defend, and hold harmless Leads Care from any third-party claims, liabilities, damages, and costs (including reasonable legal fees) arising from your breach of these policies or your infringement of any intellectual property or other right of any person.
              </p>
              <p>
                <strong>Force Majeure:</strong> Leads Care shall not be held responsible for any failure to fulfill our obligations if such failure is caused by events beyond our reasonable control, including but not limited to acts of God, natural disasters, pandemics, strikes, wars, or catastrophic disruptions to logistics and communications infrastructure.
              </p>
              <h4 className="font-bold text-[#0F2744] text-xs mt-3">Governing Law & Jurisdiction:</h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>These Terms & Conditions shall be governed and interpreted according to the laws of India.</li>
                <li>Any dispute, claim, legal action, or proceeding arising out of or relating to the use of this website, purchase of products/services, or these Terms & Conditions shall be filed and resolved exclusively before the competent courts at Mandvi (394160), Surat, Gujarat, India.</li>
                <li>The customer agrees that the courts at Mandvi (394160), Surat, Gujarat shall have exclusive jurisdiction for all such matters.</li>
                <li>This jurisdiction clause is agreed upon for convenience, efficient dispute resolution, and because the company's business operations and contractual activities are connected with this jurisdiction.</li>
              </ul>
              <p className="mt-2">
                <strong>Entire Agreement & Severability:</strong> These terms constitute the entire agreement between you and Leads Care regarding your use of the Website and purchase of Products. If any provision is deemed unlawful, void, or unenforceable, that specific provision shall be deemed severable and shall not affect the validity and enforceability of the remaining provisions.
              </p>
            </div>
          </div>

          {/* Section 14 */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>14. General Terms</span>
            </h3>
            <div className="space-y-2">
              <ul className="list-disc pl-5 space-y-1 text-slate-500">
                <li>The company reserves the right to evaluate, approve, reject, or modify any refund, replacement, warranty, or cancellation request based on the circumstances and applicable policies.</li>
                <li>These Terms & Conditions apply to all customers purchasing products or using services through this website.</li>
                <li>By completing an order, the customer acknowledges and agrees to comply with all terms mentioned above.</li>
              </ul>
            </div>
          </div>

          {/* Section 15 */}
          <div className="space-y-3 border-t border-slate-100 pt-6">
            <h3 className="font-extrabold text-[#0F2744] text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B8952A]"></span>
              <span>15. Contact Information & Grievance Officer</span>
            </h3>
            <p>
              For general inquiries, order updates, or optical advice, please contact our support team:
            </p>
            <div className="mt-3 bg-[#F8FAFC] border border-slate-100 p-5 rounded-2xl space-y-4 font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Support Email</p>
                  <a href="mailto:support@leadscare.com" className="font-black text-[#0F2744] text-sm hover:text-[#B8952A] transition-colors hover:underline mt-1 block">support@leadscare.com</a>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Business Hours</p>
                  <p className="font-black text-[#0F2744] text-sm mt-1">Monday to Saturday, 9:00 AM – 6:00 PM (IST)</p>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4 space-y-2">
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest leading-none">Grievance Officer Escalation</p>
                <div className="text-xs text-[#4A4A6A] space-y-1 mt-2">
                  <p><strong>Name:</strong> Grievance Redressal Officer</p>
                  <p><strong>Entity:</strong> Leads Care</p>
                  <p><strong>Email:</strong> <a href="mailto:grievance@leadscare.com" className="hover:text-[#B8952A] hover:underline">grievance@leadscare.com</a></p>
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
