const path = require('path');
const { TestHarness } = require('../../../tests/e2e/harness');

async function testWp2() {
  const harness = new TestHarness();
  try {
    await harness.startServer();
    await harness.launchChrome();
    await harness.navigate('/index.html');

    const res = await harness.evaluate(`(() => {
      const step2 = document.getElementById('step-2');
      const card2 = document.getElementById('milestone-2');
      
      const stepDocTop = step2.getBoundingClientRect().top + window.scrollY;
      const cardDocTop = card2.getBoundingClientRect().top + window.scrollY;
      const dockTop = parseFloat(window.getComputedStyle(card2).top);
      const targetY = Math.round(stepDocTop - dockTop);

      // Now scroll to targetY
      window.scrollTo(0, targetY);
      window.dispatchEvent(new Event('scroll'));

      const rectAfter = card2.getBoundingClientRect();

      return {
        stepDocTop,
        cardDocTop,
        dockTop,
        targetY,
        cardTopAfterScroll: rectAfter.top,
        diff: cardDocTop - stepDocTop
      };
    })()`);

    console.log('WP2 analysis:', JSON.stringify(res, null, 2));
  } finally {
    await harness.close();
  }
}

testWp2().catch(console.error);
