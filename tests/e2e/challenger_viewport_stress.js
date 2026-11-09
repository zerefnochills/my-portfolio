/**
 * Adversarial Challenger 1 Test Suite: Viewport Stress, Boundary Exhaustion,
 * Continuous Resize Sweeps, Lateral Drag Resistance, and Focus Traversal Lockout.
 *
 * Applicable for Milestone 1: Layout Shift & Proportion Correction.
 */

const { TestHarness } = require('./harness');
const path = require('path');

const TARGET_VIEWPORTS = [
  { width: 320,  height: 568,  name: 'iPhone 5/SE1 (Extreme Compact Mobile)' },
  { width: 360,  height: 640,  name: 'Galaxy S8 / Android Compact Baseline' },
  { width: 390,  height: 844,  name: 'iPhone 12/13/14 Standard' },
  { width: 414,  height: 896,  name: 'iPhone Plus / XR Max Mobile' },
  { width: 720,  height: 1280, name: 'Split-Screen / Small Tablet' },
  { width: 800,  height: 1280, name: 'Surface Go / Android 800px Tablet Portrait' },
  { width: 834,  height: 1194, name: 'iPad Pro 10.5/11 inch Portrait' },
  { width: 992,  height: 800,  name: 'Bootstrap Large Tablet / Desktop Boundary' },
  { width: 1200, height: 900,  name: 'Laptop Standard / Sub-1400 Margin Boundary' },
  { width: 1600, height: 1000, name: 'Large Desktop QHD' },
  { width: 2560, height: 1440, name: 'Ultra-Wide 4K / QHD+ Monitor' }
];

const SWEEP_BREAKPOINTS = [
  2560, 2100, 1920, 1600, 1440, 1401, 1400, 1399, 1280, 1241,
  1240, 1239, 1025, 1024, 1023, 992, 834, 821, 820, 819,
  800, 769, 768, 767, 720, 681, 680, 679, 500, 414,
  390, 360, 320
];

class ChallengerReporter {
  constructor() {
    this.results = [];
  }

  assert(category, testName, condition, details = {}) {
    const passed = Boolean(condition);
    this.results.push({ category, testName, passed, details });
    const icon = passed ? '\x1b[32m✔ PASS\x1b[0m' : '\x1b[31m✖ FAIL\x1b[0m';
    console.log(`  [${category}] ${icon} ${testName}`);
    if (!passed) {
      console.log(`     \x1b[33mDiagnostics:\x1b[0m ${JSON.stringify(details)}`);
    }
    return passed;
  }

  summary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    return {
      total,
      passed,
      failed,
      verdict: failed === 0 ? 'APPROVE' : 'REQUEST_CHANGES',
      failures: this.results.filter(r => !r.passed)
    };
  }
}

async function runAdversarialSuite() {
  console.log('\n======================================================');
  console.log('  CHALLENGER 1: ADVERSARIAL VIEWPORT & STRESS SUITE');
  console.log('  Target: Milestone 1 Layout Shift & Viewport Correctness');
  console.log('======================================================\n');

  const harness = new TestHarness(path.resolve(__dirname, '../..'));
  const reporter = new ChallengerReporter();

  try {
    const port = await harness.startServer();
    console.log(`[INIT] Static HTTP server listening on port ${port}`);
    await harness.launchChrome();
    console.log(`[INIT] Headless Chrome connected via CDP on port ${harness.cdpPort}\n`);

    const pagesToTest = [
      { name: 'Canonical index.html', path: '/index.html' },
      { name: 'Release Artifact Your Name – Portfolio.html', path: '/Your%20Name%20%E2%80%93%20Portfolio.html' }
    ];

    for (const page of pagesToTest) {
      console.log(`\n========================================`);
      console.log(`  TESTING PAGE: ${page.name}`);
      console.log(`========================================\n`);

      // ---------------------------------------------------------
      // SECTION 1: Extreme & Non-Standard Viewport Exhaustion (11 Viewports)
      // ---------------------------------------------------------
      console.log(`-- SECTION 1: Discrete Viewport Boundary Exhaustion --`);
      for (const vp of TARGET_VIEWPORTS) {
        await harness.setViewport(vp.width, vp.height);
        await harness.navigate(page.path);

        const measurements = await harness.evaluate(`
          (() => {
            const docEl = document.documentElement;
            const body = document.body;
            const docW = docEl.clientWidth;
            const scrollW = docEl.scrollWidth;
            const bodyScrollW = body.scrollWidth;
            const delta = scrollW - docW;
            const scrollX = window.scrollX || window.pageXOffset || 0;

            const main = document.querySelector('main');
            const mainRect = main ? main.getBoundingClientRect() : null;
            let leftSpace = 0;
            let rightSpace = 0;
            let centerDelta = 0;
            if (mainRect) {
              leftSpace = Math.round(mainRect.left);
              rightSpace = Math.round(docW - mainRect.right);
              centerDelta = Math.abs(leftSpace - rightSpace);
            }

            // Coffee stain boundary
            const coffee = document.querySelector('.coffee-stain');
            let coffeeOverflow = 0;
            if (coffee) {
              const cr = coffee.getBoundingClientRect();
              coffeeOverflow = Math.max(0, Math.round(cr.right - docW));
            }

            // Nav island boundary
            const nav = document.querySelector('.nav-island');
            let navOverflow = 0;
            if (nav) {
              const nr = nav.getBoundingClientRect();
              navOverflow = Math.max(0, Math.round(nr.right - docW));
            }

            // Ticker container boundary
            const ticker = document.querySelector('.skills-ticker-tape');
            let tickerCausesOverflow = false;
            let tickerRight = 0;
            if (ticker) {
              const tr = ticker.getBoundingClientRect();
              tickerRight = Math.round(tr.right);
            }

            // Margin doodles visibility check
            const doodles = document.querySelectorAll('.side');
            let doodlesVisible = false;
            doodles.forEach(d => {
              const st = window.getComputedStyle(d);
              if (st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity) > 0.05) {
                doodlesVisible = true;
              }
            });

            // Ribbons collision check against hero text and buttons
            const ribbons = Array.from(document.querySelectorAll('.irl-ribbon-btn, .sketchbook-ribbon-btn'));
            const heroTextElements = Array.from(document.querySelectorAll('.hero-title, .hero h1, .hero-bio, .hero-actions, .cta-btn, .primary-cta'));
            let ribbonHeroOverlap = false;
            let overlappingRibbon = null;

            ribbons.forEach(rib => {
              const rr = rib.getBoundingClientRect();
              const rStyle = window.getComputedStyle(rib);
              if (rStyle.display !== 'none' && rStyle.visibility !== 'hidden') {
                heroTextElements.forEach(ht => {
                  const hr = ht.getBoundingClientRect();
                  const hStyle = window.getComputedStyle(ht);
                  if (hStyle.display !== 'none' && hStyle.visibility !== 'hidden') {
                    const xOverlap = Math.max(0, Math.min(rr.right, hr.right) - Math.max(rr.left, hr.left));
                    const yOverlap = Math.max(0, Math.min(rr.bottom, hr.bottom) - Math.max(rr.top, hr.top));
                    if (xOverlap > 4 && yOverlap > 4) {
                      ribbonHeroOverlap = true;
                      overlappingRibbon = { ribbon: rib.className, element: ht.className || ht.tagName, xOverlap, yOverlap };
                    }
                  }
                });
              }
            });

            return {
              docW,
              scrollW,
              bodyScrollW,
              delta,
              scrollX,
              mainWidth: mainRect ? Math.round(mainRect.width) : 0,
              leftSpace,
              rightSpace,
              centerDelta,
              coffeeOverflow,
              navOverflow,
              tickerRight,
              doodlesVisible,
              ribbonHeroOverlap,
              overlappingRibbon
            };
          })()
        `);

        // Check 1: Zero horizontal delta (scrollWidth - clientWidth <= 0)
        reporter.assert(
          'V1-Boundary',
          `[${vp.width}px - ${vp.name}] scrollWidth - clientWidth <= 0 (Zero Overflow)`,
          measurements.delta <= 0,
          {
            viewport: vp.width,
            docW: measurements.docW,
            scrollW: measurements.scrollW,
            delta: measurements.delta
          }
        );

        // Check 2: Initial window.scrollX == 0
        reporter.assert(
          'V1-Boundary',
          `[${vp.width}px - ${vp.name}] window.scrollX is locked at 0`,
          measurements.scrollX === 0,
          { scrollX: measurements.scrollX }
        );

        // Check 3: Container centering (when docW exceeds main max-width 1160px)
        if (measurements.docW >= 1200) {
          reporter.assert(
            'V1-Centering',
            `[${vp.width}px - ${vp.name}] <main> content centered within 4px tolerance`,
            measurements.centerDelta <= 4,
            { leftSpace: measurements.leftSpace, rightSpace: measurements.rightSpace, delta: measurements.centerDelta }
          );
        }

        // Check 4: Coffee stain does not spill off-screen
        reporter.assert(
          'V1-Components',
          `[${vp.width}px - ${vp.name}] Coffee stain graphic completely within screen`,
          measurements.coffeeOverflow === 0,
          { coffeeOverflow: measurements.coffeeOverflow }
        );

        // Check 5: Nav island stays within bounds
        reporter.assert(
          'V1-Components',
          `[${vp.width}px - ${vp.name}] Navigation bar island stays within screen width`,
          measurements.navOverflow === 0,
          { navOverflow: measurements.navOverflow }
        );

        // Check 6: Floating ribbons do not collide with hero text/buttons
        reporter.assert(
          'V1-Occlusion',
          `[${vp.width}px - ${vp.name}] Floating ribbons do not occlude hero text or CTAs`,
          !measurements.ribbonHeroOverlap,
          { collision: measurements.overlappingRibbon }
        );

        // Check 7: Doodles threshold check (< 1400px MUST be hidden; >= 1400px may be visible)
        if (vp.width < 1400) {
          reporter.assert(
            'V1-Doodles',
            `[${vp.width}px - ${vp.name}] Margin doodles hidden below 1400px threshold`,
            !measurements.doodlesVisible,
            { doodlesVisible: measurements.doodlesVisible }
          );
        }
      }

      // ---------------------------------------------------------
      // SECTION 2: Dynamic Continuous Resize Sweeps
      // ---------------------------------------------------------
      console.log(`\n-- SECTION 2: Dynamic Continuous Resize Sweeps --`);
      await harness.navigate(page.path);

      // 2A. Downward Sweep (2560px -> 320px across 33 breakpoints)
      let downwardOverflowCount = 0;
      let downwardFailures = [];
      for (const w of SWEEP_BREAKPOINTS) {
        await harness.setViewport(w, 800);
        await new Promise(r => setTimeout(r, 40));
        const res = await harness.evaluate(`
          (() => {
            const d = document.documentElement;
            return {
              w: ${w},
              scrollW: d.scrollWidth,
              clientW: d.clientWidth,
              delta: d.scrollWidth - d.clientWidth,
              scrollX: window.scrollX || 0
            };
          })()
        `);
        if (res.delta > 0 || res.scrollX > 0) {
          downwardOverflowCount++;
          downwardFailures.push(res);
        }
      }

      reporter.assert(
        'V2-ResizeSweep',
        `Downward dynamic resize sweep (2560px -> 320px across ${SWEEP_BREAKPOINTS.length} breakpoints): Zero overflow`,
        downwardOverflowCount === 0,
        { overflowOccurrences: downwardOverflowCount, sampleFailures: downwardFailures.slice(0, 3) }
      );

      // 2B. Upward Sweep (320px -> 2560px across reversed breakpoints)
      let upwardOverflowCount = 0;
      let upwardFailures = [];
      const reversedBreakpoints = [...SWEEP_BREAKPOINTS].reverse();
      for (const w of reversedBreakpoints) {
        await harness.setViewport(w, 800);
        await new Promise(r => setTimeout(r, 40));
        const res = await harness.evaluate(`
          (() => {
            const d = document.documentElement;
            return {
              w: ${w},
              scrollW: d.scrollWidth,
              clientW: d.clientWidth,
              delta: d.scrollWidth - d.clientWidth,
              scrollX: window.scrollX || 0
            };
          })()
        `);
        if (res.delta > 0 || res.scrollX > 0) {
          upwardOverflowCount++;
          upwardFailures.push(res);
        }
      }

      reporter.assert(
        'V2-ResizeSweep',
        `Upward dynamic resize sweep (320px -> 2560px across ${reversedBreakpoints.length} breakpoints): Zero overflow`,
        upwardOverflowCount === 0,
        { overflowOccurrences: upwardOverflowCount, sampleFailures: upwardFailures.slice(0, 3) }
      );

      // 2C. High-Frequency Breakpoint Hysteresis (670px <-> 690px x 10 cycles)
      let hysteresis680Errors = 0;
      for (let i = 0; i < 10; i++) {
        await harness.setViewport(670, 750);
        await new Promise(r => setTimeout(r, 20));
        await harness.setViewport(690, 750);
        await new Promise(r => setTimeout(r, 20));
        const hRes = await harness.evaluate(`
          (() => {
            const d = document.documentElement;
            return d.scrollWidth - d.clientWidth;
          })()
        `);
        if (hRes > 0) hysteresis680Errors++;
      }
      reporter.assert(
        'V2-ResizeHysteresis',
        `Mobile/Tablet 680px breakpoint oscillation (10 rapid cycles): Zero overflow`,
        hysteresis680Errors === 0,
        { errors: hysteresis680Errors }
      );

      // 2D. High-Frequency Doodle Breakpoint Hysteresis (1390px <-> 1410px x 10 cycles)
      let hysteresis1400Errors = 0;
      for (let i = 0; i < 10; i++) {
        await harness.setViewport(1390, 900);
        await new Promise(r => setTimeout(r, 20));
        await harness.setViewport(1410, 900);
        await new Promise(r => setTimeout(r, 20));
        const dRes = await harness.evaluate(`
          (() => {
            const d = document.documentElement;
            return d.scrollWidth - d.clientWidth;
          })()
        `);
        if (dRes > 0) hysteresis1400Errors++;
      }
      reporter.assert(
        'V2-ResizeHysteresis',
        `Desktop doodle 1400px breakpoint oscillation (10 rapid cycles): Zero overflow`,
        hysteresis1400Errors === 0,
        { errors: hysteresis1400Errors }
      );

      // ---------------------------------------------------------
      // SECTION 3: Lateral Drag & Pan Lockout Tests
      // ---------------------------------------------------------
      console.log(`\n-- SECTION 3: Lateral Drag & Scroll Lockout Tests --`);
      await harness.setViewport(375, 812);
      await harness.navigate(page.path);

      // 3A. Programmatic window.scrollTo(1000, 0)
      const scrollAttempt1 = await harness.evaluate(`
        (() => {
          window.scrollTo(1000, 0);
          return window.scrollX || window.pageXOffset || 0;
        })()
      `);
      reporter.assert(
        'V3-ScrollLockout',
        `Programmatic window.scrollTo(1000, 0) is locked to 0`,
        scrollAttempt1 === 0,
        { actualScrollX: scrollAttempt1 }
      );

      // 3B. Programmatic documentElement.scrollLeft = 500
      const scrollAttempt2 = await harness.evaluate(`
        (() => {
          document.documentElement.scrollLeft = 500;
          return document.documentElement.scrollLeft;
        })()
      `);
      reporter.assert(
        'V3-ScrollLockout',
        `Programmatic documentElement.scrollLeft = 500 is locked to 0`,
        scrollAttempt2 === 0,
        { actualScrollLeft: scrollAttempt2 }
      );

      // 3C. Programmatic body.scrollLeft = 500
      const scrollAttempt3 = await harness.evaluate(`
        (() => {
          document.body.scrollLeft = 500;
          return document.body.scrollLeft;
        })()
      `);
      reporter.assert(
        'V3-ScrollLockout',
        `Programmatic body.scrollLeft = 500 is locked to 0`,
        scrollAttempt3 === 0,
        { actualBodyScrollLeft: scrollAttempt3 }
      );

      // 3D. Physical CDP Mouse Drag Emulation
      await harness.send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: 300,
        y: 400,
        button: 'left',
        clickCount: 1
      });
      for (let stepX = 280; stepX >= 50; stepX -= 30) {
        await harness.send('Input.dispatchMouseEvent', {
          type: 'mouseMoved',
          x: stepX,
          y: 400,
          button: 'left'
        });
        await new Promise(r => setTimeout(r, 10));
      }
      await harness.send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: 50,
        y: 400,
        button: 'left'
      });
      await new Promise(r => setTimeout(r, 100));

      const mouseDragScrollX = await harness.evaluate(`window.scrollX || 0`);
      reporter.assert(
        'V3-ScrollLockout',
        `Simulated horizontal mouse drag gesture does not pan viewport`,
        mouseDragScrollX === 0,
        { actualScrollX: mouseDragScrollX }
      );

      // 3E. Physical CDP Touch Drag Emulation
      await harness.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: 320, y: 350, id: 1 }]
      });
      for (let stepX = 280; stepX >= 40; stepX -= 40) {
        await harness.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: stepX, y: 350, id: 1 }]
        });
        await new Promise(r => setTimeout(r, 10));
      }
      await harness.send('Input.dispatchTouchEvent', {
        type: 'touchEnd',
        touchPoints: []
      });
      await new Promise(r => setTimeout(r, 100));

      const touchDragScrollX = await harness.evaluate(`window.scrollX || 0`);
      reporter.assert(
        'V3-ScrollLockout',
        `Simulated horizontal touch drag gesture does not pan viewport`,
        touchDragScrollX === 0,
        { actualScrollX: touchDragScrollX }
      );

      // ---------------------------------------------------------
      // SECTION 4: Focus Traversal & Off-Screen Element Auto-Scroll Attack
      // ---------------------------------------------------------
      console.log(`\n-- SECTION 4: Focus Traversal Auto-Scroll Resistance --`);
      const focusTraversalResult = await harness.evaluate(`
        (() => {
          const focusable = Array.from(document.querySelectorAll('a, button, input, [tabindex]'));
          let maxScrollXObserved = 0;
          let triggeringElement = null;

          for (const el of focusable) {
            try {
              el.focus();
              const sx = window.scrollX || window.pageXOffset || 0;
              if (sx > maxScrollXObserved) {
                maxScrollXObserved = sx;
                triggeringElement = el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + el.className : '');
              }
            } catch (e) {}
          }

          return {
            focusableCount: focusable.length,
            maxScrollXObserved,
            triggeringElement
          };
        })()
      `);

      reporter.assert(
        'V4-FocusSecurity',
        `Sequential focus traversal through all (${focusTraversalResult.focusableCount}) focusable elements does not cause horizontal blowout`,
        focusTraversalResult.maxScrollXObserved === 0,
        { maxScrollX: focusTraversalResult.maxScrollXObserved, element: focusTraversalResult.triggeringElement }
      );
    }

    const summary = reporter.summary();
    console.log('\n======================================================');
    console.log(`  CHALLENGER 1 ADVERSARIAL VERDICT: ${summary.verdict}`);
    console.log(`  Total Invariant Assertions: ${summary.total}`);
    console.log(`  Passed: ${summary.passed}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log('======================================================\n');

    return summary;
  } finally {
    await harness.close();
  }
}

if (require.main === module) {
  runAdversarialSuite()
    .then(summary => {
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(err => {
      console.error('Adversarial Test Suite Error:', err);
      process.exit(2);
    });
}

module.exports = { runAdversarialSuite };
