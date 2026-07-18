import React from 'react';
import { Eye, ShieldCheck, Heart } from 'lucide-react';
import SEO from '../components/SEO';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn space-y-16">
      <SEO title="About Us" description="Learn about LEADS CARE — our story, our commitment to quality eyewear, and how we make expert vision care accessible across India." />
      {/* Brand Hero Story */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <span className="text-gold-accent font-bold text-xs uppercase tracking-widest bg-tint px-3.5 py-1 rounded-full">
          Our Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight leading-tight">
          LEADS CARE — Redefining Vision Care in India
        </h1>
        <div className="text-base text-text-muted leading-relaxed space-y-4 max-w-3xl mx-auto text-left sm:text-center">
          <p>
            <strong>LEADS CARE</strong>, founded in 2026 with a simple yet ambitious vision: to redefine how India experiences eyewear by making premium, expertly curated vision care accessible to everyone.
          </p>
          <p>
            We believe that better vision begins with the right guidance—not just the right frame. By combining carefully selected premium eyewear, precision optics, and access to qualified in-house opticians and optometrists through a seamless digital platform, we aim to empower people to make informed decisions about their eye health from anywhere in India.
          </p>
          <p>
            Our vision is to bridge the gap between quality eyewear and professional eye care through technology, education, and personalized support. We strive to raise awareness about the importance of clear vision, simplify the eyewear-buying journey, and deliver an effortless experience—from consultation to product delivery.
          </p>
          <p>
            At LEADS CARE, we envision a future where every individual, regardless of location, has access to trusted vision expertise, world-class eyewear, and a seamless digital experience that helps them see better, live better, and experience life with greater clarity.
          </p>
        </div>
      </section>

      {/* Brand Core Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl border border-slate-100 text-center space-y-4 hover:shadow-lg transition-shadow">
          <div className="bg-tint p-4 rounded-full text-navy-primary inline-flex">
            <Eye className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-dark">Ultimate Clarity</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            We source highest-grade optical polymer and polycarbonate lenses with absolute UV blocking, blue-light coating, and anti-glare layers.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-100 text-center space-y-4 hover:shadow-lg transition-shadow">
          <div className="bg-tint p-4 rounded-full text-navy-primary inline-flex">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-dark">Durable Frames</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Engineered using lightweight aerospace titanium, flexible Mazzucchelli acetate, and impact-resistant materials built to last a lifetime.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl border border-slate-100 text-center space-y-4 hover:shadow-lg transition-shadow">
          <div className="bg-tint p-4 rounded-full text-navy-primary inline-flex">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-navy-dark">Customer Centric</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            From 24/7 optician consultation support, standard 7-day returns (on non-prescription items), and comprehensive 12-month product warranty.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
