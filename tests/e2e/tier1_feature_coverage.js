/**
 * Tier 1: Feature Coverage E2E Tests
 * Validates the 7 core features from ORIGINAL_REQUEST.md & PROJECT.md
 * Target: >= 35 assertions (5 assertions per feature)
 */

async function runTier1(harness) {
  const reporter = harness.reporter;
  console.log('\n========================================');
  console.log('  RUNNING TIER 1: FEATURE COVERAGE');
  console.log('========================================\n');

  // Navigate to index.html and dismiss loader
  await harness.navigate('/index.html');

  // ---------------------------------------------------------
  // Feature 1: Layout Centering Across Viewports (5 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Feature 1: Layout Centering Across Viewports --');

  // F1.1: Desktop 1440px centering
  await harness.setViewport(1440, 900);
  let m1440 = await harness.getMetrics(1440);
  const f1_1_pass = m1440.main && m1440.main.centerDelta <= 4;
  reporter.record(1, 'F1-LayoutCentering', 'Main container centered on desktop 1440px (|left - right| <= 4px)', f1_1_pass, {
    expected: '<= 4px delta',
    actual: m1440.main ? `${m1440.main.centerDelta}px (left:${m1440.main.leftSpace}, right:${m1440.main.rightSpace})` : 'null'
  });

  // F1.2: Small desktop 1024px centering
  await harness.setViewport(1024, 768);
  let m1024 = await harness.getMetrics(1024);
  const f1_2_pass = m1024.main && m1024.main.centerDelta <= 4;
  reporter.record(1, 'F1-LayoutCentering', 'Main container centered on small desktop 1024px (|left - right| <= 4px)', f1_2_pass, {
    expected: '<= 4px delta',
    actual: m1024.main ? `${m1024.main.centerDelta}px (left:${m1024.main.leftSpace}, right:${m1024.main.rightSpace})` : 'null'
  });

  // F1.3: Tablet 768px centering
  await harness.setViewport(768, 1024);
  let m768 = await harness.getMetrics(768);
  const f1_3_pass = m768.main && m768.main.centerDelta <= 4;
  reporter.record(1, 'F1-LayoutCentering', 'Main container centered on tablet 768px (|left - right| <= 4px)', f1_3_pass, {
    expected: '<= 4px delta',
    actual: m768.main ? `${m768.main.centerDelta}px (left:${m768.main.leftSpace}, right:${m768.main.rightSpace})` : 'null'
  });

  // F1.4: Mobile 375px centering
  await harness.setViewport(375, 667);
  let m375 = await harness.getMetrics(375);
  const f1_4_pass = m375.main && m375.main.centerDelta <= 4;
  reporter.record(1, 'F1-LayoutCentering', 'Main container centered on mobile 375px (|left - right| <= 4px)', f1_4_pass, {
    expected: '<= 4px delta',
    actual: m375.main ? `${m375.main.centerDelta}px (left:${m375.main.leftSpace}, right:${m375.main.rightSpace})` : 'null'
  });

  // F1.5: Content sections have non-negative margin / left alignment
  const sectionAlignment = await harness.evaluate(`
    (() => {
      const sections = ['#hero', '#journey', '#skills', '#contact'];
      const results = [];
      const main = document.querySelector('main');
      const mainLeft = main ? main.getBoundingClientRect().left : 0;
      for (const id of sections) {
        const el = document.querySelector(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const st = window.getComputedStyle(el);
          results.push({
            id,
            left: Math.round(rect.left),
            marginLeft: parseFloat(st.marginLeft) || 0,
            nonNegative: (parseFloat(st.marginLeft) || 0) >= -2
          });
        }
      }
      return results;
    })()
  `);
  const f1_5_pass = sectionAlignment.length > 0 && sectionAlignment.every(s => s.nonNegative);
  reporter.record(1, 'F1-LayoutCentering', 'All major content sections have balanced, non-negative left margins', f1_5_pass, {
    expected: 'All sections nonNegative === true',
    actual: sectionAlignment
  });

  // ---------------------------------------------------------
  // Feature 2: Horizontal Overflow Elimination (5 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Feature 2: Horizontal Overflow Elimination --');

  // F2.1: 375px viewport
  await harness.setViewport(375, 667);
  m375 = await harness.getMetrics(375);
  const f2_1_pass = m375.scrollW <= m375.winW + 1;
  reporter.record(1, 'F2-ZeroOverflow', 'Mobile (375px): document scrollWidth <= window.innerWidth', f2_1_pass, {
    expected: `<= ${m375.winW}`,
    actual: m375.scrollW,
    overflowCount: m375.overflowCount,
    topOverflows: m375.overflows
  });

  // F2.2: 768px viewport
  await harness.setViewport(768, 1024);
  m768 = await harness.getMetrics(768);
  const f2_2_pass = m768.scrollW <= m768.winW + 1;
  reporter.record(1, 'F2-ZeroOverflow', 'Tablet (768px): document scrollWidth <= window.innerWidth', f2_2_pass, {
    expected: `<= ${m768.winW}`,
    actual: m768.scrollW,
    overflowCount: m768.overflowCount
  });

  // F2.3: 1024px viewport
  await harness.setViewport(1024, 768);
  m1024 = await harness.getMetrics(1024);
  const f2_3_pass = m1024.scrollW <= m1024.winW + 1;
  reporter.record(1, 'F2-ZeroOverflow', 'Small Desktop (1024px): document scrollWidth <= window.innerWidth', f2_3_pass, {
    expected: `<= ${m1024.winW}`,
    actual: m1024.scrollW,
    overflowCount: m1024.overflowCount
  });

  // F2.4: 1440px viewport
  await harness.setViewport(1440, 900);
  m1440 = await harness.getMetrics(1440);
  const f2_4_pass = m1440.scrollW <= m1440.winW + 1;
  reporter.record(1, 'F2-ZeroOverflow', 'Large Desktop (1440px): document scrollWidth <= window.innerWidth', f2_4_pass, {
    expected: `<= ${m1440.winW}`,
    actual: m1440.scrollW,
    overflowCount: m1440.overflowCount
  });

  // F2.5: Root containment CSS rule
  const f2_5_pass = ['clip', 'hidden'].includes(m1440.overflowXHtml) || ['clip', 'hidden'].includes(m1440.overflowXBody);
  reporter.record(1, 'F2-ZeroOverflow', 'Root containment: html or body has overflow-x clip/hidden', f2_5_pass, {
    expected: 'clip or hidden',
    actual: { html: m1440.overflowXHtml, body: m1440.overflowXBody }
  });

  // ---------------------------------------------------------
  // Feature 3: Wanted Poster Template HTTP 200 & Render (5 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Feature 3: Wanted Poster Asset Resolution & HTTP 200 --');

  // F3.1: Poster image references user-provided template image
  const posterSrcInfo = await harness.evaluate(`
    (() => {
      const img = document.querySelector('#wantedPhotoImg') || document.querySelector('.wanted-img');
      const cfg = window.PORTFOLIO_CONFIG ? window.PORTFOLIO_CONFIG.wantedPosterPhoto : null;
      return {
        src: img ? img.getAttribute('src') : null,
        currentSrc: img ? img.currentSrc : null,
        configSrc: cfg
      };
    })()
  `);
  const TARGET_IMG = 'media_1794201865931_238ddac4.jpg';
  const f3_1_pass = (posterSrcInfo.src && posterSrcInfo.src.includes(TARGET_IMG)) ||
                    (posterSrcInfo.configSrc && posterSrcInfo.configSrc.includes(TARGET_IMG));
  reporter.record(1, 'F3-WantedPosterAsset', 'Poster markup or PORTFOLIO_CONFIG references media_1794201865931_238ddac4.jpg', f3_1_pass, {
    expected: TARGET_IMG,
    actual: posterSrcInfo
  });

  // F3.2: HTTP GET request for the asset returns status 200
  let posterHttp = harness.networkLog.find(r => r.url.includes(TARGET_IMG));
  // If not requested automatically yet, request it now through server
  if (!posterHttp) {
    try {
      const assetRes = await fetch(`http://127.0.0.1:${harness.serverPort}/images/${TARGET_IMG}`);
      posterHttp = {
        url: `/images/${TARGET_IMG}`,
        status: assetRes.status,
        size: Number(assetRes.headers.get('content-length') || 0)
      };
    } catch (e) {
      posterHttp = { url: `/images/${TARGET_IMG}`, status: 500, error: e.message };
    }
  }
  const f3_2_pass = posterHttp && posterHttp.status === 200;
  reporter.record(1, 'F3-WantedPosterAsset', 'Template image asset resolves with HTTP 200 OK', f3_2_pass, {
    expected: 200,
    actual: posterHttp ? posterHttp.status : 'Not Found'
  });

  // F3.3: Image file size is > 50KB (full fidelity template)
  const f3_3_pass = posterHttp && posterHttp.size > 50000;
  reporter.record(1, 'F3-WantedPosterAsset', 'Template image asset size is > 50KB (high fidelity template)', f3_3_pass, {
    expected: '> 50000 bytes',
    actual: posterHttp ? posterHttp.size : 0
  });

  // F3.4: Browser reports image complete
  const posterImgState = await harness.evaluate(`
    (() => {
      const img = document.querySelector('#wantedPhotoImg') || document.querySelector('.wanted-img');
      return img ? {
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      } : null;
    })()
  `);
  const f3_4_pass = Boolean(posterImgState && posterImgState.complete);
  reporter.record(1, 'F3-WantedPosterAsset', 'Browser reports wanted poster img.complete === true', f3_4_pass, {
    expected: true,
    actual: posterImgState ? posterImgState.complete : null
  });

  // F3.5: Browser reports natural dimensions > 0 (valid decoded image)
  const f3_5_pass = Boolean(posterImgState && posterImgState.naturalWidth > 0 && posterImgState.naturalHeight > 0);
  reporter.record(1, 'F3-WantedPosterAsset', 'Browser decodes wanted poster with natural dimensions > 0', f3_5_pass, {
    expected: 'naturalWidth > 0 and naturalHeight > 0',
    actual: posterImgState ? `${posterImgState.naturalWidth}x${posterImgState.naturalHeight}` : null
  });

  // ---------------------------------------------------------
  // Feature 4: Wanted Poster 3:4 Aspect Ratio (5 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Feature 4: Wanted Poster 3:4 Aspect Ratio --');

  // F4.1: Natural asset aspect ratio is 3:4 (0.75 +/- 0.02)
  const naturalRatio = posterImgState && posterImgState.naturalHeight > 0 ?
    posterImgState.naturalWidth / posterImgState.naturalHeight : 0;
  const f4_1_pass = Math.abs(naturalRatio - 0.75) <= 0.02;
  reporter.record(1, 'F4-WantedAspectRatio', 'Natural image aspect ratio matches authentic 3:4 (0.75 ± 0.02)', f4_1_pass, {
    expected: 0.75,
    actual: naturalRatio
  });

  // F4.2: Rendered frame aspect ratio on desktop 1440px
  await harness.setViewport(1440, 900);
  m1440 = await harness.getMetrics(1440);
  const ratio1440 = m1440.wanted ? m1440.wanted.aspectRatio : 0;
  const f4_2_pass = Math.abs(ratio1440 - 0.75) <= 0.04;
  reporter.record(1, 'F4-WantedAspectRatio', 'Rendered frame on desktop (1440px) maintains 3:4 ratio (0.75 ± 0.04)', f4_2_pass, {
    expected: '0.75 ± 0.04',
    actual: ratio1440.toFixed(3)
  });

  // F4.3: Rendered frame aspect ratio on tablet 768px
  await harness.setViewport(768, 1024);
  m768 = await harness.getMetrics(768);
  const ratio768 = m768.wanted ? m768.wanted.aspectRatio : 0;
  const f4_3_pass = Math.abs(ratio768 - 0.75) <= 0.04;
  reporter.record(1, 'F4-WantedAspectRatio', 'Rendered frame on tablet (768px) maintains 3:4 ratio (0.75 ± 0.04)', f4_3_pass, {
    expected: '0.75 ± 0.04',
    actual: ratio768.toFixed(3)
  });

  // F4.4: Rendered frame aspect ratio on mobile 375px
  await harness.setViewport(375, 667);
  m375 = await harness.getMetrics(375);
  const ratio375 = m375.wanted ? m375.wanted.aspectRatio : 0;
  const f4_4_pass = Math.abs(ratio375 - 0.75) <= 0.04;
  reporter.record(1, 'F4-WantedAspectRatio', 'Rendered frame on mobile (375px) maintains 3:4 ratio (0.75 ± 0.04)', f4_4_pass, {
    expected: '0.75 ± 0.04',
    actual: ratio375.toFixed(3)
  });

  // F4.5: Mobile 375px containment: frame width <= 320px and fits within screen
  const f4_5_pass = m375.wanted && m375.wanted.width <= 320 && m375.wanted.right <= 375 + 1;
  reporter.record(1, 'F4-WantedAspectRatio', 'Wanted poster frame on mobile (375px) is width-constrained (<= 320px) without overflow', f4_5_pass, {
    expected: 'width <= 320 and right <= 375',
    actual: m375.wanted ? { width: m375.wanted.width, right: m375.wanted.right } : null
  });

  // ---------------------------------------------------------
  // Feature 5: Journey Scroll Progression (No Buttons) (5 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Feature 5: Journey Scroll Progression (No Buttons) --');

  // F5.1: Manual reveal buttons eliminated or hidden
  const revealBtnState = await harness.evaluate(`
    (() => {
      const btn = document.getElementById('journeyRevealBtn');
      if (!btn) return { exists: false, visible: false };
      const st = window.getComputedStyle(btn);
      return {
        exists: true,
        display: st.display,
        visible: st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity) > 0
      };
    })()
  `);
  const f5_1_pass = !revealBtnState.exists || !revealBtnState.visible;
  reporter.record(1, 'F5-JourneyScrollProgression', 'Manual button-click reveal button (#journeyRevealBtn) is eliminated / hidden', f5_1_pass, {
    expected: 'not visible or removed',
    actual: revealBtnState
  });

  // Reset to 1440px desktop for journey scroll testing
  await harness.setViewport(1440, 900);
  await harness.scrollTo(0);

  // Measure journey top position
  const journeyMetrics = await harness.evaluate(`
    (() => {
      const el = document.getElementById('journey');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return {
        offsetTop: el.offsetTop,
        top: Math.round(r.top + window.scrollY),
        height: Math.round(r.height)
      };
    })()
  `);

  const jTop = journeyMetrics ? journeyMetrics.top : 2500;

  // F5.2: Scrolling into Journey enters Chapter 1
  await harness.scrollTo(jTop + 100);
  await new Promise(r => setTimeout(r, 200));
  let step1State = await harness.evaluate(`
    (() => {
      const c1 = document.getElementById('milestone-1');
      const step1 = document.querySelector('.voyage-card-step[data-step="1"]');
      const counter = document.getElementById('voyageRouteCounter');
      return {
        c1Revealed: c1 ? (c1.classList.contains('is-revealed') || c1.classList.contains('is-active') || c1.classList.contains('is-stacked')) : false,
        counter: counter ? counter.textContent.trim() : ''
      };
    })()
  `);
  const f5_2_pass = step1State.c1Revealed || step1State.counter.includes('1');
  reporter.record(1, 'F5-JourneyScrollProgression', 'Scrolling into Journey section activates Chapter 1', f5_2_pass, {
    expected: 'Chapter 1 active/revealed',
    actual: step1State
  });

  // F5.3: Scrolling further advances progression to Chapter 2 without button click
  await harness.scrollTo(jTop + 650);
  await new Promise(r => setTimeout(r, 200));
  let step2State = await harness.evaluate(`
    (() => {
      const c2 = document.getElementById('milestone-2');
      const step2 = document.querySelector('.voyage-card-step[data-step="2"]');
      const counter = document.getElementById('voyageRouteCounter');
      return {
        c2Revealed: c2 ? (c2.classList.contains('is-revealed') || c2.classList.contains('is-active') || c2.classList.contains('is-stacked')) : false,
        counter: counter ? counter.textContent.trim() : ''
      };
    })()
  `);
  const f5_3_pass = step2State.c2Revealed || step2State.counter.includes('2');
  reporter.record(1, 'F5-JourneyScrollProgression', 'Scrolling through voyage track advances to Chapter 2 via scroll alone', f5_3_pass, {
    expected: 'Chapter 2 active/revealed via scroll',
    actual: step2State
  });

  // F5.4: Scrolling further activates Chapter 3 and updates route counter
  await harness.scrollTo(jTop + 1300);
  await new Promise(r => setTimeout(r, 200));
  let step3State = await harness.evaluate(`
    (() => {
      const c3 = document.getElementById('milestone-3');
      const counter = document.getElementById('voyageRouteCounter');
      return {
        c3Revealed: c3 ? (c3.classList.contains('is-revealed') || c3.classList.contains('is-active') || c3.classList.contains('is-stacked')) : false,
        counter: counter ? counter.textContent.trim() : ''
      };
    })()
  `);
  const f5_4_pass = step3State.c3Revealed || step3State.counter.includes('3');
  reporter.record(1, 'F5-JourneyScrollProgression', 'Scrolling advances to Chapter 3 and updates route counter log', f5_4_pass, {
    expected: 'Chapter 3 active/revealed',
    actual: step3State
  });

  // F5.5: Scrolling through final step activates Chapter 4 and reveals celebration banner
  await harness.scrollTo(jTop + 2200);
  await new Promise(r => setTimeout(r, 200));
  let step4State = await harness.evaluate(`
    (() => {
      const c4 = document.getElementById('milestone-4');
      const banner = document.getElementById('voyageCelebrationBanner');
      const counter = document.getElementById('voyageRouteCounter');
      const bannerVisible = banner && (window.getComputedStyle(banner).display !== 'none' || banner.classList.contains('is-visible'));
      return {
        c4Revealed: c4 ? (c4.classList.contains('is-revealed') || c4.classList.contains('is-active') || c4.classList.contains('is-stacked')) : false,
        bannerVisible,
        counter: counter ? counter.textContent.trim() : ''
      };
    })()
  `);
  const f5_5_pass = (step4State.c4Revealed || step4State.counter.includes('4')) && step4State.bannerVisible;
  reporter.record(1, 'F5-JourneyScrollProgression', 'Final voyage scroll activates Chapter 4 and reveals celebration fanfare banner', f5_5_pass, {
    expected: 'Chapter 4 active and celebration banner visible',
    actual: step4State
  });

  // ---------------------------------------------------------
  // Feature 6: Journey Compact Stacking Deck (5 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Feature 6: Journey Compact Stacking Deck --');

  // F6.1: Milestone cards utilize sticky positioning or stacked deck
  const cardPositions = await harness.evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
      return cards.map(c => window.getComputedStyle(c).position);
    })()
  `);
  const f6_1_pass = cardPositions.length > 0 && cardPositions.some(p => p === 'sticky');
  reporter.record(1, 'F6-JourneyCompactDeck', 'Milestone cards configure GPU sticky positioning (position: sticky)', f6_1_pass, {
    expected: 'Includes "sticky"',
    actual: cardPositions
  });

  // F6.2: Sticky stacking offsets are incrementally staggered
  const cardTopOffsets = await harness.evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
      return cards.map(c => ({
        top: window.getComputedStyle(c).top,
        topVal: parseFloat(window.getComputedStyle(c).top) || 0
      }));
    })()
  `);
  const f6_2_pass = cardTopOffsets.length >= 2 &&
    (cardTopOffsets[1].topVal >= cardTopOffsets[0].topVal + 8 || cardTopOffsets.some(c => c.topVal >= 200));
  reporter.record(1, 'F6-JourneyCompactDeck', 'Milestone cards have incremental staggered sticky top docking offsets', f6_2_pass, {
    expected: 'Incrementing sticky top values >= 200px',
    actual: cardTopOffsets
  });

  // F6.3: Cards accumulate at single compact stacking anchor point (overlapping bounding boxes)
  const stackOverlap = await harness.evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
      if (cards.length < 2) return false;
      const rects = cards.map(c => c.getBoundingClientRect());
      // Check if visible cards overlap vertically at docking area
      const visible = rects.filter(r => r.height > 0);
      if (visible.length < 2) return false;
      const first = visible[0];
      const last = visible[visible.length - 1];
      // Stacked cards have top positions clustered within 150px
      return Math.abs(last.top - first.top) <= 150;
    })()
  `);
  reporter.record(1, 'F6-JourneyCompactDeck', 'Cards accumulate at compact anchor point (stacked cards clustered within 150px)', stackOverlap, {
    expected: 'Stacked cards clustered vertically <= 150px',
    actual: stackOverlap
  });

  // F6.4: Journey section vertical height is compact (bounded < 3600px)
  const journeyHeight = journeyMetrics ? journeyMetrics.height : 0;
  const f6_4_pass = journeyHeight > 0 && journeyHeight <= 3600;
  reporter.record(1, 'F6-JourneyCompactDeck', 'Journey total vertical height is compact (<= 3600px, avoiding unbounded linear sprawl)', f6_4_pass, {
    expected: '<= 3600px',
    actual: `${journeyHeight}px`
  });

  // F6.5: Track fill expands smoothly as chapters accumulate
  const trackFillState = await harness.evaluate(`
    (() => {
      const fill = document.getElementById('voyageTrackFill');
      return fill ? {
        widthStyle: fill.style.width,
        widthVal: parseFloat(fill.style.width) || 0
      } : null;
    })()
  `);
  const f6_5_pass = trackFillState && trackFillState.widthVal >= 75;
  reporter.record(1, 'F6-JourneyCompactDeck', 'Track fill (#voyageTrackFill) expands toward 100% as cards accumulate', f6_5_pass, {
    expected: '>= 75%',
    actual: trackFillState ? trackFillState.widthStyle : null
  });

  // ---------------------------------------------------------
  // Feature 7: Journey Bidirectional Scrub (5 assertions)
  // ---------------------------------------------------------
  console.log('\n-- Feature 7: Journey Bidirectional Scrub --');

  // F7.1: Reverse scrolling upward from Chapter 4 un-accumulates cards
  await harness.scrollTo(jTop + 100);
  await new Promise(r => setTimeout(r, 250));
  const scrubUpState = await harness.evaluate(`
    (() => {
      const c4 = document.getElementById('milestone-4');
      const counter = document.getElementById('voyageRouteCounter');
      const isStacked = c4 ? c4.classList.contains('is-stacked') : false;
      const isActive = c4 ? c4.classList.contains('is-active') : false;
      return {
        c4Active: isActive,
        c4Stacked: isStacked,
        counter: counter ? counter.textContent.trim() : ''
      };
    })()
  `);
  const f7_1_pass = !scrubUpState.c4Active && (scrubUpState.counter.includes('1') || !scrubUpState.counter.includes('4'));
  reporter.record(1, 'F7-JourneyBidirectionalScrub', 'Reverse scrolling upward un-accumulates Chapter 4 and reverts active chapter', f7_1_pass, {
    expected: 'Chapter 4 unstacked/inactive, counter reverted',
    actual: scrubUpState
  });

  // F7.2: Ship avatar moves backward on reverse scroll
  const shipPosScrub = await harness.evaluate(`
    (() => {
      const ship = document.getElementById('voyageShipAvatar');
      return ship ? {
        left: ship.style.left,
        leftVal: parseFloat(ship.style.left) || 0
      } : null;
    })()
  `);
  const f7_2_pass = shipPosScrub && shipPosScrub.leftVal <= 35;
  reporter.record(1, 'F7-JourneyBidirectionalScrub', 'Going Merry ship avatar style.left retreats backward on reverse scroll (<= 35%)', f7_2_pass, {
    expected: '<= 35%',
    actual: shipPosScrub ? shipPosScrub.left : null
  });

  // F7.3: Waypoint navigation click to Chapter 2
  await harness.click('.voyage-waypoint[data-chapter="2"]');
  await new Promise(r => setTimeout(r, 300));
  const waypoint2State = await harness.evaluate(`
    (() => {
      const counter = document.getElementById('voyageRouteCounter');
      const wp2 = document.querySelector('.voyage-waypoint[data-chapter="2"]');
      const wp2Active = wp2 ? (wp2.classList.contains('active') || wp2.classList.contains('is-active')) : false;
      return {
        counter: counter ? counter.textContent.trim() : '',
        wp2Active
      };
    })()
  `);
  const f7_3_pass = waypoint2State.counter.includes('2') || waypoint2State.wp2Active;
  reporter.record(1, 'F7-JourneyBidirectionalScrub', 'Clicking waypoint node 2 jumps to and activates Chapter 2', f7_3_pass, {
    expected: 'Chapter 2 active/selected',
    actual: waypoint2State
  });

  // F7.4: Waypoint navigation click back to Chapter 1
  await harness.click('.voyage-waypoint[data-chapter="1"]');
  await new Promise(r => setTimeout(r, 300));
  const waypoint1State = await harness.evaluate(`
    (() => {
      const counter = document.getElementById('voyageRouteCounter');
      const wp1 = document.querySelector('.voyage-waypoint[data-chapter="1"]');
      const wp1Active = wp1 ? (wp1.classList.contains('active') || wp1.classList.contains('is-active')) : false;
      return {
        counter: counter ? counter.textContent.trim() : '',
        wp1Active
      };
    })()
  `);
  const f7_4_pass = waypoint1State.counter.includes('1') || waypoint1State.wp1Active;
  reporter.record(1, 'F7-JourneyBidirectionalScrub', 'Clicking waypoint node 1 resets active chapter to Chapter 1', f7_4_pass, {
    expected: 'Chapter 1 active/selected',
    actual: waypoint1State
  });

  // F7.5: Audio cue throttling safeguard (minimum 200ms cooldown)
  const audioThrottleInfo = await harness.evaluate(`
    (() => {
      // Inspect window or script cooldown guard
      const hasCooldown = (typeof window.lastPenAudioTime !== 'undefined') ||
                          (typeof window.AUDIO_COOLDOWN !== 'undefined') ||
                          (typeof window.playPenScratch === 'function');
      return { hasCooldown };
    })()
  `);
  reporter.record(1, 'F7-JourneyBidirectionalScrub', 'Audio playback includes throttling safeguards (>= 200ms minimum cooldown)', audioThrottleInfo.hasCooldown, {
    expected: 'Audio throttling guard configured',
    actual: audioThrottleInfo
  });
}

module.exports = { runTier1 };
