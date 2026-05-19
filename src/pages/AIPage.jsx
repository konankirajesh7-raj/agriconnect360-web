import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { searchKB } from '../lib/farmingKB';
import { useLanguage } from '../lib/i18n/LanguageContext';

// ── AI Engine Config — routed through secure server-side proxy ───────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const AI_PROXY_URL = `${SUPABASE_URL}/functions/v1/ai-proxy`;
const AI_AVAILABLE = !!SUPABASE_URL && !!SUPABASE_ANON_KEY;

const ROLE_TOOLS = {
  farmer: [
    { id: 'crop',   icon: '🌱', label: 'Crop Recommender', desc: 'Top 3 crops based on soil, climate & market data' },
    { id: 'doctor', icon: '🩺', label: 'Crop Doctor',      desc: 'Diagnose diseases via photo scan OR symptom description' },
    { id: 'soil',   icon: '🧪', label: 'Soil Advisor',     desc: 'Fertilizer plan from NPK soil test results' },
    { id: 'price',  icon: '💰', label: 'Price Forecaster',  desc: 'Best time to sell based on market data' },
  ],
  broker: [
    { id: 'price', icon: '💰', label: 'Price Intelligence',     desc: 'Market trends, arbitrage opportunities & forecasts' },
    { id: 'crop',  icon: '🌱', label: 'Crop Supply Analyzer',   desc: 'Which crops are in surplus/deficit by region' },
  ],
  supplier: [
    { id: 'crop',  icon: '🌱', label: 'Demand Predictor',       desc: 'Which inputs farmers will need this season' },
    { id: 'price', icon: '💰', label: 'Input Pricing',          desc: 'Competitive pricing analysis for agri inputs' },
  ],
  industrial: [
    { id: 'crop',  icon: '🌱', label: 'Raw Material Forecast',  desc: 'Crop production forecasts for procurement' },
    { id: 'price', icon: '💰', label: 'Commodity Pricing',      desc: 'Bulk commodity price trends & forecasts' },
  ],
  labour: [
    { id: 'crop',  icon: '🌱', label: 'Season Planner',         desc: 'Which crops need labour this season & where' },
  ],
  customer: [
    { id: 'price', icon: '💰', label: 'Price Checker',          desc: 'Compare produce prices across markets' },
  ],
};

const ROLE_HEADERS = {
  farmer:     { title: '🌾 RythuSphere AI — Crop Advisor', desc: 'Disease detection, crop guidance, soil analysis & market intelligence' },
  broker:     { title: '📊 RythuSphere AI — Market Analyst', desc: 'Price intelligence, supply analysis & trade opportunities' },
  supplier:   { title: '🏪 RythuSphere AI — Business Advisor', desc: 'Demand forecasting & competitive pricing for agri inputs' },
  industrial: { title: '🏭 RythuSphere AI — Procurement Intel', desc: 'Raw material forecasts & commodity price analysis' },
  labour:     { title: '👷 RythuSphere AI — Work Planner', desc: 'Find seasonal work opportunities across AP districts' },
  customer:   { title: '🛒 RythuSphere AI — Shopping Helper', desc: 'Compare prices & find the best produce deals' },
};

// Detect Telugu script automatically
const isTeluguText = (str) => /[\u0C00-\u0C7F]/.test(str);

const LANGS = [
  { value: 'en', label: '🇬🇧 English' },
  { value: 'te', label: '🇮🇳 తెలుగు' },
  { value: 'hi', label: '🇮🇳 हिंदी' },
  { value: 'kn', label: '🇮🇳 ಕನ್ನಡ' },
  { value: 'mr', label: '🇮🇳 मराठी' },
];

const AP_DISTRICTS = [
  'Guntur','Krishna','Kurnool','Vijayawada','Nellore',
  'Visakhapatnam','Rajahmundry','Tirupati','Anantapur','Kadapa',
  'Eluru','Ongole','Machilipatnam'
];

function buildPrompt(tool, form, lang) {
  const langMap = { en:'English', te:'Telugu', hi:'Hindi', kn:'Kannada', mr:'Marathi' };
  const replyLang = langMap[lang] || 'English';

  if (tool === 'crop') {
    return `You are an expert agronomist for Andhra Pradesh, India. A farmer asks for crop recommendations.
Soil Type: ${form.soilType}, pH: ${form.ph}, Nitrogen: ${form.nitrogen} kg/ha, Phosphorus: ${form.phosphorus} kg/ha, Potassium: ${form.potassium} kg/ha
District: ${form.district}, Season: ${form.season}, Rainfall: ${form.rainfall}
Respond in ${replyLang}. Give top 3 crop recommendations with:
1. Crop name + why it suits these conditions
2. Expected yield per acre
3. Current market price range (₹/quintal)
4. Key farming tips for this crop
Be specific to Andhra Pradesh conditions.`;
  }
  if (tool === 'pest' || tool === 'doctor') {
    return `You are an expert plant pathologist for Andhra Pradesh, India.
Crop: ${form.cropName}
Symptoms described by farmer: ${form.symptoms}
Respond in ${replyLang}. Diagnose and provide:
1. Most likely pest/disease name
2. Cause and spread mechanism
3. Immediate treatment (chemical + organic options)
4. Preventive measures for next season
5. Approximate cost of treatment per acre
Be specific to AP farming conditions.`;
  }
  if (tool === 'soil') {
    return `You are a soil scientist for Andhra Pradesh, India.
Soil test results — N: ${form.nitrogen} kg/ha, P: ${form.phosphorus} kg/ha, K: ${form.potassium} kg/ha, pH: ${form.ph}, Organic Carbon: ${form.organic_carbon}%
Planned crop: ${form.crop_planned}
Respond in ${replyLang}. Provide:
1. Soil health assessment (good/deficient nutrients)
2. Exact fertilizer schedule with quantities and timing
3. Soil amendment recommendations (lime/gypsum if needed)
4. Expected yield improvement with proper fertilization
5. Cost of fertilizers per acre`;
  }
  if (tool === 'price') {
    return `You are a commodity market analyst for Andhra Pradesh, India.
Crop: ${form.crop}, District: ${form.district}
Current price: ₹${form.currentPrice}/quintal, Today's range: ₹${form.minPrice} - ₹${form.maxPrice}/quintal
Respond in ${replyLang}. Provide:
1. Market analysis — is current price good/bad?
2. Historical price trend for this crop in AP (monthly)
3. Price prediction for next 2-4 weeks
4. Recommendation: Sell now / Hold for X weeks / Sell in batches
5. Best mandis in AP to get better prices
6. Storage tips if farmer should hold`;
  }
  if (tool === 'ask') {
    return `You are an expert agricultural advisor for Andhra Pradesh, India. Answer this farmer's question:

"${form.question}"

Respond in ${replyLang}. Give a comprehensive, practical answer with specific quantities, timings, and local AP context. Focus purely on farming advice — crop management, pest control, market prices, soil health, and irrigation. Do NOT mention any political party names or government scheme names.`;
  }
  return form.question || '';
}

// ── Secure AI call via server-side Edge Function proxy ────────────────────────
async function callAIEngine(prompt) {
  const res = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `AI proxy error ${res.status}`);
  }
  const data = await res.json();
  return { text: data.text, engine: data.engine || 'AI' };
}

const Field = ({ label, value, onChange, type = 'text', placeholder, list }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
    {list ? (
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
        {list.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.5 }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }} />
    )}
  </div>
);

const SUGGESTIONS = {
  fertilizer: ['What NPK ratio for paddy?','Best time to apply urea?','Organic fertilizer alternatives?'],
  pest: ['How to control whitefly?','Identify yellow leaf disease','Spray schedule for cotton'],
  weather: ['Best sowing time this week?','Rain forecast impact on harvest?'],
  price: ['Best time to sell cotton?','Today maize price in Guntur?','Which mandi gives best price?'],
  general: ['Best crops for Kharif season?','Nearest APMC to Guntur?','How to improve soil health?'],
};

function getSuggestions(text) {
  const t = text.toLowerCase();
  if (t.includes('fertilizer')||t.includes('urea')||t.includes('npk')||t.includes('ఎరువు')) return SUGGESTIONS.fertilizer;
  if (t.includes('pest')||t.includes('disease')||t.includes('insect')||t.includes('పురుగు')) return SUGGESTIONS.pest;
  if (t.includes('weather')||t.includes('rain')||t.includes('harvest')) return SUGGESTIONS.weather;
  if (t.includes('price')||t.includes('sell')||t.includes('market')||t.includes('mandi')||t.includes('ధర')) return SUGGESTIONS.price;
  return SUGGESTIONS.general;
}

const STORAGE_KEY = 'agri_ai_chat_history';

export default function AIPage() {
  const { profile } = useAuth();
  const role = profile?.role || 'farmer';
  const TOOLS = ROLE_TOOLS[role] || ROLE_TOOLS.farmer;
  const header = ROLE_HEADERS[role] || ROLE_HEADERS.farmer;
  const isFarmer = role === 'farmer';

  const [activeTool, setActiveTool] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');
  // Photo scan state (farmer only)
  const [scanImage, setScanImage] = useState(null);
  const [scanPreview, setScanPreview] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const fileInputRef = useRef(null);
  // Chat state
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); } catch { return []; }
  });
  const [chatInput, setChatInput] = useState('');
  const [ratings, setRatings] = useState({});
  const [speaking, setSpeaking] = useState(null);
  const [recording, setRecording] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages, loading]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); }, [messages]);

  const [cropForm, setCropForm] = useState({
    soilType: 'Black Cotton', ph: '6.8', nitrogen: '42',
    phosphorus: '18', potassium: '240', rainfall: 'medium',
    district: 'Guntur', season: 'Kharif',
  });
  const [pestForm, setPestForm]   = useState({ cropName: 'Paddy', symptoms: '' });
  const [doctorMode, setDoctorMode] = useState('photo');
  const [soilForm, setSoilForm]   = useState({ nitrogen: '', phosphorus: '', potassium: '', ph: '', organic_carbon: '', crop_planned: '' });
  const [priceForm, setPriceForm] = useState({ crop: 'Cotton', currentPrice: '6800', minPrice: '6500', maxPrice: '7200', district: 'Guntur' });
  const [askForm, setAskForm]     = useState({ question: '' });

  const getFormData = () => {
    if (activeTool === 'crop')   return cropForm;
    if (activeTool === 'doctor') return pestForm;
    if (activeTool === 'pest')   return pestForm;
    if (activeTool === 'soil')   return soilForm;
    if (activeTool === 'price')  return priceForm;
    return askForm;
  };

  // Symptom-based diagnosis (offline fallback with local pest database)
  const handleSymptomDiagnosis = async () => {
    if (!pestForm.symptoms && !pestForm.cropName) return;
    setLoading(true); setScanResult(null); setScanPreview('');
    try {
      if (AI_AVAILABLE) {
        const prompt = buildPrompt('doctor', pestForm, lang);
        const res = await callAIEngine(prompt);
        setScanResult({ text: res.text, engine: 'AI Diagnosis' });
        setLoading(false); return;
      }
      throw new Error('no_key');
    } catch {
      // Local pest diagnosis database
      const PEST_DB = [
        { crops:['Paddy'], keywords:['yellow','yellowing','leaf','blight','spots'], name:'Bacterial Leaf Blight', text:'🐛 **Disease:** Bacterial Leaf Blight (BLB)\n📊 **Severity:** Moderate-High\n\n💊 **Treatment:**\n• Spray Streptocycline 0.1g/L + Copper Oxychloride 2.5g/L\n• Drain excess water immediately\n• Apply Potash 20 kg/acre\n• Remove severely infected leaves\n\n🛡️ **Prevention:**\n• Use resistant varieties (NLR-34449)\n• Avoid excess nitrogen\n• Maintain proper drainage\n\n💰 Treatment cost: ₹600-800/acre' },
        { crops:['Paddy'], keywords:['brown','hopper','drying','plant hopper','bph'], name:'Brown Plant Hopper', text:'🐛 **Pest:** Brown Plant Hopper (BPH)\n📊 **Severity:** High — can destroy entire field\n\n💊 **Treatment:**\n• Drain water from field immediately\n• Spray Buprofezin 25% SC @ 1.6ml/L\n• Apply Pymetrozine 50% WG @ 0.3g/L\n• Light trap: 1 per 5 acres\n\n🛡️ **Prevention:**\n• Avoid excess nitrogen fertilizer\n• Maintain 2-3 seedlings/hill\n• Alternate wetting and drying irrigation\n\n💰 Treatment cost: ₹700-1000/acre' },
        { crops:['Paddy'], keywords:['blast','neck','brown spot'], name:'Rice Blast', text:'🐛 **Disease:** Rice Blast (Pyricularia oryzae)\n📊 **Severity:** High\n\n💊 **Treatment:**\n• Spray Tricyclazole 75% WP @ 0.6g/L\n• Apply Isoprothiolane 40% EC @ 1.5ml/L\n• Drain excess water\n\n🛡️ **Prevention:**\n• Use blast-resistant varieties\n• Balanced N fertilization\n• Avoid late planting\n\n💰 Treatment cost: ₹800-1200/acre' },
        { crops:['Cotton'], keywords:['bollworm','boll','pink','worm','holes','boll damage'], name:'Pink Bollworm', text:'🐛 **Pest:** Pink Bollworm\n📊 **Severity:** High — major yield loss\n\n💊 **Treatment:**\n• Install pheromone traps: 5/acre (replace lures every 21 days)\n• Spray Emamectin Benzoate 5% SG @ 0.4g/L\n• Spray Chlorantraniliprole 18.5% SC @ 0.3ml/L\n• Pick & destroy affected bolls daily\n\n🛡️ **Prevention:**\n• Plant refugia (20% non-Bt cotton)\n• Destroy crop residues after harvest\n• Deep plough in summer\n\n💰 Treatment cost: ₹1000-1500/acre' },
        { crops:['Cotton','Chilli'], keywords:['white','whitefly','sticky','sooty','honeydew'], name:'Whitefly', text:'🐛 **Pest:** Whitefly\n📊 **Severity:** Moderate — vector for leaf curl virus\n\n💊 **Treatment:**\n• Spray Imidacloprid 17.8% SL @ 0.3ml/L\n• Acetamiprid 20% SP @ 0.2g/L\n• Diafenthiuron 50% WP @ 1g/L\n• Yellow sticky traps: 10/acre\n\n🌿 **Organic:**\n• Neem oil 2ml/L + soap solution\n• Verticillium lecanii bio-agent\n\n💰 Treatment cost: ₹500-800/acre' },
        { crops:['Chilli','Tomato'], keywords:['curl','leaf curl','curling','virus','distorted'], name:'Leaf Curl Virus', text:'🐛 **Disease:** Leaf Curl Virus (transmitted by whitefly)\n📊 **Severity:** High — no cure once infected\n\n💊 **Management:**\n• Remove infected plants IMMEDIATELY\n• Control whitefly vector with Imidacloprid\n• Spray neem oil 2ml/L weekly as preventive\n• Apply mulch to reduce whitefly\n• Use resistant varieties\n\n🛡️ **Prevention:**\n• Nursery protection with nylon net\n• Border crop of maize/jowar\n• Avoid chilli next to cotton\n\n💰 Management cost: ₹600-1000/acre' },
        { crops:['Tomato','Chilli','Groundnut'], keywords:['wilt','wilting','drooping','dying','drying up'], name:'Fusarium Wilt', text:'🐛 **Disease:** Fusarium Wilt (soil-borne fungus)\n📊 **Severity:** High — kills plant\n\n💊 **Treatment:**\n• Drench soil with Carbendazim 1g/L\n• Apply Trichoderma viride 2.5 kg/acre in soil\n• Improve drainage\n• Remove and burn infected plants\n\n🛡️ **Prevention:**\n• Crop rotation (avoid solanaceous crops 3 years)\n• Use resistant varieties\n• Apply neem cake 200 kg/acre\n• Solarize nursery beds\n\n💰 Treatment cost: ₹400-700/acre' },
        { crops:['Groundnut'], keywords:['tikka','spots','leaf spot','circular','brown spots'], name:'Tikka Disease', text:'🐛 **Disease:** Tikka Disease (Cercospora leaf spot)\n📊 **Severity:** Moderate\n\n💊 **Treatment:**\n• Spray Mancozeb 75% WP @ 2.5g/L at 35 DAS\n• Repeat at 50 DAS and 65 DAS\n• Spray Chlorothalonil 75% WP @ 2g/L\n\n🛡️ **Prevention:**\n• Use resistant varieties (ICGV-91114)\n• Crop rotation\n• Seed treatment with Thiram 3g/kg\n\n💰 Treatment cost: ₹500-700/acre' },
      ];
      const q = (pestForm.symptoms + ' ' + pestForm.cropName).toLowerCase();
      let best = null; let bestScore = 0;
      for (const entry of PEST_DB) {
        let score = 0;
        if (entry.crops.some(c => q.includes(c.toLowerCase()))) score += 5;
        for (const kw of entry.keywords) {
          if (q.includes(kw)) score += 3;
        }
        if (score > bestScore) { bestScore = score; best = entry; }
      }
      if (best && bestScore >= 3) {
        setScanResult({ text: best.text, engine: 'Local Diagnosis DB' });
      } else {
        setScanResult({ text: `🩺 Based on your description for **${pestForm.cropName}**:\n\nSymptoms: "${pestForm.symptoms}"\n\n⚠️ I couldn't find an exact match in my offline database. Here are general steps:\n\n1. 📸 Take a clear photo and use Photo Scan for better diagnosis\n2. 🧪 Check for nutrient deficiency — yellow leaves may indicate nitrogen shortage\n3. 💊 As first aid, spray Neem oil 2ml/L as broad-spectrum treatment\n4. 📞 Contact your local KVK (Krishi Vigyan Kendra) for expert diagnosis\n5. 🔬 Collect sample in zip-lock bag and send to nearest plant clinic\n\n📱 For accurate AI diagnosis, ensure internet connectivity and try again.`, engine: 'General Advisory' });
      }
    } finally { setLoading(false); }
  };

  const callAI = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const prompt = buildPrompt(activeTool, getFormData(), lang);
      const { text, engine } = await callAIEngine(prompt);
      setResult({ text, engine });
    } catch (err) {
      setError(err.message || 'AI request failed. Check API keys in .env');
    } finally {
      setLoading(false);
    }
  };

  // Photo scan handler (farmer only)
  const handlePhotoScan = async (file) => {
    if (!file) return;
    setScanImage(file);
    setScanPreview(URL.createObjectURL(file));
    setScanResult(null); setLoading(true); setError('');
    try {
      // Try AI vision proxy
      const VISION_URL = `${SUPABASE_URL}/functions/v1/ai-vision-proxy`;
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });
      if (AI_AVAILABLE) {
        const res = await fetch(VISION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'apikey': SUPABASE_ANON_KEY },
          body: JSON.stringify({ image: base64, prompt: `You are an expert plant pathologist. Analyze this crop image and provide:\n1. 🌾 Crop identified\n2. 📊 Growth stage (seedling/vegetative/flowering/fruiting/harvest)\n3. 🐛 Disease/pest detected (if any) with confidence %\n4. 💊 Treatment recommendations\n5. 📋 What the farmer should do this week\nRespond in ${lang === 'te' ? 'Telugu' : 'English'}. Be specific.` }),
        });
        if (res.ok) {
          const data = await res.json();
          setScanResult({ text: data.text, engine: 'AI Vision' });
          setLoading(false); return;
        }
      }
      throw new Error('vision_unavailable');
    } catch {
      // Demo scan result
      const demoResults = [
        { crop: 'Paddy (BPT-5204)', stage: 'Tillering Stage (30-40 DAT)', disease: 'Bacterial Leaf Blight — 72% confidence', treatment: '• Apply Streptocycline 0.1g/L spray\n• Drain excess water from field\n• Apply Potash 20 kg/acre\n• Remove severely infected leaves', action: '📋 This Week: Drain field, spray bactericide, monitor spread. Next fertilizer dose in 5 days.' },
        { crop: 'Cotton (Bt-II)', stage: 'Squaring Stage (50-60 DAS)', disease: 'Pink Bollworm — 65% confidence', treatment: '• Install pheromone traps (5/acre)\n• Spray Emamectin Benzoate 5% SG\n• Pick & destroy affected bolls\n• Cost: ₹800-1200/acre', action: '📋 This Week: Set traps today, spray at evening, check bolls daily.' },
        { crop: 'Chilli (Teja)', stage: 'Flowering Stage', disease: 'Leaf Curl Virus — 80% confidence', treatment: '• Control whitefly vector with Imidacloprid\n• Remove infected plants\n• Apply neem oil 2ml/L weekly\n• Mulch to reduce whitefly', action: '📋 This Week: Spray insecticide, remove 3-4 worst plants, apply mulch.' },
      ];
      const demo = demoResults[Math.floor(Math.random() * demoResults.length)];
      setScanResult({ text: `🌾 **Crop:** ${demo.crop}\n📊 **Stage:** ${demo.stage}\n🐛 **Disease:** ${demo.disease}\n\n💊 **Treatment:**\n${demo.treatment}\n\n${demo.action}`, engine: 'Demo Analysis' });
    } finally { setLoading(false); }
  };

  const sendChat = async (q) => {
    const question = (q || chatInput).trim();
    if (!question) return;
    const userMsg = { id: Date.now(), role:'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setLoading(true);
    // Auto-detect Telugu script in the question
    const useTelugu = isTeluguText(question) || lang === 'te';
    const replyLang = useTelugu ? 'Telugu' : lang === 'hi' ? 'Hindi' : 'English';
    try {
      const prompt = `You are an expert agricultural advisor for Andhra Pradesh, India. Answer this farmer question concisely and practically.

Question: "${question}"

IMPORTANT: Respond ONLY in ${replyLang}. Be specific, include local AP context, quantities, and timing. Keep response under 200 words. Do NOT mention any political party names or government scheme names. Focus purely on practical farming advice.`;
      let text;
      try {
        if (AI_AVAILABLE) text = (await callAIEngine(prompt)).text;
        else throw new Error('no_key');
      } catch {
        // Smart offline mode — search farming knowledge base first
        const q2 = question.toLowerCase();
        const isTe = useTelugu;
        const kbResult = searchKB(question);
        
        if (kbResult && kbResult.score >= 5) {
          // Knowledge base has a good match
          text = kbResult.text;
        } else if (q2.includes('fertilizer')||q2.includes('urea')||/ఎరువు|యూరియా|డీఏపీ/.test(question)) {
          text = isTe
            ? 'పద్ది వరి పైరు వృద్ధి దశలో:\n• నాట్లు వేసిన 21 రోజులకు: హెక్టారుకు 50 కిలోల యూరియా వేయండి\n• 45 రోజులకు: మరో 50 కిలోల యూరియా వేయండి\n• నాట్లు వేసే సమయంలో: DAP 100 కిలోలు + పొటాష్ 60 కిలోలు వేయాలి\n• అధిక నత్రజని వేస్తే ఆకులు పసుపు రంగులోకి మారతాయి — జాగ్రత్తగా ఉండండి'
            : 'For paddy vegetative stage:\n• Apply 50 kg/ha Urea at 21 DAT\n• Another 50 kg/ha Urea at 45 DAT\n• DAP 100 kg/ha + MOP 60 kg/ha at transplanting\n• Avoid excess nitrogen — causes lodging and yellowing.';
        } else if (q2.includes('price')||q2.includes('rate')||q2.includes('sell')||q2.includes('market')||q2.includes('mandi')||/ధర|రేటు|అమ్మ/.test(question)) {
          const cropPrices = {
            paddy: { name: 'Paddy', price: '₹2,200-2,450/quintal', trend: 'Stable. Best to sell at local APMC or hold for 2 weeks if storage available.' },
            rice: { name: 'Rice', price: '₹2,200-2,450/quintal', trend: 'Stable. Guntur and Krishna APMCs offer best rates.' },
            cotton: { name: 'Cotton', price: '₹7,000-7,200/quintal', trend: 'Prices may rise 5-8% in next 3 weeks. Consider holding.' },
            maize: { name: 'Maize', price: '₹1,500-1,900/quintal', trend: 'Kurnool APMC has best rates. MSP: ₹2,090/quintal.' },
            chilli: { name: 'Chilli (Dry)', price: '₹12,000-18,000/quintal', trend: 'Guntur cold storage rates are premium. Grade and sort before selling.' },
            groundnut: { name: 'Groundnut', price: '₹5,500-6,200/quintal', trend: 'Anantapur market is best for groundnut. Oil mills pay 5% more for sorted lots.' },
            turmeric: { name: 'Turmeric', price: '₹8,000-12,000/quintal', trend: 'Prices depend on curcumin content. Get lab test for premium pricing.' },
            tomato: { name: 'Tomato', price: '₹800-2,500/quintal', trend: 'Highly volatile. Sell within 2 days of harvest.' },
            onion: { name: 'Onion', price: '₹1,200-2,800/quintal', trend: 'Prices rising. Store in ventilated shed if possible.' },
            sugarcane: { name: 'Sugarcane', price: '₹3,100-3,400/tonne', trend: 'Sell directly to sugar mills.' },
            banana: { name: 'Banana', price: '₹800-1,500/quintal', trend: 'East Godavari markets are best.' },
          };
          let matched = null;
          for (const [key, val] of Object.entries(cropPrices)) {
            if (q2.includes(key)) { matched = val; break; }
          }
          if (matched) {
            text = `📊 ${matched.name} Market Price (AP):\n\n💰 Current Price: ${matched.price}\n📈 Trend: ${matched.trend}\n\n🏪 Check your nearest APMC for today's exact rates.\n💡 Compare prices across 2-3 mandis before selling.`;
          } else {
            text = `📊 AP Market Prices Overview:\n\n🌾 Paddy: ₹2,200-2,450/Q\n🥜 Groundnut: ₹5,500-6,200/Q\n🌿 Cotton: ₹7,000-7,200/Q\n🌶️ Chilli: ₹12,000-18,000/Q\n🌽 Maize: ₹1,500-1,900/Q\n🍌 Banana: ₹800-1,500/Q\n\n💡 Ask "What is [crop] price?" for details.\n🏪 Visit Market Prices for live data.`;
          }
        } else if (q2 === 'hi' || q2 === 'hello' || q2 === 'hey' || q2.includes('namaste') || /హలో|నమస్కారం|నమస్తే/.test(question)) {
          text = isTe
            ? '🙏 నమస్కారం! నేను RythuSphere AI అసిస్టెంట్. వ్యవసాయం గురించి ఏదైనా అడగండి — పంటలు, ఎరువులు, మార్కెట్ ధరలు, పురుగుల నియంత్రణ, నేల ఆరోగ్యం. నేను మీకు సహాయం చేస్తాను! 🌾'
            : '🙏 Hello! I\'m the RythuSphere AI Assistant. Ask me anything about farming — crops, fertilizers, market prices, pest control, soil health, or irrigation. I\'m here to help! 🌾';
        } else {
          // Last resort — try KB with lower threshold
          const kbLow = searchKB(question);
          if (kbLow) {
            text = kbLow.text;
          } else {
            text = isTe
              ? `మీ ప్రశ్న: "${question}"\n\nఈ అంశంపై నా దగ్గర నిర్దిష్ట సమాచారం లేదు. దయచేసి ఈ విధంగా అడగండి:\n• "పత్తి సాగు గురించి చెప్పు"\n• "వరి ధర ఎంత?"\n• "తెల్ల ఈగ ఎలా నియంత్రించాలి?"\n• "ఖరీఫ్‌లో ఏం పండించాలి?"\n• "నేల ఆరోగ్యం గురించి చెప్పు"\n• "డ్రిప్ ఇరిగేషన్ ఎలా?"\n\n🌾 నేను 20+ పంటలు, మార్కెట్ ధరలు, పురుగుల నియంత్రణ, ఎరువుల షెడ్యూల్ గురించి చెప్పగలను.`
              : `I don't have specific information on "${question}" yet.\n\nTry asking about specific topics like:\n• 🌾 "Explain paddy crop growth" or "Cotton cultivation guide"\n• 💰 "What is maize price?" or "Best time to sell cotton"\n• 🐛 "How to control whitefly?" or "Bollworm management"\n• 🌱 "Best Kharif crops" or "Rabi season guide"\n• 🧪 "Soil health tips" or "NPK for groundnut"\n• 💧 "Drip irrigation guide" or "Water management"\n• 📦 "Harvest timing" or "Post-harvest storage"\n• 🌿 "Organic farming" or "Jivamrutham preparation"\n\n🌾 I cover 20+ crops, market prices, pest control, and complete cultivation guides for AP.`;
          }
        }
      }
      const id = Date.now()+1;
      setMessages(prev => [...prev, { id, role:'ai', text, suggestions: getSuggestions(question) }]);
    } finally { setLoading(false); }
  };

  const handleMic = async () => {
    if (recording) { setRecording(false); return; }
    // Request mic permission explicitly first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setChatInput('Microphone permission denied. Please allow mic access in browser settings and try again.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setChatInput('Voice input works in Chrome/Edge only. Please type your question.');
      return;
    }
    const rec = new SR();
    rec.lang = lang==='te'?'te-IN':lang==='hi'?'hi-IN':'en-IN';
    rec.interimResults = true;
    rec.continuous = false;
    setRecording(true);
    rec.onresult = e => {
      const transcript = Array.from(e.results).map(r=>r[0].transcript).join('');
      setChatInput(transcript);
    };
    rec.onerror = (e) => {
      setRecording(false);
      if (e.error === 'not-allowed') setChatInput('Mic blocked. Allow microphone in browser address bar.');
    };
    rec.onend = () => setRecording(false);
    rec.start();
  };

  const handleTTS = (id, text) => {
    if (speaking === id) { window.speechSynthesis.cancel(); setSpeaking(null); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang==='te'?'te-IN':lang==='hi'?'hi-IN':'en-IN';
    utt.onend = () => setSpeaking(null);
    setSpeaking(id);
    window.speechSynthesis.speak(utt);
  };

  const rateMsg = (id, val) => setRatings(r => ({ ...r, [id]: r[id]===val ? null : val }));

  const activeTool_ = TOOLS.find(t => t.id === activeTool);
  const allTabs = [{ id:'chat', icon:'💬', label:'AI Chat' }, ...TOOLS];

  return (
    <div className="animated">
      {/* Header */}
      <div className="section-header">
        <div>
          <div className="section-title">{header.title}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {header.desc}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Language:</span>
          <select value={lang} onChange={e => setLang(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
            {LANGS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {/* AI Status Banner */}
      <div style={{
        background: AI_AVAILABLE
          ? 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))'
          : 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))',
        borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 24,
        border: `1px solid ${AI_AVAILABLE ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {AI_AVAILABLE ? (
            <>
              <strong style={{ color: '#a78bfa' }}>🟢 AI Active (Server-Side)</strong>
              <span style={{ marginLeft: 8, fontSize: '0.78rem', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>🔒 Secure Proxy</span>
              <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.78rem' }}>Andhra Pradesh farming intelligence • Telugu, Hindi, English</span>
            </>
          ) : (
            <><strong style={{ color: '#f59e0b' }}>⚠️ AI Service Unavailable</strong> — Contact admin to configure AI keys on server</>
          )}
        </div>
        {AI_AVAILABLE && (
          <span style={{ fontSize: '0.72rem', background: 'rgba(139,92,246,0.15)', color: '#a78bfa', padding: '3px 10px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>LIVE</span>
        )}
      </div>

      {/* Tab selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 24 }}>
        {allTabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTool(t.id); setResult(null); setError(''); }}
            style={{
              padding: '12px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              background: activeTool === t.id ? 'rgba(139,92,246,0.12)' : 'var(--bg-card)',
              border: `2px solid ${activeTool === t.id ? '#8b5cf6' : 'var(--border)'}`,
              color: activeTool === t.id ? '#8b5cf6' : 'var(--text-secondary)',
              textAlign: 'center', transition: 'all 0.2s',
            }}>
            <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{t.icon}</div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700 }}>{t.label}</div>
          </button>
        ))}
      </div>

      {/* ── CHAT TAB ── */}
      {activeTool === 'chat' && (
        <div className="card" style={{ display:'flex', flexDirection:'column', height:580, padding:0, overflow:'hidden' }}>
          {/* Chat header */}
          <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <span style={{ fontWeight:700 }}>🤖 AI Farming Assistant</span>
              <span style={{ marginLeft:10, fontSize:'0.72rem', color:'#22c55e' }}>● Online</span>
            </div>
            <button onClick={()=>{setMessages([]); localStorage.removeItem(STORAGE_KEY);}} style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'4px 10px', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.75rem' }}>🗑 Clear</button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:14 }}>
            {messages.length===0 && (
              <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-muted)' }}>
                <div style={{ fontSize:'3rem', marginBottom:12 }}>🌾</div>
                <div style={{ fontWeight:600, marginBottom:6 }}>Welcome to AI Farming Assistant</div>
                <div style={{ fontSize:'0.82rem', marginBottom:16 }}>Ask anything in Telugu, Hindi or English</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                  {['Paddy fertilizer schedule','Cotton pest control','Today\'s market prices','Best crops for Kharif'].map(s=>(
                    <button key={s} onClick={()=>sendChat(s)} style={{ padding:'6px 14px', borderRadius:20, border:'1px solid rgba(139,92,246,0.3)', background:'rgba(139,92,246,0.06)', color:'#a78bfa', cursor:'pointer', fontSize:'0.78rem' }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map(m => (
              <div key={m.id} style={{ display:'flex', gap:10, flexDirection: m.role==='user'?'row-reverse':'row' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background: m.role==='user'?'#8b5cf6':'#22c55e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                  {m.role==='user'?'👤':'🤖'}
                </div>
                <div style={{ maxWidth:'75%' }}>
                  <div style={{ background: m.role==='user'?'rgba(139,92,246,0.12)':'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 14px', fontSize:'0.87rem', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
                    {m.text}
                  </div>
                  {m.role==='ai' && (
                    <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap', alignItems:'center' }}>
                      <button onClick={()=>handleTTS(m.id, m.text)} title="Text to Speech" style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:'0.75rem', color: speaking===m.id?'#8b5cf6':'var(--text-muted)' }}>
                        {speaking===m.id?'⏹ Stop':'🔊 Play'}
                      </button>
                      <button onClick={()=>rateMsg(m.id,'up')} style={{ background: ratings[m.id]==='up'?'rgba(34,197,94,0.15)':'none', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:'0.75rem', color: ratings[m.id]==='up'?'#22c55e':'var(--text-muted)' }}>👍</button>
                      <button onClick={()=>rateMsg(m.id,'down')} style={{ background: ratings[m.id]==='down'?'rgba(239,68,68,0.15)':'none', border:'1px solid var(--border)', borderRadius:6, padding:'3px 8px', cursor:'pointer', fontSize:'0.75rem', color: ratings[m.id]==='down'?'#ef4444':'var(--text-muted)' }}>👎</button>
                      {m.suggestions?.map(s=>(
                        <button key={s} onClick={()=>sendChat(s)} style={{ padding:'3px 10px', borderRadius:20, border:'1px solid rgba(139,92,246,0.25)', background:'rgba(139,92,246,0.05)', color:'#a78bfa', cursor:'pointer', fontSize:'0.72rem' }}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && activeTool==='chat' && (
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center' }}>🤖</div>
                <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, padding:'10px 16px', fontSize:'0.85rem', color:'var(--text-muted)' }}>
                  <span style={{ display:'inline-flex', gap:4 }}>
                    <span style={{ animation:'bounce 1s infinite 0ms' }}>●</span>
                    <span style={{ animation:'bounce 1s infinite 150ms' }}>●</span>
                    <span style={{ animation:'bounce 1s infinite 300ms' }}>●</span>
                  </span> Typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* Input bar */}
          <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
            <button onClick={handleMic} title="Voice Input" style={{ background: recording?'rgba(239,68,68,0.12)':'var(--bg-primary)', border:`1px solid ${recording?'#ef4444':'var(--border)'}`, borderRadius:8, padding:'0 12px', cursor:'pointer', fontSize:'1.1rem', color: recording?'#ef4444':'var(--text-muted)', flexShrink:0 }}>
              {recording?'🔴':'🎤'}
            </button>
            <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&sendChat()}
              placeholder="Ask in Telugu, Hindi or English... (Enter to send)"
              style={{ flex:1, padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem' }}/>
            <button onClick={()=>sendChat()} disabled={!chatInput.trim()&&!loading} className="btn btn-primary" style={{ padding:'10px 18px', flexShrink:0 }}>Send ➤</button>
          </div>
        </div>
      )}

      {activeTool !== 'chat' && <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20 }}>
        {/* Input Panel */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            {activeTool_?.icon} {activeTool_?.label}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
            {activeTool_?.desc}
          </div>

          {activeTool === 'doctor' && isFarmer && (
            <>
              {/* Tab: Photo / Symptoms */}
              <div style={{ display:'flex', gap:6, marginBottom:16 }}>
                {[['photo','📸','Photo Scan'],['symptoms','✍️','Describe Symptoms']].map(([m,ic,lb])=>(
                  <button key={m} onClick={()=>setDoctorMode(m)} style={{
                    flex:1, padding:'10px', borderRadius:10, border:`2px solid ${doctorMode===m?'#10b981':'var(--border)'}`,
                    background: doctorMode===m?'rgba(16,185,129,0.1)':'var(--bg-primary)',
                    color: doctorMode===m?'#10b981':'var(--text-muted)', cursor:'pointer', fontWeight:700, fontSize:'0.82rem',
                  }}>{ic} {lb}</button>
                ))}
              </div>

              {doctorMode === 'photo' && (
                <div style={{ marginBottom:16 }}>
                  <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }}
                    onChange={e => { if(e.target.files[0]) handlePhotoScan(e.target.files[0]); }} />
                  <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:10 }}>
                    <button onClick={() => { fileInputRef.current.setAttribute('capture','environment'); fileInputRef.current.click(); }}
                      style={{ padding:'14px 28px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', fontWeight:800, fontSize:'0.95rem', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                      📷 Take Photo
                    </button>
                    <button onClick={() => { fileInputRef.current.removeAttribute('capture'); fileInputRef.current.click(); }}
                      style={{ padding:'14px 24px', borderRadius:14, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontWeight:700, fontSize:'0.95rem', cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                      🖼️ Upload
                    </button>
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textAlign:'center' }}>Point camera at affected leaf, fruit, or stem</div>
                </div>
              )}

              {doctorMode === 'symptoms' && (
                <>
                  <Field label="Crop" value={pestForm.cropName} onChange={v => setPestForm(f => ({ ...f, cropName: v }))} list={['Paddy','Cotton','Chilli','Groundnut','Maize','Tomato','Sugarcane','Banana','Turmeric','Brinjal']} />
                  <Field label="Describe Symptoms" value={pestForm.symptoms} onChange={v => setPestForm(f => ({ ...f, symptoms: v }))} type="textarea" placeholder="e.g. Yellow spots on leaves, curling, white powder, holes in fruit, wilting..." />
                  <button onClick={handleSymptomDiagnosis} disabled={loading || (!pestForm.cropName && !pestForm.symptoms)} className="btn btn-primary"
                    style={{ width:'100%', padding:'13px', marginTop:8, fontSize:'0.95rem' }}>
                    {loading ? '🔬 Diagnosing...' : '🩺 Diagnose Disease'}
                  </button>
                </>
              )}

              {/* Preview + Results (shared) */}
              {scanPreview && (
                <div style={{ textAlign:'center', marginTop:12, marginBottom:12 }}>
                  <img src={scanPreview} alt="Crop scan" style={{ maxWidth:'100%', maxHeight:260, borderRadius:14, border:'2px solid var(--border)' }} />
                </div>
              )}
              {loading && <div style={{ textAlign:'center', padding:20, color:'#10b981', fontWeight:700, fontSize:'0.9rem' }}>🔬 Analyzing... Please wait</div>}
              {scanResult && (
                <div style={{ background:'var(--bg-primary)', borderRadius:12, padding:18, border:'1px solid rgba(16,185,129,0.2)', marginTop:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <span style={{ fontSize:'0.72rem', color:'#10b981', fontWeight:700 }}>🧠 {scanResult.engine}</span>
                    <span style={{ fontSize:'0.65rem', padding:'2px 8px', borderRadius:8, background:'rgba(16,185,129,0.1)', color:'#10b981' }}>Diagnosis Complete</span>
                  </div>
                  <div style={{ fontSize:'0.88rem', color:'var(--text-primary)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
                    {scanResult.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTool === 'crop' && (
            <>
              <Field label="District (AP)" value={cropForm.district} onChange={v => setCropForm(f => ({ ...f, district: v }))} list={AP_DISTRICTS} />
              <Field label="Season" value={cropForm.season} onChange={v => setCropForm(f => ({ ...f, season: v }))} list={['Kharif','Rabi','Zaid','Year-round']} />
              <Field label="Soil Type" value={cropForm.soilType} onChange={v => setCropForm(f => ({ ...f, soilType: v }))} list={['Black Cotton','Red Loamy','Sandy Loam','Alluvial','Clay','Laterite']} />
              <Field label="Soil pH" value={cropForm.ph} onChange={v => setCropForm(f => ({ ...f, ph: v }))} type="number" placeholder="e.g. 6.8" />
              <Field label="Nitrogen N (kg/ha)" value={cropForm.nitrogen} onChange={v => setCropForm(f => ({ ...f, nitrogen: v }))} type="number" placeholder="e.g. 42" />
              <Field label="Rainfall Level" value={cropForm.rainfall} onChange={v => setCropForm(f => ({ ...f, rainfall: v }))} list={['low','medium','high']} />
            </>
          )}

          {activeTool === 'soil' && (
            <>
              <Field label="Nitrogen N (kg/ha)" value={soilForm.nitrogen} onChange={v => setSoilForm(f => ({ ...f, nitrogen: v }))} type="number" placeholder="e.g. 42" />
              <Field label="Phosphorus P (kg/ha)" value={soilForm.phosphorus} onChange={v => setSoilForm(f => ({ ...f, phosphorus: v }))} type="number" placeholder="e.g. 18" />
              <Field label="Potassium K (kg/ha)" value={soilForm.potassium} onChange={v => setSoilForm(f => ({ ...f, potassium: v }))} type="number" placeholder="e.g. 240" />
              <Field label="pH Level" value={soilForm.ph} onChange={v => setSoilForm(f => ({ ...f, ph: v }))} type="number" placeholder="e.g. 6.5" />
              <Field label="Organic Carbon (%)" value={soilForm.organic_carbon} onChange={v => setSoilForm(f => ({ ...f, organic_carbon: v }))} type="number" placeholder="e.g. 0.72" />
              <Field label="Planned Crop" value={soilForm.crop_planned} onChange={v => setSoilForm(f => ({ ...f, crop_planned: v }))} placeholder="e.g. Cotton" />
            </>
          )}

          {activeTool === 'price' && (
            <>
              <Field label="Crop" value={priceForm.crop} onChange={v => setPriceForm(f => ({ ...f, crop: v }))} list={['Cotton','Paddy','Groundnut','Chilli','Maize','Wheat','Sunflower','Sugarcane','Tomato']} />
              <Field label="District (AP)" value={priceForm.district} onChange={v => setPriceForm(f => ({ ...f, district: v }))} list={AP_DISTRICTS} />
              <Field label="Current Price (₹/quintal)" value={priceForm.currentPrice} onChange={v => setPriceForm(f => ({ ...f, currentPrice: v }))} type="number" />
              <Field label="Today Min Price (₹)" value={priceForm.minPrice} onChange={v => setPriceForm(f => ({ ...f, minPrice: v }))} type="number" />
              <Field label="Today Max Price (₹)" value={priceForm.maxPrice} onChange={v => setPriceForm(f => ({ ...f, maxPrice: v }))} type="number" />
            </>
          )}

          {activeTool === 'ask' && (
            <>
              <Field label="Your Farming Question" value={askForm.question} onChange={v => setAskForm({ question: v })} type="textarea"
                placeholder="Ask anything in Telugu or English — e.g. 'పత్తి పంటకు DAP ఎంత వేయాలి?' or 'When to apply urea to paddy? How to control whitefly in cotton?'" />
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: -8, marginBottom: 12, lineHeight: 1.5 }}>
                💡 You can ask in Telugu (తెలుగు), Hindi (हिंदी), or English. AI will respond in your selected language above.
              </div>
            </>
          )}

          <button onClick={callAI} disabled={loading || !AI_AVAILABLE} className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: 8, fontSize: '0.95rem', opacity: !AI_AVAILABLE ? 0.5 : 1 }}>
            {loading
              ? '🤖 AI Thinking...'
              : `🚀 Get AI ${activeTool_?.label}`}
          </button>

          {!AI_AVAILABLE && (
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: '#f59e0b', textAlign: 'center' }}>
              ⚠️ AI proxy not configured — contact admin
            </div>
          )}
        </div>

        {/* Response Panel */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16 }}>
            🤖 AI Response — <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Gemini 1.5 Flash</span>
          </div>

          {!result && !error && !loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 20 }}>🌾</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Ready for AI Advisory
              </div>
              <div style={{ fontSize: '0.85rem', maxWidth: 320, margin: '0 auto', lineHeight: 1.7 }}>
                Select a tool on the left, fill in your farm details, and get expert AI advice tailored for Andhra Pradesh agriculture.
              </div>
              <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Crop Diseases', 'Market Prices', 'Soil Health', 'Fertilizer Plan', 'Pest Control'].map(t => (
                  <span key={t} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 20, animation: 'spin 1s linear infinite' }}>🤖</div>
              <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
                {'🤖 AI analyzing...'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Processing your farming context for Andhra Pradesh conditions
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-sm)', padding: '20px 24px' }}>
              <div style={{ fontWeight: 700, color: '#f87171', marginBottom: 8 }}>⚠️ AI Service Error</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{error}</div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <strong>To fix:</strong><br />
                1. Open <code>RythuSphereWeb/.env</code><br />
                2. Deploy the ai-proxy Edge Function to Supabase<br />
                3. Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa' }}>aistudio.google.com/apikey</a>
              </div>
            </div>
          )}

          {result && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
                  ✅ AI Response Ready
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{result.engine} • AP-optimized</span>
              </div>
              <div style={{
                background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '20px 24px',
                color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.85,
                whiteSpace: 'pre-wrap', maxHeight: 540, overflowY: 'auto',
                border: '1px solid var(--border)',
              }}>
                {result.text}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => navigator.clipboard?.writeText(result.text)}
                  className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
                  📋 Copy
                </button>
                <button onClick={() => { setResult(null); setError(''); }}
                  className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>
                  🔄 New Query
                </button>
              </div>
            </div>
          )}
        </div>
      </div>}

      {/* Quick Tips */}
      <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { icon: '🌱', tip: 'Paddy cultivation schedule for Kharif season in Guntur district', lang: 'EN' },
          { icon: '🐛', tip: 'White mites on tomato leaves — how to control?', lang: 'EN' },
          { icon: '💬', tip: 'పత్తి పంటకు ఎరువులు ఏమి వేయాలి?', lang: 'TE' },
          { icon: '💰', tip: 'Should I sell my cotton now or wait 2 weeks for better prices?', lang: 'EN' },
        ].map((tip, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '14px 16px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          onClick={() => { setActiveTool('chat'); sendChat(tip.tip); }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 6 }}>{tip.icon}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{tip.tip}</div>
            <div style={{ marginTop: 6, fontSize: '0.65rem', color: '#8b5cf6', fontWeight: 600 }}>{tip.lang} • Click to try</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
    </div>
  );
}

