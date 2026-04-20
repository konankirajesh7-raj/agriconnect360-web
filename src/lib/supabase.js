import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials not found — running in offline mock mode');
}

export const supabase = createClient(
  SUPABASE_URL || 'https://gwetaesjkkrtmhnxuekc.supabase.co',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
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
