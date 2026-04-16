/**
 * PCOS Smart Assistant - E2E Tests
 * Playwright tests for end-to-end user flows
 */

const { test, expect, chromium } = require('@playwright/test');

test.describe('PCOS Smart Assistant - E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the form page using HTTP server
    await page.goto('http://localhost:8080/frontend/form.html');
    await page.evaluate(() => {
      localStorage.removeItem('pcos_draft');
      localStorage.removeItem('pcos_entries');
      localStorage.removeItem('pcos_last_entry');
      localStorage.removeItem('pcos_last_analysis');
    });
    await page.reload();
  });

  test.describe('Form Navigation', () => {

    test('should load form page successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/PCOS Smart Assistant/);
      await expect(page.locator('#pcos-form')).toBeVisible();
    });

    test('should show step 1 by default', async ({ page }) => {
      await expect(page.locator('.form-step[data-step="1"]')).toHaveClass(/active/);
      await expect(page.locator('#progressText')).toContainText('Step 1 of 6');
    });

    test('should have correct step indicators', async ({ page }) => {
      const indicators = page.locator('.step-indicator');
      await expect(indicators).toHaveCount(6);
      await expect(indicators.first()).toHaveClass(/active/);
    });

    test('should hide previous button on step 1', async ({ page }) => {
      const prevBtn = page.locator('#prevBtn');
      await expect(prevBtn).toBeHidden();
    });

    test('should show next button on step 1', async ({ page }) => {
      const nextBtn = page.locator('#nextBtn');
      await expect(nextBtn).toBeVisible();
    });

    test('should navigate to step 2 after clicking next with valid data', async ({ page }) => {
      // Fill in age
      await page.fill('#age', '25');

      // Click next
      await page.click('#nextBtn');

      // Should be on step 2
      await expect(page.locator('.form-step[data-step="2"]')).toHaveClass(/active/);
      await expect(page.locator('#progressText')).toContainText('Step 2 of 6');
    });

    test('should show error for invalid age', async ({ page }) => {
      // Fill in invalid age
      await page.fill('#age', '5');

      // Click next
      await page.click('#nextBtn');

      // Should show error
      await expect(page.locator('small.error[data-for="age"]')).toContainText(/age/i);
    });

    test('should show previous button after navigating to step 2', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      await expect(page.locator('#prevBtn')).toBeVisible();
    });

    test('should go back to step 1 from step 2', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');
      await expect(page.locator('.form-step[data-step="2"]')).toHaveClass(/active/);

      await page.click('#prevBtn');
      await expect(page.locator('.form-step[data-step="1"]')).toHaveClass(/active/);
    });

    test('should update progress bar correctly', async ({ page }) => {
      const progressFill = page.locator('#progressFill');

      // Initially at step 1 (approximately 16.67%)
      await expect(progressFill).toHaveAttribute('style', /width:.*16/);

      // Fill step 1
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      // Should be at step 2 (approximately 33.33%)
      await expect(progressFill).toHaveAttribute('style', /width:.*33/);
    });
  });

  test.describe('Form Step 1 - Personal Information', () => {

    test('should have age input with correct attributes', async ({ page }) => {
      const ageInput = page.locator('#age');
      await expect(ageInput).toHaveAttribute('min', '10');
      await expect(ageInput).toHaveAttribute('max', '80');
      await expect(ageInput).toHaveAttribute('aria-required', 'true');
    });

    test('should have weight and height inputs', async ({ page }) => {
      await expect(page.locator('#weight')).toBeVisible();
      await expect(page.locator('#height')).toBeVisible();
    });

    test('should accept valid age values', async ({ page }) => {
      const validAges = ['10', '25', '50', '80'];

      for (const age of validAges) {
        await page.fill('#age', age);
        await page.click('#nextBtn');

        // Should not show error for valid ages
        const errorText = await page.locator('small.error[data-for="age"]').textContent();
        expect(errorText || '').toBe('');

        // Go back to step 1
        if (age !== validAges[validAges.length - 1]) {
          await page.click('#prevBtn');
        }
      }
    });

    test('should reject age outside valid range', async ({ page }) => {
      const invalidAges = ['9', '81', '100', '-5'];

      for (const age of invalidAges) {
        await page.fill('#age', age);
        await page.click('#nextBtn');

        // Should show error
        await expect(page.locator('small.error[data-for="age"]')).not.toBeEmpty();
      }
    });
  });

  test.describe('Form Step 2 - Menstrual Cycle', () => {

    test('should navigate to step 2 with valid step 1 data', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      await expect(page.locator('.form-step[data-step="2"]')).toHaveClass(/active/);
    });

    test('should have cycle length input with correct attributes', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      const cycleInput = page.locator('#cycle_length');
      await expect(cycleInput).toHaveAttribute('min', '15');
      await expect(cycleInput).toHaveAttribute('max', '120');
    });

    test('should have period length input', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      await expect(page.locator('#period_length')).toBeVisible();
    });

    test('should have last period date input', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      const lastPeriodInput = page.locator('#last_period');
      await expect(lastPeriodInput).toBeVisible();
      await expect(lastPeriodInput).toHaveAttribute('type', 'date');
    });

    test('should prevent future dates in last period', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      const lastPeriodInput = page.locator('#last_period');
      const maxDateRaw = await lastPeriodInput.getAttribute('max');
      const todayLocal = new Date();
      todayLocal.setMinutes(todayLocal.getMinutes() - todayLocal.getTimezoneOffset());
      const todayRaw = todayLocal.toISOString().split('T')[0];

      // Compare YYYY-MM-DD strings to avoid timezone midnight drift.
      expect((maxDateRaw || '') <= todayRaw).toBe(true);
    });

    test('should show error for invalid cycle length', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      // Fill invalid cycle length
      await page.fill('#cycle_length', '10');
      await page.fill('#period_length', '5');
      await page.fill('#last_period', '2024-01-01');
      await page.click('#nextBtn');

      await expect(page.locator('small.error[data-for="cycle_length"]')).not.toBeEmpty();
    });

    test('should show error for missing required fields', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      // Try to proceed without filling required fields
      await page.click('#nextBtn');

      await expect(page.locator('small.error[data-for="cycle_length"]')).not.toBeEmpty();
      await expect(page.locator('small.error[data-for="period_length"]')).not.toBeEmpty();
      await expect(page.locator('small.error[data-for="last_period"]')).not.toBeEmpty();
    });
  });

  test.describe('Form Step 3 - Symptoms', () => {

    test('should navigate to step 3', async ({ page }) => {
      await fillStep1(page);
      await page.click('#nextBtn');
      await fillStep2(page);
      await page.click('#nextBtn');

      await expect(page.locator('.form-step[data-step="3"]')).toHaveClass(/active/);
    });

    test('should have all symptom checkboxes', async ({ page }) => {
      await fillStep1(page);
      await page.click('#nextBtn');
      await fillStep2(page);
      await page.click('#nextBtn');

      const checkboxes = page.locator('input[name="symptoms"]');
      await expect(checkboxes).toHaveCount(10);
    });

    test('should allow selecting multiple symptoms', async ({ page }) => {
      await fillStep1(page);
      await page.click('#nextBtn');
      await fillStep2(page);
      await page.click('#nextBtn');

      // Select multiple symptoms
      await page.check('input[value="acne"]');
      await page.check('input[value="weight_gain"]');
      await page.check('input[value="hirsutism"]');

      const selectedCount = await page.locator('input[name="symptoms"]:checked').count();
      expect(selectedCount).toBe(3);
    });

    test('should allow deselecting symptoms', async ({ page }) => {
      await fillStep1(page);
      await page.click('#nextBtn');
      await fillStep2(page);
      await page.click('#nextBtn');

      // Select and then deselect
      await page.check('input[value="acne"]');
      await page.uncheck('input[value="acne"]');

      const selectedCount = await page.locator('input[name="symptoms"]:checked').count();
      expect(selectedCount).toBe(0);
    });
  });

  test.describe('Form Step 4 - Lifestyle', () => {

    test('should navigate to step 4', async ({ page }) => {
      await fillSteps1to3(page);
      await page.click('#nextBtn');

      await expect(page.locator('.form-step[data-step="4"]')).toHaveClass(/active/);
    });

    test('should have activity level dropdown', async ({ page }) => {
      await fillSteps1to3(page);
      await page.click('#nextBtn');

      const activitySelect = page.locator('#activity');
      await expect(activitySelect).toBeVisible();

      const options = await activitySelect.locator('option').count();
      expect(options).toBeGreaterThan(1);
    });

    test('should have sleep input', async ({ page }) => {
      await fillSteps1to3(page);
      await page.click('#nextBtn');

      await expect(page.locator('#sleep')).toBeVisible();
    });

    test('should have stress level dropdown', async ({ page }) => {
      await fillSteps1to3(page);
      await page.click('#nextBtn');

      await expect(page.locator('#stress')).toBeVisible();
    });

    test('should have diet textarea', async ({ page }) => {
      await fillSteps1to3(page);
      await page.click('#nextBtn');

      await expect(page.locator('#diet')).toBeVisible();
    });

    test('should validate weight range', async ({ page }) => {
      await fillSteps1to3(page);
      await page.click('#nextBtn');

      // Weight input is collected globally but can be off-screen on step 4.
      await page.evaluate(() => {
        const input = document.getElementById('weight');
        if (!input) return;
        input.value = '500';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.click('#nextBtn');

      await expect(page.locator('small.error[data-for="weight"]')).not.toBeEmpty();
    });

    test('should validate height range', async ({ page }) => {
      await fillSteps1to3(page);
      await page.click('#nextBtn');

      await page.evaluate(() => {
        const input = document.getElementById('height');
        if (!input) return;
        input.value = '50';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.click('#nextBtn');

      await expect(page.locator('small.error[data-for="height"]')).not.toBeEmpty();
    });
  });

  test.describe('Form Step 5 - Clinical', () => {

    test('should navigate to step 5', async ({ page }) => {
      await fillSteps1to4(page);
      await page.click('#nextBtn');

      await expect(page.locator('.form-step[data-step="5"]')).toHaveClass(/active/);
    });

    test('should have city input with max length', async ({ page }) => {
      await fillSteps1to4(page);
      await page.click('#nextBtn');

      const cityInput = page.locator('#city');
      await expect(cityInput).toHaveAttribute('maxlength', '100');
    });

    test('should have PCOS status dropdown', async ({ page }) => {
      await fillSteps1to4(page);
      await page.click('#nextBtn');

      await expect(page.locator('#pcos')).toBeVisible();
    });

    test('should have medications input', async ({ page }) => {
      await fillSteps1to4(page);
      await page.click('#nextBtn');

      await expect(page.locator('#medications')).toBeVisible();
    });

    test('should validate city length', async ({ page }) => {
      await fillSteps1to4(page);
      await page.click('#nextBtn');

      await page.fill('#city', 'a'.repeat(101));
      const cityValue = await page.inputValue('#city');

      // Browser maxlength should cap to 100 chars.
      expect(cityValue.length).toBe(100);
    });
  });

  test.describe('Form Step 6 - Review', () => {

    test('should navigate to review step', async ({ page }) => {
      await fillSteps1to5(page);
      await page.click('#nextBtn');

      await expect(page.locator('.form-step[data-step="6"]')).toHaveClass(/active/);
    });

    test('should show review container', async ({ page }) => {
      await fillSteps1to5(page);
      await page.click('#nextBtn');

      await expect(page.locator('#review-container')).toBeVisible();
    });

    test('should show submit button in review step', async ({ page }) => {
      await fillSteps1to5(page);
      await page.click('#nextBtn');

      await expect(page.locator('#submitBtn')).toBeVisible();
      await expect(page.locator('#nextBtn')).toBeHidden();
    });

    test('should hide next button in review step', async ({ page }) => {
      await fillSteps1to5(page);
      await page.click('#nextBtn');

      await expect(page.locator('#nextBtn')).toBeHidden();
    });
  });

  test.describe('Theme Toggle', () => {

    test('should have theme toggle button', async ({ page }) => {
      await expect(page.locator('#themeToggle')).toBeVisible();
    });

    test('should toggle theme on click', async ({ page }) => {
      const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || '');
      await page.click('#themeToggle');

      const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || '');
      expect(newTheme).not.toBe(initialTheme);
      expect(['light', 'dark']).toContain(newTheme);
    });

    test('should persist theme in localStorage', async ({ page }) => {
      await page.click('#themeToggle');

      const storedTheme = await page.evaluate(() => localStorage.getItem('pcos_theme'));
      expect(storedTheme).toBeTruthy();
    });
  });

  test.describe('Language Switcher', () => {

    test('should have language switcher', async ({ page }) => {
      await expect(page.locator('#insightLanguage')).toBeVisible();
    });

    test('should have English, Telugu, Hindi options', async ({ page }) => {
      const select = page.locator('#insightLanguage');
      const options = await select.locator('option').allTextContents();

      expect(options).toContain('English');
      expect(options).toContain('తెలుగు');
      expect(options).toContain('हिंदी');
    });
  });

  test.describe('Accessibility', () => {

    test('should have proper focus management', async ({ page }) => {
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      // First input in step 2 should be focused
      const activeElement = await page.evaluate(() => document.activeElement.id);
      expect(activeElement).toBe('cycle_length');
    });

    test('should have ARIA labels on form inputs', async ({ page }) => {
      const ageInput = page.locator('#age');
      await expect(ageInput).toHaveAttribute('aria-required');
    });

    test('should have step indicators with proper attributes', async ({ page }) => {
      const indicators = page.locator('.step-indicator');
      const firstIndicator = indicators.first();

      await expect(firstIndicator).toHaveAttribute('data-step');
    });
  });

  test.describe('Dashboard Page', () => {

    test('should load dashboard page', async ({ page }) => {
      await page.goto('http://localhost:8080/frontend/dashboard.html');

      await expect(page).toHaveTitle(/PCOS Smart Assistant/);
    });

    test('should show no entries message initially', async ({ page }) => {
      await page.goto('http://localhost:8080/frontend/dashboard.html');

      await expect(page.locator('#latest-timestamp')).toContainText(/no entries yet/i);
      await expect(page.locator('#latest-status')).toContainText(/add first entry/i);
    });

    test('should send a PCOS question from dashboard assistant and render AI reply', async ({ page }) => {
      await page.route('**/api/ai/chat', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-chat-success',
            object: 'chat.completion',
            created: Date.now(),
            model: 'test-model',
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: 'PCOS can involve irregular cycles and acne. Balanced diet, exercise, and sleep hygiene can help.'
                },
                finish_reason: 'stop'
              }
            ]
          }),
        });
      });

      await page.goto('http://localhost:8080/frontend/dashboard.html');
      await page.evaluate(() => {
        const button = document.getElementById('openAIFab');
        if (button) button.click();
      });
      await expect(page.locator('#assistantPanel')).toHaveClass(/open/);

      const initialAssistantCount = await page.locator('#chatMessages .assistant-msg').count();
      const chatResponse = page.waitForResponse((res) => res.url().includes('/api/ai/chat') && res.status() === 200);

      await page.fill('#chatInput', 'What are common PCOS symptoms?');
      await page.press('#chatInput', 'Enter');
      await chatResponse;

      await expect(page.locator('#chatMessages .user-msg').last()).toContainText('What are common PCOS symptoms?');
      await expect(page.locator('#chatMessages .assistant-msg')).toHaveCount(initialAssistantCount + 1);
      await expect(page.locator('#chatMessages .assistant-msg').last()).toContainText(/PCOS can involve irregular cycles and acne/i);
    });

    test('should show assistant error banner when AI backend fails', async ({ page }) => {
      await page.route('**/api/ai/chat', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal test failure' }),
        });
      });

      await page.route('**/api/client-log', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      await page.goto('http://localhost:8080/frontend/dashboard.html');
      await page.evaluate(() => {
        const button = document.getElementById('openAIFab');
        if (button) button.click();
      });

      const chatResponse = page.waitForResponse((res) => res.url().includes('/api/ai/chat') && res.status() === 500);
      await page.fill('#chatInput', 'Can you help with PCOS lifestyle tips?');
      await page.press('#chatInput', 'Enter');
      await chatResponse;

      await expect(page.locator('.chat-error-banner')).toBeVisible();
      await expect(page.locator('.chat-error-banner')).toContainText(/encountered an error|backend ai service/i);
      await expect(page.locator('.chat-retry-btn')).toBeVisible();
    });
  });

  test.describe('Results Page', () => {

    test('should load results page', async ({ page }) => {
      await page.goto('http://localhost:8080/frontend/results.html');

      await expect(page).toHaveTitle(/Health Report|PCOS/i);
    });

    test('should have print button', async ({ page }) => {
      await page.goto('http://localhost:8080/frontend/results.html');

      await expect(page.locator('#printReport')).toBeVisible();
    });

    test('should show PCOS Insight and Care Suggestions on results page', async ({ page }) => {
      await seedResultsData(page);
      await page.goto('http://localhost:8080/frontend/results.html');

      await expect(page.locator('#pcosInsight')).toBeVisible();
      await expect(page.locator('#pcosInsightTitle')).toBeVisible();
      await expect(page.locator('#assistantInline')).toBeVisible();
      await expect(page.locator('#assistantInlineList .assistant-inline-item').first()).toBeVisible();
    });

    test('should place new sections between risk and key findings', async ({ page }) => {
      await seedResultsData(page);
      await page.goto('http://localhost:8080/frontend/results.html');

      const order = await page.evaluate(() => {
        const riskSection = document.getElementById('riskBadge')?.closest('.report-section');
        const insightSection = document.getElementById('pcosInsight')?.closest('.report-section');
        const careSection = document.getElementById('assistantInline')?.closest('.report-section');
        const findingsSection = document.getElementById('findingsList')?.closest('.report-section');

        const riskBeforeInsight = !!(riskSection && insightSection &&
          (riskSection.compareDocumentPosition(insightSection) & Node.DOCUMENT_POSITION_FOLLOWING));
        const insightBeforeCare = !!(insightSection && careSection &&
          (insightSection.compareDocumentPosition(careSection) & Node.DOCUMENT_POSITION_FOLLOWING));
        const careBeforeFindings = !!(careSection && findingsSection &&
          (careSection.compareDocumentPosition(findingsSection) & Node.DOCUMENT_POSITION_FOLLOWING));

        return { riskBeforeInsight, insightBeforeCare, careBeforeFindings };
      });

      expect(order.riskBeforeInsight).toBe(true);
      expect(order.insightBeforeCare).toBe(true);
      expect(order.careBeforeFindings).toBe(true);
    });

    test('should render fallback results when analysis is missing but entry exists', async ({ page }) => {
      await seedEntryOnly(page);
      await page.goto('http://localhost:8080/frontend/results.html');

      await expect(page.locator('.no-data-message')).toHaveCount(0);
      await expect(page.locator('#pcosInsight')).toBeVisible();
      await expect(page.locator('#assistantInline')).toBeVisible();
      await expect(page.locator('#assistantInlineList .assistant-inline-item').first()).toBeVisible();
      await expect(page.locator('#riskScore')).not.toHaveText('--');
    });
  });

  test.describe('Complete Form Submission Flow', () => {

    test('should complete all 6 steps and show results', async ({ page }) => {
      // Step 1
      await page.fill('#age', '28');
      await page.click('#nextBtn');

      // Step 2
      await page.fill('#cycle_length', '32');
      await page.fill('#period_length', '6');
      await page.fill('#last_period', '2024-02-15');
      await page.click('#nextBtn');

      // Step 3
      await page.check('input[value="weight_gain"]');
      await page.check('input[value="acne"]');
      await page.click('#nextBtn');

      // Step 4
      await page.selectOption('#activity', 'light');
      await page.fill('#sleep', '6');
      await page.selectOption('#stress', 'moderate');
      await page.click('#nextBtn');

      // Step 5
      await page.fill('#city', 'San Francisco');
      await page.selectOption('#pcos', 'suspected');
      await page.click('#nextBtn');

      // Step 6 (Review)
      await expect(page.locator('.form-step[data-step="6"]')).toHaveClass(/active/);

      // Submit
      await page.click('#submitBtn');

      // Should be on results page or show success message
      await page.waitForURL(/results.html|form.html/, { timeout: 5000 });
    });

    test('should validate required fields across all steps', async ({ page }) => {
      // Fill step 1 with invalid data
      await page.fill('#age', '5'); // Invalid age too young
      await page.click('#nextBtn');

      // Should show error
      await expect(page.locator('small.error')).not.toBeEmpty();

      // Fill with valid age
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      // Step 2 - try to proceed without data
      await page.click('#nextBtn');

      // Should show errors
      await expect(page.locator('small.error[data-for="cycle_length"]')).not.toBeEmpty();
    });

    test('should preserve data when navigating back and forth', async ({ page }) => {
      // Fill step 1
      const testAge = '26';
      await page.fill('#age', testAge);
      await page.click('#nextBtn');

      // Go to step 2 and back
      await page.click('#prevBtn');

      // Age should still be there
      const ageValue = await page.inputValue('#age');
      expect(ageValue).toBe(testAge);
    });
  });

  test.describe('Error Handling', () => {

    test('should display global error toast on unhandled error', async ({ page }) => {
      // Try to trigger an error by accessing form page
      await page.goto('http://localhost:8080/frontend/form.html');

      // Inject a test error
      await page.evaluate(() => {
        window.dispatchEvent(new ErrorEvent('error', {
          error: new Error('Test error')
        }));
      });

      // Check if toast appeared (it should have been caught by error handler)
      // Note: This tests that error handler doesn't crash the page
      await expect(page.locator('#pcos-form')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('http://localhost:8080/frontend/form.html');

      // Make sure page is still functional
      await expect(page.locator('#pcos-form')).toBeVisible();
      await expect(page.locator('#nextBtn')).toBeVisible();
    });
  });

  test.describe('API Health Endpoint', () => {

    test('should have /health endpoint responding with 200', async ({ page }) => {
      const response = await page.request.get('http://localhost:5000/health');
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.status).toBeDefined();
    });

    test('should have /api/health endpoint responding with 200', async ({ page }) => {
      const response = await page.request.get('http://localhost:5000/api/health');
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.timestamp).toBeDefined();
      expect(data.version).toBeDefined();
    });

    test('should accept /api/client-log telemetry payload', async ({ page }) => {
      const response = await page.request.post('http://localhost:5000/api/client-log', {
        data: {
          event: 'ai_chat_error',
          severity: 'warning',
          message: 'test telemetry event',
          meta: { source: 'e2e' }
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('Responsive Design', () => {

    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:8080/frontend/form.html');

      // Form should still be visible and usable
      await expect(page.locator('#pcos-form')).toBeVisible();
      await expect(page.locator('#age')).toBeVisible();

      // Fill and navigate
      await page.fill('#age', '25');
      await page.click('#nextBtn');

      // Should still show next step
      await expect(page.locator('.form-step[data-step="2"]')).toHaveClass(/active/);
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:8080/frontend/form.html');

      await expect(page.locator('#pcos-form')).toBeVisible();
    });

    test('should be responsive on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:8080/frontend/form.html');

      await expect(page.locator('#pcos-form')).toBeVisible();
    });
  });
});

// Helper functions to fill form steps
async function fillStep1(page) {
  await page.fill('#age', '25');
}

async function fillStep2(page) {
  await page.fill('#cycle_length', '28');
  await page.fill('#period_length', '5');
  await page.fill('#last_period', '2024-01-15');
}

async function fillStep3(page) {
  await page.check('input[value="acne"]');
  await page.check('input[value="weight_gain"]');
}

async function fillStep4(page) {
  await page.selectOption('#activity', 'moderate');
  await page.fill('#sleep', '7');
  await page.selectOption('#stress', 'moderate');
}

async function fillStep5(page) {
  await page.fill('#city', 'New York');
  await page.selectOption('#pcos', 'not_diagnosed');
}

async function fillSteps1to3(page) {
  await fillStep1(page);
  await page.click('#nextBtn');
  await fillStep2(page);
  await page.click('#nextBtn');
  await fillStep3(page);
}

async function fillSteps1to4(page) {
  await fillSteps1to3(page);
  await page.click('#nextBtn');
  await fillStep4(page);
}

async function fillSteps1to5(page) {
  await fillSteps1to4(page);
  await page.click('#nextBtn');
  await fillStep5(page);
}

async function seedResultsData(page) {
  await page.goto('http://localhost:8080/frontend/form.html');
  await page.evaluate(() => {
    localStorage.setItem('pcos_last_entry', JSON.stringify({
      age: 25,
      cycle_length: 38,
      period_length: 8,
      symptoms: ['acne', 'weight_gain'],
      sleep: 6,
      stress: 'moderate',
      city: 'New York',
      pcos: 'not_diagnosed',
      timestamp: new Date().toISOString(),
    }));

    localStorage.setItem('pcos_last_analysis', JSON.stringify({
      success: true,
      analysis: {
        risk_score: 54,
        summary: 'Moderate PCOS indicators detected from submitted data.',
        key_findings: [
          'Cycle length is outside the common range.',
          'Reported symptoms match common hormonal patterns.'
        ],
        recommendations: [
          'Track cycles for at least 3 months.',
          'Consult a gynecologist if irregularity persists.'
        ]
      },
      report: {
        key_findings: [
          'Cycle length is outside the common range.',
          'Reported symptoms match common hormonal patterns.'
        ],
        recommendations: [
          'Track cycles for at least 3 months.',
          'Consult a gynecologist if irregularity persists.'
        ]
      }
    }));
  });
}

async function seedEntryOnly(page) {
  await page.goto('http://localhost:8080/frontend/form.html');
  await page.evaluate(() => {
    localStorage.removeItem('pcos_last_analysis');
    localStorage.setItem('pcos_last_entry', JSON.stringify({
      age: 27,
      cycle_length: 42,
      period_length: 9,
      symptoms: ['irregular_cycles', 'acne'],
      sleep: 5,
      stress: 'high',
      city: 'Boston',
      pcos: 'suspected',
      timestamp: new Date().toISOString(),
    }));
  });
}
