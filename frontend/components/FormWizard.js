/**
 * FormWizard Component
 * Multi-step health journey form with validation and progress tracking
 */

export class FormWizard {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      steps: options.steps || [],
      initialStep: options.initialStep || 0,
      onStepChange: options.onStepChange || (() => {}),
      onComplete: options.onComplete || (() => {}),
      validation: options.validation || {},
    };
    // Persist step state
    const savedStep = localStorage.getItem('formWizardStep');
    this.currentStep = savedStep ? parseInt(savedStep, 10) : this.options.initialStep;
    this.formData = {};
    this.submitLock = false;
    this.lastSubmitTime = 0;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="form-wizard">
        ${this.renderProgress()}
        <div class="form-steps-shell">
          <div class="form-slider" style="transform: translateX(-${this.currentStep * 100}%)">
            ${this.options.steps.map((step, index) => `
              <div class="form-step ${index === this.currentStep ? 'active' : ''}" data-step="${index}">
                ${this.renderStepContent(step, index)}
              </div>
            `).join('')}
          </div>
        </div>
        ${this.renderActions()}
      </div>
    `;

    this.attachEventListeners();
    this.updateProgress();
  }

  renderProgress() {
    return `
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" id="progressFill" style="width: ${((this.currentStep + 1) / this.options.steps.length) * 100}%"></div>
        </div>
        <p class="progress-text" id="progressText">Step ${this.currentStep + 1} of ${this.options.steps.length}</p>
      </div>
      <div class="step-indicators">
        ${this.options.steps.map((step, index) => `
          <div class="step-indicator ${index <= this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}" 
               data-step="${index}">
            <span class="step-icon">${step.icon || '✓'}</span>
            <span class="step-label">${step.title}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderStepContent(step, index) {
    return `
      <div class="form-section">
        <h2>${step.title}</h2>
        ${step.subtitle ? `<p class="step-subtitle">${step.subtitle}</p>` : ''}
        <div class="form-fields">
          ${step.fields ? this.renderFields(step.fields) : ''}
        </div>
      </div>
    `;
  }

  renderFields(fields) {
    return fields.map(field => {
      switch (field.type) {
      case 'text':
      case 'number':
      case 'date':
        return `
            <div class="single-field">
              <label for="${field.id}">${field.label}</label>
              <input 
                type="${field.type}" 
                id="${field.id}" 
                name="${field.name}"
                placeholder="${field.placeholder || ''}"
                ${field.required ? 'required' : ''}
                ${field.min ? `min="${field.min}"` : ''}
                ${field.max ? `max="${field.max}"` : ''}
              >
              ${field.helper ? `<span class="helper">${field.helper}</span>` : ''}
              ${field.error ? `<span class="error">${field.error}</span>` : ''}
            </div>
          `;
      case 'select':
        return `
            <div class="single-field">
              <label for="${field.id}">${field.label}</label>
              <select id="${field.id}" name="${field.name}" ${field.required ? 'required' : ''}>
                <option value="">Select...</option>
                ${field.options ? field.options.map(opt => `
                  <option value="${opt.value}">${opt.label}</option>
                `).join('') : ''}
              </select>
            </div>
          `;
      case 'checkbox':
        return `
            <div class="checkbox-grid">
              ${field.options ? field.options.map(opt => `
                <label>
                  <input type="checkbox" name="${field.name}" value="${opt.value}">
                  ${opt.label}
                </label>
              `).join('') : ''}
            </div>
          `;
      case 'textarea':
        return `
            <div class="single-field">
              <label for="${field.id}">${field.label}</label>
              <textarea id="${field.id}" name="${field.name}" rows="4" 
                placeholder="${field.placeholder || ''}"></textarea>
            </div>
          `;
      default:
        return '';
      }
    }).join('');
  }

  renderActions() {
    const isFirstStep = this.currentStep === 0;
    const isLastStep = this.currentStep === this.options.steps.length - 1;

    return `
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" id="prevBtn" 
          ${isFirstStep ? 'style="display: none;"' : ''}>
          ← Previous
        </button>
        ${!isLastStep ? `
          <button type="button" class="btn btn-primary" id="nextBtn">
            Next →
          </button>
        ` : `
          <button type="submit" class="btn btn-primary" id="submitBtn">
            ✨ Save My Data
          </button>
        `}
      </div>
    `;
  }

  attachEventListeners() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.prevStep();
        localStorage.setItem('formWizardStep', this.currentStep);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextStep();
        localStorage.setItem('formWizardStep', this.currentStep);
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Debounce submit
        if (this.submitLock) return;
        const now = Date.now();
        if (now - this.lastSubmitTime < 1200) return;
        this.lastSubmitTime = now;
        this.submitLock = true;
        setTimeout(() => { this.submitLock = false; }, 1200);
        if (!this.validateCurrentStep(true)) {
          this.showError('Please correct errors before submitting.');
          return;
        }
        this.handleSubmit();
      });
    }

    // Add input listeners for real-time validation
    const inputs = this.container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.formData[e.target.name] = e.target.value;
      });
    });

    // Step indicator clicks
    const stepIndicators = this.container.querySelectorAll('.step-indicator');
    stepIndicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        if (index <= this.currentStep) {
          this.goToStep(index);
        }
      });
    });
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.options.steps.length - 1) {
        this.currentStep++;
        this.render();
        this.options.onStepChange(this.currentStep, this.formData);
      }
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.render();
      this.options.onStepChange(this.currentStep, this.formData);
    }
  }

  goToStep(step) {
    if (step >= 0 && step < this.options.steps.length) {
      this.currentStep = step;
      this.render();
      this.options.onStepChange(this.currentStep, this.formData);
    }
  }

  validateCurrentStep() {
    const currentStepData = this.options.steps[this.currentStep];
    if (!currentStepData.fields) return true;

    let isValid = true;
    currentStepData.fields.forEach(field => {
      const input = document.querySelector(`[name="${field.name}"]`);
      const validator = this.options.validation[field.name];
      if (field.required && (!input || !input.value)) {
        isValid = false;
        if (input) input.classList.add('error-input');
      } else if (input) {
        input.classList.remove('error-input');
      }
      if (validator && input && !validator(input.value)) {
        isValid = false;
        input.classList.add('error-input');
      }
    });
    return isValid;
  }

  updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) {
      progressFill.style.width = `${((this.currentStep + 1) / this.options.steps.length) * 100}%`;
    }
    
    if (progressText) {
      progressText.textContent = `Step ${this.currentStep + 1} of ${this.options.steps.length}`;
    }

    // Update step indicators
    const indicators = this.container.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentStep);
      indicator.classList.toggle('completed', index < this.currentStep);
    });
  }

  handleSubmit() {
    if (this.validateCurrentStep(true)) {
      this.options.onComplete(this.formData);
    }
  }

  showError(message) {
    // Show error feedback
    let errorDiv = this.container.querySelector('.form-error');
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'form-error';
      this.container.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    setTimeout(() => errorDiv.classList.remove('show'), 2200);
  }

  getFormData() {
    return this.formData;
  }

  setFormData(data) {
    this.formData = { ...this.formData, ...data };
    // Update form inputs
    Object.entries(data).forEach(([name, value]) => {
      const input = this.container.querySelector(`[name="${name}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = value;
        } else {
          input.value = value;
        }
      }
    });
  }
}

export default FormWizard;
