const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const testData = require('../test_data.json');

const USE_REAL_BACKEND = process.env.USE_REAL === '1';

const FORM_URL = 'https://pcos-ai-webpage.vercel.app/frontend/form.html';
const RESULTS_DIR = path.join(__dirname, '..', 'test-results');
const RESULTS_SHOT = path.join(RESULTS_DIR, 'vercel-run.png');
const RESULTS_JSON = path.join(RESULTS_DIR, 'vercel-run.json');

const symptomMap = {
  irregular_periods: 'irregular_cycles',
};
const allowedSymptoms = new Set([
  'irregular_cycles',
  'weight_gain',
  'hirsutism',
  'acne',
  'hair_loss',
  'mood_changes',
  'fatigue',
  'pelvic_pain',
  'infertility',
  'darkening',
]);

function mapSymptoms(symptoms) {
  return symptoms
    .map((s) => symptomMap[s] || s)
    .filter((s) => allowedSymptoms.has(s));
}

function dateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function buildStepAnalysisPayload(step, body) {
  const stepNames = {
    1: 'Personal',
    2: 'Menstrual',
    3: 'Symptoms',
    4: 'Lifestyle',
    5: 'Clinical',
  };
  return {
    analysis: {
      step,
      step_name: stepNames[step] || `Step ${step}`,
      findings: [
        `Captured data for step ${step}`,
        `Age ${body.stepData?.age || body.stepData?.cycle_length || ''}`.trim(),
      ].filter(Boolean),
      tips: [
        'You can adjust any field before continuing.',
        'Insights update after each step.',
      ],
      next_step_preview: step < 5 ? 'Continue to the next section to unlock more insights.' : 'Review and save your data.',
    },
  };
}

function buildFinalAnalysis(body) {
  const cycle = body.cycle_length;
  const period = body.period_length;
  const symptoms = Array.isArray(body.symptoms) ? body.symptoms : [];

  const riskScore = 72;
  const riskLevel = 'moderate';

  return {
    analysis: {
      risk_level: riskLevel,
      risk_score: riskScore,
      summary: `Cycle ${cycle} days, period ${period} days. Symptoms noted: ${symptoms.join(', ') || 'none'}.`,
      recommendations: [
        'Track cycles for the next 3 months to confirm patterns.',
        'Discuss cycle irregularity and metabolic labs with a clinician.',
        'Maintain steady meals and movement to support insulin balance.',
      ],
    },
    report: {
      key_findings: [
        'Cycle length sits outside the typical 21-35 day range.',
        'Symptoms include weight gain, acne, and fatigue.',
        'Menstrual length is within common bounds.',
      ],
      next_steps: [
        'Schedule a hormonal workup (androgen panel, fasting insulin).',
        'Log 3 more cycles with symptom notes.',
        'Review nutrition with a dietitian if available.',
      ],
      lifestyle_tips: [
        'Aim for 7-8 hours of sleep to reduce stress load.',
        'Favor balanced plates: protein + fiber + healthy fats.',
        'Light to moderate activity 4-5x/week supports cycle regularity.',
      ],
      when_to_see_doctor: [
        'Bleeding heavier than one pad per hour for several hours.',
        'Severe pelvic pain or dizziness.',
        'Missed periods for >90 days without pregnancy.',
      ],
    },
    doctors: {
      urgent_care_message: 'For severe pain, heavy bleeding, or faintness, seek urgent care immediately.',
      primary_doctors: [
        {
          name: 'Dr. Ananya Rao',
          specialty: 'Gynecologist & PCOS care',
          hospital: 'Sunrise Women Clinic',
          address: body.city ? `${body.city} — telehealth available` : 'Telehealth available',
          experience: '10+ years, PCOS & fertility focus',
          rating: 4.7,
          phone: '+91-90000-12345',
          expertise: ['PCOS', 'Fertility', 'Metabolic health'],
        },
        {
          name: 'Dr. Meera Kulkarni',
          specialty: 'Endocrinologist',
          hospital: 'Metabolic Care Center',
          address: body.city ? `${body.city} — virtual consults` : 'Virtual consults',
          experience: '12+ years, insulin resistance focus',
          rating: 4.6,
          phone: '+91-98888-65432',
          expertise: ['Insulin resistance', 'Thyroid', 'PCOS'],
        },
      ],
      helplines: {
        'National Women Healthline': '1800-11-9999',
        'Emergency': '112',
      },
    },
  };
}

async function closeStepModal(page) {
  const modal = await page.$('#stepResultModal');
  if (modal) {
    try {
      await page.waitForSelector('#stepResultModal.active', { timeout: 5000 });
      await page.click('#stepResultContinue');
    } catch (err) {
      // Ignore if modal does not appear
    }
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(60000);

  if (!USE_REAL_BACKEND) {
    await page.route('**/api/analyze-step', async (route) => {
      const body = route.request().postDataJSON();
      const step = body?.step || 0;
      const payload = buildStepAnalysisPayload(step, body || {});
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });
    });

    await page.route('**/api/analyze', async (route) => {
      const body = route.request().postDataJSON() || {};
      const payload = buildFinalAnalysis(body);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(payload),
      });
    });
  }

  await page.goto(FORM_URL, { waitUntil: 'networkidle' });

  if (USE_REAL_BACKEND) {
    console.log('Running against real backend (no intercepts).');
  } else {
    console.log('Running with mocked backend responses.');
  }

  const symptoms = mapSymptoms(Array.isArray(testData.symptoms) ? testData.symptoms : []);
  const lastPeriod = dateDaysAgo(30);

  await page.fill('#age', String(testData.age || 28));
  await page.fill('#weight', '72');
  await page.fill('#height', '165');
  await page.click('#nextBtn');
  await closeStepModal(page);

  await page.fill('#cycle_length', String(testData.cycle_length || 35));
  await page.fill('#period_length', String(testData.period_length || 6));
  await page.fill('#last_period', lastPeriod);
  await page.click('#nextBtn');
  await closeStepModal(page);

  for (const symptom of symptoms) {
    const selector = `input[name="symptoms"][value="${symptom}"]`;
    if (await page.$(selector)) {
      await page.check(selector);
    }
  }
  await page.click('#nextBtn');
  await closeStepModal(page);

  await page.selectOption('#activity', 'moderate');
  await page.fill('#sleep', '7.5');
  await page.selectOption('#stress', 'moderate');
  await page.fill('#diet', 'Balanced meals, high fiber, low glycemic.');
  await page.click('#nextBtn');
  await closeStepModal(page);

  await page.fill('#city', testData.city || 'Hyderabad');
  await page.selectOption('#pcos', 'suspected');
  await page.fill('#medications', 'None');
  await page.click('#nextBtn');
  await closeStepModal(page);

  await page.waitForSelector('#review-container');
  await page.click('#submitBtn');

  let status = 'ok';

  try {
    await page.waitForURL('**/results.html', { timeout: 40000 });
    await page.waitForSelector('#riskBadge', { timeout: 10000 });
  } catch (err) {
    status = 'no_redirect';
    console.warn('Did not reach results page:', err.message);
  }

  await page.screenshot({ path: RESULTS_SHOT, fullPage: true });

  const results = await page.evaluate((currentStatus) => {
    const textContent = (sel) => document.querySelector(sel)?.textContent?.trim();
    const listItems = (sel) => Array.from(document.querySelectorAll(sel)).map((el) => el.textContent.trim());

    if (currentStatus === 'no_redirect') {
      return {
        formMessage: textContent('#form-message') || 'No redirect; form stayed on page.',
      };
    }

    return {
      risk: textContent('#riskBadge'),
      score: textContent('#riskScore'),
      summary: textContent('#summaryText'),
      findings: listItems('#findingsList li').slice(0, 3),
      recommendations: listItems('#recommendationsList li').slice(0, 3),
      nextSteps: listItems('#nextStepsList li').slice(0, 3),
      doctors: listItems('#doctorsGrid .doctor-card h3').slice(0, 2),
    };
  }, status);

  const payload = { status, results, screenshot: RESULTS_SHOT };
  try {
    fs.writeFileSync(RESULTS_JSON, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Could not write JSON report:', err);
  }

  console.log(JSON.stringify(payload, null, 2));

  await browser.close();
}

run().catch((err) => {
  console.error('Run failed', err);
  process.exitCode = 1;
});
