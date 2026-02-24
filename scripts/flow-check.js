const { chromium } = require('playwright');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const base = 'http://localhost:8080/frontend';

  // Go to dashboard and start Add Details
  await page.goto(`${base}/dashboard.html`);
  const addDetails = await page.$('a.cta-pulse');
  const href = addDetails ? await addDetails.getAttribute('href') : null;
  console.log('Add Details found:', !!addDetails, 'href:', href);
  if (!addDetails) throw new Error('Add Details button not found');
  await addDetails.click();
  await page.waitForTimeout(1000);
  console.log('Navigated to:', page.url());
  await page.waitForSelector('.form-step[data-step="1"].active');

  // Step 1
  await page.fill('#age', '27');
  await page.fill('#weight', '70');
  await page.fill('#height', '165');
  await page.click('#nextBtn');
  await page.waitForSelector('.form-step[data-step="2"].active');

  // Step 2
  await page.fill('#cycle_length', '28');
  await page.fill('#period_length', '5');
  await page.fill('#last_period', '2025-12-15');
  await page.click('#nextBtn');
  await page.waitForSelector('.form-step[data-step="3"].active');

  // Step 3
  await page.check('input[value="irregular_cycles"]');
  await page.check('input[value="acne"]');
  await page.click('#nextBtn');
  await page.waitForSelector('.form-step[data-step="4"].active');

  // Step 4
  await page.selectOption('#activity', 'moderate');
  await page.fill('#sleep', '7');
  await page.selectOption('#stress', 'moderate');
  await page.fill('#diet', 'Balanced diet with low sugar');
  await page.click('#nextBtn');
  await page.waitForSelector('.form-step[data-step="5"].active');

  // Step 5
  await page.fill('#city', 'Hyderabad');
  await page.selectOption('#pcos', 'suspected');
  await page.fill('#medications', 'Metformin');
  await page.click('#nextBtn');
  await page.waitForSelector('.form-step[data-step="6"].active');

  // Submit final step
  await page.click('#submitBtn');
  await page.waitForURL('**/results.html', { timeout: 20000 });
  await page.waitForSelector('#findingsList li', { timeout: 10000 });

  // Validate results content
  const stored = await page.evaluate(() => localStorage.getItem('pcos_last_analysis'));
  assert(stored, 'pcos_last_analysis missing in localStorage');

  const riskText = (await page.textContent('#riskBadge'))?.trim();
  assert(riskText && riskText !== 'Pending', 'Risk badge not populated');

  const doctorCards = await page.locator('.doctor-card').count();
  assert(doctorCards > 0, 'Doctor recommendations missing');

  const tipsCount = await page.locator('#tipsList li').count();
  assert(tipsCount > 0, 'Lifestyle tips missing');

  console.log('Flow check passed: sections advanced and results populated.');
  await browser.close();
})();
