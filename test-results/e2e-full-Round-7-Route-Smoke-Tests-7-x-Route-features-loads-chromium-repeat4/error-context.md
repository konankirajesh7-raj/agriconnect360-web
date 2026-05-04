# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-full.spec.js >> Round 7: Route Smoke Tests >> 7.x Route /features loads
- Location: tests\e2e-full.spec.js:254:5

# Error details

```
Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://agriconnect360-web.vercel.app/features
Call log:
  - navigating to "https://agriconnect360-web.vercel.app/features", waiting until "domcontentloaded"

```

# Test source

```ts
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
  236 |     await page.goto(`${BASE}/payment`);
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
> 255 |       const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
      |                                   ^ Error: page.goto: net::ERR_INTERNET_DISCONNECTED at https://agriconnect360-web.vercel.app/features
  256 |       expect(response?.status()).toBeLessThan(500);
  257 |       await expect(page.locator('body')).toBeVisible();
  258 |     });
  259 |   }
  260 | });
  261 | 
```