import{readFileSync,writeFileSync}from'fs';
let h=readFileSync('./part2.html','utf8');

h+=`<div class="pg sec"><h2>Chapter 5: 7 User Roles — Complete Breakdown</h2>
<h3>5.1 Role 1: FARMER (Primary — 80% of users)</h3>
<p><b>Profile:</b> Small/marginal farmer, 2-10 acres, age 25-55, budget Android phone (₹5K-15K), 2G/3G internet, Telugu-speaking, limited digital literacy</p>
<table><tr><th>Category</th><th>Modules Accessible (22 total)</th></tr>
<tr><td>Farm Management</td><td>Dashboard, Crops, Fields, Soil Testing, Task Manager</td></tr>
<tr><td>Intelligence</td><td>Weather Forecast, Market Prices, AI Advisory, Knowledge Base</td></tr>
<tr><td>Finance</td><td>Expenses, Sales & Profit, Wallet, Insurance, Financial Services (8-tab), Schemes</td></tr>
<tr><td>Commerce</td><td>Marketplace, Suppliers, F2C Store, Equipment, Transport, Labour</td></tr>
<tr><td>Social</td><td>Community Forum, Network, FPO, Gamification</td></tr>
<tr><td>Account</td><td>Profile, Settings, Notifications, Reports</td></tr></table>
<p><b>User Journey:</b> Register → Complete profile → Add fields → Add crops → Track expenses → Check market prices → Chat with AI → Sell produce → Apply for schemes → Earn XP badges</p>

<h3>5.2 Role 2: SUPPLIER</h3>
<p><b>Profile:</b> Seed, fertilizer, pesticide dealer with physical shop in mandal/district town</p>
<table><tr><th>Feature</th><th>Description</th></tr>
<tr><td>Product Catalog</td><td>List all products with name, brand, price, stock quantity, images</td></tr>
<tr><td>Order Management</td><td>Receive orders from farmers, update status (Pending→Confirmed→Delivered)</td></tr>
<tr><td>Inventory Tracker</td><td>Real-time stock levels, low-stock alerts, reorder notifications</td></tr>
<tr><td>Customer Management</td><td>View farmer profiles, order history, credit tracking</td></tr>
<tr><td>Invoice Generation</td><td>Auto-generate GST invoices for every order</td></tr>
<tr><td>Analytics Dashboard</td><td>Revenue charts, top-selling products, customer demographics</td></tr></table>
<p><b>Revenue:</b> Free listing 3 months → ₹500/month or 3% commission per order</p>

<h3>5.3 Role 3: BROKER</h3>
<p><b>Profile:</b> APMC mandi broker/commission agent handling farmer-buyer transactions</p>
<table><tr><th>Feature</th><th>Description</th></tr>
<tr><td>Transaction Recording</td><td>Record buy/sell with farmer name, crop, qty, price, buyer details</td></tr>
<tr><td>Commission Tracker</td><td>Auto-calculate 2-2.5% commission on each transaction</td></tr>
<tr><td>Farmer Connections</td><td>Directory of all farmers they serve, crop schedules, contact info</td></tr>
<tr><td>Price Data Entry</td><td>Manual price entry when API unavailable for data accuracy</td></tr>
<tr><td>Market Analytics</td><td>Transaction volume trends, seasonal patterns, top crops</td></tr></table>

<h3>5.4 Role 4: INDUSTRIAL</h3>
<p><b>Profile:</b> Cotton mills, rice mills, food processing factories, agri exporters</p>
<table><tr><th>Feature</th><th>Description</th></tr>
<tr><td>Farmer Search</td><td>Search by crop, district, quantity, quality grade — find matching farmers</td></tr>
<tr><td>Bulk Procurement</td><td>Place bulk orders directly with farmers, negotiate prices</td></tr>
<tr><td>Contract Farming</td><td>Create forward contracts with guaranteed prices for farmers</td></tr>
<tr><td>Quality Grading</td><td>Define quality parameters, receive graded produce from farmers</td></tr>
<tr><td>Delivery Tracking</td><td>Track produce transportation from farm to factory</td></tr></table>

<h3>5.5 Role 5: LABOUR ASSOCIATION</h3>
<p><b>Profile:</b> Farm labour groups, contractors (thekedars), worker associations</p>
<table><tr><th>Feature</th><th>Description</th></tr>
<tr><td>Worker Dispatch</td><td>Assign workers to farmer bookings by specialization</td></tr>
<tr><td>Booking Management</td><td>Accept/reject bookings, set availability calendar</td></tr>
<tr><td>Attendance Tracker</td><td>Mark daily attendance, calculate work hours per farmer</td></tr>
<tr><td>Payment Records</td><td>Track daily wages, pending payments, payment history</td></tr>
<tr><td>Rating System</td><td>Receive farmer ratings, build reputation for more bookings</td></tr></table>

<h3>5.6 Role 6: ADMIN</h3>
<p><b>Profile:</b> Platform administrators and moderators</p>
<table><tr><th>Feature</th><th>Description</th></tr>
<tr><td>User Management</td><td>View all users, ban/unban, role assignment, profile editing</td></tr>
<tr><td>Content Moderation</td><td>Review flagged posts, approve/reject community content</td></tr>
<tr><td>System Analytics</td><td>Real-time platform metrics: DAU, MAU, revenue, API health</td></tr>
<tr><td>Data Export</td><td>Export farmer data, transaction records, analytics reports</td></tr></table>

<h3>5.7 Role 7: PUBLIC</h3>
<p><b>Access:</b> Landing Page, Contact Form, Privacy Policy, Terms of Service, Demo Mode (all 7 roles explorable without registration)</p>
</div>`;

// CH6: APIs
h+=`<div class="pg sec"><h2>Chapter 6: API Integrations & Credentials</h2>
<h3>6.1 Active API Keys (7 Services)</h3>
<table><tr><th>Service</th><th>Variable</th><th>Status</th><th>Tier</th><th>Renewal URL</th></tr>
<tr><td>Supabase</td><td>VITE_SUPABASE_URL + ANON_KEY</td><td>✅ Live</td><td>Free (500MB)</td><td>supabase.com/dashboard</td></tr>
<tr><td>Google Gemini</td><td>VITE_GEMINI_API_KEY</td><td>✅ Live</td><td>Free (60 RPM)</td><td>aistudio.google.com/apikey</td></tr>
<tr><td>Groq AI</td><td>VITE_GROQ_API_KEY</td><td>✅ Live</td><td>Free (30 RPM)</td><td>console.groq.com</td></tr>
<tr><td>OpenWeatherMap</td><td>VITE_OPENWEATHER_API_KEY</td><td>✅ Live</td><td>Free (1000/day)</td><td>openweathermap.org/api</td></tr>
<tr><td>Open-Meteo</td><td>VITE_OPEN_METEO_URL</td><td>✅ Live</td><td>Free (no key)</td><td>open-meteo.com</td></tr>
<tr><td>data.gov.in</td><td>VITE_DATA_GOV_API_KEY</td><td>✅ Live</td><td>Free</td><td>data.gov.in</td></tr>
<tr><td>Fast2SMS</td><td>VITE_FAST2SMS_API_KEY</td><td>✅ Live</td><td>Paid</td><td>fast2sms.com</td></tr></table>

<h3>6.2 Pending Production Keys</h3>
<table><tr><th>Service</th><th>Purpose</th><th>Priority</th><th>URL</th></tr>
<tr><td>Razorpay LIVE</td><td>Real payments</td><td>🔴 Critical</td><td>dashboard.razorpay.com</td></tr>
<tr><td>Sentry DSN</td><td>Error monitoring</td><td>🔴 Critical</td><td>sentry.io</td></tr>
<tr><td>Firebase FCM</td><td>Push notifications</td><td>🟡 Important</td><td>console.firebase.google.com</td></tr>
<tr><td>Google Analytics</td><td>User analytics</td><td>🟡 Important</td><td>analytics.google.com</td></tr>
<tr><td>Twilio</td><td>Production SMS</td><td>🟢 Nice-to-have</td><td>twilio.com</td></tr></table>

<h3>6.3 Vercel Environment (15 variables)</h3>
<p>All keys encrypted in Vercel dashboard. Environments: Production, Preview, Development.</p>
</div>`;

// CH7: Database
h+=`<div class="pg sec"><h2>Chapter 7: Database Schema & Security</h2>
<h3>7.1 Supabase Database (16 Tables)</h3>
<table><tr><th>Table</th><th>Columns</th><th>RLS</th><th>Purpose</th></tr>
<tr><td>profiles</td><td>id, name, phone, role, village, district, aadhaar, avatar</td><td>✅</td><td>User profiles</td></tr>
<tr><td>crops</td><td>id, user_id, name, variety, area, season, field_id, stage</td><td>✅</td><td>Crop records</td></tr>
<tr><td>fields</td><td>id, user_id, name, area, soil_type, lat, lng, irrigation</td><td>✅</td><td>Farm fields</td></tr>
<tr><td>expenses</td><td>id, user_id, category, amount, date, vendor, notes</td><td>✅</td><td>Expense tracking</td></tr>
<tr><td>sales</td><td>id, user_id, crop, qty, price, buyer, date</td><td>✅</td><td>Sales records</td></tr>
<tr><td>community_posts</td><td>id, user_id, type, content, tags, likes, comments</td><td>✅</td><td>Forum posts</td></tr>
<tr><td>marketplace_listings</td><td>id, seller_id, crop, qty, price, grade, status, photos</td><td>✅</td><td>Produce listings</td></tr>
<tr><td>notifications</td><td>id, user_id, type, message, read, created_at</td><td>✅</td><td>Notifications</td></tr>
<tr><td>wallet_transactions</td><td>id, user_id, type, amount, status, reference</td><td>✅</td><td>Payments</td></tr>
<tr><td>gamification_scores</td><td>id, user_id, xp, level, badges, streak</td><td>✅</td><td>Gamification</td></tr>
<tr><td>equipment_bookings</td><td>id, user_id, equipment_id, date, hours, status</td><td>✅</td><td>Equipment rental</td></tr>
<tr><td>labour_bookings</td><td>id, user_id, group_id, date, workers, status</td><td>✅</td><td>Labour hiring</td></tr>
<tr><td>iot_devices</td><td>id, user_id, type, field_id, status, last_reading</td><td>✅</td><td>IoT sensors</td></tr>
<tr><td>iot_readings</td><td>id, device_id, moisture, temp, humidity, timestamp</td><td>✅</td><td>Sensor data</td></tr>
<tr><td>fpo_members</td><td>id, fpo_id, user_id, role, joined_at</td><td>✅</td><td>FPO membership</td></tr>
<tr><td>schemes</td><td>id, user_id, scheme_name, status, applied_at</td><td>✅</td><td>Scheme applications</td></tr></table>

<h3>7.2 Security Architecture</h3>
<table><tr><th>Layer</th><th>Protection</th><th>Implementation</th></tr>
<tr><td>HTTP Headers</td><td>HSTS, CSP, X-Frame, XSS</td><td>vercel.json — strict content-security-policy</td></tr>
<tr><td>Database</td><td>Row-Level Security</td><td>All 16 tables have RLS policies — users can only access own data</td></tr>
<tr><td>Authentication</td><td>JWT + OAuth</td><td>Supabase Auth with 1hr token expiry, refresh tokens</td></tr>
<tr><td>Input Validation</td><td>XSS sanitization</td><td>security.js — DOMPurify, regex validation on all inputs</td></tr>
<tr><td>SQL Injection</td><td>Parameterized queries</td><td>Supabase client uses prepared statements</td></tr>
<tr><td>Data Privacy</td><td>Aadhaar masking</td><td>Display format: XXXX XXXX 9012 (last 4 only)</td></tr>
<tr><td>RBAC</td><td>Role-based access</td><td>useAuth.js — role check on every protected route</td></tr></table>
</div>`;

// CH8: Team
h+=`<div class="pg sec"><h2>Chapter 8: 25-Member Real-World Team</h2>
<h3>Team 1: Farmer Outreach (7 Members)</h3>`;
const t1=[
['1','Group Head — Farmer Outreach Lead','Leads entire farmer outreach operations across all villages. Plans visit schedules, coordinates 6 members, conducts main workshop presentations, maintains farmer registration count. Must be: Most confident Telugu speaker, has village/farming background, natural leader, has bike.','5 village visits supervised/week, 100 farmers registered/week, 400 farmers/month'],
['2','Village Workshop Coordinator (Primary)','Main face of AgriConnect in villages. Conducts 45-minute offline workshops teaching farmers to use each app feature step by step. Helps install app on phones. Collects attendance. Follows up with confused farmers.','3 workshops/week, 60 farmers taught/week, 240/month, satisfaction >80%'],
['3','Village Workshop Coordinator (Secondary)','Independently handles separate village workshops to double coverage. Covers different villages than Primary coordinator on same day.','2 workshops/week, 40 farmers/week, 160/month'],
['4','Farmer Registration & Support Executive','Handles all registrations during workshops. Fills profiles completely (name, village, crops, acres). Manages WhatsApp support group. Responds to queries 9AM-6PM daily.','50 farmers profiled/week, WhatsApp response <2hrs, 0 issues older than 24hrs'],
['5','Telugu Content Creator — Video & Social','Creates Telugu how-to videos for each app feature. Records farmer testimonials. Designs Telugu posters in Canva. Daily WhatsApp forward content with prices and weather. Tools: CapCut, Canva, YouTube, Facebook.','2 videos/week, 7 daily WhatsApp messages, 2 poster designs/week'],
['6','Farmer WhatsApp Community Manager','Manages district-wise farmer WhatsApp groups. Sends daily morning message (price + weather + tip). Moderates groups. Organizes polls and feedback. Grows groups by farmer referrals.','3 groups active, 150 farmers in groups, daily message without fail'],
['7','Feedback & Data Analyst','Collects farmer feedback via Google Forms. Compiles weekly analysis (what farmers love/hate). Tracks feature usage patterns. Reports bugs to Founder. Maintains master farmer sheet.','50 feedbacks/week, weekly report submitted Sunday, bug list updated daily'],
];
for(const[n,title,desc,target]of t1){
h+=`<div class="card"><h4>Member ${n}: ${title}</h4><p>${desc}</p><p><b>Targets:</b> ${target}</p></div>`;
}

h+=`<h3>Team 2: Business Partnerships (9 Members)</h3>`;
const t2=[
['8','Group Head — Business Partnerships','Leads all B2B partnership operations. Approves deals above ₹1000/month. Negotiates listing fees with major partners. Reports revenue pipeline weekly. Builds top 5 partner relationships.','5 partnerships/week, ₹10K monthly recurring revenue/month'],
['9','Agri Dealer Executive — Area A','Visits seed/fertilizer/pesticide shops in assigned area. Demos app in 3 minutes. Collects shop details. Follows up next day. Onboards dealers onto platform.','5 shops visited/week, 2 dealers confirmed/week, 8/month'],
['10','Agri Dealer Executive — Area B','Same as Area A but covers different mandal/area to maximize geographic reach. No overlap with Member 9.','5 shops visited/week, 2 dealers confirmed/week, 8/month'],
['11','Equipment Dealer Executive','Connects tractor/harvester/sprayer/pump rental owners with equipment booking module. Offers free listing then ₹500/month or 3% commission.','3 contacts/week, 1 listing/week, 10 listings/month'],
['12','Transport Dealer Executive','Connects mini truck/pickup/lorry owners with transport booking module. Cold storage vehicle owners included.','3 contacts/week, 1 vehicle listed/week, 10/month'],
['13','Labour Association Executive','Connects farm labour groups and contractors. Explains how app gives them more bookings. Lists groups with worker count and daily rates.','2 contacts/week, 1 group listed/week, 5/month'],
['14','Mandi & Broker Relations Executive','Visits APMC mandis, meets officials, connects brokers. Collects daily prices when API unavailable. Verifies price data accuracy.','1 mandi visit/week, 1 broker connected/week, price accuracy >90%'],
['15','Cold Storage & Factory Executive','Connects cold storage facilities, food processing factories, and agri exporters for F2C direct selling. Highest farmer value — cuts middlemen.','1 contact/week, 5 factories listed/month, 3 transactions facilitated'],
['16','Revenue Tracker & Accounts','Maintains all partnership records. Tracks free vs paid listings. Sends payment reminders. Prepares weekly revenue report.','100% tracking accuracy, weekly report submitted, 0 missed payments'],
];
for(const[n,title,desc,target]of t2){
h+=`<div class="card"><h4>Member ${n}: ${title}</h4><p>${desc}</p><p><b>Targets:</b> ${target}</p></div>`;
}

h+=`</div><div class="pg sec"><h2>Chapter 8 (continued): Teams 2-4</h2>`;
h+=`<div class="card"><h4>Member 17: Business Development & WhatsApp Marketing</h4><p>Online outreach to dealers via WhatsApp/social media. Manages Facebook Business Page. Supports any team member needing bandwidth.</p><p><b>Targets:</b> 50 contacts/week, 3 Facebook posts/week, 5 leads shared</p></div>`;

h+=`<h3>Team 3: Authority Relations (5 Members)</h3>`;
const t3=[
['18','Group Head — Authority Relations','Leads all professor/government/investor meetings. Reviews grant applications. Builds MVGR college recognition. Represents AgriConnect in formal settings.','1 meeting/week, 2 grants applied/month, 1 endorsement confirmed/month'],
['19','College & Professor Relations','Identifies interested MVGR professors. Schedules 30-min demo meetings. Works toward 2 professors as official mentors. Applies for college incubation.','2 professor meetings/week, 2 mentors confirmed/month, college recognition'],
['20','Government Relations Executive','Visits Agriculture Department offices. Meets Agricultural Extension Officers. Gets permission to demo at farmer training programs. Connects with Rythu Seva Kendra.','1 govt visit/week, 1 endorsement/month, 5 contacts built/month'],
['21','Grant Writer & Competition Coordinator','Researches grants (AICTE, NABARD, Startup India). Writes applications. Registers for Smart India Hackathon. Prepares pitch deck. Tracks all deadlines.','1 application/week, 3 submitted/month, Startup India registered Week 1'],
['22','Investor & Media Relations','Builds LinkedIn presence. Connects with agri-tech investors. Contacts Telugu media (Eenadu, Sakshi). Sends press releases. Approaches local businessmen investors.','5 LinkedIn connects/week, 1 media feature/month, 1 investor meeting/month'],
];
for(const[n,title,desc,target]of t3){
h+=`<div class="card"><h4>Member ${n}: ${title}</h4><p>${desc}</p><p><b>Targets:</b> ${target}</p></div>`;
}

h+=`<h3>Tech Team & Operations (3 Members)</h3>`;
const t4=[
['23','Tech Co-Developer','Assists Founder with Phase 11-12 development. Fixes bugs from field workshops. Maintains uptime. Tests before release. Clean React/Supabase code. Tools: VS Code, GitHub, Vercel.','5 bugs fixed/week, 1 feature/week, uptime 99%, daily GitHub commits'],
['24','QA Tester','Tests every feature on budget Android (under ₹10K). Tests on 2G/3G slow internet. Tests Telugu translations. Writes bug reports with screenshots. Full regression test weekly.','All features tested within 24hrs, weekly regression, Telugu 100% accurate'],
['25','Operations Coordinator','Maintains Notion task board. Coordinates all 3 teams. Ensures weekly reports submitted. Sends all-team updates. Organizes Sunday meetings. Tracks 25-member participation.','Notion 100% updated, 0 missed communications, Sunday meeting organized'],
];
for(const[n,title,desc,target]of t4){
h+=`<div class="card"><h4>Member ${n}: ${title}</h4><p>${desc}</p><p><b>Targets:</b> ${target}</p></div>`;
}

// CH9: Revenue
h+=`</div><div class="pg sec"><h2>Chapter 9: Revenue Model & Business Plan</h2>
<h3>9.1 Revenue Streams</h3>
<table><tr><th>#</th><th>Stream</th><th>Pricing</th><th>Year 1 Target</th></tr>
<tr><td>1</td><td>Dealer/Supplier Listing Fee</td><td>₹500/month after 3-month trial</td><td>50 dealers × ₹6K = ₹3L</td></tr>
<tr><td>2</td><td>Equipment Booking Commission</td><td>3% per booking</td><td>₹1.2L</td></tr>
<tr><td>3</td><td>Transport Booking Commission</td><td>3% per booking</td><td>₹60K</td></tr>
<tr><td>4</td><td>Premium Farmer Subscription</td><td>₹499/year</td><td>200 farmers = ₹1L</td></tr>
<tr><td>5</td><td>F2C Store Commission</td><td>5% per transaction</td><td>₹1.8L</td></tr>
<tr><td>6</td><td>Sponsored Listings</td><td>₹2K/month for top placement</td><td>₹50K</td></tr>
</table>
<p><b>Total Year 1 Revenue Target: ₹7-8 Lakhs</b></p>
<p><b>Year 2 Target: ₹25-30 Lakhs</b> (with 2000+ farmers, 100+ dealers, multi-district expansion)</p>

<h3>9.2 Cost Structure</h3>
<table><tr><th>Item</th><th>Monthly Cost</th><th>Annual</th></tr>
<tr><td>Supabase (Free tier)</td><td>₹0</td><td>₹0</td></tr>
<tr><td>Vercel Hosting (Free tier)</td><td>₹0</td><td>₹0</td></tr>
<tr><td>AI APIs (Free tiers)</td><td>₹0</td><td>₹0</td></tr>
<tr><td>Fast2SMS (OTP)</td><td>₹500</td><td>₹6K</td></tr>
<tr><td>Domain Name</td><td>₹100</td><td>₹1.2K</td></tr>
<tr><td>Workshop Materials (Pamphlets)</td><td>₹2K</td><td>₹24K</td></tr>
<tr><td>Travel (Village visits)</td><td>₹5K</td><td>₹60K</td></tr>
</table>
<p><b>Total Annual Cost: ~₹90K</b> | <b>Break-even: Month 6-8</b></p>
</div>`;

// CH10: Roadmap
h+=`<div class="pg sec"><h2>Chapter 10: 90-Day Launch Roadmap</h2>
<table><tr><th>Week</th><th>Phase</th><th>Key Activities</th><th>Deliverables</th></tr>
<tr><td>1</td><td>Team Setup</td><td>Select 25 members, assign roles, create WhatsApp groups, Notion board</td><td>Team formed, tools ready</td></tr>
<tr><td>2</td><td>Training</td><td>App training for all members, role-specific workshops, demo practice</td><td>All members can demo app</td></tr>
<tr><td>3</td><td>Pilot</td><td>First 3 village workshops, first dealer visits, Startup India registration</td><td>50 farmers, 3 dealers contacted</td></tr>
<tr><td>4</td><td>Expand</td><td>5 villages, professor meetings, grant research started</td><td>100 farmers, 1 mentor, 1 grant identified</td></tr>
<tr><td>5-6</td><td>Scale</td><td>10 villages/week, WhatsApp groups growing, media outreach begins</td><td>300 farmers, 5 dealers listed, content calendar running</td></tr>
<tr><td>7-8</td><td>Revenue</td><td>Free trials ending, payment collection starts, first bookings</td><td>First ₹5K revenue, 400+ farmers</td></tr>
<tr><td>9-10</td><td>Validate</td><td>Feedback analysis, feature improvements, govt meeting</td><td>App v1.1, 1 govt endorsement</td></tr>
<tr><td>11-12</td><td>Growth</td><td>Multi-district expansion planning, investor pitch prep</td><td>500+ farmers, ₹10K revenue, pitch deck ready</td></tr>
</table>

<h2>Chapter 11: Future Vision & Improvements</h2>
<table><tr><th>Timeline</th><th>Feature</th><th>Impact</th></tr>
<tr><td>Month 2</td><td>Push notifications (Firebase)</td><td>3x user engagement</td></tr>
<tr><td>Month 3</td><td>Real-time farmer-to-farmer chat</td><td>Community retention</td></tr>
<tr><td>Month 4</td><td>Mobile app (React Native)</td><td>Better performance on low-end phones</td></tr>
<tr><td>Month 6</td><td>Satellite imagery (NDVI crop monitoring)</td><td>Remote crop health assessment</td></tr>
<tr><td>Month 6</td><td>ML price forecasting</td><td>Help farmers time their sales</td></tr>
<tr><td>Month 9</td><td>Blockchain supply chain</td><td>Traceability from farm to fork</td></tr>
<tr><td>Month 12</td><td>Multi-state expansion (Telangana, Karnataka)</td><td>10x user base</td></tr>
</table>
<blockquote><b>Built with ❤️ for the farmers of Andhra Pradesh</b><br/>Platform: agriconnect360-web.vercel.app<br/>© 2026 AgriConnect 360. All rights reserved.</blockquote>
</div></body></html>`;

writeFileSync('./AGRICONNECT360_FULL_DOCUMENT.html',h);
console.log('✅ DONE: AGRICONNECT360_FULL_DOCUMENT.html — Open in Chrome → Ctrl+P → Save as PDF');
