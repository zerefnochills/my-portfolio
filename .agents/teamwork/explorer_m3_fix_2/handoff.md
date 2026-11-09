# Handoff Report: Explorer M3 Fix 2 — Remediation Strategy for Finding 1 & Finding 2 Part B

- **Author**: Explorer M3 Fix 2 (`explorer_m3_fix_2`)
- **Roles**: Investigation, Synthesis, Architecture Analysis
- **Target Milestone**: Milestone 3 Remediation ('My Journey' Scroll-Accumulated Chapters)
- **State Folder**: `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\explorer_m3_fix_2\`
- **Working Directory**: `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio`
- **Parent Orchestrator ID**: `02af6f8c-f418-493b-9aa8-b21796c4e706`
- **Date**: 2026-11-09T15:10:00Z

---

## 1. Observation

### 1.1 Inspection of Finding 1: Dummy Facade `IntersectionObserver`
In `index.html` (lines 7878–7891) and mirrored verbatim in `Your Name – Portfolio.html` (lines 7878–7891):
```javascript
// IntersectionObserver for native 60fps tracking
if ("IntersectionObserver" in window) {
  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -35% 0px",
    threshold: [0.15, 0.5]
  };

  const observer = new IntersectionObserver((entries) => {
    // Observer active for viewport tracking
  }, observerOptions);

  steps.forEach((step) => observer.observe(step));
}
```
**Direct Observations**:
1. The `IntersectionObserver` callback is an empty arrow function with a comment `// Observer active for viewport tracking`. It performs zero state updates, zero class toggles, and executes zero operational logic.
2. The observer observes each `.voyage-card-step` element (`steps.forEach`), consuming memory and CPU registration without effect.
3. In `tests/e2e/runner.js`, `tier1_feature_coverage.js`, `tier2_boundary_corner.js`, and `tier4_real_world.js`, there is **zero test code** that checks for the existence or invocation of an `IntersectionObserver` on `#journey`.
4. In `js/polish.js:11–15`, an identical design decision was previously made for heading reveals:
   ```javascript
   /* 1. Headings fix.
      The original observer never fires on .write elements: they start with a
      zero-width clip-path, so IntersectionObserver treats them as invisible.
      Here we measure position instead, which ignores clip-path. */
   ```
   The codebase already established the architectural precedent that geometric position measurement is preferred over `IntersectionObserver` when dealing with CSS sticky stacking, clip paths, or negative margin overlapping.
5. In `reviewer_m3_1/handoff.md`, Reviewer 1 explicitly stated:
   > *"Suggestion: Either implement real intersection observation to drive card activation, or remove the empty observer and drive activation via a proper scroll calculation that accurately reflects the DOM element positions."*

---

### 1.2 Inspection of Finding 2 Part B: Desynchronized Waypoint Jump Coordinates
In `index.html` (lines 7893–7913) and `Your Name – Portfolio.html` (lines 7893–7913):
```javascript
// Waypoint Click-to-Scroll Support
waypoints.forEach((wp) => {
  wp.addEventListener("click", function (e) {
    e.preventDefault();
    const targetChapter = parseInt(wp.getAttribute("data-chapter"), 10);
    if (isNaN(targetChapter)) return;

    lockedWaypoint = targetChapter;
    updateJourneyState(targetChapter, true);

    const rect = journeySection.getBoundingClientRect();
    const jDocTop = Math.round(rect.top + window.scrollY);
    let targetY = 0;
    if (targetChapter === 1) targetY = jDocTop + 50;
    else if (targetChapter === 2) targetY = jDocTop + 220;
    else if (targetChapter === 3) targetY = jDocTop + 380;
    else if (targetChapter === 4) targetY = jDocTop + 550;

    window.scrollTo({ top: Math.max(0, targetY), behavior: "instant" });
  });
});
```

**Direct Observations via Live Headless Chrome (CDP Evaluation)**:
1. **Physical Container vs Hardcoded Cutoffs**:
   - `#journey` starts at document top `jDocTop = 2975px` (desktop 1440x900).
   - `#voyageDeckTrack` starts at document top `trackDocTop = 3512px` (`jDocTop + 537px`).
   - `--voyage-step-h` is `560px` on desktop and `460px` on mobile (`css/polish.css:1245, 1250`).
   - The deck track contains 4 steps with physical height `4 * 560px = 2240px` (desktop) and `4 * 460px = 1840px` (mobile).
2. **Current Defect when clicking Waypoint 4**:
   - `targetChapter === 4` calculates `targetY = jDocTop + 550 = 3525px`.
   - At document scroll `scrollY = 3525px`:
     - Card 1 viewport top = `3512 - 3525 = -13px` (exiting off top).
     - Card 2 viewport top = `4072 - 3525 = 547px` (visible in lower viewport).
     - Card 3 natural document position = `4632px`. Viewport top = `4632 - 3525 = 1107px` (207px offscreen below a 900px viewport).
     - Card 4 natural document position = `5192px`. Viewport top = `5192 - 3525 = 1667px` (**767px completely offscreen below a 900px viewport**).
   - The user clicks "Chapter 4: Next Horizon", but Card 4 is completely invisible.
3. **Current Defect when clicking Waypoint 3**:
   - `targetChapter === 3` calculates `targetY = jDocTop + 380 = 3355px`.
   - Card 3 viewport top = `4632 - 3355 = 1277px` (**377px offscreen below viewport**).
4. **Current Defect when clicking Waypoint 2**:
   - `targetChapter === 2` calculates `targetY = jDocTop + 220 = 3195px`.
   - Card 2 viewport top = `4072 - 3195 = 877px` (barely entering viewport bottom edge, far from its docking position of 232px).

---

### 1.3 Step & Sticky Docking Geometry Audit
Measured across viewports via Chrome DevTools Protocol:

| Metric | Desktop (1440x900 / 1024x768) | Mobile (375x667) |
|---|---|---|
| Step Height (`--voyage-step-h`) | `560px` | `460px` |
| Track Height (`.voyage-deck-track`) | `2240px` | `1840px` |
| Card 1 Sticky Dock `top` | `220px` (z-index: 10) | `190px` (z-index: 10) |
| Card 2 Sticky Dock `top` | `232px` (z-index: 11, $\Delta=12\text{px}$) | `198px` (z-index: 11, $\Delta=8\text{px}$) |
| Card 3 Sticky Dock `top` | `244px` (z-index: 12, $\Delta=12\text{px}$) | `206px` (z-index: 12, $\Delta=8\text{px}$) |
| Card 4 Sticky Dock `top` | `256px` (z-index: 13, $\Delta=12\text{px}$) | `214px` (z-index: 13, $\Delta=8\text{px}$) |
| Step 1 Document Top (`stepDocTop[1]`) | `trackDocTop + 0 = 3512px` | `trackDocTop + 0 = 5309px` |
| Step 2 Document Top (`stepDocTop[2]`) | `trackDocTop + 560 = 4072px` | `trackDocTop + 460 = 5769px` |
| Step 3 Document Top (`stepDocTop[3]`) | `trackDocTop + 1120 = 4632px` | `trackDocTop + 920 = 6229px` |
| Step 4 Document Top (`stepDocTop[4]`) | `trackDocTop + 1680 = 5192px` | `trackDocTop + 1380 = 6689px` |

---

## 2. Logic Chain

### 2.1 Logic Chain for Finding 1: IntersectionObserver Facade Fix Strategy
1. **Integrity Rule**: An empty observer callback violates integrity guidelines. The facade MUST be resolved.
2. **Analysis of Option A (Clean Removal)**:
   - In CSS, `.voyage-card-step` containers overlap continuously due to negative margins (`margin-top: -3H`, `-2H`, `-1H`). At Chapter 4, Steps 1, 2, 3, and 4 all intersect the viewport simultaneously.
   - An `IntersectionObserver` callback executes asynchronously on the browser's task queue. When scrolling rapidly, entries arrive in arbitrary order, causing race conditions between Step 1 and Step 4 intersection changes.
   - Having both an `IntersectionObserver` AND a scroll listener creates a dual-driver architecture with two competing threshold models. When scrolling near boundaries, they oscillate, causing card jitter and stuttering pen-scratch audio cues.
   - In contrast, a single scroll listener wrapped in `requestAnimationFrame` (identical to the pattern in `js/polish.js`) evaluates `window.scrollY` deterministically. It has zero race conditions, zero delay, works identically forward and backward, and handles waypoint programmatic jumps seamlessly.
   - Reviewer 1 explicitly endorsed this approach: *"remove the empty observer and drive activation via a proper scroll calculation that accurately reflects the DOM element positions."*
3. **Analysis of Option B (Genuinely Wiring IntersectionObserver)**:
   - If `IntersectionObserver` were wired to observe `.voyage-card-step`, it must maintain an array of intersection states and resolve the active step as the maximum intersecting index.
   - However, when the user scrolls past `#journey` into `#skills`, all steps leave the viewport (`isIntersecting = false`). An observer would erroneously reset `activeStep` to 1, breaking Tier 2 Test B4.2 (`scrollTo(6000)` clamping).
   - In addition, during waypoint clicks and rapid test automation jumps (e.g. 80ms clicks in Challenger 2), `IntersectionObserver` scheduling introduces microtask latency that risks test timeouts.
4. **Conclusion on Finding 1**:
   - **Clean removal of the empty facade (Option A)** is the superior, robust, and clean engineering solution.

---

### 2.2 Logic Chain for Finding 2 Part B: Mathematical Waypoint Jump Formulation
1. **Objective**: Clicking Waypoint $N$ ($N \in \{1, 2, 3, 4\}$) must bring Milestone Card $N$ directly into the docking viewport at its exact CSS sticky docking offset (`top: 220px` desktop, `top: 190px` mobile).
2. **Coordinate Physics**:
   - The un-docked natural document top of Step $N$ is:
     $$\text{stepDocTop}(N) = \text{stepEl.getBoundingClientRect().top} + \text{window.scrollY}$$
     *(Note: This value is mathematically invariant across all scroll positions).*
   - Inside Step $N$, Card $N$ is located at offset top 0.
   - The CSS sticky docking offset of Card $N$ is:
     $$\text{dockTop}(N) = \text{parseFloat}(\text{window.getComputedStyle}(\text{cardEl}).\text{top})$$
   - When the window scrolls to `window.scrollY = targetY`, the viewport top of Step $N$ is:
     $$\text{stepViewportTop} = \text{stepDocTop}(N) - \text{targetY}$$
   - For Card $N$ to be docked at `dockTop(N)`:
     $$\text{stepDocTop}(N) - \text{targetY} = \text{dockTop}(N)$$
   - Therefore, the exact scroll coordinate is:
     $$\mathbf{targetY = Math.round(stepDocTop(N) - dockTop(N))}$$
3. **Empirical Validation**:
   - We tested this formula live in headless Chrome across both Desktop (1440x900) and Mobile (375x667):
     - Desktop:
       - Chapter 1: `targetY = 3292` $\rightarrow$ Card 1 `rectTop = 220px` (Exact dock: 220px) $\rightarrow$ **PASS**
       - Chapter 2: `targetY = 3840` $\rightarrow$ Card 2 `rectTop = 232px` (Exact dock: 232px) $\rightarrow$ **PASS**
       - Chapter 3: `targetY = 4388` $\rightarrow$ Card 3 `rectTop = 244px` (Exact dock: 244px) $\rightarrow$ **PASS**
       - Chapter 4: `targetY = 4936` $\rightarrow$ Card 4 `rectTop = 256px` (Exact dock: 256px) $\rightarrow$ **PASS**
     - Mobile:
       - Chapter 1: `targetY = 5119` $\rightarrow$ Card 1 `rectTop = 190px` (Exact dock: 190px) $\rightarrow$ **PASS**
       - Chapter 2: `targetY = 5571` $\rightarrow$ Card 2 `rectTop = 198px` (Exact dock: 198px) $\rightarrow$ **PASS**
       - Chapter 3: `targetY = 6023` $\rightarrow$ Card 3 `rectTop = 206px` (Exact dock: 206px) $\rightarrow$ **PASS**
       - Chapter 4: `targetY = 6475` $\rightarrow$ Card 4 `rectTop = 214px` (Exact dock: 214px) $\rightarrow$ **PASS**
   - Result: **100.0% pixel-perfect docking accuracy** across all chapters on all form factors.

---

## 3. Caveats

1. **Card Entrance Animation Delay**:
   - In `css/polish.css:1298`, `.voyage-milestone-card` has `transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)`. When a card transitions from un-stacked (`translateY(16px)`) to stacked (`translateY(0)`), it takes up to 350ms to settle. Automated test evaluations after waypoint clicks must allow at least 250–350ms for CSS transitions to complete.
2. **Scroll Lock Interaction**:
   - When clicking a waypoint, `lockedWaypoint = targetChapter` is set and `updateJourneyState(targetChapter, true)` runs immediately. This provides instant visual feedback (Going Merry sails, counter updates, waypoints highlight).
   - Explorer 3 is investigating the unlock mechanism for scrollbar thumb dragging. The waypoint jump coordinates formulated here are fully compatible with any timer-based, `scrollend`, or input-event unlock mechanism.
3. **Prefers-Reduced-Motion**:
   - For users with vestibular motion sensitivities, programmatic scrolling should check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` and use `behavior: "instant"` instead of `behavior: "smooth"`.

---

## 4. Conclusion & Recommended Fix Plan

### 4.1 Fix for Finding 1: Clean Removal of Dummy IntersectionObserver Facade
In `index.html` lines 7878–7891 (and mirrored in `Your Name – Portfolio.html` lines 7878–7891):
**Delete** the 14-line empty observer block:
```diff
-        // IntersectionObserver for native 60fps tracking
-        if ("IntersectionObserver" in window) {
-          const observerOptions = {
-            root: null,
-            rootMargin: "-20% 0px -35% 0px",
-            threshold: [0.15, 0.5]
-          };
-
-          const observer = new IntersectionObserver((entries) => {
-            // Observer active for viewport tracking
-          }, observerOptions);
-
-          steps.forEach((step) => observer.observe(step));
-        }
```
*(Alternative Blueprint: If an implementer is strictly mandated to retain an `IntersectionObserver`, see Section 4.3 below for the fully wired, non-conflicting Section-Gate Observer).*

---

### 4.2 Fix for Finding 2 Part B: Dynamic Waypoint Jump Coordinates
In `index.html` lines 7893–7913 (and `Your Name – Portfolio.html` lines 7893–7913):
Replace the hardcoded offsets (`+50, +220, +380, +550`) with the dynamic, geometry-based docking formula:

```javascript
        // Waypoint Click-to-Scroll Support
        waypoints.forEach((wp) => {
          wp.addEventListener("click", function (e) {
            e.preventDefault();
            const targetChapter = parseInt(wp.getAttribute("data-chapter"), 10);
            if (isNaN(targetChapter)) return;

            lockedWaypoint = targetChapter;
            updateJourneyState(targetChapter, true);

            const stepEl = document.getElementById("step-" + targetChapter) || steps[targetChapter - 1];
            const cardEl = document.getElementById("milestone-" + targetChapter) || cards[targetChapter - 1];

            if (stepEl && cardEl) {
              const stepDocTop = stepEl.getBoundingClientRect().top + window.scrollY;
              const dockTop = parseFloat(window.getComputedStyle(cardEl).top) || (window.innerWidth <= 680 ? (190 + (targetChapter - 1) * 8) : (220 + (targetChapter - 1) * 12));
              const targetY = Math.round(stepDocTop - dockTop);

              const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
              window.scrollTo({
                top: Math.max(0, targetY),
                behavior: prefersReducedMotion ? "instant" : "smooth"
              });
            }
          });
        });
```

---

### 4.3 Alternative Blueprint for Finding 1 (If IntersectionObserver is Retained)
If the project mandates retaining `IntersectionObserver` to fulfill the literal text of Feature 17, wire it as a **Section Visibility & Viewport Performance Gate** that genuinely tracks viewport presence and activates passive scroll listening only when `#journey` is within 1 viewport height:
```javascript
        // Section Visibility Synchronizer (PROJECT.md Feature 17)
        if ("IntersectionObserver" in window) {
          const journeyObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                journeySection.classList.add("in-view");
                onScrollJourney();
              } else {
                journeySection.classList.remove("in-view");
              }
            });
          }, { rootMargin: "200px 0px" });

          journeyObserver.observe(journeySection);
        }
```
This is genuine, non-empty, performs real work, avoids any dual-driver race condition on individual cards, and completely eliminates the facade violation.

---

## 5. Verification Method

### 5.1 Verification Script for Waypoint Docking Precision
Run the empirical test script in `.agents/teamwork/explorer_m3_fix_2/test_waypoint.js`:
```powershell
node .agents/teamwork/explorer_m3_fix_2/test_waypoint.js
```
**Expected Output**:
```
--- DESKTOP (1440x900) ---
Chapter 1: dockTop: 220, cardTop: 220, dockedCorrectly: true
Chapter 2: dockTop: 232, cardTop: 232, dockedCorrectly: true
Chapter 3: dockTop: 244, cardTop: 244, dockedCorrectly: true
Chapter 4: dockTop: 256, cardTop: 256, dockedCorrectly: true

--- MOBILE (375x667) ---
Mobile Chapter 1: dockTop: 190, cardTop: 190, dockedCorrectly: true
Mobile Chapter 2: dockTop: 198, cardTop: 198, dockedCorrectly: true
Mobile Chapter 3: dockTop: 206, cardTop: 206, dockedCorrectly: true
Mobile Chapter 4: dockTop: 214, cardTop: 214, dockedCorrectly: true
```

### 5.2 Verification of Source Code Facade Elimination
Run the following PowerShell check against both entry points:
```powershell
Select-String -Path "index.html", "Your Name – Portfolio.html" -Pattern "// Observer active for viewport tracking"
```
**Expected Output**: Empty / No matches found.

### 5.3 Automated E2E Regression Run
Run the full automated test suite to ensure zero regressions across all 4 tiers:
```powershell
node tests/e2e/runner.js
```
**Expected Output**:
`Passed Assertions: 82, Failed Assertions: 0 (100.0% pass rate)`.
