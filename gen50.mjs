import{writeFileSync,readFileSync}from'fs';
const css=`*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,sans-serif;color:#1e293b;line-height:1.7;font-size:13px}
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
.cover{min-height:100vh;background:linear-gradient(135deg,#064e3b,#059669);display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;text-align:center;page-break-after:always;padding:40px}
.cover h1{font-size:48px}.cover .sub{font-size:20px;opacity:0.9;margin:8px 0 30px}
.stats{display:flex;gap:20px;flex-wrap:wrap;justify-content:center}.stat{background:rgba(255,255,255,0.15);padding:18px 28px;border-radius:14px;min-width:100px}.stat b{display:block;font-size:26px}.stat span{font-size:11px;opacity:0.8}
.pg{padding:30px 45px;max-width:850px;margin:auto}.sec{page-break-before:always}
h2{font-size:20px;color:#059669;border-bottom:3px solid #059669;padding-bottom:5px;margin:24px 0 12px}
h3{font-size:15px;color:#1e293b;margin:16px 0 8px;border-left:3px solid #10b981;padding-left:10px}
h4{font-size:13px;color:#059669;margin:12px 0 4px}
table{width:100%;border-collapse:collapse;margin:10px 0;font-size:11.5px}td,th{border:1px solid #e2e8f0;padding:6px 8px;text-align:left}
th{background:#059669;color:#fff;font-weight:700}tr:nth-child(even){background:#f0fdf4}
.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin:8px 0}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.badge{display:inline-block;background:#059669;color:#fff;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:600}
blockquote{border-left:4px solid #f59e0b;background:#fffbeb;padding:8px 14px;margin:10px 0;font-size:12px;border-radius:0 8px 8px 0}
ul{margin:4px 0 4px 18px}li{margin:2px 0}hr{border:none;border-top:1px solid #e2e8f0;margin:16px 0}
@media print{.sec{page-break-before:always}.cover{min-height:100vh}}`;

let html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>AgriConnect 360 — Complete Project Document</title><style>${css}</style></head><body>`;

// COVER
html+=`<div class="cover"><div style="font-size:64px;margin-bottom:12px">🌾</div>
<h1>AgriConnect 360</h1><div class="sub">Smart Farming Platform — Complete Project Document</div>
<p style="max-width:550px;opacity:0.8;font-size:13px">India's most comprehensive agritech platform with 22+ modules covering soil-to-market lifecycle for Andhra Pradesh farmers</p>
<div class="stats"><div class="stat"><b>47</b><span>Modules</span></div><div class="stat"><b>7</b><span>User Roles</span></div>
<div class="stat"><b>7</b><span>Live APIs</span></div><div class="stat"><b>800+</b><span>Tests</span></div>
<div class="stat"><b>25</b><span>Team</span></div><div class="stat"><b>45K+</b><span>Lines of Code</span></div></div>
<p style="margin-top:40px;font-size:12px;opacity:0.5">Version 1.0 FINAL • April 2026 • agriconnect360-web.vercel.app</p></div>`;

// TOC
html+=`<div class="pg"><h2>📋 Table of Contents</h2><table>
<tr><th>Ch</th><th>Section</th><th>Pages</th></tr>
<tr><td>1</td><td>Executive Summary & Vision</td><td>3-4</td></tr>
<tr><td>2</td><td>Problem Statement & Market Analysis</td><td>5-7</td></tr>
<tr><td>3</td><td>Platform Architecture & Technology</td><td>8-11</td></tr>
<tr><td>4</td><td>All 47 Modules — Detailed Description</td><td>12-25</td></tr>
<tr><td>5</td><td>7 User Roles — Complete Breakdown</td><td>26-33</td></tr>
<tr><td>6</td><td>API Integrations & Credentials</td><td>34-36</td></tr>
<tr><td>7</td><td>Database Schema & Security</td><td>37-39</td></tr>
<tr><td>8</td><td>25-Member Team Structure</td><td>40-46</td></tr>
<tr><td>9</td><td>Revenue Model & Business Plan</td><td>47-48</td></tr>
<tr><td>10</td><td>90-Day Launch Roadmap</td><td>49-50</td></tr>
<tr><td>11</td><td>Future Improvements & Vision</td><td>51-52</td></tr>
</table></div>`;

// CH1: Executive Summary
html+=`<div class="pg sec"><h2>Chapter 1: Executive Summary & Vision</h2>
<h3>1.1 What is AgriConnect 360?</h3>
<p>AgriConnect 360 is a <b>comprehensive, AI-powered digital agriculture platform</b> built specifically for small and marginal farmers in Andhra Pradesh, India. The platform integrates <b>47 distinct modules</b> covering the entire agricultural lifecycle — from soil testing and crop planning to market sales and financial management.</p>
<p>The platform is available as a <b>Progressive Web App (PWA)</b> that works on any smartphone browser, supports <b>offline functionality</b> for areas with poor connectivity, and provides content in <b>Telugu, Hindi, and English</b>.</p>

<h3>1.2 Vision Statement</h3>
<blockquote>"To digitally empower every farmer in Andhra Pradesh with real-time market intelligence, AI-powered advisory, and direct market access — eliminating middlemen and increasing farmer income by 30-40%."</blockquote>

<h3>1.3 Key Achievements</h3>
<table><tr><th>Metric</th><th>Value</th><th>Details</th></tr>
<tr><td>Total Modules Built</td><td><b>47</b></td><td>22 farmer + 5 dashboards + 20 support</td></tr>
<tr><td>Lines of Code</td><td><b>45,000+</b></td><td>React JSX + CSS + Services</td></tr>
<tr><td>Test Cases Verified</td><td><b>800+</b></td><td>Security, performance, accessibility, all roles</td></tr>
<tr><td>API Integrations</td><td><b>7 live</b></td><td>All free-tier, production-ready</td></tr>
<tr><td>Languages Supported</td><td><b>4</b></td><td>English, Telugu, Hindi, Kannada</td></tr>
<tr><td>Build Time</td><td><b>3.5 sec</b></td><td>Vite bundler, 170KB gzipped</td></tr>
<tr><td>Accessibility</td><td><b>WCAG 2.1 AA</b></td><td>Screen reader, keyboard, contrast compliant</td></tr>
<tr><td>Deployment</td><td><b>Vercel CDN</b></td><td>Global edge, auto-SSL, 99.9% uptime</td></tr>
</table>

<h3>1.4 Target Users</h3>
<div class="g2">
<div class="card"><h4>🧑‍🌾 Primary: Small Farmers</h4><ul><li>2-10 acres landholding</li><li>Age 25-55 years</li><li>Basic smartphone (₹5K-15K)</li><li>2G/3G connectivity</li><li>Telugu-speaking (80%)</li><li>Limited digital literacy</li></ul></div>
<div class="card"><h4>🏢 Secondary: Agri Businesses</h4><ul><li>Seed/fertilizer dealers</li><li>APMC mandi brokers</li><li>Cotton/rice mills</li><li>Farm equipment rentals</li><li>Transport operators</li><li>Labour contractors</li></ul></div>
</div>

<h3>1.5 Unique Selling Points</h3>
<ul><li><b>All-in-one:</b> No other platform combines market prices + AI + weather + finance + marketplace in one app</li>
<li><b>Telugu-first:</b> Complete UI, AI responses, and SMS in Telugu script</li>
<li><b>Offline-capable:</b> Works without internet, syncs when connected</li>
<li><b>Free for farmers:</b> Core features are completely free forever</li>
<li><b>AI-powered:</b> Gemini 2.0 for crop disease detection from phone camera</li>
<li><b>Government integrated:</b> Live APMC prices from data.gov.in API</li></ul>
</div>`;

// CH2: Problem Statement
html+=`<div class="pg sec"><h2>Chapter 2: Problem Statement & Market Analysis</h2>
<h3>2.1 Problems Faced by AP Farmers</h3>
<table><tr><th>#</th><th>Problem</th><th>Impact</th><th>Our Solution</th></tr>
<tr><td>1</td><td>No access to real-time market prices</td><td>Farmers sell at 30-40% below market rate</td><td>Live APMC prices from 1300+ AP mandis</td></tr>
<tr><td>2</td><td>Crop disease goes undetected</td><td>20-30% yield loss annually</td><td>AI disease detection via phone camera</td></tr>
<tr><td>3</td><td>Middlemen exploitation</td><td>₹2-3 lakh loss per farmer per year</td><td>Direct farmer-to-buyer marketplace</td></tr>
<tr><td>4</td><td>No expense/profit tracking</td><td>Farmers don't know if they're profitable</td><td>Digital farm ledger with P&L charts</td></tr>
<tr><td>5</td><td>Weather unpredictability</td><td>Crop damage from unexpected rain/heat</td><td>7-day forecast with hourly alerts</td></tr>
<tr><td>6</td><td>Govt scheme info doesn't reach</td><td>₹50K+ unclaimed benefits per farmer</td><td>Auto-matched scheme recommendations</td></tr>
<tr><td>7</td><td>No access to agri inputs info</td><td>Poor quality seeds, overpriced fertilizers</td><td>Verified supplier directory with ratings</td></tr>
<tr><td>8</td><td>Difficulty finding farm labour</td><td>Harvest delays, crop spoilage</td><td>Digital labour booking system</td></tr>
<tr><td>9</td><td>No transport for produce</td><td>Post-harvest losses up to 25%</td><td>Transport booking with route tracking</td></tr>
<tr><td>10</td><td>Isolation from farming community</td><td>No peer learning or knowledge sharing</td><td>Community forum with Q&A and tips</td></tr>
</table>

<h3>2.2 Market Size</h3>
<div class="g2">
<div class="card"><h4>Andhra Pradesh Agriculture</h4><ul><li>Total farmers: <b>65 lakh+</b></li><li>Agricultural GDP: <b>₹1.2 lakh crore</b></li><li>Smartphone penetration: <b>60%+</b></li><li>Major crops: Paddy, Cotton, Chilli, Groundnut</li></ul></div>
<div class="card"><h4>Indian AgriTech Market</h4><ul><li>Market size 2026: <b>$24 billion</b></li><li>Growth rate: <b>25% CAGR</b></li><li>Smartphone farmers: <b>30 crore+</b></li><li>Digital payment adoption: <b>45%+</b></li></ul></div>
</div>

<h3>2.3 Competitive Analysis</h3>
<table><tr><th>Feature</th><th>AgriConnect 360</th><th>DeHaat</th><th>AgroStar</th><th>Kisan Network</th></tr>
<tr><td>Live Mandi Prices</td><td>✅ 1300+ AP</td><td>✅ Limited</td><td>❌</td><td>✅</td></tr>
<tr><td>AI Crop Advisory</td><td>✅ Gemini AI</td><td>❌</td><td>✅ Basic</td><td>❌</td></tr>
<tr><td>Disease Detection</td><td>✅ Camera</td><td>❌</td><td>✅</td><td>❌</td></tr>
<tr><td>Telugu Language</td><td>✅ Full</td><td>❌</td><td>Partial</td><td>❌</td></tr>
<tr><td>Expense Tracking</td><td>✅ Full P&L</td><td>❌</td><td>❌</td><td>❌</td></tr>
<tr><td>Equipment Booking</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
<tr><td>Labour Hiring</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
<tr><td>Offline Mode</td><td>✅ PWA</td><td>❌</td><td>❌</td><td>❌</td></tr>
<tr><td>Free for Farmers</td><td>✅</td><td>Partial</td><td>❌</td><td>✅</td></tr>
<tr><td>Total Modules</td><td><b>47</b></td><td>8</td><td>5</td><td>4</td></tr>
</table>
</div>`;

// Save part 1
writeFileSync('./part1.html', html);
console.log('Part 1 done');
