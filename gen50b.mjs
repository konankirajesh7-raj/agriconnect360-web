import{readFileSync,writeFileSync}from'fs';
let h=readFileSync('./part1.html','utf8');

// CH3: Architecture
h+=`<div class="pg sec"><h2>Chapter 3: Platform Architecture & Technology</h2>
<h3>3.1 System Architecture Overview</h3>
<p>AgriConnect 360 follows a <b>modern JAMstack architecture</b> with a React single-page application (SPA) frontend, Supabase Backend-as-a-Service (BaaS), and Vercel edge deployment. This architecture ensures <b>sub-second page loads</b>, <b>real-time data updates</b>, and <b>zero server management overhead</b>.</p>
<div class="card"><h4>Architecture Flow</h4>
<p><b>User → Vercel CDN → React SPA → Supabase (PostgreSQL + Auth + Realtime) → External APIs (Gemini, Weather, Mandi)</b></p></div>

<h3>3.2 Frontend Stack</h3>
<table><tr><th>Technology</th><th>Version</th><th>Purpose</th><th>Why Chosen</th></tr>
<tr><td>React</td><td>18.2.0</td><td>UI framework</td><td>Component-based, massive ecosystem, easy hiring</td></tr>
<tr><td>Vite</td><td>5.0.11</td><td>Build tool</td><td>10x faster than Webpack, HMR, tree-shaking</td></tr>
<tr><td>React Router DOM</td><td>6.21.3</td><td>Client routing</td><td>SPA navigation, lazy loading, nested routes</td></tr>
<tr><td>Recharts</td><td>2.10.3</td><td>Charts</td><td>Responsive SVG charts, customizable</td></tr>
<tr><td>Zustand</td><td>4.4.7</td><td>State management</td><td>Lightweight (1KB), no boilerplate vs Redux</td></tr>
<tr><td>React Query</td><td>3.39.3</td><td>Server state</td><td>Auto-caching, refetch, optimistic updates</td></tr>
<tr><td>Radix UI</td><td>Latest</td><td>Accessible UI</td><td>WAI-ARIA compliant primitives</td></tr>
<tr><td>Lucide React</td><td>0.309.0</td><td>Icons</td><td>Tree-shakeable, consistent design</td></tr>
<tr><td>date-fns</td><td>3.2.0</td><td>Date handling</td><td>Modular, smaller than Moment.js</td></tr>
<tr><td>Axios</td><td>1.6.5</td><td>HTTP client</td><td>Interceptors, timeout, retry support</td></tr>
</table>

<h3>3.3 Backend Stack</h3>
<table><tr><th>Technology</th><th>Purpose</th><th>Details</th></tr>
<tr><td>Supabase PostgreSQL</td><td>Primary database</td><td>16 tables with Row-Level Security, auto-generated REST API, real-time subscriptions</td></tr>
<tr><td>Supabase Auth</td><td>Authentication</td><td>Email/password + Google OAuth + JWT tokens (1hr expiry)</td></tr>
<tr><td>Supabase Realtime</td><td>Live updates</td><td>WebSocket subscriptions for IoT sensor data, notifications</td></tr>
<tr><td>Supabase Storage</td><td>File storage</td><td>Profile photos, crop images, documents (S3-compatible)</td></tr>
<tr><td>Vercel Serverless</td><td>API functions</td><td>Node.js serverless functions for SMS, payments</td></tr>
<tr><td>Vercel CDN</td><td>Global hosting</td><td>Edge network, auto-SSL, DDoS protection</td></tr>
</table>

<h3>3.4 AI/ML Stack</h3>
<table><tr><th>Model</th><th>Provider</th><th>Purpose</th><th>Latency</th></tr>
<tr><td>Gemini 2.0 Flash</td><td>Google</td><td>AI farm advisory chat — context-aware with farmer data</td><td>2-5 seconds</td></tr>
<tr><td>Gemini Vision</td><td>Google</td><td>Crop disease detection from phone camera photos</td><td>5-10 seconds</td></tr>
<tr><td>LLaMA-3.3-70B</td><td>Groq</td><td>Fast backend inference for yield prediction</td><td>1-3 seconds</td></tr>
</table>

<h3>3.5 File Structure</h3>
<table><tr><th>Directory</th><th>Files</th><th>Purpose</th></tr>
<tr><td>src/pages/</td><td>47 JSX files</td><td>All page components</td></tr>
<tr><td>src/lib/hooks/</td><td>6 files</td><td>Custom React hooks (auth, mobile, voice)</td></tr>
<tr><td>src/lib/services/</td><td>6 files</td><td>Business logic (AI, commerce, gamification)</td></tr>
<tr><td>src/lib/</td><td>10 files</td><td>Utilities (supabase, i18n, security, validation)</td></tr>
<tr><td>public/</td><td>8 files</td><td>PWA manifest, service worker, legal pages</td></tr>
<tr><td>api/</td><td>Serverless</td><td>Vercel API routes for SMS, payments</td></tr>
</table>
</div>`;

// CH4: All 47 Modules Detailed
const modules=[
['Dashboard','/dashboard','21KB','The farmer\'s home screen showing: real-time stats (total crops, active fields, pending tasks), Farming Journey progress bar (6 stages from soil prep to market sale), Tip of the Day powered by AI, Upcoming Tasks with priority colors, and live platform statistics from Supabase (4,782 farmers, 8,934 crops).'],
['Weather','/weather','15KB','7-day weather forecast for farmer\'s exact GPS location using Open-Meteo API. Includes: hourly temperature/humidity charts, UV index with safety advice, rain probability alerts, wind speed for spraying decisions, and farming-specific recommendations ("Good day for pesticide spraying — no rain expected").'],
['Crops','/crops','17KB','Full crop lifecycle manager: Add crops with variety, area, season, and field assignment. Track growth stages (Sowing → Vegetative → Flowering → Harvest). AI-powered yield prediction based on soil, weather, and historical data. Supports Paddy, Cotton, Chilli, Groundnut, Maize, and 20+ AP crops.'],
['Fields','/fields','7KB','Farm field management with GPS coordinates, area calculation, soil type classification (Red, Black, Alluvial, Sandy), and irrigation source tracking. Each field links to crops and soil test results for complete farm mapping.'],
['Soil Testing','/soil','41KB','Comprehensive soil health analysis: NPK levels with ideal range comparison, pH balance scoring, Electrical Conductivity (EC), Organic Carbon percentage, micronutrients (Zinc, Iron, Boron). Includes AI-generated improvement recommendations and historical trend tracking.'],
['Market Prices','/market-prices','25KB','Live APMC mandi prices from data.gov.in API — 1,300+ records daily for Andhra Pradesh. Features: 30-day price trend charts, min/max/modal price comparison, district-wise filtering (Guntur, Kurnool, Anantapur), crop-wise search, and price alert notifications.'],
['AI Advisory','/ai','40KB','Google Gemini 2.0 powered farming assistant. Features: Context-aware chat (knows farmer\'s crops, location, expenses), crop disease detection via camera upload, yield prediction with confidence scores, multilingual responses (Telugu/Hindi/English), conversation history, and safety guardrails.'],
['Expenses','/expenses','21KB','Complete farm budget tracker: Add expenses by category (Seeds, Fertilizers, Labour, Equipment, Transport, Irrigation, Pesticides). Monthly/yearly charts, budget vs actual comparison, CSV export for accountants, and profit margin calculation.'],
['Sales & Profit','/sales','22KB','Income tracking and profitability analysis: Record sales with buyer, quantity, price per unit. Auto-calculate profit/loss per crop, per season, per field. Visual P&L charts, income vs expense comparison, and tax-ready reports.'],
['Wallet','/wallet','15KB','Digital wallet for platform transactions: Add money via UPI/Card simulation, premium subscription (₹499/year), equipment booking payments, invoice generation with GST breakdown, transaction history, and refund processing.'],
['Insurance','/insurance','8KB','PMFBY (Pradhan Mantri Fasal Bima Yojana) crop insurance management: View active policies, file claims with crop damage photos, track claim status, premium calculation based on crop and area, and insurance payout history.'],
['Financial Services','/financial-services','85KB','8-tab comprehensive finance suite: (1) KCC Tracker — loan utilization and repayment, (2) Loan Marketplace — bank offers comparison, (3) Insurance Manager — PMFBY claims, (4) Subsidy Tracker — fertilizer/seed subsidies, (5) Tax Estimator — agricultural income tax, (6) Credit Score — farm data-based scoring, (7) Investment Advisor — FD/RD recommendations, (8) Financial Reports — downloadable PDFs.'],
['Schemes','/schemes','28KB','Government scheme aggregator for AP farmers: PM-KISAN (₹6,000/year), YSR Rythu Bharosa (₹13,500/year), PMFBY insurance, KCC loans, input subsidies. Auto-matching based on farmer profile (land size, crops, caste category). Application status tracking and document checklist.'],
['Community Forum','/community','19KB','Farmer social network: Post questions (❓), tips (💡), and updates (📢) with crop tags. Features: Like/helpful counters, comment threads, WhatsApp sharing, bookmark for later, trending sort, crop/district filtering, and report/moderation system.'],
['Marketplace','/marketplace','20KB','Farmer-to-farmer produce trading: List produce with crop, quantity, price, grade, photos, and WhatsApp contact. Buyer features: Search by crop/district, express interest, direct WhatsApp contact. Seller features: My Listings dashboard, view count, interested buyers, mark as sold, renew listing.'],
['Suppliers','/suppliers','18KB','Agri-input supplier directory: Seed shops, fertilizer dealers, pesticide retailers with product catalogs, pricing, ratings, and direct ordering. Supplier dashboard for order management, inventory tracking, and revenue analytics.'],
['F2C Store','/f2c-store','7KB','Farmer-to-Consumer direct store: Farmers create branded storefronts (e.g., "Rajesh Organic Farm") with product listings, delivery radius, and payment collection. Public URL accessible without login for consumers.'],
['Equipment','/equipment','26KB','Farm equipment rental marketplace: Browse tractors, harvesters, sprayers, pumps with daily rates, availability calendar, and GPS location. Book equipment, track usage hours, and make payments through the platform.'],
['Transport','/transport','21KB','Produce transport booking: Book mini trucks, pickups, lorries for market transport. Features: Route planning, vehicle tracking, weight capacity matching, cold chain vehicle options, and fare estimation.'],
['Labour','/labour','17KB','Farm labour hiring marketplace: Browse available labour groups by specialization (transplanting, harvesting, spraying), daily wage rates, group size, and availability. Book workers, track attendance, and process payments.'],
['Network','/network','13KB','Farmer social connections: Find and connect with nearby farmers, share crop knowledge, form buying groups for bulk input purchases, and coordinate harvest activities.'],
['FPO Management','/fpo','21KB','Farmer Producer Organization tools: Member management, collective buying power, shared equipment scheduling, group marketing of produce, FPO financials, and government scheme applications as organization.'],
];
h+=`<div class="pg sec"><h2>Chapter 4: All 47 Modules — Detailed Description</h2>
<p>AgriConnect 360 contains <b>47 distinct modules</b>. Below is a detailed description of each module, its purpose, features, and technical size.</p>`;
for(let i=0;i<modules.length;i++){
const[n,r,s,d]=modules[i];
h+=`<div class="card"><h4>${i+1}. ${n} <span class="badge">${r}</span> <span style="float:right;font-size:10px;color:#64748b">${s}</span></h4><p>${d}</p></div>`;
if(i===9)h+=`</div><div class="pg sec"><h2>Chapter 4 (continued): Modules 11-47</h2>`;
}
h+=`<h3>Modules 21-47 (Summary)</h3>
<table><tr><th>#</th><th>Module</th><th>Route</th><th>Description</th></tr>
<tr><td>22</td><td>Knowledge Base</td><td>/knowledge</td><td>Agricultural knowledge articles, pest guides, crop calendars</td></tr>
<tr><td>23</td><td>Gamification</td><td>/gamification</td><td>XP points, badges, leaderboard, quests, coins system</td></tr>
<tr><td>24</td><td>Task Manager</td><td>/tasks</td><td>Farm task planner with calendar, reminders, priority</td></tr>
<tr><td>25</td><td>Reports</td><td>/reports</td><td>PDF report generation for finance, crops, analytics</td></tr>
<tr><td>26</td><td>Admin Dashboard</td><td>/admin</td><td>User management, moderation, system health, analytics</td></tr>
<tr><td>27</td><td>Supplier Dashboard</td><td>/supplier-dashboard</td><td>Order management, inventory, customer management</td></tr>
<tr><td>28</td><td>Broker Dashboard</td><td>/broker-dashboard</td><td>Mandi transactions, commission tracking, connections</td></tr>
<tr><td>29</td><td>Industrial Dashboard</td><td>/industrial-dashboard</td><td>Farmer search, bulk procurement, contract farming</td></tr>
<tr><td>30</td><td>Labour Dashboard</td><td>/labour-dashboard</td><td>Booking management, worker dispatch, payments</td></tr>
<tr><td>31</td><td>Profile</td><td>/profile</td><td>Farm health score, crop portfolio, badges, ID card</td></tr>
<tr><td>32</td><td>Settings</td><td>/settings</td><td>Theme, language, privacy, data export, account</td></tr>
<tr><td>33</td><td>Onboarding</td><td>/onboarding</td><td>Multi-step registration wizard for new farmers</td></tr>
<tr><td>34</td><td>Notifications</td><td>/notifications</td><td>In-app notification center with categories</td></tr>
<tr><td>35</td><td>Landing Page</td><td>/</td><td>Public hero page with features, stats, testimonials</td></tr>
<tr><td>36</td><td>Login</td><td>/login</td><td>OTP + Google OAuth + 7 demo role accounts</td></tr>
<tr><td>37</td><td>Contact</td><td>/contact</td><td>Support form with category selection</td></tr>
<tr><td>38</td><td>Premium</td><td>/premium</td><td>Premium features, IoT dashboard, drone booking</td></tr>
<tr><td>39</td><td>IoT Dashboard</td><td>/iot</td><td>IoT sensor monitoring, smart irrigation control</td></tr>
<tr><td>40</td><td>Drone Services</td><td>/drone</td><td>Drone survey booking for crop monitoring</td></tr>
<tr><td>41</td><td>Cold Storage</td><td>/cold-storage</td><td>Cold storage facility booking and tracking</td></tr>
<tr><td>42-47</td><td colspan="3">Quality Lab, Agri Tourism, Disputes, QA, Farmers Directory, Public Pages</td></tr>
</table></div>`;

writeFileSync('./part2.html',h);
console.log('Part 2 done');
