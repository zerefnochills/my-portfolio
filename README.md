# ✒️ Deepak Pandey — Portfolio & Digital Sketchbook

> A hand-crafted, ink-on-parchment developer & software craftsman portfolio inspired by tactile paper aesthetics, SVG turbulence wobble filters, interactive canvas drawing, synthesized Web Audio, and authentic One Piece voyage adventures.

---

## 🧭 Project Structure

```
portfolio/
├── index.html              # Main portfolio application entrypoint
├── doodle.html             # Dedicated digital sketchbook studio (3D page fold)
├── stash-trial.html        # Captain's Trial interactive quiz game
├── treasure-chest.html     # Unlocked secret treasure stash vault
├── favicon.ico             # Site favicon
├── package.json            # NPM test runner scripts & metadata
├── README.md               # Documentation
│
├── css/
│   ├── style.css           # Core stylesheet (typography, layout, components, themes)
│   └── polish.css          # Viewport ratios, One Piece Wanted poster & hero refinements
│
├── js/
│   ├── main.js             # Core portfolio logic, audio synthesis, canvas, journey engine
│   └── polish.js           # Dynamic heading triggers & scroll progress
│
├── images/                 # Graphic assets, avatar seal, character cutout & wanted poster
├── cursors/                # Custom Roronoa Zoro katana & Enma sword cursor assets
├── fonts/                  # Local font files (Chewy, Spicy Rice)
│
└── tests/
    └── e2e/                # Automated 4-tier E2E testing harness (82 assertions)
        ├── runner.js       # Main test runner
        ├── harness.js      # Headless Chrome CDP test harness
        ├── tier1_feature_coverage.js
        ├── tier2_boundary_corner.js
        ├── tier3_cross_feature.js
        └── tier4_real_world.js
```

---

## 🎨 Key Features & Architecture

1. **One Piece Wanted Bounty Poster (Hero Section)**:
   - High-fidelity Wanted Poster template with a character cutout window, Chopper peeker, and pushpin.
   - Live clickable berry bounty (`฿ 3,000,000,000 -`) that increments with sound and celebration banner.
   - Authentic gold/cream typography over dark gradient with WCAG AAA accessibility.

2. **Scroll-Driven Voyage Journey (Sticky Stacking Deck)**:
   - Zero-button smooth scroll progression: Milestone cards accumulate into a compact sticky deck.
   - Synchronized Going Merry ship avatar and track fill percentage scrubbing dynamically.
   - Interactive milestone waypoints for instant chapter teleportation.

3. **Dedicated Doodle Studio & 3D Paper Flip (`doodle.html`)**:
   - Pinned bookmark ribbon on the left edge with real-time flutter.
   - 3D perspective paper fold transition with synthesized paper rustle audio.
   - 6 brush presets (Fountain, Calligraphy, Pencil, Marker, Splatter, Eraser), color wheel, One Piece stamps, undo/redo, and PNG export.

4. **Interactive Captain's Secret Stash Trial (`stash-trial.html` & `treasure-chest.html`)**:
   - Multi-step interactive quiz game guarding the captain's private stash.
   - Unlocks interactive 3D treasure chest reward vault with sound effects.

5. **Tactile Zero-Dependency Web Audio API**:
   - Synthesized pen scratches on drawing and hover.
   - Paper rustle audio on modals, page turns, and drawer navigation.
   - Toggled on/off via the handwritten `sound on / sound off` navbar button.

6. **Zoro Katana Custom Cursor & Theme Switcher**:
   - Roronoa Zoro's Enma katana custom pointer with crimson Conqueror's Haki click slashes.
   - 4 live ink & parchment themes: Crimson White, Obsidian Red, Manga Noir, and Bloodline Dark.

---

## ⚙️ Customization

Open [`js/main.js`](file:///c:/Users/altze/OneDrive/Desktop/portfolio-updated/portfolio/js/main.js) and locate the `PORTFOLIO_CONFIG` object near the top:

```javascript
const PORTFOLIO_CONFIG = {
  name: "Deepak Pandey",
  bounty: "3,000,000,000",
  photoUrl: "images/media_1794201865931_238ddac4.jpg",
  tagline: "Founder & Software Craftsman · Crafting scalable web platforms, digital systems, and creative code.",
  email: "deepak@synapsecalyx.com",
  status: "FOUNDER @ SYNAPSE CALYX · OPEN FOR COLLABORATIONS · 2026",
  socials: {
    github: "https://github.com/zerefnochills",
    linkedin: "https://linkedin.com",
    resume: "#"
  }
};
```

---

## 🧪 Running Automated E2E Tests

All automated tests run headless Chrome over Chrome DevTools Protocol (CDP) across mobile (375px), tablet (768px), desktop (1024px), large desktop (1440px), and ultra-wide (1920px):

```bash
# Run all 4 test tiers (82 assertions)
npm test

# Run a specific tier
npm run test:tier1
npm run test:tier2
npm run test:tier3
npm run test:tier4
```

---

## 🚀 Local Development & Deployment

### Local Preview
Double-click `index.html` to run directly in any browser, or use any local static server:

```bash
npx serve .
# or
python -m http.server 8000
```

### GitHub Pages Deployment
Push the repository to GitHub and enable **GitHub Pages** under `Settings > Pages` with source set to the `main` branch.
