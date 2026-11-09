const { TestHarness } = require('./harness');

async function runM3Audit() {
  const harness = new TestHarness();
  await harness.startServer();
  await harness.launchChrome();
  await harness.navigate('/index.html');

  const results = {
    viewports: {},
    stackedDeckMetrics: {},
    cssRuleAudit: {},
    integrityChecks: {},
    stressTests: {}
  };

  const viewports = [
    { name: 'desktop-1440', w: 1440, h: 900 },
    { name: 'laptop-1024', w: 1024, h: 768 },
    { name: 'tablet-768', w: 768, h: 1024 },
    { name: 'mobile-375', w: 375, h: 667 }
  ];

  for (const vp of viewports) {
    await harness.setViewport(vp.w, vp.h);
    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 120));

    const metrics = await harness.evaluate(`(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const clientW = document.documentElement.clientWidth;

      const routeDock = document.getElementById('voyageRouteDock');
      const dockRect = routeDock ? routeDock.getBoundingClientRect() : null;
      const dockStyle = routeDock ? window.getComputedStyle(routeDock) : null;

      const header = document.querySelector('header.site-header');
      const headerRect = header ? header.getBoundingClientRect() : null;

      const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
      const cardInfo = cards.map((c, i) => {
        const cs = window.getComputedStyle(c);
        const rect = c.getBoundingClientRect();
        return {
          index: i + 1,
          id: c.id,
          position: cs.position,
          display: cs.display,
          top: cs.top,
          topVal: parseFloat(cs.top) || 0,
          zIndex: parseInt(cs.zIndex, 10) || 0,
          height: Math.round(rect.height),
          width: Math.round(rect.width)
        };
      });

      return {
        viewport: "${vp.name}",
        docW, winW, clientW,
        zeroOverflow: docW <= winW,
        dock: {
          height: dockRect ? Math.round(dockRect.height) : 0,
          top: dockStyle ? dockStyle.top : null,
          position: dockStyle ? dockStyle.position : null,
          zIndex: dockStyle ? dockStyle.zIndex : null
        },
        headerBottom: headerRect ? Math.round(headerRect.bottom) : 0,
        cards: cardInfo
      };
    })()`);

    results.viewports[vp.name] = metrics;
  }

  // Measure fully stacked deck at Chapter 4 across viewports
  for (const vp of viewports) {
    await harness.setViewport(vp.w, vp.h);
    // Find journey position dynamically
    const jMetrics = await harness.evaluate(`(() => {
      const el = document.getElementById('journey');
      if (!el) return { top: 2500, height: 3000 };
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
    })()`);

    // Scroll to end of journey (all cards stacked)
    await harness.scrollTo(jMetrics.top + 2300);
    await new Promise(r => setTimeout(r, 200));

    const stackInfo = await harness.evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
      const rects = cards.map(c => c.getBoundingClientRect());
      const minTop = Math.min(...rects.map(r => r.top));
      const maxTop = Math.max(...rects.map(r => r.top));
      const maxBottom = Math.max(...rects.map(r => r.bottom));
      const deckTrack = document.querySelector('.voyage-deck-track');
      const trackRect = deckTrack ? deckTrack.getBoundingClientRect() : null;

      const c4 = document.getElementById('milestone-4');
      const c4Rect = c4 ? c4.getBoundingClientRect() : null;

      const dock = document.getElementById('voyageRouteDock');
      const dockRect = dock ? dock.getBoundingClientRect() : null;

      return {
        viewport: "${vp.name}",
        cardsCount: cards.length,
        rects: rects.map((r, i) => ({
          card: i + 1,
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          height: Math.round(r.height)
        })),
        minTop: Math.round(minTop),
        maxTop: Math.round(maxTop),
        maxBottom: Math.round(maxBottom),
        // Stack anchor spread (the tops delta between card 1 and card 4)
        stackAnchorSpread: Math.round(maxTop - minTop),
        // Active viewing card height (Chapter 4 card)
        c4Height: c4Rect ? Math.round(c4Rect.height) : 0,
        // Total stacked envelope height (from highest card top to lowest card bottom)
        totalStackedEnvelopeHeight: Math.round(maxBottom - minTop),
        dockHeight: dockRect ? Math.round(dockRect.height) : 0,
        routeDockTop: dockRect ? Math.round(dockRect.top) : 0
      };
    })()`);

    results.stackedDeckMetrics[vp.name] = stackInfo;
  }

  // Stress tests:
  // 1. Dynamic viewport resizing during halfway scroll
  await harness.setViewport(1440, 900);
  await harness.scrollTo(2500);
  await new Promise(r => setTimeout(r, 150));
  await harness.setViewport(375, 667);
  await new Promise(r => setTimeout(r, 200));

  const resizeMidScroll = await harness.evaluate(`(() => {
    const docW = document.documentElement.scrollWidth;
    const winW = window.innerWidth;
    return {
      zeroOverflow: docW <= winW,
      scrollW: docW,
      winW: winW
    };
  })()`);
  results.stressTests.resizeMidScroll = resizeMidScroll;

  // 2. High-speed rapid scrolling oscillations (0 -> 4000 -> 0 -> 4000 -> 2000)
  for (let cycle = 0; cycle < 3; cycle++) {
    await harness.scrollTo(4200);
    await new Promise(r => setTimeout(r, 50));
    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 50));
  }
  await harness.scrollTo(3200); // midway
  await new Promise(r => setTimeout(r, 200));

  const rapidOscillationState = await harness.evaluate(`(() => {
    const counter = document.getElementById('voyageRouteCounter');
    const ship = document.getElementById('voyageShipAvatar');
    const shipLeft = ship ? parseFloat(ship.style.left) : 0;
    const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
    const isStackedFlags = cards.map(c => c.classList.contains('is-stacked'));
    return {
      counterText: counter ? counter.textContent.trim() : '',
      shipLeftPercent: shipLeft,
      isStackedFlags
    };
  })()`);
  results.stressTests.rapidOscillation = rapidOscillationState;

  // 3. Waypoint rapid clicking stress
  const waypointTest = await harness.evaluate(`(() => {
    const waypoints = Array.from(document.querySelectorAll('.voyage-waypoint'));
    if (waypoints.length >= 4) {
      waypoints[3].click(); // Click chapter 4
    }
    const counter = document.getElementById('voyageRouteCounter');
    const ship = document.getElementById('voyageShipAvatar');
    return {
      waypointCount: waypoints.length,
      counter: counter ? counter.textContent.trim() : '',
      shipLeft: ship ? ship.style.left : ''
    };
  })()`);
  results.stressTests.waypointClick = waypointTest;

  // Measure during active mobile scroll progression
  await harness.setViewport(375, 667);
  const jm = await harness.evaluate(`(() => {
    const el = document.getElementById('journey');
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), height: Math.round(r.height) };
  })()`);

  results.mobileScrollProgression = {};
  for (const off of [100, 450, 850, 1250, 1600]) {
    await harness.scrollTo(jm.top + off);
    await new Promise(r => setTimeout(r, 150));
    const stepData = await harness.evaluate(`(() => {
      const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
      const rects = cards.map(c => c.getBoundingClientRect());
      const dock = document.getElementById('voyageRouteDock').getBoundingClientRect();
      const counter = document.getElementById('voyageRouteCounter').textContent.trim();
      return {
        counter,
        dockTop: Math.round(dock.top),
        dockHeight: Math.round(dock.height),
        cards: rects.map((r, i) => ({
          card: i + 1,
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          height: Math.round(r.height)
        }))
      };
    })()`);
    results.mobileScrollProgression['offset_' + off] = stepData;
  }

  // Check ancestor overflow styles for sticky cards
  const overflowAncestors = await harness.evaluate(`(() => {
    const card = document.querySelector('.voyage-milestone-card');
    if (!card) return [];
    const offenders = [];
    let el = card.parentElement;
    while (el && el !== document.documentElement) {
      const st = window.getComputedStyle(el);
      const oy = st.overflowY;
      if (oy === 'hidden' || oy === 'auto' || oy === 'scroll') {
        offenders.push({ tag: el.tagName, id: el.id, className: el.className, overflowY: oy });
      }
      el = el.parentElement;
    }
    return offenders;
  })()`);
  results.integrityChecks.overflowAncestors = overflowAncestors;

  // Check for any hardcoded flags or facades
  const facadeAudit = await harness.evaluate(`(() => {
    return {
      hasStickyDeck: !!document.querySelector('.voyage-deck-track'),
      stepCount: document.querySelectorAll('.voyage-card-step').length,
      cardCount: document.querySelectorAll('.voyage-milestone-card').length,
      hasWaypoints: document.querySelectorAll('.voyage-waypoint').length,
      hasCelebrationBanner: !!document.getElementById('voyageCelebrationBanner'),
      hasRouteCounter: !!document.getElementById('voyageRouteCounter')
    };
  })()`);
  results.integrityChecks.facadeAudit = facadeAudit;

  console.log('AUDIT_RESULTS_START');
  console.log(JSON.stringify(results, null, 2));
  console.log('AUDIT_RESULTS_END');

  await harness.close();
}

runM3Audit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
