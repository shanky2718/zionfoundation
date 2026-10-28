# Zion Foundation Website

A complete, high-fidelity replica and production-ready implementation of **[Zion Foundation](https://zionfoundation.org/)**.

## 🌟 Highlights & Features
- **Accurate Brand Aesthetic**: Features the authentic color palette, typography (`Fraunces` serif + `Inter` sans), brand logo, and photography.
- **Glassmorphic Navigation**: Sticky responsive navigation bar with backdrop blur, scroll reactive opacity, and mobile drawer.
- **Hero & Mission**: Hero showcase with dual-gradient overlays, tagline badge, and call-to-action buttons.
- **Continuous Marquee**: Smooth infinite ticker with core values (`Compassion ✦ Faith ✦ Education ✦ Service ✦ Community ✦ Hope ✦ Dignity ✦ Unity`).
- **Interactive About & Values**: Quote callout card, core values breakdown, and dynamic animated stat counters (14,200+ families served, 86 programs, 1,900 volunteers, 23 years).
- **Core Programs**:
  - Food & Relief
  - Education & Youth
  - Faith & Worship
  - Housing & Rebuild
- **Interactive Donation Flow**:
  - Tier selection ($25, $60, $150, or custom)
  - One-time or monthly giving toggle
  - Modal checkout with instant 501(c)(3) tax receipt generation
- **Upcoming Events & RSVP**: Interactive RSVP modal for community events with instant confirmation.
- **Stories & Blog Reader**: Modal reader for inspiring stories of community impact.
- **Volunteer & Contact Forms**: Complete forms with instant feedback and toast notifications.
- **100% Offline Capable**: All real images are stored locally in `assets/images/`.

## 🚀 How to Run Locally

### Option 1: Direct in Browser
Simply double-click `index.html` or open it with your browser.

### Option 2: Using Node / npx
```bash
npx serve -l 3000
```
Then visit `http://localhost:3000`.

### Option 3: Python Built-in Server
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000`.

## 📁 Directory Structure
```
zion-foundation/
├── assets/
│   └── images/
│       ├── logo.jpg
│       ├── hero.png
│       ├── hug.png
│       ├── kids.png
│       ├── faith.png
│       ├── build.png
│       └── hands.png
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── index.html
├── package.json
└── README.md
```
