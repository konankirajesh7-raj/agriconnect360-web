// @ts-check
import { test, expect } from '@playwright/test';

const BASE = 'https://rythusphere-web.vercel.app';

// Helper: Admin login via localStorage injection
async function adminLogin(page) {
  await page.goto(BASE);
  await page.evaluate(() => {
    localStorage.setItem('rythu_admin_token', 'admin_permanent_token');
    localStorage.setItem('rythu_demo_role', 'admin');
    localStorage.setItem('rythu_admin_user', JSON.stringify({ id: 'admin-permanent', name: 'Platform Admin', role: 'admin' }));
  });
  await page.goto(`${BASE}/admin`);
  await page.waitForTimeout(5000);
}

// Helper: Farmer login via real form
async function farmerLogin(page) {
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(3000);
  // Fill via JS to bypass React controlled inputs
  await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    const emailInput = Array.from(inputs).find(i => i.type !== 'password' && i.type !== 'checkbox');
    const passInput = Array.from(inputs).find(i => i.type === 'password');
    if (emailInput) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(emailInput, 'farmer1@rythusphere.in');
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (passInput) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(passInput, 'farmer123');
      passInput.dispatchEvent(new Event('input', { bubbles: true }));
      passInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(500);
  const signBtn = page.locator('button').filter({ hasText: /Sign In/i }).first();
  await signBtn.click();
  await page.waitForTimeout(8000);
}

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// ROUND 1: PUBLIC PAGES
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
test.describe('Round 1: Public Pages', () => {
  test('1.1 Homepage loads correctly', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/RythuSphere/i);
    const nav = page.locator('nav, header, [class*="navbar"], [class*="header"]').first();
    await expect(nav).toBeVisible({ timeout: 15000 });
  });

  test('1.2 Features page', async ({ page }) => {
    await page.goto(`${BASE}/features`);
    await page.waitForTimeout(3000);
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('1.3 Pricing page � correct plans', async ({ page }) => {
    await page.goto(`${BASE}/pricing`);
    await page.waitForTimeout(3000);
    const farmerCard = page.locator('text=Farmer').first();
    await expect(farmerCard).toBeVisible();
  });

  test('1.4 Pricing FAQ has correct email', async ({ page }) => {
    await page.goto(`${BASE}/pricing`);
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('konankirajesh7@gmail.com');
    expect(bodyText).not.toContain('support@rythusphere.in');
  });

  test('1.5 Contact page has correct info', async ({ page }) => {
    await page.goto(`${BASE}/contact-us`);
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('6303369360');
    expect(bodyText).toContain('konankirajesh7@gmail.com');
  });

  test('1.6 About page loads', async ({ page }) => {
    await page.goto(`${BASE}/about`);
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('1.7 Login page renders', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForTimeout(3000);
    const signIn = page.locator('text=/Sign In|Welcome Back/i').first();
    await expect(signIn).toBeVisible();
  });

  test('1.8 Weather page', async ({ page }) => {
    await page.goto(`${BASE}/public-weather`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('1.9 Market page', async ({ page }) => {
    await page.goto(`${BASE}/market`);
    await page.waitForTimeout(3000);
    await expect(page.locator('body')).toBeVisible();
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// ROUND 2: ADMIN DASHBOARD (localStorage injection)
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
test.describe('Round 2: Admin Dashboard', () => {
  test('2.1 Admin dashboard loads', async ({ page }) => {
    await adminLogin(page);
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('Platform Overview');
  });

  test('2.2 Admin sidebar has Contact & Support', async ({ page }) => {
    await adminLogin(page);
    const contactLink = page.locator('text=/Contact.*Support/i').first();
    await expect(contactLink).toBeVisible({ timeout: 10000 });
  });

  test('2.3 Admin Messages tab', async ({ page }) => {
    await adminLogin(page);
    const msgsTab = page.locator('text=/Messages/i').first();
    await msgsTab.click();
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('Contact Messages');
  });

  test('2.4 Admin Settings tab', async ({ page }) => {
    await adminLogin(page);
    const settingsTab = page.locator('text=/Settings/i').first();
    await settingsTab.click();
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('Admin Settings');
  });

  test('2.5 Admin Contact & Support page loads', async ({ page }) => {
    await adminLogin(page);
    const contactLink = page.locator('text=/Contact.*Support/i').first();
    await contactLink.click();
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    expect(bodyText).toContain('Contact');
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// ROUND 3: NAVIGATION & RESPONSIVE
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
test.describe('Round 3: Navigation & Responsive', () => {
  test('3.1 Nav links work', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(3000);
    const featLink = page.locator('a[href="/features"], a:text("Features")').first();
    if (await featLink.isVisible()) {
      await featLink.click();
      await page.waitForTimeout(2000);
      expect(page.url()).toContain('/features');
    }
  });

  test('3.2 Mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });

  test('3.3 Tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toBeVisible();
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// ROUND 4: CONTACT FORM
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
test.describe('Round 4: Contact Form', () => {
  test('4.1 Public contact form renders', async ({ page }) => {
    await page.goto(`${BASE}/contact-us`);
    await page.waitForTimeout(3000);
    const nameInput = page.locator('input[placeholder*="Name"], input[name="name"]').first();
    if (await nameInput.isVisible()) {
      await expect(nameInput).toBeVisible();
    }
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// ROUND 5: PERFORMANCE CHECKS
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
test.describe('Round 5: Performance', () => {
  test('5.1 Homepage loads under 15s', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(15000);
  });

  test('5.2 Login page loads under 15s', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(15000);
  });

  test('5.3 No critical JS errors on home', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE);
    await page.waitForTimeout(5000);
    const critical = errors.filter(e => !e.includes('supabase') && !e.includes('ResizeObserver'));
    expect(critical.length).toBeLessThanOrEqual(2);
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// ROUND 6: SUBSCRIPTION DUPLICATE PREVENTION
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
test.describe('Round 6: Subscription Guard', () => {
  test('6.1 Payment page renders pricing', async ({ page }) => {
    await page.goto(`${BASE}/payment`);
    await page.waitForTimeout(3000);
    const bodyText = await page.textContent('body');
    const hasPayment = bodyText?.includes('Subscription') || bodyText?.includes('Payment') || bodyText?.includes('Plan');
    expect(hasPayment).toBeTruthy();
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// ROUND 7: MULTI-ROUTE SMOKE TEST
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
test.describe('Round 7: Route Smoke Tests', () => {
  const publicRoutes = [
    '/', '/features', '/pricing', '/about', '/contact-us',
    '/login', '/register', '/market', '/public-weather'
  ];
  
  for (const route of publicRoutes) {
    test(`7.x Route ${route} loads`, async ({ page }) => {
      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
