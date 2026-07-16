// Centralized lens/prescription pricing helpers — the single source of truth.

export const LENS_DETAILS = {
  types: {
    'single-vision': { id: 'single-vision', name: 'Single Vision Lenses', price: 0 },
    'bifocal': { id: 'bifocal', name: 'Bifocal Lenses', price: 500 },
    'progressive': { id: 'progressive', name: 'Progressive Lenses', price: 1500 }
  },
  materials: {
    'cr39': { id: 'cr39', name: 'CR-39 Plastic (Index 1.56)', price: 0 },
    'polycarbonate': { id: 'polycarbonate', name: 'Polycarbonate (Index 1.59)', price: 300 },
    'hi167': { id: 'hi167', name: 'High-Index (Index 1.67)', price: 600 },
    'hi174': { id: 'hi174', name: 'High-Index (Index 1.74)', price: 1200 },
    'trivex': { id: 'trivex', name: 'Trivex (Index 1.53)', price: 900 }
  },
  features: {
    'blue-cut': { id: 'blue-cut', name: 'Blue Cut Shield', price: 400 },
    'photochromic': { id: 'photochromic', name: 'Transitions / Photochromic', price: 800 },
    'polarized': { id: 'polarized', name: 'Polarized Glare Guard', price: 600 },
    'tinted': { id: 'tinted', name: 'Custom Color Tint', price: 0 },
    'uv400': { id: 'uv400', name: 'UV400 Protection', price: 0 },
    'anti-glare': { id: 'anti-glare', name: 'Anti-Glare Coating', price: 200 },
    'scratch-resistant': { id: 'scratch-resistant', name: 'Scratch-Proof Coating', price: 0 },
    'anti-fog': { id: 'anti-fog', name: 'Anti-Fog Shield', price: 300 }
  }
};

const findById = (list, id) => Array.isArray(list) && id
  ? list.find(item => (item.id || '').toLowerCase() === id.toLowerCase()) || null
  : null;

export const getMaterialDetail = (mat, storeSettings) => {
  if (!mat) return { name: 'Standard CR-39', price: 0 };
  
  const dbMatch = findById(storeSettings?.lensMaterials, mat);
  if (dbMatch) return dbMatch;

  const key = mat.toLowerCase();
  if (LENS_DETAILS.materials[key]) return LENS_DETAILS.materials[key];
  for (const [k, v] of Object.entries(LENS_DETAILS.materials)) {
    if (v.name.toLowerCase().includes(key) || key.includes(k)) return v;
  }
  return { name: mat, price: 0 };
};

export const getFeatureDetail = (feat, storeSettings) => {
  if (!feat) return { name: '', price: 0 };
  
  const dbMatch = findById(storeSettings?.lensFeatures, feat);
  if (dbMatch) return dbMatch;

  const key = feat.toLowerCase();
  if (LENS_DETAILS.features[key]) return LENS_DETAILS.features[key];
  for (const [k, v] of Object.entries(LENS_DETAILS.features)) {
    if (v.name.toLowerCase().includes(key) || key.includes(k)) return v;
  }
  const label = feat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return { name: label, price: 0 };
};

export const getLensTypeDetail = (type, storeSettings) => {
  if (!type) return { name: 'Single Vision Lenses', price: 0 };
  
  // Try direct ID match first
  let dbMatch = findById(storeSettings?.lensTypes, type);
  if (dbMatch) return dbMatch;

  // Try sub-string / key matching
  const key = type.toLowerCase();
  if (key.includes('progressive')) {
    const progMatch = findById(storeSettings?.lensTypes, 'progressive');
    if (progMatch) return progMatch;
    return LENS_DETAILS.types['progressive'];
  }
  if (key.includes('bifocal')) {
    const bifMatch = findById(storeSettings?.lensTypes, 'bifocal');
    if (bifMatch) return bifMatch;
    return LENS_DETAILS.types['bifocal'];
  }
  
  const svMatch = findById(storeSettings?.lensTypes, 'single-vision');
  if (svMatch) return svMatch;
  return LENS_DETAILS.types['single-vision'];
};

export const isPrescriptionLensType = (lensType) => {
  const type = (lensType || '').toLowerCase();
  if (type.includes('non-prescription') || type.includes('non prescription') || type.includes('zero power') || type.includes('frame only')) {
    return false;
  }
  return type.includes('single vision') ||
         type.includes('bifocal') ||
         type.includes('progressive') ||
         type.includes('prescription');
};

export const getOpticianFee = (storeSettings) => {
  return (storeSettings && typeof storeSettings.opticianFee === 'number') ? storeSettings.opticianFee : 500;
};

export const getItemPriceBreakdown = (item, storeSettings) => {
  const isPrescription = isPrescriptionLensType(item.options?.lensType);
  const config = item.options?.prescriptionData?.lensConfig || {};
  const opticianFee = isPrescription ? getOpticianFee(storeSettings) : 0;

  const typeDetail = isPrescription ? getLensTypeDetail(item.options?.lensType, storeSettings) : { name: '', price: 0 };
  const materialDetail = isPrescription ? getMaterialDetail(config.material, storeSettings) : { name: '', price: 0 };
  const featuresList = isPrescription ? (config.features || []).map(f => getFeatureDetail(f, storeSettings)) : [];
  const featuresSum = featuresList.reduce((sum, f) => sum + (f.price || 0), 0);

  const addOnPrice = typeDetail.price + materialDetail.price + featuresSum;
  
  const totalPriceField = item.price ?? item.product?.price ?? 0;
  
  let basePrice;
  if (item.isFreeGift) {
    basePrice = 0;
  } else if (isPrescription) {
    basePrice = Math.max(0, totalPriceField - opticianFee - addOnPrice);
  } else {
    basePrice = totalPriceField;
  }

  return { isPrescription, opticianFee, addOnPrice, basePrice, typeDetail, materialDetail, featuresList };
};
