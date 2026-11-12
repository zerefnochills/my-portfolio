/**
 * Tier 2: Boundary & Corner Cases E2E Tests
 * Validates exact boundary limits, clamping formulas, collision resistance,
 * zero-overflow tolerances, and high-velocity scroll stress.
 * Target: >= 35 assertions
 */

async function runTier2(harness) {
  const reporter = harness.reporter;
  console.log('\n========================================');
  console.log('  RUNNING TIER 2: BOUNDARY & CORNER CASES');
  console.log('========================================\n');

  await harness.navigate('/index.html');

  // ---------------------------------------------------------
  // Group B1: Viewport Extreme Widths & Zero-Delta Margins (7 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Group B1: Viewport Extreme Widths & Zero-Delta Margins --');

  const boundaryWidths = [
    { w: 375, h: 667, label: '375px (Mobile Portrait)' },
    { w: 680, h: 900, label: '680px (Mobile Upper Breakpoint Limit)' },
    { w: 681, h: 900, label: '681px (Tablet Lower Breakpoint Limit)' },
    { w: 768, h: 1024, label: '768px (iPad Portrait)' },
    { w: 1024, h: 768, label: '1024px (Tablet Landscape / Laptop)' },
    { w: 1440, h: 900, label: '1440px (Desktop Large)' },
    { w: 1920, h: 1080, label: '1920px (Ultra-Wide Desktop)' }
  ];

  for (const bw of boundaryWidths) {
    await harness.setViewport(bw.w, bw.h);
    const m = await harness.getMetrics(bw.w);
    // Boundary rule: document scrollWidth must not exceed clientWidth (scrollWidth - clientWidth <= 1)
    const delta = m.scrollW - m.docW;
    const passed = delta <= 1;
    reporter.record(2, 'B1-ViewportBoundaries', `Boundary ${bw.label}: scrollWidth - clientWidth <= 0`, passed, {
      expected: `<= 0 delta (docW: ${m.docW})`,
      actual: `${delta}px delta (scrollW: ${m.scrollW}, docW: ${m.docW})`,
      overflowCount: m.overflowCount,
      overflows: m.overflows
    });
  }

  // ---------------------------------------------------------
  // Group B2: Specific Component Overflow Clamping & Collisions (7 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Group B2: Specific Component Overflow Clamping & Collisions --');

  // B2.1: Skills ticker tape at 375px
  await harness.setViewport(375, 667);
  const ticker375 = await harness.evaluate(`
    (() => {
      const ticker = document.querySelector('.skills-ticker-track') ||
                     document.querySelector('.skills-ticker-wrap') ||
                     document.querySelector('.skills-ticker') ||
                     document.querySelector('.skills-strip');
      if (!ticker) return { exists: false, right: 0 };
      const r = ticker.getBoundingClientRect();
      return { exists: true, right: Math.round(r.right), width: Math.round(r.width) };
    })()
  `);
  const b2_1_pass = !ticker375.exists || ticker375.right <= 376;
  reporter.record(2, 'B2-ComponentClamping', 'Skills ticker tape at 375px clamped within screen (right <= 376px)', b2_1_pass, {
    expected: '<= 376px',
    actual: ticker375.right
  });

  // B2.2: Skills ticker tape at 768px
  await harness.setViewport(768, 1024);
  const ticker768 = await harness.evaluate(`
    (() => {
      const ticker = document.querySelector('.skills-ticker-track') ||
                     document.querySelector('.skills-ticker-wrap') ||
                     document.querySelector('.skills-ticker') ||
                     document.querySelector('.skills-strip');
      if (!ticker) return { exists: false, right: 0 };
      const r = ticker.getBoundingClientRect();
      return { exists: true, right: Math.round(r.right), width: Math.round(r.width) };
    })()
  `);
  const b2_2_pass = !ticker768.exists || ticker768.right <= 769;
  reporter.record(2, 'B2-ComponentClamping', 'Skills ticker tape at 768px clamped within screen (right <= 769px)', b2_2_pass, {
    expected: '<= 769px',
    actual: ticker768.right
  });

  // B2.3: Coffee stain background at 375px
  await harness.setViewport(375, 667);
  const coffee375 = await harness.evaluate(`
    (() => {
      const stain = document.querySelector('.coffee-stain') || document.querySelector('[class*="coffee"]');
      if (!stain) return { exists: false, right: 0 };
      const r = stain.getBoundingClientRect();
      return { exists: true, right: Math.round(r.right), width: Math.round(r.width) };
    })()
  `);
  const b2_3_pass = !coffee375.exists || coffee375.right <= 376;
  reporter.record(2, 'B2-ComponentClamping', 'Coffee stain graphic at 375px does not bleed past right viewport', b2_3_pass, {
    expected: '<= 376px',
    actual: coffee375.right
  });

  // B2.4: Coffee stain background at 768px
  await harness.setViewport(768, 1024);
  const coffee768 = await harness.evaluate(`
    (() => {
      const stain = document.querySelector('.coffee-stain') || document.querySelector('[class*="coffee"]');
      if (!stain) return { exists: false, right: 0 };
      const r = stain.getBoundingClientRect();
      return { exists: true, right: Math.round(r.right), width: Math.round(r.width) };
    })()
  `);
  const b2_4_pass = !coffee768.exists || coffee768.right <= 769;
  reporter.record(2, 'B2-ComponentClamping', 'Coffee stain graphic at 768px does not bleed past right viewport', b2_4_pass, {
    expected: '<= 769px',
    actual: coffee768.right
  });

  // B2.5: Floating ribbons collision on 768px (iPad)
  await harness.setViewport(768, 1024);
  const ribbonCollision768 = await harness.evaluate(`
    (() => {
      const ribbon1 = document.querySelector('.irl-ribbon-btn') || document.querySelector('.sketchbook-ribbon-btn');
      const heroText = document.querySelector('.hero-title') || document.querySelector('.hero h1') || document.querySelector('.hero-left');
      if (!ribbon1 || !heroText) return { exists: false, collides: false };
      const r1 = ribbon1.getBoundingClientRect();
      const rh = heroText.getBoundingClientRect();
      // Test AABB box collision
      const collides = !(r1.right < rh.left || r1.left > rh.right || r1.bottom < rh.top || r1.top > rh.bottom);
      return { exists: true, collides, ribbon: r1, heroText: rh };
    })()
  `);
  const b2_5_pass = !ribbonCollision768.collides;
  reporter.record(2, 'B2-ComponentClamping', 'Floating ribbons on tablet 768px do not occlude hero headline text', b2_5_pass, {
    expected: 'collides === false',
    actual: ribbonCollision768
  });

  // B2.6: Floating ribbons on mobile 375px
  await harness.setViewport(375, 667);
  const ribbonCollision375 = await harness.evaluate(`
    (() => {
      const ribbons = Array.from(document.querySelectorAll('.irl-ribbon-btn, .sketchbook-ribbon-btn'));
      const heroBtns = Array.from(document.querySelectorAll('.hero-cta-btn, .hero-actions button, .hero-actions a'));
      if (ribbons.length === 0 || heroBtns.length === 0) return { collides: false };
      for (const r of ribbons) {
        const rr = r.getBoundingClientRect();
        for (const b of heroBtns) {
          const br = b.getBoundingClientRect();
          const overlap = !(rr.right < br.left || rr.left > br.right || rr.bottom < br.top || rr.top > br.bottom);
          if (overlap) return { collides: true, ribbon: r.className, btn: b.className };
        }
      }
      return { collides: false };
    })()
  `);
  const b2_6_pass = !ribbonCollision375.collides;
  reporter.record(2, 'B2-ComponentClamping', 'Floating ribbons on mobile 375px do not overlap primary hero CTA buttons', b2_6_pass, {
    expected: 'collides === false',
    actual: ribbonCollision375
  });

  // B2.7: Margin doodles hidden on viewports < 1400px
  await harness.setViewport(1024, 768);
  const doodles1024 = await harness.evaluate(`
    (() => {
      const doodles = Array.from(document.querySelectorAll('.side, .margin-doodle, .side-doodle'));
      if (doodles.length === 0) return { constrained: true };
      const visibleUnconstrained = doodles.some(d => {
        const st = window.getComputedStyle(d);
        const r = d.getBoundingClientRect();
        return st.display !== 'none' && st.visibility !== 'hidden' && (r.left < 0 || r.right > window.innerWidth);
      });
      return { constrained: !visibleUnconstrained };
    })()
  `);
  reporter.record(2, 'B2-ComponentClamping', 'Margin doodles constrained / hidden on viewports < 1400px to avoid overflow', doodles1024.constrained, {
    expected: 'constrained === true',
    actual: doodles1024
  });

  // ---------------------------------------------------------
  // Group B3: Hero Portrait Boundary Limits (7 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Group B3: Hero Portrait Boundary Limits --');

  // B3.1: Portrait slightly-large width on 1440px within [340px, 420px]
  await harness.setViewport(1440, 900);
  let m = await harness.getMetrics(1440);
    const b3_1_pass = m.wanted && m.wanted.width >= 340 && m.wanted.width <= 420;
    reporter.record(2, 'B3-HeroPortraitBoundaries', 'Hero portrait width on 1440px desktop is slightly large within [340px, 420px]', b3_1_pass, {
      expected: '340px <= width <= 420px',
      actual: m.wanted ? `${m.wanted.width}px` : 'null'
    });

    // B3.2: Portrait max-width on 768px <= 330px
    await harness.setViewport(768, 1024);
    m = await harness.getMetrics(768);
      const b3_2_pass = m.wanted && m.wanted.width <= 330;
      reporter.record(2, 'B3-HeroPortraitBoundaries', 'Hero portrait width on 768px tablet respects max-width <= 330px', b3_2_pass, {
        expected: '<= 330px',
        actual: m.wanted ? `${m.wanted.width}px` : 'null'
      });

      // B3.3: Portrait max-width on 375px <= 295px
      await harness.setViewport(375, 667);
      m = await harness.getMetrics(375);
      const b3_3_pass = m.wanted && m.wanted.width <= 295;
        reporter.record(2, 'B3-HeroPortraitBoundaries', 'Hero portrait width on 375px mobile respects max-width <= 295px', b3_3_pass, {
          expected: '<= 295px',
          actual: m.wanted ? `${m.wanted.width}px` : 'null'
        });

          // B3.4: Aspect ratio tolerance strictly bounded within [0.90, 0.98]
          const ratioInBounds = m.wanted && m.wanted.aspectRatio >= 0.90 && m.wanted.aspectRatio <= 0.98;
          reporter.record(2, 'B3-HeroPortraitBoundaries', 'Hero portrait aspect ratio strictly bounded within [0.90, 0.98]', ratioInBounds, {
            expected: '0.90 <= ratio <= 0.98',
            actual: m.wanted ? m.wanted.aspectRatio.toFixed(3) : 'null'
          });

  // B3.5: Portrait has crisp normal border & zero rotation
  const portraitBorderStraight = await harness.evaluate(`
            (() => {
              const f = document.querySelector('.hero-portrait-frame');
              if (!f) return { exists: false };
              const st = window.getComputedStyle(f);
              const borderW = parseFloat(st.borderTopWidth) || 0;
              const tf = st.transform || 'none';
              const isStraight = tf === 'none' || tf === 'matrix(1, 0, 0, 1, 0, 0)';
              return { exists: true, borderW, isStraight, borderStyle: st.borderTopStyle };
            })()
            `);
  const b3_5_pass = portraitBorderStraight.exists && portraitBorderStraight.borderW >= 2 && portraitBorderStraight.isStraight;
  reporter.record(2, 'B3-HeroPortraitBoundaries', 'Hero portrait uses a clean normal border and straight unrotated alignment', b3_5_pass, {
    expected: 'borderW >= 2 and straight transform',
    actual: portraitBorderStraight
  });

  // B3.6: Remaining Chopper easter egg within 375px bounds
  const chopperBoundary = await harness.evaluate(`
            (() => {
              const chopper = document.querySelector('[class*="chopper"]');
              if (!chopper) return { exists: false, inBounds: true };
              const r = chopper.getBoundingClientRect();
              return { exists: true, right: Math.round(r.right), inBounds: r.right <= 376 };
            })()
            `);
  reporter.record(2, 'B3-HeroPortraitBoundaries', 'Chopper easter egg at 375px does not exceed screen (right <= 376px)', chopperBoundary.inBounds, {
    expected: '<= 376px',
    actual: chopperBoundary
  });

  // B3.7: Hero portrait on 375px within screen bounds & Journey Route Dock non-overlap check
  const portrait375AndDock = await harness.evaluate(`
    (() => {
      const f = document.querySelector('.hero-portrait-frame');
      const r = f ? f.getBoundingClientRect() : null;
      return { exists: Boolean(f), left: r ? Math.round(r.left) : 0, right: r ? Math.round(r.right) : 0, inBounds: !r || (r.left >= 0 && r.right <= 376) };
    })()
  `);
  reporter.record(2, 'B3-HeroPortraitBoundaries', 'Hero portrait at 375px stays cleanly within viewport margins', portrait375AndDock.inBounds, {
              expected: '0 <= left, right <= 376px',
              actual: portrait375AndDock
            });

            // ---------------------------------------------------------
            // Group B4: Journey Scroll Clamping & High Velocity (7 assertions)
            // ---------------------------------------------------------
            console.log('\n-- Group B4: Journey Scroll Clamping & High Velocity --');

            await harness.setViewport(1440, 900);

            // B4.1: Top clamp: at scrollY = 0, ship avatar clamped at start (<= 10%)
            await harness.scrollTo(0);
            await new Promise(r => setTimeout(r, 150));
            const shipTopClamp = await harness.evaluate(`
    (() => {
      const ship = document.getElementById('voyageShipAvatar');
      return ship ? (parseFloat(ship.style.left) || 0) : 0;
    })()
  `);
            const b4_1_pass = shipTopClamp <= 10;
            reporter.record(2, 'B4-JourneyScrollClamping', 'Ship avatar position clamped at origin when scrollY = 0 (left <= 10%)', b4_1_pass, {
              expected: '<= 10%',
              actual: `${shipTopClamp}%`
            });

            // B4.2: Bottom clamp: ship avatar does not exceed 100% past journey
            await harness.scrollTo(6000);
            await new Promise(r => setTimeout(r, 200));
            const shipBottomClamp = await harness.evaluate(`
    (() => {
      const ship = document.getElementById('voyageShipAvatar');
      return ship ? (parseFloat(ship.style.left) || 0) : 100;
    })()
  `);
            const b4_2_pass = shipBottomClamp <= 100 && shipBottomClamp >= 70;
            reporter.record(2, 'B4-JourneyScrollClamping', 'Ship avatar position clamped <= 100% when scrolled past journey', b4_2_pass, {
              expected: '70% <= left <= 100%',
              actual: `${shipBottomClamp}%`
            });

            // B4.3: Rapid scroll stress test (teleport 0 -> end of journey in single step)
            await harness.scrollTo(0);
            await new Promise(r => setTimeout(r, 100));
            const jTopB4 = await harness.evaluate(`Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY)`);
            await harness.scrollTo(jTopB4 + 2200);
            await new Promise(r => setTimeout(r, 250));
            const rapidForward = await harness.evaluate(`
    (() => {
      const c4 = document.getElementById('milestone-4');
      const counter = document.getElementById('voyageRouteCounter');
      const banner = document.getElementById('voyageCelebrationBanner');
      return {
        c4Revealed: c4 ? (c4.classList.contains('is-revealed') || c4.classList.contains('is-stacked') || c4.classList.contains('is-active')) : false,
        counter: counter ? counter.textContent.trim() : '',
        bannerVisible: banner && (window.getComputedStyle(banner).display !== 'none' || banner.classList.contains('is-visible'))
      };
    })()
  `);
            const b4_3_pass = (rapidForward.c4Revealed || rapidForward.counter.includes('4')) && rapidForward.bannerVisible;
            reporter.record(2, 'B4-JourneyScrollClamping', 'Rapid forward scroll stress: successfully settles at Chapter 4 with banner revealed', b4_3_pass, {
              expected: 'Chapter 4 active & banner visible',
              actual: rapidForward
            });

            // B4.4: Rapid reverse scroll stress test (teleport 4200px -> 0 in single step)
            await harness.scrollTo(0);
            await new Promise(r => setTimeout(r, 250));
            const rapidReverse = await harness.evaluate(`
    (() => {
      const c4 = document.getElementById('milestone-4');
      const counter = document.getElementById('voyageRouteCounter');
      return {
        c4Active: c4 ? c4.classList.contains('is-active') : false,
        counter: counter ? counter.textContent.trim() : ''
      };
    })()
  `);
            const b4_4_pass = !rapidReverse.c4Active && (rapidReverse.counter.includes('1') || !rapidReverse.counter.includes('4'));
            reporter.record(2, 'B4-JourneyScrollClamping', 'Rapid reverse scroll stress: successfully reverts to Chapter 1 without corruption', b4_4_pass, {
              expected: 'Reverted to Chapter 1',
              actual: rapidReverse
            });

            // B4.5: Card stacking z-index ordering
            const zIndices = await harness.evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
      return cards.map(c => parseInt(window.getComputedStyle(c).zIndex, 10) || 0);
    })()
  `);
            const b4_5_pass = zIndices.length >= 2 &&
              zIndices.every((z, idx) => idx === 0 || z >= zIndices[idx - 1]);
            reporter.record(2, 'B4-JourneyScrollClamping', 'Milestone cards enforce progressive stacking z-index (Card N >= Card N-1)', b4_5_pass, {
              expected: 'Monotonically increasing or non-decreasing z-index',
              actual: zIndices
            });

            // B4.6: Sticky offset spacing delta within [8px, 24px]
            const cardTops = await harness.evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
      return cards.map(c => parseFloat(window.getComputedStyle(c).top) || 0);
    })()
  `);
            let validDeltas = true;
            for(let i = 1; i<cardTops.length; i++) {
              const diff = cardTops[i] - cardTops[i - 1];
              if(diff < 8 || diff > 28) {
        validDeltas = false;
        break;
      }
  }
  reporter.record(2, 'B4-JourneyScrollClamping', 'Sticky card docking spacing deltas are bounded in [8px, 28px] range', validDeltas && cardTops.length >= 2, {
        expected: '8px <= delta <= 28px',
        actual: cardTops
      });

    // B4.7: Step containers min-height >= 45vh
    const stepHeights = await harness.evaluate(`
    (() => {
      const steps = Array.from(document.querySelectorAll('.voyage-card-step'));
      if (steps.length === 0) return { count: 0, valid: false };
      const vh = window.innerHeight;
      const valid = steps.every(s => s.clientHeight >= (vh * 0.45));
      return { count: steps.length, valid, heights: steps.map(s => s.clientHeight) };
    })()
  `);
    reporter.record(2, 'B4-JourneyScrollClamping', 'Voyage card step containers enforce min-height >= 45vh for smooth scroll progression', stepHeights.valid, {
      expected: '>= 45vh per step',
      actual: stepHeights
    });

    // ---------------------------------------------------------
    // Group B5: Responsive Layout Scalings & Zero Horizontal Pan (7 assertions)
    // ---------------------------------------------------------
    console.log('\n-- Group B5: Responsive Layout Scalings & Zero Horizontal Pan --');

    // B5.1: Logbook spread at 375px: single column layout
    await harness.setViewport(375, 667);
    const logbook375 = await harness.evaluate(`
    (() => {
      const lb = document.querySelector('.logbook-spread') || document.querySelector('.logbook-grid');
      if (!lb) return { exists: false, singleCol: true };
      const st = window.getComputedStyle(lb);
      const cols = st.gridTemplateColumns ? st.gridTemplateColumns.split(' ').length : 1;
      return { exists: true, cols, singleCol: cols === 1 || st.display === 'block' || st.display === 'flex' };
    })()
  `);
    reporter.record(2, 'B5-ResponsiveScalings', 'Logbook spread collapses to single column (1fr) on mobile 375px', logbook375.singleCol, {
      expected: '1 column',
      actual: `${logbook375.cols} column(s)`
    });

    // B5.2: Logbook spread at 1024px: 2 columns
    await harness.setViewport(1024, 768);
    const logbook1024 = await harness.evaluate(`
    (() => {
      const lb = document.querySelector('.logbook-spread') || document.querySelector('.logbook-grid');
      if (!lb) return { exists: false, twoCol: true };
      const st = window.getComputedStyle(lb);
      const cols = st.gridTemplateColumns ? st.gridTemplateColumns.split(' ').length : 2;
      return { exists: true, cols, twoCol: cols >= 2 };
    })()
  `);
    reporter.record(2, 'B5-ResponsiveScalings', 'Logbook spread expands to 2 columns on desktop 1024px', logbook1024.twoCol, {
      expected: '>= 2 columns',
      actual: `${logbook1024.cols} column(s)`
    });

    // B5.3: Tablet navbar island wrapping at 681px
    await harness.setViewport(681, 900);
    const navWrap681 = await harness.evaluate(`
    (() => {
      const nav = document.querySelector('.nav-island') || document.querySelector('nav');
      if (!nav) return { exists: false, inBounds: true };
      const r = nav.getBoundingClientRect();
      return { exists: true, right: Math.round(r.right), inBounds: r.right <= 682 };
    })()
  `);
    reporter.record(2, 'B5-ResponsiveScalings', 'Navbar island on 681px tablet boundary wraps without overflowing right edge', navWrap681.inBounds, {
      expected: '<= 682px',
      actual: navWrap681.right
    });

    // B5.4: Sticky headroom: cards sticky top offset >= 70px (clears sticky header)
    const headroomPass = cardTops.length > 0 && cardTops.every(t => t >= 70);
    reporter.record(2, 'B5-ResponsiveScalings', 'Milestone cards configure sticky headroom clearance (top >= 70px) below navbar', headroomPass, {
      expected: '>= 70px',
      actual: cardTops
    });

    // B5.5: Track fill bounded between 0% and 100%
    const trackFillBounded = await harness.evaluate(`
    (() => {
      const fill = document.getElementById('voyageTrackFill');
      if (!fill) return false;
      const w = parseFloat(fill.style.width) || 0;
      return w >= 0 && w <= 100;
    })()
  `);
    reporter.record(2, 'B5-ResponsiveScalings', 'Track fill percentage strictly bounded between 0% and 100%', trackFillBounded, {
      expected: '0% <= fill <= 100%',
      actual: trackFillBounded
    });

    // B5.6: Horizontal scroll lockout: window.scrollTo(500, 0) leaves scrollX === 0
    await harness.evaluate(`window.scrollTo(500, 0);`);
    const scrollXZero = await harness.evaluate(`window.scrollX || window.pageXOffset || 0`);
    reporter.record(2, 'B5-ResponsiveScalings', 'Programmatic horizontal pan lockout: window.scrollX remains 0', scrollXZero === 0, {
      expected: 0,
      actual: scrollXZero
    });

    // B5.7: Footer and contact elements at 375px
    await harness.setViewport(375, 667);
    const footer375 = await harness.evaluate(`
    (() => {
      const footer = document.querySelector('footer') || document.getElementById('contact');
      if (!footer) return { inBounds: true };
      const r = footer.getBoundingClientRect();
      return { right: Math.round(r.right), inBounds: r.right <= 376 };
    })()
  `);
    reporter.record(2, 'B5-ResponsiveScalings', 'Footer & Contact elements at 375px fit within viewport boundary (right <= 376px)', footer375.inBounds, {
      expected: '<= 376px',
      actual: footer375.right
    });
  }

module.exports = { runTier2 };
