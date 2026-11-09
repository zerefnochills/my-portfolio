# DISPATCH: Challenger M3-1 — 'My Journey' Bidirectional Scrubbing & Rapid Scroll Stress

Original Request: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\ORIGINAL_REQUEST.md
Project Scope: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\orchestrator\PROJECT.md
Worker Handoff: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\worker_m3\handoff.md
Test Ready: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\TEST_READY.md
Working Directory: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio
State Folder: c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\challenger_m3_1\

Mission:
Adversarially challenge Milestone 3 ('My Journey' Scroll-Accumulated Chapters):
1. Stress test bidirectional scrubbing:
   - Rapid scrolling forward through steps 1 -> 2 -> 3 -> 4.
   - Rapid reverse scrolling backward 4 -> 3 -> 2 -> 1 and past top into hero.
   - Verify that cards cleanly unpack, ship avatar retreats smoothly without lagging or getting stuck at 100%, and counter/waypoints properly revert.
2. Stress test boundary clamp conditions:
   - Scroll way past journey into footer: ship must be clamped <= 100%.
   - Scroll above journey to top: ship must be clamped <= 10%.
3. High-velocity scroll jumps:
   - Instant jumps (`window.scrollTo(0, target)`) vs wheel scrolling.
   - Fast repeated scroll oscillations (jitter).
4. Run automated test suite:
   `node tests/e2e/runner.js`
   Verify that all assertions pass (especially Tier 1 Feature 7, Tier 2 Group B4, Tier 4 Workflow 4.4 RW-BidirectionalScrubbing).
5. Document empirical stress results and verdict (APPROVE or REQUEST_CHANGES) in:
   `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\challenger_m3_1\handoff.md`

