import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase, DEFAULT_STATE, DEFAULT_DISTRICT } from '../supabase';
import {
  findFarmerByAuthId,
  getMergedPhase11Profile,
  getStoredOnboardingData,
  saveStoredOnboardingData,
  saveStoredProfileData,
  upsertFarmerForAuthUser,
} from '../phase11Persistence';

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
    user: demoToken ? { id: 'demo', role: (typeof window !== 'undefined' && localStorage.getItem('agri_demo_role')) || 'admin' } : null,
    session: null,
    farmerProfile: demoToken ? { id: 'demo', name: ({ farmer: 'Farmer (Demo)', industrial: 'Industrial (Demo)', broker: 'Broker (Demo)', supplier: 'Supplier (Demo)', labour: 'Labour (Demo)', fpo: 'FPO Admin (Demo)', admin: 'Admin (Demo)' })[(typeof window !== 'undefined' && localStorage.getItem('agri_demo_role')) || 'admin'], role: (typeof window !== 'undefined' && localStorage.getItem('agri_demo_role')) || 'admin', district: DEFAULT_DISTRICT, state: DEFAULT_STATE } : null,
    loading: false,
    isDemoMode: !!demoToken,
    isAuthenticated: !!demoToken,
    isAdmin: !!demoToken,
    signInWithOTP: async () => ({ success: false, error: 'AuthProvider not mounted' }),
    verifyOTP: async () => ({ success: false, error: 'AuthProvider not mounted' }),
    signInWithPassword: async () => ({ success: false, error: 'AuthProvider not mounted' }),
    signUp: async () => ({ success: false, error: 'AuthProvider not mounted' }),
    demoLogin: (role = 'admin') => {
      const DEMO_NAMES = { farmer: 'Farmer (Demo)', industrial: 'Industrial (Demo)', broker: 'Broker (Demo)', supplier: 'Supplier (Demo)', labour: 'Labour (Demo)', fpo: 'FPO Admin (Demo)', admin: 'Admin (Demo)' };
      localStorage.setItem('agri_admin_token', 'demo_admin_token_2024');
      localStorage.setItem('agri_demo_role', role);
      window.location.reload();
    },
    signOut: async () => {
      localStorage.removeItem('agri_admin_token');
      localStorage.removeItem('agri_admin_user');
    },
    signOutAll: async () => { },
    updateProfile: async () => ({ success: false }),
  };
}

function useAuthProvider() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const hydrateFarmerProfile = useCallback((data, role = 'farmer') => {
    const merged = getMergedPhase11Profile({ ...(data || {}), role });
    saveStoredProfileData(merged);
    if (merged.onboarding_completed) {
      saveStoredOnboardingData(merged);
    }
    return merged;
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('getSession timeout')), 4000)
        );
        const { data: { session: s } } = await Promise.race([sessionPromise, timeoutPromise]);
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
        const demoRole = localStorage.getItem('agri_demo_role') || 'admin';
        const DEMO_NAMES = { farmer: 'Farmer (Demo)', industrial: 'Industrial (Demo)', broker: 'Broker (Demo)', supplier: 'Supplier (Demo)', labour: 'Labour (Demo)', fpo: 'FPO Admin (Demo)', admin: 'Admin (Demo)' };
        setIsDemoMode(true);
        setUser({ id: 'demo', email: `${demoRole}@agriconnect360.in`, role: demoRole });
        setFarmerProfile({ id: 'demo', name: DEMO_NAMES[demoRole] || demoRole, role: demoRole, district: DEFAULT_DISTRICT, state: DEFAULT_STATE, onboarding_completed: true });
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

  const NON_FARMER_ROLES = ['admin', 'fpo', 'industrial', 'broker', 'supplier', 'labour'];

  const loadProfile = async (uid) => {
    try {
      // Always fetch role from profiles table — this is the source of truth
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
      const resolvedRole = profile?.role || 'farmer';

      // Non-farmer roles: build profile directly from profiles table, skip farmers table
      if (NON_FARMER_ROLES.includes(resolvedRole)) {
        const nonFarmerProfile = {
          id: uid,
          name: profile?.full_name || resolvedRole.charAt(0).toUpperCase() + resolvedRole.slice(1),
          mobile: profile?.mobile || '',
          district: profile?.district || DEFAULT_DISTRICT,
          state: profile?.state || DEFAULT_STATE,
          language: profile?.language || 'te',
          role: resolvedRole,
          onboarding_completed: true,
        };
        setFarmerProfile(nonFarmerProfile);
        return nonFarmerProfile;
      }

      // Farmer role: look up farmers table record
      const farmer = await findFarmerByAuthId(uid);
      if (farmer) {
        const mergedFarmer = hydrateFarmerProfile(farmer, resolvedRole);
        setFarmerProfile(mergedFarmer);
        return mergedFarmer;
      }

      // New farmer — auto-create profile + farmer record on first login
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        const mergedLocalData = getMergedPhase11Profile({
          name: u.user_metadata?.full_name || u.phone || 'Farmer',
          mobile: u.phone || '',
          district: profile?.district || DEFAULT_DISTRICT,
          state: profile?.state || DEFAULT_STATE,
          language: profile?.language || 'te',
          ...getStoredOnboardingData(),
        });

        // Ensure profiles record exists
        await supabase.from('profiles').upsert({
          id: u.id,
          full_name: mergedLocalData.name,
          mobile: mergedLocalData.mobile || '',
          role: resolvedRole,
          state: mergedLocalData.state || DEFAULT_STATE,
          district: mergedLocalData.district || DEFAULT_DISTRICT,
          language: mergedLocalData.language || 'te',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        const created = await upsertFarmerForAuthUser(u.id, mergedLocalData);
        const hydrated = hydrateFarmerProfile(created || mergedLocalData, resolvedRole);
        setFarmerProfile(hydrated);
        return hydrated;
      }
    } catch (e) {
      console.warn('Profile load failed:', e.message);
      const fallback = getStoredOnboardingData();
      if (fallback) {
        const hydrated = hydrateFarmerProfile(fallback, 'farmer');
        setFarmerProfile(hydrated);
        return hydrated;
      }
    }
    return null;
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

  const signUp = useCallback(async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;
      // Supabase returns user with empty identities if already registered
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return { success: false, error: 'User already registered. Please sign in with your password.' };
      }
      // CRITICAL: Immediately set session & user in React state
      // so isAuthenticated becomes true BEFORE any navigation happens
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      } else if (data.user) {
        setUser(data.user);
      }
      // Auto-create profile
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: metadata.full_name || email.split('@')[0],
          role: metadata.role || 'farmer',
          state: DEFAULT_STATE,
          district: DEFAULT_DISTRICT,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        // Load profile so farmerProfile is available for ProtectedRoute
        await loadProfile(data.user.id);
      }
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  }, [loadProfile]);

  const demoLogin = useCallback((role = 'admin') => {
    const DEMO_NAMES = { farmer: 'Farmer (Demo)', industrial: 'Industrial (Demo)', broker: 'Broker (Demo)', supplier: 'Supplier (Demo)', labour: 'Labour (Demo)', fpo: 'FPO Admin (Demo)', admin: 'Admin (Demo)' };
    localStorage.setItem('agri_admin_token', 'demo_admin_token_2024');
    localStorage.setItem('agri_demo_role', role);
    localStorage.setItem('agri_admin_user', JSON.stringify({ name: DEMO_NAMES[role] || role, role }));
    setIsDemoMode(true);
    setUser({ id: 'demo', email: `${role}@agriconnect360.in`, role });
    setFarmerProfile({ id: 'demo', name: DEMO_NAMES[role] || role, role, district: DEFAULT_DISTRICT, state: DEFAULT_STATE, onboarding_completed: true });
    return { success: true };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/login?provider=google' },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  }, []);

  const signInWithEmailOTP = useCallback(async (email) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, data };
    } catch (e) { return { success: false, error: e.message }; }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (!isDemoMode) await supabase.auth.signOut();
      setSession(null); setUser(null); setFarmerProfile(null); setIsDemoMode(false);
      // Clear ALL auth-related localStorage
      const authKeys = Object.keys(localStorage).filter(k =>
        k.startsWith('sb-') || k.startsWith('agri_admin') || k.startsWith('lock:') ||
        k.includes('auth-token') || k.startsWith('agri360_') || k.startsWith('ac360_')
      );
      authKeys.forEach(k => localStorage.removeItem(k));
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  }, [isDemoMode]);

  const signOutAll = useCallback(async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setSession(null); setUser(null); setFarmerProfile(null); setIsDemoMode(false);
      localStorage.removeItem('agri_admin_token');
      localStorage.removeItem('agri_admin_user');
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const mergedUpdates = { ...(farmerProfile || {}), ...(updates || {}) };

    if (isDemoMode) {
      const nextProfile = getMergedPhase11Profile(mergedUpdates);
      saveStoredProfileData(nextProfile);
      if (nextProfile.onboarding_completed) {
        saveStoredOnboardingData(nextProfile);
      }
      setFarmerProfile(nextProfile);
      return { success: true, data: nextProfile };
    }

    try {
      const role = mergedUpdates.role || farmerProfile?.role || 'farmer';
      const profilePayload = Object.fromEntries(
        Object.entries({
          id: user?.id,
          full_name: mergedUpdates.name || mergedUpdates.full_name,
          mobile: mergedUpdates.mobile,
          state: mergedUpdates.state || DEFAULT_STATE,
          district: mergedUpdates.district || DEFAULT_DISTRICT,
          language: mergedUpdates.language || 'te',
          avatar_url: mergedUpdates.avatar_url,
          role,
          updated_at: new Date().toISOString(),
        }).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profilePayload, { onConflict: 'id' });

      if (profileError) throw profileError;

      // Non-farmer roles: skip farmers table entirely — only profiles table is updated
      const NON_FARMER = ['admin', 'fpo', 'industrial', 'broker', 'supplier', 'labour'];
      let savedProfile;
      if (NON_FARMER.includes(role)) {
        savedProfile = {
          id: user?.id,
          name: mergedUpdates.name || mergedUpdates.full_name || role,
          mobile: mergedUpdates.mobile || '',
          district: mergedUpdates.district || DEFAULT_DISTRICT,
          state: mergedUpdates.state || DEFAULT_STATE,
          language: mergedUpdates.language || 'te',
          role,
          onboarding_completed: mergedUpdates.onboarding_completed ?? true,
        };
      } else {
        savedProfile = await upsertFarmerForAuthUser(user?.id, mergedUpdates, farmerProfile?.id);
      }

      const hydrated = NON_FARMER.includes(role)
        ? savedProfile
        : hydrateFarmerProfile(savedProfile || mergedUpdates, role);
      setFarmerProfile(hydrated);
      return { success: true, data: hydrated };
    } catch (e) { return { success: false, error: e.message }; }
  }, [user, isDemoMode, farmerProfile, hydrateFarmerProfile]);

  const userRole = farmerProfile?.role || 'farmer';
  const hasRole = useCallback((...roles) => roles.includes(userRole) || userRole === 'admin', [userRole]);
  const isStakeholder = ['industrial', 'broker', 'supplier', 'labour'].includes(userRole);

  return {
    user, session, farmerProfile, loading, isDemoMode,
    isAuthenticated: !!user || !!session || isDemoMode,
    isAdmin: userRole === 'admin' || isDemoMode,
    userRole,
    hasRole,
    isStakeholder,
    signInWithOTP, verifyOTP, signInWithPassword, signUp, signInWithGoogle, demoLogin, signOut, signOutAll, updateProfile, loadProfile,
    resetPassword: useCallback(async (email) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login?reset=1',
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (e) { return { success: false, error: e.message }; }
    }, []),
    updateUserPassword: useCallback(async (newPassword) => {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (e) { return { success: false, error: e.message }; }
    }, []),
  };
}

/** Valid platform roles */
export const VALID_ROLES = ['farmer', 'admin', 'fpo', 'industrial', 'broker', 'supplier', 'labour'];

export default useAuth;
