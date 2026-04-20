import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase, DEFAULT_STATE, DEFAULT_DISTRICT } from '../supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuthProvider();
  return React.createElement(AuthContext.Provider, { value: auth }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx) return ctx;
  // Fallback: standalone usage
  const demoToken = typeof window !== 'undefined' && localStorage.getItem('agri_admin_token');
  return {
    user: demoToken ? { id: 'demo', role: 'admin' } : null,
    session: null,
    farmerProfile: demoToken ? { id: 'demo', name: 'Admin (Demo)', role: 'admin', district: DEFAULT_DISTRICT, state: DEFAULT_STATE } : null,
    loading: false,
    isDemoMode: !!demoToken,
    isAuthenticated: !!demoToken,
    isAdmin: !!demoToken,
    signInWithOTP: async () => ({ success: false, error: 'AuthProvider not mounted' }),
    verifyOTP: async () => ({ success: false, error: 'AuthProvider not mounted' }),
    signInWithPassword: async () => ({ success: false, error: 'AuthProvider not mounted' }),
    demoLogin: () => {
      localStorage.setItem('agri_admin_token', 'demo_admin_token_2024');
      window.location.reload();
    },
    signOut: async () => {
      localStorage.removeItem('agri_admin_token');
      localStorage.removeItem('agri_admin_user');
    },
    signOutAll: async () => {},
    updateProfile: async () => ({ success: false }),
  };
}

function useAuthProvider() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s && mounted) {
          setSession(s); setUser(s.user);
          await loadProfile(s.user.id);
        } else if (mounted) {
          checkDemo();
        }
      } catch {
        if (mounted) checkDemo();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    const checkDemo = () => {
      if (localStorage.getItem('agri_admin_token')) {
        setIsDemoMode(true);
        setUser({ id: 'demo', email: 'admin@agriconnect360.in', role: 'admin' });
        setFarmerProfile({ id: 'demo', name: 'Admin (Demo)', role: 'admin', district: DEFAULT_DISTRICT, state: DEFAULT_STATE });
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(s); setUser(s?.user); setIsDemoMode(false);
        if (s?.user) await loadProfile(s.user.id);
      } else if (event === 'SIGNED_OUT') {
        setSession(null); setUser(null); setFarmerProfile(null); setIsDemoMode(false);
        localStorage.removeItem('agri_admin_token');
      }
    });
    return () => { mounted = false; subscription?.unsubscribe(); };
  }, []);

  // Auto-refresh session
  useEffect(() => {
    if (!session || isDemoMode) return;
    const iv = setInterval(async () => {
      const { data } = await supabase.auth.refreshSession();
      if (data.session) setSession(data.session);
    }, 10 * 60 * 1000);
    return () => clearInterval(iv);
  }, [session, isDemoMode]);

  const loadProfile = async (uid) => {
    try {
      // Get role from profiles table
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).single();
      // Get farmer details from farmers table
      const { data: farmer } = await supabase.from('farmers').select('*').eq('user_id', uid).single();
      
      if (farmer) {
        setFarmerProfile({ ...farmer, role: profile?.role || 'farmer' });
        return;
      }
      
      // Auto-create profile + farmer record on first login
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        // Ensure profiles record exists
        if (!profile) {
          await supabase.from('profiles').upsert({ id: u.id, role: 'farmer' }, { onConflict: 'id' });
        }
        // Create farmer record
        const newFarmer = {
          user_id: u.id,
          name: u.user_metadata?.full_name || u.phone || 'Farmer',
          mobile: u.phone || '',
          district: DEFAULT_DISTRICT,
          state: DEFAULT_STATE,
          language: 'te',
        };
        const { data: created } = await supabase.from('farmers').insert(newFarmer).select().single();
        setFarmerProfile(created ? { ...created, role: profile?.role || 'farmer' } : { id: 'new', ...newFarmer, role: 'farmer' });
      }
    } catch (e) { console.warn('Profile load failed:', e.message); }
  };

  // ── OTP Rate Limiting (max 5/hour per phone) ───────────────────────────────
  const checkOTPRateLimit = useCallback((phone) => {
    const key = `otp_attempts_${phone}`;
    const raw = localStorage.getItem(key);
    const record = raw ? JSON.parse(raw) : { count: 0, firstAttempt: Date.now() };
    const hourMs = 60 * 60 * 1000;

    // Reset if older than 1 hour
    if (Date.now() - record.firstAttempt > hourMs) {
      localStorage.setItem(key, JSON.stringify({ count: 1, firstAttempt: Date.now() }));
      return { allowed: true };
    }

    if (record.count >= 5) {
      const waitMin = Math.ceil((hourMs - (Date.now() - record.firstAttempt)) / 60000);
      return { allowed: false, error: `Too many OTP requests. Try again in ${waitMin} min.` };
    }

    record.count++;
    localStorage.setItem(key, JSON.stringify(record));
    return { allowed: true };
  }, []);

  // ── Account Lockout (5 failed attempts, 30-min cooldown) ───────────────────
  const checkAccountLockout = useCallback((identifier) => {
    const key = `login_fails_${identifier}`;
    const raw = localStorage.getItem(key);
    const record = raw ? JSON.parse(raw) : { count: 0, lockedAt: null };
    const lockoutMs = 30 * 60 * 1000;

    if (record.lockedAt && Date.now() - record.lockedAt < lockoutMs) {
      const waitMin = Math.ceil((lockoutMs - (Date.now() - record.lockedAt)) / 60000);
      return { locked: true, error: `Account locked. Try again in ${waitMin} min.` };
    }

    // Reset if lockout expired
    if (record.lockedAt && Date.now() - record.lockedAt >= lockoutMs) {
      localStorage.removeItem(key);
      return { locked: false };
    }

    return { locked: false };
  }, []);

  const recordFailedAttempt = useCallback((identifier) => {
    const key = `login_fails_${identifier}`;
    const raw = localStorage.getItem(key);
    const record = raw ? JSON.parse(raw) : { count: 0, lockedAt: null };
    record.count++;
    if (record.count >= 5) record.lockedAt = Date.now();
    localStorage.setItem(key, JSON.stringify(record));
  }, []);

  const clearFailedAttempts = useCallback((identifier) => {
    localStorage.removeItem(`login_fails_${identifier}`);
  }, []);

  const signInWithOTP = useCallback(async (phone) => {
    try {
      // Rate limit check
      const rateCheck = checkOTPRateLimit(phone);
      if (!rateCheck.allowed) return { success: false, error: rateCheck.error };

      // Lockout check
      const lockCheck = checkAccountLockout(phone);
      if (lockCheck.locked) return { success: false, error: lockCheck.error };

      const p = phone.startsWith('+') ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.signInWithOtp({ phone: p });
      if (error) throw error;
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  }, [checkOTPRateLimit, checkAccountLockout]);

  const verifyOTP = useCallback(async (phone, otp) => {
    try {
      // Lockout check
      const lockCheck = checkAccountLockout(phone);
      if (lockCheck.locked) return { success: false, error: lockCheck.error };

      const p = phone.startsWith('+') ? phone : `+91${phone}`;
      const { data, error } = await supabase.auth.verifyOtp({ phone: p, token: otp, type: 'sms' });
      if (error) {
        recordFailedAttempt(phone);
        throw error;
      }
      clearFailedAttempts(phone);
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  }, [checkAccountLockout, recordFailedAttempt, clearFailedAttempts]);

  const signInWithPassword = useCallback(async (email, password) => {
    try {
      // Lockout check
      const lockCheck = checkAccountLockout(email);
      if (lockCheck.locked) return { success: false, error: lockCheck.error };

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        recordFailedAttempt(email);
        throw error;
      }
      clearFailedAttempts(email);
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  }, [checkAccountLockout, recordFailedAttempt, clearFailedAttempts]);

  const demoLogin = useCallback(() => {
    localStorage.setItem('agri_admin_token', 'demo_admin_token_2024');
    localStorage.setItem('agri_admin_user', JSON.stringify({ name: 'Admin', role: 'admin' }));
    setIsDemoMode(true);
    setUser({ id: 'demo', email: 'admin@agriconnect360.in', role: 'admin' });
    setFarmerProfile({ id: 'demo', name: 'Admin (Demo)', role: 'admin', district: DEFAULT_DISTRICT, state: DEFAULT_STATE });
    return { success: true };
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (!isDemoMode) await supabase.auth.signOut();
      setSession(null); setUser(null); setFarmerProfile(null); setIsDemoMode(false);
      localStorage.removeItem('agri_admin_token');
      localStorage.removeItem('agri_admin_user');
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  }, [isDemoMode]);

  const signOutAll = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setSession(null); setUser(null); setFarmerProfile(null); setIsDemoMode(false);
      localStorage.removeItem('agri_admin_token');
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (isDemoMode) return { success: true, data: { ...farmerProfile, ...updates } };
    try {
      const { data, error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', user?.id).select().single();
      if (error) throw error;
      setFarmerProfile(data);
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  }, [user, isDemoMode, farmerProfile]);

  return {
    user, session, farmerProfile, loading, isDemoMode,
    isAuthenticated: !!user || !!session || isDemoMode,
    isAdmin: farmerProfile?.role === 'admin' || isDemoMode,
    signInWithOTP, verifyOTP, signInWithPassword, demoLogin, signOut, signOutAll, updateProfile,
  };
}

export default useAuth;
