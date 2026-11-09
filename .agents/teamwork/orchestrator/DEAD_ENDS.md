# Dead Ends Log

| Iteration | Milestone | Approach Tried | Why It Failed | Files Touched |
|---|---|---|---|---|

| 1 | M3 | Hardcoded premature scroll cutoffs (relY < 150, 325, 475) & empty IntersectionObserver facade | Prematurely triggers Chapter 4 at 475px in 2240px track before cards scroll into view; empty observer callback violates genuine implementation; waypoint jumps leave cards offscreen; scrollbar drag lock | index.html, Your Name – Portfolio.html |
