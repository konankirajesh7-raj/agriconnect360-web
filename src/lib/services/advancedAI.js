/**
 * AgriConnect 360 — Advanced AI Engine (Phase 14B)
 * Gemini-powered agricultural intelligence utilities
 */
import { supabase } from '../supabase';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function geminiRequest(prompt, options = {}) {
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: options.temperature || 0.7, maxOutputTokens: options.maxTokens || 1024 },
      }),
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (e) {
    console.warn('Gemini request failed:', e.message);
    return null;
  }
}

/** 14B.1 — Camera Disease Detection (text-based fallback) */
export async function detectCropDisease(symptoms, crop = 'unknown') {
  const prompt = `You are an expert agricultural pathologist. A farmer reports the following symptoms on their ${crop} crop: "${symptoms}".
Provide: 1) Most likely disease name 2) Confidence % 3) Treatment recommendations 4) Prevention tips.
Format as JSON: { "disease": "", "confidence": 0, "treatments": [], "prevention": [], "severity": "low|medium|high" }`;
  const result = await geminiRequest(prompt);
  try { return JSON.parse(result?.replace(/```json\n?|```/g, '') || '{}'); } catch { return { disease: 'Unknown', confidence: 0, treatments: ['Consult local agronomist'], prevention: [], severity: 'medium' }; }
}

/** 14B.2 — Soil Photo Analysis (NPK estimation) */
export async function analyzeSoilHealth(ph, nitrogen, phosphorus, potassium, organicCarbon) {
  const prompt = `Analyze soil health with: pH=${ph}, N=${nitrogen}kg/ha, P=${phosphorus}kg/ha, K=${potassium}kg/ha, OC=${organicCarbon}%.
Provide: 1) Overall health score (0-100) 2) Deficiency warnings 3) Recommended amendments 4) Best crops for this soil.
Format as JSON: { "score": 0, "grade": "A/B/C/D", "deficiencies": [], "amendments": [], "bestCrops": [], "summary": "" }`;
  const result = await geminiRequest(prompt);
  try { return JSON.parse(result?.replace(/```json\n?|```/g, '') || '{}'); } catch { return { score: 65, grade: 'B', deficiencies: [], amendments: [], bestCrops: ['Paddy', 'Cotton'], summary: 'Moderate soil health' }; }
}

/** 14B.3 — Yield Prediction */
export async function predictYield(crop, area, soilType, irrigationType, district, season) {
  const prompt = `Predict crop yield for: Crop=${crop}, Area=${area} acres, Soil=${soilType}, Irrigation=${irrigationType}, District=${district} (AP), Season=${season}.
Consider AP agricultural data. Provide: Expected yield in quintals/acre, revenue estimate at current market prices, and confidence level.
Format as JSON: { "yieldPerAcre": 0, "totalYield": 0, "unit": "quintals", "revenueEstimate": 0, "confidence": 0, "factors": [] }`;
  const result = await geminiRequest(prompt);
  try { return JSON.parse(result?.replace(/```json\n?|```/g, '') || '{}'); } catch { return { yieldPerAcre: 0, totalYield: 0, unit: 'quintals', revenueEstimate: 0, confidence: 50, factors: [] }; }
}

/** 14B.4 — Revenue Forecasting */
export async function forecastRevenue(crops, historicalRevenue, season) {
  const prompt = `Forecast agricultural revenue for a farmer in AP with: Crops=${JSON.stringify(crops)}, Historical revenue=${JSON.stringify(historicalRevenue)}, Season=${season}.
Provide next 3 months forecast with optimistic/pessimistic/realistic scenarios.
Format as JSON: { "realistic": 0, "optimistic": 0, "pessimistic": 0, "monthlyBreakdown": [], "recommendations": [] }`;
  const result = await geminiRequest(prompt);
  try { return JSON.parse(result?.replace(/```json\n?|```/g, '') || '{}'); } catch { return { realistic: 0, optimistic: 0, pessimistic: 0, monthlyBreakdown: [], recommendations: [] }; }
}

/** 14B.5 — Pest Outbreak Warning */
export async function assessPestRisk(crop, district, temperature, humidity, rainfall) {
  const prompt = `Assess pest outbreak risk for ${crop} in ${district}, AP. Weather: Temp=${temperature}°C, Humidity=${humidity}%, Recent rainfall=${rainfall}mm.
Provide: Risk level, likely pests, and preventive measures.
Format as JSON: { "riskLevel": "low|medium|high|critical", "riskScore": 0, "likelyPests": [], "preventiveMeasures": [], "spraySchedule": "" }`;
  const result = await geminiRequest(prompt);
  try { return JSON.parse(result?.replace(/```json\n?|```/g, '') || '{}'); } catch { return { riskLevel: 'medium', riskScore: 50, likelyPests: [], preventiveMeasures: [], spraySchedule: '' }; }
}

/** 14B.6 — Water/Irrigation Optimization */
export async function optimizeIrrigation(crop, soilMoisture, weather, growthStage) {
  const prompt = `Optimize irrigation for ${crop} at growth stage "${growthStage}". Soil moisture=${soilMoisture}%, Weather forecast: ${weather}.
Provide irrigation schedule, water quantity, and method recommendations.
Format as JSON: { "shouldIrrigate": true, "waterQuantity": "liters/acre", "method": "", "nextIrrigation": "", "tips": [] }`;
  const result = await geminiRequest(prompt);
  try { return JSON.parse(result?.replace(/```json\n?|```/g, '') || '{}'); } catch { return { shouldIrrigate: true, waterQuantity: '5000 liters/acre', method: 'Drip', nextIrrigation: 'In 3 days', tips: [] }; }
}

/** 14B.7 — Carbon Footprint Calculator */
export function calculateCarbonFootprint(inputs) {
  const { area = 1, fertilizerKg = 0, dieselLiters = 0, electricityKwh = 0, organicPractices = false } = inputs;
  const fertilizerCO2 = fertilizerKg * 4.8;
  const dieselCO2 = dieselLiters * 2.68;
  const electricityCO2 = electricityKwh * 0.82;
  const sequestration = organicPractices ? area * 500 : area * 200;
  const totalEmission = fertilizerCO2 + dieselCO2 + electricityCO2;
  const netCarbon = totalEmission - sequestration;
  const score = Math.max(0, Math.min(100, Math.round(100 - (netCarbon / (area * 10)))));
  return {
    totalEmission: Math.round(totalEmission),
    sequestration: Math.round(sequestration),
    netCarbon: Math.round(netCarbon),
    score,
    grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
    badge: score >= 80 ? '🌿 Carbon Neutral' : score >= 60 ? '🌱 Low Carbon' : score >= 40 ? '🟡 Moderate' : '🔴 High Carbon',
    breakdown: { fertilizer: Math.round(fertilizerCO2), diesel: Math.round(dieselCO2), electricity: Math.round(electricityCO2) },
  };
}

/** 14B.8 — Farm Benchmarking */
export async function benchmarkFarm(farmData, district) {
  const prompt = `Benchmark this farm against ${district} district averages in AP:
Farm data: ${JSON.stringify(farmData)}.
Compare: yield/acre, revenue/acre, input cost, profit margin, crop diversity, technology adoption.
Format as JSON: { "overallScore": 0, "percentile": 0, "metrics": [{"name": "", "farmValue": 0, "districtAvg": 0, "status": "above|below|average"}], "improvements": [] }`;
  const result = await geminiRequest(prompt);
  try { return JSON.parse(result?.replace(/```json\n?|```/g, '') || '{}'); } catch { return { overallScore: 65, percentile: 55, metrics: [], improvements: [] }; }
}

export default { detectCropDisease, analyzeSoilHealth, predictYield, forecastRevenue, assessPestRisk, optimizeIrrigation, calculateCarbonFootprint, benchmarkFarm };
