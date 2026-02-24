/**
 * HealthCard Component
 * Reusable card for displaying health metrics and insights
 */

export class HealthCard {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      title: options.title || '',
      subtitle: options.subtitle || '',
      icon: options.icon || '📊',
      type: options.type || 'default', // default, insight, warning, success
      value: options.value || '',
      unit: options.unit || '',
      trend: options.trend || null, // { direction: 'up' | 'down' | 'stable', value: '5%' }
      items: options.items || [], // For list-type cards
      actions: options.actions || [],
      onAction: options.onAction || (() => {}),
      loading: options.loading || false,
      collapsible: options.collapsible || false,
    };
    this.isExpanded = !options.collapsible;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="health-card health-card--${this.options.type} ${this.options.collapsible ? 'collapsible' : ''}">
        <div class="health-card__header" id="cardHeader">
          <div class="health-card__icon">
            ${this.options.icon}
          </div>
          <div class="health-card__title-area">
            <h3 class="health-card__title">${this.options.title}</h3>
            ${this.options.subtitle ? `<p class="health-card__subtitle">${this.options.subtitle}</p>` : ''}
          </div>
          ${this.options.collapsible ? `
            <button class="health-card__toggle" aria-label="Toggle content">
              <span class="toggle-icon">${this.isExpanded ? '▼' : '▶'}</span>
            </button>
          ` : ''}
        </div>
        
        ${this.options.loading ? this.renderLoading() : this.renderContent()}
        
        ${this.options.actions.length > 0 ? this.renderActions() : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  renderLoading() {
    return `
      <div class="health-card__loading">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text short"></div>
        <div class="skeleton skeleton--chart"></div>
      </div>
    `;
  }

  renderContent() {
    const contentClass = this.options.collapsible && !this.isExpanded ? 'hidden' : '';
    
    // Value display (for metric cards)
    if (this.options.value !== '') {
      return `
        <div class="health-card__content ${contentClass}">
          <div class="health-card__value-area">
            <span class="health-card__value">${this.options.value}</span>
            ${this.options.unit ? `<span class="health-card__unit">${this.options.unit}</span>` : ''}
            ${this.options.trend ? this.renderTrend() : ''}
          </div>
        </div>
      `;
    }

    // List display (for insight/recommendation cards)
    if (this.options.items.length > 0) {
      return `
        <div class="health-card__content ${contentClass}">
          <ul class="health-card__list">
            ${this.options.items.map(item => `
              <li class="health-card__list-item">
                ${item.icon ? `<span class="item-icon">${item.icon}</span>` : ''}
                <span class="item-text">${item.text}</span>
                ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    return '';
  }

  renderTrend() {
    const { direction, value } = this.options.trend;
    const trendClass = direction === 'up' ? 'positive' : direction === 'down' ? 'negative' : 'neutral';
    const trendIcon = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
    
    return `
      <div class="health-card__trend ${trendClass}">
        <span class="trend-icon">${trendIcon}</span>
        <span class="trend-value">${value}</span>
      </div>
    `;
  }

  renderActions() {
    return `
      <div class="health-card__actions">
        ${this.options.actions.map(action => `
          <button class="health-card__action ${action.primary ? 'btn btn-primary' : 'btn btn-secondary'}" 
                  data-action="${action.id}">
            ${action.icon ? `<span class="action-icon">${action.icon}</span>` : ''}
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  attachEventListeners() {
    // Collapsible toggle
    const header = document.getElementById('cardHeader');
    if (header && this.options.collapsible) {
      header.addEventListener('click', () => {
        this.toggle();
      });
    }

    // Action buttons
    const actionButtons = this.container.querySelectorAll('.health-card__action');
    actionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const actionId = e.currentTarget.dataset.action;
        this.options.onAction(actionId);
      });
    });
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
    const content = this.container.querySelector('.health-card__content');
    const toggleIcon = this.container.querySelector('.toggle-icon');
    
    if (content) {
      content.classList.toggle('hidden', !this.isExpanded);
    }
    if (toggleIcon) {
      toggleIcon.textContent = this.isExpanded ? '▼' : '▶';
    }
  }

  update(options) {
    this.options = { ...this.options, ...options };
    this.render();
  }

  setValue(value, unit = null, trend = null) {
    this.options.value = value;
    if (unit) this.options.unit = unit;
    if (trend) this.options.trend = trend;
    this.render();
  }

  setItems(items) {
    this.options.items = items;
    this.render();
  }

  setLoading(loading) {
    this.options.loading = loading;
    this.render();
  }

  addItem(item) {
    this.options.items.push(item);
    this.render();
  }

  removeItem(index) {
    this.options.items.splice(index, 1);
    this.render();
  }
}

export default HealthCard;
