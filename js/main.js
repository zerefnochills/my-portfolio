/**
     * =========================================================================
     * PORTFOLIO CONFIGURATION
     * =========================================================================
     * Easily customize your details below! All changes will reflect across the site.
     */
    const PORTFOLIO_CONFIG = window.PORTFOLIO_CONFIG = {
      name: "Deepak Pandey",
      bounty: "3,000,000,000",
      photoUrl: "images/media_1794201865931_238ddac4.jpg", // Official Wanted Poster Template
      wantedPosterPhoto: "images/media_1794201865931_238ddac4.jpg",
      tagline: "Founder & Software Craftsman · Crafting scalable web platforms, digital systems, and creative code.",
      email: "deepak@synapsecalyx.com",
      status: "FOUNDER @ SYNAPSE CALYX · OPEN FOR COLLABORATIONS · 2026",
      socials: {
        github: "https://github.com/zerefnochills",
        linkedin: "https://linkedin.com",
        resume: "#"
      },
      achievements: [
        {
          id: "ach-deepak-1",
          category: "milestone",
          icon: "★",
          badge: "FOUNDER",
          badgeColor: "gold",
          title: "Founded Synapse Calyx — Digital Services & Engineering Studio",
          issuer: "Synapse Calyx",
          date: "2025 – Present",
          description: "Launched Synapse Calyx to deliver premium digital services, high-throughput cloud architectures, and bespoke web platforms for modern enterprises.",
          tags: ["Founder", "Digital Services", "Architecture"],
          link: "#",
          linkLabel: "Synapse Calyx ↗"
        },
        {
          id: "ach-deepak-2",
          category: "award",
          icon: "★",
          badge: "EVENT ORGANISER",
          badgeColor: "purple",
          title: "Lead Event Organiser — Cluster Community | GU",
          issuer: "Cluster Community · Galgotias University",
          date: "2025 – Present",
          description: "Spearheaded flagship tech hackathons, developer workshops, and tech meetups, empowering hundreds of student developers and creative coders.",
          tags: ["Community", "Hackathons", "Cluster GU"],
          link: "#",
          linkLabel: "Community Hub ↗"
        },
        {
          id: "ach-deepak-3",
          category: "opensource",
          icon: "★",
          badge: "TECH LEAD",
          badgeColor: "blue",
          title: "Tech Lead — Ralph Co.",
          issuer: "Ralph Co.",
          date: "2024 – 2025",
          description: "Served as Tech Lead directing engineering sprints, mentoring developer teams, establishing code quality benchmarks, and shipping high-impact client systems.",
          tags: ["Tech Lead", "Leadership", "Ralph Co."],
          link: "#",
          linkLabel: "Engineering Log ↗"
        },
        {
          id: "ach-deepak-4",
          category: "hackathon",
          icon: "★",
          badge: "1ST PLACE",
          badgeColor: "gold",
          title: "Grand Champion — National Innovation Hackathon 2026",
          issuer: "Ministry of Tech & Global Developer Forum",
          date: "Feb 2026",
          description: "Built an offline-first collaborative canvas with CRDT synchronization and real-time audio synthesis across 48 intense hours, competing against 150+ teams.",
          tags: ["CRDT", "WebSockets", "First Prize"],
          link: "#",
          linkLabel: "View Project ↗"
        },
        {
          id: "ach-deepak-5",
          category: "milestone",
          icon: "★",
          badge: "BOUNTY RECORD",
          badgeColor: "red",
          title: "3,000,000,000฿ Bounty Club Unlocked",
          issuer: "Grand Line Engineering Fleet",
          date: "2026",
          description: "Achieved legendary status across shipped production services, client architectures, and relentless pursuit of technical excellence.",
          tags: ["Deepak Pandey", "Full Stack", "Legendary"],
          link: "#wantedPoster",
          linkLabel: "Inspect Bounty ↗"
        }
      ],
      quotes: [
        { quote: "“As long as I live, there are infinite chances.”", by: "— Monkey D. Luffy" }
      ],
      projects: {
        inkflow: {
          title: "InkFlow Journal",
          category: "Full Stack App",
          badge: "Featured ★",
          tags: ["React", "TypeScript", "Node.js", "SQLite", "Canvas API", "PWA"],
          description: "A distraction-free markdown sketchbook with live vector ink sketching, offline-first sync, and custom hand-drawn calligraphy typography.",
          highlights: [
            "Vector ink smoothing engine using quadratic Bézier curves with dynamic pen pressure response.",
            "Local-first architecture using IndexedDB with background optimistic synchronization to a SQLite backend.",
            "Export notes to clean PDF with vector sketches and Markdown formatting intact.",
            "Zero tracking, completely private, installable as an offline Progressive Web App."
          ],
          liveUrl: "#",
          githubUrl: "https://github.com"
        },
        voyagemap: {
          title: "VoyageMap Explorer",
          category: "Creative Canvas",
          badge: "Interactive UI",
          tags: ["TypeScript", "SVG Animations", "Canvas API", "CSS Grid", "GeoJSON"],
          description: "An interactive cartography and voyage explorer tool that visualizes story journeys and nautical coordinates with hand-drawn trails and waypoint logs.",
          highlights: [
            "Procedural island generator with hand-drawn SVG coastal topography.",
            "Timeline scrubbing system that animates vessel progress across routes with custom audio waves.",
            "High-performance HTML5 Canvas renderer capable of 60 FPS across thousands of animated nautical nodes."
          ],
          liveUrl: "#",
          githubUrl: "https://github.com"
        },
        paperpulse: {
          title: "PaperPulse Sync",
          category: "Distributed Systems",
          badge: "Real-Time",
          tags: ["WebSockets", "Go", "Redis", "Yjs / CRDT", "Canvas Physics"],
          description: "Real-time collaborative whiteboard with peer-to-peer ink stroke synchronization, CRDT conflict resolution, and tactile drawing physics.",
          highlights: [
            "Built resilient WebSocket pub/sub engine in Go handling 10,000+ simultaneous connections with low latency.",
            "CRDT conflict-free replicated data types ensuring zero stroke loss during network drops or concurrent edits.",
            "Infinite canvas zoom & pan with virtualized viewport rendering for instant rendering speeds."
          ],
          liveUrl: "#",
          githubUrl: "https://github.com"
        },
        shikisynth: {
          title: "ShikiSynth Audio",
          category: "Audio Experiment",
          badge: "Web Audio",
          tags: ["Web Audio API", "Vanilla JavaScript", "Custom Oscillators", "Canvas"],
          description: "A browser-based synthesizer that sonifies drawing gestures, translating pen pressure, speed, and strokes into ambient procedural harmonies.",
          highlights: [
            "Dual FM synthesis engine driven by real-time pointer coordinates and acceleration vectors.",
            "Custom biquad resonant filter modulating harmonics based on stroke curvature.",
            "Completely self-contained in zero external dependencies, weighing under 15KB compressed."
          ],
          liveUrl: "#",
          githubUrl: "https://github.com"
        }
      }
    };

    (function () {
      "use strict";


      // =========================================================================
      // ONE PIECE: RORONOA ZORO & GLOWING ENMA SWORD CURSOR ENGINE
      // =========================================================================
      const cursorToggleBtn = document.getElementById("cursorToggle");
      const cursorLabel = document.getElementById("cursorLabel");
      const savedCursorState = localStorage.getItem("portfolio_zoro_cursor");

      if (document.body && document.body.classList) {
        if (savedCursorState === "disabled") {
          document.body.classList.remove("zoro-cursor-active");
          if (cursorToggleBtn) cursorToggleBtn.classList.remove("active");
          if (cursorLabel) cursorLabel.textContent = "default";
        } else {
          document.body.classList.add("zoro-cursor-active");
          if (cursorToggleBtn) cursorToggleBtn.classList.add("active");
          if (cursorLabel) cursorLabel.textContent = "zoro";
        }
      }

      if (cursorToggleBtn) {
        cursorToggleBtn.addEventListener("click", function () {
          if (!document.body || !document.body.classList) return;
          const isNowActive = document.body.classList.toggle("zoro-cursor-active");
          cursorToggleBtn.classList.toggle("active", isNowActive);
          if (cursorLabel) cursorLabel.textContent = isNowActive ? "zoro" : "default";
          localStorage.setItem("portfolio_zoro_cursor", isNowActive ? "enabled" : "disabled");
          playPaperRustle();
        });
      }

      // Crimson Conqueror's Haki Slash effect on click (skip on touch devices / Android for optimal performance)
      window.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "touch" || e.pointerType === "pen" || document.documentElement.classList.contains("is-android")) return;
        if (!document.body || !document.body.classList || !document.body.classList.contains("zoro-cursor-active")) return;

        // Spawn subtle crimson Haki crescent slash
        const slash = document.createElement("div");
        slash.className = "enma-slash-fx";
        slash.style.left = e.clientX + "px";
        slash.style.top = e.clientY + "px";
        slash.innerHTML = `<svg viewBox="0 0 60 60" width="56" height="56">
      <defs>
        <linearGradient id="hakiGrad_${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="25%" stop-color="#fca5a5"/>
          <stop offset="60%" stop-color="#ef4444"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </linearGradient>
      </defs>
      <path d="M6 6 Q 38 18 48 48 Q 28 32 6 6 Z" fill="url(#hakiGrad_${Date.now()})"/>
      <path d="M10 10 Q 36 20 44 44" stroke="#ffffff" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`;

        document.body.appendChild(slash);
        setTimeout(() => {
          if (slash.parentNode) slash.parentNode.removeChild(slash);
        }, 400);
      });

      // 1. Apply config to DOM elements
      function applyConfig() {
        document.title = PORTFOLIO_CONFIG.name + " – Portfolio & Digital Sketchbook";
        const logoName = document.getElementById("siteLogoName");
        const heroName = document.getElementById("heroName");
        const heroTagline = document.getElementById("heroTagline");
        const availText = document.getElementById("availabilityText");
        const directEmail = document.getElementById("directEmailLink");
        const postRecipient = document.getElementById("postcardRecipientName");
        const ghLink = document.getElementById("githubLink");
        const liLink = document.getElementById("linkedinLink");
        const resLink = document.getElementById("resumeLink");
        const wantedPosterName = document.getElementById("wantedPosterName");
        const wantedPosterBounty = document.getElementById("wantedPosterBounty");

        if (logoName) logoName.textContent = PORTFOLIO_CONFIG.name;
        if (heroName) {
          const parts = (PORTFOLIO_CONFIG.name || "").split(" ");
          if (parts.length > 1) {
            heroName.innerHTML = `<span class="name-first">${parts.slice(0, -1).join(" ")}</span> <span class="name-last">${parts[parts.length - 1]}</span>`;
          } else {
            heroName.textContent = PORTFOLIO_CONFIG.name;
          }
        }
        if (heroTagline) {
          let typewriterEl = document.getElementById("typewriterText");
          if (!typewriterEl) {
            heroTagline.innerHTML = `<span class="typewriter-text" id="typewriterText">${PORTFOLIO_CONFIG.tagline || ""}</span><span class="typewriter-cursor" aria-hidden="true">|</span>`;
          }
        }
        if (availText) availText.textContent = PORTFOLIO_CONFIG.status;
        if (wantedPosterName) wantedPosterName.textContent = PORTFOLIO_CONFIG.name;
        if (wantedPosterBounty) wantedPosterBounty.textContent = PORTFOLIO_CONFIG.bounty;
        if (directEmail) {
          directEmail.href = "mailto:" + PORTFOLIO_CONFIG.email;
          directEmail.querySelector("span").textContent = PORTFOLIO_CONFIG.email;
        }
        if (postRecipient) postRecipient.textContent = PORTFOLIO_CONFIG.name;
        if (ghLink) ghLink.href = PORTFOLIO_CONFIG.socials.github;
        if (liLink) liLink.href = PORTFOLIO_CONFIG.socials.linkedin;
        if (resLink) resLink.href = PORTFOLIO_CONFIG.socials.resume;

        // Kurian contact section bindings
        const contactEmailVal = document.getElementById("contactEmailDisplay");
        if (contactEmailVal) contactEmailVal.textContent = PORTFOLIO_CONFIG.email;
        const contactGh = document.getElementById("contactGithubLink");
        if (contactGh) contactGh.href = PORTFOLIO_CONFIG.socials.github;
        const contactLi = document.getElementById("contactLinkedInLink");
        if (contactLi) contactLi.href = PORTFOLIO_CONFIG.socials.linkedin;
      }
      applyConfig();

      // One Piece Wanted Poster Photo Loader
      const wantedPhotoContainer = document.getElementById("wantedPhotoContainer");
      const wantedPhotoInput = document.getElementById("wantedPhotoInput");
      const wantedPhotoImg = document.getElementById("wantedPhotoImg");
      const wantedPortraitImg = document.getElementById("wantedPortraitImg");
      const wantedPlaceholder = document.getElementById("wantedPlaceholder");
      const photoChangeBadge = document.getElementById("photoChangeBadge");

      function setWantedPhoto(src) {
        if (!wantedPhotoImg || !wantedPlaceholder) return;
        if (src) {
          if (src.includes("media_1794201865931_238ddac4.jpg") || src.includes("wanted-poster-template.jpg")) {
            wantedPhotoImg.src = src;
            wantedPhotoImg.style.display = "block";
            if (wantedPortraitImg) {
              wantedPortraitImg.style.display = "block";
              wantedPortraitImg.src = "images/deepak-wanted.jpg";
            }
          } else if (wantedPortraitImg) {
            wantedPortraitImg.src = src;
            wantedPortraitImg.style.display = "block";
            wantedPhotoImg.style.display = "block";
          } else {
            wantedPhotoImg.src = src;
            wantedPhotoImg.style.display = "block";
          }
          wantedPlaceholder.style.display = "none";
          if (photoChangeBadge) photoChangeBadge.style.display = "block";
        } else {
          wantedPhotoImg.removeAttribute("src");
          wantedPhotoImg.style.display = "none";
          if (wantedPortraitImg) {
            wantedPortraitImg.removeAttribute("src");
            wantedPortraitImg.style.display = "none";
          }
          wantedPlaceholder.style.display = "flex";
          if (photoChangeBadge) photoChangeBadge.style.display = "none";
        }
      }

      // Load saved photo or config photo
      const savedPhoto = localStorage.getItem("portfolio_wanted_photo");
      if (savedPhoto && savedPhoto.startsWith("data:image")) {
        setWantedPhoto(savedPhoto);
      } else {
        setWantedPhoto(PORTFOLIO_CONFIG.photoUrl || PORTFOLIO_CONFIG.wantedPosterPhoto || "images/media_1794201865931_238ddac4.jpg");
      }

      if (wantedPhotoContainer && wantedPhotoInput) {
        wantedPhotoContainer.addEventListener("click", function () {
          wantedPhotoInput.click();
        });
        wantedPhotoContainer.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            wantedPhotoInput.click();
          }
        });

        wantedPhotoInput.addEventListener("change", function (e) {
          const file = e.target.files && e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
              const dataUrl = evt.target.result;
              setWantedPhoto(dataUrl);
              try {
                localStorage.setItem("portfolio_wanted_photo", dataUrl);
              } catch (err) { }
              playPaperRustle();
            };
            reader.readAsDataURL(file);
          }
        });

        // Drag and drop photo onto Wanted Poster
        wantedPhotoContainer.addEventListener("dragover", function (e) {
          e.preventDefault();
          wantedPhotoContainer.classList.add("dragover");
        });
        wantedPhotoContainer.addEventListener("dragleave", function () {
          wantedPhotoContainer.classList.remove("dragover");
        });
        wantedPhotoContainer.addEventListener("drop", function (e) {
          e.preventDefault();
          wantedPhotoContainer.classList.remove("dragover");
          const file = e.dataTransfer.files && e.dataTransfer.files[0];
          if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (evt) {
              const dataUrl = evt.target.result;
              setWantedPhoto(dataUrl);
              try {
                localStorage.setItem("portfolio_wanted_photo", dataUrl);
              } catch (err) { }
              playPaperRustle();
            };
            reader.readAsDataURL(file);
          }
        });
      }

      // 2. Synthesized Web Audio Sound Effects (Zero External Files)
      window.AUDIO_COOLDOWN = 220;
      window.lastPenAudioTime = 0;
      let audioCtx = null;
      let soundEnabled = localStorage.getItem("portfolio_sound") === "true";

      function getAudioContext() {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        return audioCtx;
      }

      function playPenScratch() {
        const now = Date.now();
        if (now - (window.lastPenAudioTime || 0) < (window.AUDIO_COOLDOWN || 220)) return;
        window.lastPenAudioTime = now;
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        try {
          const bufferSize = ctx.sampleRate * 0.05;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 1600 + Math.random() * 400;
          filter.Q.value = 3.0;
          const gain = ctx.createGain();
          gain.gain.value = 0.08;
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
        } catch (e) { }
      }
      window.playPenScratch = playPenScratch;

      function playPaperRustle() {
        if (!soundEnabled) return;
        const ctx = getAudioContext();
        if (!ctx) return;
        try {
          const bufferSize = ctx.sampleRate * 0.12;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5));
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 850;
          const gain = ctx.createGain();
          gain.gain.value = 0.12;
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          noise.start();
        } catch (e) { }
      }

      function updateSoundUI() {
        const soundToggle = document.getElementById("soundToggle");
        const soundLabel = document.getElementById("soundLabel");
        const w1 = document.getElementById("soundWave1");
        const w2 = document.getElementById("soundWave2");
        if (!soundToggle) return;
        if (soundEnabled) {
          soundLabel.textContent = "sound on";
          if (w1) w1.style.display = "block";
          if (w2) w2.style.display = "block";
        } else {
          soundLabel.textContent = "sound off";
          if (w1) w1.style.display = "none";
          if (w2) w2.style.display = "none";
        }
      }
      updateSoundUI();

      const soundBtn = document.getElementById("soundToggle");
      if (soundBtn) {
        soundBtn.addEventListener("click", function () {
          soundEnabled = !soundEnabled;
          localStorage.setItem("portfolio_sound", soundEnabled ? "true" : "false");
          updateSoundUI();
          if (soundEnabled) {
            getAudioContext();
            playPenScratch();
          }
        });
      }

      // 3. Theme Engine
      const themeBtn = document.getElementById("themeBtn");
      const themeMenu = document.getElementById("themeMenu");
      const savedTheme = localStorage.getItem("portfolio_theme") || "parchment";
      document.documentElement.setAttribute("data-theme", savedTheme);

      if (themeBtn && themeMenu) {
        themeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          themeMenu.classList.toggle("open");
          playPaperRustle();
        });
        document.addEventListener("click", function () {
          themeMenu.classList.remove("open");
        });
        themeMenu.querySelectorAll(".theme-opt").forEach(function (opt) {
          opt.addEventListener("click", function () {
            const themeVal = opt.dataset.themeVal;
            document.documentElement.setAttribute("data-theme", themeVal);
            localStorage.setItem("portfolio_theme", themeVal);
            themeMenu.classList.remove("open");
            playPenScratch();
          });
        });
      }

      // 4. Loader with quote cycling & skip
      document.querySelectorAll(".draw path, .draw ellipse, .draw line, .draw polygon, .draw rect").forEach(function (p) {
        p.setAttribute("pathLength", 1);
      });

      const loader = document.getElementById("loader");
      const bar = document.getElementById("bar");
      const pct = document.getElementById("pct");
      const qEl = document.getElementById("q");
      const byEl = document.getElementById("by");
      const skipBtn = document.getElementById("skipLoaderBtn");
      const hatClicker = document.getElementById("hatClicker");

      const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isRevisit = sessionStorage.getItem("portfolio_visited") === "true";
      const total = reduceMotion ? 200 : (isRevisit ? 3000 : 5000);
      let start = null;
      let loaderDone = false;

      // Fixed Monkey D. Luffy Quote
      function renderQuote() {
        const qObj = PORTFOLIO_CONFIG.quotes[0];
        if (qEl && byEl) {
          qEl.textContent = qObj.quote;
          byEl.textContent = qObj.by;
        }
      }
      renderQuote();

      if (hatClicker) {
        hatClicker.addEventListener("click", function () {
          renderQuote();
          playPenScratch();
        });
      }

      requestAnimationFrame(function () {
        if (qEl) qEl.classList.add("on");
        if (byEl) byEl.classList.add("on");
      });

      const isTransitionReturn = Boolean(sessionStorage.getItem("portfolio_visited") === "true" && (sessionStorage.getItem("page_transition_state") || document.documentElement.classList.contains("page-is-transitioning")));
      if (isTransitionReturn) {
        enterSite();
        return;
      }

      setTimeout(enterSite, 6200); // Safety timeout guarantee
      function tick(ts) {
        if (loaderDone) return;
        if (!start) start = ts;
        const t = Math.min((ts - start) / total, 1);
        const ease = 1 - Math.pow(1 - t, 2);
        if (bar) {
          bar.style.setProperty("--p", ease);
          const barPath = bar.querySelector("path");
          if (barPath) barPath.style.strokeDashoffset = 1 - ease;
        }
        if (pct) pct.textContent = Math.round(ease * 100) + "%";
        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          setTimeout(enterSite, 250);
        }
      }
      requestAnimationFrame(tick);

      function enterSite() {
        if (loaderDone) return;
        loaderDone = true;
        sessionStorage.setItem("portfolio_visited", "true");
        if (loader) {
          loader.classList.add("done");
          setTimeout(function () {
            loader.remove();
            observeElements();
          }, reduceMotion ? 10 : 600);
        } else {
          observeElements();
        }
      }

      // Skipping feature: click anywhere on the loader screen or press Space / Enter / Escape
      if (loader) {
        loader.addEventListener("click", function () {
          enterSite();
        });
      }
      if (skipBtn) {
        skipBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          enterSite();
        });
      }
      window.addEventListener("keydown", function (e) {
        if ((e.code === "Space" || e.key === "Enter" || e.key === "Escape") && !loaderDone) {
          e.preventDefault();
          enterSite();
        }
      });

      // 5. Scroll Intersection Observer for Hand-Drawn Elements
      function observeElements() {
        const io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              const el = entry.target;
              if (el.dataset.t) el.style.setProperty("--t", el.dataset.t);
              el.classList.add("on");
              io.unobserve(el);
            }
          });
        }, { threshold: 0.15 });

        document.querySelectorAll(".write:not(#q), .ink:not(#by), .draw").forEach(function (el) {
          io.observe(el);
        });
      }

      // 6. Project Filters
      const filterPills = document.querySelectorAll(".filter-pill");
      const projectCards = document.querySelectorAll(".card[data-category]");

      filterPills.forEach(function (pill) {
        pill.addEventListener("click", function () {
          filterPills.forEach(function (p) { p.classList.remove("active"); });
          pill.classList.add("active");
          const target = pill.dataset.filter;
          playPenScratch();

          projectCards.forEach(function (card) {
            if (target === "all" || card.dataset.category === target) {
              card.style.display = "flex";
              setTimeout(function () { card.style.opacity = "1"; card.style.transform = "none"; }, 20);
            } else {
              card.style.opacity = "0";
              card.style.transform = "scale(0.95)";
              setTimeout(function () { card.style.display = "none"; }, 200);
            }
          });
        });
      });

      // 7. Sketchbook Case Study Modal
      const modal = document.getElementById("sketchModal");
      const modalClose = document.getElementById("modalCloseBtn");
      const modalBadge = document.getElementById("modalBadge");
      const modalHeading = document.getElementById("modalHeading");
      const modalTags = document.getElementById("modalTags");
      const modalDesc = document.getElementById("modalDescription");
      const modalHighlights = document.getElementById("modalHighlights");
      const modalLive = document.getElementById("modalLiveLink");
      const modalGithub = document.getElementById("modalGithubLink");

      function openProjectModal(projectId) {
        const proj = PORTFOLIO_CONFIG.projects[projectId];
        if (!proj) return;

        if (modalBadge) modalBadge.textContent = proj.badge;
        if (modalHeading) modalHeading.textContent = proj.title;
        if (modalDesc) modalDesc.textContent = proj.description;

        if (modalTags) {
          modalTags.innerHTML = "";
          proj.tags.forEach(function (t) {
            const span = document.createElement("span");
            span.className = "modal-tag";
            span.textContent = t;
            modalTags.appendChild(span);
          });
        }

        if (modalHighlights) {
          modalHighlights.innerHTML = "";
          proj.highlights.forEach(function (hl) {
            const li = document.createElement("li");
            li.textContent = hl;
            modalHighlights.appendChild(li);
          });
        }

        if (modalLive) modalLive.href = proj.liveUrl;
        if (modalGithub) modalGithub.href = proj.githubUrl;

        if (modal) {
          modal.classList.add("open");
          document.body.style.overflow = "hidden";
          playPaperRustle();
        }
      }

      function closeProjectModal() {
        if (modal) {
          modal.classList.remove("open");
          document.body.style.overflow = "";
          playPaperRustle();
        }
      }

      projectCards.forEach(function (card) {
        card.addEventListener("click", function () {
          const pid = card.dataset.projectId;
          openProjectModal(pid);
        });
        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const pid = card.dataset.projectId;
            openProjectModal(pid);
          }
        });
      });

      if (modalClose) modalClose.addEventListener("click", closeProjectModal);
      if (modal) {
        modal.addEventListener("click", function (e) {
          if (e.target === modal) closeProjectModal();
        });
      }
      window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal && modal.classList.contains("open")) {
          closeProjectModal();
        }
      });

      // 8. Left Ribbon Sketchbook Button Transition
      const ribbonBtn = document.getElementById("sketchbookRibbonBtn");

      if (ribbonBtn) {
        ribbonBtn.addEventListener("click", function (e) {
          e.preventDefault();
          ribbonBtn.disabled = true;
          if (window.PageTransition) {
            window.PageTransition.navigate("doodle.html");
          } else {
            playPaperRustle();
            setTimeout(function () {
              window.location.href = "doodle.html";
            }, 300);
          }
        });
      }

      // 9. Interactive Coffee Drops
      const coffeeStain = document.getElementById("coffeeStain");
      if (coffeeStain) {
        coffeeStain.addEventListener("click", function (e) {
          playPenScratch();
          const drop = document.createElement("div");
          drop.className = "coffee-drop";
          const size = 30 + Math.random() * 40;
          drop.style.width = size + "px";
          drop.style.height = size + "px";
          drop.style.left = (e.clientX - size / 2 + (Math.random() * 30 - 15)) + "px";
          drop.style.top = (e.clientY - size / 2 + (Math.random() * 30 - 15)) + "px";
          document.body.appendChild(drop);
          setTimeout(function () {
            drop.style.transition = "opacity 2s ease";
            drop.style.opacity = "0.2";
          }, 1000);
        });
      }

      // 10. Kurian Jose-Style Contact & Transmission Engine
      const copyEmailBtn = document.getElementById("copyEmailBtn");
      const copyBtnLabel = document.getElementById("copyBtnLabel");
      if (copyEmailBtn) {
        copyEmailBtn.addEventListener("click", function () {
          navigator.clipboard.writeText(PORTFOLIO_CONFIG.email).then(function () {
            if (copyBtnLabel) copyBtnLabel.textContent = "Copied! ✓";
            playPenScratch();
            setTimeout(function () {
              if (copyBtnLabel) copyBtnLabel.textContent = "Copy";
            }, 2200);
          }).catch(function () {
            if (copyBtnLabel) copyBtnLabel.textContent = "Copied!";
          });
        });
      }

      const transForm = document.getElementById("transmissionForm");
      const transFeedback = document.getElementById("transFeedback");
      const transSubmitBtn = document.getElementById("transSubmitBtn");

      if (transForm) {
        transForm.addEventListener("submit", function (e) {
          e.preventDefault();
          const name = (document.getElementById("transName")?.value || "").trim();
          const email = (document.getElementById("transEmail")?.value || "").trim();
          const problem = (document.getElementById("transProblem")?.value || "").trim();

          if (!name || !problem) {
            if (transFeedback) transFeedback.textContent = "Please provide your name and describe the problem.";
            return;
          }

          playPaperRustle();
          if (transFeedback) transFeedback.textContent = "Transmitting dispatch to outbox...";
          if (transSubmitBtn) transSubmitBtn.disabled = true;

          setTimeout(function () {
            const subject = encodeURIComponent("Transmission from " + name + " (via Portfolio)");
            const body = encodeURIComponent(problem + "\n\n--\nFrom: " + name + (email ? " <" + email + ">" : ""));
            window.location.href = "mailto:" + PORTFOLIO_CONFIG.email + "?subject=" + subject + "&body=" + body;

            setTimeout(function () {
              if (transSubmitBtn) transSubmitBtn.disabled = false;
              if (transFeedback) transFeedback.textContent = "Transmission dispatched! Looking forward to replying.";
            }, 1500);
          }, 700);
        });
      }

      // 10b. Wanted Poster Easter Egg: Bounty Increase & Coin Sound
      const bountyRow = document.getElementById("wantedBountyRow");
      const bountyDisplay = document.getElementById("wantedPosterBounty");
      let currentBountyNum = 3000000000;
      if (bountyRow && bountyDisplay) {
        bountyRow.addEventListener("click", function (e) {
          e.stopPropagation();
          currentBountyNum += 100000000;
          bountyDisplay.textContent = currentBountyNum.toLocaleString();
          bountyRow.classList.add("bounty-boosted");
          playCoinAudio();

          // Spawn floating badge
          const badge = document.createElement("div");
          badge.className = "bounty-click-badge";
          badge.textContent = "+100M ฿";
          const rect = bountyRow.getBoundingClientRect();
          badge.style.left = (e.clientX || (rect.left + rect.width / 2)) + "px";
          badge.style.top = (e.clientY || rect.top) + "px";
          document.body.appendChild(badge);
          setTimeout(function () { badge.remove(); }, 1200);
        });
      }

      function playCoinAudio() {
        if (!soundEnabled) return;
        try {
          const ctx = getAudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(987.77, ctx.currentTime);
          osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.36);
        } catch (e) { }
      }
      window.playCoinAudio = playCoinAudio;

      // 10c. IRL & Personal Insights Popup Engine
      const boardPopupModal = document.getElementById("boardPopupModal");
      const boardPopupBackdrop = document.getElementById("boardPopupBackdrop");
      const irlRibbonBtn = document.getElementById("irlRibbonBtn");
      const contactIrlNoteBtn = document.getElementById("contactIrlNoteBtn");
      const closeBoardPopupBtn = document.getElementById("closeBoardPopupBtn");
      const pinboardGrid = document.getElementById("pinboardGrid");
      const previewThumbRow = document.getElementById("previewThumbRow");

      const openNewPinBtn = document.getElementById("openNewPinBtn");
      const pinModalOverlay = document.getElementById("pinModalOverlay");
      const closePinModalBtn = document.getElementById("closePinModalBtn");
      const tabTypeEvent = document.getElementById("tabTypeEvent");
      const tabTypeInsight = document.getElementById("tabTypeInsight");
      const eventPinForm = document.getElementById("eventPinForm");
      const insightPinForm = document.getElementById("insightPinForm");

      const countAll = document.getElementById("countAll");
      const countEvents = document.getElementById("countEvents");
      const countInsights = document.getElementById("countInsights");

      let currentBoardFilter = "all";
      let newPinImageData = "";

      const DEFAULT_IRL_PINS = [
        {
          id: "pin-default-1",
          type: "event",
          title: "Cluster Community | GU — Flagship Hackathon & Codefest",
          date: "Winter 2026",
          location: "Galgotias University (GU)",
          caption: "Organized and hosted an exhilarating 48-hour builder hackathon for Cluster Community. Hundreds of developers, non-stop shipping, caffeinated energy, and pure creative joy.",
          imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 360' width='100%' height='100%'><rect width='100%' height='100%' fill='%231e293b'/><circle cx='300' cy='180' r='90' fill='%23facc15' opacity='0.2'/><path d='M100 280 L200 120 L300 240 L400 90 L500 280' stroke='%2338bdf8' stroke-width='4' fill='none'/><circle cx='200' cy='120' r='8' fill='%23f43f5e'/><circle cx='400' cy='90' r='8' fill='%2310b981'/><text x='300' y='320' font-family='sans-serif' font-size='20' font-weight='bold' fill='%23f8fafc' text-anchor='middle'>CLUSTER COMMUNITY | GU</text></svg>"
        },
        {
          id: "pin-default-2",
          type: "insight",
          tag: "#SynapseCalyx #FounderMindset",
          date: "Autumn 2026",
          color: "yellow",
          text: "Building Synapse Calyx taught me: Motivation is a spark, but disciplined systems and small daily rituals are the engine. The best digital services are crafted by teams that treat client problems like their own."
        },
        {
          id: "pin-default-3",
          type: "event",
          title: "Ralph Co. Engineering Retrospective & Architecture Review",
          date: "Summer 2025",
          location: "Ralph Co. HQ",
          caption: "Reflecting on my time as Tech Lead at Ralph Co.—directing sprints, optimizing system bottlenecks, and building a culture where engineers take pride in zero-debt code.",
          imageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 360' width='100%' height='100%'><rect width='100%' height='100%' fill='%230f172a'/><path d='M50 200 Q 150 50 300 200 T 550 200' stroke='%23a855f7' stroke-width='6' fill='none'/><rect x='220' y='120' width='160' height='100' rx='12' fill='%23fef08a' stroke='%230f172a' stroke-width='3'/><text x='300' y='180' font-family='sans-serif' font-size='22' font-weight='bold' fill='%230f172a' text-anchor='middle'>RALPH CO. TECH LEAD</text></svg>"
        },
        {
          id: "pin-default-4",
          type: "insight",
          tag: "#DesignPhilosophy",
          date: "2026",
          color: "mint",
          text: "Every great architecture starts on a napkin or an ink notebook. If you can't explain a system in three boxes and an arrow, you don't understand it well enough yet."
        },
        {
          id: "pin-default-5",
          type: "insight",
          tag: "#OnePiece #Will",
          date: "2026",
          color: "coral",
          text: "“Inherited Will, the Swell of the Age, and the Dreams of its People.” As long as people pursue the answer to freedom, these things will never cease to be."
        }
      ];

      function getStoredPins() {
        try {
          const raw = localStorage.getItem("portfolio_user_pins");
          const userPins = raw ? JSON.parse(raw) : [];
          return [...userPins, ...DEFAULT_IRL_PINS];
        } catch (e) {
          return DEFAULT_IRL_PINS;
        }
      }

      function saveUserPins(userOnlyPins) {
        try {
          localStorage.setItem("portfolio_user_pins", JSON.stringify(userOnlyPins));
        } catch (e) { }
      }

      function openBoard() {
        if (boardPopupModal) {
          boardPopupModal.classList.add("open");
          renderBoardPins(currentBoardFilter);
          playPaperRustle();
        }
      }

      function closeBoard() {
        if (boardPopupModal) {
          boardPopupModal.classList.remove("open");
          playPaperRustle();
        }
      }

      if (irlRibbonBtn) irlRibbonBtn.addEventListener("click", openBoard);
      if (contactIrlNoteBtn) contactIrlNoteBtn.addEventListener("click", openBoard);
      if (closeBoardPopupBtn) closeBoardPopupBtn.addEventListener("click", closeBoard);
      if (boardPopupBackdrop) boardPopupBackdrop.addEventListener("click", closeBoard);

      window.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          if (pinModalOverlay && pinModalOverlay.style.display !== "none") {
            closePinModal();
          } else if (hofModalOverlay && hofModalOverlay.style.display !== "none") {
            closeHofModal();
          } else if (boardPopupModal && boardPopupModal.classList.contains("open")) {
            closeBoard();
          }
        }
      });

      // Filter Buttons
      document.querySelectorAll(".board-filter-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          document.querySelectorAll(".board-filter-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentBoardFilter = btn.dataset.filter || "all";
          renderBoardPins(currentBoardFilter);
          playPenScratch();
        });
      });

      function renderBoardPins(filter) {
        if (!pinboardGrid) return;
        const allPins = getStoredPins();

        // Update count badges
        const totalCount = allPins.length;
        const eventCount = allPins.filter(p => p.type === "event").length;
        const insightCount = allPins.filter(p => p.type === "insight").length;
        if (countAll) countAll.textContent = totalCount;
        if (countEvents) countEvents.textContent = eventCount;
        if (countInsights) countInsights.textContent = insightCount;
        updatePreviewThumbs(allPins);

        const filtered = filter === "all" ? allPins : allPins.filter(p => p.type === filter);
        pinboardGrid.innerHTML = "";

        filtered.forEach(function (pin) {
          const isCustom = !pin.id.startsWith("pin-default-");

          if (pin.type === "event") {
            const card = document.createElement("article");
            card.className = "pin-event-card";
            card.innerHTML = `
          <div class="pin-pushpin" aria-hidden="true"></div>
          ${pin.imageUrl ? `
            <div class="pin-photo-frame">
              <img src="${pin.imageUrl}" alt="${escapeHtml(pin.title)}" loading="lazy">
            </div>
          ` : ""}
          <div class="pin-event-meta">
            ${pin.date ? `<span class="pin-badge">${escapeHtml(pin.date)}</span>` : ""}
            ${pin.location ? `<span class="pin-badge location">${escapeHtml(pin.location)}</span>` : ""}
          </div>
          <h3 class="pin-title">${escapeHtml(pin.title)}</h3>
          ${pin.caption ? `<p class="pin-caption">${escapeHtml(pin.caption)}</p>` : ""}
          <div class="pin-card-footer">
            <span style="font-family:var(--mono);font-size:0.75rem;color:var(--ink-soft);">EVENT</span>
            ${isCustom ? `<button type="button" class="pin-delete-btn" data-pin-id="${pin.id}">✕ delete</button>` : ""}
          </div>
        `;
            pinboardGrid.appendChild(card);
          } else {
            const card = document.createElement("article");
            card.className = "pin-insight-card " + (pin.color || "yellow");
            card.innerHTML = `
          <div class="pin-tape-strip" aria-hidden="true"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span class="pin-insight-tag">${escapeHtml(pin.tag || "#Thought")}</span>
            <span style="font-family:var(--mono);font-size:0.75rem;opacity:0.8;">${escapeHtml(pin.date || "2026")}</span>
          </div>
          <p class="pin-insight-quote">${escapeHtml(pin.text)}</p>
          <div class="pin-card-footer">
            <span style="font-family:var(--mono);font-size:0.75rem;opacity:0.75;">IN MY OWN WORDS</span>
            ${isCustom ? `<button type="button" class="pin-delete-btn" data-pin-id="${pin.id}">✕ delete</button>` : ""}
          </div>
        `;
            pinboardGrid.appendChild(card);
          }
        });

        // Attach delete listeners
        pinboardGrid.querySelectorAll(".pin-delete-btn").forEach(function (btn) {
          btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const idToDelete = btn.dataset.pinId;
            deleteUserPin(idToDelete);
          });
        });
      }

      function deleteUserPin(pinId) {
        try {
          const raw = localStorage.getItem("portfolio_user_pins");
          if (!raw) return;
          let userPins = JSON.parse(raw);
          userPins = userPins.filter(p => p.id !== pinId);
          saveUserPins(userPins);
          renderBoardPins(currentBoardFilter);
          playPenScratch();
        } catch (e) { }
      }

      function escapeHtml(str) {
        if (!str) return "";
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }

      // Modal: Add Pin
      function openPinModal() {
        if (pinModalOverlay) {
          pinModalOverlay.style.display = "flex";
          newPinImageData = "";
          const previewZone = document.getElementById("pinPhotoPreviewZone");
          if (previewZone) previewZone.style.display = "none";
          playPaperRustle();
        }
      }

      function closePinModal() {
        if (pinModalOverlay) {
          pinModalOverlay.style.display = "none";
          playPaperRustle();
        }
      }

      if (openNewPinBtn) openNewPinBtn.addEventListener("click", openPinModal);
      if (closePinModalBtn) closePinModalBtn.addEventListener("click", closePinModal);

      // Tab switch between Event and Insight
      if (tabTypeEvent && tabTypeInsight && eventPinForm && insightPinForm) {
        tabTypeEvent.addEventListener("click", function () {
          tabTypeEvent.classList.add("active");
          tabTypeInsight.classList.remove("active");
          eventPinForm.style.display = "flex";
          insightPinForm.style.display = "none";
          playPenScratch();
        });
        tabTypeInsight.addEventListener("click", function () {
          tabTypeInsight.classList.add("active");
          tabTypeEvent.classList.remove("active");
          insightPinForm.style.display = "flex";
          eventPinForm.style.display = "none";
          playPenScratch();
        });
      }

      // Photo browse & preview
      const pinPhotoBrowseBtn = document.getElementById("pinPhotoBrowseBtn");
      const pinPhotoFileInput = document.getElementById("pinPhotoFileInput");
      const pinPhotoPreviewZone = document.getElementById("pinPhotoPreviewZone");
      const pinPhotoPreviewImg = document.getElementById("pinPhotoPreviewImg");
      const pinPhotoClearBtn = document.getElementById("pinPhotoClearBtn");
      const pinPhotoUrlInput = document.getElementById("pinPhotoUrlInput");

      if (pinPhotoBrowseBtn && pinPhotoFileInput) {
        pinPhotoBrowseBtn.addEventListener("click", function () {
          pinPhotoFileInput.click();
        });
      }
      if (pinPhotoFileInput) {
        pinPhotoFileInput.addEventListener("change", function (e) {
          const file = e.target.files && e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
              newPinImageData = evt.target.result;
              if (pinPhotoPreviewImg) {
                pinPhotoPreviewImg.src = newPinImageData;
                pinPhotoPreviewImg.style.display = "block";
              }
              if (pinPhotoPreviewZone) pinPhotoPreviewZone.style.display = "block";
            };
            reader.readAsDataURL(file);
          }
        });
      }
      if (pinPhotoClearBtn) {
        pinPhotoClearBtn.addEventListener("click", function () {
          newPinImageData = "";
          if (pinPhotoFileInput) pinPhotoFileInput.value = "";
          if (pinPhotoPreviewZone) pinPhotoPreviewZone.style.display = "none";
          if (pinPhotoPreviewImg) {
            pinPhotoPreviewImg.removeAttribute("src");
            pinPhotoPreviewImg.style.display = "none";
          }
        });
      }

      // Submit Event Pin
      if (eventPinForm) {
        eventPinForm.addEventListener("submit", function (e) {
          e.preventDefault();
          const title = (document.getElementById("pinEventTitle")?.value || "").trim();
          const date = (document.getElementById("pinEventDate")?.value || "").trim();
          const location = (document.getElementById("pinEventLocation")?.value || "").trim();
          const story = (document.getElementById("pinEventStory")?.value || "").trim();
          const urlImg = (pinPhotoUrlInput?.value || "").trim();
          const finalImg = newPinImageData || urlImg || "";

          if (!title) return;

          const newPin = {
            id: "user-pin-" + Date.now(),
            type: "event",
            title: title,
            date: date || "2026",
            location: location,
            caption: story,
            imageUrl: finalImg
          };

          try {
            const raw = localStorage.getItem("portfolio_user_pins");
            const userPins = raw ? JSON.parse(raw) : [];
            userPins.unshift(newPin);
            saveUserPins(userPins);
          } catch (err) { }

          eventPinForm.reset();
          newPinImageData = "";
          closePinModal();
          renderBoardPins(currentBoardFilter);
          playCoinAudio();
        });
      }

      // Submit Insight Pin
      if (insightPinForm) {
        insightPinForm.addEventListener("submit", function (e) {
          e.preventDefault();
          const text = (document.getElementById("pinInsightText")?.value || "").trim();
          const tag = (document.getElementById("pinInsightTag")?.value || "").trim();
          const checkedColor = document.querySelector('input[name="stickyColor"]:checked')?.value || "yellow";

          if (!text) return;

          const newPin = {
            id: "user-pin-" + Date.now(),
            type: "insight",
            text: text,
            tag: tag || "#PersonalThought",
            date: "2026",
            color: checkedColor
          };

          try {
            const raw = localStorage.getItem("portfolio_user_pins");
            const userPins = raw ? JSON.parse(raw) : [];
            userPins.unshift(newPin);
            saveUserPins(userPins);
          } catch (err) { }

          insightPinForm.reset();
          closePinModal();
          renderBoardPins(currentBoardFilter);
          playPaperRustle();
        });
      }

      // 10d. Update Hover Preview Thumbnails for IRL Ribbon Button
      function updatePreviewThumbs(pins) {
        if (!previewThumbRow) return;
        previewThumbRow.innerHTML = "";
        const eventPins = pins.filter(p => p.type === "event" && p.imageUrl).slice(0, 3);
        eventPins.forEach(function (ep) {
          const img = document.createElement("img");
          img.className = "preview-mini-thumb";
          img.src = ep.imageUrl;
          img.alt = ep.title || "Event";
          previewThumbRow.appendChild(img);
        });
      }

      // 10e. Hall of Fame / Achievements Engine
      const hofGrid = document.getElementById("hofGrid");
      const hofCountAll = document.getElementById("hofCountAll");
      const hofCountHackathon = document.getElementById("hofCountHackathon");
      const hofCountOpenSource = document.getElementById("hofCountOpenSource");
      const hofCountAward = document.getElementById("hofCountAward");
      const hofCountMilestone = document.getElementById("hofCountMilestone");

      const openAddHofBtn = document.getElementById("openAddHofBtn");
      const hofModalOverlay = document.getElementById("hofModalOverlay");
      const closeHofModalBtn = document.getElementById("closeHofModalBtn");
      const hofForm = document.getElementById("hofForm");

      let currentHofFilter = "all";

      function getStoredAchievements() {
        try {
          const raw = localStorage.getItem("portfolio_user_achievements");
          const userAchs = raw ? JSON.parse(raw) : [];
          return [...userAchs, ...(PORTFOLIO_CONFIG.achievements || [])];
        } catch (e) {
          return PORTFOLIO_CONFIG.achievements || [];
        }
      }

      function saveUserAchievements(userOnlyAchs) {
        try {
          localStorage.setItem("portfolio_user_achievements", JSON.stringify(userOnlyAchs));
        } catch (e) { }
      }

      function renderAchievements(filter) {
        if (!hofGrid) return;
        const all = getStoredAchievements();

        // Counts
        if (hofCountAll) hofCountAll.textContent = all.length;
        if (hofCountHackathon) hofCountHackathon.textContent = all.filter(a => a.category === "hackathon").length;
        if (hofCountOpenSource) hofCountOpenSource.textContent = all.filter(a => a.category === "opensource").length;
        if (hofCountAward) hofCountAward.textContent = all.filter(a => a.category === "award").length;
        if (hofCountMilestone) hofCountMilestone.textContent = all.filter(a => a.category === "milestone").length;

        const filtered = filter === "all" ? all : all.filter(a => a.category === filter);
        hofGrid.innerHTML = "";

        filtered.forEach(function (item) {
          const isCustom = !item.id.startsWith("ach-default-");
          const card = document.createElement("article");
          card.className = "hof-card";

          const tagsHtml = (item.tags || []).map(t => `<span class="hof-tag">${escapeHtml(t)}</span>`).join("");
          const linkHtml = item.link && item.link !== "#"
            ? `<a class="hof-link-btn" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">${escapeHtml(item.linkLabel || "Inspect ↗")}</a>`
            : `<span style="font-family:var(--mono);font-size:0.75rem;color:var(--ink-soft);opacity:0.8;">✦ VERIFIED HONOR</span>`;

          card.innerHTML = `
        <div class="hof-card-top">
          <div class="hof-icon-seal" aria-hidden="true">${item.icon || "★"}</div>
          <div class="hof-card-badges">
            <span class="hof-badge ${item.badgeColor || 'gold'}">${escapeHtml(item.badge || 'AWARD')}</span>
            <span style="font-family:var(--mono);font-size:0.75rem;color:var(--ink-soft);font-weight:700;">${escapeHtml(item.date || '2026')}</span>
          </div>
        </div>
        <h3 class="hof-card-title">${escapeHtml(item.title)}</h3>
        ${item.issuer ? `
          <div class="hof-issuer-row">
            <span>Issued by: ${escapeHtml(item.issuer)}</span>
          </div>
        ` : ""}
        <p class="hof-card-desc">${escapeHtml(item.description)}</p>
        ${tagsHtml ? `<div class="hof-tags-row">${tagsHtml}</div>` : ""}
        <div class="hof-card-footer">
          ${linkHtml}
          ${isCustom ? `<button type="button" class="hof-delete-btn" data-hof-id="${item.id}">✕ delete</button>` : ""}
        </div>
      `;
          hofGrid.appendChild(card);
        });

        // Delete handlers
        hofGrid.querySelectorAll(".hof-delete-btn").forEach(function (btn) {
          btn.addEventListener("click", function (e) {
            e.stopPropagation();
            const idToDelete = btn.dataset.hofId;
            deleteUserAchievement(idToDelete);
          });
        });
      }

      function deleteUserAchievement(achId) {
        try {
          const raw = localStorage.getItem("portfolio_user_achievements");
          if (!raw) return;
          let userAchs = JSON.parse(raw);
          userAchs = userAchs.filter(a => a.id !== achId);
          saveUserAchievements(userAchs);
          renderAchievements(currentHofFilter);
          playPenScratch();
        } catch (e) { }
      }

      // Hall of Fame Filters
      document.querySelectorAll(".hof-filter-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          document.querySelectorAll(".hof-filter-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentHofFilter = btn.dataset.hofFilter || "all";
          renderAchievements(currentHofFilter);
          playPenScratch();
        });
      });

      // Modal: Add Achievement
      function openHofModal() {
        if (hofModalOverlay) {
          hofModalOverlay.style.display = "flex";
          playPaperRustle();
        }
      }

      function closeHofModal() {
        if (hofModalOverlay) {
          hofModalOverlay.style.display = "none";
          playPaperRustle();
        }
      }

      if (openAddHofBtn) openAddHofBtn.addEventListener("click", openHofModal);
      if (closeHofModalBtn) closeHofModalBtn.addEventListener("click", closeHofModal);

      if (hofForm) {
        hofForm.addEventListener("submit", function (e) {
          e.preventDefault();
          const title = (document.getElementById("hofTitle")?.value || "").trim();
          const category = document.getElementById("hofCategory")?.value || "hackathon";
          const badge = (document.getElementById("hofBadge")?.value || "").trim();
          const issuer = (document.getElementById("hofIssuer")?.value || "").trim();
          const date = (document.getElementById("hofDate")?.value || "").trim();
          const desc = (document.getElementById("hofDesc")?.value || "").trim();
          const tagsRaw = (document.getElementById("hofTags")?.value || "").trim();
          const link = (document.getElementById("hofLink")?.value || "").trim();

          if (!title || !desc) return;

          const badgeColorMap = {
            hackathon: "gold",
            opensource: "blue",
            award: "purple",
            milestone: "red"
          };
          const iconMap = {
            hackathon: "★",
            opensource: "★",
            award: "★",
            milestone: "★"
          };

          const newAch = {
            id: "user-ach-" + Date.now(),
            category: category,
            icon: iconMap[category] || "★",
            badge: badge || "HONOR",
            badgeColor: badgeColorMap[category] || "gold",
            title: title,
            issuer: issuer,
            date: date || "2026",
            description: desc,
            tags: tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [],
            link: link || "#",
            linkLabel: link ? "Inspect Proof ↗" : ""
          };

          try {
            const raw = localStorage.getItem("portfolio_user_achievements");
            const userAchs = raw ? JSON.parse(raw) : [];
            userAchs.unshift(newAch);
            saveUserAchievements(userAchs);
          } catch (err) { }

          hofForm.reset();
          closeHofModal();
          renderAchievements(currentHofFilter);
          playCoinAudio();
        });
      }

      // Initial call to render Hall of Fame and update preview thumbs
      renderAchievements("all");
      updatePreviewThumbs(getStoredPins());

      // 11. Back to Top Button & Scroll Spy with rAF Debouncing
      const backToTop = document.getElementById("backToTop");
      if (backToTop) {
        backToTop.addEventListener("click", function () {
          window.scrollTo({ top: 0, behavior: "smooth" });
          playPaperRustle();
        });
      }

      // 12. Active Nav Link Scroll Spy
      const navSections = [
        { id: "top", el: document.getElementById("top") },
        { id: "work", el: document.getElementById("work") },
        { id: "journey", el: document.getElementById("journey") },
        { id: "skills", el: document.getElementById("skills") },
        { id: "hall-of-fame", el: document.getElementById("hall-of-fame") },
        { id: "contact", el: document.getElementById("contact") }
      ];
      const dockNavLinks = document.querySelectorAll(".nav-links-dock .nav-link");

      function updateActiveNav() {
        const scrollPos = window.scrollY + 180;
        let currentId = "top";

        for (let i = 0; i < navSections.length; i++) {
          const item = navSections[i];
          if (item.el && item.el.offsetTop <= scrollPos) {
            currentId = item.id;
          }
        }

        dockNavLinks.forEach(function (link) {
          if (link.dataset.section === currentId) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }

      let navScrollTicking = false;
      function handleUnifiedScroll() {
        if (!navScrollTicking) {
          navScrollTicking = true;
          requestAnimationFrame(function () {
            navScrollTicking = false;
            if (backToTop) {
              if (window.scrollY > 400) {
                backToTop.classList.add("visible");
              } else {
                backToTop.classList.remove("visible");
              }
            }
            updateActiveNav();
          });
        }
      }

      window.addEventListener("scroll", handleUnifiedScroll, { passive: true });
      updateActiveNav();


      // 14. Treasure Chest Secret Stash Easter Egg
      const treasureChestBtn = document.getElementById("treasureChestBtn");
      const treasureToast = document.getElementById("treasurePopupToast");
      const marineStampToggle = document.getElementById("marineStampToggle");

      if (treasureChestBtn) {
        treasureChestBtn.addEventListener("click", function (e) {
          currentBountyNum += 500000000;
          if (bountyDisplay) bountyDisplay.textContent = currentBountyNum.toLocaleString();
          if (bountyRow) bountyRow.classList.add("bounty-boosted");
          playCoinAudio();

          if (treasureToast) {
            treasureToast.classList.add("open");
            setTimeout(function () {
              treasureToast.classList.remove("open");
            }, 3600);
          }
        });
      }

      if (marineStampToggle) {
        marineStampToggle.addEventListener("click", function () {
          playPaperRustle();
          marineStampToggle.style.transform = "scale(1.25) rotate(15deg)";
          setTimeout(function () {
            marineStampToggle.style.transform = "";
          }, 300);
        });
      }

      // 15. Tactile Ink Splatter Ripple on Paper Click
      document.addEventListener("click", function (e) {
        // Only trigger if clicking on empty main paper background, not buttons or inputs
        if (e.target.closest("button, a, input, textarea, select, .card, .wanted-poster-frame")) return;
        const splatter = document.createElement("div");
        splatter.className = "ink-splatter-particle";
        splatter.style.left = (e.clientX - 11) + "px";
        splatter.style.top = (e.clientY - 11) + "px";
        document.body.appendChild(splatter);
        setTimeout(function () { splatter.remove(); }, 600);
        if (soundEnabled && Math.random() > 0.6) playPenScratch();
      });


      // 17. Tony Tony Chopper Interactive Gags & Sounds
      function playChopperChime() {
        if (!soundEnabled) return;
        try {
          const ctx = getAudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          // Happy high-pitched melodic chirp: F5 -> A5 -> C6 -> E6
          osc.frequency.setValueAtTime(698.46, ctx.currentTime);
          osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.07);
          osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.14);
          osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.21);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.39);
        } catch (e) { }
      }

      const chopperPeeking = document.getElementById("chopperPeeking");
      const chopperDoctor = document.getElementById("chopperDoctor");
      const chopperCottonCandy = document.getElementById("chopperCottonCandy");
      const chopperFooter = document.getElementById("chopperFooter");

      [chopperPeeking, chopperDoctor, chopperCottonCandy, chopperFooter].forEach(function (el) {
        if (!el) return;
        el.addEventListener("click", function (e) {
          e.stopPropagation();
          playChopperChime();
          el.classList.add("dancing");
          const bubble = el.querySelector(".chopper-bubble");
          if (bubble) bubble.classList.add("show");

          setTimeout(function () {
            el.classList.remove("dancing");
            if (bubble) bubble.classList.remove("show");
          }, 1800);
        });
      });

      // 18. Scroll-Driven Grand Line Journey Stepper Controller
      function initScrollDrivenJourney() {
        const journeySection = document.getElementById("journey");
        if (!journeySection) return;

        const steps = Array.from(journeySection.querySelectorAll(".voyage-card-step"));
        const cards = Array.from(journeySection.querySelectorAll(".voyage-milestone-card"));
        const waypoints = Array.from(journeySection.querySelectorAll(".voyage-waypoint"));
        const trackFill = document.getElementById("voyageTrackFill");
        const shipAvatar = document.getElementById("voyageShipAvatar");
        const counterPill = document.getElementById("voyageRouteCounter");
        const celebrationBanner = document.getElementById("voyageCelebrationBanner");

        if (!steps.length || !cards.length) return;

        const total = steps.length;
        let activeStep = 1;
        let lockedWaypoint = null;
        let waypointLockTimer = null;
        let lastWaypointTargetY = null;

        function clearWaypointLock() {
          if (waypointLockTimer) {
            clearTimeout(waypointLockTimer);
            waypointLockTimer = null;
          }
          lockedWaypoint = null;
          lastWaypointTargetY = null;
        }

        function updateJourneyState(newStep, userInitiated = false) {
          if (newStep < 1) newStep = 1;
          if (newStep > total) newStep = total;

          const changed = newStep !== activeStep;
          activeStep = newStep;

          // 1. Update Card Classes
          cards.forEach((card, idx) => {
            const stepNum = idx + 1;
            if (stepNum <= activeStep) {
              card.classList.add("is-stacked");
              card.classList.add("is-revealed");
              card.classList.remove("is-hidden");
            } else {
              card.classList.remove("is-stacked");
              card.classList.remove("is-revealed");
            }
            if (stepNum === activeStep) {
              card.classList.add("is-active");
            } else {
              card.classList.remove("is-active");
            }
          });

          // 2. Update Progress Fill & Ship Avatar
          const pct = total > 1 ? ((activeStep - 1) / (total - 1)) * 100 : 0;
          if (trackFill) trackFill.style.width = pct + "%";
          if (shipAvatar) {
            shipAvatar.style.left = pct + "%";
            if (changed) {
              shipAvatar.classList.add("sailing");
              setTimeout(() => shipAvatar.classList.remove("sailing"), 500);
            }
          }

          // 3. Update Waypoints
          waypoints.forEach((wp, idx) => {
            const wpChapter = idx + 1;
            if (wpChapter <= activeStep) {
              wp.classList.add("active");
              wp.classList.remove("locked");
            } else {
              wp.classList.remove("active");
              wp.classList.add("locked");
            }
          });

          // 4. Update Counter Pill
          if (counterPill) {
            counterPill.innerHTML = `<span class="count-pill">Chapter ${activeStep} of ${total} Unfurled</span>`;
          }

          // 5. Celebration Fanfare Banner
          if (celebrationBanner) {
            if (activeStep === total) {
              celebrationBanner.style.display = "flex";
              celebrationBanner.classList.add("is-visible");
              celebrationBanner.classList.remove("is-hidden");
            } else {
              celebrationBanner.style.display = "none";
              celebrationBanner.classList.remove("is-visible");
              celebrationBanner.classList.add("is-hidden");
            }
          }

          // 6. Throttled Audio Cues
          if (changed && soundEnabled) {
            const now = Date.now();
            if (now - (window.lastPenAudioTime || 0) >= (window.AUDIO_COOLDOWN || 220)) {
              window.lastPenAudioTime = now;
              if (activeStep === total && typeof window.playCoinAudio === "function") {
                window.playCoinAudio();
              } else if (typeof window.playPenScratch === "function") {
                window.playPenScratch();
              }
            }
          }
        }

        function getActiveStepFromScroll() {
          const scrollY = window.scrollY;
          if (scrollY < 200) return 1;

          const rect = journeySection.getBoundingClientRect();
          const jDocTop = Math.round(rect.top + scrollY);
          const relY = scrollY - jDocTop;

          const isAndroid = document.documentElement.classList.contains("is-android");
          const isMobile = window.innerWidth <= 680;
          const stepH = isAndroid ? 380 : (isMobile ? 460 : 560);

          if (relY < stepH) return 1;
          if (relY < stepH * 2) return 2;
          if (relY < stepH * 3) return 3;
          return 4;
        }

        // Calculate step from scroll position with rAF debouncing
        function onScrollJourney() {
          if (window.scrollY < 200) {
            clearWaypointLock();
          }

          if (lockedWaypoint !== null) {
            if (typeof lastWaypointTargetY === "number" && Math.abs(window.scrollY - lastWaypointTargetY) > 40) {
              clearWaypointLock();
            } else {
              return;
            }
          }

          const newStep = getActiveStepFromScroll();
          updateJourneyState(newStep);
        }

        let journeyScrollTicking = false;
        function scheduleJourneyScroll() {
          if (!journeyScrollTicking) {
            journeyScrollTicking = true;
            requestAnimationFrame(function () {
              journeyScrollTicking = false;
              onScrollJourney();
            });
          }
        }

        window.addEventListener("scroll", scheduleJourneyScroll, { passive: true });
        window.addEventListener("resize", scheduleJourneyScroll, { passive: true });
        window.addEventListener("wheel", () => { clearWaypointLock(); scheduleJourneyScroll(); }, { passive: true });
        window.addEventListener("touchmove", () => { clearWaypointLock(); scheduleJourneyScroll(); }, { passive: true });
        window.addEventListener("keydown", () => { clearWaypointLock(); scheduleJourneyScroll(); }, { passive: true });
        window.addEventListener("pointerdown", () => { clearWaypointLock(); }, { passive: true });
        if ("onscrollend" in window) {
          window.addEventListener("scrollend", clearWaypointLock, { passive: true });
        }

        // Waypoint Click-to-Scroll Support
        waypoints.forEach((wp) => {
          wp.addEventListener("click", function (e) {
            e.preventDefault();
            const targetChapter = parseInt(wp.getAttribute("data-chapter"), 10);
            if (isNaN(targetChapter)) return;

            clearWaypointLock();
            lockedWaypoint = targetChapter;
            updateJourneyState(targetChapter, true);

            const stepEl = document.getElementById("step-" + targetChapter) || steps[targetChapter - 1];
            const cardEl = document.getElementById("milestone-" + targetChapter) || cards[targetChapter - 1];

            if (stepEl && cardEl) {
              const stepDocTop = stepEl.getBoundingClientRect().top + window.scrollY;
              const isMobile = window.innerWidth <= 680;
              const dockTop = parseFloat(window.getComputedStyle(cardEl).top) || (isMobile ? (190 + (targetChapter - 1) * 8) : (220 + (targetChapter - 1) * 12));
              const targetY = Math.round(stepDocTop - dockTop);

              lastWaypointTargetY = targetY;
              waypointLockTimer = setTimeout(clearWaypointLock, 450);

              window.scrollTo({
                top: Math.max(0, targetY),
                behavior: "instant"
              });
            }
          });
        });

        // Initial sync
        onScrollJourney();
      }

      initScrollDrivenJourney();

      // 19. Audio cue on link hovers
      document.querySelectorAll("a, button, .card").forEach(function (interactiveEl) {
        interactiveEl.addEventListener("mouseenter", function () {
          if (soundEnabled && Math.random() > 0.4) playPenScratch();
        });
      });

    })();