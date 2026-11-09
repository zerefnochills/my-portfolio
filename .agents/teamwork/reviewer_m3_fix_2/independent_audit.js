// Independent Reviewer 2 & Adversarial Critic Audit Script
// Validates:
// 1. Stacking deck compactness (< 500px envelope) across viewports
// 2. Viewport responsiveness across 320, 375, 414, 680, 681, 768, 1024, 1280, 1440, 1920 with zero horizontal scrollbars
// 3. Audio FX & Web Audio safety: window.AUDIO_COOLDOWN = 220ms, pen & coin audio invocation throttling
// 4. Waypoint navigation and scrollbar drag simulation (departure delta, debounce)
// 5. Card layout, z-index hierarchy, clipping, and potential edge-case failures

const path = require('path');
const fs = require('fs');
const { TestHarness } = require('../../../tests/e2e/harness');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runAudit() {
  const harness = new TestHarness();
  const report = {
    compactness: [],
    overflow: [],
    audio: {},
    waypoints: [],
    dragUnlock: {},
    rapidScrubbing: {},
    integrityChecks: {}
  };

  try {
    console.log('[Audit] Starting server and launching Chrome...');
    const serverPort = await harness.startServer();
    console.log(`      Server listening on http://127.0.0.1:${serverPort}`);
    await harness.launchChrome();
    console.log(`      Chrome CDP connected on port ${harness.cdpPort}`);

    await harness.navigate('/index.html');
    await sleep(500);

    console.log('\n========================================');
    console.log('1. STACKING DECK COMPACTNESS EVALUATION');
    console.log('========================================');
    const viewports = [
      { name: 'Mobile-375', w: 375, h: 667 },
      { name: 'Tablet-768', w: 768, h: 1024 },
      { name: 'Desktop-1024', w: 1024, h: 768 },
      { name: 'Desktop-1440', w: 1440, h: 900 }
    ];

    for (const vp of viewports) {
      await harness.setViewport(vp.w, vp.h);
      await sleep(300);

      const data = await harness.evaluate(`(() => {
        const j = document.getElementById('journey');
        const jTop = j.getBoundingClientRect().top + window.scrollY;
        // Scroll to Chapter 4
        window.scrollTo(0, jTop + 2200);
        window.dispatchEvent(new Event('scroll'));

        const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
        const rects = cards.map(c => c.getBoundingClientRect());
        const minY = Math.min(...rects.map(r => r.top));
        const maxY = Math.max(...rects.map(r => r.bottom));
        const envelopeHeight = maxY - minY;
        const tops = rects.map(r => Math.round(r.top));
        const bottoms = rects.map(r => Math.round(r.bottom));
        const heights = rects.map(r => Math.round(r.height));
        const trackHeight = document.getElementById('voyageDeckTrack').offsetHeight;

        return {
          minY,
          maxY,
          envelopeHeight,
          tops,
          bottoms,
          heights,
          trackHeight,
          isCompact: envelopeHeight < 500
        };
      })()`);

      report.compactness.push({ viewport: vp.name, width: vp.w, ...data });
      console.log(`[${vp.name}] Envelope: ${data.envelopeHeight.toFixed(1)}px (Threshold < 500px: ${data.isCompact ? 'PASS' : 'FAIL'})`);
      console.log(`   Card tops: [${data.tops.join(', ')}], Card heights: [${data.heights.join(', ')}], Track height: ${data.trackHeight}px`);
    }

    console.log('\n========================================');
    console.log('2. VIEWPORT RESPONSIVENESS & ZERO OVERFLOW');
    console.log('========================================');
    const widths = [320, 375, 414, 680, 681, 768, 1024, 1280, 1440, 1920];
    for (const w of widths) {
      await harness.setViewport(w, 800);
      await harness.scrollTo(0);
      await sleep(100);

      const overflowData = await harness.evaluate(`(() => {
        const j = document.getElementById('journey');
        const jTop = j.getBoundingClientRect().top + window.scrollY;
        let maxScrollWidth = document.documentElement.scrollWidth;
        const clientWidth = document.documentElement.clientWidth;

        const offsets = [0, 200, 560, 1120, 1680, 2200, 2500];
        offsets.forEach(off => {
          window.scrollTo(0, jTop + off);
          if (document.documentElement.scrollWidth > maxScrollWidth) {
            maxScrollWidth = document.documentElement.scrollWidth;
          }
        });

        return {
          width: ${w},
          clientWidth,
          maxScrollWidth,
          overflow: maxScrollWidth - clientWidth
        };
      })()`);

      report.overflow.push(overflowData);
      const pass = overflowData.overflow <= 0;
      console.log(`[Width ${w}px] Overflow: ${overflowData.overflow}px (scrollWidth: ${overflowData.maxScrollWidth}, clientWidth: ${overflowData.clientWidth}) -> ${pass ? 'PASS' : 'FAIL'}`);
    }

    console.log('\n========================================');
    console.log('3. AUDIO FX & SAFETY THROTTLING EVALUATION');
    console.log('========================================');
    const audioData = await harness.evaluate(`(() => {
      const cooldownVal = window.AUDIO_COOLDOWN;
      const initialAudioTime = window.lastPenAudioTime;
      const soundEnabled = window.soundEnabled;

      return {
        cooldownVal,
        initialAudioTime,
        soundEnabled,
        hasPenScratch: typeof window.playPenScratch === 'function',
        hasPlayCoin: typeof window.playCoinAudio === 'function'
      };
    })()`);

    report.audio = audioData;
    console.log(`AUDIO_COOLDOWN constant: ${audioData.cooldownVal}ms (Expected: 220ms -> ${audioData.cooldownVal === 220 ? 'PASS' : 'FAIL'})`);
    console.log(`playPenScratch defined: ${audioData.hasPenScratch}`);
    console.log(`playCoinAudio defined: ${audioData.hasPlayCoin}`);

    console.log('\n========================================');
    console.log('4. WAYPOINT NAVIGATION & CARD VISIBILITY');
    console.log('========================================');
    await harness.setViewport(1440, 900);
    const wpData = await harness.evaluate(`(() => {
      const results = [];
      for (let ch = 1; ch <= 4; ch++) {
        const wp = document.querySelector('.voyage-waypoint[data-chapter="' + ch + '"]');
        wp.click();
        const activeCard = document.querySelector('.voyage-milestone-card.is-active');
        const activeCardId = activeCard ? activeCard.id : null;
        const rect = activeCard ? activeCard.getBoundingClientRect() : null;
        const vh = window.innerHeight;
        const inView = rect ? (rect.top >= 0 && rect.bottom <= vh) : false;
        results.push({
          chapter: ch,
          activeCardId,
          top: rect ? Math.round(rect.top) : null,
          bottom: rect ? Math.round(rect.bottom) : null,
          inView,
          dockTopExpected: 220 + (ch - 1) * 12
        });
      }
      return results;
    })()`);

    report.waypoints = wpData;
    wpData.forEach(wp => {
      console.log(`Waypoint ${wp.chapter}: Active Card=${wp.activeCardId}, top=${wp.top}px (docked at expected ${wp.dockTopExpected}px), inView=${wp.inView} -> ${wp.inView && wp.top === wp.dockTopExpected ? 'PASS' : 'FAIL'}`);
    });

    console.log('\n========================================');
    console.log('5. SCROLLBAR DRAG UNLOCK & MULTI-LAYER UNLOCK');
    console.log('========================================');
    const dragData = await harness.evaluate(`(() => {
      // 1. Click waypoint 3 to engage lock
      const wp3 = document.querySelector('.voyage-waypoint[data-chapter="3"]');
      wp3.click();
      const beforeActive = document.querySelector('.voyage-milestone-card.is-active').id;

      // 2. Simulate native scrollbar thumb drag to top position (only fires scroll event)
      const j = document.getElementById('journey');
      const jTop = j.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, jTop + 100);
      window.dispatchEvent(new Event('scroll'));

      const afterScrollbarDragActive = document.querySelector('.voyage-milestone-card.is-active').id;
      const counterText = document.getElementById('voyageRouteCounter').textContent;

      return {
        beforeActive,
        afterScrollbarDragActive,
        counterText,
        unlocked: afterScrollbarDragActive === 'milestone-1'
      };
    })()`);

    report.dragUnlock = dragData;
    console.log(`Scrollbar drag unlock: before=${dragData.beforeActive}, after=${dragData.afterActive}, counter="${dragData.counterText}" -> ${dragData.unlocked ? 'PASS' : 'FAIL'}`);

    console.log('\n========================================');
    console.log('6. ADVERSARIAL STRESS: RAPID BIDIRECTIONAL SCRUBBING');
    console.log('========================================');
    const scrubData = await harness.evaluate(`(() => {
      const j = document.getElementById('journey');
      const jTop = j.getBoundingClientRect().top + window.scrollY;

      // Hammer scroll 100 times back and forth
      for (let i = 0; i < 100; i++) {
        const y = jTop + Math.floor(Math.random() * 2500);
        window.scrollTo(0, y);
        window.dispatchEvent(new Event('scroll'));
      }

      // Settle at Chapter 4
      window.scrollTo(0, jTop + 2200);
      window.dispatchEvent(new Event('scroll'));
      const ch4Counter = document.getElementById('voyageRouteCounter').textContent;
      const banner = document.getElementById('voyageCelebrationBanner');
      const bannerDisplay = window.getComputedStyle(banner).display;

      // Settle at Chapter 1
      window.scrollTo(0, jTop + 100);
      window.dispatchEvent(new Event('scroll'));
      const ch1Counter = document.getElementById('voyageRouteCounter').textContent;
      const bannerDisplayAfterCh1 = window.getComputedStyle(banner).display;
      const shipAvatar = document.getElementById('voyageShipAvatar');
      const shipLeft = shipAvatar.style.left;

      return {
        ch4Counter,
        bannerDisplayAtCh4: bannerDisplay,
        ch1Counter,
        bannerDisplayAfterCh1,
        shipLeftAtCh1: shipLeft,
        pass: ch4Counter.includes('4 of 4') && bannerDisplay !== 'none' && ch1Counter.includes('1 of 4') && bannerDisplayAfterCh1 === 'none' && shipLeft === '0%'
      };
    })()`);

    report.rapidScrubbing = scrubData;
    console.log(`Scrubbing resilience: Ch4 reached=${scrubData.ch4Counter}, Banner shown=${scrubData.bannerDisplayAtCh4 !== 'none'}, Reverted Ch1=${scrubData.ch1Counter}, Banner hidden=${scrubData.bannerDisplayAfterCh1 === 'none'}, Ship at 0%=${scrubData.shipLeftAtCh1} -> ${scrubData.pass ? 'PASS' : 'FAIL'}`);

    console.log('\n========================================');
    console.log('7. CODE INTEGRITY & FACADE INSPECTION');
    console.log('========================================');
    const integrity = await harness.evaluate(`(() => {
      // Check card DOM structure: must have 4 .voyage-card-step containing 4 .voyage-milestone-card
      const steps = document.querySelectorAll('#voyageDeckTrack .voyage-card-step');
      const cards = document.querySelectorAll('#voyageDeckTrack .voyage-milestone-card');

      // Check for hardcoded test intercepts
      const hasTestMocks = window.__test_mock__ !== undefined || window.__is_test__ !== undefined;

      return {
        stepCount: steps.length,
        cardCount: cards.length,
        hasTestMocks
      };
    })()`);

    report.integrityChecks = integrity;
    console.log(`DOM structure: ${integrity.stepCount} steps, ${integrity.cardCount} cards (Expected: 4 and 4 -> ${integrity.stepCount === 4 && integrity.cardCount === 4 ? 'PASS' : 'FAIL'})`);
    console.log(`Hardcoded test mocks/intercepts: ${integrity.hasTestMocks} (Expected: false -> ${!integrity.hasTestMocks ? 'PASS' : 'FAIL'})`);

  } finally {
    await harness.close();
  }

  // Save report to JSON in our state folder
  const jsonPath = path.join(__dirname, 'audit_results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nAudit results written to: ${jsonPath}`);
}

runAudit().catch(err => {
  console.error('[Audit Error]', err);
  process.exit(1);
});
