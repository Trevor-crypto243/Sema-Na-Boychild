import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login first
  console.log('1. Logging in...');
  await page.goto('http://localhost:3000/login', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.fill('input[type="email"]', 'admin@semanaboychild.org');
  await page.fill('input[type="password"]', 'admin123456');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('   ✅ Logged in');

  // Go to Settings > Integrations
  console.log('2. Going to Settings...');
  await page.goto('http://localhost:3000/settings', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/social-01-settings.png' });

  // Click Integrations tab
  console.log('3. Clicking Integrations tab...');
  const intTab = page.locator('button:has-text("Integrations")');
  if (await intTab.isVisible()) {
    await intTab.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screenshots/social-02-integrations.png' });
    console.log('   ✅ Integrations tab loaded');
  }

  // Listen for dialogs (alert)
  page.on('dialog', async dialog => {
    console.log(`   📢 Alert: "${dialog.message().substring(0, 100)}"`);
    await dialog.accept();
  });

  // Test clicking Connect for Instagram
  console.log('4. Testing Instagram Connect button...');
  const instagramBtn = page.locator('button:has-text("Connect")').first();
  if (await instagramBtn.isVisible()) {
    await instagramBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/social-03-connect-click.png' });
  }

  // Test clicking Connect for TikTok (second connect button)
  console.log('5. Testing TikTok Connect button...');
  const tiktokBtn = page.locator('button:has-text("Connect")').nth(1);
  if (await tiktokBtn.isVisible()) {
    await tiktokBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/social-04-tiktok.png' });
  }

  // Check if new tabs were opened
  const pages = context.pages();
  console.log(`\n   Open tabs: ${pages.length}`);
  for (let i = 0; i < pages.length; i++) {
    console.log(`   Tab ${i}: ${pages[i].url()}`);
  }

  // Test the callback flow (simulate a successful connection)
  console.log('\n6. Simulating a manual social account connection...');
  const res = await page.evaluate(async () => {
    // Direct DB insert to simulate a connected account
    const response = await fetch('http://127.0.0.1:54321/rest/v1/social_accounts', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        platform: 'instagram',
        account_name: '@semanaboychild',
        access_token_encrypted: 'test-token-123',
        is_active: true,
      }),
    });
    return response.status;
  });
  console.log(`   DB insert status: ${res}`);

  // Refresh settings page to see connected account
  console.log('7. Refreshing to see connected account...');
  await page.goto('http://localhost:3000/settings', { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  const intTab2 = page.locator('button:has-text("Integrations")');
  if (await intTab2.isVisible()) {
    await intTab2.click();
    await page.waitForTimeout(2000);
  }
  await page.screenshot({ path: 'screenshots/social-05-connected.png' });
  console.log('   ✅ Settings refreshed');

  // Test disconnect
  console.log('8. Testing Disconnect button...');
  const disconnectBtn = page.locator('button:has-text("Disconnect")').first();
  if (await disconnectBtn.isVisible()) {
    console.log('   Found Disconnect button — clicking...');
    await disconnectBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/social-06-disconnected.png' });
    console.log('   ✅ Disconnect executed');
  } else {
    console.log('   ⚠️ No Disconnect button found');
  }

  console.log('\n🌐 Browser open for 30 seconds...');
  await page.waitForTimeout(30000);
  await browser.close();
  console.log('Done!');
})();
