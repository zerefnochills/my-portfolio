# Handoff Report: 'My Journey' Section Architecture & Scroll Transformation Specification

**Target Report Path**: `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\spec_miner_survey_3\handoff.md`  
**Author**: Spec Miner Subagent (`spec_miner_survey_3`)  
**Parent Orchestrator ID**: `02af6f8c-f418-493b-9aa8-b21796c4e706`  
**Date**: 2026-11-09T05:42:00Z  
**Subject**: Technical Survey and Concrete Specification for Transforming 'My Journey' from Button-Click Reveals into a Compact, Scroll-Accumulated Chapter Presentation (ORIGINAL_REQUEST.md Requirement R3).

---

## 1. Executive Summary

Requirement R3 mandates replacing the button-click chapter reveal mechanism in the 'My Journey' section with a scroll-driven interaction. In the current implementation, chapters 2, 3, and 4 are hidden with `display: none !important;` until the user repeatedly clicks "Unfurl Next Milestone" or "Reveal All Chapters". As each card is revealed, it vertically expands the document flow by ~400px per card (~1600px total for all 4 chapters), causing significant vertical bloat, jarring layout shifts, and pushing downstream sections far down the page.

This survey establishes the complete data model, visual asset inventory, DOM architecture, CSS rules, and JavaScript scroll synchronization logic required to transform 'My Journey' into a **compact, scroll-accumulated logbook deck**. In this revamped presentation:
1. Chapters transition into view and accumulate at a single compact viewing dock as the user naturally scrolls forward through the page.
2. The visible vertical footprint remains fixed and compact (~420px–480px) instead of linearly expanding down the page.
3. Natural reverse scrolling seamlessly unpacks/reverses the accumulated cards and ship position.
4. The One Piece Grand Line nautical aesthetic—including the animated sailing ship avatar, waypoint nodes, spine connectors, celebratory fanfare, and tactile audio feedback—is fully preserved and enhanced.

---

## 2. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Journey UI | Grand Line Header Block | Section header with category tag `03 / GRAND LINE EXPEDITIONS`, handwritten title `my journey`, animated SVG doodle stroke, and narrative subtitle | N/A (Static DOM) | Rendered header elements | Falls back to static text if SVG fails | `index.html:5109-5119`, `css/polish.css:726-733` |
| 2 | Journey Navigation | Grand Line Route Log Dock | Tactile dashboard showing navigation icon, unlocked chapter counter pill, progress track line, and sailing ship marker | Active chapter state (1–4) | Visual track progress fill `0%–100%`, ship `left` position, counter pill text | Clamps between 0% and 100% | `index.html:5122-5185`, `css/polish.css:735-832` |
| 3 | Journey Animation | Animated Ship Avatar (Going Merry) | Custom SVG caravel ship with Jolly Roger, sail emblem, wooden hull, sheep figurehead, and blue ocean ripples; bobs periodically and sprints during transitions | Active chapter change / scroll progression | Smooth translation `left: pct%` with `shipSailSprint` and `shipSailBob` CSS keyframes | Non-blocking SVG presentation | `index.html:5140-5158`, `css/polish.css:804-832` |
| 4 | Journey Navigation | Waypoint Node Stepper | 4 discrete waypoint buttons (01 Ralph Co., 02 Cluster GU, 03 Synapse Calyx, 04 Next Horizon) indicating expedition progress | Click event or scroll threshold | Adds `.active` / removes `.locked`, updates chapter display | Ignores invalid `data-chapter` values | `index.html:5161-5183`, `css/polish.css:834-900` |
| 5 | Milestone Content | Chapter 01: Foundations | Milestone card for Tech Lead at Ralph Co. (2024–2025): leadership narrative, 3 achievement bullets, 6 skill chips | Rendered in DOM | Chapter 1 card displayed initially (`.is-revealed`) | Accessible fallback text | `index.html:5191-5232`, `css/polish.css:911-1000` |
| 6 | Milestone Content | Chapter 02: Crew & Community | Milestone card for Event Organiser at Cluster Community \| GU (2025–Present): hackathon leadership, 3 bullets, 6 skill chips | Click reveal or scroll step | Chapter 2 card displayed | Hidden with `.is-hidden` when inactive | `index.html:5235-5276`, `css/polish.css:911-1000` |
| 7 | Milestone Content | Chapter 03: The Flagship Venture | Highlighted milestone card for Founder & Principal at Synapse Calyx (2025–2026): venture building, 3 bullets, 6 skill chips | Click reveal or scroll step | Chapter 3 card displayed with red accent styling | Hidden with `.is-hidden` when inactive | `index.html:5279-5320`, `css/polish.css:911-1000` |
| 8 | Milestone Content | Chapter 04: The New World | Futuristic milestone card for Autonomous AI & Global Ventures (2026 & Beyond): visionary roadmap, 3 bullets, 6 chips | Click reveal or scroll step | Chapter 4 card displayed with gold dashed styling (`future-card`) | Hidden with `.is-hidden` when inactive | `index.html:5323-5363`, `css/polish.css:1002-1005` |
| 9 | Action Controls | Manual Reveal Button (`#journeyRevealBtn`) | Primary tactile button that increments revealed chapters one-by-one on click; updates button label to reflect next chapter | Click event | Increments `revealedCount`, scrolls target milestone into view | Resets to Chapter 1 when clicked at Chapter 4 | `index.html:5369-5373`, `index.html:7725-7840` |
| 10 | Action Controls | Show All & Reset Sub-controls | Secondary buttons: "Reveal All Chapters" (reveals all 4 at once) and "Reset Voyage" (collapses back to chapter 1) | Click event | Sets `revealedCount` to 4 or 1; updates UI | Hidden when state does not permit | `index.html:5375-5384`, `index.html:7842-7869` |
| 11 | Celebratory UI | Voyage Celebration Banner | Celebratory gold/red fanfare banner displaying "VOYAGE ARCHIVE COMPLETE!" and inspirational quote | Chapter 4 revealed | Pops into view with `bannerPop` animation; plays coin chime | Hidden when `revealedCount < 4` | `index.html:5387-5394`, `css/polish.css:1254-1290` |
| 12 | Audio FX | Journey Web Audio Synthesizer Cues | Synthesized audio feedback: `playPenScratch()` on chapter unlock, `playPaperRustle()` on reset/collapse, `playCoinAudio()` on complete | Event trigger & `soundEnabled === true` | AudioContext synthesis output | Silently suppressed if sound muted or audio blocked | `index.html:6546-6575`, `index.html:6992-7015` |
| 13 | Scroll Spy | Global Site Navigation Scroll Spy | Navbar active indicator updates dynamically as sections scroll past | `window.scrollY + 180` vs `section.offsetTop` | Sets `active` class on `#navLinksDock` link matching `#journey` | Defaults to `#top` if no match | `index.html:7597-7630` |

---

## 3. Edge Cases Table

| # | Feature | Input | Observed Behavior | Required Behavior in Scroll Architecture |
|---|---------|-------|-------------------|-------------------------------------------|
| 1 | Rapid Flick Scroll | User performs rapid multi-page wheel flick or mobile swipe down through `#journey` in < 250ms | In button version: Nothing happens (chapters stay hidden). In naïve scroll version: dropped frames or sound spam | Native GPU sticky stacking guarantees 60/120 FPS; audio triggers debounced with minimum 200ms throttle; state observer smoothly snaps ship to final waypoint |
| 2 | Reverse Scroll | User scrolls down to Chapter 4 (or `#skills`), then scrolls back up into `#journey` | In button version: All 4 cards remain expanded permanently down the page until explicit button reset | Cards cleanly un-accumulate in reverse order (4 -> 3 -> 2 -> 1); ship sails smoothly backward; celebration banner gracefully hides |
| 3 | Mobile Small Viewport (375x667 iPhone SE) | Viewport height is only 667px minus browser chrome (~580px visible height) | Fixed single-screen container with sticky navbar + header + route dock + card overflows and clips content | Sticky card top offset adjusted to `calc(var(--sticky-dock-height) + 10px)`; compact card padding (`14px 12px`); card highlights remain readable without clipping |
| 4 | Direct Waypoint Jump | User taps Waypoint 03 while currently at Chapter 1 | In current version: Unfurls milestones 2 & 3 and runs `scrollIntoView` | Smoothly scrolls viewport to the exact scroll offset of Chapter 3; all intervening cards accumulate properly |
| 5 | Reduced Motion Mode | User has `prefers-reduced-motion: reduce` OS setting | Current CSS animations (`milestoneUnfurl`, `shipSailBob`) continue playing | Disable `shipSailSprint` and dynamic scaling; cards transition with immediate opacity/stack positioning without spring overshoot |
| 6 | Horizontal Page Overflow | Stacking cards or ship avatar translation on viewports < 400px | Current version handles width with 100% buttons, but ship avatar `left: 100%` can peek over edges | Set `max-width: 100%`, `box-sizing: border-box`, clamp ship avatar to `calc(100% - 38px)` to prevent horizontal scrollbar |
| 7 | Screen Reader Accessibility | Screen reader traverses the document linearly | In current version, chapters 2–4 have `display: none !important;` and cannot be read until clicked | All chapters remain in DOM with semantic headings (`<h3>`), accessible labels (`aria-label="Chapter 2 of 4: Event Organiser"`), and valid tab navigation |

---

## 4. 5-Component Handoff Report

### 4.1 Observation

1. **DOM Elements & File Locations**:
   - `index.html` lines 5107–5396: Section `<section id="journey" class="journey-voyage-section">` contains:
     - Header block (lines 5109–5119).
     - Grand Line Route Log Dock (lines 5121–5185) containing progress line, ship avatar, and 4 waypoint buttons (`.voyage-waypoint[data-chapter="1..4"]`).
     - Milestones Stream Trail (`.voyage-stream-trail`, lines 5188–5365) containing 4 `<article class="voyage-milestone-card">` elements.
     - Actions Dock (`.journey-actions-dock`, lines 5368–5395) containing `#journeyRevealBtn`, `#journeyShowAllBtn`, `#journeyResetBtn`, and `#voyageCelebrationBanner`.
   - `index.html` lines 7719–7887: `initInteractiveJourney()` implements the state variable `revealedCount` (default `1`), handles button click events, updates track width and ship avatar left position via `((revealedCount - 1) / (total - 1)) * 100%`, toggles `.is-revealed` vs `.is-hidden`, and scrolls cards via `targetEl.scrollIntoView()`.
   - `css/polish.css` lines 718–1290: Defines all journey styling:
     - `.voyage-milestone-card.is-hidden { display: none !important; }` (line 917).
     - `.voyage-milestone-card.is-revealed { display: flex; animation: milestoneUnfurl 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }` (line 920).
     - `.voyage-card-body` has `background: var(--paper-card, #ffffff); border: 2.5px solid var(--ink, #09090b); box-shadow: 5px 6px 0 var(--ink, #09090b);` (lines 988–995).
   - `css/polish.css` lines 1653–1715: Mobile responsive rules for `.voyage-route-dock`, `.voyage-waypoint`, `.spine-node`, and `.journey-reveal-btn`.

2. **Chapter Inventory & Complete Content Model**:
   - **Chapter 1**:
     - *ID*: `milestone-1`, *Data Attribute*: `data-milestone="1"`
     - *Chapter Tag*: `CHAPTER 01 · FOUNDATIONS`
     - *Year Badge*: `2024 – 2025`, *Waypoint Year*: `2024–25`
     - *Status Pill*: `Leadership Tour` (`.voyage-status-pill.past`)
     - *Role Title*: `Tech Lead — Ralph Co.`
     - *Waypoint Label*: `Ralph Co.`
     - *Narrative*: *"Served as Tech Lead managing engineering sprints, architecting resilient web platforms, establishing code review and test standards, and mentoring full-stack engineers to ship production releases on time."*
     - *Highlights Title*: `Key Voyage Log & Achievements:`
     - *Highlights Bullets*:
       1. Directed agile engineering sprints across multi-disciplinary developers, achieving 100% on-time milestone delivery.
       2. Architected modular, resilient full-stack web applications with high test coverage and zero-downtime CI/CD workflows.
       3. Mentored junior and mid-level software engineers on clean architecture, modern React state management, and Node APIs.
     - *Stack Chips*: `Technical Leadership`, `Sprint Planning`, `Full-Stack Architecture`, `Team Mentorship`, `React / Node.js`, `CI/CD Standards`
   - **Chapter 2**:
     - *ID*: `milestone-2`, *Data Attribute*: `data-milestone="2"`
     - *Chapter Tag*: `CHAPTER 02 · CREW & COMMUNITY`
     - *Year Badge*: `2025 – Present`, *Waypoint Year*: `2025–Pres`
     - *Status Pill*: `Active Role` (`.voyage-status-pill.active`)
     - *Role Title*: `Event Organiser — Cluster Community | GU`
     - *Waypoint Label*: `Cluster GU`
     - *Narrative*: *"Organizing developer hackathons, technical workshops, community codefests, and student mentorship at Galgotias University (GU). Fostering an energetic builder and developer ecosystem."*
     - *Highlights Title*: `Key Voyage Log & Achievements:`
     - *Highlights Bullets*:
       1. Spearheaded university-wide hackathons and collaborative build sprints engaging hundreds of student developers.
       2. Led hands-on technical workshops demystifying modern web toolchains, open-source Git practices, and developer tooling.
       3. Cultivated an energetic developer collective, connecting talented student builders directly with tech mentors and opportunities.
     - *Stack Chips*: `Community Leadership`, `Event Organization`, `Hackathons & Sprints`, `Student Mentorship`, `Tech Workshops`, `Public Speaking`
   - **Chapter 3**:
     - *ID*: `milestone-3`, *Data Attribute*: `data-milestone="3"`
     - *Chapter Tag*: `CHAPTER 03 · THE FLAGSHIP VENTURE` (`.voyage-chapter-badge.highlight`)
     - *Year Badge*: `2025 – 2026` (`.voyage-year-badge.red`), *Waypoint Year*: `2025–26`
     - *Status Pill*: `Founder & Principal` (`.voyage-status-pill.founder`)
     - *Role Title*: `Founder & Principal — Synapse Calyx`
     - *Waypoint Label*: `Synapse Calyx`
     - *Narrative*: *"Founded Synapse Calyx, delivering bespoke digital services, scalable full-stack web platforms, client architectures, and high-performance digital products for modern enterprises."*
     - *Highlights Title*: `Key Voyage Log & Achievements:`
     - *Highlights Bullets*:
       1. Architecting and launching end-to-end full-stack platforms engineered for scale, lightning-fast TTFB, and rock-solid uptime.
       2. Partnering with founders and enterprises to transform ambiguous concepts into high-converting, bespoke digital products.
       3. Pioneering artisanal web craft: handcrafted CSS, tactile micro-interactions, responsive architectures, and zero-bloat code.
     - *Stack Chips*: `Digital Services` (highlight), `Venture Building` (highlight), `System Architecture`, `Client Solutions`, `Next.js / TypeScript`, `Cloud Infrastructure`
   - **Chapter 4**:
     - *ID*: `milestone-4`, *Data Attribute*: `data-milestone="4"`
     - *Card Body Class*: `.voyage-card-body.future-card` (dashed border, `#fffdf5` parchment)
     - *Chapter Tag*: `CHAPTER 04 · THE NEW WORLD` (`.voyage-chapter-badge.gold`)
     - *Year Badge*: `2026 & Beyond` (`.voyage-year-badge.gold`), *Waypoint Year*: `2026+`
     - *Status Pill*: `The Grand Horizon` (`.voyage-status-pill.future`)
     - *Role Title*: `The Horizon — Autonomous AI & Global Ventures`
     - *Waypoint Label*: `Next Horizon`
     - *Narrative*: *"Sailing into uncharted waters—expanding Synapse Calyx into an internationally recognized digital studio, engineering autonomous agent systems, and building high-impact open-source platforms."*
     - *Highlights Title*: `Visionary Horizons & Focus Areas:`
     - *Highlights Bullets*:
       1. Building intelligent autonomous agent workflows, reactive sensory interfaces, and edge-native AI applications.
       2. Expanding global engineering partnerships and scaling high-impact venture incubation.
       3. Advancing the frontier of hand-crafted developer tools with kinetic, tactile feedback.
     - *Stack Chips*: `Autonomous Agents`, `AI Integration`, `Global Ventures`, `Open Source`, `Inherited Will`, `Bespoke Studios`

3. **Current Height Expansion Behavior**:
   - Initial state (only Chapter 1 visible): `#journey` height ≈ 720px.
   - Fully revealed state (all 4 chapters visible): `#journey` height ≈ 1950px.
   - Vertical growth: +1230px added directly into the document stream, violently pushing `#skills`, `#hall-of-fame`, and `#contact` downward.

---

### 4.2 Logic Chain

1. **User Requirement & Contract Analysis**:
   - R3 states: *"Replace the button-click chapter reveal mechanism in the 'My Journey' section with a scroll-driven interaction. As the user scrolls naturally through the page, different chapters transition into view and accumulate at a single point, keeping the section compact so it does not consume excessive vertical page space."*
   - Acceptance criteria require:
     1. Normal vertical page scrolling triggers chapter progression (not button clicks).
     2. Successive chapters accumulate in a designated compact area rather than expanding total vertical page height linearly.
     3. Natural forward and backward scrolling without manual resets.

2. **Evaluation of Scroll-Driven Interaction Paradigms**:
   - **Paradigm 1: Scroll-Jacked Internal Container (`overflow-y: scroll`)**:
     - *Mechanism*: User scrolls the page; mouse wheel/touch is hijacked to scroll an internal container.
     - *Assessment*: **Rejected**. Breaks standard mobile touch physics, causes accessibility barriers, fails iOS momentum scrolling, and violates the requirement for natural vertical page scrolling.
   - **Paradigm 2: Virtual Pinned Track (`position: sticky` on entire stage, 300vh track)**:
     - *Mechanism*: Outer track is 300vh; inner container pins to screen; JS scroll listener calculates 0.0–1.0 progress and swaps cards.
     - *Assessment*: Viable, but creates a 2500px scroll dead-zone on desktop, and on small mobile viewports (e.g. 375x667), fitting header + route log + full card + celebration inside a single fixed screen height requires internal truncation or scrolling.
   - **Paradigm 3: Native CSS Sticky Card Stacking Deck (Recommended Synthesis)**:
     - *Mechanism*:
       - The Route Log Dock pins at the top of the section (`position: sticky; top: 76px; z-index: 25;`).
       - Each milestone card is enclosed in a compact scroll step (`.voyage-step`, e.g. `height: 55vh; min-height: 380px;`).
       - Each `.voyage-milestone-card` has `position: sticky; top: var(--card-sticky-top); z-index: var(--card-index);`.
       - As the user scrolls down, Card 1 sticks. Scrolling further brings Card 2 up to stack directly onto Card 1 with a subtle vertical offset (+10px) or clean overlap, with Card 1's index tab/spine remaining accumulated underneath.
       - Card 3 stacks on Card 2; Card 4 stacks on Card 3.
       - A lightweight IntersectionObserver / passive RAF listener tracks which step is currently frontmost and seamlessly updates the Route Log progress bar, ship avatar position, active waypoint, and triggers the celebration banner on Chapter 4.
       - When the user scrolls past Chapter 4, the entire accumulated deck smoothly exits into `#skills`.
       - When scrolling backward, the browser's native compositor naturally unsticks Card 4 -> Card 3 -> Card 2 -> Card 1 in reverse, while the observer drives the ship and progress bar backward with zero delay!
     - *Assessment*: **Selected**. Perfectly satisfies "accumulate at a single point", eliminates vertical bloat, runs at native 60/120 FPS on mobile and desktop, works naturally backward and forward, and preserves full screen-reader semantic accessibility.

---

### 4.3 Caveats

1. **Sticky Header Headroom**:
   - The site has a global sticky header (`header.site-header` with `top: 12px; z-index: 900;` and height ≈ 54px).
   - Any sticky element in `#journey` must specify a `top` offset of at least `76px` (on desktop) or `64px` (on mobile) so it does not collide with or get obscured by the main navbar.
2. **Mobile Viewport Height Clamping**:
   - On short viewports (height < 700px, e.g. iPhone SE at 667px):
     - If both the Route Dock and the milestone card are sticky at the same time, available height is limited.
     - *Solution*: On screens with `max-width: 680px` or `max-height: 720px`, the Route Dock can remain at the top of the section without sticking, or stick with a ultra-compact height (34px), allowing the cards to receive 100% of the viewport focus.
3. **Sound FX Throttling**:
   - If the user scrolls rapidly through all 4 chapters in 300ms, triggering `playPenScratch()` 4 times in rapid succession would sound harsh.
   - *Solution*: Throttle audio cues with a minimum 220ms cooldown so only one crisp chime plays per distinct chapter transition.
4. **Z-Index Layering**:
   - Modals and drawers (like the Captain's Stash, Coffee Stain, and Doodle Studio) have `z-index: 1000–9999`.
   - Journey sticky elements must stay in the range `z-index: 10–30` to avoid occluding global overlays.
5. **No Implementations Allowed in Survey**:
   - This document provides the authoritative specification. Actual code modifications to `index.html`, `css/polish.css`, or `js/polish.js` must be carried out by the implementation agent.

---

### 4.4 Conclusion & Concrete Specifications

#### A. Data Model Specification
All 4 chapters are represented as structured data objects to guarantee clean rendering and synchronization:

```javascript
const VOYAGE_CHAPTERS = [
  {
    index: 1,
    chapterBadge: "CHAPTER 01 · FOUNDATIONS",
    yearBadge: "2024 – 2025",
    statusBadge: { text: "Leadership Tour", type: "past" },
    title: "Tech Lead — Ralph Co.",
    waypointLabel: "Ralph Co.",
    waypointYear: "2024–25",
    narrative: "Served as Tech Lead managing engineering sprints, architecting resilient web platforms, establishing code review and test standards, and mentoring full-stack engineers to ship production releases on time.",
    highlightsTitle: "Key Voyage Log & Achievements:",
    highlights: [
      "Directed agile engineering sprints across multi-disciplinary developers, achieving 100% on-time milestone delivery.",
      "Architected modular, resilient full-stack web applications with high test coverage and zero-downtime CI/CD workflows.",
      "Mentored junior and mid-level software engineers on clean architecture, modern React state management, and Node APIs."
    ],
    chips: [
      { name: "Technical Leadership", highlight: false },
      { name: "Sprint Planning", highlight: false },
      { name: "Full-Stack Architecture", highlight: false },
      { name: "Team Mentorship", highlight: false },
      { name: "React / Node.js", highlight: false },
      { name: "CI/CD Standards", highlight: false }
    ],
    cardTheme: "standard"
  },
  {
    index: 2,
    chapterBadge: "CHAPTER 02 · CREW & COMMUNITY",
    yearBadge: "2025 – Present",
    statusBadge: { text: "Active Role", type: "active" },
    title: "Event Organiser — Cluster Community | GU",
    waypointLabel: "Cluster GU",
    waypointYear: "2025–Pres",
    narrative: "Organizing developer hackathons, technical workshops, community codefests, and student mentorship at Galgotias University (GU). Fostering an energetic builder and developer ecosystem.",
    highlightsTitle: "Key Voyage Log & Achievements:",
    highlights: [
      "Spearheaded university-wide hackathons and collaborative build sprints engaging hundreds of student developers.",
      "Led hands-on technical workshops demystifying modern web toolchains, open-source Git practices, and developer tooling.",
      "Cultivated an energetic developer collective, connecting talented student builders directly with tech mentors and opportunities."
    ],
    chips: [
      { name: "Community Leadership", highlight: false },
      { name: "Event Organization", highlight: false },
      { name: "Hackathons & Sprints", highlight: false },
      { name: "Student Mentorship", highlight: false },
      { name: "Tech Workshops", highlight: false },
      { name: "Public Speaking", highlight: false }
    ],
    cardTheme: "standard"
  },
  {
    index: 3,
    chapterBadge: "CHAPTER 03 · THE FLAGSHIP VENTURE",
    yearBadge: "2025 – 2026",
    statusBadge: { text: "Founder & Principal", type: "founder" },
    title: "Founder & Principal — Synapse Calyx",
    waypointLabel: "Synapse Calyx",
    waypointYear: "2025–26",
    narrative: "Founded Synapse Calyx, delivering bespoke digital services, scalable full-stack web platforms, client architectures, and high-performance digital products for modern enterprises.",
    highlightsTitle: "Key Voyage Log & Achievements:",
    highlights: [
      "Architecting and launching end-to-end full-stack platforms engineered for scale, lightning-fast TTFB, and rock-solid uptime.",
      "Partnering with founders and enterprises to transform ambiguous concepts into high-converting, bespoke digital products.",
      "Pioneering artisanal web craft: handcrafted CSS, tactile micro-interactions, responsive architectures, and zero-bloat code."
    ],
    chips: [
      { name: "Digital Services", highlight: true },
      { name: "Venture Building", highlight: true },
      { name: "System Architecture", highlight: false },
      { name: "Client Solutions", highlight: false },
      { name: "Next.js / TypeScript", highlight: false },
      { name: "Cloud Infrastructure", highlight: false }
    ],
    cardTheme: "highlight"
  },
  {
    index: 4,
    chapterBadge: "CHAPTER 04 · THE NEW WORLD",
    yearBadge: "2026 & Beyond",
    statusBadge: { text: "The Grand Horizon", type: "future" },
    title: "The Horizon — Autonomous AI & Global Ventures",
    waypointLabel: "Next Horizon",
    waypointYear: "2026+",
    narrative: "Sailing into uncharted waters—expanding Synapse Calyx into an internationally recognized digital studio, engineering autonomous agent systems, and building high-impact open-source platforms.",
    highlightsTitle: "Visionary Horizons & Focus Areas:",
    highlights: [
      "Building intelligent autonomous agent workflows, reactive sensory interfaces, and edge-native AI applications.",
      "Expanding global engineering partnerships and scaling high-impact venture incubation.",
      "Advancing the frontier of hand-crafted developer tools with kinetic, tactile feedback."
    ],
    chips: [
      { name: "Autonomous Agents", highlight: false },
      { name: "AI Integration", highlight: false },
      { name: "Global Ventures", highlight: false },
      { name: "Open Source", highlight: false },
      { name: "Inherited Will", highlight: false },
      { name: "Bespoke Studios", highlight: false }
    ],
    cardTheme: "future-card"
  }
];
```

---

#### B. Target DOM Restructuring Specification

1. **Remove Old Button Dock**:
   - Remove `#journeyRevealBtn`, `#journeyShowAllBtn`, `#journeyResetBtn` and their wrapper `.journey-subcontrols` from the document flow.
   - Retain `#voyageCelebrationBanner`, moving it inside or immediately below the accumulated card dock where it reveals upon reaching Chapter 4.
   - Add a subtle, non-intrusive scroll hint pill below the route dock:  
     `<div class="voyage-scroll-hint" id="voyageScrollHint" aria-hidden="true"><span>↓ Scroll naturally to cruise the Grand Line</span></div>`.

2. **Revamped Section Markup**:
```html
<section id="journey" class="journey-voyage-section" aria-label="My Journey Expedition">
  <!-- Header Block (Remains as is) -->
  <div class="journey-header-block">
    <div class="hof-meta-tag">03 / GRAND LINE EXPEDITIONS</div>
    <h2 class="section-title write">my journey</h2>
    <svg class="doodle draw" style="width:min(320px,75%);height:14px;display:block;margin:8px auto" viewBox="0 0 320 14" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 10C70 2 140 14 200 8S280 4 316 9" />
    </svg>
    <p class="section-subtitle ink">
      Milestones along the Grand Line voyage—from engineering leadership and community organizing to founding Synapse Calyx.
    </p>
  </div>

  <!-- Sticky Route Dock -->
  <div class="voyage-route-dock" id="voyageRouteDock" aria-label="Grand Line Voyage Navigation">
    <div class="voyage-route-header">
      <div class="voyage-route-title">
        <span class="route-icon">🧭</span>
        <span>GRAND LINE ROUTE LOG</span>
      </div>
      <div class="voyage-route-counter" id="voyageRouteCounter">
        <span class="count-pill">Chapter 1 of 4 Unfurled</span>
      </div>
    </div>

    <div class="voyage-route-track" id="voyageRouteTrack">
      <div class="voyage-track-line">
        <div class="voyage-track-fill" id="voyageTrackFill" style="width: 0%;"></div>
      </div>

      <div class="voyage-ship-avatar" id="voyageShipAvatar" style="left: 0%;" title="Going Merry cruising through the Grand Line!">
        <!-- Existing SVG caravel ship -->
      </div>

      <!-- Interactive Waypoint Scrubbers -->
      <button class="voyage-waypoint active" data-chapter="1" type="button" title="Jump to Chapter 1: Ralph Co.">
        <span class="waypoint-num">01</span>
        <span class="waypoint-label">Ralph Co.</span>
        <span class="waypoint-year">2024–25</span>
      </button>
      <button class="voyage-waypoint" data-chapter="2" type="button" title="Jump to Chapter 2: Cluster Community">
        <span class="waypoint-num">02</span>
        <span class="waypoint-label">Cluster GU</span>
        <span class="waypoint-year">2025–Pres</span>
      </button>
      <button class="voyage-waypoint" data-chapter="3" type="button" title="Jump to Chapter 3: Synapse Calyx">
        <span class="waypoint-num">03</span>
        <span class="waypoint-label">Synapse Calyx</span>
        <span class="waypoint-year">2025–26</span>
      </button>
      <button class="voyage-waypoint" data-chapter="4" type="button" title="Jump to Chapter 4: Next Horizon">
        <span class="waypoint-num">04</span>
        <span class="waypoint-label">Next Horizon</span>
        <span class="waypoint-year">2026+</span>
      </button>
    </div>
  </div>

  <!-- Scroll-Accumulated Deck Track -->
  <div class="voyage-deck-track" id="voyageDeckTrack">
    
    <!-- STEP 1 -->
    <div class="voyage-card-step" data-step="1" id="step-1">
      <article class="voyage-milestone-card stack-card is-stacked" data-milestone="1" id="milestone-1">
        <!-- Spine with node 01 -->
        <div class="voyage-card-spine">
          <div class="spine-node"><span class="node-dot">01</span></div>
          <div class="spine-line"></div>
        </div>
        <!-- Card 1 Body -->
        <div class="voyage-card-body">...</div>
      </article>
    </div>

    <!-- STEP 2 -->
    <div class="voyage-card-step" data-step="2" id="step-2">
      <article class="voyage-milestone-card stack-card" data-milestone="2" id="milestone-2">
        <div class="voyage-card-spine">
          <div class="spine-node"><span class="node-dot">02</span></div>
          <div class="spine-line"></div>
        </div>
        <div class="voyage-card-body">...</div>
      </article>
    </div>

    <!-- STEP 3 -->
    <div class="voyage-card-step" data-step="3" id="step-3">
      <article class="voyage-milestone-card stack-card" data-milestone="3" id="milestone-3">
        <div class="voyage-card-spine">
          <div class="spine-node"><span class="node-dot">03</span></div>
          <div class="spine-line"></div>
        </div>
        <div class="voyage-card-body">...</div>
      </article>
    </div>

    <!-- STEP 4 -->
    <div class="voyage-card-step" data-step="4" id="step-4">
      <article class="voyage-milestone-card stack-card" data-milestone="4" id="milestone-4">
        <div class="voyage-card-spine">
          <div class="spine-node"><span class="node-dot">04</span></div>
        </div>
        <div class="voyage-card-body future-card">
          ...
          <!-- Embedded Celebration Banner -->
          <div class="voyage-celebration-banner" id="voyageCelebrationBanner">
            <span class="banner-sparkle">✦</span>
            <div class="banner-content">
              <strong>VOYAGE ARCHIVE COMPLETE!</strong>
              <span class="banner-subtext">“There is no limit to what can be built when passion meets hand-crafted code.”</span>
            </div>
            <span class="banner-sparkle">✦</span>
          </div>
        </div>
      </article>
    </div>

  </div>
</section>
```

---

#### C. Target CSS Architecture Specification

```css
/* ==========================================================
   SCROLL-ACCUMULATED GRAND LINE VOYAGE
   ========================================================== */
.journey-voyage-section {
  position: relative;
  padding-top: 36px;
  padding-bottom: 48px;
}

/* Sticky Route Dock pinned under navbar */
.voyage-route-dock {
  position: sticky;
  top: 76px;
  z-index: 25;
  background: var(--paper-card, #ffffff);
  border: 2.5px solid var(--ink, #09090b);
  border-radius: 12px;
  padding: 14px 20px 18px;
  box-shadow: 5px 6px 0 var(--ink, #09090b);
  margin-bottom: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* Scroll hint pill */
.voyage-scroll-hint {
  text-align: center;
  margin-top: 10px;
  margin-bottom: -6px;
}
.voyage-scroll-hint span {
  font-family: var(--mono, 'JetBrains Mono', monospace);
  font-size: 0.76rem;
  font-weight: 700;
  color: #64748b;
  background: #f1f5f9;
  border: 1px dashed #cbd5e1;
  padding: 3px 10px;
  border-radius: 999px;
  display: inline-block;
}

/* Track container holding the 4 scroll steps */
.voyage-deck-track {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Each step creates a controlled scroll distance */
.voyage-card-step {
  position: relative;
  min-height: 52vh;
  margin-bottom: 8px;
}

/* Sticky Stacking Cards */
.voyage-milestone-card.stack-card {
  position: sticky;
  top: 228px; /* Sticks right below the sticky route dock */
  display: flex !important;
  gap: 20px;
  align-items: stretch;
  opacity: 0.45;
  transform: translateY(20px) scale(0.985);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.35s ease,
              box-shadow 0.3s ease;
  will-change: transform, opacity;
}

/* Card Stacking Z-Indexes & Layer Offsets */
.voyage-card-step:nth-child(1) .voyage-milestone-card {
  top: 220px;
  z-index: 10;
}
.voyage-card-step:nth-child(2) .voyage-milestone-card {
  top: 232px; /* Stacks 12px lower to reveal Chapter 1 top tab */
  z-index: 11;
}
.voyage-card-step:nth-child(3) .voyage-milestone-card {
  top: 244px; /* Stacks 24px lower to reveal Chapter 1 & 2 tabs */
  z-index: 12;
}
.voyage-card-step:nth-child(4) .voyage-milestone-card {
  top: 256px; /* Stacks 36px lower to accumulate the full 4-chapter deck */
  z-index: 13;
}

/* Active & Stacked Card States */
.voyage-milestone-card.is-stacked {
  opacity: 1 !important;
  transform: translateY(0) scale(1) !important;
}

.voyage-milestone-card.is-active .voyage-card-body {
  box-shadow: 6px 8px 0 var(--ink, #09090b);
}

/* Mobile & Tablet Responsive Adjustments */
@media (max-width: 680px) {
  .voyage-route-dock {
    top: 64px;
    padding: 10px 12px 14px;
  }
  .voyage-card-step {
    min-height: 48vh;
  }
  .voyage-milestone-card.stack-card {
    top: 195px;
    gap: 10px;
  }
  .voyage-card-step:nth-child(1) .voyage-milestone-card { top: 190px; }
  .voyage-card-step:nth-child(2) .voyage-milestone-card { top: 198px; }
  .voyage-card-step:nth-child(3) .voyage-milestone-card { top: 206px; }
  .voyage-card-step:nth-child(4) .voyage-milestone-card { top: 214px; }
}
```

---

#### D. Target JavaScript Scroll Synchronizer Specification

Replace the old `initInteractiveJourney()` with a robust, passive observer and scroll controller:

```javascript
function initScrollDrivenJourney() {
  const journeySection = document.getElementById("journey");
  if (!journeySection) return;

  const steps = Array.from(journeySection.querySelectorAll(".voyage-card-step"));
  const cards = Array.from(journeySection.querySelectorAll(".voyage-milestone-card.stack-card"));
  const waypoints = Array.from(journeySection.querySelectorAll(".voyage-waypoint"));
  const trackFill = document.getElementById("voyageTrackFill");
  const shipAvatar = document.getElementById("voyageShipAvatar");
  const counterPill = document.getElementById("voyageRouteCounter");
  const celebrationBanner = document.getElementById("voyageCelebrationBanner");

  if (!steps.length || !cards.length) return;

  const total = steps.length;
  let activeStep = 1;
  let lastSoundTime = 0;

  function updateJourneyState(newStep, userInitiated = false) {
    if (newStep < 1) newStep = 1;
    if (newStep > total) newStep = total;

    const changed = newStep !== activeStep;
    activeStep = newStep;

    // 1. Update Card Classes
    cards.forEach((card, idx) => {
      const stepNum = idx + 1;
      if (stepNum <= activeStep) {
        card.classList.add("is-stacked");
      } else {
        card.classList.remove("is-stacked");
      }
      if (stepNum === activeStep) {
        card.classList.add("is-active");
      } else {
        card.classList.remove("is-active");
      }
    });

    // 2. Update Progress Fill & Ship Avatar
    const pct = total > 1 ? ((activeStep - 1) / (total - 1)) * 100 : 0;
    if (trackFill) trackFill.style.width = pct + "%";
    if (shipAvatar) {
      shipAvatar.style.left = pct + "%";
      if (changed) {
        shipAvatar.classList.add("sailing");
        setTimeout(() => shipAvatar.classList.remove("sailing"), 500);
      }
    }

    // 3. Update Waypoints
    waypoints.forEach((wp, idx) => {
      const wpChapter = idx + 1;
      if (wpChapter <= activeStep) {
        wp.classList.add("active");
        wp.classList.remove("locked");
      } else {
        wp.classList.remove("active");
        wp.classList.add("locked");
      }
    });

    // 4. Update Counter Pill
    if (counterPill) {
      counterPill.innerHTML = `<span class="count-pill">Chapter ${activeStep} of ${total} Unfurled</span>`;
    }

    // 5. Celebration Banner
    if (celebrationBanner) {
      celebrationBanner.style.display = activeStep === total ? "flex" : "none";
    }

    // 6. Throttled Audio Cues
    const now = Date.now();
    if (changed && typeof soundEnabled !== "undefined" && soundEnabled && (now - lastSoundTime > 220)) {
      lastSoundTime = now;
      if (activeStep === total && typeof playCoinAudio === "function") {
        playCoinAudio();
      } else if (typeof playPenScratch === "function") {
        playPenScratch();
      }
    }
  }

  // IntersectionObserver for 60fps Native Scroll Triggering
  const observerOptions = {
    root: null,
    rootMargin: "-25% 0px -40% 0px",
    threshold: [0.15, 0.5]
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const stepNum = parseInt(entry.target.getAttribute("data-step"), 10);
        if (!isNaN(stepNum)) {
          updateJourneyState(stepNum);
        }
      }
    });
  }, observerOptions);

  steps.forEach((step) => observer.observe(step));

  // Waypoint Click-to-Scroll Support
  waypoints.forEach((wp) => {
    wp.addEventListener("click", () => {
      const targetChapter = parseInt(wp.getAttribute("data-chapter"), 10);
      if (isNaN(targetChapter)) return;
      const targetStep = document.getElementById(`step-${targetChapter}`);
      if (targetStep) {
        targetStep.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Initial Sync
  updateJourneyState(1);
}
```

---

### 4.5 Verification Method

1. **DOM and Style Inspection**:
   - Inspect `#journey` in developer tools or via headless script:
     - Verify `#journeyRevealBtn`, `#journeyShowAllBtn`, `#journeyResetBtn` are no longer present.
     - Verify all 4 `.voyage-milestone-card` elements exist in the DOM with `display: flex` and `position: sticky`.
     - Verify the stacking `top` and `z-index` offsets (`10, 11, 12, 13`).
2. **Scroll Progression Test**:
   - Scroll vertically down into `#journey`:
     - As step 1 enters, Card 1 sticks at `top: 220px`, ship avatar stays at 0%, waypoint 01 is active.
     - Continuing scroll to step 2: Card 2 stacks onto Card 1, ship moves to 33%, waypoint 02 lights up, pill displays "Chapter 2 of 4 Unfurled".
     - Continuing scroll to step 3: Card 3 stacks onto Card 2, ship moves to 66%, waypoint 03 lights up, pill displays "Chapter 3 of 4 Unfurled".
     - Continuing scroll to step 4: Card 4 stacks onto Card 3, ship moves to 100%, waypoint 04 lights up, celebration banner appears.
3. **Reverse Scroll Test**:
   - Scroll backward from `#skills` back into `#journey`:
     - Verify Card 4 cleanly unsticks and reveals Card 3.
     - Verify ship moves smoothly back to 66%, 33%, and 0%.
     - Verify waypoints reverse their active status.
     - Verify no cards remain stuck or clipped.
4. **Viewport & Proportions Verification**:
   - Test across responsive viewport widths: `375px`, `768px`, `1024px`, `1440px`.
   - Confirm that horizontal scrollbars (`overflow-x`) never appear.
   - Confirm total vertical height of the stacked card area remains compact (< 500px) instead of the previous ~1950px explosion.
5. **Direct Waypoint Jump Test**:
   - Click Waypoint 03: Page smoothly scrolls to step 3; Card 1, 2, and 3 accumulate; ship arrives at 66%.
   - Click Waypoint 01: Page scrolls back to step 1; Card 2, 3, 4 un-accumulate.

---
*Report completed and prepared for Orchestrator handoff.*
