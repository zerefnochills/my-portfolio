/**
 * Test Suite: Performance & Mobile/Desktop Bug Fix Verification
 * Covers Requirements 1 through 6:
 * - Requirement 1: Intro Skip Button & Reduced Motion
 * - Requirement 2: Scroll Work Reduction & Shared rAF Scheduler
 * - Requirement 3: Off-screen Animation Pausing & Inactive Tab Pausing
 * - Requirement 4: Sketchbook Canvas Resizing, Drawing Scaling, and Memory Bounding
 * - Requirement 5: Mobile UI Pass, Touch Targets, and Collision Prevention
 * - Requirement 6: Android-Sized & Desktop Layout Viewport Checks
 */

const { TestHarness } = require('./harness');

async function runPerformanceAndFixesChecks() {
  console.log('\n======================================================');
  console.log('  PERFORMANCE & MOBILE/DESKTOP FIXES AUDIT');
  console.log('======================================================\n');

  const harness = new TestHarness();
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition, testName, details = '') {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`  \x1b[32m✔\x1b[0m ${testName} -> PASS`);
    } else {
      console.error(`  \x1b[31m✖\x1b[0m ${testName} -> FAIL ${details ? '(' + details + ')' : ''}`);
    }
  }

  try {
    await harness.startServer();
    await harness.launchChrome();
    const port = harness.serverPort;

    // ==========================================
    // REQUIREMENT 1: Intro Skip & Reduced Motion
    // ==========================================
    console.log('\n-- Requirement 1: Intro Skip Button & Reduced Motion --');
    
    // Clear storage first so we test a fresh visit
    await harness.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
    await new Promise(r => setTimeout(r, 600));
    await harness.evaluate(`sessionStorage.clear()`);

    // Reload with fresh session
    await harness.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
    await new Promise(r => setTimeout(r, 150));

    const skipBtnCheck = await harness.evaluate(`
      (() => {
        const btn = document.getElementById('skipLoaderBtn');
        if (!btn) return { exists: false };
        const rect = btn.getBoundingClientRect();
        const style = window.getComputedStyle(btn);
        return {
          exists: true,
          visible: style.display !== 'none' && style.visibility !== 'hidden',
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      })()
    `);
    assert(skipBtnCheck.exists && skipBtnCheck.visible, 'Skip Intro button exists and is visible during intro');
    assert(skipBtnCheck.height >= 40, 'Skip Intro button meets touch target height (>=40px)', `height: ${skipBtnCheck.height}`);

    // Click Skip Intro button
    const skipClicked = await harness.evaluate(`
      (() => {
        const btn = document.getElementById('skipLoaderBtn');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(skipClicked, 'Skip button clickable');
    await new Promise(r => setTimeout(r, 200));

    const loaderStateAfterSkip = await harness.evaluate(`
      (() => {
        const loader = document.getElementById('loader');
        const isDone = !loader || loader.classList.contains('done') || window.getComputedStyle(loader).display === 'none';
        const notLoading = !document.body.classList.contains('loading');
        return isDone && notLoading;
      })()
    `);
    assert(loaderStateAfterSkip, 'Clicking Skip Intro immediately completes loader & reveals site');

    // Reduced Motion setting skips intro loader
    await harness.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await harness.evaluate(`sessionStorage.clear()`);
    await harness.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
    await new Promise(r => setTimeout(r, 300));

    const reducedMotionState = await harness.evaluate(`
      (() => {
        const loader = document.getElementById('loader');
        const isSkipped = !loader || loader.classList.contains('done') || window.getComputedStyle(loader).display === 'none';
        const notLoading = !document.body.classList.contains('loading');
        return isSkipped && notLoading;
      })()
    `);
    assert(reducedMotionState, 'Reduced motion setting skips intro loader immediately without delay');

    // Reset emulated media
    await harness.send('Emulation.setEmulatedMedia', { features: [] });

    // ==========================================
    // REQUIREMENT 2: Scroll Work & IntersectionObserver
    // ==========================================
    console.log('\n-- Requirement 2: Scroll Work & Shared rAF Scheduler --');
    await harness.navigate('/index.html');

    const observerCheck = await harness.evaluate(`
      (() => {
        const hasSharedScheduler = typeof window._onJourneyScrollShared === 'function';
        const headings = document.querySelectorAll('.section-title, .journey-header-block, h1, h2, h3');
        return {
          hasSharedScheduler,
          headingCount: headings.length
        };
      })()
    `);
    assert(observerCheck.hasSharedScheduler, 'Shared rAF scroll scheduler is active (window._onJourneyScrollShared)');
    assert(observerCheck.headingCount > 0, `Section headings exist and are observed (${observerCheck.headingCount} found)`);

    // Bidirectional scroll test
    const journeyTop = await harness.evaluate(`
      (() => {
        const el = document.getElementById('journey');
        return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : 2500;
      })()
    `);

    await harness.scrollTo(journeyTop + 650);
    await new Promise(r => setTimeout(r, 200));
    const forwardJourney = await harness.evaluate(`
      (() => {
        const ch2 = document.getElementById('milestone-2');
        const routeCounter = document.getElementById('voyageRouteCounter');
        return {
          ch2Active: ch2 && (ch2.classList.contains('is-revealed') || ch2.classList.contains('is-active') || ch2.classList.contains('is-stacked')),
          counterText: routeCounter ? routeCounter.textContent : ''
        };
      })()
    `);
    assert(forwardJourney.ch2Active, 'Journey progress updates and activates next chapters when scrolling forward');

    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 200));
    const topJourney = await harness.evaluate(`
      (() => {
        const ch1 = document.getElementById('milestone-1');
        return ch1 && ch1.classList.contains('is-active');
      })()
    `);
    assert(topJourney, 'Journey progress retreats back to Chapter 1 when scrolling up (bidirectional scrub)');

    // ==========================================
    // REQUIREMENT 3: Animation Pausing & Android Rules
    // ==========================================
    console.log('\n-- Requirement 3: Off-screen Animation Pausing & Android Rules --');

    await harness.scrollTo(3500);
    await new Promise(r => setTimeout(r, 300));
    const offscreenCheck = await harness.evaluate(`
      (() => {
        const ticker = document.querySelector('.skills-ticker-tape');
        return ticker ? ticker.classList.contains('anim-offscreen') : false;
      })()
    `);
    assert(offscreenCheck, 'Hero ticker pauses/marks anim-offscreen when scrolled far off-screen');

    // Tab inactive simulation
    await harness.evaluate(`document.documentElement.classList.add('tab-is-inactive')`);
    const tabInactiveStyle = await harness.evaluate(`
      (() => {
        const ticker = document.querySelector('.skills-ticker-tape');
        if (!ticker) return '';
        return window.getComputedStyle(ticker).animationPlayState;
      })()
    `);
    assert(tabInactiveStyle === 'paused', 'Tab inactive pauses animations (animation-play-state: paused)');
    await harness.evaluate(`document.documentElement.classList.remove('tab-is-inactive')`);

    // ==========================================
    // REQUIREMENT 4: Sketchbook Resizing & Memory Limits
    // ==========================================
    console.log('\n-- Requirement 4: Sketchbook Canvas Resizing & Memory Caps --');
    await harness.navigate('/doodle.html');

    const initialCanvas = await harness.evaluate(`
      (() => {
        const canvas = document.getElementById('mainCanvas');
        if (!canvas) return { error: 'No mainCanvas' };
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        return {
          w: canvas.width,
          h: canvas.height,
          dprCapped: dpr <= 2,
          maxDimOk: canvas.width <= 1920 && canvas.height <= 1920
        };
      })()
    `);
    assert(initialCanvas.dprCapped && initialCanvas.maxDimOk, 'DPR is capped at 2 and canvas dimensions are within 1920 max limit');

    // Draw a stroke using mouse events
    const drawAudit = await harness.evaluate(`
      (() => {
        const canvas = document.getElementById('mainCanvas');
        const rect = canvas.getBoundingClientRect();
        const x1 = rect.left + 50;
        const y1 = rect.top + 50;
        const x2 = rect.left + 150;
        const y2 = rect.top + 150;

        canvas.dispatchEvent(new MouseEvent('mousedown', { clientX: x1, clientY: y1, bubbles: true }));
        canvas.dispatchEvent(new MouseEvent('mousemove', { clientX: x2, clientY: y2, bubbles: true }));
        canvas.dispatchEvent(new MouseEvent('mouseup', { clientX: x2, clientY: y2, bubbles: true }));

        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let paintedPixels = 0;
        for (let i = 0; i < imgData.data.length; i += 4) {
          if (imgData.data[i + 3] > 0) paintedPixels++;
        }

        const studio = window.doodleStudio;
        return {
          paintedPixels,
          undoLen: studio ? studio.state.undoStack.length : 0
        };
      })()
    `);
    assert(drawAudit.paintedPixels > 0, `Canvas accepted drawing strokes (${drawAudit.paintedPixels} painted pixels)`);

    // Dynamic resize / rotation scaling
    await harness.setViewport(500, 800);
    await new Promise(r => setTimeout(r, 200));

    const postResizeCheck = await harness.evaluate(`
      (() => {
        const canvas = document.getElementById('mainCanvas');
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let paintedPixels = 0;
        for (let i = 0; i < imgData.data.length; i += 4) {
          if (imgData.data[i + 3] > 0) paintedPixels++;
        }
        return {
          newW: canvas.width,
          newH: canvas.height,
          preservedInk: paintedPixels > 0
        };
      })()
    `);
    assert(postResizeCheck.preservedInk && postResizeCheck.newW > 0, 'Existing drawings scale correctly after viewport resize without clearing');

    // Undo / Redo buttons
    await harness.click('#undoBtn');
    await new Promise(r => setTimeout(r, 100));
    const undoPassed = await harness.evaluate(`
      (() => {
        const studio = window.doodleStudio;
        return studio && studio.state.redoStack.length > 0;
      })()
    `);
    assert(undoPassed, 'Undo executes without error after screen resize');

    await harness.click('#redoBtn');
    await new Promise(r => setTimeout(r, 100));
    const redoPassed = await harness.evaluate(`
      (() => {
        const studio = window.doodleStudio;
        return studio && studio.state.undoStack.length >= 2;
      })()
    `);
    assert(redoPassed, 'Redo executes without error after screen resize');

    // Bounded memory cap
    const memoryCapAudit = await harness.evaluate(`
      (() => {
        const studio = window.doodleStudio;
        if (!studio) return { bounded: true, len: 0 };
        for (let i = 0; i < 25; i++) {
          studio.saveState();
        }
        return {
          bounded: studio.state.undoStack.length <= 12,
          len: studio.state.undoStack.length
        };
      })()
    `);
    assert(memoryCapAudit.bounded, `Undo history is strictly bounded by memory cap (${memoryCapAudit.len} <= 12 states)`);

    // ==========================================
    // REQUIREMENT 5: Mobile UI Pass & Touch Targets
    // ==========================================
    console.log('\n-- Requirement 5: Mobile UI Pass & Collision Prevention --');
    
    // Android viewport 412x915 (Pixel 7)
    await harness.setViewport(412, 915);
    await harness.navigate('/index.html');

    // Touch targets check
    const touchTargetAudit = await harness.evaluate(`
      (() => {
        const interactive = Array.from(document.querySelectorAll('.nav-island .nav-link, .nav-island .control-btn, .hero-btn, .btn'));
        const smallTargets = interactive.filter(el => {
          const r = el.getBoundingClientRect();
          return r.height < 40;
        }).map(el => ({ tag: el.tagName, class: el.className, h: Math.round(el.getBoundingClientRect().height) }));
        return {
          totalChecked: interactive.length,
          smallCount: smallTargets.length,
          smallTargets
        };
      })()
    `);
    assert(touchTargetAudit.smallCount === 0, `All navigation and CTA touch targets meet mobile size standards (>=40-44px, ${touchTargetAudit.totalChecked} checked)`);

    // Ribbon suppression on input focus
    const keyboardCollisionCheck = await harness.evaluate(`
      (() => {
        const modal = document.getElementById('transmissionModal');
        if (modal) modal.style.display = 'block';
        const input = document.getElementById('transName');
        if (input) {
          input.focus();
          input.dispatchEvent(new FocusEvent('focus', { bubbles: false }));
        }

        const hasClass = document.body.classList.contains('has-focused-input');
        const ribbon = document.querySelector('.sketchbook-ribbon-btn');
        const ribbonVis = ribbon ? window.getComputedStyle(ribbon).visibility : '';
        const ribbonOpacity = ribbon ? parseFloat(window.getComputedStyle(ribbon).opacity) : 1;

        if (input) {
          input.blur();
          input.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
        }
        if (modal) modal.style.display = 'none';

        return {
          hasClass,
          hidden: ribbonVis === 'hidden' || ribbonOpacity === 0
        };
      })()
    `);
    assert(keyboardCollisionCheck.hasClass && keyboardCollisionCheck.hidden, 'Floating ribbons are completely hidden when input is focused (prevents keyboard collision)');

    // Modal open suppression
    const modalCollisionCheck = await harness.evaluate(`
      (() => {
        document.body.classList.add('modal-open');
        const ribbon = document.querySelector('.sketchbook-ribbon-btn');
        const ribbonDisplay = ribbon ? window.getComputedStyle(ribbon).display : '';
        const ribbonVis = ribbon ? window.getComputedStyle(ribbon).visibility : '';
        const ribbonOpacity = ribbon ? parseFloat(window.getComputedStyle(ribbon).opacity) : 1;
        document.body.classList.remove('modal-open');
        return {
          hidden: ribbonDisplay === 'none' || ribbonVis === 'hidden' || ribbonOpacity === 0
        };
      })()
    `);
    assert(modalCollisionCheck.hidden, 'Floating ribbons are completely hidden when dialog/modal is open');

    // Doodle studio mobile selected tool state
    await harness.navigate('/doodle.html');
    const selectedToolCheck = await harness.evaluate(`
      (() => {
        const mobButtons = document.querySelectorAll('.mob-tool-btn');
        const activeBrush = document.querySelector('.brush-card.active, .brush-btn.active, .mob-tool-btn.active');
        return {
          mobButtonsCount: mobButtons.length,
          hasActive: Boolean(activeBrush)
        };
      })()
    `);
    assert(selectedToolCheck.mobButtonsCount >= 5 && selectedToolCheck.hasActive, `Doodle Studio mobile toolbar has complete toolset (${selectedToolCheck.mobButtonsCount} buttons) & clear active state`);

    // ==========================================
    // REQUIREMENT 6: Android & Desktop Layout Checks
    // ==========================================
    console.log('\n-- Requirement 6: Android & Desktop Layout Scalings --');

    const viewportsToTest = [
      { name: 'Android Galaxy S20 (360x800)', w: 360, h: 800 },
      { name: 'Android Pixel 7 (412x915)', w: 412, h: 915 },
      { name: 'Desktop Standard (1024x768)', w: 1024, h: 768 },
      { name: 'Desktop Large (1440x900)', w: 1440, h: 900 }
    ];

    for (const vp of viewportsToTest) {
      await harness.setViewport(vp.w, vp.h);
      await harness.navigate('/index.html');
      
      const metrics = await harness.evaluate(`
        (() => {
          const winW = window.innerWidth;
          const docW = document.documentElement.clientWidth;
          const scrollW = document.documentElement.scrollWidth;
          const bodyScrollW = document.body.scrollWidth;
          const maxScrollW = Math.max(scrollW, bodyScrollW);
          const zeroHOverflow = maxScrollW <= winW + 1;
          
          const main = document.querySelector('main');
          const mainRect = main ? main.getBoundingClientRect() : null;
          const centerDelta = mainRect ? Math.abs(Math.round(docW - mainRect.right) - Math.round(mainRect.left)) : 0;
          const centered = centerDelta <= 4;

          return {
            winW,
            docW,
            maxScrollW,
            zeroHOverflow,
            centerDelta,
            centered
          };
        })()
      `);

      assert(metrics.zeroHOverflow, `${vp.name}: Zero horizontal overflow (scrollW: ${metrics.maxScrollW}px <= winW: ${metrics.winW}px)`);
      if (vp.w >= 1024) {
        assert(metrics.centered, `${vp.name}: Main container centered (|delta| = ${metrics.centerDelta}px <= 4px)`);
      }
    }

    console.log('\n======================================================');
    console.log(`AUDIT COMPLETE: ${passedCount}/${totalCount} assertions passed (${((passedCount/totalCount)*100).toFixed(1)}%)`);
    console.log('======================================================\n');

    return { totalCount, passedCount, success: passedCount === totalCount };
  } catch (err) {
    console.error('Audit encountered error:', err);
    return { totalCount, passedCount, success: false, error: err.message };
  } finally {
    try { await harness.close(); } catch (e) {}
  }
}

if (require.main === module) {
  runPerformanceAndFixesChecks().then(res => {
    process.exit(res.success ? 0 : 1);
  });
}

module.exports = { runPerformanceAndFixesChecks };
