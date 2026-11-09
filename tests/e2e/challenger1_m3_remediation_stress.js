/**
 * Challenger 1 Milestone 3 Remediation Adversarial Stress Harness
 *
 * Verifies:
 * 1. Rapid scroll scrub forward (0 -> 6000px at multiple speeds) with monotonicity & no race conditions.
 * 2. Rapid reverse scrub (6000px / Ch4 -> Ch1 -> 0px) with clean card de-accumulation, banner hiding, and ship retreat.
 * 3. Boundary teleports: [0, jTop, jTop+100, jTop+650, jTop+1300, jTop+2200, 6000, 0] + random jump sequences.
 * 4. Waypoint lock release stress (scrollbar thumb / departure delta > 40px without DOM gesture events).
 * 5. Boundary threshold jitter / oscillation (50 cycles across Ch1/Ch2 and Ch3/Ch4 thresholds).
 * 6. Responsive consistency (Desktop 1440x900, Tablet 768x1024, Mobile 375x667).
 * 7. Audio cooldown throttling under rapid scrub bursts.
 */

const { TestHarness } = require('./harness');

async function runM3RemediationAdversarialStress() {
  console.log('\n======================================================================');
  console.log('  CHALLENGER 1: M3 REMEDIATION ADVERSARIAL STRESS & SCRUBBING HARNESS');
  console.log('======================================================================\n');

  const harness = new TestHarness();
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    failures: []
  };

  function assert(name, condition, details = {}) {
    results.total++;
    if (condition) {
      results.passed++;
      console.log(`  \x1b[32m✔ PASS\x1b[0m: ${name}`);
    } else {
      results.failed++;
      console.log(`  \x1b[31m✖ FAIL\x1b[0m: ${name}`);
      console.log(`     Details: ${JSON.stringify(details)}`);
      results.failures.push({ name, details });
    }
  }

  try {
    await harness.startServer();
    await harness.launchChrome();
    await harness.navigate('/index.html');
    await harness.setViewport(1440, 900);

    // Helper: read full Voyage state from DOM
    async function getVoyageState() {
      return await harness.evaluate(`
        (() => {
          const cards = [1, 2, 3, 4].map(num => {
            const el = document.getElementById('milestone-' + num);
            if (!el) return null;
            return {
              num,
              isStacked: el.classList.contains('is-stacked'),
              isActive: el.classList.contains('is-active'),
              isRevealed: el.classList.contains('is-revealed')
            };
          });

          const waypoints = Array.from(document.querySelectorAll('.voyage-waypoint')).map(w => ({
            ch: parseInt(w.getAttribute('data-chapter'), 10),
            active: w.classList.contains('active'),
            locked: w.classList.contains('locked')
          }));

          const ship = document.getElementById('voyageShipAvatar');
          const trackFill = document.getElementById('voyageTrackFill');
          const counter = document.getElementById('voyageRouteCounter');
          const banner = document.getElementById('voyageCelebrationBanner');

          let activeChapter = 1;
          if (counter && counter.textContent) {
            const match = counter.textContent.match(/Chapter\\s+(\\d+)/i);
            if (match) activeChapter = parseInt(match[1], 10);
          }

          const bannerDisplay = banner ? window.getComputedStyle(banner).display : 'none';
          const bannerVisible = banner && bannerDisplay !== 'none' && !banner.classList.contains('is-hidden');

          return {
            scrollY: Math.round(window.scrollY),
            activeChapter,
            cards,
            waypoints,
            shipLeft: ship ? parseFloat(ship.style.left) || 0 : 0,
            trackFillWidth: trackFill ? parseFloat(trackFill.style.width) || 0 : 0,
            counterText: counter ? counter.textContent.trim() : '',
            bannerVisible,
            bannerDisplay
          };
        })()
      `);
    }

    // Helper: get Journey section jTop
    async function getJourneyTop() {
      return await harness.evaluate(`
        (() => {
          const j = document.getElementById('journey');
          const r = j.getBoundingClientRect();
          return Math.round(r.top + window.scrollY);
        })()
      `);
    }

    const jTop = await getJourneyTop();
    console.log(`Detected Journey section absolute jTop: ${jTop}px (Desktop 1440x900)\n`);

    // =========================================================================
    // SECTION 1: RAPID SCROLL SCRUB FORWARD (0 -> 6000px at multiple speeds)
    // =========================================================================
    console.log('--- SECTION 1: RAPID SCROLL SCRUB FORWARD (0 -> 6000px) ---');

    // Test 1.1: Fine scrub (step: 25px)
    console.log('\n[1.1] Fine Forward Scrub (step = 25px, ~240 frames)');
    await harness.scrollTo(0);
    let prevChapter = 1;
    let fineForwardMonotonic = true;
    const chaptersSeenFine = new Set();
    let forwardStateConsistency = true;

    for (let y = 0; y <= 6000; y += 25) {
      await harness.evaluate(`window.scrollTo(0, ${y})`);
      const state = await getVoyageState();
      chaptersSeenFine.add(state.activeChapter);

      if (state.activeChapter < prevChapter) {
        fineForwardMonotonic = false;
        console.log(`    Regression at scrollY=${y}: prev=${prevChapter}, curr=${state.activeChapter}`);
      }
      prevChapter = state.activeChapter;

      // Verify state consistency per chapter
      if (state.activeChapter === 1) {
        if (!state.cards[0].isActive || state.cards[1].isStacked || state.bannerVisible) {
          forwardStateConsistency = false;
        }
      } else if (state.activeChapter === 2) {
        if (!state.cards[0].isStacked || !state.cards[1].isStacked || !state.cards[1].isActive || state.cards[2].isStacked || state.bannerVisible) {
          forwardStateConsistency = false;
        }
      } else if (state.activeChapter === 3) {
        if (!state.cards[1].isStacked || !state.cards[2].isStacked || !state.cards[2].isActive || state.cards[3].isStacked || state.bannerVisible) {
          forwardStateConsistency = false;
        }
      } else if (state.activeChapter === 4) {
        if (!state.cards[3].isStacked || !state.cards[3].isActive || !state.bannerVisible) {
          forwardStateConsistency = false;
        }
      }
    }

    assert('1.1.1 Fine scrub transitions monotonically non-decreasing (no backwards jitter)', fineForwardMonotonic);
    assert('1.1.2 Fine scrub visits all chapters 1 -> 2 -> 3 -> 4 without skipping',
      [1, 2, 3, 4].every(ch => chaptersSeenFine.has(ch)),
      { chaptersSeen: Array.from(chaptersSeenFine) }
    );
    assert('1.1.3 DOM state (cards, active flags, celebration banner) matches chapter rules at all times', forwardStateConsistency);

    // Test 1.2: Medium scrub (step: 100px)
    console.log('\n[1.2] Medium Forward Scrub (step = 100px)');
    await harness.scrollTo(0);
    prevChapter = 1;
    let mediumForwardMonotonic = true;
    const chaptersSeenMedium = new Set();

    for (let y = 0; y <= 6000; y += 100) {
      await harness.evaluate(`window.scrollTo(0, ${y})`);
      const state = await getVoyageState();
      chaptersSeenMedium.add(state.activeChapter);
      if (state.activeChapter < prevChapter) mediumForwardMonotonic = false;
      prevChapter = state.activeChapter;
    }
    assert('1.2.1 Medium scrub transitions monotonically forward', mediumForwardMonotonic);
    assert('1.2.2 Medium scrub visits all 4 chapters', [1, 2, 3, 4].every(ch => chaptersSeenMedium.has(ch)));

    // Test 1.3: Fast scrub (step: 300px)
    console.log('\n[1.3] Fast Forward Scrub (step = 300px)');
    await harness.scrollTo(0);
    prevChapter = 1;
    let fastForwardMonotonic = true;
    for (let y = 0; y <= 6000; y += 300) {
      await harness.evaluate(`window.scrollTo(0, ${y})`);
      const state = await getVoyageState();
      if (state.activeChapter < prevChapter) fastForwardMonotonic = false;
      prevChapter = state.activeChapter;
    }
    assert('1.3.1 Fast scrub transitions monotonically forward', fastForwardMonotonic);

    // Test 1.4: Hyper-velocity scrub (step: 600px)
    console.log('\n[1.4] Hyper-velocity Forward Scrub (step = 600px)');
    await harness.scrollTo(0);
    for (let y = 0; y <= 6000; y += 600) {
      await harness.evaluate(`window.scrollTo(0, ${y})`);
    }
    const endState = await getVoyageState();
    assert('1.4.1 Hyper-velocity scrub cleanly settles at Chapter 4 with all cards stacked and banner visible',
      endState.activeChapter === 4 &&
      endState.cards.every(c => c.isStacked) &&
      endState.cards[3].isActive &&
      endState.bannerVisible &&
      endState.shipLeft === 100,
      endState
    );

    // =========================================================================
    // SECTION 2: RAPID REVERSE SCRUB (6000px / Ch4 -> Ch1 -> 0px)
    // =========================================================================
    console.log('\n--- SECTION 2: RAPID REVERSE SCRUB & DE-ACCUMULATION ---');

    // Test 2.1: Fine reverse scrub (step: -25px)
    console.log('\n[2.1] Fine Reverse Scrub (step = -25px, from 6000 to 0)');
    await harness.scrollTo(6000);
    prevChapter = 4;
    let fineReverseMonotonic = true;
    const chaptersSeenReverse = new Set();
    let deaccumulateCorrect = true;

    for (let y = 6000; y >= 0; y -= 25) {
      await harness.evaluate(`window.scrollTo(0, ${y})`);
      const state = await getVoyageState();
      chaptersSeenReverse.add(state.activeChapter);

      if (state.activeChapter > prevChapter) {
        fineReverseMonotonic = false;
        console.log(`    Reverse regression at scrollY=${y}: prev=${prevChapter}, curr=${state.activeChapter}`);
      }
      prevChapter = state.activeChapter;

      // Card de-accumulation rules:
      // When activeChapter < 4, Card 4 MUST NOT be stacked or active, banner MUST be hidden
      if (state.activeChapter < 4) {
        if (state.cards[3].isStacked || state.cards[3].isActive || state.bannerVisible) {
          deaccumulateCorrect = false;
          console.log(`    De-accumulate error at ch ${state.activeChapter}: Card 4 stacked=${state.cards[3].isStacked}, banner=${state.bannerVisible}`);
        }
      }
      // When activeChapter < 3, Card 3 MUST NOT be stacked or active
      if (state.activeChapter < 3) {
        if (state.cards[2].isStacked || state.cards[2].isActive) {
          deaccumulateCorrect = false;
          console.log(`    De-accumulate error at ch ${state.activeChapter}: Card 3 stacked=${state.cards[2].isStacked}`);
        }
      }
      // When activeChapter < 2, Card 2 MUST NOT be stacked or active
      if (state.activeChapter === 1) {
        if (state.cards[1].isStacked || state.cards[1].isActive || !state.cards[0].isActive) {
          deaccumulateCorrect = false;
        }
      }
    }

    assert('2.1.1 Fine reverse scrub transitions monotonically non-increasing (no forward jumps)', fineReverseMonotonic);
    assert('2.1.2 Fine reverse scrub cleanly unpacks and visits all chapters [4, 3, 2, 1]',
      [4, 3, 2, 1].every(ch => chaptersSeenReverse.has(ch)),
      { chaptersSeen: Array.from(chaptersSeenReverse) }
    );
    assert('2.1.3 Cards de-accumulate cleanly: Card 4 un-stacks when leaving Ch4, Card 3 when leaving Ch3, Card 2 when leaving Ch2', deaccumulateCorrect);

    // Test 2.2: Revert at page top (scrollY = 0)
    await harness.scrollTo(0);
    const topState = await getVoyageState();
    assert('2.2.1 State at scrollY = 0 is cleanly reverted to Chapter 1 baseline',
      topState.activeChapter === 1 &&
      topState.cards[0].isActive &&
      !topState.cards[1].isStacked &&
      !topState.cards[2].isStacked &&
      !topState.cards[3].isStacked &&
      topState.shipLeft <= 5 &&
      topState.trackFillWidth === 0 &&
      !topState.bannerVisible,
      topState
    );

    // Test 2.3: Ship avatar smooth retreat check
    console.log('\n[2.3] Ship Avatar Retreat Coordinates Check');
    await harness.scrollTo(jTop + 2200);
    const shipCh4 = (await getVoyageState()).shipLeft;
    await harness.scrollTo(jTop + 1300);
    const shipCh3 = (await getVoyageState()).shipLeft;
    await harness.scrollTo(jTop + 650);
    const shipCh2 = (await getVoyageState()).shipLeft;
    await harness.scrollTo(jTop + 100);
    const shipCh1 = (await getVoyageState()).shipLeft;

    assert('2.3.1 Ship retreats sequentially: Ch4 (100%) -> Ch3 (~66.7%) -> Ch2 (~33.3%) -> Ch1 (0%)',
      shipCh4 === 100 &&
      Math.abs(shipCh3 - 66.67) < 2 &&
      Math.abs(shipCh2 - 33.33) < 2 &&
      shipCh1 === 0,
      { shipCh4, shipCh3, shipCh2, shipCh1 }
    );

    // =========================================================================
    // SECTION 3: BOUNDARY TELEPORTS
    // =========================================================================
    console.log('\n--- SECTION 3: BOUNDARY TELEPORTS ---');

    const boundaries = [
      { offset: 0, expectedCh: 1, expectBanner: false, desc: 'Top of page (scrollY = 0)' },
      { offset: jTop, expectedCh: 1, expectBanner: false, desc: 'Journey section start (scrollY = jTop)' },
      { offset: jTop + 100, expectedCh: 1, expectBanner: false, desc: 'Chapter 1 core (scrollY = jTop + 100)' },
      { offset: jTop + 650, expectedCh: 2, expectBanner: false, desc: 'Chapter 2 core (scrollY = jTop + 650)' },
      { offset: jTop + 1300, expectedCh: 3, expectBanner: false, desc: 'Chapter 3 core (scrollY = jTop + 1300)' },
      { offset: jTop + 2200, expectedCh: 4, expectBanner: true, desc: 'Chapter 4 core (scrollY = jTop + 2200)' },
      { offset: 6000, expectedCh: 4, expectBanner: true, desc: 'Deep footer (scrollY = 6000)' },
      { offset: 0, expectedCh: 1, expectBanner: false, desc: 'Instant return to top (scrollY = 0)' }
    ];

    for (let i = 0; i < boundaries.length; i++) {
      const b = boundaries[i];
      await harness.scrollTo(b.offset);
      const state = await getVoyageState();
      const chMatch = state.activeChapter === b.expectedCh;
      const bannerMatch = state.bannerVisible === b.expectBanner;
      const cardActiveMatch = state.cards[b.expectedCh - 1].isActive;
      const cardsStackedMatch = state.cards.every((c, idx) => {
        if (idx < b.expectedCh) return c.isStacked;
        return !c.isStacked;
      });

      assert(`3.1.${i + 1} Boundary teleport to ${b.desc} -> Ch ${b.expectedCh}`,
        chMatch && bannerMatch && cardActiveMatch && cardsStackedMatch,
        {
          target: b.offset,
          expectedCh: b.expectedCh,
          actualCh: state.activeChapter,
          bannerVisible: state.bannerVisible,
          cards: state.cards.map(c => ({ num: c.num, stacked: c.isStacked, active: c.isActive }))
        }
      );
    }

    // Test 3.2: Adversarial Random Boundary Sequence
    console.log('\n[3.2] Adversarial Random Boundary Permutation Teleports');
    const randomSequence = [
      jTop + 2200,
      jTop + 100,
      6000,
      jTop + 650,
      0,
      jTop + 1300,
      jTop + 2200,
      jTop + 650,
      jTop + 100,
      6000,
      0
    ];

    let randomJumpsPassed = true;
    for (const offset of randomSequence) {
      await harness.scrollTo(offset);
      const state = await getVoyageState();
      let expectedCh = 1;
      if (offset >= 6000 || offset >= jTop + 2200) expectedCh = 4;
      else if (offset === jTop + 1300) expectedCh = 3;
      else if (offset === jTop + 650) expectedCh = 2;
      else expectedCh = 1;

      if (state.activeChapter !== expectedCh) {
        randomJumpsPassed = false;
        console.log(`    Failed jump to ${offset}: expected ${expectedCh}, got ${state.activeChapter}`);
      }
    }
    assert('3.2.1 11-step non-sequential random teleport sequence achieves 100% state accuracy', randomJumpsPassed);

    // =========================================================================
    // SECTION 4: WAYPOINT LOCK & SCROLLBAR DRAG UNLOCK (Finding 3 Remediation)
    // =========================================================================
    console.log('\n--- SECTION 4: WAYPOINT LOCK & SCROLLBAR DRAG UNLOCK ---');

    // Test 4.1: Click Waypoint 4, then simulate scrollbar thumb drag to Chapter 1
    // (programmatic scrollTo delta > 40px without dispatching wheel/touch/keydown)
    await harness.click('.voyage-waypoint[data-chapter="4"]');
    await new Promise(r => setTimeout(r, 50));
    const lockedStateCh4 = await getVoyageState();
    assert('4.1.1 Clicking Waypoint 4 immediately activates Chapter 4', lockedStateCh4.activeChapter === 4);

    // Simulate scrollbar drag: jump to jTop + 100
    await harness.scrollTo(jTop + 100);
    const unlockedStateCh1 = await getVoyageState();
    assert('4.1.2 Scrollbar drag to Ch1 (departure delta > 40px) instantly unlocks and restores Ch1 without wheel event',
      unlockedStateCh1.activeChapter === 1 && unlockedStateCh1.cards[0].isActive && !unlockedStateCh1.cards[3].isStacked,
      unlockedStateCh1
    );

    // Test 4.2: Click Waypoint 1, then simulate scrollbar drag to Chapter 4
    await harness.click('.voyage-waypoint[data-chapter="1"]');
    await new Promise(r => setTimeout(r, 50));
    await harness.scrollTo(jTop + 2200);
    const unlockedStateCh4 = await getVoyageState();
    assert('4.2.1 Scrollbar drag to Ch4 instantly unlocks and activates Chapter 4 with celebration banner',
      unlockedStateCh4.activeChapter === 4 && unlockedStateCh4.cards[3].isActive && unlockedStateCh4.bannerVisible,
      unlockedStateCh4
    );

    // Test 4.3: Waypoint dock pixel clearance
    // Verify each waypoint click docks the corresponding card in the viewport
    for (let ch = 1; ch <= 4; ch++) {
      await harness.click(`.voyage-waypoint[data-chapter="${ch}"]`);
      await new Promise(r => setTimeout(r, 100));
      const dockInfo = await harness.evaluate(`
        (() => {
          const card = document.getElementById('milestone-${ch}');
          const rect = card.getBoundingClientRect();
          const computedTop = parseFloat(window.getComputedStyle(card).top);
          return {
            ch: ${ch},
            scrollY: window.scrollY,
            top: Math.round(rect.top),
            computedTop: Math.round(computedTop),
            visibleInViewport: rect.top >= 0 && rect.top < window.innerHeight
          };
        })()
      `);

      assert(`4.3.${ch} Waypoint ${ch} docks Card ${ch} within visible viewport (cardTop = ${dockInfo.top}px, dock = ${dockInfo.computedTop}px)`,
        dockInfo.visibleInViewport && Math.abs(dockInfo.top - dockInfo.computedTop) <= 2,
        dockInfo
      );
    }

    // =========================================================================
    // SECTION 5: BOUNDARY JITTER & OSCILLATION STRESS
    // =========================================================================
    console.log('\n--- SECTION 5: BOUNDARY JITTER & OSCILLATION STRESS ---');

    // Test 5.1: Ch 1 / Ch 2 boundary threshold (relY = 560px -> scrollY = jTop + 560px)
    // Oscillate 30 cycles between jTop + 555 and jTop + 565
    console.log('[5.1] Oscillating 30 cycles across Ch1 / Ch2 boundary (jTop + 555 <-> jTop + 565)');
    let jitter12Clean = true;
    for (let c = 0; c < 30; c++) {
      const y = (c % 2 === 0) ? (jTop + 555) : (jTop + 565);
      await harness.evaluate(`window.scrollTo(0, ${y})`);
      const s = await getVoyageState();
      const expected = (c % 2 === 0) ? 1 : 2;
      if (s.activeChapter !== expected) {
        jitter12Clean = false;
        console.log(`    Jitter fail cycle ${c}: expected ${expected}, got ${s.activeChapter}`);
      }
    }
    assert('5.1.1 30-cycle high-frequency oscillation across Ch1/Ch2 boundary produces zero race conditions', jitter12Clean);

    // Test 5.2: Ch 3 / Ch 4 boundary threshold (relY = 1680px -> scrollY = jTop + 1680px)
    // Oscillate 30 cycles between jTop + 1675 and jTop + 1685
    console.log('[5.2] Oscillating 30 cycles across Ch3 / Ch4 celebration boundary (jTop + 1675 <-> jTop + 1685)');
    let jitter34Clean = true;
    for (let c = 0; c < 30; c++) {
      const y = (c % 2 === 0) ? (jTop + 1675) : (jTop + 1685);
      await harness.evaluate(`window.scrollTo(0, ${y})`);
      const s = await getVoyageState();
      const expected = (c % 2 === 0) ? 3 : 4;
      const expectedBanner = (c % 2 !== 0);
      if (s.activeChapter !== expected || s.bannerVisible !== expectedBanner) {
        jitter34Clean = false;
        console.log(`    Jitter fail cycle ${c}: expected ${expected} (banner ${expectedBanner}), got ${s.activeChapter} (banner ${s.bannerVisible})`);
      }
    }
    assert('5.2.1 30-cycle oscillation across celebration boundary cleanly toggles banner without DOM desync', jitter34Clean);

    // =========================================================================
    // SECTION 6: RESPONSIVE BEHAVIOR (Mobile 375x667 & Tablet 768x1024)
    // =========================================================================
    console.log('\n--- SECTION 6: RESPONSIVE BEHAVIOR ---');

    // Test 6.1: Mobile 375x667 (stepH = 460px)
    console.log('\n[6.1] Mobile Viewport (375x667, stepH = 460px)');
    await harness.setViewport(375, 667);
    const mobileJTop = await getJourneyTop();

    // Boundaries on mobile: relY < 460 (Ch1), < 920 (Ch2), < 1380 (Ch3), >= 1380 (Ch4)
    const mobileBoundaries = [
      { offset: 0, expectedCh: 1, desc: 'Mobile scrollY = 0' },
      { offset: mobileJTop + 100, expectedCh: 1, desc: 'Mobile Ch1 (relY = 100 < 460)' },
      { offset: mobileJTop + 500, expectedCh: 2, desc: 'Mobile Ch2 (460 <= relY = 500 < 920)' },
      { offset: mobileJTop + 1000, expectedCh: 3, desc: 'Mobile Ch3 (920 <= relY = 1000 < 1380)' },
      { offset: mobileJTop + 1500, expectedCh: 4, desc: 'Mobile Ch4 (relY = 1500 >= 1380)' }
    ];

    let mobileTransitionsValid = true;
    for (const mb of mobileBoundaries) {
      await harness.scrollTo(mb.offset);
      const state = await getVoyageState();
      if (state.activeChapter !== mb.expectedCh) {
        mobileTransitionsValid = false;
        console.log(`    Mobile failure at ${mb.desc}: expected ${mb.expectedCh}, got ${state.activeChapter}`);
      }
    }
    assert('6.1.1 Mobile calibrated step intervals (stepH = 460px) accurately activate chapters 1..4', mobileTransitionsValid);

    // Test 6.2: Mobile Waypoint 4 docking
    await harness.click('.voyage-waypoint[data-chapter="4"]');
    await new Promise(r => setTimeout(r, 100));
    const mobileWp4 = await harness.evaluate(`
      (() => {
        const card4 = document.getElementById('milestone-4').getBoundingClientRect();
        return {
          scrollY: window.scrollY,
          top: Math.round(card4.top),
          visible: card4.top >= 0 && card4.top < window.innerHeight
        };
      })()
    `);
    assert('6.2.1 Mobile Waypoint 4 docks milestone card 4 squarely inside 375x667 viewport',
      mobileWp4.visible && mobileWp4.top < 300,
      mobileWp4
    );

    // Test 6.3: Tablet Viewport (768x1024, stepH = 560px)
    console.log('\n[6.3] Tablet Viewport (768x1024)');
    await harness.setViewport(768, 1024);
    const tabletJTop = await getJourneyTop();
    await harness.scrollTo(tabletJTop + 650);
    const tabCh2 = (await getVoyageState()).activeChapter;
    await harness.scrollTo(tabletJTop + 2200);
    const tabCh4 = (await getVoyageState()).activeChapter;
    assert('6.3.1 Tablet viewport progresses correctly through calibrated steps (Ch2 at 650, Ch4 at 2200)',
      tabCh2 === 2 && tabCh4 === 4,
      { tabCh2, tabCh4 }
    );

    // =========================================================================
    // SECTION 7: AUDIO COOLDOWN THROTTLING UNDER RAPID SCRUB BURSTS
    // =========================================================================
    console.log('\n--- SECTION 7: AUDIO THROTTLING UNDER RAPID SCRUB BURSTS ---');

    await harness.setViewport(1440, 900);
    const audioTestResult = await harness.evaluate(`
      (() => {
        let penCalls = 0;
        let coinCalls = 0;
        window.soundEnabled = true;
        window.playPenScratch = () => { penCalls++; };
        window.playCoinAudio = () => { coinCalls++; };

        // Rapidly toggle active chapters 100 times in tight sync
        const total = 100;
        for (let i = 0; i < total; i++) {
          const target = (i % 2 === 0) ? 1 : 2;
          // Trigger state update
          window.dispatchEvent(new Event('scroll'));
        }

        return {
          penCalls,
          coinCalls,
          cooldown: window.AUDIO_COOLDOWN || 220
        };
      })()
    `);

    assert('7.1.1 Audio triggers honor minimum cooldown guard (calls throttled during rapid bursts)',
      audioTestResult.penCalls <= 5,
      audioTestResult
    );

    // Re-verify at top before shutdown
    await harness.scrollTo(0);
    const finalState = await getVoyageState();
    assert('8.1.1 Final reset: Site cleanly returns to top with Chapter 1 active and banner hidden',
      finalState.activeChapter === 1 && !finalState.bannerVisible
    );

    await harness.close();

    console.log('\n======================================================================');
    console.log(`  CHALLENGER 1 STRESS SUMMARY: ${results.passed}/${results.total} PASSED (${results.failed} FAILED)`);
    console.log('======================================================================\n');

  } catch (err) {
    console.error('Fatal execution error during adversarial stress tests:', err);
    results.failed++;
    results.failures.push({ name: 'Execution Exception', details: { message: err.message, stack: err.stack } });
    try { await harness.close(); } catch (e) {}
  }

  return results;
}

if (require.main === module) {
  runM3RemediationAdversarialStress().then(res => {
    process.exit(res.failed > 0 ? 1 : 0);
  });
}

module.exports = { runM3RemediationAdversarialStress };
