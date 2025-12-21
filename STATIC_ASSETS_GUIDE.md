# UMEats Static Assets Guide

## 📂 Directory Structure

```
public/
├── images/
│   ├── logo/
│   ├── og/
│   ├── hero/
│   ├── illustrations/
│   └── placeholders/
├── icons/
└── documents/
```

## 🎨 Required Assets Checklist

### Critical (Must Have)

- [ ] **Logo Package**
  - [ ] `images/logo/logo.svg` (SVG, scalable)
  - [ ] `images/logo/logo.png` (PNG, 1024x1024)
  - [ ] `images/logo/logo-dark.svg` (Dark mode variant)
  - **Design Tips:**
    - Incorporate food/sustainability elements
    - Use UM colors (blue/green palette)
    - Include leaf or recycling symbol
    - Keep it simple and recognizable

- [ ] **Favicons**
  - [ ] `icons/favicon.ico` (16x16, 32x32 multi-resolution)
  - [ ] `icons/apple-touch-icon.png` (180x180, iOS)
  - [ ] `icons/icon-192.png` (192x192, PWA)
  - [ ] `icons/icon-512.png` (512x512, PWA)
  - **Generate from:** Your main logo using favicon.io or realfavicongenerator.net

- [ ] **Open Graph Default Image**
  - [ ] `images/og/og-image.png` (1200x630)
  - **Content:**
    - UMEats logo prominently displayed
    - Tagline: "Food Redistribution Platform"
    - Subtitle: "Universiti Malaya"
    - SDG logos (SDG 2, 12, 13)
    - Background: Food/campus themed

### Important (Highly Recommended)

- [ ] **Hero Images**
  - [ ] `images/hero/hero-bg.jpg` (1920x1080 or larger)
  - **Theme:** Malaysian food, UM campus, students
  - **Quality:** High-res, optimized (< 200KB)
  - **Style:** Warm, inviting, overlay-friendly

- [ ] **Placeholder Images**
  - [ ] `images/placeholders/food-placeholder.jpg` (800x600)
  - [ ] `images/placeholders/org-placeholder.jpg` (400x400)
  - **Use:** Default when user doesn't upload image
  - **Style:** Professional, neutral, branded

- [ ] **Page-Specific OG Images**
  - [ ] `images/og/og-rankings.png` (1200x630)
  - [ ] `images/og/og-about.png` (1200x630)

### Optional (Nice to Have)

- [ ] **Illustrations**
  - [ ] `images/illustrations/empty-state.svg`
  - [ ] `images/illustrations/success.svg`
  - [ ] `images/illustrations/error.svg`
  - **Sources:** Undraw.co, Humaaans, Storyset

- [ ] **SDG Badges**
  - [ ] `images/sdg/sdg-2.png` (Zero Hunger)
  - [ ] `images/sdg/sdg-12.png` (Responsible Consumption)
  - [ ] `images/sdg/sdg-13.png` (Climate Action)
  - **Download from:** UN SDG official website

## 📐 Image Specifications

| Type | Dimensions | Format | Max Size | Notes |
|------|------------|--------|----------|-------|
| Logo | Scalable | SVG | - | Primary format |
| Logo (fallback) | 1024x1024 | PNG | 100KB | High-res backup |
| OG Image | 1200x630 | PNG/JPG | 1MB | Social sharing |
| Favicon | 16x16, 32x32 | ICO | 10KB | Multi-resolution |
| Apple Touch | 180x180 | PNG | 50KB | iOS home screen |
| PWA Icons | 192x192, 512x512 | PNG | 100KB | Progressive Web App |
| Hero Image | 1920x1080+ | JPG | 200KB | Landing page |
| Food Placeholder | 800x600 | JPG | 100KB | Default food image |
| Org Placeholder | 400x400 | JPG/PNG | 50KB | Default profile |

## 🎨 Design Guidelines

### Color Palette
```
Primary:   #047857 (Green - Sustainability)
Secondary: #0ea5e9 (Blue - UM colors)
Accent:    #f59e0b (Orange - Food/warmth)
```

### Brand Elements
- **Typography:** Clean, modern (Inter already used)
- **Icons:** Simple, line-based
- **Photography:** Natural, authentic Malaysian food
- **Mood:** Welcoming, sustainable, community-focused

### Image Style
- **Food photos:** Top-down or 45° angle, good lighting
- **People:** Diverse students, authentic interactions
- **Tone:** Warm colors, natural light
- **Background:** UM campus landmarks (optional)

## 🔨 Tools & Resources

### Free Image Resources
1. **Food Photos:**
   - Unsplash (unsplash.com) - Search: "Malaysian food", "food donation"
   - Pexels (pexels.com) - Search: "nasi lemak", "food sharing"

2. **Illustrations:**
   - Undraw (undraw.co) - Customizable color
   - Humaaans (humaaans.com) - Character illustrations
   - Storyset (storyset.com) - Animated illustrations

3. **Icons:**
   - Lucide Icons (already in use) - lucide.dev
   - Heroicons - heroicons.com

4. **SDG Logos:**
   - UN SDG Guidelines (sdgs.un.org/goals)

### Image Optimization Tools
- **Compress:** TinyPNG (tinypng.com)
- **Resize:** Squoosh (squoosh.app)
- **Favicon:** Favicon.io (favicon.io)
- **OG Preview:** Metatags.io (metatags.io)

### Logo/Brand Creation
- **Free Design:**
  - Canva (canva.com) - Easy drag-and-drop
  - Figma (figma.com) - Professional design tool
  - Looka (looka.com) - AI logo generator

- **Logo Ideas:**
  - Bowl with leaf
  - Recycling arrows with food
  - Hands holding food
  - UM tower with food elements

## 📝 Implementation Steps

### Step 1: Create Folder Structure
```bash
mkdir -p public/images/logo
mkdir -p public/images/og
mkdir -p public/images/hero
mkdir -p public/images/illustrations
mkdir -p public/images/placeholders
mkdir -p public/icons
```

### Step 2: Add Logo Files
1. Design or generate logo
2. Export as SVG (main) and PNG (fallback)
3. Create dark mode variant
4. Place in `public/images/logo/`

### Step 3: Generate Favicons
1. Use main logo (512x512 PNG)
2. Go to favicon.io or realfavicongenerator.net
3. Generate all sizes
4. Place in `public/icons/`

### Step 4: Create OG Image
1. Use Canva (1200x630 template)
2. Add logo, text, SDG badges
3. Export as PNG
4. Place in `public/images/og/og-image.png`

### Step 5: Update Metadata
See implementation in `src/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'UMEats - Food Redistribution Platform',
  description: '...',
  openGraph: {
    images: ['/images/og/og-image.png'],
  },
  icons: {
    icon: '/icons/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
};
```

### Step 6: Add Placeholders
1. Find/create neutral food image
2. Optimize to < 100KB
3. Use in food listing component when image is missing

### Step 7: Add Hero Image
1. Find suitable Malaysian food/campus image
2. Optimize for web (< 200KB)
3. Update landing page hero section

## 🎯 Priority Order

1. **Week 1:** Logo + Favicons (Critical for branding)
2. **Week 2:** OG Image + Placeholders (Important for sharing)
3. **Week 3:** Hero Images (Visual appeal)
4. **Week 4:** Illustrations + SDG badges (Polish)

## 🚀 Quick Start (Minimal Setup)

If you need to launch quickly, minimum required:
1. Logo (PNG) → Use as favicon source
2. OG Image (text + logo on solid background)
3. Generic food placeholder (any food photo)

Can be done in 1-2 hours using Canva templates!

## 📱 PWA Manifest (Future Enhancement)

Create `public/manifest.json`:
```json
{
  "name": "UMEats",
  "short_name": "UMEats",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#047857",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

## 🔍 Testing Checklist

- [ ] Logo displays correctly in header
- [ ] Favicon shows in browser tab
- [ ] OG image previews on Facebook/WhatsApp/Twitter
- [ ] Apple touch icon works on iOS
- [ ] Placeholders show when no image uploaded
- [ ] Images load fast (< 3s)
- [ ] All images optimized (no originals > 1MB)

---

**Last Updated:** December 21, 2025  
**Status:** 📋 Ready for Implementation
