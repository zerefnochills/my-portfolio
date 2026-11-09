const { TestHarness } = require('./tests/e2e/harness.js');

(async () => {
  const h = new TestHarness();
  await h.startServer();
  await h.launchChrome();
  await h.setViewport(1440, 900);
  await h.navigate('/index.html');
  const res = await h.evaluate(`(() => {
    const el = document.getElementById('journey');
    const r = el.getBoundingClientRect();
    const steps = Array.from(document.querySelectorAll('.voyage-card-step')).map(s => {
      const sr = s.getBoundingClientRect();
      return { step: s.getAttribute('data-step'), top: Math.round(sr.top + window.scrollY), height: Math.round(sr.height) };
    });
    return {
      offsetTop: el.offsetTop,
      rectTop: Math.round(r.top + window.scrollY),
      steps
    };
  })()`);
  console.log(JSON.stringify(res, null, 2));

  // Also test scrolling to jTop + 100, jTop + 650, jTop + 1300, 3200, 3500, 4200
  const jTop = res.rectTop;
  const positions = [
    { name: 'jTop + 100', y: jTop + 100 },
    { name: '3200', y: 3200 },
    { name: '3500', y: 3500 },
    { name: 'jTop + 650', y: jTop + 650 },
    { name: '4200', y: 4200 },
    { name: 'jTop + 1300', y: jTop + 1300 },
    { name: 'jTop + 2200', y: jTop + 2200 }
  ];

  for (const pos of positions) {
    await h.scrollTo(pos.y);
    await new Promise(r => setTimeout(r, 200));
    const state = await h.evaluate(`(() => {
      const c1 = document.getElementById('milestone-1');
      const c2 = document.getElementById('milestone-2');
      const c3 = document.getElementById('milestone-3');
      const c4 = document.getElementById('milestone-4');
      const banner = document.getElementById('voyageCelebrationBanner');
      const counter = document.getElementById('voyageRouteCounter');
      const ship = document.getElementById('voyageShipAvatar');
      return {
        scrollY: window.scrollY,
        c1Revealed: c1 ? c1.classList.contains('is-revealed') : false,
        c2Revealed: c2 ? c2.classList.contains('is-revealed') : false,
        c3Revealed: c3 ? c3.classList.contains('is-revealed') : false,
        c4Revealed: c4 ? c4.classList.contains('is-revealed') : false,
        bannerVisible: banner ? (window.getComputedStyle(banner).display !== 'none' || banner.classList.contains('is-visible')) : false,
        counter: counter ? counter.textContent.trim() : '',
        shipLeft: ship ? ship.style.left : ''
      };
    })()`);
    console.log(pos.name + ' (' + pos.y + '):', JSON.stringify(state));
  }

  await h.close();
})();
