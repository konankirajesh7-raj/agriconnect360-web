# AgriConnect 360 — Developer Onboarding Guide

> Quick-start for new developers joining the project

---

## 1. Setup (5 minutes)

```bash
git clone <repo-url>
cd AgriConnect360Web
npm install
cp .env.example .env   # Add your API keys
npm run dev             # → http://localhost:5173
```

---

## 2. Code Conventions

### File Naming
- Pages: `PascalCase` → `WeatherPage.jsx`, `IndustrialDashboardPage.jsx`
- Services: `camelCase` → `mandiService.js`, `advancedAI.js`
- Hooks: `use` prefix → `useAuth.js`, `useMobile.js`
- CSS: Single file architecture → `phase11.css` (2900+ lines with section headers)

### CSS Class Naming
```
Standard components:  .card, .btn, .section-header
Premium modules:      .prem-*  (prem-tab-row, prem-card, prem-metric)
Role dashboards:      .role-*  (role-table, role-badge, role-grid-3)
```

### Component Pattern
```jsx
import React, { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';

const TABS = [/* ... */];
const DEMO_DATA = [/* fallback data */];

export default function PageName() {
  const { farmerProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('first');

  return (
    <div className="animated">
      <div className="section-header">
        <div className="section-title">🎯 Page Title</div>
      </div>
      <div className="prem-tab-row">
        {TABS.map(t => (
          <button key={t.id} className={`prem-tab-btn${activeTab === t.id ? ' active' : ''}`}
            onClick={() => setActiveTab(t.id)}>
            <span className="prem-tab-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>
      {/* Tab content */}
    </div>
  );
}
```

---

## 3. Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Vanilla CSS** over Tailwind | Full control, no build dependency, smaller bundle |
| **Single CSS file** | Fast search, no import chains, CSS custom properties for theming |
| **Demo data fallbacks** | Every page works without Supabase connection |
| **Lazy loading** all pages | Initial bundle stays under 100KB |
| **No state management lib** | React Context + useState is sufficient for current scale |
| **Client-side rate limiting** | Protects API quotas without backend middleware |

---

## 4. Adding a New Page

1. Create `src/pages/NewPage.jsx` using the component pattern above
2. Add lazy import in `App.jsx`:
   ```javascript
   const NewPage = lazy(() => import('./pages/NewPage'));
   ```
3. Add route in the `<Routes>` block:
   ```jsx
   <Route path="/new-page" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
   ```
4. Add sidebar entry in `getNavSections()`:
   ```javascript
   { path: '/new-page', icon: '🆕', label: 'New Page' },
   ```
5. Add CSS classes to `phase11.css` if needed (use appropriate namespace)

---

## 5. Adding a New Role

1. Add role to `VALID_ROLES` in `useAuth.js`
2. Add nav config in `getNavSections()` in `App.jsx`
3. Create dashboard page: `NewRoleDashboardPage.jsx`
4. Add `RoleRoute` in the routes block
5. Update sidebar subtitle map in `App.jsx`

---

## 6. Testing

```bash
# Run unit tests
npx vitest run

# Run specific test file
npx vitest run src/tests/platform.test.js

# Watch mode
npx vitest
```

---

## 7. Deployment

```bash
# Production build
npm run build

# Deploy to Vercel
vercel --prod

# Preview deployment
vercel
```

---

## 8. Important Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `App.jsx` | Root component, routing, sidebar, search | ~535 |
| `phase11.css` | Complete design system | ~2950 |
| `useAuth.js` | Authentication + 7-role system | ~375 |
| `Dashboard.jsx` | Main farmer dashboard | ~400 |
| `PremiumUpgradesPage.jsx` | 9-tab premium module | ~800 |
| `security.js` | XSS, validation, rate limiting | ~100 |
| `advancedAI.js` | 8 Gemini-powered AI functions | ~100 |

---

*Welcome to the team! 🌾*
