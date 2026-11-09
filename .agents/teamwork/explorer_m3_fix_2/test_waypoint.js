const { TestHarness } = require('../../../tests/e2e/harness');

async function run() {
  const harness = new TestHarness();
  await harness.startServer();
  await harness.launchChrome();

  console.log('--- DESKTOP (1440x900) ---');
  await harness.setViewport(1440, 900);
  await harness.navigate('/index.html');
  await new Promise(r => setTimeout(r, 400));

  for (let n = 1; n <= 4; n++) {
    // Jump to chapter n using formula:
    await harness.evaluate(`
      (() => {
        const targetN = ${n};
        const stepEl = document.getElementById('step-' + targetN);
        const cardEl = document.getElementById('milestone-' + targetN);
        const stepDocTop = stepEl.getBoundingClientRect().top + window.scrollY;
        const dockTop = parseFloat(window.getComputedStyle(cardEl).top) || 220;

        const targetY = Math.round(stepDocTop - dockTop);
        window.scrollTo({ top: targetY, behavior: 'instant' });
      })()
    `);

    // Wait 400ms for CSS transition (0.35s) to settle
    await new Promise(r => setTimeout(r, 400));

    const res = await harness.evaluate(`
      (() => {
        const targetN = ${n};
        const cardEl = document.getElementById('milestone-' + targetN);
        const dockTop = parseFloat(window.getComputedStyle(cardEl).top) || 220;
        const cRect = cardEl.getBoundingClientRect();
        return {
          targetN,
          dockTop,
          scrollY: window.scrollY,
          cardTop: Math.round(cRect.top),
          cardBottom: Math.round(cRect.bottom),
          dockedCorrectly: Math.abs(Math.round(cRect.top) - Math.round(dockTop)) <= 2
        };
      })()
    `);
    console.log('Chapter ' + n + ' (after 400ms settle):', res);
  }

  console.log('\n--- MOBILE (375x667) ---');
  await harness.setViewport(375, 667);
  await harness.navigate('/index.html');
  await new Promise(r => setTimeout(r, 400));

  for (let n = 1; n <= 4; n++) {
    await harness.evaluate(`
      (() => {
        const targetN = ${n};
        const stepEl = document.getElementById('step-' + targetN);
        const cardEl = document.getElementById('milestone-' + targetN);
        const stepDocTop = stepEl.getBoundingClientRect().top + window.scrollY;
        const dockTop = parseFloat(window.getComputedStyle(cardEl).top) || 190;

        const targetY = Math.round(stepDocTop - dockTop);
        window.scrollTo({ top: targetY, behavior: 'instant' });
      })()
    `);

    await new Promise(r => setTimeout(r, 400));

    const res = await harness.evaluate(`
      (() => {
        const targetN = ${n};
        const cardEl = document.getElementById('milestone-' + targetN);
        const dockTop = parseFloat(window.getComputedStyle(cardEl).top) || 190;
        const cRect = cardEl.getBoundingClientRect();
        return {
          targetN,
          dockTop,
          scrollY: window.scrollY,
          cardTop: Math.round(cRect.top),
          cardBottom: Math.round(cRect.bottom),
          dockedCorrectly: Math.abs(Math.round(cRect.top) - Math.round(dockTop)) <= 2
        };
      })()
    `);
    console.log('Mobile Chapter ' + n + ' (after 400ms settle):', res);
  }

  await harness.close();
}

run().catch(console.error);
