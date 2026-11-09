const { TestHarness } = require('../../../tests/e2e/harness');

(async () => {
  const harness = new TestHarness();
  await harness.startServer();
  await harness.launchChrome();
  await harness.navigate('/index.html');
  await harness.setViewport(1440, 900);

  const jTop = await harness.evaluate(`Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY)`);
  console.log('AUDIT: jTop =', jTop);

  // Test offset 100 (relY = 100)
  await harness.scrollTo(jTop + 100);
  await new Promise(r => setTimeout(r, 120));
  const s100 = await harness.evaluate(`
    (() => ({
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      shipLeft: document.getElementById('voyageShipAvatar').style.left,
      bannerDisplay: window.getComputedStyle(document.getElementById('voyageCelebrationBanner')).display,
      c1Active: document.getElementById('milestone-1').classList.contains('is-active'),
      c2Active: document.getElementById('milestone-2').classList.contains('is-active')
    }))()
  `);
  console.log('AUDIT: State at jTop + 100:', JSON.stringify(s100));

  // Test offset 650 (relY = 650) - Reviewer 1's key finding
  await harness.scrollTo(jTop + 650);
  await new Promise(r => setTimeout(r, 120));
  const s650 = await harness.evaluate(`
    (() => ({
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      shipLeft: document.getElementById('voyageShipAvatar').style.left,
      bannerDisplay: window.getComputedStyle(document.getElementById('voyageCelebrationBanner')).display,
      c2Active: document.getElementById('milestone-2').classList.contains('is-active'),
      c4Active: document.getElementById('milestone-4').classList.contains('is-active')
    }))()
  `);
  console.log('AUDIT: State at jTop + 650:', JSON.stringify(s650));

  // Test offset 1300 (relY = 1300)
  await harness.scrollTo(jTop + 1300);
  await new Promise(r => setTimeout(r, 120));
  const s1300 = await harness.evaluate(`
    (() => ({
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      shipLeft: document.getElementById('voyageShipAvatar').style.left,
      bannerDisplay: window.getComputedStyle(document.getElementById('voyageCelebrationBanner')).display,
      c3Active: document.getElementById('milestone-3').classList.contains('is-active'),
      c4Active: document.getElementById('milestone-4').classList.contains('is-active')
    }))()
  `);
  console.log('AUDIT: State at jTop + 1300:', JSON.stringify(s1300));

  // Test offset 2200 (relY = 2200)
  await harness.scrollTo(jTop + 2200);
  await new Promise(r => setTimeout(r, 120));
  const s2200 = await harness.evaluate(`
    (() => ({
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      shipLeft: document.getElementById('voyageShipAvatar').style.left,
      bannerDisplay: window.getComputedStyle(document.getElementById('voyageCelebrationBanner')).display,
      c4Active: document.getElementById('milestone-4').classList.contains('is-active'),
      c4Top: Math.round(document.getElementById('milestone-4').getBoundingClientRect().top)
    }))()
  `);
  console.log('AUDIT: State at jTop + 2200:', JSON.stringify(s2200));

  // Test Waypoint 4 click
  await harness.click('.voyage-waypoint[data-chapter="4"]');
  await new Promise(r => setTimeout(r, 250));
  const wp4State = await harness.evaluate(`
    (() => ({
      scrollY: window.scrollY,
      card4Top: Math.round(document.getElementById('milestone-4').getBoundingClientRect().top),
      card4Visible: document.getElementById('milestone-4').getBoundingClientRect().top >= 0 &&
                    document.getElementById('milestone-4').getBoundingClientRect().top < window.innerHeight,
      counter: document.getElementById('voyageRouteCounter').textContent.trim()
    }))()
  `);
  console.log('AUDIT: State after Waypoint 4 click:', JSON.stringify(wp4State));

  // Test Waypoint 2 click
  await harness.click('.voyage-waypoint[data-chapter="2"]');
  await new Promise(r => setTimeout(r, 250));
  const wp2State = await harness.evaluate(`
    (() => ({
      scrollY: window.scrollY,
      card2Top: Math.round(document.getElementById('milestone-2').getBoundingClientRect().top),
      card2Visible: document.getElementById('milestone-2').getBoundingClientRect().top >= 0 &&
                    document.getElementById('milestone-2').getBoundingClientRect().top < window.innerHeight,
      counter: document.getElementById('voyageRouteCounter').textContent.trim()
    }))()
  `);
  console.log('AUDIT: State after Waypoint 2 click:', JSON.stringify(wp2State));

  // Test Scrollbar Drag Lock release (simulate programmatic scroll departure delta without wheel/key)
  await harness.scrollTo(jTop + 100);
  await harness.evaluate(`window.dispatchEvent(new Event('scroll'))`);
  await new Promise(r => setTimeout(r, 120));
  const dragReleaseState = await harness.evaluate(`
    (() => ({
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      c1Active: document.getElementById('milestone-1').classList.contains('is-active')
    }))()
  `);
  console.log('AUDIT: State after scrollbar departure:', JSON.stringify(dragReleaseState));

  // Mobile check (375x667)
  await harness.setViewport(375, 667);
  const jTopMob = await harness.evaluate(`Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY)`);
  await harness.scrollTo(jTopMob + 600); // 460 <= relY < 920 -> Ch 2
  await new Promise(r => setTimeout(r, 120));
  const mob600 = await harness.evaluate(`
    (() => ({
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      c2Active: document.getElementById('milestone-2').classList.contains('is-active')
    }))()
  `);
  console.log('AUDIT: Mobile state at jTop + 600:', JSON.stringify(mob600));

  await harness.click('.voyage-waypoint[data-chapter="4"]');
  await new Promise(r => setTimeout(r, 250));
  const mobWp4 = await harness.evaluate(`
    (() => ({
      scrollY: window.scrollY,
      card4Top: Math.round(document.getElementById('milestone-4').getBoundingClientRect().top),
      card4Visible: document.getElementById('milestone-4').getBoundingClientRect().top >= 0 &&
                    document.getElementById('milestone-4').getBoundingClientRect().top < window.innerHeight,
      counter: document.getElementById('voyageRouteCounter').textContent.trim()
    }))()
  `);
  console.log('AUDIT: Mobile state after Waypoint 4 click:', JSON.stringify(mobWp4));

  await harness.close();
  console.log('AUDIT: SUCCESS');
})().catch(err => {
  console.error('AUDIT ERROR:', err);
  process.exit(1);
});
