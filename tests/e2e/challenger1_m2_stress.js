/**
 * Challenger 1 Milestone 2 Adversarial Stress Test Suite
 *
 * Exhaustively stress-tests:
 * 1. Wanted Poster dimensions, aspect ratio, and boundary limits across 19 viewports (320px to 2560px).
 * 2. Aspect ratio deviations (|renderedRatio - 0.75| < 0.05) for frame and photo img.
 * 3. Chopper peeking bubble and annotation note boundary safety & horizontal overflow at 320px, 360px, 375px, 390px, 414px.
 * 4. Active Bubble behavior: left/right screen bounds and document horizontal scroll check.
 * 5. Interactive hooks (#wantedBountyRow increment, #wantedPosterName visibility, file picker trigger).
 */

const { TestHarness } = require('./harness');

const VIEWPORTS = [
  320, 360, 375, 390, 412, 414,
  480, 600, 680, 681, 768, 820,
  912, 1024, 1025, 1280, 1440, 1920, 2560
];

const MOBILE_TARGETS = [320, 360, 375, 390, 414];

async function runAdversarialStress() {
  console.log('\n===============================================================');
  console.log('  CHALLENGER 1: ADVERSARIAL STRESS TEST FOR MILESTONE 2');
  console.log('===============================================================');

  const harness = new TestHarness();
  const results = {
    assetAudit: {},
    viewportSweep: [],
    mobileBoundaries: [],
    bubbleStress: [],
    interactivityAudit: {},
    summary: { totalChecks: 0, passed: 0, failed: 0, caveats: [] }
  };

  try {
    await harness.startServer();
    await harness.launchChrome();
    await harness.navigate('/index.html');

    // -------------------------------------------------------------
    // Phase 1: Asset & Image Dimensions Audit
    // -------------------------------------------------------------
    console.log('\n[Phase 1] Asset & Image Dimensions Audit');
    await harness.setViewport(1440, 900);
    const assetData = await harness.evaluate(`
      (() => {
        const img = document.querySelector('#wantedPhotoImg');
        const poster = document.querySelector('#wantedPoster');
        if (!img) return { exists: false };
        const cs = window.getComputedStyle(img);
        return {
          exists: true,
          src: img.getAttribute('src'),
          currentSrc: img.currentSrc,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          naturalRatio: img.naturalHeight > 0 ? (img.naturalWidth / img.naturalHeight) : 0,
          objectFit: cs.objectFit,
          display: cs.display,
          posterExists: Boolean(poster)
        };
      })()
    `);
    results.assetAudit = assetData;
    const naturalRatioDev = Math.abs(assetData.naturalRatio - 0.75);
    const assetPass = assetData.exists && assetData.complete && naturalRatioDev < 0.005;

    results.summary.totalChecks++;
    if (assetPass) {
      results.summary.passed++;
      console.log(`  ✔ Asset loaded: ${assetData.naturalWidth}x${assetData.naturalHeight} (Ratio: ${assetData.naturalRatio}, Dev: ${naturalRatioDev.toFixed(4)})`);
    } else {
      results.summary.failed++;
      console.log(`  ✖ Asset audit failed:`, assetData);
    }

    // -------------------------------------------------------------
    // Phase 2: Viewport Aspect Ratio & Dimension Sweep (320px - 2560px)
    // -------------------------------------------------------------
    console.log('\n[Phase 2] Viewport Aspect Ratio & Dimension Sweep (320px - 2560px)');
    for (const w of VIEWPORTS) {
      const h = Math.round(w * 0.75) > 600 ? Math.round(w * 0.75) : 800;
      await harness.setViewport(w, h);
      await new Promise(r => setTimeout(r, 80));

      const metrics = await harness.evaluate(`
        (() => {
          const poster = document.querySelector('#wantedPoster');
          const img = document.querySelector('#wantedPhotoImg');
          const pRect = poster ? poster.getBoundingClientRect() : null;
          const iRect = img ? img.getBoundingClientRect() : null;
          return {
            poster: pRect ? {
              width: pRect.width,
              height: pRect.height,
              ratio: pRect.height > 0 ? (pRect.width / pRect.height) : 0,
              left: pRect.left,
              right: pRect.right
            } : null,
            img: iRect ? {
              width: iRect.width,
              height: iRect.height,
              ratio: iRect.height > 0 ? (iRect.width / iRect.height) : 0
            } : null
          };
        })()
      `);

      const pW = metrics.poster ? Math.round(metrics.poster.width) : 0;
      const pH = metrics.poster ? Math.round(metrics.poster.height) : 0;
      const pRatio = metrics.poster ? metrics.poster.ratio : 0;
      const pDev = Math.abs(pRatio - 0.75);

      const iW = metrics.img ? Math.round(metrics.img.width) : 0;
      const iH = metrics.img ? Math.round(metrics.img.height) : 0;
      const iRatio = metrics.img ? metrics.img.ratio : 0;
      const iDev = Math.abs(iRatio - 0.75);

      // Max width boundary constraints per breakpoint
      let maxWidthLimit = 355;
      if (w <= 680) maxWidthLimit = 295;
      else if (w <= 1024) maxWidthLimit = 315;

      const pWidthInBounds = pW <= maxWidthLimit;
      const pRatioInBounds = pDev < 0.05;
      const iRatioInBounds = iDev < 0.05;
      const pass = pWidthInBounds && pRatioInBounds && iRatioInBounds;

      results.summary.totalChecks++;
      if (pass) results.summary.passed++;
      else results.summary.failed++;

      const item = {
        viewportWidth: w,
        posterWidth: pW,
        posterHeight: pH,
        maxWidthLimit,
        posterRatio: Number(pRatio.toFixed(4)),
        posterRatioDev: Number(pDev.toFixed(4)),
        imgWidth: iW,
        imgHeight: iH,
        imgRatio: Number(iRatio.toFixed(4)),
        imgRatioDev: Number(iDev.toFixed(4)),
        passed: pass
      };
      results.viewportSweep.push(item);

      const icon = pass ? '✔' : '✖';
      console.log(`  ${icon} [${w}px] Poster: ${pW}x${pH}px (Limit: <=${maxWidthLimit}px, Ratio: ${item.posterRatio}, Dev: ${item.posterRatioDev}) | Img: ${iW}x${iH}px (Ratio: ${item.imgRatio}, Dev: ${item.imgRatioDev})`);
    }

    // -------------------------------------------------------------
    // Phase 3: Mobile Boundary Safety & Rest-State Overflow (320px..414px)
    // -------------------------------------------------------------
    console.log('\n[Phase 3] Mobile Boundary Safety & Rest-State Overflow (320px..414px)');
    for (const mw of MOBILE_TARGETS) {
      await harness.setViewport(mw, 700);
      await new Promise(r => setTimeout(r, 80));

      const boundaryMetrics = await harness.evaluate(`
        (() => {
          const docScrollW = document.documentElement.scrollWidth;
          const winInnerW = window.innerWidth;
          const hasHScroll = docScrollW > winInnerW + 1;

          const poster = document.querySelector('#wantedPoster');
          const chopperWrap = document.querySelector('.chopper-peeking-wrap');
          const note = document.querySelector('.wanted-annotation-note');

          const pRect = poster ? poster.getBoundingClientRect() : null;
          const cRect = chopperWrap ? chopperWrap.getBoundingClientRect() : null;
          const nRect = note ? note.getBoundingClientRect() : null;

          return {
            viewport: winInnerW,
            docScrollW,
            hasHScroll,
            poster: pRect ? {
              left: Math.round(pRect.left),
              right: Math.round(pRect.right),
              width: Math.round(pRect.width),
              inBounds: pRect.left >= 0 && pRect.right <= winInnerW + 1
            } : null,
            chopper: cRect ? {
              left: Math.round(cRect.left),
              right: Math.round(cRect.right),
              inBounds: cRect.left >= 0 && cRect.right <= winInnerW + 1
            } : null,
            note: nRect ? {
              left: Math.round(nRect.left),
              right: Math.round(nRect.right),
              width: Math.round(nRect.width),
              inBounds: nRect.left >= 0 && nRect.right <= winInnerW + 1
            } : null
          };
        })()
      `);

      const noHScroll = !boundaryMetrics.hasHScroll;
      const posterInBounds = boundaryMetrics.poster?.inBounds;
      const chopperInBounds = boundaryMetrics.chopper?.inBounds;
      const noteInBounds = boundaryMetrics.note?.inBounds;
      const pass = noHScroll && posterInBounds && chopperInBounds && noteInBounds;

      results.summary.totalChecks++;
      if (pass) results.summary.passed++;
      else results.summary.failed++;

      results.mobileBoundaries.push({
        viewport: mw,
        docScrollW: boundaryMetrics.docScrollW,
        noHScroll,
        poster: boundaryMetrics.poster,
        chopper: boundaryMetrics.chopper,
        note: boundaryMetrics.note,
        passed: pass
      });

      const icon = pass ? '✔' : '✖';
      console.log(`  ${icon} [${mw}px] HScroll: ${noHScroll ? 'NO (PASS)' : 'YES (FAIL)'} | Poster: [${boundaryMetrics.poster?.left}, ${boundaryMetrics.poster?.right}] | Chopper: [${boundaryMetrics.chopper?.left}, ${boundaryMetrics.chopper?.right}] | Note: [${boundaryMetrics.note?.left}, ${boundaryMetrics.note?.right}]`);
    }

    // -------------------------------------------------------------
    // Phase 4: Chopper Bubble Active / Click / Hover Stress (320px..414px)
    // -------------------------------------------------------------
    console.log('\n[Phase 4] Chopper Bubble Active / Click / Hover Stress (320px..414px)');
    for (const mw of MOBILE_TARGETS) {
      await harness.setViewport(mw, 700);

      const activeMetrics = await harness.evaluate(`
        (() => {
          const bubble = document.querySelector('#chopperPeekingBubble');
          const chopperWrap = document.querySelector('.chopper-peeking-wrap');
          if (!bubble) return { exists: false };

          // Force active state as if hovered or clicked
          bubble.classList.add('show');
          bubble.style.opacity = '1';

          const docScrollW = document.documentElement.scrollWidth;
          const winInnerW = window.innerWidth;
          const bRect = bubble.getBoundingClientRect();

          // Check horizontal scroll caused by bubble
          const causesHScroll = docScrollW > winInnerW + 1;
          const exceedsRight = bRect.right > winInnerW + 1;
          const bleedsLeft = bRect.left < 0;

          // Revert inline style
          bubble.classList.remove('show');
          bubble.style.opacity = '';

          return {
            exists: true,
            winInnerW,
            docScrollW,
            causesHScroll,
            bRect: {
              left: Math.round(bRect.left),
              right: Math.round(bRect.right),
              width: Math.round(bRect.width)
            },
            exceedsRight,
            bleedsLeft
          };
        })()
      `);

      // Criteria from instruction 3: Chopper peeking bubble never triggers horizontal scroll
      const noHScroll = !activeMetrics.causesHScroll;
      const doesNotExceedRight = !activeMetrics.exceedsRight;

      results.summary.totalChecks++;
      if (noHScroll && doesNotExceedRight) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }

      if (activeMetrics.bleedsLeft) {
        results.summary.caveats.push(`Viewport ${mw}px: Chopper bubble left edge is at ${activeMetrics.bRect.left}px (clips off-screen left by ${Math.abs(activeMetrics.bRect.left)}px, though does not trigger horizontal scrollbar)`);
      }

      results.bubbleStress.push({
        viewport: mw,
        causesHScroll: activeMetrics.causesHScroll,
        bRect: activeMetrics.bRect,
        exceedsRight: activeMetrics.exceedsRight,
        bleedsLeft: activeMetrics.bleedsLeft,
        passed: noHScroll && doesNotExceedRight
      });

      const icon = (noHScroll && doesNotExceedRight) ? '✔' : '✖';
      console.log(`  ${icon} [${mw}px] Active Bubble causes HScroll: ${activeMetrics.causesHScroll ? 'YES (FAIL)' : 'NO (PASS)'} | Rect: [${activeMetrics.bRect?.left}, ${activeMetrics.bRect?.right}] (bleeds left: ${activeMetrics.bleedsLeft})`);
    }

    // -------------------------------------------------------------
    // Phase 5: Interactive Hooks & Visual Hierarchy Stress
    // -------------------------------------------------------------
    console.log('\n[Phase 5] Interactive Hooks & Visual Hierarchy Stress');
    await harness.setViewport(1440, 900);
    const interactiveData = await harness.evaluate(`
      (() => {
        const bRow = document.getElementById('wantedBountyRow');
        const bVal = document.getElementById('wantedPosterBounty');
        const nameEl = document.getElementById('wantedPosterName');
        const photoInput = document.getElementById('wantedPhotoInput');
        const photoContainer = document.getElementById('wantedPhotoContainer');

        if (!bRow || !bVal || !nameEl) return { success: false, reason: 'missing elements' };

        const initialNum = parseInt(bVal.textContent.replace(/[^0-9]/g, ''), 10);

        // Click bounty 5 times consecutively
        let clicksPassed = true;
        let prev = initialNum;
        const sequence = [prev];
        for (let i = 0; i < 5; i++) {
          bRow.click();
          const curr = parseInt(bVal.textContent.replace(/[^0-9]/g, ''), 10);
          sequence.push(curr);
          if (curr !== prev + 100000000) clicksPassed = false;
          prev = curr;
        }

        // Verify name element styling
        const nameCS = window.getComputedStyle(nameEl);
        const nameText = nameEl.textContent.trim();
        const nameVisible = nameCS.display !== 'none' && nameCS.visibility !== 'hidden' && nameCS.opacity !== '0';

        // Verify bounty row positioning relative to poster
        const bRowCS = window.getComputedStyle(bRow);
        const bRowRect = bRow.getBoundingClientRect();
        const posterRect = document.querySelector('#wantedPoster').getBoundingClientRect();
        const bountyInsidePoster = bRowRect.top >= posterRect.top && bRowRect.bottom <= posterRect.bottom &&
                                   bRowRect.left >= posterRect.left && bRowRect.right <= posterRect.right;

        return {
          success: true,
          initialNum,
          sequence,
          clicksPassed,
          nameText,
          nameVisible,
          bountyInsidePoster,
          photoInputExists: Boolean(photoInput)
        };
      })()
    `);

    results.interactivityAudit = interactiveData;
    const interPass = interactiveData.success &&
                      interactiveData.clicksPassed &&
                      interactiveData.nameVisible &&
                      interactiveData.bountyInsidePoster;

    results.summary.totalChecks++;
    if (interPass) {
      results.summary.passed++;
      console.log(`  ✔ Bounty incremented 5x cleanly: ${interactiveData.sequence.join(' -> ')}`);
      console.log(`  ✔ Name text: "${interactiveData.nameText}" (visible: ${interactiveData.nameVisible})`);
      console.log(`  ✔ Bounty row strictly within poster bounds: ${interactiveData.bountyInsidePoster}`);
    } else {
      results.summary.failed++;
      console.log(`  ✖ Interactivity audit failure:`, interactiveData);
    }

    console.log('\n===============================================================');
    console.log(`STRESS TEST SUMMARY: Total: ${results.summary.totalChecks}, Passed: ${results.summary.passed}, Failed: ${results.summary.failed}`);
    if (results.summary.caveats.length > 0) {
      console.log('\nObserved Caveats/Advisories:');
      results.summary.caveats.forEach(c => console.log(`  ⚠ ${c}`));
    }
    console.log('===============================================================');

  } catch (err) {
    console.error('Adversarial stress test execution error:', err);
  } finally {
    try { await harness.close(); } catch (e) {}
  }
}

runAdversarialStress();
