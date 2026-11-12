/**
 * E2E Test Harness for Portfolio Modernization
 * Provides Headless Chrome CDP controller, static HTTP server,
 * network logger, viewport emulator, and test assertion reporter.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

class AssertionReporter {
  constructor() {
    this.results = [];
    this.tiers = {
      1: { name: 'Tier 1: Feature Coverage', assertions: 0, passed: 0, failed: 0 },
      2: { name: 'Tier 2: Boundary & Corner Cases', assertions: 0, passed: 0, failed: 0 },
      3: { name: 'Tier 3: Cross-Feature Combinations', assertions: 0, passed: 0, failed: 0 },
      4: { name: 'Tier 4: Real-World Scenarios', assertions: 0, passed: 0, failed: 0 }
    };
  }

  record(tier, feature, name, passed, details = {}) {
    const record = {
      tier,
      feature,
      name,
      passed: Boolean(passed),
      details,
      timestamp: new Date().toISOString()
    };
    this.results.push(record);
    if (this.tiers[tier]) {
      this.tiers[tier].assertions++;
      if (passed) {
        this.tiers[tier].passed++;
      } else {
        this.tiers[tier].failed++;
      }
    }
    const icon = passed ? '\x1b[32m✔\x1b[0m' : '\x1b[31m✖\x1b[0m';
    const statusText = passed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`  ${icon} [T${tier}][${feature}] ${name} -> ${statusText}`);
    if (!passed && details.error) {
      console.log(`     \x1b[33mReason:\x1b[0m ${details.error}`);
      if (details.expected !== undefined && details.actual !== undefined) {
        console.log(`     \x1b[33mExpected:\x1b[0m ${JSON.stringify(details.expected)}`);
        console.log(`     \x1b[33mActual:\x1b[0m   ${JSON.stringify(details.actual)}`);
      }
    }
  }

  summary() {
    const totalAssertions = this.results.length;
    const totalPassed = this.results.filter(r => r.passed).length;
    const totalFailed = totalAssertions - totalPassed;

    return {
      totalAssertions,
      totalPassed,
      totalFailed,
      successRate: totalAssertions > 0 ? ((totalPassed / totalAssertions) * 100).toFixed(1) + '%' : '0%',
      tiers: this.tiers,
      failures: this.results.filter(r => !r.passed)
    };
  }
}

class TestHarness {
  constructor(rootDir = path.resolve(__dirname, '../..')) {
    this.rootDir = rootDir;
    this.server = null;
    this.serverPort = 0;
    this.chromeProcess = null;
    this.cdpPort = 0;
    this.ws = null;
    this.msgId = 1;
    this.pendingCallbacks = new Map();
    this.tempUserDataDir = null;
    this.networkLog = [];
    this.consoleLogs = [];
    this.consoleErrors = [];
    this.reporter = new AssertionReporter();
  }

  async startServer(port = 0) {
    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        let reqPath = decodeURI(req.url.split('?')[0]);
        if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
        const normalized = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(this.rootDir, normalized);

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            this.networkLog.push({
              url: req.url,
              method: req.method,
              status: 404,
              time: Date.now()
            });
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
          }
          const ext = path.extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';
          this.networkLog.push({
            url: req.url,
            method: req.method,
            status: 200,
            contentType,
            size: stats.size,
            time: Date.now()
          });
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stats.size,
            'Access-Control-Allow-Origin': '*'
          });
          fs.createReadStream(filePath).pipe(res);
        });
      });

      this.server.on('error', reject);
      this.server.listen(port, '127.0.0.1', () => {
        this.serverPort = this.server.address().port;
        resolve(this.serverPort);
      });
    });
  }

  locateChrome() {
    const candidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
    throw new Error('No supported Chrome or Edge browser executable found on system');
  }

  async launchChrome() {
    const chromePath = this.locateChrome();
    this.tempUserDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-portfolio-cdp-'));
    this.cdpPort = 9222 + Math.floor(Math.random() * 500);

    const args = [
      '--headless=new',
      `--remote-debugging-port=${this.cdpPort}`,
      `--user-data-dir=${this.tempUserDataDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-background-networking',
      '--disable-extensions',
      '--disable-sync',
      '--window-size=1440,900',
      'about:blank'
    ];

    this.chromeProcess = spawn(chromePath, args, { stdio: 'ignore' });

    // Poll until debugging port is alive and retrieve page target
    let connected = false;
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${this.cdpPort}/json`);
        if (res.ok) {
          const targets = await res.json();
          const pageTarget = targets.find(t => t.type === 'page') || targets[0];
          if (pageTarget && pageTarget.webSocketDebuggerUrl) {
            this.ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
            await new Promise((r, rej) => {
              this.ws.onopen = r;
              this.ws.onerror = rej;
            });
            connected = true;
            break;
          }
        }
      } catch (err) {
        await new Promise(r => setTimeout(r, 150));
      }
    }

    if (!connected) {
      throw new Error(`Failed to connect to Chrome DevTools Protocol on port ${this.cdpPort}`);
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pendingCallbacks.has(msg.id)) {
          const cb = this.pendingCallbacks.get(msg.id);
          this.pendingCallbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else cb.resolve(msg.result);
        } else if (msg.method) {
          this.handleCdpEvent(msg.method, msg.params);
        }
      } catch (e) {
        // Ignore parse errors on raw stream
      }
    };

    // Enable domains
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('DOM.enable');
    await this.send('Network.enable');
  }

  handleCdpEvent(method, params) {
    if (method === 'Runtime.consoleAPICalled') {
      const text = params.args ? params.args.map(a => a.value || a.description || '').join(' ') : '';
      this.consoleLogs.push({ type: params.type, text, timestamp: params.timestamp });
      if (params.type === 'error') {
        this.consoleErrors.push(text);
      }
    } else if (method === 'Runtime.exceptionThrown') {
      const desc = params.exceptionDetails ? params.exceptionDetails.text : 'Unknown exception';
      this.consoleErrors.push(desc);
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pendingCallbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width: Math.round(width),
      height: Math.round(height),
      deviceScaleFactor: 1,
      mobile: width <= 680
    });
    // Brief sleep to allow media queries and CSS reflow
    await new Promise(r => setTimeout(r, 120));
  }

  async navigate(relativeUrl = '/index.html') {
    const fullUrl = `http://127.0.0.1:${this.serverPort}${relativeUrl}`;
    await this.send('Page.navigate', { url: fullUrl });
    // Wait for DOM ready
    await new Promise(r => setTimeout(r, 800));

    // Fast-dismiss loader to ensure clean benchmark state
    await this.evaluate(`
      (() => {
        sessionStorage.setItem('portfolio_visited', 'true');
        const loader = document.getElementById('loader');
        if (loader) {
          loader.classList.add('done');
          loader.style.display = 'none';
        }
        if (document.body) {
          document.body.classList.remove('loading');
        }
        if (typeof window.enterSite === 'function') {
          try { window.enterSite(); } catch (e) {}
        }
      })()
    `);
    await new Promise(r => setTimeout(r, 200));
  }

  async evaluate(code) {
    const res = await this.send('Runtime.evaluate', {
      expression: typeof code === 'function' ? `(${code.toString()})()` : code,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }
    return res.result ? res.result.value : res;
  }

  async scrollTo(y) {
    await this.evaluate(`window.scrollTo({ top: ${Math.round(y)}, behavior: 'instant' })`);
    await new Promise(r => setTimeout(r, 150));
  }

  async click(selector) {
    const clicked = await this.evaluate(`
      (() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (el) {
          el.scrollIntoView({ block: 'center' });
          el.click();
          return true;
        }
        return false;
      })()
    `);
    await new Promise(r => setTimeout(r, 150));
    return clicked;
  }

  async getMetrics(viewportWidth) {
    return await this.evaluate(`
      (() => {
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const docW = document.documentElement ? document.documentElement.clientWidth : winW;
        const scrollW = document.documentElement ? document.documentElement.scrollWidth : winW;
        const bodyScrollW = (document.body && document.body.scrollWidth) || scrollW;
        const scrollX = window.scrollX || window.pageXOffset || 0;
        const scrollY = window.scrollY || window.pageYOffset || 0;

        const main = document.querySelector('main');
        const mainRect = main ? main.getBoundingClientRect() : null;
        const mainStyle = main ? window.getComputedStyle(main) : null;

        const hero = document.querySelector('.hero');
        const heroRect = hero ? hero.getBoundingClientRect() : null;

        const wanted = document.querySelector('.hero-portrait-frame') || document.querySelector('.wanted-poster-frame');
        const wantedRect = wanted ? wanted.getBoundingClientRect() : null;
        const wantedImg = document.querySelector('#heroPortraitImg') || document.querySelector('.hero-portrait-img') || document.querySelector('#wantedPhotoImg');
        const wantedImgNatural = wantedImg ? {
          complete: wantedImg.complete,
          naturalWidth: wantedImg.naturalWidth,
          naturalHeight: wantedImg.naturalHeight,
          src: wantedImg.src,
          currentSrc: wantedImg.currentSrc
        } : null;

        const skillsTicker = document.querySelector('.skills-ticker-tape');
        const skillsTickerRect = skillsTicker ? skillsTicker.getBoundingClientRect() : null;
        const routeDock = document.getElementById('voyageRouteDock');
        const routeDockRect = routeDock ? routeDock.getBoundingClientRect() : null;

        const journey = document.querySelector('#journey');
        const journeyRect = journey ? journey.getBoundingClientRect() : null;

        const celebrationBanner = document.querySelector('#voyageCelebrationBanner');
        const revealBtn = document.querySelector('#journeyRevealBtn');
        const showAllBtn = document.querySelector('#journeyShowAllBtn');

        const shipAvatar = document.querySelector('#voyageShipAvatar');
        const trackFill = document.querySelector('#voyageTrackFill');
        const routeCounter = document.querySelector('#voyageRouteCounter');

        const milestoneCards = Array.from(document.querySelectorAll('.voyage-milestone-card')).map((card, idx) => {
          const cr = card.getBoundingClientRect();
          const cs = window.getComputedStyle(card);
          return {
            index: idx + 1,
            id: card.id,
            revealed: card.classList.contains('is-revealed'),
            active: card.classList.contains('is-active'),
            hidden: card.classList.contains('is-hidden'),
            stacked: card.classList.contains('is-stacked'),
            position: cs.position,
            top: cs.top,
            rect: { top: cr.top, bottom: cr.bottom, left: cr.left, right: cr.right, width: cr.width, height: cr.height }
          };
        });

        // Overflow detection across all visible elements
        const overflows = [];
        if (document.body) {
          document.querySelectorAll('body *').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > docW + 1.5 || r.left < -1.5) {
              const st = window.getComputedStyle(el);
              if (st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity) > 0.05) {
                overflows.push({
                  tag: el.tagName,
                  id: el.id,
                  className: el.className && typeof el.className === 'string' ? el.className.slice(0, 40) : '',
                  left: Math.round(r.left),
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                  overflowRight: Math.round(r.right - docW)
                });
              }
            }
          });
        }

        const htmlStyle = document.documentElement ? window.getComputedStyle(document.documentElement) : { overflowX: '' };
        const bodyStyle = document.body ? window.getComputedStyle(document.body) : { overflowX: '' };

        return {
          winW,
          winH,
          docW,
          scrollW,
          bodyScrollW,
          scrollX,
          scrollY,
          overflowXHtml: htmlStyle.overflowX,
          overflowXBody: bodyStyle.overflowX,
          main: mainRect ? {
            left: Math.round(mainRect.left),
            right: Math.round(mainRect.right),
            width: Math.round(mainRect.width),
            leftSpace: Math.round(mainRect.left),
            rightSpace: Math.round(docW - mainRect.right),
            centerDelta: Math.abs(Math.round(docW - mainRect.right) - Math.round(mainRect.left)),
            marginLeft: mainStyle.marginLeft,
            marginRight: mainStyle.marginRight
          } : null,
          hero: heroRect ? {
            left: Math.round(heroRect.left),
            right: Math.round(heroRect.right),
            width: Math.round(heroRect.width)
          } : null,
          wanted: wantedRect ? {
            left: Math.round(wantedRect.left),
            right: Math.round(wantedRect.right),
            width: Math.round(wantedRect.width),
            height: Math.round(wantedRect.height),
            aspectRatio: wantedRect.height > 0 ? wantedRect.width / wantedRect.height : 0
          } : null,
          wantedImg: wantedImgNatural,
          skillsTicker: skillsTickerRect ? {
            left: Math.round(skillsTickerRect.left),
            right: Math.round(skillsTickerRect.right),
            width: Math.round(skillsTickerRect.width)
          } : null,
          routeDock: routeDockRect ? {
            top: Math.round(routeDockRect.top),
            bottom: Math.round(routeDockRect.bottom),
            height: Math.round(routeDockRect.height)
          } : null,
          journey: journeyRect ? {
            top: Math.round(journeyRect.top),
            bottom: Math.round(journeyRect.bottom),
            height: Math.round(journeyRect.height)
          } : null,
          celebrationBanner: celebrationBanner ? {
            visible: celebrationBanner.style.display !== 'none' && !celebrationBanner.classList.contains('is-hidden'),
            display: window.getComputedStyle(celebrationBanner).display
          } : null,
          revealBtn: revealBtn ? {
            present: true,
            display: window.getComputedStyle(revealBtn).display,
            visible: window.getComputedStyle(revealBtn).display !== 'none'
          } : null,
          showAllBtn: showAllBtn ? {
            present: true,
            display: window.getComputedStyle(showAllBtn).display
          } : null,
          shipAvatar: shipAvatar ? {
            leftStyle: shipAvatar.style.left,
            leftPercent: parseFloat(shipAvatar.style.left) || 0
          } : null,
          trackFill: trackFill ? {
            widthStyle: trackFill.style.width,
            widthPercent: parseFloat(trackFill.style.width) || 0
          } : null,
          routeCounter: routeCounter ? routeCounter.textContent.trim() : null,
          milestones: milestoneCards,
          overflowCount: overflows.length,
          overflows: overflows.slice(0, 10)
        };
      })()
    `);
  }

  async close() {
    if (this.ws) {
      try { this.ws.close(); } catch (e) { }
    }
    if (this.chromeProcess) {
      try {
        this.chromeProcess.kill('SIGTERM');
      } catch (e) { }
    }
    if (this.server) {
      try {
        await new Promise(r => this.server.close(r));
      } catch (e) { }
    }
    if (this.tempUserDataDir && fs.existsSync(this.tempUserDataDir)) {
      try {
        fs.rmSync(this.tempUserDataDir, { recursive: true, force: true });
      } catch (e) { }
    }
  }
}

module.exports = {
  TestHarness,
  AssertionReporter
};
