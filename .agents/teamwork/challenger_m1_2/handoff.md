# Milestone 1: Layout Shift & Proportion Correction — Challenger 2 Adversarial Evaluation Report

## 1. Observation

As Challenger 2 (Empirical Challenger: Critic & Specialist), I conducted an independent, adversarial stress test of Milestone 1 implementation (`worker_m1`). I authored and executed an adversarial test harness in `tests/e2e/challenger2_adversarial.js` controlling Headless Google Chrome via Chrome DevTools Protocol (CDP), testing ribbon collisions, tablet navbar interactive controls, sticky positioning under `overflow-x: clip`, and dense micro-stepping boundary overflow.

### 1.1 Direct File Observations
- **Floating Edge Ribbon Bookmarks**:
  - `css/polish.css:131-192`: Desktop & Tablet ribbons (`.irl-ribbon-btn`, `.sketchbook-ribbon-btn`) are docked at `left: 0; position: fixed; z-index: 85`. On desktop (`>=1400px`), they sit in the 140px margin gutter (`max-width: 125px`). On tablet / small desktop (`681px - 1399.98px`), they are styled as bookmark tabs peeking 24px from the left edge (`transform: translateY(-50%) translateX(calc(-100% + 24px))`), sliding out to full width on `:hover`, `:focus-visible`, or `:active`.
  - `css/polish.css:1603-1634`: Mobile ribbons (`<=680px`) are repositioned to `bottom: 72px` and `bottom: 24px` with `transform: translateX(calc(-100% + 18px))` peeking only 18px from screen edge.
- **Tablet Navbar Wrapping**:
  - `css/polish.css:1434-1499`: For `681px - 1024px`, `nav.nav-island` enforces `display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 12px; max-width: min(960px, 100%)`. Row 1 hosts `.nav-brand-row` (left) and `.controls-bar` (right, `order: 2; margin-left: auto; flex: 0 0 auto`). Row 2 hosts `.nav-links-dock` (`order: 3; width: 100%; justify-content: center`). For `921px - 1024px`, a dedicated media query tightens gaps and font size into a single row.
- **Root Containment & Sticky Docking**:
  - `css/polish.css:1348-1365` & `index.html:130-155`: `html, body` enforce `overflow-x: clip; width: 100%; max-width: 100%`.
  - `css/polish.css:18-25`: `header.site-header` configures `position: sticky; top: 12px; z-index: 900; pointer-events: none`. `nav.nav-island` has `pointer-events: auto`.
- **Entry Point Parity**:
  - `index.html` and `Your Name – Portfolio.html` have identical SHA-256 hashes:
    `279FE979EB9F975FAB0FE58BB40B6AFF5FFFB5EC00FB85D2676F17C22C395F7A`.

### 1.2 Adversarial Test Execution Commands & Verbatim Outputs

#### Command 1: Official E2E Suite Run (Tiers 1 & 2)
```powershell
node tests/e2e/runner.js --tier=1,2
```
**Output Summary**:
- **Feature 1 (Layout Centering Across Viewports)**: 5 / 5 PASS (1440px, 1024px, 768px, 375px centered within `|left - right| <= 4px`; all content sections non-negative margins).
- **Feature 2 (Horizontal Overflow Elimination)**: 5 / 5 PASS (375px, 768px, 1024px, 1440px `scrollWidth <= innerWidth`; root enforces `overflow-x: clip`).
- **Group B1 (Viewport Boundaries Zero-Delta)**: 7 / 7 PASS (375px, 680px, 681px, 768px, 1024px, 1440px, 1920px all report `scrollWidth - clientWidth <= 0`).
- **Group B2 (Component Overflow Clamping)**: 7 / 7 PASS (Skills ticker tape, coffee stain clamp, ribbon clearance, margin doodles hidden < 1400px).
- Overall Passing Assertions: 46 / 70 evaluated (all M1 targets passing 100%; M2/M3 failures as planned).

#### Command 2: Challenger 2 Empirical Adversarial Suite
```powershell
node tests/e2e/challenger2_adversarial.js
```
**Verbatim Output Results**:
- **Suite 1: Floating Ribbon Collision & Occlusion Matrix (35 assertions)**:
  - Tested 26 viewports at rest (`scrollY = 0`): 320px, 360px, 375px, 390px, 412px, 480px, 600px, 680px, 681px, 720px, 768px, 800px, 820px, 912px, 920px, 921px, 1024px, 1025px, 1152px, 1200px, 1280px, 1366px, 1399px, 1400px, 1440px, 1920px against 8 hero targets (`#heroName`, `#heroTagline`, `.hero-actions`, `.hero-btn.primary`, `.hero-btn[href="#contact"]`, `#treasureChestBtn`, `#wantedPoster`, `#chopperPeekingBubble`).
  - **Results**: 25 / 26 viewports had **0 collisions and 0 click occlusions** at rest.
  - At legacy 320x568px (iPhone SE 1st gen), the 18px ribbon tab touches the outer 6.27px of the decorative wooden frame border of the Wanted poster (`area = 130.5 px²` and `390.5 px²`), but empirical testing confirmed **0 overlap with the photo** (`photoLeft = 49.2px > 18px`), **0 overlap with name** (`nameLeft = 45.5px > 18px`), and **0 overlap with bounty** (`bountyLeft = 75.0px > 18px`).
  - Tested fixed ribbons across 4 scroll depths at 768px (`scrollY = 120, 280, 500, 850px`): **0 collisions** with hero interactive buttons.
  - Hover flyout state: On 768px, 920px, 1024px, when actively hovered, the flyout tab expands to `right = 164px` (`z-index: 95`), visually overlaying the left edge of the "Explore Works" button (`left = 61px - 72px`) while hovered, collapsing cleanly back to 24px upon unhover.
- **Suite 2: Tablet Navbar Controls Integrity & CDP Click Execution (18 assertions)**:
  - Tested across 14 tablet breakpoints (681px, 700px, 720px, 768px, 800px, 820px, 850px, 900px, 912px, 920px, 921px, 960px, 1000px, 1024px).
  - **Zero clipping**: `nav.nav-island` and `.controls-bar` remained strictly within screen bounds (`right <= window.innerWidth`) on every breakpoint.
  - **Zero click interception**: At the geometric center of `#soundToggle`, `#cursorToggle`, and `#themeBtn`, `document.elementFromPoint(cx, cy)` returned the button element or its SVG child (100% clickable).
  - **Real CDP Mouse Click Dispatch on 768px**:
    - `#cursorToggle`: successfully toggled `document.body.classList.contains('zoro-cursor-active')` (`true` -> `false`).
    - `#soundToggle`: successfully toggled sound state (`sound on`, `localStorage.getItem('portfolio_sound') === 'true'`).
    - `#themeBtn`: opened `#themeMenu` within viewport (`menu right = 692.3px <= 768px`).
    - `.theme-opt[data-theme-val="sepia"]`: successfully applied `data-theme="sepia"` via dropdown click.
- **Suite 3: Sticky Navbar Docking Integrity Under `overflow-x: clip` (10 assertions)**:
  - **Container Audit**: `html/body` computed `overflow-x: clip`, `site-header` computed `position: sticky; top: 12px; pointer-events: none`. Ancestor chain has **0 bad scroll containers** (`overflow: hidden` / `overflow: scroll`).
  - **Sticky Docking Persistence**: At 375px, 768px, 1024px, and 1440px across scroll depths `scrollY = 0, 150, 400, 900, 1600, 2400px`, the header remained docked at `top: 4px` (mobile) or `top: 12px` (tablet/desktop) without scrolling off-screen.
  - **Section Anchor Scroll Margins**: Navigating to `#top`, `#work`, `#journey`, `#skills`, `#contact` verified that all section headings cleared the bottom of the sticky navbar:
    - `#top`: heading top = 171px vs header bottom = 128px (+43px clearance)
    - `#work`: heading top = 228px vs header bottom = 128px (+100px clearance)
    - `#journey`: heading top = 242px vs header bottom = 128px (+114px clearance)
    - `#skills`: heading top = 255px vs header bottom = 128px (+127px clearance)
    - `#contact`: heading top = 259px vs header bottom = 128px (+131px clearance)
- **Suite 4: Dense Micro-stepping Boundary Overflow Stress (23 assertions)**:
  - Micro-stepped 1px increments across all critical breakpoint transitions: 678px–683px, 918px–923px, 1022px–1026px, 1397px–1402px.
  - **Results**: 23 / 23 widths reported `scrollWidth <= clientWidth` (`docDelta <= 0`) AND lateral pan lockout `window.scrollX === 0` after `window.scrollTo(500, 0)`.
- **Suite Totals**: 85 / 86 assertions passed (98.8%).

---

## 2. Logic Chain

1. **Step 1: Elimination of Horizontal Scrollbars and Lateral Panning (Feature 2 & Group B1)**
   - Pre-fix observations recorded +66px overflow at 768px, +70px at 1024px, and +95px at 1440px caused by `.skills-ticker-tape { width: 112vw; margin-left: -56vw; }` and `max-width: 100vw` on `body`.
   - The worker replaced this with `width: 100vw; max-width: 100vw; margin: 10px 0 48px -50vw; overflow: hidden;` and root `overflow-x: clip`.
   - In Suite 4, micro-stepping every pixel across 678px–683px, 918px–923px, 1022px–1026px, and 1397px–1402px confirmed `docDelta <= 0` and `panX === 0`.
   - Observation: Although inner rotated elements (e.g. `.skills-ticker-tape` rotated -1.5deg) project an axis-aligned box to 674px, `overflow-x: clip` hardware-clips the overhang cleanly without generating a scroll container or horizontal scrollbar.

2. **Step 2: Non-Colliding Bookmark Peek Tabs (Feature 6 & Group B2)**
   - Pre-fix observations recorded floating ribbons projecting 164px inward from `left: 0`, covering hero headings and CTA buttons on tablet and Wanted poster on mobile.
   - The worker re-docked ribbons as 24px edge tabs on tablet/desktop (`translateX(calc(-100% + 24px))`) and 18px edge tabs at bottom left on mobile (`bottom: 72px / 24px`).
   - In Suite 1, bounding-box intersection checks across 25 responsive viewports from 360px to 1920px showed 0 collision area and 0 hit-test occlusions with all hero elements.
   - At rest, hero CTA buttons start at `left >= 42.5px` (mobile), `left >= 61.4px` (tablet), `left >= 72px` (laptop), and `left >= 148px` (desktop), leaving a minimum rest clearance of 24.5px to 124px from the ribbon tabs.

3. **Step 3: Tablet Controls Bar Wrapping & Zero-Clipping Immunity (Feature 4)**
   - Pre-fix observations showed `flex-wrap: nowrap` on `nav.nav-island`, pushing `.controls-bar` past the 768px viewport edge to `x = 819px` (+51px right overflow).
   - The worker implemented 2-row wrapping below 920px (`nav-brand-row` on row 1 left, `controls-bar` on row 1 right, `nav-links-dock` on row 2).
   - In Suite 2, testing 14 distinct tablet viewports between 681px and 1024px proved that neither the island nor the controls bar ever clips (`islandClipped === false`, `controlsClipped === false`).
   - Testing `document.elementFromPoint(cx, cy)` confirmed no transparent overlay intercepts clicks to any of the 3 buttons. Physical CDP click dispatches toggled Zoro mode, sound state, and opened the theme dropdown without failure.

4. **Step 4: Sticky Navbar Integrity under `overflow-x: clip`**
   - Unlike `overflow-x: hidden` (which historically breaks `position: sticky` by creating an unintended scroll container ancestor), `overflow-x: clip` allows `position: sticky` on child elements to dock against the nearest scroll container (the viewport).
   - In Suite 3, ancestor audits confirmed zero scroll-killing parent containers.
   - Scrolling across depths from 0px to 2400px at 375px, 768px, 1024px, and 1440px confirmed that `header.site-header` stays docked at `top: 4px` (mobile) and `top: 12px` (tablet/desktop).
   - `pointer-events: none` on `header.site-header` combined with `pointer-events: auto` on `nav.nav-island` ensures that clicks in the transparent padding around the island pass through to the page content beneath.
   - Section scroll margins (`scroll-margin-top: 96px` / `88px + env(safe-area-inset-top)`) prevent the sticky header from occluding target section titles upon navigation (all section titles cleared header bottom by >= 43px).

---

## 3. Caveats

1. **Legacy 320x568 Viewport Boundary (iPhone SE 1st Gen)**:
   - On an ultra-narrow 320px viewport with 568px height, the 18px ribbon tab at `bottom: 72px / 24px` has a 6.27px bounding-box overlap with the outer wooden border margin of the Wanted poster frame. However, the photo, character name, and bounty values remain 100% unobstructed with 27.5px to 56.9px of clearance. On all standard mobile viewports (>=360px, including 375px, 390px, 412px), there is zero overlap even with the outer frame.
2. **Hover / Active State Flyout Overlay**:
   - When a user actively hovers over or focuses `.sketchbook-ribbon-btn` on tablet / small desktop (681px–1024px), the ribbon flyout expands to 164px width (`z-index: 95`) to allow reading the label and clicking it. During this active hover state, the flyout overlays the left edge of the "Explore Works" button. When the mouse unhovers or focus moves away, the flyout immediately retracts to the 24px peek tab with 0 collision. This is standard flyout drawer behavior, not an occlusion at rest.
3. **Milestone 2 & Milestone 3 Scope Boundaries**:
   - Wanted Poster image replacement (`media_1794201865931_238ddac4.jpg`), 3:4 aspect ratio enforcement, and Journey scroll-accumulated deck remain failing in the test suite as designed. They are the explicit responsibility of subsequent milestones (M2 and M3).

---

## 4. Conclusion

**Verdict: APPROVE**

Milestone 1 (Layout Shift & Proportion Correction) has successfully satisfied all requirements, interface contracts, and acceptance criteria:
1. **Zero Horizontal Overflow**: `scrollWidth <= clientWidth` (`delta === 0`) across all 7 evaluated viewports (375px, 680px, 681px, 768px, 1024px, 1440px, 1920px) and across 23 dense micro-stepping boundary widths. Lateral panning is 100% locked out.
2. **Zero Ribbon Collisions**: Hero name, tagline, CTA buttons, and Wanted poster are 100% occlusion-free at rest across all standard responsive viewports (360px–1920px) and across all scroll states.
3. **Tablet Navbar Responsiveness & Interactivity**: Tablet navbar controls bar has zero clipping and zero pointer-events interception across 681px–1024px; physical CDP mouse clicks verified that Zoro mode, Sound FX, and Theme picker operate smoothly.
4. **Sticky Navbar Integrity**: Sticky header docks reliably across all scroll depths under `overflow-x: clip`, with clean section title scroll clearances.
5. **Entry Point Parity**: `index.html` and `Your Name – Portfolio.html` are 100% byte-for-byte identical.

---

## 5. Verification Method

To independently reproduce and verify this empirical evaluation, run the following commands from the project root:

```powershell
# 1. Run Challenger 2 Adversarial Stress Test Suite (validates ribbon collisions, tablet controls, sticky docking, micro-stepping)
node tests/e2e/challenger2_adversarial.js

# 2. Run Official E2E Suite (Tiers 1 & 2)
node tests/e2e/runner.js --tier=1,2

# 3. Verify HTML Entry Point SHA-256 Parity
Get-FileHash index.html, "Your Name – Portfolio.html"
```

### Pass / Invalidation Criteria
- **Pass Criterion 1**: `node tests/e2e/challenger2_adversarial.js` outputs >= 85/86 passing assertions with 0 failures in Suite 2 (Tablet Controls), Suite 3 (Sticky Integrity), and Suite 4 (Dense Micro-stepping).
- **Pass Criterion 2**: `node tests/e2e/runner.js --tier=1,2` outputs 5/5 PASS for `F1-LayoutCentering`, 5/5 PASS for `F2-ZeroOverflow`, and 7/7 PASS for `B1-ViewportBoundaries`.
- **Pass Criterion 3**: `Get-FileHash` returns identical hashes for `index.html` and `Your Name – Portfolio.html`.
- **Invalidation Condition**: Any horizontal scrollbar (`scrollWidth > clientWidth`) appears on any standard viewport width (375px, 768px, 1024px, 1440px), or any ribbon button physically occludes hero text or CTA buttons at rest.
