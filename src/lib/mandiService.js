/**
 * Mandi Price Service — Phase 8D
 * Fetches live APMC mandi prices from data.gov.in API
 * Fallback: uses seeded Supabase data
 * Supports: 13 AP districts, 20+ crops, daily refresh
 */

import { supabase, DEFAULT_DISTRICT, AP_DISTRICTS } from './supabase';

// ── API Configuration ─────────────────────────────────────────────────────────
const DATA_GOV_API = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_API_KEY = import.meta.env.VITE_DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b'; // Free tier key

// AP crop name mapping (API names → clean names)
const CROP_MAP = {
  'paddy(dhan)(common)': 'Paddy', 'rice': 'Paddy', 'paddy': 'Paddy',
  'cotton': 'Cotton', 'cotton(long staple)': 'Cotton',
  'chillies(dry)': 'Chilli', 'chilli': 'Chilli', 'chillies': 'Chilli', 'dry chillies': 'Chilli',
  'turmeric': 'Turmeric', 'turmeric(bulb)': 'Turmeric',
  'groundnut': 'Groundnut', 'groundnut pods(raw)': 'Groundnut',
  'maize': 'Maize', 'jowar(sorghum)': 'Jowar',
  'bengal gram(chana)(whole)': 'Chana', 'bengalgram': 'Chana',
  'coconut': 'Coconut', 'coconut oil': 'Coconut Oil',
  'mango(raw-ripe)': 'Mango', 'mango': 'Mango',
  'tomato': 'Tomato', 'onion': 'Onion', 'banana': 'Banana',
  'sugarcane': 'Sugarcane', 'cashewnuts': 'Cashew', 'cashew kernel': 'Cashew',
  'black pepper': 'Black Pepper', 'coriander(dhania)(seeds)': 'Coriander',
  'ginger(dry)': 'Ginger', 'ginger(green)': 'Ginger',
  'sesamum(sesame,gingelly,til)': 'Sesame', 'sunflower': 'Sunflower',
};

// AP district mapping (API names → clean names)
const DISTRICT_MAP = {
  'guntur': 'Guntur', 'krishna': 'Krishna', 'east godavari': 'East Godavari',
  'west godavari': 'West Godavari', 'kurnool': 'Kurnool', 'anantapur': 'Anantapur',
  'chittoor': 'Chittoor', 'nellore': 'Nellore', 'prakasam': 'Prakasam',
  'srikakulam': 'Srikakulam', 'visakhapatnam': 'Visakhapatnam', 'vizianagaram': 'Vizianagaram',
  'ysr kadapa': 'YSR Kadapa', 'kadapa': 'YSR Kadapa', 'nandyal': 'Nandyal',
  'spsr nellore': 'Nellore', 'sri potti sriramulu nellore': 'Nellore',
};

/**
 * Fetch live prices from data.gov.in Agmarknet API
 * @param {string} state - State filter (default: Andhra Pradesh)
 * @returns {Array} Parsed price records
 */
export async function fetchLiveMandiPrices(state = 'Andhra Pradesh') {
  try {
    const url = new URL(DATA_GOV_API);
    url.searchParams.set('api-key', DATA_GOV_API_KEY);
    url.searchParams.set('format', 'json');
    url.searchParams.set('filters[state.keyword]', state);
    url.searchParams.set('limit', '500');
    url.searchParams.set('sort[arrival_date]', 'desc');

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(15000),
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const json = await res.json();
    if (!json.records || !Array.isArray(json.records)) return [];

    return json.records
      .filter(r => r.commodity && r.district && r.modal_price)
      .map(r => ({
        crop: normalizeCrop(r.commodity),
        district: normalizeDistrict(r.district),
        mandi: r.market || r.district,
        price: parseFloat(r.modal_price) || 0,
        min_price: parseFloat(r.min_price) || 0,
        max_price: parseFloat(r.max_price) || 0,
        unit: r.variety || 'Quintal',
        price_date: r.arrival_date ? parseApiDate(r.arrival_date) : new Date().toISOString().split('T')[0],
        source: 'agmarknet',
      }))
      .filter(r => r.crop && r.district && r.price > 0);
  } catch (err) {
    console.warn('⚠️ Mandi API fetch failed:', err.message);
    return [];
  }
}

/**
 * Refresh prices in Supabase from live API
 * Deduplicates by (crop, district, mandi, price_date)
 */
export async function refreshMandiPrices() {
  const prices = await fetchLiveMandiPrices();
  if (prices.length === 0) {
    console.log('ℹ️ No live prices fetched, using existing seeded data');
    return { success: true, count: 0, source: 'cache' };
  }

  let inserted = 0;
  const batchSize = 50;

  for (let i = 0; i < prices.length; i += batchSize) {
    const batch = prices.slice(i, i + batchSize);
    const { error } = await supabase.from('market_prices').upsert(
      batch.map(p => ({
        crop: p.crop,
        district: p.district,
        mandi: p.mandi,
        price: p.price,
        min_price: p.min_price,
        max_price: p.max_price,
        unit: p.unit,
        price_date: p.price_date,
        source: p.source,
      })),
      { onConflict: 'crop,district,price_date', ignoreDuplicates: true }
    );
    if (!error) inserted += batch.length;
  }

  console.log(`✅ Mandi refresh: ${inserted}/${prices.length} prices synced`);
  return { success: true, count: inserted, source: 'agmarknet' };
}

/**
 * Get price history for a specific crop+district (for charts)
 * @param {string} crop
 * @param {string} district
 * @param {number} days - Number of days of history (default: 30)
 */
export async function getPriceHistory(crop, district = DEFAULT_DISTRICT, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('market_prices')
    .select('price, min_price, max_price, price_date')
    .eq('crop', crop)
    .eq('district', district)
    .gte('price_date', since.toISOString().split('T')[0])
    .order('price_date', { ascending: true });

  if (error) {
    console.warn('Price history error:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Get price trends: 30-day, 90-day, 6-month, 1-year
 */
export async function getPriceTrends(crop, district = DEFAULT_DISTRICT) {
  const [d30, d90, d180, d365] = await Promise.all([
    getPriceHistory(crop, district, 30),
    getPriceHistory(crop, district, 90),
    getPriceHistory(crop, district, 180),
    getPriceHistory(crop, district, 365),
  ]);

  const calcTrend = (data) => {
    if (data.length < 2) return { change: 0, percent: 0, direction: 'stable' };
    const first = data[0].price;
    const last = data[data.length - 1].price;
    const change = last - first;
    const percent = first > 0 ? ((change / first) * 100).toFixed(1) : 0;
    return {
      change: Math.round(change),
      percent: parseFloat(percent),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      first, last,
      count: data.length,
    };
  };

  return {
    '30d': calcTrend(d30),
    '90d': calcTrend(d90),
    '6m': calcTrend(d180),
    '1y': calcTrend(d365),
    raw: { d30, d90, d180, d365 },
  };
}

/**
 * Check for price alerts — crop crossed threshold
 * Used by notification system
 */
export async function checkPriceAlerts(farmerId) {
  try {
    // Get farmer's watched crops from preferences
    const { data: prefs } = await supabase
      .from('farmer_preferences')
      .select('primary_crops, district')
      .eq('farmer_id', farmerId)
      .single();

    if (!prefs || !prefs.primary_crops) return [];

    const alerts = [];
    const district = prefs.district || DEFAULT_DISTRICT;

    for (const crop of prefs.primary_crops) {
      const history = await getPriceHistory(crop, district, 7);
      if (history.length < 2) continue;

      const prev = history[history.length - 2]?.price || 0;
      const curr = history[history.length - 1]?.price || 0;
      const changePercent = prev > 0 ? ((curr - prev) / prev) * 100 : 0;

      // Alert if price changed > 5% in a day
      if (Math.abs(changePercent) >= 5) {
        alerts.push({
          crop,
          district,
          previous: prev,
          current: curr,
          change: Math.round(curr - prev),
          changePercent: parseFloat(changePercent.toFixed(1)),
          direction: curr > prev ? 'up' : 'down',
          message: curr > prev
            ? `🟢 ${crop} price UP ₹${Math.round(curr - prev)}/Q (${changePercent.toFixed(1)}%) in ${district}`
            : `🔴 ${crop} price DOWN ₹${Math.round(prev - curr)}/Q (${Math.abs(changePercent).toFixed(1)}%) in ${district}`,
        });
      }
    }

    return alerts;
  } catch (err) {
    console.warn('Price alert check failed:', err.message);
    return [];
  }
}

/**
 * Get district comparison — same crop across AP districts
 */
export async function getDistrictComparison(crop) {
  const { data, error } = await supabase
    .from('market_prices')
    .select('district, mandi, price, min_price, max_price, price_date')
    .eq('crop', crop)
    .order('price', { ascending: false });

  if (error || !data) return [];

  // Deduplicate — latest price per district
  const latest = {};
  for (const row of data) {
    if (!latest[row.district] || row.price_date > latest[row.district].price_date) {
      latest[row.district] = row;
    }
  }

  return Object.values(latest).sort((a, b) => b.price - a.price);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeCrop(name) {
  const lower = (name || '').toLowerCase().trim();
  return CROP_MAP[lower] || name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function normalizeDistrict(name) {
  const lower = (name || '').toLowerCase().trim();
  return DISTRICT_MAP[lower] || name;
}

function parseApiDate(dateStr) {
  // Handle dd/mm/yyyy or yyyy-mm-dd
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
}

export default {
  fetchLiveMandiPrices,
  refreshMandiPrices,
  getPriceHistory,
  getPriceTrends,
  checkPriceAlerts,
  getDistrictComparison,
};
