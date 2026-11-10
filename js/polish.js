/* ==========================================================
   polish.js — loads after the main inline script in index.html
   ========================================================== */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js-polish");

  function loaderGone() { return !document.getElementById("loader"); }

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

  /* 4. Hero Tagline Word-by-Word Typewriter Animation Loop */
  function initHeroTypewriter() {
    var textEl = document.getElementById("typewriterText");
    if (!textEl) return;

    var tokens = [
      "Founder", "&", "Software", "Craftsman", "·",
      "Crafting", "<strong>scalable</strong>", "web", "platforms,",
      "digital", "systems,", "and", "<strong>creative code</strong>."
    ];

    var idx = 0;
    var deleting = false;

    function step() {
      if (!deleting) {
        idx++;
        textEl.innerHTML = tokens.slice(0, idx).join(" ");
        if (idx >= tokens.length) {
          // Finished full sentence: hold for 2.4s so user can read it
          setTimeout(function () {
            deleting = true;
            step();
          }, 2400);
          return;
        }
        setTimeout(step, 190);
      } else {
        // Disappear and loop
        idx -= 2;
        if (idx <= 0) {
          idx = 0;
          deleting = false;
          textEl.innerHTML = "";
          setTimeout(step, 650); // brief pause before looping again
          return;
        }
        textEl.innerHTML = tokens.slice(0, idx).join(" ");
        setTimeout(step, 70);
      }
    }

    setTimeout(step, 500);
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
