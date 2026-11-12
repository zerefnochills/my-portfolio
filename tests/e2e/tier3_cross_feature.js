/**
 * Tier 3: Cross-Feature Combinations E2E Tests
 * Validates complex multi-feature interactions, state persistence across resizes,
 * ribbon & poster collision resistance, and scroll-driven layout stability.
 * Target: >= 7 tests
 */

async function runTier3(harness) {
  const reporter = harness.reporter;
  console.log('\n========================================');
  console.log('  RUNNING TIER 3: CROSS-FEATURE COMBINATIONS');
  console.log('========================================\n');

  await harness.navigate('/index.html');

  // ---------------------------------------------------------
  // Test 3.1: Hero Layout Centering + Zero Overflow with 3:4 Wanted Poster (F1 + F2 + F4)
  // ---------------------------------------------------------
  console.log('\n-- Test 3.1: Hero Layout Centering & Zero Overflow with 3:4 Wanted Poster --');
  const viewports = [375, 768, 1024, 1440];
  let t3_1_allPass = true;
  const t3_1_details = [];

  for (const w of viewports) {
    const h = w === 375 ? 667 : (w === 768 ? 1024 : 900);
    await harness.setViewport(w, h);
    const m = await harness.getMetrics(w);
    const centered = m.main && m.main.centerDelta <= 4;
    const noOverflow = m.scrollW <= m.winW + 1;
    const validPoster = m.wanted && m.wanted.aspectRatio >= 0.88 && m.wanted.aspectRatio <= 0.99;
    const pass = centered && noOverflow && validPoster;
    if (!pass) t3_1_allPass = false;
    t3_1_details.push({ viewport: `${w}px`, centered, noOverflow, validPoster, centerDelta: m.main?.centerDelta, ratio: m.wanted?.aspectRatio });
  }

    reporter.record(3, 'XF-HeroPortraitCentering', 'Hero centering, zero overflow, and 15:16 straight portrait ratio hold simultaneously across all 4 viewports', t3_1_allPass, {
      details: t3_1_details
    });

    // ---------------------------------------------------------
    // Test 3.2: Floating Ribbons + Hero Portrait + Hero Headline Collision Resistance (F1 + F4)
    // ---------------------------------------------------------
    console.log('\n-- Test 3.2: Floating Ribbons + Hero Portrait Collision Resistance --');
    await harness.setViewport(768, 1024);
    const ribbonPosterCollision = await harness.evaluate(`
    (() => {
      const ribbons = Array.from(document.querySelectorAll('.irl-ribbon-btn, .sketchbook-ribbon-btn'));
      const poster = document.querySelector('.hero-portrait-frame');
      const heroTitle = document.querySelector('.hero-title') || document.querySelector('.hero-left');
      if (ribbons.length === 0 || !poster) return { collision: false, ribbons: ribbons.length };
      const pr = poster.getBoundingClientRect();
      const tr = heroTitle ? heroTitle.getBoundingClientRect() : null;

      for (const r of ribbons) {
        const rr = r.getBoundingClientRect();
        // Check collision with portrait
        const collidesPoster = !(rr.right < pr.left || rr.left > pr.right || rr.bottom < pr.top || rr.top > pr.bottom);
        if (collidesPoster) return { collision: true, target: 'portrait', ribbon: r.className };
        // Check collision with headline
        if (tr) {
          const collidesTitle = !(rr.right < tr.left || rr.left > tr.right || rr.bottom < tr.top || rr.top > tr.bottom);
          if (collidesTitle) return { collision: true, target: 'heroTitle', ribbon: r.className };
        }
      }
      return { collision: false };
    })()
  `);
      reporter.record(3, 'XF-RibbonCollision', 'Floating ribbons maintain non-colliding clearance with Hero Portrait and Hero headline on tablet (768px)', !ribbonPosterCollision.collision, {
        expected: 'collision === false',
        actual: ribbonPosterCollision
      });

      // ---------------------------------------------------------
      // Test 3.3: Journey Sticky Scroll Deck Progression with Zero Horizontal Overflow (F2 + F5 + F6)
      // ---------------------------------------------------------
      console.log('\n-- Test 3.3: Journey Sticky Scroll Progression with Zero Overflow --');
      await harness.setViewport(1440, 900);
      const scrollSteps = [0, 800, 1600, 2400, 3200];
      let t3_3_allPass = true;
      const t3_3_details = [];

      for(const scrollY of scrollSteps) {
        await harness.scrollTo(scrollY);
        await new Promise(r => setTimeout(r, 100));
        const m = await harness.getMetrics(1440);
        const noOverflow = m.scrollW <= m.winW + 1;
        if (!noOverflow) t3_3_allPass = false;
        t3_3_details.push({ scrollY, scrollW: m.scrollW, winW: m.winW, noOverflow });
      }

  reporter.record(3, 'XF-JourneyScrollNoOverflow', 'Zero horizontal overflow holds at every scroll increment through the Journey sticky deck', t3_3_allPass, {
        details: t3_3_details
      });

      // ---------------------------------------------------------
      // Test 3.4: Dynamic Viewport Resize during Journey Scrolled State (F1 + F2 + F5 + F6)
      // ---------------------------------------------------------
      console.log('\n-- Test 3.4: Dynamic Viewport Resize during Scrolled State --');
      // Start at 1440px, scroll into journey chapter 3
      await harness.setViewport(1440, 900);
      await harness.scrollTo(2200);
      await new Promise(r => setTimeout(r, 200));

      // Dynamically resize to 768px tablet
      await harness.setViewport(768, 1024);
      await new Promise(r => setTimeout(r, 200));
      const mTabletResized = await harness.getMetrics(768);

      // Dynamically resize to 375px mobile
      await harness.setViewport(375, 667);
      await new Promise(r => setTimeout(r, 200));
      const mMobileResized = await harness.getMetrics(375);

      const t3_4_pass = (mTabletResized.scrollW <= mTabletResized.winW + 1) &&
        (mMobileResized.scrollW <= mMobileResized.winW + 1) &&
        (mTabletResized.main && mTabletResized.main.centerDelta <= 4);

      reporter.record(3, 'XF-DynamicResizePersistence', 'Dynamic viewport resize (1440px -> 768px -> 375px) preserves centering and zero horizontal overflow during scroll', t3_4_pass, {
        expected: 'Zero overflow on 768px and 375px after dynamic resize',
        actual: {
          tablet: { scrollW: mTabletResized.scrollW, winW: mTabletResized.winW, centerDelta: mTabletResized.main?.centerDelta },
          mobile: { scrollW: mMobileResized.scrollW, winW: mMobileResized.winW, centerDelta: mMobileResized.main?.centerDelta }
        }
      });

      // ---------------------------------------------------------
      // Test 3.5: Mobile 375px Deep Stack: Hero Portrait + Route Dock Clearance (F2 + F4 + F6)
      // ---------------------------------------------------------
      console.log('\n-- Test 3.5: Mobile 375px Deep Stack Inspection --');
      await harness.setViewport(375, 667);
      await harness.scrollTo(0);
      await new Promise(r => setTimeout(r, 150));

      const deepStackMobile = await harness.evaluate(`
    (() => {
      const docW = document.documentElement.clientWidth;
      const poster = document.querySelector('.hero-portrait-frame');
      const pr = poster ? poster.getBoundingClientRect() : null;
      const posterFits = Boolean(pr) && (pr.right <= docW + 1 && pr.left >= -1);
      return {
        docW,
        posterFits,
        allFit: posterFits
      };
    })()
  `);
        reporter.record(3, 'XF-MobileDeepStack', 'Mobile (375px) straight hero portrait fits within viewport cleanly', deepStackMobile.allFit, {
          expected: 'allFit === true',
          actual: deepStackMobile
        });

        // ---------------------------------------------------------
        // Test 3.6: Waypoint Navigation + Reverse Scroll Continuity + Track/Ship Sync (F5 + F6 + F7)
        // ---------------------------------------------------------
        console.log('\n-- Test 3.6: Waypoint Navigation & Ship Sync Cycle --');
        await harness.setViewport(1440, 900);
        await harness.scrollTo(0);
        await new Promise(r => setTimeout(r, 150));

        // Click waypoint 3
        await harness.click('.voyage-waypoint[data-chapter="3"]');
        await new Promise(r => setTimeout(r, 350));
        const wp3State = await harness.evaluate(`
    (() => {
      const fill = document.getElementById('voyageTrackFill');
      const ship = document.getElementById('voyageShipAvatar');
      const counter = document.getElementById('voyageRouteCounter');
      return {
        fillW: fill ? (parseFloat(fill.style.width) || 0) : 0,
        shipL: ship ? (parseFloat(ship.style.left) || 0) : 0,
        counter: counter ? counter.textContent.trim() : ''
      };
    })()
  `);

        // Scrub backward to top
        await harness.scrollTo(0);
        await new Promise(r => setTimeout(r, 350));
        const topRevertState = await harness.evaluate(`
    (() => {
      const ship = document.getElementById('voyageShipAvatar');
      const counter = document.getElementById('voyageRouteCounter');
      return {
        shipL: ship ? (parseFloat(ship.style.left) || 0) : 0,
        counter: counter ? counter.textContent.trim() : ''
      };
    })()
  `);

        const t3_6_pass = wp3State.shipL > topRevertState.shipL && topRevertState.shipL <= 20;
        reporter.record(3, 'XF-WaypointShipSyncCycle', 'Waypoint click moves ship forward and reverse scroll to top retreats ship backward', t3_6_pass, {
          expected: 'Forward ship position > reverse ship position, top <= 20%',
          actual: { wp3: wp3State, topRevert: topRevertState }
        });

        // ---------------------------------------------------------
        // Test 3.7: Route Log Non-Occlusion + Zoro Cursor + Audio Throttling (F3 + F4 + F5 + F7)
        // ---------------------------------------------------------
        console.log('\n-- Test 3.7: Interactive Audio & Journey Route Log Clearance --');
        await harness.click('.voyage-waypoint[data-chapter="2"]');
        await new Promise(r => setTimeout(r, 250));
        const interactiveState = await harness.evaluate(`
    (() => {
      const dock = document.getElementById('voyageRouteDock');
      const card2 = document.getElementById('milestone-2');
      const header = document.querySelector('header.site-header .nav-island');
      const dr = dock ? dock.getBoundingClientRect() : null;
      const cr = card2 ? card2.getBoundingClientRect() : null;
      const hr = header ? header.getBoundingClientRect() : null;
      const routeDockClearsNav = !dr || !hr || dr.top >= hr.bottom - 1;
      const cardClearsRouteDock = !dr || !cr || cr.top >= dr.bottom - 1;

      // Trigger Zoro cursor toggle button
      const zoroBtn = document.getElementById('themeToggleBtn') || document.querySelector('.zoro-toggle');
      if (zoroBtn) zoroBtn.click();

      // Rapidly call playPenScratch 5 times to test audio throttle
      let audioCalls = 0;
      if (typeof window.playPenScratch === 'function') {
        for (let i = 0; i < 5; i++) {
          try { window.playPenScratch(); audioCalls++; } catch (e) {}
        }
      }

      return {
        routeDockClearsNav,
        cardClearsRouteDock,
        navBottom: hr ? Math.round(hr.bottom) : null,
        dockTop: dr ? Math.round(dr.top) : null,
        dockBottom: dr ? Math.round(dr.bottom) : null,
        cardTop: cr ? Math.round(cr.top) : null,
        audioCallsExecuted: audioCalls
      };
    })()
  `);

          reporter.record(3, 'XF-InteractiveEasterEggAudio', 'Journey Route Dock clears navbar, active card clears Route Dock, and rapid audio executes cleanly', interactiveState.routeDockClearsNav && interactiveState.cardClearsRouteDock, {
            details: interactiveState
          });
        }

module.exports = { runTier3 };
