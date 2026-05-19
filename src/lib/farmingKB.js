/**
 * Farming Knowledge Base — Offline AI responses for RythuSphere
 * Covers: crops, pests, soil, prices, irrigation, seeds, harvest, storage, livestock, organic farming
 * All data is AP-specific with real quantities, timings, and local context.
 */

const KB = [
  // ── PADDY / RICE ──
  { keys: ['paddy','rice','వరి','ధాన్యం','paddy growth','paddy crop','explain about paddy','paddy cultivation','paddy stages'], 
    text: `🌾 Paddy Cultivation Guide (AP):\n\n📅 Growth Stages:\n1. Nursery (0-25 days): Sow pre-germinated seeds in wet nursery beds. Use 25 kg seed/acre.\n2. Transplanting (25-30 days): Transplant 2-3 seedlings/hill at 20×15 cm spacing. Maintain 2-3 cm water.\n3. Tillering (30-60 DAT): Apply 1st top dress — 35 kg Urea/acre. Maintain 5 cm water. This is when the plant produces side shoots.\n4. Panicle Initiation (60-75 DAT): Apply 2nd top dress — 25 kg Urea + 15 kg MOP/acre. Critical water stage.\n5. Flowering (75-95 DAT): No fertilizer. Maintain thin water layer. Protect from blast disease.\n6. Grain Filling (95-115 DAT): Drain water gradually. Monitor for BPH (Brown Plant Hopper).\n7. Maturity (115-135 DAT): Drain field 10 days before harvest. Harvest when 80% grains turn golden.\n\n💰 Expected Yield: 25-30 quintals/acre (irrigated)\n📊 Current AP Price: ₹2,200-2,450/quintal\n🏆 Best varieties for AP: BPT-5204, MTU-1010, NLR-34449, RNR-15048` },

  // ── COTTON ──
  { keys: ['cotton','పత్తి','cotton cultivation','cotton farming','bt cotton','cotton crop'],
    text: `🌿 Cotton Farming Guide (AP — Guntur/Kurnool/Prakasam):\n\n📅 Sowing: June-July (Kharif). Spacing: 90×60 cm. Seed rate: 1-1.5 kg/acre (Bt-II hybrid).\n\n🌱 Growth Stages:\n1. Germination (0-15 DAS): Ensure soil moisture. Gap fill at 10 DAS.\n2. Vegetative (15-45 DAS): Apply 20 kg N/acre basal. Intercultivation at 20 & 35 DAS.\n3. Squaring (45-65 DAS): Apply 30 kg N/acre. Install pheromone traps (5/acre).\n4. Flowering (65-90 DAS): Spray micronutrients — MgSO₄ 1% + Boron 0.2%.\n5. Boll Formation (90-120 DAS): Monitor for pink bollworm. Spray Emamectin Benzoate if needed.\n6. Boll Opening (120-150 DAS): First picking when 60% bolls open. Handpick for best grade.\n\n⚠️ Major Pests: Bollworm, Whitefly, Jassids, Aphids\n💰 Expected Yield: 8-12 quintals/acre\n📊 Current Price: ₹7,000-7,200/quintal\n💡 Tip: Grade cotton as FAQ/Good for 5-10% premium at APMC.` },

  // ── CHILLI ──
  { keys: ['chilli','chili','mirchi','మిర్చి','మిరపకాయ','teja','guntur chilli'],
    text: `🌶️ Chilli Cultivation (AP — Guntur Teja/Wonder Hot):\n\n📅 Nursery: June. Transplant: July-August. Spacing: 60×45 cm.\n🌱 Seed Rate: 200g/acre nursery. Transplant at 35-40 days.\n\n🧪 Fertilizer Schedule:\n• Basal: 50 kg DAP + 25 kg MOP + 10 tonnes FYM per acre\n• 30 DAT: 25 kg Urea\n• 60 DAT: 25 kg Urea + 15 kg MOP\n• Foliar: Calcium + Boron spray at flowering\n\n⚠️ Major Issues:\n• Leaf curl virus — control whitefly vector with Imidacloprid\n• Fruit rot — spray Mancozeb 0.25% preventively\n• Thrips — Fipronil 5% SC spray\n\n💰 Yield: 8-12 quintals dry chilli/acre\n📊 Price: ₹12,000-18,000/quintal (Teja variety commands premium)\n💡 Dry to 12% moisture for best storage. Guntur cold storage gives premium rates.` },

  // ── GROUNDNUT ──
  { keys: ['groundnut','peanut','వేరుశెనగ','groundnut cultivation'],
    text: `🥜 Groundnut Farming (AP — Anantapur/Kurnool):\n\n📅 Kharif: June-July | Rabi: November-December\n🌱 Seed Rate: 50-60 kg/acre. Spacing: 30×10 cm.\n\n🧪 Fertilizer: 8 kg N + 16 kg P₂O₅ + 32 kg K₂O per acre basal.\nApply Gypsum 200 kg/acre at pegging stage (40-45 DAS) — critical for pod filling.\n\n📅 Key Stages:\n1. Germination (0-10 DAS): Ensure uniform moisture\n2. Flowering (25-35 DAS): Maintain soil moisture\n3. Pegging (35-50 DAS): Apply gypsum NOW. Don't disturb soil.\n4. Pod development (50-90 DAS): Light irrigation every 7 days\n5. Maturity (90-110 DAS): Leaves turn yellow, test-dig pods\n\n⚠️ Pests: Leaf miner, Tikka disease (spray Mancozeb), Root rot\n💰 Yield: 8-12 quintals/acre\n📊 Price: ₹5,500-6,200/quintal. Oil mills pay 5% premium for sorted lots.` },

  // ── MAIZE ──
  { keys: ['maize','corn','మొక్కజొన్న','maize cultivation','maize price'],
    text: `🌽 Maize Cultivation (AP):\n\n📅 Kharif: June-July | Rabi: October-November\n🌱 Seed Rate: 8-10 kg/acre. Spacing: 60×20 cm.\n\n🧪 Fertilizer:\n• Basal: 50 kg DAP + 25 kg MOP per acre\n• 25 DAS: 50 kg Urea (knee-high stage)\n• 45 DAS: 25 kg Urea (tasseling)\n\n📅 Growth Stages:\n1. V stage (0-30 DAS): Vegetative. Keep weed-free.\n2. Tasseling (50-55 DAS): Critical water stage. Don't skip irrigation.\n3. Silking (55-65 DAS): Pollination period. Stress here = poor filling.\n4. Grain fill (65-90 DAS): Cob development.\n5. Maturity (90-110 DAS): Black layer on kernel = ready to harvest.\n\n💰 Yield: 25-35 quintals/acre\n📊 Price: ₹1,500-1,900/quintal | MSP: ₹2,090\n💡 Kurnool APMC offers best rates. Dry to 14% moisture before selling.` },

  // ── TURMERIC ──
  { keys: ['turmeric','పసుపు','turmeric cultivation','haldi'],
    text: `🟡 Turmeric Cultivation (AP — Kadapa/Guntur):\n\n📅 Planting: June-July. Duration: 8-9 months.\n🌱 Seed Rate: 800-1000 kg rhizomes/acre. Spacing: 45×15 cm.\n\n🧪 Fertilizer:\n• Basal: 10 tonnes FYM + 25 kg N + 30 kg P + 30 kg K per acre\n• 60 DAS: 25 kg N (earthing up)\n• 120 DAS: 25 kg N + 25 kg K\n\n📅 Key Practices:\n• Mulch with green leaves (10 tonnes/acre) immediately after planting\n• Earthing up at 60 and 120 DAS\n• Irrigate every 7-10 days\n• Harvest at 8-9 months when leaves dry\n\n💰 Yield: 80-100 quintals fresh (20-25 quintals dry)/acre\n📊 Price: ₹8,000-12,000/quintal (depends on curcumin content)\n💡 Get curcumin lab test — 4%+ curcumin fetches ₹2,000-3,000 premium per quintal.` },

  // ── TOMATO ──
  { keys: ['tomato','టమాటా','tomato cultivation','tomato price'],
    text: `🍅 Tomato Cultivation (AP):\n\n📅 Planting: Rabi (Oct-Nov) or summer (Jan-Feb). Duration: 4-5 months.\n🌱 Seed Rate: 150-200g/acre nursery. Transplant at 25-30 days. Spacing: 60×45 cm.\n\n🧪 Fertilizer:\n• Basal: 50 kg DAP + 50 kg MOP + 5 tonnes FYM\n• 20 DAT: 25 kg Urea\n• 40 DAT: 25 kg Urea + 15 kg MOP\n• Foliar: Calcium spray at fruit set (prevents blossom end rot)\n\n⚠️ Major Issues:\n• Leaf curl virus — Imidacloprid for whitefly control\n• Early blight — Mancozeb 0.25% spray\n• Fruit borer — Neem oil + Emamectin Benzoate\n\n💰 Yield: 150-200 quintals/acre\n📊 Price: ₹800-2,500/quintal (highly volatile)\n💡 Sell within 2 days of harvest. Madanapalle and Kurnool are best markets in AP. Stagger planting for continuous harvest.` },

  // ── SUGARCANE ──
  { keys: ['sugarcane','చెరుకు','sugarcane cultivation','cane'],
    text: `🌿 Sugarcane Cultivation (AP — East/West Godavari):\n\n📅 Planting: January-March. Duration: 12-14 months.\n🌱 Seed Rate: 25,000-30,000 setts/acre (3-budded). Spacing: 90 cm rows.\n\n🧪 Fertilizer (per acre):\n• Basal: 60 kg N + 32 kg P₂O₅ + 40 kg K₂O + 10 tonnes FYM\n• 45 DAS: 40 kg N\n• 90 DAS: 40 kg N + 20 kg K₂O (earthing up)\n\n📅 Key Practices:\n• Gap filling within 30 days\n• De-trashing at 150 days — removes dry leaves\n• Earthing up at 90-120 DAS\n• Irrigate every 7-10 days. Stop 15 days before harvest.\n\n💰 Yield: 40-50 tonnes/acre\n📊 FRP: ₹315/quintal at 10.25% sugar recovery\n💡 Sell directly to sugar mills. Ratoon crop (2nd year) gives 80% yield with 30% less cost.` },

  // ── BANANA ──
  { keys: ['banana','అరటి','banana cultivation','banana farming'],
    text: `🍌 Banana Cultivation (AP — East Godavari/Krishna):\n\n📅 Planting: June-July or October-November. Duration: 12-14 months.\n🌱 Spacing: 1.8×1.8 m (pit system). 1,200 plants/acre.\n\n🧪 Fertilizer (per plant/year):\n• 200g N + 60g P + 300g K — split into 6 doses\n• Apply 10 kg FYM per pit at planting\n• Foliar: ZnSO₄ 0.5% at 3rd and 5th month\n\n📅 Key Practices:\n• Desuckering: Remove side suckers, keep only 1 follower\n• Propping: Support bunch with bamboo at fruit development\n• Bunch cover with blue polythene for uniform ripening\n• Irrigate every 3-4 days (drip: 8-10 L/plant/day)\n\n⚠️ Diseases: Panama wilt (avoid waterlogging), Sigatoka leaf spot\n💰 Yield: 25-30 tonnes/acre\n📊 Price: ₹800-1,500/quintal` },

  // ── IRRIGATION ──
  { keys: ['irrigation','water','నీరు','నీటిపారుదల','drip','sprinkler','borewell'],
    text: `💧 Irrigation Guide for AP Farmers:\n\n📊 Water Requirements (per acre per season):\n• Paddy: 1,200-1,500 mm (flood irrigation)\n• Cotton: 500-700 mm (furrow/drip)\n• Groundnut: 400-500 mm (sprinkler best)\n• Chilli: 600-800 mm (drip recommended)\n\n🔧 Drip Irrigation Benefits:\n• Saves 40-60% water vs flood irrigation\n• 20-30% higher yields\n• Reduces weed growth\n• Cost: ₹25,000-35,000/acre (subsidy available: 55-90%)\n\n⏰ Best Irrigation Timing:\n• Summer: Early morning (6-8 AM) to reduce evaporation\n• Winter: Morning 9-11 AM\n• Avoid evening irrigation — promotes fungal diseases\n\n💡 Critical Stages (never skip water):\n• Paddy: Flowering\n• Cotton: Squaring + Boll formation\n• Maize: Tasseling + Silking\n• Groundnut: Pegging + Pod filling` },

  // ── ORGANIC FARMING ──
  { keys: ['organic','సేంద్రీయ','organic farming','natural farming','zero budget','jivamrutham'],
    text: `🌿 Organic/Natural Farming Guide (AP ZBNF):\n\n🧪 Key Preparations:\n1. Jeevamrutham (Growth promoter):\n   • 10 kg cow dung + 10 L cow urine + 2 kg jaggery + 2 kg pulse flour + handful of soil\n   • Mix in 200 L water, ferment 48 hrs. Apply through irrigation.\n\n2. Beejamrutham (Seed treatment):\n   • 5 kg cow dung + 5 L cow urine + 50g lime + water\n   • Soak seeds 24 hrs before sowing.\n\n3. Dashaparni Kashayam (Pest control):\n   • 10 types of leaves (neem, custard apple, lantana, etc.) + cow urine\n   • Ferment 30 days. Dilute 1:10 and spray.\n\n📈 Benefits:\n• Zero input cost after 2-3 years\n• Premium price: 20-40% above conventional\n• Soil health improves dramatically\n• Organic certification takes 3 years\n\n💰 Markets: Direct sale via farmer markets, organic stores, or export. Certification from APEDA/NPOP.` },

  // ── SEEDS ──
  { keys: ['seed','seeds','విత్తనాలు','best variety','which variety','seed rate','seed treatment'],
    text: `🌱 Best Crop Varieties for AP (2024-25):\n\n🌾 Paddy: BPT-5204 (Samba Mahsuri), MTU-1010 (Cottondora Sannalu), NLR-34449, RNR-15048\n🌿 Cotton: Bt-II hybrids — Bollgard-II, MRC-7918, JKCH-1050\n🌶️ Chilli: Teja (S-17), Byadgi, Wonder Hot, LCA-334\n🥜 Groundnut: TMV-2, K-6, ICGV-91114, Dharani\n🌽 Maize: DHM-117, Pioneer 30V92, NK-6240\n\n💊 Seed Treatment (before sowing):\n• Fungicide: Thiram/Carbendazim 2g/kg seed\n• Insecticide: Imidacloprid 5g/kg seed\n• Bio-agent: Trichoderma viride 10g/kg seed\n\n💡 Tips:\n• Always buy certified seeds from APSSDC or licensed dealers\n• Check germination: test 100 seeds on wet cloth — need 80%+ germination\n• Treat seeds 24 hrs before sowing for best results\n• Keep receipt for seed replacement claims if germination fails` },

  // ── HARVEST & STORAGE ──
  { keys: ['harvest','storage','కోత','నిల్వ','post harvest','drying','how to store','when to harvest'],
    text: `📦 Harvest & Post-Harvest Guide:\n\n⏰ Harvest Timing:\n• Paddy: When 80% grains turn golden. Moisture: 20-22%.\n• Cotton: When 60% bolls open. Pick in morning (less trash).\n• Groundnut: When leaves turn yellow. Test-dig to check pod maturity.\n• Chilli: Red ripe stage. Dry on tarpaulin, not bare ground.\n\n🌡️ Drying:\n• Paddy: Sun-dry to 14% moisture (3-4 days)\n• Chilli: Dry to 12% moisture (7-10 days)\n• Groundnut: Dry to 8-9% moisture\n• Use moisture meter before selling — APMC deducts for excess moisture\n\n📦 Storage Tips:\n• Store on wooden pallets, not directly on floor\n• Use hermetic bags (PICS/GrainPro) to prevent insect damage\n• Neem leaf layering in gunny bags for natural pest control\n• Temperature: keep below 25°C, humidity below 65%\n\n💰 Price tip: Holding paddy 2-3 months post-harvest usually gives 10-15% price increase.` },

  // ── WHITEFLY ──
  { keys: ['whitefly','white fly','తెల్ల ఈగ','తెల్లదోమ'],
    text: `🦟 Whitefly Control Guide:\n\n🔍 Identification: Tiny white-winged insects on leaf undersides. Leaves turn sticky (honeydew) → sooty mold.\n\n💊 Chemical Control:\n• Imidacloprid 17.8% SL — 0.3 ml/L water\n• Acetamiprid 20% SP — 0.2 g/L water\n• Diafenthiuron 50% WP — 1 g/L water\n• Rotate chemicals every spray to avoid resistance\n\n🌿 Organic Control:\n• Neem oil 2 ml/L + soap solution\n• Yellow sticky traps — 10 per acre\n• Verticillium lecanii bio-agent spray\n\n⏰ Spray Timing: Early morning or late evening. Spray undersides of leaves.\n\n🛡️ Prevention:\n• Avoid excess nitrogen (attracts whitefly)\n• Maintain field hygiene — remove crop residues\n• Border crops: Maize/Jowar rows around main crop\n• Don't plant cotton next to chilli field` },

  // ── BOLLWORM ──
  { keys: ['bollworm','boll worm','పింక్ బొల్వర్మ్','bollworm control'],
    text: `🐛 Bollworm Management (Cotton):\n\n🔍 Types in AP: Pink bollworm (most damaging), American bollworm, Spotted bollworm\n\n🛡️ IPM Strategy:\n1. Pheromone traps: Install 5/acre at squaring stage. Replace lures every 21 days.\n2. Light traps: 1/5 acres to monitor moth activity.\n3. Refugia: Plant 20% non-Bt cotton around Bt field (mandatory).\n4. Spray schedule:\n   • 1st spray (60 DAS): Emamectin Benzoate 5% SG @ 0.4g/L\n   • 2nd spray (75 DAS): Chlorantraniliprole 18.5% SC @ 0.3ml/L\n   • 3rd spray (90 DAS): Profenophos 50% EC @ 2ml/L\n5. Destroy crop residues after harvest — pink bollworm pupates in soil.\n\n💰 Spray cost: ₹800-1,200/acre per application\n💡 Important: Don't use same chemical twice in a row. Rotate mode of action.` },

  // ── KHARIF SEASON ──  
  { keys: ['kharif','kharif season','kharif crops','best crops','which crop','what to grow','ఏం పండించాలి'],
    text: `🌧️ Best Kharif Crops for AP (June-October):\n\n1. 🌾 Paddy — Irrigated areas (Krishna, Godavari delta). Yield: 25-30 Q/acre. Price: ₹2,200+/Q\n2. 🌿 Cotton — Dryland (Guntur, Kurnool, Prakasam). Yield: 8-12 Q/acre. Price: ₹7,000+/Q\n3. 🥜 Groundnut — Sandy loam (Anantapur, Kadapa). Yield: 8-12 Q/acre. Price: ₹5,500+/Q\n4. 🌽 Maize — All districts. Yield: 25-35 Q/acre. Price: ₹1,500-1,900/Q\n5. 🌶️ Chilli — Guntur, Prakasam. Yield: 8-12 Q dry/acre. Price: ₹12,000-18,000/Q\n\n📊 Best Choice Depends On:\n• Irrigation: Paddy (flood), Cotton (rainfed OK)\n• Soil: Black cotton → Cotton/Chilli, Red loam → Groundnut, Alluvial → Paddy\n• Market: Chilli gives highest return but more risk\n• Risk: Maize is safest bet with MSP support\n\n💡 Tip: Intercrop groundnut with red gram for 30% extra income from same field.` },

  // ── RABI SEASON ──
  { keys: ['rabi','rabi season','rabi crops','winter crops'],
    text: `❄️ Best Rabi Crops for AP (November-February):\n\n1. 🌾 Bengal Gram (Chana) — Kurnool, Prakasam. Low water. Yield: 6-8 Q/acre. Price: ₹5,000-5,500/Q\n2. 🌻 Sunflower — Kurnool, Anantapur. Yield: 5-7 Q/acre.\n3. 🌾 Paddy (2nd crop) — Delta areas with canal irrigation.\n4. 🥬 Vegetables — Tomato, Brinjal, Cabbage, Cauliflower.\n5. 🟡 Turmeric — Kadapa, Guntur. Long duration but high returns.\n\n💡 Rabi Tips:\n• Soil moisture conservation is key — mulching saves 30% water\n• Use short-duration varieties (90-100 days)\n• Sow before November 15 for best results\n• Apply Zinc + Boron foliar spray for better yields` },

  // ── LOAN / CREDIT ──
  { keys: ['loan','credit','kcc','kisan credit','రుణం','అప్పు','bank loan','crop loan'],
    text: `🏦 Agricultural Credit & Loans:\n\n💳 Kisan Credit Card (KCC):\n• Crop loan up to ₹3 lakh at 4% interest (with subsidy)\n• Apply at any commercial/cooperative bank\n• Documents: Aadhaar, land records, passport photo\n• Repay within crop season for interest subvention\n\n🏠 Other Agri Loans:\n• Farm mechanization: Tractor, equipment loans at 8-10%\n• Drip/sprinkler: 55-90% subsidy through PMKSY\n• Cold storage: Subsidy under MIDH scheme\n• Solar pump: 90% subsidy under PM-KUSUM\n\n💡 Tips:\n• Always take crop insurance (PMFBY) — premium is just 1.5-2% for Kharif\n• Maintain good repayment record for limit enhancement\n• Kisan Call Centre: 1800-180-1551 (free, 24×7)\n• Visit nearest bank branch with land documents to apply` },

  // ── APMC / MANDI ──
  { keys: ['apmc','mandi','where to sell','selling','ఎక్కడ అమ్మాలి','best mandi','nearest apmc'],
    text: `🏪 APMC & Selling Guide for AP:\n\n📍 Major AP Mandis:\n• Guntur: Cotton, Chilli (India's largest chilli market)\n• Kurnool: Maize, Jowar, Groundnut\n• Anantapur: Groundnut (dedicated market)\n• Vijayawada/Krishna: Paddy, Vegetables\n• Madanapalle: Tomato (India's 2nd largest)\n• Rajahmundry: Coconut, Banana\n\n💰 Tips for Better Prices:\n• Check prices on Agmarknet (agmarknet.gov.in) before going\n• Grade and sort produce — 5-15% premium for FAQ grade\n• Avoid selling on heavy arrival days (Monday/Thursday usually)\n• Form Farmer Producer Group — collective selling = better bargaining\n• Consider direct sale to processors/exporters for chilli, turmeric\n\n📱 Use Market Prices section in RythuSphere for live APMC rates across all AP mandis.` },
];

/**
 * Search the knowledge base for the best matching response.
 * Returns { text, matched } or null if no match.
 */
export function searchKB(question) {
  const q = question.toLowerCase().trim();
  
  // Score each KB entry
  let bestMatch = null;
  let bestScore = 0;
  
  for (const entry of KB) {
    let score = 0;
    for (const key of entry.keys) {
      const k = key.toLowerCase();
      if (q === k) { score += 100; } // exact match
      else if (q.includes(k)) { score += k.length + 10; } // contains keyword, longer = more specific
      else if (k.includes(q)) { score += 5; } // keyword contains query
      // Check individual words
      else {
        const words = k.split(/\s+/);
        for (const w of words) {
          if (w.length > 2 && q.includes(w)) score += w.length;
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  
  return bestScore >= 3 ? { text: bestMatch.text, score: bestScore } : null;
}

export default KB;
