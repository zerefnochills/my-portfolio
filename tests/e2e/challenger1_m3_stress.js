/**
 * Challenger 1 Milestone 3 Adversarial Stress & Scrubbing Harness
 *
 * Focus areas:
 * 1. Bidirectional scrubbing granularity (1 -> 2 -> 3 -> 4 and reverse 4 -> 3 -> 2 -> 1).
 * 2. Card unpack/pack state verification (.is-stacked, .is-active, .is-revealed).
 * 3. Ship avatar retreat & position sync (0%, 33.3%, 66.7%, 100%).
 * 4. Boundary clamping (scrollY = 0, scrollY = 8000, footer boundary).
 * 5. High-velocity scroll jumps & jitter oscillations (20-cycle high frequency thrashing).
 * 6. Responsive consistency (Desktop 1440px, Tablet 768px, Mobile 375px).
 * 7. Waypoint navigation and post-waypoint programmatic scroll unlock edge case.
 */

const { TestHarness } = require('./harness');

async function runM3AdversarialStress() {
  console.log('\n===============================================================');
  console.log('  CHALLENGER 1: M3 ADVERSARIAL STRESS & BIDIRECTIONAL HARNESS');
  console.log('===============================================================');

  const harness = new TestHarness();
  const report = {
    phases: {},
    passed: 0,
    failed: 0,
    findings: []
  };

  function assert(name, condition, details = {}) {
    if (condition) {
      report.passed++;
      console.log(`  \x1b[32m✔ PASS\x1b[0m: ${name}`);
    } else {
      report.failed++;
      console.log(`  \x1b[31m✖ FAIL\x1b[0m: ${name}`);
      console.log(`     Details: ${JSON.stringify(details)}`);
      report.findings.push({ name, details });
    }
  }

  try {
    await harness.startServer();
    await harness.launchChrome();
    await harness.navigate('/index.html');

    // -------------------------------------------------------------
    // Phase 1: Granular Step-by-Step Forward and Reverse Scrubbing
    // -------------------------------------------------------------
    console.log('\n[Phase 1] Granular Step-by-Step Forward and Reverse Scrubbing (1440px)');
    await harness.setViewport(1440, 900);

    const jTop = await harness.evaluate(`
      (() => {
        const j = document.getElementById('journey');
        const r = j.getBoundingClientRect();
        return Math.round(r.top + window.scrollY);
      })()
    `);

    console.log(`  -> Detected Journey section absolute top: ${jTop}px`);

    // Helper to inspect full voyage state
    async function getVoyageState() {
      return await harness.evaluate(`
        (() => {
          const cards = [1, 2, 3, 4].map(num => {
            const el = document.getElementById('milestone-' + num);
            if (!el) return null;
            return {
              num,
              isStacked: el.classList.contains('is-stacked'),
              isActive: el.classList.contains('is-active'),
              isRevealed: el.classList.contains('is-revealed')
            };
          });

          const waypoints = Array.from(document.querySelectorAll('.voyage-waypoint')).map(w => ({
            ch: parseInt(w.getAttribute('data-chapter'), 10),
            active: w.classList.contains('active'),
            locked: w.classList.contains('locked')
          }));

          const ship = document.getElementById('voyageShipAvatar');
          const trackFill = document.getElementById('voyageTrackFill');
          const counter = document.getElementById('voyageRouteCounter');
          const banner = document.getElementById('voyageCelebrationBanner');

          return {
            scrollY: Math.round(window.scrollY),
            cards,
            waypoints,
            shipLeft: ship ? parseFloat(ship.style.left) || 0 : -1,
            shipLeftStyle: ship ? ship.style.left : '',
            trackFillWidth: trackFill ? parseFloat(trackFill.style.width) || 0 : -1,
            counterText: counter ? counter.textContent.trim() : '',
            bannerVisible: banner && (window.getComputedStyle(banner).display !== 'none' || banner.classList.contains('is-visible'))
          };
        })()
      `);
    }

    // Step 1: Scroll to Step 1 (jTop + 50)
    await harness.scrollTo(jTop + 50);
    await new Promise(r => setTimeout(r, 150));
    const s1 = await getVoyageState();
    assert('Forward Step 1: Card 1 active and stacked, Cards 2-4 unstacked',
      s1.cards[0].isStacked && s1.cards[0].isActive && !s1.cards[1].isStacked && !s1.cards[2].isStacked && !s1.cards[3].isStacked,
      s1
    );
    assert('Forward Step 1: Ship avatar at 0% (or <= 5%)',
      s1.shipLeft <= 5,
      { shipLeft: s1.shipLeft }
    );
    assert('Forward Step 1: Celebration banner hidden',
      !s1.bannerVisible,
      { bannerVisible: s1.bannerVisible }
    );

    // Step 2: Scroll to Step 2 (jTop + 220)
    await harness.scrollTo(jTop + 220);
    await new Promise(r => setTimeout(r, 150));
    const s2 = await getVoyageState();
    assert('Forward Step 2: Cards 1-2 stacked, Card 2 active, Cards 3-4 unstacked',
      s2.cards[0].isStacked && s2.cards[1].isStacked && s2.cards[1].isActive && !s2.cards[2].isStacked && !s2.cards[3].isStacked,
      s2
    );
    assert('Forward Step 2: Ship avatar at ~33.3% (30%..36%)',
      s2.shipLeft >= 30 && s2.shipLeft <= 36,
      { shipLeft: s2.shipLeft }
    );
    assert('Forward Step 2: Counter shows Chapter 2',
      s2.counterText.includes('Chapter 2'),
      { counterText: s2.counterText }
    );

    // Step 3: Scroll to Step 3 (jTop + 380)
    await harness.scrollTo(jTop + 380);
    await new Promise(r => setTimeout(r, 150));
    const s3 = await getVoyageState();
    assert('Forward Step 3: Cards 1-3 stacked, Card 3 active, Card 4 unstacked',
      s3.cards[0].isStacked && s3.cards[1].isStacked && s3.cards[2].isStacked && s3.cards[2].isActive && !s3.cards[3].isStacked,
      s3
    );
    assert('Forward Step 3: Ship avatar at ~66.7% (63%..70%)',
      s3.shipLeft >= 63 && s3.shipLeft <= 70,
      { shipLeft: s3.shipLeft }
    );
    assert('Forward Step 3: Counter shows Chapter 3',
      s3.counterText.includes('Chapter 3'),
      { counterText: s3.counterText }
    );

    // Step 4: Scroll to Step 4 (jTop + 550)
    await harness.scrollTo(jTop + 550);
    await new Promise(r => setTimeout(r, 150));
    const s4 = await getVoyageState();
    assert('Forward Step 4: All Cards 1-4 stacked, Card 4 active',
      s4.cards.every(c => c.isStacked) && s4.cards[3].isActive,
      s4
    );
    assert('Forward Step 4: Ship avatar at 100%',
      s4.shipLeft === 100,
      { shipLeft: s4.shipLeft }
    );
    assert('Forward Step 4: Celebration banner unfurled & visible',
      s4.bannerVisible,
      { bannerVisible: s4.bannerVisible }
    );

    // -------------------------------------------------------------
    // Reverse Scrubbing 4 -> 3 -> 2 -> 1 -> Hero
    // -------------------------------------------------------------
    console.log('\n[Phase 2] Reverse Scrubbing 4 -> 3 -> 2 -> 1 -> Hero');

    // Reverse to Step 3 (jTop + 380)
    await harness.scrollTo(jTop + 380);
    await new Promise(r => setTimeout(r, 150));
    const rev3 = await getVoyageState();
    assert('Reverse Step 3: Card 4 cleanly unstacked, Card 3 active',
      rev3.cards[0].isStacked && rev3.cards[1].isStacked && rev3.cards[2].isStacked && !rev3.cards[3].isStacked && rev3.cards[2].isActive,
      rev3
    );
    assert('Reverse Step 3: Ship avatar retreated to ~66.7%',
      rev3.shipLeft >= 63 && rev3.shipLeft <= 70,
      { shipLeft: rev3.shipLeft }
    );
    assert('Reverse Step 3: Celebration banner cleanly re-hidden',
      !rev3.bannerVisible,
      { bannerVisible: rev3.bannerVisible }
    );

    // Reverse to Step 2 (jTop + 220)
    await harness.scrollTo(jTop + 220);
    await new Promise(r => setTimeout(r, 150));
    const rev2 = await getVoyageState();
    assert('Reverse Step 2: Card 3 cleanly unstacked, Card 2 active',
      rev2.cards[0].isStacked && rev2.cards[1].isStacked && !rev2.cards[2].isStacked && !rev2.cards[3].isStacked && rev2.cards[1].isActive,
      rev2
    );
    assert('Reverse Step 2: Ship avatar retreated to ~33.3%',
      rev2.shipLeft >= 30 && rev2.shipLeft <= 36,
      { shipLeft: rev2.shipLeft }
    );

    // Reverse to Step 1 (jTop + 50)
    await harness.scrollTo(jTop + 50);
    await new Promise(r => setTimeout(r, 150));
    const rev1 = await getVoyageState();
    assert('Reverse Step 1: Card 2 cleanly unstacked, Card 1 active',
      rev1.cards[0].isStacked && !rev1.cards[1].isStacked && !rev1.cards[2].isStacked && !rev1.cards[3].isStacked && rev1.cards[0].isActive,
      rev1
    );
    assert('Reverse Step 1: Ship avatar retreated to 0%',
      rev1.shipLeft <= 5,
      { shipLeft: rev1.shipLeft }
    );

    // Reverse into Hero (scrollY = 0)
    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 150));
    const revHero = await getVoyageState();
    assert('Reverse into Hero: Ship avatar clamped <= 10%',
      revHero.shipLeft <= 10,
      { shipLeft: revHero.shipLeft }
    );
    assert('Reverse into Hero: Counter shows Chapter 1, banner hidden',
      revHero.counterText.includes('Chapter 1') && !revHero.bannerVisible,
      revHero
    );

    // -------------------------------------------------------------
    // Phase 3: Extreme Boundary Clamping Stress
    // -------------------------------------------------------------
    console.log('\n[Phase 3] Extreme Boundary Clamping Stress');

    // Scroll to extreme bottom (footer: scrollY = 8000)
    await harness.scrollTo(8000);
    await new Promise(r => setTimeout(r, 200));
    const bBottom = await getVoyageState();
    assert('Extreme Bottom Clamp (scrollY=8000): Ship avatar clamped <= 100%',
      bBottom.shipLeft <= 100 && bBottom.shipLeft >= 95,
      { shipLeft: bBottom.shipLeft }
    );
    assert('Extreme Bottom Clamp: Track fill clamped <= 100%',
      bBottom.trackFillWidth <= 100,
      { trackFillWidth: bBottom.trackFillWidth }
    );
    assert('Extreme Bottom Clamp: Cards 1-4 remain validly stacked',
      bBottom.cards.every(c => c.isStacked),
      bBottom
    );

    // Instant teleport back to top (scrollY = 0)
    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 200));
    const bTop = await getVoyageState();
    assert('Extreme Top Clamp (scrollY=0): Ship avatar clamped <= 10%',
      bTop.shipLeft <= 10,
      { shipLeft: bTop.shipLeft }
    );
    assert('Extreme Top Clamp: Cards 2-4 unstacked, Card 1 active',
      bTop.cards[0].isStacked && !bTop.cards[1].isStacked && !bTop.cards[2].isStacked && !bTop.cards[3].isStacked,
      bTop
    );

    // -------------------------------------------------------------
    // Phase 4: High-Velocity Scroll Jumps & Jitter Thrashing
    // -------------------------------------------------------------
    console.log('\n[Phase 4] High-Velocity Scroll Jumps & Jitter Thrashing');

    // Fast repeated oscillations between Step 1 (jTop + 50) and Step 4 (jTop + 600)
    console.log('  -> Executing 20 high-frequency scroll oscillations (0ms-15ms interval)...');
    for (let i = 0; i < 20; i++) {
      const target = (i % 2 === 0) ? (jTop + 600) : (jTop + 50);
      await harness.evaluate(`window.scrollTo(0, ${target})`);
      if (i % 5 === 0) {
        await new Promise(r => setTimeout(r, 10));
      }
    }

    // Settle at Step 4
    await harness.scrollTo(jTop + 600);
    await new Promise(r => setTimeout(r, 250));
    const jitterSettle4 = await getVoyageState();
    assert('Post-Jitter Settle at Step 4: Correctly resolves to Chapter 4 without race condition',
      jitterSettle4.cards.every(c => c.isStacked) && jitterSettle4.bannerVisible && jitterSettle4.shipLeft === 100,
      jitterSettle4
    );

    // Settle at Step 1
    await harness.scrollTo(jTop + 50);
    await new Promise(r => setTimeout(r, 250));
    const jitterSettle1 = await getVoyageState();
    assert('Post-Jitter Settle at Step 1: Correctly resolves to Chapter 1 without corruption',
      jitterSettle1.cards[0].isStacked && !jitterSettle1.cards[1].isStacked && !jitterSettle1.bannerVisible && jitterSettle1.shipLeft <= 5,
      jitterSettle1
    );

    // -------------------------------------------------------------
    // Phase 5: Waypoint Clicks & Reverse Scroll Continuity
    // -------------------------------------------------------------
    console.log('\n[Phase 5] Waypoint Clicks & Reverse Scroll Continuity');

    // Click waypoint 3
    await harness.click('.voyage-waypoint[data-chapter="3"]');
    await new Promise(r => setTimeout(r, 250));
    const wp3State = await getVoyageState();
    assert('Waypoint 3 Click: Chapter 3 activated, ship at ~66.7%',
      wp3State.counterText.includes('Chapter 3') && wp3State.shipLeft >= 63 && wp3State.shipLeft <= 70,
      wp3State
    );

    // Now test reverse scroll after waypoint click:
    // If the user scrolls upward with wheel/touch or instant jump to hero:
    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 250));
    const wpReverseHero = await getVoyageState();
    assert('Post-Waypoint Scroll to Top: Correctly resets to Chapter 1 (ship <= 10%)',
      wpReverseHero.shipLeft <= 10 && wpReverseHero.counterText.includes('Chapter 1'),
      wpReverseHero
    );

    // Now test: Click waypoint 4, then scroll to Chapter 2 area (jTop + 220)
    // Does lockedWaypoint get cleared if wheel event is dispatched?
    await harness.click('.voyage-waypoint[data-chapter="4"]');
    await new Promise(r => setTimeout(r, 250));
    const wp4State = await getVoyageState();
    assert('Waypoint 4 Click: Chapter 4 activated, ship at 100%',
      wp4State.shipLeft === 100 && wp4State.bannerVisible,
      wp4State
    );

    // Dispatch wheel event and scroll to Chapter 2
    await harness.evaluate(`
      (() => {
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));
        window.scrollTo(0, ${jTop + 220});
      })()
    `);
    await new Promise(r => setTimeout(r, 250));
    const wheelRev2 = await getVoyageState();
    assert('Wheel scroll after Waypoint 4 unlocks lockedWaypoint and retreats to Chapter 2',
      wheelRev2.counterText.includes('Chapter 2') && wheelRev2.shipLeft >= 30 && wheelRev2.shipLeft <= 36 && !wheelRev2.bannerVisible,
      wheelRev2
    );

    // -------------------------------------------------------------
    // Phase 6: Responsive Viewports (Tablet 768px and Mobile 375px)
    // -------------------------------------------------------------
    console.log('\n[Phase 6] Responsive Scrubbing (Tablet 768px & Mobile 375px)');

    for (const [vpName, vpW, vpH] of [['Tablet', 768, 1024], ['Mobile', 375, 667]]) {
      console.log(`\n  -- Testing ${vpName} (${vpW}x${vpH}) --`);
      await harness.setViewport(vpW, vpH);
      await harness.scrollTo(0);
      await new Promise(r => setTimeout(r, 200));

      const vpJTop = await harness.evaluate(`
        (() => {
          const j = document.getElementById('journey');
          const r = j.getBoundingClientRect();
          return Math.round(r.top + window.scrollY);
        })()
      `);

      // Forward to Step 4 on mobile/tablet
      await harness.scrollTo(vpJTop + 650);
      await new Promise(r => setTimeout(r, 250));
      const vpS4 = await getVoyageState();
      assert(`${vpName}: Forward scroll reaches Chapter 4 with celebration banner`,
        vpS4.counterText.includes('Chapter 4') && vpS4.bannerVisible && vpS4.shipLeft === 100,
        vpS4
      );

      // Reverse to Step 1 on mobile/tablet
      await harness.scrollTo(vpJTop + 50);
      await new Promise(r => setTimeout(r, 250));
      const vpS1 = await getVoyageState();
      assert(`${vpName}: Reverse scroll un-accumulates to Chapter 1 (ship <= 10%)`,
        vpS1.counterText.includes('Chapter 1') && !vpS1.bannerVisible && vpS1.shipLeft <= 10,
        vpS1
      );

      // Verify sticky headroom below nav island
      const headroomOk = await harness.evaluate(`
        (() => {
          const dock = document.querySelector('.voyage-route-dock');
          const nav = document.querySelector('.nav-island') || document.querySelector('nav');
          if (!dock || !nav) return true;
          const dockTop = parseFloat(window.getComputedStyle(dock).top) || 0;
          return dockTop >= 50; // Dock maintains headroom clearance
        })()
      `);
      assert(`${vpName}: Route dock maintains sticky top clearance (top >= 50px)`,
        headroomOk,
        { headroomOk }
      );
    }

    // -------------------------------------------------------------
    // Phase 7: Audio Cooldown & Rapid Trigger Safety
    // -------------------------------------------------------------
    console.log('\n[Phase 7] Audio Cooldown & Rapid Trigger Safety');
    await harness.setViewport(1440, 900);
    const audioAudit = await harness.evaluate(`
      (() => {
        const cooldown = window.AUDIO_COOLDOWN;
        const hasScratch = typeof window.playPenScratch === 'function';
        const hasCoin = typeof window.playCoinAudio === 'function';

        let errorsCaught = [];
        try {
          // Trigger rapid scratch and coin audio repeatedly
          for (let i = 0; i < 10; i++) {
            if (hasScratch) window.playPenScratch();
            if (hasCoin) window.playCoinAudio();
          }
        } catch (e) {
          errorsCaught.push(e.message);
        }

        return {
          cooldown,
          hasScratch,
          hasCoin,
          errorsCaught
        };
      })()
    `);

    assert('Audio cooldown configured >= 200ms',
      audioAudit.cooldown >= 200,
      { cooldown: audioAudit.cooldown }
    );
    assert('Rapid audio triggers execute without throwing exceptions',
      audioAudit.errorsCaught.length === 0,
      { errors: audioAudit.errorsCaught }
    );

    // Summary
    console.log('\n===============================================================');
    console.log(`  M3 ADVERSARIAL STRESS RESULTS: ${report.passed} PASSED, ${report.failed} FAILED`);
    console.log('===============================================================');

  } catch (err) {
    console.error('Fatal stress harness error:', err);
    report.failed++;
    report.findings.push({ name: 'FATAL_ERROR', details: { message: err.message, stack: err.stack } });
  } finally {
    await harness.close();
  }

  process.exit(report.failed > 0 ? 1 : 0);
}

runM3AdversarialStress();
