# 🌾 AgriConnect 360

**Smart Farming Platform for Andhra Pradesh**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://agriconnect360.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

> A comprehensive multi-stakeholder agricultural technology platform connecting farmers, industrial buyers, brokers, suppliers, and labour associations across 13 districts of Andhra Pradesh.

---

## ✨ Features

🌤️ **Weather Intelligence** — 5-day micro-climate forecasts with farming advisories
💰 **Live Market Prices** — Real-time mandi data from e-NAM & data.gov.in
🤖 **AI Advisory** — Gemini-powered crop advisor, disease detection, yield prediction
🌱 **Crop Tracking** — Calendar, growth stages, and activity logging
💳 **Financial Tools** — Expense tracker, EMI calculator, insurance, subsidy tracking
🏛️ **Gov Schemes** — PM-KISAN, PMFBY, YSR Rythu Bharosa eligibility checker
🏭 **Multi-Role Portals** — Dedicated dashboards for 7 stakeholder types
💎 **Premium Suite** — IoT, Drone, WhatsApp Bot, F2C Store, Blockchain, Gamification
🌐 **Multi-Language** — English, Telugu, Hindi, Kannada, Tamil
📱 **PWA** — Installable, offline-capable progressive web app

---

## 🚀 Quick Start

```bash
git clone https://github.com/your-org/agriconnect360.git
cd agriconnect360
npm install
cp .env.example .env    # Add API keys
npm run dev              # → http://localhost:5173
```

---

## 📁 Project Structure

```
src/
├── pages/          → 31 page components (Dashboard, Weather, AI, etc.)
├── lib/
│   ├── hooks/      → useAuth (7 roles), useMobile
│   ├── services/   → AI, IoT, Finance, Commerce, Mandi
│   ├── security.js → XSS prevention, rate limiting
│   ├── i18n.js     → Multi-language system
│   └── consent.js  → DPDP Act compliance
├── tests/          → 40+ unit tests (Vitest)
├── App.jsx         → Root routing + dynamic sidebar
├── index.css       → Design system tokens
└── phase11.css     → Full component library (2950 lines)
```

---

## 👥 Supported Roles

| Role | Portal | Key Features |
|------|--------|-------------|
| 🧑‍🌾 Farmer | `/` | Full platform — weather, market, AI, expenses, insurance |
| 🏭 Industrial | `/industrial-dashboard` | Procurement, quality inspection, analytics |
| 🤝 Broker | `/broker-dashboard` | Mandi ops, buyer matching, commission tracking |
| 🏪 Supplier | `/supplier-dashboard` | Product catalog, orders, inventory, outreach |
| 👷 Labour | `/labour-dashboard` | Worker registry, dispatch, payment tracking |
| 🏢 FPO | `/fpo` | Farmer collective management |
| 🛡️ Admin | `/admin` | User management, moderation, platform analytics |

---

## 🛡️ Security

- Supabase Auth with OTP login
- Row-Level Security on all database tables
- XSS sanitization on all inputs
- CSP, HSTS, X-Frame-Options headers
- Client-side rate limiting
- DPDP Act 2023 compliant (consent, data export, deletion)

---

## 📖 Documentation

- [📘 Full Documentation](DOCUMENTATION.md)
- [🛡️ Admin Guide](ADMIN_GUIDE.md)
- [👩‍💻 Developer Guide](DEVELOPER_GUIDE.md)
- [🔒 Privacy Policy](public/privacy-policy.html)
- [📋 Terms of Service](public/terms-of-service.html)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, React Router 6 |
| Styling | Vanilla CSS (custom design system) |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| AI | Google Gemini 2.0 Flash |
| Weather | OpenWeatherMap API |
| Market Data | data.gov.in, e-NAM |
| Deployment | Vercel (Edge CDN, Auto-SSL) |
| PWA | Service Worker + Web Manifest |

---

## 📊 Build Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1–11 | Core Platform (31 pages, auth, data) | ✅ 100% |
| 12 | Premium Modules (9 tabs: A–I) | ✅ 100% |
| 13 | Role-Based Views (5 dashboards) | ✅ 100% |
| 14 | Advanced Features (i18n, AI, IoT, Finance, Commerce) | ✅ 100% |
| 15 | Production Ready (Security, Performance, Tests, Legal, Docs) | ✅ 100% |

---

*Built with ❤️ for the farmers of Andhra Pradesh*
