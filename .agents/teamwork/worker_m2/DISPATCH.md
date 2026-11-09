# DISPATCH: Milestone 2 Worker — Wanted Poster Asset Replacement Implementation

Read:
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\ORIGINAL_REQUEST.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\orchestrator\PROJECT.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\explorer_survey_2\handoff.md
- c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\TEST_READY.md

Exclusively Owned Files:
- `images/media_1794201865931_238ddac4.jpg`
- `index.html`
- `Your Name – Portfolio.html`
- `css/polish.css`

Mission:
Implement the complete Milestone 2 asset replacement and responsive styling:
1. Copy the source template image from:
   `C:/Users/altze/.gemini/antigravity/brain/432ee84e-dbf2-454c-a883-7605ebcc0179/.user_uploaded/media_1794201865931_238ddac4.jpg`
   To:
   `images/media_1794201865931_238ddac4.jpg`
2. Update `index.html` and `Your Name – Portfolio.html`:
   - Set `<img id="wantedPhotoImg" src="images/media_1794201865931_238ddac4.jpg" ...>`
   - Set `PORTFOLIO_CONFIG.photoUrl = "images/media_1794201865931_238ddac4.jpg"`
   - Set fallback in `setWantedPhoto` to `"images/media_1794201865931_238ddac4.jpg"`
   - Retain interactive hooks: `#wantedPosterName`, `#wantedPosterBounty`, `#wantedBountyRow` (bounty click easter egg).
3. Update `css/polish.css` and `index.html`:
   - Set `.wanted-poster-frame` and image wrapper to authentic `aspect-ratio: 3 / 4`.
   - Max width: 350px (desktop), 310px (tablet), min(290px, 84vw) (mobile).
   - Mobile containment (<=680px): constrain `.chopper-peeking-wrap` (`left: -12px !important; top: -40px !important;`) and `.wanted-annotation-note` (`right: 6px !important; bottom: -44px !important; max-width: 150px !important;`) to ensure zero mobile horizontal overflow.
4. Verify by running:
   `node tests/e2e/runner.js`
   Verify that Feature 3 (Asset HTTP 200), Feature 4 (3:4 Aspect Ratio), and Group B3 (Poster non-distortion & boundary tests) pass 100%.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Output Report:
c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\worker_m2\handoff.md


## 2026-11-09T09:32:17Z
You are a Worker subagent for Milestone 2: Wanted Poster Asset Replacement.

Original Request: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\ORIGINAL_REQUEST.md
Project Scope: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\orchestrator\PROJECT.md
Dispatch: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\worker_m2\DISPATCH.md
Explorer Handoff: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\explorer_survey_2\handoff.md
Test Suite Ready: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\TEST_READY.md
State Folder: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\worker_m2\
Working Directory: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio

Exclusively Owned Files:
- images/media_1794201865931_238ddac4.jpg
- index.html
- Your Name – Portfolio.html
- css/polish.css

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Key Instructions:
1. Read the provided documentation files and explorer handoff.
2. Copy `C:/Users/altze/.gemini/antigravity/brain/432ee84e-dbf2-454c-a883-7605ebcc0179/.user_uploaded/media_1794201865931_238ddac4.jpg` to `images/media_1794201865931_238ddac4.jpg`.
3. Update `index.html` and `Your Name – Portfolio.html`:
   - Point `<img id="wantedPhotoImg" src="images/media_1794201865931_238ddac4.jpg" ...>`
   - Update `PORTFOLIO_CONFIG.photoUrl` to `"images/media_1794201865931_238ddac4.jpg"` and fallback in `setWantedPhoto`.
   - Ensure interactive name `#wantedPosterName` and interactive bounty row `#wantedBountyRow` / `#wantedPosterBounty` remain functional.
4. Update `css/polish.css` and `index.html`:
   - Ensure `.wanted-poster-frame` and photo wrap display with an authentic 3:4 aspect ratio.
   - Constrain max-widths (desktop 350px, tablet 310px, mobile min(290px, 84vw)).
   - Mobile containment (<=680px): ensure `.chopper-peeking-wrap` and `.wanted-annotation-note` do not overflow screen boundaries.
5. Verify changes by executing:
   `node tests/e2e/runner.js`
   Verify that Feature 3, Feature 4, and Group B3 tests pass 100%.
6. Document changes and test results in `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\worker_m2\handoff.md`.
7. Message the orchestrator upon completion.
