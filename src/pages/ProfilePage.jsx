/**
 * Phase 11B — Farmer Profile Page (10 tasks)
 * - Profile photo upload (Cloudinary)
 * - Edit profile info
 * - Farm summary card (acres, crops, income)
 * - Linked schemes status
 * - Achievement badges
 * - Farm health score (0-100)
 * - Farming history timeline
 * - Downloadable farmer ID card (PDF + QR)
 * - Crop portfolio pie chart
 * - Income vs expense mini dashboard
 */
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { DEFAULT_STATE, DEFAULT_DISTRICT } from '../lib/supabase';
import {
  clearStoredFPOMember,
  getMergedPhase11Profile,
  getStoredFPOMember,
  saveStoredProfileData,
  setStoredFPOMember,
} from '../lib/phase11Persistence';

// ── Constants ────────────────────────────────────────────────────────
const BADGES = [
  { id: 'first_login', icon: '🌱', label: 'First Login', desc: 'Welcome to AgriConnect 360', earned: true },
  { id: 'profile_complete', icon: '✅', label: 'Profile Complete', desc: 'Completed onboarding wizard', earned: true },
  { id: '5_crops', icon: '🌾', label: 'Crop Master', desc: 'Track 5+ crops', earned: false },
  { id: 'ai_user', icon: '🤖', label: 'AI Explorer', desc: 'Asked 10+ AI questions', earned: false },
  { id: 'market_watcher', icon: '📈', label: 'Market Watcher', desc: 'Checked prices 50+ times', earned: true },
  { id: 'community_star', icon: '⭐', label: 'Community Star', desc: 'Posted 5+ in community', earned: false },
  { id: 'scheme_pro', icon: '🏛️', label: 'Scheme Pro', desc: 'Applied for 3+ schemes', earned: true },
  { id: 'top_earner', icon: '💰', label: 'Top Earner', desc: 'Revenue ₹1 Lakh+', earned: false },
  { id: 'green_farmer', icon: '🌿', label: 'Green Farmer', desc: 'Used organic methods', earned: true },
  { id: 'tech_savvy', icon: '📱', label: 'Tech Savvy', desc: 'Used all app features', earned: false },
];

const TIMELINE_EVENTS = [
  { date: '2026-04-20', icon: '🌱', title: 'Joined AgriConnect 360', type: 'milestone' },
  { date: '2026-04-18', icon: '🌾', title: 'Registered 3 fields (12.5 acres)', type: 'farm' },
  { date: '2026-04-15', icon: '🌿', title: 'Paddy sowing completed — North Field', type: 'crop' },
  { date: '2026-04-10', icon: '💰', title: 'Sold Cotton — ₹72,000 at Guntur APMC', type: 'sale' },
  { date: '2026-04-05', icon: '🧪', title: 'Soil test — pH 6.8, Good health', type: 'test' },
  { date: '2026-03-28', icon: '🛡️', title: 'PMFBY claim approved — ₹42,000', type: 'scheme' },
  { date: '2026-03-15', icon: '🌧️', title: 'Heavy rain alert — crops safe', type: 'weather' },
  { date: '2026-03-01', icon: '🚜', title: 'Equipment rental — Tractor for plowing', type: 'service' },
];

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316'];

const DEFAULT_CROP_PORTFOLIO = [
  { name: 'Paddy', acres: 5, pct: 40 },
  { name: 'Cotton', acres: 3.5, pct: 28 },
  { name: 'Chilli', acres: 2, pct: 16 },
  { name: 'Vegetables', acres: 2, pct: 16 },
];

const CROP_NAME_MAP = {
  paddy: 'Paddy',
  rice: 'Paddy',
  cotton: 'Cotton',
  chilli: 'Chilli',
  chillies: 'Chilli',
  maize: 'Maize',
  groundnut: 'Groundnut',
  sugarcane: 'Sugarcane',
  banana: 'Banana',
  mango: 'Mango',
  tomato: 'Tomato',
  turmeric: 'Turmeric',
  vegetables: 'Vegetables',
  vegetable: 'Vegetables',
};

const PROFILE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function normalizeCropName(crop) {
  const normalized = String(crop || '')
    .trim()
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim();

  return CROP_NAME_MAP[normalized] || (normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Crop');
}

function buildProfileForm(profile = {}) {
  const merged = getMergedPhase11Profile(profile);
  const crops = Array.isArray(merged.selectedCrops || merged.selected_crops)
    ? (merged.selectedCrops || merged.selected_crops)
    : [];
  return {
    name: merged.name || 'Demo Farmer',
    district: merged.district || DEFAULT_DISTRICT,
    state: merged.state || DEFAULT_STATE,
    mobile: merged.mobile || '+91 9876543210',
    email: merged.email || '',
    village: merged.village || 'Tenali',
    mandal: merged.mandal || 'Tenali',
    age: merged.age || 35,
    gender: merged.gender || 'male',
    farm_area_acres: merged.farm_area_acres || merged.total_land_acres || 12.5,
    soil_type: merged.soil_type || 'Black Cotton',
    irrigation_type: merged.irrigation_type || 'Borewell',
    selectedCrops: crops,
    num_fields: merged.num_fields || 3,
    avatar_url: merged.avatar_url || merged.profile_photo_url || '',
  };
}

function mapFpoMemberToProfile(member = {}) {
  return {
    id: member.id,
    name: member.name,
    village: member.village,
    mandal: member.mandal || member.village,
    district: member.district || DEFAULT_DISTRICT,
    state: member.state || DEFAULT_STATE,
    mobile: member.phone || '',
    farm_area_acres: member.acres || 0,
    total_land_acres: member.acres || 0,
    selectedCrops: (member.crops || []).map(normalizeCropName),
    soil_type: member.soil_type || 'Black Cotton',
    irrigation_type: member.irrigation_type || 'Borewell',
    num_fields: member.num_fields || 1,
    avatar_url: member.avatar_url || '',
    role: 'fpo-member',
  };
}

function buildCropPortfolio(crops = [], totalAcres = 0) {
  const normalized = [...new Set(crops.map(normalizeCropName).filter(Boolean))];
  if (normalized.length === 0) return DEFAULT_CROP_PORTFOLIO;

  const acres = Number(totalAcres) || normalized.length;
  const baseAcres = acres / normalized.length;
  let usedPct = 0;

  return normalized.slice(0, 4).map((name, index, arr) => {
    const rawAcres = index === arr.length - 1 ? acres - (baseAcres * index) : baseAcres;
    const cropAcres = Number(rawAcres.toFixed(1));
    const pct = index === arr.length - 1
      ? Math.max(0, 100 - usedPct)
      : Math.round((cropAcres / acres) * 100);

    usedPct += pct;

    return {
      name,
      acres: cropAcres,
      pct,
    };
  });
}

function dataUrlToBytes(dataUrl = '') {
  const base64 = dataUrl.split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function mergeUint8Arrays(chunks = []) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

function buildPdfFromJpeg(jpegBytes, width, height) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let length = 0;

  const pushBytes = (bytes) => {
    chunks.push(bytes);
    length += bytes.length;
  };

  const pushText = (text) => pushBytes(encoder.encode(text));

  const beginObject = (id) => {
    offsets[id] = length;
    pushText(`${id} 0 obj\n`);
  };

  const endObject = () => {
    pushText('endobj\n');
  };

  pushText('%PDF-1.4\n');

  beginObject(1);
  pushText('<< /Type /Catalog /Pages 2 0 R >>\n');
  endObject();

  beginObject(2);
  pushText('<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n');
  endObject();

  beginObject(3);
  pushText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\n`);
  endObject();

  beginObject(4);
  pushText(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\n`);
  pushText('stream\n');
  pushBytes(jpegBytes);
  pushText('\nendstream\n');
  endObject();

  const contentStream = `q\n${width} 0 0 ${height} 0 0 cm\n/Im0 Do\nQ\n`;
  beginObject(5);
  pushText(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\n`);
  endObject();

  const xrefOffset = length;
  const objectCount = 5;
  pushText(`xref\n0 ${objectCount + 1}\n`);
  pushText('0000000000 65535 f \n');
  for (let i = 1; i <= objectCount; i += 1) {
    pushText(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  return new Blob([mergeUint8Arrays(chunks)], { type: 'application/pdf' });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadProfilePhoto(file, authToken) {
  const backendUrl = API_BASE ? `${API_BASE}/api/v1/upload/image` : '/api/v1/upload/image';
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', 'profile');

  const headers = {};
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  try {
    const response = await fetch(backendUrl, { method: 'POST', headers, body: formData });
    const body = await response.json().catch(() => ({}));
    if (response.ok) {
      const url = body?.data?.url || body?.url || body?.secure_url;
      if (url) return url;
    }
  } catch {
    // Fall back to direct Cloudinary upload when backend route is unavailable.
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    return fileToDataUrl(file);
  }

  const cloudinaryFormData = new FormData();
  cloudinaryFormData.append('file', file);
  cloudinaryFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  cloudinaryFormData.append('folder', 'agri360/profiles');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: cloudinaryFormData,
  });
  const body = await response.json().catch(() => ({}));
  if (response.ok && body?.secure_url) {
    return body.secure_url;
  }

  // Final fallback for offline/dev mode: keep a local data URL
  return fileToDataUrl(file);
}

export default function ProfilePage() {
  const { user, session, farmerProfile, isDemoMode, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('overview');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [idCardGenerating, setIdCardGenerating] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [idCardError, setIdCardError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [activeMember, setActiveMember] = useState(() => getStoredFPOMember());
  const fileInputRef = useRef(null);

  const viewingMember = Boolean(activeMember);
  const profileSource = useMemo(
    () => (viewingMember ? mapFpoMemberToProfile(activeMember) : (farmerProfile || {})),
    [viewingMember, activeMember, farmerProfile]
  );
  const [form, setForm] = useState(() => buildProfileForm(profileSource));

  useEffect(() => {
    const storedMember = getStoredFPOMember();
    if (storedMember) {
      setActiveMember(storedMember);
    }
  }, []);

  useEffect(() => {
    if (editing) return;
    setForm(buildProfileForm(profileSource));
  }, [profileSource, editing]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const linkedSchemes = [
    { name: 'PM-KISAN', status: 'active', amount: '₹6,000/yr', icon: '🏛️' },
    { name: 'PMFBY', status: 'active', amount: '₹42,000 claimed', icon: '🛡️' },
    { name: 'KCC', status: 'pending', amount: '₹3,00,000 limit', icon: '🏦' },
    { name: 'Rythu Bandhu', status: 'active', amount: '₹10,000/season', icon: '🌾' },
  ];

  const farmHealthScore = 78;
  const healthMetrics = [
    { label: 'Soil Health', score: 82, icon: '🧪' },
    { label: 'Crop Diversity', score: 70, icon: '🌱' },
    { label: 'Water Usage', score: 65, icon: '💧' },
    { label: 'Income Stability', score: 85, icon: '💰' },
    { label: 'Tech Adoption', score: 88, icon: '📱' },
  ];

  const monthlyData = [
    { month: 'Nov', income: 45000, expense: 22000 },
    { month: 'Dec', income: 38000, expense: 18000 },
    { month: 'Jan', income: 52000, expense: 28000 },
    { month: 'Feb', income: 61000, expense: 32000 },
    { month: 'Mar', income: 48000, expense: 24000 },
    { month: 'Apr', income: 41000, expense: 18000 },
  ];
  const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)));
  const cropPortfolio = useMemo(
    () => buildCropPortfolio(form.selectedCrops, form.farm_area_acres),
    [form.selectedCrops, form.farm_area_acres]
  );
  const farmSummary = useMemo(() => {
    const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0);
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expense, 0);
    return {
      totalAcres: Number(form.farm_area_acres) || 0,
      totalFields: Number(form.num_fields) || 1,
      activeCrops: cropPortfolio.length,
      totalIncome,
      totalExpenses,
      profit: totalIncome - totalExpenses,
    };
  }, [form.farm_area_acres, form.num_fields, cropPortfolio, monthlyData]);

  const photoStorageKey = viewingMember
    ? `agri360_profile_photo_member_${activeMember?.id || activeMember?.phone || 'active'}`
    : 'agri360_profile_photo';
  const profilePhoto = localStorage.getItem(photoStorageKey) || form.avatar_url || '';

  const handleReturnToOwnProfile = useCallback(() => {
    clearStoredFPOMember();
    setActiveMember(null);
    setEditing(false);
  }, []);

  // Photo upload handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.');
      return;
    }
    if (file.size > PROFILE_UPLOAD_MAX_BYTES) {
      setPhotoError('Image size must be 5MB or less.');
      return;
    }

    setPhotoError('');
    setPhotoUploading(true);
    try {
      const authToken = localStorage.getItem('agri_admin_token') || session?.access_token || '';
      const photoUrl = await uploadProfilePhoto(file, authToken);
      const localOnlyPhoto = String(photoUrl || '').startsWith('data:');

      localStorage.setItem(photoStorageKey, photoUrl);
      const nextForm = { ...form, avatar_url: photoUrl };
      setForm(nextForm);
      saveStoredProfileData(nextForm);

      if (viewingMember && activeMember) {
        const nextMember = { ...activeMember, avatar_url: photoUrl };
        setStoredFPOMember(nextMember);
        setActiveMember(nextMember);
      } else {
        if (!localOnlyPhoto) {
          const updateResult = await updateProfile({ avatar_url: photoUrl, profile_photo_url: photoUrl });
          if (updateResult?.success === false) {
            throw new Error(updateResult.error || 'Unable to save profile photo URL');
          }
        }
      }
    } catch (err) {
      setPhotoError(err?.message || 'Profile photo upload failed.');
    } finally {
      setPhotoUploading(false);
    }
  };

  // Generate downloadable ID card
  const downloadIDCard = async () => {
    setIdCardGenerating(true);
    setIdCardError('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 380;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize ID card renderer.');

      // Background
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, 600, 380);
      ctx.fillStyle = '#161b22';
      ctx.fillRect(0, 0, 600, 60);

      // Header
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('AgriConnect 360 - Farmer ID Card', 20, 38);

      // Green bar
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, 60, 600, 4);

      // Content
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillText(form.name, 30, 105);

      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      const lines = [
        `${form.village || form.mandal}, ${form.district}, ${form.state}`,
        `${form.mobile || 'Not available'}`,
        `Farm Area: ${form.farm_area_acres} acres`,
        `Soil: ${form.soil_type} | Irrigation: ${form.irrigation_type}`,
        `Farmer ID: ${viewingMember ? `FPO-${activeMember?.id || 'MEMBER'}` : (user?.id || 'DEMO')}`,
        `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      ];
      lines.forEach((line, i) => {
        ctx.fillText(line, 30, 140 + i * 28);
      });

      const qrPayload = JSON.stringify({
        id: viewingMember ? `fpo-${activeMember?.id || ''}` : user?.id || 'demo',
        name: form.name,
        mobile: form.mobile,
        district: form.district,
        village: form.village || form.mandal,
        generatedAt: new Date().toISOString(),
      });
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrPayload)}`;

      try {
        const qrResponse = await fetch(qrUrl);
        if (!qrResponse.ok) throw new Error('QR fetch failed');
        const qrBlob = await qrResponse.blob();
        const qrDataUrl = await blobToDataUrl(qrBlob);
        const qrImage = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('QR image load failed'));
          image.src = qrDataUrl;
        });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(436, 86, 138, 138);
        ctx.drawImage(qrImage, 440, 90, 130, 130);
      } catch {
        ctx.fillStyle = '#1e2533';
        ctx.fillRect(440, 90, 130, 130);
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('QR unavailable', 454, 165);
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Scan QR to verify farmer profile', 436, 238);

      // Footer
      ctx.fillStyle = '#161b22';
      ctx.fillRect(0, 340, 600, 40);
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Verified by AgriConnect 360 | www.agriconnect360.in | Powered by Supabase', 30, 365);

      const jpegBytes = dataUrlToBytes(canvas.toDataURL('image/jpeg', 0.92));
      const pdfBlob = buildPdfFromJpeg(jpegBytes, canvas.width, canvas.height);

      const link = document.createElement('a');
      link.download = `AgriConnect360_ID_${String(form.name || 'Farmer').replace(/\s+/g, '_')}.pdf`;
      const objectUrl = URL.createObjectURL(pdfBlob);
      link.href = objectUrl;
      link.click();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setIdCardError(err?.message || 'Unable to generate farmer ID card PDF.');
    } finally {
      setIdCardGenerating(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaveError('');
    try {
      const normalized = {
        ...form,
        farm_area_acres: Number(form.farm_area_acres) || 0,
        num_fields: Number(form.num_fields) || 1,
        selectedCrops: form.selectedCrops || [],
      };

      if (viewingMember && activeMember) {
        const nextMember = {
          ...activeMember,
          ...normalized,
          crops: normalized.selectedCrops,
        };
        setStoredFPOMember(nextMember);
        setActiveMember(nextMember);
      } else if (!isDemoMode && user?.id) {
        const result = await updateProfile(normalized);
        if (result?.success === false) {
          throw new Error(result.error || 'Unable to save profile changes');
        }
      }

      saveStoredProfileData(normalized);
      setEditing(false);
    } catch (err) {
      setSaveError(err?.message || 'Unable to save profile changes.');
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'farm', label: 'Farm', icon: '🌾' },
    { id: 'badges', label: 'Badges', icon: '🏆' },
    { id: 'timeline', label: 'History', icon: '📅' },
  ];

  return (
    <div className="animated profile-page">
      {viewingMember && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid rgba(59,130,246,0.35)', background: 'rgba(59,130,246,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
            👥 Viewing FPO member profile from FPO Mode
          </div>
          <button className="btn btn-outline" onClick={handleReturnToOwnProfile}>
            Back to My Profile
          </button>
        </div>
      )}

      {(photoError || idCardError || saveError) && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.08)', color: '#fda4af', fontSize: '0.8rem' }}>
          {photoError || idCardError || saveError}
        </div>
      )}

      {/* Hero Section */}
      <div className="prof-hero">
        <div className="prof-hero-bg" />
        <div className="prof-hero-content">
          <div className="prof-avatar-wrap" onClick={() => !viewingMember && fileInputRef.current?.click()}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="prof-avatar-img" />
            ) : (
              <div className="prof-avatar-placeholder">
                {form.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="prof-avatar-overlay">
              {viewingMember ? '👁️' : (photoUploading ? '⏳' : '📷')}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} disabled={viewingMember} />
          </div>
          <div className="prof-hero-info">
            <h2 className="prof-hero-name">{form.name}</h2>
            <p className="prof-hero-loc">📍 {form.village || form.mandal || form.district}, {form.state}</p>
            <div className="prof-hero-tags">
              <span className="prof-tag green">🌾 {form.farm_area_acres} Acres</span>
              <span className="prof-tag blue">💧 {form.irrigation_type}</span>
              <span className="prof-tag amber">🧪 {form.soil_type}</span>
            </div>
          </div>
          <div className="prof-hero-actions">
            {!viewingMember && (
              <button className="btn btn-primary" onClick={() => editing ? handleSaveProfile() : setEditing(true)}>
                {editing ? '💾 Save' : '✏️ Edit Profile'}
              </button>
            )}
            <button className="btn btn-outline" onClick={downloadIDCard} disabled={idCardGenerating}>
              {idCardGenerating ? '⏳ Generating PDF...' : '🪪 Download ID (PDF + QR)'}
            </button>
          </div>
        </div>
      </div>

      {/* Farm Health Score */}
      <div className="prof-health-section">
        <div className="prof-health-score-card">
          <div className="prof-health-ring">
            <svg viewBox="0 0 120 120" className="prof-health-svg">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={farmHealthScore >= 70 ? '#22c55e' : farmHealthScore >= 40 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeDasharray={`${farmHealthScore * 3.27} 327`} strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div className="prof-health-value">{farmHealthScore}</div>
            <div className="prof-health-label">Farm Health</div>
          </div>
          <div className="prof-health-metrics">
            {healthMetrics.map(m => (
              <div key={m.label} className="prof-metric-row">
                <span className="prof-metric-icon">{m.icon}</span>
                <span className="prof-metric-label">{m.label}</span>
                <div className="prof-metric-bar">
                  <div className="prof-metric-fill" style={{ width: `${m.score}%`, background: m.score >= 70 ? '#22c55e' : m.score >= 40 ? '#f59e0b' : '#ef4444' }} />
                </div>
                <span className="prof-metric-score">{m.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="prof-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`prof-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && (
        <div className="prof-grid">
          {/* Farm Summary Card */}
          <div className="card prof-summary-card">
            <h4>🌾 Farm Summary</h4>
            <div className="prof-summary-stats">
              <div className="prof-sstat"><span className="prof-sstat-val">{farmSummary.totalAcres}</span><span className="prof-sstat-label">Acres</span></div>
              <div className="prof-sstat"><span className="prof-sstat-val">{farmSummary.totalFields}</span><span className="prof-sstat-label">Fields</span></div>
              <div className="prof-sstat"><span className="prof-sstat-val">{farmSummary.activeCrops}</span><span className="prof-sstat-label">Crops</span></div>
            </div>
          </div>

          {/* Crop Portfolio Pie Chart */}
          <div className="card prof-pie-card">
            <h4>🥧 Crop Portfolio</h4>
            <div className="prof-pie-wrap">
              <svg viewBox="0 0 200 200" className="prof-pie-svg">
                {(() => {
                  let offset = 0;
                  return cropPortfolio.map((c, i) => {
                    const dashLen = c.pct * 5.65;
                    const dashGap = 565 - dashLen;
                    const el = (
                      <circle key={c.name} cx="100" cy="100" r="80" fill="none" stroke={PIE_COLORS[i]} strokeWidth="30"
                        strokeDasharray={`${dashLen} ${dashGap}`} strokeDashoffset={-offset} transform="rotate(-90 100 100)" />
                    );
                    offset += dashLen;
                    return el;
                  });
                })()}
              </svg>
              <div className="prof-pie-legend">
                {cropPortfolio.map((c, i) => (
                  <div key={c.name} className="prof-pie-item">
                    <span className="prof-pie-dot" style={{ background: PIE_COLORS[i] }} />
                    <span>{c.name}</span>
                    <span className="prof-pie-pct">{c.acres}ac ({c.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Income vs Expense Mini Dashboard */}
          <div className="card prof-income-card">
            <h4>💰 Income vs Expense (6 Months)</h4>
            <div className="prof-income-summary">
              <div className="prof-income-box green"><span>₹{(farmSummary.totalIncome / 1000).toFixed(0)}K</span><small>Income</small></div>
              <div className="prof-income-box red"><span>₹{(farmSummary.totalExpenses / 1000).toFixed(0)}K</span><small>Expenses</small></div>
              <div className="prof-income-box blue"><span>₹{(farmSummary.profit / 1000).toFixed(0)}K</span><small>Profit</small></div>
            </div>
            <div className="prof-chart-bars">
              {monthlyData.map(d => (
                <div key={d.month} className="prof-chart-col">
                  <div className="prof-bar-pair">
                    <div className="prof-bar income" style={{ height: `${(d.income / maxVal) * 100}%` }} title={`Income: ₹${d.income.toLocaleString()}`} />
                    <div className="prof-bar expense" style={{ height: `${(d.expense / maxVal) * 100}%` }} title={`Expense: ₹${d.expense.toLocaleString()}`} />
                  </div>
                  <span className="prof-bar-label">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="prof-chart-legend">
              <span><span className="prof-ldot" style={{ background: '#22c55e' }} /> Income</span>
              <span><span className="prof-ldot" style={{ background: '#ef4444' }} /> Expense</span>
            </div>
          </div>

          {/* Linked Schemes */}
          <div className="card prof-schemes-card">
            <h4>🏛️ Linked Schemes</h4>
            <div className="prof-scheme-list">
              {linkedSchemes.map(s => (
                <div key={s.name} className="prof-scheme-item">
                  <span className="prof-scheme-icon">{s.icon}</span>
                  <div className="prof-scheme-info">
                    <span className="prof-scheme-name">{s.name}</span>
                    <span className="prof-scheme-amount">{s.amount}</span>
                  </div>
                  <span className={`badge ${s.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'farm' && (
        <div className="prof-edit-section">
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 20 }}>✏️ Edit Farm Details</h4>
            <div className="prof-edit-grid">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Mobile', key: 'mobile', type: 'tel' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Village', key: 'village', type: 'text' },
                { label: 'Mandal', key: 'mandal', type: 'text' },
                { label: 'District', key: 'district', type: 'text' },
                { label: 'Age', key: 'age', type: 'number' },
                { label: 'Farm Area (Acres)', key: 'farm_area_acres', type: 'number' },
                { label: 'Soil Type', key: 'soil_type', type: 'text' },
                { label: 'Irrigation', key: 'irrigation_type', type: 'text' },
              ].map(f => (
                <div key={f.key} className="prof-edit-field">
                  <label>{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => update(f.key, e.target.value)} disabled={!editing || viewingMember} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              {!viewingMember && (
                <button className="btn btn-primary" onClick={() => editing ? handleSaveProfile() : setEditing(true)}>
                  {editing ? '💾 Save Changes' : '✏️ Edit'}
                </button>
              )}
              {editing && !viewingMember && <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>}
            </div>
          </div>
        </div>
      )}

      {tab === 'badges' && (
        <div className="prof-badges-section">
          <div className="prof-badges-header">
            <h4>🏆 Achievement Badges</h4>
            <span className="prof-badge-count">{BADGES.filter(b => b.earned).length}/{BADGES.length} Earned</span>
          </div>
          <div className="prof-badges-grid">
            {BADGES.map(b => (
              <div key={b.id} className={`prof-badge-card ${b.earned ? 'earned' : 'locked'}`}>
                <span className="prof-badge-icon">{b.icon}</span>
                <span className="prof-badge-label">{b.label}</span>
                <span className="prof-badge-desc">{b.desc}</span>
                {!b.earned && <span className="prof-badge-lock">🔒</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="prof-timeline-section">
          <h4 style={{ marginBottom: 20 }}>📅 Farming History Timeline</h4>
          <div className="prof-timeline">
            {TIMELINE_EVENTS.map((ev, i) => (
              <div key={i} className="prof-tl-item">
                <div className="prof-tl-dot">{ev.icon}</div>
                <div className="prof-tl-content">
                  <div className="prof-tl-date">{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div className="prof-tl-title">{ev.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
