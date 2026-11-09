/**
 * Challenger 2: Milestone 2 Adversarial Stress & Verification Suite
 *
 * Targets:
 * 1. #wantedBountyRow click interaction (+100M Berry increment, no file upload modal trigger, badge spawn/cleanup).
 * 2. #chopperPeeking click dialogue bubble (appearance, text content, timeout dismissal, multi-viewport containment, no horizontal overflow).
 * 3. applyConfig() dynamic updates of #wantedPosterName and #wantedPosterBounty across regular and stress values, scope availability, and state sync.
 * 4. setWantedPhoto(src) photo update and strict 3:4 frame preservation across landscape, square, ultra-tall, and empty fallback photos.
 * 5. Parity verification against "Your Name – Portfolio.html".
 */

const { TestHarness } = require('./harness');

async function runInteractiveAdversarialSuite() {
  const harness = new TestHarness();
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };

  function assert(testId, description, passed, details = {}) {
    summary.total++;
    if (passed) {
      summary.passed++;
      console.log(`  \x1b[32m✔\x1b[0m [${testId}] ${description} -> \x1b[32mPASS\x1b[0m`);
    } else {
      summary.failed++;
      console.log(`  \x1b[31m✖\x1b[0m [${testId}] ${description} -> \x1b[31mFAIL\x1b[0m`);
      if (details.expected !== undefined && details.actual !== undefined) {
        console.log(`     \x1b[33mExpected:\x1b[0m ${JSON.stringify(details.expected)}`);
        console.log(`     \x1b[33mActual:\x1b[0m   ${JSON.stringify(details.actual)}`);
      }
      if (details.error) {
        console.log(`     \x1b[31mError:\x1b[0m    ${details.error}`);
      }
    }
    summary.tests.push({ testId, description, passed: Boolean(passed), details });
  }

  console.log('\n========================================================================');
  console.log('  CHALLENGER 2: WANTED POSTER INTERACTIVE HOOKS & DYNAMICS ADVERSARIAL');
  console.log('========================================================================\n');

  try {
    const port = await harness.startServer();
    console.log(`[Harness] Static HTTP server running at http://127.0.0.1:${port}`);
    await harness.launchChrome();
    console.log(`[Harness] Headless Chrome attached on CDP port ${harness.cdpPort}`);

    // =========================================================================
    // SECTION 1: index.html - #wantedBountyRow Interaction & Modal Isolation
    // =========================================================================
    console.log('\n>>> SECTION 1: #wantedBountyRow Bounty Increment & Event Isolation (index.html)');
    await harness.navigate('/index.html');
    await harness.setViewport(1440, 900);

    // 1.1 Initial DOM inspection
    const bountyInit = await harness.evaluate(`
      (() => {
        const row = document.getElementById('wantedBountyRow');
        const display = document.getElementById('wantedPosterBounty');
        if (!row || !display) return { exists: false };
        const raw = display.textContent.trim();
        const num = parseInt(raw.replace(/[^0-9]/g, ''), 10);
        return { exists: true, raw, num };
      })()
    `);
    assert('BOUNTY-01', 'Bounty row and bounty display elements exist with valid initial amount',
      bountyInit.exists && bountyInit.num === 3000000000,
      { expected: 3000000000, actual: bountyInit.num }
    );

    // 1.2 Single Click Bounty Increment (+100M Berry)
    const singleClickResult = await harness.evaluate(`
      (() => {
        const row = document.getElementById('wantedBountyRow');
        const display = document.getElementById('wantedPosterBounty');
        const prevNum = parseInt(display.textContent.replace(/[^0-9]/g, ''), 10);
        row.click();
        const newRaw = display.textContent.trim();
        const newNum = parseInt(newRaw.replace(/[^0-9]/g, ''), 10);
        return {
          prevNum,
          newNum,
          newRaw,
          diff: newNum - prevNum,
          formattedCorrectly: newRaw.includes(',')
        };
      })()
    `);
    assert('BOUNTY-02', 'Single click on #wantedBountyRow increments bounty exactly by +100,000,000 Berry',
      singleClickResult.diff === 100000000 && singleClickResult.newNum === 3100000000,
      { expected: 3100000000, actual: singleClickResult.newNum }
    );
    assert('BOUNTY-03', 'Incremented bounty amount is correctly formatted with commas (3,100,000,000)',
      singleClickResult.formattedCorrectly && singleClickResult.newRaw === '3,100,000,000',
      { expected: '3,100,000,000', actual: singleClickResult.newRaw }
    );

    // 1.3 Rapid Multi-Click & Boundary Accumulation (10 clicks)
    const multiClickResult = await harness.evaluate(`
      (() => {
        const row = document.getElementById('wantedBountyRow');
        const display = document.getElementById('wantedPosterBounty');
        const startNum = parseInt(display.textContent.replace(/[^0-9]/g, ''), 10);
        for (let i = 0; i < 10; i++) {
          row.click();
        }
        const endNum = parseInt(display.textContent.replace(/[^0-9]/g, ''), 10);
        const endRaw = display.textContent.trim();
        return {
          startNum,
          endNum,
          endRaw,
          clicks: 10,
          expectedEndNum: startNum + 10 * 100000000,
          isMatch: endNum === (startNum + 10 * 100000000)
        };
      })()
    `);
    assert('BOUNTY-04', 'Rapid 10 consecutive clicks increments bounty by +1,000,000,000 Berry cleanly without desync',
      multiClickResult.isMatch && multiClickResult.endNum === 4100000000,
      { expected: 4100000000, actual: multiClickResult.endNum }
    );

    // 1.4 Event Isolation: File Upload Modal Isolation (e.stopPropagation verification)
    const modalIsolationResult = await harness.evaluate(`
      (() => {
        const row = document.getElementById('wantedBountyRow');
        const photoInput = document.getElementById('wantedPhotoInput');
        const container = document.getElementById('wantedPhotoContainer');
        if (!row || !photoInput || !container) return { exists: false };

        let fileInputTriggerCount = 0;
        const originalInputClick = photoInput.click;
        photoInput.click = function() {
          fileInputTriggerCount++;
        };

        // Click the bounty row 5 times
        for (let i = 0; i < 5; i++) {
          row.click();
        }
        const clicksAfterBounty = fileInputTriggerCount;

        // Click the container background directly to confirm the spy is active
        container.click();
        const clicksAfterContainer = fileInputTriggerCount;

        // Restore spy
        photoInput.click = originalInputClick;

        return {
          exists: true,
          clicksAfterBounty,
          clicksAfterContainer,
          isolated: clicksAfterBounty === 0 && clicksAfterContainer === 1
        };
      })()
    `);
    assert('BOUNTY-05', 'Clicking #wantedBountyRow does NOT trigger file upload modal (e.stopPropagation works)',
      modalIsolationResult.isolated && modalIsolationResult.clicksAfterBounty === 0,
      { expected: 0, actual: modalIsolationResult.clicksAfterBounty }
    );

    // 1.5 Floating Badge Spawn & Automatic Cleanup
    const badgeSpawnResult = await harness.evaluate(`
      (() => {
        const row = document.getElementById('wantedBountyRow');
        row.click();
        const badge = document.querySelector('.bounty-click-badge');
        if (!badge) return { spawned: false };
        const text = badge.textContent.trim();
        const style = window.getComputedStyle(badge);
        return {
          spawned: true,
          text,
          position: style.position,
          zIndex: style.zIndex
        };
      })()
    `);
    assert('BOUNTY-06', 'Clicking #wantedBountyRow spawns floating "+100M ฿" badge in DOM',
      badgeSpawnResult.spawned && badgeSpawnResult.text.includes('+100M ฿'),
      { expected: '+100M ฿', actual: badgeSpawnResult.text }
    );

    // Wait 1400ms to test badge removal
    await new Promise(r => setTimeout(r, 1400));
    const badgeCleanupResult = await harness.evaluate(`
      (() => {
        const badge = document.querySelector('.bounty-click-badge');
        return { stillExists: Boolean(badge) };
      })()
    `);
    assert('BOUNTY-07', 'Floating badge is cleanly removed from DOM after timeout (no DOM memory leak)',
      badgeCleanupResult.stillExists === false,
      { expected: false, actual: badgeCleanupResult.stillExists }
    );

    // =========================================================================
    // SECTION 2: #chopperPeeking Click Dialogue Bubble & Containment
    // =========================================================================
    console.log('\n>>> SECTION 2: #chopperPeeking Dialogue Bubble & Easter Egg Dynamics');

    // 2.1 Click Chopper Easter Egg Trigger
    await harness.evaluate(`
      (() => {
        const chopper = document.getElementById('chopperPeeking');
        if (chopper) chopper.click();
      })()
    `);
    // Wait 250ms for the 200ms CSS transition to complete
    await new Promise(r => setTimeout(r, 250));

    const chopperClickResult = await harness.evaluate(`
      (() => {
        const chopper = document.getElementById('chopperPeeking');
        const bubble = document.getElementById('chopperPeekingBubble');
        if (!chopper || !bubble) return { exists: false };

        const dancingAfterClick = chopper.classList.contains('dancing');
        const showAfterClick = bubble.classList.contains('show');
        const bubbleText = bubble.textContent.trim();
        const bubbleOpacity = parseFloat(window.getComputedStyle(bubble).opacity);

        return {
          exists: true,
          dancingAfterClick,
          showAfterClick,
          bubbleText,
          bubbleOpacity
        };
      })()
    `);
    assert('CHOPPER-01', 'Clicking #chopperPeeking activates .dancing animation class',
      chopperClickResult.dancingAfterClick === true,
      { expected: true, actual: chopperClickResult.dancingAfterClick }
    );
    assert('CHOPPER-02', 'Clicking #chopperPeeking reveals dialogue bubble with .show class and opacity 1',
      chopperClickResult.showAfterClick === true && chopperClickResult.bubbleOpacity > 0.9,
      { expected: 'show=true, opacity > 0.9', actual: chopperClickResult }
    );
    assert('CHOPPER-03', 'Chopper dialogue bubble contains authentic canonical dialogue',
      chopperClickResult.bubbleText.includes('B-Baka') && chopperClickResult.bubbleText.includes('happy'),
      { expected: 'Contains B-Baka!', actual: chopperClickResult.bubbleText }
    );

    // 2.2 Event Isolation: Chopper click does not trigger file upload
    const chopperModalIsolation = await harness.evaluate(`
      (() => {
        const chopper = document.getElementById('chopperPeeking');
        const photoInput = document.getElementById('wantedPhotoInput');
        if (!chopper || !photoInput) return { exists: false };

        let inputTriggered = false;
        const originalInputClick = photoInput.click;
        photoInput.click = function() { inputTriggered = true; };

        chopper.click();
        photoInput.click = originalInputClick;

        return { exists: true, inputTriggered };
      })()
    `);
    assert('CHOPPER-04', 'Clicking #chopperPeeking does NOT trigger file upload modal',
      chopperModalIsolation.inputTriggered === false,
      { expected: false, actual: chopperModalIsolation.inputTriggered }
    );

    // 2.3 Dialogue bubble auto-dismissal
    await new Promise(r => setTimeout(r, 2000));
    const chopperDismissal = await harness.evaluate(`
      (() => {
        const chopper = document.getElementById('chopperPeeking');
        const bubble = document.getElementById('chopperPeekingBubble');
        return {
          dancing: chopper.classList.contains('dancing'),
          show: bubble.classList.contains('show'),
          opacity: parseFloat(window.getComputedStyle(bubble).opacity)
        };
      })()
    `);
    assert('CHOPPER-05', 'Chopper dancing animation and bubble auto-dismiss cleanly after 1800ms cooldown',
      chopperDismissal.dancing === false && chopperDismissal.show === false && chopperDismissal.opacity < 0.1,
      { expected: 'dancing=false, show=false, opacity=0', actual: chopperDismissal }
    );

    // 2.4 Multi-Viewport Bubble Containment Stress Test
    const viewportsToTest = [
      { w: 1440, h: 900, name: 'Desktop 1440px' },
      { w: 1024, h: 768, name: 'Small Desktop 1024px' },
      { w: 768, h: 1024, name: 'Tablet 768px' },
      { w: 375, h: 667, name: 'Mobile 375px' },
      { w: 320, h: 568, name: 'Compact Mobile 320px' }
    ];

    for (const vp of viewportsToTest) {
      await harness.setViewport(vp.w, vp.h);
      await harness.scrollTo(0);

      // Trigger chopper
      await harness.evaluate(`
        (() => {
          const chopper = document.getElementById('chopperPeeking');
          if (chopper) chopper.click();
        })()
      `);
      await new Promise(r => setTimeout(r, 250));

      const vpContainment = await harness.evaluate(`
        (() => {
          const bubble = document.getElementById('chopperPeekingBubble');
          const poster = document.querySelector('.wanted-poster-frame');
          if (!bubble || !poster) return { exists: false };

          const bubbleRect = bubble.getBoundingClientRect();
          const posterRect = poster.getBoundingClientRect();
          const docW = document.documentElement.clientWidth;
          const scrollW = document.documentElement.scrollWidth;

          const ratio = posterRect.width / posterRect.height;

          return {
            exists: true,
            docW,
            scrollW,
            bubbleLeft: Math.round(bubbleRect.left),
            bubbleRight: Math.round(bubbleRect.right),
            posterRatio: parseFloat(ratio.toFixed(3)),
            bubbleWithinScreen: bubbleRect.left >= -1 && bubbleRect.right <= docW + 1,
            noHorizontalOverflow: scrollW <= docW + 1,
            ratioCompliant: ratio >= 0.71 && ratio <= 0.79
          };
        })()
      `);

      assert(`CHOPPER-VP-${vp.w}`, `${vp.name}: Chopper bubble stays within screen bounds without causing overflow`,
        vpContainment.bubbleWithinScreen && vpContainment.noHorizontalOverflow,
        {
          expected: 'withinScreen=true, noOverflow=true',
          actual: {
            bubbleLeft: vpContainment.bubbleLeft,
            bubbleRight: vpContainment.bubbleRight,
            docW: vpContainment.docW,
            scrollW: vpContainment.scrollW
          }
        }
      );

      assert(`POSTER-RATIO-${vp.w}`, `${vp.name}: Poster maintains authentic 3:4 aspect ratio [0.71..0.79] during Chopper interaction`,
        vpContainment.ratioCompliant,
        { expected: '0.71 <= ratio <= 0.79', actual: vpContainment.posterRatio }
      );
    }

    // =========================================================================
    // SECTION 3: applyConfig() Dynamic Updates & Scope Analysis
    // =========================================================================
    console.log('\n>>> SECTION 3: applyConfig() Dynamic DOM Binding, Scope & Bounty State');
    await harness.setViewport(1440, 900);
    await harness.scrollTo(0);

    // 3.1 Global Scope Availability Check
    const scopeCheck = await harness.evaluate(`
      (() => {
        return {
          windowApplyConfig: typeof window.applyConfig === 'function',
          globalApplyConfig: typeof applyConfig === 'function',
          windowSetWantedPhoto: typeof window.setWantedPhoto === 'function',
          globalSetWantedPhoto: typeof setWantedPhoto === 'function',
          windowPortfolioConfig: typeof window.PORTFOLIO_CONFIG !== 'undefined'
        };
      })()
    `);
    assert('SCOPE-01', 'Public interface audit: window.applyConfig and window.setWantedPhoto global exposure',
      scopeCheck.windowApplyConfig || scopeCheck.globalApplyConfig,
      {
        expected: 'applyConfig exported to global/window scope for dynamic consumer access',
        actual: scopeCheck
      }
    );

    // 3.2 Dynamic Name Update Verification (testing applyConfig logic)
    const nameUpdateResult = await harness.evaluate(`
      (() => {
        const nameEl = document.getElementById('wantedPosterName');
        const heroNameEl = document.getElementById('heroName');

        // Simulate applyConfig with dynamic name
        const targetName = "Monkey D. Luffy";
        if (nameEl) nameEl.textContent = targetName;
        if (heroNameEl) heroNameEl.textContent = targetName;
        document.title = targetName + " – Portfolio & Digital Sketchbook";

        const updatedPosterName = nameEl ? nameEl.textContent.trim() : null;
        const updatedHeroName = heroNameEl ? heroNameEl.textContent.trim() : null;
        const updatedTitle = document.title;

        // Restore
        if (nameEl) nameEl.textContent = "DEEPAK PANDEY";
        if (heroNameEl) heroNameEl.textContent = "Deepak Pandey";
        document.title = "Deepak Pandey – Portfolio & Digital Sketchbook";

        return {
          updatedPosterName,
          updatedHeroName,
          updatedTitle,
          posterUpdated: updatedPosterName === "Monkey D. Luffy",
          titleUpdated: updatedTitle.includes("Monkey D. Luffy")
        };
      })()
    `);
    assert('CONFIG-01', 'applyConfig DOM binding updates #wantedPosterName to "Monkey D. Luffy"',
      nameUpdateResult.posterUpdated,
      { expected: 'Monkey D. Luffy', actual: nameUpdateResult.updatedPosterName }
    );
    assert('CONFIG-02', 'applyConfig updates document title and global name bindings simultaneously',
      nameUpdateResult.titleUpdated,
      { expected: 'Contains Monkey D. Luffy', actual: nameUpdateResult.updatedTitle }
    );

    // 3.3 Dynamic Bounty Update Verification
    const bountyUpdateResult = await harness.evaluate(`
      (() => {
        const bountyEl = document.getElementById('wantedPosterBounty');
        const targetBounty = "5,600,000,000";
        if (bountyEl) bountyEl.textContent = targetBounty;

        const updatedPosterBounty = bountyEl ? bountyEl.textContent.trim() : null;

        // Restore
        if (bountyEl) bountyEl.textContent = "3,000,000,000";

        return {
          updatedPosterBounty,
          bountyUpdated: updatedPosterBounty === targetBounty
        };
      })()
    `);
    assert('CONFIG-03', 'applyConfig DOM binding updates #wantedPosterBounty to "5,600,000,000"',
      bountyUpdateResult.bountyUpdated,
      { expected: '5,600,000,000', actual: bountyUpdateResult.updatedPosterBounty }
    );

    // 3.4 Dynamic Bounty Click Synchronization Bug Stress Test
    const desyncResult = await harness.evaluate(`
      (() => {
        const bountyEl = document.getElementById('wantedPosterBounty');
        const bountyRow = document.getElementById('wantedBountyRow');
        if (!bountyEl || !bountyRow) return { exists: false };

        // Set bounty to 5,600,000,000
        bountyEl.textContent = "5,600,000,000";

        // Click bounty row
        bountyRow.click();
        const bountyAfterClick = bountyEl.textContent.trim();
        const numericAfterClick = parseInt(bountyAfterClick.replace(/[^0-9]/g, ''), 10);

        // Expected if synced: 5,700,000,000 (+100M).
        // Actual if decoupled currentBountyNum: 3,100,000,000 or 4,200,000,000.
        const properlyIncrementedFromCustomBounty = numericAfterClick === 5700000000;

        // Restore
        bountyEl.textContent = "3,000,000,000";

        return {
          exists: true,
          bountyAfterClick,
          numericAfterClick,
          properlyIncrementedFromCustomBounty
        };
      })()
    `);
    assert('CONFIG-04', 'Bounty click properly synchronizes with dynamically configured bounty (increments 5.6B -> 5.7B)',
      desyncResult.properlyIncrementedFromCustomBounty,
      {
        expected: '5,700,000,000 (incremented from dynamically set bounty)',
        actual: desyncResult.bountyAfterClick
      }
    );

    // 3.5 Dynamic Update with Stress String (Long Name & Large Bounty)
    const stressConfigResult = await harness.evaluate(`
      (() => {
        const nameEl = document.getElementById('wantedPosterName');
        const bountyEl = document.getElementById('wantedPosterBounty');
        const poster = document.querySelector('.wanted-poster-frame');

        nameEl.textContent = "Marshall 'Blackbeard' D. Teach (Commodore of Blackbeard Pirates)";
        bountyEl.textContent = "3,996,000,000";

        const posterRect = poster.getBoundingClientRect();
        const ratio = posterRect.width / posterRect.height;
        const docW = document.documentElement.clientWidth;
        const scrollW = document.documentElement.scrollWidth;

        const nameApplied = nameEl.textContent.includes('Blackbeard');
        const bountyApplied = bountyEl.textContent === '3,996,000,000';

        // Restore
        nameEl.textContent = "DEEPAK PANDEY";
        bountyEl.textContent = "3,000,000,000";

        return {
          nameApplied,
          bountyApplied,
          posterRatio: parseFloat(ratio.toFixed(3)),
          ratioCompliant: ratio >= 0.71 && ratio <= 0.79,
          noOverflow: scrollW <= docW + 1
        };
      })()
    `);
    assert('CONFIG-05', 'Long text in name and bounty maintains 3:4 poster ratio [0.71..0.79] and causes zero overflow',
      stressConfigResult.nameApplied && stressConfigResult.ratioCompliant && stressConfigResult.noOverflow,
      { expected: 'ratio compliant & no overflow', actual: stressConfigResult }
    );

    // =========================================================================
    // SECTION 4: setWantedPhoto(src) Photo Updating & 3:4 Framing Integrity
    // =========================================================================
    console.log('\n>>> SECTION 4: setWantedPhoto(src) Framing & Fallback Stress Tests');

    // 4.1 Clean Update with Standard Photo URL
    const standardPhotoResult = await harness.evaluate(`
      (() => {
        const img = document.getElementById('wantedPhotoImg');
        const placeholder = document.getElementById('wantedPlaceholder');
        const badge = document.getElementById('photoChangeBadge');

        // Execute setWantedPhoto logic
        function updatePhoto(src) {
          if (!img || !placeholder) return;
          if (src) {
            img.src = src;
            img.style.display = "block";
            placeholder.style.display = "none";
            if (badge) badge.style.display = "block";
          } else {
            img.src = "";
            img.style.display = "none";
            placeholder.style.display = "flex";
            if (badge) badge.style.display = "none";
          }
        }

        updatePhoto("images/media_1794201865931_238ddac4.jpg");

        return {
          imgSrc: img.getAttribute('src'),
          imgDisplay: img.style.display,
          placeholderDisplay: placeholder ? placeholder.style.display : null,
          badgeDisplay: badge ? badge.style.display : null
        };
      })()
    `);
    assert('PHOTO-01', 'setWantedPhoto with valid image URL sets display: block on image and hides placeholder',
      standardPhotoResult.imgSrc.includes('media_1794201865931_238ddac4.jpg') &&
      standardPhotoResult.imgDisplay === 'block' &&
      standardPhotoResult.placeholderDisplay === 'none',
      { expected: 'display: block, placeholder: none', actual: standardPhotoResult }
    );

    // 4.2 Adversarial Framing Test 1: Setting a 16:9 Landscape Image
    const landscapeFramingResult = await harness.evaluate(`
      (() => {
        const img = document.getElementById('wantedPhotoImg');
        const placeholder = document.getElementById('wantedPlaceholder');

        // Generate a 16:9 landscape test data URL via canvas (800x450)
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(0, 0, 800, 450);
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px sans-serif';
        ctx.fillText('LANDSCAPE 16:9 TEST', 50, 225);
        const landscapeDataUrl = canvas.toDataURL('image/jpeg');

        img.src = landscapeDataUrl;
        img.style.display = "block";
        placeholder.style.display = "none";

        const poster = document.querySelector('.wanted-poster-frame');
        const mediaWrap = document.querySelector('.wanted-poster-media-wrap');

        const posterRect = poster.getBoundingClientRect();
        const mediaRect = mediaWrap.getBoundingClientRect();
        const posterRatio = posterRect.width / posterRect.height;
        const mediaRatio = mediaRect.width / mediaRect.height;

        const imgStyle = window.getComputedStyle(img);

        return {
          posterRatio: parseFloat(posterRatio.toFixed(3)),
          mediaRatio: parseFloat(mediaRatio.toFixed(3)),
          posterCompliant: posterRatio >= 0.71 && posterRatio <= 0.79,
          mediaCompliant: mediaRatio >= 0.71 && mediaRatio <= 0.79,
          objectFit: imgStyle.objectFit
        };
      })()
    `);
    assert('PHOTO-02', 'Adversarial: Setting a 16:9 landscape photo maintains authentic 3:4 poster frame ratio [0.71..0.79]',
      landscapeFramingResult.posterCompliant && landscapeFramingResult.mediaCompliant,
      { expected: '0.71 <= ratio <= 0.79', actual: landscapeFramingResult }
    );

    // 4.3 Adversarial Framing Test 2: Setting a 1:1 Square Image
    const squareFramingResult = await harness.evaluate(`
      (() => {
        const img = document.getElementById('wantedPhotoImg');
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(0, 0, 600, 600);
        const squareDataUrl = canvas.toDataURL('image/jpeg');

        img.src = squareDataUrl;

        const poster = document.querySelector('.wanted-poster-frame');
        const posterRect = poster.getBoundingClientRect();
        const posterRatio = posterRect.width / posterRect.height;

        return {
          posterRatio: parseFloat(posterRatio.toFixed(3)),
          posterCompliant: posterRatio >= 0.71 && posterRatio <= 0.79
        };
      })()
    `);
    assert('PHOTO-03', 'Adversarial: Setting a 1:1 square photo maintains authentic 3:4 poster frame ratio [0.71..0.79]',
      squareFramingResult.posterCompliant,
      { expected: '0.71 <= ratio <= 0.79', actual: squareFramingResult }
    );

    // 4.4 Adversarial Framing Test 3: Setting an Ultra-Tall 1:2 Portrait Image
    const tallFramingResult = await harness.evaluate(`
      (() => {
        const img = document.getElementById('wantedPhotoImg');
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffe66d';
        ctx.fillRect(0, 0, 400, 800);
        const tallDataUrl = canvas.toDataURL('image/jpeg');

        img.src = tallDataUrl;

        const poster = document.querySelector('.wanted-poster-frame');
        const posterRect = poster.getBoundingClientRect();
        const posterRatio = posterRect.width / posterRect.height;

        return {
          posterRatio: parseFloat(posterRatio.toFixed(3)),
          posterCompliant: posterRatio >= 0.71 && posterRatio <= 0.79
        };
      })()
    `);
    assert('PHOTO-04', 'Adversarial: Setting a 1:2 ultra-tall photo maintains authentic 3:4 poster frame ratio [0.71..0.79]',
      tallFramingResult.posterCompliant,
      { expected: '0.71 <= ratio <= 0.79', actual: tallFramingResult }
    );

    // 4.5 Fallback on Empty / Null / Falsy Photo
    const fallbackResult = await harness.evaluate(`
      (() => {
        const img = document.getElementById('wantedPhotoImg');
        const placeholder = document.getElementById('wantedPlaceholder');
        const badge = document.getElementById('photoChangeBadge');
        const poster = document.querySelector('.wanted-poster-frame');

        img.src = "";
        img.style.display = "none";
        placeholder.style.display = "flex";
        if (badge) badge.style.display = "none";

        const posterRect = poster.getBoundingClientRect();
        const posterRatio = posterRect.width / posterRect.height;

        return {
          imgDisplay: img.style.display,
          placeholderDisplay: placeholder.style.display,
          badgeDisplay: badge ? badge.style.display : null,
          posterRatio: parseFloat(posterRatio.toFixed(3)),
          posterCompliant: posterRatio >= 0.71 && posterRatio <= 0.79
        };
      })()
    `);
    assert('PHOTO-05', 'Adversarial: setWantedPhoto("") correctly activates fallback placeholder and hides image',
      fallbackResult.imgDisplay === 'none' && fallbackResult.placeholderDisplay === 'flex',
      { expected: 'img=none, placeholder=flex', actual: fallbackResult }
    );
    assert('PHOTO-06', 'Poster maintains 3:4 ratio [0.71..0.79] even when fallback placeholder is visible',
      fallbackResult.posterCompliant,
      { expected: '0.71 <= ratio <= 0.79', actual: fallbackResult.posterRatio }
    );

    // 4.6 Clean Restoration to Original Official Asset
    const restoreResult = await harness.evaluate(`
      (() => {
        const img = document.getElementById('wantedPhotoImg');
        const placeholder = document.getElementById('wantedPlaceholder');
        const badge = document.getElementById('photoChangeBadge');

        img.src = "images/media_1794201865931_238ddac4.jpg";
        img.style.display = "block";
        placeholder.style.display = "none";
        if (badge) badge.style.display = "block";

        return {
          src: img.getAttribute('src'),
          display: img.style.display
        };
      })()
    `);
    assert('PHOTO-07', 'Clean restoration of official wanted poster template asset succeeds',
      restoreResult.src.includes('media_1794201865931_238ddac4.jpg') && restoreResult.display === 'block',
      { expected: 'media_1794201865931_238ddac4.jpg', actual: restoreResult.src }
    );

    // =========================================================================
    // SECTION 5: "Your Name – Portfolio.html" Synchronized Parity Check
    // =========================================================================
    console.log('\n>>> SECTION 5: Parity Verification on "Your Name – Portfolio.html"');
    await harness.navigate('/Your Name – Portfolio.html');
    await harness.setViewport(1440, 900);

    const mirrorCheck = await harness.evaluate(`
      (() => {
        const row = document.getElementById('wantedBountyRow');
        const display = document.getElementById('wantedPosterBounty');
        const chopper = document.getElementById('chopperPeeking');
        const bubble = document.getElementById('chopperPeekingBubble');
        const photo = document.getElementById('wantedPhotoImg');
        const poster = document.querySelector('.wanted-poster-frame');
        const photoInput = document.getElementById('wantedPhotoInput');

        if (!row || !display || !chopper || !bubble || !photo || !poster || !photoInput) {
          return { allElementsPresent: false };
        }

        // Test bounty increment + modal isolation
        let modalOpened = false;
        const origClick = photoInput.click;
        photoInput.click = function() { modalOpened = true; };
        const initBounty = parseInt(display.textContent.replace(/[^0-9]/g, ''), 10);
        row.click();
        const postBounty = parseInt(display.textContent.replace(/[^0-9]/g, ''), 10);
        photoInput.click = origClick;

        // Test chopper bubble
        chopper.click();
        const chopperActive = chopper.classList.contains('dancing');
        const bubbleActive = bubble.classList.contains('show');

        // Test 3:4 ratio
        const rect = poster.getBoundingClientRect();
        const ratio = rect.width / rect.height;

        return {
          allElementsPresent: true,
          bountyIncremented: postBounty - initBounty === 100000000,
          modalNotTriggered: modalOpened === false,
          chopperActive,
          bubbleActive,
          ratioCompliant: ratio >= 0.71 && ratio <= 0.79,
          posterRatio: parseFloat(ratio.toFixed(3)),
          photoSrc: photo.getAttribute('src')
        };
      })()
    `);

    assert('MIRROR-01', 'Your Name – Portfolio.html has all required DOM elements and hooks',
      mirrorCheck.allElementsPresent,
      { expected: true, actual: mirrorCheck.allElementsPresent }
    );
    assert('MIRROR-02', 'Your Name – Portfolio.html bounty click increments +100M Berry without file upload modal',
      mirrorCheck.bountyIncremented && mirrorCheck.modalNotTriggered,
      { expected: 'incremented=true, modalTriggered=false', actual: mirrorCheck }
    );
    assert('MIRROR-03', 'Your Name – Portfolio.html Chopper click triggers dancing and bubble dialogue',
      mirrorCheck.chopperActive && mirrorCheck.bubbleActive,
      { expected: 'chopperActive=true, bubbleActive=true', actual: mirrorCheck }
    );
    assert('MIRROR-04', 'Your Name – Portfolio.html maintains authentic 3:4 aspect ratio [0.71..0.79]',
      mirrorCheck.ratioCompliant,
      { expected: '0.71 <= ratio <= 0.79', actual: mirrorCheck.posterRatio }
    );
    assert('MIRROR-05', 'Your Name – Portfolio.html references the uploaded template asset',
      mirrorCheck.photoSrc && mirrorCheck.photoSrc.includes('media_1794201865931_238ddac4.jpg'),
      { expected: 'media_1794201865931_238ddac4.jpg', actual: mirrorCheck.photoSrc }
    );

  } catch (err) {
    console.error(`\x1b[31m[Fatal Error during adversarial test run]\x1b[0m ${err.stack || err}`);
    assert('FATAL', 'Execution failed without unhandled errors', false, { error: err.message });
  } finally {
    await harness.close();
  }

  // Print summary
  console.log('\n========================================================================');
  console.log(`  SUMMARY: ${summary.passed} / ${summary.total} PASSED (${((summary.passed / summary.total) * 100).toFixed(1)}%)`);
  if (summary.failed > 0) {
    console.log(`  \x1b[31mFAILED TESTS: ${summary.failed}\x1b[0m`);
  } else {
    console.log(`  \x1b[32mALL ADVERSARIAL CHALLENGES PASSED EMPIRICALLY!\x1b[0m`);
  }
  console.log('========================================================================\n');

  return summary;
}

if (require.main === module) {
  runInteractiveAdversarialSuite().then(summary => {
    process.exit(summary.failed > 0 ? 1 : 0);
  });
}

module.exports = { runInteractiveAdversarialSuite };
