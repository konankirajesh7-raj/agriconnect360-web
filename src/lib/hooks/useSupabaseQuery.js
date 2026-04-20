/**
 * useSupabaseQuery() — Phase 8C: Live data hook with fallback to mock data
 * Handles loading, errors, realtime subscriptions, and optimistic UI updates.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';

/**
 * Fetch data from Supabase with automatic fallback to mock data.
 * @param {string} table - Supabase table name
 * @param {object} options - Query options
 * @param {Array} mockData - Fallback mock data
 */
export function useSupabaseQuery(table, options = {}, mockData = []) {
  const {
    select = '*',
    filters = [],      // [{ column, op, value }] — op: 'eq','neq','gt','lt','gte','lte','like','ilike','in','is'
    orderBy = null,     // { column, ascending }
    limit = 100,
    single = false,
    enabled = true,
    realtime = false,   // Subscribe to realtime changes
    realtimeFilter = null,
  } = options;

  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const channelRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(table).select(select);

      // Apply filters
      for (const f of filters) {
        if (f.op === 'eq') query = query.eq(f.column, f.value);
        else if (f.op === 'neq') query = query.neq(f.column, f.value);
        else if (f.op === 'gt') query = query.gt(f.column, f.value);
        else if (f.op === 'lt') query = query.lt(f.column, f.value);
        else if (f.op === 'gte') query = query.gte(f.column, f.value);
        else if (f.op === 'lte') query = query.lte(f.column, f.value);
        else if (f.op === 'like') query = query.like(f.column, f.value);
        else if (f.op === 'ilike') query = query.ilike(f.column, f.value);
        else if (f.op === 'in') query = query.in(f.column, f.value);
        else if (f.op === 'is') query = query.is(f.column, f.value);
        else if (f.op === 'or') query = query.or(f.value);
      }

      if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      if (limit) query = query.limit(limit);
      if (single) query = query.single();

      const { data: result, error: err } = await query;
      if (err) throw err;

      setData(single ? result : (result || []));
      setIsLive(true);
    } catch (err) {
      console.warn(`Supabase query failed for '${table}', using mock data:`, err.message);
      setData(mockData);
      setIsLive(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, select, JSON.stringify(filters), JSON.stringify(orderBy), limit, single, enabled]);

  // Initial fetch
  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    if (!realtime || !enabled) return;

    const channelName = `${table}-realtime-${Date.now()}`;
    const channelConfig = {
      event: '*',
      schema: 'public',
      table,
    };
    if (realtimeFilter) channelConfig.filter = realtimeFilter;

    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, (payload) => {
        if (payload.eventType === 'INSERT') {
          setData(prev => Array.isArray(prev) ? [payload.new, ...prev] : payload.new);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => {
            if (!Array.isArray(prev)) return payload.new;
            return prev.map(item => item.id === payload.new.id ? payload.new : item);
          });
        } else if (payload.eventType === 'DELETE') {
          setData(prev => {
            if (!Array.isArray(prev)) return null;
            return prev.filter(item => item.id !== payload.old.id);
          });
        }
      })
      .subscribe();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [table, realtime, enabled, realtimeFilter]);

  return { data, loading, error, isLive, refetch: fetchData };
}

/**
 * CRUD operations for a Supabase table with optimistic updates.
 */
export function useSupabaseMutation(table) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const insert = useCallback(async (record) => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase.from(table).insert(record).select().single();
      if (err) throw err;
      return { success: true, data };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally { setLoading(false); }
  }, [table]);

  const update = useCallback(async (id, updates) => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase.from(table).update(updates).eq('id', id).select().single();
      if (err) throw err;
      return { success: true, data };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally { setLoading(false); }
  }, [table]);

  const remove = useCallback(async (id) => {
    setLoading(true); setError(null);
    try {
      const { error: err } = await supabase.from(table).delete().eq('id', id);
      if (err) throw err;
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally { setLoading(false); }
  }, [table]);

  const upsert = useCallback(async (record, conflictColumn = 'id') => {
    setLoading(true); setError(null);
    try {
      const { data, error: err } = await supabase.from(table).upsert(record, { onConflict: conflictColumn }).select().single();
      if (err) throw err;
      return { success: true, data };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally { setLoading(false); }
  }, [table]);

  return { insert, update, remove, upsert, loading, error };
}

/**
 * Aggregate query for dashboard stats.
 */
export function useSupabaseCount(table, filters = [], mockCount = 0) {
  const [count, setCount] = useState(mockCount);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        let query = supabase.from(table).select('*', { count: 'exact', head: true });
        for (const f of filters) {
          if (f.op === 'eq') query = query.eq(f.column, f.value);
          else if (f.op === 'neq') query = query.neq(f.column, f.value);
        }
        const { count: c, error } = await query;
        if (error) throw error;
        setCount(c || 0);
      } catch {
        setCount(mockCount);
      } finally { setLoading(false); }
    };
    fetch();
  }, [table, JSON.stringify(filters), mockCount]);

  return { count, loading };
}

export default useSupabaseQuery;
