# Project: Portfolio Website Modernization & Refinement

## Architecture
- **Tech Stack**: Vanilla HTML5, CSS3, JavaScript (ES6+), Headless browser / static local server testing.
- **Entry Points**: `index.html` (canonical main page), `Your Name – Portfolio.html` (mirrored release artifact).
- **Stylesheets**: `css/polish.css` (primary responsive polish and theme styles), embedded `<style>` in `index.html`.
- **Scripts**: `js/polish.js` (polish dynamics), embedded `<script>` in `index.html`.
- **Assets**: `images/` directory.
- **Data Flow**:
  - HTML DOM establishes section anchors (`#hero`, `#journey`, `#skills`, `#hall-of-fame`, `#contact`).
  - CSS manages sticky docking, flex/grid layouts, responsive breakpoints (`<=680px` mobile, `681px-1024px` tablet, `>1024px` desktop).
  - JS manages interactive state: IntersectionObserver for scroll progress, sound synthesis, theme toggles, and photo config.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Root Viewport Containment | Set `overflow-x: clip` and `max-width: 100%` on `html, body` | M1 | explorer_survey_1 |
| 2 | Skills Ticker Tape Overflow Fix | Tame `width: 112vw` to prevent +95px right edge blowout | M1 | explorer_survey_1 |
| 3 | Coffee Stain Responsive Scaling | Clamp coffee stain size and reposition to prevent mobile/tablet overflow | M1 | explorer_survey_1 |
| 4 | Tablet Navbar Island Wrap | Responsive flex wrapping for `.nav-island` and `.controls-bar` between 681px and 1024px | M1 | explorer_survey_1 |
| 5 | Mobile Logbook Single Column | Enforce `grid-template-columns: 1fr` on `.logbook-spread` for viewports <= 680px | M1 | explorer_survey_1 |
| 6 | Floating Ribbons Left Collision Fix | Reposition/re-dock `.irl-ribbon-btn` and `.sketchbook-ribbon-btn` to eliminate 140px hero occlusion | M1 | explorer_survey_1 |
| 7 | Hero Container Symmetry & Gutter | Add responsive breathing room and balanced container gutters for hero section | M1 | explorer_survey_1 |
| 8 | Margin Doodles Viewport Constraint | Restrict `.side` doodles to viewports >= 1400px to prevent overflow | M1 | explorer_survey_1 |
| 9 | Wanted Poster Asset Integration | Copy template image `media_1794201865931_238ddac4.jpg` to `images/` | M2 | explorer_survey_2 |
| 10 | Wanted Poster Markup & Config Reference | Reference `images/media_1794201865931_238ddac4.jpg` in `<img>` and `PORTFOLIO_CONFIG` | M2 | explorer_survey_2 |
| 11 | Wanted Poster 3:4 Aspect Ratio Frame | Style `.wanted-poster-frame` and media container with authentic 3:4 aspect ratio across viewports | M2 | explorer_survey_2 |
| 12 | Wanted Poster Mobile Containment | Contain Chopper peeking bubble and annotation note within mobile screen bounds | M2 | explorer_survey_2 |
| 13 | Wanted Poster Overlay & Easter Egg Hooks | Retain name, interactive bounty counter (+100M Berry), and DOM IDs | M2 | explorer_survey_2 |
| 14 | Journey Button Elimination & Scroll Hint | Remove manual reveal buttons (`#journeyRevealBtn`, etc.) and add subtle scroll hint pill | M3 | spec_miner_survey_3 |
| 15 | Journey Scroll Steps DOM Structure | Enclose 4 milestone cards in `.voyage-card-step` containers within `#voyageDeckTrack` | M3 | spec_miner_survey_3 |
| 16 | Journey CSS Sticky Stacking Deck | Implement GPU sticky card stacking with incremental top offsets (220px..256px) | M3 | spec_miner_survey_3 |
| 17 | Journey IntersectionObserver Synchronizer | Drive active chapter, ship position, track fill, and celebration banner from scroll | M3 | spec_miner_survey_3 |
| 18 | Journey Waypoint Click-to-Scroll | Enable smooth scrolling to specific milestone steps upon clicking route waypoints | M3 | spec_miner_survey_3 |
| 19 | Journey Ship Avatar & Progress Fill | Synchronize Sailing Going Merry avatar and progress line smoothly forward and backward | M3 | spec_miner_survey_3 |
| 20 | Journey Reverse Scrolling Continuity | Ensure cards cleanly un-accumulate and ship sails backward on reverse scroll | M3 | spec_miner_survey_3 |
| 21 | Journey Audio Cue Throttling | Throttle pen scratch and coin audio feedback with 220ms minimum cooldown | M3 | spec_miner_survey_3 |
| 22 | Journey Celebration Fanfare Reveal | Display celebratory fanfare banner upon accumulating all 4 chapters | M3 | spec_miner_survey_3 |
| 23 | Cross-Viewport Zero-Overflow E2E Test | Validate `scrollWidth <= clientWidth` across 375px, 768px, 1024px, 1440px | M4 | original_request |
| 24 | Wanted Poster HTTP 200 & Aspect E2E Test | Validate image loads HTTP 200 with 3:4 aspect ratio without distortion | M4 | original_request |
| 25 | Journey Scroll Accumulation E2E Test | Validate scroll-driven progression, compact height, and bidirectional scrubbing | M4 | original_request |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Layout Shift & Proportion Correction | Root containment, ticker tape, coffee stain, navbar wrap, logbook spread, ribbons, hero gutters | none | DONE |
| M2 | Wanted Poster Asset Replacement | Copy asset to `images/`, update markup/config, apply 3:4 aspect ratio styling, mobile containment | none | DONE |
| M3 | 'My Journey' Scroll-Accumulated Chapters | Restructure DOM to scroll steps, sticky deck CSS, IntersectionObserver synchronizer, audio/waypoint handling | M1 | IN_PROGRESS |
| M4 | Final E2E Verification & Adversarial Hardening | Execute full test suite (Tiers 1-4), verify 100% pass across all viewports, white-box coverage hardening (Tier 5) | M1, M2, M3 | PLANNED |

## Interface Contracts
### Layout System ↔ Components
- Global container: `main { max-width: 1160px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 36px); box-sizing: border-box; }`
- Root clipping: `html, body { overflow-x: clip; max-width: 100%; }`
- Sticky headroom: Sticky elements in content sections must offset `top >= 76px` to clear the sticky navbar.

### Wanted Poster ↔ Hero Grid
- Poster container: `.wanted-poster-frame` has `aspect-ratio: 3 / 4; max-width: 350px (desktop), 310px (tablet), min(290px, 84vw) (mobile);`
- Photo asset path: `images/media_1794201865931_238ddac4.jpg` (768x1024px, 3:4 ratio).
- Required DOM hooks: `#wantedPoster`, `#wantedPhotoImg`, `#wantedPosterName`, `#wantedBountyRow`, `#wantedPosterBounty`.

### Journey Section ↔ Global Scroll
- Section anchor: `#journey`
- Step containers: `.voyage-card-step[data-step="1..4"]` with `min-height: 52vh`.
- Cards: `.voyage-milestone-card.stack-card` with `position: sticky; top: 220px + (idx * 12px); z-index: 10 + idx;`
- Observer interface: Updates `.is-stacked`, `.is-active`, `#voyageTrackFill.style.width`, `#voyageShipAvatar.style.left`, `#voyageRouteCounter`.

## Code Layout
- `index.html`: Canonical single-page portfolio layout, inline styles & scripts.
- `Your Name – Portfolio.html`: Synchronized copy.
- `css/polish.css`: Dedicated responsive polish, hero styles, journey styling.
- `js/polish.js`: Supplementary scripts.
- `images/`: Local image assets.
- `tests/e2e/`: E2E test suites and automated browser verification runners.

