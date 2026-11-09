# Wanted Poster Asset Replacement and Responsive Styling Survey

**State Folder**: `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\.agents\teamwork\explorer_survey_2\`  
**Investigator**: Explorer Agent  
**Date**: 2026-11-09  

---

## 1. Observation

### 1.1 Source Replacement Image Analysis
- **Absolute Source Path**: `C:/Users/altze/.gemini/antigravity/brain/432ee84e-dbf2-454c-a883-7605ebcc0179/.user_uploaded/media_1794201865931_238ddac4.jpg`
- **File Metadata**:
  - Format: `JPEG` (`RGB` mode)
  - Dimensions: `768` pixels wide × `1024` pixels high
  - Aspect Ratio: `3:4` (`0.75` width/height ratio)
  - File Size: `577,225` bytes (~563.7 KB)
- **Visual Structure & Composition**:
  - The image is a complete, authentic One Piece Wanted Poster template on aged weathered parchment.
  - **Top region (y: 0 to ~230)**: Large woodblock style anime lettering reading **"WANTED"**.
  - **Center region (x: 108 to 652, y: 242 to 762)**: Rectangular dark photo frame border enclosing a blank, parchment-textured box. Mean RGB = `(241.6, 187.1, 115.0)` with low standard deviation `std=(4.1, 6.1, 7.4)`, confirming this is an empty template portrait zone.
  - **Lower-middle region (y: 785 to 855)**: Stylized typography reading **"DEAD OR ALIVE"**.
  - **Name region (y: 835 to 880)**: One Piece fictional script/cipher decorative placeholder.
  - **Bounty region (y: 885 to 935)**: Berry currency symbol (`฿`) and fictional numeric placeholder.
  - **Bottom region (y: 940 to 1024)**: Marine insignia with seagull anchor logo and fictional Japanese disclaimer text (`KONO SAKUHIN WA FICTION DETHUNODE...`).

### 1.2 Current Codebase Wanted Poster Implementation
- **Current Asset**:
  - File Path: `images/deepak-wanted.jpg`
  - Dimensions: `1024` × `1024` pixels (`1:1` square aspect ratio)
  - File Size: `281,909` bytes (~275.3 KB)
  - Content: Anime-style headshot portrait of Deepak Pandey.
- **Markup Location**: `index.html` lines 4462–4570 (and identical duplicate in `Your Name – Portfolio.html` lines 4462–4570)
  ```html
  <!-- One Piece Wanted Bounty Poster Frame -->
  <div class="wanted-poster-frame ink" id="wantedPoster" role="region" aria-label="One Piece Wanted Bounty Poster Frame">
    <div class="chopper-peeking-wrap" id="chopperPeeking" title="Tony Tony Chopper peeking! Click him!">...</div>
    <div class="poster-pin" aria-hidden="true"></div>
    <div class="wanted-inner">
      <div class="wanted-header">WANTED</div>
      <div class="wanted-photo-container" id="wantedPhotoContainer" ...>
        <img id="wantedPhotoImg" src="images/deepak-wanted.jpg" alt="Portrait of Deepak Pandey" class="wanted-img" style="display:block;" />
        <div id="wantedPlaceholder" class="wanted-placeholder" style="display:none;">...</div>
        <span class="photo-change-badge" id="photoChangeBadge">change photo ↺</span>
        <input type="file" id="wantedPhotoInput" accept="image/*" style="display:none;" />
      </div>
      <div class="wanted-dead-or-alive">DEAD OR ALIVE</div>
      <div class="wanted-name" id="wantedPosterName">DEEPAK PANDEY</div>
      <div class="wanted-bounty-row" id="wantedBountyRow" style="cursor:pointer" title="Click to raise bounty! +100M ฿">
        <span class="berry-symbol">฿</span>
        <span class="bounty-amount" id="wantedPosterBounty">3,000,000,000</span>
        <span class="bounty-dash">-</span>
      </div>
      <div class="wanted-footer">
        <span class="marine-text">MARINE</span>
        <span class="marine-stamp" id="marineStampToggle" ...>...</span>
      </div>
    </div>
    <div class="wanted-annotation-note" aria-hidden="true">
      <span>Wanted: Relentless curiosity &amp; pure craft ✦</span>
    </div>
  </div>
  ```
- **JavaScript References**:
  - `index.html:6200`: `photoUrl: "images/deepak-wanted.jpg",` inside `PORTFOLIO_CONFIG`.
  - `index.html:6474`: `setWantedPhoto(PORTFOLIO_CONFIG.photoUrl || "images/deepak-wanted.jpg");`
  - `index.html:6470–6473`: `localStorage.getItem("portfolio_wanted_photo")` check.
  - `index.html:6419–6427`: `applyConfig()` populates `#wantedPosterName` and `#wantedPosterBounty`.
  - `index.html:6970–6995`: Bounty click easter egg adds +100M Berry to `#wantedPosterBounty`.
  - `js/polish.js:58, 70`: Adds class `.poster-in` to `.wanted-poster-frame` after loader dismisses.

### 1.3 Current CSS Dimensions, Proportions & Overlays
- **Desktop CSS (`index.html:712–807`)**:
  - `.wanted-poster-frame`: `position: relative; width: 100%; max-width: 380px; justify-self: end; margin-left: auto; background: var(--paper-sticky); border: 3.5px solid var(--ink); border-radius: 12px 18px 14px 16px/16px 14px 18px 12px; padding: 22px 18px 14px; box-shadow: 6px 10px 0 var(--shadow); transform: rotate(2deg);`
  - `.wanted-photo-container`: `width: 100%; aspect-ratio: 4 / 3.7; border: 2.5px solid var(--ink); border-radius: 6px; position: relative; overflow: hidden;` (`4 / 3.7 ≈ 1.081` ratio).
  - `.wanted-img`: `width: 100%; height: 100%; object-fit: cover; display: block;`
- **Tablet Media Query (`css/polish.css:1345–1375`, 681px to 1024px)**:
  - `.hero`: `grid-template-columns: 1.15fr minmax(280px, 340px) !important; gap: 28px !important;`
  - `.wanted-poster-frame`: `width: 100% !important; max-width: 330px !important; margin: 0 0 0 auto !important; justify-self: end !important; transform: rotate(2deg) !important;`
- **Mobile Media Query (`css/polish.css:1508–1599`, ≤ 680px)**:
  - `.hero`: `display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 20px !important;`
  - `.wanted-poster-frame`: `margin: 18px auto 0 !important; justify-self: center !important; width: 100% !important; max-width: min(310px, 90vw) !important; transform: rotate(1deg) !important;`
  - `.wanted-annotation-note`: `right: 0; bottom: -50px; max-width: 160px;`
- **Exterior Overlay Elements**:
  - Chopper Peeking: `.chopper-peeking-wrap` (`top: -46px; left: -28px; width: 85px; height: 85px; z-index: 15;`). On viewports ≤ 375px, `left: -28px` protrudes past screen boundaries when the container is centered, risking horizontal scroll overflow.
  - Poster Pushpin: `.poster-pin` (`top: -12px; left: 50%; transform: translateX(-50%); width: 26px; height: 26px; z-index: 10;`).
  - Taped Note: `.wanted-annotation-note` (`bottom: -74px; right: 14px; max-width: 190px;` in `polish.css`).

---

## 2. Logic Chain

1. **Asset Discrepancy & Intent Recognition**:
   - The user provided `media_1794201865931_238ddac4.jpg` with instructions to *"replace the wanted poster with the uploaded image"* (R2).
   - The previous asset `deepak-wanted.jpg` was a square 1:1 anime portrait placed inside a faux CSS/HTML card that manually rendered text for "WANTED", "DEAD OR ALIVE", and "MARINE".
   - In contrast, the replacement image is an authentic, full One Piece Wanted Poster template (3:4 ratio, 768×1024px) already containing the weathered parchment texture, "WANTED", the photo frame, and "DEAD OR ALIVE".

2. **Aspect Ratio Mismatch**:
   - If the uploaded 3:4 portrait image is placed into the existing `.wanted-photo-container` without CSS changes, its default `aspect-ratio: 4 / 3.7` (~1.08) and `object-fit: cover` will crop off 31% of the top and bottom of the image (eliminating the "WANTED" title and bottom lettering).
   - If `object-fit: contain` were used without container adjustments, large blank pillarboxes would surround the shrunken template.
   - Furthermore, displaying the full template inside the inner photo container would cause jarring visual duplication: "WANTED", "DEAD OR ALIVE", and "MARINE" would appear both inside the image and on the outer HTML container.

3. **Asset Placement in Project Directory**:
   - Project assets reside in `c:\Users\altze\OneDrive\Desktop\portfolio-updated\portfolio\images\`.
   - The Acceptance Criteria specifically demand: *"The wanted poster element references and renders the uploaded image template (`media_1794201865931_238ddac4.jpg`)."*
   - The file must be copied to `images/media_1794201865931_238ddac4.jpg` and referenced as `images/media_1794201865931_238ddac4.jpg` in markup and configuration.

4. **Preserving Responsiveness and Preventing Horizontal Blowout**:
   - Desktop: Container `max-width: 350px` at `3:4` ratio yields `466.7px` height, comfortably fitting in the hero layout.
   - Tablet (681px–1024px): Container `max-width: 310px` at `3:4` yields `413.3px` height, sitting beside the hero text without shifting the layout leftward.
   - Mobile (≤ 680px): Container `max-width: min(290px, 84vw)` at `3:4` yields `~386px` height.
   - Mobile offset containment: `.chopper-peeking-wrap` must be constrained (e.g. `left: -12px`) and `.wanted-annotation-note` (`right: 6px`) to ensure no element bleeds past the 375px mobile viewport edge.

---

## 3. Caveats

1. **Interactive Overlays vs. Clean Image Presentation**:
   - The uploaded template has an empty center portrait box and placeholder script for the name and bounty.
   - If the template is used as the sole wanted poster element, the DOM name (`#wantedPosterName`) and interactive bounty counter (`#wantedPosterBounty`, `#wantedBountyRow`) will either need to be positioned as clean absolute overlays over the template lines, OR kept in the DOM (hidden/aria-accessible) so existing scripts (`PORTFOLIO_CONFIG` and the Easter Egg event listener in `index.html:6970`) do not fail.
2. **Duplicate File Synchronization**:
   - `Your Name – Portfolio.html` is an exact duplicate of `index.html`. Any changes applied to `index.html` should be mirrored to `Your Name – Portfolio.html` to avoid drift.
3. **Browser LocalStorage Cache**:
   - `index.html:6470` checks `localStorage.getItem("portfolio_wanted_photo")`. If a user previously uploaded a photo during testing, it takes precedence over `PORTFOLIO_CONFIG.photoUrl`. The implementation should reset or ensure the default `media_1794201865931_238ddac4.jpg` displays cleanly when no valid user override is active.

---

## 4. Conclusion & Technical Fix Strategy

### 4.1 Target Asset Location
Copy the source image from:
`C:/Users/altze/.gemini/antigravity/brain/432ee84e-dbf2-454c-a883-7605ebcc0179/.user_uploaded/media_1794201865931_238ddac4.jpg`
To:
`images/media_1794201865931_238ddac4.jpg`
*(Also consider maintaining `images/deepak-wanted.jpg` as a backup or alias to guarantee backwards compatibility).*

### 4.2 Recommended Markup Strategy (`index.html`)

Structure the Wanted Poster so that the uploaded template image is rendered cleanly with exact 3:4 aspect ratio, while retaining all interactive hooks and decorations:

```html
<!-- One Piece Wanted Bounty Poster Frame -->
<div class="wanted-poster-frame ink" id="wantedPoster" role="region" aria-label="One Piece Wanted Bounty Poster Frame">
  <!-- Chopper Spot 1: Reverse-Peeking Chopper -->
  <div class="chopper-peeking-wrap" id="chopperPeeking" title="Tony Tony Chopper peeking! Click him!">
    <svg viewBox="0 0 120 120" width="85" height="85" class="doodle" aria-hidden="true">...</svg>
    <div class="chopper-bubble" id="chopperPeekingBubble">
      “B-Baka! Looking at me won't make me happy, you bastard! (≧◡≦)”
    </div>
  </div>

  <!-- Red Pushpin -->
  <div class="poster-pin" aria-hidden="true"></div>

  <!-- Authentic Wanted Poster Template Image Container -->
  <div class="wanted-poster-media-wrap" id="wantedPhotoContainer" title="Official One Piece Wanted Poster">
    <img id="wantedPhotoImg"
         src="images/media_1794201865931_238ddac4.jpg"
         alt="One Piece Wanted Bounty Poster"
         class="wanted-poster-image"
         style="display: block;" />
    
    <!-- Retained interactive/dynamic overlay hooks -->
    <div class="wanted-overlay-content">
      <div class="wanted-name" id="wantedPosterName">DEEPAK PANDEY</div>
      <div class="wanted-bounty-row" id="wantedBountyRow" style="cursor:pointer" title="Click to raise bounty! +100M ฿">
        <span class="berry-symbol">฿</span>
        <span class="bounty-amount" id="wantedPosterBounty">3,000,000,000</span>
        <span class="bounty-dash">-</span>
      </div>
    </div>

    <!-- Hidden input for file upload if triggered -->
    <input type="file" id="wantedPhotoInput" accept="image/*" style="display:none;" />
    <div id="wantedPlaceholder" style="display:none;"></div>
    <span class="photo-change-badge" id="photoChangeBadge" style="display:none;">change photo ↺</span>
  </div>

  <!-- Taped Note Annotation -->
  <div class="wanted-annotation-note" aria-hidden="true">
    <span>Wanted: Relentless curiosity &amp; pure craft ✦</span>
  </div>
</div>
```

### 4.3 Recommended CSS Adjustments (`index.html` & `css/polish.css`)

```css
/* Container & Frame: exact 3:4 ratio, clean framing */
.wanted-poster-frame {
  position: relative;
  width: 100%;
  max-width: 350px;
  aspect-ratio: 3 / 4;
  justify-self: end;
  margin-left: auto;
  border-radius: 8px;
  box-shadow: 6px 10px 0 var(--shadow);
  transform: rotate(2deg);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
  user-select: none;
  background: #f5deb3; /* warm parchment base */
  border: 3px solid var(--ink);
  overflow: visible;
  padding: 0;
}

.wanted-poster-media-wrap {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 5px;
}

.wanted-poster-image,
.wanted-img {
  width: 100%;
  height: 100%;
  object-fit: fill; /* or contain */
  display: block;
}

/* Tablet Responsive Adjustments (681px - 1024px) */
@media (min-width: 681px) and (max-width: 1024px) {
  .wanted-poster-frame {
    max-width: 310px !important;
    aspect-ratio: 3 / 4 !important;
    margin: 0 0 0 auto !important;
    justify-self: end !important;
    transform: rotate(2deg) !important;
  }
}

/* Mobile Responsive Adjustments (<= 680px) */
@media (max-width: 680px) {
  .wanted-poster-frame {
    margin: 18px auto 0 !important;
    justify-self: center !important;
    width: 100% !important;
    max-width: min(290px, 84vw) !important;
    aspect-ratio: 3 / 4 !important;
    transform: rotate(1deg) !important;
  }

  /* Prevent Chopper from overflowing the mobile screen edge */
  .chopper-peeking-wrap {
    left: -12px !important;
    top: -40px !important;
  }

  /* Prevent note from overflowing the mobile right edge */
  .wanted-annotation-note {
    right: 6px !important;
    bottom: -44px !important;
    max-width: 150px !important;
  }
}
```

### 4.4 JavaScript Updates (`index.html:6200, 6474`)
- Line 6200:
  ```javascript
  photoUrl: "images/media_1794201865931_238ddac4.jpg",
  ```
- Line 6474:
  ```javascript
  setWantedPhoto(PORTFOLIO_CONFIG.photoUrl || "images/media_1794201865931_238ddac4.jpg");
  ```

---

## 5. Verification Method

Once implemented, independently verify using the following steps:

1. **Asset Presence & Integrity Check**:
   ```powershell
   Get-Item images\media_1794201865931_238ddac4.jpg | Select-Object Name, Length
   python -c "from PIL import Image; img = Image.open('images/media_1794201865931_238ddac4.jpg'); assert img.size == (768, 1024); print('Asset verified: 768x1024 (3:4 ratio)')"
   ```

2. **Markup Reference Check**:
   ```powershell
   Select-String -Path "index.html", "Your Name – Portfolio.html" -Pattern "media_1794201865931_238ddac4\.jpg"
   ```
   Must return matches for the `<img>` src and `PORTFOLIO_CONFIG.photoUrl`.

3. **HTTP 200 & Render Verification**:
   - Serve the portfolio via a local static server (e.g. `python -m http.server 8000`).
   - Open browser or request `http://localhost:8000/images/media_1794201865931_238ddac4.jpg` and verify HTTP 200.
   - Inspect `#wantedPoster` and `#wantedPhotoImg` via devtools across standard viewports (375px, 768px, 1024px, 1440px).
   - Check that `img.naturalWidth === 768` and `img.naturalHeight === 1024`, and that the computed ratio `renderedHeight / renderedWidth` equals `4 / 3 ≈ 1.333` without horizontal document scroll (`document.documentElement.scrollWidth <= window.innerWidth`).
