/**
 * Voice Command Engine V2 — Full page interaction + multi-language intent parser
 * Supports: Telugu (te), English (en), Hindi (hi), Kannada (kn), Tamil (ta)
 */

const NAV_COMMANDS = [
  { path: '/dashboard', keywords: { en: ['dashboard','home','main','go home','start'], te: ['డాష్‌బోర్డ్','హోమ్','ముఖ్య పేజీ','ఇంటికి'], hi: ['डैशबोर्ड','होम','मुख्य पेज','घर'] }},
  { path: '/weather', keywords: { en: ['weather','forecast','rain','temperature','climate'], te: ['వాతావరణం','వర్షం','ఉష్ణోగ్రత'], hi: ['मौसम','बारिश','तापमान'] }},
  { path: '/market-prices', keywords: { en: ['market','prices','mandi','rates','crop price'], te: ['మార్కెట్','ధరలు','మండి','రేట్లు','పంట ధర'], hi: ['मंडी','भाव','बाजार','दाम','कीमत'] }},
  { path: '/my-farm', keywords: { en: ['my farm','farm','fields','land','plot'], te: ['నా పొలం','పొలం','భూమి'], hi: ['मेरा खेत','खेत','जमीन'] }},
  { path: '/my-money', keywords: { en: ['money','finance','income','expense','wallet','payment','budget'], te: ['డబ్బు','ఆర్థిక','ఆదాయం','ఖర్చు'], hi: ['पैसा','वित्त','आय','खर्च'] }},
  { path: '/labour', keywords: { en: ['labour','workers','farm workers','hire','jobs','labor'], te: ['కూలీలు','పనివాళ్ళు','కార్మికులు'], hi: ['मजदूर','कामगार','श्रमिक'] }},
  { path: '/transport', keywords: { en: ['transport','truck','vehicle','logistics'], te: ['రవాణా','ట్రక్','వాహనం'], hi: ['परिवहन','ट्रक','गाड़ी'] }},
  { path: '/suppliers', keywords: { en: ['suppliers','shop','store','seeds','fertilizer'], te: ['సరఫరాదారులు','దుకాణం','విత్తనాలు'], hi: ['आपूर्तिकर्ता','दुकान','बीज'] }},
  { path: '/equipment', keywords: { en: ['equipment','tractor','machinery','tools'], te: ['పరికరాలు','ట్రాక్టర్','యంత్రాలు'], hi: ['उपकरण','ट्रैक्टर','मशीनरी'] }},
  { path: '/cold-storage', keywords: { en: ['cold storage','storage','refrigeration','warehouse'], te: ['కోల్డ్ స్టోరేజ్','గోదాం','శీతల గిడ్డంగి'], hi: ['कोल्ड स्टोरेज','गोदाम','भंडारण'] }},
  { path: '/ai', keywords: { en: ['ai','assistant','help','advisory','chatbot','ask'], te: ['ఏఐ','సహాయకుడు','సలహా','అడగు'], hi: ['एआई','सहायक','सलाह','पूछो','मदद'] }},
  { path: '/knowledge', keywords: { en: ['knowledge','learn','education','schemes','guide'], te: ['జ్ఞానం','నేర్చుకో','పథకాలు'], hi: ['ज्ञान','सीखो','योजनाएं'] }},
  { path: '/network', keywords: { en: ['network','community','farmers','connections'], te: ['నెట్‌వర్క్','సమాజం','రైతులు'], hi: ['नेटवर्क','समुदाय','किसान'] }},
  { path: '/marketplace', keywords: { en: ['marketplace','buy','sell','trade','products'], te: ['మార్కెట్‌ప్లేస్','కొను','అమ్ము'], hi: ['मार्केटप्लेस','खरीदो','बेचो'] }},
  { path: '/feed', keywords: { en: ['feed','community feed','posts','social'], te: ['ఫీడ్','పోస్ట్‌లు'], hi: ['फीड','पोस्ट'] }},
  { path: '/disputes', keywords: { en: ['disputes','complaint','support','issue','problem'], te: ['వివాదాలు','ఫిర్యాదు','సమస్య'], hi: ['विवाद','शिकायत','समस्या'] }},
  { path: '/drones', keywords: { en: ['drone','drones','aerial','spray'], te: ['డ్రోన్'], hi: ['ड्रोन'] }},
  { path: '/agri-tourism', keywords: { en: ['agritourism','tourism','farm visit','farm stay'], te: ['వ్యవసాయ పర్యాటకం'], hi: ['कृषि पर्यटन'] }},
  { path: '/villages', keywords: { en: ['villages','village explorer','map','explore'], te: ['గ్రామాలు','మ్యాప్'], hi: ['गांव','मैप'] }},
  { path: '/profile', keywords: { en: ['profile','my profile','account'], te: ['ప్రొఫైల్'], hi: ['प्रोफाइल'] }},
  { path: '/settings', keywords: { en: ['settings','preferences'], te: ['సెట్టింగ్స్'], hi: ['सेटिंग्स'] }},
  { path: '/tasks', keywords: { en: ['tasks','todo','task manager'], te: ['టాస్క్‌లు'], hi: ['कार्य'] }},
  { path: '/admin', keywords: { en: ['admin','admin panel','control panel'], te: ['అడ్మిన్'], hi: ['एडमिन'] }},
];

const ACTION_COMMANDS = [
  { action: 'scroll_down', keywords: { en: ['scroll down','go down','page down','more','next'], te: ['కిందకు','తదుపరి'], hi: ['नीचे','और दिखाओ','अगला'] }},
  { action: 'scroll_up', keywords: { en: ['scroll up','go up','page up','top'], te: ['పైకి','మొదటికి'], hi: ['ऊपर','शुरू में'] }},
  { action: 'go_back', keywords: { en: ['go back','back','previous','return'], te: ['వెనక్కి','మునుపటి'], hi: ['वापस','पीछे'] }},
  { action: 'refresh', keywords: { en: ['refresh','reload','update'], te: ['రిఫ్రెష్'], hi: ['रिफ्रेश'] }},
  { action: 'logout', keywords: { en: ['logout','sign out','log out','exit'], te: ['లాగౌట్','బయటకు'], hi: ['लॉगआउट','बाहर'] }},
  { action: 'stop_listening', keywords: { en: ['stop','stop listening','quiet','silence','bye'], te: ['ఆపు','మూసేయి'], hi: ['बंद करो','रुको'] }},
  { action: 'read_page', keywords: { en: ['read page','read this','what is this','describe','tell me','what do i see'], te: ['చదువు','ఇది ఏమిటి','చెప్పు'], hi: ['पढ़ो','ये क्या है','बताओ'] }},
  { action: 'change_language', keywords: { en: ['change language','switch language','telugu','hindi','english','kannada','tamil'], te: ['భాష మార్చు'], hi: ['भाषा बदलो'] }},
  { action: 'click_button', keywords: { en: ['click','press','tap','select','choose','open'], te: ['క్లిక్','నొక్కు','ఎంచుకో'], hi: ['क्लिक','दबाओ','चुनो'] }},
  { action: 'search', keywords: { en: ['search','find','look for'], te: ['వెతుకు','కనుగొను'], hi: ['खोजो','ढूंढो'] }},
];

// PAGE INTERACTION COMMANDS — understand what each page does and perform actions
const PAGE_ACTION_COMMANDS = [
  // Weather actions
  { action: 'read_weather', keywords: { en: ['current weather','what is the weather','temperature now','how hot','how cold','is it raining','tell weather','weather today'], te: ['ఇప్పుడు వాతావరణం','ఉష్ణోగ్రత ఎంత','వర్షం ఉందా'], hi: ['आज मौसम कैसा','तापमान क्या है','बारिश है क्या'] }},
  // Market price actions
  { action: 'read_prices', keywords: { en: ['what is the price','price of','how much is','rate of','paddy price','rice price','cotton price','tomato price','crop rate'], te: ['ధర ఎంత','పంట ధర','వరి ధర','ప్రస్తుత ధర'], hi: ['कीमत क्या है','भाव बताओ','धान का भाव','चावल की कीमत'] }},
  // Cold storage actions
  { action: 'add_listing', keywords: { en: ['add listing','add my listing','create listing','new listing','list my','register my','add cold storage'], te: ['లిస్టింగ్ జోడించు','నా లిస్టింగ్'], hi: ['लिस्टिंग जोड़ो','मेरी लिस्टिंग'] }},
  { action: 'book_storage', keywords: { en: ['book storage','book cold storage','reserve storage','booking'], te: ['బుక్ చేయి','రిజర్వ్'], hi: ['बुक करो','आरक्षित करो'] }},
  // AgriTourism actions
  { action: 'create_tour', keywords: { en: ['create tour','add tour','new tour listing','list my farm'], te: ['టూర్ జోడించు'], hi: ['टूर बनाओ'] }},
  // Transport actions
  { action: 'book_transport', keywords: { en: ['book transport','book truck','hire vehicle','need transport'], te: ['రవాణా బుక్','ట్రక్ కావాలి'], hi: ['ट्रक बुक','गाड़ी चाहिए'] }},
  // Labour actions
  { action: 'hire_worker', keywords: { en: ['hire worker','need workers','find labour','post job'], te: ['కూలీలు కావాలి','పని కావాలి'], hi: ['मजदूर चाहिए','काम पर रखो'] }},
  // Marketplace actions
  { action: 'sell_product', keywords: { en: ['sell','sell product','list for sale','put for sale','i want to sell'], te: ['అమ్మాలి','అమ్మకానికి పెట్టు'], hi: ['बेचना है','बिक्री के लिए'] }},
  { action: 'buy_product', keywords: { en: ['buy','purchase','i want to buy','order'], te: ['కొనాలి','ఆర్డర్'], hi: ['खरीदना है','ऑर्डर'] }},
  // AI actions
  { action: 'ask_ai', keywords: { en: ['ask ai','ai tell me','ai help','what should i','recommend','suggest','advice'], te: ['ఏఐ చెప్పు','సలహా ఇవ్వు','సిఫారసు'], hi: ['एआई बताओ','सलाह दो','सुझाव'] }},
  // Profile actions
  { action: 'edit_profile', keywords: { en: ['edit profile','update profile','change name','change phone','update my details'], te: ['ప్రొఫైల్ మార్చు'], hi: ['प्रोफाइल बदलो'] }},
  // Read screen data
  { action: 'read_data', keywords: { en: ['read data','show data','what data','how many','total','count','summary','statistics','tell me the numbers'], te: ['డేటా చదువు','మొత్తం','సారాంశం'], hi: ['डेटा पढ़ो','कुल','कितने'] }},
  // Form actions
  { action: 'fill_form', keywords: { en: ['fill','fill form','enter','type','write','put','set value','input'], te: ['నింపు','రాయి','టైప్'], hi: ['भरो','लिखो','टाइप'] }},
  { action: 'submit_form', keywords: { en: ['submit','save','send','confirm','done','finish','complete'], te: ['సమర్పించు','సేవ్','పంపు'], hi: ['जमा करो','सेव','भेजो'] }},
  // Navigation within page
  { action: 'switch_tab', keywords: { en: ['switch to','go to tab','show tab','open tab','tab'], te: ['ట్యాబ్ మార్చు'], hi: ['टैब बदलो'] }},
];

const RESPONSES = {
  navigating: { en: 'Navigating to', te: 'కు వెళ్తున్నాం', hi: 'पर जा रहे हैं' },
  listening: { en: 'Listening...', te: 'వింటున్నాను...', hi: 'सुन रहा हूँ...' },
  didntUnderstand: { en: "Sorry, I didn't understand. Try saying a page name or an action.", te: 'క్షమించండి, అర్థం కాలేదు.', hi: 'माफ़ करें, समझ नहीं आया।' },
  scrollingDown: { en: 'Scrolling down', te: 'కిందకు స్క్రోల్', hi: 'नीचे स्क्रॉल' },
  scrollingUp: { en: 'Scrolling up', te: 'పైకి స్క్రోల్', hi: 'ऊपर स्क्रॉल' },
  goingBack: { en: 'Going back', te: 'వెనక్కి వెళ్తున్నాం', hi: 'वापस जा रहे हैं' },
  refreshing: { en: 'Refreshing page', te: 'పేజీ రిఫ్రెష్', hi: 'पेज रिफ्रेश' },
  stopped: { en: 'Voice assistant stopped', te: 'వాయిస్ అసిస్టెంట్ ఆగింది', hi: 'वॉइस असिस्टेंट बंद' },
  welcome: { en: 'Voice assistant ready.', te: 'వాయిస్ అసిస్టెంట్ సిద్ధం.', hi: 'वॉइस असिस्टेंट तैयार।' },
  languageChanged: { en: 'Language changed', te: 'భాష మార్చబడింది', hi: 'भाषा बदल दी गई' },
  actionDone: { en: 'Done', te: 'పూర్తయింది', hi: 'हो गया' },
  formFilled: { en: 'Form field filled', te: 'ఫారం ఫీల్డ్ నింపబడింది', hi: 'फॉर्म फील्ड भरा गया' },
  submitted: { en: 'Form submitted', te: 'ఫారం సమర్పించబడింది', hi: 'फॉर्म जमा हो गया' },
  readingPage: { en: 'Let me read this page for you', te: 'ఈ పేజీ చదువుతాను', hi: 'यह पेज पढ़ता हूँ' },
  noData: { en: 'No data found on this page', te: 'ఈ పేజీలో డేటా లేదు', hi: 'इस पेज पर डेटा नहीं मिला' },
};

const SPEECH_LANG_MAP = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN' };

const PAGE_LABELS = {
  '/dashboard': { en: 'Dashboard', te: 'డాష్‌బోర్డ్', hi: 'डैशबोर्ड' },
  '/weather': { en: 'Weather', te: 'వాతావరణం', hi: 'मौसम' },
  '/market-prices': { en: 'Market Prices', te: 'మార్కెట్ ధరలు', hi: 'मंडी भाव' },
  '/my-farm': { en: 'My Farm', te: 'నా పొలం', hi: 'मेरा खेत' },
  '/my-money': { en: 'My Money', te: 'నా డబ్బు', hi: 'मेरा पैसा' },
  '/labour': { en: 'Farm Workers', te: 'కూలీలు', hi: 'मजदूर' },
  '/transport': { en: 'Transport', te: 'రవాణా', hi: 'परिवहन' },
  '/suppliers': { en: 'Suppliers', te: 'సరఫరాదారులు', hi: 'आपूर्तिकर्ता' },
  '/equipment': { en: 'Equipment', te: 'పరికరాలు', hi: 'उपकरण' },
  '/cold-storage': { en: 'Cold Storage', te: 'కోల్డ్ స్టోరేజ్', hi: 'कोल्ड स्टोरेज' },
  '/ai': { en: 'AI Advisory', te: 'ఏఐ సలహా', hi: 'एआई सलाह' },
  '/knowledge': { en: 'Knowledge', te: 'జ్ఞానం', hi: 'ज्ञान' },
  '/network': { en: 'Network', te: 'నెట్‌వర్క్', hi: 'नेटवर्क' },
  '/marketplace': { en: 'Marketplace', te: 'మార్కెట్‌ప్లేస్', hi: 'मार्केटप्लेस' },
  '/profile': { en: 'Profile', te: 'ప్రొఫైల్', hi: 'प्रोफाइल' },
  '/settings': { en: 'Settings', te: 'సెట్టింగ్స్', hi: 'सेटिंग्स' },
  '/admin': { en: 'Admin Panel', te: 'అడ్మిన్ ప్యానెల్', hi: 'एडमिन पैनल' },
};

// ═══ PAGE CONTEXT READER — reads visible data from current page ═══
export function readPageData() {
  const cards = document.querySelectorAll('.card, .fin-summary-card, .role-metric-card, [class*="card"]');
  const dataPoints = [];
  cards.forEach(card => {
    const text = card.innerText?.trim();
    if (text && text.length > 2 && text.length < 200) dataPoints.push(text.replace(/\n+/g, ' '));
  });
  // Read stat numbers / KPIs
  const statEls = document.querySelectorAll('.metric-value, .stat-value, .fin-card-value, [class*="value"], [class*="count"], h2, h3');
  statEls.forEach(el => {
    const t = el.innerText?.trim();
    if (t && /\d/.test(t) && t.length < 60) dataPoints.push(t);
  });
  return dataPoints.slice(0, 10);
}

// ═══ FORM INTERACTION — find and fill form fields ═══
export function fillFormField(fieldHint, value) {
  const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select');
  const lower = fieldHint.toLowerCase();
  for (const inp of inputs) {
    const label = (inp.getAttribute('placeholder') || inp.getAttribute('aria-label') || inp.getAttribute('name') || inp.previousElementSibling?.innerText || '').toLowerCase();
    if (label.includes(lower) || lower.includes(label.split(' ')[0])) {
      if (inp.tagName === 'SELECT') {
        const opts = [...inp.options];
        const match = opts.find(o => o.text.toLowerCase().includes(value.toLowerCase()));
        if (match) { inp.value = match.value; inp.dispatchEvent(new Event('change', { bubbles: true })); return true; }
      } else {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        if (nativeSetter) { nativeSetter.call(inp, value); inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true })); }
        else { inp.value = value; inp.dispatchEvent(new Event('input', { bubbles: true })); }
        return true;
      }
    }
  }
  return false;
}

// ═══ SUBMIT FORM — find and click the submit/save button ═══
export function submitCurrentForm() {
  const btns = document.querySelectorAll('button[type="submit"], button');
  for (const btn of btns) {
    const text = btn.innerText?.toLowerCase() || '';
    if (/submit|save|send|confirm|done|create|add|book|pay|next|finish/i.test(text)) {
      btn.click();
      return text;
    }
  }
  // Try form.submit()
  const form = document.querySelector('form');
  if (form) { form.dispatchEvent(new Event('submit', { bubbles: true })); return 'form'; }
  return null;
}

// ═══ PARSE COMMAND V2 ═══
export function parseVoiceCommand(transcript, lang = 'en') {
  const text = transcript.toLowerCase().trim();
  if (!text) return null;

  // 1. Page interaction commands (highest priority — these do real work)
  for (const cmd of PAGE_ACTION_COMMANDS) {
    for (const [, keywords] of Object.entries(cmd.keywords)) {
      for (const kw of keywords) {
        if (text.includes(kw.toLowerCase())) {
          const afterKw = text.split(kw.toLowerCase()).pop().trim();
          return { type: 'page_action', action: cmd.action, context: afterKw, raw: text };
        }
      }
    }
  }

  // 2. Navigation commands
  for (const cmd of NAV_COMMANDS) {
    for (const [, keywords] of Object.entries(cmd.keywords)) {
      for (const kw of keywords) {
        if (text.includes(kw.toLowerCase())) {
          return { type: 'navigate', path: cmd.path, label: PAGE_LABELS[cmd.path]?.[lang] || cmd.path };
        }
      }
    }
  }

  // 3. Action commands
  for (const cmd of ACTION_COMMANDS) {
    for (const [, keywords] of Object.entries(cmd.keywords)) {
      for (const kw of keywords) {
        if (text.includes(kw.toLowerCase())) {
          if (cmd.action === 'click_button') return { type: 'action', action: cmd.action, target: text.split(kw.toLowerCase()).pop().trim() };
          if (cmd.action === 'search') return { type: 'action', action: cmd.action, query: text.split(kw.toLowerCase()).pop().trim() };
          if (cmd.action === 'change_language') {
            let tl = 'en';
            if (/telugu|తెలుగు/.test(text)) tl = 'te';
            else if (/hindi|हिंदी/.test(text)) tl = 'hi';
            else if (/kannada/.test(text)) tl = 'kn';
            else if (/tamil/.test(text)) tl = 'ta';
            return { type: 'action', action: cmd.action, targetLang: tl };
          }
          return { type: 'action', action: cmd.action };
        }
      }
    }
  }

  return null;
}

export function getResponse(key, lang = 'en') { return RESPONSES[key]?.[lang] || RESPONSES[key]?.en || ''; }
export function getSpeechLang(lang) { return SPEECH_LANG_MAP[lang] || 'en-IN'; }
export { NAV_COMMANDS, ACTION_COMMANDS, PAGE_ACTION_COMMANDS, RESPONSES, PAGE_LABELS };
