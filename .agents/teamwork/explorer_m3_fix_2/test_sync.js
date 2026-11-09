const { TestHarness } = require('../../../tests/e2e/harness');

async function testSync() {
  const harness = new TestHarness();
  await harness.startServer();
  await harness.launchChrome();
  await harness.setViewport(1440, 900);
  await harness.navigate('/index.html');
  await new Promise(r => setTimeout(r, 400));

  const result = await harness.evaluate(() => {
    const track = document.getElementById('voyageDeckTrack');
    const trackDocTop = track.getBoundingClientRect().top + window.scrollY;
    const steps = Array.from(document.querySelectorAll('.voyage-card-step'));
    const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));

    const testPoints = [];
    for (let n = 1; n <= 4; n++) {
      const stepEl = steps[n - 1];
      const cardEl = cards[n - 1];
      const stepDocTop = stepEl.getBoundingClientRect().top + window.scrollY;
      const dockTop = parseFloat(window.getComputedStyle(cardEl).top) || 220;
      const targetY = Math.round(stepDocTop - dockTop);

      testPoints.push({
        chapter: n,
        stepDocTop,
        dockTop,
        targetY
      });
    }

    return {
      trackDocTop,
      testPoints
    };
  });

  console.log('Synchronization Test Points:', JSON.stringify(result, null, 2));
  await harness.close();
}

testSync().catch(console.error);
