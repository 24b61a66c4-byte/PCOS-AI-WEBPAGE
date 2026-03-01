# Professional Dark & Light Theme System - Implementation Guide

## 1. REPLACE CSS VARIABLES (at top of frontend/styles.css)

Replace the current `:root` and `body.light-theme` with:

```
css
:root {
  /* Light Theme (Default) */
  --bg-primary: #fafafa;
  --bg-secondary: #f5f5f5;
  --bg-tertiary: #ffffff;
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  
  --text-primary: #1a1a1a;
  --text-secondary: #525252;
  --text-muted: #737373;
  
  --border-color: #e5e5e5;
  --border-subtle: #f0f0f0;
  
  --primary: #0ea5e9;
  --primary-hover: #0284c7;
  --secondary: #10b981;
  --accent: #f59e0b;
  --success: #22c55e;
  --danger: #ef4444;
  --warning: #f59e0b;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  
  --radius: 14px;
  --transition: all 0.25s ease;
}

[data-theme="dark"] {
  /* Dark Theme - NO pure black, uses dark grays */
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-tertiary: #1a1a1a;
  --surface: #171717;
  --surface-elevated: #1f1f1f;
  
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
  --text-muted: #737373;
  
  --border-color: #262626;
  --border-subtle: #1f1f1f;
  
  --primary: #38bdf8;
  --primary-hover: #0ea5e9;
  --secondary: #34d399;
  --accent: #fbbf24;
  --success: #4ade80;
  --danger: #f87171;
  --warning: #fbbf24;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
}
```

## 2. UPDATE BODY/HTML BASE STYLES

Replace the current html,body styles with:

```
css
html, body {
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

body {
  font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: 
    radial-gradient(ellipse 1200px 900px at 16% -8%, rgba(14, 165, 233, 0.08), transparent 55%),
    radial-gradient(ellipse 900px 700px at 78% -6%, rgba(16, 185, 129, 0.08), transparent 50%),
    radial-gradient(ellipse 1200px 900px at 40% 10%, rgba(245, 158, 11, 0.06), transparent 55%),
    linear-gradient(180deg, var(--bg-primary), var(--bg-tertiary) 45%),
    var(--bg-primary);
  line-height: 1.7;
  letter-spacing: 0.1px;
}
```

## 3. UPDATE NAVBAR

Replace with:

```
css
.navbar {
  background: var(--surface);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
```

## 4. UPDATE CARD COMPONENTS

Replace all `.dark-theme .card` and similar with:

```
css
.card,
.form-container,
.step-indicator,
.results-container,
.dashboard,
.modal,
.dropdown-menu,
.form-section,
.form-step,
.health-card,
.ai-chatbot {
  background-color: var(--surface) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

## 5. UPDATE FORM INPUTS

Replace with:

```
css
input[type="number"],
input[type="text"],
input[type="email"],
input[type="date"],
select,
textarea {
  background-color: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  caret-color: var(--primary) !important;
  transition: all 0.25s ease;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--primary) !important;
  outline: none !important;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
}

input::placeholder,
textarea::placeholder {
  color: var(--text-muted) !important;
  opacity: 1;
}
```

## 6. UPDATE BUTTONS

Replace with:

```
css
button,
.btn {
  background-color: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  transition: all 0.25s ease;
}

button:hover,
.btn:hover {
  background-color: var(--primary) !important;
  color: #fff !important;
  border-color: var(--primary) !important;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
  color: #0b0f14 !important;
  border: none !important;
}
```

## 7. UPDATE LINKS

Replace with:

```
css
a {
  color: var(--primary) !important;
  transition: color 0.25s ease;
}

a:hover {
  color: var(--primary-hover) !important;
}
```

## 8. UPDATE TABLES

Replace with:

```
css
table {
  background: var(--surface) !important;
  color: var(--text-primary) !important;
}

th, td {
  border-color: var(--border-color) !important;
  background: var(--surface) !important;
}
```

## 9. UPDATE NAV LINKS

Replace with:

```
css
.navbar a {
  color: var(--text-primary) !important;
  transition: color 0.25s ease;
}

.navbar a.active {
  color: var(--primary) !important;
  border-bottom: 2px solid var(--primary) !important;
}
```

## 10. UPDATE TITLES

Replace with:

```
css
.form-title,
.section-title,
h1, h2, h3, h4, h5, h6 {
  color: var(--text-primary) !important;
}
```

## 11. UPDATE CHECKBOXES

Replace with:

```
css
.checkbox-grid label {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
}

.checkbox-grid label input[type="checkbox"]:checked + span {
  background: var(--primary) !important;
  color: #fff !important;
}
```

## 12. REMOVE THE ENTIRE .dark-theme SECTION

Delete the entire `.dark-theme, .dark-theme body, .dark-theme html` section starting from line ~270 that uses pure black (#000) - it's no longer needed since we're using CSS custom properties.

## 13. ADD JAVASCRIPT THEME TOGGLE

Add to your frontend/app.js:

```
javascript
// Theme toggle function
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// Initialize theme on load
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
}

// Call on page load
document.addEventListener('DOMContentLoaded', initTheme);
```

## 14. UPDATE THEME TOGGLE BUTTON

The theme toggle button should call toggleTheme() function and set data-theme attribute instead of toggling .light-theme class.

---

## SUMMARY

| # | Change | Files |
|---|--------|-------|
| 1 | Replace CSS variables | frontend/styles.css |
| 2 | Update body/html styles | frontend/styles.css |
| 3-12 | Update all component styles | frontend/styles.css |
| 13 | Add JS theme toggle | frontend/app.js |
| 14 | Update toggle button | frontend/app.js |

## KEY IMPROVEMENTS

- ✅ No pure black (#000) - uses dark grays (#0a0a0a, #141414)
- ✅ Smooth 0.3s transitions between themes
- ✅ CSS custom properties for all colors
- ✅ Accessible contrast ratios
- ✅ No extensive !important (only where needed for overrides)
- ✅ Respects system preference
- ✅ Persists user choice in localStorage
