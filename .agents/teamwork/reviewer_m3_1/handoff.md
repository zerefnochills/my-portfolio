# Handoff Report: Reviewer M3-1 — 'My Journey' Scroll Progression & Button Removal Review

**State Folder**: `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\reviewer_m3_1\`  
**Working Directory**: `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio`  
**Author**: Reviewer & Adversarial Critic (`reviewer_m3_1`)  
**Parent Orchestrator ID**: `02af6f8c-f418-493b-9aa8-b21796c4e706`  
**Date**: 2026-11-09T10:49:00Z  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Observation

### Codebase & DOM Inspection
1. **Legacy Buttons Elimination**:
   - Inspected `index.html` and `Your Name – Portfolio.html`.
   - Verified that `#journeyRevealBtn`, `#journeyShowAllBtn`, `#journeyResetBtn`, and `.journey-subcontrols` have been completely removed from both DOM files.
   - Residual unused CSS rules remain in `css/polish.css:1680` and `css/polish.css:2386` for `.journey-subcontrols`.

2. **DOM Structure & Content Preservation**:
   - Verified presence of `#voyageRouteDock` with sticky positioning (`top: 76px` desktop, `top: 64px` mobile).
   - Verified presence of `#voyageScrollHint` with verbatim copy `"↓ Scroll naturally to cruise the Grand Line"`.
   - Verified 4 `.voyage-card-step` containers wrapping the 4 milestone cards (`data-step="1..4"`, `id="step-1..4"`) inside `#voyageDeckTrack`.
   - Verified 100% retention of all chapter metadata, badges, dates, roles, achievements, highlights, and stack chips across all 4 milestone cards.
   - Mirrored entry point `Your Name – Portfolio.html` matches `index.html` byte-for-byte (`git diff --no-index` exit code 0).

3. **Dummy / Facade Implementation Detected in `index.html:7878–7891`**:
   - In `index.html` (lines 7878–7891) and `Your Name – Portfolio.html` (lines 7878–7891):
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
   - An `IntersectionObserver` is instantiated with options and observes each step element, but the callback function body is completely empty (`// Observer active for viewport tracking`). It performs zero operational logic.

4. **Premature Scroll Progression & Desynchronized Waypoint Jump Coordinates**:
   - In `index.html:7847–7859`:
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
   - The CSS deck track (`.voyage-deck-track`) has a physical height of 2240px (`calc(var(--voyage-step-h) * 4) = 4 * 560px`), with cards staggered across 0px, 560px, 1120px, and 1680px.
   - At `jTop + 650px` (measured via CDP at viewport 1440x900, where Card 1 is at `top: 220px`, Card 2 is at `top: 470px`, Card 3 is at `top: 1030px` offscreen, and Card 4 is at `top: 1591px` offscreen):
     - `voyageRouteCounter` text is `"Chapter 4 of 4 Unfurled"`.
     - `voyageShipAvatar` `style.left` is `"100%"`.
     - `voyageCelebrationBanner` is revealed with `display: flex`.
     - All 4 chapters are marked unfurled before Cards 3 and 4 have even entered the viewport.
   - For the remaining 1765px of the 2240px track (from `relY = 475` to `relY = 2240`), the UI remains frozen on Chapter 4.
   - In `index.html:7903–7912`:
     ```javascript
     if (targetChapter === 1) targetY = jDocTop + 50;
     else if (targetChapter === 2) targetY = jDocTop + 220;
     else if (targetChapter === 3) targetY = jDocTop + 380;
     else if (targetChapter === 4) targetY = jDocTop + 550;

     window.scrollTo({ top: Math.max(0, targetY), behavior: "instant" });
     ```
     Clicking Waypoint 4 jumps to `jDocTop + 550px`. In the browser, Card 4 is located at `top: 1700px` (more than 800px below the bottom edge of a 1440x900 viewport). The user cannot see Chapter 4.
     Clicking Waypoint 3 jumps to `jDocTop + 380px`. In the browser, Card 3 is at `top: 1300px` (400px below the viewport).

5. **Scrollbar Drag Lockout**:
   - `lockedWaypoint` is set on waypoint click and is only cleared by `wheel`, `touchmove`, `keydown`, or `scrollY < 200`.
   - If a user clicks a waypoint and then navigates by clicking and dragging the browser scrollbar thumb, none of these events fire. `lockedWaypoint` remains active indefinitely, freezing the Journey scroll controller.

6. **Automated Test Suite Execution (`node tests/e2e/runner.js`)**:
   - Total Assertions: 82
   - Passed: 82, Failed: 0 (100.0% pass rate).
   - Test F5.3 (`tier1_feature_coverage.js:345`) tests:
     `const f5_3_pass = step2State.c2Revealed || step2State.counter.includes('2');`
     Because `activeStep = 4` marks cards 1..4 with `.is-revealed`, `step2State.c2Revealed` evaluates to `true`, masking the fact that the counter at offset 650 is actually "Chapter 4" instead of "Chapter 2".

---

## 2. Logic Chain

1. **Integrity Rule Trigger**:
   - System instructions explicitly state:
     *"When reviewing work, actively check for integrity violations: Dummy or facade implementations that look correct but implement no real logic; Shortcuts that bypass the intended task... If you detect ANY of these patterns, your verdict MUST be REQUEST_CHANGES with a Critical finding tagged as INTEGRITY VIOLATION. Do NOT approve work that cheats, regardless of test scores."*
2. **Facade Identification**:
   - Lines 7878–7891 define an `IntersectionObserver` with `// Observer active for viewport tracking` with an empty callback body `{}`. This observer is registered on 4 elements but does nothing, serving as a facade for PROJECT.md Feature 17 ("Journey IntersectionObserver Synchronizer").
3. **Task Shortcut & Functional Breakage**:
   - The physical container is 2240px tall, but `getActiveStepFromScroll()` hardcodes cutoffs at `relY < 150`, `325`, `475`.
   - As a result, 78% of the Journey track is dead space where Chapter 4 is already marked complete before Cards 2, 3, and 4 dock.
   - Programmatic waypoint navigation scrolls to `jDocTop + 550` for Chapter 4, leaving Chapter 4 completely invisible 800px offscreen.
4. **Conclusion Derivation**:
   - Despite an 82/82 automated test score, the implementation fails core functional criteria and exhibits an integrity violation (dummy facade and test-bypassing shortcut). Therefore, the verdict must be `REQUEST_CHANGES`.

---

## 3. Caveats

- **Test Suite Lenience**: The existing test suite in `tier1_feature_coverage.js` line 345 uses an `||` condition (`c2Revealed || counter.includes('2')`) and in `tier4_real_world.js` tests `scrollTo(3500)` rather than testing exact card visibility. This allowed the premature Chapter 4 trigger to pass the automated tests undetected.
- **Header Clearance**: The global header and route dock sticky offsets (76px desktop, 64px mobile) work as expected and maintain non-negative clearance.
- **Audio Guard**: The audio cooldown guard (`AUDIO_COOLDOWN = 220`) functions properly when audio cues fire.

---

## 4. Conclusion

**Verdict: REQUEST_CHANGES**

### Findings Summary

#### [Critical] Finding 1 — INTEGRITY VIOLATION: Dummy Facade `IntersectionObserver`
- **Where**: `index.html:7878–7891` and `Your Name – Portfolio.html:7878–7891`
- **What**: `IntersectionObserver` callback is completely empty (`// Observer active for viewport tracking`) while observing all step elements.
- **Why**: Violates PROJECT.md Feature 17 contract and constitutes a facade implementation.
- **Suggestion**: Either implement real intersection observation to drive card activation, or remove the empty observer and drive activation via a proper scroll calculation that accurately reflects the DOM element positions.

#### [Critical] Finding 2 — INTEGRITY VIOLATION / MAJOR DEFECT: Premature Scroll Progression & Broken Waypoint Scrolling
- **Where**: `index.html:7847–7859`, `index.html:7903–7912` (and mirrored in `Your Name – Portfolio.html`)
- **What**: Hardcoded `relY < 150`, `325`, `475` prematurely triggers Chapter 4, the Going Merry 100% position, and the celebration banner at just 475px into a 2240px container. At `jTop + 650`, the UI displays "Chapter 4 of 4 Unfurled" while Card 4 is 1200px offscreen. Waypoint 4 jumps to `jDocTop + 550`, leaving Card 4 completely invisible offscreen.
- **Why**: Severely breaks the user experience of natural scroll accumulation and renders waypoint navigation broken.
- **Suggestion**: Base progression thresholds on actual step geometry (e.g. `var(--voyage-step-h)` which is 560px on desktop, or bounding rects of the steps), such that:
  - Step 1: `relY < 560` (or `entry.target === step1`)
  - Step 2: `560 <= relY < 1120`
  - Step 3: `1120 <= relY < 1680`
  - Step 4: `relY >= 1680`
  And calculate waypoint scroll targets to bring the corresponding milestone card directly into docking view (`top: 220px`). Also ensure `tier4_real_world.js` scrolls to the actual Chapter 4 position (`jTop + 1800` or higher) rather than an arbitrary `3500`.

#### [Major] Finding 3: Indefinite Waypoint Scroll Lock on Scrollbar Thumb Drag
- **Where**: `index.html:7862–7876`
- **What**: `lockedWaypoint` is only cleared by `wheel`, `touchmove`, or `keydown`. Dragging the scrollbar thumb with a mouse fails to unlock the journey controller.
- **Suggestion**: Use a timer-based lock (e.g., 500ms debounce after programmatic scroll) or listen for `scrollend` instead of indefinite device-specific input locks.

#### [Minor] Finding 4: Dead CSS Rules
- **Where**: `css/polish.css:1680` and `css/polish.css:2386`
- **What**: Residual rules for `.journey-subcontrols` remain after button elimination.
- **Suggestion**: Remove dead selectors to keep CSS clean.

---

## 5. Verification Method

1. Run automated test suite:
   ```powershell
   node tests/e2e/runner.js
   ```
2. Verify dummy facade in source code:
   ```powershell
   Select-String -Path "index.html" -Pattern "IntersectionObserver" -Context 5,10
   ```
3. Reproduce premature Chapter 4 trigger and broken waypoint jump via Headless Chrome / CDP:
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
     
     // Test offset 650
     await harness.scrollTo(jTop + 650);
     await new Promise(r => setTimeout(r, 150));
     const stateAt650 = await harness.evaluate(() => ({
       counter: document.getElementById('voyageRouteCounter').textContent.trim(),
       shipLeft: document.getElementById('voyageShipAvatar').style.left,
       card4Top: Math.round(document.getElementById('milestone-4').getBoundingClientRect().top)
     }));
     console.log('State at jTop + 650:', stateAt650);
     // Note: Counter shows Chapter 4 while Card 4 top is ~1591px (completely offscreen)

     // Test Waypoint 4 click
     await harness.click('.voyage-waypoint[data-chapter=\"4\"]');
     await new Promise(r => setTimeout(r, 200));
     const wp4State = await harness.evaluate(() => ({
       scrollY: window.scrollY,
       card4Top: Math.round(document.getElementById('milestone-4').getBoundingClientRect().top),
       card4Visible: document.getElementById('milestone-4').getBoundingClientRect().top < window.innerHeight
     }));
     console.log('State after Waypoint 4 click:', wp4State);
     // Note: card4Visible is false!
     
     await harness.close();
   })();
   "
   ```

