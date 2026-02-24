/**
 * Navbar Component
 * Reusable navigation bar with theme toggle and language selector
 */

export class Navbar {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      logo: options.logo || '🏥 PCOS Smart Assistant',
      links: options.links || [
        { text: 'Dashboard', href: 'dashboard.html', active: false },
        { text: 'Health Journey', href: 'form.html', active: true },
      ],
      languages: options.languages || [
        { code: 'en', name: 'English' },
        { code: 'te', name: 'తెలుగు' },
        { code: 'hi', name: 'हिंदी' },
      ],
      onLanguageChange: options.onLanguageChange || (() => {}),
      onThemeToggle: options.onThemeToggle || (() => {}),
    };
    this.currentLang = 'en';
    this.isDarkMode = true;
  }

  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <nav class="navbar" role="navigation" aria-label="Main navigation">
        <div class="nav-container">
          <div class="logo">${this.options.logo}</div>
          <div class="nav-actions">
            <ul class="nav-menu">
              ${this.options.links.map(link => `
                <li>
                  <a href="${link.href}" 
                     class="nav-link ${link.active ? 'active' : ''}"
                     ${link.active ? 'aria-current="page"' : ''}>
                    ${link.text}
                  </a>
                </li>
              `).join('')}
            </ul>
            <div class="lang-switch">
              <label for="languageSelect">Language</label>
              <select id="languageSelect" aria-label="Select language">
                ${this.options.languages.map(lang => `
                  <option value="${lang.code}">${lang.name}</option>
                `).join('')}
              </select>
            </div>
            <button class="theme-toggle" id="themeToggle" 
                    type="button" aria-label="Toggle theme" 
                    title="${this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}">
              <span class="theme-icon">${this.isDarkMode ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </nav>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const themeToggle = document.getElementById('themeToggle');
    const languageSelect = document.getElementById('languageSelect');

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('light-theme', !this.isDarkMode);
        themeToggle.querySelector('.theme-icon').textContent = this.isDarkMode ? '☀️' : '🌙';
        themeToggle.setAttribute('aria-label', this.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
        this.options.onThemeToggle(!this.isDarkMode);
      });
    }

    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.currentLang = e.target.value;
        this.options.onLanguageChange(this.currentLang);
      });
    }
  }

  setActiveLink(href) {
    this.options.links.forEach(link => {
      link.active = link.href === href;
    });
    this.render();
  }

  setLanguage(lang) {
    this.currentLang = lang;
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = lang;
    }
  }
}

export default Navbar;
