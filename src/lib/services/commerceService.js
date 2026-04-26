/**
 * AgriConnect 360 — Advanced Commerce Service (Phase 14E)
 * Enhanced F2C Store, Quality Certification, Delivery Tracking, Bulk Order System
 */

/** 14E.1 — Enhanced F2C Store */
export const PRODUCT_CATEGORIES = [
  { id: 'grains', label: 'Grains & Cereals', icon: '🌾', count: 45 },
  { id: 'vegetables', label: 'Vegetables', icon: '🥬', count: 32 },
  { id: 'fruits', label: 'Fruits', icon: '🍎', count: 28 },
  { id: 'spices', label: 'Spices', icon: '🌶️', count: 18 },
  { id: 'dairy', label: 'Dairy Products', icon: '🥛', count: 12 },
  { id: 'organic', label: 'Organic Produce', icon: '🌿', count: 22 },
  { id: 'processed', label: 'Processed Foods', icon: '🫙', count: 15 },
];

export function filterProducts(products, filters = {}) {
  return products.filter(p => {
    if (filters.category && p.category !== filters.category) return false;
    if (filters.minPrice && p.price < filters.minPrice) return false;
    if (filters.maxPrice && p.price > filters.maxPrice) return false;
    if (filters.organic && !p.isOrganic) return false;
    if (filters.certified && !p.certifications?.length) return false;
    if (filters.district && p.farmerDistrict !== filters.district) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.farmerName?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

export function sortProducts(products, sortBy = 'newest') {
  const sorted = [...products];
  switch (sortBy) {
    case 'price_low': return sorted.sort((a, b) => a.price - b.price);
    case 'price_high': return sorted.sort((a, b) => b.price - a.price);
    case 'rating': return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'popular': return sorted.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
    case 'newest': default: return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

/** 14E.2 — Quality Certification System */
export const QUALITY_GRADES = [
  { grade: 'A+', label: 'Premium', color: '#22c55e', minScore: 90, description: 'Exceeds all quality standards' },
  { grade: 'A', label: 'Excellent', color: '#34d399', minScore: 80, description: 'Meets all quality standards' },
  { grade: 'B', label: 'Good', color: '#fbbf24', minScore: 65, description: 'Meets most standards with minor deviations' },
  { grade: 'C', label: 'Average', color: '#f97316', minScore: 50, description: 'Below standard — improvements needed' },
  { grade: 'D', label: 'Poor', color: '#ef4444', minScore: 0, description: 'Does not meet quality standards' },
];

export function calculateQualityScore(params) {
  const { moisture = 0, impurity = 0, brokenGrain = 0, foreignMatter = 0, aroma = 5, color = 5, size = 5 } = params;
  let score = 100;
  score -= Math.max(0, moisture - 12) * 3;
  score -= impurity * 5;
  score -= brokenGrain * 2;
  score -= foreignMatter * 8;
  score += (aroma - 3) * 2;
  score += (color - 3) * 2;
  score += (size - 3) * 1.5;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const grade = QUALITY_GRADES.find(g => score >= g.minScore) || QUALITY_GRADES[QUALITY_GRADES.length - 1];
  return { score, ...grade, parameters: params };
}

export function generateQualityCertificate(product, qualityResult, inspector) {
  return {
    certificateId: `QC-${Date.now().toString(36).toUpperCase()}`,
    issueDate: new Date().toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    product: { name: product.name, category: product.category, quantity: product.quantity, unit: product.unit },
    farmer: { name: product.farmerName, district: product.farmerDistrict, farmerId: product.farmerId },
    quality: qualityResult,
    inspector: inspector || { name: 'AgriConnect QC Bot', id: 'AUTO' },
    certifications: qualityResult.score >= 80 ? ['FSSAI', 'Grade A'] : qualityResult.score >= 65 ? ['FSSAI'] : [],
    qrCode: `https://agriconnect360.in/verify/${Date.now().toString(36)}`,
  };
}

/** 14E.3 — Delivery Tracking */
export const DELIVERY_STATUSES = [
  { code: 'placed', label: 'Order Placed', icon: '📋', step: 1 },
  { code: 'confirmed', label: 'Confirmed by Farmer', icon: '✅', step: 2 },
  { code: 'packed', label: 'Packed & Ready', icon: '📦', step: 3 },
  { code: 'picked_up', label: 'Picked Up', icon: '🚛', step: 4 },
  { code: 'in_transit', label: 'In Transit', icon: '🛣️', step: 5 },
  { code: 'out_for_delivery', label: 'Out for Delivery', icon: '📍', step: 6 },
  { code: 'delivered', label: 'Delivered', icon: '🎉', step: 7 },
];

export function getDeliveryProgress(currentStatus) {
  const current = DELIVERY_STATUSES.find(s => s.code === currentStatus);
  return {
    current,
    steps: DELIVERY_STATUSES.map(s => ({ ...s, completed: s.step <= (current?.step || 0), active: s.step === current?.step })),
    progressPercent: current ? Math.round((current.step / DELIVERY_STATUSES.length) * 100) : 0,
  };
}

export function estimateDeliveryTime(fromDistrict, toDistrict, orderTime) {
  const sameDistrict = fromDistrict === toDistrict;
  const hours = sameDistrict ? 4 + Math.random() * 8 : 24 + Math.random() * 48;
  const eta = new Date(new Date(orderTime).getTime() + hours * 60 * 60 * 1000);
  return { estimatedHours: Math.round(hours), eta: eta.toISOString(), sameDay: hours < 12 };
}

/** 14E.4 — Bulk Order System */
export function calculateBulkDiscount(quantity, unitPrice, tierConfig = null) {
  const tiers = tierConfig || [
    { minQty: 100, discount: 5 },
    { minQty: 500, discount: 10 },
    { minQty: 1000, discount: 15 },
    { minQty: 5000, discount: 20 },
  ];
  const applicable = tiers.filter(t => quantity >= t.minQty).sort((a, b) => b.discount - a.discount);
  const discountPercent = applicable[0]?.discount || 0;
  const discountAmount = Math.round(unitPrice * quantity * discountPercent / 100);
  const totalBefore = unitPrice * quantity;
  const totalAfter = totalBefore - discountAmount;
  return { quantity, unitPrice, discountPercent, discountAmount, totalBefore, totalAfter, effectivePrice: Math.round(totalAfter / quantity), tier: applicable[0] || null, nextTier: tiers.find(t => quantity < t.minQty) };
}

export function generateBulkInvoice(order, buyerInfo, sellerInfo) {
  const gstRate = 5;
  const subtotal = order.totalAfter || order.quantity * order.unitPrice;
  const gstAmount = Math.round(subtotal * gstRate / 100);
  return {
    invoiceId: `INV-${Date.now().toString(36).toUpperCase()}`,
    invoiceDate: new Date().toISOString(),
    buyer: buyerInfo,
    seller: sellerInfo,
    items: [{ description: order.productName, quantity: order.quantity, unit: order.unit, unitPrice: order.unitPrice, discount: order.discountPercent || 0, total: subtotal }],
    subtotal,
    gstRate,
    gstAmount,
    cgst: Math.round(gstAmount / 2),
    sgst: Math.round(gstAmount / 2),
    grandTotal: subtotal + gstAmount,
    paymentTerms: 'Net 7 days',
    bankDetails: sellerInfo.bankDetails || {},
  };
}

export default { PRODUCT_CATEGORIES, filterProducts, sortProducts, calculateQualityScore, generateQualityCertificate, DELIVERY_STATUSES, getDeliveryProgress, estimateDeliveryTime, calculateBulkDiscount, generateBulkInvoice };
