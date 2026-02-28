/**
 * PCOS Smart Assistant - E2E Tests
 * Playwright tests for end-to-end user flows
 */

const { test, expect, chromium } = require('@playwright/test');

test.describe('PCOS Smart Assistant - E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the form page using HTTP server
    await page.goto('http://localhost:8080/frontend/form.html');
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
      const maxDate = new Date(maxDateRaw || '').getTime();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Max date should be today or earlier
      expect(maxDate).toBeLessThanOrEqual(today.getTime());
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
      
      // Fill invalid weight
      await page.fill('#weight', '500');
      await page.click('#nextBtn');
      
      await expect(page.locator('small.error[data-for="weight"]')).not.toBeEmpty();
    });

    test('should validate height range', async ({ page }) => {
      await fillSteps1to3(page);
      await page.click('#nextBtn');
      
      // Fill invalid height
      await page.fill('#height', '50');
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
      
      // Fill city with more than 100 chars
      await page.fill('#city', 'a'.repeat(101));
      await page.click('#nextBtn');
      
      await expect(page.locator('small.error[data-for="city"]')).not.toBeEmpty();
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
      const body = page.locator('body');
      const initialClass = await body.getAttribute('class') || '';
      
      await page.click('#themeToggle');
      
      const newClass = await body.getAttribute('class') || '';
      expect(newClass).not.toBe(initialClass);
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

  test.describe('PCOS Insight Panel', () => {
    
    test('should have insight panel', async ({ page }) => {
      // Navigate to step 6 (review step) where insight panel is visible
      await fillSteps1to5(page);
      await page.click('#nextBtn');
      await expect(page.locator('#pcosInsight')).toBeVisible();
    });

    test('should have insight title', async ({ page }) => {
      // Navigate to step 6 (review step) where insight panel is visible
      await fillSteps1to5(page);
      await page.click('#nextBtn');
      await expect(page.locator('#pcosInsightTitle')).toBeVisible();
    });

    test('should have disclaimer note', async ({ page }) => {
      // Navigate to step 6 (review step) where insight panel is visible
      await fillSteps1to5(page);
      await page.click('#nextBtn');
      const note = page.locator('#pcosInsightNote');
      await expect(note).toBeVisible();
      await expect(note).toContainText(/educational|medical|consult/i);
    });
  });

  test.describe('Care Suggestions Panel', () => {
    
    test('should have care suggestions panel', async ({ page }) => {
      // Navigate to step 6 (review step) where care suggestions panel is visible
      await fillSteps1to5(page);
      await page.click('#nextBtn');
      await expect(page.locator('#assistantInline')).toBeVisible();
    });

    test('should show suggestions based on entries', async ({ page }) => {
      // Fill some data first
      await page.fill('#age', '25');
      
      // Navigate to step 6 (review step) where care suggestions panel is visible
      await fillSteps1to5(page);
      await page.click('#nextBtn');
      
      // Wait for suggestions to render
      await page.waitForTimeout(600);
      
      const suggestions = page.locator('#assistantInlineList .assistant-inline-item');
      await expect(suggestions.first()).toBeVisible();
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
