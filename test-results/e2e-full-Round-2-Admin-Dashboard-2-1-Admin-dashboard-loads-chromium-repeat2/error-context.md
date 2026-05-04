# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-full.spec.js >> Round 2: Admin Dashboard >> 2.1 Admin dashboard loads
- Location: tests\e2e-full.spec.js:119:3

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "Platform Overview"
Received string:    "\\n··
  AgriConnect 360 — Smart Agriculture Platform····································
  {
    \"@context\": \"https://schema.org\",
    \"@type\": \"SoftwareApplication\",
    \"name\": \"AgriConnect 360\",
    \"applicationCategory\": \"BusinessApplication\",
    \"operatingSystem\": \"Web, Android, iOS\",
    \"description\": \"Comprehensive agricultural management platform for Indian farmers with 22+ modules including market prices, crop tracking, weather forecasts, AI advisory, and government schemes.\",
    \"url\": \"https://www.agriconnect360.in\",
    \"author\": { \"@type\": \"Organization\", \"name\": \"AgriConnect 360\" },
    \"offers\": { \"@type\": \"Offer\", \"price\": \"0\", \"priceCurrency\": \"INR\" },
    \"aggregateRating\": { \"@type\": \"AggregateRating\", \"ratingValue\": \"4.8\", \"ratingCount\": \"1200\" },
    \"areaServed\": { \"@type\": \"State\", \"name\": \"Andhra Pradesh\", \"containedInPlace\": { \"@type\": \"Country\", \"name\": \"India\" } },
    \"availableLanguage\": [\"en\", \"te\", \"hi\"]
  }·················
  Skip to main content🌾అగ్రి కనెక్ట్ 360అడ్మిన్ డాష్‌బోర్డ్Control Center🛡️డాష్‌బోర్డ్NEW📢Ad ApprovalsNEWManage👥Users💬Community Posts🏪మార్కెట్‌ప్లేస్⚖️వివాదాలు📞Contact & Support🟢 వ్యవస్థ పనిచేస్తోంది7 మాడ్యూల్స్ యాక్టివ్👤 నా ప్రొఫైల్⚙️ సెట్టింగ్‌లు🚪 లాగ్‌అవుట్☰🛡️ డాష్‌బోర్డ్🔍 Search Ctrl+K🔔 🌐 తె ▾
        @keyframes bgShift{0%{filter:brightness(1) saturate(1)}50%{filter:brightness(1.05) saturate(1.1)}100%{filter:brightness(0.95) saturate(1.05)}}
        @keyframes cdA0{0%{transform:translateX(-200px)}100%{transform:translateX(calc(100vw + 200px))}}
        @keyframes cdA1{0%{transform:translateX(calc(100vw + 200px))}100%{transform:translateX(-200px)}}
      📍Enable location for weather & pricesAllow
        @keyframes adminFadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .admin-animate{animation:adminFadeIn 0.3s ease}
        .admin-tab{padding:10px 18px;border-radius:12;border:1px solid transparent;background:transparent;color:#64748b;font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.25s;display:flex;align-items:center;gap:6px}
        .admin-tab:hover{background:rgba(255,255,255,0.04);color:#94a3b8}
        .admin-tab.active{background:linear-gradient(135deg,rgba(129,140,248,0.15),rgba(192,132,252,0.1));color:#a78bfa;border-color:rgba(129,140,248,0.25)}
        .admin-row:hover{background:rgba(255,255,255,0.03)!important}
        .admin-btn:hover{filter:brightness(1.3);transform:translateY(-1px)}
      AgriConnect AdminPlatform Control Center● Live🔄 Refresh📊 Overview📢 Ads👥 Users💬 Posts🏪 Market⚖️ Disputes💳 Payments📩 Messages⚙️ Settings🛡️Loading platform data...🛡️Dashboard📢Ads👥Users💬Posts⚖️Disputes💸 Add Expense🤖 Ask AI📊 Check Prices⚡🐛🍪 Cookie NoticeWe use essential cookies for authentication and app functionality. Optional analytics cookies help us improve your experience. See our Privacy Policy.Essential OnlyAccept All···
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('🌾 SW registered:', reg.scope))
          .catch(err => console.log('SW registration failed:', err));
      });
    }·····
"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - text: \n
  - generic [ref=e3]:
    - link "Skip to main content" [ref=e4] [cursor=pointer]:
      - /url: "#main-content"
    - navigation [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: 🌾
        - generic [ref=e8]:
          - generic [ref=e9]: అగ్రి కనెక్ట్ 360
          - generic [ref=e10]: అడ్మిన్ డాష్‌బోర్డ్
      - generic [ref=e11]:
        - generic [ref=e12]:
          - generic [ref=e13]: Control Center
          - link "🛡️ డాష్‌బోర్డ్ NEW" [ref=e14] [cursor=pointer]:
            - /url: /admin
            - generic [ref=e15]: 🛡️
            - text: డాష్‌బోర్డ్
            - generic [ref=e16]: NEW
          - link "📢 Ad Approvals NEW" [ref=e17] [cursor=pointer]:
            - /url: /admin/ads
            - generic [ref=e18]: 📢
            - text: Ad Approvals
            - generic [ref=e19]: NEW
        - generic [ref=e20]:
          - generic [ref=e21]: Manage
          - link "👥 Users" [ref=e22] [cursor=pointer]:
            - /url: /admin/users
            - generic [ref=e23]: 👥
            - text: Users
          - link "💬 Community Posts" [ref=e24] [cursor=pointer]:
            - /url: /admin/posts
            - generic [ref=e25]: 💬
            - text: Community Posts
          - link "🏪 మార్కెట్‌ప్లేస్" [ref=e26] [cursor=pointer]:
            - /url: /admin/marketplace
            - generic [ref=e27]: 🏪
            - text: మార్కెట్‌ప్లేస్
          - link "⚖️ వివాదాలు" [ref=e28] [cursor=pointer]:
            - /url: /admin/disputes
            - generic [ref=e29]: ⚖️
            - text: వివాదాలు
          - link "📞 Contact & Support" [ref=e30] [cursor=pointer]:
            - /url: /contact
            - generic [ref=e31]: 📞
            - text: Contact & Support
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]: 🟢 వ్యవస్థ పనిచేస్తోంది
          - generic [ref=e35]: 7 మాడ్యూల్స్ యాక్టివ్
        - button "👤 నా ప్రొఫైల్" [ref=e36] [cursor=pointer]
        - button "⚙️ సెట్టింగ్‌లు" [ref=e37] [cursor=pointer]
        - button "🚪 లాగ్‌అవుట్" [ref=e38] [cursor=pointer]
    - banner [ref=e39]:
      - generic [ref=e40]:
        - button "☰" [ref=e41] [cursor=pointer]
        - generic [ref=e42]: 🛡️ డాష్‌బోర్డ్
      - generic [ref=e43]:
        - button "🔍 Search Ctrl+K" [ref=e44] [cursor=pointer]:
          - text: 🔍
          - generic [ref=e45]: Search
          - generic [ref=e46]: Ctrl+K
        - button "🔔" [ref=e47] [cursor=pointer]: 🔔
        - button "🌐 తె ▾" [ref=e50] [cursor=pointer]
    - generic:
      - img
    - main "Main content" [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]: 📍
        - generic [ref=e54]: Enable location for weather & prices
        - button "Allow" [ref=e55] [cursor=pointer]
      - generic [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]:
            - generic [ref=e59]: AgriConnect Admin
            - generic [ref=e60]: Platform Control Center
          - generic [ref=e61]:
            - generic [ref=e62]: ● Live
            - button "🔄 Refresh" [ref=e63] [cursor=pointer]
        - generic [ref=e64]:
          - button "📊 Overview" [ref=e65] [cursor=pointer]
          - button "📢 Ads" [ref=e66] [cursor=pointer]
          - button "👥 Users" [ref=e67] [cursor=pointer]
          - button "💬 Posts" [ref=e68] [cursor=pointer]
          - button "🏪 Market" [ref=e69] [cursor=pointer]
          - button "⚖️ Disputes" [ref=e70] [cursor=pointer]
          - button "💳 Payments" [ref=e71] [cursor=pointer]
          - button "📩 Messages" [ref=e72] [cursor=pointer]
          - button "⚙️ Settings" [ref=e73] [cursor=pointer]
        - generic [ref=e75]:
          - generic [ref=e76]: 🛡️
          - text: Loading platform data...
    - generic:
      - generic: 💸 Add Expense
      - generic: 🤖 Ask AI
      - generic: 📊 Check Prices
    - button "Report a bug" [ref=e77] [cursor=pointer]: 🐛
    - generic [ref=e78]:
      - generic [ref=e79]:
        - generic [ref=e80]: 🍪 Cookie Notice
        - generic [ref=e81]:
          - text: We use essential cookies for authentication and app functionality. Optional analytics cookies help us improve your experience. See our
          - link "Privacy Policy" [ref=e82] [cursor=pointer]:
            - /url: /privacy-policy.html
          - text: .
      - generic [ref=e83]:
        - button "Essential Only" [ref=e84] [cursor=pointer]
        - button "Accept All" [ref=e85] [cursor=pointer]
```

# Test source

```ts
  22  |   // Fill via JS to bypass React controlled inputs
  23  |   await page.evaluate(() => {
  24  |     const inputs = document.querySelectorAll('input');
  25  |     const emailInput = Array.from(inputs).find(i => i.type !== 'password' && i.type !== 'checkbox');
  26  |     const passInput = Array.from(inputs).find(i => i.type === 'password');
  27  |     if (emailInput) {
  28  |       const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  29  |       nativeInputValueSetter.call(emailInput, 'farmer1@agriconnect360.in');
  30  |       emailInput.dispatchEvent(new Event('input', { bubbles: true }));
  31  |       emailInput.dispatchEvent(new Event('change', { bubbles: true }));
  32  |     }
  33  |     if (passInput) {
  34  |       const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  35  |       nativeInputValueSetter.call(passInput, 'farmer123');
  36  |       passInput.dispatchEvent(new Event('input', { bubbles: true }));
  37  |       passInput.dispatchEvent(new Event('change', { bubbles: true }));
  38  |     }
  39  |   });
  40  |   await page.waitForTimeout(500);
  41  |   const signBtn = page.locator('button').filter({ hasText: /Sign In/i }).first();
  42  |   await signBtn.click();
  43  |   await page.waitForTimeout(8000);
  44  | }
  45  | 
  46  | // ═══════════════════════════════════════════════════════════════════
  47  | // ROUND 1: PUBLIC PAGES
  48  | // ═══════════════════════════════════════════════════════════════════
  49  | test.describe('Round 1: Public Pages', () => {
  50  |   test('1.1 Homepage loads correctly', async ({ page }) => {
  51  |     await page.goto(BASE);
  52  |     await expect(page).toHaveTitle(/AgriConnect/i);
  53  |     const nav = page.locator('nav, header, [class*="navbar"], [class*="header"]').first();
  54  |     await expect(nav).toBeVisible({ timeout: 15000 });
  55  |   });
  56  | 
  57  |   test('1.2 Features page', async ({ page }) => {
  58  |     await page.goto(`${BASE}/features`);
  59  |     await page.waitForTimeout(3000);
  60  |     const heading = page.locator('h1, h2').first();
  61  |     await expect(heading).toBeVisible();
  62  |   });
  63  | 
  64  |   test('1.3 Pricing page — correct plans', async ({ page }) => {
  65  |     await page.goto(`${BASE}/pricing`);
  66  |     await page.waitForTimeout(3000);
  67  |     const farmerCard = page.locator('text=Farmer').first();
  68  |     await expect(farmerCard).toBeVisible();
  69  |   });
  70  | 
  71  |   test('1.4 Pricing FAQ has correct email', async ({ page }) => {
  72  |     await page.goto(`${BASE}/pricing`);
  73  |     await page.waitForTimeout(2000);
  74  |     await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  75  |     await page.waitForTimeout(1500);
  76  |     const bodyText = await page.textContent('body');
  77  |     expect(bodyText).toContain('konankirajesh7@gmail.com');
  78  |     expect(bodyText).not.toContain('support@agriconnect360.in');
  79  |   });
  80  | 
  81  |   test('1.5 Contact page has correct info', async ({ page }) => {
  82  |     await page.goto(`${BASE}/contact-us`);
  83  |     await page.waitForTimeout(3000);
  84  |     const bodyText = await page.textContent('body');
  85  |     expect(bodyText).toContain('6303369360');
  86  |     expect(bodyText).toContain('konankirajesh7@gmail.com');
  87  |   });
  88  | 
  89  |   test('1.6 About page loads', async ({ page }) => {
  90  |     await page.goto(`${BASE}/about`);
  91  |     await page.waitForTimeout(2000);
  92  |     await expect(page.locator('body')).toBeVisible();
  93  |   });
  94  | 
  95  |   test('1.7 Login page renders', async ({ page }) => {
  96  |     await page.goto(`${BASE}/login`);
  97  |     await page.waitForTimeout(3000);
  98  |     const signIn = page.locator('text=/Sign In|Welcome Back/i').first();
  99  |     await expect(signIn).toBeVisible();
  100 |   });
  101 | 
  102 |   test('1.8 Weather page', async ({ page }) => {
  103 |     await page.goto(`${BASE}/public-weather`);
  104 |     await page.waitForTimeout(3000);
  105 |     await expect(page.locator('body')).toBeVisible();
  106 |   });
  107 | 
  108 |   test('1.9 Market page', async ({ page }) => {
  109 |     await page.goto(`${BASE}/market`);
  110 |     await page.waitForTimeout(3000);
  111 |     await expect(page.locator('body')).toBeVisible();
  112 |   });
  113 | });
  114 | 
  115 | // ═══════════════════════════════════════════════════════════════════
  116 | // ROUND 2: ADMIN DASHBOARD (localStorage injection)
  117 | // ═══════════════════════════════════════════════════════════════════
  118 | test.describe('Round 2: Admin Dashboard', () => {
  119 |   test('2.1 Admin dashboard loads', async ({ page }) => {
  120 |     await adminLogin(page);
  121 |     const bodyText = await page.textContent('body');
> 122 |     expect(bodyText).toContain('Platform Overview');
      |                      ^ Error: expect(received).toContain(expected) // indexOf
  123 |   });
  124 | 
  125 |   test('2.2 Admin sidebar has Contact & Support', async ({ page }) => {
  126 |     await adminLogin(page);
  127 |     const contactLink = page.locator('text=/Contact.*Support/i').first();
  128 |     await expect(contactLink).toBeVisible({ timeout: 10000 });
  129 |   });
  130 | 
  131 |   test('2.3 Admin Messages tab', async ({ page }) => {
  132 |     await adminLogin(page);
  133 |     const msgsTab = page.locator('text=/Messages/i').first();
  134 |     await msgsTab.click();
  135 |     await page.waitForTimeout(2000);
  136 |     const bodyText = await page.textContent('body');
  137 |     expect(bodyText).toContain('Contact Messages');
  138 |   });
  139 | 
  140 |   test('2.4 Admin Settings tab', async ({ page }) => {
  141 |     await adminLogin(page);
  142 |     const settingsTab = page.locator('text=/Settings/i').first();
  143 |     await settingsTab.click();
  144 |     await page.waitForTimeout(2000);
  145 |     const bodyText = await page.textContent('body');
  146 |     expect(bodyText).toContain('Admin Settings');
  147 |   });
  148 | 
  149 |   test('2.5 Admin Contact & Support page loads', async ({ page }) => {
  150 |     await adminLogin(page);
  151 |     const contactLink = page.locator('text=/Contact.*Support/i').first();
  152 |     await contactLink.click();
  153 |     await page.waitForTimeout(3000);
  154 |     const bodyText = await page.textContent('body');
  155 |     expect(bodyText).toContain('Contact');
  156 |   });
  157 | });
  158 | 
  159 | // ═══════════════════════════════════════════════════════════════════
  160 | // ROUND 3: NAVIGATION & RESPONSIVE
  161 | // ═══════════════════════════════════════════════════════════════════
  162 | test.describe('Round 3: Navigation & Responsive', () => {
  163 |   test('3.1 Nav links work', async ({ page }) => {
  164 |     await page.goto(BASE);
  165 |     await page.waitForTimeout(3000);
  166 |     const featLink = page.locator('a[href="/features"], a:text("Features")').first();
  167 |     if (await featLink.isVisible()) {
  168 |       await featLink.click();
  169 |       await page.waitForTimeout(2000);
  170 |       expect(page.url()).toContain('/features');
  171 |     }
  172 |   });
  173 | 
  174 |   test('3.2 Mobile viewport', async ({ page }) => {
  175 |     await page.setViewportSize({ width: 375, height: 812 });
  176 |     await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  177 |     await page.waitForTimeout(2000);
  178 |     await expect(page.locator('body')).toBeVisible();
  179 |   });
  180 | 
  181 |   test('3.3 Tablet viewport', async ({ page }) => {
  182 |     await page.setViewportSize({ width: 768, height: 1024 });
  183 |     await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  184 |     await page.waitForTimeout(2000);
  185 |     await expect(page.locator('body')).toBeVisible();
  186 |   });
  187 | });
  188 | 
  189 | // ═══════════════════════════════════════════════════════════════════
  190 | // ROUND 4: CONTACT FORM
  191 | // ═══════════════════════════════════════════════════════════════════
  192 | test.describe('Round 4: Contact Form', () => {
  193 |   test('4.1 Public contact form renders', async ({ page }) => {
  194 |     await page.goto(`${BASE}/contact-us`);
  195 |     await page.waitForTimeout(3000);
  196 |     const nameInput = page.locator('input[placeholder*="Name"], input[name="name"]').first();
  197 |     if (await nameInput.isVisible()) {
  198 |       await expect(nameInput).toBeVisible();
  199 |     }
  200 |   });
  201 | });
  202 | 
  203 | // ═══════════════════════════════════════════════════════════════════
  204 | // ROUND 5: PERFORMANCE CHECKS
  205 | // ═══════════════════════════════════════════════════════════════════
  206 | test.describe('Round 5: Performance', () => {
  207 |   test('5.1 Homepage loads under 15s', async ({ page }) => {
  208 |     const start = Date.now();
  209 |     await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  210 |     const loadTime = Date.now() - start;
  211 |     expect(loadTime).toBeLessThan(15000);
  212 |   });
  213 | 
  214 |   test('5.2 Login page loads under 15s', async ({ page }) => {
  215 |     const start = Date.now();
  216 |     await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  217 |     const loadTime = Date.now() - start;
  218 |     expect(loadTime).toBeLessThan(15000);
  219 |   });
  220 | 
  221 |   test('5.3 No critical JS errors on home', async ({ page }) => {
  222 |     const errors = [];
```