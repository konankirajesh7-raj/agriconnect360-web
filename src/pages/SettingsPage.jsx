import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { premiumDB } from '../lib/supabase';

const defaultSettings = {
  language: 'en',
  theme: 'dark',
  notifications: true,
  emailAlerts: true,
  smsAlerts: false,
  priceAlerts: true,
  weatherAlerts: true,
  cropReminders: true,
  dailyDigestEnabled: true,
  currency: 'INR',
  units: 'metric',
  location: 'Guntur, Andhra Pradesh',
  name: 'Admin User',
  email: 'admin@agriconnect360.in',
  phone: '+91 9876543210',
  dailyDigestTime: '07:00',
  smartTiming: true,
  dndStart: '10:00',
  dndEnd: '16:30',
  emergencyAlerts: true,
  milestoneReminders: true,
  priceTargetCrop: 'Cotton',
  priceTargetValue: 7000,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { farmerProfile, updateProfile } = useAuth();
  const farmerId = Number(farmerProfile?.id || 0);

  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  const update = (key, val) => setSettings((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (farmerProfile?.name) {
      setSettings((prev) => ({
        ...prev,
        name: farmerProfile.name,
        phone: farmerProfile.mobile || prev.phone,
        location: `${farmerProfile.district || 'Guntur'}, ${farmerProfile.state || 'Andhra Pradesh'}`,
      }));
    }
  }, [farmerProfile]);

  useEffect(() => {
    if (!farmerId) return;
    const raw = localStorage.getItem(`agri_phase12_settings_${farmerId}`);
    if (raw) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
      } catch {
        // ignore malformed local data
      }
    }
    premiumDB.notifications.getPreferences(farmerId).then(({ data, error }) => {
      if (!error && data) {
        setSettings((prev) => ({
          ...prev,
          notifications: data.push_enabled ?? prev.notifications,
          weatherAlerts: data.weather_alerts ?? prev.weatherAlerts,
          cropReminders: data.crop_reminders ?? prev.cropReminders,
          dailyDigestEnabled: data.daily_digest_enabled ?? prev.dailyDigestEnabled,
          dailyDigestTime: data.daily_digest_time ?? prev.dailyDigestTime,
          smartTiming: data.smart_timing_enabled ?? prev.smartTiming,
          dndStart: data.do_not_disturb_start ?? prev.dndStart,
          dndEnd: data.do_not_disturb_end ?? prev.dndEnd,
          emergencyAlerts: data.emergency_alerts ?? prev.emergencyAlerts,
          milestoneReminders: data.crop_milestone_reminders ?? prev.milestoneReminders,
          priceAlerts: data.price_target_alerts ?? prev.priceAlerts,
          priceTargetCrop: data.price_target_crop ?? prev.priceTargetCrop,
          priceTargetValue: data.price_target_value ?? prev.priceTargetValue,
        }));
      }
    });
  }, [farmerId]);

  async function saveAll() {
    setSaving(true);
    try {
      const payload = {
        push_enabled: settings.notifications,
        weather_alerts: settings.weatherAlerts,
        scheme_payment_alerts: settings.emailAlerts,
        crop_reminders: settings.cropReminders,
        daily_digest_enabled: settings.dailyDigestEnabled,
        daily_digest_time: settings.dailyDigestTime,
        smart_timing_enabled: settings.smartTiming,
        do_not_disturb_start: settings.dndStart,
        do_not_disturb_end: settings.dndEnd,
        emergency_alerts: settings.emergencyAlerts,
        price_target_alerts: settings.priceAlerts,
        crop_milestone_reminders: settings.milestoneReminders,
        price_target_crop: settings.priceTargetCrop,
        price_target_value: settings.priceTargetValue,
        farmer_id: farmerId,
      };
      localStorage.setItem(`agri_phase12_settings_${farmerId}`, JSON.stringify(settings));
      await premiumDB.notifications.upsertPreferences(payload);
      await updateProfile({
        name: settings.name,
        language: settings.language,
        mobile: settings.phone,
      });
      setSavedMessage('Settings saved successfully.');
      setTimeout(() => setSavedMessage(''), 2200);
    } finally {
      setSaving(false);
    }
  }

  const Section = ({ title, icon, children }) => (
    <div className="card" style={{ padding: '20px', marginBottom: 16 }}>
      <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>{icon} {title}</div>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, value, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div><div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{label}</div>{desc && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{desc}</div>}</div>
      <div onClick={() => onChange(!value)} style={{ width: 44, height: 24, borderRadius: 12, background: value ? '#22c55e' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s' }} />
      </div>
    </div>
  );

  const Field = ({ label, value, onChange, type = 'text', options }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>{label}</label>
      {options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }} />
      )}
    </div>
  );

  return (
    <div className="animated">
      <div className="section-header">
        <div><div className="section-title">⚙️ Settings & Preferences</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Customize your dashboard experience and premium controls</div></div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {savedMessage && <span style={{ color: '#34d399', fontSize: '0.76rem' }}>{savedMessage}</span>}
          <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={saveAll} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <Section title="Profile" icon="👤">
            <Field label="Full Name" value={settings.name} onChange={(v) => update('name', v)} />
            <Field label="Email" value={settings.email} onChange={(v) => update('email', v)} type="email" />
            <Field label="Phone" value={settings.phone} onChange={(v) => update('phone', v)} />
            <Field label="Default Location" value={settings.location} onChange={(v) => update('location', v)} />
          </Section>

          <Section title="Appearance" icon="🎨">
            <Field label="Language" value={settings.language} onChange={(v) => update('language', v)} options={[
              { value: 'en', label: '🇬🇧 English' }, { value: 'hi', label: '🇮🇳 हिन्दी' }, { value: 'te', label: '🇮🇳 తెలుగు' }, { value: 'kn', label: '🇮🇳 ಕನ್ನಡ' },
            ]} />
            <Field label="Theme" value={settings.theme} onChange={(v) => update('theme', v)} options={[
              { value: 'dark', label: '🌙 Dark Mode' }, { value: 'light', label: '☀️ Light Mode' }, { value: 'auto', label: '🔄 System' },
            ]} />
            <Field label="Units" value={settings.units} onChange={(v) => update('units', v)} options={[
              { value: 'metric', label: '°C / km / kg' }, { value: 'imperial', label: '°F / mi / lb' },
            ]} />
          </Section>
        </div>

        <div>
          <Section title="Premium Notifications" icon="🔔">
            <Toggle label="Push Notifications" desc="Enable all device alerts" value={settings.notifications} onChange={(v) => update('notifications', v)} />
            <Toggle label="Weather Alerts" desc="Rain and severe weather warnings" value={settings.weatherAlerts} onChange={(v) => update('weatherAlerts', v)} />
            <Toggle label="Crop Reminders" desc="Sowing, irrigation and spray reminders" value={settings.cropReminders} onChange={(v) => update('cropReminders', v)} />
            <Toggle label="Daily Digest" desc="Morning summary at selected time" value={settings.dailyDigestEnabled} onChange={(v) => update('dailyDigestEnabled', v)} />
            <Toggle label="Smart Timing" desc="No notifications during field hours" value={settings.smartTiming} onChange={(v) => update('smartTiming', v)} />
            <Toggle label="Emergency Alerts" desc="Cyclone/flood instant alerts" value={settings.emergencyAlerts} onChange={(v) => update('emergencyAlerts', v)} />
            <Toggle label="Price Target Alerts" desc="Notify when crop crosses your target" value={settings.priceAlerts} onChange={(v) => update('priceAlerts', v)} />
            <Toggle label="Crop Milestone Alerts" desc="Day-wise reminders like Day 45 fertilizer" value={settings.milestoneReminders} onChange={(v) => update('milestoneReminders', v)} />
            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="Digest time" value={settings.dailyDigestTime} onChange={(v) => update('dailyDigestTime', v)} type="time" />
              <Field label="DND start" value={settings.dndStart} onChange={(v) => update('dndStart', v)} type="time" />
              <Field label="DND end" value={settings.dndEnd} onChange={(v) => update('dndEnd', v)} type="time" />
              <Field label="Price target crop" value={settings.priceTargetCrop} onChange={(v) => update('priceTargetCrop', v)} />
              <Field label="Price target (₹)" value={settings.priceTargetValue} onChange={(v) => update('priceTargetValue', Number(v) || 0)} type="number" />
            </div>
            <button className="btn btn-outline" style={{ marginTop: 8, width: '100%', padding: '8px', fontSize: '0.82rem' }} onClick={() => navigate('/premium?tab=push')}>
              Open full push notification center
            </button>
          </Section>

          <Section title="Reports, Privacy & Data" icon="📄">
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
              Generate monthly/quarterly/annual PDF reports, including bank-ready KCC format and season comparison.
            </div>
            <button className="btn btn-outline" style={{ marginBottom: 8, width: '100%', padding: '8px', fontSize: '0.82rem' }} onClick={() => navigate('/premium?tab=reports')}>
              📄 Generate PDF Reports
            </button>
            <button className="btn btn-outline" style={{ marginBottom: 8, width: '100%', padding: '8px', fontSize: '0.82rem' }}>
              📥 Export My Data
            </button>
            <button className="btn btn-outline" style={{ width: '100%', padding: '8px', fontSize: '0.82rem', color: '#ef4444', borderColor: '#ef444455' }}>
              🗑️ Delete Account
            </button>
          </Section>
        </div>
      </div>
    </div>
  );
}
