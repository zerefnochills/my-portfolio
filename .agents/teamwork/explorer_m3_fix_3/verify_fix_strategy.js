const { TestHarness } = require('../../../tests/e2e/harness');

async function testFixStrategy() {
  const harness = new TestHarness();
  try {
    await harness.startServer();
    await harness.launchChrome();
    await harness.navigate('/index.html');
    await harness.setViewport(1440, 900);

    const jTop = await harness.evaluate(() => {
      const r = document.getElementById('journey').getBoundingClientRect();
      return Math.round(r.top + window.scrollY);
    });
    console.log('[Test] Journey Top:', jTop);

    // Re-bind the Journey controller inside the page with our proposed fix strategy:
    const setupResult = await harness.evaluate(() => {
      const journeySection = document.getElementById("journey");
      if (!journeySection) return false;

      const steps = Array.from(journeySection.querySelectorAll(".voyage-card-step"));
      const cards = Array.from(journeySection.querySelectorAll(".voyage-milestone-card"));
      const waypoints = Array.from(journeySection.querySelectorAll(".voyage-waypoint"));
      const trackFill = document.getElementById("voyageTrackFill");
      const shipAvatar = document.getElementById("voyageShipAvatar");
      const counterPill = document.getElementById("voyageRouteCounter");
      const celebrationBanner = document.getElementById("voyageCelebrationBanner");

      const total = steps.length;
      let activeStep = 1;
      let lockedWaypoint = null;
      let unlockTimer = null;
      let lastWaypointTargetY = null;

      function clearWaypointLock() {
        if (unlockTimer) {
          clearTimeout(unlockTimer);
          unlockTimer = null;
        }
        lockedWaypoint = null;
        lastWaypointTargetY = null;
      }

      function updateState(newStep, userInitiated = false) {
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

        // 5. Celebration Banner
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
      }

      function getStepFromScroll() {
        const scrollY = window.scrollY;
        if (scrollY < 200) return 1;

        const rect = journeySection.getBoundingClientRect();
        const jDocTop = Math.round(rect.top + scrollY);
        const relY = scrollY - jDocTop;

        // Note: Explorer 1/2 are calibrating the exact thresholds/geometry.
        // For testing the unlock controller here:
        if (relY < 150) return 1;
        if (relY < 325) return 2;
        if (relY < 475) return 3;
        return 4;
      }

      function onScroll() {
        if (window.scrollY < 200) {
          clearWaypointLock();
        }

        if (lockedWaypoint !== null) {
          // Robust unlock detection:
          // If scroll position departs significantly from the waypoint landing target (> 40px),
          // the user has manually scrolled via scrollbar thumb drag, track click, or script!
          if (typeof lastWaypointTargetY === "number" && Math.abs(window.scrollY - lastWaypointTargetY) > 40) {
            clearWaypointLock();
          } else {
            return;
          }
        }

        const newStep = getStepFromScroll();
        updateState(newStep);
      }

      // Clean event binding
      window.__proposedOnScroll = onScroll;
      window.__proposedClearLock = clearWaypointLock;

      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      window.addEventListener("wheel", () => { clearWaypointLock(); onScroll(); }, { passive: true });
      window.addEventListener("touchmove", () => { clearWaypointLock(); onScroll(); }, { passive: true });
      window.addEventListener("keydown", () => { clearWaypointLock(); onScroll(); }, { passive: true });

      if ("onscrollend" in window) {
        window.addEventListener("scrollend", clearWaypointLock, { passive: true });
      }

      // Re-bind waypoint clicks
      waypoints.forEach((wp) => {
        // Clone to remove old listeners
        const newWp = wp.cloneNode(true);
        wp.parentNode.replaceChild(newWp, wp);
        newWp.addEventListener("click", function (e) {
          e.preventDefault();
          const targetChapter = parseInt(newWp.getAttribute("data-chapter"), 10);
          if (isNaN(targetChapter)) return;

          clearWaypointLock();
          lockedWaypoint = targetChapter;
          updateState(targetChapter, true);

          const rect = journeySection.getBoundingClientRect();
          const jDocTop = Math.round(rect.top + window.scrollY);
          let targetY = 0;
          if (targetChapter === 1) targetY = jDocTop + 50;
          else if (targetChapter === 2) targetY = jDocTop + 220;
          else if (targetChapter === 3) targetY = jDocTop + 380;
          else if (targetChapter === 4) targetY = jDocTop + 550;

          lastWaypointTargetY = targetY;

          // Auto-unlock fallback timer
          unlockTimer = setTimeout(clearWaypointLock, 450);

          window.scrollTo({ top: Math.max(0, targetY), behavior: "instant" });
        });
      });

      return true;
    });

    console.log('[Setup] Installed proposed unlock controller:', setupResult);

    // TEST 1: Click Waypoint 4
    console.log('\n--- TEST 1: Click Waypoint 4 ---');
    await harness.click('.voyage-waypoint[data-chapter="4"]');
    await new Promise(r => setTimeout(r, 100));
    const wp4State = await harness.evaluate(() => ({
      scrollY: window.scrollY,
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      shipLeft: document.getElementById('voyageShipAvatar').style.left,
      card4Active: document.getElementById('milestone-4').classList.contains('is-active')
    }));
    console.log('State at Waypoint 4:', wp4State);

    // TEST 2: Native Scrollbar Thumb Drag to Chapter 1 (jTop + 50) WITHOUT dispatching wheel!
    console.log('\n--- TEST 2: Native Scrollbar Thumb Drag to Chapter 1 (NO wheel event) ---');
    await harness.scrollTo(jTop + 50);
    await new Promise(r => setTimeout(r, 100));
    const dragCh1State = await harness.evaluate(() => ({
      scrollY: window.scrollY,
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      shipLeft: document.getElementById('voyageShipAvatar').style.left,
      card1Active: document.getElementById('milestone-1').classList.contains('is-active'),
      card4Active: document.getElementById('milestone-4').classList.contains('is-active')
    }));
    console.log('State after Scrollbar Thumb Drag to Ch1:', dragCh1State);

    const passTest2 = dragCh1State.card1Active && !dragCh1State.card4Active && dragCh1State.counter.includes('Chapter 1');
    console.log('TEST 2 RESULT:', passTest2 ? 'PASS (Lock correctly released on scrollbar drag!)' : 'FAIL');

    // TEST 3: Timer-based Auto-Unlock
    console.log('\n--- TEST 3: Timer-based Auto-Unlock after Waypoint Click ---');
    await harness.click('.voyage-waypoint[data-chapter="3"]');
    await new Promise(r => setTimeout(r, 500)); // wait for 450ms timer to expire

    // Drag scrollbar to Chapter 2 (jTop + 220)
    await harness.scrollTo(jTop + 220);
    await new Promise(r => setTimeout(r, 100));
    const timerUnlockState = await harness.evaluate(() => ({
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      card2Active: document.getElementById('milestone-2').classList.contains('is-active')
    }));
    console.log('State after timer expiration & scroll to Ch2:', timerUnlockState);
    const passTest3 = timerUnlockState.card2Active && timerUnlockState.counter.includes('Chapter 2');
    console.log('TEST 3 RESULT:', passTest3 ? 'PASS (Timer successfully auto-unlocked controller!)' : 'FAIL');

    // TEST 4: Reverse scroll to Top (scrollY = 0)
    console.log('\n--- TEST 4: Reverse Scroll to Top ---');
    await harness.scrollTo(0);
    await new Promise(r => setTimeout(r, 100));
    const topState = await harness.evaluate(() => ({
      counter: document.getElementById('voyageRouteCounter').textContent.trim(),
      shipLeft: document.getElementById('voyageShipAvatar').style.left,
      card1Active: document.getElementById('milestone-1').classList.contains('is-active')
    }));
    console.log('State at Top:', topState);
    const passTest4 = topState.card1Active && topState.counter.includes('Chapter 1');
    console.log('TEST 4 RESULT:', passTest4 ? 'PASS' : 'FAIL');

  } catch (e) {
    console.error('Error during test:', e);
  } finally {
    await harness.close();
  }
}

testFixStrategy();
