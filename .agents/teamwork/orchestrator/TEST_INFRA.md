# E2E Test Infra: Portfolio Modernization

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | R1: Layout Centering Across Viewports | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | R1: Horizontal Overflow Elimination (docW == scrollW) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | R2: Wanted Poster Asset Resolution & HTTP 200 | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 4 | R2: Wanted Poster 3:4 Aspect Ratio & Non-distortion | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 5 | R3: 'My Journey' Scroll Progression (No Buttons) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 6 | R3: 'My Journey' Compact Stacking Deck | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 7 | R3: 'My Journey' Reverse Scroll Continuity | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Node.js headless browser test runner using Playwright / Puppeteer / Headless Chrome (`tests/e2e/runner.js`).
- Pass/Fail Semantics: Process exits with code 0 if all tests pass; non-zero if any assertion fails.
- Viewport targets: 375x667 (mobile), 768x1024 (tablet), 1024x768 (small desktop), 1440x900 (large desktop).

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Mobile full-page journey: start at top, scroll past hero & wanted poster into journey, cruise all chapters, inspect contact | F1, F2, F3, F4, F5, F6 | High |
| 2 | Tablet full-page journey: test nav controls, verify hero grid left-margin breathing room, verify 3:4 poster, journey cruise | F1, F2, F4, F5, F6 | High |
| 3 | Desktop full-page browse (1024px & 1440px): verify zero ribbon collision, centered main content, zero horizontal scroll | F1, F2, F4, F5, F6 | High |
| 4 | Bidirectional journey scrub: scroll forward to Chapter 4, reverse scroll back to Chapter 1, click waypoint 3, verify state | F5, F6, F7 | Medium |
| 5 | Fresh user simulation: verify poster loads cleanly, no console errors, no audio spamming, no missing assets | F3, F4, F5 | Medium |

## Coverage Thresholds
- Tier 1: ≥35 assertions (≥5 per feature)
- Tier 2: ≥35 boundary assertions (limits, zero margins, overflows)
- Tier 3: ≥7 cross-feature combination tests
- Tier 4: ≥5 full-scale end-user application scenarios
- **Total Minimum Test Cases: ≥82 test cases/assertions**

