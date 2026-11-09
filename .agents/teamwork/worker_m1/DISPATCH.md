# DISPATCH: Milestone 1 Worker — Layout Shift & Proportion Correction Implementation

Read:
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\orchestrator\PROJECT.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\explorer_m1_1\handoff.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\explorer_m1_2\handoff.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\explorer_m1_3\handoff.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\TEST_READY.md

Exclusively Owned Files:
- `index.html`
- `Your Name – Portfolio.html`
- `css/polish.css`

Mission:
Implement the complete Milestone 1 fix strategy across the owned files:
1. Root Viewport Containment:
   Apply `overflow-x: clip; width: 100%; max-width: 100%;` to `html` and `body` in `index.html`, `Your Name – Portfolio.html`, and `css/polish.css`. Replace `max-width: 100vw`.
2. Skills Ticker Tape Blowout Fix:
   Replace `width: 112vw; margin-left: -56vw; left: 50%;` in `css/polish.css` with clean `width: 100vw; max-width: 100vw; left: 50%; right: 50%; margin-left: -50vw; margin-right: -50vw; box-sizing: border-box; overflow: hidden;`. Apply clean mobile rule in `@media (max-width: 680px)`.
3. Coffee Stain Responsive Clamping:
   Update `.coffee-stain` in `index.html` and `Your Name – Portfolio.html` and `css/polish.css` to `top: 90px; right: max(16px, 4%); width: clamp(80px, 10vw, 140px); height: clamp(80px, 10vw, 140px);` and scale down on mobile/tablet (`<= 768px`) to `width: 80px; height: 80px; right: 12px;`.
4. Tablet Navbar Wrapping:
   Under `@media (min-width: 681px) and (max-width: 1024px)` in `css/polish.css`, add wrapping rules for `nav.nav-island` (`flex-wrap: wrap !important; justify-content: space-between !important; padding: 8px 16px !important; gap: 8px !important;`), reduce link gap, and ensure `.controls-bar` stays within container.
5. Mobile Logbook Single Column:
   Under `@media (max-width: 680px)` in `css/polish.css`, enforce `.logbook-spread { grid-template-columns: 1fr !important; gap: 20px !important; }`.
6. Floating Ribbons Left Collision Fix:
   Update `.irl-ribbon-btn` and `.sketchbook-ribbon-btn` in `css/polish.css` to prevent content occlusion across desktop, tablet, and mobile.
7. Hero Container Left Gutter & Symmetry:
   Update `main` container padding to `padding: 0 clamp(16px, 4vw, 36px); box-sizing: border-box;`. Under `@media (min-width: 681px) and (max-width: 1024px)`, adjust `.hero` grid to `1fr minmax(280px, 320px)` with `padding-left: 12px` for left breathing room.
8. Margin Doodles Viewport Constraint:
   In `index.html` and `Your Name – Portfolio.html`, raise `@media (min-width: 1240px)` to `@media (min-width: 1400px)` for `.side` doodles.

Verification Requirement:
Run `node tests/e2e/runner.js --tier=1` and `node tests/e2e/runner.js --tier=2` (or full suite). Verify that horizontal scrollbar tests (F2 and B1) pass across all viewports (375px, 680px, 681px, 768px, 1024px, 1440px, 1920px), ribbon collision tests pass, and logbook spread tests pass.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output Report:
c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\worker_m1\handoff.md

