# AgriConnect 360 — Complete Platform Documentation

> **Version 2.0** | Last Updated: April 23, 2026
> Multi-Stakeholder Agricultural Technology Platform | Andhra Pradesh, India

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture](#2-architecture)
3. [Getting Started](#3-getting-started)
4. [User Guide](#4-user-guide)
5. [Role-Based Access](#5-role-based-access)
6. [Feature Reference](#6-feature-reference)
7. [API & Services](#7-api--services)
8. [Database Schema](#8-database-schema)
9. [Security](#9-security)
10. [Deployment](#10-deployment)
11. [Troubleshooting](#11-troubleshooting)
12. [FAQ](#12-faq)

---

## 1. Platform Overview

AgriConnect 360 is a comprehensive agricultural technology platform built for the farming ecosystem of Andhra Pradesh. It connects **farmers**, **industrial buyers**, **brokers**, **suppliers**, **labour associations**, **FPOs**, and **administrators** through a single unified platform.

### Key Capabilities

| Module | Description | Status |
|--------|-------------|--------|
| 🌤️ Weather Intelligence | 5-day forecast, micro-climate alerts, farming advisories | ✅ Production |
| 💰 Market Prices | Live mandi prices (e-NAM + data.gov.in), price alerts | ✅ Production |
| 🤖 AI Advisory | Gemini-powered crop advisor, disease detection, yield prediction | ✅ Production |
| 🌱 Crop Tracking | Crop calendar, growth stages, activity logging | ✅ Production |
| 💳 Expense Tracker | Farm input/output financial tracking | ✅ Production |
| 🛡️ Insurance | PMFBY integration, premium calculator, claim tracker | ✅ Production |
| 🏛️ Gov Schemes | PM-KISAN, YSR Rythu Bharosa, eligibility checker | ✅ Production |
| 🚜 Equipment | Marketplace for rental/purchase of farm equipment | ✅ Production |
| 👷 Labour Bookings | Worker discovery, booking, and attendance tracking | ✅ Production |
| 🚛 Transport | Vehicle booking for farm produce | ✅ Production |
| 💎 Premium Suite | 9 premium modules (WhatsApp, IoT, Drone, F2C Store, etc.) | ✅ Production |
| 🏢 FPO Mode | Farmer Producer Organization management | ✅ Production |
| 🏭 Industrial Portal | Buyer procurement, quality inspection, analytics | ✅ Production |
| 🤝 Broker Portal | Mandi operations, commission tracking, farmer network | ✅ Production |
| 🏪 Supplier Portal | Product catalog, orders, inventory, farmer outreach | ✅ Production |
| 👷 Labour Portal | Worker registry, job dispatch, payment tracking | ✅ Production |
| 🛡️ Admin Panel | User management, moderation, platform analytics | ✅ Production |

---

## 2. Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  React 18 + Vite 5 + React Router 6                │
│  Vanilla CSS (phase11.css — 2900+ lines)            │
│  PWA (Service Worker + Manifest)                    │
├─────────────────────────────────────────────────────┤
│                  Backend (BaaS)                      │
│  Supabase (PostgreSQL + Auth + Storage + Realtime)  │
│  Row-Level Security on all tables                   │
├─────────────────────────────────────────────────────┤
│                  AI & APIs                           │
│  Google Gemini 2.0 Flash — AI Advisory              │
│  OpenWeatherMap — Weather Data                      │
│  data.gov.in — Government Mandi Prices              │
│  e-NAM — Electronic National Agriculture Market     │
├─────────────────────────────────────────────────────┤
│                  Deployment                          │
│  Vercel (Edge Network, Auto-SSL, CDN)               │
│  GitHub CI/CD Pipeline                              │
└─────────────────────────────────────────────────────┘
```

### File Structure

```
AgriConnect360Web/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   ├── robots.txt             # SEO
│   ├── sitemap.xml            # Sitemap
│   ├── privacy-policy.html    # DPDP compliant
│   └── terms-of-service.html  # Legal
├── src/
│   ├── App.jsx                # Root — routing, sidebar, search
│   ├── main.jsx               # Entry point
│   ├── index.css              # Base styles + design system
│   ├── phase11.css            # Full component library (2900+ lines)
│   ├── pages/                 # 31 page components
│   │   ├── Dashboard.jsx
│   │   ├── WeatherPage.jsx
│   │   ├── MarketPricesPage.jsx
│   │   ├── AIAdvisoryPage.jsx
│   │   ├── CropsPage.jsx
│   │   ├── ExpensesPage.jsx
│   │   ├── SalesPage.jsx
│   │   ├── InsurancePage.jsx
│   │   ├── SchemesPage.jsx
│   │   ├── PremiumUpgradesPage.jsx
│   │   ├── IndustrialDashboardPage.jsx
│   │   ├── BrokerDashboardPage.jsx
│   │   ├── SupplierDashboardPage.jsx
│   │   ├── LabourDashboardPage.jsx
│   │   ├── AdminDashboardPage.jsx
│   │   └── ... (16 more pages)
│   ├── lib/
│   │   ├── supabase.js        # Supabase client
│   │   ├── i18n.js            # Multi-language (5 languages)
│   │   ├── security.js        # XSS, rate limiting, CSP
│   │   ├── performance.js     # Caching, Web Vitals
│   │   ├── consent.js         # DPDP Act consent management
│   │   ├── offlineQueue.js    # Offline-first queue
│   │   ├── hooks/
│   │   │   ├── useAuth.js     # Auth + 7 role system
│   │   │   └── useMobile.js   # Mobile detection + haptics
│   │   └── services/
│   │       ├── advancedAI.js      # 8 AI functions
│   │       ├── iotService.js      # 5 IoT integrations
│   │       ├── financialService.js # KCC, EMI, Insurance
│   │       ├── commerceService.js  # F2C Store, Quality, Delivery
│   │       └── mandiService.js     # Market price fetching
│   └── tests/
│       └── platform.test.js   # 40+ unit tests
├── vercel.json                # Deployment config + security headers
├── vite.config.js             # Build configuration
└── package.json               # Dependencies
```

---

## 3. Getting Started

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- Supabase account (free tier works)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/agriconnect360.git
cd agriconnect360

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys (see section 7)

# Start development server
npm run dev
# → Opens at http://localhost:5173
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | ✅ Yes |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | ⚠️ For AI features |
| `VITE_OPENWEATHER_KEY` | OpenWeatherMap API key | ⚠️ For weather |
| `VITE_DATA_GOV_KEY` | data.gov.in API key | ⚠️ For mandi prices |

---

## 4. User Guide

### For Farmers

1. **Login** — Enter phone number → receive OTP → verify
2. **Onboarding** — Complete 3-step wizard (personal info, farm details, preferences)
3. **Dashboard** — View weather, alerts, crop status, market prices at a glance
4. **Weather** — 5-day forecast with farming-specific advisories
5. **Market Prices** — Live mandi prices, best selling location recommendations
6. **AI Advisory** — Ask questions about crops, get disease detection, yield predictions
7. **Expenses** — Track farm inputs/outputs, view profit/loss reports
8. **Insurance** — Calculate premiums, apply for PMFBY, track claims
9. **Schemes** — Check eligibility for PM-KISAN, KCC, YSR Rythu Bharosa
10. **Premium** — Access advanced features (IoT, Drone, WhatsApp Bot, F2C Store)

### For Industrial Buyers

1. Login → Role auto-detected as "industrial"
2. Dashboard shows: Procurement, Farmer Sourcing, Quality Inspection, Payments, Analytics
3. Create procurement orders specifying crop, quantity, quality requirements
4. View farmer network by district and crop type
5. Manage quality inspections with moisture/impurity/grade tracking

### For Brokers

1. Login → Role: "broker"
2. Dashboard: Farmer Network, Mandi Operations, Buyer Matching, Transport, Intelligence
3. Track live deals with commission calculation
4. Route optimization between mandis

### For Suppliers

1. Login → Role: "supplier"
2. Dashboard: Product Catalog, Orders, Inventory, Farmer Outreach, Payments, Shop Profile
3. Manage SKUs, process orders, send promotional campaigns

### For Labour Associations

1. Login → Role: "labour"
2. Dashboard: Worker Registry, Bookings, Dispatch, Payments, Analytics
3. Register workers with skills/wages, accept booking requests, track attendance

---

## 5. Role-Based Access

### Role Hierarchy

| Role | Access Level | Dashboard Path | Sidebar Items |
|------|-------------|----------------|---------------|
| `admin` | Full platform access + all role views | `/admin` | All farmer + all role dashboards |
| `farmer` | Full farmer features | `/` | 25+ modules |
| `fpo` | Farmer features + FPO management | `/fpo` | Farmer + FPO |
| `industrial` | Industrial dashboard + market/weather | `/industrial-dashboard` | 5 items |
| `broker` | Broker dashboard + market/weather/transport | `/broker-dashboard` | 6 items |
| `supplier` | Supplier dashboard + market/weather | `/supplier-dashboard` | 5 items |
| `labour` | Labour dashboard + weather | `/labour-dashboard` | 4 items |

### Route Guard Components

- **`ProtectedRoute`** — Blocks unauthenticated users, redirects to `/login`
- **`RoleRoute`** — Blocks users without required role, redirects to `/`
- Admin role bypasses all `RoleRoute` guards

---

## 6. Feature Reference

### Premium Modules (Phase 12)

| Tab | Module | Features |
|-----|--------|----------|
| A | 📣 WhatsApp Bot | Auto-alerts, price notifications, AI chat via WhatsApp |
| B | 🌍 IoT Dashboard | Soil moisture, weather station, smart irrigation, NDVI |
| C | 🛸 Drone Reports | NDVI mapping, crop health zones, flight scheduling |
| D | 🛒 F2C Store | Direct farmer-to-consumer marketplace |
| E | ⛓️ Blockchain | Supply chain traceability, quality certificates |
| F | 📊 Advanced Analytics | Revenue forecasting, benchmarking, profit analysis |
| G | 🏦 Financial Services | KCC application, UPI payments, loan EMI calculator |
| H | ☀️ Solar & Carbon | Solar pump monitoring, carbon footprint tracking |
| I | 🎮 Gamification | Farmer leaderboard, streaks, badges, reward coins |

---

## 7. API & Services

### Supabase (Backend)

```javascript
import { supabase } from './lib/supabase';

// Read data
const { data } = await supabase.from('farmers').select('*').eq('district', 'Guntur');

// Insert
await supabase.from('expenses').insert({ farmer_id, category, amount, date });

// Auth
const { data: { user } } = await supabase.auth.getUser();
```

### Gemini AI (Advisory)

```javascript
import { detectCropDisease, predictYield } from './lib/services/advancedAI';

const result = await detectCropDisease('yellow spots on leaves', 'Cotton');
// → { disease: "Leaf Blight", confidence: 85, treatments: [...] }

const yield = await predictYield('Cotton', 5, 'Black', 'Drip', 'Guntur', 'Kharif');
// → { yieldPerAcre: 12, totalYield: 60, revenueEstimate: 420000 }
```

### IoT Integration

```javascript
import { SoilMoistureSensor, IrrigationController } from './lib/services/iotService';

const sensor = new SoilMoistureSensor('S-001', 'field-north');
sensor.addReading(45, 28); // moisture: 45%, temp: 28°C
// → { status: 'moderate', action: 'Schedule irrigation within 24h' }
```

### Financial Services

```javascript
import { calculateEMI, calculateInsurancePremium } from './lib/services/financialService';

calculateEMI(100000, 7, 12);
// → { emi: 8653, totalPayment: 103830, totalInterest: 3830 }

calculateInsurancePremium('Cotton', 5, 200000, 'Kharif');
// → { farmerPremium: 4000, scheme: 'PMFBY', coverageDetails: {...} }
```

---

## 8. Database Schema

### Core Tables

| Table | Description | RLS |
|-------|-------------|-----|
| `profiles` | User profiles with role field | ✅ |
| `farmers` | Farmer-specific data (land, crops, district) | ✅ |
| `fields` | Farm field polygons and metadata | ✅ |
| `crops` | Crop tracking with growth stages | ✅ |
| `expenses` | Farm expense records | ✅ |
| `sales` | Farm sale/revenue records | ✅ |
| `equipment` | Equipment marketplace listings | ✅ |
| `knowledge_articles` | Knowledge base content | Public read |
| `disputes` | Dispute resolution records | ✅ |
| `market_prices` | Cached mandi price data | Public read |

---

## 9. Security

### Implemented Measures

- ✅ **Authentication** — Supabase Auth with OTP-based phone login
- ✅ **Row-Level Security** — Every table has RLS policies
- ✅ **Input Sanitization** — XSS prevention on all user inputs (`security.js`)
- ✅ **Rate Limiting** — Client-side API limiter (60 req/min), auth limiter (5 req/5min)
- ✅ **CSP Headers** — Content Security Policy via Vercel headers
- ✅ **HSTS** — Strict Transport Security with 2-year max-age
- ✅ **X-Frame-Options** — DENY (prevents clickjacking)
- ✅ **Secrets Management** — All keys in `.env`, never committed to Git
- ✅ **DPDP Compliance** — Cookie consent, data export, account deletion

### Security Headers (vercel.json)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
```

---

## 10. Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables — set in Vercel Dashboard:
# Settings → Environment Variables → Add all VITE_* keys
```

### Manual Build

```bash
npm run build    # Creates optimized bundle in /dist
npm run preview  # Preview production build locally
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | ✅ ~1.2s |
| Largest Contentful Paint | < 2.5s | ✅ ~2.0s |
| Time to Interactive | < 3.5s | ✅ ~2.8s |
| Bundle Size (gzipped) | < 300KB | ✅ ~250KB |
| Lighthouse Score | > 90 | ✅ 92 |

---

## 11. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Blank page after login | Clear localStorage, check onboarding completion |
| Weather not loading | Verify `VITE_OPENWEATHER_KEY` is set |
| AI Advisory errors | Check `VITE_GEMINI_API_KEY` validity and quota |
| Market prices stale | API rate limit — prices refresh every 5 min (cached) |
| PWA not installing | Check HTTPS, verify manifest.json, check sw.js |
| Role dashboard 403 | User profile lacks correct role — update in Supabase |

### Debug Mode

Open browser console and run:
```javascript
// Check auth state
JSON.parse(localStorage.getItem('sb-auth-token'))

// Check user role
// In any component: useAuth().userRole

// Clear all caches
localStorage.clear(); location.reload();
```

---

## 12. FAQ

**Q: Is AgriConnect 360 free for farmers?**
A: Yes, the core platform is free. Premium features (IoT, Drone, WhatsApp Bot) require a subscription (₹99/month or ₹999/year).

**Q: Which languages are supported?**
A: English, Telugu (తెలుగు), Hindi (हिन्दी), Kannada (ಕನ್ನಡ), Tamil (தமிழ்).

**Q: Does it work offline?**
A: Yes, critical pages are cached via Service Worker. Data entered offline is synced when connectivity returns.

**Q: How is my data protected?**
A: AES-256 encryption, TLS 1.3, Row-Level Security, DPDP Act compliance. See our [Privacy Policy](/privacy-policy.html).

**Q: Can I delete my account?**
A: Yes. Settings → Delete Account. Data is erased within 30 days per DPDP Act 2023.

**Q: Which districts are supported?**
A: All 13 districts of Andhra Pradesh, with weather and mandi data for each.

**Q: How do I become a supplier/broker on the platform?**
A: Register with your business credentials and request role upgrade. Admin verification required.

---

*Built with ❤️ for the farmers of Andhra Pradesh*
*AgriConnect 360 — Empowering Agriculture Through Technology*
