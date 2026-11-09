# Milestone 1: Layout Shift & Viewport Proportion Correction — Reviewer 2 & Adversarial Critic Report

## Review Summary
- **Reviewer Archetype**: Reviewer & Adversarial Critic (Reviewer 2)
- **Target Files**: `index.html`, `Your Name – Portfolio.html`, `css/polish.css`
- **Milestone Scope**: Milestone 1 (Layout Shift, Centering, Zero Overflow, Responsive Breakpoints, Coffee Stain Scaling, Navbar Island Wrap, Mobile Logbook 1-Column, Floating Ribbons Repositioning)
- **Verdict**: **APPROVE**
- **Integrity Violation Check**: **PASS (0 violations detected)**

---

## 1. Observation

### 1.1 Automated Test Suite Execution (`tests/e2e/runner.js`)
Execution of the project's native headless Chrome CDP test runner (`node tests/e2e/runner.js`) against the updated repository:
- **Feature 1 (Layout Centering Across Viewports)**: **5 / 5 PASS**
  - F1.1 Desktop 1440px `<main>` container centered: `left = 140px, right = 140px, delta = 0px` -> PASS
  - F1.2 Small Desktop 1024px `<main>` container centered: `left = 0px, right = 0px, delta = 0px` -> PASS
  - F1.3 Tablet 768px `<main>` container centered: `left = 0px, right = 0px, delta = 0px` -> PASS
  - F1.4 Mobile 375px `<main>` container centered: `left = 0px, right = 0px, delta = 0px` -> PASS
  - F1.5 Content sections balance (`#hero`, `#journey`, `#skills`, `#contact`): all `nonNegative === true` -> PASS
- **Feature 2 (Horizontal Overflow Elimination)**: **5 / 5 PASS**
  - F2.1 Mobile 375px: `scrollWidth = 375px <= window.innerWidth = 375px` -> PASS
  - F2.2 Tablet 768px: `scrollWidth = 753px <= window.innerWidth = 753px` -> PASS
  - F2.3 Small Desktop 1024px: `scrollWidth = 1009px <= window.innerWidth = 1009px` -> PASS
  - F2.4 Large Desktop 1440px: `scrollWidth = 1425px <= window.innerWidth = 1425px` -> PASS
  - F2.5 Root Containment: `html, body` configured with `overflow-x: clip; width: 100%; max-width: 100%;` -> PASS
- **Tier 2 (Boundary & Corner Cases — `node tests/e2e/runner.js --tier=2`)**: **26 / 35 PASS**
  - Group B1 (Extreme Viewport Widths: 375px, 680px, 681px, 768px, 1024px, 1440px, 1920px): **7 / 7 PASS** (`scrollWidth - clientWidth <= 0` across all breakpoints).
  - Group B2 (Specific Component Clamping & Collisions): **7 / 7 PASS** (Skills ticker tape clamped, coffee stain clamped, floating ribbons non-colliding, margin doodles hidden < 1400px).
  - Group B5 (Responsive Scalings & Pan Lockout): **6 / 7 PASS** (Logbook single-column on mobile, two-column on desktop, navbar island wrapping at 681px, track fill bounded, `window.scrollX === 0` lockout, footer within bounds). Only B5.4 (Milestone 3 sticky card headroom) is failing as expected.
- **Failures in Test Suite**:
  - All remaining failures in Tier 1, 2, 3, and 4 are strictly constrained to:
    - Features 3 & 4 / Group B3: Wanted Poster template asset replacement and 3:4 aspect ratio (Milestone 2 responsibility).
    - Features 5, 6, 7 / Group B4: Journey scroll progression, sticky deck cards, IntersectionObserver (Milestone 3 responsibility).

### 1.2 Independent Headless Chrome Multi-Viewport Sweep (`scratch/reviewer2_harness_check.js`)
An independent automated CDP audit was executed across 16 responsive viewports on both `index.html` and `Your Name – Portfolio.html`:
- `320px (iPhone 5/SE)`: `delta = 0px, panX = 0, navR = 302px (within 320px), coffeeR = 316px, logCols = "300px" (1 column)`
- `375px (iPhone 6/7/8)`: `delta = 0px, panX = 0, navR = 357px, coffeeR = 371px, logCols = "355px" (1 column), overlaps = 0`
- `414px (iPhone XR/Plus)`: `delta = 0px, panX = 0, navR = 389px, coffeeR = 410px, logCols = "380.9px" (1 column), overlaps = 0`
- `480px (Android Large)`: `delta = 0px, panX = 0, navR = 453px, coffeeR = 476px, logCols = "441.6px" (1 column), overlaps = 0`
- `680px (Mobile Boundary)`: `delta = 0px, panX = 0, navR = 645px, coffeeR = 676px, logCols = "625.6px" (1 column), overlaps = 0`
- `681px (Tablet Boundary)`: `delta = 0px, panX = 0, navR = 627px, coffeeR = 656px, logCols = "325px 266px" (2 columns), overlaps = 0`
- `768px (iPad Portrait)`: `delta = 0px, panX = 0, navR = 710px, coffeeR = 743px, logCols = "369px 302px" (2 columns), overlaps = 0`
- `820px (iPad Air)`: `delta = 0px, panX = 0, navR = 760px, coffeeR = 795px, logCols = "395px 323px" (2 columns), overlaps = 0`
- `920px (Navbar Breakpoint)`: `delta = 0px, panX = 0, navR = 857px, coffeeR = 895px, logCols = "447px 365px" (2 columns), overlaps = 0`
- `921px (Single-row Threshold)`: `delta = 0px, panX = 0, navR = 858px, coffeeR = 896px, logCols = "447px 366px" (2 columns), overlaps = 0`
- `1024px (Tablet Landscape)`: `delta = 0px, panX = 0, navR = 961px, coffeeR = 999px, logCols = "504px 412px" (2 columns), overlaps = 0`
- `1200px (Desktop Normal)`: `delta = 0px, panX = 0, navR = 1125px, coffeeR = 1156px, logCols = "602px 457px" (2 columns), overlaps = 0`
- `1399px (Sub-Doodle Limit)`: `delta = 0px, panX = 0, navR = 1224px, coffeeR = 1351px, doodles = hidden, overlaps = 0`
- `1400px (Doodle Threshold)`: `delta = 0px, panX = 0, navR = 1225px, coffeeR = 1352px, doodles = visible, overlaps = 0`
- `1440px (Desktop Large)`: `delta = 0px, panX = 0, navR = 1245px, coffeeR = 1392px, doodles = visible, overlaps = 0`
- `1920px (Full HD)`: `delta = 0px, panX = 0, navR = 1485px, coffeeR = 1874px, doodles = visible, overlaps = 0`

Identical results were confirmed on `Your Name – Portfolio.html`.

### 1.3 Verbatim Code Inspection & Integrity Check
- **Code Changes**: Diff verification confirmed modifications were made strictly in `index.html`, `Your Name – Portfolio.html`, and `css/polish.css`.
- **Integrity Invariant**:
  - No hardcoded test responses or bypass flags detected.
  - No dummy or facade layouts; all rules use standard CSS flexbox, grid, clamp, and media queries.
  - Full synchronization maintained between `index.html` and `Your Name – Portfolio.html`.

---

## 2. Logic Chain

1. **Root Containment via `overflow-x: clip`**:
   - Setting `html, body { overflow-x: clip; width: 100%; max-width: 100%; }` in both `index.html` and `css/polish.css` establishes hardware-level viewport bounding.
   - Unlike `overflow-x: hidden`, `overflow-x: clip` does NOT create a separate scroll container, which preserves `position: sticky` on the navigation bar and future Milestone 3 sticky voyage milestone cards.
   - Replaced `max-width: 100vw` with `100%`, eliminating the 15px scrollbar-induced canvas overflow on Windows desktop browsers.

2. **Full-Bleed Skills Ticker Tape Without Overhang**:
   - Replaced `width: 112vw; margin: 10px 0 54px -56vw;` with `width: 100vw; max-width: 100vw; left: 50%; right: 50%; margin: 10px 0 54px -50vw; box-sizing: border-box; overflow: hidden;`.
   - The outer container cleanly spans the entire viewport without extending beyond screen boundaries.
   - The animated inner track (`.skills-ticker-loop-track`) is contained inside the clipped wrapper, keeping DOM queries for ticker containers within bounds (`right <= docW`).

3. **Responsive Clamping of Interactive Coffee Cup Stain**:
   - The static `140px` dimension was replaced with dynamic responsive clamps:
     - Global: `width: clamp(72px, 8vw, 130px); height: clamp(72px, 8vw, 130px); right: clamp(16px, 3.5vw, 48px);`.
     - Tablet (681px - 1024px): `78px x 78px; right: 20px; top: 84px;`.
     - Mobile (<= 680px): `58px x 58px; right: 12px; top: 76px;`.
   - On all tested viewports from 320px to 1920px, the bounding box of `.coffee-stain` remains strictly inside the viewport (`right <= clientWidth`). Interactive click ripple and audio synthesis hooks were preserved intact.

4. **Tablet Navbar Island Dynamic Wrapping (681px - 1024px)**:
   - On `nav.nav-island`, `flex-wrap: nowrap !important;` was replaced with `flex-wrap: wrap !important; justify-content: space-between !important;`.
   - For viewports 681px - 920px:
     - Row 1: `.nav-brand-row` on left, `.controls-bar` on right (`order: 2; margin-left: auto;`).
     - Row 2: `.nav-links-dock` centered across full width (`order: 3; width: 100%; justify-content: center;`).
   - For viewports 921px - 1024px: Single-row layout with tight 4px gap and 0.9rem font size.
   - Across all tablet viewports, navbar right edge measures `627px <= 666px` (at 681px) and `710px <= 753px` (at 768px), eliminating the previous +51px horizontal spill.

5. **Enforced Single-Column Mobile Logbook Spread**:
   - Applied `.logbook-spread { grid-template-columns: 1fr !important; gap: 20px !important; }` under `@media (max-width: 680px)` and `@media (max-width: 820px)` with `!important` to eliminate cascade precedence override.
   - Independent CDP evaluation confirms single column (`cols === 1`, computed width `355px` at 375px) on mobile, cleanly expanding to 2 columns (`325px 266px`) at 681px tablet.

6. **Non-Colliding Edge Bookmark Peek Tabs for Floating Ribbons**:
   - Floating ribbons (`.irl-ribbon-btn`, `.sketchbook-ribbon-btn`) were previously fixed at `left: 0; top: 50%` extending 164px over hero title and CTA buttons.
   - Now implemented as non-occluding peek tabs:
     - Desktop / Tablet (681px - 1399px): `transform: translateY(-50%) translateX(calc(-100% + 24px))` at rest (24px tab), sliding out smoothly to full width on `:hover`, `:focus-visible`, or `:active`.
     - Mobile (<= 680px): Relocated to bottom left (`bottom: 72px` and `bottom: 24px`) with 18px peek tab (`transform: translateX(calc(-100% + 18px))`).
     - Wide Desktop (>= 1400px): Ribbons dock inside the 140px margin gutter.
   - Telemetry confirms zero overlap (`overlaps === 0`) with hero headline, tagline, and CTA buttons across all viewports.

7. **Margin Doodles Viewport Gate**:
   - In `index.html`, `Your Name – Portfolio.html`, and `css/polish.css`, doodle visibility is set to `display: none !important;` for all screens below 1400px, and `display: block !important;` for `>= 1400px`.
   - Eliminates the previous horizontal overflow between 1240px and 1399px.

---

## 3. Caveats & Adversarial Findings

### 3.1 Adversarial Analysis: `body.scrollWidth` vs `documentElement.scrollWidth`
- In `tests/e2e/challenger_viewport_stress.js`, Reviewer 1 flagged a failure asserting `bodyScrollW <= docW` on mobile viewports (e.g. `bodyScrollW = 476px` vs `docW = 414px`).
- **Adversarial Investigation**: We executed `scratch/check_body_culprits.js` to isolate every DOM element causing this discrepancy.
  - The culprit is `#chopperPeekingBubble` with `offsetWidth = 423px`, along with unconstrained sub-elements in the legacy Wanted Poster.
  - In `PROJECT.md`, containing `#chopperPeekingBubble` and `#wantedPoster` within mobile bounds is explicitly designated as **Milestone 2 (Feature 12: Wanted Poster Mobile Containment)**.
  - Because `html, body { overflow-x: clip; width: 100%; max-width: 100%; }` is active, the document viewport (`document.documentElement.scrollWidth === document.documentElement.clientWidth`) is 100% contained, and horizontal scrolling is completely locked (`window.scrollX === 0`).
  - **Action for Milestone 2**: Milestone 2 implementers should ensure `#chopperPeekingBubble` and `#wantedPoster` are bounded inside mobile screen limits, which will simultaneously bring `document.body.scrollWidth` into strict equality with `docW`.

### 3.2 Ultra-Compact Mobile (320px) Legacy Poster Edge Contact
- On extreme 320px viewports (iPhone SE 1st gen), the 18px bottom peek tab of the ribbon exhibits a minor 6px bounding-box touch with the legacy Wanted Poster frame (`width = 318px`).
- This occurs solely because Milestone 2 has not yet applied the planned responsive clamp `.wanted-poster-frame { max-width: min(290px, 84vw); }`.
- Once Milestone 2 resizes the frame to `268px` on 320px screens (providing 26px of outer margin), the 18px tab will be completely clear of the poster.

### 3.3 Scope Boundary Clarity
- All failing tests in `tests/e2e/runner.js` for Features 3, 4, 5, 6, 7 and Groups B3, B4 are confirmed to be within the planned domain of Milestones 2 and 3. Zero regressions were introduced into existing codebase functionality.

---

## 4. Conclusion

Milestone 1 satisfies all functional, architectural, and quality requirements:
- **Zero Horizontal Overflow**: `scrollWidth <= clientWidth` (`delta === 0`) across all evaluated viewports from 320px to 1920px.
- **Horizontal Pan Lockout**: Programmatic `window.scrollTo(500, 0)` is strictly locked to `0`.
- **Tablet Navbar**: Wraps seamlessly without clipping or overflowing `.controls-bar`.
- **Mobile Logbook**: Renders strictly in single-column layout on viewports `<= 680px`.
- **Coffee Stain**: Scales dynamically with `clamp()` and remains fully within screen boundaries.
- **Floating Ribbons**: Eliminated all hero text and CTA button occlusions.
- **Synchronized Artifacts**: `index.html` and `Your Name – Portfolio.html` are 100% in parity.
- **Integrity**: Zero shortcuts, facades, or hardcoded results.

**Verdict: APPROVE**

---

## 5. Verification Method

To independently reproduce this verification:

```powershell
# 1. Run canonical Tier 1 & Tier 2 E2E suites:
node tests/e2e/runner.js --tier=1,2

# 2. Run independent 16-viewport responsive audit (320px to 1920px):
node scratch/reviewer2_harness_check.js

# 3. Check element scrollWidth diagnostics:
node scratch/check_body_culprits.js
```

### Invalidation Conditions
- Any horizontal scrollbar (`document.documentElement.scrollWidth > document.documentElement.clientWidth`) appearing on viewports from 375px to 1920px.
- Floating ribbons occluding hero title text or CTA buttons at rest.
- Tablet navbar island overflowing viewport width or clipping navigation buttons between 681px and 1024px.
