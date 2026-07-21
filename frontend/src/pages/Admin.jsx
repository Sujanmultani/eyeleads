import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CouponManagementPanel from '../components/CouponManagementPanel';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Plus,
  Edit2,
  Scale,
  Trash2,
  CheckCircle,
  Truck,
  Eye,
  FileText,
  AlertCircle,
  X,
  Filter,
  DollarSign,
  ChevronRight,
  User,
  ShieldAlert,
  Loader,
  Search,
  Settings,
  CreditCard,
  MapPin,
  Phone,
  Clock,
  Mail,
  Calendar,
  MessageSquare,
  Star,
  Bell,
  Copy,
  Check,
  RotateCcw,
  Tag
} from 'lucide-react';

const Admin = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const [activeTab, setActiveTab] = useState('analytics');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewDeleteConfirmId, setReviewDeleteConfirmId] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [inquiryDeleteConfirmId, setInquiryDeleteConfirmId] = useState(null);

  // Return requests states
  const [returnRequests, setReturnRequests] = useState([]);
  const [selectedReturnRequest, setSelectedReturnRequest] = useState(null);
  const [isManualReversePickupModalOpen, setIsManualReversePickupModalOpen] = useState(false);
  const [manualReversePickupForm, setManualReversePickupForm] = useState({ courierName: '', awbCode: '', trackingUrl: '' });
  const [returnFilter, setReturnFilter] = useState('all');
  const [adminNoteText, setAdminNoteText] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [selectedReturnImage, setSelectedReturnImage] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Order filter state
  const [orderFilter, setOrderFilter] = useState('all');

  // Copy state for refund ID
  const [copiedText, setCopiedText] = useState('');
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'EyeLeads Luxury Eyewear',
    supportEmail: 'eyeleadscare@gmail.com',
    opticianFee: 500,
    blueCutPremium: 750,
    activeAIModel: 'Claude 3.5 Sonnet',
    allowGuestCheckout: true,
    promoBannerText: 'Complimentary Express Insured Pan-India Shipping on all orders!',
    warrantyText: '1-Year Warranty',
    heroLeftProductId: 'prod-1',
    heroLeftLabel: 'Signature',
    heroLeftTitle: 'The Navigator Elite',
    heroLeftPrice: '₹3,499',
    heroLeftBadge: 'Try-On',
    heroLeftImage: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&auto=format&fit=crop&q=80',
    heroRightProductId: 'prod-14',
    heroRightTitle: 'Zephyr Round',
    heroRightSubtext: 'Titanium Series',
    heroRightPrice: '₹7,499',
    heroRightImage: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=200&auto=format&fit=crop&q=80',
    lensTypes: [
      { id: 'single-vision', name: 'Single Vision', price: 0, desc: 'For distance or reading' },
      { id: 'bifocal', name: 'Bifocal', price: 500, desc: 'Two powers in one lens' },
      { id: 'progressive', name: 'Progressive', price: 1500, desc: 'No-line multifocal' }
    ],
    lensMaterials: [
      { id: 'cr39', name: 'CR-39 Plastic', index: '1.56', price: 0, desc: 'Low powers (below ±2)' },
      { id: 'polycarbonate', name: 'Polycarbonate', index: '1.59', price: 300, desc: 'Kids & sports, impact resistant' },
      { id: 'hi167', name: 'High-Index', index: '1.67', price: 600, desc: 'Medium powers (±2 to ±4)' },
      { id: 'hi174', name: 'High-Index', index: '1.74', price: 1200, desc: 'High powers (above ±4)' },
      { id: 'trivex', name: 'Trivex', index: '—', price: 900, desc: 'Lightest & thinnest' }
    ],
    lensFeatures: [
      { id: 'blue-cut', name: 'Blue Cut', price: 400, desc: 'Blocks blue light from screens' },
      { id: 'photochromic', name: 'Photochromic / Transitions', price: 800, desc: 'Darkens in sunlight' },
      { id: 'polarized', name: 'Polarized', price: 600, desc: 'Reduces glare, ideal for driving' },
      { id: 'uv400', name: 'UV400 Protection', price: 0, desc: 'Blocks 100% UV rays' },
      { id: 'anti-glare', name: 'Anti-Glare / AR Coat', price: 200, desc: 'Reduces reflections' },
      { id: 'scratch-resistant', name: 'Scratch Resistant', price: 0, desc: 'Hard coat protection' },
      { id: 'anti-fog', name: 'Anti-Fog', price: 300, desc: 'Prevents fogging' }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search filter states
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSubTab, setProductSubTab] = useState('frames');

  // CRUD & Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isRxViewOpen, setIsRxViewOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [isUserRxModalOpen, setIsUserRxModalOpen] = useState(false);
  const [userRxLoading, setUserRxLoading] = useState(false);
  const [viewedUser, setViewedUser] = useState(null);
  const [userRxData, setUserRxData] = useState(null);
  const [userRxAdminNote, setUserRxAdminNote] = useState('');
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  const [prescriptionFilter, setPrescriptionFilter] = useState('all');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [courierOptions, setCourierOptions] = useState([]);
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [courierLoadingOrderId, setCourierLoadingOrderId] = useState(null);
  const [isManualShipModalOpen, setIsManualShipModalOpen] = useState(false);
  const [manualShipForm, setManualShipForm] = useState({ courierName: '', awbCode: '', trackingUrl: '' });
  const [isBulkWeightEditMode, setIsBulkWeightEditMode] = useState(false);
  const [bulkWeights, setBulkWeights] = useState({});
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const [dragActive, setDragActive] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [leftDragActive, setLeftDragActive] = useState(false);
  const [leftUploading, setLeftUploading] = useState(false);
  const [rightDragActive, setRightDragActive] = useState(false);
  const [rightUploading, setRightUploading] = useState(false);
  const [productVideoUploading, setProductVideoUploading] = useState(false);
  const [productVideoDragActive, setProductVideoDragActive] = useState(false);

  // Temporary form states for adding dynamic options
  const [newTypeForm, setNewTypeForm] = useState({ name: '', price: 0, desc: '' });
  const [newMatForm, setNewMatForm] = useState({ name: '', index: '', price: 0, desc: '' });
  const [newFeatForm, setNewFeatForm] = useState({ name: '', price: 0, desc: '' });

  const [editingLensTypeId, setEditingLensTypeId] = useState(null);
  const [editingLensMaterialId, setEditingLensMaterialId] = useState(null);
  const [editingLensFeatureId, setEditingLensFeatureId] = useState(null);

  const startEditLensType = (type) => {
    setEditingLensTypeId(type.id);
    setNewTypeForm({
      name: type.name,
      price: type.price,
      desc: type.desc || ''
    });
  };

  const cancelEditLensType = () => {
    setEditingLensTypeId(null);
    setNewTypeForm({ name: '', price: 0, desc: '' });
  };

  const startEditLensMaterial = (mat) => {
    setEditingLensMaterialId(mat.id);
    setNewMatForm({
      name: mat.name,
      index: mat.index || '',
      price: mat.price,
      desc: mat.desc || ''
    });
  };

  const cancelEditLensMaterial = () => {
    setEditingLensMaterialId(null);
    setNewMatForm({ name: '', index: '', price: 0, desc: '' });
  };

  const startEditLensFeature = (feat) => {
    setEditingLensFeatureId(feat.id);
    setNewFeatForm({
      name: feat.name,
      price: feat.price,
      desc: feat.desc || ''
    });
  };

  const cancelEditLensFeature = () => {
    setEditingLensFeatureId(null);
    setNewFeatForm({ name: '', price: 0, desc: '' });
  };

  const handleAddLensType = (e) => {
    e.preventDefault();
    if (!newTypeForm.name.trim()) return;

    if (editingLensTypeId) {
      setStoreSettings(prev => ({
        ...prev,
        lensTypes: (prev.lensTypes || []).map(item =>
          item.id === editingLensTypeId
            ? { ...item, name: newTypeForm.name.trim(), price: Number(newTypeForm.price) || 0, desc: newTypeForm.desc.trim() }
            : item
        )
      }));
      setEditingLensTypeId(null);
      setNewTypeForm({ name: '', price: 0, desc: '' });
      toast.success(`Lens type updated!`);
    } else {
      const newType = {
        id: newTypeForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
        name: newTypeForm.name.trim(),
        price: Number(newTypeForm.price) || 0,
        desc: newTypeForm.desc.trim()
      };
      setStoreSettings(prev => ({
        ...prev,
        lensTypes: [...(prev.lensTypes || []), newType]
      }));
      setNewTypeForm({ name: '', price: 0, desc: '' });
      toast.success(`Lens type "${newType.name}" added to list!`);
    }
  };

  const handleRemoveLensType = (id) => {
    setStoreSettings(prev => ({
      ...prev,
      lensTypes: (prev.lensTypes || []).filter(item => item.id !== id)
    }));
    toast.success(`Lens type removed.`);
  };

  const handleAddLensMaterial = (e) => {
    e.preventDefault();
    if (!newMatForm.name.trim()) return;

    if (editingLensMaterialId) {
      setStoreSettings(prev => ({
        ...prev,
        lensMaterials: (prev.lensMaterials || []).map(item =>
          item.id === editingLensMaterialId
            ? { ...item, name: newMatForm.name.trim(), index: newMatForm.index.trim(), price: Number(newMatForm.price) || 0, desc: newMatForm.desc.trim() }
            : item
        )
      }));
      setEditingLensMaterialId(null);
      setNewMatForm({ name: '', index: '', price: 0, desc: '' });
      toast.success(`Lens material updated!`);
    } else {
      const newMat = {
        id: newMatForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
        name: newMatForm.name.trim(),
        index: newMatForm.index.trim(),
        price: Number(newMatForm.price) || 0,
        desc: newMatForm.desc.trim()
      };
      setStoreSettings(prev => ({
        ...prev,
        lensMaterials: [...(prev.lensMaterials || []), newMat]
      }));
      setNewMatForm({ name: '', index: '', price: 0, desc: '' });
      toast.success(`Lens material "${newMat.name}" added to list!`);
    }
  };

  const handleRemoveLensMaterial = (id) => {
    setStoreSettings(prev => ({
      ...prev,
      lensMaterials: (prev.lensMaterials || []).filter(item => item.id !== id)
    }));
    toast.success(`Lens material removed.`);
  };

  const handleAddLensFeature = (e) => {
    e.preventDefault();
    if (!newFeatForm.name.trim()) return;

    if (editingLensFeatureId) {
      setStoreSettings(prev => ({
        ...prev,
        lensFeatures: (prev.lensFeatures || []).map(item =>
          item.id === editingLensFeatureId
            ? { ...item, name: newFeatForm.name.trim(), price: Number(newFeatForm.price) || 0, desc: newFeatForm.desc.trim() }
            : item
        )
      }));
      setEditingLensFeatureId(null);
      setNewFeatForm({ name: '', price: 0, desc: '' });
      toast.success(`Lens feature updated!`);
    } else {
      const newFeat = {
        id: newFeatForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
        name: newFeatForm.name.trim(),
        price: Number(newFeatForm.price) || 0,
        desc: newFeatForm.desc.trim()
      };
      setStoreSettings(prev => ({
        ...prev,
        lensFeatures: [...(prev.lensFeatures || []), newFeat]
      }));
      setNewFeatForm({ name: '', price: 0, desc: '' });
      toast.success(`Lens feature "${newFeat.name}" added to list!`);
    }
  };

  const handleRemoveLensFeature = (id) => {
    setStoreSettings(prev => ({
      ...prev,
      lensFeatures: (prev.lensFeatures || []).filter(item => item.id !== id)
    }));
    toast.success(`Lens feature removed.`);
  };

  // Form States
  const [productForm, setProductForm] = useState({
    name: '',
    brand: 'EyeLeads Premium',
    category: 'Sunglasses',
    frameShape: 'Square',
    material: 'Acetate',
    gender: 'Unisex',
    colors: ['Black'],
    price: 2999,
    mrp: 3999,
    rating: 4.5,
    reviews: 12,
    badges: [],
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80'],
    prescriptionAvailable: true,
    inStockOnly: true,
    onSale: false,
    discount: 0,
    weightGrams: 250,
    warranty: '1-Year Warranty',
    isCleaningKit: false,
    videoUrl: '',
    videoThumbnail: '',
    tryOnAssets: {
      frontPng: '',
      anglePng: '',
      frameWidthMm: 138
    }
  });

  // Auto-calculate productForm price based on mrp and discount when onSale changes
  useEffect(() => {
    if (productForm.onSale && productForm.discount > 0) {
      const discounted = Math.round(productForm.mrp * (1 - productForm.discount / 100));
      if (productForm.price !== discounted) {
        setProductForm(prev => ({ ...prev, price: discounted }));
      }
    } else if (!productForm.onSale && productForm.discount !== 0) {
      setProductForm(prev => ({ ...prev, discount: 0 }));
    }
  }, [productForm.onSale, productForm.mrp, productForm.discount]);

  // Access check
  useEffect(() => {
    if (authLoading) return; // Wait for authentication details to load from context

    // Synchronous local fallback to resolve React async state updates race condition
    let localUser = null;
    try {
      const savedMock = localStorage.getItem('mockUser');
      if (savedMock) localUser = JSON.parse(savedMock);
    } catch (e) { }

    const currentUser = user || localUser;
    const userEmail = currentUser?.email ? currentUser.email.trim().toLowerCase() : '';
    const hasAdminAccess = currentUser?.isAdmin || userEmail === 'admin@eyeleads.com';

    if (!currentUser || !hasAdminAccess) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Load products & orders from backend
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.allSettled([
        api.get('/api/products'),           // 0
        api.get('/api/orders'),             // 1
        api.get('/api/auth/users'),         // 2
        api.get('/api/audit-logs'),         // 3
        api.get('/api/settings'),           // 4
        api.get('/api/reviews/admin/all'),  // 5
        api.get('/api/contact/admin/all'),  // 6
        api.get('/api/notifications'),      // 7
        api.get('/api/returns'),            // 8
        api.get('/api/prescriptions')       // 9
      ]);

      // Check for critical request failures (indices 0 to 4)
      const criticalFailures = results.slice(0, 5).filter(r => r.status === 'rejected');
      if (criticalFailures.length > 0) {
        throw criticalFailures[0].reason;
      }

      // 1. Fetch Products
      const productsRes = results[0].value;
      setProducts(productsRes.data.products || productsRes.data || []);

      // 2. Fetch Orders
      const ordersRes = results[1].value;
      setOrders(ordersRes.data.orders || ordersRes.data || []);

      // 3. Fetch Users
      const usersRes = results[2].value;
      setUsers(usersRes.data.users || usersRes.data || []);

      // 4. Fetch Audit Logs
      const logsRes = results[3].value;
      setAuditLogs(logsRes.data.logs || logsRes.data || []);

      // 5. Fetch Store Settings
      const settingsRes = results[4].value;
      if (settingsRes.data && settingsRes.data.settings) {
        setStoreSettings(settingsRes.data.settings);
      }

      // 6. Fetch Reviews
      const reviewsResult = results[5];
      if (reviewsResult.status === 'fulfilled') {
        const reviewsRes = reviewsResult.value;
        setReviews(reviewsRes.data.reviews || reviewsRes.data || []);
      } else {
        console.warn('Admin reviews load error:', reviewsResult.reason);
        setReviews([]);
      }

      // 7. Fetch Stylist Inquiries
      const inquiriesResult = results[6];
      if (inquiriesResult.status === 'fulfilled') {
        const inquiriesRes = inquiriesResult.value;
        setInquiries(inquiriesRes.data.inquiries || inquiriesRes.data || []);
      } else {
        console.warn('Admin inquiries load error:', inquiriesResult.reason);
        setInquiries([]);
      }

      // 8. Fetch Admin In-App Notifications
      const notificationsResult = results[7];
      if (notificationsResult.status === 'fulfilled') {
        const notifRes = notificationsResult.value;
        setNotifications(notifRes.data.notifications || []);
        setUnreadCount(notifRes.data.unreadCount || 0);
      } else {
        console.warn('Admin notifications load error:', notificationsResult.reason);
      }

      // 9. Fetch Return Requests
      const returnsResult = results[8];
      if (returnsResult.status === 'fulfilled') {
        const returnsRes = returnsResult.value;
        setReturnRequests(returnsRes.data || []);
      } else {
        console.warn('Admin returns load error:', returnsResult.reason);
        setReturnRequests([]);
      }

      // 10. Fetch Prescription Review Queue
      const prescriptionsResult = results[9];
      if (prescriptionsResult.status === 'fulfilled') {
        const rxListRes = prescriptionsResult.value;
        setAllPrescriptions(rxListRes.data?.prescriptions || []);
      } else {
        console.warn('Admin prescriptions load error:', prescriptionsResult.reason);
        setAllPrescriptions([]);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Unable to reach backend servers. Administration desk offline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // FIXED: Admin panel loads with hardcoded default settings (doesn't fetch live settings)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/api/settings');
        if (res.data && res.data.settings) {
          setStoreSettings(prev => ({ ...prev, ...res.data.settings }));
        } else if (res.data) {
          setStoreSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.error('Could not load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  // Drag & Drop Image Upload handlers
  const handleDragGeneric = (e, setDragActiveState) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveState(true);
    } else if (e.type === "dragleave") {
      setDragActiveState(false);
    }
  };

  const handleDrag = (e) => handleDragGeneric(e, setDragActive);

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadProductFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await uploadProductFiles(e.target.files);
    }
  };

  const uploadProductFiles = async (files) => {
    setImageUploading(true);
    const formData = new FormData();

    // Append files under the key "images"
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const response = await api.post("/api/upload/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const uploadedUrls = response.data.urls || [];

      if (uploadedUrls.length > 0) {
        // Clear out single-element placeholder (e.g. Unsplash images) so uploaded images become primary immediately
        const defaultPlaceholder = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80';
        const currentImages = Array.isArray(productForm.images) ? productForm.images : [productForm.image].filter(Boolean);
        const isOnlyPlaceholder = currentImages.length === 1 && (
          currentImages[0] === defaultPlaceholder ||
          currentImages[0].includes('unsplash.com')
        );

        const existingImages = isOnlyPlaceholder ? [] : currentImages;
        const combinedImages = [...existingImages, ...uploadedUrls].slice(0, 5);

        setProductForm(prev => ({
          ...prev,
          images: combinedImages,
          image: combinedImages[0] // Primary image URL is the first uploaded image
        }));

        toast.success(`Successfully uploaded ${uploadedUrls.length} frame image(s)!`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || 'Failed to upload images. Please check your connection.');
    } finally {
      setImageUploading(false);
    }
  };

  const uploadProductVideo = async (file) => {
    setProductVideoUploading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await api.post("/api/upload/video", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const uploadedUrl = response.data.url;
      if (uploadedUrl) {
        setProductForm(prev => ({
          ...prev,
          videoUrl: uploadedUrl
        }));
        toast.success("Successfully uploaded product video!");
      }
    } catch (err) {
      console.error("Product video upload error:", err);
      toast.error(err.response?.data?.message || 'Failed to upload product video. Please check your connection.');
    } finally {
      setProductVideoUploading(false);
    }
  };

  const [tryOnUploading, setTryOnUploading] = useState({ front: false, angle: false });

  const uploadTryOnAsset = async (file, type) => {
    setTryOnUploading(prev => ({ ...prev, [type]: true }));
    const formData = new FormData();
    formData.append("images", file);

    try {
      const response = await api.post("/api/upload/products/tryon", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const uploadedUrls = response.data.urls || [];
      if (uploadedUrls.length > 0) {
        setProductForm(prev => ({
          ...prev,
          tryOnAssets: {
            ...prev.tryOnAssets,
            [type === 'front' ? 'frontPng' : 'anglePng']: uploadedUrls[0]
          }
        }));
        toast.success(`Successfully uploaded Try-On ${type === 'front' ? 'Front' : 'Angled'} asset!`);
      }
    } catch (err) {
      console.error("Try-On upload error:", err);
      toast.error(err.response?.data?.message || `Failed to upload ${type} image.`);
    } finally {
      setTryOnUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleProductVideoDrag = (e) => handleDragGeneric(e, setProductVideoDragActive);

  const handleProductVideoDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setProductVideoDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadProductVideo(e.dataTransfer.files[0]);
    }
  };

  const uploadHeroImage = async (files, side) => {
    const isLeft = side === 'left';
    const setUploading = isLeft ? setLeftUploading : setRightUploading;

    setUploading(true);
    const formData = new FormData();
    formData.append("images", files[0]);

    try {
      const response = await api.post("/api/upload/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      const uploadedUrls = response.data.urls || [];
      if (uploadedUrls.length > 0) {
        setStoreSettings(prev => ({
          ...prev,
          [isLeft ? 'heroLeftImage' : 'heroRightImage']: uploadedUrls[0]
        }));
        toast.success(`Successfully uploaded hero popup image!`);
      }
    } catch (err) {
      console.error("Hero upload error:", err);
      toast.error(err.response?.data?.message || 'Failed to upload hero image. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const handleLeftDrag = (e) => handleDragGeneric(e, setLeftDragActive);

  const handleLeftDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLeftDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadHeroImage(e.dataTransfer.files, 'left');
    }
  };

  const handleRightDrag = (e) => handleDragGeneric(e, setRightDragActive);

  const handleRightDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setRightDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadHeroImage(e.dataTransfer.files, 'right');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedImages = productForm.images.filter((_, idx) => idx !== indexToRemove);
    setProductForm(prev => ({
      ...prev,
      images: updatedImages,
      image: updatedImages.length > 0 ? updatedImages[0] : ''
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/products', productForm);
      setProducts([response.data.product, ...products]);
      setIsAddModalOpen(false);
      resetProductForm();
      toast.success('Product created successfully!');
    } catch (err) {
      console.error('Error creating product:', err);
      toast.error(err.response?.data?.message || 'Failed to create product. Please check your connection.');
    }
  };

  // CRUD: Edit Product (Trigger Drawer)
  const openEditDrawer = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      brand: product.brand || 'EyeLeads Premium',
      category: product.category,
      frameShape: product.frameShape,
      material: product.material,
      gender: product.gender,
      colors: Array.isArray(product.colors) ? product.colors : [product.colors || 'Black'],
      price: product.price,
      mrp: product.mrp,
      rating: product.rating || 4.5,
      reviews: product.reviews || 8,
      badges: product.badges || [],
      image: product.image,
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80'],
      prescriptionAvailable: product.prescriptionAvailable ?? true,
      inStockOnly: product.inStockOnly ?? true,
      onSale: product.onSale ?? false,
      discount: product.discount || 0,
      weightGrams: product.weightGrams ?? 250,
      warranty: product.warranty || '1-Year Warranty',
      isCleaningKit: product.isCleaningKit ?? false,
      videoUrl: product.videoUrl || '',
      videoThumbnail: product.videoThumbnail || '',
      tryOnAssets: {
        frontPng: product.tryOnAssets?.frontPng || '',
        anglePng: product.tryOnAssets?.anglePng || '',
        frameWidthMm: product.tryOnAssets?.frameWidthMm || 138
      }
    });
    setIsEditDrawerOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/products/${selectedProduct._id}`, productForm);
      setProducts(products.map(p => p._id === selectedProduct._id ? response.data.product : p));
      setIsEditDrawerOpen(false);
      setSelectedProduct(null);
      resetProductForm();
      toast.success('Product updated successfully!');
    } catch (err) {
      console.error('Error updating product:', err);
      toast.error(err.response?.data?.message || 'Failed to update product. Please check your connection.');
    }
  };

  const enableBulkWeightEdit = () => {
    const initialWeights = {};
    products.forEach((p) => {
      initialWeights[p._id] = p.weightGrams ?? 250;
    });
    setBulkWeights(initialWeights);
    setIsBulkWeightEditMode(true);
  };

  const handleBulkWeightSave = async () => {
    setIsBulkSaving(true);
    try {
      const updates = Object.keys(bulkWeights).map((id) => ({
        id,
        weightGrams: Number(bulkWeights[id]) || 250
      }));
      await api.put('/api/products/bulk-weight', { updates });
      setProducts(products.map((p) => {
        if (bulkWeights[p._id] !== undefined) {
          return { ...p, weightGrams: Number(bulkWeights[p._id]) };
        }
        return p;
      }));
      toast.success('All product shipping weights updated successfully!');
      setIsBulkWeightEditMode(false);
    } catch (err) {
      console.error('Error saving bulk weights:', err);
      toast.error(err.response?.data?.message || 'Failed to bulk update weights.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  // CRUD: Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to remove this premium frame from public catalogs?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted successfully.');
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(err.response?.data?.message || 'Failed to delete product. Please check your connection.');
    }
  };

  // Notification Handlers
  const fetchNotificationsOnly = async () => {
    try {
      const notifRes = await api.get('/api/notifications');
      setNotifications(notifRes.data.notifications || []);
      setUnreadCount(notifRes.data.unreadCount || 0);
    } catch (err) {
      console.warn('Silent polling notifications error:', err);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchNotificationsOnly();
      const interval = setInterval(fetchNotificationsOnly, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkNotifAsRead = async (notifId) => {
    try {
      await api.put(`/api/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllNotifsAsRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notifId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/api/notifications/${notifId}`);
      const targetNotif = notifications.find(n => n._id === notifId);
      if (targetNotif && !targetNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(n => n._id !== notifId));
      toast.success('Notification deleted successfully.');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification.');
    }
  };

  const handleNotificationClick = async (notif) => {
    setIsNotifOpen(false);
    if (!notif.isRead) {
      await handleMarkNotifAsRead(notif._id);
    }
    
    const orderId = notif.order?._id || notif.order;

    if (notif.type === 'prescription_updated') {
      setActiveTab('prescription-review');
      const notifUserId = notif.user?._id || notif.user;
      const matchedUser = users.find(u => u._id === notifUserId) || notif.user;
      if (matchedUser) {
        handleViewUserPrescription(matchedUser);
      }
      return;
    }

    if (notif.type === 'return_requested') {
      setActiveTab('returns');
      const matchedReturn = returnRequests.find(r => 
        (r.order?._id === orderId || r.order === orderId)
      );
      if (matchedReturn) {
        setSelectedReturnRequest(matchedReturn);
        setAdminNoteText(matchedReturn.adminNote || '');
        setTrackingNumberInput(matchedReturn.replacementTrackingNumber || '');
        setIsReturnModalOpen(true);
      } else {
        try {
          const returnsRes = await api.get('/api/returns');
          const freshReturns = returnsRes.data || [];
          setReturnRequests(freshReturns);
          const freshReturn = freshReturns.find(r => 
            (r.order?._id === orderId || r.order === orderId)
          );
          if (freshReturn) {
            setSelectedReturnRequest(freshReturn);
            setAdminNoteText(freshReturn.adminNote || '');
            setTrackingNumberInput(freshReturn.replacementTrackingNumber || '');
            setIsReturnModalOpen(true);
          }
        } catch (err) {
          console.error('Error fetching return requests on deep link:', err);
        }
      }
    } else {
      const matchedOrder = orders.find(o => o._id === orderId);
      setActiveTab('orders');
      if (matchedOrder) {
        setSelectedOrder(matchedOrder);
        setIsOrderModalOpen(true);
      } else {
        try {
          const response = await api.get(`/api/orders/${orderId}`);
          const singleOrder = response.data.order || response.data;
          setSelectedOrder(singleOrder);
          setIsOrderModalOpen(true);
        } catch (err) {
          console.error('Error fetching deep-linked order:', err);
          toast.error('Could not find the target order.');
        }
      }
    }
  };

  const handleMarkRefundProcessed = async (orderId) => {
    if (!window.confirm('Are you sure you want to mark this refund as processed for bookkeeping?')) return;
    try {
      const response = await api.put(`/api/orders/${orderId}/refund`);
      toast.success('Refund successfully marked as processed.');
      
      if (response.data && response.data.order) {
        setSelectedOrder(response.data.order);
      } else {
        setSelectedOrder(prev => ({
          ...prev,
          isRefunded: true,
          refundedAt: new Date(),
          refundedBy: user?.email || 'admin@eyeleads.com'
        }));
      }

      setOrders(orders.map(o => o._id === orderId ? {
        ...o,
        isRefunded: true,
        refundedAt: new Date(),
        refundedBy: user?.email || 'admin@eyeleads.com'
      } : o));

      const logsRes = await api.get('/api/audit-logs').catch(() => null);
      if (logsRes) setAuditLogs(logsRes.data.logs || logsRes.data);
    } catch (err) {
      console.error('Error marking refund as processed:', err);
      toast.error(err.response?.data?.message || 'Failed to mark refund as processed.');
    }
  };

  // Order Fulfillment: Deliver Package
  const handleMarkAsDelivered = async (orderId, notes = null) => {
    try {
      const { data } = await api.put(`/api/orders/${orderId}/deliver`, { notes });
      setOrders(orders.map(o => o._id === orderId ? data.order : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data.order);
      }
      toast.success('Order status marked as Delivered! Confirmation email dispatched to customer.');
      setDeliveryNotes('');
    } catch (err) {
      console.error('Error marking order as delivered:', err);
      toast.error(err.response?.data?.message || 'Failed to mark order as delivered. Please check your connection.');
    }
  };

  const handleRetryShiprocketOrder = async (orderId) => {
    try {
      const { data } = await api.post(`/api/orders/${orderId}/retry-shiprocket-order`);
      setOrders(orders.map((o) => (o._id === orderId ? data.order : o)));
      toast.success('Shiprocket order created — you can now click Ready to Ship.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create Shiprocket order.');
    }
  };

  // Open the courier comparison modal for a domestic order (fetches live rates)
  const handleOpenCourierOptions = async (order) => {
    setSelectedOrder(order);
    setCourierLoadingOrderId(order._id);
    try {
      const { data } = await api.get(`/api/orders/${order._id}/courier-options`);
      setCourierOptions(data.couriers || []);
      setIsCourierModalOpen(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch courier options.');
    } finally {
      setCourierLoadingOrderId(null);
    }
  };

  // Admin picks a courier from the comparison list → assigns AWB + schedules pickup
  const handleReadyToShip = async (courierId) => {
    try {
      const { data } = await api.put(`/api/orders/${selectedOrder._id}/ready-to-ship`, { courierId });
      setOrders(orders.map((o) => (o._id === selectedOrder._id ? data.order : o)));
      toast.success('Order marked Ready to Ship — pickup scheduled!');
      setIsCourierModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule pickup.');
    }
  };

  // International orders: admin manually submits courier/AWB/tracking
  const handleManualShipSubmit = async () => {
    if (!manualShipForm.courierName || !manualShipForm.awbCode) {
      toast.error('Courier name and AWB code are required.');
      return;
    }
    try {
      const { data } = await api.put(`/api/orders/${selectedOrder._id}/manual-shipping`, manualShipForm);
      setOrders(orders.map((o) => (o._id === selectedOrder._id ? data.order : o)));
      toast.success('International shipment details saved!');
      setIsManualShipModalOpen(false);
      setManualShipForm({ courierName: '', awbCode: '', trackingUrl: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shipping details.');
    }
  };

  // International returns: admin manually submits reverse pickup courier/AWB/tracking
  const handleManualReversePickupSubmit = async () => {
    if (!manualReversePickupForm.courierName || !manualReversePickupForm.awbCode) {
      toast.error('Courier name and AWB code are required.');
      return;
    }
    try {
      const { data } = await api.put(
        `/api/returns/${selectedReturnRequest._id}/manual-reverse-pickup`,
        manualReversePickupForm
      );
      setSelectedReturnRequest((prev) => ({ ...prev, order: data.order }));
      toast.success('Return pickup details saved!');
      setIsManualReversePickupModalOpen(false);
      setManualReversePickupForm({ courierName: '', awbCode: '', trackingUrl: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save return pickup details.');
    }
  };

  const renderOrderFulfillmentActions = (order) => {
    if (order.isCancelled) {
      return (
        <div className="flex items-center justify-end gap-1.5 text-rose-600 font-extrabold text-[10px] uppercase tracking-wider select-none pr-2 shrink-0">
          <X className="h-4 w-4" />
          <span>Cancelled</span>
        </div>
      );
    }

    if (order.isDelivered) {
      return (
        <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider select-none pr-2 shrink-0">
          <CheckCircle className="h-4 w-4" />
          <span>Delivered</span>
        </div>
      );
    }

    if (order.deliveryMethod === 'local_hand_delivery') {
      return (
        <button
          type="button"
          onClick={() => handleMarkAsDelivered(order._id, deliveryNotes)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xxs transition-all active-scale-premium shrink-0"
        >
          <CheckCircle className="h-3 w-3" />
          <span>Mark as Delivered</span>
        </button>
      );
    }

    if (order.isInternational) {
      if (order.manualShipping?.awbCode) {
        return (
          <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider select-none pr-2 shrink-0">
            <CheckCircle className="h-4 w-4" />
            <span>Shipped Manually</span>
          </div>
        );
      } else {
        return (
          <button
            onClick={() => {
              setSelectedOrder(order);
              setIsManualShipModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xxs transition-all active-scale-premium shrink-0"
          >
            <Truck className="h-3 w-3" />
            <span>Enter Shipping Info</span>
          </button>
        );
      }
    }

    // Domestic Shiprocket Order
    if (order.shiprocket?.awbCode) {
      return (
        <div className="flex items-center justify-end gap-1.5 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider select-none pr-2 shrink-0">
          <CheckCircle className="h-4 w-4" />
          <span>{order.deliveryStatus || 'Processing'}</span>
        </div>
      );
    }

    if (!order.shiprocket?.shipmentId) {
      return (
        <button
          onClick={() => handleRetryShiprocketOrder(order._id)}
          className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Truck className="h-3 w-3" />
          <span>Retry Shiprocket Order</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => handleOpenCourierOptions(order)}
        disabled={courierLoadingOrderId === order._id}
        className="px-3.5 py-2 rounded-xl bg-gold-accent hover:bg-amber-600 text-navy-dark hover:text-white text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xxs transition-all active-scale-premium shrink-0 disabled:opacity-50"
      >
        <Truck className="h-3 w-3" />
        <span>{courierLoadingOrderId === order._id ? 'Loading...' : 'Ready to Ship'}</span>
      </button>
    );
  };

  // Optician Prescription Review & Medical Verification
  const handleVerifyPrescription = async (orderId, verificationStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/verify-rx`, { status: verificationStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, prescriptionStatus: verificationStatus } : o));
      toast.success(`Prescription status successfully updated to: ${verificationStatus}`);
      setIsRxViewOpen(false);
      setSelectedRx(null);
      // Reload audit logs to show update in real-time
      const logsRes = await api.get('/api/audit-logs').catch(() => null);
      if (logsRes) setAuditLogs(logsRes.data.logs || logsRes.data);
    } catch (err) {
      console.error('Error verifying prescription:', err);
      toast.error(err.response?.data?.message || 'Failed to verify prescription. Please check your connection.');
    }
  };

  const handleUpdateReturnStatus = async (requestId, newStatus, trackingNum) => {
    try {
      const payload = { 
        status: newStatus,
        adminNote: adminNoteText
      };
      if (trackingNum !== undefined) {
        payload.replacementTrackingNumber = trackingNum;
      }
      
      const response = await api.put(`/api/returns/${requestId}/status`, payload);
      toast.success(`Return request status updated to: ${newStatus}`);
      
      setReturnRequests(prev => prev.map(r => r._id === requestId ? { ...r, ...response.data } : r));
      setSelectedReturnRequest(response.data);
      
      setAdminNoteText('');
      setTrackingNumberInput('');
      
      const logsRes = await api.get('/api/audit-logs').catch(() => null);
      if (logsRes) setAuditLogs(logsRes.data.logs || logsRes.data);
    } catch (err) {
      console.error('Error updating return status:', err);
      toast.error(err.response?.data?.message || 'Failed to update return request status.');
    }
  };

  // User Management actions
  const handleToggleUserRole = async (userId, currentIsAdmin) => {
    try {
      const targetIsAdmin = !currentIsAdmin;
      await api.put(`/api/auth/users/${userId}/role`, { isAdmin: targetIsAdmin });
      setUsers(users.map(u => u._id === userId ? { ...u, isAdmin: targetIsAdmin, role: targetIsAdmin ? 'Admin' : 'Customer' } : u));
      toast.success(`User privileges successfully updated!`);
      // Reload audit logs to show update in real-time
      const logsRes = await api.get('/api/audit-logs').catch(() => null);
      if (logsRes) setAuditLogs(logsRes.data.logs || logsRes.data);
    } catch (err) {
      console.error('Error toggling user role:', err);
      toast.error(err.response?.data?.message || 'Failed to toggle user role. Please check your connection.');
    }
  };

  const handleToggleUserSuspension = async (userId, currentSuspension) => {
    try {
      const targetSuspension = !currentSuspension;
      await api.put(`/api/auth/users/${userId}/suspend`, { isSuspended: targetSuspension });
      setUsers(users.map(u => u._id === userId ? { ...u, isSuspended: targetSuspension } : u));
      toast.success(`User account state successfully transitioned!`);
      const logsRes = await api.get('/api/audit-logs').catch(() => null);
      if (logsRes) setAuditLogs(logsRes.data.logs || logsRes.data);
    } catch (err) {
      console.error('Error toggling user suspension:', err);
      toast.error(err.response?.data?.message || 'Failed to update user suspension status. Please check your connection.');
    }
  };

  const handleViewUserPrescription = async (user) => {
    setViewedUser(user);
    setIsUserRxModalOpen(true);
    setUserRxLoading(true);
    setUserRxData(null);
    setUserRxAdminNote('');
    try {
      const res = await api.get(`/api/prescriptions/user/${user._id}`);
      setUserRxData(res.data?.prescription || null);
      setUserRxAdminNote(res.data?.prescription?.adminNote || '');
    } catch (err) {
      console.error('Error fetching user prescription:', err);
      toast.error('Failed to load prescription profile.');
    } finally {
      setUserRxLoading(false);
    }
  };

  const handleUpdateUserPrescriptionStatus = async (status) => {
    if (!viewedUser) return;
    try {
      const res = await api.put(`/api/prescriptions/user/${viewedUser._id}`, {
        adminNote: userRxAdminNote,
        verificationStatus: status
      });
      setUserRxData(res.data?.prescription || null);
      setAllPrescriptions(prev => {
        const updated = res.data?.prescription;
        if (!updated) return prev;
        const exists = prev.some(p => p.user?._id === viewedUser._id || p.user === viewedUser._id);
        if (exists) {
          return prev.map(p => (p.user?._id === viewedUser._id || p.user === viewedUser._id)
            ? { ...p, ...updated, user: p.user }
            : p);
        }
        return [{ ...updated, user: viewedUser }, ...prev];
      });
      toast.success(`Prescription marked as ${status}.`);
    } catch (err) {
      console.error('Error updating prescription status:', err);
      toast.error(err.response?.data?.message || 'Failed to update prescription status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to permanently purge this customer account?')) return;
    try {
      await api.delete(`/api/auth/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User account purged successfully.');
      const logsRes = await api.get('/api/audit-logs').catch(() => null);
      if (logsRes) setAuditLogs(logsRes.data.logs || logsRes.data);
    } catch (err) {
      console.error('Error purging user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user account. Please check your connection.');
    }
  };

  const handleUpdateStoreSettings = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/api/settings', storeSettings);
      setStoreSettings(response.data.settings);
      toast.success('Global configuration properties successfully updated and synced!');
      const logsRes = await api.get('/api/audit-logs').catch(() => null);
      if (logsRes) setAuditLogs(logsRes.data.logs || logsRes.data);
    } catch (err) {
      console.error('Error updating store settings:', err);
      toast.error(err.response?.data?.message || 'Failed to update store settings. Please check your connection.');
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await api.put(`/api/reviews/admin/${reviewId}/approve`);
      setReviews(reviews.map(r => r._id === reviewId ? { ...r, approved: true } : r));
      toast.success('Review approved successfully! It is now visible on the storefront.');
    } catch (err) {
      console.error('Error approving review:', err);
      toast.error(err.response?.data?.message || 'Failed to approve review. Please check your connection.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.delete(`/api/reviews/admin/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
      toast.success('Review deleted successfully.');
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error(err.response?.data?.message || 'Failed to delete review. Please check your connection.');
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    try {
      await api.delete(`/api/contact/admin/${inquiryId}`);
      setInquiries(inquiries.filter(i => i._id !== inquiryId));
      toast.success('Stylist inquiry deleted successfully.');
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      toast.error(err.response?.data?.message || 'Failed to delete inquiry. Please check your connection.');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      brand: 'EyeLeads Premium',
      category: 'Sunglasses',
      frameShape: 'Square',
      material: 'Acetate',
      gender: 'Unisex',
      colors: ['Black'],
      price: 2999,
      mrp: 3999,
      rating: 4.5,
      reviews: 12,
      badges: [],
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80',
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80'],
      prescriptionAvailable: true,
      inStockOnly: true,
      onSale: false,
      discount: 0,
      weightGrams: 250,
      warranty: '1-Year Warranty',
      videoUrl: '',
      videoThumbnail: '',
      tryOnAssets: {
        frontPng: '',
        anglePng: '',
        frameWidthMm: 138
      }
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400 bg-[#FAF9F6] w-full">
        <Loader className="h-8 w-8 animate-spin text-gold-accent" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#B8952A]">Verifying Admin Credentials...</p>
      </div>
    );
  }

  // Calculation Metrics for Analytics
  const totalRevenue = orders.filter(o => o.isPaid).reduce((acc, curr) => acc + curr.totalPrice, 0);
  const averageOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const inStockCount = products.filter(p => p.inStockOnly).length;

  const getBadgeCount = (tabId) => {
    if (!notifications || !Array.isArray(notifications)) return 0;
    
    if (tabId === 'orders') {
      return notifications.filter(n => !n.isRead && ['order_placed', 'order_cancelled', 'order_modified'].includes(n.type)).length;
    }
    if (tabId === 'returns') {
      return notifications.filter(n => !n.isRead && n.type === 'return_requested').length;
    }
    if (tabId === 'reviews') {
      return (reviews || []).filter(r => !r.approved).length;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-text-primary flex flex-col lg:flex-row relative overflow-hidden">

      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold-accent/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-navy-primary/5 rounded-full blur-[120px] -z-10"></div>

      {/* Side Control Dock */}
      <aside className="w-full lg:w-72 bg-navy-dark text-white p-8 flex flex-col justify-between shrink-0 border-r border-[#B8952A]/20 select-none z-10 shadow-lg">
        <div className="space-y-10">
          <div>
            <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-[0.3em] block">EyeLeads Portals</span>
            <h2 className="text-2xl font-light font-serif tracking-tight mt-1">Admin Suite</h2>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { id: 'analytics', label: 'Analytics Dashboard', icon: TrendingUp },
              { id: 'products', label: 'Product Catalog', icon: Package },
              { id: 'orders', label: 'Orders & Receipts', icon: ShoppingBag },
              { id: 'returns', label: 'Return Requests', icon: RotateCcw },
              { id: 'prescription-review', label: 'Prescription Review', icon: Eye },
              { id: 'users', label: 'User Accounts', icon: Users },
              { id: 'reviews', label: 'Customer Reviews', icon: MessageSquare },
              { id: 'inquiries', label: 'Stylist Inquiries', icon: Mail },
              { id: 'audit-logs', label: 'System Audit Trails', icon: ShieldAlert },
              { id: 'settings', label: 'Store Configurations', icon: Settings },
              { id: 'prescription', label: 'Prescription Config', icon: FileText },
              { id: 'coupons', label: 'Coupon Management', icon: Tag }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const badgeCount = getBadgeCount(tab.id);

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError('');
                  }}
                  className={`w-full flex items-center justify-between px-4.5 py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest text-left cursor-pointer transition-all duration-300 ${isActive
                      ? 'bg-gold-accent text-navy-dark shadow-[0_4px_16px_rgba(184,149,42,0.35)]'
                      : 'hover:bg-white/5 text-slate-300 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className="h-4.5 w-4.5 stroke-[2]" />
                    <span>{tab.label}</span>
                  </div>
                  {badgeCount > 0 && (
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded-full transition-all duration-300 shadow-sm ${isActive
                        ? 'bg-navy-dark text-gold-accent'
                        : 'bg-red-500 text-white animate-pulse'
                      }`}>
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="h-8 w-8 rounded-full bg-gold-accent/25 flex items-center justify-center text-gold-accent">
              <User className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-white">Administrator</p>
              <p className="text-[9px] text-slate-400 font-bold truncate max-w-[150px]">{user?.email || 'admin@eyeleads.com'}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => navigate('/')}
              className="w-full text-center py-2.5 rounded-lg border border-white/10 hover:border-white/30 text-white text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-colors"
            >
              Exit Suite
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-center py-2.5 rounded-lg bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500/50 text-red-200 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Primary Workspace Panel */}
      <main className="flex-grow p-6 sm:p-10 z-10 overflow-y-auto max-h-screen">
        {loading ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
              <div className="space-y-2">
                {/* Storefront Intelligence badge */}
                <div className="h-3 w-32 skeleton-shimmer rounded"></div>
                {/* Active tab Manager heading */}
                <div className="h-8 w-48 skeleton-shimmer rounded-lg"></div>
              </div>
              <div className="flex items-center gap-3.5">
                {/* Notification Bell placeholder */}
                <div className="h-10 w-10 skeleton-shimmer rounded-xl"></div>
                {/* Refresh Data button placeholder */}
                <div className="h-10 w-28 skeleton-shimmer rounded-xl"></div>
              </div>
            </div>

            {/* Stats Cards Skeleton (4 cards) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-between">
                  <div className="space-y-3 w-2/3">
                    {/* Stat Label */}
                    <div className="h-3 w-16 skeleton-shimmer rounded"></div>
                    {/* Stat Value */}
                    <div className="h-6 w-24 skeleton-shimmer rounded-md"></div>
                  </div>
                  {/* Stat Icon container */}
                  <div className="h-12 w-12 rounded-2xl skeleton-shimmer shrink-0"></div>
                </div>
              ))}
            </div>

            {/* Subsections Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Recent Purchases (7 columns) */}
              <div className="lg:col-span-7 bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  {/* Title */}
                  <div className="h-4 w-32 skeleton-shimmer rounded"></div>
                  {/* View All */}
                  <div className="h-3 w-16 skeleton-shimmer rounded"></div>
                </div>

                <div className="divide-y divide-slate-100">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="py-4.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="space-y-2 w-1/2">
                        {/* Order ID */}
                        <div className="h-3 w-20 skeleton-shimmer rounded"></div>
                        {/* Order Items */}
                        <div className="h-4 w-full skeleton-shimmer rounded"></div>
                      </div>
                      <div className="text-right space-y-2 flex flex-col items-end">
                        {/* Price */}
                        <div className="h-4 w-16 skeleton-shimmer rounded"></div>
                        {/* Status badge */}
                        <div className="h-4 w-12 skeleton-shimmer rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Security Alerts (5 columns) */}
              <div className="lg:col-span-5 bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  {/* Title */}
                  <div className="h-4 w-28 skeleton-shimmer rounded"></div>
                </div>

                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      {/* Icon */}
                      <div className="h-8 w-8 rounded-xl skeleton-shimmer shrink-0"></div>
                      <div className="space-y-2 flex-grow">
                        {/* Alert title */}
                        <div className="h-3 w-1/2 skeleton-shimmer rounded"></div>
                        {/* Alert description line 1 */}
                        <div className="h-2.5 w-full skeleton-shimmer rounded"></div>
                        {/* Alert description line 2 */}
                        <div className="h-2.5 w-3/4 skeleton-shimmer rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">

            {/* Top context header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
              <div>
                <span className="text-gold-accent text-[9.5px] font-extrabold uppercase tracking-[0.25em] block">Storefront Intelligence</span>
                <h1 className="text-3xl font-light text-navy-dark font-serif capitalize">{activeTab} Manager</h1>
              </div>
              <div className="flex items-center gap-3.5 relative self-end sm:self-auto">
                {/* Notification Bell Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="h-10 w-10 border border-slate-200 hover:border-gold-accent rounded-xl flex items-center justify-center bg-white shadow-xxs cursor-pointer transition-all active-scale-premium relative text-navy-primary"
                    title="In-App Activity Notifications"
                  >
                    <Bell className="h-4.5 w-4.5 stroke-[2.5]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-600 border border-white text-[9px] font-black text-white flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl border border-slate-100 shadow-luxury z-50 p-4 space-y-3.5 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-navy-dark">Administrative Alerts</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllNotifsAsRead}
                            className="text-[9px] font-extrabold uppercase tracking-wider text-[#B8952A] hover:underline cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`py-3 px-2 flex items-start justify-between gap-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${
                                !notif.isRead ? 'bg-amber-50/20 font-bold' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${
                                  !notif.isRead ? 'bg-[#B8952A]' : 'bg-transparent'
                                }`} />
                                <div className="space-y-1 text-left">
                                  <span className={`text-[8.5px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${
                                    notif.type === 'order_cancelled' ? 'bg-red-50 text-red-600 border border-red-100/50' : 
                                    notif.type === 'return_requested' ? 'bg-amber-50 text-[#B8952A] border border-amber-100/50' :
                                    notif.type === 'order_placed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' :
                                    'bg-blue-50 text-blue-600 border border-blue-100/50'
                                  }`}>
                                    {notif.type === 'order_cancelled' ? 'Cancelled' : 
                                     notif.type === 'return_requested' ? 'Return' :
                                     notif.type === 'order_placed' ? 'Purchased' : 'Modified'}
                                  </span>
                                  <p className="text-xxs text-[#4A4A6A] font-semibold leading-relaxed mt-1">
                                    {notif.message}
                                  </p>
                                  <span className="text-[8.5px] text-slate-400 font-medium block">
                                    {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNotification(notif._id);
                                }}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 transition-all self-center shrink-0 cursor-pointer"
                                title="Delete Notification"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                            No recent alerts logged
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={loadData}
                  className="px-4 py-2 border border-slate-200 hover:border-gold-accent rounded-xl text-xxs font-extrabold uppercase tracking-widest text-text-muted hover:text-navy-primary bg-white shadow-xxs cursor-pointer transition-all active-scale-premium"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* TAB CONTENT: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-10">
                {/* 4 Overview Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Gross Revenue', val: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
                    { label: 'Sales Receipts', val: orders.length, icon: ShoppingBag, color: 'text-navy-primary bg-blue-50' },
                    { label: 'Active Catalog Items', val: products.length, icon: Package, color: 'text-gold-accent bg-amber-50' },
                    { label: 'Optics In Stock', val: `${inStockCount} Frames`, icon: Users, color: 'text-purple-600 bg-purple-50' }
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center justify-between group hover:scale-[1.01] transition-transform duration-300">
                        <div className="space-y-2">
                          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">{stat.label}</span>
                          <p className="text-2xl font-extrabold text-navy-dark tracking-tight leading-none">{stat.val}</p>
                        </div>
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stat.color} shadow-sm`}>
                          <Icon className="h-5.5 w-5.5 stroke-[2]" />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subsections: Recent Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* Left Column: Recent Orders (Takes 7 columns) */}
                  <div className="lg:col-span-7 bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <h3 className="font-extrabold text-navy-dark text-xs uppercase tracking-wider">Recent Purchases</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-xxs uppercase font-extrabold tracking-widest text-gold-accent hover:underline flex items-center gap-1">
                        <span>View All</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {orders.slice(0, 4).map((order, i) => (
                        <div key={i} className="py-4.5 flex items-center justify-between first:pt-0 last:pb-0">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{order._id.substring(0, 14)}...</span>
                            <p className="text-xs font-extrabold text-navy-dark max-w-[200px] truncate">
                              {order.orderItems.map(item => item.name).join(', ')}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <p className="text-xs font-black text-navy-dark">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider ${order.isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                              {order.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: AI & Prescription Activity Feed (Takes 5 columns) */}
                  <div className="lg:col-span-5 bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="font-extrabold text-navy-dark text-xs uppercase tracking-wider">Security Alerts</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="h-8 w-8 rounded-xl bg-gold-accent/15 flex items-center justify-center text-gold-accent shrink-0">
                          <TrendingUp className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold text-navy-dark">Catalog Upgraded to 18 Products</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Vite environment successfully seeded and synched to client collections. Fallbacks initialized.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="h-8 w-8 rounded-xl bg-navy-primary/10 flex items-center justify-center text-navy-primary shrink-0">
                          <CheckCircle className="h-4.5 w-4.5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold text-navy-dark">Secure UPI Pipelines Setup</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Razorpay simulated payment endpoints synched on port 5000 with visual success confirmation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB CONTENT: PRODUCT CATALOG */}
            {activeTab === 'products' && (
              <div className="space-y-6">

                {/* Search & Add Action row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative w-full max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search frame by title, category, shape..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-full pl-10 pr-4 py-2.5 text-xs bg-white text-text-primary placeholder-slate-400 font-bold shadow-xxs"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isBulkWeightEditMode ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsBulkWeightEditMode(false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xxs uppercase tracking-widest py-3 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xxs active-scale-premium"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkWeightSave}
                          disabled={isBulkSaving}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xxs uppercase tracking-widest py-3 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active-scale-premium disabled:opacity-50"
                        >
                          {isBulkSaving ? 'Saving...' : 'Save Weights'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={enableBulkWeightEdit}
                          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-navy-dark font-extrabold text-xxs uppercase tracking-widest py-3 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xxs active-scale-premium"
                        >
                          <Scale className="h-4 w-4 text-[#B8952A]" />
                          <span>Bulk Edit Weights</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(true)}
                          className="bg-navy-dark hover:bg-[#1B3F6E] text-white font-extrabold text-xxs uppercase tracking-widest py-3 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow active-scale-premium transition-all"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add New Frame</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Sub-tabs for Frames vs Cleaning Kits */}
                <div className="flex gap-2 border-b border-slate-100 pb-1">
                  <button
                    onClick={() => setProductSubTab('frames')}
                    className={`pb-2 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      productSubTab === 'frames'
                        ? 'border-[#B8952A] text-[#1B3F6E]'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Eyewear Frames
                  </button>
                  <button
                    onClick={() => setProductSubTab('kits')}
                    className={`pb-2 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                      productSubTab === 'kits'
                        ? 'border-[#B8952A] text-[#1B3F6E]'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Cleaning Kits
                  </button>
                </div>

                {/* Products Grid list */}
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                    {isBulkWeightEditMode ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                            <th className="py-4.5 px-6">Frame Preview</th>
                            <th className="py-4.5 px-6">Model Details</th>
                            <th className="py-4.5 px-6">Weight (Grams)</th>
                            <th className="py-4.5 px-6">Weight Tier & Avg. Shipping</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {(() => {
                            const filtered = products.filter(product => {
                              const matchesSearch = product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                product.category.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                product.frameShape.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                product.material.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                (product.brand && product.brand.toLowerCase().includes(productSearchQuery.toLowerCase()));
                              
                              const matchesSubTab = productSubTab === 'kits' ? product.isCleaningKit : !product.isCleaningKit;
                              
                              return matchesSearch && matchesSubTab;
                            });

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan="4" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    No products found
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map((product) => (
                              <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4.5 px-6">
                                  <div className="h-12 w-16 rounded-xl border border-slate-200/80 overflow-hidden bg-slate-100 shadow-sm shrink-0">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  </div>
                                </td>

                                <td className="py-4.5 px-6">
                                  <div className="space-y-0.5 text-left">
                                    <p className="font-extrabold text-navy-dark text-sm leading-tight">{product.name}</p>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                      <span>{product.brand || 'EyeLeads Premium'}</span>
                                      <span>•</span>
                                      <span>{product.category}</span>
                                    </div>
                                  </div>
                                </td>

                                <td className="py-4.5 px-6">
                                  <input
                                    type="number"
                                    min="1"
                                    value={bulkWeights[product._id] ?? product.weightGrams ?? 250}
                                    onChange={(e) => setBulkWeights({ ...bulkWeights, [product._id]: Number(e.target.value) })}
                                    className="w-24 border border-slate-200 focus:border-gold-accent focus:outline-none rounded-lg px-2.5 py-1.5 bg-slate-50/50 text-text-primary text-xs font-bold"
                                  />
                                </td>

                                <td className="py-4.5 px-6 font-extrabold text-xs text-left">
                                  {(() => {
                                    const w = bulkWeights[product._id] ?? product.weightGrams ?? 250;
                                    if (w < 200) {
                                      return (
                                        <div className="flex items-center gap-2">
                                          <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest text-[9px]">Light</span>
                                          <span className="text-slate-400 font-bold">~₹80 shipping cost</span>
                                        </div>
                                      );
                                    } else if (w <= 500) {
                                      return (
                                        <div className="flex items-center gap-2">
                                          <span className="text-[#B8952A] font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-widest text-[9px]">Medium</span>
                                          <span className="text-slate-400 font-bold">~₹120 shipping cost</span>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div className="flex items-center gap-2">
                                          <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase tracking-widest text-[9px]">Heavy</span>
                                          <span className="text-slate-400 font-bold">~₹160 shipping cost</span>
                                        </div>
                                      );
                                    }
                                  })()}
                                </td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                            <th className="py-4.5 px-6">Frame Preview</th>
                            <th className="py-4.5 px-6">Model Details</th>
                            <th className="py-4.5 px-6">Custom Tags</th>
                            <th className="py-4.5 px-6">Pricing</th>
                            <th className="py-4.5 px-6">Status</th>
                            <th className="py-4.5 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {(() => {
                            const filtered = products.filter(product => {
                              const matchesSearch = product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                product.category.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                product.frameShape.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                product.material.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                                (product.brand && product.brand.toLowerCase().includes(productSearchQuery.toLowerCase()));
                              
                              const matchesSubTab = productSubTab === 'kits' ? product.isCleaningKit : !product.isCleaningKit;
                              
                              return matchesSearch && matchesSubTab;
                            });

                            if (filtered.length === 0) {
                              return (
                                <tr>
                                  <td colSpan="6" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                    No products found
                                  </td>
                                </tr>
                              );
                            }

                            return filtered.map((product) => (
                              <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">

                                {/* Preview Thumbnail */}
                                <td className="py-4.5 px-6">
                                  <div className="h-12 w-16 rounded-xl border border-slate-200/80 overflow-hidden bg-slate-100 shadow-sm shrink-0">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  </div>
                                </td>

                                {/* Details */}
                                <td className="py-4.5 px-6">
                                  <div className="space-y-0.5">
                                    <p className="font-extrabold text-navy-dark text-sm leading-tight">{product.name}</p>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                      <span>{product.brand || 'EyeLeads Premium'}</span>
                                      <span>•</span>
                                      <span>{product.category}</span>
                                      <span>•</span>
                                      <span>{product.frameShape}</span>
                                    </div>
                                  </div>
                                </td>


                              {/* Spec tags */}
                              <td className="py-4.5 px-6">
                                <div className="flex flex-wrap gap-1">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[#4A4A6A] text-[8px] font-extrabold uppercase tracking-wider border border-slate-200/40">
                                    {product.material}
                                  </span>
                                  {product.badges && product.badges.map((badge, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded bg-amber-50 text-gold-accent text-[8px] font-extrabold uppercase tracking-wider border border-amber-100">
                                      {badge}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              {/* Pricing */}
                              <td className="py-4.5 px-6">
                                <div className="space-y-0.5">
                                  <p className="font-black text-navy-dark">₹{product.price.toLocaleString('en-IN')}</p>
                                  <p className="text-[10px] text-slate-400 font-medium line-through">₹{product.mrp.toLocaleString('en-IN')}</p>
                                </div>
                              </td>

                              {/* Stock Indicator */}
                              <td className="py-4.5 px-6">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider ${product.inStockOnly
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    : 'bg-rose-50 text-rose-600 border border-rose-100'
                                  }`}>
                                  {product.inStockOnly ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>

                              {/* Actions CRUD */}
                              <td className="py-4.5 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditDrawer(product)}
                                    className="h-8 w-8 rounded-lg bg-slate-100 text-navy-primary hover:bg-gold-accent hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xxs"
                                    title="Edit Product"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product._id)}
                                    className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-xxs border border-rose-100"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: ORDER LIST */}
            {activeTab === 'orders' && (
              <div className="space-y-6">

                {/* Order Sub-tab Filters */}
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex flex-wrap gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/40 w-fit">
                    {[
                      { key: 'all', label: 'All Orders' },
                      { key: 'active', label: 'Active / Pending' },
                      { key: 'completed', label: 'Completed' },
                      { key: 'cancelled', label: 'Cancelled' },
                      { key: 'refund_required', label: 'Refund Required' }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setOrderFilter(tab.key)}
                        className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
                          orderFilter === tab.key
                            ? 'bg-navy-dark text-white shadow-sm'
                            : 'text-slate-500 hover:text-navy-dark hover:bg-white/50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                          <th className="py-4.5 px-6">ID & Date</th>
                          <th className="py-4.5 px-6">Shipping Address</th>
                          <th className="py-4.5 px-6">Order Items</th>
                          <th className="py-4.5 px-6">Total sum</th>
                          <th className="py-4.5 px-6">Status flags</th>
                          <th className="py-4.5 px-6 text-right">Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {(() => {
                          const filteredOrders = orders.filter(o => {
                            if (orderFilter === 'cancelled') return o.isCancelled;
                            if (orderFilter === 'refund_required') return o.isCancelled && o.isPaid && !o.isRefunded;
                            if (orderFilter === 'completed') return o.isDelivered && !o.isCancelled;
                            if (orderFilter === 'active') return !o.isDelivered && !o.isCancelled;
                            return true;
                          });
                          return filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => {
                            const orderRx = order.orderItems.find(item => 
                              item.prescriptionOptions || 
                              item.prescriptionUploaded || 
                              item.options?.prescriptionData || 
                              item.options?.rxAttached || 
                              item.options?.prescriptionDetails || 
                              (item.options?.lensType && !['Non-Prescription', 'non-prescription', 'Accessory', 'Frame Only', 'Non-Prescription Frame'].includes(item.options.lensType))
                            );
                            return (
                              <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">

                                {/* Date */}
                                <td className="py-4.5 px-6">
                                  <div className="space-y-0.5">
                                    <p className="font-extrabold text-navy-dark tracking-wide">{order.orderNumber || order._id}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold">
                                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </td>

                                {/* Shipping Details */}
                                <td className="py-4.5 px-6">
                                  {order.shippingAddress ? (
                                    <div className="space-y-0.5">
                                      <p className="font-extrabold text-navy-dark leading-tight">{order.shippingAddress.name || order.user?.name || 'EyeLead Valued Client'}</p>
                                      <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] truncate">
                                        {order.shippingAddress.address}, {order.shippingAddress.city} - {order.shippingAddress.zipCode || order.shippingAddress.pincode}
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-slate-400 italic">Guest Checkout</p>
                                  )}
                                </td>

                                {/* Order Items */}
                                <td className="py-4.5 px-6">
                                  <div className="space-y-3">
                                    <div className="space-y-2">
                                      {order.orderItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                          <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded p-1 flex items-center justify-center shrink-0">
                                            <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                                          </div>
                                          <div>
                                            <p className="font-extrabold text-navy-dark text-[11px] leading-tight">{item.name}</p>
                                            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                                              Qty: {item.qty} · ₹{item.price.toLocaleString('en-IN')}
                                              {item.options?.lensType && ` · ${item.options.lensType}`}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    {orderRx && (
                                      <button
                                        onClick={() => {
                                          setSelectedRx({
                                            ...orderRx,
                                            orderId: order._id,
                                            currentStatus: order.prescriptionStatus || 'Pending Verification'
                                          });
                                          setIsRxViewOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-navy-primary/10 text-navy-primary text-[8.5px] font-extrabold uppercase tracking-wide border border-navy-primary/10 hover:bg-[#1B3F6E] hover:text-white transition-colors"
                                      >
                                        <FileText className="h-2.5 w-2.5" />
                                        <span>Optical Prescription</span>
                                      </button>
                                    )}
                                  </div>
                                </td>

                                {/* Pricing */}
                                <td className="py-4.5 px-6 font-black text-navy-dark">
                                  ₹{order.totalPrice.toLocaleString('en-IN')}
                                </td>

                                {/* Status */}
                                <td className="py-4.5 px-6">
                                   <div className="flex flex-col gap-1 items-start">
                                     {order.isCancelled ? (
                                       <>
                                         <span className="inline-block px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 border border-rose-200">
                                           Cancelled
                                         </span>
                                         {order.isPaid && (
                                           <span className={`inline-block px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider ${
                                             order.isRefunded
                                               ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                               : 'bg-red-600 text-white border border-red-700 animate-pulse'
                                           }`}>
                                             {order.isRefunded ? 'Refunded' : 'Refund Required'}
                                           </span>
                                         )}
                                       </>
                                     ) : (
                                       <>
                                         <span className={`inline-block px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider ${order.isPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                           }`}>
                                           {order.isPaid ? 'Paid' : 'Unpaid'}
                                         </span>
                                         <span className="inline-block px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                                            {order.deliveryStatus || 'Not Ready'}
                                          </span>
                                          {order.isInternational && (
                                            <span className="inline-block px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                                              🌍 International
                                            </span>
                                          )}
                                       </>
                                     )}
                                    {order.prescriptionStatus && order.prescriptionStatus !== 'Not Applicable' && (
                                      <span className={`inline-block px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider ${order.prescriptionStatus === 'Verified'
                                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                          : order.prescriptionStatus === 'Flagged / Action Required'
                                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                            : 'bg-amber-50 text-[#B8952A] border border-amber-100'
                                        }`}>
                                        Rx: {order.prescriptionStatus}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Fulfillment actions */}
                                <td className="py-4.5 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2.5">
                                    <button
                                      onClick={() => {
                                        setSelectedOrder(order);
                                        setIsOrderModalOpen(true);
                                      }}
                                      className="px-3.5 py-2 rounded-xl border border-[#1B3F6E] hover:bg-[#1B3F6E]/5 text-[#1B3F6E] text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <Eye className="h-3 w-3" />
                                      <span>View Details</span>
                                    </button>
                                    {renderOrderFulfillmentActions(order)}
                                  </div>
                                </td>

                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                              No customer sales receipts logged for the selected filter.
                            </td>
                          </tr>
                        )})()}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div className="space-y-6">

                {/* Search query row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative w-full max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search accounts by name, email, role..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-full pl-10 pr-4 py-2.5 text-xs bg-white text-text-primary placeholder-slate-400 font-bold shadow-xxs"
                    />
                  </div>

                  <div className="text-slate-400 text-xxs font-extrabold uppercase tracking-widest bg-white py-2.5 px-4 rounded-xl border border-slate-200 shadow-xxs select-none">
                    Total Registered: <span className="text-gold-accent font-black">{users.length}</span>
                  </div>
                </div>

                {/* Users List Grid */}
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                          <th className="py-4.5 px-6">Profile Identity</th>
                          <th className="py-4.5 px-6">Administrative Level</th>
                          <th className="py-4.5 px-6">Account Status</th>
                          <th className="py-4.5 px-6">Created Date</th>
                          <th className="py-4.5 px-6 text-right">Privileges Access</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {users.length > 0 ? (
                          users
                            .filter(u =>
                              u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                              u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                              (u.role && u.role.toLowerCase().includes(userSearchQuery.toLowerCase()))
                            )
                            .map((u) => (
                              <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">

                                {/* Identity details */}
                                <td className="py-4.5 px-6">
                                  <div className="space-y-0.5">
                                    <p className="font-extrabold text-navy-dark text-sm leading-tight">{u.name}</p>
                                    <p className="text-[10px] text-slate-400 font-semibold">{u.email}</p>
                                  </div>
                                </td>

                                {/* Administrative Level */}
                                <td className="py-4.5 px-6">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase tracking-wider ${u.isAdmin
                                      ? 'bg-amber-50 text-gold-accent border border-amber-100'
                                      : u.verifiedOptician
                                        ? 'bg-blue-50 text-navy-primary border border-blue-100'
                                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}>
                                    {u.isAdmin ? 'Super Admin' : u.verifiedOptician ? 'Optician Pro' : u.role || 'Customer'}
                                  </span>
                                </td>

                                {/* Account Status */}
                                <td className="py-4.5 px-6">
                                  <button
                                    onClick={() => handleToggleUserSuspension(u._id, u.isSuspended)}
                                    className={`inline-flex px-2.5 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider cursor-pointer border ${u.isSuspended
                                        ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                      }`}
                                    title="Click to toggle suspension state"
                                  >
                                    {u.isSuspended ? 'Suspended' : 'Active Account'}
                                  </button>
                                </td>

                                {/* Created Date */}
                                <td className="py-4.5 px-6 text-slate-400 font-semibold">
                                  {new Date(u.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  })}
                                </td>

                                {/* Privileges Toggle actions */}
                                <td className="py-4.5 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleViewUserPrescription(u)}
                                      className="h-7 w-7 rounded-lg transition-all flex items-center justify-center border shadow-xxs bg-blue-50 text-navy-primary hover:bg-navy-primary hover:text-white border-blue-100 cursor-pointer"
                                      title="View Prescription Profile"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleUserRole(u._id, u.isAdmin)}
                                      disabled={u.email === 'admin@eyeleads.com'}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all select-none ${u.email === 'admin@eyeleads.com'
                                          ? 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
                                          : u.isAdmin
                                            ? 'bg-amber-50 text-gold-accent hover:bg-gold-accent hover:text-white border border-amber-100 cursor-pointer shadow-xxs'
                                            : 'bg-slate-100 text-navy-dark hover:bg-gold-accent hover:text-white border border-slate-200 cursor-pointer shadow-xxs'
                                        }`}
                                      title={u.isAdmin ? "Revoke Admin Status" : "Promote to Admin"}
                                    >
                                      {u.isAdmin ? 'Demote privileges' : 'Grant Admin'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u._id)}
                                      disabled={u.email === 'admin@eyeleads.com'}
                                      className={`h-7 w-7 rounded-lg transition-all flex items-center justify-center border shadow-xxs ${u.email === 'admin@eyeleads.com'
                                          ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                          : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-100 cursor-pointer'
                                        }`}
                                      title="Purge Account"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>

                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-12 text-center text-slate-400 font-bold">
                              No customer profiles match this search query in memory.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: CUSTOMER REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden animate-fadeIn text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                          <th className="py-4.5 px-6">Product Name</th>
                          <th className="py-4.5 px-6">Reviewer</th>
                          <th className="py-4.5 px-6">Rating</th>
                          <th className="py-4.5 px-6 max-w-xs">Review Content</th>
                          <th className="py-4.5 px-6">Date</th>
                          <th className="py-4.5 px-6">Status</th>
                          <th className="py-4.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {reviews.length > 0 ? (
                          reviews.map((review) => (
                            <tr key={review._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4.5 px-6 font-extrabold text-navy-dark">
                                {review.product?.name || review.productName || 'Unknown Product'}
                              </td>
                              <td className="py-4.5 px-6 font-semibold text-[#4A4A6A]">
                                {review.guestName}
                              </td>
                              <td className="py-4.5 px-6">
                                <div className="flex text-[#B8952A] gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-[#B8952A] text-[#B8952A]' : 'text-slate-200'}`} />
                                  ))}
                                </div>
                              </td>
                              <td className="py-4.5 px-6 max-w-xs">
                                <div className="space-y-1">
                                  {review.title && (
                                    <div className="font-extrabold text-navy-dark truncate" title={review.title}>
                                      {review.title}
                                    </div>
                                  )}
                                  <div className="text-slate-500 font-medium break-words whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'break-word' }}>
                                    {review.body}
                                  </div>
                                  {review.reviewImages && review.reviewImages.length > 0 && (
                                    <div className="flex gap-1.5 mt-2 overflow-x-auto py-0.5">
                                      {review.reviewImages.map((img, idx) => (
                                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                          <img
                                            src={img}
                                            alt={`Review attachment ${idx + 1}`}
                                            className="h-12 w-12 rounded-lg object-cover border border-slate-200 hover:border-gold-accent transition-colors cursor-zoom-in"
                                          />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-4.5 px-6 font-medium text-slate-400">
                                {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric'
                                })}
                              </td>
                              <td className="py-4.5 px-6">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider ${review.approved
                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}>
                                  {review.approved ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td className="py-4.5 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {reviewDeleteConfirmId === review._id ? (
                                    <div className="flex items-center gap-1.5 animate-fadeIn">
                                      <span className="text-[9px] text-rose-600 font-black uppercase tracking-wider mr-1 animate-pulse">Confirm?</span>
                                      <button
                                        onClick={() => {
                                          handleDeleteReview(review._id);
                                          setReviewDeleteConfirmId(null);
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center justify-center font-extrabold text-[9.5px] uppercase tracking-wider cursor-pointer shadow-xxs"
                                        title="Confirm Delete"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        onClick={() => setReviewDeleteConfirmId(null)}
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all flex items-center justify-center font-extrabold text-[9.5px] uppercase tracking-wider cursor-pointer"
                                        title="Cancel Delete"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      {!review.approved && (
                                        <button
                                          onClick={() => handleApproveReview(review._id)}
                                          className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center font-extrabold text-[9.5px] uppercase tracking-wider cursor-pointer border border-emerald-100 shadow-xxs"
                                          title="Approve Review"
                                        >
                                          Approve
                                        </button>
                                      )}
                                      <button
                                        onClick={() => setReviewDeleteConfirmId(review._id)}
                                        className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-rose-100 shadow-xxs"
                                        title="Delete Review"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                              No reviews submitted yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RETURN REQUESTS */}
            {activeTab === 'returns' && (
              <div className="space-y-6">
                {/* Status Filters */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Requests' },
                    { id: 'requested', label: 'Pending Review' },
                    { id: 'approved', label: 'Approved' },
                    { id: 'rejected', label: 'Rejected' },
                    { id: 'replacement shipped', label: 'Replacement Shipped' },
                    { id: 'completed', label: 'Completed' }
                  ].map(filter => {
                    const count = returnRequests.filter(r => 
                      filter.id === 'all' || r.status?.toLowerCase() === filter.id
                    ).length;
                    const isActive = returnFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setReturnFilter(filter.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                          isActive
                            ? 'bg-gold-accent text-navy-dark border-gold-accent shadow-md shadow-gold-accent/20'
                            : 'bg-white text-slate-500 border-slate-200/80 hover:border-slate-300 hover:text-navy-dark'
                        }`}
                      >
                        {filter.label} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Table Container */}
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden animate-fadeIn text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                          <th className="py-4.5 px-6">Order Number</th>
                          <th className="py-4.5 px-6">Customer</th>
                          <th className="py-4.5 px-6">Resolution</th>
                          <th className="py-4.5 px-6">Reason</th>
                          <th className="py-4.5 px-6">Date</th>
                          <th className="py-4.5 px-6">Status</th>
                          <th className="py-4.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {returnRequests.filter(req => 
                          returnFilter === 'all' || req.status?.toLowerCase() === returnFilter
                        ).length > 0 ? (
                          returnRequests
                            .filter(req => returnFilter === 'all' || req.status?.toLowerCase() === returnFilter)
                            .map((req) => {
                              const getStatusColor = (status) => {
                                switch (status?.toLowerCase()) {
                                  case 'requested':
                                    return 'bg-blue-50 text-blue-600 border-blue-100';
                                  case 'approved':
                                    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
                                  case 'rejected':
                                    return 'bg-rose-50 text-rose-600 border-rose-100';
                                  case 'replacement shipped':
                                    return 'bg-purple-50 text-purple-600 border-purple-100';
                                  case 'completed':
                                    return 'bg-teal-50 text-teal-600 border-teal-100';
                                  default:
                                    return 'bg-slate-50 text-slate-600 border-slate-100';
                                }
                              };

                              return (
                                <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4.5 px-6 font-extrabold text-navy-dark">
                                    {req.order?.orderNumber || req.orderNumber || 'Unknown Order'}
                                  </td>
                                  <td className="py-4.5 px-6">
                                    <div className="space-y-0.5">
                                      <div className="font-extrabold text-navy-dark">{req.user?.name || 'Customer'}</div>
                                      <div className="text-slate-400 font-semibold text-[10px]">{req.user?.email}</div>
                                    </div>
                                  </td>
                                  <td className="py-4.5 px-6">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                      req.resolutionRequested === 'Refund'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    }`}>
                                      {req.resolutionRequested}
                                    </span>
                                  </td>
                                  <td className="py-4.5 px-6 font-medium text-slate-600">
                                    {req.reason}
                                  </td>
                                  <td className="py-4.5 px-6 font-medium text-slate-400">
                                    {new Date(req.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit', month: 'short', year: 'numeric'
                                    })}
                                  </td>
                                  <td className="py-4.5 px-6">
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider border ${getStatusColor(req.status)}`}>
                                      {req.status}
                                    </span>
                                  </td>
                                  <td className="py-4.5 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => {
                                          setSelectedReturnRequest(req);
                                          setAdminNoteText(req.adminNote || '');
                                          setTrackingNumberInput(req.replacementTrackingNumber || '');
                                          setIsReturnModalOpen(true);
                                        }}
                                        className="px-3.5 py-1.5 rounded-lg bg-gold-accent text-navy-dark hover:bg-[#B8952A] hover:text-white transition-all flex items-center justify-center font-extrabold text-[9.5px] uppercase tracking-wider cursor-pointer border border-gold-accent/20 shadow-xxs"
                                      >
                                        Review Request
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                        ) : (
                          <tr>
                            <td colSpan="7" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                              No return requests in this status.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PRESCRIPTION REVIEW QUEUE */}
            {activeTab === 'prescription-review' && (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Submissions' },
                    { id: 'not reviewed', label: 'Pending Review' },
                    { id: 'verified', label: 'Verified' },
                    { id: 'flagged / action required', label: 'Flagged' }
                  ].map(filter => {
                    const count = allPrescriptions.filter(p =>
                      filter.id === 'all' || (p.verificationStatus || 'Not Reviewed').toLowerCase() === filter.id
                    ).length;
                    const isActive = prescriptionFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => setPrescriptionFilter(filter.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer border ${
                          isActive
                            ? 'bg-gold-accent text-navy-dark border-gold-accent shadow-md shadow-gold-accent/20'
                            : 'bg-white text-slate-500 border-slate-200/80 hover:border-slate-300 hover:text-navy-dark'
                        }`}
                      >
                        {filter.label} ({count})
                      </button>
                    );
                  })}
                </div>

                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden animate-fadeIn text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                          <th className="py-4.5 px-6">Customer</th>
                          <th className="py-4.5 px-6">Right Eye (SPH/CYL)</th>
                          <th className="py-4.5 px-6">Left Eye (SPH/CYL)</th>
                          <th className="py-4.5 px-6">Last Updated</th>
                          <th className="py-4.5 px-6">Status</th>
                          <th className="py-4.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {allPrescriptions.filter(p =>
                          prescriptionFilter === 'all' || (p.verificationStatus || 'Not Reviewed').toLowerCase() === prescriptionFilter
                        ).length > 0 ? (
                          allPrescriptions
                            .filter(p => prescriptionFilter === 'all' || (p.verificationStatus || 'Not Reviewed').toLowerCase() === prescriptionFilter)
                            .map((p) => {
                              const status = p.verificationStatus || 'Not Reviewed';
                              const statusColor = status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : status === 'Flagged / Action Required'
                                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                                  : 'bg-amber-50 text-[#B8952A] border-amber-100';
                              return (
                                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-4.5 px-6">
                                    <div className="space-y-0.5">
                                      <div className="font-extrabold text-navy-dark">{p.user?.name || 'Customer'}</div>
                                      <div className="text-slate-400 font-semibold text-[10px]">{p.user?.email}</div>
                                    </div>
                                  </td>
                                  <td className="py-4.5 px-6 font-mono text-slate-500">
                                    {p.rightSph || '—'} / {p.rightCyl || '—'}
                                  </td>
                                  <td className="py-4.5 px-6 font-mono text-slate-500">
                                    {p.leftSph || '—'} / {p.leftCyl || '—'}
                                  </td>
                                  <td className="py-4.5 px-6 font-semibold text-slate-500">
                                    {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                  </td>
                                  <td className="py-4.5 px-6">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${statusColor}`}>
                                      {status}
                                    </span>
                                  </td>
                                  <td className="py-4.5 px-6 text-right">
                                    <button
                                      onClick={() => handleViewUserPrescription(p.user)}
                                      className="px-3 py-1.5 rounded-lg bg-navy-primary text-white hover:bg-[#1B3F6E] text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-xxs"
                                    >
                                      Review
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                              No prescriptions submitted by customers yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CUSTOMER INQUIRIES */}
            {activeTab === 'inquiries' && (
              <div className="space-y-6">
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden animate-fadeIn text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                          <th className="py-4.5 px-6">Customer</th>
                          <th className="py-4.5 px-6">Department</th>
                          <th className="py-4.5 px-6 max-w-lg">Inquiry Message</th>
                          <th className="py-4.5 px-6">Attachment</th>
                          <th className="py-4.5 px-6">Date</th>
                          <th className="py-4.5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {inquiries.length > 0 ? (
                          inquiries.map((inquiry) => {
                            const getSubjectLabel = (subj) => {
                              switch (subj) {
                                case 'rx-verification':
                                  return { text: 'Prescription Check', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
                                case 'fitting':
                                  return { text: 'Hinge & Fit Adjust', bg: 'bg-amber-50 text-amber-600 border-amber-100' };
                                case 'shipping':
                                  return { text: 'Corporate Orders', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
                                default:
                                  return { text: subj || 'General Inquiry', bg: 'bg-slate-50 text-slate-600 border-slate-100' };
                              }
                            };
                            const badge = getSubjectLabel(inquiry.subject);

                            return (
                              <tr key={inquiry._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-4.5 px-6">
                                  <div className="space-y-0.5">
                                    <div className="font-extrabold text-navy-dark">{inquiry.name}</div>
                                    <div className="text-slate-400 font-semibold text-[10px]">{inquiry.email}</div>
                                  </div>
                                </td>
                                <td className="py-4.5 px-6">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider border ${badge.bg}`}>
                                    {badge.text}
                                  </span>
                                </td>
                                <td className="py-4.5 px-6 max-w-lg">
                                  <div className="text-slate-600 font-medium break-words whitespace-pre-wrap leading-relaxed" style={{ wordBreak: 'break-word' }}>
                                    {inquiry.message}
                                  </div>
                                </td>
                                <td className="py-4.5 px-6">
                                  {inquiry.prescriptionFile ? (
                                    <a href={inquiry.prescriptionFile} target="_blank" rel="noopener noreferrer" className="inline-block group">
                                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#B8952A]/25 bg-amber-50/25 hover:bg-gold-accent hover:text-white hover:border-gold-accent text-[#B8952A] transition-all cursor-pointer">
                                        <FileText className="h-3.5 w-3.5" />
                                        <span className="text-[9.5px] font-extrabold uppercase tracking-wider">View Rx</span>
                                      </div>
                                    </a>
                                  ) : (
                                    <span className="text-slate-300 font-bold italic text-[10px]">No Rx Attached</span>
                                  )}
                                </td>
                                <td className="py-4.5 px-6 font-medium text-slate-400">
                                  {new Date(inquiry.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                  })}
                                </td>
                                <td className="py-4.5 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {inquiryDeleteConfirmId === inquiry._id ? (
                                      <div className="flex items-center gap-1.5 animate-fadeIn">
                                        <span className="text-[9px] text-rose-600 font-black uppercase tracking-wider mr-1 animate-pulse">Confirm?</span>
                                        <button
                                          onClick={() => {
                                            handleDeleteInquiry(inquiry._id);
                                            setInquiryDeleteConfirmId(null);
                                          }}
                                          className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center justify-center font-extrabold text-[9.5px] uppercase tracking-wider cursor-pointer shadow-xxs"
                                          title="Confirm Delete"
                                        >
                                          Yes
                                        </button>
                                        <button
                                          onClick={() => setInquiryDeleteConfirmId(null)}
                                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all flex items-center justify-center font-extrabold text-[9.5px] uppercase tracking-wider cursor-pointer"
                                          title="Cancel Delete"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setInquiryDeleteConfirmId(inquiry._id)}
                                        className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-rose-100 shadow-xxs"
                                        title="Delete Inquiry"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                              No customer inquiries logged yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: AUDIT LOGS */}
            {activeTab === 'audit-logs' && (
              <div className="space-y-6">

                {/* Search & Actions bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative w-full max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search trails by actor, action tags, components..."
                      value={auditSearchQuery}
                      onChange={(e) => setAuditSearchQuery(e.target.value)}
                      className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-full pl-10 pr-4 py-2.5 text-xs bg-white text-text-primary placeholder-slate-400 font-bold shadow-xxs"
                    />
                  </div>

                  <div className="text-slate-400 text-xxs font-extrabold uppercase tracking-widest bg-white py-2.5 px-4 rounded-xl border border-slate-200 shadow-xxs select-none">
                    Security Level: <span className="text-[#1B3F6E] font-black">ENCRYPTED JWT & RBAC</span>
                  </div>
                </div>

                {/* Audit table list */}
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-[#F8FAFC]/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                          <th className="py-4.5 px-6">Timestamp</th>
                          <th className="py-4.5 px-6">Administrative Actor</th>
                          <th className="py-4.5 px-6">Action Event Tag</th>
                          <th className="py-4.5 px-6">Target Component</th>
                          <th className="py-4.5 px-6">Action Trail Details</th>
                          <th className="py-4.5 px-6 text-right">Actor IP Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] font-semibold text-text-muted">
                        {auditLogs.length > 0 ? (
                          auditLogs
                            .filter(log =>
                              log.user.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              log.targetComponent.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              log.details.toLowerCase().includes(auditSearchQuery.toLowerCase())
                            )
                            .map((log) => (
                              <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">

                                {/* Timestamp */}
                                <td className="py-4 px-6 text-slate-400">
                                  {new Date(log.createdAt || Date.now()).toLocaleTimeString('en-IN', {
                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                  })}
                                  <span className="block text-[8px] font-medium mt-0.5">
                                    {new Date(log.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                      day: '2-digit', month: 'short'
                                    })}
                                  </span>
                                </td>

                                {/* Actor Email */}
                                <td className="py-4 px-6 font-extrabold text-navy-dark">
                                  {log.user}
                                </td>

                                {/* Action Tag */}
                                <td className="py-4 px-6">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${log.action.startsWith('CREATE')
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                      : log.action.startsWith('DELETE')
                                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                        : log.action.includes('SETTINGS') || log.action.includes('ROLE')
                                          ? 'bg-amber-50 text-gold-accent border border-amber-100'
                                          : 'bg-blue-50 text-navy-primary border border-blue-100'
                                    }`}>
                                    {log.action}
                                  </span>
                                </td>

                                {/* Target Component */}
                                <td className="py-4 px-6 uppercase tracking-wider text-[9px] text-[#4A4A6A] font-extrabold">
                                  {log.targetComponent}
                                </td>

                                {/* Details */}
                                <td className="py-4 px-6 text-slate-500 font-medium max-w-[280px] truncate" title={log.details}>
                                  {log.details}
                                </td>

                                {/* IP Address */}
                                <td className="py-4 px-6 text-right text-slate-400 font-mono text-[10px]">
                                  {log.ipAddress || '127.0.0.1'}
                                </td>

                              </tr>
                            ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                              No security audit logs found in the memory adapter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: STORE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="max-w-3xl bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-8 animate-fadeIn select-none">

                <div className="space-y-1 border-b border-slate-100 pb-4">
                  <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-widest block">System Configurations</span>
                  <h3 className="text-xl font-light font-serif text-navy-dark">Storefront parameters</h3>
                </div>

                <form onSubmit={handleUpdateStoreSettings} className="space-y-6 text-xs font-bold text-text-muted">

                  {/* Grid 1: Store General details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="uppercase tracking-wider text-[9px]">Storefront Brand Name</label>
                      <input
                        type="text"
                        required
                        value={storeSettings.storeName}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                        className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="uppercase tracking-wider text-[9px]">Support Desk Address</label>
                      <input
                        type="email"
                        required
                        value={storeSettings.supportEmail}
                        onChange={(e) => setStoreSettings({ ...storeSettings, supportEmail: e.target.value })}
                        className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary"
                      />
                    </div>
                  </div>


                  {/* Grid 4: Product Warranty Settings */}
                  <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-5">
                    <div className="space-y-2">
                      <label className="uppercase tracking-wider text-[9px]">Global Product Warranty Terms (e.g. 1-Year Warranty)</label>
                      <input
                        type="text"
                        required
                        value={storeSettings.warrantyText || ''}
                        onChange={(e) => setStoreSettings({ ...storeSettings, warrantyText: e.target.value })}
                        className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary"
                        placeholder="e.g. 1-Year Warranty"
                      />
                    </div>
                  </div>

                  {/* Promo Banner alerts */}
                  <div className="space-y-2 border-t border-slate-100 pt-5">
                    <label className="uppercase tracking-wider text-[9px]">Promo Banner Text Message</label>
                    <textarea
                      rows="2"
                      required
                      value={storeSettings.promoBannerText}
                      onChange={(e) => setStoreSettings({ ...storeSettings, promoBannerText: e.target.value })}
                      className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary font-bold"
                    />
                  </div>

                  {/* Grid 5: Hero Section Floating Popups Configurations */}
                  <div className="border-t border-slate-150 pt-6 space-y-5">
                    <div className="space-y-1">
                      <span className="text-[#B8952A] text-[9px] font-extrabold uppercase tracking-widest block">Home Page Customization</span>
                      <h4 className="text-sm font-bold text-[#0F2744]">Hero Floating Popups Settings</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Link floating popups to products and customize titles, prices, labels, badges, or custom image overrides.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Popup Configuration */}
                      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                        <span className="text-[10px] text-[#B8952A] font-extrabold uppercase tracking-wider block border-b border-slate-200/60 pb-2">Popup 1: Bottom-Left Popup</span>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Linked Eyewear Product</label>
                          <select
                            value={storeSettings.heroLeftProductId || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroLeftProductId: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[11px]"
                          >
                            <option value="">-- Select Product --</option>
                            {products.map(prod => (
                              <option key={prod._id || prod.id} value={prod._id || prod.id}>
                                {prod.name} (₹{prod.price})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Label (e.g., Signature)</label>
                          <input
                            type="text"
                            value={storeSettings.heroLeftLabel || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroLeftLabel: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[11px]"
                            placeholder="e.g. Signature"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Title</label>
                          <input
                            type="text"
                            value={storeSettings.heroLeftTitle || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroLeftTitle: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[11px]"
                            placeholder="e.g. The Navigator Elite"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Price text</label>
                          <input
                            type="text"
                            value={storeSettings.heroLeftPrice || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroLeftPrice: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[11px]"
                            placeholder="e.g. ₹3,499"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Badge Text (e.g., Try-On)</label>
                          <input
                            type="text"
                            value={storeSettings.heroLeftBadge || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroLeftBadge: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[11px]"
                            placeholder="e.g. Try-On"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Custom Image Override (Drag & Drop)</label>
                          <div
                            onDragEnter={handleLeftDrag}
                            onDragOver={handleLeftDrag}
                            onDragLeave={handleLeftDrag}
                            onDrop={handleLeftDrop}
                            className={`w-full min-h-[100px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all duration-300 relative ${leftDragActive
                                ? 'border-gold-accent bg-gold-accent/5 scale-[1.01]'
                                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-gold-accent/50'
                              }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  await uploadHeroImage(e.target.files, 'left');
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {leftUploading ? (
                              <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                <Loader className="h-5 w-5 animate-spin text-gold-accent" />
                                <p className="text-[9px] font-black uppercase tracking-wider text-[#B8952A]">Uploading...</p>
                              </div>
                            ) : storeSettings.heroLeftImage ? (
                              <div className="flex items-center gap-3 w-full pr-6 relative z-0">
                                <img src={storeSettings.heroLeftImage} alt="Preview Left" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                                <div className="text-left min-w-0 flex-1">
                                  <p className="text-[10px] font-bold text-navy-dark truncate">{storeSettings.heroLeftImage}</p>
                                  <p className="text-[8px] text-[#B8952A] uppercase tracking-wider mt-0.5">Drag new file to replace</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-slate-500">
                                <Plus className="h-5 w-5 text-gold-accent" />
                                <p className="text-[9.5px] font-extrabold text-navy-dark leading-none">Drop image here, or click</p>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={storeSettings.heroLeftImage || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroLeftImage: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[10px] mt-1"
                            placeholder="Or paste custom image URL override..."
                          />
                        </div>
                      </div>

                      {/* Right Popup Configuration */}
                      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                        <span className="text-[10px] text-[#B8952A] font-extrabold uppercase tracking-wider block border-b border-slate-200/60 pb-2">Popup 2: Top-Right Popup</span>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Linked Eyewear Product</label>
                          <select
                            value={storeSettings.heroRightProductId || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroRightProductId: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[11px]"
                          >
                            <option value="">-- Select Product --</option>
                            {products.map(prod => (
                              <option key={prod._id || prod.id} value={prod._id || prod.id}>
                                {prod.name} (₹{prod.price})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Title</label>
                          <input
                            type="text"
                            value={storeSettings.heroRightTitle || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroRightTitle: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-[#0F2744] text-[11px]"
                            placeholder="e.g. Zephyr Round"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Subtext (e.g., Titanium Series)</label>
                          <input
                            type="text"
                            value={storeSettings.heroRightSubtext || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroRightSubtext: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[11px]"
                            placeholder="e.g. Titanium Series"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Price text</label>
                          <input
                            type="text"
                            value={storeSettings.heroRightPrice || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroRightPrice: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[11px]"
                            placeholder="e.g. ₹7,499"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="uppercase tracking-wider text-[8px] block text-slate-500">Custom Image Override (Drag & Drop)</label>
                          <div
                            onDragEnter={handleRightDrag}
                            onDragOver={handleRightDrag}
                            onDragLeave={handleRightDrag}
                            onDrop={handleRightDrop}
                            className={`w-full min-h-[100px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all duration-300 relative ${rightDragActive
                                ? 'border-gold-accent bg-gold-accent/5 scale-[1.01]'
                                : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-gold-accent/50'
                              }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                if (e.target.files && e.target.files[0]) {
                                  await uploadHeroImage(e.target.files, 'right');
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {rightUploading ? (
                              <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                <Loader className="h-5 w-5 animate-spin text-gold-accent" />
                                <p className="text-[9px] font-black uppercase tracking-wider text-[#B8952A]">Uploading...</p>
                              </div>
                            ) : storeSettings.heroRightImage ? (
                              <div className="flex items-center gap-3 w-full pr-6 relative z-0">
                                <img src={storeSettings.heroRightImage} alt="Preview Right" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                                <div className="text-left min-w-0 flex-1">
                                  <p className="text-[10px] font-bold text-navy-dark truncate">{storeSettings.heroRightImage}</p>
                                  <p className="text-[8px] text-[#B8952A] uppercase tracking-wider mt-0.5">Drag new file to replace</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-slate-500">
                                <Plus className="h-5 w-5 text-gold-accent" />
                                <p className="text-[9.5px] font-extrabold text-navy-dark leading-none">Drop image here, or click</p>
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            value={storeSettings.heroRightImage || ''}
                            onChange={(e) => setStoreSettings({ ...storeSettings, heroRightImage: e.target.value })}
                            className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-white text-text-primary text-[10px] mt-1"
                            placeholder="Or paste custom image URL override..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Boolean Switches */}
                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="allowGuestCheckout"
                        checked={storeSettings.allowGuestCheckout}
                        onChange={(e) => setStoreSettings({ ...storeSettings, allowGuestCheckout: e.target.checked })}
                        className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                      />
                      <label htmlFor="allowGuestCheckout" className="uppercase tracking-wider text-[9px] cursor-pointer">Allow Guest Checkout Option</label>
                    </div>

                    <span className="text-[9px] uppercase tracking-widest text-[#B8952A] font-extrabold bg-[#B8952A]/10 px-2 py-0.5 rounded select-none">
                      Dynamic State Seeding
                    </span>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={loadData}
                      className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer"
                    >
                      Reset changes
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-navy-dark text-white hover:bg-gold-accent hover:text-navy-dark text-[10px] font-extrabold uppercase tracking-widest cursor-pointer shadow-[0_4px_14px_rgba(15,39,68,0.2)] hover:shadow-none transition-all duration-300"
                    >
                      Save Global Settings
                    </button>
                  </div>

                </form>
              </div>
            )}

            {/* TAB CONTENT: PRESCRIPTION CONFIG */}
            {activeTab === 'prescription' && (
              <div className="max-w-3xl bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-8 animate-fadeIn select-none">

                <div className="space-y-1 border-b border-slate-100 pb-4">
                  <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-widest block">Prescription Configurations</span>
                  <h3 className="text-xl font-light font-serif text-navy-dark">Prescription & Lens Options</h3>
                </div>

                <form onSubmit={handleUpdateStoreSettings} className="space-y-6 text-xs font-bold text-text-muted">

                  {/* Grid: Pricing Customizations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="uppercase tracking-wider text-[9px]">Optician Doctor Prescription Fee (INR)</label>
                      <input
                        type="number"
                        required
                        value={storeSettings.opticianFee}
                        onChange={(e) => setStoreSettings({ ...storeSettings, opticianFee: Number(e.target.value) })}
                        className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="uppercase tracking-wider text-[9px]">Blue Cut Lens Coating Premium (INR)</label>
                      <input
                        type="number"
                        required
                        value={storeSettings.blueCutPremium}
                        onChange={(e) => setStoreSettings({ ...storeSettings, blueCutPremium: Number(e.target.value) })}
                        className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary"
                      />
                    </div>
                  </div>

                  {/* Prescription Customizations */}
                  <div className="border-t border-slate-150 pt-6 space-y-6">
                    <div className="space-y-1">
                      <span className="text-[#B8952A] text-[9px] font-extrabold uppercase tracking-widest block">Lens Customization Matrix</span>
                      <p className="text-[10px] text-slate-400 font-medium">Add or remove custom lens configurations, indexes, coatings, features, and set surcharges dynamically.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      
                      {/* Section 1: Lens Types */}
                      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                        <span className="text-[10px] text-[#B8952A] font-extrabold uppercase tracking-wider block border-b border-[#FAF9F6] pb-2">1. Lens Types</span>
                        
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {(storeSettings.lensTypes || []).length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No lens types configured.</p>
                          ) : (
                            (storeSettings.lensTypes || []).map((type) => (
                              <div key={type.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-150 shadow-xxs">
                                <div className="text-left space-y-0.5 max-w-[80%]">
                                  <p className="text-[11px] font-black text-navy-dark flex items-baseline gap-1.5">
                                    <span>{type.name}</span>
                                    <span className="text-[9.5px] text-[#B8952A] font-black font-sans">
                                      {type.price > 0 ? `+₹${type.price}` : 'Included'}
                                    </span>
                                  </p>
                                  <p className="text-[9.5px] text-slate-400 leading-tight font-medium">{type.desc}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => startEditLensType(type)}
                                    className="text-slate-400 hover:text-gold-accent p-1.5 rounded-lg hover:bg-amber-50 transition-all cursor-pointer"
                                    title="Edit Lens Type"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLensType(type.id)}
                                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                                    title="Remove Lens Type"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Inline Form to Add/Edit Lens Type */}
                        <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-3">
                          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold">
                            {editingLensTypeId ? 'Edit Lens Type' : 'Add New Lens Type'}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="Name (e.g. Bifocal)"
                              value={newTypeForm.name}
                              onChange={(e) => setNewTypeForm({ ...newTypeForm, name: e.target.value })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                            <input
                              type="number"
                              placeholder="Surcharge (INR)"
                              value={newTypeForm.price || ''}
                              onChange={(e) => setNewTypeForm({ ...newTypeForm, price: Number(e.target.value) })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={newTypeForm.desc}
                              onChange={(e) => setNewTypeForm({ ...newTypeForm, desc: e.target.value })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            {editingLensTypeId && (
                              <button
                                type="button"
                                onClick={cancelEditLensType}
                                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleAddLensType}
                              className="px-4 py-2 rounded-xl bg-navy-dark text-white hover:bg-gold-accent hover:text-navy-dark text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                            >
                              {editingLensTypeId ? 'Save Lens Type' : 'Add Lens Type'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Lens Materials */}
                      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                        <span className="text-[10px] text-[#B8952A] font-extrabold uppercase tracking-wider block border-b border-slate-200/60 pb-2">2. Lens Materials & Refractive Index</span>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {(storeSettings.lensMaterials || []).length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No lens materials configured.</p>
                          ) : (
                            (storeSettings.lensMaterials || []).map((mat) => (
                              <div key={mat.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-150 shadow-xxs">
                                <div className="text-left space-y-0.5 max-w-[80%]">
                                  <p className="text-[11px] font-black text-navy-dark flex items-baseline gap-1.5 flex-wrap">
                                    <span>{mat.name}</span>
                                    <span className="text-[8.5px] text-slate-400 font-mono">Index {mat.index}</span>
                                    <span className="text-[9.5px] text-[#B8952A] font-black font-sans">
                                      {mat.price > 0 ? `+₹${mat.price}` : 'Free'}
                                    </span>
                                  </p>
                                  <p className="text-[9.5px] text-slate-400 leading-tight font-medium">{mat.desc}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => startEditLensMaterial(mat)}
                                    className="text-slate-400 hover:text-gold-accent p-1.5 rounded-lg hover:bg-amber-50 transition-all cursor-pointer"
                                    title="Edit Lens Material"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLensMaterial(mat.id)}
                                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                                    title="Remove Lens Material"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Inline Form to Add/Edit Lens Material */}
                        <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-3">
                          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold">
                            {editingLensMaterialId ? 'Edit Lens Material' : 'Add New Lens Material'}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <input
                              type="text"
                              placeholder="Material Name"
                              value={newMatForm.name}
                              onChange={(e) => setNewMatForm({ ...newMatForm, name: e.target.value })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                            <input
                              type="text"
                              placeholder="Index (e.g. 1.67)"
                              value={newMatForm.index}
                              onChange={(e) => setNewMatForm({ ...newMatForm, index: e.target.value })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                            <input
                              type="number"
                              placeholder="Surcharge (INR)"
                              value={newMatForm.price || ''}
                              onChange={(e) => setNewMatForm({ ...newMatForm, price: Number(e.target.value) })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={newMatForm.desc}
                              onChange={(e) => setNewMatForm({ ...newMatForm, desc: e.target.value })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            {editingLensMaterialId && (
                              <button
                                type="button"
                                onClick={cancelEditLensMaterial}
                                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleAddLensMaterial}
                              className="px-4 py-2 rounded-xl bg-navy-dark text-white hover:bg-gold-accent hover:text-navy-dark text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                            >
                              {editingLensMaterialId ? 'Save Lens Material' : 'Add Lens Material'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Lens Features */}
                      <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
                        <span className="text-[10px] text-[#B8952A] font-extrabold uppercase tracking-wider block border-b border-[#FAF9F6] pb-2">3. Lens Coatings & Features</span>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                          {(storeSettings.lensFeatures || []).length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">No coatings/features configured.</p>
                          ) : (
                            (storeSettings.lensFeatures || []).map((feat) => (
                              <div key={feat.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-150 shadow-xxs">
                                <div className="text-left space-y-0.5 max-w-[80%]">
                                  <p className="text-[11px] font-black text-navy-dark flex items-baseline gap-1.5">
                                    <span>{feat.name}</span>
                                    <span className="text-[9.5px] text-[#B8952A] font-black font-sans">
                                      {feat.price > 0 ? `+₹${feat.price}` : 'Free'}
                                    </span>
                                  </p>
                                  <p className="text-[9.5px] text-slate-400 leading-tight font-medium">{feat.desc}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => startEditLensFeature(feat)}
                                    className="text-slate-400 hover:text-gold-accent p-1.5 rounded-lg hover:bg-amber-50 transition-all cursor-pointer"
                                    title="Edit Lens Feature"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveLensFeature(feat.id)}
                                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                                    title="Remove Lens Feature"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Inline Form to Add/Edit Lens Feature */}
                        <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-3">
                          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold">
                            {editingLensFeatureId ? 'Edit Lens Coating / Feature' : 'Add New Lens Coating / Feature'}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="Feature Name"
                              value={newFeatForm.name}
                              onChange={(e) => setNewFeatForm({ ...newFeatForm, name: e.target.value })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                            <input
                              type="number"
                              placeholder="Surcharge (INR)"
                              value={newFeatForm.price || ''}
                              onChange={(e) => setNewFeatForm({ ...newFeatForm, price: Number(e.target.value) })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                            <input
                              type="text"
                              placeholder="Description"
                              value={newFeatForm.desc}
                              onChange={(e) => setNewFeatForm({ ...newFeatForm, desc: e.target.value })}
                              className="border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-3 py-2 bg-slate-50/50 text-[10px] font-bold text-text-primary"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            {editingLensFeatureId && (
                              <button
                                type="button"
                                onClick={cancelEditLensFeature}
                                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleAddLensFeature}
                              className="px-4 py-2 rounded-xl bg-navy-dark text-white hover:bg-gold-accent hover:text-navy-dark text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer"
                            >
                              {editingLensFeatureId ? 'Save Lens Feature' : 'Add Lens Feature'}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={loadData}
                      className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer"
                    >
                      Reset changes
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-navy-dark text-white hover:bg-gold-accent hover:text-navy-dark text-[10px] font-extrabold uppercase tracking-widest cursor-pointer shadow-[0_4px_14px_rgba(15,39,68,0.2)] hover:shadow-none transition-all duration-300"
                    >
                      Save Prescription Settings
                    </button>
                  </div>

                </form>
              </div>
            )}

            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <CouponManagementPanel />
              </div>
            )}


          </div>
        )}
      </main>

      {/* 5. ADD FRAME MODAL OVERLAY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F2744]/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden border border-slate-200 shadow-luxury space-y-6 p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setIsAddModalOpen(false); resetProductForm(); }}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-navy-primary hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-widest block">EyeLeads Creator</span>
              <h3 className="text-xl font-light font-serif text-navy-dark">Create Premium Product Frame</h3>
            </div>

            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-bold text-text-muted">

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Frame Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Zephyr Titanium Round"
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Brand Tier</label>
                <select
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50"
                >
                  <option value="EyeLeads Classic">EyeLeads Classic</option>
                  <option value="EyeLeads Bold">EyeLeads Bold</option>
                  <option value="EyeLeads Flexx">EyeLeads Flexx</option>
                  <option value="EyeLeads Apex">EyeLeads Apex</option>
                  <option value="EyeLeads Craft">EyeLeads Craft</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Lens Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50"
                >
                  <option value="Eyeglasses">Eyeglasses</option>
                  <option value="Sunglasses">Sunglasses</option>
                  <option value="Computer Glasses">Computer Glasses</option>
                  <option value="Sports">Sports</option>
                  <option value="Kids">Kids</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Cleaning Kits">Cleaning Kits</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Geometric Shape</label>
                <select
                  value={productForm.frameShape}
                  onChange={(e) => setProductForm({ ...productForm, frameShape: e.target.value })}
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50"
                >
                  <option value="Round">Round</option>
                  <option value="Square">Square</option>
                  <option value="Aviator">Aviator</option>
                  <option value="Cat-Eye">Cat-Eye</option>
                  <option value="Rectangle">Rectangle</option>
                  <option value="Wayfarer">Wayfarer</option>
                  <option value="Oval">Oval</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Material Matrix</label>
                <input
                  type="text"
                  required
                  value={productForm.material}
                  onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                  list="materials-list-add"
                  placeholder="e.g. Acetate, Carbon Fiber"
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary text-xs font-bold"
                />
                <datalist id="materials-list-add">
                  <option value="Acetate" />
                  <option value="Titanium" />
                  <option value="Metal" />
                  <option value="TR90" />
                  <option value="Wood" />
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Gender Target</label>
                <select
                  value={productForm.gender}
                  onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Unisex</option>
                  <option value="Kids">Kids</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Base Frame Price (INR)</label>
                <input
                  type="number"
                  required
                  disabled={productForm.onSale}
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary disabled:opacity-75 disabled:bg-slate-100/50 text-xs font-bold"
                  title={productForm.onSale ? "Calculated automatically when On Sale is enabled" : ""}
                />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">MRP Comparison Price (INR)</label>
                <input
                  type="number"
                  required
                  value={productForm.mrp}
                  onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary text-xs font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Discount Percentage (%)</label>
                <input
                  type="number"
                  required
                  disabled={!productForm.onSale}
                  value={productForm.discount || 0}
                  onChange={(e) => setProductForm({ ...productForm, discount: Number(e.target.value) })}
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary disabled:opacity-50 text-xs font-bold"
                  placeholder="e.g. 10 for 10% off"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="uppercase tracking-wider text-[9px]">Eyewear Product Warranty Terms (e.g. 1-Year Warranty)</label>
                <input
                  type="text"
                  required
                  value={productForm.warranty || ''}
                  onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary"
                  placeholder="e.g. 1-Year Warranty"
                />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Product Weight (Grams)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={productForm.weightGrams}
                  onChange={(e) => setProductForm({ ...productForm, weightGrams: Number(e.target.value) })}
                  className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary text-xs font-bold"
                  placeholder="e.g. 250"
                />
              </div>

              <div className="space-y-2">
                <label className="uppercase tracking-wider text-[9px]">Weight Tier Classification</label>
                <div className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 text-xs font-extrabold flex items-center justify-between min-h-[46px]">
                  {(() => {
                    const w = productForm.weightGrams || 0;
                    if (w < 200) {
                      return (
                        <>
                          <span className="text-emerald-600">Light Weight Tier</span>
                          <span className="text-slate-400 font-bold">Avg. Shipping: ~₹80</span>
                        </>
                      );
                    } else if (w <= 500) {
                      return (
                        <>
                          <span className="text-[#B8952A]">Medium Weight Tier</span>
                          <span className="text-slate-400 font-bold">Avg. Shipping: ~₹120</span>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <span className="text-rose-600">Heavy Weight Tier</span>
                          <span className="text-slate-400 font-bold">Avg. Shipping: ~₹160</span>
                        </>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Product Showcase Video Upload & Config */}
              <div className="space-y-2 md:col-span-2 border-t border-slate-100 pt-4">
                <span className="text-[#B8952A] text-[9px] font-extrabold uppercase tracking-widest block">Product Video Showcase (Optional)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="uppercase tracking-wider text-[8px] block text-slate-500">Video Link / URL</label>
                    <input
                      type="text"
                      value={productForm.videoUrl || ''}
                      onChange={(e) => setProductForm({ ...productForm, videoUrl: e.target.value })}
                      className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary text-xs"
                      placeholder="Paste MP4 video link or upload below..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="uppercase tracking-wider text-[8px] block text-slate-500">Video Thumbnail Override URL</label>
                    <input
                      type="text"
                      value={productForm.videoThumbnail || ''}
                      onChange={(e) => setProductForm({ ...productForm, videoThumbnail: e.target.value })}
                      className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary text-xs"
                      placeholder="Paste thumbnail image URL..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="uppercase tracking-wider text-[8px] block text-slate-500">Upload Video File (Drag & Drop)</label>
                  <div
                    onDragEnter={handleProductVideoDrag}
                    onDragOver={handleProductVideoDrag}
                    onDragLeave={handleProductVideoDrag}
                    onDrop={handleProductVideoDrop}
                    className={`w-full min-h-[90px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all duration-300 relative ${
                      productVideoDragActive
                        ? 'border-gold-accent bg-gold-accent/5 scale-[1.01]'
                        : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-gold-accent/50'
                    }`}
                  >
                    <input
                      type="file"
                      accept="video/*"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          await uploadProductVideo(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {productVideoUploading ? (
                      <div className="flex flex-col items-center gap-1.5 text-slate-400">
                        <Loader className="h-5 w-5 animate-spin text-gold-accent" />
                        <p className="text-[9px] font-black uppercase tracking-wider text-[#B8952A]">Uploading video...</p>
                      </div>
                    ) : productForm.videoUrl ? (
                      <div className="flex items-center gap-3 w-full pr-6 relative z-0">
                        <video src={productForm.videoUrl} className="w-10 h-10 rounded-lg object-cover border border-slate-200" muted />
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-[10px] font-bold text-navy-dark truncate">{productForm.videoUrl}</p>
                          <p className="text-[8px] text-[#B8952A] uppercase tracking-wider mt-0.5">Drag new video to replace</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setProductForm(prev => ({ ...prev, videoUrl: '' }));
                          }}
                          className="px-2.5 py-1 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded text-[9px] uppercase tracking-wider font-extrabold cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500">
                        <Plus className="h-5 w-5 text-gold-accent" />
                        <p className="text-[9.5px] font-extrabold text-navy-dark leading-none">Drop video here, or click to upload</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Virtual Try-On Assets Upload (Lenskart AR) */}
              <div className="space-y-3 md:col-span-2 border-t border-slate-100 pt-4">
                <span className="text-[#B8952A] text-[9px] font-extrabold uppercase tracking-widest block">Virtual Try-On AR Assets (Optional)</span>
                <p className="text-[10px] text-slate-400 font-semibold">Upload transparent PNG frame cuts to enable Lenskart-style real-time 3D Try-On.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Front PNG Upload */}
                  <div className="space-y-2">
                    <label className="uppercase tracking-wider text-[8px] block text-slate-500">Try-On Front Photo (Transparent PNG)</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="flex-1 min-w-0">
                        {productForm.tryOnAssets?.frontPng ? (
                          <div className="flex items-center gap-2">
                            <img src={productForm.tryOnAssets.frontPng} alt="Try-On Front Asset" className="w-10 h-10 object-contain bg-slate-200 rounded border border-slate-300" />
                            <p className="text-[9.5px] text-navy-dark font-mono truncate">{productForm.tryOnAssets.frontPng}</p>
                          </div>
                        ) : (
                          <p className="text-[9.5px] text-slate-400 italic">No front photo uploaded</p>
                        )}
                      </div>
                      <div className="relative shrink-0">
                        <input
                          type="file"
                          accept="image/png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              uploadTryOnAsset(e.target.files[0], 'front');
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button
                          type="button"
                          disabled={tryOnUploading.front}
                          className="px-3 py-1.5 bg-[#1B3F6E] text-white text-[9.5px] font-extrabold uppercase tracking-wider rounded-lg shadow-sm hover:bg-[#B8952A]"
                        >
                          {tryOnUploading.front ? 'Uploading...' : 'Upload Front'}
                        </button>
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-400 leading-normal">Straight-on view of the glasses only, background removed.</p>
                  </div>

                  {/* Angled PNG Upload */}
                  <div className="space-y-2">
                    <label className="uppercase tracking-wider text-[8px] block text-slate-500">Try-On Angled Photo (Transparent PNG)</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="flex-1 min-w-0">
                        {productForm.tryOnAssets?.anglePng ? (
                          <div className="flex items-center gap-2">
                            <img src={productForm.tryOnAssets.anglePng} alt="Try-On Angled Asset" className="w-10 h-10 object-contain bg-slate-200 rounded border border-slate-300" />
                            <p className="text-[9.5px] text-navy-dark font-mono truncate">{productForm.tryOnAssets.anglePng}</p>
                          </div>
                        ) : (
                          <p className="text-[9.5px] text-slate-400 italic">No angled photo uploaded</p>
                        )}
                      </div>
                      <div className="relative shrink-0">
                        <input
                          type="file"
                          accept="image/png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              uploadTryOnAsset(e.target.files[0], 'angle');
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button
                          type="button"
                          disabled={tryOnUploading.angle}
                          className="px-3 py-1.5 bg-[#1B3F6E] text-white text-[9.5px] font-extrabold uppercase tracking-wider rounded-lg shadow-sm hover:bg-[#B8952A]"
                        >
                          {tryOnUploading.angle ? 'Uploading...' : 'Upload Angled'}
                        </button>
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-400 leading-normal">3/4 angle shot of the same glasses, background removed.</p>
                  </div>
                </div>

                {/* Frame Width Input */}
                <div className="w-full sm:w-1/2 pt-2">
                  <label className="uppercase tracking-wider text-[8.5px] block text-slate-500 mb-1">Real-World Frame Width (mm)</label>
                  <input
                    type="number"
                    value={productForm.tryOnAssets?.frameWidthMm || 138}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      tryOnAssets: {
                        ...productForm.tryOnAssets,
                        frameWidthMm: Number(e.target.value) || 138
                      }
                    })}
                    placeholder="e.g. 138"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white text-text-primary text-xs font-bold"
                  />
                  <p className="text-[8px] text-slate-400 leading-normal mt-1">Real width of the frame in millimeters (temple-to-temple). Used to scale the virtual frame precisely to the wearer's face.</p>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="uppercase tracking-wider text-[9px] block">Color Options (Add multiple)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="new-color-input-add"
                    placeholder="Enter color (e.g., Gold, Black, Tortoise)"
                    className="flex-grow border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val && !productForm.colors.includes(val)) {
                          setProductForm({
                            ...productForm,
                            colors: [...productForm.colors, val]
                          });
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('new-color-input-add');
                      const val = input.value.trim();
                      if (val && !productForm.colors.includes(val)) {
                        setProductForm({
                          ...productForm,
                          colors: [...productForm.colors, val]
                        });
                        input.value = '';
                      }
                    }}
                    className="bg-navy-dark text-white px-4 py-3 rounded-xl text-xxs font-extrabold uppercase tracking-widest hover:bg-[#1B3F6E] transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {productForm.colors.map((color, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-slate-100 text-[#4A4A6A] text-[9.5px] font-extrabold uppercase tracking-wider border border-slate-200/40 flex items-center gap-1.5"
                    >
                      <span>{color}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setProductForm({
                            ...productForm,
                            colors: productForm.colors.filter((_, i) => i !== idx)
                          });
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {productForm.colors.length === 0 && (
                    <span className="text-[10px] text-slate-400 italic">No colors added yet (default is Black)</span>
                  )}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="uppercase tracking-wider text-[9px]">Eyewear Frame Images (Drag & Drop • Max 5)</label>

                {/* Drag and Drop Zone Container */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`w-full min-h-[140px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-300 relative ${dragActive
                      ? 'border-gold-accent bg-gold-accent/5 scale-[1.01]'
                      : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-gold-accent/50'
                    }`}
                >
                  <input
                    type="file"
                    id="file-upload-multiple-add"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  {imageUploading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader className="h-8 w-8 animate-spin text-gold-accent" />
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#B8952A]">Uploading Frame Assets...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <Plus className="h-8 w-8 stroke-[1.5] text-gold-accent" />
                      <p className="text-[11px] font-extrabold text-navy-dark leading-none">
                        Drag & Drop frame files here, or <span className="text-[#B8952A] hover:underline">browse</span>
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Supports PNG, JPG, WEBP (Up to 5MB files)</p>
                    </div>
                  )}
                </div>

                {/* Previews grid if images are present */}
                {Array.isArray(productForm.images) && productForm.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {productForm.images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className={`aspect-[4/3] rounded-xl border overflow-hidden bg-slate-100 relative shadow-xxs group hover:scale-[1.03] transition-all duration-300 ${index === 0 ? 'border-gold-accent ring-2 ring-gold-accent/20' : 'border-slate-200'
                          }`}
                        title={index === 0 ? "Primary catalogue image" : "Alternative swatch preview"}
                      >
                        <img src={imgUrl} alt={`Catalogue Frame ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1.5 right-1.5 bg-rose-600/90 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow hover:bg-rose-600 z-20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-1 left-1.5 bg-gold-accent text-navy-dark text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-2 pt-4 flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="prescriptionAvailable"
                    checked={productForm.prescriptionAvailable}
                    onChange={(e) => setProductForm({ ...productForm, prescriptionAvailable: e.target.checked })}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                  />
                  <label htmlFor="prescriptionAvailable" className="uppercase tracking-wider text-[9px] cursor-pointer">Optometry Support</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inStockOnly"
                    checked={productForm.inStockOnly}
                    onChange={(e) => setProductForm({ ...productForm, inStockOnly: e.target.checked })}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                  />
                  <label htmlFor="inStockOnly" className="uppercase tracking-wider text-[9px] cursor-pointer">In Stock Only</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isCleaningKit"
                    checked={productForm.isCleaningKit || false}
                    onChange={(e) => setProductForm({ ...productForm, isCleaningKit: e.target.checked })}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                  />
                  <label htmlFor="isCleaningKit" className="uppercase tracking-wider text-[9px] cursor-pointer">Cleaning Kit</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="onSale"
                    checked={productForm.onSale}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      if (isChecked) {
                        setProductForm(prev => ({
                          ...prev,
                          onSale: true,
                          mrp: prev.price,
                          discount: 0
                        }));
                      } else {
                        setProductForm(prev => ({
                          ...prev,
                          onSale: false,
                          price: prev.mrp,
                          discount: 0
                        }));
                      }
                    }}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                  />
                  <label htmlFor="onSale" className="uppercase tracking-wider text-[9px] cursor-pointer">On Sale</label>
                </div>
              </div>

              <div className="md:col-span-2 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); resetProductForm(); }}
                  className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-navy-dark text-white hover:bg-gold-accent hover:text-navy-dark text-[10px] font-extrabold uppercase tracking-widest cursor-pointer shadow transition-colors"
                >
                  Insert Frame
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT FRAME DRAWER (SLIDE-OVER) */}
      {isEditDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#0F2744]/70 backdrop-blur-xs flex justify-end select-none animate-fadeIn">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-8 space-y-6 overflow-y-auto border-l border-slate-100 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-widest block">Editor Panel</span>
                  <h3 className="text-xl font-light font-serif text-navy-dark">Update Eyewear Frame</h3>
                </div>
                <button
                  onClick={() => { setIsEditDrawerOpen(false); setSelectedProduct(null); resetProductForm(); }}
                  className="p-2 rounded-full text-slate-400 hover:text-navy-primary hover:bg-slate-50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-5 text-xs font-bold text-text-muted">

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Frame Name</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Lens Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50"
                  >
                    <option value="Eyeglasses">Eyeglasses</option>
                    <option value="Sunglasses">Sunglasses</option>
                    <option value="Computer Glasses">Computer Glasses</option>
                    <option value="Sports">Sports</option>
                    <option value="Kids">Kids</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Cleaning Kits">Cleaning Kits</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Geometric Shape</label>
                  <select
                    value={productForm.frameShape}
                    onChange={(e) => setProductForm({ ...productForm, frameShape: e.target.value })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50"
                  >
                    <option value="Round">Round</option>
                    <option value="Square">Square</option>
                    <option value="Aviator">Aviator</option>
                    <option value="Cat-Eye">Cat-Eye</option>
                    <option value="Rectangle">Rectangle</option>
                    <option value="Wayfarer">Wayfarer</option>
                    <option value="Oval">Oval</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Material Matrix</label>
                  <input
                    type="text"
                    required
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    list="materials-list-edit"
                    placeholder="e.g. Acetate, Carbon Fiber"
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 focus:bg-white text-text-primary text-xs font-bold"
                  />
                  <datalist id="materials-list-edit">
                    <option value="Acetate" />
                    <option value="Titanium" />
                    <option value="Metal" />
                    <option value="TR90" />
                    <option value="Wood" />
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Gender Target</label>
                  <select
                    value={productForm.gender}
                    onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Base Frame Price (INR)</label>
                  <input
                    type="number"
                    required
                    disabled={productForm.onSale}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary disabled:opacity-75 disabled:bg-slate-100/50"
                    title={productForm.onSale ? "Calculated automatically when On Sale is enabled" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">MRP Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Discount Percentage (%)</label>
                  <input
                    type="number"
                    required
                    disabled={!productForm.onSale}
                    value={productForm.discount || 0}
                    onChange={(e) => setProductForm({ ...productForm, discount: Number(e.target.value) })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary disabled:opacity-50"
                    placeholder="e.g. 10 for 10% off"
                  />
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Product Warranty Terms (e.g. 1-Year Warranty)</label>
                  <input
                    type="text"
                    required
                    value={productForm.warranty || ''}
                    onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary"
                    placeholder="e.g. 1-Year Warranty"
                  />
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Product Weight (Grams)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={productForm.weightGrams}
                    onChange={(e) => setProductForm({ ...productForm, weightGrams: Number(e.target.value) })}
                    className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary text-xs font-bold"
                    placeholder="e.g. 250"
                  />
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Weight Tier Classification</label>
                  <div className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50/50 text-xs font-extrabold flex items-center justify-between min-h-[46px]">
                    {(() => {
                      const w = productForm.weightGrams || 0;
                      if (w < 200) {
                        return (
                          <>
                            <span className="text-emerald-600">Light Weight Tier</span>
                            <span className="text-slate-400 font-bold">Avg. Shipping: ~₹80</span>
                          </>
                        );
                      } else if (w <= 500) {
                        return (
                          <>
                            <span className="text-[#B8952A]">Medium Weight Tier</span>
                            <span className="text-slate-400 font-bold">Avg. Shipping: ~₹120</span>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <span className="text-rose-600">Heavy Weight Tier</span>
                            <span className="text-slate-400 font-bold">Avg. Shipping: ~₹160</span>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* Product Showcase Video Upload & Config */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[#B8952A] text-[9px] font-extrabold uppercase tracking-widest block">Product Video Showcase (Optional)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="uppercase tracking-wider text-[8px] block text-slate-500">Video Link / URL</label>
                      <input
                        type="text"
                        value={productForm.videoUrl || ''}
                        onChange={(e) => setProductForm({ ...productForm, videoUrl: e.target.value })}
                        className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary text-xs"
                        placeholder="Paste MP4 video link or upload below..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="uppercase tracking-wider text-[8px] block text-slate-500">Video Thumbnail Override URL</label>
                      <input
                        type="text"
                        value={productForm.videoThumbnail || ''}
                        onChange={(e) => setProductForm({ ...productForm, videoThumbnail: e.target.value })}
                        className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary text-xs"
                        placeholder="Paste thumbnail image URL..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="uppercase tracking-wider text-[8px] block text-slate-500">Upload Video File (Drag & Drop)</label>
                    <div
                      onDragEnter={handleProductVideoDrag}
                      onDragOver={handleProductVideoDrag}
                      onDragLeave={handleProductVideoDrag}
                      onDrop={handleProductVideoDrop}
                      className={`w-full min-h-[90px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all duration-300 relative ${
                        productVideoDragActive
                          ? 'border-gold-accent bg-gold-accent/5 scale-[1.01]'
                          : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-gold-accent/50'
                      }`}
                    >
                      <input
                        type="file"
                        accept="video/*"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            await uploadProductVideo(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {productVideoUploading ? (
                        <div className="flex flex-col items-center gap-1.5 text-slate-400">
                          <Loader className="h-5 w-5 animate-spin text-gold-accent" />
                          <p className="text-[9px] font-black uppercase tracking-wider text-[#B8952A]">Uploading video...</p>
                        </div>
                      ) : productForm.videoUrl ? (
                        <div className="flex items-center gap-3 w-full pr-6 relative z-0">
                          <video src={productForm.videoUrl} className="w-10 h-10 rounded-lg object-cover border border-slate-200" muted />
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-[10px] font-bold text-navy-dark truncate">{productForm.videoUrl}</p>
                            <p className="text-[8px] text-[#B8952A] uppercase tracking-wider mt-0.5">Drag new video to replace</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setProductForm(prev => ({ ...prev, videoUrl: '' }));
                            }}
                            className="px-2.5 py-1 text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded text-[9px] uppercase tracking-wider font-extrabold cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <Plus className="h-5 w-5 text-gold-accent" />
                          <p className="text-[9.5px] font-extrabold text-navy-dark leading-none">Drop video here, or click to upload</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px]">Eyewear Frame Images (Drag & Drop • Max 5)</label>

                  {/* Drag and Drop Zone Container */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`w-full min-h-[120px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all duration-300 relative ${dragActive
                        ? 'border-gold-accent bg-gold-accent/5 scale-[1.01]'
                        : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-gold-accent/50'
                      }`}
                  >
                    <input
                      type="file"
                      id="file-upload-multiple-edit"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {imageUploading ? (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader className="h-6 w-6 animate-spin text-gold-accent" />
                        <p className="text-[9px] font-black uppercase tracking-wider text-[#B8952A]">Uploading Frame Assets...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-500">
                        <Plus className="h-6 w-6 stroke-[1.5] text-gold-accent" />
                        <p className="text-[10px] font-extrabold text-navy-dark leading-none">
                          Drag & Drop files here, or <span className="text-[#B8952A] hover:underline">browse</span>
                        </p>
                        <p className="text-[8px] text-slate-400 font-semibold mt-0.5">PNG, JPG, WEBP (Max 5MB)</p>
                      </div>
                    )}
                  </div>

                  {/* Previews grid if images are present */}
                  {Array.isArray(productForm.images) && productForm.images.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 mt-3">
                      {productForm.images.map((imgUrl, index) => (
                        <div
                          key={index}
                          className={`aspect-[4/3] rounded-lg border overflow-hidden bg-slate-100 relative shadow-xxs group hover:scale-[1.03] transition-all duration-300 ${index === 0 ? 'border-gold-accent ring-2 ring-gold-accent/20' : 'border-slate-200'
                            }`}
                          title={index === 0 ? "Primary catalogue image" : "Alternative swatch preview"}
                        >
                          <img src={imgUrl} alt={`Catalogue Frame ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 bg-rose-600/90 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow hover:bg-rose-600 z-20"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                          {index === 0 && (
                            <span className="absolute bottom-0.5 left-1 bg-gold-accent text-navy-dark text-[6px] font-black uppercase tracking-wider px-1 py-0.2 rounded">
                              Primary
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="uppercase tracking-wider text-[9px] block">Color Options (Add multiple)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="new-color-input-edit"
                      placeholder="Enter color (e.g., Gold, Black, Tortoise)"
                      className="flex-grow border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-3 bg-slate-50/50 text-text-primary text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val && !productForm.colors.includes(val)) {
                            setProductForm({
                              ...productForm,
                              colors: [...productForm.colors, val]
                            });
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('new-color-input-edit');
                        const val = input.value.trim();
                        if (val && !productForm.colors.includes(val)) {
                          setProductForm({
                            ...productForm,
                            colors: [...productForm.colors, val]
                          });
                          input.value = '';
                        }
                      }}
                      className="bg-navy-dark text-white px-4 py-3 rounded-xl text-xxs font-extrabold uppercase tracking-widest hover:bg-[#1B3F6E] transition-all cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {productForm.colors.map((color, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-full bg-slate-100 text-[#4A4A6A] text-[9.5px] font-extrabold uppercase tracking-wider border border-slate-200/40 flex items-center gap-1.5"
                      >
                        <span>{color}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              colors: productForm.colors.filter((_, i) => i !== idx)
                            });
                          }}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {productForm.colors.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">No colors added yet (default is Black)</span>
                    )}
                  </div>
                </div>

                {/* Virtual Try-On Assets Upload (Lenskart AR) */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <span className="text-[#B8952A] text-[9px] font-extrabold uppercase tracking-widest block">Virtual Try-On AR Assets (Optional)</span>
                  
                  {/* Front PNG Upload */}
                  <div className="space-y-2">
                    <label className="uppercase tracking-wider text-[8px] block text-slate-500">Try-On Front Photo (Transparent PNG)</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                      <div className="flex-1 min-w-0">
                        {productForm.tryOnAssets?.frontPng ? (
                          <div className="flex items-center gap-1.5">
                            <img src={productForm.tryOnAssets.frontPng} alt="Try-On Front Asset" className="w-8 h-8 object-contain bg-slate-200 rounded border border-slate-300" />
                            <p className="text-[9px] text-navy-dark font-mono truncate">{productForm.tryOnAssets.frontPng}</p>
                          </div>
                        ) : (
                          <p className="text-[9px] text-slate-400 italic">No front photo uploaded</p>
                        )}
                      </div>
                      <div className="relative shrink-0">
                        <input
                          type="file"
                          accept="image/png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              uploadTryOnAsset(e.target.files[0], 'front');
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button
                          type="button"
                          disabled={tryOnUploading.front}
                          className="px-2.5 py-1.5 bg-[#1B3F6E] text-white text-[9px] font-extrabold uppercase tracking-wider rounded-lg shadow-xs hover:bg-[#B8952A]"
                        >
                          {tryOnUploading.front ? 'Uploading...' : 'Upload Front'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Angled PNG Upload */}
                  <div className="space-y-2">
                    <label className="uppercase tracking-wider text-[8px] block text-slate-500">Try-On Angled Photo (Transparent PNG)</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                      <div className="flex-1 min-w-0">
                        {productForm.tryOnAssets?.anglePng ? (
                          <div className="flex items-center gap-1.5">
                            <img src={productForm.tryOnAssets.anglePng} alt="Try-On Angled Asset" className="w-8 h-8 object-contain bg-slate-200 rounded border border-slate-300" />
                            <p className="text-[9px] text-navy-dark font-mono truncate">{productForm.tryOnAssets.anglePng}</p>
                          </div>
                        ) : (
                          <p className="text-[9px] text-slate-400 italic">No angled photo uploaded</p>
                        )}
                      </div>
                      <div className="relative shrink-0">
                        <input
                          type="file"
                          accept="image/png"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              uploadTryOnAsset(e.target.files[0], 'angle');
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button
                          type="button"
                          disabled={tryOnUploading.angle}
                          className="px-2.5 py-1.5 bg-[#1B3F6E] text-white text-[9px] font-extrabold uppercase tracking-wider rounded-lg shadow-xs hover:bg-[#B8952A]"
                        >
                          {tryOnUploading.angle ? 'Uploading...' : 'Upload Angled'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Frame Width Input */}
                  <div className="space-y-2">
                    <label className="uppercase tracking-wider text-[8.5px] block text-slate-500">Real-World Frame Width (mm)</label>
                    <input
                      type="number"
                      value={productForm.tryOnAssets?.frameWidthMm || 138}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        tryOnAssets: {
                          ...productForm.tryOnAssets,
                          frameWidthMm: Number(e.target.value) || 138
                        }
                      })}
                      className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-slate-50/50 focus:bg-white text-text-primary text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">      </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="prescriptionEdit"
                      checked={productForm.prescriptionAvailable}
                      onChange={(e) => setProductForm({ ...productForm, prescriptionAvailable: e.target.checked })}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                    />
                    <label htmlFor="prescriptionEdit" className="uppercase tracking-wider text-[9px] cursor-pointer">Optometry Support</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="stockEdit"
                      checked={productForm.inStockOnly}
                      onChange={(e) => setProductForm({ ...productForm, inStockOnly: e.target.checked })}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                    />
                    <label htmlFor="stockEdit" className="uppercase tracking-wider text-[9px] cursor-pointer">In Stock</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isCleaningKitEdit"
                      checked={productForm.isCleaningKit || false}
                      onChange={(e) => setProductForm({ ...productForm, isCleaningKit: e.target.checked })}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                    />
                    <label htmlFor="isCleaningKitEdit" className="uppercase tracking-wider text-[9px] cursor-pointer">Cleaning Kit</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="onSaleEdit"
                      checked={productForm.onSale}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          setProductForm(prev => ({
                            ...prev,
                            onSale: true,
                            mrp: prev.price,
                            discount: 0
                          }));
                        } else {
                          setProductForm(prev => ({
                            ...prev,
                            onSale: false,
                            price: prev.mrp,
                            discount: 0
                          }));
                        }
                      }}
                      className="h-4.5 w-4.5 rounded border-slate-300 text-gold-accent focus:ring-gold-accent cursor-pointer"
                    />
                    <label htmlFor="onSaleEdit" className="uppercase tracking-wider text-[9px] cursor-pointer">On Sale</label>
                  </div>
                </div>

                <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setIsEditDrawerOpen(false); setSelectedProduct(null); resetProductForm(); }}
                    className="px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-[10px] font-extrabold uppercase tracking-widest cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-navy-dark text-white hover:bg-gold-accent hover:text-navy-dark text-[10px] font-extrabold uppercase tracking-widest cursor-pointer shadow transition-colors"
                  >
                    Apply Edits
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRESCRIPTION VISUALIZER MODAL */}
      {isRxViewOpen && selectedRx && (
        <div className="fixed inset-0 z-50 bg-[#0F2744]/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden border border-slate-200 shadow-luxury p-8 relative">
            <button
              onClick={() => { setIsRxViewOpen(false); setSelectedRx(null); }}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-navy-primary hover:bg-slate-50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-widest block">Optical Diagnostics</span>
                <h3 className="text-lg font-light font-serif text-navy-dark">Prescription Parameters</h3>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 text-xs font-bold text-text-muted">

                {selectedRx.options?.prescriptionData ? (
                  <div className="space-y-4 text-left">
                    {/* OD vs OS Table */}
                    {(selectedRx.options.prescriptionData.rightSph || selectedRx.options.prescriptionData.leftSph) ? (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white animate-fadeIn">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-[11px]">
                          <thead className="bg-slate-50 text-[8px] uppercase tracking-wider font-extrabold text-navy-primary">
                            <tr>
                              <th className="py-2 px-2.5">Eye</th>
                              <th className="py-2 px-2.5">SPH</th>
                              <th className="py-2 px-2.5">CYL</th>
                              <th className="py-2 px-2.5">AXIS</th>
                              <th className="py-2 px-2.5">ADD</th>
                              <th className="py-2 px-2.5">PRISM</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-navy-dark bg-white">
                            <tr>
                              <td className="py-2 px-2.5 font-extrabold text-slate-400">R (OD)</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.rightSph || '0.00'}</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.rightCyl || '0.00'}</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.rightAxis || '—'}</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.rightAdd || '—'}</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.rightPrism || '—'}</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-2.5 font-extrabold text-slate-400">L (OS)</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.leftSph || '0.00'}</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.leftCyl || '0.00'}</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.leftAxis || '—'}</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.leftAdd || '—'}</td>
                              <td className="py-2 px-2.5 font-mono">{selectedRx.options.prescriptionData.leftPrism || '—'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-[#1B3F6E] bg-white font-extrabold text-[10px] animate-fadeIn shadow-xxs">
                        📄 Prescription uploaded via photo attachment.
                      </div>
                    )}

                    {/* PD / Doc details */}
                    <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200/50 text-[10px]">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Pupillary Distance (PD)</span>
                        <p className="text-navy-dark font-extrabold">{selectedRx.options.prescriptionData.pd || '63 mm'}</p>
                      </div>
                      {selectedRx.options.prescriptionData.doctorName && (
                        <div className="space-y-0.5">
                          <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block font-bold">Doctor Name</span>
                          <p className="text-navy-dark font-extrabold truncate">{selectedRx.options.prescriptionData.doctorName}</p>
                        </div>
                      )}
                      {selectedRx.options.prescriptionData.prescriptionDate && (
                        <div className="space-y-0.5 col-span-2 border-t border-slate-100 pt-1.5">
                          <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Prescription Date</span>
                          <p className="text-navy-dark font-extrabold">
                            {new Date(selectedRx.options.prescriptionData.prescriptionDate).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Lens configurations */}
                    {selectedRx.options.prescriptionData.lensConfig && (
                      <div className="bg-white p-3 rounded-xl border border-slate-200/50 space-y-2 text-[10px]">
                        <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block font-extrabold">Lens Customizations</span>
                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                          {selectedRx.options.prescriptionData.lensConfig.material && (
                            <div>
                              <span className="text-slate-400 text-[7px] uppercase block">Material</span>
                              <span className="text-navy-dark font-bold">{selectedRx.options.prescriptionData.lensConfig.material}</span>
                            </div>
                          )}
                          {selectedRx.options.prescriptionData.lensConfig.tint && (
                            <div>
                              <span className="text-slate-400 text-[7px] uppercase block">Tint</span>
                              <span className="text-navy-dark font-bold">{selectedRx.options.prescriptionData.lensConfig.tint}</span>
                            </div>
                          )}
                          {selectedRx.options.prescriptionData.lensConfig.features && selectedRx.options.prescriptionData.lensConfig.features.length > 0 && (
                            <div className="col-span-2 border-t border-slate-100 pt-1.5">
                              <span className="text-slate-400 text-[7px] uppercase block">Coatings / Add-ons</span>
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {selectedRx.options.prescriptionData.lensConfig.features.map((f, fi) => (
                                  <span key={fi} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[8px] uppercase tracking-wider font-extrabold border border-blue-100">{f}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[8px] uppercase tracking-wider">Lens Selected</span>
                      <p className="text-navy-dark truncate">{selectedRx.lensType || selectedRx.options?.lensType || 'Single Vision'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 text-[8px] uppercase tracking-wider">Pupillary Distance</span>
                      <p className="text-navy-dark">{selectedRx.prescriptionOptions?.pd || selectedRx.options?.pdEntered || '63 mm (Avg)'}</p>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200/50 pt-4 space-y-2">
                  <span className="text-slate-400 text-[8px] uppercase tracking-wider block">Uploaded Medical Card</span>
                  {(selectedRx.prescriptionUploaded || selectedRx.options?.rxAttached || selectedRx.options?.prescriptionData?.rxAttached) ? (
                    <div className="aspect-[16/10] rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 flex items-center justify-center relative animate-fadeIn">
                      <img 
                        src={(selectedRx.options?.rxAttached || selectedRx.options?.prescriptionData?.rxAttached || '').match(/\.(jpg|jpeg|png|webp|gif)/i) 
                          ? (selectedRx.options?.rxAttached || selectedRx.options?.prescriptionData?.rxAttached)
                          : "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=80"
                        } 
                        alt="Customer Doctor Card Upload" 
                        className="w-full h-full object-cover opacity-60" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center flex-col gap-1 text-white bg-black/40">
                        <FileText className="h-8 w-8 text-gold-accent animate-bounce" />
                        <span className="text-[9px] uppercase tracking-widest font-black truncate max-w-[200px] px-2">
                          {(selectedRx.options?.rxAttached || selectedRx.options?.prescriptionData?.rxAttached || 'doctor_prescription.pdf').split('/').pop()}
                        </span>
                        {(selectedRx.options?.rxAttached || selectedRx.options?.prescriptionData?.rxAttached) && (
                          <a 
                            href={selectedRx.options?.rxAttached || selectedRx.options?.prescriptionData?.rxAttached} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-2 px-3 py-1 bg-gold-accent hover:bg-white text-navy-dark font-extrabold rounded text-[8px] uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            View Document
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                      <p className="text-[10px] font-medium leading-relaxed">No medical image file was uploaded. Customer opted for manual optician parameters input.</p>
                    </div>
                  )}
                </div>

                {selectedRx.orderId && (
                  <div className="border-t border-slate-200/50 pt-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                      <span>Verification Status</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider ${selectedRx.currentStatus === 'Verified'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : selectedRx.currentStatus === 'Flagged / Action Required'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-[#B8952A] border border-amber-100'
                        }`}>{selectedRx.currentStatus}</span>
                    </div>
                    {selectedRx.currentStatus !== 'Verified' && (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleVerifyPrescription(selectedRx.orderId, 'Flagged / Action Required')}
                          className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase cursor-pointer transition-colors"
                        >
                          Flag Action Req.
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyPrescription(selectedRx.orderId, 'Verified')}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase cursor-pointer transition-colors"
                        >
                          Approve & Verify
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. ORDER DETAILS INSPECTOR MODAL */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#0F2744]/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-4xl overflow-hidden border border-slate-200 shadow-luxury p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setIsOrderModalOpen(false); setSelectedOrder(null); }}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-navy-primary hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              {/* Modal Title / General Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 pr-10">
                <div className="space-y-1">
                  <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-widest block">Fulfillment Center</span>
                  <h3 className="text-xl font-light font-serif text-navy-dark">Purchase Receipt Details</h3>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 animate-fadeIn">
                    Order Ref: {selectedOrder.orderNumber || selectedOrder._id}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${selectedOrder.isPaid
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                    {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${selectedOrder.isDelivered
                      ? 'bg-blue-50 text-[#1B3F6E] border-blue-100'
                      : 'bg-amber-50 text-[#B8952A] border-amber-100'
                    }`}>
                    {selectedOrder.isDelivered ? 'Dispatched' : 'Processing'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Side: Order Items and Parameters (Takes 7 columns) */}
                <div className="md:col-span-7 space-y-6">
                  <h4 className="font-extrabold text-navy-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Purchased Optics & Options
                  </h4>

                  <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                    {selectedOrder.orderItems.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 text-left">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-20 bg-white border border-slate-200/80 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-xxs">
                            <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                          </div>
                          <div className="space-y-1 flex-grow">
                            <p className="font-extrabold text-navy-dark text-xs leading-snug">{item.name}</p>
                            <div className="flex justify-between items-center text-[10px]">
                              <p className="text-slate-400 font-bold uppercase tracking-wider">
                                Price Matrix
                              </p>
                              <p className="text-navy-primary font-black">
                                Qty {item.qty} · ₹{item.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Customization Details Grid */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200/50 grid grid-cols-2 gap-3.5 text-[10px] font-bold text-text-muted">
                          <div className="space-y-0.5">
                            <span className="text-slate-400 text-[8px] uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent"></span> Frame Color
                            </span>
                            <p className="text-navy-dark truncate pl-2.5">{item.options?.color || 'Default Classic'}</p>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-slate-400 text-[8px] uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-gold-accent"></span> Fit / Size
                            </span>
                            <p className="text-navy-dark truncate pl-2.5">{item.options?.size || 'Medium (Standard)'}</p>
                          </div>

                          <div className="space-y-0.5">
                            <span className="text-slate-400 text-[8px] uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1B3F6E]"></span> Lens Configuration
                            </span>
                            <p className="text-navy-dark truncate pl-2.5">{item.options?.lensType || 'Non-Prescription Frame'}</p>
                          </div>

                          {item.options?.lensType && item.options.lensType !== 'Non-Prescription Frame' && item.options.lensType !== 'Frame Only' && (
                            <div className="space-y-0.5">
                              <span className="text-slate-400 text-[8px] uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1B3F6E]"></span> Pupillary Distance
                              </span>
                              <p className="text-navy-dark truncate pl-2.5">{item.options?.pdEntered || '63 mm (Standard)'}</p>
                            </div>
                          )}

                          {item.options?.prescriptionData && (
                            <div className="col-span-2 space-y-3.5 border-t border-slate-100 pt-2 text-left animate-fadeIn">
                              <span className="text-slate-400 text-[8px] uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-navy-primary"></span> Structured Prescription Details
                              </span>
                              
                              {/* OD vs OS Table */}
                              {(item.options.prescriptionData.rightSph || item.options.prescriptionData.leftSph) ? (
                                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 max-w-full">
                                  <table className="min-w-full divide-y divide-slate-200 text-left text-[10px]">
                                    <thead className="bg-slate-100 text-[8px] uppercase tracking-wider font-extrabold text-navy-primary">
                                      <tr>
                                        <th className="py-1.5 px-2.5">Eye</th>
                                        <th className="py-1.5 px-2.5">SPH</th>
                                        <th className="py-1.5 px-2.5">CYL</th>
                                        <th className="py-1.5 px-2.5">AXIS</th>
                                        <th className="py-1.5 px-2.5">ADD</th>
                                        <th className="py-1.5 px-2.5">PRISM</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 font-medium text-navy-dark bg-white">
                                      <tr>
                                        <td className="py-1.5 px-2.5 font-extrabold text-slate-400">R (OD)</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.rightSph || '0.00'}</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.rightCyl || '0.00'}</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.rightAxis || '—'}</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.rightAdd || '—'}</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.rightPrism || '—'}</td>
                                      </tr>
                                      <tr>
                                        <td className="py-1.5 px-2.5 font-extrabold text-slate-400">L (OS)</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.leftSph || '0.00'}</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.leftCyl || '0.00'}</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.leftAxis || '—'}</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.leftAdd || '—'}</td>
                                        <td className="py-1.5 px-2.5 font-mono">{item.options.prescriptionData.leftPrism || '—'}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="p-3.5 rounded-xl border border-dashed border-slate-200 text-center text-[#1B3F6E] bg-white font-bold text-[9px] animate-fadeIn shadow-xxs">
                                  📄 Prescription uploaded via file attachment.
                                </div>
                              )}

                              {/* Extra Params */}
                              <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-text-muted bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                                {item.options.prescriptionData.doctorName && (
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400 text-[7.5px] uppercase tracking-wider block">Doctor</span>
                                    <span className="text-navy-dark truncate block">{item.options.prescriptionData.doctorName}</span>
                                  </div>
                                )}
                                {item.options.prescriptionData.prescriptionDate && (
                                  <div className="space-y-0.5">
                                    <span className="text-slate-400 text-[7.5px] uppercase tracking-wider block">Date</span>
                                    <span className="text-navy-dark block">
                                      {new Date(item.options.prescriptionData.prescriptionDate).toLocaleDateString('en-IN', {
                                        day: '2-digit', month: 'short', year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                )}
                                {item.options.prescriptionData.lensConfig && (
                                  <div className="col-span-2 border-t border-slate-200/50 pt-2 space-y-2">
                                    <span className="text-slate-400 text-[7.5px] uppercase tracking-wider block font-extrabold">Lens Customizations</span>
                                    <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                                      {item.options.prescriptionData.lensConfig.material && (
                                        <div>
                                          <span className="text-slate-400 text-[7px] uppercase block">Material</span>
                                          <span className="text-navy-dark">{item.options.prescriptionData.lensConfig.material}</span>
                                        </div>
                                      )}
                                      {item.options.prescriptionData.lensConfig.tint && (
                                        <div>
                                          <span className="text-slate-400 text-[7px] uppercase block">Tint</span>
                                          <span className="text-navy-dark">{item.options.prescriptionData.lensConfig.tint}</span>
                                        </div>
                                      )}
                                      {item.options.prescriptionData.lensConfig.features && item.options.prescriptionData.lensConfig.features.length > 0 && (
                                        <div className="col-span-2 border-t border-slate-100 pt-1">
                                          <span className="text-slate-400 text-[7px] uppercase block">Coatings / Add-ons</span>
                                          <div className="flex flex-wrap gap-1 mt-0.5">
                                            {item.options.prescriptionData.lensConfig.features.map((f, fi) => (
                                              <span key={fi} className="px-1 py-0.5 rounded bg-blue-50 text-blue-600 text-[7.5px] uppercase tracking-wider font-extrabold border border-blue-100">{f}</span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {item.options?.prescriptionDetails && (
                            <div className="col-span-2 space-y-0.5 border-t border-slate-100 pt-2">
                              <span className="text-slate-400 text-[8px] uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-navy-primary"></span> Manual Rx Inputs
                              </span>
                              <p className="text-navy-dark pl-2.5 font-mono text-[9px] bg-slate-50 p-2 rounded-lg mt-1 whitespace-pre-line border border-slate-100 text-left">
                                {item.options.prescriptionDetails}
                              </p>
                            </div>
                          )}

                          {item.options?.rxAttached && (
                            <div className="col-span-2 space-y-1.5 border-t border-slate-100 pt-2">
                              <span className="text-slate-400 text-[8px] uppercase tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-navy-primary"></span> Attached Prescription file
                              </span>
                              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-150 pl-3">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gold-accent shrink-0" />
                                  <span className="text-[9px] uppercase tracking-widest truncate max-w-[180px]">{item.options.rxAttached}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedRx({
                                      ...item,
                                      prescriptionUploaded: true,
                                      prescriptionOptions: { pd: item.options.pdEntered || '63 mm' },
                                      orderId: selectedOrder._id,
                                      currentStatus: selectedOrder.prescriptionStatus || 'Pending Verification'
                                    });
                                    setIsRxViewOpen(true);
                                  }}
                                  className="px-3 py-1 bg-navy-dark text-white rounded-lg text-[8.5px] uppercase tracking-wider hover:bg-gold-accent hover:text-navy-dark cursor-pointer transition-colors"
                                >
                                  Preview File
                                </button>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Shipping coordinates & Payment Info & Actions (Takes 5 columns) */}
                <div className="md:col-span-5 space-y-6 text-left">
                  {/* Address coordinates */}
                  <div className="space-y-3.5">
                    <h4 className="font-extrabold text-navy-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-gold-accent" />
                      <span>Shipping Coordinates</span>
                    </h4>

                    {selectedOrder.shippingAddress ? (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold text-text-muted space-y-2">
                        <div className="space-y-0.5">
                          <span className="text-slate-400 text-[8.5px] uppercase tracking-wider">Recipient Name</span>
                          <p className="text-navy-dark font-extrabold">{selectedOrder.shippingAddress.name || selectedOrder.user?.name || 'EyeLead Valued Client'}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-400 text-[8.5px] uppercase tracking-wider">Postal Address</span>
                          <p className="text-navy-dark leading-relaxed font-semibold">
                            {selectedOrder.shippingAddress.address}<br />
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode || selectedOrder.shippingAddress.pincode}, {selectedOrder.shippingAddress.country || 'India'}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-slate-400 text-[8.5px] uppercase tracking-wider">Contact Number</span>
                          <p className="text-navy-dark flex items-center gap-1.5 mt-0.5">
                            <Phone className="h-3.5 w-3.5 text-[#B8952A]/70" />
                            <span>{selectedOrder.shippingAddress.phone || 'Not Logged'}</span>
                          </p>
                        </div>
                        {selectedOrder.user && (
                          <div className="space-y-0.5 border-t border-slate-200/50 pt-2 mt-2">
                            <span className="text-slate-400 text-[8.5px] uppercase tracking-wider">Registered Email</span>
                            <p className="text-navy-dark flex items-center gap-1.5 mt-0.5 truncate select-text">
                              <Mail className="h-3.5 w-3.5 text-[#B8952A]/70" />
                              <span>{selectedOrder.user.email || 'guest@eyelead.com'}</span>
                            </p>
                          </div>
                        )}
                        {selectedOrder.isInternational ? (
                          selectedOrder.manualShipping?.awbCode && (
                            <div className="space-y-0.5 border-t border-slate-200/50 pt-2 mt-2">
                              <span className="text-slate-400 text-[8.5px] uppercase tracking-wider">International Tracking</span>
                              <p className="text-navy-dark font-extrabold mt-0.5">
                                {selectedOrder.manualShipping.courierName} ({selectedOrder.manualShipping.awbCode})
                              </p>
                              {selectedOrder.manualShipping.trackingUrl && (
                                <a
                                  href={selectedOrder.manualShipping.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline block mt-0.5 text-[10px]"
                                >
                                  Track Shipment ↗
                                </a>
                              )}
                            </div>
                          )
                        ) : (
                          selectedOrder.shiprocket?.awbCode && (
                            <div className="space-y-0.5 border-t border-slate-200/50 pt-2 mt-2">
                              <span className="text-slate-400 text-[8.5px] uppercase tracking-wider">Shiprocket Tracking</span>
                              <p className="text-navy-dark font-extrabold mt-0.5">
                                {selectedOrder.shiprocket.courierName} ({selectedOrder.shiprocket.awbCode})
                              </p>
                              <div className="flex gap-2.5 mt-1">
                                {selectedOrder.shiprocket.trackingUrl && (
                                  <a
                                    href={selectedOrder.shiprocket.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-[10px]"
                                  >
                                    Track Package ↗
                                  </a>
                                )}
                                {selectedOrder.shiprocket.labelUrl && (
                                  <a
                                    href={selectedOrder.shiprocket.labelUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#B8952A] hover:underline text-[10px]"
                                  >
                                    Print Shipping Label 📄
                                  </a>
                                )}
                              </div>
                            </div>
                          )
                        )}
                        {selectedOrder.deliveryMethod === 'local_hand_delivery' && (
                          <div className="space-y-0.5 border-t border-slate-200/50 pt-2 mt-2 text-left">
                            <span className="text-slate-400 text-[8.5px] uppercase tracking-wider">Delivery Mode</span>
                            <p className="text-[#1B3F6E] font-extrabold mt-0.5">Local Hand Delivery</p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {selectedOrder.isDelivered
                                ? `Delivered on ${new Date(selectedOrder.deliveredAt).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  })}`
                                : "Your order will be personally delivered by our team."}
                            </p>
                            {selectedOrder.handDelivery?.notes && (
                              <p className="text-[9.5px] text-slate-400 italic mt-1 bg-white p-2 rounded-lg border border-slate-100">
                                Note: "{selectedOrder.handDelivery.notes}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic text-xs">Offline catalog test purchase</p>
                    )}
                  </div>

                  {/* Payment Details Card */}
                  <div className="space-y-3.5">
                    <h4 className="font-extrabold text-navy-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-[#B8952A]" />
                      <span>Payment Reference</span>
                    </h4>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold text-text-muted space-y-2.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 uppercase tracking-wider">Method</span>
                        <span className="text-navy-dark font-extrabold bg-slate-200/60 px-2 py-0.5 rounded">{selectedOrder.paymentMethod || 'Razorpay Gateway'}</span>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 uppercase tracking-wider">Payment ID</span>
                        <span className="text-navy-dark font-mono truncate max-w-[180px] text-[9.5px] select-text" title={selectedOrder.paymentResult?.id}>
                          {selectedOrder.paymentResult?.id || 'pay_test_offline_by_admin'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-slate-200/50 pt-2">
                        <span className="text-slate-400 uppercase tracking-wider">Subtotal</span>
                        <span className="text-navy-dark">₹{(selectedOrder.itemsPrice || 0).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 uppercase tracking-wider">Delivery Valet Fee</span>
                        <span className="text-navy-dark">₹{(selectedOrder.shippingPrice || 0).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-slate-200/70 pt-2">
                        <span className="text-navy-dark font-extrabold uppercase tracking-wider">Amount Paid</span>
                        <span className="text-[#B8952A] font-black text-sm">₹{(selectedOrder.totalPrice || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Cancelled & Refund Management inside Modal */}
                  {selectedOrder.isCancelled && (
                    <div className="space-y-3.5">
                      <h4 className="font-extrabold text-navy-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                        <AlertCircle className="h-4.5 w-4.5 text-rose-600" />
                        <span>Cancellation Status</span>
                      </h4>
                      
                      <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100 text-xs font-bold text-slate-600 space-y-2">
                        <p>Order was cancelled by the <strong className="text-slate-800">{selectedOrder.cancelledBy || 'customer'}</strong>.</p>
                        {selectedOrder.cancellationReason && (
                          <p className="bg-white/50 p-2 rounded-xl border border-rose-150 text-slate-700 italic">
                            Reason: "{selectedOrder.cancellationReason}"
                          </p>
                        )}
                      </div>

                      {/* Refund Card */}
                      {selectedOrder.isPaid && (
                        <div className="space-y-3">
                          <span className="text-[9px] uppercase tracking-widest text-[#1B3F6E] font-black block">Refund Processing Drawer</span>
                          
                          {selectedOrder.isRefunded ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-left">
                              <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <span>Refund Processed</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                A refund of <strong>₹{selectedOrder.totalPrice.toLocaleString('en-IN')}</strong> was marked as processed by <strong>{selectedOrder.refundedBy || 'admin@eyeleads.com'}</strong> on <strong>{new Date(selectedOrder.refundedAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}</strong>. Bookkeeping records have been finalized.
                              </p>
                            </div>
                          ) : (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3 text-left relative overflow-hidden">
                              <div className="flex items-center gap-1.5 text-red-800 text-[10px] font-black uppercase tracking-wider animate-pulse">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span>Refund Required</span>
                              </div>
                              
                              <div className="space-y-1.5 text-xxs font-bold text-slate-500 leading-relaxed">
                                <p>This premium order was paid via Razorpay and has been cancelled. Please log in to your Razorpay dashboard to process the refund.</p>
                                <div className="bg-white/60 p-2.5 rounded-xl border border-red-150 mt-1 space-y-1">
                                  <div className="flex justify-between">
                                    <span>Refund Amount:</span>
                                    <span className="text-slate-800 font-extrabold">₹{selectedOrder.totalPrice.toLocaleString('en-IN')}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Payment ID:</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-800 font-mono select-all text-[9.5px]">{selectedOrder.paymentResult?.id || 'pay_mock_offline'}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(selectedOrder.paymentResult?.id || 'pay_mock_offline');
                                          setCopiedText(selectedOrder._id);
                                          toast.success('Razorpay Payment ID copied to clipboard!');
                                          setTimeout(() => setCopiedText(''), 2000);
                                        }}
                                        className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-[#B8952A] cursor-pointer"
                                        title="Copy Payment ID"
                                      >
                                        {copiedText === selectedOrder._id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-1">
                                <a
                                  href="https://dashboard.razorpay.com/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-grow py-2 bg-[#0F2744] hover:bg-[#1B3F6E] text-white text-center rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer block"
                                >
                                  Razorpay Login
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleMarkRefundProcessed(selectedOrder._id)}
                                  className="flex-grow py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer shadow-xxs"
                                >
                                  Mark Processed
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions & Fulfillment section */}
                  <div className="space-y-3 pt-2">
                    {/* Delivery Method Selector */}
                    {!selectedOrder.isInternational && !selectedOrder.shiprocket?.awbCode && !selectedOrder.isDelivered && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 text-left">
                        <span className="text-[9px] uppercase tracking-widest text-[#1B3F6E] font-black block">Fulfillment Method</span>
                        <div className="flex gap-2 font-bold text-xxs">
                          <button
                            type="button"
                            onClick={async () => {
                              if (selectedOrder.deliveryMethod === 'local_hand_delivery') {
                                await handleRetryShiprocketOrder(selectedOrder._id);
                              }
                            }}
                            className={`flex-1 py-2.5 rounded-xl border transition-all cursor-pointer ${
                              selectedOrder.deliveryMethod !== 'local_hand_delivery'
                                ? 'bg-[#0F2744] text-white border-[#0F2744]'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Shiprocket Courier
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const { data } = await api.put(`/api/orders/${selectedOrder._id}/set-hand-delivery`);
                                setOrders(orders.map((o) => (o._id === selectedOrder._id ? data.order : o)));
                                setSelectedOrder(data.order);
                                toast.success('Fulfillment method updated to Local Hand Delivery!');
                              } catch (err) {
                                toast.error(err.response?.data?.message || 'Failed to change fulfillment method.');
                              }
                            }}
                            className={`flex-1 py-2.5 rounded-xl border transition-all cursor-pointer ${
                              selectedOrder.deliveryMethod === 'local_hand_delivery'
                                ? 'bg-[#0F2744] text-white border-[#0F2744]'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Local / Hand Delivery
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Delivery Notes Input for Hand Delivery */}
                    {selectedOrder.deliveryMethod === 'local_hand_delivery' && !selectedOrder.isDelivered && (
                      <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <label className="uppercase tracking-wider text-[9px] font-extrabold text-[#1B3F6E] block">Hand Delivery Notes (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Left with reception desk"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          className="w-full border border-slate-200 focus:border-gold-accent focus:outline-none rounded-xl px-4 py-2.5 bg-white text-text-primary text-xs font-bold"
                        />
                      </div>
                    )}
                    {/* Prescription approval buttons if order prescription status is Pending Verification */}
                    {selectedOrder.prescriptionStatus && selectedOrder.prescriptionStatus === 'Pending Verification' && (
                      <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-3">
                        <div className="flex items-center gap-2 text-amber-800 text-[10px] uppercase font-black tracking-wider">
                          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                          <span>Needs Optician Verification</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              await handleVerifyPrescription(selectedOrder._id, 'Flagged / Action Required');
                              setIsOrderModalOpen(false);
                            }}
                            className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-[9px] uppercase font-black cursor-pointer transition-colors"
                          >
                            Flag Rx Issue
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await handleVerifyPrescription(selectedOrder._id, 'Verified');
                              setIsOrderModalOpen(false);
                            }}
                            className="px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[9px] uppercase font-black cursor-pointer transition-colors"
                          >
                            Approve Rx
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Dispatch fulfillment action — reuses the exact same
                        Shiprocket-aware logic as the orders table row, so this
                        modal can never mark an order "Delivered" without it
                        actually having gone through the real fulfillment flow
                        (AWB assignment / manual international shipping). */}
                    <div className="w-full [&>button]:w-full [&>div]:w-full [&>button]:py-3.5 [&>div]:py-3.5 [&>button]:rounded-2xl [&>div]:rounded-2xl [&>button]:text-[10.5px] [&>div]:text-[10.5px] [&>button]:justify-center [&>div]:justify-center">
                      {renderOrderFulfillmentActions(selectedOrder)}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isManualReversePickupModalOpen && selectedReturnRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-left">
            <h3 className="text-lg font-black text-navy-dark mb-1">Enter Return Pickup Info</h3>
            <p className="text-xs text-slate-500 mb-4 font-bold">
              International return for order {selectedReturnRequest.order?.orderNumber} — enter details after arranging pickup with the courier.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Courier name (e.g. DHL, FedEx)"
                value={manualReversePickupForm.courierName}
                onChange={(e) => setManualReversePickupForm({ ...manualReversePickupForm, courierName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
              <input
                type="text"
                placeholder="AWB / Tracking number"
                value={manualReversePickupForm.awbCode}
                onChange={(e) => setManualReversePickupForm({ ...manualReversePickupForm, awbCode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
              <input
                type="text"
                placeholder="Tracking URL (optional)"
                value={manualReversePickupForm.trackingUrl}
                onChange={(e) => setManualReversePickupForm({ ...manualReversePickupForm, trackingUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              />
            </div>
            <div className="flex gap-2 mt-4 font-bold">
              <button
                onClick={() => setIsManualReversePickupModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleManualReversePickupSubmit}
                className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. RETURN REQUEST DETAILS MODAL */}
      {isReturnModalOpen && selectedReturnRequest && (
        <div className="fixed inset-0 z-50 bg-[#0F2744]/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-3xl overflow-hidden border border-slate-200 shadow-luxury p-8 relative max-h-[90vh] overflow-y-auto text-left">
            <button
              onClick={() => { setIsReturnModalOpen(false); setSelectedReturnRequest(null); }}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-navy-primary hover:bg-slate-50 transition-colors cursor-pointer animate-fadeIn"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 pr-10">
                <div className="space-y-1">
                  <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-widest block">Customer Return Request</span>
                  <h3 className="text-xl font-light font-serif text-navy-dark">Moderation & Review Desk</h3>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    Order Ref: {selectedReturnRequest.order?.orderNumber || 'mock_order'}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                    ['Rejected'].includes(selectedReturnRequest.status) ? 'bg-rose-50 text-rose-600 border-rose-150' :
                    ['Completed', 'Refund Completed'].includes(selectedReturnRequest.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-150' :
                    'bg-amber-50 text-[#B8952A] border-amber-150'
                  }`}>
                    {selectedReturnRequest.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Side: Return Details & Evidence Photos (Takes 7 columns) */}
                <div className="md:col-span-7 space-y-5">
                  <div className="space-y-3.5">
                    <h4 className="font-extrabold text-navy-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Request Description
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold text-text-muted space-y-3">
                      <div>
                        <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Reason for request:</span>
                        <p className="text-navy-dark text-sm font-black mt-0.5">{selectedReturnRequest.reason}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Wants resolution:</span>
                        <p className="text-[#1B3F6E] text-sm font-black mt-0.5">{selectedReturnRequest.resolutionRequested}</p>
                      </div>
                      <div className="border-t border-slate-200/50 pt-2.5">
                        <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Customer's explanation:</span>
                        <p className="text-slate-700 font-semibold mt-1 whitespace-pre-wrap leading-relaxed">
                          "{selectedReturnRequest.description}"
                        </p>
                      </div>
                      {selectedReturnRequest.order?.isInternational ? (
                        <div className="border-t border-slate-200/50 pt-2.5">
                          <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Return Pickup (International — Manual):</span>
                          {selectedReturnRequest.order?.manualReversePickup?.awbCode ? (
                            <p className="text-emerald-600 text-sm font-black mt-0.5">
                              {selectedReturnRequest.order.manualReversePickup.courierName} (AWB {selectedReturnRequest.order.manualReversePickup.awbCode})
                            </p>
                          ) : (
                            ['Approved', 'Refund Pending'].includes(selectedReturnRequest.status) && (
                              <button
                                onClick={() => setIsManualReversePickupModalOpen(true)}
                                className="mt-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[9.5px] font-black uppercase tracking-wider"
                              >
                                Enter Return Pickup Info
                              </button>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="border-t border-slate-200/50 pt-2.5">
                          <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Return Pickup (Domestic — Shiprocket):</span>
                          {selectedReturnRequest.order?.reversePickup?.awbCode ? (
                            <div className="mt-1 space-y-1">
                              <p className="text-emerald-600 text-sm font-black">
                                AWB {selectedReturnRequest.order.reversePickup.awbCode} · {selectedReturnRequest.order.reversePickup.status}
                              </p>
                              <div className="flex gap-3">
                                {selectedReturnRequest.order.reversePickup.trackingUrl && (
                                  <a href={selectedReturnRequest.order.reversePickup.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-extrabold uppercase tracking-wider text-[#1B3F6E] underline">
                                    Track Pickup
                                  </a>
                                )}
                                {selectedReturnRequest.order.reversePickup.labelUrl && (
                                  <a href={selectedReturnRequest.order.reversePickup.labelUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-extrabold uppercase tracking-wider text-[#1B3F6E] underline">
                                    Print Return Label
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-400 text-sm font-semibold mt-0.5">
                              {['Approved', 'Refund Pending'].includes(selectedReturnRequest.status)
                                ? 'Pickup not scheduled yet — approve the request to trigger it automatically.'
                                : 'Not applicable until the request is approved.'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Evidence Photos */}
                  <div className="space-y-3.5">
                    <h4 className="font-extrabold text-navy-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Evidence Photos
                    </h4>
                    {selectedReturnRequest.photos && selectedReturnRequest.photos.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedReturnRequest.photos.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setSelectedReturnImage(url)}
                            className="aspect-[4/3] rounded-xl border border-slate-200 overflow-hidden bg-slate-50 hover:border-gold-accent hover:scale-[1.03] transition-all cursor-zoom-in"
                          >
                            <img src={url} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10.5px] text-slate-400 italic">No photos were uploaded for this request.</p>
                    )}
                  </div>
                </div>

                {/* Right Side: Admin Actions Panel (Takes 5 columns) */}
                <div className="md:col-span-5 space-y-6">
                  
                  {/* Notes & Actions Card */}
                  <div className="space-y-3.5">
                    <h4 className="font-extrabold text-navy-dark text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                      Moderator Actions
                    </h4>

                    {/* Admin Note textarea */}
                    {['Requested', 'Approved', 'Refund Pending', 'Replacement Shipped'].includes(selectedReturnRequest.status) && (
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Admin note / feedback</label>
                        <textarea
                          value={adminNoteText}
                          onChange={(e) => setAdminNoteText(e.target.value)}
                          placeholder="Provide explanation for approval, rejection, or tracking updates..."
                          rows="3"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#B8952A] focus:ring-1 focus:ring-[#B8952A]/20 outline-none text-xs font-semibold placeholder:text-slate-300 transition-all resize-none bg-slate-50/50 focus:bg-white"
                        />
                      </div>
                    )}

                    {/* Primary Approve / Reject Buttons (when status is Requested) */}
                    {selectedReturnRequest.status === 'Requested' && (
                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateReturnStatus(selectedReturnRequest._id, 'Rejected')}
                          className="py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-[10px] font-black uppercase cursor-pointer transition-colors text-center font-extrabold"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus = selectedReturnRequest.resolutionRequested === 'Refund' ? 'Refund Pending' : 'Approved';
                            handleUpdateReturnStatus(selectedReturnRequest._id, nextStatus);
                          }}
                          className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase cursor-pointer transition-colors text-center shadow-xxs font-extrabold"
                        >
                          Approve
                        </button>
                      </div>
                    )}

                    {/* Manual Refund details & mark as processed (when status is Refund Pending) */}
                    {selectedReturnRequest.status === 'Refund Pending' && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                        <div className="flex items-center gap-1.5 text-red-800 text-[10px] font-black uppercase tracking-wider animate-pulse">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span>Refund Required</span>
                        </div>
                        
                        <div className="space-y-1.5 text-xxs font-bold text-slate-500 leading-relaxed">
                          <p>Please log in to your Razorpay dashboard to process this refund manually.</p>
                          <div className="bg-white/60 p-2.5 rounded-xl border border-red-150 space-y-1">
                            <div className="flex justify-between">
                              <span>Refund Amount:</span>
                              <span className="text-slate-800 font-extrabold">₹{(selectedReturnRequest.order?.totalPrice || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Payment ID:</span>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-800 font-mono select-all text-[9.5px] truncate max-w-[130px]">{selectedReturnRequest.order?.paymentResult?.id || 'pay_mock_offline'}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedReturnRequest.order?.paymentResult?.id || 'pay_mock_offline');
                                    toast.success('Payment ID copied!');
                                  }}
                                  className="p-1 rounded hover:bg-red-100 text-slate-400 hover:text-[#B8952A] cursor-pointer"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <a
                            href="https://dashboard.razorpay.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-grow py-2 bg-[#0F2744] hover:bg-[#1B3F6E] text-white text-center rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer block"
                          >
                            Razorpay Login
                          </a>
                          <button
                            type="button"
                            onClick={() => handleUpdateReturnStatus(selectedReturnRequest._id, 'Refund Completed')}
                            className="flex-grow py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer shadow-xxs"
                          >
                            Mark Completed
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Replacement Shipping tracking inputs (when status is Approved) */}
                    {selectedReturnRequest.status === 'Approved' && (
                      <div className="bg-blue-50/50 border border-blue-150 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-1.5 text-[#1B3F6E] text-[10px] font-black uppercase tracking-wider">
                          <Truck className="h-4 w-4 text-navy-primary" />
                          <span>Dispatch Replacement</span>
                        </div>
                        
                        <div className="space-y-2 text-xxs font-bold text-slate-500">
                          <p>Once you have shipped the exchange frame, input its tracking number below to notify the customer.</p>
                          <input
                            type="text"
                            value={trackingNumberInput}
                            onChange={(e) => setTrackingNumberInput(e.target.value)}
                            placeholder="e.g. SF123456789IN"
                            className="w-full px-3 py-2 border border-slate-200 focus:border-[#B8952A] focus:outline-none rounded-xl bg-white text-text-primary text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpdateReturnStatus(selectedReturnRequest._id, 'Replacement Shipped', trackingNumberInput)}
                          className="w-full py-2 bg-[#0F2744] hover:bg-[#1B3F6E] text-white rounded-xl text-[9px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer text-center shadow-xxs"
                        >
                          Mark Shipped
                        </button>
                      </div>
                    )}

                    {/* Final closeout completion button (when status is Replacement Shipped or Refund Completed) */}
                    {['Replacement Shipped', 'Refund Completed'].includes(selectedReturnRequest.status) && (
                      <button
                        type="button"
                        onClick={() => handleUpdateReturnStatus(selectedReturnRequest._id, 'Completed')}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-colors cursor-pointer text-center shadow-sm"
                      >
                        Mark Request Completed
                      </button>
                    )}

                    {/* Completion Banners */}
                    {selectedReturnRequest.status === 'Completed' && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-left">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>Lifecycle Completed</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                          This return request has been resolved, customer notified, and accounting/bookkeeping records have been finalized.
                        </p>
                      </div>
                    )}

                    {selectedReturnRequest.status === 'Rejected' && (
                      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2 text-left">
                        <div className="flex items-center gap-1.5 text-rose-800 text-[10px] font-black uppercase tracking-wider">
                          <X className="h-4 w-4 text-rose-600" />
                          <span>Request Rejected</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                          This request was rejected. Customer has been notified with the notes provided.
                        </p>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. IMAGE ZOOM LIGHTBOX */}
      {selectedReturnImage && (
        <div 
          onClick={() => setSelectedReturnImage(null)}
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <button 
            onClick={() => setSelectedReturnImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={selectedReturnImage} 
            alt="Evidence Zoomed" 
            className="max-h-[90vh] max-w-full object-contain rounded-xl select-none shadow-2xl animate-scaleUp" 
          />
        </div>
      )}

      {/* USER PRESCRIPTION PROFILE MODAL */}
      {isUserRxModalOpen && viewedUser && (
        <div className="fixed inset-0 z-50 bg-[#0F2744]/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-2xl overflow-hidden border border-slate-200 shadow-luxury p-8 relative max-h-[90vh] overflow-y-auto text-left">
            <button
              onClick={() => { setIsUserRxModalOpen(false); setViewedUser(null); setUserRxData(null); }}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-navy-primary hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-widest block">Optometry Record</span>
              <h3 className="text-lg font-light font-serif text-navy-dark">Prescription Profile — {viewedUser.name}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">{viewedUser.email}</p>
            </div>

            {userRxLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <Loader className="h-6 w-6 animate-spin text-[#B8952A]" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading prescription profile...</p>
              </div>
            ) : userRxData ? (
              <div className="space-y-5 text-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-slate-400 uppercase font-extrabold border-b border-slate-100">
                        <th className="py-2 px-2.5">Eye</th>
                        <th className="py-2 px-2.5">SPH</th>
                        <th className="py-2 px-2.5">CYL</th>
                        <th className="py-2 px-2.5">Axis</th>
                        <th className="py-2 px-2.5">Add</th>
                        <th className="py-2 px-2.5">Prism</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-50">
                        <td className="py-2 px-2.5 font-bold text-navy-dark">Right (OD)</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.rightSph || '—'}</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.rightCyl || '—'}</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.rightAxis || '—'}</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.rightAdd || '—'}</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.rightPrism || '—'}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2.5 font-bold text-navy-dark">Left (OS)</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.leftSph || '—'}</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.leftCyl || '—'}</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.leftAxis || '—'}</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.leftAdd || '—'}</td>
                        <td className="py-2 px-2.5 font-mono">{userRxData.leftPrism || '—'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">PD</span>
                    <p className="text-navy-dark font-extrabold">{userRxData.pd || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Rx Date</span>
                    <p className="text-navy-dark font-extrabold">{userRxData.prescriptionDate || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[8.5px] uppercase tracking-wider block">Doctor</span>
                    <p className="text-navy-dark font-extrabold truncate">{userRxData.doctorName || '—'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs font-bold">
                This customer has not added a prescription profile yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* COURIER RATES COMPARISON MODAL (Domestic orders ready to ship) */}
      {isCourierModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#0F2744]/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden border border-slate-200 shadow-luxury p-8 relative max-h-[90vh] overflow-y-auto text-left">
            <button
              onClick={() => setIsCourierModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-navy-primary hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="text-gold-accent text-[9px] font-extrabold uppercase tracking-widest block">Shiprocket Live Rates</span>
              <h3 className="text-lg font-light font-serif text-navy-dark">Select Courier Partner</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Comparing serviceability to pincode {selectedOrder.shippingAddress?.zipCode}</p>
            </div>

            <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
              {courierOptions.length > 0 ? (
                courierOptions.map((c) => (
                  <div key={c.courierId} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-gold-accent/50 hover:bg-white transition-all duration-300">
                    <div className="space-y-1">
                      <p className="text-navy-dark text-xs font-black uppercase tracking-wide">{c.courierName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                        <span>ETD: {c.etd || '2-3'} Days</span>
                        <span>•</span>
                        <span className="text-yellow-600 font-extrabold">★ {c.rating || '4.2'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-navy-dark text-xs font-black">₹{parseFloat(c.rate).toFixed(2)}</span>
                      <button
                        onClick={() => handleReadyToShip(c.courierId)}
                        className="px-3 py-1.5 rounded-lg bg-navy-primary text-white text-[9px] font-black uppercase tracking-wider hover:bg-gold-accent hover:text-navy-dark transition-all duration-300 cursor-pointer"
                      >
                        Assign AWB
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs font-bold">
                  No serviceability or courier options returned for this destination.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MANUAL SHIPPING DETAIL MODAL (International orders) */}
      {isManualShipModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#0F2744]/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden border border-slate-200 shadow-luxury p-8 relative text-left">
            <button
              onClick={() => setIsManualShipModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-navy-primary hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="text-indigo-600 text-[9px] font-extrabold uppercase tracking-widest block">🌍 International Fulfillment</span>
              <h3 className="text-lg font-light font-serif text-navy-dark">Enter Shipment Details</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Order ref: {selectedOrder.orderNumber}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">Courier Name (e.g. DHL Express, FedEx)</label>
                <input
                  type="text"
                  required
                  value={manualShipForm.courierName}
                  onChange={(e) => setManualShipForm({ ...manualShipForm, courierName: e.target.value })}
                  placeholder="DHL Express / FedEx"
                  className="w-full border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white text-navy-dark font-bold transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">AWB / Air Waybill Code</label>
                <input
                  type="text"
                  required
                  value={manualShipForm.awbCode}
                  onChange={(e) => setManualShipForm({ ...manualShipForm, awbCode: e.target.value })}
                  placeholder="Tracking / AWB Number"
                  className="w-full border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white text-navy-dark font-bold transition-all duration-300"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase block tracking-wider">Tracking URL (Optional)</label>
                <input
                  type="url"
                  value={manualShipForm.trackingUrl}
                  onChange={(e) => setManualShipForm({ ...manualShipForm, trackingUrl: e.target.value })}
                  placeholder="https://dhl.com/track/..."
                  className="w-full border border-slate-200 focus:border-indigo-600 focus:outline-none rounded-xl px-3.5 py-2.5 text-xs bg-slate-50 focus:bg-white text-navy-dark font-bold transition-all duration-300"
                />
              </div>

              <button
                type="button"
                onClick={handleManualShipSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer text-center mt-2"
              >
                Save Details & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
