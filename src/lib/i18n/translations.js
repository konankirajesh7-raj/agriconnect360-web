// ═══════════════════════════════════════════════════════════════════════
// RythuSphere — Tri-lingual Translation System
// Telugu (te) | English (en) | Hindi (hi)
// ═══════════════════════════════════════════════════════════════════════

const T = {
  // ── Navigation / Sidebar ──
  dashboard: { te: 'డాష్‌బోర్డ్', en: 'Dashboard', hi: 'डैशबोर्ड' },
  weather: { te: 'వాతావరణం', en: 'Weather', hi: 'मौसम' },
  farmers: { te: 'రైతులు', en: 'Farmers', hi: 'किसान' },
  fields: { te: 'పొలాలు', en: 'Fields', hi: 'खेत' },
  crops: { te: 'పంటలు', en: 'Crops', hi: 'फसलें' },
  cropTracking: { te: 'పంట ట్రాకింగ్', en: 'Crop Tracking', hi: 'फसल ट्रैकिंग' },
  network: { te: 'నెట్‌వర్క్', en: 'Network', hi: 'नेटवर्क' },
  marketPrices: { te: 'మార్కెట్ ధరలు', en: 'Market Prices', hi: 'बाज़ार भाव' },
  salesProfit: { te: 'అమ్మకాలు & లాభం', en: 'Sales & Profit', hi: 'बिक्री और लाभ' },
  expenses: { te: 'ఖర్చులు', en: 'Expenses', hi: 'खर्चे' },
  wallet: { te: 'వాలెట్', en: 'Wallet', hi: 'वॉलेट' },
  insurance: { te: 'బీమా', en: 'Insurance', hi: 'बीमा' },
  financialServices: { te: 'ఆర్థిక సేవలు', en: 'Financial Services', hi: 'वित्तीय सेवाएं' },
  labourBookings: { te: 'కూలీల బుకింగ్', en: 'Labour Bookings', hi: 'मज़दूर बुकिंग' },
  transport: { te: 'రవాణా', en: 'Transport', hi: 'परिवहन' },
  equipment: { te: 'పరికరాలు', en: 'Equipment', hi: 'उपकरण' },
  marketplace: { te: 'మార్కెట్‌ప్లేస్', en: 'Marketplace', hi: 'बाज़ार' },
  communityFeed: { te: 'సమాజం', en: 'Community Feed', hi: 'समुदाय फ़ीड' },
  aiAdvisory: { te: 'AI సలహా', en: 'AI Advisory', hi: 'AI सलाह' },
  schemes: { te: 'పథకాలు', en: 'Schemes', hi: 'योजनाएं' },
  tutorials: { te: 'ట్యుటోరియల్స్', en: 'Tutorials', hi: 'ट्यूटोरियल' },
  profile: { te: 'ప్రొఫైల్', en: 'Profile', hi: 'प्रोफ़ाइल' },
  settings: { te: 'సెట్టింగ్‌లు', en: 'Settings', hi: 'सेटिंग्स' },
  logout: { te: 'లాగ్‌అవుట్', en: 'Logout', hi: 'लॉगआउट' },
  login: { te: 'లాగిన్', en: 'Login', hi: 'लॉगिन' },
  bugTracker: { te: 'బగ్ ట్రాకర్', en: 'Bug Tracker', hi: 'बग ट्रैकर' },
  villages: { te: 'గ్రామాలు', en: 'Villages', hi: 'गाँव' },
  villageExplorer: { te: 'గ్రామ అన్వేషకం', en: 'Village Explorer', hi: 'गाँव एक्सप्लोरर' },

  // ── Common Actions ──
  search: { te: 'వెతకండి', en: 'Search', hi: 'खोजें' },
  filter: { te: 'ఫిల్టర్', en: 'Filter', hi: 'फ़िल्टर' },
  save: { te: 'సేవ్', en: 'Save', hi: 'सेव' },
  cancel: { te: 'రద్దు', en: 'Cancel', hi: 'रद्द' },
  submit: { te: 'సమర్పించు', en: 'Submit', hi: 'जमा करें' },
  delete: { te: 'తొలగించు', en: 'Delete', hi: 'हटाएं' },
  edit: { te: 'సవరించు', en: 'Edit', hi: 'संपादित करें' },
  add: { te: 'జోడించు', en: 'Add', hi: 'जोड़ें' },
  view: { te: 'చూడండి', en: 'View', hi: 'देखें' },
  close: { te: 'మూసివేయండి', en: 'Close', hi: 'बंद करें' },
  back: { te: 'వెనక్కి', en: 'Back', hi: 'वापस' },
  next: { te: 'తదుపరి', en: 'Next', hi: 'अगला' },
  loading: { te: 'లోడ్ అవుతోంది...', en: 'Loading...', hi: 'लोड हो रहा है...' },
  noData: { te: 'డేటా లేదు', en: 'No Data', hi: 'कोई डेटा नहीं' },
  refresh: { te: 'రిఫ్రెష్', en: 'Refresh', hi: 'रिफ्रेश' },
  download: { te: 'డౌన్‌లోడ్', en: 'Download', hi: 'डाउनलोड' },
  share: { te: 'షేర్', en: 'Share', hi: 'शेयर' },
  all: { te: 'అన్నీ', en: 'All', hi: 'सभी' },
  yes: { te: 'అవును', en: 'Yes', hi: 'हाँ' },
  no: { te: 'కాదు', en: 'No', hi: 'नहीं' },
  ok: { te: 'సరే', en: 'OK', hi: 'ठीक है' },
  
  // ── Location ──
  location: { te: 'స్థానం', en: 'Location', hi: 'स्थान' },
  currentLocation: { te: 'ప్రస్తుత స్థానం', en: 'Current Location', hi: 'वर्तमान स्थान' },
  detectLocation: { te: 'స్థానం గుర్తించు', en: 'Detect Location', hi: 'स्थान पहचानें' },
  gpsTracking: { te: 'GPS ట్రాకింగ్', en: 'GPS Tracking', hi: 'GPS ट्रैकिंग' },
  village: { te: 'గ్రామం', en: 'Village', hi: 'गाँव' },
  mandal: { te: 'మండలం', en: 'Mandal', hi: 'मंडल' },
  district: { te: 'జిల్లా', en: 'District', hi: 'ज़िला' },
  state: { te: 'రాష్ట్రం', en: 'State', hi: 'राज्य' },
  pincode: { te: 'పిన్‌కోడ్', en: 'Pincode', hi: 'पिनकोड' },
  latitude: { te: 'అక్షాంశం', en: 'Latitude', hi: 'अक्षांश' },
  longitude: { te: 'రేఖాంశం', en: 'Longitude', hi: 'देशांतर' },
  locationPermission: { te: 'స్థాన అనుమతి', en: 'Location Permission', hi: 'स्थान अनुमति' },
  locationDenied: { te: 'స్థాన అనుమతి నిరాకరించబడింది', en: 'Location permission denied', hi: 'स्थान अनुमति अस्वीकृत' },
  locating: { te: 'స్థానం కనుగొంటోంది...', en: 'Locating...', hi: 'स्थान खोज रहा है...' },
  
  // ── Village Explorer ──
  selectState: { te: 'రాష్ట్రం ఎంచుకోండి', en: 'Select State', hi: 'राज्य चुनें' },
  selectDistrict: { te: 'జిల్లా ఎంచుకోండి', en: 'Select District', hi: 'ज़िला चुनें' },
  selectMandal: { te: 'మండలం ఎంచుకోండి', en: 'Select Mandal', hi: 'मंडल चुनें' },
  searchVillage: { te: 'గ్రామం వెతకండి...', en: 'Search village...', hi: 'गाँव खोजें...' },
  villageDetails: { te: 'గ్రామ వివరాలు', en: 'Village Details', hi: 'गाँव विवरण' },
  population: { te: 'జనాభా', en: 'Population', hi: 'जनसंख्या' },
  area: { te: 'విస్తీర్ణం', en: 'Area', hi: 'क्षेत्रफल' },
  gramPanchayat: { te: 'గ్రామ పంచాయతీ', en: 'Gram Panchayat', hi: 'ग्राम पंचायत' },
  totalVillages: { te: 'మొత్తం గ్రామాలు', en: 'Total Villages', hi: 'कुल गाँव' },
  totalMandals: { te: 'మొత్తం మండలాలు', en: 'Total Mandals', hi: 'कुल मंडल' },
  totalDistricts: { te: 'మొత్తం జిల్లాలు', en: 'Total Districts', hi: 'कुल ज़िले' },
  
  // ── Dashboard ──
  welcome: { te: 'స్వాగతం', en: 'Welcome', hi: 'स्वागत' },
  totalRevenue: { te: 'మొత్తం ఆదాయం', en: 'Total Revenue', hi: 'कुल राजस्व' },
  activeFarmers: { te: 'క్రియాశీల రైతులు', en: 'Active Farmers', hi: 'सक्रिय किसान' },
  totalCrops: { te: 'మొత్తం పంటలు', en: 'Total Crops', hi: 'कुल फसलें' },
  todayWeather: { te: 'ఈరోజు వాతావరణం', en: "Today's Weather", hi: 'आज का मौसम' },
  overview: { te: 'అవలోకనం', en: 'Overview', hi: 'अवलोकन' },
  notifications: { te: 'నోటిఫికేషన్లు', en: 'Notifications', hi: 'सूचनाएं' },
  
  // ── Auth ──
  phoneNumber: { te: 'ఫోన్ నంబర్', en: 'Phone Number', hi: 'फ़ोन नंबर' },
  enterOTP: { te: 'OTP నమోదు చేయండి', en: 'Enter OTP', hi: 'OTP दर्ज करें' },
  sendOTP: { te: 'OTP పంపండి', en: 'Send OTP', hi: 'OTP भेजें' },
  verifyOTP: { te: 'OTP ధృవీకరించండి', en: 'Verify OTP', hi: 'OTP सत्यापित करें' },
  demoLogin: { te: 'డెమో లాగిన్', en: 'Demo Login', hi: 'डेमो लॉगिन' },
  exploreDemo: { te: 'డెమో అన్వేషించు', en: 'Explore Demo', hi: 'डेमो देखें' },
  rememberMe: { te: 'నన్ను గుర్తుంచుకో', en: 'Remember Me', hi: 'मुझे याद रखें' },
  stayLoggedIn: { te: 'లాగిన్‌లో ఉండండి', en: 'Stay Logged In', hi: 'लॉगिन रहें' },
  
  // ── Farming ──
  kharif: { te: 'ఖరీఫ్', en: 'Kharif', hi: 'ख़रीफ़' },
  rabi: { te: 'రబీ', en: 'Rabi', hi: 'रबी' },
  zaid: { te: 'జైద్', en: 'Zaid', hi: 'ज़ायद' },
  paddy: { te: 'వరి', en: 'Paddy', hi: 'धान' },
  cotton: { te: 'పత్తి', en: 'Cotton', hi: 'कपास' },
  chilli: { te: 'మిరప', en: 'Chilli', hi: 'मिर्च' },
  turmeric: { te: 'పసుపు', en: 'Turmeric', hi: 'हल्दी' },
  groundnut: { te: 'వేరుశెనగ', en: 'Groundnut', hi: 'मूंगफली' },
  sugarcane: { te: 'చెరకు', en: 'Sugarcane', hi: 'गन्ना' },
  tobacco: { te: 'పొగాకు', en: 'Tobacco', hi: 'तंबाकू' },
  banana: { te: 'అరటి', en: 'Banana', hi: 'केला' },
  mango: { te: 'మామిడి', en: 'Mango', hi: 'आम' },
  sowing: { te: 'విత్తనం', en: 'Sowing', hi: 'बुवाई' },
  harvesting: { te: 'కోత', en: 'Harvesting', hi: 'कटाई' },
  irrigation: { te: 'సాగునీరు', en: 'Irrigation', hi: 'सिंचाई' },
  fertilizer: { te: 'ఎరువు', en: 'Fertilizer', hi: 'खाद' },
  pesticide: { te: 'పురుగుమందు', en: 'Pesticide', hi: 'कीटनाशक' },
  soil: { te: 'మట్టి', en: 'Soil', hi: 'मिट्टी' },
  water: { te: 'నీరు', en: 'Water', hi: 'पानी' },
  yield: { te: 'దిగుబడి', en: 'Yield', hi: 'उपज' },
  acre: { te: 'ఎకరం', en: 'Acre', hi: 'एकड़' },
  hectare: { te: 'హెక్టేర్', en: 'Hectare', hi: 'हेक्टेयर' },
  quintal: { te: 'క్వింటాల్', en: 'Quintal', hi: 'क्विंटल' },
  kg: { te: 'కేజీ', en: 'Kg', hi: 'किलो' },
  
  // ── Weather ──
  temperature: { te: 'ఉష్ణోగ్రత', en: 'Temperature', hi: 'तापमान' },
  humidity: { te: 'తేమ', en: 'Humidity', hi: 'नमी' },
  rainfall: { te: 'వర్షపాతం', en: 'Rainfall', hi: 'वर्षा' },
  wind: { te: 'గాలి', en: 'Wind', hi: 'हवा' },
  sunny: { te: 'ఎండ', en: 'Sunny', hi: 'धूप' },
  cloudy: { te: 'మేఘావృతం', en: 'Cloudy', hi: 'बादल' },
  rainy: { te: 'వర్షం', en: 'Rainy', hi: 'बारिश' },
  forecast: { te: 'వాతావరణ సూచన', en: 'Forecast', hi: 'पूर्वानुमान' },
  
  // ── Finance ──
  income: { te: 'ఆదాయం', en: 'Income', hi: 'आय' },
  expense: { te: 'ఖర్చు', en: 'Expense', hi: 'खर्च' },
  profit: { te: 'లాభం', en: 'Profit', hi: 'लाभ' },
  loss: { te: 'నష్టం', en: 'Loss', hi: 'हानि' },
  balance: { te: 'బ్యాలెన్స్', en: 'Balance', hi: 'शेष' },
  loan: { te: 'రుణం', en: 'Loan', hi: 'ऋण' },
  subsidy: { te: 'సబ్సిడీ', en: 'Subsidy', hi: 'सब्सिडी' },
  tax: { te: 'పన్ను', en: 'Tax', hi: 'कर' },
  payment: { te: 'చెల్లింపు', en: 'Payment', hi: 'भुगतान' },
  
  // ── Roles ──
  farmer: { te: 'రైతు', en: 'Farmer', hi: 'किसान' },
  supplier: { te: 'సరఫరాదారు', en: 'Supplier', hi: 'आपूर्तिकर्ता' },
  broker: { te: 'దళారి', en: 'Broker', hi: 'दलाल' },
  industrial: { te: 'పారిశ్రామిక', en: 'Industrial', hi: 'औद्योगिक' },
  labour: { te: 'కూలీ', en: 'Labour', hi: 'मज़दूर' },
  admin: { te: 'అడ్మిన్', en: 'Admin', hi: 'एडमिन' },
  
  // ── Status / Labels ──
  active: { te: 'యాక్టివ్', en: 'Active', hi: 'सक्रिय' },
  inactive: { te: 'ఇన్యాక్టివ్', en: 'Inactive', hi: 'निष्क्रिय' },
  pending: { te: 'పెండింగ్', en: 'Pending', hi: 'लंबित' },
  approved: { te: 'ఆమోదించబడింది', en: 'Approved', hi: 'स्वीकृत' },
  rejected: { te: 'తిరస్కరించబడింది', en: 'Rejected', hi: 'अस्वीकृत' },
  completed: { te: 'పూర్తయింది', en: 'Completed', hi: 'पूर्ण' },
  
  // ── Time ──
  today: { te: 'ఈరోజు', en: 'Today', hi: 'आज' },
  yesterday: { te: 'నిన్న', en: 'Yesterday', hi: 'कल' },
  thisWeek: { te: 'ఈ వారం', en: 'This Week', hi: 'इस सप्ताह' },
  thisMonth: { te: 'ఈ నెల', en: 'This Month', hi: 'इस महीने' },
  
  // ── App ──
  appName: { te: 'అగ్రి కనెక్ట్ 360', en: 'Agri Connect 360', hi: 'एग्री कनेक्ट 360' },
  smartFarming: { te: 'స్మార్ట్ ఫార్మింగ్ ప్లాట్‌ఫారం', en: 'Smart Farming Platform', hi: 'स्मार्ट फार्मिंग प्लेटफॉर्म' },
  andhrapradesh: { te: 'ఆంధ్ర ప్రదేశ్', en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश' },
  getApp: { te: 'యాప్ డౌన్‌లోడ్', en: 'Get App', hi: 'ऐप डाउनलोड' },
  apiDocs: { te: 'API డాక్స్', en: 'API Docs', hi: 'API दस्तावेज़' },
  language: { te: 'భాష', en: 'Language', hi: 'भाषा' },
  telugu: { te: 'తెలుగు', en: 'Telugu', hi: 'तेलुगु' },
  english: { te: 'ఆంగ్లం', en: 'English', hi: 'अंग्रेज़ी' },
  hindi: { te: 'హిందీ', en: 'Hindi', hi: 'हिंदी' },

  // ── Sidebar Section Headers ──
  secOverview: { te: 'అవలోకనం', en: 'Overview', hi: 'अवलोकन' },
  secFarmers: { te: 'రైతులు', en: 'Farmers', hi: 'किसान' },
  secFinance: { te: 'ఆర్థికం', en: 'Finance', hi: 'वित्त' },
  secServices: { te: 'సేవలు', en: 'Services', hi: 'सेवाएं' },
  secKnowledge: { te: 'జ్ఞానం', en: 'Knowledge', hi: 'ज्ञान' },
  secCommunity: { te: 'సమాజం', en: 'Community', hi: 'समुदाय' },
  secTools: { te: 'సాధనాలు', en: 'Tools', hi: 'उपकरण' },
  secLocal: { te: 'స్థానికం', en: 'Local', hi: 'स्थानीय' },
  secTeam: { te: 'బృందం', en: 'Team', hi: 'टीम' },
  secMore: { te: 'మరిన్ని', en: 'More', hi: 'और' },
  secAccount: { te: 'ఖాతా', en: 'Account', hi: 'खाता' },
  secIndustrial: { te: 'పారిశ్రామిక', en: 'Industrial', hi: 'औद्योगिक' },
  secBroker: { te: 'దళారి', en: 'Broker', hi: 'दलाल' },
  secSupplier: { te: 'సరఫరా', en: 'Supplier', hi: 'आपूर्ति' },
  secLabour: { te: 'కూలీ', en: 'Labour', hi: 'श्रमिक' },
  secAdmin: { te: 'నిర్వహణ', en: 'Admin', hi: 'व्यवस्थापन' },

  // ── All Nav Items (sidebar) ──
  soilWater: { te: 'నేల & నీరు', en: 'Soil & Water', hi: 'मिट्टी और पानी' },
  govSchemes: { te: 'ప్రభుత్వ పథకాలు', en: 'Gov Schemes', hi: 'सरकारी योजनाएं' },
  knowledge: { te: 'విజ్ఞానం', en: 'Knowledge', hi: 'ज्ञान' },
  qaForum: { te: 'ప్రశ్న & జవాబు', en: 'Q&A Forum', hi: 'प्रश्नोत्तर' },
  community: { te: 'కమ్యూనిటీ', en: 'Community', hi: 'समुदाय' },
  taskManager: { te: 'టాస్క్ మేనేజర్', en: 'Task Manager', hi: 'कार्य प्रबंधक' },
  coldStorage: { te: 'శీతల గిడ్డంగి', en: 'Cold Storage', hi: 'शीत भंडार' },
  reports: { te: 'నివేదికలు', en: 'Reports', hi: 'रिपोर्ट' },
  disputes: { te: 'వివాదాలు', en: 'Disputes', hi: 'विवाद' },
  droneReports: { te: 'డ్రోన్ నివేదికలు', en: 'Drone Reports', hi: 'ड्रोन रिपोर्ट' },
  expertConnect: { te: 'నిపుణుల సంప్రదింపు', en: 'Expert Connect', hi: 'विशेषज्ञ संपर्क' },
  premium: { te: 'ప్రీమియం', en: 'Premium', hi: 'प्रीमियम' },
  rewards: { te: 'రివార్డ్స్', en: 'Rewards', hi: 'पुरस्कार' },
  iotSensors: { te: 'IoT సెన్సర్లు', en: 'IoT Sensors', hi: 'IoT सेंसर' },
  f2cStore: { te: 'F2C స్టోర్', en: 'F2C Store', hi: 'F2C स्टोर' },
  qualityLab: { te: 'నాణ్యత ల్యాబ్', en: 'Quality Lab', hi: 'गुणवत्ता लैब' },
  agriTourism: { te: 'వ్యవసాయ పర్యాటకం', en: 'AgriTourism', hi: 'कृषि पर्यटन' },
  fpoMode: { te: 'FPO మోడ్', en: 'FPO Mode', hi: 'FPO मोड' },
  myProfile: { te: 'నా ప్రొఫైల్', en: 'My Profile', hi: 'मेरी प्रोफ़ाइल' },
  suppliers: { te: 'సరఫరాదారులు', en: 'Suppliers', hi: 'आपूर्तिकर्ता' },
  totalFarmers: { te: 'మొత్తం రైతులు', en: 'Total Farmers', hi: 'कुल किसान' },
  activeCrops: { te: 'క్రియాశీల పంటలు', en: 'Active Crops', hi: 'सक्रिय फसलें' },
  serviceBookings: { te: 'సేవా బుకింగ్‌లు', en: 'Service Bookings', hi: 'सेवा बुकिंग' },
  platformRevenue: { te: 'ప్లాట్‌ఫారం ఆదాయం', en: 'Platform Revenue', hi: 'प्लेटफ़ॉर्म राजस्व' },
  tipOfDay: { te: 'ఈ రోజు చిట్కా', en: 'Tip of the Day', hi: 'आज का सुझाव' },
  upcomingTasks: { te: 'రాబోయే పనులు', en: 'Upcoming Tasks', hi: 'आगामी कार्य' },
  nextTip: { te: 'తదుపరి చిట్కా', en: 'Next Tip', hi: 'अगला सुझाव' },
  seedsToMarket: { te: 'విత్తనాల నుండి మార్కెట్ వరకు', en: 'Seeds to Market — Your Farming Journey', hi: 'बीज से बाज़ार तक — आपकी कृषि यात्रा' },
  knowYourSoil: { te: 'మీ నేల తెలుసుకోండి', en: 'Know Your Soil', hi: 'अपनी मिट्टी जानें' },
  getInputs: { te: 'ఇన్‌పుట్లు పొందండి', en: 'Get Inputs', hi: 'इनपुट प्राप्त करें' },
  smartAdvisory: { te: 'స్మార్ట్ సలహా', en: 'Smart Advisory', hi: 'स्मार्ट सलाह' },
  cropHealth: { te: 'పంట ఆరోగ్యం', en: 'Crop Health', hi: 'फसल स्वास्थ्य' },
  harvestSell: { te: 'కోత & అమ్మకం', en: 'Harvest & Sell', hi: 'कटाई और बिक्री' },
  finance: { te: 'ఆర్థికం', en: 'Finance', hi: 'वित्त' },
  downloadPDFReports: { te: 'PDF నివేదికలు డౌన్‌లోడ్', en: 'Download PDF Reports', hi: 'PDF रिपोर्ट डाउनलोड' },
  liveFromSupabase: { te: 'Supabase నుండి లైవ్', en: 'Live from Supabase', hi: 'Supabase से लाइव' },
  farmerDashboard: { te: 'రైతు డాష్‌బోర్డ్', en: 'Farmer Dashboard', hi: 'किसान डैशबोर्ड' },
  adminDashboard: { te: 'అడ్మిన్ డాష్‌బోర్డ్', en: 'Admin Dashboard', hi: 'एडमिन डैशबोर्ड' },
  industrialPortal: { te: 'పారిశ్రామిక పోర్టల్', en: 'Industrial Portal', hi: 'औद्योगिक पोर्टल' },
  brokerPortal: { te: 'దళారి పోర్టల్', en: 'Broker Portal', hi: 'दलाल पोर्टल' },
  supplierPortal: { te: 'సరఫరాదారు పోర్టల్', en: 'Supplier Portal', hi: 'आपूर्तिकर्ता पोर्टल' },
  labourPortal: { te: 'కూలీ పోర్టల్', en: 'Labour Portal', hi: 'मज़दूर पोर्टल' },
  fpoDashboard: { te: 'FPO డాష్‌బోర్డ్', en: 'FPO Dashboard', hi: 'FPO डैशबोर्ड' },
  systemOperational: { te: 'వ్యవస్థ పనిచేస్తోంది', en: 'System Operational', hi: 'सिस्टम कार्यरत' },
  modulesActive: { te: 'మాడ్యూల్స్ యాక్టివ్', en: 'modules active', hi: 'मॉड्यूल सक्रिय' },
  bugDashboard: { te: 'బగ్ డాష్‌బోర్డ్', en: 'Bug Dashboard', hi: 'बग डैशबोर्ड' },
  adminFeedMod: { te: 'ఫీడ్ మోడరేషన్', en: 'Feed Moderation', hi: 'फीड मॉडरेशन' },
  orders: { te: 'ఆర్డర్లు', en: 'Orders', hi: 'ऑर्डर' },
  inventory: { te: 'ఇన్వెంటరీ', en: 'Inventory', hi: 'इन्वेंटरी' },
  analytics: { te: 'విశ్లేషణ', en: 'Analytics', hi: 'विश्लेषण' },
  jobBoard: { te: 'ఉద్యోగ బోర్డు', en: 'Job Board', hi: 'जॉब बोर्ड' },
  myJobs: { te: 'నా ఉద్యోగాలు', en: 'My Jobs', hi: 'मेरी नौकरियाँ' },
  earnings: { te: 'సంపాదన', en: 'Earnings', hi: 'कमाई' },
  userMgmt: { te: 'వినియోగదారుల నిర్వహణ', en: 'User Management', hi: 'उपयोगकर्ता प्रबंधन' },
};

// ── English label → translation key map for sidebar ──
const LABEL_KEY_MAP = {
  'Dashboard': 'dashboard', 'Weather': 'weather', 'Farmers': 'farmers', 'Fields': 'fields',
  'Crop Tracking': 'cropTracking', 'Network': 'network', 'Market Prices': 'marketPrices',
  'Sales & Profit': 'salesProfit', 'Expenses': 'expenses', 'Wallet': 'wallet',
  'Insurance': 'insurance', 'Financial Services': 'financialServices',
  'Labour Bookings': 'labourBookings', 'Transport': 'transport', 'Suppliers': 'suppliers',
  'Equipment': 'equipment', 'Soil & Water': 'soilWater', 'Gov Schemes': 'govSchemes',
  'Knowledge': 'knowledge', 'Q&A Forum': 'qaForum', 'Community Feed': 'communityFeed',
  'Community': 'community', 'Marketplace': 'marketplace', 'Notifications': 'notifications',
  'Task Manager': 'taskManager', 'Cold Storage': 'coldStorage', 'Reports': 'reports',
  'Villages': 'villages', 'Bug Tracker': 'bugTracker', 'Disputes': 'disputes',
  'Drone Reports': 'droneReports', 'Expert Connect': 'expertConnect',
  'AI Advisory': 'aiAdvisory', 'Premium': 'premium', 'Rewards': 'rewards',
  'IoT Sensors': 'iotSensors', 'F2C Store': 'f2cStore', 'Quality Lab': 'qualityLab',
  'AgriTourism': 'agriTourism', 'FPO Mode': 'fpoMode', 'My Profile': 'myProfile',
  'Settings': 'settings', 'Profile': 'profile', 'Logout': 'logout',
  'Bug Dashboard': 'bugDashboard', 'Feed Moderation': 'adminFeedMod',
  'Orders': 'orders', 'Inventory': 'inventory', 'Analytics': 'analytics',
  'Job Board': 'jobBoard', 'My Jobs': 'myJobs', 'Earnings': 'earnings',
  'User Management': 'userMgmt',
  // Section headers
  'Overview': 'secOverview', 'Finance': 'secFinance', 'Services': 'secServices',
  'Tools': 'secTools', 'Local': 'secLocal', 'Team': 'secTeam', 'More': 'secMore',
  'Account': 'secAccount', 'Industrial': 'secIndustrial', 'Broker': 'secBroker',
  'Supplier': 'secSupplier', 'Labour': 'secLabour', 'Admin': 'secAdmin',
};

/** Translate an English nav label to the given language */
export function navT(englishLabel, lang = 'te') {
  const key = LABEL_KEY_MAP[englishLabel];
  if (!key || !T[key]) return englishLabel;
  return T[key][lang] || T[key].en || englishLabel;
}

/** Get translation for a key. Returns { te, en, hi } or the key itself */
export function t(key) {
  return T[key] || { te: key, en: key, hi: key };
}

/** Get all three language strings formatted: "తెలుగు | English | हिंदी" */
export function t3(key) {
  const tr = T[key];
  if (!tr) return key;
  return `${tr.te} | ${tr.en} | ${tr.hi}`;
}

/** Get translation for specific language */
export function tl(key, lang = 'te') {
  const tr = T[key];
  if (!tr) return key;
  return tr[lang] || tr.en || key;
}

export default T;
