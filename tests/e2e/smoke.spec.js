import { test, expect } from '@playwright/test';

// �"��"��"� Public Pages �"��"��"�
test.describe('Public Pages', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RythuSphere/i);
  });

  test('features page loads', async ({ page }) => {
    await page.goto('/features');
    await expect(page.locator('body')).toContainText(/feature/i, { timeout: 8000 });
  });

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('body')).toContainText(/pric/i, { timeout: 8000 });
  });

  test('download page loads', async ({ page }) => {
    await page.goto('/download');
    await expect(page.locator('body')).toContainText(/download|install|app/i, { timeout: 8000 });
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('body')).toContainText(/sign|login|welcome/i, { timeout: 8000 });
  });
});

// �"��"��"� Navigation �"��"��"�
test.describe('Navigation', () => {
  test('home page has nav links', async ({ page }) => {
    await page.goto('/');
    // Check for any links (a tags) on the page
    const links = page.locator('a');
    expect(await links.count()).toBeGreaterThan(0);
  });

  test('unknown route does not crash', async ({ page }) => {
    const resp = await page.goto('/this-page-does-not-exist');
    // SPA routes return 200 � just verify no 500
    expect(resp?.status()).toBeLessThan(500);
  });
});

// �"��"��"� PWA �"��"��"�
test.describe('PWA', () => {
  test('manifest.json is accessible', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response.status()).toBe(200);
    const manifest = await response.json();
    expect(manifest.name).toContain('RythuSphere');
  });

  test('service worker support', async ({ page }) => {
    await page.goto('/');
    const swRegistered = await page.evaluate(() => 'serviceWorker' in navigator);
    expect(swRegistered).toBe(true);
  });
});

// �"��"��"� Responsive �"��"��"�
test.describe('Responsive Design', () => {
  test('mobile viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('tablet viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
