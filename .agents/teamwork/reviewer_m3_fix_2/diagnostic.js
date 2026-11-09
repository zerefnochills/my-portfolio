const path = require('path');
const { TestHarness } = require('../../../tests/e2e/harness');

async function testDocking() {
  const harness = new TestHarness();
  try {
    await harness.startServer();
    await harness.launchChrome();
    await harness.navigate('/index.html');

    const viewports = [
      { name: 'Desktop-1440', w: 1440, h: 900 },
      { name: 'Desktop-1024', w: 1024, h: 768 },
      { name: 'Tablet-768', w: 768, h: 1024 },
      { name: 'Mobile-375', w: 375, h: 667 }
    ];

    for (const vp of viewports) {
      await harness.setViewport(vp.w, vp.h);
      await new Promise(r => setTimeout(r, 200));

      const res = await harness.evaluate(`(() => {
        const track = document.getElementById('voyageDeckTrack');
        const trackTop = track.getBoundingClientRect().top + window.scrollY;
        
        // Let's test waypoint 4 click:
        const wp4 = document.querySelector('.voyage-waypoint[data-chapter="4"]');
        wp4.click();

        const cards = Array.from(document.querySelectorAll('.voyage-milestone-card'));
        const rects = cards.map(c => c.getBoundingClientRect());
        const minY = Math.min(...rects.map(r => r.top));
        const maxY = Math.max(...rects.map(r => r.bottom));
        const envelopeHeight = maxY - minY;

        return {
          scrollY: window.scrollY,
          trackTop,
          envelopeHeight,
          tops: rects.map(r => Math.round(r.top)),
          bottoms: rects.map(r => Math.round(r.bottom)),
          heights: rects.map(r => Math.round(r.height)),
          positions: cards.map(c => window.getComputedStyle(c).position),
          stickyTops: cards.map(c => window.getComputedStyle(c).top)
        };
      })()`);

      console.log(`[${vp.name}] When Waypoint 4 is clicked:`);
      console.log(`  Envelope Height: ${res.envelopeHeight.toFixed(1)}px (tops: ${res.tops.join(', ')})`);
      console.log(`  Card heights: ${res.heights.join(', ')}`);
      console.log(`  Positions: ${res.positions.join(', ')}`);
      console.log(`  Sticky tops: ${res.stickyTops.join(', ')}`);
      console.log(`  Window scrollY: ${res.scrollY}`);
    }
  } finally {
    await harness.close();
  }
}

testDocking().catch(console.error);
