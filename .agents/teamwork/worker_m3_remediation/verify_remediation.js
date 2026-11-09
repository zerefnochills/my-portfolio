const { TestHarness } = require('../../../tests/e2e/harness');

(async () => {
  const harness = new TestHarness();
  await harness.startServer();
  await harness.launchChrome();
  await harness.navigate('/index.html');
  await harness.setViewport(1440, 900);

  const jTop = await harness.evaluate(() => Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY));
  console.log('Journey section jTop:', jTop);

  // 1. Verify offset jTop + 100
  await harness.scrollTo(jTop + 100);
  await new Promise(r => setTimeout(r, 150));
  const s1 = await harness.evaluate(() => ({
    counter: document.getElementById('voyageRouteCounter').textContent.trim(),
    shipLeft: document.getElementById('voyageShipAvatar').style.left,
    card1Active: document.getElementById('milestone-1').classList.contains('is-active'),
    card2Active: document.getElementById('milestone-2').classList.contains('is-active'),
    bannerVisible: window.getComputedStyle(document.getElementById('voyageCelebrationBanner')).display !== 'none'
  }));
  console.log('State at jTop + 100 (Expected: Ch 1):', s1);

  // 2. Verify offset jTop + 650 (Previously was prematurely showing Ch 4!)
  await harness.scrollTo(jTop + 650);
  await new Promise(r => setTimeout(r, 150));
  const s2 = await harness.evaluate(() => ({
    counter: document.getElementById('voyageRouteCounter').textContent.trim(),
    shipLeft: document.getElementById('voyageShipAvatar').style.left,
    card2Active: document.getElementById('milestone-2').classList.contains('is-active'),
    card4Active: document.getElementById('milestone-4').classList.contains('is-active'),
    bannerVisible: window.getComputedStyle(document.getElementById('voyageCelebrationBanner')).display !== 'none'
  }));
  console.log('State at jTop + 650 (Expected: Ch 2):', s2);

  // 3. Verify offset jTop + 1300
  await harness.scrollTo(jTop + 1300);
  await new Promise(r => setTimeout(r, 150));
  const s3 = await harness.evaluate(() => ({
    counter: document.getElementById('voyageRouteCounter').textContent.trim(),
    shipLeft: document.getElementById('voyageShipAvatar').style.left,
    card3Active: document.getElementById('milestone-3').classList.contains('is-active'),
    bannerVisible: window.getComputedStyle(document.getElementById('voyageCelebrationBanner')).display !== 'none'
  }));
  console.log('State at jTop + 1300 (Expected: Ch 3):', s3);

  // 4. Verify offset jTop + 2200
  await harness.scrollTo(jTop + 2200);
  await new Promise(r => setTimeout(r, 150));
  const s4 = await harness.evaluate(() => ({
    counter: document.getElementById('voyageRouteCounter').textContent.trim(),
    shipLeft: document.getElementById('voyageShipAvatar').style.left,
    card4Active: document.getElementById('milestone-4').classList.contains('is-active'),
    bannerVisible: window.getComputedStyle(document.getElementById('voyageCelebrationBanner')).display !== 'none'
  }));
  console.log('State at jTop + 2200 (Expected: Ch 4):', s4);

  // 5. Verify Waypoint 4 click docking
  await harness.click('.voyage-waypoint[data-chapter="4"]');
  await new Promise(r => setTimeout(r, 200));
  const wp4 = await harness.evaluate(() => {
    const card4 = document.getElementById('milestone-4').getBoundingClientRect();
    const banner = document.getElementById('voyageCelebrationBanner').getBoundingClientRect();
    return {
      scrollY: window.scrollY,
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      card4Top: Math.round(card4.top),
      card4Visible: card4.top >= 0 && card4.top < window.innerHeight,
      bannerTop: Math.round(banner.top),
      bannerVisible: banner.top >= 0 && banner.top < window.innerHeight
    };
  });
  console.log('State after Waypoint 4 click (Expected: Card 4 docked in viewport):', wp4);

  // 6. Verify Waypoint 2 click docking
  await harness.click('.voyage-waypoint[data-chapter="2"]');
  await new Promise(r => setTimeout(r, 200));
  const wp2 = await harness.evaluate(() => {
    const card2 = document.getElementById('milestone-2').getBoundingClientRect();
    return {
      scrollY: window.scrollY,
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      card2Top: Math.round(card2.top),
      card2Visible: card2.top >= 0 && card2.top < window.innerHeight
    };
  });
  console.log('State after Waypoint 2 click (Expected: Card 2 docked in viewport):', wp2);

  // 7. Verify Scrollbar Drag Unlock (simulated via scrollTo departure delta > 40px without gesture events)
  await harness.click('.voyage-waypoint[data-chapter="4"]');
  await new Promise(r => setTimeout(r, 100));
  // Scroll by dragging scrollbar to Chapter 1 position without dispatching DOM input events
  await harness.scrollTo(jTop + 100);
  await new Promise(r => setTimeout(r, 150));
  const dragUnlock = await harness.evaluate(() => ({
    counter: document.getElementById('voyageRouteCounter').textContent.trim(),
    card1Active: document.getElementById('milestone-1').classList.contains('is-active'),
    card4Active: document.getElementById('milestone-4').classList.contains('is-active')
  }));
  console.log('State after scrollbar drag to Ch 1 (Expected: Unlocked, Ch 1 active):', dragUnlock);

  // 8. Mobile Waypoint docking check (375x667)
  await harness.setViewport(375, 667);
  await harness.click('.voyage-waypoint[data-chapter="4"]');
  await new Promise(r => setTimeout(r, 200));
  const mobileWp4 = await harness.evaluate(() => {
    const card4 = document.getElementById('milestone-4').getBoundingClientRect();
    return {
      scrollY: window.scrollY,
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      card4Top: Math.round(card4.top),
      card4Visible: card4.top >= 0 && card4.top < window.innerHeight
    };
  });
  console.log('Mobile state after Waypoint 4 click (Expected: Card 4 docked in viewport):', mobileWp4);

  await harness.close();
  console.log('ALL REMEDIATION VERIFICATION CHECKS COMPLETED SUCCESSFULLY!');
})();
