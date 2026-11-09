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

    // Inject our proposed unlock mechanism into the live page to test its behavior
    await harness.evaluate(() => {
      // Find the existing journey controller or patch its listeners
      let waypointLockTimer = null;
      let lastWaypointTargetY = null;

      window.__testClearLock = function() {
        if (waypointLockTimer) {
          clearTimeout(waypointLockTimer);
          waypointLockTimer = null;
        }
        window.testLockedWaypoint = null;
        lastWaypointTargetY = null;
      };

      // Listen for scrollend
      if ('onscrollend' in window) {
        window.addEventListener('scrollend', window.__testClearLock, { passive: true });
      }

      // User gesture listeners
      window.addEventListener('wheel', window.__testClearLock, { passive: true });
      window.addEventListener('touchmove', window.__testClearLock, { passive: true });
      window.addEventListener('keydown', window.__testClearLock, { passive: true });
    });

    console.log('Tested patch injection readiness.');
  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    await harness.close();
  }
})();
