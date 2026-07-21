import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { baseURL } from '../utils/api';
import SEO from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import { toast } from '../components/Toast';
import ProductCard from '../components/ProductCard';
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  Check,
  Sparkles,
  ChevronRight,
  ShoppingBag,
  Upload,
  Eye,
  FileText,
  Calendar,
  ArrowRight,
  Shield,
  HelpCircle,
  TrendingUp,
  Camera,
  AlertCircle,
  Share2,
  X,
  Copy
} from 'lucide-react';
import VirtualTryOn from '../components/VirtualTryOn';

const getFallbackReviews = (product) => {
  if (!product) return [];

  const name = product.name || 'Frame';
  const category = (product.category || 'eyewear').toLowerCase();

  return [
    {
      _id: `fb-rev-${product._id || '1'}-1`,
      guestName: 'Aarav Sharma',
      rating: 5,
      title: 'Outstanding fit & finish',
      body: `Absolutely premium quality. The ${name} frame is extremely lightweight, comfortable, and sits perfectly on my bridge. Exceeded my expectations!`,
      isApproved: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: `fb-rev-${product._id || '2'}-2`,
      guestName: 'Meera Patel',
      rating: 4,
      title: 'Super clear lenses',
      body: `The lenses on my new ${name} are crystal clear and the anti-glare block coating is top notch. Delivery was fast too.`,
      isApproved: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: `fb-rev-${product._id || '3'}-3`,
      guestName: 'Kabir Malhotra',
      rating: 5,
      title: 'Beautiful packaging and style',
      body: `Excellent design and robust build. The leather case and wiping cloth are beautiful, feels like a luxury brand. Highly recommend ${name}!`,
      isApproved: true,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: `fb-rev-${product._id || '4'}-4`,
      guestName: 'Ananya Gupta',
      rating: 4,
      title: 'Elegant shape',
      body: `Beautiful ${category} frames. Love the sleek shape and the finish is very elegant. Fits perfectly on my face.`,
      isApproved: true,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedPrescription, setSavedPrescription] = useState(null);

  const handleShareProduct = async () => {
    const shareData = {
      title: product?.name || 'EyeLeads Premium Eyewear',
      text: product?.description || `Check out this premium eyewear at EyeLeads!`,
      url: window.location.href
    };

    try {
      // 1. Try native Web Share API (only works on secure HTTPS/localhost contexts)
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Product shared successfully!');
        return;
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share API failed:', err);
      } else {
        return; // User cancelled share sheet
      }
    }

    // Fallback: Open custom share modal
    setShareModalOpen(true);
  };

  // Custom states
  const [product, setProduct] = useState(null);
  const [cleaningKits, setCleaningKits] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchCleaningKits = async () => {
      try {
        const { data } = await api.get('/api/products', { params: { category: 'Cleaning Kits' } });
        setCleaningKits(data.products || data || []);
      } catch (err) {
        console.error('Failed to load cleaning kits:', err);
      }
    };
    fetchCleaningKits();
  }, []);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [lensType, setLensType] = useState('non-prescription');
  const [quantity, setQuantity] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [manualPd, setManualPd] = useState('');
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Interactive Zoom states
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  // Prescription form and video player states
  const [prescriptionData, setPrescriptionData] = useState({
    rightSph: '', rightCyl: '', rightAxis: '', rightAdd: '', rightPrism: '',
    leftSph: '', leftCyl: '', leftAxis: '', leftAdd: '', leftPrism: '',
    pd: '', prescriptionDate: '', doctorName: ''
  });
  const [showManualRx, setShowManualRx] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);

  // Lenskart-style lens flow states
  const [lensStep, setLensStep] = useState(1); // 1-4
  const [rxData, setRxData] = useState({
    rightSph: '', rightCyl: '0.00', rightAxis: '', rightAdd: '',
    leftSph: '', leftCyl: '0.00', leftAxis: '', leftAdd: '',
    pdType: 'single', pd: '', pdRight: '', pdLeft: '',
    sameEyes: false
  });
  const [selectedLensTypeFlow, setSelectedLensTypeFlow] = useState('single-vision');
  const [selectedLensMaterial, setSelectedLensMaterial] = useState('cr39');
  const [selectedLensFeatures, setSelectedLensFeatures] = useState([]);
  const [selectedTint, setSelectedTint] = useState('');
  const [tintPercentage, setTintPercentage] = useState(50);

  const getTintLabel = (pct) => {
    if (pct <= 20) return { label: 'Light', desc: 'Subtle tint, indoor-friendly' };
    if (pct <= 50) return { label: 'Medium', desc: 'Fashion tint, light outdoor use' };
    if (pct <= 80) return { label: 'Dark', desc: 'Strong sun protection' };
    return { label: 'Extra Dark', desc: 'Maximum block, bright sun / driving' };
  };
  const [lensAddOnTotal, setLensAddOnTotal] = useState(0);
  const [showNoPowerMsg, setShowNoPowerMsg] = useState(false);
  const [showUploaderStep1, setShowUploaderStep1] = useState(false);
  const [rxMode, setRxMode] = useState('manual'); // 'manual' or 'upload'
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    if (!user) return;
    const fetchSavedRx = async () => {
      try {
        const res = await api.get('/api/prescriptions/my');
        setSavedPrescription(res.data?.prescription || null);
      } catch (err) {
        console.error('Error fetching saved prescription:', err);
      }
    };
    fetchSavedRx();
  }, [user]);

  const handleUseSavedPrescription = () => {
    if (!savedPrescription) return;
    setRxMode('manual');
    setRxData(prev => ({
      ...prev,
      rightSph: savedPrescription.rightSph || '',
      rightCyl: savedPrescription.rightCyl || '0.00',
      rightAxis: savedPrescription.rightAxis || '',
      rightAdd: savedPrescription.rightAdd || '',
      leftSph: savedPrescription.leftSph || '',
      leftCyl: savedPrescription.leftCyl || '0.00',
      leftAxis: savedPrescription.leftAxis || '',
      leftAdd: savedPrescription.leftAdd || '',
      pdType: 'single',
      pd: savedPrescription.pd || ''
    }));
    toast.success('Saved prescription applied! Please review before continuing.');
  };

  const step2LensTypes = storeSettings?.lensTypes || [
    { id: 'single-vision', name: 'Single Vision', desc: 'For distance or reading', price: 0 },
    { id: 'bifocal', name: 'Bifocal', desc: 'Two powers in one lens', price: 500 },
    { id: 'progressive', name: 'Progressive', desc: 'No-line multifocal', price: 1500 }
  ];

  const step2Materials = storeSettings?.lensMaterials || [
    { id: 'cr39', name: 'CR-39 Plastic', index: '1.56', desc: 'Low powers (below ±2)', price: 0 },
    { id: 'polycarbonate', name: 'Polycarbonate', index: '1.59', desc: 'Kids & sports, impact resistant', price: 300 },
    { id: 'hi167', name: 'High-Index', index: '1.67', desc: 'Medium powers (±2 to ±4)', price: 600 },
    { id: 'hi174', name: 'High-Index', index: '1.74', desc: 'High powers (above ±4)', price: 1200 },
    { id: 'trivex', name: 'Trivex', index: '—', desc: 'Lightest & thinnest', price: 900 }
  ];

  const step3Features = storeSettings?.lensFeatures || [
    { id: 'blue-cut', name: 'Blue Cut', desc: 'Blocks blue light from screens', price: 400 },
    { id: 'photochromic', name: 'Photochromic / Transitions', desc: 'Darkens in sunlight', price: 800 },
    { id: 'polarized', name: 'Polarized', desc: 'Reduces glare, ideal for driving', price: 600 },
    { id: 'tinted', name: 'Tinted', desc: 'Custom aesthetic colors & gradients', price: 0 },
    { id: 'uv400', name: 'UV400 Protection', desc: 'Blocks 100% UV rays', price: 0 },
    { id: 'anti-glare', name: 'Anti-Glare / AR Coat', desc: 'Reduces reflections', price: 200 },
    { id: 'scratch-resistant', name: 'Scratch Resistant', desc: 'Hard coat protection', price: 0 },
    { id: 'anti-fog', name: 'Anti-Fog', desc: 'Prevents fogging', price: 300 }
  ];

  // Update flow lens type automatically when cards are clicked
  useEffect(() => {
    if (lensType === 'single-vision') {
      setSelectedLensTypeFlow('single-vision');
    } else if (lensType === 'progressive') {
      setSelectedLensTypeFlow('progressive');
    }
  }, [lensType]);

  // Calculate lens add-on total dynamically
  useEffect(() => {
    let total = 0;

    // Lens Type
    const selectedTypeObj = step2LensTypes.find(t => t.id === selectedLensTypeFlow);
    if (selectedTypeObj) {
      total += selectedTypeObj.price || 0;
    }

    // Lens Material
    const selectedMaterialObj = step2Materials.find(m => m.id === selectedLensMaterial);
    if (selectedMaterialObj) {
      total += selectedMaterialObj.price || 0;
    }

    // Lens Features
    selectedLensFeatures.forEach(featId => {
      const selectedFeatureObj = step3Features.find(f => f.id === featId);
      if (selectedFeatureObj) {
        total += selectedFeatureObj.price || 0;
      }
    });

    setLensAddOnTotal(total);
  }, [selectedLensTypeFlow, selectedLensMaterial, selectedLensFeatures, step2LensTypes, step2Materials, step3Features]);

  const toEmbedUrl = (url) => {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // Reviews states
  const [reviewsList, setReviewsList] = useState([]);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewPending, setReviewPending] = useState(false);
  const [reviewPhotosUploading, setReviewPhotosUploading] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    guestName: '',
    rating: 5,
    title: '',
    body: '',
    reviewImages: []
  });

  // Dynamic alternate images list
  const [galleryImages, setGalleryImages] = useState([]);

  // Store settings dynamic config state

  // Upsell list
  const [upsells, setUpsells] = useState([
    { id: '6a3c5d6e7f8a9b0c1d2e3f4b', name: 'Eco-Friendly Lens Cleaning Kit', price: 299, image: `${baseURL.replace(/\/api$/, '')}/uploads/lens-cleaning-kit.png`, checked: false }
  ]);

  const toggleUpsell = (upsellId) => {
    setUpsells(prev => prev.map(item => item.id === upsellId ? { ...item, checked: !item.checked } : item));
  };

  const opticianFee = storeSettings?.opticianFee || 600;
  const blueCutPremium = storeSettings?.blueCutPremium || 400;

  const lensOptions = [
    { id: 'non-prescription', name: 'Non-Prescription / Fashion', price: 0, description: 'Plano premium lenses with zero power, anti-glare coat' },
    { id: 'single-vision', name: 'Prescription Lenses', price: opticianFee, description: 'Custom prescription lenses fitted by our in-house optometrists' }
  ];

  const getActiveLensPrice = () => {
    if (lensType === 'single-vision') {
      return opticianFee + lensAddOnTotal;
    }
    return 0;
  };

  const calculateBundleTotal = () => {
    if (!product) return 0;
    const base = (product.price + getActiveLensPrice()) * quantity;
    const upsellCost = upsells.reduce((sum, item) => {
      if (item.checked) {
        const price = (item.id === '6a3c5d6e7f8a9b0c1d2e3f4b' && base >= 3000) ? 0 : item.price;
        return sum + price;
      }
      return sum;
    }, 0);
    return base + upsellCost;
  };

  // Fetch product data from API in parallel (zero network waterfalls for instant page loading)
  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');

    try {
      const [productRes, settingsRes, reviewsRes] = await Promise.allSettled([
        api.get(`/api/products/${id}`),
        api.get('/api/settings'),
        api.get(`/api/reviews/${id}`)
      ]);

      // 1. Process Store Settings
      if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.settings) {
        setStoreSettings(settingsRes.value.data.settings);
      }

      // 2. Process Product Details (Mandatory)
      if (productRes.status === 'fulfilled' && productRes.value.data?.status === 'success') {
        const fetchedProduct = productRes.value.data.product;
        setProduct(fetchedProduct);
        setRelatedProducts(productRes.value.data.related || []);

        const alternateImages = Array.isArray(fetchedProduct.images) && fetchedProduct.images.length > 0
          ? fetchedProduct.images
          : [
            fetchedProduct.image,
            'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=600&auto=format&fit=crop&q=80'
          ].filter(Boolean);

        setGalleryImages(alternateImages);
        setSelectedImage(fetchedProduct.image || (alternateImages.length > 0 ? alternateImages[0] : ''));
        if (fetchedProduct.colors && fetchedProduct.colors.length > 0) {
          setSelectedColor(fetchedProduct.colors[0]);
        }

        // 3. Process Reviews
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.data?.status === 'success') {
          const dbReviews = reviewsRes.value.data.reviews || [];
          setReviewsList(dbReviews.length > 0 ? dbReviews : getFallbackReviews(fetchedProduct));
        } else {
          setReviewsList(getFallbackReviews(fetchedProduct));
        }
      } else {
        setError('The requested premium eyewear model could not be loaded. Please check your network or server connection.');
      }
    } catch (err) {
      console.error('API error fetching product details:', err);
      setError('The requested premium eyewear model could not be loaded. Please check your network or server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  // Handle image zoom mouse-coordinates translation
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Mobile Touch Zoom & Pan Handlers
  const handleTouchStart = (e) => {
    setIsZooming(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length > 0) {
      const touch = e.touches[0];
      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
      
      let x = ((touch.clientX - left) / width) * 100;
      let y = ((touch.clientY - top) / height) * 100;
      
      // Constrain coordinates within bounding rect
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      
      setZoomPos({ x, y });
    }
  };

  const handleTouchEnd = () => {
    setIsZooming(false);
  };

  // Prescription File Uploader helper
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('prescription', file);

    try {
      // Trigger a direct upload request to backend
      const response = await api.post('/api/upload/prescription', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.status === 'success') {
        setUploadedFile({
          name: file.name,
          url: response.data.secure_url,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
        });
        toast.success(`Successfully uploaded and verified prescription: ${file.name}`);
      } else {
        toast.error('Completed upload, but failed to retrieve secure link.');
      }
    } catch (err) {
      console.error('Prescription file upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload prescription. Please verify file type.');
    }
  };

  // Review Image Uploader helper
  const handleReviewPhotosUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setReviewPhotosUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await api.post('/api/upload/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data && response.data.status === 'success') {
        const urls = response.data.urls || [];
        setReviewForm(prev => ({
          ...prev,
          reviewImages: [...prev.reviewImages, ...urls]
        }));
        toast.success(`Successfully uploaded ${urls.length} review photo(s)!`);
      }
    } catch (err) {
      console.error('Review photos upload error:', err);
      toast.error('Failed to upload photos. Please try again.');
    } finally {
      setReviewPhotosUploading(false);
    }
  };

  // Submit Review helper
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.body) {
      toast.error('Please write some review details before submitting.');
      return;
    }

    try {
      const payload = {
        guestName: reviewForm.guestName || 'Anonymous',
        rating: Number(reviewForm.rating),
        title: reviewForm.title || '',
        body: reviewForm.body,
        reviewImages: reviewForm.reviewImages,
        productName: product?.name || 'Navigator Frame'
      };

      const res = await api.post(`/api/reviews/${product._id || product.id}`, payload);
      if (res.data && res.data.status === 'success') {
        setReviewPending(true);
        toast.success('Your review has been successfully submitted and is pending approval.');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setReviewPending(true);
      toast.info('Simulated submission. Your review is pending admin approval.');
    }
  };

  // Calculate delivery date estimates dynamically
  const getDeliveryEstimates = () => {
    const today = new Date();
    const options = { month: 'short', day: 'numeric', weekday: 'short' };
    const estMin = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', options);
    const estMax = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', options);
    return { min: estMin, max: estMax };
  };

  const deliveryDays = getDeliveryEstimates();

  const getFlowCartLensName = () => {
    const matchedType = step2LensTypes.find(t => t.id === selectedLensTypeFlow);
    return matchedType ? matchedType.name : 'Prescription Lenses';
  };

  const getFlowLensOffset = () => 0;

  const getCartConfiguration = () => {
    const selectedLens = lensOptions.find(l => l.id === lensType);
    const isCustomFlow = lensType === 'single-vision';

    const finalPrice = isCustomFlow ? (product.price + opticianFee + lensAddOnTotal) : product.price;
    const finalLensName = isCustomFlow ? getFlowCartLensName() : (selectedLens ? selectedLens.name : 'Non-Prescription');
    const finalPd = isCustomFlow ? (rxData.pdType === 'single' ? rxData.pd : `R:${rxData.pdRight} L:${rxData.pdLeft}`) : manualPd;

    const finalPrescriptionData = isCustomFlow ? {
      rightSph: rxMode === 'manual' ? rxData.rightSph : '',
      rightCyl: rxMode === 'manual' ? rxData.rightCyl : '',
      rightAxis: rxMode === 'manual' ? rxData.rightAxis : '',
      rightAdd: rxMode === 'manual' ? rxData.rightAdd : '',
      leftSph: rxMode === 'manual' ? rxData.leftSph : '',
      leftCyl: rxMode === 'manual' ? rxData.leftCyl : '',
      leftAxis: rxMode === 'manual' ? rxData.leftAxis : '',
      leftAdd: rxMode === 'manual' ? rxData.leftAdd : '',
      pd: rxMode === 'manual' ? finalPd : (rxData.pd || '63 mm'),
      rxAttached: rxMode === 'upload' && uploadedFile ? (uploadedFile.url || uploadedFile.name) : null,
      lensConfig: {
        material: selectedLensMaterial,
        features: selectedLensFeatures,
        tint: selectedTint,
        tintPercentage: selectedTint ? tintPercentage : null,
        addOnPrice: lensAddOnTotal
      }
    } : prescriptionData;

    return { finalPrice, finalLensName, finalPd, finalPrescriptionData };
  };

  const addAccessoryUpsells = () => {
    upsells.forEach(item => {
      if (item.checked) {
        const base = (product.price + getActiveLensPrice()) * quantity;
        const price = (item.id === '6a3c5d6e7f8a9b0c1d2e3f4b' && base >= 3000) ? 0 : item.price;
        addToCart({
          _id: item.id,
          name: item.name,
          price: price,
          image: item.image,
          category: 'Accessories'
        }, 1, {
          color: 'Default Standard',
          size: 'One Size'
        });
      }
    });
  };

  const handleAddToCart = () => {
    if (!product) return;
    const { finalPrice, finalLensName, finalPd, finalPrescriptionData } = getCartConfiguration();

    // Add Main Eyewear Frame
    addToCart({
      _id: product._id,
      name: product.name,
      price: finalPrice,
      image: selectedImage,
      category: product.category || 'Eyewear'
    }, quantity, {
      color: selectedColor || 'Default Classic',
      size: 'Medium (Standard Size)',
      lensType: finalLensName,
      rxAttached: rxMode === 'upload' && uploadedFile ? (uploadedFile.url || uploadedFile.name) : null,
      pdEntered: rxMode === 'manual' ? finalPd : (rxData.pd || '63 mm'),
      prescriptionData: finalPrescriptionData
    });

    // Add Checked Accessory Upsells
    addAccessoryUpsells();

    setAddedToCart(true);
    toast.success(`Successfully added ${quantity} × ${product.name} with selected optical configuration to your cart!`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    const { finalPrice, finalLensName, finalPd, finalPrescriptionData } = getCartConfiguration();

    // 1. Add Main Eyewear Frame to Cart Context
    addToCart({
      _id: product._id,
      name: product.name,
      price: finalPrice,
      image: selectedImage,
      category: product.category || 'Eyewear'
    }, quantity, {
      color: selectedColor || 'Default Classic',
      size: 'Medium (Standard Size)',
      lensType: finalLensName,
      rxAttached: rxMode === 'upload' && uploadedFile ? (uploadedFile.url || uploadedFile.name) : null,
      pdEntered: rxMode === 'manual' ? finalPd : (rxData.pd || '63 mm'),
      prescriptionData: finalPrescriptionData
    });

    // 2. Add Checked Accessory Upsells to Cart Context
    addAccessoryUpsells();

    // 3. Assemble and map Checkout state payloads
    const subtotal = calculateBundleTotal();
    const deliveryCharge = 0;
    const finalTotal = subtotal;

    const mainCheckoutItem = {
      product: {
        _id: product._id,
        id: product._id,
        name: product.name,
        price: product.price + getActiveLensPrice(),
        image: selectedImage
      },
      quantity: quantity,
      options: {
        lensType: finalLensName,
        prescriptionDetails: rxMode === 'manual' ? (finalPd || '') : '',
        rxAttached: rxMode === 'upload' && uploadedFile ? (uploadedFile.url || uploadedFile.name) : null,
        pdEntered: rxMode === 'manual' ? finalPd : (rxData.pd || '63 mm'),
        prescriptionData: finalPrescriptionData
      }
    };

    const checkoutItemsPayload = [
      mainCheckoutItem,
      ...upsells.filter(item => item.checked).map(item => ({
        product: {
          _id: item.id,
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image
        },
        quantity: 1,
        options: {
          lensType: 'Accessory',
          prescriptionDetails: ''
        }
      }))
    ];

    // 4. Redirect directly to checkout
    navigate('/checkout', {
      state: {
        finalTotal,
        subtotal,
        deliveryCharge,
        discountAmount: 0,
        items: checkoutItemsPayload
      }
    });
  };

  const benefitsList = [
    'Hand-finished Italian acetate or pure Japanese aerospace titanium',
    'Certified 100% UVA/UVB shield with multi-layered anti-reflective coat',
    'Accidental structure replacement insurance and alignments included',
    'Individually inspected and verified by certified in-house optometrists'
  ];

  // Helper mapping swatches color hexes to premium luxury palettes
  const colorMap = {
    'gold': '#B8952A',
    'yellow': '#FACC15',
    'black': '#1A1A2E',
    'slate': '#4A5F7F',
    'silver': '#CBD5E1',
    'pink': '#EC4899',
    'blue': '#2E6DB4',
    'red': '#BA1A1A',
    'brown': '#78350F',
    'grey': '#64748B',
    'gray': '#64748B',
    'green': '#15803D',
    'tortoise': '#4A2C0F',
    'clear': '#E2E8F0',
    'transparent': '#F1F5F9',
    'rose': '#FB7185',
    'purple': '#7C3AED',
    'orange': '#EA580C',
    'amber': '#D97706',
    'navy': '#0F2744',
    'white': '#FFFFFF',
    'charcoal': '#334155',
    'teal': '#0D9488',
    'rose gold': '#B76E79',
    'rosegold': '#B76E79',
    'gunmetal': '#535C68',
    'demi': '#5C4033',
    'tortoiseshell': '#4A2C0F',
    'crystal': '#E2E8F0',
    'cream': '#FFFDD0',
    'beige': '#F5F5DC',
    'bronze': '#CD7F32',
    'copper': '#B87333',
    'peach': '#FFDAB9',
    'olive': '#808000',
    'khaki': '#F0E68C',
    'wine': '#722F37',
    'burgundy': '#800020',
    'smoke': '#94A3B8'
  };

  const getColorHex = (name) => {
    if (!name) return '#94A3B8';
    const c = name.toString().trim().toLowerCase();

    // Check if it's a multi-color combination (e.g. contains "&", "/", "and", or "-")
    // Do not split on spaces alone so unified names like "Rose Gold" or "Matte Black" stay solid.
    const words = c.split(/\s*(?:\/|&|-|\band\b)\s*/).filter(w => w !== '');

    const matchedHexes = [];
    for (const w of words) {
      if (colorMap[w]) {
        matchedHexes.push(colorMap[w]);
      } else if (w.startsWith('#')) {
        matchedHexes.push(w);
      } else {
        // Fallback: check if the word contains any color key
        for (const key of Object.keys(colorMap)) {
          if (w.includes(key)) {
            matchedHexes.push(colorMap[key]);
            break;
          }
        }
      }
    }

    if (matchedHexes.length >= 2) {
      const uniqueHexes = [...new Set(matchedHexes)];
      if (uniqueHexes.length >= 2) {
        if (uniqueHexes.length === 2) {
          return `linear-gradient(to bottom, ${uniqueHexes[0]} 50%, ${uniqueHexes[1]} 50%)`;
        } else {
          const steps = uniqueHexes.map((hex, i) => `${hex} ${(i * 100) / uniqueHexes.length}%, ${hex} ${((i + 1) * 100) / uniqueHexes.length}%`).join(', ');
          return `linear-gradient(to bottom, ${steps})`;
        }
      }
    }

    if (c.startsWith('#')) return c;
    if (colorMap[c]) return colorMap[c];

    // Check if the full name contains any mapped color key
    for (const key of Object.keys(colorMap)) {
      if (c.includes(key)) return colorMap[key];
    }

    return c || '#94A3B8';
  };

  const totalReviewsCount = reviewsList.length || product?.reviews || 0;
  const averageRating = reviewsList.length
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
    : (product?.rating || 0);

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    if (reviewsList.length === 0) {
      return { stars, pct: 0, count: 0 };
    }
    const count = reviewsList.filter(r => Math.round(r.rating) === stars).length;
    const pct = Math.round((count / reviewsList.length) * 100);
    return { stars, pct, count };
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn select-none space-y-12">
        {/* Editorial Skeleton loaders */}
        <div className="h-6 w-48 bg-slate-100 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="h-[480px] bg-slate-50 rounded-3xl animate-pulse"></div>
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-slate-50 rounded-xl animate-pulse"></div>
              <div className="w-24 h-24 bg-slate-50 rounded-xl animate-pulse"></div>
              <div className="w-24 h-24 bg-slate-50 rounded-xl animate-pulse"></div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-10 bg-slate-50 rounded-xl animate-pulse w-3/4"></div>
            <div className="h-6 bg-slate-50 rounded-xl animate-pulse w-1/4"></div>
            <div className="h-32 bg-slate-50 rounded-3xl animate-pulse"></div>
            <div className="h-20 bg-slate-50 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fadeIn select-none space-y-6">
        <div className="h-14 w-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto border border-rose-100 shadow-xxs">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-light font-serif text-navy-dark">Frame Loading Unsuccessful</h2>
          <p className="text-sm text-text-muted leading-relaxed">{error}</p>
        </div>
        <Link
          to="/shop"
          className="inline-block bg-[#0F2744] hover:bg-[#1B3F6E] text-white text-xs font-extrabold uppercase tracking-widest px-6 py-3.5 rounded-xl shadow-md transition-all active-scale-premium"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  // Generate SPH options
  const sphOptions = [];
  for (let i = 20.00; i >= -20.00; i -= 0.25) {
    const val = i > 0 ? `+${i.toFixed(2)}` : i === 0 ? '0.00' : i.toFixed(2);
    sphOptions.push(val);
  }

  // Generate CYL options
  const cylOptions = [];
  for (let i = 10.00; i >= -10.00; i -= 0.25) {
    const val = i > 0 ? `+${i.toFixed(2)}` : i === 0 ? '0.00' : i.toFixed(2);
    cylOptions.push(val);
  }

  // Generate AXIS options
  const axisOptions = Array.from({ length: 180 }, (_, i) => (i + 1).toString());

  // Generate ADD options
  const addOptions = [];
  for (let i = 0.75; i <= 3.50; i += 0.25) {
    addOptions.push(`+${i.toFixed(2)}`);
  }



  const tintColors = [
    { name: 'Grey', style: { background: '#64748B' } },
    { name: 'Brown', style: { background: '#78350F' } },
    { name: 'Green', style: { background: '#15803D' } },
    { name: 'Blue', style: { background: '#2E6DB4' } },
    { name: 'Pink', style: { background: '#EC4899' } },
    { name: 'Yellow', style: { background: '#FACC15' } },
    { name: 'Gradient', style: { background: 'linear-gradient(to bottom, #4A5F7F 0%, #FAF9F6 100%)' } }
  ];

  const getRecommendedMaterial = () => {
    const parsePower = (val) => {
      if (!val) return 0;
      return Math.abs(parseFloat(val)) || 0;
    };
    const maxSph = Math.max(parsePower(rxData.rightSph), parsePower(rxData.leftSph));
    if (maxSph === 0) return 'cr39';
    if (maxSph <= 2.00) return 'cr39';
    if (maxSph <= 4.00) return 'hi167';
    return 'hi174';
  };

  const handleRxChange = (field, value) => {
    setRxData(prev => {
      const updated = { ...prev, [field]: value };

      // If "Same power for both eyes" is checked, duplicate OD to OS
      if (updated.sameEyes) {
        if (field === 'rightSph') updated.leftSph = value;
        if (field === 'rightCyl') updated.leftCyl = value;
        if (field === 'rightAxis') updated.leftAxis = value;
        if (field === 'rightAdd') updated.leftAdd = value;
      }

      return updated;
    });
  };

  const handleSameEyesToggle = (checked) => {
    setRxData(prev => {
      const updated = { ...prev, sameEyes: checked };
      if (checked) {
        updated.leftSph = prev.rightSph;
        updated.leftCyl = prev.rightCyl;
        updated.leftAxis = prev.rightAxis;
        updated.leftAdd = prev.rightAdd;
      }
      return updated;
    });
  };

  const handleProceedToStep2 = () => {
    if (rxMode === 'manual') {
      if (!rxData.rightSph && !rxData.leftSph) {
        toast.error('Please enter the SPH (Sphere) power for at least one eye.');
        return;
      }
    } else {
      if (!uploadedFile) {
        toast.error('Please upload your prescription photo or document to proceed.');
        return;
      }
    }

    // Auto-select the recommended material based on entered power
    const rec = getRecommendedMaterial();
    setSelectedLensMaterial(rec);

    setLensStep(2);
  };

  const handleFeatureToggle = (id) => {
    setSelectedLensFeatures(prev => {
      if (prev.includes(id)) {
        return prev.filter(f => f !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 animate-fadeIn pb-24 md:pb-16 select-none">
      <SEO
        title={product.name}
        description={product.description ? product.description.slice(0, 155) : `Shop the ${product.name} at EyeLeads — premium eyewear with fast delivery across India.`}
        image={product.image}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images && product.images.length > 0 ? product.images : [product.image],
            description: product.description || `${product.name} — premium eyewear from EyeLeads.`,
            brand: {
              '@type': 'Brand',
              name: product.brand || 'EyeLeads'
            },
            offers: {
              '@type': 'Offer',
              url: typeof window !== 'undefined' ? window.location.href : '',
              priceCurrency: 'INR',
              price: product.price,
              availability: product.inStockOnly
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition'
            },
            ...(product.rating > 0 && product.reviews > 0
              ? {
                  aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: product.rating,
                    reviewCount: product.reviews
                  }
                }
              : {})
          })}
        </script>
      </Helmet>

      {/* Editorial Breadcrumbs */}
      <nav className="mb-8 select-none">
        <ol className="flex items-center gap-2 text-xs font-bold text-[#4A4A6A]/60">
          <li>
            <Link to="/" className="hover:text-[#1B3F6E] transition-colors">Home</Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3 text-slate-300" />
          </li>
          <li>
            <Link to="/shop" className="hover:text-[#1B3F6E] transition-colors">Shop</Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3 text-slate-300" />
          </li>
          <li className="text-[#1B3F6E] font-black">{product.name}</li>
        </ol>
      </nav>

      {/* Two Column details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

        {/* Left Column: editorial large gallery (lg:sticky for visual layout continuity) */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-24">
          <div
            className="bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] p-8 rounded-[32px] border border-slate-100 flex items-center justify-center min-h-[380px] lg:min-h-[480px] shadow-sm relative group overflow-hidden cursor-crosshair select-none"
            style={{ touchAction: 'none' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >


            {/* Magnifying overlay image */}
            <img
              src={selectedImage}
              alt={product.name}
              loading="eager"
              style={{
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transform: isZooming ? 'scale(2.2)' : 'scale(1)'
              }}
              className="max-h-[320px] lg:max-h-[400px] object-contain transition-transform duration-300 ease-out z-10 pointer-events-none"
            />

            {/* Subtle Zoom visual hint on image center */}
            {!isZooming && (
              <div className="absolute bottom-4 right-4 z-20 bg-white/70 backdrop-blur border border-white/50 p-2.5 rounded-full shadow-sm text-slate-400 group-hover:text-[#1B3F6E] transition-colors pointer-events-none">
                <Eye className="h-4.5 w-4.5" />
              </div>
            )}
          </div>

          {/* Gallery Thumbnails list */}
          <div className="flex gap-4">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-2xl overflow-hidden border-2 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] p-2 transition-all cursor-pointer ${selectedImage === img ? 'border-[#B8952A] shadow-md scale-102 bg-white' : 'border-slate-100/80 hover:border-[#1B3F6E]/40'
                  }`}
              >
                <img src={img} alt={`${product.name} angle ${idx + 1}`} loading="lazy" className="w-full h-full object-contain" />
              </button>
            ))}
          </div>

          {/* Watch Product Video Section */}
          {product.productVideo && (
            <div className="mt-4">
              <button
                onClick={() => setShowVideo(!showVideo)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#B8952A]/50 text-xs font-extrabold uppercase tracking-widest text-[#1B3F6E] rounded-2xl shadow-sm transition-all select-none cursor-pointer"
              >
                <span>{showVideo ? '■ Close Video Player' : '▶ Watch Product Video'}</span>
              </button>
              {showVideo && (
                <div className="mt-3 rounded-2xl overflow-hidden aspect-video border border-slate-100 shadow-inner bg-black">
                  {product.productVideo.includes('youtube') || product.productVideo.includes('youtu.be') ? (
                    <iframe src={toEmbedUrl(product.productVideo)} className="w-full h-full border-0" allowFullScreen />
                  ) : (
                    <video src={product.productVideo} controls className="w-full h-full" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: details, selections and custom uploader */}
        <div className="lg:col-span-5 space-y-8">

          {/* Header block details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[#B8952A] font-extrabold text-[11px] uppercase tracking-widest bg-[#B8952A]/10 border border-[#B8952A]/30 px-3 py-1 rounded-full">
                {product.category || 'Eyewear'}
              </span>
              <span className="text-slate-200">|</span>
              <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-widest">{product.brand || 'EyeLeads Premium'}</span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-[#1A1A2E] tracking-tight leading-tight">
                {product.name}
              </h1>
              <button 
                onClick={handleShareProduct}
                className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-full border border-slate-100 transition-colors shadow-sm shrink-0 active:scale-95 cursor-pointer flex items-center justify-center"
                title="Share Product"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
            {product.productId && (
              <p className="text-xs text-slate-400 font-mono mt-1">SKU: {product.productId}</p>
            )}

            {/* Ratings summary bar */}
            <div className="flex items-center gap-3">
              <div className="flex text-[#B8952A] gap-0.5 select-none">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.round(Number(averageRating)) ? 'fill-[#B8952A] text-[#B8952A]' : 'text-slate-200'}`} />
                ))}
              </div>
              <span className="text-xs font-black text-[#1B3F6E]">{averageRating}</span>
              <span className="text-slate-200">|</span>
              <button 
                onClick={() => {
                  const el = document.getElementById('customer-reviews-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs font-black text-[#4A4A6A] hover:underline cursor-pointer font-extrabold bg-transparent border-0 p-0 outline-none"
              >
                {totalReviewsCount} Verified {totalReviewsCount === 1 ? 'Review' : 'Reviews'}
              </button>
            </div>

            {/* Price section comparison */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="text-3xl font-black text-[#1B3F6E]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-sm text-slate-400/80 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                  <span className="text-[11px] text-[#B8952A] bg-[#B8952A]/10 border border-[#B8952A]/30 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                    {product.discount || '30'}% Off
                  </span>
                </>
              )}
            </div>

            <p className="text-[#4A4A6A] text-xs sm:text-sm leading-relaxed font-medium">
              {product.description}
            </p>
          </div>

          {/* Delivery & Warranty estimates */}
          <div className="bg-[#F8FAFC] rounded-[24px] p-5 border border-slate-100 grid grid-cols-2 gap-4 divide-x divide-slate-200/80 select-none">
            <div className="flex items-center gap-3 pr-2">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-[#B8952A] shadow-sm border border-slate-100 shrink-0">
                <Truck className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Express delivery</span>
                <span className="text-xs font-black text-[#1B3F6E] block mt-1 leading-tight">{deliveryDays.min} - {deliveryDays.max}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-4">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-[#B8952A] shadow-sm border border-slate-100 shrink-0">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-extrabold uppercase tracking-widest block leading-none">Warranty</span>
                <span className="text-xs font-black text-[#1B3F6E] block mt-1 leading-tight">{product.warranty || storeSettings?.warrantyText || '1-Year Warranty'}</span>
              </div>
            </div>
          </div>

          {/* Color selector (Frame Swatches) */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#4A5F7F]">
                Frame Color
              </h3>
              <div className="flex gap-3">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedColor(color);
                      if (product.colorImages && product.colorImages[color]) {
                        setSelectedImage(product.colorImages[color]);
                      } else if (product.images && product.images[idx]) {
                        setSelectedImage(product.images[idx]);
                      }
                    }}
                    className={`w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all duration-200 cursor-pointer ${selectedColor === color
                      ? 'border-2 border-[#0F2744] scale-105 shadow-sm'
                      : 'border border-slate-200 hover:border-slate-350'
                      }`}
                    title={color}
                  >
                    <span
                      className="w-6 h-6 rounded-full block border border-black/5"
                      style={{ background: getColorHex(color) }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customize Lenses */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-widest">
                Select Lens Options
              </h3>
              <span className="text-[11px] text-[#B8952A] font-extrabold uppercase hover:underline cursor-pointer tracking-wider flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                <span>Lens Guide</span>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {lensOptions.map((lens) => (
                <button
                  key={lens.id}
                  onClick={() => setLensType(lens.id)}
                  className={`p-4 text-left border rounded-[20px] transition-all flex items-start gap-4 cursor-pointer select-none ${lensType === lens.id
                    ? 'border-[#1B3F6E] bg-[#1B3F6E]/5 text-[#1B3F6E] ring-1 ring-[#1B3F6E] shadow-sm'
                    : 'border-slate-200/80 hover:border-slate-400 bg-white text-[#4A4A6A]'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${lensType === lens.id ? 'border-[#1B3F6E] bg-[#1B3F6E]' : 'border-slate-300'
                    }`}>
                    {lensType === lens.id && <Check className="h-3 w-3 text-white stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-xs font-extrabold block">{lens.name}</span>
                      <span className="text-[11px] text-[#B8952A] font-extrabold shrink-0">
                        {lens.price > 0 ? `+ ₹${lens.price.toLocaleString('en-IN')}` : 'Included'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold mt-1 leading-normal">{lens.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prescription Uploader & Manual Entry Form (Revealed conditionally) */}
          {lensType !== 'non-prescription' && (
            <div className="border-2 border-dashed border-slate-200 rounded-[24px] p-6 bg-[#F8FAFC] space-y-6 animate-fadeIn select-none">

              {/* Stepper or Basic Title depending on lensType */}
              {['single-vision', 'progressive'].includes(lensType) ? (
                /* Lenskart-Style 4-Step Flow */
                <>
                  {/* Step Indicator */}
                  <div className="flex items-center justify-between mb-8 select-none">
                    {[
                      { number: 1, label: 'Enter Power' },
                      { number: 2, label: 'Lens Type' },
                      { number: 3, label: 'Features' },
                      { number: 4, label: 'Confirm' }
                    ].map((step, idx, arr) => {
                      const isActive = lensStep === step.number;
                      const isCompleted = lensStep > step.number;

                      return (
                        <React.Fragment key={step.number}>
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${isCompleted
                                ? 'bg-[#0F2744] text-white'
                                : isActive
                                  ? 'bg-[#B8952A] text-white shadow-md scale-110'
                                  : 'bg-slate-200/60 text-slate-400 border border-slate-300/45'
                                }`}
                            >
                              {isCompleted ? '✓' : step.number}
                            </div>
                            <span
                              className={`text-[11px] font-extrabold uppercase mt-2 tracking-wider ${isActive ? 'text-[#B8952A]' : isCompleted ? 'text-[#0F2744]' : 'text-slate-400'
                                }`}
                            >
                              {step.label}
                            </span>
                          </div>
                          {idx < arr.length - 1 && (
                            <div
                              className={`h-0.5 flex-1 mx-2 transition-all duration-500 ${isCompleted ? 'bg-[#0F2744]' : 'bg-slate-200'
                                }`}
                            />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* STEP 1: Enter Your Power */}
                  {lensStep === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1B3F6E]">Enter Your Prescription</h4>
                        <span className="text-[11px] text-[#B8952A] font-extrabold hover:underline cursor-pointer flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5" />
                          <span>How to read?</span>
                        </span>
                      </div>

                      {user && savedPrescription && (
                        <button
                          type="button"
                          onClick={handleUseSavedPrescription}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#B8952A] text-[#B8952A] bg-amber-50/40 hover:bg-amber-50 text-[11px] font-black uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Use My Saved Prescription (from Account)
                        </button>
                      )}

                      {/* Mode selection tabs */}
                      <div className="flex border border-slate-200 rounded-2xl overflow-hidden text-[11px] font-black uppercase tracking-widest bg-white shadow-xxs">
                        <button
                          type="button"
                          onClick={() => setRxMode('manual')}
                          className={`flex-1 py-3.5 text-center transition-all cursor-pointer ${rxMode === 'manual'
                            ? 'bg-[#1B3F6E] text-white shadow-sm font-black'
                            : 'text-slate-500 hover:text-slate-850 bg-slate-50/50'
                            }`}
                        >
                          ✍️ Enter Power Manually
                        </button>
                        <button
                          type="button"
                          onClick={() => setRxMode('upload')}
                          className={`flex-1 py-3.5 text-center transition-all cursor-pointer ${rxMode === 'upload'
                            ? 'bg-[#1B3F6E] text-white shadow-sm font-black'
                            : 'text-slate-500 hover:text-slate-850 bg-slate-50/50'
                            }`}
                        >
                          📸 Upload Prescription Photo
                        </button>
                      </div>

                      {rxMode === 'manual' ? (
                        <div className="space-y-6 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Right Eye (OD) */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                              <h5 className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E] flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                <span className="w-2 h-2 rounded-full bg-[#B8952A]" />
                                Right Eye (OD)
                              </h5>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">SPH (Sphere)</label>
                                  <select
                                    value={rxData.rightSph}
                                    onChange={(e) => handleRxChange('rightSph', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                  >
                                    <option value="">Select SPH</option>
                                    {sphOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">CYL (Cylinder)</label>
                                  <select
                                    value={rxData.rightCyl}
                                    onChange={(e) => handleRxChange('rightCyl', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                  >
                                    <option value="0.00">0.00</option>
                                    {cylOptions.filter(x => x !== '0.00').map(val => <option key={val} value={val}>{val}</option>)}
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                {rxData.rightCyl !== '0.00' && rxData.rightCyl !== '' && (
                                  <div className="animate-fadeIn">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">AXIS</label>
                                    <select
                                      value={rxData.rightAxis}
                                      onChange={(e) => handleRxChange('rightAxis', e.target.value)}
                                      className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                    >
                                      <option value="">Select AXIS</option>
                                      {axisOptions.map(val => <option key={val} value={val}>{val}°</option>)}
                                    </select>
                                  </div>
                                )}

                                {selectedLensTypeFlow === 'progressive' && (
                                  <div className="animate-fadeIn">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">ADD (Addition)</label>
                                    <select
                                      value={rxData.rightAdd}
                                      onChange={(e) => handleRxChange('rightAdd', e.target.value)}
                                      className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                    >
                                      <option value="">Select ADD</option>
                                      {addOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Left Eye (OS) */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-left">
                              <h5 className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E] flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                <span className="w-2 h-2 rounded-full bg-[#1B3F6E]" />
                                Left Eye (OS)
                              </h5>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">SPH (Sphere)</label>
                                  <select
                                    value={rxData.leftSph}
                                    onChange={(e) => handleRxChange('leftSph', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                    disabled={rxData.sameEyes}
                                  >
                                    <option value="">Select SPH</option>
                                    {sphOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">CYL (Cylinder)</label>
                                  <select
                                    value={rxData.leftCyl}
                                    onChange={(e) => handleRxChange('leftCyl', e.target.value)}
                                    className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                    disabled={rxData.sameEyes}
                                  >
                                    <option value="0.00">0.00</option>
                                    {cylOptions.filter(x => x !== '0.00').map(val => <option key={val} value={val}>{val}</option>)}
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                {rxData.leftCyl !== '0.00' && rxData.leftCyl !== '' && (
                                  <div className="animate-fadeIn">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">AXIS</label>
                                    <select
                                      value={rxData.leftAxis}
                                      onChange={(e) => handleRxChange('leftAxis', e.target.value)}
                                      className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                      disabled={rxData.sameEyes}
                                    >
                                      <option value="">Select AXIS</option>
                                      {axisOptions.map(val => <option key={val} value={val}>{val}°</option>)}
                                    </select>
                                  </div>
                                )}

                                {selectedLensTypeFlow === 'progressive' && (
                                  <div className="animate-fadeIn">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">ADD (Addition)</label>
                                    <select
                                      value={rxData.leftAdd}
                                      onChange={(e) => handleRxChange('leftAdd', e.target.value)}
                                      className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                      disabled={rxData.sameEyes}
                                    >
                                      <option value="">Select ADD</option>
                                      {addOptions.map(val => <option key={val} value={val}>{val}</option>)}
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Same power check & PD selection */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                id="sameEyes"
                                checked={rxData.sameEyes}
                                onChange={(e) => handleSameEyesToggle(e.target.checked)}
                                className="rounded text-[#1B3F6E] focus:ring-[#1B3F6E] h-4 w-4 border-slate-350 cursor-pointer transition-colors"
                              />
                              <label htmlFor="sameEyes" className="text-xs font-black text-[#1B3F6E] cursor-pointer">
                                Same power for both eyes
                              </label>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">PD Type:</span>
                              <div className="flex border border-slate-200 rounded-xl overflow-hidden text-[11px] font-black uppercase tracking-wider bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => setRxData(prev => ({ ...prev, pdType: 'single' }))}
                                  className={`px-3.5 py-1.5 transition-all cursor-pointer ${rxData.pdType === 'single' ? 'bg-[#1B3F6E] text-white shadow-sm' : 'text-slate-400 hover:text-slate-650'
                                    }`}
                                >
                                  Single PD
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRxData(prev => ({ ...prev, pdType: 'dual' }))}
                                  className={`px-3.5 py-1.5 transition-all cursor-pointer ${rxData.pdType === 'dual' ? 'bg-[#1B3F6E] text-white shadow-sm' : 'text-slate-400 hover:text-slate-655'
                                    }`}
                                >
                                  Dual PD
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* PD Form Inputs */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            {rxData.pdType === 'single' ? (
                              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-left">
                                <div className="w-full sm:w-1/2">
                                  <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Single PD</label>
                                  <select
                                    value={rxData.pd}
                                    onChange={(e) => setRxData(prev => ({ ...prev, pd: e.target.value }))}
                                    className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                  >
                                    <option value="">Select PD (mm)</option>
                                    {Array.from({ length: 31 }, (_, i) => (i + 50).toString()).map(val => (
                                      <option key={val} value={val}>{val} mm</option>
                                    ))}
                                  </select>
                                </div>
                                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed w-full sm:w-1/2">
                                  Single Pupillary Distance is the distance between your pupils. Standard values range from 54mm to 68mm.
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between text-left">
                                <div className="w-full sm:w-1/2 grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Right PD</label>
                                    <select
                                      value={rxData.pdRight}
                                      onChange={(e) => setRxData(prev => ({ ...prev, pdRight: e.target.value }))}
                                      className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                    >
                                      <option value="">R (mm)</option>
                                      {Array.from({ length: 16 }, (_, i) => (i + 25).toString()).map(val => (
                                        <option key={val} value={val}>{val} mm</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Left PD</label>
                                    <select
                                      value={rxData.pdLeft}
                                      onChange={(e) => setRxData(prev => ({ ...prev, pdLeft: e.target.value }))}
                                      className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                    >
                                      <option value="">L (mm)</option>
                                      {Array.from({ length: 16 }, (_, i) => (i + 25).toString()).map(val => (
                                        <option key={val} value={val}>{val} mm</option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <p className="text-[11px] text-slate-400 font-semibold leading-relaxed w-full sm:w-1/2">
                                  Dual PD segments denote the distance from the bridge of the nose to each pupil (commonly 25mm to 40mm each).
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6 animate-fadeIn">
                          {/* Drag & Drop uploader area */}
                          <div className="space-y-3">
                            <label className="w-full flex flex-col items-center px-4 py-8 bg-white rounded-[24px] border-2 border-dashed border-slate-355 hover:border-[#B8952A]/50 transition-all cursor-pointer group shadow-sm text-center">
                              <FileText className="h-8 w-8 text-slate-350 group-hover:text-[#B8952A] transition-colors mb-2" />
                              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1B3F6E] block mb-1">
                                Select or Drag Prescription Photo
                              </span>
                              <span className="text-[11px] text-slate-400 font-semibold">PDF, JPEG, or PNG up to 5MB</span>
                              <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                            </label>

                            {uploadedFile && (
                              <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center justify-between text-xs font-bold text-green-700 animate-fadeIn select-none">
                                <div className="flex items-center gap-2 min-w-0">
                                  <Check className="h-4.5 w-4.5 shrink-0" />
                                  <span className="truncate">{uploadedFile.name}</span>
                                </div>
                                <span className="text-[11px] text-slate-400 shrink-0 font-medium">({uploadedFile.size})</span>
                              </div>
                            )}
                          </div>

                          {/* PD selector - optional in upload mode */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left">
                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                              <div className="w-full sm:w-1/2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Pupillary Distance (PD) - Optional</label>
                                <select
                                  value={rxData.pd}
                                  onChange={(e) => setRxData(prev => ({ ...prev, pd: e.target.value }))}
                                  className="w-full border border-slate-200 rounded-xl px-2 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-white text-slate-800 font-semibold"
                                >
                                  <option value="">I don't know my PD (Default 63mm)</option>
                                  {Array.from({ length: 31 }, (_, i) => (i + 50).toString()).map(val => (
                                    <option key={val} value={val}>{val} mm</option>
                                  ))}
                                </select>
                              </div>
                              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed w-full sm:w-1/2">
                                If you don't know your PD, we can measure it from your photo or use a standard measurement (63 mm).
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons under Step 1 form */}
                      <div className="flex flex-col gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleProceedToStep2}
                          className="w-full bg-[#1B3F6E] hover:bg-[#2E6DB4] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow cursor-pointer mt-2"
                        >
                          Proceed with this prescription →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Choose Your Lens Type & Material */}
                  {lensStep === 2 && (
                    <div className="space-y-6 animate-fadeIn text-left">
                      <div className="pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1B3F6E]">Choose Your Lens</h4>
                      </div>

                      {/* Lens Type */}
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B8952A]" />
                          1. Select Lens Type
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {step2LensTypes.map(opt => {
                            const isSelected = selectedLensTypeFlow === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelectedLensTypeFlow(opt.id)}
                                className={`p-4 text-left border rounded-2xl transition-all flex flex-col justify-between cursor-pointer select-none ${isSelected
                                  ? 'border-[#1B3F6E] bg-[#1B3F6E]/5 text-[#1B3F6E] ring-1 ring-[#1B3F6E] shadow-sm'
                                  : 'border-slate-200 hover:border-[#B8952A]/50 bg-white text-[#4A4A6A]'
                                  }`}
                              >
                                <div>
                                  <span className="text-xs font-extrabold block">{opt.name}</span>
                                  <span className="text-[11px] text-slate-400 font-semibold block mt-1 leading-normal">
                                    {opt.desc}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#B8952A] font-extrabold mt-3 block">
                                  {opt.price > 0 ? `+ ₹${opt.price}` : 'Included'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Lens Material */}
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1B3F6E]" />
                          2. Select Lens Material & Index
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {step2Materials.map(opt => {
                            const isSelected = selectedLensMaterial === opt.id;
                            const isRec = opt.id === getRecommendedMaterial();
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelectedLensMaterial(opt.id)}
                                className={`p-4 text-left border rounded-2xl transition-all flex flex-col justify-between cursor-pointer select-none relative ${isSelected
                                  ? 'border-[#1B3F6E] bg-[#1B3F6E]/5 text-[#1B3F6E] ring-1 ring-[#1B3F6E] shadow-sm'
                                  : 'border-slate-200 hover:border-[#B8952A]/50 bg-white text-[#4A4A6A]'
                                  }`}
                              >
                                {isRec && (
                                  <span className="absolute -top-2.5 right-3 bg-[#B8952A] text-white text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-xxs z-10 animate-pulse">
                                    Recommended
                                  </span>
                                )}
                                <div>
                                  <div className="flex justify-between items-baseline gap-2">
                                    <span className="text-xs font-extrabold block">{opt.name}</span>
                                    <span className="text-[11px] text-slate-400 font-bold font-mono">Index {opt.index}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 font-semibold block mt-1 leading-normal">
                                    {opt.desc}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#B8952A] font-extrabold mt-3 block">
                                  {opt.price > 0 ? `+ ₹${opt.price}` : 'Free'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setLensStep(1)}
                          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-[#1B3F6E] py-3.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setLensStep(3)}
                          className="flex-1 bg-[#1B3F6E] hover:bg-[#2E6DB4] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow cursor-pointer"
                        >
                          Choose Coatings →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Choose Lens Features & Coatings */}
                  {lensStep === 3 && (
                    <div className="space-y-6 animate-fadeIn text-left">
                      <div className="pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1B3F6E]">Choose Coatings & Features</h4>
                      </div>

                      {/* Features Toggle grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step3Features.map(opt => {
                          const isChecked = selectedLensFeatures.includes(opt.id);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleFeatureToggle(opt.id)}
                              className={`p-3 text-left border rounded-2xl flex items-center justify-between gap-4 cursor-pointer select-none transition-all ${isChecked
                                ? 'border-[#1B3F6E] bg-[#1B3F6E]/5 text-[#1B3F6E]'
                                : 'border-slate-150 bg-white hover:border-[#B8952A]/50 text-[#4A4A6A]'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-[#1B3F6E] border-[#1B3F6E]' : 'border-slate-300'}`}>
                                  {isChecked && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                                </div>
                                <div>
                                  <span className="text-xs font-extrabold block">{opt.name}</span>
                                  <span className="text-[11px] text-slate-400 font-semibold block leading-tight mt-0.5">{opt.desc}</span>
                                </div>
                              </div>
                              <span className="text-[11px] text-[#B8952A] font-extrabold shrink-0">
                                {opt.price > 0 ? `+ ₹${opt.price}` : 'Free'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Sunglasses Tint section - conditionally displayed */}
                      {(product.category?.toLowerCase() === 'sunglasses' || selectedLensFeatures.includes('tinted')) && (
                        <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-fadeIn text-left">
                          <h5 className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B8952A]" />
                            Select Lens Tint Color
                          </h5>
                          <div className="flex flex-wrap gap-2.5">
                            {tintColors.map(tint => {
                              const isSelected = selectedTint === tint.name;
                              return (
                                <button
                                  key={tint.name}
                                  type="button"
                                  onClick={() => setSelectedTint(tint.name)}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'border-2 border-[#B8952A] scale-110 shadow-sm bg-white' : 'border border-slate-200 hover:border-slate-400 bg-white'
                                    }`}
                                  title={tint.name}
                                >
                                  <span className="w-6.5 h-6.5 rounded-full block border border-black/5" style={tint.style} />
                                </button>
                              );
                            })}
                          </div>

                          {selectedTint && (
                            <div className="pt-3 border-t border-slate-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tint Intensity</span>
                                <span className="text-[11px] font-extrabold text-[#1B3F6E]">
                                  {tintPercentage}% — {getTintLabel(tintPercentage).label}
                                </span>
                              </div>
                              <input
                                type="range"
                                min="10"
                                max="90"
                                step="10"
                                value={tintPercentage}
                                onChange={(e) => setTintPercentage(Number(e.target.value))}
                                className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#B8952A]"
                                style={{
                                  background: `linear-gradient(to right, ${tintColors.find(t => t.name === selectedTint)?.style.background || '#64748B'} ${tintPercentage}%, #E2E8F0 ${tintPercentage}%)`
                                }}
                              />
                              <div className="flex justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                <span>10% Light</span>
                                <span>50% Medium</span>
                                <span>90% Extra Dark</span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium">{getTintLabel(tintPercentage).desc}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Dynamic price breakdown */}
                      <div className="bg-white p-4.5 rounded-2xl border border-slate-155 shadow-sm space-y-3 text-xs font-semibold text-slate-500">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E] pb-1 border-b border-slate-100">
                          Price Breakdown
                        </h4>
                        <div className="flex justify-between">
                          <span>Frame Price:</span>
                          <span className="text-[#1A1A2E] font-extrabold">₹{product.price.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lens Type ({step2LensTypes.find(x => x.id === selectedLensTypeFlow)?.name}):</span>
                          <span className="text-[#1A1A2E] font-extrabold">
                            + ₹{step2LensTypes.find(x => x.id === selectedLensTypeFlow)?.price || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lens Material ({step2Materials.find(x => x.id === selectedLensMaterial)?.name}):</span>
                          <span className="text-[#1A1A2E] font-extrabold">
                            + ₹{step2Materials.find(x => x.id === selectedLensMaterial)?.price || 0}
                          </span>
                        </div>
                        {selectedLensFeatures.length > 0 && (
                          <div className="flex justify-between">
                            <span>Lens Add-ons & Coatings:</span>
                            <span className="text-[#1A1A2E] font-extrabold">
                              + ₹{selectedLensFeatures.reduce((sum, f) => sum + (step3Features.find(x => x.id === f)?.price || 0), 0)}
                            </span>
                          </div>
                        )}
                        <div className="h-px bg-slate-100 my-2"></div>
                        <div className="flex justify-between text-sm font-black text-[#1B3F6E] pt-1">
                          <span>Total Package:</span>
                          <span>₹{calculateBundleTotal().toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Navigation buttons */}
                      <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setLensStep(2)}
                          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-[#1B3F6E] py-3.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setLensStep(4)}
                          className="flex-1 bg-[#1B3F6E] hover:bg-[#2E6DB4] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow cursor-pointer"
                        >
                          Review Config →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Review Configuration & Add */}
                  {lensStep === 4 && (
                    <div className="space-y-6 animate-fadeIn text-left">
                      <div className="pb-2 border-b border-slate-100">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#1B3F6E]">Review Configuration</h4>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-4 font-semibold text-xs text-slate-500">
                        <h4 className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E] pb-2 border-b border-slate-100 flex items-center gap-1.5">
                          <Check className="h-4.5 w-4.5 text-green-600 shrink-0" />
                          <span>Selected Lens Configuration</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] text-slate-400 block uppercase">Right Eye (OD)</span>
                            <span className="text-[#1A1A2E] font-bold block mt-0.5 leading-tight">
                              SPH {rxData.rightSph || '0.00'} | CYL {rxData.rightCyl || '0.00'} {rxData.rightCyl !== '0.00' && `| AXIS ${rxData.rightAxis}°`} {selectedLensTypeFlow === 'progressive' && `| ADD ${rxData.rightAdd}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400 block uppercase">Left Eye (OS)</span>
                            <span className="text-[#1A1A2E] font-bold block mt-0.5 leading-tight">
                              SPH {rxData.leftSph || '0.00'} | CYL {rxData.leftCyl || '0.00'} {rxData.leftCyl !== '0.00' && `| AXIS ${rxData.leftAxis}°`} {selectedLensTypeFlow === 'progressive' && `| ADD ${rxData.leftAdd}`}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                          <div>
                            <span className="text-[11px] text-slate-400 block uppercase">PD (Pupillary Distance)</span>
                            <span className="text-[#1A1A2E] font-bold block mt-0.5 leading-tight">
                              {rxData.pdType === 'single' ? `${rxData.pd || 'Not Entered'} mm` : `R: ${rxData.pdRight || '—'} mm, L: ${rxData.pdLeft || '—'} mm`}
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400 block uppercase">Lens Type</span>
                            <span className="text-[#1A1A2E] font-bold block mt-0.5 leading-tight">
                              {step2LensTypes.find(x => x.id === selectedLensTypeFlow)?.name}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-50">
                          <div>
                            <span className="text-[11px] text-slate-400 block uppercase">Material Option</span>
                            <span className="text-[#1A1A2E] font-bold block mt-0.5 leading-tight">
                              {step2Materials.find(x => x.id === selectedLensMaterial)?.name} (Index {step2Materials.find(x => x.id === selectedLensMaterial)?.index})
                            </span>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400 block uppercase">Features & Tint</span>
                            <span className="text-[#1A1A2E] font-bold block mt-0.5 leading-tight">
                              {selectedLensFeatures.length > 0
                                ? selectedLensFeatures.map(f => step3Features.find(x => x.id === f)?.name).join(', ')
                                : 'Standard features'}
                              {selectedTint ? ` (${selectedTint} Tint)` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="h-px bg-slate-100 my-2"></div>

                        <div className="flex justify-between text-sm font-black text-[#1B3F6E] pt-1">
                          <span>Lens Add-on Surcharge:</span>
                          <span>+ ₹{lensAddOnTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Stepper controls */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setLensStep(1)}
                          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-[#1B3F6E] py-4 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          ← Edit Configuration
                        </button>
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="flex-1 bg-[#1B3F6E] hover:bg-[#2E6DB4] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow cursor-pointer"
                        >
                          Add to Cart with this lens →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Fallback Section for other options like blue-light */
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#B8952A] shadow-sm shrink-0">
                      <Upload className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-wider">Prescription Required</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Upload a photo of your doctor's rx prescription card</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-2xl border border-slate-200 hover:border-[#B8952A]/50 transition-all cursor-pointer group shadow-sm text-center">
                      <FileText className="h-8 w-8 text-slate-300 group-hover:text-[#B8952A] transition-colors mb-2" />
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1B3F6E] block mb-1">
                        Select File
                      </span>
                      <span className="text-[11px] text-slate-400 font-semibold">PDF, JPEG, or PNG up to 5MB</span>
                      <input type="file" onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                    </label>

                    {uploadedFile && (
                      <div className="bg-[#B8952A]/10 border border-[#B8952A]/30 p-3.5 rounded-xl flex items-center justify-between text-xs font-bold text-[#B8952A] animate-fadeIn">
                        <div className="flex items-center gap-2 min-w-0">
                          <Check className="h-4 w-4 shrink-0" />
                          <span className="truncate">{uploadedFile.name}</span>
                        </div>
                        <span className="text-[11px] shrink-0 text-slate-400">({uploadedFile.size})</span>
                      </div>
                    )}

                    {/* Collapsible Manual Entry Form */}
                    <div className="mt-2 border-t border-slate-200/60 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowManualRx(!showManualRx)}
                        className="w-full flex justify-between items-center py-2.5 px-4 bg-white rounded-xl border border-slate-200 text-xs font-bold text-[#1B3F6E] hover:border-[#B8952A]/50 transition-all select-none cursor-pointer"
                      >
                        <span>Or Enter Manually</span>
                        <span className="text-[#B8952A] font-extrabold">{showManualRx ? '− Hide Details' : '+ Fill Form'}</span>
                      </button>

                      {showManualRx && (
                        <div className="mt-4 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-fadeIn text-left">
                          {/* Right Eye (OD) */}
                          <div>
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E] mb-2 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B8952A]" />
                              <span>Right Eye (OD)</span>
                            </h5>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">SPH</label>
                                <input
                                  type="text"
                                  value={prescriptionData.rightSph}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, rightSph: e.target.value })}
                                  placeholder="e.g. -1.00"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">CYL</label>
                                <input
                                  type="text"
                                  value={prescriptionData.rightCyl}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, rightCyl: e.target.value })}
                                  placeholder="e.g. -0.50"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">AXIS</label>
                                <input
                                  type="text"
                                  value={prescriptionData.rightAxis}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, rightAxis: e.target.value })}
                                  placeholder="e.g. 180"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">ADD</label>
                                <input
                                  type="text"
                                  value={prescriptionData.rightAdd}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, rightAdd: e.target.value })}
                                  placeholder="e.g. +1.50"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">PRISM</label>
                                <input
                                  type="text"
                                  value={prescriptionData.rightPrism}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, rightPrism: e.target.value })}
                                  placeholder="e.g. 0.5"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Left Eye (OS) */}
                          <div className="pt-2 border-t border-slate-100">
                            <h5 className="text-[11px] font-black uppercase tracking-wider text-[#1B3F6E] mb-2 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1B3F6E]" />
                              <span>Left Eye (OS)</span>
                            </h5>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">SPH</label>
                                <input
                                  type="text"
                                  value={prescriptionData.leftSph}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, leftSph: e.target.value })}
                                  placeholder="e.g. -1.25"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">CYL</label>
                                <input
                                  type="text"
                                  value={prescriptionData.leftCyl}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, leftCyl: e.target.value })}
                                  placeholder="e.g. -0.50"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">AXIS</label>
                                <input
                                  type="text"
                                  value={prescriptionData.leftAxis}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, leftAxis: e.target.value })}
                                  placeholder="e.g. 175"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">ADD</label>
                                <input
                                  type="text"
                                  value={prescriptionData.leftAdd}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, leftAdd: e.target.value })}
                                  placeholder="e.g. +1.50"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">PRISM</label>
                                <input
                                  type="text"
                                  value={prescriptionData.leftPrism}
                                  onChange={(e) => setPrescriptionData({ ...prescriptionData, leftPrism: e.target.value })}
                                  placeholder="e.g. 0.5"
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* PD and Date */}
                          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-left">
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">PD (Pupillary Distance)</label>
                              <input
                                type="text"
                                value={prescriptionData.pd}
                                onChange={(e) => setPrescriptionData({ ...prescriptionData, pd: e.target.value })}
                                placeholder="e.g. 64mm"
                                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">Prescription Date</label>
                              <input
                                type="date"
                                value={prescriptionData.prescriptionDate}
                                onChange={(e) => setPrescriptionData({ ...prescriptionData, prescriptionDate: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                              />
                            </div>
                          </div>

                          {/* Doctor Name */}
                          <div className="pt-2 text-left">
                            <label className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">Doctor Name</label>
                            <input
                              type="text"
                              value={prescriptionData.doctorName}
                              onChange={(e) => setPrescriptionData({ ...prescriptionData, doctorName: e.target.value })}
                              placeholder="e.g. Dr. Jane Smith"
                              className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#B8952A]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 text-center italic mt-1 leading-normal select-none">
                      Your prescription is encrypted and used only for lens customization.
                    </p>
                  </div>
                </>
              )}

            </div>
          )}

          {/* Upsells / Frequently Bought Together Section */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-xs font-extrabold text-[#1B3F6E] uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#B8952A] shrink-0" />
              <span>Frequently Bought Together</span>
            </h3>

            <div className="space-y-3">
              {upsells.map((item) => {
                const base = product ? (product.price + getActiveLensPrice()) * quantity : 0;
                const isFree = item.id === '6a3c5d6e7f8a9b0c1d2e3f4b' && base >= 3000;
                const priceToShow = isFree ? 0 : item.price;
                const noteText = isFree ? 'FREE on orders above ₹3,000' : `Add for only + ₹${item.price}`;

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleUpsell(item.id)}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all hover:bg-slate-50 select-none ${item.checked ? 'border-[#B8952A] bg-amber-50/15 shadow-sm' : 'border-slate-100 bg-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.checked ? 'bg-[#B8952A] border-[#B8952A]' : 'border-slate-300'
                        }`}>
                        {item.checked && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                      </div>
                      <img src={item.image} alt={item.name} loading="lazy" className="h-11 w-11 object-contain rounded-xl bg-slate-50 p-1 shrink-0 border border-slate-100" />
                      <div>
                        <h4 className="text-[11.5px] font-extrabold text-[#1A1A2E] leading-tight">{item.name}</h4>
                        <span className="text-[11px] text-slate-400 font-semibold mt-0.5 block">{noteText}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#1B3F6E] shrink-0">
                      {priceToShow === 0 ? 'FREE' : `₹${priceToShow}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stepper, CTA & Trust Badges */}
          <div className="border-t border-slate-100 pt-6 space-y-5">
            {product.tryOnAssets?.frontPng && (
              <button
                onClick={() => setIsTryOnOpen(true)}
                className="w-full border-2 border-[#B8952A] hover:bg-[#B8952A]/5 text-[#B8952A] font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2.5 cursor-pointer shadow-sm transition-all active:scale-[0.98] mt-1"
              >
                <Camera className="h-4.5 w-4.5 text-[#B8952A]" />
                <span>Virtual 3D Try-On</span>
              </button>
            )}
            <div className="flex gap-4 items-center">

              {/* Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-white select-none overflow-hidden shadow-sm shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-3 font-bold text-slate-400 hover:bg-slate-50 hover:text-[#1B3F6E] transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-3 font-bold text-xs text-[#1A1A2E]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-3 font-bold text-slate-400 hover:bg-slate-50 hover:text-[#1B3F6E] transition-colors"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 items-center w-full flex-grow">
                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`border-2 border-[#1B3F6E] hover:bg-[#1B3F6E]/5 text-[#1B3F6E] font-black text-sm uppercase tracking-widest py-5.5 rounded-2xl flex-1 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-[0.98] shadow-sm ${addedToCart ? 'bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-50' : ''}`}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>{addedToCart ? '✓ Added!' : 'Add To Cart'}</span>
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="bg-[#B8952A] hover:bg-amber-600 hover:shadow-lg text-white font-black text-sm uppercase tracking-widest py-5.5 rounded-2xl flex-1 flex items-center justify-center gap-2.5 cursor-pointer shadow-md transition-all active:scale-[0.98]"
                >
                  <ArrowRight className="h-5 w-5 animate-pulse" />
                  <span>Buy Now · ₹{calculateBundleTotal().toLocaleString('en-IN')}</span>
                </button>
              </div>
            </div>

            {/* Premium features checklist */}
            <div className="grid grid-cols-1 gap-2.5 pt-2 select-none">
              {benefitsList.map((benefit, i) => (
                <div key={i} className="flex gap-2.5 items-start text-xs font-semibold text-[#4A4A6A]">
                  <div className="h-4 w-4 rounded-full bg-[#1B3F6E]/10 text-[#1B3F6E] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>



        </div>
      </div>

      {/* Customer Reviews Section */}
      <section id="customer-reviews-section" className="mt-20 pt-16 border-t border-slate-100 select-none text-left">
        <div className="flex items-center gap-2 mb-10">
          <div className="bg-[#B8952A]/10 p-2 rounded-xl text-[#B8952A]">
            <Star className="h-4.5 w-4.5 fill-[#B8952A] text-[#B8952A]" />
          </div>
          <div>
            <span className="text-[#B8952A] text-[11px] font-extrabold uppercase tracking-widest block leading-none">Patron Feedback</span>
            <h2 className="text-xl font-extrabold text-[#1B3F6E] mt-0.5 tracking-tight">Customer Reviews</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Overall Stats & Write Review Form (Takes 5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs text-[#1B3F6E] uppercase tracking-widest">Review Summary</h3>
              <div className="flex items-center gap-6">
                <div className="text-center shrink-0">
                  <span className="text-4xl font-extrabold text-[#1B3F6E]">{averageRating}</span>
                  <span className="text-sm font-semibold text-slate-400">/5</span>
                  <div className="flex text-[#B8952A] gap-0.5 justify-center mt-1 select-none">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(Number(averageRating)) ? 'fill-[#B8952A] text-[#B8952A]' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold block mt-1.5 uppercase tracking-wide">{totalReviewsCount} Verified Reviews</span>
                </div>
                <div className="flex-1 space-y-1.5">
                  {ratingDistribution.map((dist) => (
                    <div key={dist.stars} className="flex items-center gap-2 text-[11px] font-bold text-[#4A4A6A]">
                      <span className="w-3">{dist.stars}⭐</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#B8952A] rounded-full" style={{ width: `${dist.pct}%` }}></div>
                      </div>
                      <span className="w-8 text-right text-slate-400">{dist.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Write a Review Button and Form */}
            <div className="space-y-4">
              <button
                onClick={() => setShowWriteReview(!showWriteReview)}
                className="w-full py-4 px-6 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-200 hover:border-[#B8952A]/50 text-xs font-extrabold uppercase tracking-widest text-[#1B3F6E] rounded-2xl shadow-sm transition-all select-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{showWriteReview ? 'Close Review Form' : 'Write A Review'}</span>
              </button>

              {showWriteReview && (
                <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4 animate-fadeIn">
                  {reviewPending ? (
                    <div className="text-center py-8 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                        <Check className="h-6 w-6 stroke-[3]" />
                      </div>
                      <h4 className="text-sm font-extrabold text-[#1B3F6E]">Thank you!</h4>
                      <p className="text-xs text-slate-400 font-medium">Your review is pending approval and will be visible shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.guestName}
                          onChange={(e) => setReviewForm({ ...reviewForm, guestName: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B8952A]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Rating</label>
                        <div className="flex gap-1 select-none">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className="text-[#B8952A] hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star className={`h-6 w-6 ${star <= reviewForm.rating ? 'fill-[#B8952A] text-[#B8952A]' : 'text-slate-250'}`} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Review Title</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          placeholder="Summarize your experience"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B8952A]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Review Details</label>
                        <textarea
                          required
                          rows="4"
                          value={reviewForm.body}
                          onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                          placeholder="What did you like or dislike about this premium frame?"
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B8952A] resize-none"
                        ></textarea>
                      </div>

                      <div>
                        <label className="text-[11px] font-extrabold text-slate-400 uppercase block mb-1">Upload Photos (Optional)</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleReviewPhotosUpload}
                          disabled={reviewPhotosUploading}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#B8952A] bg-slate-50 cursor-pointer"
                        />
                        {reviewPhotosUploading && <span className="text-[11px] text-slate-400 block mt-1 animate-pulse">Uploading photos...</span>}
                      </div>

                      {reviewForm.reviewImages.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {reviewForm.reviewImages.map((img, idx) => (
                            <div key={idx} className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-xxs">
                              <img src={img} alt="upload preview" loading="lazy" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={reviewPhotosUploading}
                        className="w-full py-3 bg-[#1B3F6E] hover:bg-navy-dark text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow cursor-pointer transition-all active:scale-[0.98]"
                      >
                        Submit Review
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reviews List Feed (Takes 7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            {reviewsList.length > 0 ? (
              reviewsList.map((review) => (
                <div key={review._id} className="bg-white rounded-[24px] p-6 border border-slate-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-3.5 text-left">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex text-[#B8952A] gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-[#B8952A] text-[#B8952A]' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 font-bold">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-black text-navy-dark">
                      {review.guestName}
                      <span className="ml-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-extrabold uppercase tracking-wider">
                        Verified Buyer
                      </span>
                    </p>
                    {review.title && <h4 className="text-xs font-black text-navy-dark italic mt-1">"{review.title}"</h4>}
                    <p className="text-xs text-[#4A4A6A] leading-relaxed font-semibold mt-1">
                      {review.body}
                    </p>
                  </div>

                  {review.reviewImages && review.reviewImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-2">
                      {review.reviewImages.map((img, index) => (
                        <div key={index} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-zoom-in hover:scale-102 transition-transform shadow-xxs">
                          <img src={img} alt={`${review.guestName} uploaded photo`} loading="lazy" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[24px] p-12 text-center border border-slate-100 shadow-sm text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                No reviews yet. Be the first to share your experience with this premium frame!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cleaning Kits Add-On Section */}
      {cleaningKits.filter(k => k._id !== product?._id).length > 0 && (
        <div className="mt-12 border-t border-slate-100 pt-10">
          <h3 className="text-lg font-serif font-light text-navy-dark mb-1">Complete Your Order</h3>
          <p className="text-xs text-slate-500 mb-6">Keep your new frames spotless with a cleaning kit.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cleaningKits.filter(k => k._id !== product?._id).map((kit) => (
              <div key={kit._id} className="border border-slate-200 rounded-2xl p-3 flex flex-col gap-2 hover:border-gold-accent transition-colors bg-white">
                <img src={kit.image} alt={kit.name} className="w-full aspect-square object-contain bg-slate-50 rounded-xl" />
                <p className="text-xs font-bold text-navy-dark line-clamp-2">{kit.name}</p>
                <p className="text-sm font-extrabold text-gold-accent">₹{kit.price}</p>
                <button
                  type="button"
                  onClick={() => {
                    addToCart({
                      _id: kit._id,
                      name: kit.name,
                      price: kit.price,
                      image: kit.image,
                      category: kit.category || 'Cleaning Kits'
                    }, 1, {
                      color: 'Default Standard',
                      size: 'One Size'
                    });
                    toast.success(`Added ${kit.name} to your cart!`);
                  }}
                  className="mt-auto w-full py-2 bg-navy-dark hover:bg-gold-accent hover:text-navy-dark text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Products / Slider Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-20 pt-16 border-t border-slate-100 select-none">
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-[#B8952A]/10 p-2 rounded-xl text-[#B8952A]">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-[#B8952A] text-[11px] font-extrabold uppercase tracking-widest block leading-none">Curated Choices</span>
              <h2 className="text-xl font-extrabold text-[#1B3F6E] mt-0.5 tracking-tight">Patrons Also Viewed</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.slice(0, 4).map((rel) => (
              <ProductCard key={rel.id || rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Action Dock */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-150 py-3.5 px-4 md:hidden flex flex-col gap-2.5 shadow-[0_-8px_30px_rgba(15,39,68,0.06)] animate-fadeIn select-none">
        <div className="flex justify-between items-center select-none">
          <div className="flex items-center gap-2.5">
            <img src={selectedImage} alt={product.name} loading="lazy" className="h-9 w-9 object-contain rounded-lg bg-slate-50 p-1 shrink-0 border border-slate-100" />
            <div className="min-w-0">
              <h4 className="text-[11px] font-bold text-[#1A1A2E] truncate w-28 leading-none">{product.name}</h4>
              <span className="text-[11px] text-slate-400 block mt-1 leading-none">{selectedColor} · {lensOptions.find(l => l.id === lensType)?.name}</span>
            </div>
          </div>
          <span className="text-xs font-black text-[#1B3F6E]">₹{calculateBundleTotal().toLocaleString('en-IN')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={handleAddToCart}
            disabled={addedToCart}
            className={`border-2 border-[#1B3F6E] hover:bg-[#1B3F6E]/5 text-[#1B3F6E] font-black text-xs uppercase tracking-widest py-4.5 rounded-2xl active:scale-95 transition-all cursor-pointer shadow-sm ${addedToCart ? 'bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-50' : ''}`}
          >
            {addedToCart ? '✓ Added!' : 'Add To Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            className="bg-[#B8952A] hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest py-4.5 rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Virtual Try-On AR Modal Overlay */}
      {isTryOnOpen && product.tryOnAssets?.frontPng && (
        <VirtualTryOn
          frontPng={product.tryOnAssets.frontPng}
          anglePng={product.tryOnAssets.anglePng}
          frameWidthMm={product.tryOnAssets.frameWidthMm}
          productName={product.name}
          onClose={() => setIsTryOnOpen(false)}
        />
      )}

      {/* Premium Sharing Dialog Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none">
          {/* Backdrop Blur */}
          <div 
            onClick={() => setShareModalOpen(false)}
            className="absolute inset-0 bg-[#0F2744]/40 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
          />
          
          {/* Share Card */}
          <div className="relative bg-white w-full max-w-sm rounded-[32px] border border-slate-100 shadow-luxury p-8 animate-scaleIn z-10 space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[#B8952A] text-xxs font-extrabold uppercase tracking-widest block leading-none">Share Frame</span>
                <h3 className="text-xl font-extrabold text-[#0F2744] mt-0.5 tracking-tight">Recommend Style</h3>
              </div>
              <button 
                onClick={() => setShareModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Product Card Preview (Extremely High Fidelity!) */}
            <div className="flex items-center gap-4 bg-slate-50/70 border border-slate-100 p-4 rounded-2xl select-none">
              <img 
                src={selectedImage || (product.images && product.images[0])} 
                alt={product.name} 
                className="h-14 w-14 object-contain bg-white rounded-lg border border-slate-150 p-1 shrink-0" 
              />
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-800 truncate leading-tight">{product.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{product.brand} · {product.category}</p>
                <span className="text-xs font-extrabold text-[#1B3F6E] block mt-1">₹{product.price.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Quick Share Apps Row */}
            <div className="grid grid-cols-4 gap-4 text-center">
              {/* WhatsApp */}
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(product.name + ' - ' + product.description + '\nCheck it out here: ' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="h-11 w-11 rounded-full bg-[#E8F8F0] text-[#25D366] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-[#25D366]/10">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.736.001-2.599-1.013-5.045-2.853-6.887C16.64 2.14 14.194 1.12 11.597 1.12c-5.441 0-9.866 4.372-9.87 9.739 0 1.712.47 3.382 1.36 4.867l-1.006 3.676 3.966-.998z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors">WhatsApp</span>
              </a>

              {/* Telegram */}
              <a 
                href={`https://telegram.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name + ' - ' + product.description)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="h-11 w-11 rounded-full bg-[#E5F2FC] text-[#0088cc] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-[#0088cc]/10">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.6 1.5-1.55 2.76-2.92 2.87-3.37.02-.1-.02-.17-.12-.17-.1 0-.25.04-.37.07-1.12.75-2.73 1.83-3.79 2.55-.42.29-.8.43-1.15.42-.39 0-1.15-.22-1.7-.4-.69-.23-1.23-.35-1.18-.74.03-.2.3-.4.81-.6 3.14-1.37 5.24-2.28 6.3-2.73 3-.12 3.62.84 3.63.95.02.16-.01.52-.08.97z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Telegram</span>
              </a>

              {/* Facebook */}
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <div className="h-11 w-11 rounded-full bg-[#E8EDF8] text-[#1877F2] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-[#1877F2]/10">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Facebook</span>
              </a>

              {/* Copy Action */}
              <button 
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('Product link copied!');
                  } catch {
                    const textarea = document.createElement('textarea');
                    textarea.value = window.location.href;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    toast.success('Product link copied!');
                  }
                  setShareModalOpen(false);
                }}
                className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
              >
                <div className="h-11 w-11 rounded-full bg-[#FAF5E6] text-[#B8952A] flex items-center justify-center transition-all group-hover:scale-110 shadow-sm border border-[#B8952A]/10">
                  <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Copy Link</span>
              </button>
            </div>

            {/* Input URL Copy bar */}
            <div className="flex gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
              <input 
                type="text" 
                readOnly 
                value={window.location.href} 
                className="w-full bg-transparent text-xxs font-mono text-slate-500 border-none outline-none select-all font-semibold pl-1.5"
              />
              <button 
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast.success('Product link copied!');
                  } catch {
                    const textarea = document.createElement('textarea');
                    textarea.value = window.location.href;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    toast.success('Product link copied!');
                  }
                  setShareModalOpen(false);
                }}
                className="bg-[#1B3F6E] hover:bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-widest px-4.5 py-2.5 rounded-xl transition-colors shrink-0 shadow-sm active:scale-95 cursor-pointer"
              >
                Copy
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
};

export default ProductDetail;
