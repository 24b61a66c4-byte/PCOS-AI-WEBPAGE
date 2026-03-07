import os

# Create assets directory if not exists
os.makedirs('frontend/assets', exist_ok=True)

# 1. Animated Calendar Icon
calendar_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
      .cal-body { animation: float 3s ease-in-out infinite; }
      .cal-dot { animation: pulse 2s ease-in-out infinite; }
      .cal-dot-1 { animation-delay: 0s; }
      .cal-dot-2 { animation-delay: 0.3s; }
      .cal-dot-3 { animation-delay: 0.6s; }
      .cal-dot-4 { animation-delay: 0.9s; }
    </style>
  </defs>
  <g class="cal-body">
    <rect x="10" y="14" width="44" height="40" rx="8" fill="#0f1722" stroke="url(#calGrad)" stroke-width="2"/>
    <rect x="10" y="14" width="44" height="12" rx="8" fill="url(#calGrad)"/>
    <rect x="10" y="20" width="44" height="6" fill="url(#calGrad)"/>
    <circle cx="18" cy="10" r="4" fill="#0f1722"/>
    <circle cx="46" cy="10" r="4" fill="#0f1722"/>
    <circle class="cal-dot cal-dot-1" cx="20" cy="36" r="4" fill="#22c55e" filter="url(#glow)"/>
    <circle class="cal-dot cal-dot-2" cx="32" cy="36" r="4" fill="#22c55e" filter="url(#glow)"/>
    <circle class="cal-dot cal-dot-3" cx="44" cy="36" r="4" fill="#ef4444" filter="url(#glow)"/>
    <circle class="cal-dot cal-dot-4" cx="20" cy="46" r="4" fill="#22c55e" filter="url(#glow)"/>
    <circle cx="32" cy="46" r="4" fill="#22c55e" opacity="0.5"/>
    <circle cx="44" cy="46" r="4" fill="#22c55e" opacity="0.3"/>
  </g>
</svg>'''

# 2. Animated Period/Blood Drop Icon
period_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bloodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <filter id="bloodGlow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <style>
      @keyframes drop {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-3px) scale(1.05); }
      }
      @keyframes glow-pulse {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
      }
      .drop { animation: drop 2s ease-in-out infinite; transform-origin: center; }
      .shine { animation: glow-pulse 1.5s ease-in-out infinite; }
    </style>
  </defs>
  <g class="drop">
    <path d="M32 8 C32 8 16 28 16 38 C16 46.5 23.2 54 32 54 C40.8 54 48 46.5 48 38 C48 28 32 8 32 8Z" fill="url(#bloodGrad)" filter="url(#bloodGlow)"/>
    <ellipse class="shine" cx="26" cy="34" rx="5" ry="8" fill="#fca5a5" opacity="0.6"/>
  </g>
  <circle cx="20" cy="22" r="2" fill="#22c55e" opacity="0.8">
    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  <circle cx="44" cy="26" r="1.5" fill="#22c55e" opacity="0.6">
    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
  </circle>
</svg>'''

# 3. Animated Health Score Icon
health_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <style>
      @keyframes health-pulse {
        0%, 100% { stroke-width: 3; }
        50% { stroke-width: 4; }
      }
      @keyframes rotate-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .health-ring { animation: health-pulse 2s ease-in-out infinite; }
      .health-dot { animation: rotate-slow 3s linear infinite; transform-origin: center; }
    </style>
  </defs>
  <circle cx="32" cy="32" r="26" fill="#0f1722" stroke="#0f1722" stroke-width="2"/>
  <circle class="health-ring" cx="32" cy="32" r="22" fill="none" stroke="url(#healthGrad)" stroke-width="3" stroke-linecap="round" stroke-dasharray="100 38" transform="rotate(-90 32 32)"/>
  <g class="health-dot">
    <circle cx="32" cy="14" r="4" fill="#22c55e" filter="url(#glow)"/>
    <circle cx="32" cy="50" r="4" fill="#22c55e" filter="url(#glow)"/>
  </g>
  <text x="32" y="37" text-anchor="middle" fill="#fff" font-family="Arial" font-size="14" font-weight="bold">85</text>
</svg>'''

# 4. Animated Symptoms Icon
symptoms_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="sympGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9333ea"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <style>
      @keyframes symptom-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-2px); }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .symp-heart { animation: symptom-float 2s ease-in-out infinite; }
      .symp-check { animation: blink 1s ease-in-out infinite; }
    </style>
  </defs>
  <g class="symp-heart">
    <path d="M32 12 C20 12 12 20 12 30 C12 42 24 52 32 56 C40 52 52 42 52 30 C52 20 44 12 32 12Z" fill="#0f1722" stroke="url(#sympGrad)" stroke-width="2"/>
    <path d="M32 20 C26 20 22 24 22 30 C22 36 28 40 32 44 C36 40 42 36 42 30 C42 24 38 20 32 20Z" fill="url(#sympGrad)" opacity="0.7"/>
  </g>
  <g class="symp-check">
    <circle cx="42" cy="18" r="6" fill="#22c55e"/>
    <path d="M39 18 L41 20 L45 16" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>'''

# 5. Animated AI Robot Icon
ai_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#2dd4bf"/>
    </linearGradient>
    <style>
      @keyframes ai-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @keyframes ai-glow {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      .ai-head { animation: ai-bounce 2s ease-in-out infinite; }
      .ai-eye { animation: ai-glow 1s ease-in-out infinite; }
      .ai-eye-1 { animation-delay: 0.2s; }
      .ai-eye-2 { animation-delay: 0.4s; }
    </style>
  </defs>
  <g class="ai-head">
    <rect x="16" y="12" width="32" height="28" rx="6" fill="#0f1722" stroke="url(#aiGrad)" stroke-width="2"/>
    <circle class="ai-eye ai-eye-1" cx="25" cy="24" r="4" fill="#22c55e" filter="url(#glow)"/>
    <circle class="ai-eye ai-eye-2" cx="39" cy="24" r="4" fill="#22c55e" filter="url(#glow)"/>
    <rect x="22" y="34" width="20" height="2" rx="1" fill="#38bdf8"/>
    <rect x="26" y="38" width="12" height="2" rx="1" fill="#2dd4bf" opacity="0.7"/>
  </g>
  <path d="M20 44 L20 52 L16 56 M44 44 L44 52 L48 56" stroke="url(#aiGrad)" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>'''

# 6. Animated Chart/Trends Icon
chart_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="chartGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
    <style>
      @keyframes chart-grow {
        0% { transform: scaleY(0.3); transform-origin: bottom; }
        100% { transform: scaleY(1); transform-origin: bottom; }
      }
      .bar-1 { animation: chart-grow 1s ease-out 0.1s both; }
      .bar-2 { animation: chart-grow 1s ease-out 0.2s both; }
      .bar-3 { animation: chart-grow 1s ease-out 0.3s both; }
      .bar-4 { animation: chart-grow 1s ease-out 0.4s both; }
    </style>
  </defs>
  <rect x="8" y="8" width="48" height="48" rx="8" fill="#0f1722" stroke="#22c55e" stroke-width="2"/>
  <g fill="#22c55e" filter="url(#glow)">
    <rect class="bar-1" x="14" y="36" width="6" height="12" rx="2"/>
    <rect class="bar-2" x="24" y="28" width="6" height="20" rx="2"/>
    <rect class="bar-3" x="34" y="20" width="6" height="28" rx="2"/>
    <rect class="bar-4" x="44" y="14" width="6" height="34" rx="2"/>
  </g>
  <polyline points="14,36 24,28 34,20 44,14" stroke="#38bdf8" stroke-width="2" fill="none" stroke-linecap="round"/>
  <circle cx="14" cy="36" r="2" fill="#38bdf8"/>
  <circle cx="24" cy="28" r="2" fill="#38bdf8"/>
  <circle cx="34" cy="20" r="2" fill="#38bdf8"/>
  <circle cx="44" cy="14" r="2" fill="#38bdf8">
    <animate attributeName="r" values="2;3;2" dur="1s" repeatCount="indefinite"/>
  </circle>
</svg>'''

# 7. Animated Plus/Healing Icon
plus_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="plusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <style>
      @keyframes plus-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes plus-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .plus-main { animation: plus-pulse 2s ease-in-out infinite; }
      .plus-ring { animation: plus-spin 8s linear infinite; transform-origin: center; }
    </style>
  </defs>
  <circle cx="32" cy="32" r="28" fill="#0f1722"/>
  <g class="plus-ring">
    <circle cx="32" cy="32" r="24" fill="none" stroke="#22c55e" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/>
  </g>
  <g class="plus-main">
    <rect x="28" y="16" width="8" height="32" rx="4" fill="url(#plusGrad)"/>
    <rect x="16" y="28" width="32" height="8" rx="4" fill="url(#plusGrad)"/>
  </g>
  <circle cx="32" cy="32" r="8" fill="#0f1722"/>
  <circle cx="32" cy="32" r="4" fill="#22c55e">
    <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
  </circle>
</svg>'''

# Write all files
files = {
    'icon-calendar.svg': calendar_svg,
    'icon-period.svg': period_svg,
    'icon-health.svg': health_svg,
    'icon-symptoms.svg': symptoms_svg,
    'icon-ai.svg': ai_svg,
    'icon-chart.svg': chart_svg,
    'icon-plus.svg': plus_svg
}

for filename, content in files.items():
    with open(f'frontend/assets/{filename}', 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Created: {filename}')

print('\nAll animated icons created successfully!')
