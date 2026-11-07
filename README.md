# ✒️ Hand-Drawn Digital Sketchbook Portfolio

A distinctive, hand-crafted developer & designer portfolio built with tactile ink-on-parchment aesthetics, SVG turbulence wobble filters, interactive guest doodle canvas, synthesized pen audio, and One Piece / Luffy inspired touches.

---

## 🎨 New Features & Enhancements

1. **One Piece Wanted Bounty Poster Frame (Hero Section)**:
   - Iconic One Piece Wanted poster pinned to the page with a red pushpin.
   - Includes **"WANTED"**, **"DEAD OR ALIVE"**, dynamic Name, Berry bounty (`฿ 3,000,000,000 -`), and Marine seagull anchor seal stamp.
   - **Adding your photo is effortless**:
     - **Option 1**: Simply click on the photo frame on the web page to select an image from your computer, or drag & drop any photo file directly onto it! (Persists automatically in browser storage).
     - **Option 2**: Place your image as `photo.jpg` in the portfolio directory and set `photoUrl: "photo.jpg"` in `PORTFOLIO_CONFIG`.
     - *If no photo is uploaded, it shows a hand-drawn Straw Hat pirate silhouette doodle.*

2. **Theme Switcher (`ink` palette dropdown in navigation)**:
   - **Indigo Paper** (Classic warm parchment with royal blue ink)
   - **Walnut Sepia** (Vintage aged paper with deep espresso tones)
   - **Forest Green** (Botanical sketchbook with pine ink)
   - **Blueprint Dark** (Architect night mode with chalk cyan accents)
   - *Saves preference in `localStorage` across visits.*

2. **Zero-Dependency Synthesized Audio (Web Audio API)**:
   - Tactile fountain pen scratch sounds on drawing, button clicks, and link hovers.
   - Paper rustle sounds when opening case study dialogs or changing tabs.
   - Easily toggled on/off with the handwritten `sound on / sound off` button.

3. **Interactive Project Showcase & Sketchbook Modal**:
   - Filter projects by domain: **All Sketches**, **Full Stack**, **Creative UI**, **Tools & Experiments**.
   - Clicking any card opens a hand-drawn sketchbook dialog with architectural highlights, key craftsmanship notes, live demo links, and GitHub links.
   - Full keyboard accessibility (Enter/Space to open, Esc to close, tab navigation).

4. **Interactive Guest Doodle Canvas**:
   - Visitors can draw directly onto the parchment in real-time with smooth Bézier curve interpolation.
   - 4 ink colors (Indigo, Crimson, Forest, Sepia).
   - Stamp button to stamp Luffy's straw hat onto the page.
   - Save button (`.png` download) and wipe clear button.

5. **Handwritten Postcard & Airmail Contact Form**:
   - Vintage postcard layout with airmail border and postal stamp.
   - Enter your name, email, and message.
   - "Send Letter" action with paper airplane delivery animation, instant feedback, and pre-formatted mail client integration.

6. **Interactive Easter Eggs**:
   - **Coffee / Tea Ring**: Click the coffee stain in the top-right corner to leave faint coffee drops on the paper!
   - **Straw Hat Quote Generator**: Click the straw hat during loader or visit to cycle inspirational quotes (Luffy, Zoro, Dr. Hiluluk, etc.).
   - **Fast Loader**: Press Space or click `skip intro ↵` anytime to jump straight in; subsequent page visits automatically speed up.

---

## ⚙️ Quick Customization (in 60 seconds!)

Open [`index.html`](file:///c:/Users/altze/OneDrive/Desktop/portfolio/index.html) or [`Your Name – Portfolio.html`](file:///c:/Users/altze/OneDrive/Desktop/portfolio/Your%20Name%20–%20Portfolio.html) and locate the `PORTFOLIO_CONFIG` object near line 640:

```javascript
const PORTFOLIO_CONFIG = {
  name: "Your Name",           // Your display name
  bounty: "3,000,000,000",     // Wanted poster berry bounty amount
  photoUrl: "",               // Path to your photo e.g. "photo.jpg" (or click the Wanted Poster to upload)
  tagline: "...",             // Your hero bio
  email: "you@example.com",   // Your contact email
  status: "AVAILABLE FOR WORK · 2026",
  socials: {
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    resume: "/resume.pdf"
  },
  quotes: [...],              // Quotes displayed on straw hat click
  projects: { ... }           // Add, remove, or customize your projects
};
```
Everything updates dynamically across navigation, hero, postcard recipient, and modal case studies.

---

## 🚀 How to Run & Deploy

### Local Preview
- Simply double-click [`index.html`](file:///c:/Users/altze/OneDrive/Desktop/portfolio/index.html) in your file manager to open it in any browser!
- Or run a local live server:
  ```bash
  npx serve .
  ```

### Deployment
- **GitHub Pages**: Push this directory to a GitHub repository, go to `Settings > Pages`, and select `main` branch.
- **Vercel / Netlify**: Drag-and-drop the portfolio folder into the dashboard for instantaneous zero-config deployment.

