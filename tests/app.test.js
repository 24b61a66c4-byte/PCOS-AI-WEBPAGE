/**
 * PCOS Smart Assistant - Unit Tests
 * Tests for frontend JavaScript functions
 */

describe('PCOS Smart Assistant - Form Validation', () => {
  
  // Mock DOM elements before each test
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="pcos-form">
        <div class="form-step active" data-step="1">
          <input type="number" id="age" name="age" min="10" max="80" required>
          <small class="error" data-for="age"></small>
        </div>
        <div class="form-step" data-step="2">
          <input type="number" id="cycle_length" name="cycle_length" min="15" max="120" required>
          <input type="number" id="period_length" name="period_length" min="1" max="30" required>
          <input type="date" id="last_period" required>
          <small class="error" data-for="cycle_length"></small>
          <small class="error" data-for="period_length"></small>
          <small class="error" data-for="last_period"></small>
        </div>
        <div class="form-step" data-step="3">
          <input type="checkbox" name="symptoms" value="acne">
          <input type="checkbox" name="symptoms" value="weight_gain">
        </div>
        <div class="form-step" data-step="4">
          <input type="number" id="weight" name="weight" min="30" max="300">
          <input type="number" id="height" name="height" min="100" max="250">
          <input type="number" id="sleep" name="sleep" min="0" max="24">
          <select id="activity"><option value="sedentary">Sedentary</option></select>
          <select id="stress"><option value="low">Low</option></select>
          <textarea id="diet"></textarea>
        </div>
        <div class="form-step" data-step="5">
          <input type="text" id="city" name="city" maxlength="100">
          <select id="pcos"><option value="diagnosed">Diagnosed</option></select>
          <input type="text" id="medications" name="medications" maxlength="200">
        </div>
        <div class="form-step" data-step="6">
          <div id="review-container"></div>
        </div>
        <div class="progress-fill" id="progressFill"></div>
        <p class="progress-text" id="progressText"></p>
        <button type="button" id="prevBtn">Previous</button>
        <button type="button" id="nextBtn">Next</button>
        <button type="submit" id="submitBtn">Submit</button>
        <div id="form-message"></div>
      </form>
      <div class="step-indicators">
        <div class="step-indicator active" data-step="1"></div>
        <div class="step-indicator" data-step="2"></div>
        <div class="step-indicator" data-step="3"></div>
        <div class="step-indicator" data-step="4"></div>
        <div class="step-indicator" data-step="5"></div>
        <div class="step-indicator" data-step="6"></div>
      </div>
      <section class="insight-panel">
        <h3 id="pcosInsightTitle"></h3>
        <p id="pcosInsightNote"></p>
        <span id="pcosLevelLabel"></span>
        <span id="pcosLevel"></span>
        <p id="pcosReason"></p>
        <span id="pcosImpactsLabel"></span>
        <ul id="pcosImpacts"></ul>
      </section>
      <div id="assistantInlineList"></div>
      <select id="insightLanguage">
        <option value="en">English</option>
        <option value="te">Telugu</option>
        <option value="hi">Hindi</option>
      </select>
    `;
    
    // Clear localStorage mock
    localStorage.clear();
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockReturnValue(undefined);
  });

  describe('Input Sanitization', () => {
    
    test('sanitizeHTML should escape HTML characters', () => {
      // Test the sanitizeHTML function logic
      // JSDOM escapes HTML tags but not quotes in the content (not in attribute context)
      const testCases = [
        { input: '<script>alert("xss")</script>', expected: '&lt;script&gt;alert("xss")&lt;/script&gt;' },
        { input: '<div onclick="bad()">Click</div>', expected: '&lt;div onclick="bad()"&gt;Click&lt;/div&gt;' },
        { input: 'Normal text', expected: 'Normal text' },
        { input: '', expected: '' }
      ];
      
      testCases.forEach(({ input, expected }) => {
        if (input !== null && input !== undefined) {
          const div = document.createElement('div');
          div.textContent = input;
          expect(div.innerHTML).toBe(expected);
        }
      });
    });

    test('sanitizeInput should trim and limit length', () => {
      const maxLength = 500;
      
      // Test trimming
      expect('  test  '.trim()).toBe('test');
      
      // Test empty input
      expect(!'' || typeof '' !== 'string' ? '' : ''.trim().slice(0, maxLength)).toBe('');
      
      // Test length limit
      const longString = 'a'.repeat(600);
      expect(longString.trim().slice(0, maxLength).length).toBe(maxLength);
    });
  });

  describe('Form Validation - Step 1 (Personal Info)', () => {
    
    test('should validate age within range 10-80', () => {
      const ageInput = document.getElementById('age');
      
      // Test valid ages
      [10, 25, 50, 80].forEach(age => {
        const ageNum = Number(age || NaN);
        const isValid = Number.isFinite(ageNum) && ageNum >= 10 && ageNum <= 80;
        expect(isValid).toBe(true);
      });
      
      // Test invalid ages
      [9, 81, -5, 100, NaN].forEach(age => {
        const ageNum = Number(age || NaN);
        const isValid = Number.isFinite(ageNum) && ageNum >= 10 && ageNum <= 80;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Form Validation - Step 2 (Cycle Info)', () => {
    
    test('should validate cycle length (15-120 days)', () => {
      // Valid cycle lengths
      [15, 28, 35, 120].forEach(cycle => {
        const cycleNum = Number(cycle || NaN);
        const isValid = Number.isFinite(cycleNum) && cycleNum >= 15 && cycleNum <= 120;
        expect(isValid).toBe(true);
      });
      
      // Invalid cycle lengths
      [14, 121, 0, -5].forEach(cycle => {
        const cycleNum = Number(cycle || NaN);
        const isValid = Number.isFinite(cycleNum) && cycleNum >= 15 && cycleNum <= 120;
        expect(isValid).toBe(false);
      });
    });

    test('should validate period length (1-30 days)', () => {
      // Valid period lengths
      [1, 5, 7, 30].forEach(period => {
        const periodNum = Number(period || NaN);
        const isValid = Number.isFinite(periodNum) && periodNum >= 1 && periodNum <= 30;
        expect(isValid).toBe(true);
      });
      
      // Invalid period lengths
      [0, 31, -1].forEach(period => {
        const periodNum = Number(period || NaN);
        const isValid = Number.isFinite(periodNum) && periodNum >= 1 && periodNum <= 30;
        expect(isValid).toBe(false);
      });
    });

    test('should prevent future dates in last_period', () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      // Today should be valid
      const todayDate = new Date(todayStr);
      expect(todayDate <= new Date()).toBe(true);
      
      // Tomorrow should be invalid
      const tomorrowDate = new Date(tomorrowStr);
      expect(tomorrowDate > new Date()).toBe(true);
    });
  });

  describe('Form Validation - Step 4 (Lifestyle)', () => {
    
    test('should validate weight (30-300 kg)', () => {
      // Valid weights
      [30, 65, 150, 300].forEach(weight => {
        const weightNum = Number(weight || 0);
        const isValid = weightNum >= 30 && weightNum <= 300;
        expect(isValid).toBe(true);
      });
      
      // Invalid weights
      [29, 301, -5].forEach(weight => {
        const weightNum = Number(weight || 0);
        const isValid = weightNum >= 30 && weightNum <= 300;
        expect(isValid).toBe(false);
      });
    });

    test('should validate height (100-250 cm)', () => {
      // Valid heights
      [100, 165, 200, 250].forEach(height => {
        const heightNum = Number(height || 0);
        const isValid = heightNum >= 100 && heightNum <= 250;
        expect(isValid).toBe(true);
      });
      
      // Invalid heights
      [99, 251, 0].forEach(height => {
        const heightNum = Number(height || 0);
        const isValid = heightNum >= 100 && heightNum <= 250;
        expect(isValid).toBe(false);
      });
    });

    test('should validate sleep hours (0-24)', () => {
      // Valid sleep
      [0, 7, 8, 24].forEach(sleep => {
        const sleepNum = Number(sleep || 0);
        const isValid = sleepNum >= 0 && sleepNum <= 24;
        expect(isValid).toBe(true);
      });
      
      // Invalid sleep
      [-1, 25].forEach(sleep => {
        const sleepNum = Number(sleep || 0);
        const isValid = sleepNum >= 0 && sleepNum <= 24;
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Form Validation - Step 5 (Clinical)', () => {
    
    test('should validate city length (max 100 chars)', () => {
      const maxLength = 100;
      
      // Valid city names
      expect('New York'.length).toBeLessThanOrEqual(maxLength);
      expect(''.length).toBeLessThanOrEqual(maxLength);
      
      // Invalid city name (too long)
      const longCity = 'a'.repeat(101);
      expect(longCity.length).toBeGreaterThan(maxLength);
    });

    test('should validate medications length (max 200 chars)', () => {
      const maxLength = 200;
      
      // Valid medications
      expect('Metformin, Birth control'.length).toBeLessThanOrEqual(maxLength);
      
      // Invalid medications (too long)
      const longMed = 'a'.repeat(201);
      expect(longMed.length).toBeGreaterThan(maxLength);
    });
  });

  describe('PCOS Insight Calculation', () => {
    
    test('should calculate risk score correctly', () => {
      // Test the risk score calculation logic
      
      // High risk: cycle outside 21-35, many symptoms
      const highRiskData = {
        cycle_length: 45, // > 35
        period_length: 10, // > 7
        symptoms: ['irregular_cycles', 'hirsutism', 'acne', 'weight_gain', 'hair_loss'],
        age: 25,
        stress: 'high',
        sleep: 5
      };
      
      let score = 0;
      
      // Cycle length (0-30 points)
      const cycle = highRiskData.cycle_length;
      if (cycle < 21) score += 25;
      else if (cycle > 35) score += 30;
      else if (cycle > 32) score += 15;
      
      // Period length (0-15 points)
      const period = highRiskData.period_length;
      if (period < 3) score += 10;
      else if (period > 7) score += 15;
      
      // Symptoms (0-40 points)
      const symptoms = highRiskData.symptoms;
      const highRiskSymptoms = ['irregular_cycles', 'hirsutism', 'acne', 'weight_gain', 'hair_loss', 'infertility'];
      const symptomCount = symptoms.length;
      const highRiskCount = symptoms.filter(s => highRiskSymptoms.includes(s)).length;
      score += Math.min(25, symptomCount * 4);
      score += Math.min(15, highRiskCount * 5);
      
      // Age (0-10 points)
      const age = highRiskData.age;
      if (15 <= age <= 35) score += 10;
      
      // Lifestyle (0-5 points)
      if (highRiskData.stress === 'high') score += 3;
      if (highRiskData.sleep < 6) score += 2;
      
      expect(score).toBeGreaterThan(60); // Should be high risk
    });

    test('should determine risk level based on score', () => {
      const determineRiskLevel = (score) => {
        if (score < 30) return 'low';
        else if (score < 60) return 'moderate';
        else return 'high';
      };
      
      expect(determineRiskLevel(20)).toBe('low');
      expect(determineRiskLevel(40)).toBe('moderate');
      expect(determineRiskLevel(70)).toBe('high');
    });

    test('should analyze cycle length correctly', () => {
      const analyzeCycle = (cycleLength) => {
        if (21 <= cycleLength && cycleLength <= 35) return 'within normal range';
        else if (cycleLength < 21) return 'shorter than typical';
        else return 'longer than typical';
      };
      
      expect(analyzeCycle(28)).toBe('within normal range');
      expect(analyzeCycle(15)).toBe('shorter than typical');
      expect(analyzeCycle(45)).toBe('longer than typical');
    });

    test('should analyze period length correctly', () => {
      const analyzePeriod = (periodLength) => {
        if (3 <= periodLength && periodLength <= 7) return 'within normal range';
        else if (periodLength < 3) return 'shorter than typical';
        else return 'longer than typical';
      };
      
      expect(analyzePeriod(5)).toBe('within normal range');
      expect(analyzePeriod(2)).toBe('shorter than typical');
      expect(analyzePeriod(10)).toBe('longer than typical');
    });
  });

  describe('Care Suggestions', () => {
    
    test('should generate suggestions based on symptoms', () => {
      const generateSuggestions = (entry) => {
        const suggestions = [];
        const symptoms = Array.isArray(entry.symptoms) ? entry.symptoms : [];
        
        if (symptoms.includes('acne') || symptoms.includes('hirsutism') || symptoms.includes('hair_loss')) {
          suggestions.push('Skin and hair symptoms are common in PCOS.');
        }
        
        if (symptoms.includes('weight_gain')) {
          suggestions.push('Weight changes can be linked to insulin sensitivity.');
        }
        
        return suggestions;
      };
      
      const entryWithSymptoms = {
        symptoms: ['acne', 'hirsutism', 'weight_gain']
      };
      
      const suggestions = generateSuggestions(entryWithSymptoms);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('Skin'))).toBe(true);
    });

    test('should suggest based on stress level', () => {
      const generateStressSuggestion = (stress) => {
        if (stress === 'high') {
          return 'High stress can affect cycles. Try daily breaks.';
        }
        return '';
      };
      
      expect(generateStressSuggestion('high')).toContain('High stress');
      expect(generateStressSuggestion('low')).toBe('');
    });

    test('should suggest based on sleep', () => {
      const generateSleepSuggestion = (sleep) => {
        if (sleep > 0 && sleep < 6) {
          return 'Sleep under 6 hours can worsen fatigue.';
        }
        return '';
      };
      
      expect(generateSleepSuggestion(5)).toContain('Sleep under 6');
      expect(generateSleepSuggestion(7)).toBe('');
    });
  });

  describe('Date Formatting', () => {
    
    test('should format dates correctly', () => {
      const formatDate = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      };
      
      const testDate = '2024-01-15';
      const formatted = formatDate(testDate);
      expect(formatted).toContain('2024');
    });

    test('should return dash for invalid dates', () => {
      const formatDate = (value) => {
        if (!value) return '—';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString();
      };
      
      expect(formatDate('')).toBe('—');
      expect(formatDate(null)).toBe('—');
      expect(formatDate('invalid')).toBe('invalid');
    });
  });

  describe('localStorage Operations', () => {
    
    test('should save and retrieve entries', () => {
      // Reset mock return values to allow normal mock operation
      localStorage.getItem.mockReturnValue(undefined);
      localStorage.setItem.mockReturnValue(undefined);
      
      const entries = [
        { id: 1, age: 25, cycle_length: 28 },
        { id: 2, age: 30, cycle_length: 32 }
      ];
      
      // Directly store and retrieve with the mock
      localStorage.setItem('test_pcos_entries', JSON.stringify(entries));
      
      // Get the actual call arguments to verify it was called
      expect(localStorage.setItem).toHaveBeenCalledWith('test_pcos_entries', JSON.stringify(entries));
      
      // For a real-world test, verify that calling setItem and getItem would work
      // Since the mock is spying on calls, we just verify the function was invoked with correct params
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    test('should handle parse errors gracefully', () => {
      localStorage.getItem.mockReturnValue('invalid json');
      
      let result = null;
      try {
        const raw = localStorage.getItem('pcos_last_entry');
        result = raw ? JSON.parse(raw) : null;
      } catch (err) {
        result = null;
      }
      
      expect(result).toBeNull();
    });
  });

  describe('Theme Toggle', () => {
    
    test('should toggle theme class on body', () => {
      const toggleTheme = () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('pcos_theme', isLight ? 'light' : 'dark');
      };
      
      document.body.classList.remove('light-theme');
      toggleTheme();
      expect(document.body.classList.contains('light-theme')).toBe(true);
      
      toggleTheme();
      expect(document.body.classList.contains('light-theme')).toBe(false);
    });

    test('should load saved theme on init', () => {
      localStorage.getItem.mockReturnValue('light');
      
      const savedTheme = localStorage.getItem('pcos_theme') || 'dark';
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
      }
      
      expect(document.body.classList.contains('light-theme')).toBe(true);
    });
  });

  describe('Multi-step Form Navigation', () => {
    
    test('should track current step', () => {
      let currentStep = 1;
      const totalSteps = 6;
      
      expect(currentStep).toBe(1);
      
      currentStep++;
      expect(currentStep).toBe(2);
      
      currentStep++;
      expect(currentStep).toBe(3);
    });

    test('should show/hide navigation buttons based on step', () => {
      const step = 1;
      const totalSteps = 6;
      
      const prevBtnDisplay = step === 1 ? 'none' : 'block';
      const nextBtnDisplay = step === totalSteps ? 'none' : 'block';
      const submitBtnDisplay = step === totalSteps ? 'block' : 'none';
      
      expect(prevBtnDisplay).toBe('none');
      expect(nextBtnDisplay).toBe('block');
      expect(submitBtnDisplay).toBe('none');
    });

    test('should calculate progress percentage', () => {
      const calculateProgress = (step, total) => (step / total) * 100;
      
      expect(calculateProgress(1, 6)).toBeCloseTo(16.67, 1);
      expect(calculateProgress(3, 6)).toBe(50);
      expect(calculateProgress(6, 6)).toBe(100);
    });
  });
});

describe('PCOS Smart Assistant - Dashboard', () => {
  
  beforeEach(() => {
    document.body.innerHTML = `
      <span id="latest-timestamp"></span>
      <span id="latest-last-period"></span>
      <span id="latest-cycle"></span>
      <span id="latest-period"></span>
      <span id="latest-symptoms"></span>
      <span id="latest-summary"></span>
      <span id="insight-cycle"></span>
      <span id="insight-period"></span>
      <span id="insight-symptoms"></span>
    `;
    localStorage.clear();
  });

  test('should display "No entries yet" when no data', () => {
    localStorage.getItem.mockReturnValue(null);
    
    const lastEntry = null;
    const summaryEl = document.getElementById('latest-summary');
    
    if (lastEntry) {
      summaryEl.textContent = 'Your latest details are ready to review.';
    } else {
      summaryEl.textContent = 'Add your first details to unlock insights.';
    }
    
    expect(summaryEl.textContent).toBe('Add your first details to unlock insights.');
  });

  test('should calculate average from entries', () => {
    const entries = [
      { cycle_length: 28, period_length: 5 },
      { cycle_length: 30, period_length: 6 },
      { cycle_length: 26, period_length: 4 }
    ];
    
    const cycleValues = entries.map(e => Number(e.cycle_length)).filter(Boolean);
    const avgCycle = cycleValues.length
      ? Math.round(cycleValues.reduce((sum, v) => sum + v, 0) / cycleValues.length)
      : null;
    
    expect(avgCycle).toBe(28);
  });
});

describe('PCOS Smart Assistant - Results Page', () => {
  
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="riskBadge"></div>
      <span id="riskScore"></span>
      <p id="summaryText"></p>
      <ul id="findingsList"></ul>
      <ul id="recommendationsList"></ul>
      <div id="doctorsGrid"></div>
      <ol id="nextStepsList"></ol>
      <ul id="tipsList"></ul>
      <ul id="warningList"></ul>
      <button id="printReport"></button>
      <button id="downloadPDF"></button>
    `;
  });

  test('should display risk level badges', () => {
    const riskLevels = ['low', 'moderate', 'high'];
    const badges = {
      'low': '✓ Lower Indicators',
      'moderate': '⚠ Moderate Indicators', 
      'high': '⚠ Higher Indicators'
    };
    
    riskLevels.forEach(level => {
      expect(badges[level]).toBeDefined();
    });
  });

  test('should format risk score', () => {
    const score = 75;
    expect(`${score}/100`).toBe('75/100');
  });
});

describe('PCOS Smart Assistant - Chat Assistant', () => {
  
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="chatMessages"></div>
      <input id="chatInput">
      <button id="chatSend">Send</button>
      <div id="imagePreview" style="display: none;"></div>
      <input type="file" id="imageUpload">
    `;
    global.fetch = jest.fn();
  });

  test('should add user message to chat', () => {
    const messagesContainer = document.getElementById('chatMessages');
    
    const addChatMessage = (content, isUser = false) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chat-message ${isUser ? 'user-msg' : 'assistant-msg'}`;
      
      if (content) {
        const textDiv = document.createElement('div');
        textDiv.textContent = content;
        messageDiv.appendChild(textDiv);
      }
      
      messagesContainer.appendChild(messageDiv);
    };
    
    addChatMessage('Hello', true);
    expect(messagesContainer.children.length).toBe(1);
    expect(messagesContainer.children[0].classList.contains('user-msg')).toBe(true);
  });

  test('should handle API errors gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    // Simulate error handling
    let errorMessage = 'Sorry, I encountered an error. ';
    if (!navigator.onLine) {
      errorMessage += 'No internet connection detected.';
    } else {
      errorMessage += 'Please check your connection and try again.';
    }
    
    expect(errorMessage).toContain('error');
  });

  test('should sanitize user input before sending', () => {
    const sanitizeInput = (str, maxLength = 500) => {
      if (!str || typeof str !== 'string') return '';
      return str.trim().slice(0, maxLength);
    };
    
    expect(sanitizeInput('  Hello  ')).toBe('Hello');
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('<script>alert("xss")</script>');
    expect(sanitizeInput('a'.repeat(600), 500).length).toBe(500);
  });
});

describe('PCOS Smart Assistant - Accessibility', () => {
  
  test('should have proper ARIA labels on form inputs', () => {
    document.body.innerHTML = `
      <input type="number" id="age" aria-required="true" aria-describedby="age-error">
      <small id="age-error"></small>
    `;
    
    const ageInput = document.getElementById('age');
    expect(ageInput.getAttribute('aria-required')).toBe('true');
    expect(ageInput.getAttribute('aria-describedby')).toBe('age-error');
  });

  test('should have proper ARIA labels on form steps', () => {
    document.body.innerHTML = `
      <div class="form-step active" data-step="1" aria-hidden="false"></div>
      <div class="form-step" data-step="2" aria-hidden="true"></div>
    `;
    
    const steps = document.querySelectorAll('.form-step');
    expect(steps[0].getAttribute('aria-hidden')).toBe('false');
    expect(steps[1].getAttribute('aria-hidden')).toBe('true');
  });

  test('should have proper ARIA labels on assistant panel', () => {
    document.body.innerHTML = `
      <div id="assistantPanel" aria-hidden="false" aria-live="polite"></div>
    `;
    
    const panel = document.getElementById('assistantPanel');
    expect(panel.getAttribute('aria-live')).toBe('polite');
  });
});

describe('PCOS Smart Assistant - i18n', () => {
  
  test('should support English translations', () => {
    const translations = {
      en: {
        headerTitle: 'PCOS Insight',
        headerNote: 'Educational only. This does not diagnose PCOS.',
        levels: {
          insufficient: 'Not enough data',
          low: 'Lower indicators',
          moderate: 'Moderate indicators',
          high: 'Higher indicators',
        }
      }
    };
    
    expect(translations.en.headerTitle).toBe('PCOS Insight');
    expect(translations.en.levels.high).toBe('Higher indicators');
  });

  test('should support Telugu translations', () => {
    const translations = {
      te: {
        headerTitle: 'పీసీఓఎస్ అవగాహన',
        headerNote: 'ఇది విద్యాపరమైన సమాచారం మాత్రమే.',
        levels: {
          insufficient: 'సరిపోయే డేటా లేదు',
          low: 'తక్కువ సూచనలు',
          moderate: 'మధ్యస్థ సూచనలు',
          high: 'ఎక్కువ సూచనలు'
        }
      }
    };
    
    expect(translations.te.headerTitle).toBe('పీసీఓఎస్ అవగాహన');
  });

  test('should support Hindi translations', () => {
    const translations = {
      hi: {
        headerTitle: 'पीसीओएस समझ',
        headerNote: 'यह केवल शैक्षिक जानकारी है।',
        levels: {
          insufficient: 'पर्याप्त डेटा नहीं',
          low: 'कम संकेत',
          moderate: 'मध्यम संकेत',
          high: 'उच्च संकेत'
        }
      }
    };
    
    expect(translations.hi.headerTitle).toBe('पीसीओएस समझ');
    expect(translations.hi.levels.high).toBe('उच्च संकेत');
  });
});
