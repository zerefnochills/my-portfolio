# Milestone 1 Explorer 1: Root Containment & Ticker Tape Fix Strategy Handoff Report

## 1. Observation

Direct code audits and live headless Chrome (DevTools Protocol) evaluations were conducted on `index.html`, `css/polish.css`, and `Your Name – Portfolio.html` across standard responsive viewport widths: **Mobile (375px)**, **Tablet (768px)**, **Laptop / Small Desktop (1024px)**, and **Large Desktop (1440px)**.

### 1.1 Root Containment Defects & Verbatim Code Locations

#### Observation O1.1: Root `html` Lacks Overflow Containment (`index.html:130-133`, `css/polish.css:1297-1301`)
In `index.html` (lines 130-133):
```css
html {
  scroll-padding-top: 80px;
  scroll-behavior: smooth;
}
```
In `css/polish.css` (lines 1297-1301):
```css
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scroll-behavior: smooth;
}
```
- Direct observation: Neither `index.html` nor `css/polish.css` defines `overflow-x: clip`, `overflow-x: hidden`, `width: 100%`, or `max-width: 100%` on the root `<html>` element.
- Under W3C CSS specifications, when `overflow` is not defined on `<html>`, any horizontal overrun from child elements expands the document root's `scrollWidth`, generating an active horizontal scrollbar and shifting the visual canvas.

#### Observation O1.2: `body` Uses `max-width: 100vw` and `overflow-x: hidden` (`css/polish.css:1303-1309`, `index.html:141-155`)
In `css/polish.css` (lines 1303-1309):
```css
body {
  overflow-x: hidden !important;
  width: 100%;
  max-width: 100vw;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
In `index.html` (lines 141-155):
```css
body {
  margin: 0;
  ...
  overflow-x: hidden;
  transition: background-color 0.4s ease, color 0.4s ease;
}
```
- Direct observation: `css/polish.css:1306` sets `max-width: 100vw`.
- On desktop platforms (Windows Chrome/Edge/Firefox), vertical scrollbars consume layout space (15px to 17px).
- `100vw` measures the entire browser window width *including* the vertical scrollbar, while `clientWidth` measures the document viewable area *excluding* the scrollbar.
- At 1440px viewport width: `window.innerWidth = 1440px`, but `document.documentElement.clientWidth = 1425px`. Setting `max-width: 100vw` forces `body` to calculate its maximum width as 1440px inside a 1425px window, immediately producing a 15px right-edge canvas overflow.

---

### 1.2 Skills Ticker Tape Blowout & Verbatim Code Locations

#### Observation O1.3: Runaway Desktop Ticker Tape Dimensions (`css/polish.css:333-347`)
In `css/polish.css` (lines 333-347):
```css
.skills-ticker-tape {
  position: relative;
  left: 50%;
  width: 112vw;
  margin: 10px 0 54px -56vw;
  background: #dc2626 !important;
  background: linear-gradient(90deg, #991b1b 0%, #dc2626 35%, #ef4444 65%, #991b1b 100%) !important;
  color: #fff;
  transform: rotate(-1.5deg);
  overflow: hidden;
  box-shadow: 0 8px 0 var(--shadow, rgba(0, 0, 0, 0.25));
  border-top: 3.5px solid var(--ink, #111);
  border-bottom: 3.5px solid var(--ink, #111);
  z-index: 10;
}
```
- Direct observation: The author used `width: 112vw` with `margin-left: -56vw` and `left: 50%` to produce a full-bleed tilted marquee banner overhanging the content container.
- Because `112vw` is 12vw wider than the screen, it overhangs the viewport by `6vw` on each side.
- Measured Bounding Rects (`scratch/survey_data.json` and CDP live evaluation):
  - At 1440px: width = 1615px, left = -95px, right = 1520px. **Overflows right viewport edge by +95px** (`1520 - 1425 = 95px`).
  - At 1024px: width = 1148px, left = -70px, right = 1079px. **Overflows right viewport edge by +70px** (`1079 - 1009 = 70px`).
  - At 768px: width = 862px, left = -47px, right = 815px. **Overflows right viewport edge by +47px** (`815 - 768 = 47px`).

#### Observation O1.4: Missing Tablet Media Override (`css/polish.css:1345-1412`)
In `css/polish.css` under `@media (min-width: 681px) and (max-width: 1024px)`:
- Direct observation: Zero rules exist for `.skills-ticker-tape`.
- Consequently, iPads and tablets (768px - 1024px) inherit the desktop `112vw` / `-56vw` styling, causing +47px to +70px of horizontal overflow.

#### Observation O1.5: Mobile Breakpoint Partial Fix Sub-Pixel Rotation Blowout (`css/polish.css:1601-1607`)
In `css/polish.css` (lines 1601-1607 under `@media (max-width: 680px)`):
```css
/* Full-bleed Red Ticker Tape without scroll blowout */
.skills-ticker-tape {
  width: 100vw !important;
  left: 50% !important;
  margin: 8px 0 40px -50vw !important;
  padding: 12px 0 !important;
}
```
- Direct observation: The mobile rule updated `width` to `100vw` and `margin-left` to `-50vw`.
- However, `.skills-ticker-tape` has `transform: rotate(-1.5deg)`.
- When a rectangle of width 375px is rotated by -1.5 degrees, its geometric bounding box width is:
  $$W_{bbox} = W \cos(\theta) + H \sin(\theta) = 375 \times 0.99965 + 80 \times 0.02617 \approx 377\text{px}$$
- Measured in CDP: `left: -1px`, `right: 376px`, `width: 377px`.
- Because the root lacks `overflow-x: clip`, this 1px to 2px protrusion combines with uncontained mobile elements to trigger `scrollWidth = 432px` (+57px delta).

---

## 2. Logic Chain

1. **Step 1: Uncontained Root Element Permits Global Document Canvas Expansion**  
   - Based on O1.1 and O1.2: `<html>` has no overflow constraint, and `<body>` relies solely on `overflow-x: hidden !important; max-width: 100vw;`.
   - In modern CSS layout engines, `overflow-x: hidden` on `<body>` without matching clipping on `<html>` fails to prevent elements with fixed/absolute or negative-margin transforms from expanding `document.documentElement.scrollWidth`.
   - Furthermore, `100vw` expands 15-17px past `clientWidth` on desktop browsers.

2. **Step 2: Runaway Ticker Tape Overhang Direct Cause of Viewport Blowout**  
   - Based on O1.3 and O1.4: `.skills-ticker-tape` intentionally forces a 112vw width with -56vw left margin.
   - On 1440px desktop, this creates a 1615px element inside a 1425px client viewport, directly causing the +95px scrollWidth delta.
   - On 1024px desktop, this creates a 1148px element inside a 1009px viewport, directly causing the +70px scrollWidth delta.
   - On 768px tablet, the lack of an override leaves the 862px element inside a 768px viewport, directly causing the +47px scrollWidth delta.

3. **Step 3: Rotated Bounding Box Geometry Requires True Viewport Clipping**  
   - Based on O1.5: Even when width is set to `100vw` / `-50vw`, the `-1.5deg` tilt rotates the corners outward by 1px to 8px beyond the screen edges.
   - If clipped by `overflow-x: clip` at the root (`html` and `body`), this small rotation overhang is visually clipped at the screen bezel without expanding document scrollWidth.
   - If not clipped at the root, any rotated full-bleed element expands `scrollWidth` and creates horizontal jitter.

4. **Step 4: Empirical Verification of `overflow-x: clip` Synergy**  
   - We executed live CDP headless tests (`scratch/test_m1_1_fixes.js`):
     - Before fix: 375px delta = +57px, 768px delta = +51px, 1024px delta = +70px, 1440px delta = +95px.
     - With `html, body { overflow-x: clip !important; width: 100% !important; max-width: 100% !important; }` and `.skills-ticker-tape` set to clean `100vw / -50vw`:
     - After fix: **375px delta = 0px**, **768px delta = 0px**, **1024px delta = 0px**, **1440px delta = 0px**.
   - Furthermore, we proved empirically in `scratch/test_sticky_clip.js` that `overflow-x: clip` does **not** create a scroll container and therefore preserves `position: sticky` functionality for child navigation and Voyage milestone cards.

---

## 3. Caveats

1. **Test Suite Selector Anomaly in `tests/e2e/tier2_boundary_corner.js:54`**:
   - In `tests/e2e/tier2_boundary_corner.js`, test B2.1 and B2.2 check whether the ticker is clamped within the screen (`right <= 376px` on 375px; `right <= 769px` on 768px).
   - However, line 54 queries:
     ```javascript
     const ticker = document.querySelector('.skills-ticker-track') ||
                    document.querySelector('.skills-ticker-wrap') ||
                    document.querySelector('.skills-ticker') ||
                    document.querySelector('.skills-strip');
     ```
   - Notice that `.skills-ticker-track` is the FIRST selector in the query.
   - In `index.html:4598`, `.skills-ticker-track` is the **inner animated sliding track** holding 50 skill pills (width: 6,208px), NOT the container!
   - The outer container with `overflow: hidden` is `.skills-ticker-tape`.
   - Because `getBoundingClientRect()` on an inner track returns its unclipped rendered width (6,208px), test B2.1 and B2.2 fail unless `.skills-ticker-track` is either hidden or the test query is updated to check `.skills-ticker-tape`.
   - **Recommendation for Implementer / Test Writer**: In `index.html:4597`, add the class `skills-ticker-wrap` to `<div class="skills-ticker-tape skills-ticker-wrap">`, AND in `tests/e2e/tier2_boundary_corner.js:54`, ensure `.skills-ticker-tape` or `.skills-ticker-wrap` is checked first before `.skills-ticker-track`.

2. **Full-Bleed 100vw vs Section-Contained 100% Trade-Off**:
   - Two architectural options are presented below for `.skills-ticker-tape`:
     - **Option 1 (Clean Full-Bleed 100vw)**: Preserves the authentic "Grand Line Strip" design running edge-to-edge across the entire screen as originally conceived in Image 3 and `css/polish.css`. Overhang is cleanly clipped at the document edge by root containment.
     - **Option 2 (Section-Contained 100%)**: Constrains the red banner strictly within the `<main>` container width (max 1160px) with subtle rounded corners (`border-radius: 8px`). Eliminates all `vw` margin offsets entirely.
   - Both options yield `delta = 0px` across all viewports. Option 1 is recommended to preserve visual intent.

3. **Synchronized File Mirroring**:
   - `Your Name – Portfolio.html` is a byte-for-byte mirrored clone of `index.html`. Any change applied to `index.html` lines 130-155 must also be applied identically to `Your Name – Portfolio.html`.

---

## 4. Conclusion & Exact Proposed Code Drops

### 4.1 Target File 1: `index.html` (and `Your Name – Portfolio.html`)
**Target Lines**: 130–155

#### Before:
```css
    html {
      scroll-padding-top: 80px;
      scroll-behavior: smooth;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background-color: var(--paper);
      background-image:
        radial-gradient(ellipse at 50% 0, rgba(255, 255, 255, 0.45) 0, transparent 65%),
        radial-gradient(ellipse at 50% 100%, rgba(0, 0, 0, 0.04) 0, transparent 60%);
      background-size: 100% 100%, 100% 100%;
      background-attachment: fixed;
      color: var(--ink);
      font-family: var(--hand);
      font-size: 1.3rem;
      line-height: 1.5;
      overflow-x: hidden;
      transition: background-color 0.4s ease, color 0.4s ease;
    }
```

#### After (Exact Drop-In Replacement):
```css
    html {
      overflow-x: clip;
      width: 100%;
      max-width: 100%;
      scroll-padding-top: 80px;
      scroll-behavior: smooth;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    body {
      overflow-x: clip;
      width: 100%;
      max-width: 100%;
      margin: 0;
      position: relative;
      background-color: var(--paper);
      background-image:
        radial-gradient(ellipse at 50% 0, rgba(255, 255, 255, 0.45) 0, transparent 65%),
        radial-gradient(ellipse at 50% 100%, rgba(0, 0, 0, 0.04) 0, transparent 60%);
      background-size: 100% 100%, 100% 100%;
      background-attachment: fixed;
      color: var(--ink);
      font-family: var(--hand);
      font-size: 1.3rem;
      line-height: 1.5;
      transition: background-color 0.4s ease, color 0.4s ease;
    }
```

---

### 4.2 Target File 2: `css/polish.css`

#### Change 2A: Root Containment (`css/polish.css:1297-1309`)
**Target Lines**: 1297–1309

##### Before:
```css
html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  overflow-x: hidden !important;
  width: 100%;
  max-width: 100vw;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

##### After (Exact Drop-In Replacement):
```css
html {
  overflow-x: clip;
  width: 100%;
  max-width: 100%;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  overflow-x: clip !important;
  width: 100%;
  max-width: 100%;
  margin: 0;
  position: relative;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

#### Change 2B: Desktop Base Ticker Tape (`css/polish.css:333-347`)
**Target Lines**: 333–347

##### Before:
```css
.skills-ticker-tape {
  position: relative;
  left: 50%;
  width: 112vw;
  margin: 10px 0 54px -56vw;
  background: #dc2626 !important;
  background: linear-gradient(90deg, #991b1b 0%, #dc2626 35%, #ef4444 65%, #991b1b 100%) !important;
  color: #fff;
  transform: rotate(-1.5deg);
  overflow: hidden;
  box-shadow: 0 8px 0 var(--shadow, rgba(0, 0, 0, 0.25));
  border-top: 3.5px solid var(--ink, #111);
  border-bottom: 3.5px solid var(--ink, #111);
  z-index: 10;
}
```

##### After — Option 1: Clean Full Bleed (Recommended):
```css
.skills-ticker-tape {
  position: relative;
  left: 50%;
  right: 50%;
  width: 100vw;
  max-width: 100vw;
  margin: 10px 0 54px -50vw;
  box-sizing: border-box;
  background: #dc2626 !important;
  background: linear-gradient(90deg, #991b1b 0%, #dc2626 35%, #ef4444 65%, #991b1b 100%) !important;
  color: #fff;
  transform: rotate(-1.5deg);
  overflow: hidden;
  box-shadow: 0 8px 0 var(--shadow, rgba(0, 0, 0, 0.25));
  border-top: 3.5px solid var(--ink, #111);
  border-bottom: 3.5px solid var(--ink, #111);
  z-index: 10;
}
```

##### After — Option 2: Section-Contained Full Width (Alternative):
```css
.skills-ticker-tape {
  position: relative;
  left: auto;
  right: auto;
  width: 100%;
  max-width: 100%;
  margin: 16px auto 48px;
  box-sizing: border-box;
  background: #dc2626 !important;
  background: linear-gradient(90deg, #991b1b 0%, #dc2626 35%, #ef4444 65%, #991b1b 100%) !important;
  color: #fff;
  transform: rotate(-1deg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 0 var(--shadow, rgba(0, 0, 0, 0.25));
  border: 3.5px solid var(--ink, #111);
  z-index: 10;
}
```

---

#### Change 2C: Tablet Media Query Ticker Tape (`css/polish.css:1400-1412`)
**Target Lines**: Add inside `@media (min-width: 681px) and (max-width: 1024px)` before line 1411:

##### Code to Insert:
```css
  /* Full-bleed Red Ticker Tape on Tablet */
  .skills-ticker-tape {
    width: 100vw !important;
    max-width: 100vw !important;
    left: 50% !important;
    right: 50% !important;
    margin: 10px 0 48px -50vw !important;
    box-sizing: border-box !important;
  }
```

---

#### Change 2D: Mobile Media Query Ticker Tape (`css/polish.css:1601-1607`)
**Target Lines**: 1601–1607

##### Before:
```css
  /* Full-bleed Red Ticker Tape without scroll blowout */
  .skills-ticker-tape {
    width: 100vw !important;
    left: 50% !important;
    margin: 8px 0 40px -50vw !important;
    padding: 12px 0 !important;
  }
```

##### After:
```css
  /* Full-bleed Red Ticker Tape without scroll blowout */
  .skills-ticker-tape {
    width: 100vw !important;
    max-width: 100vw !important;
    left: 50% !important;
    right: 50% !important;
    margin: 8px 0 40px -50vw !important;
    padding: 12px 0 !important;
    box-sizing: border-box !important;
  }
```

---

## 5. Verification Method

### 5.1 Verification Commands
Execute the following automated commands from the project root:

```powershell
# 1. Run Tier 1 Feature Coverage Tests (Zero-Overflow and Centering)
node tests/e2e/runner.js --tier=1

# 2. Run Tier 2 Boundary & Corner Case Tests
node tests/e2e/runner.js --tier=2

# 3. Direct Headless CDP Delta Check across all viewports
node -e "
const http = require('http'); const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  let fp = path.join(__dirname, decodeURI(req.url.split('?')[0]));
  if (fp.endsWith(path.sep) || req.url === '/') fp = path.join(__dirname, 'index.html');
  if (fs.existsSync(fp)) { res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(fp)] || 'text/plain' }); fs.createReadStream(fp).pipe(res); }
  else { res.writeHead(404); res.end('Not found'); }
});
server.listen(8333, async () => {
  const p = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=9455', 'about:blank']);
  await new Promise(r => setTimeout(r, 1200));
  const tr = await (await fetch('http://127.0.0.1:9455/json')).json();
  const ws = new WebSocket(tr.find(t => t.type === 'page').webSocketDebuggerUrl);
  let id = 1; const cbs = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { cbs.get(m.id)(m); cbs.delete(m.id); } };
  const send = (method, params = {}) => new Promise(r => { const i = id++; cbs.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise(r => ws.onopen = r);
  await send('Page.navigate', { url: 'http://127.0.0.1:8333/' });
  await new Promise(r => setTimeout(r, 2000));
  for (const vp of [375, 768, 1024, 1440]) {
    await send('Emulation.setDeviceMetricsOverride', { width: vp, height: 800, deviceScaleFactor: 1, mobile: vp < 1000 });
    await new Promise(r => setTimeout(r, 200));
    const res = await send('Runtime.evaluate', {
      expression: '(() => ({ vp: ' + vp + ', docW: document.documentElement.clientWidth, scrollW: document.documentElement.scrollWidth, delta: document.documentElement.scrollWidth - document.documentElement.clientWidth }))()',
      returnByValue: true
    });
    console.log(res.result.result.value);
  }
  p.kill(); server.close(); process.exit(0);
});
"
```

### 5.2 Pass / Invalidation Criteria
- **Pass Criterion 1**: `document.documentElement.scrollWidth === document.documentElement.clientWidth` (`delta === 0`) across all 4 viewports (375px, 768px, 1024px, 1440px).
- **Pass Criterion 2**: `window.getComputedStyle(document.documentElement).overflowX === 'clip'`.
- **Pass Criterion 3**: `window.getComputedStyle(document.body).overflowX === 'clip'`.
- **Pass Criterion 4**: `document.body.clientWidth === document.documentElement.clientWidth`.
- **Pass Criterion 5**: Vertical scrolling and `position: sticky` headers continue to dock smoothly (`window.scrollY > 0` maintains sticky top offset).
- **Invalidation Condition**: Any viewport exhibits `delta > 0` or triggers a visible horizontal scrollbar.

