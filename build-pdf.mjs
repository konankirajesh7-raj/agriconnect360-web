import{writeFileSync}from'fs';
const h=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>AgriConnect 360</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;color:#1e293b;line-height:1.7}
.cover{height:100vh;background:linear-gradient(135deg,#064e3b,#059669,#10b981);display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;text-align:center;page-break-after:always}
.cover h1{font-size:52px;margin-bottom:8px}.cover .sub{font-size:22px;opacity:0.9;margin-bottom:40px}
.cover .stats{display:flex;gap:30px;margin-top:30px}.cover .stat{background:rgba(255,255,255,0.15);padding:20px 30px;border-radius:16px;backdrop-filter:blur(10px)}
.cover .stat b{display:block;font-size:28px}.cover .stat span{font-size:12px;opacity:0.8}
.page{padding:40px 50px;max-width:900px;margin:auto;page-break-inside:avoid}
h2{font-size:22px;color:#059669;border-bottom:3px solid #059669;padding-bottom:6px;margin:30px 0 14px}
h3{font-size:16px;color:#334155;margin:16px 0 8px}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:12px}
td,th{border:1px solid #e2e8f0;padding:7px 10px;text-align:left}th{background:#059669;color:#fff;font-weight:700}
tr:nth-child(even){background:#f0fdf4}
.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:10px 0}
.card h4{color:#059669;margin-bottom:6px;font-size:14px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.badge{display:inline-block;background:#059669;color:#fff;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:600}
.warn{background:#f59e0b}.blue{background:#3b82f6}
blockquote{border-left:4px solid #f59e0b;background:#fffbeb;padding:10px 16px;margin:10px 0;font-size:13px;border-radius:0 8px 8px 0}
.section{page-break-before:always}
ul{margin:6px 0 6px 20px;font-size:13px}li{margin:3px 0}
@media print{.cover{height:100vh}.section{page-break-before:always}body{font-size:11px}}
</style></head><body>

<div class="cover">
<div style="font-size:60px;margin-bottom:10px">🌾</div>
<h1>AgriConnect 360</h1>
<div class="sub">Smart Farming Platform for Andhra Pradesh</div>
<p style="font-size:14px;opacity:0.7;max-width:600px">India's most comprehensive agritech platform with 22+ modules covering the entire agricultural lifecycle — soil to market</p>
<div class="stats">
<div class="stat"><b>47</b><span>Modules</span></div>
<div class="stat"><b>7</b><span>User Roles</span></div>
<div class="stat"><b>7</b><span>API Integrations</span></div>
<div class="stat"><b>800+</b><span>Tests Passed</span></div>
<div class="stat"><b>25</b><span>Team Members</span></div>
</div>
<p style="margin-top:50px;font-size:13px;opacity:0.6">agriconnect360-web.vercel.app • Version 1.0 • April 2026</p>
</div>

<div class="page">
<h2>🎯 What is AgriConnect 360?</h2>
<p>AgriConnect 360 is an all-in-one digital platform designed for <b>small and marginal farmers in Andhra Pradesh</b>. It provides real-time market prices, AI-powered crop advisory, weather forecasting, expense tracking, government scheme access, and direct farmer-to-buyer marketplace — all in <b>Telugu, Hindi, and English</b>.</p>

<div class="grid" style="margin-top:16px">
<div class="card"><h4>🌱 Problem We Solve</h4><ul>
<li>Farmers get 30-40% less price due to middlemen</li>
<li>No access to real-time mandi prices in villages</li>
<li>Crop disease goes undetected until too late</li>
<li>Government schemes info doesn't reach farmers</li>
<li>No digital expense/profit tracking</li>
</ul></div>
<div class="card"><h4>💡 Our Solution</h4><ul>
<li>Direct marketplace: farmer-to-buyer, zero middlemen</li>
<li>Live APMC prices from data.gov.in (1300+ AP records)</li>
<li>AI disease detection via phone camera (Gemini Vision)</li>
<li>All AP schemes auto-matched to farmer profile</li>
<li>Complete digital farm ledger with P&L reports</li>
</ul></div>
</div>

<h2>📊 Platform at a Glance</h2>
<table><tr><th>Metric</th><th>Value</th><th>Metric</th><th>Value</th></tr>
<tr><td>Total Pages</td><td><b>47</b></td><td>Languages</td><td>English, Telugu, Hindi</td></tr>
<tr><td>Code Lines</td><td><b>45,000+</b></td><td>Bundle Size</td><td>170 KB gzipped</td></tr>
<tr><td>User Roles</td><td><b>7</b></td><td>Build Time</td><td>3.5 seconds</td></tr>
<tr><td>API Integrations</td><td><b>7</b></td><td>Uptime</td><td>99.9%</td></tr>
<tr><td>Database Tables</td><td><b>16 with RLS</b></td><td>PWA Support</td><td>✅ Offline-ready</td></tr>
</table>
</div>

<div class="page section">
<h2>🏗️ Technology Architecture</h2>
<table><tr><th>Layer</th><th>Technology</th><th>Purpose</th></tr>
<tr><td>Frontend</td><td>React 18 + Vite</td><td>UI framework, 3.5s builds</td></tr>
<tr><td>State</td><td>Zustand + React Query</td><td>Client & server state</td></tr>
<tr><td>Charts</td><td>Recharts</td><td>Data visualization</td></tr>
<tr><td>Database</td><td>Supabase (PostgreSQL)</td><td>16 tables, Row-Level Security</td></tr>
<tr><td>Auth</td><td>Supabase Auth</td><td>OTP, Google OAuth, JWT</td></tr>
<tr><td>AI Engine</td><td>Google Gemini 2.0 Flash</td><td>Chat advisory, disease detection</td></tr>
<tr><td>AI Backup</td><td>Groq LLaMA-3.3-70B</td><td>Fast backend inference</td></tr>
<tr><td>Weather</td><td>Open-Meteo + OpenWeatherMap</td><td>7-day forecast, hourly data</td></tr>
<tr><td>Market Data</td><td>data.gov.in API</td><td>Live APMC mandi prices</td></tr>
<tr><td>SMS</td><td>Fast2SMS</td><td>OTP delivery</td></tr>
<tr><td>Hosting</td><td>Vercel (Global CDN)</td><td>Auto-deploy, SSL, edge network</td></tr>
<tr><td>PWA</td><td>Service Worker</td><td>Offline caching, background sync</td></tr>
</table>

<h2>🔑 API Integrations (7 Active)</h2>
<table><tr><th>Service</th><th>Status</th><th>Tier</th><th>Purpose</th></tr>
<tr><td>Supabase</td><td><span class="badge">✅ Live</span></td><td>Free</td><td>Database + Auth + Realtime</td></tr>
<tr><td>Google Gemini AI</td><td><span class="badge">✅ Live</span></td><td>Free</td><td>AI chat + crop disease detection</td></tr>
<tr><td>Groq AI</td><td><span class="badge">✅ Live</span></td><td>Free</td><td>Fast LLaMA-3.3 inference</td></tr>
<tr><td>data.gov.in</td><td><span class="badge">✅ Live</span></td><td>Free</td><td>1300+ AP mandi prices daily</td></tr>
<tr><td>Open-Meteo</td><td><span class="badge">✅ Live</span></td><td>Free</td><td>Weather forecast (no key needed)</td></tr>
<tr><td>OpenWeatherMap</td><td><span class="badge">✅ Live</span></td><td>Free</td><td>Current weather + UV index</td></tr>
<tr><td>Fast2SMS</td><td><span class="badge">✅ Live</span></td><td>Paid</td><td>SMS OTP delivery</td></tr>
</table>
</div>

<div class="page section">
<h2>👥 7 User Roles — Full Details</h2>

<div class="card"><h4>🧑‍🌾 Role 1: FARMER (Primary User — 80% of traffic)</h4>
<p><b>Who:</b> Small & marginal farmers in AP, 2-10 acres, age 25-55, smartphone with 2G/3G</p>
<p><b>Modules (22):</b> Dashboard, Weather, Crops, Fields, Soil Testing, Market Prices, AI Advisory, Expenses, Sales & Profit, Wallet, Insurance, Financial Services (KCC/Loans/Tax), Schemes, Community Forum, Marketplace, Equipment Booking, Transport, Labour Hiring, Gamification, Tasks, Reports, Profile & Settings</p>
<p><b>Key Actions:</b> Add crops → Track expenses → Check market prices → Chat with AI → Sell produce → Book equipment/labour → Claim insurance → Apply for schemes</p>
</div>

<div class="card"><h4>🏭 Role 2: SUPPLIER</h4>
<p><b>Who:</b> Seed, fertilizer, pesticide dealers and agri-input shops</p>
<p><b>Modules:</b> Product Catalog, Order Management, Inventory Tracker, Customer Management, Invoice Generation, Analytics Dashboard</p>
<p><b>Key Actions:</b> List products → Receive farmer orders → Manage stock → Generate invoices → Track revenue</p>
<p><b>Revenue Model:</b> Free listing for 3 months, then ₹500/month or 3% commission per order</p>
</div>

<div class="card"><h4>📊 Role 3: BROKER</h4>
<p><b>Who:</b> APMC mandi brokers and commission agents</p>
<p><b>Modules:</b> Mandi Transaction Recording, Commission Tracker, Farmer Connections, Price Data Entry, Transaction History</p>
<p><b>Key Actions:</b> Record buy/sell transactions → Track commission → Connect with farmers → Verify mandi prices</p>
</div>

<div class="card"><h4>🏢 Role 4: INDUSTRIAL</h4>
<p><b>Who:</b> Cotton mills, rice mills, food processing factories, agri exporters</p>
<p><b>Modules:</b> Farmer Search (by crop, district, quantity), Bulk Procurement, Contract Farming, Quality Grading, Direct Purchase</p>
<p><b>Key Actions:</b> Search farmers by produce → Place bulk orders → Manage contracts → Track deliveries</p>
</div>

<div class="card"><h4>👷 Role 5: LABOUR ASSOCIATION</h4>
<p><b>Who:</b> Farm labour groups, contractors (thekedars), worker associations</p>
<p><b>Modules:</b> Worker Dispatch, Booking Management, Attendance Tracker, Payment Records, Availability Calendar</p>
<p><b>Key Actions:</b> Receive bookings → Dispatch workers → Track attendance → Record payments</p>
</div>

<div class="card"><h4>🛡️ Role 6: ADMIN</h4>
<p><b>Who:</b> Platform administrators and moderators</p>
<p><b>Modules:</b> User Management, Content Moderation, System Analytics, Farmer Stats, Revenue Dashboard, Report Flagging, Ban/Unban Users, Data Export</p>
<p><b>Key Actions:</b> Monitor platform health → Moderate community → Manage users → View analytics → Handle disputes</p>
</div>

<div class="card"><h4>🌐 Role 7: PUBLIC (Unauthenticated)</h4>
<p><b>Who:</b> Anyone visiting the website</p>
<p><b>Modules:</b> Landing Page, Contact Form, Privacy Policy, Terms of Service, Demo Mode (all 7 roles)</p>
</div>
</div>

<div class="page section">
<h2>📱 All 47 Modules</h2>
<table><tr><th>#</th><th>Module</th><th>Route</th><th>Description</th></tr>
<tr><td>1</td><td>Dashboard</td><td>/dashboard</td><td>Stats, journey bar, tasks, tip of day</td></tr>
<tr><td>2</td><td>Weather</td><td>/weather</td><td>7-day forecast, hourly, UV, rain alerts</td></tr>
<tr><td>3</td><td>Crops</td><td>/crops</td><td>Crop CRUD, growth tracking, yield prediction</td></tr>
<tr><td>4</td><td>Fields</td><td>/fields</td><td>Field management, GPS mapping, area calc</td></tr>
<tr><td>5</td><td>Soil Testing</td><td>/soil</td><td>NPK, pH, EC, organic carbon analysis</td></tr>
<tr><td>6</td><td>Market Prices</td><td>/market-prices</td><td>Live APMC mandi prices, 30-day trends</td></tr>
<tr><td>7</td><td>AI Advisory</td><td>/ai</td><td>Gemini chat, disease detection, yield predict</td></tr>
<tr><td>8</td><td>Expenses</td><td>/expenses</td><td>Budget tracker, category charts, CSV export</td></tr>
<tr><td>9</td><td>Sales & Profit</td><td>/sales</td><td>Income tracking, P&L analysis</td></tr>
<tr><td>10</td><td>Wallet</td><td>/wallet</td><td>UPI payments, premium upgrade, invoices</td></tr>
<tr><td>11</td><td>Insurance</td><td>/insurance</td><td>PMFBY crop insurance claims</td></tr>
<tr><td>12</td><td>Financial Services</td><td>/financial-services</td><td>KCC, loans, insurance, tax, subsidy (8 tabs)</td></tr>
<tr><td>13</td><td>Schemes</td><td>/schemes</td><td>PM-KISAN, YSR Rythu Bharosa, auto-match</td></tr>
<tr><td>14</td><td>Community Forum</td><td>/community</td><td>Q&A, tips, crop filter, report, bookmark</td></tr>
<tr><td>15</td><td>Marketplace</td><td>/marketplace</td><td>Farmer-to-farmer produce trading</td></tr>
<tr><td>16</td><td>Suppliers</td><td>/suppliers</td><td>Input supplier directory + ordering</td></tr>
<tr><td>17</td><td>F2C Store</td><td>/f2c-store</td><td>Farmer-to-consumer direct storefront</td></tr>
<tr><td>18</td><td>Equipment</td><td>/equipment</td><td>Tractor, harvester rental booking</td></tr>
<tr><td>19</td><td>Transport</td><td>/transport</td><td>Truck/vehicle booking for produce</td></tr>
<tr><td>20</td><td>Labour</td><td>/labour</td><td>Farm labour hiring marketplace</td></tr>
<tr><td>21-47</td><td colspan="3">+ Network, FPO, Knowledge, Gamification, Tasks, Reports, Admin, Supplier/Broker/Industrial/Labour Dashboards, Profile, Settings, Onboarding, Notifications, Landing, Login, Contact, Premium, IoT, Drone, Cold Storage, Quality Lab, Agri Tourism, Disputes, QA, Farmers Directory</td></tr>
</table>
</div>

<div class="page section">
<h2>👨‍💼 25-Member Real-World Team Structure</h2>
<h3>Team 1: Farmer Outreach (7 members)</h3>
<table><tr><th>#</th><th>Role</th><th>Key Responsibility</th><th>Weekly Target</th></tr>
<tr><td>1</td><td>Team Head — Outreach Lead</td><td>Plan village visits, coordinate 6 members</td><td>100 farmers registered</td></tr>
<tr><td>2</td><td>Workshop Coordinator (Primary)</td><td>Conduct 45-min workshops in villages</td><td>60 farmers taught</td></tr>
<tr><td>3</td><td>Workshop Coordinator (Secondary)</td><td>Independent workshops in different villages</td><td>40 farmers registered</td></tr>
<tr><td>4</td><td>Registration & Support Exec</td><td>Register farmers, WhatsApp support 9-6</td><td>50 profiles completed</td></tr>
<tr><td>5</td><td>Telugu Content Creator</td><td>Tutorial videos, daily WhatsApp content</td><td>2 videos, 7 messages</td></tr>
<tr><td>6</td><td>WhatsApp Community Manager</td><td>Manage farmer groups, daily price/weather</td><td>150 farmers in groups</td></tr>
<tr><td>7</td><td>Feedback & Data Analyst</td><td>Collect feedback, weekly analysis report</td><td>50 feedbacks collected</td></tr>
</table>

<h3>Team 2: Business Partnerships (9 members)</h3>
<table><tr><th>#</th><th>Role</th><th>Key Responsibility</th><th>Weekly Target</th></tr>
<tr><td>8</td><td>Team Head — Business Lead</td><td>Approve deals, negotiate with major partners</td><td>5 partnerships signed</td></tr>
<tr><td>9</td><td>Dealer Exec — Area A</td><td>Onboard seed/fertilizer shops in Area A</td><td>2 dealers confirmed</td></tr>
<tr><td>10</td><td>Dealer Exec — Area B</td><td>Onboard shops in different area</td><td>2 dealers confirmed</td></tr>
<tr><td>11</td><td>Equipment Dealer Exec</td><td>List tractor/harvester rental owners</td><td>1 equipment listed</td></tr>
<tr><td>12</td><td>Transport Dealer Exec</td><td>List truck/vehicle owners for booking</td><td>1 vehicle listed</td></tr>
<tr><td>13</td><td>Labour Association Exec</td><td>Connect farm labour groups to app</td><td>1 group listed</td></tr>
<tr><td>14</td><td>Mandi & Broker Exec</td><td>Visit APMC, connect brokers, verify prices</td><td>1 broker connected</td></tr>
<tr><td>15</td><td>Cold Storage & Factory Exec</td><td>Connect factories for F2C direct selling</td><td>1 factory contacted</td></tr>
<tr><td>16</td><td>Revenue Tracker & Accounts</td><td>Track all revenue, send payment reminders</td><td>100% tracking accuracy</td></tr>
<tr><td>17</td><td>WhatsApp Marketing Exec</td><td>Online outreach to dealers, social media</td><td>50 contacts reached</td></tr>
</table>

<h3>Team 3: Authority Relations (5 members)</h3>
<table><tr><th>#</th><th>Role</th><th>Key Responsibility</th><th>Monthly Target</th></tr>
<tr><td>18</td><td>Team Head — Authority Lead</td><td>Lead professor/govt meetings, review grants</td><td>1 endorsement confirmed</td></tr>
<tr><td>19</td><td>College & Professor Exec</td><td>Get 2 professors as mentors, incubation</td><td>2 mentors confirmed</td></tr>
<tr><td>20</td><td>Government Relations Exec</td><td>Visit Agriculture Dept, get endorsement</td><td>1 govt endorsement</td></tr>
<tr><td>21</td><td>Grant Writer</td><td>Apply Startup India, AICTE, NABARD grants</td><td>3 applications submitted</td></tr>
<tr><td>22</td><td>Investor & Media Exec</td><td>LinkedIn outreach, Telugu media coverage</td><td>1 media feature</td></tr>
</table>

<h3>Tech + Operations (3 members)</h3>
<table><tr><th>#</th><th>Role</th><th>Key Responsibility</th><th>Weekly Target</th></tr>
<tr><td>23</td><td>Tech Co-Developer</td><td>Bug fixes, feature development with Founder</td><td>5 bugs fixed</td></tr>
<tr><td>24</td><td>QA Tester</td><td>Test on budget Android + slow internet</td><td>All features tested in 24h</td></tr>
<tr><td>25</td><td>Operations Coordinator</td><td>Notion board, cross-team communication</td><td>Zero missed reports</td></tr>
</table>
</div>

<div class="page section">
<h2>🔒 Security & Compliance</h2>
<div class="grid">
<div class="card"><h4>Security Headers</h4><ul><li>HSTS: 2-year max-age</li><li>CSP: Strict whitelist</li><li>X-Frame-Options: DENY</li><li>XSS Protection: Enabled</li></ul></div>
<div class="card"><h4>Data Protection</h4><ul><li>RLS on all 16 tables</li><li>Aadhaar masking (XXXX XXXX 9012)</li><li>XSS/SQL injection prevented</li><li>DPDP Act compliant</li></ul></div>
</div>

<h2>🚀 Revenue Model</h2>
<table><tr><th>Stream</th><th>Price</th><th>Target</th></tr>
<tr><td>Dealer/Supplier Listing</td><td>₹500/month after 3-month free trial</td><td>50 dealers = ₹25K/month</td></tr>
<tr><td>Equipment Booking Commission</td><td>3% per booking</td><td>₹10K/month</td></tr>
<tr><td>Premium Farmer Subscription</td><td>₹499/year</td><td>200 farmers = ₹1L/year</td></tr>
<tr><td>Transport Booking Commission</td><td>3% per booking</td><td>₹5K/month</td></tr>
<tr><td>F2C Store Commission</td><td>5% per transaction</td><td>₹15K/month</td></tr>
</table>

<h2>🎯 90-Day Launch Plan</h2>
<table><tr><th>Phase</th><th>Duration</th><th>Goal</th></tr>
<tr><td>Week 1-2</td><td>Setup</td><td>Team formation, training, Startup India registration</td></tr>
<tr><td>Week 3-4</td><td>Pilot</td><td>5 village workshops, 100 farmers, first dealer listed</td></tr>
<tr><td>Week 5-8</td><td>Scale</td><td>20 villages, 400 farmers, 10 dealers, 1 grant applied</td></tr>
<tr><td>Week 9-12</td><td>Revenue</td><td>First ₹10K revenue, govt endorsement, media feature</td></tr>
</table>

<blockquote><b>Contact:</b> agriconnect360-web.vercel.app | Built with ❤️ for AP Farmers</blockquote>
</div>

</body></html>`;
writeFileSync('./AGRICONNECT360_PRESENTATION.html',h);
console.log('✅ Created: AGRICONNECT360_PRESENTATION.html');
