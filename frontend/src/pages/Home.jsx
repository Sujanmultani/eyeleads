import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Truck,
  Shield,
  Upload,
  RotateCcw,
  Box,
  CheckCircle,
  Heart,
  Star,
  Compass,
  ArrowRight,
  Camera,
  Sparkles,
  Play,
  X,
  Volume2,
  VolumeX,
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { toast } from '../components/Toast';
import anime from 'animejs';
import Reveal from '../components/motion/Reveal';
import StaggerGrid from '../components/motion/StaggerGrid';
import prescriptionGlassesImg from '../assets/prescription_glasses.png';
import premiumSunglassesImg from '../assets/premium_sunglasses.png';
import computerGlassesImg from '../assets/computer_glasses.png';
import sportsSunglassesImg from '../assets/sports_sunglasses.png';
import kidsEyewearImg from '../assets/kids_eyewear.png';

import prescriptionGlassesImgWebp from '../assets/prescription_glasses.webp';
import premiumSunglassesImgWebp from '../assets/premium_sunglasses.webp';
import computerGlassesImgWebp from '../assets/computer_glasses.webp';
import sportsSunglassesImgWebp from '../assets/sports_sunglasses.webp';
import kidsEyewearImgWebp from '../assets/kids_eyewear.webp';

const Home = () => {
  const [bestsellerProducts, setBestsellerProducts] = React.useState([]);
  const [loadingBestsellers, setLoadingBestsellers] = React.useState(true);
  const [storeSettings, setStoreSettings] = React.useState(null);
  const [allProducts, setAllProducts] = React.useState([]);
  const [videoProducts, setVideoProducts] = React.useState([]);
  const [loadingVideos, setLoadingVideos] = React.useState(true);
  const [selectedVideoProduct, setSelectedVideoProduct] = React.useState(null);
  const [isReelModalOpen, setIsReelModalOpen] = React.useState(false);
  const [isReelMuted, setIsReelMuted] = React.useState(true);
  const carouselRef = React.useRef(null);
  const { addToCart } = useCart();
  React.useEffect(() => {
    anime.timeline({ easing: 'easeOutExpo' })
      .add({
        targets: '.hero-eyebrow',
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 500,
      })
      .add({
        targets: '.hero-headline',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 700,
      }, '-=250')
      .add({
        targets: '.hero-subtext',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
      }, '-=400')
      .add({
        targets: '.hero-cta',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
      }, '-=300');
  }, []);

  React.useEffect(() => {
    // 1. Fetch best sellers
    api.get('/api/products?sort=bestselling&limit=4')
      .then(res => {
        if (res.data && res.data.products) {
          setBestsellerProducts(res.data.products);
        }
      })
      .catch(err => {
        console.warn("Could not load dynamic bestsellers from backend:", err);
      })
      .finally(() => {
        setLoadingBestsellers(false);
      });

    // 2. Fetch global store configurations
    api.get('/api/settings')
      .then(res => {
        if (res.data && res.data.settings) {
          setStoreSettings(res.data.settings);
        }
      })
      .catch(err => {
        console.warn("Could not load dynamic store settings in Home page:", err);
      });

    // 3. Fetch all catalog products for popups fallback mapping
    api.get('/api/products?limit=100')
      .then(res => {
        const prodList = res.data.products || res.data || [];
        setAllProducts(prodList);
      })
      .catch(err => {
        console.warn("Could not fetch catalog products list in Home page:", err);
      });

    // 4. Fetch video products
    api.get('/api/products?hasVideo=true&limit=8')
      .then(res => {
        if (res.data && res.data.products) {
          setVideoProducts(res.data.products);
        } else if (Array.isArray(res.data)) {
          setVideoProducts(res.data.filter(p => p.videoUrl));
        }
      })
      .catch(err => {
        console.warn("Could not load video products:", err);
      })
      .finally(() => {
        setLoadingVideos(false);
      });
  }, []);

  // Helper to resolve Bottom-Left Popup details
  const getLeftPopupDetails = () => {
    const defaultLeft = {
      productId: 'prod-1',
      label: 'Signature',
      title: 'The Navigator Elite',
      price: '₹3,499',
      badge: 'Try-On',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&auto=format&fit=crop&q=80'
    };

    if (!storeSettings) return defaultLeft;

    const linkedProduct = allProducts.find(p => p._id === storeSettings.heroLeftProductId || p.id === storeSettings.heroLeftProductId);

    return {
      productId: storeSettings.heroLeftProductId || defaultLeft.productId,
      label: storeSettings.heroLeftLabel !== undefined && storeSettings.heroLeftLabel !== '' ? storeSettings.heroLeftLabel : defaultLeft.label,
      title: storeSettings.heroLeftTitle !== undefined && storeSettings.heroLeftTitle !== '' ? storeSettings.heroLeftTitle : (linkedProduct ? linkedProduct.name : defaultLeft.title),
      price: storeSettings.heroLeftPrice !== undefined && storeSettings.heroLeftPrice !== '' ? storeSettings.heroLeftPrice : (linkedProduct ? `₹${linkedProduct.price}` : defaultLeft.price),
      badge: storeSettings.heroLeftBadge !== undefined && storeSettings.heroLeftBadge !== '' ? storeSettings.heroLeftBadge : defaultLeft.badge,
      image: storeSettings.heroLeftImage !== undefined && storeSettings.heroLeftImage !== '' ? storeSettings.heroLeftImage : (linkedProduct?.image ? linkedProduct.image : defaultLeft.image)
    };
  };

  // Helper to resolve Top-Right Popup details
  const getRightPopupDetails = () => {
    const defaultRight = {
      productId: 'prod-14',
      title: 'Zephyr Round',
      subtext: 'Titanium Series',
      price: '₹7,499',
      image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=200&auto=format&fit=crop&q=80'
    };

    if (!storeSettings) return defaultRight;

    const linkedProduct = allProducts.find(p => p._id === storeSettings.heroRightProductId || p.id === storeSettings.heroRightProductId);

    return {
      productId: storeSettings.heroRightProductId || defaultRight.productId,
      title: storeSettings.heroRightTitle !== undefined && storeSettings.heroRightTitle !== '' ? storeSettings.heroRightTitle : (linkedProduct ? linkedProduct.name : defaultRight.title),
      subtext: storeSettings.heroRightSubtext !== undefined && storeSettings.heroRightSubtext !== '' ? storeSettings.heroRightSubtext : defaultRight.subtext,
      price: storeSettings.heroRightPrice !== undefined && storeSettings.heroRightPrice !== '' ? storeSettings.heroRightPrice : (linkedProduct ? `₹${linkedProduct.price}` : defaultRight.price),
      image: storeSettings.heroRightImage !== undefined && storeSettings.heroRightImage !== '' ? storeSettings.heroRightImage : (linkedProduct?.image ? linkedProduct.image : defaultRight.image)
    };
  };

  // Collections Map matching design reference exactly
  const collections = [
    {
      name: 'Men',
      count: '45+ Styles',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXqOIywesk_wbOCDzpNqVcmIoZdz7P3qrKrk-XGOuC0pR5FQFk-h2Zl1UlxLgwM6xjcCUxjdW7Uz4rVJWpmaBszGHUGzTGv8H9OXplif67mjtEiO1aVSh5D8BepYV_mEOeOZKIe1to6EXjJBMw6Bt2simdkaEFyidhug2RaKvg-IFdBGITOat23rw4Sm8NHa3lr_HuuVsHJWe5fZxX6X5F2WxWeJ4uGNP5Ems3vXU09Q0ZhMUqIJln0wYhsc7RBAXKBywWLj19qo4',
      path: '/shop?gender=Men'
    },
    {
      name: 'Women',
      count: '55+ Styles',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJetequuvadN1RPSiiuhuo884i0lcGKJUH3nY-63A5yBFpcsHFdiighOj7KAnmEGx0CpPUOTym-kY9vKzJg1RNXqTFa1yAf6ePGu8Y0NMgy62sAGxB5dyXQEI_zbTjV73X4q9iYnIre_OfpfW6tAjDrY_Uom1N6KrPt9Dv1cPOmLpIuy6AZcsdADliXpjTalouazaDFpE_iSOUHNcZOyqGvvgBy-7OPhel0pXJ77uLkv8ZsXPLFp9KlKGLlkQ0HqdrDuaRyxN7jtg',
      path: '/shop?gender=Women'
    },
    {
      name: 'Kids',
      count: '20+ Styles',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCF_Jrvnit9jt1giF8mgoIt7PDhLKhf6BFTcGt1m3ghfm7TkVUEZH_bxFYz4BHQRgdhPXuEzaGFcCGTxE9MoKI5GFp9kJqMeIwHGeUad7_P4rIl9Qhg0j5aPqoV6oA8Wt3fIzZxrNQQdjBficgio4DI2xjJP58PSPiOEctLKgrOnlpymDbc4H6L-varWYJJNuZ-HBK2hJEz4mmCbYPfYwClY8zo0M2bLSFwEsNmSD4R1fRfS8nAzsCDKtBBpuEkTvqwi-JLouJtmYo',
      path: '/shop?category=Kids'
    },
    {
      name: 'Sale',
      count: 'Flat 20% Off',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKgNEj3y4C2GF1UwlZgMivZGyoc4XsLwspGoGn5QgMfeMUWJSldsVGJYL6sknQuGb5Mwk2TyGhz4Ut1fum4xniFuLgwIyoe0nW4N7-IRt9oF0npz2lSA2yoHr4Glxw_CJJd4LODG801oDLFwpGyJdxModBYvVy6ad_rokbKsIUfDDyLVoBRSBxNuyFqo-s85X4xQL4_LnDfipHpOAlfWy57tfHy1a9ZQmN_gZKvBoFYiax88art6H4MYN0mH9n_QTjWTLQs-g8C9Y',
      path: '/shop?category=Sale'
    }
  ];

  // Eyewear category collections mapping exactly to the screenshot and Collections.jsx
  const eyewearCategories = [
    {
      id: 'eyeglasses',
      title: 'Prescription Eyeglasses',
      tagline: 'Precision Optics & High Style',
      description: 'Handcrafted frames optimized for single vision, progressive, or reading lenses. Available in premium acetate and lightweight metal.',
      image: prescriptionGlassesImg,
      webpImage: prescriptionGlassesImgWebp,
      path: '/shop?category=Eyeglasses'
    },
    {
      id: 'sunglasses',
      title: 'Premium Sunglasses',
      tagline: '100% UV Protection, 100% Style',
      description: 'Shield your eyes with our statement shades. Engineered with polarized lenses for rich contrast and glare reduction.',
      image: premiumSunglassesImg,
      webpImage: premiumSunglassesImgWebp,
      path: '/shop?category=Sunglasses'
    },
    {
      id: 'computer',
      title: 'Computer Glasses',
      tagline: 'Digital Eye Strain Protection',
      description: 'Specially coated blue-light filtering lenses. Minimize fatigue, sleep better, and protect your vision during long screen sessions.',
      image: computerGlassesImg,
      webpImage: computerGlassesImgWebp,
      path: '/shop?category=Computer+Glasses'
    },
    {
      id: 'sports',
      title: 'Active Sports Frames',
      tagline: 'Engineered for Performance',
      description: 'High-grip, impact-resistant frames crafted from flexible TR90 material. Perfect fit for running, cycling, and outdoor adventures.',
      image: sportsSunglassesImg,
      webpImage: sportsSunglassesImgWebp,
      path: '/shop?category=Sports'
    },
    {
      id: 'kids',
      title: 'Kids Eyewear',
      tagline: 'Durable, Colorful & Comfortable',
      description: 'Play-proof frames designed with flexible hinges and premium lenses to keep up with active kids.',
      image: kidsEyewearImg,
      webpImage: kidsEyewearImgWebp,
      path: '/shop?category=Kids'
    }
  ];

  // Testimonials Mock Data
  const testimonials = [
    {
      name: 'Rahul Sharma',
      avatar: 'RS',
      quote: "The quality of the frames is comparable to brands that cost three times more. The custom lens fitting was seamless and they feel extremely premium."
    },
    {
      name: 'Ananya Iyer',
      avatar: 'AI',
      quote: "Love the aesthetic! It's hard to find minimalist frames that are also durable. EyeLeads nailed both. Customer service was excellent too.",
      featured: true
    },
    {
      name: 'Vikram Mehta',
      avatar: 'VM',
      quote: "The prescription accuracy is spot on. I've ordered online before but this was by far the best experience. Highly recommended for professionals."
    }
  ];



  const leftPopup = getLeftPopupDetails();
  const rightPopup = getRightPopupDetails();

  const getDynamicCategoryCount = (id, staticCount) => {
    if (!allProducts || allProducts.length === 0) return staticCount;
    let categoryKey = '';
    if (id === 'eyeglasses') categoryKey = 'eyeglasses';
    else if (id === 'sunglasses') categoryKey = 'sunglasses';
    else if (id === 'computer') categoryKey = 'computer glasses';
    else if (id === 'sports') categoryKey = 'sports';
    else if (id === 'kids') categoryKey = 'kids';

    const count = allProducts.filter(p => p.category?.toLowerCase() === categoryKey).length;
    if (count === 0) return staticCount;
    return `${count} ${count === 1 ? 'Style' : 'Styles'}`;
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.75;
      const newScroll = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      carouselRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const handleQuickAdd = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const standardProduct = {
      _id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category || 'Eyewear'
    };
    addToCart(standardProduct, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const renderReelCard = (product) => {
    return (
      <div
        key={product._id || product.id}
        onClick={() => {
          setSelectedVideoProduct(product);
          setIsReelModalOpen(true);
        }}
        className="flex-none w-64 snap-start cursor-pointer relative aspect-[9/16] rounded-3xl overflow-hidden border border-slate-200/60 shadow-md bg-[#0F2744] group transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
      >
        {/* Dynamic Video Element */}
        <video
          src={product.videoUrl}
          poster={product.videoThumbnail || product.image}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />

        {/* Top Floating Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="flex items-center gap-1 bg-[#B8952A]/90 backdrop-blur-sm border border-[#B8952A]/30 text-white px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest shadow-sm">
            <Sparkles className="h-2.5 w-2.5 animate-pulse" />
            <span>{product.isDemo ? 'Demo Reel' : 'Live Look'}</span>
          </span>
        </div>

        {/* Play Icon Indicator Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-white/25 backdrop-blur-md border border-white/45 flex items-center justify-center text-white opacity-95 group-hover:scale-110 transition-transform duration-300">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex flex-col justify-end text-left select-none z-10">
          <span className="text-[#B8952A] text-[11px] font-extrabold uppercase tracking-[0.2em] mb-1.5 block">
            {product.brand || 'Handcrafted Acetate'}
          </span>
          <h3 className="font-serif font-light text-lg text-white leading-tight truncate">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-white font-black text-xs">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#B8952A] flex items-center gap-1 group-hover:underline">
              <span>Shop Look</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn">
      <SEO
        title="Premium Eyewear Store"
        description="Shop prescription eyeglasses, sunglasses, blue-light computer glasses, sports frames, and kids eyewear at EyeLeads. Free shipping across India."
      />
      {/* 3. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-[#070F1B] via-[#0F2744] to-[#091424] overflow-hidden min-h-[650px] lg:min-h-[88vh] flex items-center select-none py-16 lg:py-0 border-b border-[#B8952A]/20">
        {/* Soft background luxury glows */}
        <div className="absolute top-1/4 left-0 w-[450px] h-[450px] bg-[#B8952A]/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-[#2E6DB4]/15 rounded-full blur-[140px] -z-10"></div>

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          {/* Subtle Geometric Dot Overlay Pattern */}
          <div
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(#F5F7FA 2px, transparent 2px)',
              backgroundSize: '40px 40px',
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">

          {/* Hero Left Content (Takes 7 columns on desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-8">

            {/* Top row with badges */}
            <div className="flex flex-wrap items-center gap-3 hero-eyebrow">
              <span className="inline-block rounded-full bg-[#B8952A]/15 border border-[#B8952A]/30 text-[#B8952A] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.3em] select-none backdrop-blur-sm">
                Gentle Monster × EyeLeads
              </span>
              <div className="bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-300 select-none">
                <Truck className="h-3.5 w-3.5 text-[#B8952A] shrink-0" />
                <span>Free Express Shipping</span>
              </div>
            </div>

            {/* Luxury Serif Heading & Description */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-[76px] font-light text-white leading-[1.05] tracking-tight hero-headline" style={{ fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif' }}>
                Lead the Way <br />
                <span className="font-serif italic font-light text-[#B8952A] select-all">You See.</span>
              </h1>
              <p className="text-slate-300 font-medium text-sm sm:text-base leading-relaxed max-w-lg hero-subtext">
                Discover a curated collection of premium eyewear where bold design meets exceptional craftsmanship and precision optics. From iconic statement frames to everyday essentials, every piece is selected to elevate your vision and define your style.
              </p>
            </div>

            {/* Premium CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 hero-cta">
              <Link
                to="/shop"
                className="bg-[#B8952A] hover:bg-amber-600 hover:shadow-[0_0_30px_rgba(184,149,42,0.45)] text-white px-9 py-4.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer shadow-lg group btn-shine-sweep"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/shop?tryOnOnly=true"
                className="border border-white/20 hover:border-[#B8952A] hover:bg-[#B8952A]/5 text-white hover:text-[#B8952A] px-9 py-4.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 flex items-center gap-2 cursor-pointer backdrop-blur-sm group btn-shine-sweep"
              >
                <Camera className="h-4 w-4 transform group-hover:scale-110 transition-transform text-[#B8952A]" />
                <span>Virtual Try-On</span>
              </Link>
            </div>

            {/* High-Fidelity Rating / Trust Indicators */}
            <div className="pt-6 border-t border-white/10 flex items-center gap-4">
              <div className="flex -space-x-3 select-none">
                <img className="w-9 h-9 rounded-full border-2 border-[#0B1528] object-cover shadow" src="https://images.unsplash.com/photo-1618018352910-72bdafdc7258?w=100&fit=crop&q=80" alt="Premium Indian Customer" loading="lazy" />
                <img className="w-9 h-9 rounded-full border-2 border-[#0B1528] object-cover shadow" src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&fit=crop&q=80" alt="Premium Indian Customer" loading="lazy" />
                <img className="w-9 h-9 rounded-full border-2 border-[#0B1528] object-cover shadow" src="https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?w=100&fit=crop&q=80" alt="Premium Indian Customer" loading="lazy" />
              </div>
              <div className="text-left select-none">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#B8952A] text-[#B8952A]" />
                  ))}
                  <span className="text-white font-extrabold text-xs ml-2">4.9 / 5.0 Rating</span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Verified by 12,000+ Luxury Patrons Across India</p>
              </div>
            </div>

          </div>

          {/* Hero Right Content (Takes 5 columns on desktop) */}
          <div className="lg:col-span-5 relative flex items-center justify-center select-none pt-8 lg:pt-0">

            {/* The main high-fashion editorial portrait container */}
            <div className="relative w-full max-w-[390px] aspect-[4/5] overflow-hidden rounded-[32px] shadow-2xl border border-white/10 group bg-slate-900">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtgFgBWaL56rr_6-mBc_URYkI8GelCo_Gg82162R8IsCvAlsDxMh_5MBO0iQBF7fIkCpSZJmR-niFmlRghzHY4owV-6ZeOwH2FVH5R5O5EC5UfCAYTRmTxGdinW95REVefNTF8nwOVNZgcXMDvzm_ZDnmX9dMPEIQi_WT1pwKhJEkZBVUs6xRWpiCoLVs5Yk3oRksjnM1YAlisNdT7dH07SEfR79AuVgWewq2YlGnJLkutse6b1gd_bVclO77yLCePGsvlcQ7MsQbt"
                alt="Editorial lifestyle portrait of high-fashion model wearing premium titanium eyewear frame"
                loading="eager"
                className="w-full h-full object-cover transition-all duration-[1200ms] ease-out group-hover:scale-105"
              />

              {/* Overlapping subtle dark gradient to make floating glass pop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10"></div>
            </div>

            {/* Floating Glassmorphic Product Card 1: Customizable Bottom Left */}
            <div className="absolute -bottom-6 -left-6 lg:-left-12 z-20 animate-fade-in-up animation-delay-500">
              <Link
                to={`/product/${leftPopup.productId}`}
                className="max-w-[250px] p-3.5 rounded-2xl glassmorphism border border-white/40 shadow-2xl flex items-center gap-3.5 transform hover:scale-[1.03] transition-all duration-300 cursor-pointer text-left animate-float block card-glow"
              >
                <div className="h-11 w-11 rounded-xl bg-white/70 backdrop-blur p-1 flex items-center justify-center border border-white/50 shrink-0 shadow-sm">
                  <img
                    src={leftPopup.image}
                    alt={leftPopup.title}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] text-[#B8952A] font-extrabold uppercase tracking-widest block">{leftPopup.label}</span>
                  <h4 className="text-[11px] font-extrabold text-[#0F2744] leading-tight mt-0.5 truncate">{leftPopup.title}</h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] font-bold text-slate-700">
                    <span>{leftPopup.price}</span>
                    {leftPopup.badge && (
                      <span className="text-[11px] text-[#B8952A] bg-[#B8952A]/10 px-1 py-0.2 rounded font-bold uppercase tracking-wider">{leftPopup.badge}</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Floating Glassmorphic Product Card 2: Customizable Top Right */}
            <div className="absolute -top-6 -right-6 z-20 animate-fade-in-up animation-delay-600">
              <Link
                to={`/product/${rightPopup.productId}`}
                className="p-3 rounded-2xl glassmorphism border border-white/40 shadow-2xl flex items-center gap-3 transform hover:scale-[1.03] transition-all duration-300 cursor-pointer max-w-[210px] text-left animate-float-slow block card-glow"
              >
                <div className="h-9 w-9 rounded-lg bg-white/70 backdrop-blur p-1 flex items-center justify-center border border-white/50 shrink-0 shadow-sm">
                  <img
                    src={rightPopup.image}
                    alt={rightPopup.title}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-extrabold text-[#0F2744] leading-none">{rightPopup.title}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-none">{rightPopup.subtext}</p>
                  <span className="text-[11px] font-bold text-[#B8952A] block mt-1">{rightPopup.price}</span>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. TRUST BAR */}
      <section className="bg-[#1B3F6E] py-8 border-b border-[#0F2744]/10 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 text-center">

          <div className="flex flex-col items-center space-y-2">
            <Truck className="h-8 w-8 text-[#B8952A]" />
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Free Delivery</h4>
            <p className="text-slate-300 text-[11px]">On all orders above ₹999</p>
          </div>

          <div className="flex flex-col items-center space-y-2 lg:border-l lg:border-white/10">
            <Shield className="h-8 w-8 text-[#B8952A]" />
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">1-Year Warranty</h4>
            <p className="text-slate-300 text-[11px]">Complete frame coverage</p>
          </div>

          <div className="flex flex-col items-center space-y-2 lg:border-l lg:border-white/10">
            <Upload className="h-8 w-8 text-[#B8952A]" />
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Prescription Upload</h4>
            <p className="text-slate-300 text-[11px]">Easy lens configuration</p>
          </div>

          <div className="flex flex-col items-center space-y-2 lg:border-l lg:border-white/10">
            <RotateCcw className="h-8 w-8 text-[#B8952A]" />
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">7-Day Returns</h4>
            <p className="text-slate-300 text-[11px]">On sunglasses & standard frames</p>
          </div>

        </div>
      </section>

      {/* 5. COLLECTIONS SECTION */}
      <section id="collections" className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Reveal className="text-center mb-16 space-y-2 select-none">
            <span className="text-[#B8952A] text-xs font-bold uppercase tracking-[0.3em] block">Our Collections</span>
            <h2 className="text-4xl font-extrabold text-[#1B3F6E] tracking-tight">Curated Masterpieces</h2>
            <div className="h-1 w-12 bg-[#B8952A] mx-auto mt-4 rounded-full"></div>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collections.map((collection, idx) => (
              <Link
                to={collection.path}
                key={collection.name}
                className="group relative overflow-hidden h-[520px] cursor-pointer block rounded-2xl shadow-md hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 border border-slate-100/50 bg-[#F1F5F9]"
              >
                <img
                  src={collection.image}
                  alt={collection.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1500ms] ease-out"
                />

                {/* Smooth luxury background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5 group-hover:from-black/85 group-hover:via-black/25 group-hover:to-transparent transition-all duration-500"></div>

                {/* Card details at the bottom */}
                <div className="absolute bottom-8 left-8 right-8 text-white flex flex-col justify-end text-left select-none">
                  {/* Subtle pre-header label */}
                  <span className="text-[#B8952A] text-[11px] font-extrabold uppercase tracking-[0.25em] mb-2 block">
                    {collection.name === 'Sale' ? 'Limited Offer' : 'Exclusive Line'}
                  </span>

                  {/* Title with serif styling */}
                  <h3 className="font-serif font-light text-3xl sm:text-4xl text-white tracking-wide group-hover:text-[#B8952A] transition-colors duration-300">
                    {collection.name}
                  </h3>

                  {/* Explore button that slides and fades in on hover */}
                  <div className="mt-5 flex items-center gap-2 text-xxs font-black uppercase tracking-[0.2em] text-[#B8952A] opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                    <span>Explore Now</span>
                    <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </StaggerGrid>

        </div>
      </section>

      {/* 5.1 EYEWEAR CATEGORIES SECTION */}
      <section id="eyewear-categories" className="py-24 bg-gradient-to-b from-white to-[#F8FAFC] border-t border-slate-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Section Header */}
          <Reveal className="mb-16 space-y-3 select-none">
            <span className="text-[#B8952A] text-xs font-bold uppercase tracking-[0.3em] block">
              Our Collection
            </span>
            <h2 className="text-4xl font-extrabold text-[#1B3F6E] tracking-tight font-serif">
              Eyewear Categories
            </h2>
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#B8952A] to-transparent mx-auto mt-4 rounded-full opacity-80"></div>
          </Reveal>

          {/* Symmetrical Inline Grid for all 5 cards */}
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-[16px]">
            {eyewearCategories.map((category, idx) => {
              const isFeatured = category.id === 'sunglasses';
              return (
                <div
                  key={category.id}
                  className={`group relative bg-white rounded-[24px] overflow-hidden shadow-luxury hover:shadow-luxury-hover border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 luxury-shimmer ${isFeatured ? 'border-[#B8952A]/40 ring-1 ring-[#B8952A]/10' : 'border-slate-100/40'
                    }`}
                >
                  {/* Image Header with top-right count badge */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center shrink-0">
                    <picture className="w-full h-full">
                      <source srcSet={category.webpImage} type="image/webp" />
                      <img
                        src={category.image}
                        alt={category.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </picture>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur shadow-sm px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-[#1B3F6E] uppercase tracking-widest border border-slate-200/50">
                      {getDynamicCategoryCount(category.id, '0 Styles')}
                    </div>
                    {isFeatured && (
                      <div className="absolute top-3 left-3 bg-amber-50/95 backdrop-blur shadow-sm px-2.5 py-1.5 rounded-full text-[11px] font-extrabold text-[#B8952A] uppercase tracking-widest border border-[#B8952A]/30 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5 shrink-0 text-[#B8952A]" />
                        <span>Featured</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1 justify-between text-left">
                    <div>
                      <span className="text-[#B8952A] text-[11px] font-extrabold uppercase tracking-widest block mb-1.5">
                        {category.tagline}
                      </span>
                      <h3 className="text-[15px] font-bold text-[#0F2744] font-serif leading-tight mb-2 group-hover:text-[#B8952A] transition-colors duration-300">
                        {category.title}
                      </h3>
                      <p className="text-[11px] text-[#4A4A6A] leading-relaxed mb-5 font-medium line-clamp-3">
                        {category.description}
                      </p>
                    </div>

                    {/* Boutique Link CTA */}
                    <Link
                      to={category.path}
                      className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#1B3F6E] hover:text-[#B8952A] group/btn transition-colors duration-300 mt-auto w-fit"
                    >
                      <span className="hover-underline-luxury pb-0.5">Explore Collection</span>
                      <ArrowRight className="h-3 w-3 transform group-hover/btn:translate-x-1 transition-transform duration-300 text-[#B8952A]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </StaggerGrid>

        </div>
      </section>

      {/* 6.5 WATCH & SHOP: EYELEADS TV (REELS) */}
      {videoProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-[#F8FAFC] to-white overflow-hidden border-t border-slate-100 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div className="space-y-1">
                <span className="text-[#B8952A] text-xs font-bold uppercase tracking-[0.3em] block">
                  EyeLeads TV
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3F6E] tracking-tight font-serif">
                  Watch & Shop: Luxury Reels
                </h2>
                <p className="text-[#4A4A6A] text-xs font-medium mt-1">
                  See our premium eyewear in motion. Tap to play full-screen and shop the look.
                </p>
              </div>

              <div className="flex gap-2 mt-4 sm:mt-0">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:border-[#B8952A] text-slate-600 hover:text-[#B8952A] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:border-[#B8952A] text-slate-600 hover:text-[#B8952A] flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {videoProducts.map((product) => renderReelCard(product))}
            </div>

          </div>
        </section>
      )}

      {/* 6. WHY EYELEADS */}
      <section className="py-20 bg-[#EAF0F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-14 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3F6E] tracking-tight">
              Why Choose EyeLeads?
            </h2>
            <p className="text-[#4A4A6A] text-xs sm:text-sm font-medium mt-2 max-w-md mx-auto">
              Beyond high-fashion aesthetics, we prioritize your vision health with clinical precision and frame reliability.
            </p>
            <div className="h-1 w-8 bg-[#B8952A] mx-auto mt-3 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div
              className="bg-white p-8 rounded-xl border border-slate-100 space-y-4 hover:shadow-md transition-all animate-fade-in-up"
              style={{ animationDelay: '100ms' }}
            >
              <div className="bg-[#EAF0F8] p-3 rounded-full text-[#1B3F6E] inline-block shrink-0">
                <Box className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A2E]">Free Express Delivery</h3>
              <p className="text-xs text-[#4A4A6A] leading-relaxed">
                Enjoy complimentary insured express shipping across all pin codes in India. Delivered safely to your doorstep.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-xl border border-slate-100 space-y-4 hover:shadow-md transition-all animate-fade-in-up"
              style={{ animationDelay: '200ms' }}
            >
              <div className="bg-[#EAF0F8] p-3 rounded-full text-[#1B3F6E] inline-block shrink-0">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A2E]">Certified Optometrists</h3>
              <p className="text-xs text-[#4A4A6A] leading-relaxed">
                Every single custom lens order is checked and verified manually by in-house optometrists before shipping.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-xl border border-slate-100 space-y-4 hover:shadow-md transition-all animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              <div className="bg-[#EAF0F8] p-3 rounded-full text-[#1B3F6E] inline-block shrink-0">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A2E]">100+ Unique Designs</h3>
              <p className="text-xs text-[#4A4A6A] leading-relaxed">
                Handcrafted acetate and premium titanium designs tailored perfectly for diverse face shapes and styles.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-xl border border-slate-100 space-y-4 hover:shadow-md transition-all animate-fade-in-up"
              style={{ animationDelay: '400ms' }}
            >
              <div className="bg-[#EAF0F8] p-3 rounded-full text-[#1B3F6E] inline-block shrink-0">
                <RotateCcw className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-[#1A1A2E]">7-Day Safe Returns</h3>
              <p className="text-xs text-[#4A4A6A] leading-relaxed">
                Return or exchange sunglasses & standard frames within 7 days of delivery. Custom prescription lenses excluded.
              </p>
            </div>

          </div>

        </div>
      </section>



      {/* 7. BESTSELLERS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex justify-between items-end mb-12 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[#B8952A] text-xs font-bold uppercase tracking-[0.2em] block">
                The Favorites
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3F6E] tracking-tight">
                Bestselling Frames
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-[#B8952A] hover:text-[#1B3F6E] text-xs font-bold uppercase tracking-wider transition-colors border-b border-[#B8952A] hover:border-[#1B3F6E] pb-0.5"
            >
              See All →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {loadingBestsellers ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="rounded-[24px] bg-white border border-slate-100/50 overflow-hidden animate-pulse shadow-sm h-96">
                  <div className="h-56 bg-slate-100" />
                  <div className="p-5 space-y-3.5">
                    <div className="h-4.5 bg-slate-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-slate-50 rounded-lg w-1/2" />
                    <div className="h-4.5 bg-slate-100 rounded-lg w-1/3 pt-3" />
                  </div>
                </div>
              ))
            ) : bestsellerProducts.length > 0 ? (
              bestsellerProducts.map((product, idx) => (
                <div
                  key={product._id || product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${(idx + 1) * 150}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-slate-400 font-semibold text-sm">
                No product listed
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 8. PRESCRIPTION BANNER */}
      <section className="bg-[#0F2744] py-20 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">

          {/* Banner Details */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-3">
              <span className="text-[#B8952A] text-xs font-bold uppercase tracking-[0.2em] block">
                Vision Precision
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Have a Prescription?
              </h2>
              <p className="text-slate-300 text-sm max-w-md leading-relaxed">
                Ordering glasses online has never been simpler. We custom-fit single vision, progressive, and computer lenses with scratch-proof coatings.
              </p>
            </div>

            {/* 3 steps */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <span className="text-[20px] font-extrabold text-[#B8952A] block">01</span>
                <h4 className="text-xs font-extrabold uppercase tracking-wider">Choose Frame</h4>
                <p className="text-slate-300 text-xxs leading-relaxed">Select any prescription-ready frame from our catalog.</p>
              </div>

              <div className="space-y-2 sm:border-l sm:border-white/10 sm:pl-6">
                <span className="text-[20px] font-extrabold text-[#B8952A] block">02</span>
                <h4 className="text-xs font-extrabold uppercase tracking-wider">Upload RX</h4>
                <p className="text-slate-300 text-xxs leading-relaxed">Upload a photo or enter details during secure checkout.</p>
              </div>

              <div className="space-y-2 sm:border-l sm:border-white/10 sm:pl-6">
                <span className="text-[20px] font-extrabold text-[#B8952A] block">03</span>
                <h4 className="text-xs font-extrabold uppercase tracking-wider">We Deliver</h4>
                <p className="text-slate-300 text-xxs leading-relaxed">Optometrist approved custom glasses direct to your door.</p>
              </div>
            </div>

            <Link
              to="/shop?prescriptionAvailable=true"
              className="bg-[#B8952A] hover:bg-amber-600 text-white px-8 py-3.5 rounded font-bold text-xs uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-xl w-fit cursor-pointer animate-fadeIn"
            >
              Shop Prescription Glasses →
            </Link>
          </div>

          {/* Banner Graphic card mockup */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="glassmorphism bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-[420px] shadow-2xl relative select-none">
              <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></div>

              <h4 className="text-sm font-bold uppercase tracking-wider text-[#B8952A] border-b border-white/10 pb-3 mb-5">
                Optometrist Standard Check
              </h4>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2 text-[11px] text-slate-300">
                  <span>OD (Right Eye)</span>
                  <span className="font-bold text-white">-2.25 SPH / -0.50 CYL x 180</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 text-[11px] text-slate-300">
                  <span>OS (Left Eye)</span>
                  <span className="font-bold text-white">-2.00 SPH / -0.25 CYL x 175</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2 text-[11px] text-slate-300">
                  <span>Pupillary Distance (PD)</span>
                  <span className="font-bold text-white">64 mm</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="h-8 w-8 bg-[#B8952A] rounded-full flex items-center justify-center font-bold text-xs text-navy-dark">
                  Dr
                </div>
                <div>
                  <h5 className="text-[11px] font-bold text-white leading-tight">Handcrafted Optical Lenses</h5>
                  <p className="text-xxs text-slate-400">FDA Approved · UV400 Protection Coating</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="py-20 bg-[#EAF0F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Reveal className="text-center mb-16 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B3F6E] tracking-tight relative inline-block">
              What Our Customers Say
              <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#B8952A]"></span>
            </h2>
          </Reveal>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((review) => (
              <div
                key={review.name}
                className={`bg-white p-8 rounded-xl border border-slate-100 space-y-6 shadow-sm relative flex flex-col justify-between hover:shadow-luxury-hover hover:-translate-y-1.5 transition-all duration-300 ${review.featured ? 'border-t-4 border-[#B8952A] md:-translate-y-2 hover:md:-translate-y-3.5 shadow-md' : ''
                  }`}
              >
                {/* 5 stars */}
                <div className="flex text-[#B8952A] gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#B8952A] text-[#B8952A]" />
                  ))}
                </div>

                <p className="text-[#1A1A2E] italic text-xs sm:text-sm leading-relaxed flex-grow">
                  "{review.quote}"
                </p>

                {/* Reviewer Details */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1B3F6E] text-white flex items-center justify-center rounded-full font-bold text-xs uppercase shrink-0">
                      {review.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1B3F6E] text-xs leading-none">{review.name}</h4>
                      <p className="text-[11px] text-[#4A4A6A] mt-1">Verified Buyer</p>
                    </div>
                  </div>
                  <span className="bg-green-50 text-green-700 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded border border-green-200">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </StaggerGrid>

        </div>
      </section>



      {/* FULL-SCREEN REELS MODAL PLAYER */}
      {isReelModalOpen && selectedVideoProduct && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-fadeIn select-none">
          {/* Close Area */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => {
            setIsReelModalOpen(false);
            setSelectedVideoProduct(null);
          }}></div>

          <div className="relative w-full max-w-[420px] h-full sm:h-[85vh] sm:max-h-[820px] aspect-[9/16] sm:rounded-[32px] overflow-hidden bg-black border border-white/10 flex flex-col justify-end shadow-luxury z-10">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsReelModalOpen(false);
                setSelectedVideoProduct(null);
              }}
              className="absolute top-6 right-6 z-30 w-11 h-11 rounded-full bg-black/55 hover:bg-black/85 border border-white/15 text-white flex items-center justify-center cursor-pointer transition-colors shadow"
              title="Close Reel"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video Element */}
            <video
              src={selectedVideoProduct.videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted={isReelMuted}
              playsInline
              ref={(el) => {
                if (el) {
                  el.muted = isReelMuted;
                  el.play().catch((err) => console.log("Reel auto-play error:", err));
                }
              }}
            />

            {/* Audio Toggle Button */}
            <button
              onClick={() => setIsReelMuted(!isReelMuted)}
              className="absolute bottom-32 right-6 z-30 w-11 h-11 rounded-full bg-black/55 hover:bg-black/85 border border-white/15 text-white flex items-center justify-center cursor-pointer transition-colors shadow"
              title={isReelMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isReelMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>

            {/* Bottom Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-6 pt-24 text-left z-20 flex flex-col gap-5">

              {/* Product Info */}
              <div className="space-y-1">
                <span className="text-[#B8952A] text-[11px] font-extrabold uppercase tracking-[0.25em] block">
                  {selectedVideoProduct.brand || 'Handcrafted Acetate'}
                </span>
                <h3 className="font-serif font-light text-2xl text-white leading-tight">
                  {selectedVideoProduct.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-white font-black text-base">
                    ₹{selectedVideoProduct.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold line-through">
                    ₹{Math.round(selectedVideoProduct.price * 1.4).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#B8952A] font-extrabold bg-[#B8952A]/15 border border-[#B8952A]/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Exclusive Live Deal
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-white/10">
                <button
                  onClick={(e) => {
                    handleQuickAdd(selectedVideoProduct, e);
                  }}
                  className="bg-[#B8952A] hover:bg-amber-600 text-white font-extrabold text-[11px] uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow active:scale-95 transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Bag</span>
                </button>
                <Link
                  to={selectedVideoProduct.isDemo ? '/shop' : `/product/${selectedVideoProduct._id || selectedVideoProduct.id}`}
                  onClick={() => {
                    setIsReelModalOpen(false);
                    setSelectedVideoProduct(null);
                  }}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-[11px] uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Shop Frame</span>
                  <ArrowRight className="h-4 w-4 text-[#B8952A]" />
                </Link>
              </div>

            </div>

            {/* Smart Phone Notch Decoration */}
            <div className="hidden sm:block absolute top-0 inset-x-0 h-6 bg-black/80 flex items-center justify-center z-30">
              <div className="w-20 h-4 bg-black rounded-b-xl border-x border-b border-white/10"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
