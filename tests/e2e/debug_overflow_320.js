const { TestHarness } = require('./harness');

async function check() {
  const h = new TestHarness();
  await h.startServer();
  await h.launchChrome();
  await h.navigate('/index.html');

  for (const w of [320, 360, 375, 390, 414]) {
    await h.setViewport(w, 700);
    const r = await h.evaluate(`
      (() => {
        const res = [];
        const winW = window.innerWidth;
        const all = document.querySelectorAll('*');
        all.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > winW + 1) {
            res.push({
              tag: el.tagName,
              id: el.id || '',
              className: (typeof el.className === 'string' ? el.className : el.className?.baseVal || '').slice(0, 50),
              right: Math.round(rect.right),
              left: Math.round(rect.left),
              width: Math.round(rect.width)
            });
          }
        });

        // Specifically check Wanted Poster elements:
        const poster = document.querySelector('#wantedPoster');
        const chopper = document.querySelector('.chopper-peeking-wrap');
        const bubble = document.querySelector('#chopperPeekingBubble');
        const note = document.querySelector('.wanted-annotation-note');

        const posterElements = {
          poster: poster ? { rect: poster.getBoundingClientRect() } : null,
          chopper: chopper ? { rect: chopper.getBoundingClientRect() } : null,
          bubble: bubble ? { rect: bubble.getBoundingClientRect() } : null,
          note: note ? { rect: note.getBoundingClientRect() } : null
        };

        return {
          winW,
          docScrollW: document.documentElement.scrollWidth,
          bodyScrollW: document.body.scrollWidth,
          overflowCount: res.length,
          topOverflows: res.slice(0, 10),
          posterElements
        };
      })()
    `);
    console.log(`\n--- Viewport ${w}px ---`);
    console.log(`winW: ${r.winW}, docScrollW: ${r.docScrollW}, bodyScrollW: ${r.bodyScrollW}`);
    console.log('Poster elements:', JSON.stringify(r.posterElements, null, 2));
    if (r.overflowCount > 0) {
      console.log(`Overflow elements count: ${r.overflowCount}`);
      console.log('Top overflows:', r.topOverflows);
    }
  }

  await h.close();
}

check();
