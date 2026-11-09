# Handoff Report: Explorer M3 Fix 1 — Premature Scroll Progression & Physical Step Geometry Strategy

**State Folder**: `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\explorer_m3_fix_1\`  
**Working Directory**: `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio`  
**Author**: Explorer 1 (`explorer_m3_fix_1`)  
**Parent Orchestrator ID**: `02af6f8c-f418-493b-9aa8-b21796c4e706`  
**Target**: Milestone 3 Remediation ('My Journey' Scroll-Accumulated Chapters — Finding 2)  
**Date**: 2026-11-09T15:05:00Z  

---

## 1. Observation

### 1.1 Source Code Inspection of Premature Scroll Cutoffs & Broken Waypoints
In `index.html` (lines 7847–7859) and mirrored in `Your Name – Portfolio.html` (lines 7847–7859):
```javascript
function getActiveStepFromScroll() {
  const scrollY = window.scrollY;
  if (scrollY < 200) return 1;

  const rect = journeySection.getBoundingClientRect();
  const jDocTop = Math.round(rect.top + scrollY);
  const relY = scrollY - jDocTop;

  if (relY < 150) return 1;
  if (relY < 325) return 2;
  if (relY < 475) return 3;
  return 4;
}
```
And in waypoint click navigation (lines 7903–7912):
```javascript
const rect = journeySection.getBoundingClientRect();
const jDocTop = Math.round(rect.top + window.scrollY);
let targetY = 0;
if (targetChapter === 1) targetY = jDocTop + 50;
else if (targetChapter === 2) targetY = jDocTop + 220;
else if (targetChapter === 3) targetY = jDocTop + 380;
else if (targetChapter === 4) targetY = jDocTop + 550;

window.scrollTo({ top: Math.max(0, targetY), behavior: "instant" });
```

### 1.2 Physical DOM & CSS Stacking Deck Geometry
In `css/polish.css` (lines 1244–1284, 1311–1334):
- CSS custom property: `--voyage-step-h: 560px;` (desktop/tablet), `--voyage-step-h: 460px;` (mobile `<=680px`).
- `.voyage-deck-track` contains 4 steps arranged in a reverse-negative-margin cascade:
  - Step 1: `height: calc(var(--voyage-step-h) * 4) = 2240px; margin-top: 0;`
  - Step 2: `height: calc(var(--voyage-step-h) * 3) = 1680px; margin-top: -1680px;` (top offset: 560px)
  - Step 3: `height: calc(var(--voyage-step-h) * 2) = 1120px; margin-top: -1120px;` (top offset: 1120px)
  - Step 4: `height: var(--voyage-step-h) = 560px; margin-top: -560px;` (top offset: 1680px)
  - All 4 steps terminate at the exact same bottom edge: `trackDocTop + 2240px`.
- Sticky card docking offsets (`.voyage-milestone-card`):
  - Card 1: `position: sticky; top: 220px; z-index: 10;` (mobile: `top: 190px`)
  - Card 2: `position: sticky; top: 232px; z-index: 11;` (mobile: `top: 198px`)
  - Card 3: `position: sticky; top: 244px; z-index: 12;` (mobile: `top: 206px`)
  - Card 4: `position: sticky; top: 256px; z-index: 13;` (mobile: `top: 214px`)

### 1.3 Viewport Measurements via Headless Chrome / CDP
We measured the exact document coordinates across viewports:

| Viewport | `#journey` Top (`jTop`) | `#journey` Height | `#voyageDeckTrack` Top | Track Height | Step 1 Top | Step 2 Top | Step 3 Top | Step 4 Top |
|---|---|---|---|---|---|---|---|---|
| **1440x900 (Desktop Large)** | 2952px | 2808px | 3487px | 2240px | 3487px | 4047px | 4607px | 5167px |
| **1024x768 (Laptop)** | 2796px | 2807px | 3331px | 2240px | 3331px | 3891px | 4451px | 5011px |
| **768x1024 (Tablet)** | 3794px | 2787px | 4309px | 2240px | 4309px | 4869px | 5429px | 5989px |
| **375x667 (Mobile)** | 4737px | 2444px | 5309px | 1840px | 5309px | 5769px | 6229px | 6689px |

### 1.4 Milestone Card Viewport Positions Across Scroll Offsets (Desktop 1440x900)
Measuring the actual bounding rects of milestone cards relative to the 900px viewport:

| Scroll Offset (`jTop + X`) | `relY` | Card 1 Viewport Y | Card 2 Viewport Y | Card 3 Viewport Y | Card 4 Viewport Y | Actual Visual State | Current Code State |
|---|---|---|---|---|---|---|---|
| **`jTop + 100`** (3052px) | 100px | `top: 437px` (Visible) | `top: 1016px` (Offscreen) | `top: 1576px` (Offscreen) | `top: 2136px` (Offscreen) | Only Card 1 in viewport | Chapter 1 |
| **`jTop + 475`** (3427px) | 475px | `top: 220px` (Docked) | `top: 620px` (Entering) | `top: 1201px` (Offscreen) | `top: 1761px` (Offscreen) | Card 1 docked, Card 2 entering, Cards 3 & 4 offscreen | **Chapter 4 (premature!)** |
| **`jTop + 650`** (3602px) | 650px | `top: 220px` (Docked) | `top: 447px` (Active) | `top: 1007px` (Offscreen) | `top: 1567px` (Offscreen) | Card 1 docked, Card 2 active, Cards 3 & 4 offscreen | **Chapter 4 (frozen!)** |
| **`jTop + 1300`** (4252px) | 1300px | `top: 220px` (Docked) | `top: 232px` (Docked) | `top: 357px` (Active) | `top: 917px` (Offscreen) | Cards 1 & 2 docked, Card 3 active, Card 4 entering | **Chapter 4 (frozen!)** |
| **`jTop + 2000`** (4952px) | 2000px | `top: 220px` (Docked) | `top: 232px` (Docked) | `top: 244px` (Docked) | `top: 256px` (Docked) | Cards 1..4 all stacked, Fanfare banner at 620px | Chapter 4 |
| **`jTop + 2200`** (5152px) | 2200px | `top: 114px` (Stacked) | `top: 114px` (Stacked) | `top: 114px` (Stacked) | `top: 114px` (Stacked) | Final track traverse | Chapter 4 |

### 1.5 Current Waypoint Navigation Breakdown
When clicking Waypoint 4:
- Code executes: `window.scrollTo({ top: jDocTop + 550, behavior: "instant" })`.
- At `scrollY = jDocTop + 550` (3502px):
  - Card 4 is at `top = 1706px` in the viewport. Because the viewport is only 900px high, Card 4 is **806px below the screen bottom**.
  - Celebration banner is at `top = 2050px` (completely invisible).
  - The user sees Card 1 docked and Card 2 entering, while the counter erroneously announces "Chapter 4 of 4 Unfurled".
- When clicking Waypoint 3:
  - Code executes: `window.scrollTo({ top: jDocTop + 380, behavior: "instant" })`.
  - Card 3 is at `top = 1277px` (**377px below screen bottom**).
- When clicking Waypoint 2:
  - Code executes: `window.scrollTo({ top: jDocTop + 220, behavior: "instant" })`.
  - Card 2 is at `top = 896px` (barely peeking at the very bottom 4px of the screen).

### 1.6 E2E Test Suite Analysis (`tests/e2e/runner.js`)
Currently, `node tests/e2e/runner.js` executes 82 assertions across 4 tiers:
- **Tier 1 (`tier1_feature_coverage.js`)**:
  - `F5.2`: tests `scrollTo(jTop + 100)` -> expects Chapter 1.
  - `F5.3`: tests `scrollTo(jTop + 650)` -> expects Chapter 2.
    *Masking flaw noted by Reviewer 1*: `const f5_3_pass = step2State.c2Revealed || step2State.counter.includes('2');`. At `jTop + 650`, the counter was actually `"Chapter 4"`, but `c2Revealed` evaluated to `true` because Chapter 4 marked all cards `.is-revealed`.
  - `F5.4`: tests `scrollTo(jTop + 1300)` -> expects Chapter 3.
  - `F5.5`: tests `scrollTo(jTop + 2200)` -> expects Chapter 4 and banner visible.
  - `F7.1`: tests `scrollTo(jTop + 100)` -> expects reverse un-accumulation of Chapter 4.
  - `F7.2`: tests reverse ship avatar left `<= 35%`.
  - `F7.3`: tests clicking Waypoint 2 -> expects Chapter 2.
  - `F7.4`: tests clicking Waypoint 1 -> expects Chapter 1.
- **Tier 2 (`tier2_boundary_corner.js`)**:
  - `B4.3` (line 315): Rapid forward teleport test calls `await harness.scrollTo(4200)` and expects Chapter 4 and banner visible.
  - `B4.4` (line 335): Rapid reverse teleport test calls `await harness.scrollTo(0)` and expects reversion to Chapter 1.
- **Tier 4 (`tier4_real_world.js`)**:
  - Workflow 4.3 (line 141): calls `await harness.scrollTo(3500)` and expects celebration banner visible.
  - Workflow 4.4 (line 161): calls `await harness.scrollTo(3200)` ("Scroll down to Chapter 4") and checks ship progress forward vs reverse.

---

## 2. Logic Chain

1. **Root Cause Identification**:
   - The original implementation placed `getActiveStepFromScroll()` cutoffs at `relY < 150`, `325`, `475` because the author compressed the entire 4-chapter lifecycle into the first 475px of `#journey`, completely ignoring the 2240px physical height of `#voyageDeckTrack`.
   - This caused Chapter 4, 100% ship position, and the celebration banner to trigger while Cards 2, 3, and 4 were still hundreds of pixels offscreen.

2. **Physical Interval Derivation**:
   - Step height `--voyage-step-h` is 560px on desktop (`>680px`) and 460px on mobile (`<=680px`).
   - `#voyageDeckTrack` begins at `jDocTop + ~535px`.
   - Card 1 docks at `relY ≈ 317px`.
   - Card 2 enters at `relY ≈ 216px` and docks at `relY ≈ 884px` (delta: 567px ≈ 560px).
   - Card 3 enters at `relY ≈ 776px` and docks at `relY ≈ 1432px` (delta: 548px ≈ 560px).
   - Card 4 enters at `relY ≈ 1336px` and docks at `relY ≈ 1980px` (delta: 548px ≈ 560px).

3. **Validation of Tier 1 Test Positions**:
   - `tier1_feature_coverage.js` test coordinates (`jTop + 100`, `jTop + 650`, `jTop + 1300`, `jTop + 2200`) were specifically chosen to sample each chapter at its active viewing/docking phase:
     - `relY = 100`: in interval `[0, 560)` -> Chapter 1 (Card 1 active in viewport, Cards 2-4 offscreen).
     - `relY = 650`: in interval `[560, 1120)` -> Chapter 2 (Card 1 docked, Card 2 active at viewport center 447px, Cards 3-4 offscreen).
     - `relY = 1300`: in interval `[1120, 1680)` -> Chapter 3 (Cards 1-2 docked, Card 3 active at 357px, Card 4 offscreen).
     - `relY = 2200`: in interval `[1680, 2240+]` -> Chapter 4 (Cards 1-4 all stacked, banner unfurled).
   - Therefore, mapping scroll thresholds to step intervals `relY < stepH`, `relY < 2 * stepH`, `relY < 3 * stepH`, `else 4` aligns 100% with the intended design of Tier 1 tests!

4. **Reconciling Tier 2 & Tier 4 Coordinate Inconsistencies**:
   - In `tier2_boundary_corner.js:315`, B4.3 calls `await harness.scrollTo(4200)`. Because `#journey` starts at ~2952px, `scrollY = 4200` corresponds to `relY = 4200 - 2952 = 1248px` (which is Chapter 3).
   - In `tier4_real_world.js:141`, Workflow 4.3 calls `await harness.scrollTo(3500)` (`relY = 548px`), expecting the celebration banner.
   - These test lines were written during earlier iterations when Chapter 4 was hardcoded at 475px. Reviewer 1 explicitly called this out in `reviewer_m3_1/handoff.md` Finding 2:
     *"Also ensure `tier4_real_world.js` scrolls to the actual Chapter 4 position (`jTop + 1800` or higher) rather than an arbitrary `3500`."*
   - To ensure all 82 assertions pass genuinely without facades or shortcuts:
     - `index.html` must implement the real physical step intervals.
     - `tier4_real_world.js` (lines 141, 161) must scroll to the actual Chapter 4 position (`jTop + 2200` or `5200`).
     - `tier2_boundary_corner.js` (line 315) must scroll to Chapter 4 (`jTop + 2200` or `5200`).
     - This preserves 100% test integrity across all 4 tiers.

5. **Deriving Waypoint Scroll Targets**:
   - To make Waypoint navigation bring the requested chapter into docking view:
     - Waypoint 1: `jDocTop + 100` (Card 1 at `top: 437px`).
     - Waypoint 2: `jDocTop + (isMobile ? 550 : 650)` (Card 2 at `top: 447px`).
     - Waypoint 3: `jDocTop + (isMobile ? 1050 : 1300)` (Card 3 at `top: 357px`).
     - Waypoint 4: `jDocTop + (isMobile ? 1600 : 2000)` (Card 4 docked at `top: 256px`, celebration banner at `top: 620px`).
   - Every waypoint jump puts the target card directly into the viewport, completely eliminating the offscreen defect.

6. **Fixing the Scroll Lockout (Finding 3)**:
   - Replace device-specific input listeners with a 600ms debounce timer on `lockedWaypoint` and listen for `pointerdown` and `scrollend`. Dragging the scrollbar thumb with a mouse will no longer lock out the journey stepper.

7. **Fixing the Dummy IntersectionObserver (Finding 1)**:
   - Provide a functional implementation: the observer monitors `.voyage-card-step` entries and keeps active state synchronized during high-framerate view transitions.

---

## 3. Caveats

1. **Responsive Step Height Variation**:
   On mobile viewports (`<= 680px`), `css/polish.css` defines `--voyage-step-h: 460px` (total track 1840px), whereas on desktop/tablet it is `560px` (total track 2240px). The calculation in `getActiveStepFromScroll()` and the waypoint click handler must use `const stepH = window.innerWidth <= 680 ? 460 : 560;` (or read `getComputedStyle(document.documentElement).getPropertyValue('--voyage-step-h')`) to maintain accuracy across viewports.
2. **Dual Canonical Files**:
   Both `index.html` and `Your Name – Portfolio.html` must receive identical edits to ensure zero drift between release artifacts.
3. **Challenger Stress Suite (`challenger1_m3_stress.js`)**:
   `challenger1_m3_stress.js` was written by `challenger_m3_1` using the legacy premature offsets (`jTop + 50`, `220`, `380`, `550`). While it is not part of the standard 82-assertion runner (`node tests/e2e/runner.js`), any future runs of `challenger1_m3_stress.js` should update those sample offsets to `50`, `650`, `1300`, `2200` to reflect the physical intervals.

---

## 4. Conclusion & Concrete Recommended Fix Plan

### 4.1 Implementation Code Proposals

#### Change 1: `index.html` and `Your Name – Portfolio.html` — `getActiveStepFromScroll()` & Waypoint Navigation
Replace lines 7847–7915 with:
```javascript
        function getActiveStepFromScroll() {
          const scrollY = window.scrollY;
          if (scrollY < 200) return 1;

          const rect = journeySection.getBoundingClientRect();
          const jDocTop = Math.round(rect.top + scrollY);
          const relY = scrollY - jDocTop;

          // Responsive physical step intervals based on --voyage-step-h
          const isMobile = window.innerWidth <= 680;
          const stepH = isMobile ? 460 : 560;

          if (relY < stepH) return 1;
          if (relY < stepH * 2) return 2;
          if (relY < stepH * 3) return 3;
          return 4;
        }

        // Calculate step from scroll position
        let waypointLockTimer = null;
        function onScrollJourney() {
          if (window.scrollY < 200) {
            lockedWaypoint = null;
            if (waypointLockTimer) clearTimeout(waypointLockTimer);
          }
          if (lockedWaypoint !== null) return;

          const newStep = getActiveStepFromScroll();
          updateJourneyState(newStep);
        }

        window.addEventListener("scroll", onScrollJourney, { passive: true });
        window.addEventListener("resize", onScrollJourney, { passive: true });
        window.addEventListener("wheel", () => { lockedWaypoint = null; }, { passive: true });
        window.addEventListener("touchmove", () => { lockedWaypoint = null; }, { passive: true });
        window.addEventListener("keydown", () => { lockedWaypoint = null; }, { passive: true });
        window.addEventListener("pointerdown", () => { lockedWaypoint = null; }, { passive: true });
        if ("onscrollend" in window) {
          window.addEventListener("scrollend", () => { lockedWaypoint = null; }, { passive: true });
        }

        // IntersectionObserver for native 60fps tracking (genuine implementation)
        if ("IntersectionObserver" in window) {
          const observerOptions = {
            root: null,
            rootMargin: "-15% 0px -25% 0px",
            threshold: [0.1, 0.4]
          };

          const observer = new IntersectionObserver((entries) => {
            if (lockedWaypoint !== null) return;
            const hasIntersecting = entries.some((entry) => entry.isIntersecting);
            if (hasIntersecting) {
              onScrollJourney();
            }
          }, observerOptions);

          steps.forEach((step) => observer.observe(step));
        }

        // Waypoint Click-to-Scroll Support
        waypoints.forEach((wp) => {
          wp.addEventListener("click", function (e) {
            e.preventDefault();
            const targetChapter = parseInt(wp.getAttribute("data-chapter"), 10);
            if (isNaN(targetChapter)) return;

            lockedWaypoint = targetChapter;
            if (waypointLockTimer) clearTimeout(waypointLockTimer);
            waypointLockTimer = setTimeout(() => { lockedWaypoint = null; }, 600);

            updateJourneyState(targetChapter, true);

            const rect = journeySection.getBoundingClientRect();
            const jDocTop = Math.round(rect.top + window.scrollY);
            const isMobile = window.innerWidth <= 680;

            let targetY = jDocTop + 100;
            if (targetChapter === 2) targetY = jDocTop + (isMobile ? 550 : 650);
            else if (targetChapter === 3) targetY = jDocTop + (isMobile ? 1050 : 1300);
            else if (targetChapter === 4) targetY = jDocTop + (isMobile ? 1600 : 2000);

            window.scrollTo({ top: Math.max(0, targetY), behavior: "instant" });
          });
        });
```

#### Change 2: `tests/e2e/tier4_real_world.js` — Align Workflow 4.3 & 4.4 Scroll Coordinates
In `tests/e2e/tier4_real_world.js`:
- Line 141 (Workflow 4.3):
  ```javascript
  // Scroll through Journey and check celebration fanfare banner
  const jTopW3 = await harness.evaluate(`Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY)`);
  await harness.scrollTo(jTopW3 + 2200);
  ```
- Line 161 (Workflow 4.4):
  ```javascript
  // Scroll down to Chapter 4
  const jTopW4 = await harness.evaluate(`Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY)`);
  await harness.scrollTo(jTopW4 + 2200);
  ```

#### Change 3: `tests/e2e/tier2_boundary_corner.js` — Align B4.3 Teleport Coordinate
In `tests/e2e/tier2_boundary_corner.js`:
- Line 315 (B4.3):
  ```javascript
  // B4.3: Rapid scroll stress test (teleport 0 -> end of journey in single step)
  const jTopB4 = await harness.evaluate(`Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY)`);
  await harness.scrollTo(jTopB4 + 2200);
  ```
- Line 336 (B4.4):
  ```javascript
  // B4.4: Rapid reverse scroll stress test (teleport back to 0 in single step)
  await harness.scrollTo(0);
  ```

#### Change 4: `css/polish.css` — Remove Dead Rules (Finding 4)
Delete dead unused rules for `.journey-subcontrols` at `css/polish.css:1680` and `css/polish.css:2386`.

---

## 5. Verification Method

1. **Verify Physical Layout & Waypoint Docking in Browser via CDP**:
   Execute the following automated verification script to confirm cards dock cleanly and waypoint 4 brings Card 4 and celebration banner into view:
   ```powershell
   node -e "
   const { TestHarness } = require('./tests/e2e/harness');
   (async () => {
     const harness = new TestHarness();
     await harness.startServer();
     await harness.launchChrome();
     await harness.navigate('/index.html');
     await harness.setViewport(1440, 900);

     const jTop = await harness.evaluate(() => Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY));

     // Check Step 1 (jTop + 100)
     await harness.scrollTo(jTop + 100);
     await new Promise(r => setTimeout(r, 100));
     const c1 = await harness.evaluate(() => document.getElementById('voyageRouteCounter').textContent.trim());
     console.log('Counter at jTop + 100:', c1);

     // Check Step 2 (jTop + 650)
     await harness.scrollTo(jTop + 650);
     await new Promise(r => setTimeout(r, 100));
     const c2 = await harness.evaluate(() => document.getElementById('voyageRouteCounter').textContent.trim());
     console.log('Counter at jTop + 650:', c2);

     // Check Step 3 (jTop + 1300)
     await harness.scrollTo(jTop + 1300);
     await new Promise(r => setTimeout(r, 100));
     const c3 = await harness.evaluate(() => document.getElementById('voyageRouteCounter').textContent.trim());
     console.log('Counter at jTop + 1300:', c3);

     // Check Step 4 (jTop + 2200)
     await harness.scrollTo(jTop + 2200);
     await new Promise(r => setTimeout(r, 100));
     const c4 = await harness.evaluate(() => ({
       counter: document.getElementById('voyageRouteCounter').textContent.trim(),
       bannerVisible: window.getComputedStyle(document.getElementById('voyageCelebrationBanner')).display !== 'none'
     }));
     console.log('State at jTop + 2200:', c4);

     // Click Waypoint 4
     await harness.click('.voyage-waypoint[data-chapter=\"4\"]');
     await new Promise(r => setTimeout(r, 200));
     const wp4State = await harness.evaluate(() => {
       const card = document.getElementById('milestone-4').getBoundingClientRect();
       const banner = document.getElementById('voyageCelebrationBanner').getBoundingClientRect();
       return {
         cardTop: Math.round(card.top),
         cardVisible: card.top >= 0 && card.top < window.innerHeight,
         bannerVisible: banner.top >= 0 && banner.top < window.innerHeight
       };
     });
     console.log('Waypoint 4 jump state:', wp4State);

     await harness.close();
   })();
   "
   ```

2. **Verify Full Automated Regression Suite**:
   Run the complete E2E test suite across all 4 tiers:
   ```powershell
   node tests/e2e/runner.js
   ```
   **Expected Outcome**: 82 assertions evaluated, 82 passed, 0 failed (100.0% pass rate).

3. **Verify File Synchronization**:
   ```powershell
   git diff --no-index "index.html" "Your Name – Portfolio.html"
   ```
   **Expected Outcome**: Zero diff (exit code 0).
