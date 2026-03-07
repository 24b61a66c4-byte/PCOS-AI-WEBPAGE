import os

# Create assets directory
os.makedirs('frontend/assets', exist_ok=True)

# Step icons for the form
icons = {
    'favicon.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
  <defs>
    <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <linearGradient id="healGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect x="4" y="4" width="56" height="56" rx="16" fill="#0f1722"/>
  <circle cx="32" cy="32" r="24" fill="none" stroke="url(#healGradient)" stroke-width="2" opacity="0.8"/>
  <path d="M32 12 C32 12 20 26 20 34 C20 39.5 25.5 44 32 44 C38.5 44 44 39.5 44 34 C44 26 32 12 32 12Z" fill="url(#bloodGradient)" filter="url(#glow)"/>
  <ellipse cx="28" cy="30" rx="4" ry="6" fill="#fca5a5" opacity="0.5"/>
  <circle cx="38" cy="40" r="8" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.9"/>
  <line x1="44" y1="46" x2="50" y2="52" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.9"/>
  <g opacity="0.7">
    <line x1="32" y1="8" x2="32" y2="14" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <line x1="28" y1="11" x2="36" y2="11" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <line x1="52" y1="32" x2="58" y2="32" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <line x1="55" y1="28" x2="55" y2="36" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <line x1="10" y1="44" x2="10" y2="50" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
    <line x1="6" y1="47" x2="14" y2="47" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
  </g>
  <circle cx="14" cy="18" r="1.5" fill="#22c55e" opacity="0.6"/>
  <circle cx="50" cy="22" r="1" fill="#22c55e" opacity="0.5"/>
  <circle cx="12" cy="36" r="1" fill="#22c55e" opacity="0.4"/>
  <circle cx="54" cy="36" r="1.5" fill="#22c55e" opacity="0.6"/>
</svg>''',

    'icon-personal.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#2dd4bf"/></linearGradient></defs>
  <rect x="4" y="4" width="56" height="56" rx="16" fill="#0f1722"/>
  <circle cx="32" cy="22" r="12" fill="url(#g)"/>
  <path d="M16 48 C16 38 24 32 32 32 C40 32 48 38 48 48" fill="url(#g)"/>
</svg>''',

    'icon-menstrual.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#b91c1c"/></linearGradient></defs>
  <rect x="4" y="4" width="56" height="56" rx="16" fill="#0f1722"/>
  <path d="M32 12 C32 12 20 26 20 34 C20 40 25 44 32 44 C39 44 44 40 44 34 C44 26 32 12 32 12Z" fill="url(#g)"/>
  <ellipse cx="28" cy="30" rx="4" ry="6" fill="#fca5a5" opacity="0.5"/>
</svg>''',

    'icon-symptoms.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#d97706"/></linearGradient></defs>
  <rect x="4" y="4" width="56" height="56" rx="16" fill="#0f1722"/>
  <polygon points="32,12 38,28 52,28 42,38 46,52 32,44 18,52 22,38 12,28 26,28" fill="url(#g)"/>
</svg>''',

    'icon-lifestyle.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22c55e"/><stop offset="100%" stop-color="#16a34a"/></linearGradient></defs>
  <rect x="4" y="4" width="56" height="56" rx="16" fill="#0f1722"/>
  <circle cx="32" cy="32" r="18" fill="none" stroke="url(#g)" stroke-width="3"/>
  <path d="M20 32 L28 40 L44 24" fill="none" stroke="url(#g)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>''',

    'icon-clinical.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient></defs>
  <rect x="4" y="4" width="56" height="56" rx="16" fill="#0f1722"/>
  <rect x="16" y="14" width="32" height="36" rx="4" fill="url(#g)"/>
  <rect x="22" y="20" width="20" height="4" fill="#0f1722"/>
  <rect x="22" y="28" width="20" height="4" fill="#0f1722"/>
  <rect x="22" y="36" width="12" height="4" fill="#0f1722"/>
</svg>''',

    'icon-review.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ec4899"/><stop offset="100%" stop-color="#db2777"/></linearGradient></defs>
  <rect x="4" y="4" width="56" height="56" rx="16" fill="#0f1722"/>
  <circle cx="32" cy="32" r="16" fill="url(#g)"/>
  <path d="M26 32 L30 36 L38 28" fill="none" stroke="#0f1722" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''
}

for filename, svg in icons.items():
    with open(f'frontend/assets/{filename}', 'w') as f:
        f.write(svg)
    print(f'Created: {filename}')

print('All icons created successfully!')

