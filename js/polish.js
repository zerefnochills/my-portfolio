/* ==========================================================
   polish.js — loads after the main inline script in index.html
   ========================================================== */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js-polish");

  function loaderGone() {
    var l = document.getElementById("loader");
    if (!l) return true;
    return l.classList.contains("done") || l.style.display === "none";
  }

  /* 1. Headings fix.
     The original observer never fires on .write elements: they start with a
     zero-width clip-path, so IntersectionObserver treats them as invisible.
     Here we measure position instead, which ignores clip-path. */
  function revealWrites() {
    if (!loaderGone()) return;
    var vh = window.innerHeight;
    document.querySelectorAll(".write:not(#q):not(.on)").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh * 0.92) {
        if (el.dataset.t) el.style.setProperty("--t", el.dataset.t);
        el.classList.add("on");
      }
    });
  }

  /* 2. Scroll progress bar. */
  var bar = document.createElement("div");
  bar.id = "scrollProgress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  function updateProgress() {
    var max = root.scrollHeight - window.innerHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ")";
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      revealWrites();
      updateProgress();
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  /* 3. Once the loader is gone: reveal headings, start typewriter, and drop the poster in. */
  var started = false;
  function start() {
    if (started) return;
    started = true;
    revealWrites();
    setTimeout(revealWrites, 400);
    var poster = document.querySelector(".wanted-poster-frame");
    if (poster) poster.classList.add("poster-in");
    updateProgress();
    initHeroTypewriter();
  }

  /* 4. Hero Tagline Character-by-Character Scaling Typewriter Animation Loop */
  function initHeroTypewriter() {
    var textEl = document.getElementById("typewriterText");
    var cursor = document.querySelector(".typewriter-cursor");
    if (!textEl) return;

    var words = [
      { text: "Founder", bold: false },
      { text: "&", bold: false },
      { text: "Software", bold: false },
      { text: "Craftsman", bold: false },
      { text: "·", bold: false, pause: 180 },
      { text: "Crafting", bold: false },
      { text: "scalable", bold: true },
      { text: "web", bold: false },
      { text: "platforms,", bold: false, pause: 130 },
      { text: "digital", bold: false },
      { text: "systems,", bold: false, pause: 130 },
      { text: "and", bold: false },
      { text: "creative", bold: true },
      { text: "code.", bold: true }
    ];

    var charStack = [];
    var wordIdx = 0;
    var charIdx = 0;
    var currentWordEl = null;

    // Clear initial static content before starting typewriter loop
    textEl.innerHTML = "";

    function typeNext() {
      if (wordIdx >= words.length) {
        // Sentence fully typed: stop cursor blink suppression, hold for 2.6s for comfortable reading
        if (cursor) cursor.classList.remove("typing");
        setTimeout(startDelete, 2600);
        return;
      }

      var w = words[wordIdx];

      // If at start of a word, create word container (preserves clean word wrap)
      if (charIdx === 0) {
        currentWordEl = document.createElement(w.bold ? "strong" : "span");
        currentWordEl.className = "tw-word" + (w.bold ? " tw-bold" : "");
        textEl.appendChild(currentWordEl);
        if (cursor) cursor.classList.add("typing");
      }

      // Create individual character span with scale animation
      var char = w.text[charIdx];
      var charSpan = document.createElement("span");
      charSpan.className = "tw-char";
      charSpan.textContent = char;
      currentWordEl.appendChild(charSpan);
      charStack.push({ type: "char", el: charSpan, parent: currentWordEl });

      charIdx++;
      if (charIdx >= w.text.length) {
        // Word complete
        wordIdx++;
        charIdx = 0;
        if (wordIdx < words.length) {
          var space = document.createTextNode(" ");
          textEl.appendChild(space);
          charStack.push({ type: "space", el: space });
        }
        var delay = w.pause || 36;
        setTimeout(typeNext, delay);
      } else {
        setTimeout(typeNext, 34);
      }
    }

    function startDelete() {
      if (cursor) cursor.classList.add("typing");

      function deleteNext() {
        if (charStack.length === 0) {
          textEl.innerHTML = "";
          wordIdx = 0;
          charIdx = 0;
          currentWordEl = null;
          if (cursor) cursor.classList.remove("typing");
          setTimeout(typeNext, 450);
          return;
        }

        var item = charStack.pop();
        if (item.type === "char") {
          item.el.classList.add("tw-out");
          setTimeout(function () {
            if (item.el && item.el.parentNode) item.el.remove();
            if (item.parent && item.parent.children.length === 0 && item.parent.parentNode) {
              item.parent.remove();
            }
          }, 70);
        } else if (item.type === "space") {
          if (item.el && item.el.parentNode) item.el.remove();
        }

        setTimeout(deleteNext, 14);
      }

      deleteNext();
    }

    // Start typing after brief initial settle
    setTimeout(typeNext, 300);
  }

  var poll = setInterval(function () {
    if (loaderGone()) { clearInterval(poll); start(); }
  }, 120);

  /* Failsafe: never leave the poster hidden if something goes wrong. */
  setTimeout(function () {
    clearInterval(poll);
    var poster = document.querySelector(".wanted-poster-frame");
    if (poster) poster.classList.add("poster-in");
    start();
  }, 20000);
})();
