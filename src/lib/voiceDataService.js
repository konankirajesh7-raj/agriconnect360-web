/**
 * Voice Data Service — Fetches real data for voice agent answers
 * Provides crop prices, weather, and AI-powered responses
 */
import { supabase } from './supabase';

// ═══ CROP PRICE DATABASE (always available) ═══
const CROP_PRICES = {
  'paddy': { price: 2180, unit: 'quintal', trend: 'stable', msp: 2203 },
  'cotton': { price: 7150, unit: 'quintal', trend: 'up', msp: 7020 },
  'chilli': { price: 8400, unit: 'quintal', trend: 'up', msp: null },
  'turmeric': { price: 12500, unit: 'quintal', trend: 'up', msp: null },
  'groundnut': { price: 5200, unit: 'quintal', trend: 'stable', msp: 5850 },
  'maize': { price: 2150, unit: 'quintal', trend: 'down', msp: 2090 },
  'jowar': { price: 3200, unit: 'quintal', trend: 'stable', msp: 3180 },
  'sugarcane': { price: 3500, unit: 'tonne', trend: 'stable', msp: 3150 },
  'banana': { price: 1800, unit: 'quintal', trend: 'up', msp: null },
  'mango': { price: 4500, unit: 'quintal', trend: 'up', msp: null },
  'tomato': { price: 2800, unit: 'quintal', trend: 'up', msp: null },
  'onion': { price: 1950, unit: 'quintal', trend: 'down', msp: null },
  'coconut': { price: 2600, unit: '100 nuts', trend: 'stable', msp: null },
  'cashew': { price: 15200, unit: 'quintal', trend: 'up', msp: null },
  'black pepper': { price: 42000, unit: 'quintal', trend: 'up', msp: null },
  'coriander': { price: 7800, unit: 'quintal', trend: 'stable', msp: null },
  'ginger': { price: 4200, unit: 'quintal', trend: 'up', msp: null },
  'sesame': { price: 11500, unit: 'quintal', trend: 'up', msp: null },
  'sunflower': { price: 5600, unit: 'quintal', trend: 'stable', msp: 5650 },
  'chana': { price: 5100, unit: 'quintal', trend: 'down', msp: 5440 },
  'green gram': { price: 7200, unit: 'quintal', trend: 'up', msp: 8558 },
  'red gram': { price: 8500, unit: 'quintal', trend: 'up', msp: 7000 },
  'urad dal': { price: 6800, unit: 'quintal', trend: 'stable', msp: 6950 },
  'soybean': { price: 4300, unit: 'quintal', trend: 'down', msp: 4600 },
  'potato': { price: 1400, unit: 'quintal', trend: 'stable', msp: null },
  'cabbage': { price: 1200, unit: 'quintal', trend: 'down', msp: null },
  'cauliflower': { price: 1800, unit: 'quintal', trend: 'stable', msp: null },
  'brinjal': { price: 2200, unit: 'quintal', trend: 'up', msp: null },
  'lady finger': { price: 2600, unit: 'quintal', trend: 'up', msp: null },
  'watermelon': { price: 800, unit: 'quintal', trend: 'stable', msp: null },
  'wheat': { price: 2275, unit: 'quintal', trend: 'stable', msp: 2275 },
  'rice': { price: 2180, unit: 'quintal', trend: 'stable', msp: 2203 },
  'mustard': { price: 5050, unit: 'quintal', trend: 'up', msp: 5450 },
  'tobacco': { price: 14200, unit: 'quintal', trend: 'stable', msp: null },
  'arecanut': { price: 45000, unit: 'quintal', trend: 'up', msp: null },
  'tamarind': { price: 8500, unit: 'quintal', trend: 'stable', msp: null },
  'lemon': { price: 3200, unit: 'quintal', trend: 'up', msp: null },
  'papaya': { price: 1200, unit: 'quintal', trend: 'stable', msp: null },
  'guava': { price: 2800, unit: 'quintal', trend: 'up', msp: null },
  'pomegranate': { price: 8500, unit: 'quintal', trend: 'up', msp: null },
};

/**
 * Get crop price — tries Supabase first, falls back to local data
 */
export async function getCropPrice(cropName) {
  const lower = cropName.toLowerCase().trim();
  
  // Try Supabase first
  try {
    const { data } = await supabase
      .from('market_prices')
      .select('crop, price, min_price, max_price, district, mandi, price_date')
      .ilike('crop', `%${lower}%`)
      .order('price_date', { ascending: false })
      .limit(3);
    
    if (data?.length > 0) {
      const avg = Math.round(data.reduce((s, d) => s + d.price, 0) / data.length);
      return {
        found: true,
        crop: data[0].crop,
        price: avg,
        min: data[0].min_price,
        max: data[0].max_price,
        district: data[0].district,
        mandi: data[0].mandi,
        date: data[0].price_date,
        source: 'live',
        records: data,
      };
    }
  } catch {}

  // Fallback to local
  const match = Object.entries(CROP_PRICES).find(([key]) => lower.includes(key) || key.includes(lower));
  if (match) {
    const [name, info] = match;
    return {
      found: true,
      crop: name.charAt(0).toUpperCase() + name.slice(1),
      price: info.price,
      min: Math.round(info.price * 0.88),
      max: Math.round(info.price * 1.12),
      unit: info.unit,
      trend: info.trend,
      msp: info.msp,
      source: 'reference',
    };
  }

  return { found: false, crop: cropName };
}

/**
 * Get weather summary for voice
 */
export async function getWeatherSummary() {
  try {
    const lat = import.meta.env.VITE_DEFAULT_LAT || 16.3067;
    const lon = import.meta.env.VITE_DEFAULT_LON || 80.4365;
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (data?.current) {
      return {
        found: true,
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        code: data.current.weather_code,
      };
    }
  } catch {}
  return { found: false };
}

/**
 * AI-powered voice response via Supabase Edge Function
 */
export async function getAIVoiceResponse(question, context = '') {
  try {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        prompt: `You are a helpful agricultural assistant for Indian farmers. Answer in 1-2 short sentences suitable for voice reading. Context: ${context}. Question: ${question}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    return data?.text || null;
  } catch {
    return null;
  }
}

/**
 * Build voice response for crop price question
 */
export function buildPriceResponse(priceData, lang = 'en') {
  if (!priceData.found) {
    return lang === 'te' ? `${priceData.crop} ధర ప్రస్తుతం అందుబాటులో లేదు` :
           lang === 'hi' ? `${priceData.crop} की कीमत अभी उपलब्ध नहीं है` :
           `Sorry, price for ${priceData.crop} is not available right now`;
  }

  const { crop, price, min, max, trend, msp, unit = 'quintal', source } = priceData;
  const trendText = { en: { up: 'trending up', down: 'trending down', stable: 'stable' }, te: { up: 'పెరుగుతోంది', down: 'తగ్గుతోంది', stable: 'స్థిరంగా ఉంది' }, hi: { up: 'बढ़ रहा है', down: 'गिर रहा है', stable: 'स्थिर है' } };
  const t = trendText[lang]?.[trend] || trendText.en[trend] || '';

  if (lang === 'te') {
    let msg = `${crop} ధర ప్రస్తుతం ₹${price.toLocaleString()} ప్రతి ${unit}. ${t}.`;
    if (min && max) msg += ` కనిష్ఠ ₹${min.toLocaleString()}, గరిష్ఠ ₹${max.toLocaleString()}.`;
    if (msp) msg += ` ఎమ్ఎస్పీ ₹${msp.toLocaleString()}.`;
    return msg;
  }
  if (lang === 'hi') {
    let msg = `${crop} की कीमत अभी ₹${price.toLocaleString()} प्रति ${unit} है. ${t}.`;
    if (min && max) msg += ` न्यूनतम ₹${min.toLocaleString()}, अधिकतम ₹${max.toLocaleString()}.`;
    if (msp) msg += ` एमएसपी ₹${msp.toLocaleString()}.`;
    return msg;
  }
  
  let msg = `${crop} is currently ₹${price.toLocaleString()} per ${unit}. The price is ${t}.`;
  if (min && max) msg += ` Range: ₹${min.toLocaleString()} to ₹${max.toLocaleString()}.`;
  if (msp) msg += ` MSP is ₹${msp.toLocaleString()}.`;
  return msg;
}

/**
 * Build weather voice response
 */
export function buildWeatherResponse(weather, lang = 'en') {
  if (!weather.found) {
    return lang === 'te' ? 'వాతావరణ సమాచారం అందుబాటులో లేదు' : lang === 'hi' ? 'मौसम की जानकारी उपलब्ध नहीं है' : 'Weather information is not available right now';
  }
  const { temp, humidity, wind } = weather;
  if (lang === 'te') return `ప్రస్తుత ఉష్ణోగ్రత ${temp} డిగ్రీలు, తేమ ${humidity} శాతం, గాలి వేగం ${wind} కిలోమీటర్లు`;
  if (lang === 'hi') return `तापमान ${temp} डिग्री, नमी ${humidity} प्रतिशत, हवा ${wind} किलोमीटर प्रति घंटा`;
  return `Current temperature is ${temp}°C, humidity ${humidity}%, wind speed ${wind} km/h`;
}

export { CROP_PRICES };
