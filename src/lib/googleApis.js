/**
 * Google Cloud API Integration Layer
 * Centralizes all 5 Google API keys for use across AgriConnect 360
 */

// ─── API Keys ────────────────────────────────────────────────────────────────
export const GOOGLE_KEYS = {
  analytics: import.meta.env.VITE_GOOGLE_ANALYTICS_KEY || '',
  bigquery: import.meta.env.VITE_GOOGLE_BIGQUERY_KEY || '',
  cloud: import.meta.env.VITE_GOOGLE_CLOUD_KEY || '',
  maps: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
};

// ─── AP District Coordinates ─────────────────────────────────────────────────
export const AP_COORDS = {
  'Guntur':        { lat: 16.3067, lng: 80.4365 },
  'Krishna':       { lat: 16.5736, lng: 80.3574 },
  'Anantapur':     { lat: 14.6819, lng: 77.6006 },
  'Chittoor':      { lat: 13.2172, lng: 79.1003 },
  'Kurnool':       { lat: 15.8281, lng: 78.0373 },
  'Prakasam':      { lat: 15.3500, lng: 79.5500 },
  'Nellore':       { lat: 14.4426, lng: 79.9865 },
  'East Godavari': { lat: 17.0, lng: 81.8 },
  'West Godavari': { lat: 16.9, lng: 81.1 },
  'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
  'Vizianagaram':  { lat: 18.1067, lng: 83.3956 },
  'Srikakulam':    { lat: 18.2949, lng: 83.8936 },
  'Kadapa':        { lat: 14.4674, lng: 78.8241 },
};

// ─── Google Maps Embed URL Builder ───────────────────────────────────────────
export function getMapEmbedUrl(district, zoom = 11) {
  const coords = AP_COORDS[district] || AP_COORDS['Guntur'];
  const key = GOOGLE_KEYS.maps;
  if (!key) return null;
  return `https://www.google.com/maps/embed/v1/view?key=${key}&center=${coords.lat},${coords.lng}&zoom=${zoom}&maptype=roadmap`;
}

export function getMapSearchUrl(query) {
  const key = GOOGLE_KEYS.maps;
  if (!key) return null;
  return `https://www.google.com/maps/embed/v1/search?key=${key}&q=${encodeURIComponent(query)}&center=16.3,80.4&zoom=8`;
}

export function getMapPlaceUrl(place) {
  const key = GOOGLE_KEYS.maps;
  if (!key) return null;
  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(place + ', Andhra Pradesh, India')}`;
}

export function getMapDirectionsUrl(origin, destination) {
  const key = GOOGLE_KEYS.maps;
  if (!key) return null;
  return `https://www.google.com/maps/embed/v1/directions?key=${key}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;
}

// ─── Gemini AI via Server-Side Proxy ──────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export async function callGeminiAI(prompt, options = {}) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('AI proxy not configured');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error || `AI proxy error: ${res.status}`);
  }

  const data = await res.json();
  return { text: data.text || '', raw: data };
}

// ─── Smart Crop Advisory (Gemini-powered) ────────────────────────────────────
export async function getCropAdvisory(crop, district, season) {
  const prompt = `You are an expert agricultural advisor for Andhra Pradesh, India.
Provide detailed crop advisory for:
- Crop: ${crop}
- District: ${district}
- Season: ${season || 'current'}

Include: soil preparation, seed selection, irrigation schedule, fertilizer plan, pest management, expected yield, market timing. 
Keep response practical and in simple English. Format with bullet points.`;
  return callGeminiAI(prompt, { temperature: 0.6, maxTokens: 1500 });
}

// ─── Weather Analysis (Gemini-powered) ───────────────────────────────────────
export async function getWeatherInsight(weatherData, district) {
  const prompt = `Analyze this weather data for ${district}, Andhra Pradesh and provide farming recommendations:
${JSON.stringify(weatherData, null, 2)}

Provide: 1) Weather summary 2) Farming impact 3) Recommended actions for next 3 days 4) Crop protection advice. Keep it concise.`;
  return callGeminiAI(prompt, { temperature: 0.5, maxTokens: 800 });
}

// ─── Market Price Analysis (Gemini-powered) ──────────────────────────────────
export async function getMarketAnalysis(priceData, crop) {
  const prompt = `Analyze these market prices for ${crop} in Andhra Pradesh mandis:
${JSON.stringify(priceData, null, 2)}

Provide: 1) Price trend (up/down/stable) 2) Best time to sell 3) Best mandi for maximum price 4) Price forecast for next week. Be specific with numbers.`;
  return callGeminiAI(prompt, { temperature: 0.4, maxTokens: 800 });
}

// ─── Soil Analysis (Gemini-powered) ──────────────────────────────────────────
export async function getSoilRecommendation(soilData) {
  const prompt = `Analyze this soil test report for a farm in Andhra Pradesh:
${JSON.stringify(soilData, null, 2)}

Provide: 1) Soil health score (1-10) 2) Nutrient deficiencies 3) Recommended fertilizers with quantities 4) Suitable crops 5) Soil improvement plan. Be practical.`;
  return callGeminiAI(prompt, { temperature: 0.5, maxTokens: 1000 });
}

// ─── Google Maps Embed Component Helper ──────────────────────────────────────
export function MapEmbedStyles(height = 250) {
  return {
    container: {
      width: '100%', height, borderRadius: 12, overflow: 'hidden',
      border: '1px solid var(--border)', position: 'relative',
    },
    iframe: {
      width: '100%', height: '100%', border: 'none',
    },
    fallback: {
      width: '100%', height, borderRadius: 12, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(16,185,129,0.05))',
      border: '1px solid var(--border)', color: 'var(--text-muted)', gap: 8,
    },
  };
}

// ─── Track API Usage (Analytics) ─────────────────────────────────────────────
const usageLog = [];
export function trackApiUsage(service, endpoint, success = true) {
  usageLog.push({ service, endpoint, success, timestamp: Date.now() });
  if (usageLog.length > 500) usageLog.shift();
}
export function getApiUsageStats() {
  const now = Date.now();
  const last24h = usageLog.filter(l => now - l.timestamp < 86400000);
  return {
    total: last24h.length,
    byService: last24h.reduce((acc, l) => { acc[l.service] = (acc[l.service] || 0) + 1; return acc; }, {}),
    errors: last24h.filter(l => !l.success).length,
  };
}
