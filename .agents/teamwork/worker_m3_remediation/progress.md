# Progress — Milestone 3 Remediation

- Last visited: 2026-11-09T15:16:00Z
- Status: Completed
- Active Step: Authoring Handoff Report

## Milestones Achieved
1. Finding 1: Cleanly eliminated empty IntersectionObserver facade from index.html and Your Name – Portfolio.html.
2. Finding 2: Calibrated getActiveStepFromScroll() to responsive physical step intervals based on --voyage-step-h (stepH = 460 mobile, 560 desktop).
3. Finding 2 Part B: Implemented dynamic waypoint docking formula targetY = Math.round(stepDocTop - dockTop), docking cards to exact viewport positions (220px desktop, 190px mobile).
4. Finding 3: Implemented 4-layer scroll unlock (departure delta > 40px, 450ms debounce timer, scrollend listener, and pointerdown/wheel/touchmove/keydown immediate unlock).
5. Finding 4: Removed dead CSS rules for .journey-reveal-btn, .journey-subcontrols, and .journey-actions-dock from css/polish.css; preserved .voyage-celebration-banner.
6. Test Alignment: Aligned scroll targets in tests/e2e/tier4_real_world.js and tests/e2e/tier2_boundary_corner.js to actual Chapter 4 position (jTop + 2200).
7. Parity: Maintained 100% byte-for-byte identical parity between index.html and Your Name – Portfolio.html (git diff exit code 0).
8. Validation: 82/82 assertions passed in node tests/e2e/runner.js with exit code 0.
