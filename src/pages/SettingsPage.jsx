import React, { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    language: 'en', theme: 'dark', notifications: true, emailAlerts: true,
    smsAlerts: false, priceAlerts: true, weatherAlerts: true, cropReminders: true,
    currency: 'INR', units: 'metric', location: 'Guntur, Andhra Pradesh',
    name: 'Admin User', email: 'admin@agriconnect360.in', phone: '+91 9876543210',
  });

  const update = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

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
        <select value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }} />
      )}
    </div>
  );

  return (
    <div className="animated">
      <div className="section-header">
        <div><div className="section-title">⚙️ Settings & Preferences</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Customize your dashboard experience</div></div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>💾 Save Changes</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <Section title="Profile" icon="👤">
            <Field label="Full Name" value={settings.name} onChange={v => update('name', v)} />
            <Field label="Email" value={settings.email} onChange={v => update('email', v)} type="email" />
            <Field label="Phone" value={settings.phone} onChange={v => update('phone', v)} />
            <Field label="Default Location" value={settings.location} onChange={v => update('location', v)} options={[
              { value: 'Guntur, Andhra Pradesh', label: '📍 Guntur, Andhra Pradesh' },
              { value: 'Vijayawada, AP', label: '📍 Vijayawada, AP' },
              { value: 'Visakhapatnam, AP', label: '📍 Visakhapatnam, AP' },
              { value: 'Tirupati, AP', label: '📍 Tirupati, AP' },
              { value: 'Kurnool, AP', label: '📍 Kurnool, AP' },
              { value: 'Rajahmundry, AP', label: '📍 Rajahmundry, AP' },
              { value: 'Nellore, AP', label: '📍 Nellore, AP' },
              { value: 'Anantapur, AP', label: '📍 Anantapur, AP' },
            ]} />
          </Section>

          <Section title="Appearance" icon="🎨">
            <Field label="Language" value={settings.language} onChange={v => update('language', v)} options={[
              { value: 'en', label: '🇬🇧 English' }, { value: 'hi', label: '🇮🇳 हिन्दी' }, { value: 'te', label: '🇮🇳 తెలుగు' }, { value: 'kn', label: '🇮🇳 ಕನ್ನಡ' },
            ]} />
            <Field label="Theme" value={settings.theme} onChange={v => update('theme', v)} options={[
              { value: 'dark', label: '🌙 Dark Mode' }, { value: 'light', label: '☀️ Light Mode' }, { value: 'auto', label: '🔄 System' },
            ]} />
            <Field label="Units" value={settings.units} onChange={v => update('units', v)} options={[
              { value: 'metric', label: '°C / km / kg' }, { value: 'imperial', label: '°F / mi / lb' },
            ]} />
          </Section>
        </div>

        <div>
          <Section title="Notifications" icon="🔔">
            <Toggle label="Push Notifications" desc="Get alerts on your device" value={settings.notifications} onChange={v => update('notifications', v)} />
            <Toggle label="Email Alerts" desc="Receive daily digest" value={settings.emailAlerts} onChange={v => update('emailAlerts', v)} />
            <Toggle label="SMS Alerts" desc="Price alerts via SMS" value={settings.smsAlerts} onChange={v => update('smsAlerts', v)} />
            <Toggle label="Price Alerts" desc="When prices cross your target" value={settings.priceAlerts} onChange={v => update('priceAlerts', v)} />
            <Toggle label="Weather Alerts" desc="Severe weather warnings" value={settings.weatherAlerts} onChange={v => update('weatherAlerts', v)} />
            <Toggle label="Crop Reminders" desc="Tasks from crop calendar" value={settings.cropReminders} onChange={v => update('cropReminders', v)} />
          </Section>

          <Section title="Data & Privacy" icon="🔒">
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>Your data is securely stored and never shared with third parties. We use encryption for all sensitive information.</div>
            <button className="btn btn-outline" style={{ marginBottom: 8, width: '100%', padding: '8px', fontSize: '0.82rem' }}>📥 Export My Data</button>
            <button className="btn btn-outline" style={{ width: '100%', padding: '8px', fontSize: '0.82rem', color: '#ef4444', borderColor: '#ef444455' }}>🗑️ Delete Account</button>
          </Section>
        </div>
      </div>
    </div>
  );
}
