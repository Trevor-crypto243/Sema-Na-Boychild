import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Landing page
  console.log('1. Opening landing page...');
  await page.goto('http://localhost:3000', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: 'screenshots/01-landing.png', fullPage: true });
  console.log('   ✅ Landing page loaded');
  await page.waitForTimeout(2000);

  // 2. Login page
  console.log('2. Navigating to login...');
  await page.goto('http://localhost:3000/login', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: 'screenshots/02-login.png' });
  console.log('   ✅ Login page loaded');
  await page.waitForTimeout(1000);

  // 3. Sign in
  console.log('3. Signing in as admin...');
  await page.fill('input[type="email"]', 'admin@semanaboychild.org');
  await page.fill('input[type="password"]', 'admin123456');
  await page.screenshot({ path: 'screenshots/03-login-filled.png' });
  await page.click('button[type="submit"]');

  // Wait for redirect or page change
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'screenshots/04-after-login.png' });
  console.log('   Current URL:', page.url());

  // Try navigating to dashboard directly
  console.log('4. Navigating to dashboard...');
  await page.goto('http://localhost:3000/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: 'screenshots/05-dashboard.png' });
  console.log('   ✅ Dashboard loaded');
  await page.waitForTimeout(2000);

  // 5. Boys page
  console.log('5. Navigating to Boys...');
  await page.goto('http://localhost:3000/boys', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: 'screenshots/06-boys.png' });
  console.log('   ✅ Boys page loaded');
  await page.waitForTimeout(1000);

  // 6. Events page
  console.log('6. Navigating to Events...');
  await page.goto('http://localhost:3000/events', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: 'screenshots/07-events.png' });
  console.log('   ✅ Events page loaded');
  await page.waitForTimeout(1000);

  // 7. Content page
  console.log('7. Navigating to Content...');
  await page.goto('http://localhost:3000/content', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: 'screenshots/08-content.png' });
  console.log('   ✅ Content page loaded');
  await page.waitForTimeout(1000);

  // 8. Settings page
  console.log('8. Navigating to Settings...');
  await page.goto('http://localhost:3000/settings', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: 'screenshots/09-settings.png' });
  console.log('   ✅ Settings page loaded');

  // Keep open
  console.log('\n🌐 Browser open — explore! Closing in 60 seconds...');
  await page.waitForTimeout(60000);

  await browser.close();
  console.log('Done!');
})();
