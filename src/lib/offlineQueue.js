/**
 * Offline Queue + Optimistic UI — Phase 8C
 * Caches writes when offline, syncs on reconnect
 * Provides optimistic update helpers for instant UI feedback
 */

import { supabase } from './supabase';

const QUEUE_KEY = 'agri360_offline_queue';

// ── Offline Queue ────────────────────────────────────────────────────────────

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch { return []; }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Enqueue an operation for offline execution
 * @param {string} table - Supabase table name
 * @param {string} action - 'insert' | 'update' | 'delete'
 * @param {object} data - Row data
 * @param {string} [id] - Row ID (for update/delete)
 */
export function enqueueWrite(table, action, data, id = null) {
  const queue = getQueue();
  queue.push({
    id: crypto.randomUUID?.() || Date.now().toString(),
    table,
    action,
    data,
    rowId: id,
    timestamp: new Date().toISOString(),
    retries: 0,
  });
  saveQueue(queue);
  console.log(`📦 Queued offline ${action} on ${table}`);
}

/**
 * Process all queued writes
 * @returns {object} { success: number, failed: number }
 */
export async function syncQueue() {
  const queue = getQueue();
  if (queue.length === 0) return { success: 0, failed: 0 };

  let success = 0, failed = 0;
  const remaining = [];

  for (const item of queue) {
    try {
      let result;
      switch (item.action) {
        case 'insert':
          result = await supabase.from(item.table).insert(item.data);
          break;
        case 'update':
          result = await supabase.from(item.table).update(item.data).eq('id', item.rowId);
          break;
        case 'delete':
          result = await supabase.from(item.table).delete().eq('id', item.rowId);
          break;
      }

      if (result?.error) throw result.error;
      success++;
    } catch (err) {
      item.retries++;
      if (item.retries < 3) {
        remaining.push(item);
      }
      failed++;
      console.warn(`⚠️ Sync failed for ${item.table}:${item.action}`, err.message);
    }
  }

  saveQueue(remaining);
  if (success > 0) console.log(`✅ Synced ${success} queued operations`);
  return { success, failed };
}

/**
 * Smart write — attempts live write, falls back to queue if offline
 */
export async function smartWrite(table, action, data, id = null) {
  if (!navigator.onLine) {
    enqueueWrite(table, action, data, id);
    return { success: true, offline: true, data };
  }

  try {
    let result;
    switch (action) {
      case 'insert':
        result = await supabase.from(table).insert(data).select().single();
        break;
      case 'update':
        result = await supabase.from(table).update(data).eq('id', id).select().single();
        break;
      case 'delete':
        result = await supabase.from(table).delete().eq('id', id);
        break;
    }

    if (result?.error) throw result.error;
    return { success: true, offline: false, data: result?.data || data };
  } catch (err) {
    // If network error, queue it
    if (err.message?.includes('fetch') || err.message?.includes('network')) {
      enqueueWrite(table, action, data, id);
      return { success: true, offline: true, data };
    }
    return { success: false, error: err.message };
  }
}

// ── Auto-sync on reconnect ───────────────────────────────────────────────────

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Back online — syncing queued writes...');
    syncQueue();
  });

  // Periodic sync attempt every 60s
  setInterval(() => {
    if (navigator.onLine && getQueue().length > 0) {
      syncQueue();
    }
  }, 60000);
}

// ── Optimistic Update Helper ─────────────────────────────────────────────────

/**
 * Wrap a Supabase mutation with optimistic UI
 * @param {Function} setData - React state setter for the list
 * @param {Function} mutation - Async function that performs the actual write
 * @param {object} optimisticItem - The item to optimistically add/update
 * @param {'add'|'update'|'remove'} type - Type of mutation
 */
export async function optimisticMutation(setData, mutation, optimisticItem, type = 'add') {
  // Immediately update UI
  setData(prev => {
    switch (type) {
      case 'add':
        return [{ ...optimisticItem, _optimistic: true }, ...(prev || [])];
      case 'update':
        return (prev || []).map(item =>
          item.id === optimisticItem.id ? { ...item, ...optimisticItem, _optimistic: true } : item
        );
      case 'remove':
        return (prev || []).filter(item => item.id !== optimisticItem.id);
      default:
        return prev;
    }
  });

  try {
    // Perform actual mutation
    const result = await mutation();

    if (result?.error) throw result.error;

    // Replace optimistic item with real data
    if (type === 'add' && result?.data) {
      setData(prev =>
        (prev || []).map(item =>
          item._optimistic && item.id === optimisticItem.id ? { ...result.data } : item
        )
      );
    }

    return { success: true, data: result?.data };
  } catch (err) {
    // Rollback on failure
    setData(prev => {
      switch (type) {
        case 'add':
          return (prev || []).filter(item => item.id !== optimisticItem.id);
        case 'update':
        case 'remove':
          // Can't easily rollback these without original data
          return prev;
        default:
          return prev;
      }
    });

    return { success: false, error: err.message };
  }
}

export function getQueueLength() {
  return getQueue().length;
}

export default { enqueueWrite, syncQueue, smartWrite, optimisticMutation, getQueueLength };
