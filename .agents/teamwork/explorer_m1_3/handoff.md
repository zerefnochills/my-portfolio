# Milestone 1 Explorer 3: Floating Ribbons, Hero Container Breathing Room & Margin Doodles Strategy

## 1. Observation

Direct layout geometry measurements and DOM bounding box evaluations were conducted across `index.html` (7,901 lines) and `css/polish.css` (1,832 lines) using Chrome DevTools Protocol headless automation (`scratch/inspect_ribbon_structure.js`, `scratch/test_ribbons.js`, and `scratch/verify_m1_explorer3.js`) across four target viewports: **Mobile 375px**, **Tablet 768px**, **Desktop 1024px**, and **Desktop 1440px**.

### 1.1 Verbatim Baseline Measurements (Pre-Fix Collisions)

| Viewport | Element | Bounding Box (`left`, `right`, `top`, `bottom`, `width`) | Colliding Target Element | Target Bounding Box | Measured Overlap / Occlusion |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile 375px** | `.irl-ribbon-btn` | `L: 0px, R: 141.3px, T: 695.8px, B: 732.0px, W: 141.3px` | `.wanted-poster-frame` | `L: 20.9px, R: 339.1px, T: 475.0px, B: 956.0px` | **120.4px horizontal overlap** over wanted poster stamp/bounty |
| **Mobile 375px** | `.sketchbook-ribbon-btn` | `L: 0px, R: 125.9px, T: 715.8px, B: 778.0px, W: 125.9px` | `.wanted-poster-frame` | `L: 20.9px, R: 339.1px, T: 475.0px, B: 956.0px` | **105.0px horizontal overlap**; vertical overlap with `.irl-ribbon-btn` by 16.2px |
| **Tablet 768px** | `.irl-ribbon-btn` | `L: 0px, R: 164.1px, T: 337.5px, B: 398.5px, W: 164.1px` | `.hero-left-col` (Bio / CTA) | `L: 24.0px, R: 361.0px, T: 152.8px, B: 579.4px` | **140.1px direct occlusion** over bio text & CTA buttons |
| **Tablet 768px** | `.sketchbook-ribbon-btn` | `L: 0px, R: 147.9px, T: 382.5px, B: 473.5px, W: 147.9px` | `.hero-cta` (Action buttons) | `L: 24.0px, R: 361.0px, T: 369.8px, B: 490.6px` | **123.9px direct occlusion** sitting on "Say Hello" / "Captain's Stash" |
| **Desktop 1024px** | `.irl-ribbon-btn` | `L: 0px, R: 164.1px, T: 337.5px, B: 398.5px, W: 164.1px` | `.hero-left-col` (Tagline/Text)| `L: 24.0px, R: 617.0px, T: 194.8px, B: 537.5px` | **140.1px direct occlusion** over hero heading & tagline |
| **Desktop 1024px** | `.sketchbook-ribbon-btn` | `L: 0px, R: 147.9px, T: 382.5px, B: 473.5px, W: 147.9px` | `.hero-cta` (CTA buttons) | `L: 24.0px, R: 401.8px, T: 396.3px, B: 448.7px` | **123.9px direct occlusion** over "Explore Works" button |
| **Desktop 1440px** | `.irl-ribbon-btn` | `L: 0px, R: 164.1px, T: 337.5px, B: 398.5px, W: 164.1px` | `.hero-left-col` (Main gutter)| `L: 156.5px, R: 776.5px, T: 196.4px, B: 606.0px` | **7.6px collision** with content padding (expands to 15.6px on `:hover`) |

### 1.2 Primary Code Locations & Defect Root Causes

1. **Floating Ribbons Fixed Edge Anchors (`css/polish.css:125-147`, `index.html:1440-1460, 2920-2940`)**:
   - In `css/polish.css:126-139`:
     ```css
     .irl-ribbon-btn {
       top: calc(50% - 32px) !important;
       bottom: auto !important;
       left: 0 !important;
       transform: translateY(-50%) !important;
     }
     .sketchbook-ribbon-btn {
       top: calc(50% + 28px) !important;
       bottom: auto !important;
       left: 0 !important;
       transform: translateY(-50%) !important;
     }
     ```
   - On screens `<= 1024px`, `main` has `max-width: 1160px; margin: 0 auto;`. Because `1024px < 1160px` and `768px < 1160px`, `main` takes 100% of the screen with 0 outer margin and only 24px left padding. Content starts at `x = 24px`.
   - The ribbons project 164.1px inward from `x = 0`, creating a verbatim **140.1px collision zone** directly over the hero name, tagline, and CTA buttons.

2. **Mobile Ribbon Stacking Collision (`css/polish.css:1483-1506`)**:
   - In `css/polish.css:1484-1501`:
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
   - At 800px mobile height, `bottom: 68px` places `.irl-ribbon-btn` at `y = 695.8px` to `732.0px`. `bottom: 22px` places `.sketchbook-ribbon-btn` at `y = 715.8px` to `778.0px`.
   - The Wanted Poster sits centered at `y = 475.0px` to `956.0px` and `x = 20.9px` to `339.1px`.
   - The two ribbons cover `x = 0` to `141.3px`, occluding the Wanted Poster's left side by **120.4px**, and vertically overlap each other by **16.2px** (`732.0px - 715.8px`).

3. **Hero Container Asymmetry & Clamped Breathing Room (`index.html:417-422`, `css/polish.css:9-13, 148-150, 1345-1359`)**:
   - `index.html:417`: `main { max-width: 1040px; margin: 0 auto; padding: 0 24px; }`.
   - `css/polish.css:9`: `main { max-width: 1160px; filter: none; }` (omits padding clamp and box-sizing).
   - `css/polish.css:148`: `.hero-left-col { padding-left: 0; }`.
   - On 768px and 1024px, the left content begins flush at `x = 24px`, leaving zero breathing room and producing severe visual leftward displacement relative to the right-aligned wanted poster.

4. **Margin Doodles Premature Reveal (`index.html:1833-1837`, `index.html:4396-4408`)**:
   - In `index.html:1833-1837`:
     ```css
     @media (min-width: 1240px) {
       .side {
         display: block;
       }
     }
     ```
   - At 1240px viewport width, `main` max-width is 1160px. The side margin is `(1240px - 1160px) / 2 = 40px`.
   - The doodle at `right: -115px; width: 75px` projects `115px - 40px = 75px` beyond the right viewport edge.
   - The doodle at `left: -120px; width: 75px` projects `120px - 40px = 80px` beyond the left viewport edge.
   - Between 1240px and 1399px, `.side` doodles generate severe horizontal scroll blowout.

---

## 2. Logic Chain

1. **Step 1: Edge Ribbons Occlude 140px of Content Due to Unresponsive Left-Zero Anchoring**  
   - Based on Section 1.1 and 1.2: The ribbons are fixed elements with widths of 141px to 164px.
   - On Desktop (>= 1400px), `main` auto-margins are 140px, so ribbons fit with minimal clearance.
   - On Desktop (1024px) and Tablet (768px), `main` outer margins are 0px, and content starts at padding 24px.
   - Placing ribbons at `left: 0; top: 50%` places them directly over the hero content, hiding 140px of text and blocking user clicks on "Say Hello", "Captain's Secret Stash", and "Explore Works".
   - On Mobile (375px), placing ribbons at `left: 0; bottom: 68px/22px` places them directly over the Wanted Poster's lower frame, bounty row, and Marine stamp.

2. **Step 2: Non-Colliding Edge Bookmark Peek Tab Architecture**  
   - Thematic alignment: The portfolio is styled as a pirate logbook/sketchbook. Real ribbons and bookmarks peek from page edges.
   - For viewports < 1400px: Ribbons should tuck against the screen edge as compact bookmark tabs at rest:
     - On Tablet & Laptop (681px - 1399.98px): `transform: translateY(-50%) translateX(calc(-100% + 24px))`. The tab projects only **24px** from the edge.
     - On Mobile (<= 680px): `transform: translateX(calc(-100% + 18px))`. The tab projects only **18px** from the edge.
     - On Wide Desktop (>= 1400px): Outer gutter is >= 120px. Constraining ribbons to `max-width: 125px` allows them to remain fully visible by default in the empty margin without tucking (`125px < 140px`).
   - On hover (`:hover`), keyboard focus (`:focus-visible`), or tap/active (`:active`):
     - `transform: translateX(0) !important;`
     - Ribbons smoothly glide out to full width with enhanced drop shadow (`box-shadow: 6px 10px 0 var(--shadow)`), allowing immediate interaction before gliding back on blur/unhover.

3. **Step 3: Elimination of Vertical Collision and Mobile Separation**  
   - On mobile, adjusting `.irl-ribbon-btn` to `bottom: 72px` and `.sketchbook-ribbon-btn` to `bottom: 24px` provides a **48px vertical spread**.
   - With element height of 36px, `72px - 24px - 36px = 12px` of vertical separation. They never overlap each other.
   - Horizontally, projecting only 18px leaves a **2.87px to 24.5px clearance** from the Wanted Poster's left edge (`x = 20.87px` pre-M2, `x = 42.5px` post-M2), completely eliminating mobile collision.

4. **Step 4: Hero Gutter Symmetry and Responsive Left Breathing Room**  
   - Enforcing `main { max-width: 1160px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 36px); box-sizing: border-box; }` guarantees balanced left/right gutters on wide viewports (140px left / 140px right at 1440px).
   - Adding tablet hero rules in `css/polish.css`:
     - `.hero { padding: 24px clamp(12px, 2.5vw, 24px) 48px !important; }`
     - `.hero-left-col { padding-left: clamp(4px, 1.5vw, 12px) !important; }`
   - Yields total left breathing room from the viewport edge of **49.9px on 768px** and **60.0px on 1024px**.
   - Because the tucked ribbons project only 24px, the clearance buffer between ribbons and hero text is **25.9px on 768px** and **36.0px on 1024px**. Overlap is mathematically zero.

5. **Step 5: Margin Doodles Viewport Threshold Constraint**  
   - The doodles have absolute offsets of `left: -120px` and `right: -115px` relative to `main` (1160px wide).
   - To accommodate 120px outside `main` on both sides: `1160px + (2 * 120px) = 1400px`.
   - Raising the media query from `min-width: 1240px` to `min-width: 1400px` in `index.html` and enforcing `.side { display: none !important; } @media (min-width: 1400px) { .side { display: block !important; } }` in `css/polish.css` completely prevents doodles from rendering between 1240px and 1399px, eliminating horizontal overflow.

---

## 3. Caveats

1. **Touch Device Interaction on Mobile**: On mobile devices without mouse hover, tapping the 18px bookmark tab immediately triggers the button's native `click` handler (opening the IRL Insights drawer or Digital Sketchbook page flipper), which is the intended behavior.
2. **Milestone 2 Interaction**: In Milestone 2, the Wanted Poster frame will be clamped to `max-width: min(290px, 84vw)`. This increases the mobile left margin to 42.5px, providing an even larger clearance buffer (24.5px) for the 18px peek tab.
3. **Z-Index Hierarchy**: The ribbons use `z-index: 80` (mobile), `z-index: 85` (desktop rest), and `z-index: 95` (hover/focus). The sticky navigation header island operates at `z-index: 900`, ensuring the ribbons slide underneath the navbar if scrolled past.

---

## 4. Conclusion & Actionable Technical Fix Strategy

### 4.1 Verification Matrix: Pre-Fix vs Candidate CSS Results

Telemetry recorded by `scratch/verify_m1_explorer3.js`:

| Viewport | Test Parameter | Pre-Fix Status | Candidate CSS Status | Clearance Buffer |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile 375px** | Ribbon Overlap Wanted Poster | **FAIL** (+120.4px overlap) | **PASS** (false) | **+2.9px** (pre-M2), **+24.5px** (post-M2) |
| **Mobile 375px** | Ribbon Overlap Hero CTA | **FAIL** (colliding) | **PASS** (false) | **+17.0px** clearance |
| **Mobile 375px** | Ribbon Overlap Hero Name | **PASS** (false) | **PASS** (false) | **+79.3px** clearance |
| **Mobile 375px** | Ribbons Overlapping Each Other | **FAIL** (16.2px overlap) | **PASS** (false) | **+12.0px** vertical gap |
| **Tablet 768px** | Ribbon Overlap Hero CTA | **FAIL** (+140.1px occlusion) | **PASS** (false) | **+25.9px** clearance |
| **Tablet 768px** | Ribbon Overlap Hero Bio/Text | **FAIL** (+140.1px occlusion) | **PASS** (false) | **+25.9px** clearance |
| **Tablet 768px** | Hero Left Breathing Room | **POOR** (24.0px flush) | **PASS** (49.9px) | **> 48px** guideline |
| **Tablet 768px** | Margin Doodles Display | **PASS** (hidden) | **PASS** (none) | 0px overflow |
| **Desktop 1024px**| Ribbon Overlap Hero Name/Text | **FAIL** (+140.1px occlusion) | **PASS** (false) | **+36.0px** clearance |
| **Desktop 1024px**| Ribbon Overlap Hero CTA | **FAIL** (+123.9px occlusion) | **PASS** (false) | **+36.0px** clearance |
| **Desktop 1024px**| Hero Left Breathing Room | **POOR** (24.0px flush) | **PASS** (60.0px) | **> 48px** guideline |
| **Desktop 1024px**| Margin Doodles Display | **PASS** (hidden) | **PASS** (none) | 0px overflow |
| **Desktop 1440px**| Ribbon Overlap Hero Content | **FAIL** (+7.6px collision) | **PASS** (false) | **+43.5px** clearance |
| **Desktop 1440px**| Main Gutter Symmetry | **PASS** (132.5px / 132.5px) | **PASS** (132.5px / 132.5px) | 0px asymmetry |
| **Desktop 1440px**| Margin Doodles Display | **PASS** (visible) | **PASS** (block) | **+17.5px** clearance inside viewport |

---

### 4.2 Exact CSS Drop-In Code & Target Locations

#### Target 1: `css/polish.css` (Base Container & Ribbons)
**Location**: Replace lines 9–13 and lines 125–151.

```css
/* ==========================================================
   MAIN CONTAINER SYMMETRY & BALANCED GUTTERS
   ========================================================== */
main {
  max-width: 1160px !important;
  margin: 0 auto !important;
  padding: 0 clamp(16px, 4vw, 36px) !important;
  box-sizing: border-box !important;
  filter: none;
}

/* ==========================================================
   EDGE RIBBON BOOKMARKS (NON-COLLIDING PEEK TABS ARCHITECTURE)
   ========================================================== */
.irl-ribbon-btn,
.sketchbook-ribbon-btn {
  position: fixed !important;
  left: 0 !important;
  z-index: 85 !important;
  transition: transform 0.28s cubic-bezier(0.175, 0.885, 0.32, 1.275),
              box-shadow 0.22s ease,
              background-color 0.2s ease !important;
}

/* Wide Desktop (>= 1400px): Ribbons fit comfortably in the 140px outer margin gutter */
@media (min-width: 1400px) {
  .irl-ribbon-btn {
    top: calc(50% - 34px) !important;
    bottom: auto !important;
    transform: translateY(-50%) !important;
    max-width: 125px !important;
  }
  .sketchbook-ribbon-btn {
    top: calc(50% + 28px) !important;
    bottom: auto !important;
    transform: translateY(-50%) !important;
    max-width: 125px !important;
  }
  .irl-ribbon-btn:hover,
  .irl-ribbon-btn:focus-visible {
    transform: translateY(-50%) translateX(6px) !important;
    box-shadow: 4px 8px 0 var(--shadow) !important;
  }
  .sketchbook-ribbon-btn:hover,
  .sketchbook-ribbon-btn:focus-visible {
    transform: translateY(-50%) translateX(6px) !important;
    box-shadow: 4px 8px 0 var(--shadow) !important;
  }
}

/* Standard Desktop & Tablet (681px - 1399.98px):
   Edge bookmark tabs peek 24px from left screen edge at rest, sliding out to full width on hover/focus */
@media (max-width: 1399.98px) and (min-width: 681px) {
  .irl-ribbon-btn {
    top: calc(50% - 34px) !important;
    bottom: auto !important;
    transform: translateY(-50%) translateX(calc(-100% + 24px)) !important;
    box-shadow: 2px 4px 0 var(--shadow) !important;
  }
  .sketchbook-ribbon-btn {
    top: calc(50% + 28px) !important;
    bottom: auto !important;
    transform: translateY(-50%) translateX(calc(-100% + 24px)) !important;
    box-shadow: 2px 4px 0 var(--shadow) !important;
  }
  .irl-ribbon-btn:hover,
  .irl-ribbon-btn:focus-visible,
  .irl-ribbon-btn:active,
  .sketchbook-ribbon-btn:hover,
  .sketchbook-ribbon-btn:focus-visible,
  .sketchbook-ribbon-btn:active {
    transform: translateY(-50%) translateX(0) !important;
    box-shadow: 6px 10px 0 var(--shadow) !important;
    z-index: 95 !important;
  }
}
```

#### Target 2: `css/polish.css` (Tablet Hero Layout)
**Location**: Update inside `@media (min-width: 681px) and (max-width: 1024px)` (lines 1345–1360).

```css
  /* Tablet 2-column Hero Layout with Balanced Gutters & Left Breathing Room */
  .hero {
    display: grid !important;
    grid-template-columns: 1.15fr minmax(280px, 340px) !important;
    gap: clamp(24px, 3.5vw, 36px) !important;
    align-items: center !important;
    min-height: 70vh !important;
    padding: 24px clamp(12px, 2.5vw, 24px) 48px !important;
    box-sizing: border-box !important;
  }
  .hero-left-col {
    max-width: 100% !important;
    align-items: flex-start !important;
    padding-left: clamp(4px, 1.5vw, 12px) !important;
  }
```

#### Target 3: `css/polish.css` (Mobile Edge Ribbons)
**Location**: Update inside `@media (max-width: 680px)` (lines 1483–1506).

```css
  /* Edge Ribbon Bookmarks - Tucked edge peek tabs at bottom left (<= 18px peek) to eliminate wanted poster & hero collision */
  .irl-ribbon-btn {
    top: auto !important;
    bottom: 72px !important;
    left: 0 !important;
    transform: translateX(calc(-100% + 18px)) !important;
    padding: 6px 10px 6px 6px !important;
    border-radius: 0 8px 8px 0 !important;
    box-shadow: 2px 3px 0 var(--shadow) !important;
    z-index: 80 !important;
  }
  .sketchbook-ribbon-btn {
    top: auto !important;
    bottom: 24px !important;
    left: 0 !important;
    transform: translateX(calc(-100% + 18px)) !important;
    padding: 6px 10px 6px 6px !important;
    border-radius: 0 8px 8px 0 !important;
    box-shadow: 2px 3px 0 var(--shadow) !important;
    z-index: 80 !important;
  }
  .irl-ribbon-btn:hover,
  .irl-ribbon-btn:focus-visible,
  .irl-ribbon-btn:active,
  .sketchbook-ribbon-btn:hover,
  .sketchbook-ribbon-btn:focus-visible,
  .sketchbook-ribbon-btn:active {
    transform: translateX(0) !important;
    box-shadow: 4px 6px 0 var(--shadow) !important;
    z-index: 95 !important;
  }
```

#### Target 4: `css/polish.css` (Margin Doodles Constraint)
**Location**: Append near line 1830 of `css/polish.css`.

```css
/* ==========================================================
   MARGIN DOODLES VIEWPORT CONSTRAINT (STRICTLY >= 1400px)
   ========================================================== */
.side {
  display: none !important;
}
@media (min-width: 1400px) {
  .side {
    display: block !important;
  }
}
```

#### Target 5: `index.html` (and mirrored `Your Name – Portfolio.html`)
**Locations**:
- **Lines 130–133**:
  ```css
  html {
    overflow-x: clip;
    max-width: 100%;
    scroll-padding-top: 80px;
    scroll-behavior: smooth;
  }
  ```
- **Lines 141–143**:
  ```css
  body {
    overflow-x: clip;
    max-width: 100%;
    margin: 0;
  ```
- **Lines 417–423**:
  ```css
  main {
    max-width: 1160px;
    margin: 0 auto;
    padding: 0 clamp(16px, 4vw, 36px);
    box-sizing: border-box;
    position: relative;
  }
  ```
- **Lines 1833–1837**:
  Update media query threshold from `1240px` to `1400px`:
  ```css
  @media (min-width: 1400px) {
    .side {
      display: block;
    }
  }
  ```

---

## 5. Verification Method

### 5.1 Verification Commands

To independently reproduce the layout verification tests across all four target viewports (375px, 768px, 1024px, 1440px), execute:

```powershell
# Run the Explorer 3 automated headless Chrome collision suite
node scratch/verify_m1_explorer3.js
```

### 5.2 Verification Assertions

1. **Assertion 1 (Zero Ribbon Overlap)**:
   For every viewport $w \in \{375, 768, 1024, 1440\}$:
   ```javascript
   assert(!overlaps(irlRect, heroLeftRect));
   assert(!overlaps(irlRect, heroNameRect));
   assert(!overlaps(irlRect, heroCtaRect));
   assert(!overlaps(irlRect, wantedPosterRect));
   assert(!overlaps(sketchRect, heroLeftRect));
   assert(!overlaps(sketchRect, heroNameRect));
   assert(!overlaps(sketchRect, heroCtaRect));
   assert(!overlaps(sketchRect, wantedPosterRect));
   ```
2. **Assertion 2 (Ribbon Inter-Separation on Mobile)**:
   At $w = 375\text{px}$:
   ```javascript
   assert(irlRect.bottom <= sketchRect.top || irlRect.top >= sketchRect.bottom);
   ```
3. **Assertion 3 (Hero Left Breathing Room)**:
   - At $w = 768\text{px}$: `heroLeftRect.left >= 48px` (measured: 49.9px).
   - At $w = 1024\text{px}$: `heroLeftRect.left >= 56px` (measured: 60.0px).
4. **Assertion 4 (Gutter Symmetry)**:
   At $w = 1440\text{px}$:
   ```javascript
   const leftGutter = mainRect.left;
   const rightGutter = 1440 - mainRect.right;
   assert(Math.abs(leftGutter - rightGutter) <= 1); // Exact symmetry
   ```
5. **Assertion 5 (Margin Doodles Viewport Gate)**:
   - At $w \in \{375, 768, 1024\}$: `document.querySelectorAll('.side').every(el => getComputedStyle(el).display === 'none')`.
   - At $w = 1440\text{px}$: `document.querySelectorAll('.side').every(el => getComputedStyle(el).display === 'block')`.
   - All `.side` elements must have `right <= clientWidth` (zero horizontal overflow).

### 5.3 Invalidation Conditions

The fix proposal shall be considered invalid if:
- Any ribbon button physically occludes hero text, buttons, or the Wanted Poster at rest on 375px, 768px, 1024px, or 1440px.
- Any horizontal scrollbar (`scrollWidth > clientWidth`) appears on 375px, 768px, 1024px, or 1440px.
- `.side` margin doodles display on screen widths below 1400px.
- `main` container exhibits asymmetrical left and right gutters on desktop viewports.
