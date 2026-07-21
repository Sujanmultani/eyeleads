import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import ProductCardList from '../components/ProductCardList';
import { SlidersHorizontal, Grid, List, RefreshCw, ChevronDown, ChevronUp, ChevronRight, X, Sparkles } from 'lucide-react';

const Shop = () => {
  // FIXED: Shop sidebar filters don't sync to URL (filter state lost on refresh)
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL query parameters helper
  const getParsedFilters = () => {
    const categoryQuery = searchParams.get('category');
    const shapeQuery = searchParams.get('frameShape');
    const materialQuery = searchParams.get('material');
    const genderQuery = searchParams.get('gender');
    const colorQuery = searchParams.get('colors');
    const minPriceQuery = searchParams.get('minPrice');
    const maxPriceQuery = searchParams.get('maxPrice');
    const searchQuery = searchParams.get('search');

    return {
      category: categoryQuery ? categoryQuery.split(',') : [],
      frameShape: shapeQuery ? shapeQuery.split(',') : [],
      material: materialQuery ? materialQuery.split(',') : [],
      gender: genderQuery || '',
      colors: colorQuery ? colorQuery.split(',') : [],
      priceRange: [
        minPriceQuery ? parseInt(minPriceQuery) : 500,
        maxPriceQuery ? parseInt(maxPriceQuery) : 15000
      ],
      prescriptionAvailable: searchParams.get('prescriptionAvailable') === 'true',
      inStockOnly: searchParams.get('inStockOnly') === 'true',
      tryOnOnly: searchParams.get('tryOnOnly') === 'true',
      search: searchQuery || ''
    };
  };

  // 1. FILTER STATE matching exact user specifications
  const [filters, setFilters] = useState(getParsedFilters);

  // Local filter states for sidebar interactive values before applying
  const [localFilters, setLocalFilters] = useState(getParsedFilters);

  // Pagination & Display States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [materialsList, setMaterialsList] = useState(['Acetate', 'Titanium', 'TR90', 'Metal', 'Wood']);

  useEffect(() => {
    if (products && products.length > 0) {
      const fetched = products.map(p => p.material).filter(Boolean);
      const normalized = fetched.map(m => m.trim().charAt(0).toUpperCase() + m.trim().slice(1));
      setMaterialsList(prev => {
        const combined = new Set([...prev, ...normalized]);
        return [...combined];
      });
    }
  }, [products]);

  const [openGroups, setOpenGroups] = useState({
    category: true,
    gender: true,
    frameShape: false,
    material: false,
    colors: false,
    priceRange: true,
    extra: true
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const getActiveChips = () => {
    const chips = [];
    localFilters.category.forEach(c => chips.push({ type: 'category', value: c, label: c }));
    if (localFilters.gender) chips.push({ type: 'gender', value: localFilters.gender, label: `Gender: ${localFilters.gender}` });
    localFilters.frameShape.forEach(s => chips.push({ type: 'frameShape', value: s, label: s }));
    localFilters.material.forEach(m => chips.push({ type: 'material', value: m, label: m }));
    localFilters.colors.forEach(c => chips.push({ type: 'colors', value: c, label: c }));
    if (localFilters.priceRange[0] > 500 || localFilters.priceRange[1] < 15000) {
      chips.push({ type: 'priceRange', value: localFilters.priceRange, label: `₹${localFilters.priceRange[0]}-${localFilters.priceRange[1]}` });
    }
    if (localFilters.prescriptionAvailable) chips.push({ type: 'prescriptionAvailable', value: true, label: 'Prescription' });
    if (localFilters.inStockOnly) chips.push({ type: 'inStockOnly', value: true, label: 'In Stock' });
    if (localFilters.tryOnOnly) chips.push({ type: 'tryOnOnly', value: true, label: 'Try-On Available' });
    if (localFilters.search) chips.push({ type: 'search', value: localFilters.search, label: `Search: "${localFilters.search}"` });
    return chips;
  };

  const updateFiltersInUrl = (newFilters) => {
    const params = {};
    if (newFilters.category && newFilters.category.length > 0) params.category = newFilters.category.join(',');
    if (newFilters.frameShape && newFilters.frameShape.length > 0) params.frameShape = newFilters.frameShape.join(',');
    if (newFilters.material && newFilters.material.length > 0) params.material = newFilters.material.join(',');
    if (newFilters.gender) params.gender = newFilters.gender;
    if (newFilters.colors && newFilters.colors.length > 0) params.colors = newFilters.colors.join(',');
    if (newFilters.priceRange && (newFilters.priceRange[0] > 500 || newFilters.priceRange[1] < 15000)) {
      params.minPrice = newFilters.priceRange[0].toString();
      params.maxPrice = newFilters.priceRange[1].toString();
    }
    if (newFilters.prescriptionAvailable) params.prescriptionAvailable = 'true';
    if (newFilters.inStockOnly) params.inStockOnly = 'true';
    if (newFilters.tryOnOnly) params.tryOnOnly = 'true';
    if (newFilters.search) params.search = newFilters.search;
    setSearchParams(params);
  };

  const removeChip = (chip) => {
    setLocalFilters(prev => {
      let updated = { ...prev };
      if (chip.type === 'category') updated.category = prev.category.filter(x => x !== chip.value);
      else if (chip.type === 'gender') updated.gender = '';
      else if (chip.type === 'frameShape') updated.frameShape = prev.frameShape.filter(x => x !== chip.value);
      else if (chip.type === 'material') updated.material = prev.material.filter(x => x !== chip.value);
      else if (chip.type === 'colors') updated.colors = prev.colors.filter(x => x !== chip.value);
      else if (chip.type === 'priceRange') updated.priceRange = [500, 15000];
      else if (chip.type === 'prescriptionAvailable') updated.prescriptionAvailable = false;
      else if (chip.type === 'inStockOnly') updated.inStockOnly = false;
      else if (chip.type === 'tryOnOnly') updated.tryOnOnly = false;
      else if (chip.type === 'search') updated.search = '';

      updateFiltersInUrl(updated);
      return updated;
    });
    setCurrentPage(1);
  };

  // Available Filter Options lists
  const categoriesList = ['Eyeglasses', 'Sunglasses', 'Computer Glasses', 'Sports', 'Kids', 'Accessories', 'Cleaning Kits', 'Sale'];
  const shapesList = ['Round', 'Square', 'Rectangle', 'Aviator', 'Cat-Eye', 'Wayfarer', 'Oval'];
  const gendersList = ['Men', 'Women', 'Unisex', 'Kids'];

  // 9 Color Swatches: [Name, HexCode]
  const colorsList = [
    { name: 'Gold', hex: '#B8952A' },
    { name: 'Black', hex: '#1A1A2E' },
    { name: 'Slate', hex: '#4A4A6A' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Blue', hex: '#2E6DB4' },
    { name: 'Red', hex: '#BA1A1A' },
    { name: 'Brown', hex: '#78350F' },
    { name: 'Yellow', hex: '#FACC15' }
  ];

  // Fetch products from: GET /api/products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build API query parameters dynamically
      const params = new URLSearchParams();

      if (filters.category.length > 0) params.append('category', filters.category.join(','));
      if (filters.frameShape.length > 0) params.append('frameShape', filters.frameShape.join(','));
      if (filters.material.length > 0) params.append('material', filters.material.join(','));
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.colors.length > 0) params.append('colors', filters.colors.join(','));
      if (filters.search) params.append('search', filters.search);

      // Price ranges
      params.append('minPrice', filters.priceRange[0].toString());
      params.append('maxPrice', filters.priceRange[1].toString());

      // Boolean triggers
      if (filters.prescriptionAvailable) params.append('prescriptionAvailable', 'true');
      if (filters.inStockOnly) params.append('inStockOnly', 'true');
      if (filters.tryOnOnly) params.append('tryOnOnly', 'true');

      // Sorting & Pagination params
      params.append('sort', sortBy);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await api.get(`/api/products?${params.toString()}`);

      if (response.data && response.data.status === 'success') {
        setProducts(response.data.products);
        setCount(response.data.count);
        setTotalPages(response.data.pages);
      }
    } catch (error) {
      console.error('Error fetching products from API:', error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when filters state, sort or page changes
  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, currentPage]);

  // Sync state if searchParams changes (e.g. user navigates between collections)
  useEffect(() => {
    const parsed = getParsedFilters();
    setFilters(parsed);
    setLocalFilters(parsed);
    setCurrentPage(1);
  }, [searchParams]);

  // Handle Multiselect Checklist toggles
  const handleChecklistToggle = (field, item) => {
    setLocalFilters((prev) => {
      const active = prev[field].includes(item)
        ? prev[field].filter((x) => x !== item)
        : [...prev[field], item];
      const updated = { ...prev, [field]: active };
      updateFiltersInUrl(updated);
      return updated;
    });
  };

  // Handle Gender Pill selection
  const handleGenderSelect = (genderVal) => {
    setLocalFilters((prev) => {
      const updated = {
        ...prev,
        gender: prev.gender === genderVal ? '' : genderVal
      };
      updateFiltersInUrl(updated);
      return updated;
    });
  };

  // Handle Color Swatch clicks
  const handleColorToggle = (colorName) => {
    setLocalFilters((prev) => {
      const active = prev.colors.includes(colorName)
        ? prev.colors.filter((c) => c !== colorName)
        : [...prev.colors, colorName];
      const updated = { ...prev, colors: active };
      updateFiltersInUrl(updated);
      return updated;
    });
  };

  // Extra features toggles
  const handleExtraToggle = (field, checked) => {
    setLocalFilters((prev) => {
      const updated = { ...prev, [field]: checked };
      updateFiltersInUrl(updated);
      return updated;
    });
  };

  // Price range change
  const handlePriceChange = (index, value) => {
    setLocalFilters((prev) => {
      const newRange = [...prev.priceRange];
      newRange[index] = parseInt(value) || (index === 0 ? 500 : 15000);
      const updated = { ...prev, priceRange: newRange };
      updateFiltersInUrl(updated);
      return updated;
    });
  };

  // Apply Sidebar Filters
  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    updateFiltersInUrl(localFilters);
    setMobileFiltersOpen(false);
  };

  // Reset all filters back to defaults
  const handleResetFilters = (e) => {
    if (e) e.preventDefault();
    const defaults = {
      category: [],
      frameShape: [],
      material: [],
      gender: '',
      colors: [],
      priceRange: [500, 15000],
      prescriptionAvailable: false,
      inStockOnly: false,
      tryOnOnly: false,
      search: ''
    };
    setFilters(defaults);
    setLocalFilters(defaults);
    setCurrentPage(1);
    updateFiltersInUrl(defaults);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fadeIn">
      <SEO
        title="Shop All Eyewear"
        description="Browse our full collection of prescription glasses, sunglasses, and blue-light frames. Filter by style, price, and fit to find your perfect pair."
      />
      {/* Breadcrumbs */}
      <nav className="mb-6 select-none">
        <ol className="flex items-center gap-2 text-xs font-semibold text-[#4A4A6A]/75">
          <li>
            <Link to="/" className="hover:text-[#1B3F6E] transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3.5 w-3.5 text-[#4A4A6A]/60" />
          </li>
          <li className="text-[#1B3F6E] font-extrabold">Shop</li>
        </ol>
      </nav>

      {/* Listing Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-[#1B3F6E] tracking-tight mb-2">All Frames</h1>
          <p className="text-xs sm:text-sm text-[#4A4A6A] opacity-60">Showing {count} premium handcrafted products</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 bg-[#1B3F6E] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded shadow cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>

          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none bg-white border border-[#1B3F6E]/20 rounded-lg px-4 py-2 pr-10 font-bold text-xs text-[#1B3F6E] focus:outline-none focus:ring-2 focus:ring-[#1B3F6E]/10 cursor-pointer shadow-sm"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="bestselling">Popularity</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#1B3F6E]/60 h-4 w-4" />
          </div>

          <div className="flex border border-slate-200 rounded-lg overflow-hidden p-0.5 bg-white select-none shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors cursor-pointer rounded ${viewMode === 'grid' ? 'bg-[#1B3F6E] text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors cursor-pointer rounded ${viewMode === 'list' ? 'bg-[#1B3F6E] text-white' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8 relative items-start">

        {/* ========================================================================= */}
        {/* LEFT SIDEBAR (STICKY FILTER CONTROLS) */}
        {/* ========================================================================= */}
        <aside className="hidden md:block w-66 shrink-0 bg-white rounded-2xl shadow-luxury border border-slate-100 p-6 sticky top-24 max-h-[82vh] overflow-y-auto space-y-6 select-none">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-sm text-[#1B3F6E] uppercase tracking-wider">Filters</h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#B8952A] hover:underline cursor-pointer"
            >
              Reset All
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-5">

            {/* 1. Category Accordion */}
            <div className="border-b border-slate-50 pb-4">
              <button
                type="button"
                onClick={() => toggleGroup('category')}
                className="w-full flex justify-between items-center text-xs font-bold text-[#1B3F6E] uppercase tracking-widest cursor-pointer"
              >
                <span>Category</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openGroups.category ? 'rotate-180' : ''}`} />
              </button>
              {openGroups.category && (
                <div className="space-y-2.5 mt-3.5 animate-fadeIn">
                  {categoriesList.map((cat) => (
                    <label key={cat} className="flex items-center gap-2.5 text-xs font-medium text-[#4A4A6A] hover:text-[#1B3F6E] cursor-pointer hover-slide-right">
                      <input
                        type="checkbox"
                        checked={localFilters.category.includes(cat)}
                        onChange={() => handleChecklistToggle('category', cat)}
                        className="rounded text-[#1B3F6E] focus:ring-[#1B3F6E] h-4 w-4 border-slate-300 transition-colors"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Gender Accordion */}
            <div className="border-b border-slate-50 pb-4">
              <button
                type="button"
                onClick={() => toggleGroup('gender')}
                className="w-full flex justify-between items-center text-xs font-bold text-[#1B3F6E] uppercase tracking-widest cursor-pointer"
              >
                <span>Gender</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openGroups.gender ? 'rotate-180' : ''}`} />
              </button>
              {openGroups.gender && (
                <div className="grid grid-cols-2 gap-2 mt-3.5 animate-fadeIn">
                  {gendersList.map((gender) => {
                    const isActive = localFilters.gender === gender;
                    return (
                      <button
                        key={gender}
                        type="button"
                        onClick={() => handleGenderSelect(gender)}
                        className={`py-2 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer ${isActive
                            ? 'bg-[#1B3F6E] border-[#1B3F6E] text-white shadow-md'
                            : 'border-slate-200/80 text-[#1B3F6E] hover:bg-slate-50'
                          }`}
                      >
                        {gender}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Shape Accordion */}
            <div className="border-b border-slate-50 pb-4">
              <button
                type="button"
                onClick={() => toggleGroup('frameShape')}
                className="w-full flex justify-between items-center text-xs font-bold text-[#1B3F6E] uppercase tracking-widest cursor-pointer"
              >
                <span>Frame Shape</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openGroups.frameShape ? 'rotate-180' : ''}`} />
              </button>
              {openGroups.frameShape && (
                <div className="space-y-2.5 mt-3.5 animate-fadeIn">
                  {shapesList.map((shape) => (
                    <label key={shape} className="flex items-center gap-2.5 text-xs font-medium text-[#4A4A6A] hover:text-[#1B3F6E] cursor-pointer hover-slide-right">
                      <input
                        type="checkbox"
                        checked={localFilters.frameShape.includes(shape)}
                        onChange={() => handleChecklistToggle('frameShape', shape)}
                        className="rounded text-[#1B3F6E] focus:ring-[#1B3F6E] h-4 w-4 border-slate-300 transition-colors"
                      />
                      <span>{shape}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Material Accordion */}
            <div className="border-b border-slate-50 pb-4">
              <button
                type="button"
                onClick={() => toggleGroup('material')}
                className="w-full flex justify-between items-center text-xs font-bold text-[#1B3F6E] uppercase tracking-widest cursor-pointer"
              >
                <span>Material</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openGroups.material ? 'rotate-180' : ''}`} />
              </button>
              {openGroups.material && (
                <div className="space-y-2.5 mt-3.5 animate-fadeIn">
                  {materialsList.map((mat) => (
                    <label key={mat} className="flex items-center gap-2.5 text-xs font-medium text-[#4A4A6A] hover:text-[#1B3F6E] cursor-pointer hover-slide-right">
                      <input
                        type="checkbox"
                        checked={localFilters.material.includes(mat)}
                        onChange={() => handleChecklistToggle('material', mat)}
                        className="rounded text-[#1B3F6E] focus:ring-[#1B3F6E] h-4 w-4 border-slate-300 transition-colors"
                      />
                      <span>{mat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Colors Accordion */}
            <div className="border-b border-slate-50 pb-4">
              <button
                type="button"
                onClick={() => toggleGroup('colors')}
                className="w-full flex justify-between items-center text-xs font-bold text-[#1B3F6E] uppercase tracking-widest cursor-pointer"
              >
                <span>Colors</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openGroups.colors ? 'rotate-180' : ''}`} />
              </button>
              {openGroups.colors && (
                <div className="grid grid-cols-4 gap-3 mt-3.5 animate-fadeIn justify-items-center">
                  {colorsList.map((col) => {
                    const isChecked = localFilters.colors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => handleColorToggle(col.name)}
                        className={`w-8 h-8 rounded-full border-2 border-white cursor-pointer relative hover:scale-110 active:scale-95 transition-all ${isChecked ? 'ring-2 ring-[#1B3F6E] shadow-md' : 'ring-1 ring-slate-200'
                          }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {isChecked && (
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white mix-blend-difference font-bold">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Price Range Accordion */}
            <div className="border-b border-slate-50 pb-4">
              <button
                type="button"
                onClick={() => toggleGroup('priceRange')}
                className="w-full flex justify-between items-center text-xs font-bold text-[#1B3F6E] uppercase tracking-widest cursor-pointer"
              >
                <span>Price Range</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openGroups.priceRange ? 'rotate-180' : ''}`} />
              </button>
              {openGroups.priceRange && (
                <div className="space-y-4 mt-3.5 animate-fadeIn">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] uppercase tracking-wider font-extrabold text-[#4A4A6A] block mb-1">Min (₹)</label>
                      <input
                        type="number"
                        min="500"
                        max="15000"
                        value={localFilters.priceRange[0]}
                        onChange={(e) => handlePriceChange(0, e.target.value)}
                        className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-[#1A1A2E] focus:border-[#1B3F6E] focus:outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[11px] uppercase tracking-wider font-extrabold text-[#4A4A6A] block mb-1">Max (₹)</label>
                      <input
                        type="number"
                        min="500"
                        max="15000"
                        value={localFilters.priceRange[1]}
                        onChange={(e) => handlePriceChange(1, e.target.value)}
                        className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs text-[#1A1A2E] focus:border-[#1B3F6E] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-[#1B3F6E]">
                    ₹{localFilters.priceRange[0].toLocaleString('en-IN')} – ₹{localFilters.priceRange[1].toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>

            {/* 7. Extra Filters Accordion */}
            <div className="pb-2">
              <button
                type="button"
                onClick={() => toggleGroup('extra')}
                className="w-full flex justify-between items-center text-xs font-bold text-[#1B3F6E] uppercase tracking-widest cursor-pointer"
              >
                <span>EyeLeads Standards</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${openGroups.extra ? 'rotate-180' : ''}`} />
              </button>
              {openGroups.extra && (
                <div className="space-y-4 mt-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#4A4A6A]">Prescription Ready</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={localFilters.prescriptionAvailable}
                        onChange={(e) => handleExtraToggle('prescriptionAvailable', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#1B3F6E]"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#4A4A6A]">In Stock Only</span>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={localFilters.inStockOnly}
                        onChange={(e) => handleExtraToggle('inStockOnly', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#1B3F6E]"></div>
                    </label>
                  </div>

                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#1B3F6E] hover:bg-[#2E6DB4] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 transform transition-all cursor-pointer text-center"
            >
              Apply Filters
            </button>
          </form>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT PRODUCT CATALOG GRID */}
        {/* ========================================================================= */}
        <main className="flex-1 space-y-6">

          {/* Top catalog bar: count, sort dropdown, display selectors */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
            <div className="text-[#4A4A6A] text-sm font-semibold">
              Showing <span className="text-[#1B3F6E] font-bold">{count}</span> products
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">

              {/* Sort selector dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xxs uppercase tracking-wider font-extrabold text-[#4A4A6A]">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-[#1B3F6E]/20 text-[#1B3F6E] rounded-md px-3 py-1.5 text-xs font-semibold focus:border-[#1B3F6E] focus:outline-none bg-white cursor-pointer"
                >
                  <option value="newest">Newest Arrival</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="bestselling">Bestselling</option>
                </select>
              </div>

              {/* View selectors (Grid/List toggle icons) */}
              <div className="flex items-center border border-slate-200 rounded p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-slate-100 text-[#1B3F6E]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-all cursor-pointer ${viewMode === 'list' ? 'bg-slate-100 text-[#1B3F6E]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Active Filter Chips */}
          {getActiveChips().length > 0 && (
            <div className="flex flex-wrap items-center gap-2 select-none py-2 animate-fadeIn bg-tint/30 px-4 py-3 rounded-xl border border-slate-100">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#4A4A6A]">Active Filters:</span>
              {getActiveChips().map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => removeChip(chip)}
                  className="bg-white border border-[#1B3F6E]/15 hover:border-red-200 hover:bg-red-50 text-[#1B3F6E] hover:text-red-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <span>{chip.label}</span>
                  <X className="h-3 w-3 shrink-0" />
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#B8952A] hover:underline pl-2 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Catalog Listing States */}
          {loading ? (
            /* 1. Loading Skeletons */
            <div className={`grid gap-3 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 space-y-4 animate-pulse">
                  <div className="aspect-[4/5] bg-slate-100 rounded-lg"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-5 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* 2. Empty Catalog States */
            <div className="bg-white rounded-xl border border-slate-100 p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="bg-[#EAF0F8] p-5 rounded-full text-[#1B3F6E] mb-4">
                {filters.category.map(c => c.toLowerCase()).includes('sale') ? (
                  <Sparkles className="h-8 w-8 text-[#B8952A]" />
                ) : (
                  <SlidersHorizontal className="h-8 w-8 text-[#1B3F6E]" />
                )}
              </div>
              <h3 className="text-xl font-bold text-[#1A1A2E]">
                {filters.category.map(c => c.toLowerCase()).includes('sale') ? 'No Sale is Live' : 'No product listed'}
              </h3>
              <p className="text-sm text-[#4A4A6A] mt-2 max-w-sm leading-relaxed font-semibold">
                {filters.category.map(c => c.toLowerCase()).includes('sale')
                  ? 'There are currently no discount offers running. Please check back later or subscribe to our newsletter for exclusive drops!'
                  : "We couldn't find any eyewear matches with your selected filters. Try broadening your categories or clear active parameters."}
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-[#1B3F6E] hover:bg-[#B8952A] text-white font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-xl cursor-pointer transition-colors shadow mt-6"
              >
                {filters.category.map(c => c.toLowerCase()).includes('sale') ? 'Back to Shop' : 'Clear All Filters'}
              </button>
            </div>
          ) : (
            /* 3. Catalog Listings rendering */
            <div
              className={`grid gap-3 sm:gap-6 ${viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-1'
                }`}
            >
              {products.map((prod) => (
                <div key={prod._id || prod.id} className="animate-fadeIn">
                  {viewMode === 'grid' ? (
                    <ProductCard product={prod} />
                  ) : (
                    <ProductCardList product={prod} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PAGINATION PANEL */}
          {/* ========================================================================= */}
          {totalPages > 1 && !loading && (
            <div className="flex justify-center items-center gap-3 pt-10 border-t border-slate-100 select-none">
              {/* Prev */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-bold text-slate-500 cursor-pointer"
              >
                &lt;
              </button>

              {/* Pages circles */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${isActive
                        ? 'bg-[#1B3F6E] text-white shadow-sm'
                        : 'border border-slate-200 text-[#4A4A6A] hover:bg-slate-50'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {/* Next */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent font-bold text-slate-500 cursor-pointer"
              >
                &gt;
              </button>
            </div>
          )}

        </main>

      </div>

      {/* ========================================================================= */}
      {/* MOBILE COLLAPSED FILTERS DRAWER */}
      {/* ========================================================================= */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden animate-fadeIn">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)}></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">

              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                  <h3 className="font-bold text-sm text-[#1B3F6E] uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal className="h-4.5 w-4.5" />
                    <span>Filters</span>
                  </h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-xs uppercase tracking-wider font-extrabold text-[#4A4A6A]"
                  >
                    Close X
                  </button>
                </div>

                {/* Mobile Scrollable Form Filters */}
                <div className="space-y-6">
                  {/* Category */}
                  <div>
                    <h4 className="text-xxs font-bold text-[#1B3F6E] uppercase tracking-widest mb-3">Category</h4>
                    <div className="space-y-2">
                      {categoriesList.map((cat) => (
                        <label key={cat} className="flex items-center gap-2.5 text-xs text-[#4A4A6A] hover:text-[#1B3F6E] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localFilters.category.includes(cat)}
                            onChange={() => handleChecklistToggle('category', cat)}
                            className="rounded text-[#1B3F6E] focus:ring-[#1B3F6E] h-4 w-4 border-slate-300"
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <h4 className="text-xxs font-bold text-[#1B3F6E] uppercase tracking-widest mb-3">Gender</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {gendersList.map((gender) => {
                        const isActive = localFilters.gender === gender;
                        return (
                          <button
                            key={gender}
                            type="button"
                            onClick={() => handleGenderSelect(gender)}
                            className={`py-2 text-center text-xs font-semibold rounded-md border transition-all cursor-pointer ${isActive
                                ? 'bg-[#1B3F6E] border-[#1B3F6E] text-white shadow-sm'
                                : 'border-[#1B3F6E]/20 text-[#1B3F6E] hover:bg-slate-50'
                              }`}
                          >
                            {gender}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colors */}
                  <div>
                    <h4 className="text-xxs font-bold text-[#1B3F6E] uppercase tracking-widest mb-3">Colors</h4>
                    <div className="grid grid-cols-4 gap-3.5">
                      {colorsList.map((col) => {
                        const isChecked = localFilters.colors.includes(col.name);
                        return (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => handleColorToggle(col.name)}
                            className={`w-7 h-7 rounded-full border-2 border-white cursor-pointer relative ${isChecked ? 'ring-2 ring-[#1B3F6E]' : 'ring-1 ring-slate-200'
                              }`}
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          >
                            {isChecked && (
                              <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white mix-blend-difference font-bold">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Boolean iOS toggles */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#4A4A6A]">Prescription</span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={localFilters.prescriptionAvailable}
                          onChange={(e) => setLocalFilters({ ...localFilters, prescriptionAvailable: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#1B3F6E]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#4A4A6A]">In Stock Only</span>
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={localFilters.inStockOnly}
                          onChange={(e) => setLocalFilters({ ...localFilters, inStockOnly: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#1B3F6E]"></div>
                      </label>
                    </div>



                  </div>

                </div>
              </div>

              {/* Action buttons footer inside drawer */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <button
                  onClick={handleApplyFilters}
                  className="w-full bg-[#1B3F6E] text-white py-3 rounded font-bold text-xs uppercase tracking-wider shadow cursor-pointer text-center block"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleResetFilters}
                  className="w-full border border-slate-200 hover:bg-slate-50 py-3 rounded font-bold text-xs text-[#4A4A6A] tracking-wider cursor-pointer text-center block"
                >
                  Clear All
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Shop;
