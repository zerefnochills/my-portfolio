/**
 * ==========================================================
 * PAGE CURTAIN TRANSITION ENGINE
 * Provides smooth, cinematic vertical shutter wipe transitions
 * with retro arcade / One Piece character title marquees.
 * ==========================================================
 */
(function () {
  'use strict';

  const ROUTE_CONFIG = {
    'doodle.html': {
      title: 'DOODLE STUDIO',
      sub: 'ENTERING DIGITAL SKETCHBOOK • CANVAS • INK',
      type: 'doodle',
      colors: ['#09090b', '#dc2626']
    },
    'index.html': {
      title: 'GRAND LINE',
      sub: "RETURNING TO CAPTAIN'S VOYAGE • DEEPAK PANDEY",
      type: 'ship',
      colors: ['#09090b', '#dc2626']
    },
    'stash-trial.html': {
      title: "CAPTAIN'S VAULT",
      sub: 'UNLOCKING SECRET STASH • ฿ 3,000,000,000',
      type: 'chest',
      colors: ['#09090b', '#dc2626']
    },
    'treasure-chest.html': {
      title: 'TREASURE VAULT',
      sub: 'ALL SECRETS UNLOCKED • PIRATE WEALTH',
      type: 'chest',
      colors: ['#09090b', '#dc2626']
    }
  };

  const ICONS = {
    doodle: `
      <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="#facc15" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M26 4 C24 10 16 16 6 26" />
        <path d="M26 4 C18 4 12 12 10 20" stroke-width="2" />
        <path d="M6 26 L10 27 L11 23 Z" fill="#facc15" />
        <circle cx="25" cy="5" r="1.8" fill="#ef4444" />
        <path d="M19 13 L22 10" stroke="#38bdf8" stroke-width="2" />
      </svg>`,
    ship: `
      <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="#facc15" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 22 C10 22 14 26 28 22 C26 27 18 29 4 27 Z" fill="#78350f" stroke="#facc15" />
        <path d="M16 4 V22" stroke="#facc15" stroke-width="2.4" />
        <path d="M16 6 C21 8 23 14 23 16 H16 Z" fill="#ffffff" stroke="#facc15" />
        <path d="M16 8 C11 9 9 15 9 17 H16 Z" fill="#ffffff" stroke="#facc15" />
        <circle cx="27" cy="18" r="3" fill="#f59e0b" stroke="#facc15" />
      </svg>`,
    chest: `
      <svg viewBox="0 0 32 32" width="36" height="36" fill="none" stroke="#facc15" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 14 C4 10 28 10 28 14 V26 C28 27.5 26.5 28 25 28 H7 C5.5 28 4 27.5 4 26 Z" fill="#854d0e" />
        <path d="M4 14 H28" stroke="#facc15" stroke-width="2.4" />
        <circle cx="16" cy="17" r="2.5" fill="#facc15" stroke="#78350f" stroke-width="1.5" />
        <path d="M16 19.5 V22" stroke="#facc15" stroke-width="2" />
        <path d="M11 6 L12 9 M21 6 L20 9" stroke="#facc15" stroke-width="2" />
      </svg>`
  };

  // Synthesized Web Audio swoop/rustle effect
  function playCurtainAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Buffer white noise + lowpass frequency sweep for cinematic whoosh
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.18);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.36);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  let curtainEl = null;
  let panelEl = null;
  let iconEl = null;
  let titleEl = null;
  let subEl = null;

  function ensureCurtainDOM() {
    if (curtainEl && panelEl) return;
    curtainEl = document.getElementById('pageCurtainTransition');
    if (!curtainEl) {
      curtainEl = document.createElement('div');
      curtainEl.id = 'pageCurtainTransition';
      curtainEl.className = 'page-curtain-transition';
      curtainEl.setAttribute('aria-hidden', 'true');
      curtainEl.innerHTML = `
        <div class="page-curtain-panel" id="pageCurtainPanel">
          <div class="page-curtain-content">
            <div class="page-curtain-badge" id="pageCurtainBadge">
              <div class="page-curtain-icon" id="pageCurtainIcon"></div>
              <div class="page-curtain-title" id="pageCurtainTitle"></div>
              <div class="page-curtain-sub" id="pageCurtainSub"></div>
              <div class="page-curtain-track">
                <div class="page-curtain-bar"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(curtainEl);
    }

    panelEl = document.getElementById('pageCurtainPanel');
    iconEl = document.getElementById('pageCurtainIcon');
    titleEl = document.getElementById('pageCurtainTitle');
    subEl = document.getElementById('pageCurtainSub');
  }

  function renderTitleLetters(text, colors) {
    if (!titleEl) return;
    titleEl.innerHTML = '';
    const letters = Array.from(text);
    const nonSpaceCount = letters.filter(c => c !== ' ').length;
    const midPoint = Math.ceil(nonSpaceCount / 2);
    let letterIndex = 0;

    letters.forEach((char, i) => {
      if (char === ' ') {
        const space = document.createElement('span');
        space.className = 'trans-space';
        titleEl.appendChild(space);
      } else {
        const span = document.createElement('span');
        span.className = 'trans-letter';
        
        // Half letter black, half red:
        // First half letters get half-black, second half get half-red
        if (letterIndex < midPoint) {
          span.classList.add('half-black');
        } else {
          span.classList.add('half-red');
        }

        span.style.setProperty('--delay', (i * 0.03) + 's');
        span.textContent = char;
        titleEl.appendChild(span);
        letterIndex++;
      }
    });
  }

  function getTargetKey(url) {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const parts = cleanUrl.split('/');
    const file = parts[parts.length - 1];
    return file || 'index.html';
  }

  function navigate(url, options) {
    ensureCurtainDOM();
    const key = getTargetKey(url);
    const cfg = Object.assign({}, ROUTE_CONFIG[key] || {
      title: 'VOYAGE ONWARD',
      sub: 'SETTING SAIL ACROSS THE GRAND LINE',
      type: 'ship',
      colors: ['#09090b', '#dc2626']
    }, options);

    // Save transition state for entrance on target page
    try {
      sessionStorage.setItem('page_transition_state', JSON.stringify({
        targetKey: key,
        title: cfg.title,
        sub: cfg.sub,
        type: cfg.type
      }));
    } catch (e) { }

    // Render badge content
    if (iconEl) iconEl.innerHTML = ICONS[cfg.type] || ICONS.ship;
    renderTitleLetters(cfg.title, cfg.colors || ['#09090b', '#dc2626']);
    if (subEl) subEl.textContent = cfg.sub;

    // Trigger departure animation (increased duration for cinematic feel)
    playCurtainAudio();
    curtainEl.classList.remove('is-entering', 'reveal-out');
    curtainEl.classList.add('is-active', 'is-leaving');

    setTimeout(function () {
      window.location.href = url;
    }, 780); // Increased from 400ms to 780ms
  }

  function checkEntrance() {
    let pending = null;
    try {
      const raw = sessionStorage.getItem('page_transition_state');
      if (raw) {
        pending = JSON.parse(raw);
        sessionStorage.removeItem('page_transition_state');
      }
    } catch (e) { }

    const urlParams = new URLSearchParams(window.location.search);
    const hasFoldParam = urlParams.get('from') === 'fold' || urlParams.get('from') === 'trans';
    const isTransitioning = document.documentElement.classList.contains('page-is-transitioning');

    if (!pending && !hasFoldParam && !isTransitioning) {
      return;
    }

    ensureCurtainDOM();

    // Start with curtain already smoothly covering the page
    curtainEl.classList.add('is-active', 'is-entering');

    // Pause briefly (80ms) so layout is fully settled behind the curtain,
    // then smoothly slide the curtain down off the screen (reveal-out)
    // without repeating the title pop animation.
    setTimeout(function () {
      curtainEl.classList.add('reveal-out');
    }, 80);

    setTimeout(function () {
      curtainEl.classList.remove('is-active', 'is-entering', 'reveal-out');
      document.documentElement.classList.remove('page-is-transitioning');
      if (panelEl) {
        panelEl.style.transform = '';
      }
    }, 620);
  }

  function resetCurtain() {
    if (curtainEl) {
      curtainEl.classList.remove('is-active', 'is-leaving', 'is-entering', 'reveal-out');
    }
    document.documentElement.classList.remove('page-is-transitioning');
  }

  // Intercept navigation links
  function bindNavLinks() {
    document.addEventListener('click', function (e) {
      // Don't intercept modified clicks (Cmd/Ctrl/Shift/Middle click)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

      // Handle Doodle Studio ribbon button click explicitly
      const doodleBtn = e.target.closest('#sketchbookRibbonBtn');
      if (doodleBtn) {
        e.preventDefault();
        e.stopPropagation();
        navigate('doodle.html');
        return;
      }

      // Handle Secret Stash widget / button click explicitly
      const stashBtn = e.target.closest('#treasureChestBtn, .subtle-stash-link');
      if (stashBtn) {
        const href = stashBtn.getAttribute('href') || 'stash-trial.html';
        if (href.endsWith('.html')) {
          e.preventDefault();
          e.stopPropagation();
          navigate(href);
          return;
        }
      }

      // Handle studio back button explicitly
      const backBtn = e.target.closest('#studioBackBtn, .back-btn, .return-ship-btn');
      if (backBtn) {
        const href = backBtn.getAttribute('href') || 'index.html';
        if (href.endsWith('.html')) {
          e.preventDefault();
          e.stopPropagation();
          navigate(href);
          return;
        }
      }

      // Handle other internal .html links
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Exclude anchors (#), javascript:, mailto:, tel:, external links
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (link.getAttribute('target') === '_blank') return;

      // Only handle local html pages
      if (href.includes('.html')) {
        const cleanHref = href.split('#')[0];
        const isCurrentPage = cleanHref === getTargetKey(window.location.pathname);
        if (isCurrentPage && href.includes('#')) {
          // Internal anchor on current page, let browser handle smoothly
          return;
        }
        e.preventDefault();
        navigate(href);
      }
    }, true); // Capture phase to take precedence
  }

  // Initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bindNavLinks();
      checkEntrance();
    });
  } else {
    bindNavLinks();
    checkEntrance();
  }

  // BFCache handling for back/forward buttons
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      resetCurtain();
    }
  });

  window.addEventListener('popstate', function () {
    resetCurtain();
  });

  // Expose global API
  window.PageTransition = {
    navigate: navigate,
    reset: resetCurtain
  };
})();

