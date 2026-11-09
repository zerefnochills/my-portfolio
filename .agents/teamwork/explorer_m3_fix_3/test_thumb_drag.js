const { TestHarness } = require('../../../tests/e2e/harness');

(async () => {
  const harness = new TestHarness();
  try {
    await harness.startServer();
    await harness.launchChrome();
    await harness.navigate('/index.html');
    await harness.setViewport(1440, 900);

    const jTop = await harness.evaluate(() => Math.round(document.getElementById('journey').getBoundingClientRect().top + window.scrollY));
    console.log('Journey top:', jTop);

    // 1. Click Waypoint 4
    await harness.click('.voyage-waypoint[data-chapter="4"]');
    await new Promise(r => setTimeout(r, 200));

    const stateAfterClick = await harness.evaluate(() => ({
      scrollY: window.scrollY,
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      shipLeft: document.getElementById('voyageShipAvatar').style.left,
      card4Active: document.getElementById('milestone-4').classList.contains('is-active')
    }));
    console.log('State right after clicking Waypoint 4:', stateAfterClick);

    // 2. Simulate native scrollbar thumb drag to Chapter 1 position (jTop + 50)
    // In real browser thumb drag, ONLY 'scroll' event fires (no wheel, no touch, no keydown)
    await harness.scrollTo(jTop + 50);
    await new Promise(r => setTimeout(r, 250));

    const stateAfterThumbDrag = await harness.evaluate(() => ({
      scrollY: window.scrollY,
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      shipLeft: document.getElementById('voyageShipAvatar').style.left,
      card1Active: document.getElementById('milestone-1').classList.contains('is-active'),
      card4Active: document.getElementById('milestone-4').classList.contains('is-active')
    }));
    console.log('State after scrollbar thumb drag to Chapter 1 (jTop + 50):', stateAfterThumbDrag);

    // If lockedWaypoint is still freezing the controller:
    // counter will STILL say "Chapter 4 of 4 Unfurled" even though scrollY is at jTop + 50!
    if (stateAfterThumbDrag.counter.includes('Chapter 4')) {
      console.log('BUG CONFIRMED: Journey controller is FROZEN on Chapter 4 after scrollbar drag!');
    } else {
      console.log('Journey controller updated properly.');
    }
  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    await harness.close();
  }
})();
