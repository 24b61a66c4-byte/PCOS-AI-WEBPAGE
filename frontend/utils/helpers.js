/**
 * Utility Functions
 * Helper functions for common operations
 */

/**
 * Format date to readable string
 */
export function formatDate(date, options = {}) {
  const d = new Date(date);
  const defaultOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return d.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return formatDate(date);
}

/**
 * Debounce function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text
 */
export function truncate(str, length = 100, ending = '...') {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length - ending.length) + ending;
}

/**
 * Validate email
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone) {
  const re = /^[\d\s\-\+\(\)]{10,}$/;
  return re.test(phone);
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString);
  const obj = {};
  for (const [key, value] of params) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Object to query string
 */
export function toQueryString(obj) {
  return new URLSearchParams(obj).toString();
}

/**
 * Clamp number between min and max
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Calculate BMI
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Get BMI category
 */
export function getBMICategory(bmi) {
  if (!bmi) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Calculate risk score (0-100)
 */
export function calculateRiskScore(factors) {
  const weights = {
    bmi: 20,
    symptoms: 30,
    lifestyle: 25,
    familyHistory: 15,
    other: 10,
  };
  
  let score = 0;
  Object.entries(factors).forEach(([key, value]) => {
    const weight = weights[key] || 0;
    score += (value * weight) / 100;
  });
  
  return Math.round(score);
}

/**
 * Get risk level from score
 */
export function getRiskLevel(score) {
  if (score < 30) return { level: 'Low', color: 'green' };
  if (score < 60) return { level: 'Moderate', color: 'yellow' };
  return { level: 'High', color: 'red' };
}

/**
 * Local storage helpers
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Session storage helpers
 */
export const session = {
  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * Download data as file
 */
export function downloadFile(data, filename, type = 'application/json') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Check if device is mobile
 */
export function isMobile() {
  return window.innerWidth < 768;
}

/**
 * Check if device supports touch
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get device info
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    isMobile: isMobile(),
    isTouch: isTouchDevice(),
  };
}

export default {
  formatDate,
  formatRelativeTime,
  debounce,
  throttle,
  generateId,
  deepClone,
  capitalize,
  truncate,
  isValidEmail,
  isValidPhone,
  parseQueryString,
  toQueryString,
  clamp,
  calculateBMI,
  getBMICategory,
  calculateRiskScore,
  getRiskLevel,
  storage,
  session,
  copyToClipboard,
  downloadFile,
  isMobile,
  isTouchDevice,
  getDeviceInfo,
};
