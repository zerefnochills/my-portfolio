# Milestone 1: Tablet Navbar, Coffee Stain & Mobile Logbook Strategy Report

## 1. Observation

Direct code audits and layout telemetry measurements were conducted on `index.html` (7,901 lines), `Your Name – Portfolio.html`, `css/polish.css` (1,832 lines), and `scratch/survey_data.json` across Mobile (375px), Tablet (768px), and Desktop (1024px, 1440px) viewports.

---

### 1.1 Tablet Navbar Right Overflow (+51px)

**Target Files & Lines**:
- `css/polish.css:1376-1401`
- `css/polish.css:99-118`
- `index.html:3636-3686`
- `index.html:4325-4380` (Markup structure)

**Verbatim Code (`css/polish.css:1376-1401`)**:
```css
  /* Single-row Navbar on iPad */
  nav.nav-island {
    display: flex !important;
    flex-wrap: nowrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 12px !important;
    padding: 8px 16px !important;
    max-width: min(780px, 96vw) !important;
  }
  .nav-brand-row {
    flex: 0 0 auto !important;
  }
  .nav-links-dock {
    order: 2 !important;
    width: auto !important;
    display: flex !important;
    gap: 6px !important;
    padding: 0 !important;
  }
  .controls-bar {
    order: 3 !important;
    margin-left: 0 !important;
    flex: 0 0 auto !important;
  }
```

**Verbatim Telemetry (`scratch/survey_data.json` at 768px)**:
```json
{
  "tag": "div",
  "id": "",
  "class": "controls-bar",
  "left": 693,
  "right": 819,
  "width": 126,
  "overflowRight": 51,
  "overflowLeft": -693
},
{
  "tag": "button",
  "id": "themeBtn",
  "class": "control-btn",
  "left": 781,
  "right": 819,
  "width": 38,
  "overflowRight": 51,
  "overflowLeft": -781
}
```

**Direct Observation**:
1. At 768px viewport width, `nav.nav-island` has `max-width: min(780px, 96vw) !important;` which resolves to `737.28px`.
2. Total content width required by the three single-row children:
   - `.nav-brand-row`: 226px (Avatar seal + "Deepak Pandey" logo + sub-tags)
   - `.nav-links-dock`: 440px (6 pill links: `about`, `work`, `journey`, `skills`, `fame`, `contact`)
   - `.controls-bar`: 126px (3 buttons: `soundToggle`, `cursorToggle`, `themeBtn`)
   - Gaps and container padding: `12px * 2 + 16px * 2 = 56px`
   - Total required width: `226 + 440 + 126 + 56 = 848px`.
3. Because `flex-wrap: nowrap !important;` is explicitly applied in `@media (min-width: 681px) and (max-width: 1024px)`, the flex container cannot break items across rows.
4. `.controls-bar` is forced past the right boundary to `left: 693px, right: 819px`, overflowing the 768px viewport by **+51px** and visibly clipping the sound, zoro, and ink buttons off the right edge of the screen.

---

### 1.2 Interactive Coffee Cup Stain Overflow (+45px Mobile, +12px Tablet)

**Target Files & Lines**:
- `index.html:170-205`
- `Your Name – Portfolio.html:170-205`
- Absent in `css/polish.css`

**Verbatim Code (`index.html:170-184`)**:
```css
    /* Interactive Coffee Cup Stain */
    .coffee-stain {
      position: fixed;
      top: 90px;
      right: 7%;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 8px solid var(--coffee);
      box-shadow: inset 0 0 0 2px var(--coffee), 0 0 0 2px var(--coffee);
      transform: rotate(20deg) scaleY(0.94);
      pointer-events: auto;
      cursor: pointer;
      z-index: 1;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
```

**Verbatim Telemetry (`scratch/survey_data.json`)**:
- Mobile 375px:
  `tag: "div", id: "coffeeStain", class: "coffee-stain", left: 243, right: 420, width: 177, overflowRight: 45`
- Tablet 768px:
  `tag: "div", id: "coffeeStain", class: "coffee-stain", left: 603, right: 780, width: 177, overflowRight: 12`

**Direct Observation**:
1. The untransformed dimension is `140px x 140px` with an `8px` border (adding 16px if content-box) and `box-shadow`.
2. Applying `transform: rotate(20deg) scaleY(0.94)` expands the axis-aligned bounding box to `177px` in width (`w * cos(20) + h * sin(20)`).
3. `right: 7%` on a 375px mobile screen resolves to a right offset of only `26.25px`.
4. The rotated bounding box center sits at `278.75px`, placing the right-most bounding edge at `368.5px`..`420px` (when document canvas is expanded by horizontal scroll), protruding past the right viewport boundary by **+45px** on mobile and **+12px** on tablet.
5. On mobile screens (375px), a 140px coffee stain is disproportionately large, consuming over 37% of the viewport width.

---

### 1.3 Mobile Logbook Spread 2-Column Squeezing (+67px Overflow)

**Target Files & Lines**:
- `index.html:3853-3864`
- `css/polish.css:512-518`
- `css/polish.css:1403-1406`
- Missing in `css/polish.css:1620-1650` (`@media (max-width: 680px)`)

**Verbatim Code (`index.html:3853-3864`)**:
```css
    /* Enhanced About Section: Logbook Spread */
    .logbook-spread {
      display: grid;
      grid-template-columns: 1.25fr 0.95fr;
      gap: 28px;
      margin-top: 24px;
    }

    @media (max-width: 820px) {
      .logbook-spread {
        grid-template-columns: 1fr;
      }
    }
```

**Verbatim Code in `css/polish.css` (imported at line 4249, after `<style>`)**:
```css
/* css/polish.css:512 */
.logbook-spread {
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 28px;
  margin-top: 28px;
  position: relative;
}

/* css/polish.css:1403 */
@media (min-width: 681px) and (max-width: 1024px) {
  .logbook-spread {
    grid-template-columns: 1.1fr 0.9fr !important;
    gap: 20px !important;
  }
}
```

**Verbatim Computed Telemetry (`scratch/survey_data.json`)**:
- Mobile 375px:
  `display: "grid", gridColumns: "167.891px 225.828px", width: 355, left: 10, right: 365`

**Direct Observation**:
1. Because `css/polish.css` is loaded AFTER `index.html`'s `<style>` block, `css/polish.css:512` (`grid-template-columns: 1.25fr 0.95fr;`) overrides `index.html:3861` (`grid-template-columns: 1fr;`) on mobile viewports due to stylesheet source order.
2. Under `@media (max-width: 680px)` in `css/polish.css`, no `.logbook-spread` rule is defined.
3. On Mobile 375px, the container width is `355px`. The grid calculates two tracks: `167.891px` and `225.828px` with `gap: 28px`.
4. Total grid track width is `167.891 + 225.828 + 28 = 421.72px`. In a 355px area, this overflows by **66.7px**, severely compressing the text and causing horizontal canvas expansion.

---

## 2. Logic Chain

1. **Root Cause Analysis of Tablet Navbar Overflow**:
   - In `css/polish.css`, lines 99-118 originally specified a responsive 2-row layout below 920px (`nav.nav-island { flex-wrap: wrap; }` with `.nav-brand-row` on row 1, `.controls-bar` on row 1 right, and `.nav-links-dock` centered on row 2).
   - Later in the file (lines 1376-1401), `@media (min-width: 681px) and (max-width: 1024px)` introduced `flex-wrap: nowrap !important;` and `order: 2 !important; width: auto !important;` for `.nav-links-dock`.
   - On iPad portrait (768px), the 848px total item requirement cannot fit into the 737px `max-width` container. Because wrapping is prohibited, flex items overflow horizontally.
   - Result: `.controls-bar` spills out to `x = 819px` (+51px overflow past the 768px screen boundary).

2. **Root Cause Analysis of Coffee Stain Overflow**:
   - `.coffee-stain` uses static dimensions (`width: 140px; height: 140px;`) with `position: fixed; right: 7%;` without responsive breakpoints or clamping.
   - Rotation expands its bounding footprint to 177px.
   - On screens `<= 768px`, placing a 177px rotated element 7% from the right edge causes the bounding box to breach the right screen boundary (+45px on 375px, +12px on 768px).
   - In addition, on 375px mobile screens, a 140px stain occupies 37% of the entire viewport width.

3. **Root Cause Analysis of Mobile Logbook 2-Column Squeezing**:
   - `index.html` has a rule `@media (max-width: 820px) { .logbook-spread { grid-template-columns: 1fr; } }`.
   - However, `css/polish.css` is loaded afterward at line 4249. Its un-scoped base rule `css/polish.css:512` sets `grid-template-columns: 1.25fr 0.95fr;`.
   - Because both selectors have equal specificity (`0-1-0`) and neither uses `!important`, the external stylesheet rule at line 512 overrides the inline media query on mobile (`<= 680px`).
   - Consequently, mobile viewports render the logbook in two crammed columns (`167.9px` and `225.8px`), overflowing the container by 67px.

---

## 3. Caveats

1. **Synchronized File Mirroring**: Changes made to embedded `<style>` in `index.html` must also be mirrored to `Your Name – Portfolio.html` to maintain parity between release artifacts.
2. **Interaction Integrity**: `#coffeeStain` has an interactive click listener in `index.html:6901` (`playPenScratch()`, creating `.coffee-drop` ripples). Any responsive rule must preserve `pointer-events: auto; cursor: pointer; z-index: 1;`.
3. **Sticky Scroll Clearance**: On tablet viewports, the wrapped 2-row navbar has a total height of ~86px to 92px. Section scroll targets must maintain `scroll-margin-top: 96px;` (already set at `css/polish.css:122`) to prevent sticky navbar occlusion of section titles.

---

## 4. Conclusion & Actionable Technical Fix Specifications

### Fix 1: Tablet Responsive Navbar Wrapping (681px – 1024px)

#### File: `css/polish.css`
**Target Location**: Replace lines 1376-1401 with:

```css
  /* Responsive Navbar on Tablet (681px - 1024px) */
  nav.nav-island {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 8px 12px !important;
    padding: 8px 16px !important;
    max-width: min(960px, 100%) !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  .nav-brand-row {
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }
  .controls-bar {
    order: 2 !important;
    margin-left: auto !important;
    flex: 0 0 auto !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
  }
  .nav-links-dock {
    order: 3 !important;
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    flex-wrap: nowrap !important;
    gap: 6px !important;
    padding: 2px 0 !important;
    overflow-x: auto !important;
    scrollbar-width: none !important;
  }
  .nav-links-dock::-webkit-scrollbar {
    display: none !important;
  }
  .nav-link {
    font-size: 0.95rem !important;
    padding: 4px 8px !important;
    white-space: nowrap !important;
  }
```

And add the single-row layout for wider viewports (921px - 1024px) immediately after (around line 1402):

```css
  /* Single-row adaptation on wider tablet / desktop threshold (921px - 1024px) */
  @media (min-width: 921px) and (max-width: 1024px) {
    nav.nav-island {
      flex-wrap: nowrap !important;
      gap: 10px !important;
    }
    .nav-brand-row {
      flex: 0 0 auto !important;
    }
    .nav-links-dock {
      order: 2 !important;
      width: auto !important;
      gap: 4px !important;
    }
    .controls-bar {
      order: 3 !important;
      margin-left: 0 !important;
    }
    .nav-link {
      font-size: 0.9rem !important;
      padding: 3px 7px !important;
    }
  }
```

#### File: `index.html` (and `Your Name – Portfolio.html`)
**Target Location**: Replace lines 3636-3665 with:

```css
    @media (max-width: 920px) {
      header.site-header {
        top: 8px;
        padding: 0 8px;
      }

      nav.nav-island {
        flex-wrap: wrap;
        gap: 8px 12px;
        padding: 8px 14px;
        max-width: 100%;
        box-sizing: border-box;
      }

      .brand-text-col .logo-sub-tag {
        display: none;
      }

      .nav-brand-row {
        flex: 1 1 auto;
      }

      .controls-bar {
        order: 2;
        margin-left: auto;
      }

      .nav-links-dock {
        order: 3;
        width: 100%;
        justify-content: center;
        overflow-x: auto;
        max-width: 100%;
        scrollbar-width: none;
      }

      .nav-links-dock::-webkit-scrollbar {
        display: none;
      }

      .nav-link {
        font-size: 0.95rem;
        padding: 4px 8px;
      }
    }
```

---

### Fix 2: Coffee Stain Responsive Scaling & Clamping

#### File: `index.html` (and `Your Name – Portfolio.html`)
**Target Location**: Replace lines 170-205 with:

```css
    /* Interactive Coffee Cup Stain - Responsive Clamping */
    .coffee-stain {
      position: fixed;
      top: 90px;
      right: clamp(16px, 3.5vw, 48px);
      width: clamp(72px, 8vw, 130px);
      height: clamp(72px, 8vw, 130px);
      box-sizing: border-box;
      max-width: 100vw;
      border-radius: 50%;
      border: clamp(4px, 0.6vw, 7px) solid var(--coffee);
      box-shadow: inset 0 0 0 2px var(--coffee), 0 0 0 2px var(--coffee);
      transform: rotate(20deg) scaleY(0.94);
      transform-origin: center center;
      pointer-events: auto;
      cursor: pointer;
      z-index: 1;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .coffee-stain:hover {
      transform: rotate(24deg) scaleY(0.96) scale(1.04);
    }

    .coffee-stain::after {
      content: "tea mark";
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: clamp(0.72rem, 0.9vw, 0.9rem);
      color: var(--ink-soft);
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .coffee-stain:hover::after {
      opacity: 0.85;
    }

    @media (max-width: 768px) {
      .coffee-stain {
        top: 82px;
        right: 14px;
        width: 72px;
        height: 72px;
        border-width: 4.5px;
        box-shadow: inset 0 0 0 1.5px var(--coffee), 0 0 0 1.5px var(--coffee);
      }
    }

    @media (max-width: 480px) {
      .coffee-stain {
        top: 76px;
        right: 12px;
        width: 58px;
        height: 58px;
        border-width: 3.5px;
        box-shadow: inset 0 0 0 1px var(--coffee), 0 0 0 1px var(--coffee);
      }
    }
```

#### File: `css/polish.css`
**Target Location 1**: Under `@media (min-width: 681px) and (max-width: 1024px)` (around line 1410):
```css
  /* Tablet Coffee Stain Containment */
  .coffee-stain {
    top: 84px !important;
    right: 20px !important;
    width: 78px !important;
    height: 78px !important;
    border-width: 5px !important;
    box-sizing: border-box !important;
  }
```

**Target Location 2**: Under `@media (max-width: 680px)` (around line 1622):
```css
  /* Mobile Coffee Stain Containment */
  .coffee-stain {
    top: 76px !important;
    right: 12px !important;
    width: 58px !important;
    height: 58px !important;
    border-width: 3.5px !important;
    box-sizing: border-box !important;
    opacity: 0.7 !important;
  }
```

---

### Fix 3: Mobile Logbook Spread 1-Column Layout

#### File: `index.html` (and `Your Name – Portfolio.html`)
**Target Location**: Replace lines 3860-3864 with:

```css
    @media (max-width: 820px) {
      .logbook-spread {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
      }
    }
```

#### File: `css/polish.css`
**Target Location**: Under `@media (max-width: 680px)` (lines 1622-1626), insert right before `.logbook-page`:

```css
  /* Logbook & Manifesto on Mobile */
  .logbook-spread {
    grid-template-columns: 1fr !important;
    gap: 20px !important;
    margin-top: 20px !important;
  }
  .logbook-page {
    padding: 20px 16px !important;
    border-radius: 8px !important;
  }
```

---

## 5. Verification Method

### 5.1 Verification Test Command

Execute the following automated browser check using Chrome CDP against `index.html`:

```powershell
node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
  let fp = path.join(process.cwd(), decodeURI(req.url.split('?')[0]));
  if (fp.endsWith(path.sep) || req.url === '/') fp = path.join(process.cwd(), 'index.html');
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(fp);
    const ct = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : 'application/javascript';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(8125, async () => {
  const p = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new', '--remote-debugging-port=9475', '--no-first-run', '--disable-gpu', 'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 1200));
  const tr = await (await fetch('http://127.0.0.1:9475/json')).json();
  const ws = new WebSocket(tr.find(t => t.type === 'page').webSocketDebuggerUrl);
  let id = 1; const cbs = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { cbs.get(m.id)(m); cbs.delete(m.id); } };
  const send = (m, params = {}) => new Promise(r => { const i = id++; cbs.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params })); });
  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:8125/index.html' });
  await new Promise(r => setTimeout(r, 2000));

  for (const vp of [{ w: 375, h: 812 }, { w: 768, h: 1024 }, { w: 1024, h: 768 }]) {
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 1, mobile: vp.w < 1000 });
    await new Promise(r => setTimeout(r, 300));
    const res = await send('Runtime.evaluate', {
      expression: '(() => {
        const nav = document.querySelector(\"nav.nav-island\");
        const ctrl = document.querySelector(\".controls-bar\");
        const stain = document.querySelector(\"#coffeeStain\");
        const logbook = document.querySelector(\".logbook-spread\");
        const docW = document.documentElement.clientWidth;
        return {
          vpW: docW,
          navRight: nav ? Math.round(nav.getBoundingClientRect().right) : null,
          ctrlRight: ctrl ? Math.round(ctrl.getBoundingClientRect().right) : null,
          stainRight: stain ? Math.round(stain.getBoundingClientRect().right) : null,
          logbookCols: logbook ? window.getComputedStyle(logbook).gridTemplateColumns : null,
          logbookColCount: logbook ? window.getComputedStyle(logbook).gridTemplateColumns.split(\" \").length : null
        };
      })()',
      returnByValue: true
    });
    console.log(vp.w + 'px check:', res.result.value);
  }
  process.exit(0);
});
"
```

### 5.2 Verification Assertions

1. **Tablet Navbar Zero Overflow**:
   - At `768px`: `ctrlRight <= 768` (specifically `<= 754px`, leaving >= 14px right margin).
   - At `768px`: Buttons `#soundToggle`, `#cursorToggle`, `#themeBtn` have `right <= 768` and `width >= 32px` (no visual truncation or button clipping).
2. **Coffee Stain Clamping**:
   - At `375px`: `stainRight <= 375` (specifically `<= 372px`, with zero protrusion).
   - At `768px`: `stainRight <= 768` (specifically `<= 760px`).
   - At `1024px`: `stainRight <= 1024`.
   - At `1440px`: `stainRight <= 1440`.
3. **Mobile Logbook Single Column**:
   - At `375px`: `logbookColCount === 1` and `logbookCols` evaluates to a single pixel width (e.g. `"355px"`).
   - At `375px`: Both `.logbook-page` elements have `width <= 355px` and stack vertically.

### 5.3 Invalidation Conditions
- **Condition 1**: At 768px, `.controls-bar` bounding box `right > 768px`.
- **Condition 2**: At 375px or 768px, `#coffeeStain` bounding box `right > clientWidth`.
- **Condition 3**: At 375px, `.logbook-spread` computed `gridTemplateColumns` contains more than one column track.
- **Condition 4**: Clicking `#coffeeStain` fails to invoke `playPenScratch()` or spawn `.coffee-drop`.
