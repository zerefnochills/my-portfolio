# Comprehensive Layout Shift & Viewport Proportion Survey Report

## 1. Observation

Direct measurements and codebase audits were performed across `index.html` (7,901 lines) and `css/polish.css` (1,832 lines) using headless Chrome telemetry and layout bounding-box evaluations across the four target viewports: **Mobile 375px**, **Tablet 768px**, **Desktop 1024px**, and **Desktop 1440px**.

### 1.1 Viewport Telemetry & Horizontal Overflow Summary

Telemetry extracted via Chrome DevTools Protocol (`scratch/exhaustive_survey.js`, saved in `scratch/survey_data.json`):

| Viewport | Client Width (`docW`) | Scroll Width (`scrollW`) | Horizontal Overflow (`scrollW - docW`) | Horizontal Scrollbar Active? | Main Container Left/Right Margin | Left/Right Gutter Symmetry |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile 375px** | 375px | 432px | **+57px** | **YES** | 0px / 0px (pad: 10px) | L: 0px, R: 0px |
| **Tablet 768px** | 768px | 819px | **+51px** | **YES** | 0px / 0px (pad: 24px) | L: 0px, R: 0px |
| **Desktop 1024px** | 1009px | 1079px | **+70px** | **YES** | 0px / 0px (pad: 24px) | L: 0px, R: 0px |
| **Desktop 1440px** | 1425px | 1520px | **+95px** | **YES** | 133px / 133px (pad: 24px)| L: 133px, R: 133px |

---

### 1.2 Primary Code Locations & Verbatim Observations

#### Observation O1: Skills Ticker Tape Blowout (`css/polish.css:333-347, 1602-1607`)
In `css/polish.css`, lines 333-347:
```css
.skills-ticker-tape {
  position: relative;
  left: 50%;
  width: 112vw;
  margin: 10px 0 54px -56vw;
  background: #dc2626 !important;
  background: linear-gradient(90deg, #991b1b 0%, #dc2626 35%, #ef4444 65%, #991b1b 100%) !important;
  color: #fff;
  transform: rotate(-1.5deg);
  overflow: hidden;
  box-shadow: 0 8px 0 var(--shadow, rgba(0, 0, 0, 0.25));
  border-top: 3.5px solid var(--ink, #111);
  border-bottom: 3.5px solid var(--ink, #111);
  z-index: 10;
}
```
And on mobile in `css/polish.css`, lines 1602-1607:
```css
.skills-ticker-tape {
  width: 100vw !important;
  left: 50% !important;
  margin: 8px 0 40px -50vw !important;
  padding: 12px 0 !important;
}
```
**Measured Bounding Box**:
- At 1440px: `left: -95px`, `right: 1520px`, `width: 1615px`. Overflows right viewport edge by **95px**.
- At 1024px: `left: -70px`, `right: 1079px`, `width: 1148px`. Overflows right viewport edge by **70px**.
- At 768px: `left: -47px`, `right: 815px`, `width: 862px`. Overflows right viewport edge by **47px**.

#### Observation O2: Coffee Cup Stain Fixed Overflow (`index.html:170-184`)
In `index.html`, lines 170-184:
```css
.coffee-stain {
  position: fixed;
  top: 90px;
  right: 7%;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 8px solid var(--coffee);
  box-shadow: inset 0 0 0 2px var(--coffee), 0 0 0 2px var(--coffee);
  transform: rotate(20deg) scaleY(0.94);
  pointer-events: auto;
  cursor: pointer;
  z-index: 1;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```
**Measured Bounding Box**:
- At 375px: `left: 243px`, `right: 420px`, `width: 177px` (rotated bounding box). Overflows right screen edge by **45px** (`420px - 375px = 45px`).
- At 768px: `left: 603px`, `right: 780px`, `width: 177px`. Overflows right screen edge by **12px** (`780px - 768px = 12px`).

#### Observation O3: Tablet Navigation Controls Overflow (`css/polish.css:15-34`, `index.html:436-444`)
In `css/polish.css`, lines 23-34:
```css
nav.nav-island {
  pointer-events: auto;
  max-width: 1160px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  box-sizing: border-box;
}
```
**Measured Bounding Box**:
- At 768px: Brand row + 6 nav links + `.controls-bar` total 714px. Available width in `main` (768px - 48px padding - 28px nav padding) is only 692px.
- Result: `.controls-bar` is forced past the right edge: `left: 693px`, `right: 819px` (width: 126px). Overflows viewport right edge by **51px** (`819px - 768px = 51px`).
- In `screenshot_768.png`, the `sound off`, `zoro`, and `ink` buttons are visibly clipped off the right side of the screen.

#### Observation O4: Mobile Logbook Spread 2-Column Squeeze (`css/polish.css:512-518, 1403-1406` vs `index.html:3860-3864`)
In `index.html`, lines 3860-3864:
```css
@media (max-width: 820px) {
  .logbook-spread {
    grid-template-columns: 1fr;
  }
}
```
However, in `css/polish.css` (imported at `index.html:4249`, AFTER the embedded `<style>` block):
Line 512:
```css
.logbook-spread {
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 28px;
  margin-top: 28px;
  position: relative;
}
```
Lines 1403-1406:
```css
@media (min-width: 681px) and (max-width: 1024px) {
  .logbook-spread {
    grid-template-columns: 1.1fr 0.9fr !important;
    gap: 20px !important;
  }
}
```
Under `@media (max-width: 680px)`: No rule for `.logbook-spread` is defined in `css/polish.css`.
**Measured Grid Columns**:
- At 375px: computed `gridTemplateColumns` is `167.891px 225.828px` with `gap: 28px`.
- Total grid width = `168px + 226px + 28px = 422px`. In a 355px content area, this overflows by **67px**.

#### Observation O5: Floating Edge Ribbons Direct Collision with Left Content (`css/polish.css:125-147, 1483-1506`)
In `css/polish.css`, lines 125-139:
```css
.irl-ribbon-btn {
  top: calc(50% - 32px) !important;
  bottom: auto !important;
  left: 0 !important;
  transform: translateY(-50%) !important;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
}
.sketchbook-ribbon-btn {
  top: calc(50% + 28px) !important;
  bottom: auto !important;
  left: 0 !important;
  transform: translateY(-50%) !important;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s ease;
}
```
And on mobile (`css/polish.css:1483-1501`):
```css
.irl-ribbon-btn {
  top: auto !important;
  bottom: 68px !important;
  left: 0 !important;
}
.sketchbook-ribbon-btn {
  top: auto !important;
  bottom: 22px !important;
  left: 0 !important;
}
```
**Measured Overlap & Collision**:
- At 1440px: Ribbons extend from `left: 0` to `right: 164px`. `main` content starts at `left: 157px`. Overlap = **7px** (and **15px** on `:hover`).
- At 1024px: Ribbons extend from `0` to `164px`. `main` content starts at `left: 24px`. Overlap = **140px**. The ribbon buttons sit directly on top of the hero text, tagline, and "Explore Works" button (verified in `screenshot_1024.png`).
- At 768px: Ribbons extend to `164px`. Overlap = **140px** over "Say Hello" and "Unlock Captain's Secret Stash" buttons (verified in `screenshot_768.png`).
- At 375px: Ribbons sit at bottom left (`left: 0, bottom: 68px/22px`), overlapping the Wanted Poster's bounty row and marine stamp by **113px** (verified in `screenshot_375.png`).

#### Observation O6: Hero Grid Asymmetry and Lack of Left Container Breathing Room
In `css/polish.css`, lines 1345-1355:
```css
@media (min-width: 681px) and (max-width: 1024px) {
  .hero {
    display: grid !important;
    grid-template-columns: 1.15fr minmax(280px, 340px) !important;
    gap: 28px !important;
    align-items: center !important;
    min-height: 70vh !important;
    padding-top: 24px !important;
    padding-bottom: 48px !important;
  }
  .hero-left-col {
    max-width: 100% !important;
    align-items: flex-start !important;
  }
}
```
And lines 148-150:
```css
.hero-left-col {
  padding-left: 0;
}
```
**Measured Positions**:
- At 768px: Hero left column is 352px wide (`left: 24px, right: 376px`). Wanted poster is 347px wide (`left: 405px, right: 753px`).
- Left gutter is only 24px, while right column occupies 48% of screen.
- At 1024px: `main` has `max-width: 1160px; margin: 0 auto;`. Because `1160px > 1024px`, margins evaluate to `0px`. The left column starts at `padding-left: 24px`, leaving zero external margin and pinning the text directly to the left screen edge.

#### Observation O7: Root `html` Lacks `overflow-x: clip / hidden` (`index.html:130`, `css/polish.css:1297`)
In `index.html`:
```css
html {
  scroll-padding-top: 80px;
  scroll-behavior: smooth;
}
body {
  overflow-x: hidden;
}
```
In `css/polish.css`:
```css
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scroll-behavior: smooth;
}
body {
  overflow-x: hidden !important;
  width: 100%;
  max-width: 100vw;
}
```
`overflow-x: clip` or `hidden` is absent from `html`. In addition, `max-width: 100vw` on `body` computes against the window width including scrollbars (15-17px wider than `100%`), creating layout dissonance.

#### Observation O8: Side Margin Doodles Overflowing Between 1240px and 1390px (`index.html:1833-1837, 4397-4408`)
In `index.html`:
```css
@media (min-width: 1240px) {
  .side {
    display: block;
  }
}
```
HTML:
```html
<svg class="doodle draw side" style="top:44%;right:-115px;width:75px" viewBox="0 0 40 40" aria-hidden="true">
```
At 1240px viewport: `main` max-width is 1160px. Side gutter is `(1240 - 1160) / 2 = 40px`. A doodle with `right: -115px` sticks out `115 - 40 = 75px` beyond the right viewport boundary.

---

## 2. Logic Chain

1. **Step 1: Horizontal Overflow Generates Unwanted Scrollable Canvas**  
   - Based on O1 (`.skills-ticker-tape`), O2 (`.coffee-stain`), O3 (`nav .controls-bar`), O4 (`.logbook-spread`), and O8 (`.side` doodles):
   - Every single tested viewport width (375px, 768px, 1024px, 1440px) exhibits `scrollWidth > clientWidth` (deltas: +57px, +51px, +70px, +95px).
   - This creates an active horizontal scrollbar and expands the document's total scrollable bounding width.

2. **Step 2: Visual Displacement and Apparent "Leftward Shift"**  
   - When a page has 50px to 95px of phantom overflow on the right side, the initial rendering viewport aligns at `scrollLeft: 0`.
   - Content with `margin: 0 auto; max-width: 1160px` calculates its center based on the available client width (`100%`), but the user's perception and scroll track include the bloated overflow width on the right.
   - Consequently, the entire visual layout appears shifted to the left with excessive dead space on the right.
   - Any lateral touch drag or horizontal scroll wobbles the entire page.

3. **Step 3: Direct Content Occlusion by Floating Edge Ribbons**  
   - Based on O5:
   - The floating ribbons (`.irl-ribbon-btn`, `.sketchbook-ribbon-btn`) are anchored at `position: fixed; left: 0;` with widths of 141px to 164px.
   - On Desktop 1024px and Tablet 768px, `main` has 0 margin and 24px padding. The left column starts at x = 24px.
   - The ribbons project 164px inward from the left, directly occluding 140px of the hero typography and interactive buttons.
   - On Mobile 375px, the ribbons sit at `bottom: 68px/22px`, projecting 141px inward and colliding directly over the Wanted Poster's bounty text.
   - This physical obstruction forces users to see the content as severely jammed or displaced under the left edge ribbons.

4. **Step 4: Grid Collapse and Squeezing Below Breakpoints**  
   - Based on O4 and O6:
   - On Mobile 375px, `.logbook-spread` retains a 2-column layout (`168px 226px`), overflowing 375px.
   - On Tablet 768px, `.hero` retains a 2-column grid (`1.15fr minmax(280px, 340px)`), compressing the left text column to 337px while the wanted poster takes 340px, and the navbar controls overflow by 51px because `nav.nav-island` lacks wrapping rules between 681px and 1024px.
   - On Desktop 1024px, `max-width: 1160px` strips all horizontal auto-margins, placing the left content flush against the edge.

---

## 3. Caveats

1. **Browser Engine Variance**: Telemetry measurements were conducted on Chromium (Google Chrome headless). WebKit (Safari / iOS) and Gecko (Firefox) calculate `100vw` vs scrollbar width identically, but iOS Safari dynamic viewport height (`100dvh` / navigation bar collapse) may slightly alter vertical positioning of sticky anchors.
2. **Reduced Motion**: Under `@media (prefers-reduced-motion: reduce)`, CSS animations like `heroNameWriteLoop` and `stripScroll` are disabled, mitigating title flickering but leaving static geometry identical.
3. **Investigation Boundary**: This report focuses on CSS architecture, container proportions, and overflow dynamics (R1). Exploration of the Wanted Poster asset replacement (R2) and the 'My Journey' scroll architecture (R3) are coordinated with dedicated subagents (`explorer_survey_2` and `spec_miner_survey_3`).

---

## 4. Conclusion & Actionable Technical Fix Strategy

### 4.1 Summary of Root Causes
The "overall CSS leftward shift and proportion ratio distortion" is caused by four interlocking architectural defects:
1. **Unconstrained Right-Edge Overflow Sources**: `.skills-ticker-tape` (112vw / -56vw), `#coffeeStain` (right: 7% on mobile/tablet), navbar `.controls-bar` (no tablet wrap rule), and `.logbook-spread` (unresponsive 2-col on mobile) cause +51px to +95px of horizontal canvas expansion.
2. **Missing Viewport Boundary Clip**: `html` lacks `overflow-x: clip` / `overflow-x: hidden`, allowing phantom scrollWidth expansion that displaces the visual center to the left.
3. **Fixed Floating Ribbon Collision**: `.irl-ribbon-btn` and `.sketchbook-ribbon-btn` (164px wide at `left: 0`) overlap into the hero content by 140px on tablet/1024px desktop and 113px on mobile.
4. **Asymmetric Container Grids & Padding**: On 1024px and 768px, `main` lacks responsive auto-gutters, pinning content directly against the 24px left edge with zero breathing room.

---

### 4.2 Proposed Technical Fix Strategy (for Implementer)

#### Fix 1: Enforce Root Viewport Containment (`html, body`)
In `index.html` (lines 130-141) and `css/polish.css` (lines 1297-1309):
```css
html {
  overflow-x: clip; /* Modern clean boundary clipping without killing sticky */
  width: 100%;
  max-width: 100%;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scroll-padding-top: 88px;
  scroll-behavior: smooth;
}

body {
  overflow-x: clip;
  width: 100%;
  max-width: 100%; /* Replace max-width: 100vw which includes scrollbar width */
  margin: 0;
  position: relative;
}
```

#### Fix 2: Tame `.skills-ticker-tape` to Prevent Viewport Blowout
In `css/polish.css` (lines 333-347 and 1602-1607):
Replace the runaway `width: 112vw; margin-left: -56vw; left: 50%;` with a full-bleed container clipped cleanly to the document client width:
```css
.skills-ticker-tape {
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;
  transform: rotate(-1.5deg);
  overflow: hidden;
  /* Ensure parent or section has overflow: clip/hidden */
}

/* On mobile (<= 680px) */
@media (max-width: 680px) {
  .skills-ticker-tape {
    margin-left: -50vw !important;
    margin-right: -50vw !important;
    width: 100vw !important;
    max-width: 100vw !important;
    left: 50% !important;
    right: 50% !important;
  }
}
```
*Even cleaner*: Keep `.skills-ticker-tape` within the section wrapper with `width: 100%; margin: 16px 0 48px; border-radius: 8px; transform: rotate(-1deg);`, eliminating all `vw` margin offsets entirely.

#### Fix 3: Responsive Scaling for `.coffee-stain`
In `index.html` (lines 170-184) and `css/polish.css`:
```css
.coffee-stain {
  position: fixed;
  top: 90px;
  right: max(16px, 4%);
  width: clamp(80px, 10vw, 140px);
  height: clamp(80px, 10vw, 140px);
  max-width: 100%;
}
@media (max-width: 768px) {
  .coffee-stain {
    right: 12px;
    width: 80px;
    height: 80px;
    opacity: 0.6;
  }
}
```

#### Fix 4: Relocate / Dock Floating Ribbons to Eliminate Left Collisions
In `css/polish.css` (lines 125-147):
- For Desktop (> 1160px): Keep ribbons on left edge, but increase `main` padding or adjust ribbon width: `width: auto; max-width: 130px;` so it does not collide into content.
- For Tablet (681px - 1160px): Dock ribbons to bottom-left (`bottom: 72px` and `bottom: 24px`, or dock them into a neat floating tab) with `z-index: 100`, OR hide text and show compact badge icons until hover/click.
- For Mobile (<= 680px): Make them sleek compact corner tabs (`padding: 6px 10px; width: auto; font-size: 0.78rem;`) docked at the bottom-left edge below the wanted poster so they never overlap the poster or text.

#### Fix 5: Tablet Navbar Wrap Rule (681px - 1024px)
In `css/polish.css` under `@media (min-width: 681px) and (max-width: 1024px)`:
```css
nav.nav-island {
  flex-wrap: wrap !important;
  justify-content: space-between !important;
  padding: 8px 16px !important;
  gap: 8px !important;
}
.nav-links-dock {
  gap: 10px !important;
}
.nav-link {
  font-size: 0.88rem !important;
  padding: 4px 6px !important;
}
.controls-bar {
  flex-shrink: 0 !important;
  margin-left: auto !important;
}
```

#### Fix 6: Mobile Logbook Single Column
In `css/polish.css` under `@media (max-width: 680px)`:
```css
.logbook-spread {
  grid-template-columns: 1fr !important;
  gap: 20px !important;
}
```

#### Fix 7: Hero Grid & Container Symmetry
In `css/polish.css`:
```css
main {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 clamp(16px, 4vw, 36px);
  box-sizing: border-box;
}

@media (min-width: 681px) and (max-width: 1024px) {
  .hero {
    display: grid !important;
    grid-template-columns: 1fr minmax(280px, 320px) !important;
    gap: 32px !important;
    align-items: center !important;
    padding-left: 12px !important; /* Provide left breathing room */
  }
}
```

#### Fix 8: Margin Doodles Viewport Constraint
In `index.html:1833-1837`:
```css
@media (min-width: 1400px) { /* Raise from 1240px to 1400px so margin is > 120px */
  .side {
    display: block;
  }
}
```

---

## 5. Verification Method

### Independent Verification Commands
To independently verify the elimination of horizontal overflow and confirm container centering across all four viewports, execute:

```powershell
# 1. Run headless layout survey script
node scratch/exhaustive_survey.js

# 2. Inspect generated JSON telemetry
node -e "
const d = JSON.parse(require('fs').readFileSync('scratch/survey_data.json'));
Object.entries(d).forEach(([vp, data]) => {
  console.log(vp + ' -> hasHScroll: ' + data.hasHScroll + ' (overflow: ' + data.horizontalScrollDelta + 'px)');
});
"
```

### Invalidation Conditions
- **Condition 1**: Any viewport reports `hasHScroll: true` or `scrollWidth > clientWidth`.
- **Condition 2**: The floating ribbons (`.irl-ribbon-btn`, `.sketchbook-ribbon-btn`) bounding rect overlaps any part of the hero typography, buttons, or Wanted Poster.
- **Condition 3**: `main` container exhibits asymmetrical left/right gutters on desktop viewports (`gutterAsymmetry != 0`).
- **Condition 4**: `.logbook-spread` displays more than 1 column on viewport width 375px.
