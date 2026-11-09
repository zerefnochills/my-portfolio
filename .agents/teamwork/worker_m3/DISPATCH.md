# DISPATCH: Milestone 3 Worker — 'My Journey' Scroll-Accumulated Chapters Implementation

## 2026-11-09T10:04:20Z
[Message from Orchestrator 02af6f8c-f418-493b-9aa8-b21796c4e706]
Milestone 3: 'My Journey' Scroll-Accumulated Chapters.

Read:
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\orchestrator\PROJECT.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\spec_miner_survey_3\handoff.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\TEST_READY.md

Exclusively Owned Files:
- `index.html`
- `Your Name – Portfolio.html`
- `css/polish.css`
- `js/polish.js`

Mission:
Implement the complete transformation of the 'My Journey' section from button-click reveals into a compact, scroll-accumulated chapter presentation:
1. DOM Restructuring in `index.html` and `Your Name – Portfolio.html`:
   - Remove legacy button controls (`#journeyRevealBtn`, `#journeyShowAllBtn`, `#journeyResetBtn` and wrapper `.journey-subcontrols`).
   - Add scroll hint pill below the route dock: `<div class="voyage-scroll-hint" id="voyageScrollHint" aria-hidden="true"><span>↓ Scroll naturally to cruise the Grand Line</span></div>`.
   - Wrap each of the 4 milestone cards inside a `.voyage-card-step` (`data-step="1..4"`, `id="step-1..4"`) within `#voyageDeckTrack`.
   - Embed `#voyageCelebrationBanner` inside Chapter 4 card body or step 4 dock.
   - Retain complete chapter data/content across all 4 chapters (titles, dates, pills, narrative, bullets, stack chips).
2. CSS Sticky Deck Architecture in `css/polish.css`:
   - Sticky route dock pinned under navbar (`top: 76px; z-index: 25;` desktop; `top: 64px;` mobile).
   - Card steps: `.voyage-card-step { min-height: 52vh; position: relative; }` (mobile: `48vh`).
   - Sticky stacking cards: `.voyage-milestone-card.stack-card { position: sticky; display: flex !important; }`
   - Stacking top offsets and z-indexes:
     - Step 1: `top: 220px; z-index: 10;` (mobile: `top: 190px;`)
     - Step 2: `top: 232px; z-index: 11;` (mobile: `top: 198px;`)
     - Step 3: `top: 244px; z-index: 12;` (mobile: `top: 206px;`)
     - Step 4: `top: 256px; z-index: 13;` (mobile: `top: 214px;`)
   - Remove old `.is-hidden { display: none !important; }` rule that broke layout.
   - Active & stacked states: `.is-stacked { opacity: 1 !important; transform: translateY(0) scale(1) !important; }`.
3. JavaScript Scroll Synchronizer in `index.html` (and `Your Name – Portfolio.html`):
   - Replace old button-based `initInteractiveJourney()` with `initScrollDrivenJourney()`.
   - Use `IntersectionObserver` (with passive scroll fallback) observing `.voyage-card-step`.
   - On step transition:
     - Update `.is-stacked` on cards `<= activeStep` and `.is-active` on `=== activeStep`.
     - Update progress bar `#voyageTrackFill` width (`((step - 1) / (total - 1)) * 100%`).
     - Update ship avatar `#voyageShipAvatar` `left: pct%` with bob/sail animation.
     - Update counter pill `#voyageRouteCounter` ("Chapter X of 4 Unfurled").
     - Update waypoints (`.active` vs `.locked`).
     - Reveal celebration banner on step 4.
     - Throttled audio cues with 220ms cooldown.
   - Add click-to-scroll on waypoints: `targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
   - Ensure forward and backward scrolling naturally un-accumulates cards and reverses ship position.
4. Verify by running the full E2E test runner:
   `node tests/e2e/runner.js`
   Verify that Feature 5, Feature 6, Feature 7, and Group B4/B5 tests all pass 100%. Aim for 100% pass across all 82 assertions!

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output Report:
c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\worker_m3\handoff.md
