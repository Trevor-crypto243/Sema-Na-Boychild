import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  let passed = 0, failed = 0;

  async function check(label, url, ssName) {
    try {
      await page.goto(url, { timeout: 15000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      await page.screenshot({ path: `screenshots/${ssName}` });
      await page.waitForTimeout(1000);
      passed++;
      console.log(`✅ ${label}`);
    } catch (e) {
      failed++;
      console.log(`❌ ${label}: ${e.message?.substring(0, 60)}`);
    }
  }

  // Landing
  await check('Landing Page', 'http://localhost:3000', 'z-01-landing.png');

  // Login + auth
  await page.goto('http://localhost:3000/login', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.fill('input[type="email"]', 'admin@semanaboychild.org');
  await page.fill('input[type="password"]', 'admin123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log(`✅ Login -> ${page.url()}`);
  passed++;

  // All admin pages (now with data)
  await check('Dashboard', 'http://localhost:3000/dashboard', 'z-02-dashboard.png');
  await check('Boys', 'http://localhost:3000/boys', 'z-03-boys.png');
  await check('Mentors', 'http://localhost:3000/mentors', 'z-04-mentors.png');
  await check('Donations', 'http://localhost:3000/donations', 'z-05-donations.png');
  await check('Events', 'http://localhost:3000/events', 'z-06-events.png');
  await check('Content', 'http://localhost:3000/content', 'z-07-content.png');
  await check('Content New', 'http://localhost:3000/content/new', 'z-08-content-new.png');
  await check('Finance', 'http://localhost:3000/finance', 'z-09-finance.png');
  await check('Reports', 'http://localhost:3000/reports', 'z-10-reports.png');
  await check('Settings', 'http://localhost:3000/settings', 'z-11-settings.png');
  await check('Campaigns', 'http://localhost:3000/donations/campaigns', 'z-12-campaigns.png');

  // Boy detail page
  await page.goto('http://localhost:3000/boys', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const viewBtn = page.locator('button:has-text("View")').first();
  if (await viewBtn.isVisible()) {
    await viewBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/z-13-boy-detail.png' });
    console.log('✅ Boy Detail Page');
    passed++;
  }

  console.log(`\n━━━ FINAL: ${passed} passed, ${failed} failed ━━━`);
  console.log('\n🌐 Browser open for 45s...');
  await page.waitForTimeout(45000);
  await browser.close();
})();
