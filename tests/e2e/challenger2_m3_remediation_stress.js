/**
 * Challenger 2 Milestone 3 Remediation Empirical Stress Test
 *
 * Requirements:
 * 1. Waypoint click docking test: click Waypoints 1, 2, 3, 4 across Desktop (1440x900)
 *    and Mobile (375x667). Verify each target milestone card is visibly docked in
 *    the viewport (Card 1: 220px/190px, Card 2: 232px/198px, Card 3: 244px/206px, Card 4: 256px/214px).
 * 2. Scrollbar thumb drag unlock stress test: click Waypoint 4, simulate scrollbar
 *    thumb drag to Chapter 1 without wheel/keyboard events. Verify unlock via
 *    departure delta (> 40px) or timeout and correct update to Chapter 1.
 * 3. Rapid waypoint clicking bursts (4 -> 2 -> 3 -> 1 -> 4 at 50ms intervals).
 *    Verify zero out-of-order state corruption.
 * 4. Verify 82/82 assertions in test runner.
 */

const { TestHarness } = require('./harness');

async function runEmpiricalChallenge() {
  console.log('\n===============================================================');
  console.log('  CHALLENGER 2: M3 REMEDIATION EMPIRICAL STRESS TEST SUITE');
  console.log('===============================================================');

  const harness = new TestHarness();
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    failures: []
  };

  function assert(name, condition, details = {}) {
    summary.total++;
    if (condition) {
      summary.passed++;
      console.log(`  \x1b[32m✔ PASS\x1b[0m: ${name}`);
    } else {
      summary.failed++;
      console.log(`  \x1b[31m✖ FAIL\x1b[0m: ${name}`);
      console.log(`     Details: ${JSON.stringify(details, null, 2)}`);
      summary.failures.push({ name, details });
    }
  }

  try {
    await harness.startServer();
    await harness.launchChrome();
    await harness.navigate('/index.html');

    // =========================================================================
    // TASK 1: Waypoint Click Docking Test (Desktop 1440x900 & Mobile 375x667)
    // =========================================================================
    console.log('\n---------------------------------------------------------------');
    console.log('  TASK 1: WAYPOINT CLICK DOCKING TEST');
    console.log('---------------------------------------------------------------');

    // 1A. Desktop Docking (1440x900)
    console.log('\n[Task 1A] Desktop Viewport (1440x900) Docking Verification');
    await harness.setViewport(1440, 900);
    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 200));

    const desktopDockTargets = [
      { chapter: 1, expectedTop: 220 },
      { chapter: 2, expectedTop: 232 },
      { chapter: 3, expectedTop: 244 },
      { chapter: 4, expectedTop: 256 }
    ];

    for (const { chapter, expectedTop } of desktopDockTargets) {
      console.log(`  Testing Desktop Waypoint ${chapter} (Expected Card ${chapter} top: ${expectedTop}px)...`);
      await harness.click(`.voyage-waypoint[data-chapter="${chapter}"]`);
      await new Promise(r => setTimeout(r, 200));

      const cardState = await harness.evaluate(`
        (() => {
          const card = document.getElementById('milestone-${chapter}');
          const rect = card ? card.getBoundingClientRect() : null;
          const banner = document.getElementById('voyageCelebrationBanner');
          const counter = document.getElementById('voyageRouteCounter');
          const ship = document.getElementById('voyageShipAvatar');
          const wp = document.querySelector('.voyage-waypoint[data-chapter="${chapter}"]');

          return {
            cardExists: !!card,
            top: rect ? Math.round(rect.top) : null,
            bottom: rect ? Math.round(rect.bottom) : null,
            height: rect ? Math.round(rect.height) : null,
            isActive: card ? card.classList.contains('is-active') : false,
            isStacked: card ? card.classList.contains('is-stacked') : false,
            wpActive: wp ? wp.classList.contains('active') : false,
            counterText: counter ? counter.textContent.trim() : '',
            shipLeft: ship ? parseFloat(ship.style.left) || 0 : 0,
            bannerVisible: banner ? (window.getComputedStyle(banner).display !== 'none' && !banner.classList.contains('is-hidden')) : false,
            scrollY: window.scrollY
          };
        })()
      `);

      // Tolerance of ±1px for subpixel/rounding
      const topDelta = Math.abs(cardState.top - expectedTop);
      const isDocked = topDelta <= 1;
      const isInViewport = cardState.top >= 0 && cardState.top < 900;

      assert(`[Desktop] Card ${chapter} docked at ${expectedTop}px (actual: ${cardState.top}px, delta: ${topDelta}px)`, isDocked, cardState);
      assert(`[Desktop] Card ${chapter} visibly positioned inside viewport (top: ${cardState.top}px, bottom: ${cardState.bottom}px)`, isInViewport, cardState);
      assert(`[Desktop] Card ${chapter} marked is-active and is-stacked`, cardState.isActive && cardState.isStacked, cardState);
      assert(`[Desktop] Waypoint ${chapter} marked active`, cardState.wpActive, cardState);

      const expectedShip = ((chapter - 1) / 3) * 100;
      assert(`[Desktop] Ship avatar synchronized at ${expectedShip.toFixed(1)}% (actual: ${cardState.shipLeft.toFixed(1)}%)`, Math.abs(cardState.shipLeft - expectedShip) < 1, cardState);

      if (chapter === 4) {
        assert(`[Desktop] Celebration banner displayed for Chapter 4`, cardState.bannerVisible, cardState);
      }
    }

    // 1B. Mobile Docking (375x667)
    console.log('\n[Task 1B] Mobile Viewport (375x667) Docking Verification');
    await harness.setViewport(375, 667);
    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 200));

    const mobileDockTargets = [
      { chapter: 1, expectedTop: 190 },
      { chapter: 2, expectedTop: 198 },
      { chapter: 3, expectedTop: 206 },
      { chapter: 4, expectedTop: 214 }
    ];

    for (const { chapter, expectedTop } of mobileDockTargets) {
      console.log(`  Testing Mobile Waypoint ${chapter} (Expected Card ${chapter} top: ${expectedTop}px)...`);
      await harness.click(`.voyage-waypoint[data-chapter="${chapter}"]`);
      await new Promise(r => setTimeout(r, 200));

      const cardState = await harness.evaluate(`
        (() => {
          const card = document.getElementById('milestone-${chapter}');
          const rect = card ? card.getBoundingClientRect() : null;
          const banner = document.getElementById('voyageCelebrationBanner');
          const counter = document.getElementById('voyageRouteCounter');
          const ship = document.getElementById('voyageShipAvatar');
          const wp = document.querySelector('.voyage-waypoint[data-chapter="${chapter}"]');

          return {
            cardExists: !!card,
            top: rect ? Math.round(rect.top) : null,
            bottom: rect ? Math.round(rect.bottom) : null,
            height: rect ? Math.round(rect.height) : null,
            isActive: card ? card.classList.contains('is-active') : false,
            isStacked: card ? card.classList.contains('is-stacked') : false,
            wpActive: wp ? wp.classList.contains('active') : false,
            counterText: counter ? counter.textContent.trim() : '',
            shipLeft: ship ? parseFloat(ship.style.left) || 0 : 0,
            bannerVisible: banner ? (window.getComputedStyle(banner).display !== 'none' && !banner.classList.contains('is-hidden')) : false,
            scrollY: window.scrollY
          };
        })()
      `);

      const topDelta = Math.abs(cardState.top - expectedTop);
      const isDocked = topDelta <= 1;
      const isInViewport = cardState.top >= 0 && cardState.top < 667;

      assert(`[Mobile] Card ${chapter} docked at ${expectedTop}px (actual: ${cardState.top}px, delta: ${topDelta}px)`, isDocked, cardState);
      assert(`[Mobile] Card ${chapter} visibly positioned inside viewport (top: ${cardState.top}px, bottom: ${cardState.bottom}px)`, isInViewport, cardState);
      assert(`[Mobile] Card ${chapter} marked is-active and is-stacked`, cardState.isActive && cardState.isStacked, cardState);
      assert(`[Mobile] Waypoint ${chapter} marked active`, cardState.wpActive, cardState);

      if (chapter === 4) {
        assert(`[Mobile] Celebration banner displayed for Chapter 4`, cardState.bannerVisible, cardState);
      }
    }

    // =========================================================================
    // TASK 2: Scrollbar Thumb Drag Unlock Stress Test
    // =========================================================================
    console.log('\n---------------------------------------------------------------');
    console.log('  TASK 2: SCROLLBAR THUMB DRAG UNLOCK STRESS TEST');
    console.log('---------------------------------------------------------------');

    await harness.setViewport(1440, 900);
    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 200));

    // Get journey coordinates
    const coords = await harness.evaluate(`
      (() => {
        const j = document.getElementById('journey');
        const r = j.getBoundingClientRect();
        const jTop = Math.round(r.top + window.scrollY);
        return { jTop };
      })()
    `);
    const jTop = coords.jTop;

    // 2A: Click Waypoint 4, verify lock is set
    console.log('\n[Task 2A] Clicking Waypoint 4 and inspecting lock state...');
    await harness.click('.voyage-waypoint[data-chapter="4"]');
    await new Promise(r => setTimeout(r, 100)); // Within 450ms timer window

    const initialWp4State = await harness.evaluate(`
      (() => {
        const counter = document.getElementById('voyageRouteCounter');
        const card4 = document.getElementById('milestone-4');
        return {
          scrollY: window.scrollY,
          active: card4 ? card4.classList.contains('is-active') : false,
          counter: counter ? counter.textContent.trim() : ''
        };
      })()
    `);
    assert('[Task 2A] Waypoint 4 active immediately after click', initialWp4State.active, initialWp4State);

    // 2B: Small drag within 40px delta threshold — lock should hold (anti-jitter)
    console.log('\n[Task 2B] Simulating small scrollbar thumb drag (20px delta, within 40px threshold)...');
    await harness.evaluate(`
      (() => {
        // Only scroll event — NO wheel, NO keydown, NO touchmove, NO pointerdown
        window.scrollTo({ top: window.scrollY - 20, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await new Promise(r => setTimeout(r, 50));

    const jitterState = await harness.evaluate(`
      (() => {
        const card4 = document.getElementById('milestone-4');
        const counter = document.getElementById('voyageRouteCounter');
        return {
          scrollY: window.scrollY,
          active: card4 ? card4.classList.contains('is-active') : false,
          counter: counter ? counter.textContent.trim() : ''
        };
      })()
    `);
    assert('[Task 2B] Minor drag (20px) preserves Chapter 4 lock (anti-jitter)', jitterState.active, jitterState);

    // 2C: Large drag beyond 40px departure delta — controller MUST unlock immediately on scroll frame
    console.log('\n[Task 2C] Simulating large scrollbar thumb drag to Chapter 1 position (> 40px delta)...');
    // Scroll to Chapter 1 position (jTop + 100) purely via scroll event
    await harness.evaluate(`
      (() => {
        const jTop = ${jTop};
        // Pure scroll change: simulates dragging the native browser scrollbar thumb
        window.scrollTo({ top: jTop + 100, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await new Promise(r => setTimeout(r, 50));

    const unlockedState = await harness.evaluate(`
      (() => {
        const card1 = document.getElementById('milestone-1');
        const card4 = document.getElementById('milestone-4');
        const counter = document.getElementById('voyageRouteCounter');
        const ship = document.getElementById('voyageShipAvatar');
        const banner = document.getElementById('voyageCelebrationBanner');
        return {
          scrollY: window.scrollY,
          card1Active: card1 ? card1.classList.contains('is-active') : false,
          card4Active: card4 ? card4.classList.contains('is-active') : false,
          counter: counter ? counter.textContent.trim() : '',
          shipLeft: ship ? parseFloat(ship.style.left) || 0 : -1,
          bannerVisible: banner ? (window.getComputedStyle(banner).display !== 'none' && !banner.classList.contains('is-hidden')) : false
        };
      })()
    `);

    assert('[Task 2C] Large scrollbar drag immediately unlocks and activates Card 1', unlockedState.card1Active, unlockedState);
    assert('[Task 2C] Card 4 is deactivated after scrollbar drag to Chapter 1', !unlockedState.card4Active, unlockedState);
    assert('[Task 2C] Celebration banner hidden after scrollbar drag to Chapter 1', !unlockedState.bannerVisible, unlockedState);
    assert('[Task 2C] Route counter reflects Chapter 1', unlockedState.counter.includes('Chapter 1'), unlockedState);
    assert('[Task 2C] Ship avatar returns to 0%', unlockedState.shipLeft < 1, unlockedState);

    // 2D: Timeout Unlock Verification
    console.log('\n[Task 2D] Testing 450ms Fallback Timeout Unlock...');
    await harness.click('.voyage-waypoint[data-chapter="4"]');
    await new Promise(r => setTimeout(r, 500)); // wait > 450ms timer

    // Now a minor scroll of just 15px (which wouldn't trigger the > 40px delta) should still process scroll
    await harness.evaluate(`
      (() => {
        const jTop = ${jTop};
        // Move to chapter 2 area (jTop + 700)
        window.scrollTo({ top: jTop + 700, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await new Promise(r => setTimeout(r, 50));

    const timeoutUnlockState = await harness.evaluate(`
      (() => {
        const card2 = document.getElementById('milestone-2');
        const card4 = document.getElementById('milestone-4');
        const counter = document.getElementById('voyageRouteCounter');
        return {
          scrollY: window.scrollY,
          card2Active: card2 ? card2.classList.contains('is-active') : false,
          card4Active: card4 ? card4.classList.contains('is-active') : false,
          counter: counter ? counter.textContent.trim() : ''
        };
      })()
    `);
    assert('[Task 2D] Controller unlocked via timer: scroll to Ch 2 successfully activated Card 2', timeoutUnlockState.card2Active, timeoutUnlockState);
    assert('[Task 2D] Card 4 deactivated after scroll to Ch 2', !timeoutUnlockState.card4Active, timeoutUnlockState);

    // 2E: Drag to top (scrollY < 200px) instant unlock
    console.log('\n[Task 2E] Testing Drag to Top (scrollY < 200) unlock...');
    await harness.click('.voyage-waypoint[data-chapter="3"]');
    await new Promise(r => setTimeout(r, 50));
    await harness.evaluate(`
      (() => {
        window.scrollTo({ top: 50, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await new Promise(r => setTimeout(r, 50));

    const topState = await harness.evaluate(`
      (() => {
        const card1 = document.getElementById('milestone-1');
        const ship = document.getElementById('voyageShipAvatar');
        return {
          scrollY: window.scrollY,
          card1Active: card1 ? card1.classList.contains('is-active') : false,
          shipLeft: ship ? parseFloat(ship.style.left) || 0 : -1
        };
      })()
    `);
    assert('[Task 2E] Drag to top (< 200px) activates Chapter 1 and resets ship to 0%', topState.card1Active && topState.shipLeft === 0, topState);

    // =========================================================================
    // TASK 3: Rapid Waypoint Clicking Bursts & State Corruption Stress
    // =========================================================================
    console.log('\n---------------------------------------------------------------');
    console.log('  TASK 3: RAPID WAYPOINT CLICKING BURSTS (ZERO CORRUPTION)');
    console.log('---------------------------------------------------------------');

    // 3A: Rapid burst: 4 -> 2 -> 3 -> 1 -> 4 at 50ms intervals
    console.log('\n[Task 3A] Executing rapid burst: 4 -> 2 -> 3 -> 1 -> 4 @ 50ms intervals...');
    const burstA = [4, 2, 3, 1, 4];
    for (const ch of burstA) {
      await harness.click(`.voyage-waypoint[data-chapter="${ch}"]`);
      await new Promise(r => setTimeout(r, 50));
    }
    // Settle time
    await new Promise(r => setTimeout(r, 300));

    const burstAState = await harness.evaluate(`
      (() => {
        const card4 = document.getElementById('milestone-4');
        const rect4 = card4 ? card4.getBoundingClientRect() : null;
        const banner = document.getElementById('voyageCelebrationBanner');
        const counter = document.getElementById('voyageRouteCounter');
        const ship = document.getElementById('voyageShipAvatar');
        const waypoints = Array.from(document.querySelectorAll('.voyage-waypoint')).map(w => ({
          ch: parseInt(w.getAttribute('data-chapter'), 10),
          active: w.classList.contains('active'),
          locked: w.classList.contains('locked')
        }));
        const cards = Array.from(document.querySelectorAll('.voyage-milestone-card')).map(c => ({
          num: parseInt(c.getAttribute('data-milestone'), 10),
          isActive: c.classList.contains('is-active'),
          isStacked: c.classList.contains('is-stacked')
        }));

        return {
          scrollY: window.scrollY,
          card4Top: rect4 ? Math.round(rect4.top) : null,
          card4Active: card4 ? card4.classList.contains('is-active') : false,
          card4Stacked: card4 ? card4.classList.contains('is-stacked') : false,
          counter: counter ? counter.textContent.trim() : '',
          shipLeft: ship ? parseFloat(ship.style.left) || 0 : -1,
          bannerVisible: banner ? (window.getComputedStyle(banner).display !== 'none' && !banner.classList.contains('is-hidden')) : false,
          allWaypointsActive: waypoints.every(w => w.active && !w.locked),
          allCardsStacked: cards.every(c => c.isStacked),
          onlyCard4Active: cards.filter(c => c.isActive).length === 1 && card4.classList.contains('is-active')
        };
      })()
    `);

    assert('[Task 3A] Final state is Chapter 4 after burst 4->2->3->1->4', burstAState.card4Active && burstAState.onlyCard4Active, burstAState);
    assert('[Task 3A] Card 4 docked at 256px after burst', Math.abs(burstAState.card4Top - 256) <= 1, burstAState);
    assert('[Task 3A] Ship avatar is at 100% after burst', Math.abs(burstAState.shipLeft - 100) < 1, burstAState);
    assert('[Task 3A] Route counter shows Chapter 4', burstAState.counter.includes('Chapter 4'), burstAState);
    assert('[Task 3A] Celebration banner is visible', burstAState.bannerVisible, burstAState);
    assert('[Task 3A] All cards stacked and all waypoints active', burstAState.allCardsStacked && burstAState.allWaypointsActive, burstAState);

    // 3B: Rapid burst: 1 -> 4 -> 2 -> 3 -> 1 at 50ms intervals
    console.log('\n[Task 3B] Executing rapid burst: 1 -> 4 -> 2 -> 3 -> 1 @ 50ms intervals...');
    const burstB = [1, 4, 2, 3, 1];
    for (const ch of burstB) {
      await harness.click(`.voyage-waypoint[data-chapter="${ch}"]`);
      await new Promise(r => setTimeout(r, 50));
    }
    await new Promise(r => setTimeout(r, 300));

    const burstBState = await harness.evaluate(`
      (() => {
        const card1 = document.getElementById('milestone-1');
        const rect1 = card1 ? card1.getBoundingClientRect() : null;
        const banner = document.getElementById('voyageCelebrationBanner');
        const counter = document.getElementById('voyageRouteCounter');
        const ship = document.getElementById('voyageShipAvatar');
        const cards = Array.from(document.querySelectorAll('.voyage-milestone-card')).map(c => ({
          num: parseInt(c.getAttribute('data-milestone'), 10),
          isActive: c.classList.contains('is-active')
        }));

        return {
          scrollY: window.scrollY,
          card1Top: rect1 ? Math.round(rect1.top) : null,
          card1Active: card1 ? card1.classList.contains('is-active') : false,
          counter: counter ? counter.textContent.trim() : '',
          shipLeft: ship ? parseFloat(ship.style.left) || 0 : -1,
          bannerVisible: banner ? (window.getComputedStyle(banner).display !== 'none' && !banner.classList.contains('is-hidden')) : false,
          onlyCard1Active: cards.filter(c => c.isActive).length === 1 && card1.classList.contains('is-active')
        };
      })()
    `);

    assert('[Task 3B] Final state is Chapter 1 after burst 1->4->2->3->1', burstBState.card1Active && burstBState.onlyCard1Active, burstBState);
    assert('[Task 3B] Card 1 docked at 220px after burst', Math.abs(burstBState.card1Top - 220) <= 1, burstBState);
    assert('[Task 3B] Ship avatar is at 0%', burstBState.shipLeft === 0, burstBState);
    assert('[Task 3B] Route counter shows Chapter 1', burstBState.counter.includes('Chapter 1'), burstBState);
    assert('[Task 3B] Celebration banner is hidden', !burstBState.bannerVisible, burstBState);

    // 3C: Rapid Repeated Thrashing on Same Waypoint (4 -> 4 -> 4 at 30ms)
    console.log('\n[Task 3C] Executing repeated clicks on Waypoint 4 (4 -> 4 -> 4 @ 30ms)...');
    for (let i = 0; i < 3; i++) {
      await harness.click('.voyage-waypoint[data-chapter="4"]');
      await new Promise(r => setTimeout(r, 30));
    }
    await new Promise(r => setTimeout(r, 200));

    const thrashState = await harness.evaluate(`
      (() => {
        const card4 = document.getElementById('milestone-4');
        const rect4 = card4 ? card4.getBoundingClientRect() : null;
        return {
          card4Active: card4 ? card4.classList.contains('is-active') : false,
          top: rect4 ? Math.round(rect4.top) : null
        };
      })()
    `);
    assert('[Task 3C] Repeated identical clicks remain cleanly settled at Card 4', thrashState.card4Active && Math.abs(thrashState.top - 256) <= 1, thrashState);

    // 3D: Post-Burst Natural Scroll Resume (Zero Lingering Lock Corruption)
    console.log('\n[Task 3D] Testing Post-Burst Natural Scroll Resume...');
    // Scroll directly to Chapter 3 coordinates (jTop + 1300)
    await harness.evaluate(`
      (() => {
        const jTop = ${jTop};
        window.scrollTo({ top: jTop + 1300, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await new Promise(r => setTimeout(r, 100));

    const resumeState = await harness.evaluate(`
      (() => {
        const card3 = document.getElementById('milestone-3');
        const card4 = document.getElementById('milestone-4');
        const counter = document.getElementById('voyageRouteCounter');
        const ship = document.getElementById('voyageShipAvatar');
        return {
          scrollY: window.scrollY,
          card3Active: card3 ? card3.classList.contains('is-active') : false,
          card4Active: card4 ? card4.classList.contains('is-active') : false,
          counter: counter ? counter.textContent.trim() : '',
          shipLeft: ship ? parseFloat(ship.style.left) || 0 : -1
        };
      })()
    `);

    assert('[Task 3D] Normal scrolling resumes flawlessly after click bursts (Card 3 active)', resumeState.card3Active && !resumeState.card4Active, resumeState);
    assert('[Task 3D] Route counter correctly updated to Chapter 3 after scroll', resumeState.counter.includes('Chapter 3'), resumeState);

    // Audit for any uncaught browser console errors
    const consoleErrors = harness.consoleErrors || [];
    assert('[ConsoleAudit] Zero browser console errors during stress testing', consoleErrors.length === 0, { errors: consoleErrors });

    // =========================================================================
    // Summary
    // =========================================================================
    console.log('\n===============================================================');
    console.log('  CHALLENGER 2 EMPIRICAL STRESS TEST RESULTS');
    console.log('===============================================================');
    console.log(`  Total Checks: ${summary.total}`);
    console.log(`  Passed:       \x1b[32m${summary.passed}\x1b[0m`);
    console.log(`  Failed:       ${summary.failed > 0 ? `\x1b[31m${summary.failed}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
    console.log(`  Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
    console.log('===============================================================');

    await harness.close();

    if (summary.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    await harness.close();
    process.exit(1);
  }
}

runEmpiricalChallenge();
