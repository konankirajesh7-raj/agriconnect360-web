/**
 * AgriConnect 360 — Cookie Consent & Data Deletion (Phase 15D)
 * DPDP Act 2023 compliant consent management and account deletion workflow
 */
import React, { useState, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────
// 15D.4 — Cookie Consent Banner
// ─────────────────────────────────────────────────────────────────
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('agri_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('agri_cookie_consent', JSON.stringify({
      essential: true,
      analytics: true,
      timestamp: new Date().toISOString(),
    }));
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('agri_cookie_consent', JSON.stringify({
      essential: true,
      analytics: false,
      timestamp: new Date().toISOString(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(13,17,23,0.97)', backdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(34,197,94,0.2)',
      padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4, color: '#e2e8f0' }}>
          🍪 Cookie Notice
        </div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
          We use essential cookies for authentication and app functionality.
          Optional analytics cookies help us improve your experience.
          See our <a href="/privacy-policy.html" style={{ color: '#22c55e', textDecoration: 'underline' }}>Privacy Policy</a>.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleEssentialOnly} style={{
          padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
          background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
        }}>Essential Only</button>
        <button onClick={handleAccept} style={{
          padding: '8px 16px', borderRadius: 6, border: 'none',
          background: '#22c55e', color: '#000', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
        }}>Accept All</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// 15D.3 — Data Deletion Workflow
// ─────────────────────────────────────────────────────────────────
export function getConsentStatus() {
  try {
    const raw = localStorage.getItem('agri_cookie_consent');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function hasAnalyticsConsent() {
  const consent = getConsentStatus();
  return consent?.analytics === true;
}

/**
 * Initiates account deletion request.
 * Per DPDP Act 2023, data must be erased within 30 days.
 */
export async function requestAccountDeletion(supabase, userId, reason = '') {
  try {
    // 1. Mark profile for deletion
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        deletion_requested: true,
        deletion_reason: reason,
        deletion_requested_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 2. Clear local storage
    const keysToKeep = ['agri_cookie_consent']; // Keep consent record
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('agri_') && !keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // 3. Sign out
    await supabase.auth.signOut();

    return {
      success: true,
      message: 'Account deletion request submitted. Your data will be permanently erased within 30 days as per DPDP Act 2023.',
      deletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      referenceId: `DEL-${Date.now().toString(36).toUpperCase()}`,
    };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * Exports all user data as JSON (Right to Access — DPDP Act Section 11)
 */
export async function exportUserData(supabase, userId) {
  try {
    const tables = ['profiles', 'farmers', 'fields', 'crops', 'expenses', 'sales'];
    const exported = { exportDate: new Date().toISOString(), userId, data: {} };

    for (const table of tables) {
      try {
        const { data } = await supabase.from(table).select('*').or(`id.eq.${userId},farmer_id.eq.${userId},auth_user_id.eq.${userId}`);
        exported.data[table] = data || [];
      } catch { exported.data[table] = []; }
    }

    // Generate downloadable file
    const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agriconnect360_data_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return { success: true, tables: tables.length, records: Object.values(exported.data).flat().length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export default { CookieConsentBanner, getConsentStatus, hasAnalyticsConsent, requestAccountDeletion, exportUserData };
