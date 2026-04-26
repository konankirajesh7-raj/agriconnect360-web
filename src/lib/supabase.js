import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials not found — running in offline mock mode');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://gwetaesjkkrtmhnxuekc.supabase.co',
  SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZXRhZXNqa2tydG1obnh1ZWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMDgyMDUsImV4cCI6MjA4OTY4NDIwNX0.hFNMO_V_E3Ua2nf33ZijgFx_1J6jrO-GANm5XjqBhmY',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
      storageKey: 'ac360-auth',
      lock: false,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  }
);

// ── Constants ─────────────────────────────────────────────────────────────────
export const DEFAULT_STATE = import.meta.env.VITE_DEFAULT_STATE || 'Andhra Pradesh';
export const DEFAULT_DISTRICT = import.meta.env.VITE_DEFAULT_DISTRICT || 'Guntur';
export const DEFAULT_LAT = parseFloat(import.meta.env.VITE_DEFAULT_LAT || '16.3067');
export const DEFAULT_LON = parseFloat(import.meta.env.VITE_DEFAULT_LON || '80.4365');

export const AP_DISTRICTS = [
  'Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna',
  'Kurnool', 'Nandyal', 'Prakasam', 'Srikakulam', 'Visakhapatnam',
  'Vizianagaram', 'West Godavari', 'YSR Kadapa',
];

// ── Auth Helpers ──────────────────────────────────────────────────────────────
export const signInWithOTP = (phone) =>
  supabase.auth.signInWithOtp({ phone });

export const signInWithPassword = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signUpFarmer = (email, password, metadata) =>
  supabase.auth.signUp({ email, password, options: { data: metadata } });

export const signOut = () => supabase.auth.signOut();
export const getSession = () => supabase.auth.getSession();
export const getUser = () => supabase.auth.getUser();

// ── Database Helpers ──────────────────────────────────────────────────────────

// Farmers
export const farmersDB = {
  getAll: () => supabase.from('farmers').select('*').eq('state', DEFAULT_STATE).order('created_at', { ascending: false }),
  getById: (id) => supabase.from('farmers').select('*').eq('id', id).single(),
  create: (data) => supabase.from('farmers').insert({ ...data, state: DEFAULT_STATE }).select().single(),
  update: (id, data) => supabase.from('farmers').update(data).eq('id', id).select().single(),
  delete: (id) => supabase.from('farmers').delete().eq('id', id),
  count: () => supabase.from('farmers').select('*', { count: 'exact', head: true }).eq('state', DEFAULT_STATE),
};

// Fields
export const fieldsDB = {
  getAll: (farmerId) => farmerId
    ? supabase.from('fields').select('*').eq('farmer_id', farmerId)
    : supabase.from('fields').select('*, farmers(name)').order('created_at', { ascending: false }),
  create: (data) => supabase.from('fields').insert(data).select().single(),
  update: (id, data) => supabase.from('fields').update(data).eq('id', id).select().single(),
  delete: (id) => supabase.from('fields').delete().eq('id', id),
};

// Crops
export const cropsDB = {
  getAll: (farmerId) => farmerId
    ? supabase.from('crops').select('*').eq('farmer_id', farmerId)
    : supabase.from('crops').select('*, farmers(name)').order('created_at', { ascending: false }),
  getActive: () => supabase.from('crops').select('*').neq('status', 'harvested'),
  create: (data) => supabase.from('crops').insert(data).select().single(),
  update: (id, data) => supabase.from('crops').update(data).eq('id', id).select().single(),
  count: () => supabase.from('crops').select('*', { count: 'exact', head: true }),
};

// Market prices
export const pricesDB = {
  getAll: () => supabase.from('market_prices').select('*').order('price_date', { ascending: false }),
  getByDistrict: (district = DEFAULT_DISTRICT) => supabase.from('market_prices').select('*').eq('district', district),
  getLatest: (crop) => supabase.from('market_prices').select('*').ilike('crop', `%${crop}%`).limit(20),
  count: () => supabase.from('market_prices').select('*', { count: 'exact', head: true }),
};

// Expenses
export const expensesDB = {
  getAll: (farmerId) => farmerId
    ? supabase.from('expenses').select('*').eq('farmer_id', farmerId).order('expense_date', { ascending: false })
    : supabase.from('expenses').select('*, farmers(name)').order('expense_date', { ascending: false }),
  create: (data) => supabase.from('expenses').insert(data).select().single(),
  update: (id, data) => supabase.from('expenses').update(data).eq('id', id).select().single(),
  delete: (id) => supabase.from('expenses').delete().eq('id', id),
  totalByFarmer: (farmerId) => supabase.from('expenses').select('amount').eq('farmer_id', farmerId),
};

// Sales
export const salesDB = {
  getAll: (farmerId) => farmerId
    ? supabase.from('sales').select('*').eq('farmer_id', farmerId).order('sale_date', { ascending: false })
    : supabase.from('sales').select('*, farmers(name)').order('sale_date', { ascending: false }),
  create: (data) => supabase.from('sales').insert(data).select().single(),
  update: (id, data) => supabase.from('sales').update(data).eq('id', id).select().single(),
  count: () => supabase.from('sales').select('*', { count: 'exact', head: true }),
};

// Soil tests
export const soilDB = {
  getAll: (farmerId) => supabase.from('soil_tests').select('*').eq('farmer_id', farmerId),
  create: (data) => supabase.from('soil_tests').insert(data).select().single(),
};

// Labour
export const labourDB = {
  createBooking: (data) => supabase.from('labour_bookings').insert(data).select().single(),
  getBookings: (farmerId) => supabase.from('labour_bookings').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
  countBookings: () => supabase.from('labour_bookings').select('*', { count: 'exact', head: true }),
};

// Equipment
export const equipmentDB = {
  createBooking: (data) => supabase.from('equipment_bookings').insert(data).select().single(),
  getBookings: (farmerId) => supabase.from('equipment_bookings').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
};

// Transport
export const transportDB = {
  createBooking: (data) => supabase.from('transport_bookings').insert(data).select().single(),
  getBookings: (farmerId) => supabase.from('transport_bookings').select('*').eq('farmer_id', farmerId),
};

// Insurance
export const insuranceDB = {
  getAll: (farmerId) => supabase.from('insurance_policies').select('*').eq('farmer_id', farmerId),
  create: (data) => supabase.from('insurance_policies').insert(data).select().single(),
};

// Wallet
export const walletDB = {
  getTransactions: (farmerId) => supabase.from('wallet_transactions').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
  getBalance: async (farmerId) => {
    const { data } = await supabase.from('wallet_transactions').select('amount, type').eq('farmer_id', farmerId);
    if (!data) return 0;
    return data.reduce((sum, t) => sum + (t.type === 'credit' || t.type === 'reward' ? t.amount : -t.amount), 0);
  },
};

// Notifications
export const notificationsDB = {
  getAll: (farmerId) => supabase.from('notifications').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
  markRead: (id) => supabase.from('notifications').update({ is_read: true }).eq('id', id),
  markAllRead: (farmerId) => supabase.from('notifications').update({ is_read: true }).eq('farmer_id', farmerId),
  getUnreadCount: async (farmerId) => {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('farmer_id', farmerId).eq('is_read', false);
    return count || 0;
  },
};

// Schemes
export const schemesDB = {
  applyForScheme: (data) => supabase.from('scheme_applications').insert(data).select().single(),
  getApplications: (farmerId) => supabase.from('scheme_applications').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
};

// Knowledge articles — static data (no DB table, served from frontend)
export const knowledgeDB = {
  // Knowledge articles are served statically from the KnowledgePage component
};

// Disputes
export const disputesDB = {
  getAll: (farmerId) => supabase.from('disputes').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
  create: (data) => supabase.from('disputes').insert(data).select().single(),
  update: (id, data) => supabase.from('disputes').update(data).eq('id', id).select().single(),
};

// Community / Network
export const networkDB = {
  getPosts: () => supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(50),
  createPost: (data) => supabase.from('community_posts').insert(data).select().single(),
  likePost: async (id) => {
    const { data: post } = await supabase.from('community_posts').select('likes').eq('id', id).single();
    if (post) return supabase.from('community_posts').update({ likes: (post.likes || 0) + 1 }).eq('id', id);
  },
};

// Drone reports
export const droneDB = {
  getAll: (farmerId) => supabase.from('drone_reports').select('*, fields(name)').eq('farmer_id', farmerId),
  create: (data) => supabase.from('drone_reports').insert(data).select().single(),
};

// Weather alerts
export const weatherAlertsDB = {
  getActive: (district = DEFAULT_DISTRICT) => supabase.from('weather_alerts').select('*').eq('district', district).gte('valid_until', new Date().toISOString()),
};

// Farmer preferences
export const preferencesDB = {
  get: (farmerId) => supabase.from('farmer_preferences').select('*').eq('farmer_id', farmerId).single(),
  upsert: (data) => supabase.from('farmer_preferences').upsert(data, { onConflict: 'farmer_id' }).select().single(),
};

// ── Premium Phase 12 Helpers ───────────────────────────────────────────────────
const PREMIUM_API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getPremiumAuthToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('agri_admin_token') || '';
}

async function premiumApiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getPremiumAuthToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const base = PREMIUM_API_BASE || '';
  const prefix = base.endsWith('/api/v1') ? '/premium' : '/api/v1/premium';
  const url = `${base}${prefix}${path}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        data: null,
        error: { message: payload?.message || payload?.error || `Premium API request failed (${response.status})` },
      };
    }
    return { data: payload?.data ?? payload ?? null, error: null };
  } catch (err) {
    return { data: null, error: { message: err?.message || 'Premium API unavailable' } };
  }
}

async function withPremiumFallback(supabaseRunner, apiRunner) {
  let supabaseResult;
  try {
    supabaseResult = await supabaseRunner();
  } catch (err) {
    supabaseResult = { data: null, error: { message: err?.message || 'Supabase request failed' } };
  }

  if (!supabaseResult?.error) return supabaseResult;

  // Only attempt API fallback if we have a configured API base
  if (PREMIUM_API_BASE) {
    try {
      const apiResult = await apiRunner();
      if (!apiResult?.error) return apiResult;
    } catch (e) {
      // silently ignore API fallback failures
    }
  }

  return supabaseResult;
}

export const premiumDB = {
  disease: {
    getHistory: (farmerId) => withPremiumFallback(
      () => supabase.from('disease_scans').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }).limit(100),
      () => premiumApiRequest('/disease-scans')
    ),
    createScan: (data) => withPremiumFallback(
      () => supabase.from('disease_scans').insert(data).select().single(),
      () => premiumApiRequest('/disease-scans', { method: 'POST', body: data })
    ),
    updateScan: (id, data) => withPremiumFallback(
      () => supabase.from('disease_scans').update(data).eq('id', id).select().single(),
      () => premiumApiRequest(`/disease-scans/${id}`, { method: 'PUT', body: data })
    ),
  },
  notifications: {
    getPreferences: (farmerId) => withPremiumFallback(
      () => supabase.from('notification_preferences').select('*').eq('farmer_id', farmerId).maybeSingle(),
      () => premiumApiRequest('/notification-preferences')
    ),
    upsertPreferences: (data) => withPremiumFallback(
      () => supabase.from('notification_preferences').upsert(data, { onConflict: 'farmer_id' }).select().single(),
      () => premiumApiRequest('/notification-preferences', { method: 'PUT', body: data })
    ),
  },
  reports: {
    create: (data) => withPremiumFallback(
      () => supabase.from('premium_reports').insert(data).select().single(),
      () => premiumApiRequest('/reports', { method: 'POST', body: data })
    ),
    getAll: (farmerId) => withPremiumFallback(
      () => supabase.from('premium_reports').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
      () => premiumApiRequest('/reports')
    ),
  },
  whatsapp: {
    createInteraction: (data) => withPremiumFallback(
      () => supabase.from('whatsapp_interactions').insert(data).select().single(),
      () => premiumApiRequest('/whatsapp/interactions', { method: 'POST', body: data })
    ),
    getInteractions: (farmerId) => withPremiumFallback(
      () => supabase.from('whatsapp_interactions').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }).limit(100),
      () => premiumApiRequest('/whatsapp/interactions')
    ),
  },
  store: {
    getListings: () => withPremiumFallback(
      () => supabase.from('f2c_store_listings').select('*').order('created_at', { ascending: false }),
      () => premiumApiRequest('/store/listings', { auth: false })
    ),
    createListing: (data) => withPremiumFallback(
      () => supabase.from('f2c_store_listings').insert(data).select().single(),
      () => premiumApiRequest('/store/listings', { method: 'POST', body: data })
    ),
    updateListing: (id, data) => withPremiumFallback(
      () => supabase.from('f2c_store_listings').update(data).eq('id', id).select().single(),
      () => premiumApiRequest(`/store/listings/${id}`, { method: 'PUT', body: data })
    ),
  },
  analytics: {
    createSnapshot: (data) => withPremiumFallback(
      () => supabase.from('analytics_snapshots').insert(data).select().single(),
      () => premiumApiRequest('/analytics/snapshots', { method: 'POST', body: data })
    ),
    getSnapshots: (farmerId) => withPremiumFallback(
      () => supabase.from('analytics_snapshots').select('*').eq('farmer_id', farmerId).order('created_at', { ascending: false }),
      () => premiumApiRequest('/analytics/snapshots')
    ),
  },
  iot: {
    getSensors: (farmerId) => withPremiumFallback(
      () => supabase.from('iot_sensor_data').select('*').eq('farmer_id', farmerId).order('recorded_at', { ascending: false }).limit(200),
      () => premiumApiRequest('/iot/sensors')
    ),
    insertSensorData: (data) => withPremiumFallback(
      () => supabase.from('iot_sensor_data').insert(data).select().single(),
      () => premiumApiRequest('/iot/sensors', { method: 'POST', body: data })
    ),
  },
  finance: {
    getKcc: (farmerId) => withPremiumFallback(
      () => supabase.from('kcc_trackers').select('*').eq('farmer_id', farmerId).maybeSingle(),
      () => premiumApiRequest('/finance/kcc')
    ),
    upsertKcc: (data) => withPremiumFallback(
      () => supabase.from('kcc_trackers').upsert(data, { onConflict: 'farmer_id' }).select().single(),
      () => premiumApiRequest('/finance/kcc', { method: 'PUT', body: data })
    ),
    getLoanMarketplace: () => withPremiumFallback(
      () => supabase.from('loan_marketplace').select('*').order('interest_rate', { ascending: true }),
      () => premiumApiRequest('/finance/loans')
    ),
  },
  gamification: {
    getProfile: (farmerId) => withPremiumFallback(
      () => supabase.from('gamification_profiles').select('*').eq('farmer_id', farmerId).maybeSingle(),
      () => premiumApiRequest('/gamification/profile')
    ),
    upsertProfile: (data) => withPremiumFallback(
      () => supabase.from('gamification_profiles').upsert(data, { onConflict: 'farmer_id' }).select().single(),
      () => premiumApiRequest('/gamification/profile', { method: 'PUT', body: data })
    ),
    getLeaderboard: () => withPremiumFallback(
      () => supabase.from('gamification_profiles').select('*').order('agri_coins', { ascending: false }).limit(50),
      () => premiumApiRequest('/gamification/leaderboard')
    ),
  },
};

// ── Realtime Subscriptions ────────────────────────────────────────────────────
export const subscribeToWeatherAlerts = (district, callback) => {
  return supabase
    .channel('weather-alerts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'weather_alerts', filter: `district=eq.${district}` }, callback)
    .subscribe();
};

export const subscribeToMarketPrices = (callback) => {
  return supabase
    .channel('market-prices')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'market_prices' }, callback)
    .subscribe();
};

export const subscribeToNotifications = (farmerId, callback) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `farmer_id=eq.${farmerId}` }, callback)
    .subscribe();
};

export default supabase;
