import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'EyeLeads';
const DEFAULT_DESCRIPTION = 'EyeLeads offers high-quality prescription eyeglasses, stylish sunglasses, blue-light computer glasses, sports frames, and kids eyewear. Shop premium styles today.';
const DEFAULT_IMAGE = '/android-chrome-512x512.png'; // replace with a real branded social-share image (1200x630px) once available

/**
 * Drop this into any page to set that page's title, meta description, and
 * social share preview (Open Graph + Twitter Card). Falls back to sensible
 * site-wide defaults for anything not passed in.
 */
const SEO = ({ title, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, url }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Premium Eyewear Store`;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    document.title = fullTitle;
  }, [fullTitle]);

  return (
    <Helmet>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph (Facebook, WhatsApp, LinkedIn, etc.) */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
