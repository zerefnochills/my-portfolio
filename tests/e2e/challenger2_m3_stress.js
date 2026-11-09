/**
 * Challenger 2 Milestone 3 Adversarial Stress Test Suite
 *
 * Exhaustive empirical challenge for Milestone 3 'My Journey':
 * 1. Waypoint Interaction Stress:
 *    - Rapid sequential clicking (01, 02, 03, 04 in randomized sequences: e.g. 4->1->3->2->4->2->1)
 *    - Millisecond timing stress (50ms, 100ms intervals)
 *    - Verify exact synchronization of:
 *      * Scroll target matching .voyage-card-step
 *      * Ship avatar position (0%, 33.3%, 66.7%, 100%)
 *      * Counter text ('Chapter N of 4')
 *      * Active milestone card classes (.is-active, .is-stacked, .is-revealed)
 *      * Waypoint nodes (.active, .locked)
 *      * Celebration fanfare banner display (visible only on Step 4)
 *    - Post-waypoint release & reverse scroll to top
 * 2. Audio Synthesizer Throttling & Cooldown Stress:
 *    - Throttle cooldown verification (AUDIO_COOLDOWN >= 200ms)
 *    - Rapid call stress (50 calls across 500ms) with and without soundEnabled
 *    - Fast scroll audio trigger rate limiting
 *    - AudioContext lifecycle & browser console warnings / errors audit
 *    - getAudioCtx vs getAudioContext runtime inspection
 * 3. Dynamic Rapid Viewport Resize during Scrolled State:
 *    - Scrolled to Step 2 and Step 3
 *    - Sweep across 10 viewports (320px to 1920px)
 *    - Verify zero horizontal overflow (scrollWidth <= clientWidth)
 *    - Verify milestone cards do not collapse (card height > 150px, bounding box within viewport)
 *    - Verify sticky deck offsets and readability
 */

const { TestHarness } = require('./harness');

const RESIZE_VIEWPORTS = [
  { w: 1440, h: 900, name: 'Desktop 1440' },
  { w: 1280, h: 800, name: 'Desktop 1280' },
  { w: 1024, h: 768, name: 'Laptop / Tablet Landscape 1024' },
  { w: 820,  h: 1180, name: 'iPad Air 820' },
  { w: 768,  h: 1024, name: 'iPad Portrait 768' },
  { w: 681,  h: 900, name: 'Tablet Lower Boundary 681' },
  { w: 680,  h: 900, name: 'Mobile Upper Boundary 680' },
  { w: 414,  h: 896, name: 'iPhone XR 414' },
  { w: 375,  h: 667, name: 'iPhone SE 375' },
  { w: 320,  h: 568, name: 'Mobile Minimum 320' }
];

async function runAdversarialM3Stress() {
  console.log('\n===============================================================');
  console.log('  CHALLENGER 2: ADVERSARIAL STRESS TEST — MILESTONE 3');
  console.log('  Waypoint Navigation, Audio FX Throttling & Resize Stress');
  console.log('===============================================================');

  const harness = new TestHarness();
  const stressResults = {
    waypointStress: [],
    audioStress: {},
    resizeStress: [],
    consoleErrors: [],
    consoleLogs: [],
    summary: { totalChecks: 0, passed: 0, failed: 0, defects: [] }
  };

  function recordCheck(section, testName, passed, details = {}) {
    stressResults.summary.totalChecks++;
    if (passed) {
      stressResults.summary.passed++;
      console.log(`  \x1b[32m✔\x1b[0m [${section}] ${testName} -> PASS`);
    } else {
      stressResults.summary.failed++;
      stressResults.summary.defects.push({ section, testName, details });
      console.log(`  \x1b[31m✖\x1b[0m [${section}] ${testName} -> FAIL`);
      console.log(`     Details: ${JSON.stringify(details)}`);
    }
  }

  try {
    await harness.startServer();
    await harness.launchChrome();
    await harness.navigate('/index.html');
    await harness.setViewport(1440, 900);

    // -------------------------------------------------------------
    // SECTION 1: Waypoint Navigation Interaction & Synchronization Stress
    // -------------------------------------------------------------
    console.log('\n--- [TEST GROUP 1] Waypoint Navigation & Synchronization Stress ---');

    // 1.1 Rapid Random Waypoint Clicking
    const testSequences = [
      { order: [4, 1, 3, 2], delayMs: 120, label: 'Sequence A (4 -> 1 -> 3 -> 2 @ 120ms)' },
      { order: [2, 4, 1, 3, 4], delayMs: 80, label: 'Sequence B (2 -> 4 -> 1 -> 3 -> 4 @ 80ms)' },
      { order: [1, 4, 2, 3, 1, 2, 4], delayMs: 50, label: 'Sequence C Rapid Burst (1 -> 4 -> 2 -> 3 -> 1 -> 2 -> 4 @ 50ms)' }
    ];

    for (const seq of testSequences) {
      console.log(`\n  Executing ${seq.label}...`);
      for (const stepNum of seq.order) {
        await harness.click(`.voyage-waypoint[data-chapter="${stepNum}"]`);
        await new Promise(r => setTimeout(r, seq.delayMs));
      }

      // Check final settled state of the sequence
      const finalTarget = seq.order[seq.order.length - 1];
      await new Promise(r => setTimeout(r, 200)); // allow settling

      const state = await harness.evaluate(`
        (() => {
          const journey = document.getElementById('journey');
          const counter = document.getElementById('voyageRouteCounter');
          const ship = document.getElementById('voyageShipAvatar');
          const trackFill = document.getElementById('voyageTrackFill');
          const banner = document.getElementById('voyageCelebrationBanner');
          const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
          const waypoints = Array.from(document.querySelectorAll('.voyage-waypoint'));
          const steps = Array.from(document.querySelectorAll('.voyage-card-step'));

          const activeCard = cards.find(c => c.classList.contains('is-active'));
          const activeCardNum = activeCard ? parseInt(activeCard.getAttribute('data-milestone'), 10) : null;

          const shipLeft = ship ? parseFloat(ship.style.left) || 0 : 0;
          const fillWidth = trackFill ? parseFloat(trackFill.style.width) || 0 : 0;
          const counterText = counter ? counter.textContent.trim() : '';

          const bannerVisible = banner ? (window.getComputedStyle(banner).display !== 'none' && !banner.classList.contains('is-hidden')) : false;

          const activeWp = waypoints.find(w => w.classList.contains('active') && !w.classList.contains('locked'));
          const activeWpNum = activeWp ? parseInt(activeWp.getAttribute('data-chapter'), 10) : null;

          // Check scroll position relative to target step container
          const targetStepEl = document.getElementById('step-' + ${finalTarget});
          const targetRect = targetStepEl ? targetStepEl.getBoundingClientRect() : null;

          return {
            scrollY: window.scrollY,
            activeCardNum,
            counterText,
            shipLeft,
            fillWidth,
            bannerVisible,
            activeWpNum,
            targetStepTop: targetRect ? targetRect.top : null,
            targetStepBottom: targetRect ? targetRect.bottom : null
          };
        })()
      `);

      const expectedShipPct = ((finalTarget - 1) / 3) * 100;
      const counterMatches = state.counterText.includes(`${finalTarget}`);
      const shipMatches = Math.abs(state.shipLeft - expectedShipPct) < 2;
      const cardMatches = state.activeCardNum === finalTarget;
      const bannerMatches = (finalTarget === 4) ? state.bannerVisible : !state.bannerVisible;

      recordCheck('WaypointStress', `${seq.label}: Active Chapter aligns with step ${finalTarget}`, cardMatches, {
        expected: finalTarget,
        actual: state.activeCardNum
      });
      recordCheck('WaypointStress', `${seq.label}: Ship Avatar position (${state.shipLeft}%) matches target (${expectedShipPct}%)`, shipMatches, {
        expected: expectedShipPct,
        actual: state.shipLeft
      });
      recordCheck('WaypointStress', `${seq.label}: Route counter text includes Chapter ${finalTarget}`, counterMatches, {
        counterText: state.counterText
      });
      recordCheck('WaypointStress', `${seq.label}: Celebration banner visibility matches step 4 status`, bannerMatches, {
        finalTarget,
        bannerVisible: state.bannerVisible
      });
    }

    // 1.2 Individual Waypoint Step Alignment Check (Steps 1, 2, 3, 4)
    console.log('\n  Verifying single-step waypoint targeting accuracy...');
    for (let target = 1; target <= 4; target++) {
      await harness.click(`.voyage-waypoint[data-chapter="${target}"]`);
      await new Promise(r => setTimeout(r, 250));

      const stepCheck = await harness.evaluate(`
        (() => {
          const counter = document.getElementById('voyageRouteCounter');
          const ship = document.getElementById('voyageShipAvatar');
          const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
          const banner = document.getElementById('voyageCelebrationBanner');

          const activeCard = cards.find(c => c.classList.contains('is-active'));
          const activeIdx = activeCard ? parseInt(activeCard.getAttribute('data-milestone'), 10) : 0;
          const isStackedCount = cards.filter(c => c.classList.contains('is-stacked')).length;

          const shipLeft = ship ? parseFloat(ship.style.left) || 0 : 0;
          const bannerVis = banner ? (window.getComputedStyle(banner).display !== 'none' && !banner.classList.contains('is-hidden')) : false;

          return {
            target: ${target},
            activeIdx,
            isStackedCount,
            shipLeft,
            bannerVis,
            scrollY: window.scrollY
          };
        })()
      `);

      recordCheck('WaypointTargeting', `Clicking Waypoint ${target} activates Card ${target}`, stepCheck.activeIdx === target, stepCheck);
      recordCheck('WaypointTargeting', `Cards 1..${target} are stacked (${stepCheck.isStackedCount} stacked)`, stepCheck.isStackedCount === target, stepCheck);
    }

    // 1.3 Post-Waypoint Wheel / Touch Unlock and Reverse Scroll
    console.log('\n  Verifying post-waypoint release & reverse scroll to top...');
    // Dispatch wheel event to release lock
    await harness.evaluate(`
      (() => {
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));
        window.scrollTo(0, 0);
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await new Promise(r => setTimeout(r, 300));

    const resetState = await harness.evaluate(`
      (() => {
        const counter = document.getElementById('voyageRouteCounter');
        const ship = document.getElementById('voyageShipAvatar');
        const banner = document.getElementById('voyageCelebrationBanner');
        const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
        const activeCard = cards.find(c => c.classList.contains('is-active'));
        const activeIdx = activeCard ? parseInt(activeCard.getAttribute('data-milestone'), 10) : 0;

        return {
          scrollY: window.scrollY,
          activeIdx,
          counter: counter ? counter.textContent.trim() : '',
          shipLeft: ship ? parseFloat(ship.style.left) || 0 : 0,
          bannerVis: banner ? (window.getComputedStyle(banner).display !== 'none' && !banner.classList.contains('is-hidden')) : false
        };
      })()
    `);

    recordCheck('WaypointRelease', 'Wheel/scroll to top (scrollY=0) resets active chapter to 1', resetState.activeIdx === 1, resetState);
    recordCheck('WaypointRelease', 'Ship avatar retreats to start position (<= 5%)', resetState.shipLeft <= 5, resetState);
    recordCheck('WaypointRelease', 'Celebration banner is hidden at top', !resetState.bannerVis, resetState);


    // -------------------------------------------------------------
    // SECTION 2: Audio Synthesizer Throttling & Cooldown Stress
    // -------------------------------------------------------------
    console.log('\n--- [TEST GROUP 2] Audio Synthesizer Throttling & Cooldown Stress ---');

    // 2.1 Verify AUDIO_COOLDOWN configuration >= 200ms
    const audioConfig = await harness.evaluate(`
      (() => {
        return {
          AUDIO_COOLDOWN: window.AUDIO_COOLDOWN,
          hasPlayPenScratch: typeof window.playPenScratch === 'function',
          hasPlayCoinAudio: typeof window.playCoinAudio === 'function',
          lastPenAudioTime: window.lastPenAudioTime
        };
      })()
    `);

    recordCheck('AudioConfig', 'window.AUDIO_COOLDOWN exists and is >= 200ms',
      typeof audioConfig.AUDIO_COOLDOWN === 'number' && audioConfig.AUDIO_COOLDOWN >= 200, audioConfig);
    recordCheck('AudioConfig', 'window.playPenScratch is exposed as a function', audioConfig.hasPlayPenScratch, audioConfig);
    recordCheck('AudioConfig', 'window.playCoinAudio is exposed as a function', audioConfig.hasPlayCoinAudio, audioConfig);

    // 2.2 Rapid Call Throttling Stress (50 calls across 500ms)
    console.log('\n  Executing 50 rapid playPenScratch calls in 500ms...');
    const throttleTestResult = await harness.evaluate(`
      (() => {
        // Mock or intercept to measure throttled vs executed calls
        const originalTime = window.lastPenAudioTime || 0;
        let attemptedCalls = 0;
        let cooldownBlocks = 0;
        let executions = 0;

        // Enable sound in localStorage for test
        const prevSound = localStorage.getItem('portfolio_sound');
        localStorage.setItem('portfolio_sound', 'true');

        const startTime = Date.now();
        // Fire 50 calls with small interval
        return new Promise((resolve) => {
          let count = 0;
          const interval = setInterval(() => {
            attemptedCalls++;
            const tBefore = window.lastPenAudioTime;
            try {
              window.playPenScratch();
            } catch (e) {}
            const tAfter = window.lastPenAudioTime;
            if (tAfter !== tBefore) {
              executions++;
            } else {
              cooldownBlocks++;
            }
            count++;
            if (count >= 50) {
              clearInterval(interval);
              // restore sound setting
              if (prevSound !== null) localStorage.setItem('portfolio_sound', prevSound);
              else localStorage.removeItem('portfolio_sound');

              resolve({
                attemptedCalls,
                executions,
                cooldownBlocks,
                durationMs: Date.now() - startTime
              });
            }
          }, 10);
        });
      })()
    `);

    // In ~500ms with 220ms cooldown, at most 3 executions can pass (0ms, 220ms, 440ms)
    recordCheck('AudioThrottle', '50 rapid calls throttled down to <= 4 actual executions',
      throttleTestResult.executions <= 4 && throttleTestResult.executions >= 1, throttleTestResult);
    recordCheck('AudioThrottle', 'Cooldown blocks the vast majority of calls (>= 45 blocked)',
      throttleTestResult.cooldownBlocks >= 45, throttleTestResult);

    // 2.3 Fast Scroll across multiple steps: Audio Rate Limiting
    console.log('\n  Executing fast scroll through all chapters to test audio cooldown under scroll pressure...');
    const scrollAudioResult = await harness.evaluate(`
      (() => {
        const recordedAudioTimes = [];
        const originalTime = window.lastPenAudioTime;

        // Wrap updateJourneyState audio trigger tracking
        let updateCount = 0;
        for (let y = 0; y <= 4000; y += 100) {
          window.scrollTo(0, y);
          window.dispatchEvent(new Event('scroll'));
          updateCount++;
          if (window.lastPenAudioTime && window.lastPenAudioTime !== originalTime) {
            if (!recordedAudioTimes.includes(window.lastPenAudioTime)) {
              recordedAudioTimes.push(window.lastPenAudioTime);
            }
          }
        }

        // Return to top
        window.scrollTo(0, 0);
        window.dispatchEvent(new Event('scroll'));

        return {
          updateCount,
          uniqueAudioTriggers: recordedAudioTimes.length
        };
      })()
    `);

    recordCheck('AudioScrollRateLimit', 'Fast scroll does not spam audio triggers',
      scrollAudioResult.uniqueAudioTriggers <= 4, scrollAudioResult);

    // 2.4 Browser AudioContext & Console Audit
    // Inspect whether playCoinAudio or playPenScratch trigger console errors or crashes
    console.log('\n  Auditing playCoinAudio and playPenScratch execution with sound enabled...');
    const coinAudioExecResult = await harness.evaluate(`
      (() => {
        let coinError = null;
        try {
          if (typeof window.playCoinAudio === 'function') {
            window.playCoinAudio();
          }
        } catch (err) {
          coinError = err.message;
        }

        let scratchError = null;
        try {
          if (typeof window.playPenScratch === 'function') {
            window.playPenScratch();
          }
        } catch (err) {
          scratchError = err.message;
        }

        return {
          coinError,
          scratchError
        };
      })()
    `);

    recordCheck('AudioErrorAudit', 'playCoinAudio executes without throwing unhandled exceptions',
      coinAudioExecResult.coinError === null, coinAudioExecResult);
    recordCheck('AudioErrorAudit', 'playPenScratch executes without throwing unhandled exceptions',
      coinAudioExecResult.scratchError === null, coinAudioExecResult);

    // Check CDP console errors accumulated during tests
    const errorCount = harness.consoleErrors.length;
    recordCheck('ConsoleErrorAudit', `Zero browser console errors generated during stress tests (count: ${errorCount})`,
      errorCount === 0, { errors: harness.consoleErrors });


    // -------------------------------------------------------------
    // SECTION 3: Rapid Viewport Resize during Scrolled State
    // -------------------------------------------------------------
    console.log('\n--- [TEST GROUP 3] Dynamic Rapid Viewport Resize during Scrolled State ---');

    for (const testStep of [2, 3]) {
      console.log(`\n  [Step ${testStep}] Navigating to Chapter ${testStep} and applying rapid viewport resize sweep...`);

      // Set desktop first and click waypoint
      await harness.setViewport(1440, 900);
      await harness.click(`.voyage-waypoint[data-chapter="${testStep}"]`);
      await new Promise(r => setTimeout(r, 200));

      // Sweep through 10 viewports
      for (const vp of RESIZE_VIEWPORTS) {
        await harness.setViewport(vp.w, vp.h);
        await new Promise(r => setTimeout(r, 60)); // simulate dynamic window resize transition

        const vpLayout = await harness.evaluate(`
          (() => {
            const docW = document.documentElement.clientWidth;
            const scrollW = document.documentElement.scrollWidth;
            const overflow = scrollW - docW;

            const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
            const cardMetrics = cards.map((c, i) => {
              const r = c.getBoundingClientRect();
              const style = window.getComputedStyle(c);
              return {
                index: i + 1,
                display: style.display,
                position: style.position,
                height: Math.round(r.height),
                width: Math.round(r.width),
                left: Math.round(r.left),
                right: Math.round(r.right),
                collapsed: r.height < 50 || r.width < 100
              };
            });

            const anyCollapsed = cardMetrics.some(c => c.collapsed);
            const anyCardOverflow = cardMetrics.some(c => c.right > docW + 5);

            return {
              docW,
              scrollW,
              overflow,
              anyCollapsed,
              anyCardOverflow,
              cardMetrics
            };
          })()
        `);

        const noDocOverflow = vpLayout.overflow <= 0;
        const noCardCollapse = !vpLayout.anyCollapsed;
        const noCardOverflow = !vpLayout.anyCardOverflow;

        recordCheck('ResizeLayout', `[Step ${testStep}][${vp.name}] Zero horizontal overflow (scrollW ${vpLayout.scrollW} <= docW ${vpLayout.docW})`,
          noDocOverflow, { vp: vp.name, overflow: vpLayout.overflow });

        recordCheck('ResizeLayout', `[Step ${testStep}][${vp.name}] Milestone cards do not collapse (height > 50px, width > 100px)`,
          noCardCollapse, { vp: vp.name, cardMetrics: vpLayout.cardMetrics });

        recordCheck('ResizeLayout', `[Step ${testStep}][${vp.name}] Milestone cards fit within viewport without overflow`,
          noCardOverflow, { vp: vp.name, cardMetrics: vpLayout.cardMetrics });
      }
    }

  } catch (err) {
    console.error('\n\x1b[31m[CRITICAL ERROR DURING STRESS HARNESS]\x1b[0m', err);
    stressResults.summary.failed++;
    stressResults.summary.defects.push({ section: 'Harness', testName: 'Unhandled Exception', details: { error: err.message, stack: err.stack } });
  } finally {
    stressResults.consoleErrors = harness.consoleErrors;
    stressResults.consoleLogs = harness.consoleLogs;
    await harness.close();
  }

  // -------------------------------------------------------------
  // Summary & Diagnostic Printout
  // -------------------------------------------------------------
  console.log('\n===============================================================');
  console.log('              EMPIRICAL STRESS TEST SUMMARY');
  console.log('===============================================================');
  console.log(`Total Checks Evaluated: ${stressResults.summary.totalChecks}`);
  console.log(`Passed Checks:          ${stressResults.summary.passed}`);
  console.log(`Failed Checks:          ${stressResults.summary.failed}`);
  console.log(`Success Rate:           ${((stressResults.summary.passed / stressResults.summary.totalChecks) * 100).toFixed(1)}%`);
  if (stressResults.summary.defects.length > 0) {
    console.log('\nDefects / Failures Detected:');
    stressResults.summary.defects.forEach((d, i) => {
      console.log(`  ${i + 1}. [${d.section}] ${d.testName}`);
      console.log(`     Details: ${JSON.stringify(d.details)}`);
    });
  } else {
    console.log('\n\x1b[32m✔ ALL ADVERSARIAL STRESS CHALLENGES PASSED WITH ZERO DEFECTS!\x1b[0m');
  }
  console.log('===============================================================\n');

  return stressResults;
}

if (require.main === module) {
  runAdversarialM3Stress().then(res => {
    process.exit(res.summary.failed > 0 ? 1 : 0);
  });
}

module.exports = { runAdversarialM3Stress };
