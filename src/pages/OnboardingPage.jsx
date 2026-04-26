/**
 * Phase 11A — Onboarding Wizard (Rebuilt)
 * 5-step wizard: Language → Role Selection → Personal Info → Farm/Business Details → Gov IDs
 * Features: Animated progress bar, auto-suggest villages, skip option, referral code,
 *           welcome tutorial overlay, crop-specific tips after completion
 * Tasks covered: 1–9
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { DEFAULT_STATE } from '../lib/supabase';
import { AP_DISTRICTS, AP_MANDALS, CROP_OPTIONS } from '../lib/hooks/useOnboarding';
import {
  getMergedPhase11Profile,
  saveStoredOnboardingData,
  upsertFarmerPreferences,
} from '../lib/phase11Persistence';

/* ── Reference Data ─────────────────────────────────────────────── */
const LANGUAGES = [
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳', desc: 'Telugu' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', desc: 'Hindi' },
  { code: 'en', label: 'English', flag: '🇬🇧', desc: 'English' },
];

const SOIL_TYPES = ['Black Cotton', 'Red Sandy', 'Alluvial', 'Laterite', 'Clay Loam', 'Sandy Loam'];
const IRRIGATION = ['Borewell', 'Canal', 'Drip', 'Sprinkler', 'Rain-fed', 'River Lift', 'Tank'];

const VILLAGES_BY_MANDAL = {
  'Tenali': ['Tenali', 'Duggirala', 'Kakumanu', 'Emani', 'Kollipara', 'Amruthalur'],
  'Mangalagiri': ['Mangalagiri', 'Tadepalli', 'Nambur', 'Pedaavutapalli', 'Kaza'],
  'Ponnur': ['Ponnur', 'Pedapalem', 'Vejendla', 'Tsundur'],
  'Vijayawada': ['Vijayawada', 'Gannavaram', 'Prasadampadu', 'Nunna'],
  'Gudivada': ['Gudivada', 'Kaikalur', 'Bantumilli', 'Nandivada'],
  'Ongole': ['Ongole', 'Maddipadu', 'Singarayakonda', 'Chirala'],
  'Kurnool': ['Kurnool', 'Nandikotkur', 'Srisailam', 'Mantralayam'],
  'Tirupati': ['Tirupati', 'Tirumala', 'Renigunta', 'Chandragiri'],
  'Rajahmundry': ['Rajahmundry', 'Dowleswaram', 'Kadiyam', 'Korukonda'],
  'Kakinada': ['Kakinada', 'Samalkot', 'Peddapuram', 'Gollaprolu'],
  'Anantapur': ['Anantapur', 'Gooty', 'Tadpatri', 'Kalyanadurgam'],
  'Nellore': ['Nellore', 'Buchireddypalem', 'Venkatagiri', 'Atmakur'],
};

const ROLE_OPTIONS = [
  { id: 'farmer', icon: '👨‍🌾', label: 'Farmer', desc: 'Grow crops, track fields, sell produce', color: '#22c55e' },
  { id: 'industrial', icon: '🏭', label: 'Industrial Buyer', desc: 'Purchase crops in bulk, contract farming', color: '#3b82f6' },
  { id: 'broker', icon: '🤝', label: 'Broker / Trader', desc: 'Connect farmers to markets, negotiate deals', color: '#f59e0b' },
  { id: 'supplier', icon: '🏪', label: 'Input Supplier', desc: 'Sell seeds, fertilizers, pesticides', color: '#8b5cf6' },
  { id: 'labour', icon: '👷', label: 'Farm Labour', desc: 'Offer labour services, find work', color: '#ef4444' },
  { id: 'fpo', icon: '🏢', label: 'FPO / Admin', desc: 'Manage farmer groups, FPO operations', color: '#06b6d4' },
];

const STEP_META = [
  { id: 'language', label: 'Language', icon: '🌐', desc: 'Choose your preferred language' },
  { id: 'role', label: 'I am a...', icon: '🎯', desc: 'Select your role on the platform' },
  { id: 'personal', label: 'Personal Info', icon: '👤', desc: 'Your name and location details' },
  { id: 'farm', label: 'Details', icon: '🌾', desc: 'Your work-specific details' },
  { id: 'govids', label: 'Government IDs', icon: '🏛️', desc: 'Aadhaar, KCC & referral code' },
];

const CROP_TIPS = {
  'paddy': '🌾 Tip: Best sowing time for Paddy in AP is June–July (Kharif). SRI method can increase yield by 20-30%.',
  'cotton': '🌿 Tip: For Cotton, maintain 90cm row spacing. Apply neem-based pest control at 45 days.',
  'chilli': '🌶️ Tip: Chilli grows best in well-drained soil. Harvest at 80-90 days for green, 120 days for red.',
  'maize': '🌽 Tip: Maize needs 500-800mm water. Apply Urea at 30 and 60 days for max yield.',
  'groundnut': '🥜 Tip: Apply gypsum at flowering stage. Avoid waterlogging for better pod development.',
  'sugarcane': '🎋 Tip: Ring pit method saves 40% water. Plant in February for best results in AP.',
  'banana': '🍌 Tip: Use tissue culture plants for uniform growth. Apply potash for better fruit quality.',
  'mango': '🥭 Tip: Prune after harvest season. Apply Borax spray during flowering for better fruit set.',
  'tomato': '🍅 Tip: Stake plants at 30 days. Use drip irrigation to prevent leaf diseases.',
  'turmeric': '🟡 Tip: Plant in June-July. Harvest at 8-9 months when leaves turn yellow.',
};

const TUTORIAL_STEPS = [
  { target: 'dashboard', icon: '📊', title: 'Dashboard', desc: 'See your farm summary, weather, and market insights at a glance.' },
  { target: 'weather', icon: '🌤️', title: 'Live Weather', desc: '7-day forecasts with AI farming advice for your district.' },
  { target: 'market', icon: '💰', title: 'Market Prices', desc: 'Real-time mandi prices, best selling locations, and price alerts.' },
  { target: 'ai', icon: '🤖', title: 'AI Advisor', desc: 'Ask any farming question in Telugu, Hindi, or English.' },
  { target: 'schemes', icon: '🏛️', title: 'Gov Schemes', desc: 'Check eligibility and apply for PM-KISAN, PMFBY, KCC, and more.' },
];

/* ── Form Builder ───────────────────────────────────────────────── */
function buildInitialForm(profile = {}) {
  const merged = getMergedPhase11Profile(profile);
  return {
    language: merged.language || 'te',
    role: merged.role || 'farmer',
    name: merged.name || '',
    gender: merged.gender || 'male',
    age: merged.age ?? '',
    district: merged.district || 'Guntur',
    mandal: merged.mandal || '',
    village: merged.village || '',
    farm_area_acres: merged.farm_area_acres || merged.total_land_acres || '',
    soil_type: merged.soil_type || 'Black Cotton',
    irrigation_type: merged.irrigation_type || 'Borewell',
    num_fields: merged.num_fields || '1',
    selectedCrops: merged.selectedCrops || merged.selected_crops || [],
    aadhaar_last4: merged.aadhaar_last4 || '',
    kisan_id: merged.kisan_id || '',
    referral_code: merged.referral_code || '',
    business_name: merged.business_name || '',
    business_type: merged.business_type || '',
    phone: merged.phone || merged.mobile || '',
    password: '',
  };
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function OnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, farmerProfile, updateProfile, isDemoMode, updateUserPassword } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showCropTips, setShowCropTips] = useState(false);
  const [villageSearch, setVillageSearch] = useState('');
  const [completed, setCompleted] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const isGoogleUser = user?.app_metadata?.provider === 'google' || user?.identities?.some(i => i.provider === 'google');
  const redirectPath = location.state?.from || '/dashboard';

  const [form, setForm] = useState(() => buildInitialForm(farmerProfile || {}));

  const update = useCallback((key, val) => setForm(prev => ({ ...prev, [key]: val })), []);

  useEffect(() => {
    setForm(prev => ({
      ...prev,
      ...buildInitialForm(farmerProfile || {}),
      selectedCrops: prev.selectedCrops.length > 0
        ? prev.selectedCrops
        : (buildInitialForm(farmerProfile || {}).selectedCrops || []),
    }));
  }, [farmerProfile]);

  // Auto-suggest villages
  const filteredVillages = useMemo(() => {
    const mandalVillages = VILLAGES_BY_MANDAL[form.mandal] || [];
    const allVillages = Object.values(VILLAGES_BY_MANDAL).flat();
    const pool = form.mandal ? mandalVillages : allVillages;
    if (!villageSearch) return pool.slice(0, 8);
    return pool.filter(v => v.toLowerCase().includes(villageSearch.toLowerCase())).slice(0, 8);
  }, [form.mandal, villageSearch]);

  const mandals = AP_MANDALS[form.district] || [];
  const progress = Math.round(((step + 1) / STEP_META.length) * 100);

  const toggleCrop = (cropId) => {
    setForm(prev => ({
      ...prev,
      selectedCrops: prev.selectedCrops.includes(cropId)
        ? prev.selectedCrops.filter(c => c !== cropId)
        : [...prev.selectedCrops, cropId],
    }));
  };

  const canProceed = () => {
    if (step === 0) return !!form.language;
    if (step === 1) return !!form.role;
    if (step === 2) {
      const hasName = form.name.trim().length >= 2;
      const hasDistrict = !!form.district;
      return hasName && hasDistrict;
    }
    if (step === 3) {
      if (form.role === 'farmer') return form.farm_area_acres > 0;
      return true;
    }
    return true;
  };

  /* ── Submit ─────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setSaving(true);
    let payload = null;
    try {
      payload = {
        name: form.name,
        role: form.role || 'farmer',
        gender: form.gender,
        age: form.age ? parseInt(form.age) : null,
        district: form.district,
        mandal: form.mandal,
        village: form.village,
        state: DEFAULT_STATE,
        language: form.language,
        farm_area_acres: parseFloat(form.farm_area_acres) || 0,
        soil_type: form.soil_type,
        irrigation_type: form.irrigation_type,
        aadhaar_last4: form.aadhaar_last4,
        kisan_id: form.kisan_id,
        referral_code: form.referral_code,
        selected_crops: form.selectedCrops,
        onboarding_completed: true,
        onboarding_date: new Date().toISOString(),
        num_fields: parseInt(form.num_fields, 10) || 1,
        business_name: form.business_name,
        business_type: form.business_type,
        mobile: form.phone,
        phone: form.phone,
      };

      // Set/update password for all users
      if (form.password && form.password.length >= 6) {
        try { await updateUserPassword(form.password); } catch (e) { console.warn('Password set failed:', e); }
      }

      // Register phone as taken
      if (form.phone && form.phone.length === 10) {
        const reg = JSON.parse(localStorage.getItem('ac360_registered_users') || '[]');
        if (!reg.includes(form.phone)) { reg.push(form.phone); localStorage.setItem('ac360_registered_users', JSON.stringify(reg)); }
      }

      const profileResult = await updateProfile(payload);
      if (profileResult?.success === false) {
        throw new Error(profileResult.error || 'Unable to save onboarding details');
      }
      const farmerId = profileResult?.data?.id || farmerProfile?.id || user?.id;

      if (!isDemoMode && user?.id && farmerId) {
        await upsertFarmerPreferences(farmerId, {
          ...payload,
          notification_weather: true,
          notification_prices: true,
          notification_schemes: true,
          notification_crops: true,
        });
      }

      saveStoredOnboardingData(payload);
      setCompleted(true);
      setShowCropTips(true);
    } catch (err) {
      console.error('Onboarding save failed:', err);
      // Still allow proceeding in demo mode
      saveStoredOnboardingData({
        ...payload,
        onboarding_completed: true,
      });
      setCompleted(true);
      setShowCropTips(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('agri360_onboarding_complete', 'skipped');
    navigate(redirectPath);
  };

  const handleFinish = () => {
    setShowCropTips(false);
    setShowTutorial(true);
  };

  const handleTutorialDone = () => {
    setShowTutorial(false);
    navigate(redirectPath);
  };

  /* ═══════════════ STEP RENDERERS ═══════════════════════════════ */

  const renderLanguageStep = () => (
    <div className="onb-step-content">
      <div className="onb-welcome-hero">
        <div className="onb-hero-icon">🌾</div>
        <h2 className="onb-hero-title">Welcome to AgriConnect 360</h2>
        <p className="onb-hero-sub">Your complete farming companion for Andhra Pradesh</p>
      </div>
      <div className="onb-lang-grid">
        {LANGUAGES.map(lang => (
          <div
            key={lang.code}
            className={`onb-lang-card ${form.language === lang.code ? 'active' : ''}`}
            onClick={() => update('language', lang.code)}
          >
            <span className="onb-lang-flag">{lang.flag}</span>
            <span className="onb-lang-label">{lang.label}</span>
            <span className="onb-lang-desc">{lang.desc}</span>
            {form.language === lang.code && <span className="onb-lang-check">✓</span>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderRoleStep = () => (
    <div className="onb-step-content">
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>How will you use AgriConnect 360?</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>Choose your primary role — you can change this later in Settings</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {ROLE_OPTIONS.map(r => (
          <div
            key={r.id}
            onClick={() => update('role', r.id)}
            style={{
              padding: '20px 18px',
              borderRadius: 14,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
              background: form.role === r.id ? `${r.color}15` : 'var(--bg-primary)',
              border: `2px solid ${form.role === r.id ? r.color : 'var(--border)'}`,
              transition: 'all 0.25s ease',
              boxShadow: form.role === r.id ? `0 4px 20px ${r.color}25` : 'none',
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
              background: `${r.color}18`,
              border: `1px solid ${r.color}30`,
              flexShrink: 0,
            }}>{r.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: form.role === r.id ? r.color : 'var(--text-primary)' }}>{r.label}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>{r.desc}</div>
            </div>
            {form.role === r.id && <div style={{ width: 24, height: 24, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>✓</div>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPersonalStep = () => {
    return (
    <div className="onb-step-content">
      <div className="onb-form-grid">
        <div className="onb-field full">
          <label>Full Name *</label>
          <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Enter your full name" />
        </div>
        <div className="onb-field">
          <label>Gender</label>
          <div className="onb-gender-row">
            {['male', 'female', 'other'].map(g => (
              <button key={g} className={`onb-gender-btn ${form.gender === g ? 'active' : ''}`} onClick={() => update('gender', g)}>
                {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'} {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="onb-field">
          <label>Age</label>
          <input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="Age" min="18" max="100" />
        </div>
        <div className="onb-field">
          <label>District *</label>
          <select value={form.district} onChange={e => { update('district', e.target.value); update('mandal', ''); update('village', ''); }}>
            {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="onb-field">
          <label>Mandal</label>
          <select value={form.mandal} onChange={e => { update('mandal', e.target.value); update('village', ''); }}>
            <option value="">Select Mandal</option>
            {mandals.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="onb-field full">
          <label>Village / Town</label>
          <input
            value={form.village || villageSearch}
            onChange={e => { setVillageSearch(e.target.value); update('village', e.target.value); }}
            placeholder="Type to search villages..."
          />
          {villageSearch && filteredVillages.length > 0 && (
            <div className="onb-village-suggest">
              {filteredVillages.map(v => (
                <div key={v} className="onb-village-item" onClick={() => { update('village', v); setVillageSearch(''); }}>
                  📍 {v}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  const renderFarmStep = () => {
    const r = form.role;
    if (r === 'farmer') return (
      <div className="onb-step-content">
        <div className="onb-form-grid">
          <div className="onb-field">
            <label>Total Farm Area (Acres) *</label>
            <input type="number" value={form.farm_area_acres} onChange={e => update('farm_area_acres', e.target.value)} placeholder="e.g. 5" min="0.1" step="0.5" />
          </div>
          <div className="onb-field">
            <label>Number of Fields</label>
            <input type="number" value={form.num_fields} onChange={e => update('num_fields', e.target.value)} placeholder="1" min="1" max="20" />
          </div>
          <div className="onb-field">
            <label>Soil Type</label>
            <select value={form.soil_type} onChange={e => update('soil_type', e.target.value)}>
              {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="onb-field">
            <label>Irrigation Type</label>
            <select value={form.irrigation_type} onChange={e => update('irrigation_type', e.target.value)}>
              {IRRIGATION.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="onb-field full">
            <label>Select Your Crops</label>
            <div className="onb-crop-grid">
              {CROP_OPTIONS.map(crop => (
                <div key={crop.id} className={`onb-crop-chip ${form.selectedCrops.includes(crop.id) ? 'active' : ''}`} onClick={() => toggleCrop(crop.id)}>
                  <span>{crop.icon}</span><span>{crop.name}</span>
                  {form.selectedCrops.includes(crop.id) && <span className="onb-crop-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    if (r === 'industrial') return (
      <div className="onb-step-content">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '2rem' }}>🏭</span>
          <div style={{ fontWeight: 700, color: '#3b82f6', marginTop: 4 }}>Industrial Buyer Details</div>
        </div>
        <div className="onb-form-grid">
          <div className="onb-field full">
            <label>Company / Business Name *</label>
            <input value={form.business_name} onChange={e => update('business_name', e.target.value)} placeholder="e.g. Agro Industries Pvt Ltd" />
          </div>
          <div className="onb-field">
            <label>Business Type</label>
            <select value={form.business_type} onChange={e => update('business_type', e.target.value)}>
              <option value="">Select</option>
              <option value="processor">Food Processor</option>
              <option value="exporter">Exporter</option>
              <option value="retailer">Retail Chain</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="onb-field">
            <label>Monthly Procurement (Tons)</label>
            <input type="number" value={form.farm_area_acres} onChange={e => update('farm_area_acres', e.target.value)} placeholder="e.g. 50" min="1" />
          </div>
          <div className="onb-field full">
            <label>Preferred Crops to Purchase</label>
            <div className="onb-crop-grid">
              {CROP_OPTIONS.slice(0, 10).map(crop => (
                <div key={crop.id} className={`onb-crop-chip ${form.selectedCrops.includes(crop.id) ? 'active' : ''}`} onClick={() => toggleCrop(crop.id)}>
                  <span>{crop.icon}</span><span>{crop.name}</span>
                  {form.selectedCrops.includes(crop.id) && <span className="onb-crop-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    if (r === 'broker') return (
      <div className="onb-step-content">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '2rem' }}>🤝</span>
          <div style={{ fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>Broker / Trader Details</div>
        </div>
        <div className="onb-form-grid">
          <div className="onb-field full">
            <label>Business / Firm Name</label>
            <input value={form.business_name} onChange={e => update('business_name', e.target.value)} placeholder="e.g. Sri Lakshmi Traders" />
          </div>
          <div className="onb-field">
            <label>Primary Market / Mandi</label>
            <input value={form.business_type} onChange={e => update('business_type', e.target.value)} placeholder="e.g. Guntur APMC" />
          </div>
          <div className="onb-field">
            <label>Years of Experience</label>
            <input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="e.g. 10" min="1" max="50" />
          </div>
          <div className="onb-field full">
            <label>Crops You Trade</label>
            <div className="onb-crop-grid">
              {CROP_OPTIONS.slice(0, 10).map(crop => (
                <div key={crop.id} className={`onb-crop-chip ${form.selectedCrops.includes(crop.id) ? 'active' : ''}`} onClick={() => toggleCrop(crop.id)}>
                  <span>{crop.icon}</span><span>{crop.name}</span>
                  {form.selectedCrops.includes(crop.id) && <span className="onb-crop-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );

    if (r === 'supplier') return (
      <div className="onb-step-content">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '2rem' }}>🏪</span>
          <div style={{ fontWeight: 700, color: '#8b5cf6', marginTop: 4 }}>Input Supplier Details</div>
        </div>
        <div className="onb-form-grid">
          <div className="onb-field full">
            <label>Shop / Business Name *</label>
            <input value={form.business_name} onChange={e => update('business_name', e.target.value)} placeholder="e.g. Krishna Agro Center" />
          </div>
          <div className="onb-field">
            <label>Products Sold</label>
            <select value={form.business_type} onChange={e => update('business_type', e.target.value)}>
              <option value="">Select Category</option>
              <option value="seeds">Seeds</option>
              <option value="fertilizers">Fertilizers</option>
              <option value="pesticides">Pesticides</option>
              <option value="equipment">Farm Equipment</option>
              <option value="mixed">Mixed / All</option>
            </select>
          </div>
          <div className="onb-field">
            <label>Delivery Radius (km)</label>
            <input type="number" value={form.farm_area_acres} onChange={e => update('farm_area_acres', e.target.value)} placeholder="e.g. 25" min="1" />
          </div>
        </div>
      </div>
    );

    if (r === 'labour') return (
      <div className="onb-step-content">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '2rem' }}>👷</span>
          <div style={{ fontWeight: 700, color: '#ef4444', marginTop: 4 }}>Farm Labour Details</div>
        </div>
        <div className="onb-form-grid">
          <div className="onb-field">
            <label>Primary Skill</label>
            <select value={form.business_type} onChange={e => update('business_type', e.target.value)}>
              <option value="">Select Skill</option>
              <option value="harvesting">Harvesting</option>
              <option value="ploughing">Ploughing</option>
              <option value="sowing">Sowing & Transplanting</option>
              <option value="spraying">Pesticide Spraying</option>
              <option value="irrigation">Irrigation Work</option>
              <option value="loading">Loading & Transport</option>
              <option value="general">General Farm Work</option>
            </select>
          </div>
          <div className="onb-field">
            <label>Years of Experience</label>
            <input type="number" value={form.farm_area_acres} onChange={e => update('farm_area_acres', e.target.value)} placeholder="e.g. 5" min="0" max="50" />
          </div>
          <div className="onb-field">
            <label>Daily Rate (₹)</label>
            <input type="number" value={form.num_fields} onChange={e => update('num_fields', e.target.value)} placeholder="e.g. 500" min="100" />
          </div>
          <div className="onb-field">
            <label>Available for</label>
            <select value={form.irrigation_type} onChange={e => update('irrigation_type', e.target.value)}>
              <option value="daily">Daily Work</option>
              <option value="weekly">Weekly Contract</option>
              <option value="seasonal">Seasonal Contract</option>
              <option value="fulltime">Full-time</option>
            </select>
          </div>
        </div>
      </div>
    );

    // FPO / Admin
    return (
      <div className="onb-step-content">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '2rem' }}>🏢</span>
          <div style={{ fontWeight: 700, color: '#06b6d4', marginTop: 4 }}>FPO / Organization Details</div>
        </div>
        <div className="onb-form-grid">
          <div className="onb-field full">
            <label>Organization Name *</label>
            <input value={form.business_name} onChange={e => update('business_name', e.target.value)} placeholder="e.g. Guntur Farmer Producer Organization" />
          </div>
          <div className="onb-field">
            <label>Registration Number</label>
            <input value={form.kisan_id} onChange={e => update('kisan_id', e.target.value)} placeholder="FPO Reg. No." />
          </div>
          <div className="onb-field">
            <label>Number of Members</label>
            <input type="number" value={form.farm_area_acres} onChange={e => update('farm_area_acres', e.target.value)} placeholder="e.g. 200" min="1" />
          </div>
          <div className="onb-field full">
            <label>Primary Crops Handled</label>
            <div className="onb-crop-grid">
              {CROP_OPTIONS.slice(0, 10).map(crop => (
                <div key={crop.id} className={`onb-crop-chip ${form.selectedCrops.includes(crop.id) ? 'active' : ''}`} onClick={() => toggleCrop(crop.id)}>
                  <span>{crop.icon}</span><span>{crop.name}</span>
                  {form.selectedCrops.includes(crop.id) && <span className="onb-crop-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGovIDStep = () => {
    const roleLabel = ROLE_OPTIONS.find(ro => ro.id === form.role)?.label || 'User';
    const roleIcon = ROLE_OPTIONS.find(ro => ro.id === form.role)?.icon || '👤';
    return (
    <div className="onb-step-content">
      <div className="onb-form-grid">
        <div className="onb-field">
          <label>Aadhaar Last 4 Digits</label>
          <input value={form.aadhaar_last4} onChange={e => update('aadhaar_last4', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="XXXX" maxLength={4} />
          <small>We only store last 4 digits for verification</small>
        </div>
        {(form.role === 'farmer' || form.role === 'fpo') && (
        <div className="onb-field">
          <label>Kisan Credit Card / ID</label>
          <input value={form.kisan_id} onChange={e => update('kisan_id', e.target.value)} placeholder="Optional" />
        </div>
        )}
        {(form.role !== 'farmer' && form.role !== 'labour') && (
        <div className="onb-field">
          <label>GSTIN / Business License</label>
          <input value={form.kisan_id} onChange={e => update('kisan_id', e.target.value)} placeholder="Optional" />
        </div>
        )}
        <div className="onb-field full">
          <label>Referral Code</label>
          <input value={form.referral_code} onChange={e => update('referral_code', e.target.value.toUpperCase())} placeholder="Enter referral code (optional)" />
          <small>Got a code from a friend? Enter it to earn 50 AgriCoins! 🪙</small>
        </div>

        {/* Summary Preview */}
        <div className="onb-field full">
          <div className="onb-summary-card">
            <h4>{roleIcon} Registration Summary — {roleLabel}</h4>
            <div className="onb-summary-grid">
              <div className="onb-summary-item"><span>Name</span><strong>{form.name || '—'}</strong></div>
              <div className="onb-summary-item"><span>Role</span><strong>{roleLabel}</strong></div>
              <div className="onb-summary-item"><span>District</span><strong>{form.district}</strong></div>
              <div className="onb-summary-item"><span>Location</span><strong>{form.village || form.mandal || '—'}</strong></div>
              {form.role === 'farmer' && <div className="onb-summary-item"><span>Farm Area</span><strong>{form.farm_area_acres || '0'} acres</strong></div>}
              {form.role === 'farmer' && <div className="onb-summary-item"><span>Soil</span><strong>{form.soil_type}</strong></div>}
              {form.business_name && <div className="onb-summary-item"><span>Business</span><strong>{form.business_name}</strong></div>}
              <div className="onb-summary-item"><span>Language</span><strong>{LANGUAGES.find(l => l.code === form.language)?.label || 'English'}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const RENDERERS = [renderLanguageStep, renderRoleStep, renderPersonalStep, renderFarmStep, renderGovIDStep];

  /* ═══════════════ CROP TIPS MODAL ═════════════════════════════ */
  const renderCropTips = () => (
    <div className="onb-overlay">
      <div className="onb-modal onb-crop-tips-modal">
        <div className="onb-modal-header">
          <h3>🌱 Crop Tips for You</h3>
          <p>Based on your selected crops, here are some quick tips:</p>
        </div>
        <div className="onb-tips-list">
          {form.selectedCrops.length === 0 ? (
            <div className="onb-tip-card">
              <p>🌾 No crops selected. You can add them later from Crop Tracking!</p>
            </div>
          ) : (
            form.selectedCrops.map(cropId => {
              const tip = CROP_TIPS[cropId];
              if (!tip) return null;
              return (
                <div key={cropId} className="onb-tip-card">
                  <p>{tip}</p>
                </div>
              );
            })
          )}
        </div>
        <button className="btn btn-primary onb-modal-btn" onClick={handleFinish}>
          Continue to Tutorial →
        </button>
      </div>
    </div>
  );

  /* ═══════════════ TUTORIAL OVERLAY ════════════════════════════ */
  const renderTutorial = () => {
    const tStep = TUTORIAL_STEPS[tutorialStep];
    return (
      <div className="onb-overlay">
        <div className="onb-modal onb-tutorial-modal">
          <div className="onb-tutorial-progress">
            {TUTORIAL_STEPS.map((_, i) => (
              <div key={i} className={`onb-tutorial-dot ${i <= tutorialStep ? 'active' : ''}`} />
            ))}
          </div>
          <div className="onb-tutorial-icon">{tStep.icon}</div>
          <h3 className="onb-tutorial-title">{tStep.title}</h3>
          <p className="onb-tutorial-desc">{tStep.desc}</p>
          <div className="onb-tutorial-actions">
            {tutorialStep > 0 && (
              <button className="btn btn-outline" onClick={() => setTutorialStep(s => s - 1)}>← Back</button>
            )}
            {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setTutorialStep(s => s + 1)}>Next →</button>
            ) : (
              <button className="btn btn-primary" onClick={handleTutorialDone}>🚀 Start Farming!</button>
            )}
            <button className="onb-tutorial-skip" onClick={handleTutorialDone}>Skip Tutorial</button>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════ MAIN RENDER ═════════════════════════════════ */
  return (
    <div className="onb-page">
      {/* Background decoration */}
      <div className="onb-bg-decor">
        <div className="onb-bg-circle c1" />
        <div className="onb-bg-circle c2" />
        <div className="onb-bg-circle c3" />
      </div>

      <div className="onb-container">
        {/* Header */}
        <div className="onb-header">
          <div className="onb-logo">
            <div className="onb-logo-icon">🌾</div>
            <span>AgriConnect 360</span>
          </div>
          <button className="onb-skip-btn" onClick={handleSkip}>Skip for now →</button>
        </div>

        {/* Progress Bar */}
        <div className="onb-progress-container">
          <div className="onb-progress-bar">
            <div className="onb-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="onb-progress-label">{progress}% Complete</div>
        </div>

        {/* Step Indicators */}
        <div className="onb-steps-row">
          {STEP_META.map((s, i) => (
            <div key={s.id} className={`onb-step-indicator ${i === step ? 'active' : i < step ? 'done' : ''}`} onClick={() => i < step && setStep(i)}>
              <div className="onb-step-num">{i < step ? '✓' : s.icon}</div>
              <span className="onb-step-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="onb-card" key={step}>
          <div className="onb-step-header">
            <h3>{STEP_META[step].icon} {STEP_META[step].label}</h3>
            <p>{STEP_META[step].desc}</p>
          </div>
          {RENDERERS[step]()}
        </div>

        {/* Navigation */}
        <div className="onb-nav">
          {step > 0 && (
            <button className="btn btn-outline onb-nav-btn" onClick={() => setStep(s => s - 1)}>← Previous</button>
          )}
          <div style={{ flex: 1 }} />
          {step < STEP_META.length - 1 ? (
            <button className="btn btn-primary onb-nav-btn" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
              Next Step →
            </button>
          ) : (
            <button className="btn btn-primary onb-nav-btn" onClick={handleSubmit} disabled={saving || !canProceed()}>
              {saving ? '⏳ Saving...' : '✅ Complete Registration'}
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCropTips && renderCropTips()}
      {showTutorial && renderTutorial()}
    </div>
  );
}
