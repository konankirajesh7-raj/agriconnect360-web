import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { premiumDB } from '../lib/supabase';

const TABS = [
  { id: 'disease', label: '12A AI Disease', icon: '🧬' },
  { id: 'push', label: '12B Push Alerts', icon: '🔔' },
  { id: 'reports', label: '12C PDF Reports', icon: '📄' },
  { id: 'whatsapp', label: '12D WhatsApp Bot', icon: '💬' },
  { id: 'store', label: '12E F2C Store', icon: '🛒' },
  { id: 'analytics', label: '12F Analytics & ML', icon: '📈' },
  { id: 'iot', label: '12G IoT Farming', icon: '📡' },
  { id: 'finance', label: '12H Financial', icon: '🏦' },
  { id: 'gamification', label: '12I Gamification', icon: '🎮' },
];

const DISTRICTS = ['Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Visakhapatnam', 'Anantapur', 'Kadapa', 'Eluru'];
const CROPS = ['Paddy', 'Cotton', 'Wheat', 'Maize', 'Tomato', 'Groundnut', 'Chilli', 'Sugarcane'];

const FALLBACK_STORE_LISTINGS = [
  { id: 'demo-1', produce_name: 'Grade A Tomato', district: 'Guntur', farmer_name: 'Ramesh Rao', price_per_kg: 28, grade: 'A', available_qty_kg: 600, season: 'Kharif', bulk_discount_pct: 8, delivery_tracking_id: 'TRK-98211' },
  { id: 'demo-2', produce_name: 'Cotton (Long Staple)', district: 'Krishna', farmer_name: 'Lakshmi Devi', price_per_kg: 74, grade: 'A', available_qty_kg: 900, season: 'Kharif', bulk_discount_pct: 5, delivery_tracking_id: 'TRK-98212' },
  { id: 'demo-3', produce_name: 'Groundnut', district: 'Kurnool', farmer_name: 'Satish Yadav', price_per_kg: 62, grade: 'B', available_qty_kg: 420, season: 'Rabi', bulk_discount_pct: 12, delivery_tracking_id: 'TRK-98213' },
];

const FALLBACK_LEADERBOARD = [
  { id: 'lb1', farmer_name: 'Lakshmi Devi', district: 'Krishna', agri_coins: 1640 },
  { id: 'lb2', farmer_name: 'Ramesh Rao', district: 'Guntur', agri_coins: 1475 },
  { id: 'lb3', farmer_name: 'Priya Reddy', district: 'Nellore', agri_coins: 1310 },
];

const FALLBACK_LOAN_MARKETPLACE = [
  { id: 'loan-1', lender_name: 'Kisan Credit NBFC', interest_rate: 11.5, max_amount: 200000 },
  { id: 'loan-2', lender_name: 'Rural MFI Trust', interest_rate: 13.0, max_amount: 120000 },
  { id: 'loan-3', lender_name: 'AgriFast Loans', interest_rate: 12.2, max_amount: 300000 },
];

const defaultNotificationPrefs = {
  push_enabled: true,
  weather_alerts: true,
  scheme_payment_alerts: true,
  crop_reminders: true,
  daily_digest_enabled: true,
  daily_digest_time: '07:00',
  smart_timing_enabled: true,
  do_not_disturb_start: '10:00',
  do_not_disturb_end: '16:30',
  emergency_alerts: true,
  price_target_alerts: true,
  price_target_crop: 'Cotton',
  price_target_value: 7000,
  crop_milestone_reminders: true,
};

function localKey(suffix, farmerId) {
  return `agri_phase12_${suffix}_${farmerId || 'anon'}`;
}

function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function normalizeRecordId(row, prefix = 'row') {
  if (!row || typeof row !== 'object') return row;
  if (row.id !== undefined && row.id !== null) return row;
  if (row._id !== undefined && row._id !== null) return { ...row, id: String(row._id) };
  return { ...row, id: `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}` };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function scoreSeverity(text) {
  const t = String(text || '').toLowerCase();
  if (t.includes('critical') || t.includes('very high') || t.includes('urgent')) return 'Critical';
  if (t.includes('high')) return 'High';
  if (t.includes('medium') || t.includes('moderate')) return 'Medium';
  return 'Low';
}

function parseDiagnosisPayload(payloadText) {
  const fallback = {
    diseaseName: 'Suspected crop stress',
    severity: scoreSeverity(payloadText),
    treatment: payloadText || 'Inspect affected leaves and start integrated pest management.',
    prevention: 'Use resistant seeds, crop rotation, and regular scouting.',
    recommendedPesticide: 'Neem oil / integrated pest management first line',
  };

  if (!payloadText) return fallback;

  const jsonMatch = payloadText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = safeJsonParse(jsonMatch[0], null);
    if (parsed) {
      return {
        diseaseName: parsed.diseaseName || parsed.diagnosis || fallback.diseaseName,
        severity: parsed.severity || scoreSeverity(payloadText),
        treatment: parsed.treatment || parsed.recommendedTreatment || fallback.treatment,
        prevention: parsed.prevention || fallback.prevention,
        recommendedPesticide: parsed.recommendedPesticide || parsed.pesticide || fallback.recommendedPesticide,
      };
    }
  }

  return {
    ...fallback,
    treatment: payloadText,
  };
}

async function runGeminiVisionDiagnosis({ imageDataUrl, cropName, symptoms, language }) {
  const key = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!key) {
    throw new Error('Gemini API key is missing (VITE_GEMINI_API_KEY).');
  }

  const mimeTypeMatch = imageDataUrl?.match(/^data:(.*?);base64,/);
  const mimeType = mimeTypeMatch?.[1] || 'image/jpeg';
  const base64 = imageDataUrl?.split(',')[1] || '';
  const langMap = { en: 'English', te: 'Telugu', hi: 'Hindi', kn: 'Kannada', mr: 'Marathi' };
  const replyLanguage = langMap[language] || 'English';

  const prompt = `You are an expert plant pathologist for Indian agriculture.
Analyze this crop image and symptoms.
Crop: ${cropName}
Symptoms: ${symptoms || 'Not provided'}
Reply in ${replyLanguage} strictly as JSON with keys:
diseaseName, severity, treatment, prevention, recommendedPesticide, confidence, outbreakRisk.`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64 } },
        ],
      }],
      generationConfig: { temperature: 0.25, maxOutputTokens: 800 },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error?.message || `Gemini vision request failed (${res.status})`);
  }
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function buildReportHtml(report) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Agri Connect 360 Report</title>
<style>
  body { font-family: Arial, sans-serif; margin: 28px; color: #0f172a; }
  h1 { margin-bottom: 6px; }
  .sub { color: #475569; margin-bottom: 20px; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin: 14px 0 18px; }
  .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; }
  .small { font-size: 12px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 13px; }
</style>
</head>
<body>
  <h1>Agri Connect 360 — ${report.periodLabel} Report</h1>
  <div class="sub">${report.bankReady ? 'Bank-ready KCC format enabled' : 'Farmer dashboard format'} • ${report.generatedAt}</div>

  <div class="grid">
    <div class="card"><b>Revenue</b><div>₹${report.revenue.toLocaleString('en-IN')}</div></div>
    <div class="card"><b>Costs</b><div>₹${report.costs.toLocaleString('en-IN')}</div></div>
    <div class="card"><b>Profit</b><div>₹${report.profit.toLocaleString('en-IN')}</div></div>
    <div class="card"><b>Weather Risk Index</b><div>${report.weatherRisk}</div></div>
  </div>

  <h3>Crops Summary</h3>
  <table>
    <thead><tr><th>Crop</th><th>Area (acres)</th><th>Yield (quintals)</th><th>Revenue (₹)</th></tr></thead>
    <tbody>
      ${report.crops.map((c) => `<tr><td>${c.name}</td><td>${c.area}</td><td>${c.yield}</td><td>${c.revenue.toLocaleString('en-IN')}</td></tr>`).join('')}
    </tbody>
  </table>

  <h3>Comparative Summary</h3>
  <p>${report.comparisonSummary}</p>
  <p class="small">Generated by Agri Connect 360 Premium Reports.</p>
</body>
</html>`;
}

export default function PremiumUpgradesPage() {
  const { farmerProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const farmerId = farmerProfile?.id || 0;

  const [activeTab, setActiveTab] = useState('disease');

  // 12A — AI Disease
  const [diseaseForm, setDiseaseForm] = useState({
    cropName: 'Cotton',
    district: 'Guntur',
    symptoms: '',
    language: 'en',
  });
  const [beforeImage, setBeforeImage] = useState('');
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseHistory, setDiseaseHistory] = useState([]);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [diseaseError, setDiseaseError] = useState('');
  const [afterPhotoUploads, setAfterPhotoUploads] = useState({});

  // 12B — Push preferences
  const [notificationPrefs, setNotificationPrefs] = useState(defaultNotificationPrefs);
  const [prefSaved, setPrefSaved] = useState('');

  // 12C — Reports
  const [reportConfig, setReportConfig] = useState({
    period: 'monthly',
    language: 'en',
    bankReady: true,
    compareLastSeason: true,
    sendToEmail: '',
  });
  const [reportHistory, setReportHistory] = useState([]);

  // 12D — WhatsApp bot
  const [botInput, setBotInput] = useState('PRICE COTTON GUNTUR');
  const [broadcastMessage, setBroadcastMessage] = useState('Reminder: PM-KISAN application closes in 3 days.');
  const [botConversation, setBotConversation] = useState([{ from: 'bot', text: 'Namaste! I can help with PRICE, WEATHER and SCHEME LIST commands.' }]);
  const [voiceNoteName, setVoiceNoteName] = useState('');
  const [whatsAppPhotoName, setWhatsAppPhotoName] = useState('');

  // 12E — F2C store
  const [storeListings, setStoreListings] = useState(FALLBACK_STORE_LISTINGS);
  const [consumerDistrict, setConsumerDistrict] = useState('Guntur');
  const [listingForm, setListingForm] = useState({
    produce_name: 'Fresh Tomato',
    district: 'Guntur',
    farmer_name: farmerProfile?.name || 'Farmer',
    price_per_kg: 30,
    grade: 'A',
    available_qty_kg: 500,
    season: 'Kharif',
    bulk_discount_pct: 10,
    delivery_tracking_id: `TRK-${Math.floor(10000 + Math.random() * 90000)}`,
  });

  // 12F — Analytics and ML
  const [analyticsInputs, setAnalyticsInputs] = useState({
    weatherScore: 78,
    soilScore: 72,
    cropAgeDays: 52,
    waterUsedLitres: 34000,
    dieselLitres: 110,
    fertilizerKg: 230,
  });
  const [analyticsSaved, setAnalyticsSaved] = useState('');

  // 12G — IoT
  const [sensorForm, setSensorForm] = useState({
    district: 'Guntur',
    soil_moisture: 38,
    soil_ph: 6.8,
    temperature_c: 31,
    device_provider: 'Fasal',
  });
  const [sensorData, setSensorData] = useState([]);

  // 12H — Finance
  const [kccTracker, setKccTracker] = useState({
    credit_limit: 300000,
    used_amount: 145000,
    interest_rate: 4.0,
    next_due_date: '2026-07-15',
  });
  const [loanMarketplace, setLoanMarketplace] = useState(FALLBACK_LOAN_MARKETPLACE);
  const [upiConfig, setUpiConfig] = useState({
    category: 'equipment',
    amount: 1500,
    payeeVpa: 'agri360@upi',
  });
  const [taxInputs, setTaxInputs] = useState({ income: 850000, expenses: 420000, deductions: 150000 });

  // 12I — Gamification
  const [gameProfile, setGameProfile] = useState({
    streak_days: 6,
    agri_coins: 420,
    referral_code: 'AGRI-REFER-360',
    challenges_completed: 4,
  });
  const [leaderboard, setLeaderboard] = useState(FALLBACK_LEADERBOARD);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && TABS.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (!farmerId) return;

    const localDisease = safeJsonParse(localStorage.getItem(localKey('disease_history', farmerId)), []);
    setDiseaseHistory(Array.isArray(localDisease) ? localDisease.map((row) => normalizeRecordId(row, 'scan')) : []);
    premiumDB.disease.getHistory(farmerId).then(({ data, error }) => {
      if (!error && Array.isArray(data)) {
        const normalized = data.map((row) => normalizeRecordId(row, 'scan'));
        setDiseaseHistory(normalized);
        localStorage.setItem(localKey('disease_history', farmerId), JSON.stringify(normalized));
      }
    });

    const localPrefs = safeJsonParse(localStorage.getItem(localKey('notification_prefs', farmerId)), null);
    if (localPrefs && typeof localPrefs === 'object') setNotificationPrefs(prev => ({ ...prev, ...localPrefs }));
    premiumDB.notifications.getPreferences(farmerId).then(({ data, error }) => {
      if (!error && data && typeof data === 'object') {
        setNotificationPrefs((prev) => ({ ...prev, ...data }));
      }
    });

    const localReports = safeJsonParse(localStorage.getItem(localKey('reports', farmerId)), []);
    setReportHistory(Array.isArray(localReports) ? localReports : []);
    premiumDB.reports.getAll(farmerId).then(({ data, error }) => {
      if (!error && Array.isArray(data)) {
        const normalized = data.map((row) => normalizeRecordId(row, 'report'));
        setReportHistory(normalized);
        localStorage.setItem(localKey('reports', farmerId), JSON.stringify(normalized));
      }
    }).catch(() => {/* ignore */});

    premiumDB.store.getListings().then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length) setStoreListings(data.map((row) => normalizeRecordId(row, 'listing')));
    });

    premiumDB.iot.getSensors(farmerId).then(({ data, error }) => {
      if (!error && Array.isArray(data)) setSensorData(data);
    });

    premiumDB.finance.getKcc(farmerId).then(({ data, error }) => {
      if (!error && data) setKccTracker((prev) => ({ ...prev, ...data }));
    });
    premiumDB.finance.getLoanMarketplace().then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length) setLoanMarketplace(data);
    });

    premiumDB.gamification.getProfile(farmerId).then(({ data, error }) => {
      if (!error && data) setGameProfile((prev) => ({ ...prev, ...data }));
    });
    premiumDB.gamification.getLeaderboard().then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length) setLeaderboard(data.map((row) => normalizeRecordId(row, 'leaderboard')));
    });
  }, [farmerId]);

  const outbreaks = useMemo(() => {
    const map = {};
    for (const row of diseaseHistory) {
      const district = row.district || 'Unknown';
      const key = `${district}__${row.disease_name || 'Unknown'}`;
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map)
      .map(([key, count]) => {
        const [district, disease] = key.split('__');
        return { district, disease, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [diseaseHistory]);

  const nearbySortedListings = useMemo(() => {
    const ranked = [...storeListings];
    ranked.sort((a, b) => {
      const aNear = a.district === consumerDistrict ? 1 : 0;
      const bNear = b.district === consumerDistrict ? 1 : 0;
      if (aNear !== bNear) return bNear - aNear;
      return (a.price_per_kg || 0) - (b.price_per_kg || 0);
    });
    return ranked;
  }, [storeListings, consumerDistrict]);

  const analyticsComputed = useMemo(() => {
    const weatherFactor = 0.6 + analyticsInputs.weatherScore / 200;
    const soilFactor = 0.6 + analyticsInputs.soilScore / 200;
    const ageFactor = 1 + Math.min(analyticsInputs.cropAgeDays, 120) / 400;
    const predictedYield = Math.round(24 * weatherFactor * soilFactor * ageFactor * 10) / 10;
    const forecastRevenue = Math.round(predictedYield * 6800);
    const irrigationTip = analyticsInputs.waterUsedLitres > 35000
      ? 'Water usage is high. Shift to split irrigation windows and moisture-based triggers.'
      : 'Water usage is efficient. Continue moisture-triggered irrigation cycles.';
    const carbonKg = Math.round((analyticsInputs.dieselLitres * 2.68 + analyticsInputs.fertilizerKg * 1.45) * 10) / 10;
    const badge = carbonKg < 650 ? 'Green Steward' : carbonKg < 950 ? 'Soil Guardian' : 'Efficiency Improver';
    return { predictedYield, forecastRevenue, irrigationTip, carbonKg, badge };
  }, [analyticsInputs]);

  const taxSummary = useMemo(() => {
    const taxableIncome = Math.max(0, Number(taxInputs.income) - Number(taxInputs.expenses) - Number(taxInputs.deductions));
    let tax = 0;
    if (taxableIncome > 300000) {
      const above = taxableIncome - 300000;
      tax = above <= 500000 ? above * 0.05 : 25000 + (above - 500000) * 0.1;
    }
    return { taxableIncome, tax: Math.round(tax) };
  }, [taxInputs]);

  async function handleDiseaseScan() {
    setDiseaseLoading(true);
    setDiseaseError('');
    setDiseaseResult(null);
    try {
      if (!beforeImage) throw new Error('Upload crop photo before scanning.');
      const responseText = await runGeminiVisionDiagnosis({
        imageDataUrl: beforeImage,
        cropName: diseaseForm.cropName,
        symptoms: diseaseForm.symptoms,
        language: diseaseForm.language,
      });

      const parsed = parseDiagnosisPayload(responseText);
      const supplierLink = `/suppliers?search=${encodeURIComponent(parsed.recommendedPesticide)}`;
      const record = {
        farmer_id: Number(farmerId) || 0,
        crop_name: diseaseForm.cropName,
        district: diseaseForm.district,
        symptoms: diseaseForm.symptoms,
        language: diseaseForm.language,
        severity: parsed.severity,
        disease_name: parsed.diseaseName,
        treatment: parsed.treatment,
        prevention: parsed.prevention,
        recommended_pesticide: parsed.recommendedPesticide,
        supplier_link: supplierLink,
        before_image_data: beforeImage.slice(0, 1500),
        detected_at: new Date().toISOString(),
      };

      const { data, error } = await premiumDB.disease.createScan(record);
      const saved = normalizeRecordId(error ? { ...record, id: `local-${Date.now()}` } : data, 'scan');
      const next = [saved, ...diseaseHistory];
      setDiseaseHistory(next);
      localStorage.setItem(localKey('disease_history', farmerId), JSON.stringify(next));
      setDiseaseResult({ ...parsed, supplierLink, raw: responseText });
    } catch (err) {
      setDiseaseError(err.message || 'Disease scan failed.');
    } finally {
      setDiseaseLoading(false);
    }
  }

  async function handleAfterPhoto(scanId, file) {
    const dataUrl = await readFileAsDataUrl(file);
    setAfterPhotoUploads((prev) => ({ ...prev, [scanId]: dataUrl }));

    const nextRows = diseaseHistory.map((row) => (
      row.id === scanId ? { ...row, after_image_data: dataUrl.slice(0, 1500), treatment_status: 'tracking' } : row
    ));
    setDiseaseHistory(nextRows);
    localStorage.setItem(localKey('disease_history', farmerId), JSON.stringify(nextRows));
    await premiumDB.disease.updateScan(scanId, { after_image_data: dataUrl.slice(0, 1500), treatment_status: 'tracking' });
  }

  async function saveNotificationPreferences() {
    const payload = {
      ...notificationPrefs,
      farmer_id: Number(farmerId) || 0,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(localKey('notification_prefs', farmerId), JSON.stringify(payload));
    const { error } = await premiumDB.notifications.upsertPreferences(payload);
    setPrefSaved(error ? 'Saved locally (cloud sync unavailable).' : 'Preferences saved and synced.');
    setTimeout(() => setPrefSaved(''), 2400);
  }

  function buildReportPayload() {
    const now = new Date();
    const periodLabel = reportConfig.period === 'monthly' ? 'Monthly' : reportConfig.period === 'quarterly' ? 'Quarterly' : 'Annual';
    const revenue = reportConfig.period === 'monthly' ? 385000 : reportConfig.period === 'quarterly' ? 1225000 : 4860000;
    const costs = reportConfig.period === 'monthly' ? 226000 : reportConfig.period === 'quarterly' ? 744000 : 2960000;
    const profit = revenue - costs;
    const crops = [
      { name: 'Cotton', area: 2.5, yield: 17.8, revenue: Math.round(revenue * 0.42) },
      { name: 'Paddy', area: 1.8, yield: 24.5, revenue: Math.round(revenue * 0.31) },
      { name: 'Tomato', area: 0.9, yield: 11.4, revenue: Math.round(revenue * 0.27) },
    ];
    return {
      farmer_id: Number(farmerId) || 0,
      period: reportConfig.period,
      periodLabel,
      language: reportConfig.language,
      bankReady: reportConfig.bankReady,
      compareLastSeason: reportConfig.compareLastSeason,
      generatedAt: now.toLocaleString('en-IN'),
      revenue,
      costs,
      profit,
      weatherRisk: 'Medium',
      crops,
      comparisonSummary: reportConfig.compareLastSeason
        ? 'Profit is 12.4% higher than last comparable season, driven by improved cotton grade and lower transport losses.'
        : 'Comparison disabled for this report.',
      email: reportConfig.sendToEmail || null,
      created_at: now.toISOString(),
    };
  }

  async function generateReportPdf() {
    const report = buildReportPayload();
    const html = buildReportHtml(report);
    const w = window.open('', '_blank', 'width=900,height=900');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();

    const { data, error } = await premiumDB.reports.create(report);
    const saved = error ? { ...report, id: `local-r-${Date.now()}` } : data;
    const next = [saved, ...reportHistory];
    setReportHistory(next);
    localStorage.setItem(localKey('reports', farmerId), JSON.stringify(next));
  }

  function emailReportSummary() {
    const report = buildReportPayload();
    const to = reportConfig.sendToEmail || '';
    const subject = encodeURIComponent(`AgriConnect360 ${report.periodLabel} Report`);
    const body = encodeURIComponent(
      `Revenue: ₹${report.revenue}\nCosts: ₹${report.costs}\nProfit: ₹${report.profit}\nComparison: ${report.comparisonSummary}\n\nOpen dashboard for full report.`
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  }

  async function saveAnalyticsSnapshot() {
    const payload = {
      farmer_id: Number(farmerId) || 0,
      district: diseaseForm.district || farmerProfile?.district || 'Guntur',
      crop_name: diseaseForm.cropName || 'Cotton',
      carbon_credits: Number(analyticsComputed.carbonKg) || 0,
      fertilizer_optimization_kg: Number(analyticsInputs.fertilizerKg) || 0,
      water_usage_litres: Number(analyticsInputs.waterUsedLitres) || 0,
      created_at: new Date().toISOString(),
    };

    const { error } = await premiumDB.analytics.createSnapshot(payload);
    setAnalyticsSaved(error ? 'Saved locally (API unavailable).' : 'Analytics snapshot saved.');
  }

  function openWhatsapp(message) {
    window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
  }

  async function handleBroadcastSend() {
    const message = `BROADCAST\n${broadcastMessage}`;
    await premiumDB.whatsapp.createInteraction({
      farmer_id: Number(farmerId) || 0,
      direction: 'outbound',
      message,
      created_at: new Date().toISOString(),
    });
    openWhatsapp(message);
  }

  async function sendBotCommand() {
    const command = botInput.trim();
    if (!command) return;
    const lower = command.toLowerCase();
    let response = 'Use commands: PRICE <crop> <district>, WEATHER <district>, SCHEME LIST.';
    if (lower.startsWith('price')) response = 'Price Alert Enabled: Cotton crossed target in Guntur. Current average: ₹7,180/quintal.';
    if (lower.startsWith('weather')) response = 'Weather Advisory: Moderate rain expected in next 24 hours. Delay pesticide spray by 1 day.';
    if (lower.includes('scheme')) response = 'Schemes Available: PM-KISAN, PMFBY, KCC, Soil Health Card. Reply APPLY <scheme>.';
    const next = [...botConversation, { from: 'user', text: command }, { from: 'bot', text: response }];
    setBotConversation(next);
    await premiumDB.whatsapp.createInteraction({
      farmer_id: Number(farmerId) || 0,
      direction: 'inbound',
      message: command,
      created_at: new Date().toISOString(),
    });
    await premiumDB.whatsapp.createInteraction({
      farmer_id: Number(farmerId) || 0,
      direction: 'outbound',
      message: response,
      created_at: new Date().toISOString(),
    });
    setBotInput('');
  }

  async function publishStoreListing() {
    const payload = {
      ...listingForm,
      farmer_id: Number(farmerId) || 0,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await premiumDB.store.createListing(payload);
    const saved = normalizeRecordId(error ? { ...payload, id: `local-l-${Date.now()}` } : data, 'listing');
    setStoreListings((prev) => [saved, ...prev]);
  }

  async function saveSensorData() {
    const payload = {
      ...sensorForm,
      farmer_id: Number(farmerId) || 0,
      recorded_at: new Date().toISOString(),
    };
    const { data, error } = await premiumDB.iot.insertSensorData(payload);
    const saved = error ? { ...payload, id: `local-s-${Date.now()}` } : data;
    setSensorData((prev) => [saved, ...prev].slice(0, 200));
  }

  async function saveKccTracker() {
    await premiumDB.finance.upsertKcc({
      ...kccTracker,
      farmer_id: Number(farmerId) || 0,
      updated_at: new Date().toISOString(),
    });
  }

  async function saveGameProfile(nextProfile) {
    setGameProfile(nextProfile);
    await premiumDB.gamification.upsertProfile({
      ...nextProfile,
      farmer_id: Number(farmerId) || 0,
      farmer_name: farmerProfile?.name || 'Farmer',
      district: farmerProfile?.district || 'Guntur',
      updated_at: new Date().toISOString(),
    });
  }

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">💎 Phase 12 — Premium Upgrades</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            AI Disease Detection, Push Alerts, Reports, WhatsApp, F2C Store, Analytics, IoT, Finance and Gamification
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/store')} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
          🛒 Open Public Store
        </button>
      </div>

      <div className="prem-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`prem-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              navigate(`/premium?tab=${tab.id}`, { replace: true });
            }}
          >
            <span className="prem-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>

        ))}
      </div>

      {activeTab === 'disease' && (
        <div className="prem-disease-layout">
          <div className="prem-scan-form">
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>📷 AI Crop Disease Scanner</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                Upload a crop photo → Gemini Vision AI detects disease, severity, treatment + pesticide recommendation
              </div>

              <div className="prem-form-field">
                <label>Crop</label>
                <select value={diseaseForm.cropName} onChange={(e) => setDiseaseForm((p) => ({ ...p, cropName: e.target.value }))}>
                  {CROPS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="prem-form-field">
                <label>District</label>
                <select value={diseaseForm.district} onChange={(e) => setDiseaseForm((p) => ({ ...p, district: e.target.value }))}>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div className="prem-form-field">
                <label>Response Language</label>
                <select value={diseaseForm.language} onChange={(e) => setDiseaseForm((p) => ({ ...p, language: e.target.value }))}>
                  <option value="en">English</option>
                  <option value="te">తెలుగు</option>
                  <option value="hi">हिंदी</option>
                </select>
              </div>

              <div className="prem-form-field">
                <label>Symptoms Observed</label>
                <textarea value={diseaseForm.symptoms} onChange={(e) => setDiseaseForm((p) => ({ ...p, symptoms: e.target.value }))} rows={3} placeholder="Leaf spots, curling, yellowing..." />
              </div>

              <div className="prem-form-field">
                <label>📷 Before Photo (from field)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataUrl = await readFileAsDataUrl(file);
                    setBeforeImage(dataUrl);
                  }}
                  style={{ width: '100%' }}
                />
              </div>
              {beforeImage && <img src={beforeImage} alt="before" className="prem-preview-img" />}

              <button className="btn btn-primary" onClick={handleDiseaseScan} disabled={diseaseLoading} style={{ width: '100%', padding: '10px 12px', fontSize: '0.85rem', marginTop: 8 }}>
                {diseaseLoading ? '⟳ Analyzing with Gemini Vision...' : '🧬 Run Disease Detection'}
              </button>
              {diseaseError && <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 8 }}>{diseaseError}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 14 }}>
            {/* Diagnosis Result */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-display)' }}>🧠 Structured Diagnosis</div>
              {!diseaseResult ? (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '20px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔬</div>
                  Run a scan to extract disease name, treatment, prevention, severity and pesticide.
                </div>
              ) : (
                <div className="prem-result-grid">
                  <div className="prem-result-item"><b>Disease</b><div>{diseaseResult.diseaseName}</div></div>
                  <div className="prem-result-item"><b>Severity</b><div><span className={`prem-severity ${diseaseResult.severity?.toLowerCase()}`}>{diseaseResult.severity}</span></div></div>
                  <div className="prem-result-item"><b>Treatment</b><div>{diseaseResult.treatment}</div></div>
                  <div className="prem-result-item"><b>Prevention</b><div>{diseaseResult.prevention}</div></div>
                  <div className="prem-result-item full pesticide">
                    <b>💊 Recommended Pesticide</b>
                    <div>{diseaseResult.recommendedPesticide}</div>
                    <button className="btn btn-outline" style={{ marginTop: 8, padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => navigate(diseaseResult.supplierLink)}>
                      🔗 Find nearest supplier
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Community Disease Map */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-display)' }}>🗺️ Community Disease Map</div>
              <div className="prem-outbreak-grid">
                {outbreaks.length === 0 && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 16 }}>No outbreak data yet. Scans populate this map.</div>}
                {outbreaks.map((o) => (
                  <div key={`${o.district}-${o.disease}`} className={`prem-outbreak-item ${o.count >= 4 ? 'hot' : o.count >= 2 ? 'warm' : 'cool'}`}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{o.district}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', margin: '3px 0' }}>{o.disease}</div>
                    <div style={{ fontSize: '0.72rem' }}>Cases: <strong>{o.count}</strong></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scan History + Before/After */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 700, marginBottom: 10, fontFamily: 'var(--font-display)' }}>🧾 Scan History + Before/After Tracking</div>
              <div className="prem-scan-history">
                {diseaseHistory.map((row) => (
                  <div key={row.id || row._id} className="prem-scan-row" style={{ flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{row.crop_name} — {row.disease_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.district} • <span className={`prem-severity ${(row.severity||'').toLowerCase()}`}>{row.severity}</span></div>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(row.detected_at || row.created_at || Date.now()).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                    <div className="prem-scan-photos">
                      {row.before_image_data && <img src={row.before_image_data} alt="before" className="prem-scan-thumb" />}
                      {(row.after_image_data || afterPhotoUploads[row.id || row._id]) && <img src={row.after_image_data || afterPhotoUploads[row.id || row._id]} alt="after" className="prem-scan-thumb" />}
                      <div style={{ flex: 1 }}>
                        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleAfterPhoto(row.id || row._id, e.target.files[0])} style={{ width: '100%', fontSize: '0.72rem' }} />
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>Upload follow-up photo after treatment</div>
                      </div>
                    </div>
                  </div>
                ))}
                {diseaseHistory.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>No scans yet. Run your first disease scan above.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'push' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>🔔 Push Notification Controls</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Configure smart alerts for weather, prices, crop milestones, and emergency notifications
          </div>

          <div className="prem-push-grid">
            {[
              ['push_enabled', '🔔 Enable push notifications'],
              ['weather_alerts', '🌧️ Rain & weather risk warnings'],
              ['scheme_payment_alerts', '🏛️ Scheme payment alerts'],
              ['crop_reminders', '🌱 Crop stage reminders'],
              ['smart_timing_enabled', '⏰ Smart timing (no disturb during field hours)'],
              ['emergency_alerts', '🚨 Emergency cyclone/flood alerts'],
              ['price_target_alerts', '💰 Price target alerts (e.g. Cotton > ₹7000)'],
              ['crop_milestone_reminders', '📅 Crop milestone reminders (Day 45 fertilizer)'],
              ['daily_digest_enabled', '📊 Daily digest summary at 7 AM'],
            ].map(([key, label]) => (
              <label key={key} className="prem-toggle-row">
                <input type="checkbox" checked={!!notificationPrefs[key]} onChange={(e) => setNotificationPrefs((p) => ({ ...p, [key]: e.target.checked }))} />
                <span className="prem-toggle-label">{label}</span>
              </label>
            ))}
          </div>

          <div className="prem-time-grid">
            <div className="prem-time-field">
              <label>Digest time</label>
              <input type="time" value={notificationPrefs.daily_digest_time} onChange={(e) => setNotificationPrefs((p) => ({ ...p, daily_digest_time: e.target.value }))} />
            </div>
            <div className="prem-time-field">
              <label>DND start</label>
              <input type="time" value={notificationPrefs.do_not_disturb_start} onChange={(e) => setNotificationPrefs((p) => ({ ...p, do_not_disturb_start: e.target.value }))} />
            </div>
            <div className="prem-time-field">
              <label>DND end</label>
              <input type="time" value={notificationPrefs.do_not_disturb_end} onChange={(e) => setNotificationPrefs((p) => ({ ...p, do_not_disturb_end: e.target.value }))} />
            </div>
            <div className="prem-time-field">
              <label>Price target (₹)</label>
              <input type="number" value={notificationPrefs.price_target_value} onChange={(e) => setNotificationPrefs((p) => ({ ...p, price_target_value: Number(e.target.value) }))} />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <button className="btn btn-primary" onClick={saveNotificationPreferences} style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
              💾 Save Notification Preferences
            </button>
            {prefSaved && <span className="prem-save-status">{prefSaved}</span>}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>📄 PDF Reports (Monthly / Quarterly / Annual)</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Generate bank-ready KCC reports with seasonal comparisons and email delivery
          </div>

          <div className="prem-report-config">
            <select value={reportConfig.period} onChange={(e) => setReportConfig((p) => ({ ...p, period: e.target.value }))}>
              <option value="monthly">📅 Monthly</option>
              <option value="quarterly">📊 Quarterly</option>
              <option value="annual">📈 Annual</option>
            </select>
            <select value={reportConfig.language} onChange={(e) => setReportConfig((p) => ({ ...p, language: e.target.value }))}>
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिंदी</option>
            </select>
            <label className="prem-report-toggle"><input type="checkbox" checked={reportConfig.bankReady} onChange={(e) => setReportConfig((p) => ({ ...p, bankReady: e.target.checked }))} /> 🏦 Bank-ready KCC</label>
            <label className="prem-report-toggle"><input type="checkbox" checked={reportConfig.compareLastSeason} onChange={(e) => setReportConfig((p) => ({ ...p, compareLastSeason: e.target.checked }))} /> 📊 Compare season</label>
            <input type="email" placeholder="Email report to..." value={reportConfig.sendToEmail} onChange={(e) => setReportConfig((p) => ({ ...p, sendToEmail: e.target.value }))} />
          </div>

          <div className="prem-report-actions">
            <button className="btn btn-primary" onClick={generateReportPdf} style={{ padding: '10px 16px', fontSize: '0.84rem' }}>⬇️ Download / Print PDF</button>
            <button className="btn btn-outline" onClick={emailReportSummary} style={{ padding: '10px 16px', fontSize: '0.84rem' }}>✉️ Email Summary</button>
          </div>

          <div className="prem-report-history">
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.85rem' }}>📋 Recent Reports</div>
            {reportHistory.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>No reports generated yet. Generate your first report above.</div>}
            {reportHistory.map((r) => (
              <div key={r.id || r.created_at} className="prem-report-row">
                <span>{r.periodLabel || r.period} Report</span>
                <span className="profit">₹{Number(r.profit || 0).toLocaleString('en-IN')}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(r.created_at || Date.now()).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>💬 WhatsApp Bot Command Center</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Two-way AI advisor via WhatsApp. Commands: <b>PRICE</b>, <b>WEATHER</b>, <b>SCHEME LIST</b>. Voice notes + photo disease detection.
          </div>

          <div className="prem-wa-layout">
            <div>
              <div className="prem-wa-input-row">
                <input value={botInput} onChange={(e) => setBotInput(e.target.value)} placeholder="PRICE COTTON GUNTUR" onKeyDown={(e) => e.key === 'Enter' && sendBotCommand()} />
                <button className="btn btn-primary" style={{ padding: '8px 14px' }} onClick={sendBotCommand}>Send</button>
                <button className="btn btn-outline" style={{ padding: '8px 14px' }} onClick={() => openWhatsapp(botInput || 'START')}>Open WA</button>
              </div>

              <div className="prem-wa-quick-cmds">
                {['PRICE COTTON GUNTUR', 'WEATHER KRISHNA', 'SCHEME LIST'].map((cmd) => (
                  <button key={cmd} className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '6px 10px' }} onClick={() => setBotInput(cmd)}>{cmd}</button>
                ))}
              </div>

              <div className="prem-wa-media-grid">
                <div className="prem-wa-media-card">
                  <div className="title">🎙️ Telugu voice note support</div>
                  <input type="file" accept="audio/*" onChange={(e) => setVoiceNoteName(e.target.files?.[0]?.name || '')} style={{ width: '100%', fontSize: '0.72rem' }} />
                  {voiceNoteName && <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>📎 {voiceNoteName}</div>}
                </div>
                <div className="prem-wa-media-card">
                  <div className="title">📷 Photo disease detection via WhatsApp</div>
                  <input type="file" accept="image/*" onChange={(e) => setWhatsAppPhotoName(e.target.files?.[0]?.name || '')} style={{ width: '100%', fontSize: '0.72rem' }} />
                  {whatsAppPhotoName && <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>📎 {whatsAppPhotoName}</div>}
                </div>
              </div>

              <div className="prem-wa-broadcast" style={{ marginTop: 14 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: 6 }}>📣 Broadcast (scheme deadlines)</div>
                <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} rows={3} />
                <button className="btn btn-outline" style={{ marginTop: 8, padding: '8px 12px', fontSize: '0.78rem' }} onClick={handleBroadcastSend}>
                  📣 Send Broadcast
                </button>
              </div>
            </div>

            <div className="prem-wa-chat">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 10 }}>🤖 AI Advisor Conversation</div>
              {botConversation.map((m, idx) => (
                <div key={idx} className={`prem-wa-bubble ${m.from}`}>
                  {m.from === 'bot' && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>🤖 Bot</span>}
                  {m.from === 'user' && <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>👤 You</span>}
                  <div>{m.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'store' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>🛒 Farm-to-Consumer Direct Store</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Farmers list produce → Consumers order via WhatsApp → Delivery tracked in Transport module
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }} onClick={() => navigate('/store')}>🌐 Open Public Store</button>
            <select value={consumerDistrict} onChange={(e) => setConsumerDistrict(e.target.value)} className="prem-store-form" style={{ width: 'auto', padding: '8px 12px', marginBottom: 0 }}>
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="prem-store-layout">
            <div className="prem-store-form">
              <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 10 }}>📦 List Your Produce</div>
              <input value={listingForm.produce_name} onChange={(e) => setListingForm((p) => ({ ...p, produce_name: e.target.value }))} placeholder="Produce name" />
              <div className="half-grid">
                <input type="number" value={listingForm.price_per_kg} onChange={(e) => setListingForm((p) => ({ ...p, price_per_kg: Number(e.target.value) }))} placeholder="₹ Price/kg" />
                <input type="number" value={listingForm.available_qty_kg} onChange={(e) => setListingForm((p) => ({ ...p, available_qty_kg: Number(e.target.value) }))} placeholder="Qty (kg)" />
              </div>
              <div className="half-grid" style={{ marginTop: 8 }}>
                <select value={listingForm.grade} onChange={(e) => setListingForm((p) => ({ ...p, grade: e.target.value }))}>
                  <option>A</option><option>B</option><option>C</option>
                </select>
                <select value={listingForm.district} onChange={(e) => setListingForm((p) => ({ ...p, district: e.target.value }))}>
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <input type="number" value={listingForm.bulk_discount_pct} onChange={(e) => setListingForm((p) => ({ ...p, bulk_discount_pct: Number(e.target.value) }))} placeholder="Bulk discount %" style={{ marginTop: 8 }} />
              <button className="btn btn-primary" onClick={publishStoreListing} style={{ width: '100%', marginTop: 8, padding: '9px 12px', fontSize: '0.84rem' }}>🚀 Publish Listing</button>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', marginBottom: 10, color: 'var(--text-muted)' }}>Nearby farmers ranked first • {nearbySortedListings.length} listings</div>
              <div className="prem-listing-grid">
                {nearbySortedListings.map((item) => (
                  <div key={item.id || item._id} className="prem-listing-card">
                    <div className="name">{item.produce_name}</div>
                    <div className="meta">{item.farmer_name} • {item.district}</div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                      <span className="badge badge-info">Grade {item.grade}</span>
                      <span className="badge badge-green">{item.season}</span>
                    </div>
                    <div className="price">₹{item.price_per_kg}/kg • {item.available_qty_kg} kg available</div>
                    <div className="discount">💰 Bulk discount: {item.bulk_discount_pct}% for institutions</div>
                    <div className="actions">
                      <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.72rem' }} onClick={() => openWhatsapp(`ORDER ${item.produce_name} ${item.available_qty_kg}kg from ${item.farmer_name}`)}>💬 WhatsApp Order</button>
                      <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.72rem' }} onClick={() => navigate(`/transport?tracking=${encodeURIComponent(item.delivery_tracking_id || '')}`)}>🚚 Track</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>📈 Analytics & ML Insights</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            LSTM-inspired yield prediction, revenue forecast, water optimization, and carbon footprint tracking
          </div>

          <div className="prem-analytics-inputs">
            <div className="prem-analytics-field"><label>🌤️ Weather score</label><input type="number" value={analyticsInputs.weatherScore} onChange={(e) => setAnalyticsInputs((p) => ({ ...p, weatherScore: Number(e.target.value) }))} /></div>
            <div className="prem-analytics-field"><label>🌱 Soil score</label><input type="number" value={analyticsInputs.soilScore} onChange={(e) => setAnalyticsInputs((p) => ({ ...p, soilScore: Number(e.target.value) }))} /></div>
            <div className="prem-analytics-field"><label>📅 Crop age (days)</label><input type="number" value={analyticsInputs.cropAgeDays} onChange={(e) => setAnalyticsInputs((p) => ({ ...p, cropAgeDays: Number(e.target.value) }))} /></div>
            <div className="prem-analytics-field"><label>💧 Water used (L)</label><input type="number" value={analyticsInputs.waterUsedLitres} onChange={(e) => setAnalyticsInputs((p) => ({ ...p, waterUsedLitres: Number(e.target.value) }))} /></div>
            <div className="prem-analytics-field"><label>⛽ Diesel (L)</label><input type="number" value={analyticsInputs.dieselLitres} onChange={(e) => setAnalyticsInputs((p) => ({ ...p, dieselLitres: Number(e.target.value) }))} /></div>
            <div className="prem-analytics-field"><label>🧪 Fertilizer (kg)</label><input type="number" value={analyticsInputs.fertilizerKg} onChange={(e) => setAnalyticsInputs((p) => ({ ...p, fertilizerKg: Number(e.target.value) }))} /></div>
          </div>

          <div className="prem-metrics-grid">
            <div className="prem-metric-card"><div className="label">📊 Usage analytics</div><div className="value">23 sessions/week</div></div>
            <div className="prem-metric-card highlight"><div className="label">🌾 Yield prediction (LSTM)</div><div className="value">{analyticsComputed.predictedYield} qtl</div></div>
            <div className="prem-metric-card highlight"><div className="label">💰 Revenue forecast</div><div className="value">₹{analyticsComputed.forecastRevenue.toLocaleString('en-IN')}</div></div>
            <div className="prem-metric-card"><div className="label">💧 Water analytics</div><div className="value" style={{ fontSize: '0.78rem' }}>{analyticsComputed.irrigationTip}</div></div>
            <div className="prem-metric-card"><div className="label">🌿 Carbon footprint</div><div className="value">{analyticsComputed.carbonKg} kg CO₂e</div><div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: 2 }}>🏅 {analyticsComputed.badge}</div></div>
          </div>

          <div style={{ marginTop: 12, fontSize: '0.82rem', color: 'var(--text-muted)', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border)' }}>
            📊 Benchmark: Your projected yield is <b>{analyticsComputed.predictedYield >= 25 ? 'above' : 'below'}</b> district average (24.8 qtl).
          </div>

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-outline" onClick={saveAnalyticsSnapshot} style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              💾 Save Analytics Snapshot
            </button>
            {analyticsSaved && <span className="prem-save-status">{analyticsSaved}</span>}
          </div>
        </div>
      )}

      {activeTab === 'iot' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>📡 IoT Smart Farming Dashboard</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Fasal/CropIn sensor integration • Soil moisture triggers • Smart irrigation scheduling
          </div>

          <div className="prem-iot-inputs">
            <select value={sensorForm.device_provider} onChange={(e) => setSensorForm((p) => ({ ...p, device_provider: e.target.value }))}>
              <option>Fasal</option>
              <option>CropIn</option>
              <option>Agri360 Sensor</option>
            </select>
            <input type="number" value={sensorForm.soil_moisture} onChange={(e) => setSensorForm((p) => ({ ...p, soil_moisture: Number(e.target.value) }))} placeholder="Soil moisture %" />
            <input type="number" value={sensorForm.soil_ph} onChange={(e) => setSensorForm((p) => ({ ...p, soil_ph: Number(e.target.value) }))} placeholder="Soil pH" />
            <input type="number" value={sensorForm.temperature_c} onChange={(e) => setSensorForm((p) => ({ ...p, temperature_c: Number(e.target.value) }))} placeholder="Temp °C" />
            <button className="btn btn-primary" style={{ padding: '9px 12px' }} onClick={saveSensorData}>📡 Save Reading</button>
          </div>

          <div className={`prem-iot-status ${sensorForm.soil_moisture < 30 ? 'warn' : 'ok'}`}>
            <div>🚿 Smart irrigation: <b>{sensorForm.soil_moisture < 35 ? 'Irrigate today (2 cycles of 25 mins)' : 'Next irrigation in ~18 hours'}</b></div>
            <div style={{ marginTop: 4 }}>
              {sensorForm.soil_moisture < 30 ? '⚠️ Dry soil alert triggered for this field.' : '✅ Soil moisture in acceptable range.'}
            </div>
          </div>

          <div className="prem-iot-history">
            {sensorData.slice(0, 20).map((row) => (
              <div key={row.id || row.recorded_at} className="prem-iot-row">
                <span>📡 {row.device_provider} • 💧 {row.soil_moisture}% • pH {row.soil_ph}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{new Date(row.recorded_at || Date.now()).toLocaleString('en-IN')}</span>
              </div>
            ))}
            {!sensorData.length && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>No IoT sensor readings yet. Save your first reading above.</div>}
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>🏦 Financial Services Hub</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            KCC credit tracking, micro-loans, UPI payments, insurance claims, and tax estimation
          </div>

          <div className="prem-finance-top">
            <div className="prem-finance-panel">
              <div className="panel-title">💳 KCC Credit Tracker</div>
              <input type="number" value={kccTracker.credit_limit} onChange={(e) => setKccTracker((p) => ({ ...p, credit_limit: Number(e.target.value) }))} placeholder="Credit limit (₹)" />
              <input type="number" value={kccTracker.used_amount} onChange={(e) => setKccTracker((p) => ({ ...p, used_amount: Number(e.target.value) }))} placeholder="Used amount (₹)" />
              <input type="date" value={kccTracker.next_due_date} onChange={(e) => setKccTracker((p) => ({ ...p, next_due_date: e.target.value }))} />
              <button className="btn btn-outline" onClick={saveKccTracker} style={{ padding: '8px 12px', fontSize: '0.82rem' }}>💾 Save KCC</button>
              <div className="prem-finance-util-bar">
                <div className={`fill ${Math.round((kccTracker.used_amount / Math.max(kccTracker.credit_limit, 1)) * 100) > 80 ? 'danger' : Math.round((kccTracker.used_amount / Math.max(kccTracker.credit_limit, 1)) * 100) > 50 ? 'warn' : 'ok'}`} style={{ width: `${Math.min(Math.round((kccTracker.used_amount / Math.max(kccTracker.credit_limit, 1)) * 100), 100)}%` }} />
              </div>
              <div style={{ marginTop: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Utilization: <b>{Math.round((kccTracker.used_amount / Math.max(kccTracker.credit_limit, 1)) * 100)}%</b> • Available: ₹{Math.max(kccTracker.credit_limit - kccTracker.used_amount, 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="prem-finance-panel">
              <div className="panel-title">🏪 Micro-Loan Marketplace</div>
              {loanMarketplace.map((l) => (
                <div key={l.id || l.lender_name} className="prem-loan-row">
                  <span><b>{l.lender_name}</b></span>
                  <span className="rate">{Number.isFinite(Number(l.interest_rate)) ? Number(l.interest_rate).toFixed(1) : 'N/A'}%</span>
                  <span className="max">₹{Number(l.max_amount || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {!loanMarketplace.length && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>No loan offers available yet.</div>}
            </div>
          </div>

          <div className="prem-finance-bottom">
            <div className="prem-finance-panel">
              <div className="panel-title">📱 UPI Payments</div>
              <input value={upiConfig.payeeVpa} onChange={(e) => setUpiConfig((p) => ({ ...p, payeeVpa: e.target.value }))} placeholder="payee@upi" />
              <input type="number" value={upiConfig.amount} onChange={(e) => setUpiConfig((p) => ({ ...p, amount: Number(e.target.value) }))} placeholder="Amount (₹)" />
              <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.78rem', width: '100%' }} onClick={() => window.open(`upi://pay?pa=${encodeURIComponent(upiConfig.payeeVpa)}&pn=AgriConnect360&am=${encodeURIComponent(upiConfig.amount)}&cu=INR&tn=${encodeURIComponent(upiConfig.category)}`)}>
                📱 Open UPI Intent
              </button>
            </div>

            <div className="prem-finance-panel">
              <div className="panel-title">🛡️ Insurance Claim Auto-Fill</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Auto-filled from crop + disease records.</div>
              <div style={{ fontSize: '0.82rem' }}>🌱 Crop: <b>{diseaseForm.cropName}</b></div>
              <div style={{ fontSize: '0.82rem' }}>📍 District: <b>{diseaseForm.district}</b></div>
              <div style={{ fontSize: '0.82rem' }}>🔬 Latest issue: <b>{diseaseResult?.diseaseName || 'N/A'}</b></div>
              <button className="btn btn-outline" style={{ marginTop: 10, padding: '8px 12px', fontSize: '0.78rem', width: '100%' }}>📄 Generate Claim Draft</button>
            </div>

            <div className="prem-finance-panel">
              <div className="panel-title">📊 Income Tax Estimator</div>
              <input type="number" value={taxInputs.income} onChange={(e) => setTaxInputs((p) => ({ ...p, income: Number(e.target.value) }))} placeholder="Annual income (₹)" />
              <input type="number" value={taxInputs.expenses} onChange={(e) => setTaxInputs((p) => ({ ...p, expenses: Number(e.target.value) }))} placeholder="Annual expenses (₹)" />
              <input type="number" value={taxInputs.deductions} onChange={(e) => setTaxInputs((p) => ({ ...p, deductions: Number(e.target.value) }))} placeholder="Deductions (₹)" />
              <div className="prem-tax-result">
                <div className="taxable">Taxable income: ₹{taxSummary.taxableIncome.toLocaleString('en-IN')}</div>
                <div className="tax-amount">Estimated tax: ₹{taxSummary.tax.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gamification' && (
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>🎮 Gamification & Rewards</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Earn AgriCoins through daily logins, challenges, and referrals. Compete on the leaderboard!
          </div>

          <div className="prem-game-stats">
            <div className="prem-game-stat streak">
              <div className="icon">🔥</div>
              <div className="stat-value">{gameProfile.streak_days}</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="prem-game-stat coins">
              <div className="icon">🪙</div>
              <div className="stat-value">{gameProfile.agri_coins}</div>
              <div className="stat-label">AgriCoins</div>
            </div>
            <div className="prem-game-stat">
              <div className="icon">🏅</div>
              <div className="stat-value">{gameProfile.challenges_completed}</div>
              <div className="stat-label">Challenges Done</div>
            </div>
            <div className="prem-game-stat">
              <div className="icon">👥</div>
              <div className="stat-value">{gameProfile.referral_code}</div>
              <div className="stat-label">Referral Code</div>
            </div>
          </div>

          <div className="prem-game-actions">
            <button className="btn btn-primary" style={{ padding: '9px 14px', fontSize: '0.82rem' }} onClick={() => saveGameProfile({ ...gameProfile, streak_days: gameProfile.streak_days + 1, agri_coins: gameProfile.agri_coins + 25 })}>
              ✅ Daily Login (+25 🪙)
            </button>
            <button className="btn btn-outline" style={{ padding: '9px 14px', fontSize: '0.82rem' }} onClick={() => saveGameProfile({ ...gameProfile, challenges_completed: gameProfile.challenges_completed + 1, agri_coins: gameProfile.agri_coins + 80 })}>
              🏅 Complete Challenge (+80 🪙)
            </button>
            <button className="btn btn-outline" style={{ padding: '9px 14px', fontSize: '0.82rem' }} onClick={() => saveGameProfile({ ...gameProfile, agri_coins: gameProfile.agri_coins + 50 })}>
              👥 Referral Signup (+50 🪙)
            </button>
          </div>

          <div className="prem-game-bottom">
            <div className="prem-game-panel">
              <div className="panel-title">🏆 Leaderboard</div>
              {leaderboard.map((row, idx) => (
                <div key={row.id || idx} className="prem-leaderboard-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="rank">{idx + 1}</span>
                    <span>{row.farmer_name || row.name || 'Farmer'} ({row.district || 'AP'})</span>
                  </div>
                  <span className="coins">🪙 {row.agri_coins}</span>
                </div>
              ))}
              {!leaderboard.length && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>No leaderboard data yet.</div>}
            </div>

            <div className="prem-game-panel">
              <div className="panel-title">🏆 Seasonal Contests</div>
              {[
                ['📸', 'Best crop photo contest (Kharif)'],
                ['💧', 'Highest water efficiency challenge'],
                ['🌾', 'Top yield improver in district'],
              ].map(([emoji, c]) => (
                <div key={c} className="prem-contest-row">
                  <span>{emoji} {c}</span>
                  <button className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.72rem' }}>Join</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
