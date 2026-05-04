import { test, expect } from '@playwright/test';

const BASE = 'https://rythusphere-web.vercel.app';

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 1. PUBLIC PAGES � All accessible without login
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('Public Pages', () => {
  const publicPages = [
    { path: '/', title: 'Home', mustContain: 'RythuSphere' },
    { path: '/features', title: 'Features' },
    { path: '/about', title: 'About' },
    { path: '/pricing', title: 'Pricing' },
    { path: '/contact-us', title: 'Contact' },
    { path: '/blog', title: 'Blog' },
    { path: '/login', title: 'Login' },
    { path: '/download', title: 'Download' },
  ];

  for (const pg of publicPages) {
    test(`${pg.title} page loads (${pg.path})`, async ({ page }) => {
      const resp = await page.goto(pg.path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      expect(resp?.status()).toBeLessThan(400);
      if (pg.mustContain) {
        await expect(page.locator('body')).toContainText(pg.mustContain, { timeout: 8000 });
      }
    });
  }

  test('Home page has navigation links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('a[href="/features"], a[href="/about"], a[href="/pricing"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('Login page shows Sign In form', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    // Should see sign-in related text
    await expect(page.locator('body')).toContainText(/sign|login|welcome/i, { timeout: 8000 });
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 2. LOGIN PAGE � UI elements check
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('Login Page UI', () => {
  test('Has Google sign-in button', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const googleBtn = page.locator('text=/Google/i').first();
    await expect(googleBtn).toBeVisible({ timeout: 8000 });
  });

  test('Has email/password fields', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    // Click "Welcome Back" tab if present
    const welcomeTab = page.locator('text=/Welcome Back|Sign In|Login/i').first();
    if (await welcomeTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await welcomeTab.click();
    }
    await page.waitForTimeout(500);
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test('No demo/explore button visible', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const demoBtn = page.locator('text=/explore demo|try demo/i');
    await expect(demoBtn).toHaveCount(0, { timeout: 3000 });
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 3. ONBOARDING PAGE � Layout check
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('Onboarding Page', () => {
  test('Onboarding page loads', async ({ page }) => {
    const resp = await page.goto('/onboarding', { waitUntil: 'domcontentloaded', timeout: 15000 });
    expect(resp?.status()).toBeLessThan(400);
  });

  test('Shows language selection as first step', async ({ page }) => {
    await page.goto('/onboarding', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/language|భాష|भाषा/i, { timeout: 8000 });
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 4. SUBSCRIPTION / PAYMENT PAGE � Layout
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('Subscription Page', () => {
  test('Payment page loads', async ({ page }) => {
    const resp = await page.goto('/subscription', { waitUntil: 'domcontentloaded', timeout: 15000 });
    expect(resp?.status()).toBeLessThan(400);
  });

  test('Shows correct pricing text', async ({ page }) => {
    await page.goto('/subscription', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/subscription|payment|plan/i, { timeout: 8000 });
  });

  test('Coupon code input exists', async ({ page }) => {
    await page.goto('/payment', { waitUntil: 'domcontentloaded' });
    // Should have a coupon input somewhere
    const couponArea = page.locator('text=/coupon|code/i').first();
    await expect(couponArea).toBeVisible({ timeout: 8000 });
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 5. ADMIN PAGES � Route check
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('Admin Routes', () => {
  test('Admin page loads (secret route)', async ({ page }) => {
    const resp = await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    expect(resp?.status()).toBeLessThan(400);
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 6. RESPONSIVE � Mobile viewport test
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('Responsive Design', () => {
  test('Home page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText('RythuSphere', { timeout: 8000 });
  });

  test('Login page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/sign|login|welcome/i, { timeout: 8000 });
  });

  test('Payment page renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/payment', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/subscription|payment/i, { timeout: 8000 });
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 7. SEO CHECKS
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('SEO', () => {
  test('Home page has proper title tag', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });

  test('Home page has meta description', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const metaDesc = await page.locator('meta[name="description"]').first().getAttribute('content');
    expect(metaDesc?.length || 0).toBeGreaterThan(10);
  });

  test('Has viewport meta tag', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 8. 404 / NOT FOUND
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('Error Handling', () => {
  test('Unknown route does not crash', async ({ page }) => {
    const resp = await page.goto('/some-random-nonexistent-page-xyz', { waitUntil: 'domcontentloaded', timeout: 15000 });
    // SPA should still return 200 (client-side routing)
    expect(resp?.status()).toBeLessThan(500);
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 9. PERFORMANCE BASICS
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('Performance', () => {
  test('Home page loads under 10 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/', { waitUntil: 'load', timeout: 15000 });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(10000);
  });

  test('Login page loads under 8 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/login', { waitUntil: 'load', timeout: 15000 });
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(8000);
  });
});

// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�
// 10. CONSOLE ERRORS CHECK
// �"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"��"�

test.describe('Console Errors', () => {
  const criticalPages = ['/', '/login', '/onboarding', '/payment'];
  
  for (const path of criticalPages) {
    test(`No JS crash errors on ${path}`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      // Filter out known non-critical errors
      const critical = errors.filter(e => !e.includes('ResizeObserver') && !e.includes('Non-Error'));
      expect(critical.length).toBe(0);
    });
  }
});
