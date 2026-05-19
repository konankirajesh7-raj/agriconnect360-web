/**
 * Phase 8D — Mandi API Service
 * Integrates with Agmarknet (data.gov.in) for live APMC prices
 * Falls back to Supabase seed data when API is unavailable
 */
import { supabase, DEFAULT_STATE } from '../supabase';

const AGMARKNET_API = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_API_KEY = import.meta.env.VITE_DATA_GOV_API_KEY || '';

// AP district → mandi mapping
const AP_MANDIS = {
  'Guntur': ['Guntur', 'Narasaraopet', 'Tenali', 'Sattenapalli'],
  'Krishna': ['Vijayawada', 'Machilipatnam', 'Gudivada'],
  'Kurnool': ['Kurnool', 'Adoni', 'Nandyal'],
  'Prakasam': ['Ongole', 'Chirala', 'Markapur'],
  'Chittoor': ['Madanapalle', 'Tirupati', 'Palamaner'],
  'Anantapur': ['Anantapur', 'Dharmavaram', 'Hindupur'],
  'East Godavari': ['Rajahmundry', 'Kakinada', 'Amalapuram'],
  'West Godavari': ['Eluru', 'Bhimavaram', 'Tanuku'],
  'Visakhapatnam': ['Visakhapatnam', 'Anakapalli'],
  'Srikakulam': ['Srikakulam', 'Palasa'],
  'Vizianagaram': ['Vizianagaram', 'Bobbili'],
  'YSR Kadapa': ['Kadapa', 'Proddatur', 'Rajampet'],
  'Nandyal': ['Nandyal', 'Atmakur'],
};

// Key AP crops
const AP_CROPS = [
  'Paddy', 'Cotton', 'Chilli', 'Maize', 'Groundnut', 'Turmeric',
  'Tobacco', 'Sugarcane', 'Tomato', 'Onion', 'Banana', 'Mango',
  'Black Gram', 'Green Gram', 'Jowar', 'Coconut', 'Sunflower',
  'Bengal Gram', 'Sesame', 'Castor',
];

/**
 * Fetch live mandi prices from Agmarknet API
 */
export async function fetchLiveMandiPrices(state = 'Andhra Pradesh', commodity = '', limit = 50) {
  try {
    if (!DATA_GOV_API_KEY) throw new Error('No data.gov.in API key');

    const params = new URLSearchParams({
      'api-key': DATA_GOV_API_KEY,
      format: 'json',
      limit: String(limit),
      'filters[state]': state,
    });

    if (commodity) {
      params.append('filters[commodity]', commodity);
    }

    const response = await fetch(`${AGMARKNET_API}?${params}`);
    if (!response.ok) throw new Error(`API returned ${response.status}`);

    const data = await response.json();
    if (!data.records?.length) throw new Error('No records found');

    // Transform Agmarknet format to our schema
    return data.records.map(r => ({
      crop: r.commodity,
      variety: r.variety,
      mandi: r.market,
      district: r.district,
      min_price: parseFloat(r.min_price) || 0,
      max_price: parseFloat(r.max_price) || 0,
      price: parseFloat(r.modal_price) || 0,
      price_date: r.arrival_date,
      source: 'agmarknet_live',
    }));
  } catch (err) {
    /* warn removed */
    return null; // Will fallback to Supabase data
  }
}

/**
 * Sync live prices to Supabase (upsert)
 */
export async function syncPricesToSupabase(prices) {
  if (!prices?.length) return { success: false, error: 'No prices to sync' };

  try {
    const { data, error } = await supabase
      .from('market_prices')
      .upsert(
        prices.map(p => ({
          crop: p.crop,
          district: p.district,
          mandi: p.mandi,
          price: p.price,
          min_price: p.min_price,
          max_price: p.max_price,
          price_date: p.price_date,
          source: p.source || 'agmarknet',
        })),
        { onConflict: 'crop,district,price_date', ignoreDuplicates: true }
      );

    if (error) throw error;
    return { success: true, synced: prices.length };
  } catch (err) {
    /* warn removed */
    return { success: false, error: err.message };
  }
}

/**
 * Get all market prices (tries live API first, then Supabase)
 */
export async function getMarketPrices(state = DEFAULT_STATE, district = null) {
  // Try live API first
  const livePrices = await fetchLiveMandiPrices(state);
  if (livePrices?.length) {
    // Sync to Supabase in background
    syncPricesToSupabase(livePrices).catch(() => {});
    if (district) return livePrices.filter(p => p.district === district);
    return livePrices;
  }

  // Fallback: read from Supabase
  try {
    let query = supabase.from('market_prices').select('*').order('price_date', { ascending: false });
    if (district) query = query.eq('district', district);
    const { data, error } = await query.limit(100);
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Get price history for a crop (30/90/365 days)
 */
export async function getPriceHistory(cropType, district = null, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];

  try {
    let query = supabase
      .from('market_prices')
      .select('price, min_price, max_price, price_date, mandi')
      .ilike('crop', `%${cropType}%`)
      .gte('price_date', sinceStr)
      .order('price_date', { ascending: true });

    if (district) query = query.eq('district', district);

    const { data, error } = await query.limit(365);
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Get price alerts — crops where price crossed a threshold
 */
export async function getPriceAlerts(thresholdPercent = 5) {
  try {
     const { data } = await supabase
      .from('market_prices')
      .select('*')
      .order('price_date', { ascending: false })
      .limit(50);

    if (!data?.length) return [];

    // Group by crop and check for significant changes
    const cropGroups = {};
    data.forEach(p => {
      if (!cropGroups[p.crop]) cropGroups[p.crop] = [];
      cropGroups[p.crop].push(p);
    });

    const alerts = [];
    Object.entries(cropGroups).forEach(([crop, prices]) => {
      if (prices.length < 2) return;
      const latest = prices[0].price;
      const previous = prices[1].price;
      const change = ((latest - previous) / previous) * 100;
      if (Math.abs(change) >= thresholdPercent) {
        alerts.push({
          crop,
          market: prices[0].mandi,
          district: prices[0].district,
          current: latest,
          previous,
          changePercent: change.toFixed(1),
          direction: change > 0 ? 'up' : 'down',
        });
      }
    });

    return alerts;
  } catch {
    return [];
  }
}

export { AP_MANDIS, AP_CROPS };
export default { fetchLiveMandiPrices, syncPricesToSupabase, getMarketPrices, getPriceHistory, getPriceAlerts };
