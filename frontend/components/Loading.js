/**
 * Loading Component
 * Premium loading states with smooth animations
 */

export class Loading {
  constructor(options = {}) {
    this.options = {
      type: options.type || 'spinner', // spinner, dots, progress, skeleton
      message: options.message || 'Loading...',
      fullscreen: options.fullscreen || false,
      size: options.size || 'medium', // small, medium, large
      color: options.color || 'primary', // primary, white
    };
    this.element = null;
  }

  render() {
    if (this.options.fullscreen) {
      return this.renderFullscreen();
    }
    return this.renderInline();
  }

  renderFullscreen() {
    return `
      <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-container loading-container--${this.options.size}">
          ${this.renderContent()}
        </div>
      </div>
    `;
  }

  renderInline() {
    return `
      <div class="loading-inline loading-inline--${this.options.size}">
        ${this.renderContent()}
      </div>
    `;
  }

  renderContent() {
    switch (this.options.type) {
    case 'spinner':
      return this.renderSpinner();
    case 'dots':
      return this.renderDots();
    case 'progress':
      return this.renderProgress();
    case 'skeleton':
      return this.renderSkeleton();
    default:
      return this.renderSpinner();
    }
  }

  renderSpinner() {
    return `
      <div class="spinner spinner--${this.options.size} spinner--${this.options.color}">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      ${this.options.message ? `<p class="loading-message">${this.options.message}</p>` : ''}
    `;
  }

  renderDots() {
    return `
      <div class="loader-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      ${this.options.message ? `<p class="loading-message">${this.options.message}</p>` : ''}
    `;
  }

  renderProgress() {
    return `
      <div class="loader-progress">
        <div class="loader-progress-bar"></div>
      </div>
      ${this.options.message ? `<p class="loading-message">${this.options.message}</p>` : ''}
    `;
  }

  renderSkeleton() {
    return `
      <div class="skeleton-container">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text short"></div>
        <div class="skeleton skeleton--avatar"></div>
        <div class="skeleton skeleton--image"></div>
      </div>
    `;
  }

  show(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = this.render();
      this.element = container.querySelector('.loading-overlay, .loading-inline');
    }
  }

  hide() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  updateMessage(message) {
    const messageEl = document.querySelector('.loading-message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  updateProgress(percent) {
    const progressBar = document.querySelector('.loader-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
  }
}

// Premium Page Loader with branding
export class PageLoader {
  constructor() {
    this.element = null;
  }

  render() {
    return `
      <div class="premium-loader" id="pageLoader">
        <div class="premium-loader-content">
          <div class="loader-logo">🏥 PCOS Smart Assistant</div>
          <div class="loader-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="loader-progress">
            <div class="loader-progress-bar" id="loaderProgressBar"></div>
          </div>
          <p class="loader-text" id="loaderText">Initializing...</p>
        </div>
      </div>
    `;
  }

  show() {
    if (!this.element) {
      document.body.insertAdjacentHTML('beforeend', this.render());
      this.element = document.getElementById('pageLoader');
    }
    this.element.style.display = 'flex';
  }

  hide() {
    if (this.element) {
      this.element.style.opacity = '0';
      setTimeout(() => {
        if (this.element) {
          this.element.remove();
          this.element = null;
        }
      }, 300);
    }
  }

  updateProgress(percent, message = '') {
    const progressBar = document.getElementById('loaderProgressBar');
    const text = document.getElementById('loaderText');
    
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    if (text && message) {
      text.textContent = message;
    }
  }

  setMessage(message) {
    const text = document.getElementById('loaderText');
    if (text) {
      text.textContent = message;
    }
  }
}

export default Loading;
