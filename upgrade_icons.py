#!/usr/bin/env python3
"""Icon Upgrade Script - Replace emoji icons with Font Awesome SVG icons"""

import os
import re
from pathlib import Path

# Emoji to Font Awesome mappings
ICON_MAPPINGS = {
    '📋': '<i class="fas fa-clipboard" style="margin-right: 8px;"></i>',
    '📝': '<i class="fas fa-pen-fancy" style="margin-right: 8px;"></i>',
    '💬': '<i class="fas fa-comments" style="margin-right: 8px;"></i>',
    '🏥': '<i class="fas fa-hospital" style="margin-right: 8px;"></i>',
    '❤️': '<i class="fas fa-heart" style="margin-right: 8px;"></i>',
    '⚙️': '<i class="fas fa-gear" style="margin-right: 8px;"></i>',
    '📊': '<i class="fas fa-chart-bar" style="margin-right: 8px;"></i>',
    '🔔': '<i class="fas fa-bell" style="margin-right: 8px;"></i>',
    '👤': '<i class="fas fa-user" style="margin-right: 8px;"></i>',
    '📍': '<i class="fas fa-location-dot" style="margin-right: 8px;"></i>',
    '✓': '<i class="fas fa-check" style="margin-right: 8px;"></i>',
    '✕': '<i class="fas fa-times" style="margin-right: 8px;"></i>',
    '🤖': '<i class="fas fa-robot" style="margin-right: 8px;"></i>',
    '📷': '<i class="fas fa-camera" style="margin-right: 8px;"></i>',
    '➤': '<i class="fas fa-arrow-right" style="margin-right: 8px;"></i>',
    '🔍': '<i class="fas fa-magnifying-glass" style="margin-right: 8px;"></i>',
    '⚠️': '<i class="fas fa-triangle-exclamation" style="margin-right: 8px;"></i>',
    '📞': '<i class="fas fa-phone" style="margin-right: 8px;"></i>',
    '🎯': '<i class="fas fa-bullseye" style="margin-right: 8px;"></i>',
    '📈': '<i class="fas fa-chart-line" style="margin-right: 8px;"></i>',
}

FRONTEND_DIR = Path('frontend')

def add_font_awesome_cdn(content):
    """Add Font Awesome CDN to HTML head if not already present"""
    if 'font-awesome' in content or 'cdnjs.cloudflare.com' in content:
        return content
    
    return content.replace(
        '<link rel="stylesheet" href="styles/healthcare.css">',
        '<link rel="stylesheet" href="styles/healthcare.css">\n    <!-- Font Awesome Icons CDN (Professional SVG Icons) -->\n    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css">'
    )

def add_icons_css(content):
    """Add reference to icons.css if not present"""
    if 'icons.css' in content:
        return content
    
    return content.replace(
        '<link rel="stylesheet" href="styles/healthcare.css">',
        '<link rel="stylesheet" href="styles/healthcare.css">\n    <link rel="stylesheet" href="styles/icons.css">'
    )

def replace_emoji_with_icons(content):
    """Replace emoji characters with Font Awesome icons"""
    for emoji, icon_html in ICON_MAPPINGS.items():
        # Replace emoji within span tags
        content = re.sub(
            rf'<span>{re.escape(emoji)}</span>',
            icon_html,
            content
        )
        # Replace standalone emoji
        content = content.replace(emoji, icon_html)
    
    return content

def process_html_file(filepath):
    """Process a single HTML file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Apply transformations
        content = add_font_awesome_cdn(content)
        content = add_icons_css(content)
        content = replace_emoji_with_icons(content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✓ Updated: {filepath.name}')
            return True
        else:
            print(f'- No changes needed: {filepath.name}')
            return False
    except Exception as e:
        print(f'✗ Error processing {filepath.name}: {e}')
        return False

def main():
    """Main function"""
    print('🎨 Icon Quality Upgrade Script')
    print('=' * 50)
    print('Converting emoji icons to Font Awesome SVG icons...\n')
    
    if not FRONTEND_DIR.exists():
        print(f'Error: {FRONTEND_DIR} directory not found')
        return
    
    html_files = list(FRONTEND_DIR.glob('*.html'))
    
    if not html_files:
        print(f'No HTML files found in {FRONTEND_DIR}')
        return
    
    updated_count = 0
    for html_file in sorted(html_files):
        if process_html_file(html_file):
            updated_count += 1
    
    print(f'\n✅ Upgrade complete! Updated {updated_count} files.')
    print('\nChanges made:')
    print('- Added Font Awesome CDN (professional SVG icons)')
    print('- Added icons.css for icon styling')
    print('- Replaced all emoji with high-quality Font Awesome icons')
    print('\nBenefits:')
    print('✓ Crisp, scalable icons (no more pixelation)')
    print('✓ Consistent icon style across platforms')
    print('✓ Lightweight Vector-based (smaller than images)')
    print('✓ Easy to customize colors and sizes')

if __name__ == '__main__':
    main()
