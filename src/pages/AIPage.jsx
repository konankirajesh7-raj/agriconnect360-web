import React, { useState, useRef, useEffect } from 'react';

// ── AI Engine Config ─────────────────────────────────────────────────────────
const GROQ_API_KEY   = import.meta.env.VITE_GROQ_API_KEY   || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const TOOLS = [
  { id: 'crop',  icon: '🌱', label: 'Crop Recommender',      desc: 'Top 3 crops based on soil, climate & market data' },
  { id: 'pest',  icon: '🐛', label: 'Pest & Disease Detector', desc: 'Diagnose pests and diseases from symptoms' },
  { id: 'soil',  icon: '🧪', label: 'Soil Advisor',           desc: 'Fertilizer plan from NPK soil test results' },
  { id: 'price', icon: '💰', label: 'Price Forecaster',       desc: 'Best time to sell based on market data' },
];

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
  if (tool === 'pest') {
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

Respond in ${replyLang}. Give a comprehensive, practical answer with specific quantities, timings, and local AP context. Include government helpline numbers or scheme links if relevant.`;
  }
  return form.question || '';
}

// ── Groq LLaMA-3.3-70B (primary — fastest) ───────────────────────────────────
async function callGroq(prompt) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `Groq API error ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No response generated.';
}

// ── Gemini 1.5 Flash (fallback) ───────────────────────────────────────────
async function callGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || `Gemini API error ${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

// ── Smart router: Groq first, Gemini fallback ──────────────────────────────
async function callAIEngine(prompt) {
  if (GROQ_API_KEY) {
    try { return { text: await callGroq(prompt), engine: 'Groq LLaMA-3.3-70B' }; }
    catch (e) { console.warn('Groq failed, falling back to Gemini:', e.message); }
  }
  if (GEMINI_API_KEY) {
    return { text: await callGemini(prompt), engine: 'Gemini 1.5 Flash' };
  }
  throw new Error('No AI API key configured. Add VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY to .env');
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
  general: ['YSR scheme eligibility?','Nearest APMC to Guntur?','How to get Kisan Credit Card?'],
};

function getSuggestions(text) {
  const t = text.toLowerCase();
  if (t.includes('fertilizer')||t.includes('urea')||t.includes('npk')||t.includes('ఎరువు')) return SUGGESTIONS.fertilizer;
  if (t.includes('pest')||t.includes('disease')||t.includes('insect')||t.includes('పురుగు')) return SUGGESTIONS.pest;
  if (t.includes('weather')||t.includes('rain')||t.includes('harvest')) return SUGGESTIONS.weather;
  return SUGGESTIONS.general;
}

const STORAGE_KEY = 'agri_ai_chat_history';

export default function AIPage() {
  const [activeTool, setActiveTool] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');
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
  const [soilForm, setSoilForm]   = useState({ nitrogen: '', phosphorus: '', potassium: '', ph: '', organic_carbon: '', crop_planned: '' });
  const [priceForm, setPriceForm] = useState({ crop: 'Cotton', currentPrice: '6800', minPrice: '6500', maxPrice: '7200', district: 'Guntur' });
  const [askForm, setAskForm]     = useState({ question: '' });

  const getFormData = () => {
    if (activeTool === 'crop')  return cropForm;
    if (activeTool === 'pest')  return pestForm;
    if (activeTool === 'soil')  return soilForm;
    if (activeTool === 'price') return priceForm;
    return askForm;
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

IMPORTANT: Respond ONLY in ${replyLang}. Be specific, include local AP context, quantities, and timing. Keep response under 200 words.`;
      let text;
      try {
        if (GROQ_API_KEY) text = await callGroq(prompt);
        else if (GEMINI_API_KEY) text = (await callAIEngine(prompt)).text;
        else throw new Error('no_key');
      } catch {
        // Demo mode — smart mock responses
        const q2 = question.toLowerCase();
        const isTe = useTelugu;
        if (q2.includes('fertilizer')||q2.includes('urea')||/ఎరువు|యూరియా|డీఏపీ/.test(question)) {
          text = isTe
            ? 'పద్ది వరి పైరు వృద్ధి దశలో:\n• నాట్లు వేసిన 21 రోజులకు: హెక్టారుకు 50 కిలోల యూరియా వేయండి\n• 45 రోజులకు: మరో 50 కిలోల యూరియా వేయండి\n• నాట్లు వేసే సమయంలో: DAP 100 కిలోలు + పొటాష్ 60 కిలోలు వేయాలి\n• అధిక నత్రజని వేస్తే ఆకులు పసుపు రంగులోకి మారతాయి — జాగ్రత్తగా ఉండండి'
            : 'For paddy vegetative stage: Apply 50 kg/ha Urea at 21 DAT, another 50 kg/ha at 45 DAT. Apply DAP 100 kg/ha at transplanting. Add 60 kg/ha MOP based on soil test.';
        } else if (q2.includes('cotton')||/పత్తి|పత్తికి/.test(question)) {
          text = isTe
            ? 'గుంటూరు జిల్లాలో పత్తి పంటకు:\n• నాట్లు వేసే సమయంలో: హెక్టారుకు 20 కిలోల నత్రజని వేయండి\n• 45-50 రోజులకు (squaring దశలో): మరో 30 కిలోల నత్రజని వేయండి\n• బొల్‌వర్మ్ నియంత్రణకు: Karate 2.5% EC స్ప్రే చేయండి\n• గుంటూరు APMC ధర: ₹7,150/క్వింటాల్ — 3 వారాల్లో 8-12% పెరగవచ్చు'
            : 'For cotton in Guntur: Apply 20 kg N/ha basal, 30 kg N/ha at squaring (45-50 DAS). Use Karate 2.5% EC for bollworm. Guntur APMC: ₹7,150/quintal.';
        } else if (/వారం|ఈ వారం|ఏమి చేయాలి/.test(question)) {
          text = 'పద్ది వరి వృద్ధి దశలో ఈ వారం చేయవలసిన పనులు:\n• పొలంలో నీటి మట్టం 5 సెంటీమీటర్లు నిర్వహించండి\n• ఆకుపచ్చ పురుగుల కోసం పొలాన్ని తనిఖీ చేయండి\n• అవసరమైతే 50 కిలోల యూరియా వేయండి\n• కలుపు మొక్కలు తొలగించండి';
        } else {
          text = isTe
            ? `మీ ప్రశ్నకు సమాధానం: AP రైతులకు సమగ్ర పంట నిర్వహణ పద్ధతులు పాటించమని సూచిస్తున్నాను. గుంటూరులోని KVK (కృషి విజ్ఞాన కేంద్రం)ని సంప్రదించండి. YSR రైతు భరోసా పథకానికి దరఖాస్తు చేసుకోండి. అత్యవసర సందర్భంలో కిసాన్ కాల్ సెంటర్: 1800-180-1551 (ఉచిత helpline) కి కాల్ చేయండి.`
            : `For your question about "${question}": Follow integrated crop management, consult your nearest KVK in Guntur, and apply for YSR Rythu Bharosa scheme. Kisan Call Centre: 1800-180-1551 (free).`;
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
          <div className="section-title">🤖 AI Advisory Center</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {GROQ_API_KEY ? '⚡ Groq LLaMA-3.3-70B' : ''}
            {GROQ_API_KEY && GEMINI_API_KEY ? ' + ' : ''}
            {GEMINI_API_KEY ? '🧠 Gemini 1.5 Flash' : ''}
            {(GROQ_API_KEY || GEMINI_API_KEY) ? ' • AP farming intelligence • 5 languages' : '⚠️ No AI keys configured'}
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
        background: (GROQ_API_KEY || GEMINI_API_KEY)
          ? 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))'
          : 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))',
        borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 24,
        border: `1px solid ${ (GROQ_API_KEY || GEMINI_API_KEY) ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.3)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {(GROQ_API_KEY || GEMINI_API_KEY) ? (
            <>
              <strong style={{ color: '#a78bfa' }}>🟢 Dual AI Active</strong>
              {GROQ_API_KEY && <span style={{ marginLeft: 8, fontSize: '0.78rem', background: 'rgba(139,92,246,0.1)', color: '#a78bfa', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>⚡ Groq LLaMA-3 PRIMARY</span>}
              {GEMINI_API_KEY && <span style={{ marginLeft: 6, fontSize: '0.78rem', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>🧠 Gemini FALLBACK</span>}
              <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: '0.78rem' }}>Andhra Pradesh farming intelligence • Telugu, Hindi, English</span>
            </>
          ) : (
            <><strong style={{ color: '#f59e0b' }}>⚠️ API Keys Missing</strong> — Add <code>VITE_GROQ_API_KEY</code> or <code>VITE_GEMINI_API_KEY</code> to .env</>
          )}
        </div>
        {(GROQ_API_KEY || GEMINI_API_KEY) && (
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
                  {['Paddy fertilizer schedule','Cotton pest control','Market price forecast','Government schemes'].map(s=>(
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

          {activeTool === 'pest' && (
            <>
              <Field label="Crop Name" value={pestForm.cropName} onChange={v => setPestForm(f => ({ ...f, cropName: v }))} list={['Paddy','Wheat','Cotton','Sugarcane','Maize','Tomato','Groundnut','Chilli','Banana','Coconut']} />
              <Field label="Describe Symptoms" value={pestForm.symptoms} onChange={v => setPestForm(f => ({ ...f, symptoms: v }))} type="textarea" placeholder="e.g. Yellow spots on leaves, stem turning black near base, small holes in leaves, white powder on surface..." />
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

          <button onClick={callAI} disabled={loading || (!GROQ_API_KEY && !GEMINI_API_KEY)} className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: 8, fontSize: '0.95rem', opacity: (!GROQ_API_KEY && !GEMINI_API_KEY) ? 0.5 : 1 }}>
            {loading
              ? (GROQ_API_KEY ? '⚡ Groq LLaMA-3 Thinking...' : '🧠 Gemini Thinking...')
              : `🚀 Get AI ${activeTool_?.label}`}
          </button>

          {(!GROQ_API_KEY && !GEMINI_API_KEY) && (
            <div style={{ marginTop: 10, fontSize: '0.75rem', color: '#f59e0b', textAlign: 'center' }}>
              ⚠️ Add VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY to .env to enable AI
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
                {['Crop Diseases', 'Market Prices', 'Soil Health', 'Fertilizer Plan', 'YSR Schemes'].map(t => (
                  <span key={t} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t}</span>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 20, animation: 'spin 1s linear infinite' }}>🤖</div>
              <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>
                {GROQ_API_KEY ? '⚡ Groq LLaMA-3 analyzing...' : '🧠 Gemini AI analyzing...'}
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
                1. Open <code>AgriConnect360Web/.env</code><br />
                2. Set <code>VITE_GEMINI_API_KEY=your_key_here</code><br />
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
          { icon: '🌱', tip: 'Ask about paddy cultivation schedule for Kharif season in Guntur district', lang: 'EN' },
          { icon: '🐛', tip: 'White mites on tomato leaves — describe symptoms in the Pest Detector', lang: 'EN' },
          { icon: '💬', tip: 'పత్తి పంటకు ఎరువులు ఏమి వేయాలి? (Ask in Telugu)', lang: 'TE' },
          { icon: '💰', tip: 'Should I sell my cotton now or wait 2 weeks for better prices?', lang: 'EN' },
        ].map((tip, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '14px 16px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          onClick={() => { setActiveTool('ask'); setAskForm({ question: tip.tip }); setResult(null); }}>
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
