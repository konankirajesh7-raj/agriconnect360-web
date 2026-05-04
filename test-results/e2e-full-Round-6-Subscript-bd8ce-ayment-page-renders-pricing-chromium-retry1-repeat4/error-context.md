# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-full.spec.js >> Round 6: Subscription Guard >> 6.1 Payment page renders pricing
- Location: tests\e2e-full.spec.js:235:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.goto: Test timeout of 60000ms exceeded.
Call log:
  - navigating to "https://agriconnect360-web.vercel.app/payment", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]: \n
```

# Test source

```ts
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
  223 |     page.on('pageerror', err => errors.push(err.message));
  224 |     await page.goto(BASE);
  225 |     await page.waitForTimeout(5000);
  226 |     const critical = errors.filter(e => !e.includes('supabase') && !e.includes('ResizeObserver'));
  227 |     expect(critical.length).toBeLessThanOrEqual(2);
  228 |   });
  229 | });
  230 | 
  231 | // ═══════════════════════════════════════════════════════════════════
  232 | // ROUND 6: SUBSCRIPTION DUPLICATE PREVENTION
  233 | // ═══════════════════════════════════════════════════════════════════
  234 | test.describe('Round 6: Subscription Guard', () => {
  235 |   test('6.1 Payment page renders pricing', async ({ page }) => {
> 236 |     await page.goto(`${BASE}/payment`);
      |                ^ Error: page.goto: Test timeout of 60000ms exceeded.
  237 |     await page.waitForTimeout(3000);
  238 |     const bodyText = await page.textContent('body');
  239 |     const hasPayment = bodyText?.includes('Subscription') || bodyText?.includes('Payment') || bodyText?.includes('Plan');
  240 |     expect(hasPayment).toBeTruthy();
  241 |   });
  242 | });
  243 | 
  244 | // ═══════════════════════════════════════════════════════════════════
  245 | // ROUND 7: MULTI-ROUTE SMOKE TEST
  246 | // ═══════════════════════════════════════════════════════════════════
  247 | test.describe('Round 7: Route Smoke Tests', () => {
  248 |   const publicRoutes = [
  249 |     '/', '/features', '/pricing', '/about', '/contact-us',
  250 |     '/login', '/register', '/market', '/public-weather'
  251 |   ];
  252 |   
  253 |   for (const route of publicRoutes) {
  254 |     test(`7.x Route ${route} loads`, async ({ page }) => {
  255 |       const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  256 |       expect(response?.status()).toBeLessThan(500);
  257 |       await expect(page.locator('body')).toBeVisible();
  258 |     });
  259 |   }
  260 | });
  261 | 
```