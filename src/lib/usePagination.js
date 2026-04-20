/**
 * Pagination + Infinite Scroll Helper — Phase 8C
 * Provides usePagination hook for any Supabase table
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from './supabase';

/**
 * Paginated data fetcher hook
 * @param {string} table - Supabase table name
 * @param {object} options
 * @param {number} options.pageSize - Items per page (default: 20)
 * @param {string} options.orderBy - Column to order by (default: 'created_at')
 * @param {boolean} options.ascending - Sort direction (default: false = desc)
 * @param {object} options.filters - { column: value } pairs for .eq() filters
 * @param {string} options.select - Select clause (default: '*')
 */
export function usePagination(table, options = {}) {
  const {
    pageSize = 20,
    orderBy = 'created_at',
    ascending = false,
    filters = {},
    select = '*',
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false);

  const buildQuery = useCallback((from, to) => {
    let query = supabase
      .from(table)
      .select(select, { count: 'exact' })
      .order(orderBy, { ascending })
      .range(from, to);

    // Apply filters
    Object.entries(filters).forEach(([col, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query = query.eq(col, val);
      }
    });

    return query;
  }, [table, select, orderBy, ascending, JSON.stringify(filters)]);

  /**
   * Load first page (reset)
   */
  const loadFirst = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const { data: rows, count, error: err } = await buildQuery(0, pageSize - 1);
      if (err) throw err;

      setData(rows || []);
      setTotal(count || 0);
      setPage(1);
      setHasMore((rows || []).length === pageSize);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [buildQuery, pageSize]);

  /**
   * Load next page (append for infinite scroll)
   */
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data: rows, error: err } = await buildQuery(from, to);
      if (err) throw err;

      setData(prev => [...prev, ...(rows || [])]);
      setPage(p => p + 1);
      setHasMore((rows || []).length === pageSize);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [buildQuery, page, pageSize, hasMore]);

  /**
   * Go to specific page (for traditional pagination)
   */
  const goToPage = useCallback(async (pageNum) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const from = (pageNum - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data: rows, count, error: err } = await buildQuery(from, to);
      if (err) throw err;

      setData(rows || []);
      setTotal(count || 0);
      setPage(pageNum);
      setHasMore(to < (count || 0) - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [buildQuery, pageSize]);

  /**
   * Refresh current page
   */
  const refresh = useCallback(() => {
    if (page <= 1) return loadFirst();
    return goToPage(page);
  }, [page, loadFirst, goToPage]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    data,
    setData,
    loading,
    error,
    hasMore,
    page,
    total,
    totalPages,
    pageSize,
    loadFirst,
    loadMore,
    goToPage,
    refresh,
  };
}

/**
 * Infinite scroll observer hook
 * Attach ref to a sentinel element at the bottom of the list
 */
export function useInfiniteScroll(loadMore, hasMore) {
  const observer = useRef(null);

  const sentinelRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      if (!node || !hasMore) return;

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );

      observer.current.observe(node);
    },
    [loadMore, hasMore]
  );

  return sentinelRef;
}

export default { usePagination, useInfiniteScroll };
