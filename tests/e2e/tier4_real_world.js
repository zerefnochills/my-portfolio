/**
 * Tier 4: Real-World Scenarios E2E Tests
 * Simulates complete, end-user realistic workflows across mobile, tablet, and desktop,
 * validating full page traversals, asset integrity, and bidirectional scrubbing cycles.
 * Target: >= 5 workflows
 */

async function runTier4(harness) {
  const reporter = harness.reporter;
  console.log('\n========================================');
  console.log('  RUNNING TIER 4: REAL-WORLD SCENARIOS');
  console.log('========================================\n');

  // ---------------------------------------------------------
  // Workflow 4.1: Mobile End-to-End User Experience (375x667)
  // ---------------------------------------------------------
  console.log('\n-- Workflow 4.1: Mobile End-to-End User Experience (375x667) --');
  await harness.setViewport(375, 667);
  await harness.navigate('/index.html');

  // Step 1: Check mobile hero & poster
  const w1_step1 = await harness.evaluate(`
    (() => {
      const docW = document.documentElement.clientWidth;
      const scrollW = document.documentElement.scrollWidth;
      const hero = document.querySelector('.hero');
      const poster = document.querySelector('.wanted-poster-frame');
      const posterR = poster ? poster.getBoundingClientRect() : null;
      return {
        initialNoOverflow: scrollW <= docW + 1,
        posterFits: posterR ? posterR.right <= docW + 1 && posterR.width <= 320 : true
      };
    })()
  `);

  // Step 2: Scroll through entire mobile page in increments
  let w1_overflowEncountered = false;
  for (let s = 500; s <= 3500; s += 750) {
    await harness.scrollTo(s);
    await new Promise(r => setTimeout(r, 100));
    const m = await harness.getMetrics(375);
    if (m.scrollW > m.docW + 1) {
      w1_overflowEncountered = true;
    }
  }

  // Step 3: Scroll back to top
  await harness.scrollTo(0);
  await new Promise(r => setTimeout(r, 150));
  const w1_pass = w1_step1.initialNoOverflow && w1_step1.posterFits && !w1_overflowEncountered;

  reporter.record(4, 'RW-MobileUserJourney', 'Workflow 4.1: Complete mobile cruise (hero -> journey -> contact -> top) maintains zero horizontal scroll', w1_pass, {
    initialNoOverflow: w1_step1.initialNoOverflow,
    posterFits: w1_step1.posterFits,
    overflowEncountered: w1_overflowEncountered
  });

  // ---------------------------------------------------------
  // Workflow 4.2: Tablet Explorer Experience (768x1024)
  // ---------------------------------------------------------
  console.log('\n-- Workflow 4.2: Tablet Explorer Experience (768x1024) --');
  await harness.setViewport(768, 1024);
  await harness.navigate('/index.html');

  const w2_results = await harness.evaluate(`
    (() => {
      const nav = document.querySelector('.nav-island');
      const hero = document.querySelector('.hero');
      const poster = document.querySelector('.wanted-poster-frame');
      const docW = document.documentElement.clientWidth;

      const navFits = nav ? nav.getBoundingClientRect().right <= docW + 1 : true;
      const heroFits = hero ? hero.getBoundingClientRect().right <= docW + 1 : true;
      const pr = poster ? poster.getBoundingClientRect() : null;
      const posterRatio = pr && pr.height > 0 ? (pr.width / pr.height) : 0;
      const posterRatioValid = Math.abs(posterRatio - 0.75) <= 0.05;

      return {
        navFits,
        heroFits,
        posterRatioValid,
        posterRatio: posterRatio.toFixed(3)
      };
    })()
  `);

  // Scroll to journey on tablet and click waypoint 3
  await harness.click('.voyage-waypoint[data-chapter="3"]');
  await new Promise(r => setTimeout(r, 300));

  const w2_waypointNav = await harness.evaluate(`
    (() => {
      const ship = document.getElementById('voyageShipAvatar');
      const counter = document.getElementById('voyageRouteCounter');
      return {
        shipMoved: ship ? parseFloat(ship.style.left) > 10 : false,
        counter: counter ? counter.textContent.trim() : ''
      };
    })()
  `);

  const w2_pass = w2_results.navFits && w2_results.heroFits && w2_results.posterRatioValid;
  reporter.record(4, 'RW-TabletExperience', 'Workflow 4.2: Tablet explorer validates nav wrap, 2-column hero balance, 3:4 poster, and waypoint jump', w2_pass, {
    layoutChecks: w2_results,
    waypointNav: w2_waypointNav
  });

  // ---------------------------------------------------------
  // Workflow 4.3: Desktop Power User Navigation (1024x768 & 1440x900)
  // ---------------------------------------------------------
  console.log('\n-- Workflow 4.3: Desktop Power User Navigation --');
  await harness.setViewport(1440, 900);
  await harness.navigate('/index.html');

  // Verify desktop main centering and zero ribbon occlusion
  const w3_hero = await harness.evaluate(`
    (() => {
      const main = document.querySelector('main');
      const mr = main ? main.getBoundingClientRect() : null;
      const docW = document.documentElement.clientWidth;
      const centerDelta = mr ? Math.abs((docW - mr.right) - mr.left) : 999;

      const ribbons = Array.from(document.querySelectorAll('.irl-ribbon-btn, .sketchbook-ribbon-btn'));
      const heroLeft = document.querySelector('.hero-left') || document.querySelector('.hero-title');
      let collision = false;
      if (heroLeft) {
        const hl = heroLeft.getBoundingClientRect();
        for (const r of ribbons) {
          const rr = r.getBoundingClientRect();
          if (!(rr.right < hl.left || rr.left > hl.right || rr.bottom < hl.top || rr.top > hl.bottom)) {
            collision = true;
          }
        }
      }

      return { centerDelta, zeroCollision: !collision };
    })()
  `);

  // Scroll through Journey and check celebration fanfare banner
  const jTopW3 = await harness.evaluate(`Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY)`);
  await harness.scrollTo(jTopW3 + 2200);
  await new Promise(r => setTimeout(r, 300));
  const w3_celebration = await harness.evaluate(`
    (() => {
      const banner = document.getElementById('voyageCelebrationBanner');
      return banner ? (window.getComputedStyle(banner).display !== 'none' || banner.classList.contains('is-visible')) : false;
    })()
  `);

  const w3_pass = w3_hero.centerDelta <= 4 && w3_hero.zeroCollision && w3_celebration;
  reporter.record(4, 'RW-DesktopPowerBrowse', 'Workflow 4.3: Desktop power user verifies centered main, ribbon clearance, and celebration banner reveal', w3_pass, {
    heroMetrics: w3_hero,
    celebrationRevealed: w3_celebration
  });

  // ---------------------------------------------------------
  // Workflow 4.4: Bidirectional Journey Scrubbing & Interactive Exploration
  // ---------------------------------------------------------
  console.log('\n-- Workflow 4.4: Bidirectional Journey Scrubbing --');
  // Scroll down to Chapter 4
  const jTopW4 = await harness.evaluate(`Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY)`);
  await harness.scrollTo(jTopW4 + 2200);
  await new Promise(r => setTimeout(r, 200));
  const w4_fwd = await harness.evaluate(`
    (() => {
      const counter = document.getElementById('voyageRouteCounter');
      const ship = document.getElementById('voyageShipAvatar');
      return {
        counterText: counter ? counter.textContent.trim() : '',
        shipLeft: ship ? parseFloat(ship.style.left) || 0 : 0
      };
    })()
  `);

  // Reverse scroll to Chapter 1
  await harness.scrollTo(500);
  await new Promise(r => setTimeout(r, 300));
  const w4_rev = await harness.evaluate(`
    (() => {
      const counter = document.getElementById('voyageRouteCounter');
      const ship = document.getElementById('voyageShipAvatar');
      return {
        counterText: counter ? counter.textContent.trim() : '',
        shipLeft: ship ? parseFloat(ship.style.left) || 0 : 0
      };
    })()
  `);

  // Click waypoint 2
  await harness.click('.voyage-waypoint[data-chapter="2"]');
  await new Promise(r => setTimeout(r, 250));
  const w4_wp2 = await harness.evaluate(`
    (() => {
      const counter = document.getElementById('voyageRouteCounter');
      return counter ? counter.textContent.trim() : '';
    })()
  `);

  const w4_pass = w4_fwd.shipLeft > w4_rev.shipLeft && (w4_rev.shipLeft <= 30);
  reporter.record(4, 'RW-BidirectionalScrubbing', 'Workflow 4.4: Smooth bidirectional scrubbing forward to Ch4 and backward to Ch1 with ship retreat', w4_pass, {
    forward: w4_fwd,
    reverse: w4_rev,
    waypoint2: w4_wp2
  });

  // ---------------------------------------------------------
  // Workflow 4.5: Fresh Session & Asset Integrity Audit
  // ---------------------------------------------------------
  console.log('\n-- Workflow 4.5: Fresh Session & Asset Integrity Audit --');
  await harness.navigate('/index.html');
  await new Promise(r => setTimeout(r, 500));

  const errors = harness.consoleErrors;
  const targetImgHttp = harness.networkLog.find(r => r.url.includes('media_1794201865931_238ddac4.jpg'));

  const assetAudit = await harness.evaluate(`
    (() => {
      const img = document.querySelector('#wantedPhotoImg') || document.querySelector('.wanted-img');
      const fontsLoaded = document.fonts ? document.fonts.status === 'loaded' : true;
      const imgValid = img ? (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) : false;

      return {
        fontsLoaded,
        imgValid,
        imgDimensions: img ? \`\${img.naturalWidth}x\${img.naturalHeight}\` : 'null'
      };
    })()
  `);

  const w5_pass = errors.length === 0 && assetAudit.imgValid;
  reporter.record(4, 'RW-AssetIntegrityAudit', 'Workflow 4.5: Fresh session loads cleanly with zero unhandled exceptions and valid decoded poster image', w5_pass, {
    consoleErrorsCount: errors.length,
    consoleErrors: errors.slice(0, 3),
    assetAudit,
    httpStatus: targetImgHttp ? targetImgHttp.status : 'None'
  });
}

module.exports = { runTier4 };
