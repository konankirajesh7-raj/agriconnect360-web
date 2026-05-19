/**
 * useDashboardData — shared hook for all role dashboards
 * Fetches real data from Supabase for the current user
 */
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';

export function useDashboardData() {
  const { user, farmerProfile } = useAuth();
  const uid = user?.id;

  const [data, setData] = useState({
    sales: [], expenses: [], crops: [], fields: [],
    labourBookings: [], transportBookings: [], equipmentBookings: [],
    disputes: [], notifications: [], marketPrices: [],
    marketplaceListings: [], communityPosts: [],
    coldStorageBookings: [], profile: null,
    loading: true,
  });

  useEffect(() => {
    if (!uid) { setData(d => ({ ...d, loading: false })); return; }

    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled([
        supabase.from('sales').select('*').eq('farmer_id', uid).order('sale_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('farmer_id', uid).order('expense_date', { ascending: false }),
        supabase.from('crops').select('*').eq('farmer_id', uid),
        supabase.from('fields').select('*').eq('farmer_id', uid),
        supabase.from('labour_bookings').select('*').eq('farmer_id', uid).order('created_at', { ascending: false }),
        supabase.from('transport_bookings').select('*').eq('farmer_id', uid).order('created_at', { ascending: false }),
        supabase.from('equipment_bookings').select('*').eq('farmer_id', uid).order('created_at', { ascending: false }),
        supabase.from('disputes').select('*').eq('farmer_id', uid).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('farmer_id', uid).eq('is_read', false).order('created_at', { ascending: false }),
        supabase.from('market_prices').select('*').order('price_date', { ascending: false }).limit(50),
        supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('cold_storage_bookings').select('*').eq('farmer_id', uid),
        supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      ]);

      if (cancelled) return;

      const extract = (r) => r.status === 'fulfilled' ? (r.value?.data || []) : [];
      const extractOne = (r) => r.status === 'fulfilled' ? (r.value?.data || null) : null;

      setData({
        sales: extract(results[0]),
        expenses: extract(results[1]),
        crops: extract(results[2]),
        fields: extract(results[3]),
        labourBookings: extract(results[4]),
        transportBookings: extract(results[5]),
        equipmentBookings: extract(results[6]),
        disputes: extract(results[7]),
        notifications: extract(results[8]),
        marketPrices: extract(results[9]),
        marketplaceListings: extract(results[10]),
        communityPosts: extract(results[11]),
        coldStorageBookings: extract(results[12]),
        profile: extractOne(results[13]),
        loading: false,
      });
    })();

    return () => { cancelled = true; };
  }, [uid]);

  // Computed stats
  const totalSales = data.sales.reduce((s, r) => s + (parseFloat(r.amount || r.total_amount || 0)), 0);
  const totalExpenses = data.expenses.reduce((s, r) => s + (parseFloat(r.amount || 0)), 0);
  const profit = totalSales - totalExpenses;
  const activeCrops = data.crops.filter(c => c.status !== 'harvested').length;
  const pendingDisputes = data.disputes.filter(d => d.status !== 'resolved').length;
  const unreadNotifs = data.notifications.length;

  return {
    ...data,
    uid,
    userName: farmerProfile?.name || data.profile?.full_name || 'User',
    userRole: farmerProfile?.role || data.profile?.role || 'farmer',
    totalSales,
    totalExpenses,
    profit,
    activeCrops,
    pendingDisputes,
    unreadNotifs,
  };
}

export default useDashboardData;
