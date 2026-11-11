# Portfolio Bugfixes Implementation Plan

This task list addresses 8 critical bugs following the exploratory bugfix workflow with property-based testing for strong guarantees.

---

## Bug 1: Page Transition Animation Timing Issue

### 1.1 Write bug condition exploration test

- [ ] 1.1.1 Write exploration test
  - **Property 1: Bug Condition** - Entrance Animation 80ms Delay
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the 80ms delay exists
  - **Scoped PBT Approach**: Scope the property to entrance transitions (when `sessionStorage` has transition state with `from` value)
  - Test implementation: Navigate to pages with transition parameter and measure time between `is-entering` class addition and `reveal-out` class addition
  - Measure timing gap on entrance animations (index.html, doodle.html, stash-trial.html)
  - The test assertions should verify: `timeBetweenClasses < 5ms` (will fail on unfixed code showing ~80ms)
  - Run test on UNFIXED code in `js/page-transition.js`
  - **EXPECTED OUTCOME**: Test FAILS showing ~80ms delay (this is correct - it proves the bug exists)
  - Document counterexamples found (specific pages and measured delays)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2_

### 1.2 Write preservation property tests

- [ ] 1.2.1 Write preservation tests
  - **Property 2: Preservation** - Departure Animation Timing
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Click navigation links on UNFIXED code and measure departure animation duration (should be 780ms)
  - Observe: Verify title letter pop animation displays correctly without repetition
  - Observe: Verify audio playback timing during transitions
  - Write property-based test: For all transitions that are NOT entrances (departures, other animations), timing and behavior match observed values
  - Property-based testing generates many navigation scenarios for stronger guarantees
  - Run tests on UNFIXED code in `js/page-transition.js`
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2_

### 1.3 Fix entrance animation timing

- [ ] 1.3.1 Remove 80ms delay from checkEntrance()
  - File: `js/page-transition.js`, function `checkEntrance()`
  - Remove the `setTimeout(function() { curtainEl.classList.add('reveal-out'); }, 80)` wrapper
  - Apply `reveal-out` class immediately after `is-entering` is added
  - _Bug_Condition: isBugCondition(input) where input.transitionDirection == 'entering' AND input.delayBeforeReveal == 80_
  - _Expected_Behavior: timeBetweenClasses(result) < 5ms AND noVisibleFlash(result)_
  - _Preservation: Departure animation timing (780ms), title rendering, audio playback, BFCache handling_
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [ ] 1.3.2 Adjust final cleanup timing
  - File: `js/page-transition.js`, function `checkEntrance()`
  - Reduce final cleanup timeout from 620ms to 540ms (620 - 80 = 540) to maintain total duration
  - Ensure curtain still covers page initially with `is-active` and `is-entering` classes
  - _Requirements: 2.2_

- [ ] 1.3.3 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Instant Reveal Animation
  - **IMPORTANT**: Re-run the SAME test from task 1.1 - do NOT write a new test
  - The test from task 1.1 encodes the expected behavior
  - When this test passes, it confirms the expected behavior is satisfied
  - Run bug condition exploration test from step 1.1
  - **EXPECTED OUTCOME**: Test PASSES showing <5ms delay (confirms bug is fixed)
  - _Requirements: 2.1, 2.2_

- [ ] 1.3.4 Verify preservation tests still pass
  - **Property 2: Preservation** - Departure Animation Timing
  - **IMPORTANT**: Re-run the SAME tests from task 1.2 - do NOT write new tests
  - Run preservation property tests from step 1.2
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Verify departure animations maintain 780ms duration
  - Verify title rendering and audio playback unchanged

---

## Bug 2: Audio Context Initialization Race Condition

### 2.1 Write bug condition exploration test

- [ ] 2.1.1 Write exploration test
  - **Property 1: Bug Condition** - Suspended AudioContext Silent Failure
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate silent audio failures
  - **Scoped PBT Approach**: Force AudioContext into suspended state, then trigger all audio functions
  - Test implementation: Mock or force `audioContext.state === 'suspended'`, then call `playPenScratch()`, `playPaperRustle()`, `playCoinAudio()`, `playChopperChime()`
  - Verify AudioContext remains suspended and no audio plays
  - The test assertions should verify: `audioContext.resume() WAS called` (will fail on unfixed code)
  - Run test on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Test FAILS showing no resume attempt (this is correct - it proves the bug exists)
  - Document counterexamples found (which functions fail silently)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

### 2.2 Write preservation property tests

- [ ] 2.2.1 Write preservation tests
  - **Property 2: Preservation** - Enabled Audio Playback
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: With sound enabled and AudioContext running on UNFIXED code, trigger audio functions and verify they play normally
  - Observe: With sound disabled, verify audio functions skip playback
  - Observe: Verify cooldown throttling (220ms) applies to pen scratch
  - Write property-based test: For all audio calls where sound is disabled OR AudioContext is already running, behavior matches observed patterns
  - Property-based testing generates many combinations of preferences and states
  - Run tests on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2_

### 2.3 Fix AudioContext resume logic

- [ ] 2.3.1 Add state verification to playPenScratch()
  - File: `js/main.js`, function `playPenScratch()`
  - After calling `getAudioContext()`, check if `ctx.state === 'suspended'`
  - If suspended, call `ctx.resume()` before proceeding to audio synthesis
  - Add early return if resume fails or context unavailable
  - Optional: Add `console.warn()` for debugging when resume fails
  - Preserve existing sound preference check and cooldown throttling
  - _Bug_Condition: isBugCondition(input) where input.functionCalled == 'playPenScratch' AND audioContext.state == 'suspended'_
  - _Expected_Behavior: audioContext.resume() called AND audioPlaysIfResumeSucceeds_
  - _Preservation: Sound disabled skips playback, running context plays normally, cooldown throttling unchanged_
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 2.3.2 Add state verification to playPaperRustle()
  - File: `js/main.js`, function `playPaperRustle()`
  - After calling `getAudioContext()`, check if `ctx.state === 'suspended'`
  - If suspended, call `ctx.resume()` before audio synthesis
  - Add early return on failure
  - Preserve existing sound preference check
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 2.3.3 Add state verification to playCoinAudio()
  - File: `js/main.js`, function `playCoinAudio()`
  - After calling `getAudioContext()`, check if `ctx.state === 'suspended'`
  - If suspended, call `ctx.resume()` before audio synthesis
  - Add early return on failure
  - Preserve existing sound preference check
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 2.3.4 Add state verification to playChopperChime()
  - File: `js/main.js`, function `playChopperChime()`
  - After calling `getAudioContext()`, check if `ctx.state === 'suspended'`
  - If suspended, call `ctx.resume()` before audio synthesis
  - Add early return on failure
  - Preserve existing sound preference check
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 2.3.5 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - AudioContext Resume Attempt
  - **IMPORTANT**: Re-run the SAME test from task 2.1 - do NOT write a new test
  - The test from task 2.1 encodes the expected behavior
  - When this test passes, it confirms the expected behavior is satisfied
  - Run bug condition exploration test from step 2.1
  - **EXPECTED OUTCOME**: Test PASSES showing resume() was called (confirms bug is fixed)
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2.3.6 Verify preservation tests still pass
  - **Property 2: Preservation** - Enabled Audio Playback
  - **IMPORTANT**: Re-run the SAME tests from task 2.2 - do NOT write new tests
  - Run preservation property tests from step 2.2
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Verify sound disabled continues to skip playback
  - Verify running context plays without extra overhead

---

## Bug 4: Test Runner Exit Code Handling

### 4.1 Write bug condition exploration test

- [ ] 4.1.1 Write exploration test
  - **Property 1: Bug Condition** - Non-Standard Exit Codes
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate -1 exit codes and poor diagnostics
  - **Scoped PBT Approach**: Force various failure modes (timeout, CDP failure, crash) and capture exit codes
  - Test implementation: Run test runner with forced failures (invalid Chrome path, test timeouts) and capture exit codes
  - Test on Windows if possible to observe platform-specific behavior
  - The test assertions should verify: `exitCode == 1 AND hasDetailedDiagnostics == true` (will fail on unfixed code)
  - Run test on UNFIXED code in `tests/e2e/runner.js`
  - **EXPECTED OUTCOME**: Test FAILS showing exit code -1 or missing diagnostics (this is correct - it proves the bug exists)
  - Document counterexamples found (specific error types and exit codes)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

### 4.2 Write preservation property tests

- [ ] 4.2.1 Write preservation tests
  - **Property 2: Preservation** - Success Exit Code
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Run successful test suite on UNFIXED code and verify exits with code 0
  - Observe: Use --bail flag with failing test, verify stops on first failure
  - Observe: Run --tier=1,2 and verify only those tiers execute
  - Write property-based test: For all successful test runs OR bail behavior, exit codes match observed values
  - Property-based testing generates many tier combinations and success patterns
  - Run tests on UNFIXED code in `tests/e2e/runner.js`
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2_

### 4.3 Fix exit code handling

- [ ] 4.3.1 Normalize exit codes in main() error handler
  - File: `tests/e2e/runner.js`, function `main()` catch block
  - In catch block, convert any non-zero exit code to 1 (never use -1 or other non-standard codes)
  - Add logic: `process.exit(1)` for all test failures regardless of platform
  - _Bug_Condition: isBugCondition(input) where testTimeout OR cdpConnectionFailed OR harnessCrashed_
  - _Expected_Behavior: exitCode == 1 AND hasDetailedDiagnostics == true_
  - _Preservation: Success exits with 0, bail behavior unchanged, tier selection unchanged_
  - _Requirements: 2.1, 3.1, 3.2_

- [ ] 4.3.2 Add CDP connection diagnostics
  - File: `tests/e2e/runner.js`, function `main()` catch block
  - Check if error relates to Chrome/CDP (connection refused, port issues)
  - Add diagnostic logging: CDP port, connection status, Chrome version if available
  - Include context about which phase failed (server startup, browser launch, test execution)
  - _Requirements: 2.2, 2.3_

- [ ] 4.3.3 Enhance stack trace logging
  - File: `tests/e2e/runner.js`, function `main()` catch block
  - Always log `err.stack` if available, with fallback to `err.message`
  - Add error type detection (timeout vs connection vs general failure)
  - Improve error message clarity with context
  - _Requirements: 2.3_

- [ ] 4.3.4 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Standardized Exit Codes
  - **IMPORTANT**: Re-run the SAME test from task 4.1 - do NOT write a new test
  - The test from task 4.1 encodes the expected behavior
  - When this test passes, it confirms the expected behavior is satisfied
  - Run bug condition exploration test from step 4.1
  - **EXPECTED OUTCOME**: Test PASSES showing exit code 1 with diagnostics (confirms bug is fixed)
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4.3.5 Verify preservation tests still pass
  - **Property 2: Preservation** - Success Exit Code
  - **IMPORTANT**: Re-run the SAME tests from task 4.2 - do NOT write new tests
  - Run preservation property tests from step 4.2
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Verify successful runs exit with 0
  - Verify --bail and --tier flags work unchanged

---

## Bug 5: Horizontal Overflow on Mobile Devices

### 5.1 Write bug condition exploration test

- [ ] 5.1.1 Write exploration test
  - **Property 1: Bug Condition** - Mobile Horizontal Overflow
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate horizontal scrolling on mobile
  - **Scoped PBT Approach**: Test viewports at 375px, 320px, and 280px widths
  - Test implementation: Set viewport to mobile widths and check if `document.documentElement.scrollWidth > window.innerWidth`
  - Attempt horizontal scroll and detect if scroll occurs
  - The test assertions should verify: `scrollWidth <= innerWidth AND horizontalScrollDisabled` (will fail on unfixed code)
  - Run test on UNFIXED code with `css/style.css`
  - **EXPECTED OUTCOME**: Test FAILS showing overflow detected (this is correct - it proves the bug exists)
  - Document counterexamples found (specific viewports and elements causing overflow)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

### 5.2 Write preservation property tests

- [ ] 5.2.1 Write preservation tests
  - **Property 2: Preservation** - Desktop Layout
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Set viewport to desktop widths (768px, 1024px, 1920px) on UNFIXED code
  - Observe: Capture coffee stain positioning and wanted poster transform values
  - Observe: Verify all absolute positioning displays as designed
  - Write property-based test: For all viewports >768px, layout and positioning match observed values
  - Property-based testing generates many viewport widths across desktop range
  - Run tests on UNFIXED code with `css/style.css`
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2_

### 5.3 Fix mobile overflow

- [ ] 5.3.1 Add viewport width constraint
  - File: `css/style.css`, selectors `html` and `body`
  - Add `max-width: 100vw` to html and body to enforce strict viewport bounds
  - Strengthen overflow clipping: verify `overflow-x: clip` is applied (or use `overflow-x: hidden` for compatibility)
  - _Bug_Condition: isBugCondition(input) where viewportWidth <= 375 AND horizontalScrollPossible_
  - _Expected_Behavior: scrollWidth <= innerWidth AND horizontalScrollDisabled_
  - _Preservation: Desktop layout (>768px) unchanged, coffee stain positioning, wanted poster transforms_
  - _Requirements: 2.1, 3.1, 3.2_

- [ ] 5.3.2 Constrain coffee stain on mobile
  - File: `css/style.css`, selector `.coffee-stain` in mobile media queries
  - Modify mobile media queries to use stricter `right` values ensuring element never exceeds viewport
  - Add explicit `max-width: 100%` to prevent overflow
  - Test at 375px, 320px, 280px viewports
  - _Requirements: 2.2_

- [ ] 5.3.3 Add transform containment to wanted poster
  - File: `css/style.css`, selector `.wanted-poster` (and related frame elements)
  - Add `contain: layout paint` to prevent transform expansion beyond computed dimensions
  - Verify transforms stay within viewport constraints on mobile
  - _Requirements: 2.3_

- [ ] 5.3.4 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Mobile Overflow Prevention
  - **IMPORTANT**: Re-run the SAME test from task 5.1 - do NOT write a new test
  - The test from task 5.1 encodes the expected behavior
  - When this test passes, it confirms the expected behavior is satisfied
  - Run bug condition exploration test from step 5.1
  - **EXPECTED OUTCOME**: Test PASSES showing no horizontal overflow (confirms bug is fixed)
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 5.3.5 Verify preservation tests still pass
  - **Property 2: Preservation** - Desktop Layout
  - **IMPORTANT**: Re-run the SAME tests from task 5.2 - do NOT write new tests
  - Run preservation property tests from step 5.2
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Verify desktop layout remains identical
  - Verify coffee stain and wanted poster positioning unchanged on desktop

---

## Bug 6: Journey Scroll Progression Event Listener Memory Leak

### 6.1 Write bug condition exploration test

- [ ] 6.1.1 Write exploration test
  - **Property 1: Bug Condition** - Scroll Listener Accumulation
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate listener accumulation
  - **Scoped PBT Approach**: Monitor listener count during modal opens, page transitions, and section revisits
  - Test implementation: Instrument scroll listener attachment, open/close modals, trigger transitions, revisit sections
  - Count active scroll listeners after each operation
  - The test assertions should verify: `listenerCount == expectedCount AND noLeaksDetected` (will fail on unfixed code)
  - Run test on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Test FAILS showing listener count increasing (this is correct - it proves the bug exists)
  - Document counterexamples found (scenarios causing accumulation)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

### 6.2 Write preservation property tests

- [ ] 6.2.1 Write preservation tests
  - **Property 2: Preservation** - Normal Scroll Tracking
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Scroll through journey on UNFIXED code during normal page use (no modals, no transitions)
  - Observe: Record progression updates and visual feedback behavior
  - Observe: Verify scroll observers initialize properly on page load
  - Write property-based test: For all scrolling during normal page use, tracking behavior matches observed patterns
  - Property-based testing generates many scroll scenarios
  - Run tests on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2_

### 6.3 Fix scroll listener memory leak

- [ ] 6.3.1 Store listener references at module scope
  - File: `js/main.js`, journey scroll tracking code
  - Store scroll event listener references in variables at module scope
  - Ensure references are accessible for later removal
  - Name variables clearly (e.g., `journeyScrollHandler`)
  - _Bug_Condition: isBugCondition(input) where modalOpen OR pageTransitioned OR sectionRevisited_
  - _Expected_Behavior: listenerCount stable AND noLeaksDetected_
  - _Preservation: Normal scroll tracking, initialization, position calculation, visual feedback_
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 6.3.2 Add modal cleanup handlers
  - File: `js/main.js`, modal open/close handlers
  - In modal open handlers, call `window.removeEventListener('scroll', journeyScrollHandler)` to pause tracking
  - In modal close handlers, re-attach with `window.addEventListener('scroll', journeyScrollHandler)`
  - _Requirements: 2.1_

- [ ] 6.3.3 Add page transition cleanup
  - File: `js/page-transition.js` or `js/main.js`, page transition code
  - Before navigate, call cleanup function to remove all scroll observers
  - Create `cleanupScrollListeners()` function that removes journey scroll observers and resets state
  - _Requirements: 2.2_

- [ ] 6.3.4 Add duplicate prevention check
  - File: `js/main.js`, scroll listener initialization
  - Before attaching scroll listeners, check if they're already attached
  - Prevent duplicate attachment on section revisits
  - _Requirements: 2.3_

- [ ] 6.3.5 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Scroll Listener Cleanup
  - **IMPORTANT**: Re-run the SAME test from task 6.1 - do NOT write a new test
  - The test from task 6.1 encodes the expected behavior
  - When this test passes, it confirms the expected behavior is satisfied
  - Run bug condition exploration test from step 6.1
  - **EXPECTED OUTCOME**: Test PASSES showing stable listener count (confirms bug is fixed)
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 6.3.6 Verify preservation tests still pass
  - **Property 2: Preservation** - Normal Scroll Tracking
  - **IMPORTANT**: Re-run the SAME tests from task 6.2 - do NOT write new tests
  - Run preservation property tests from step 6.2
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Verify progression updates correctly during normal scrolling
  - Verify initialization and visual feedback unchanged

---

## Bug 7: Wanted Poster Bounty Click Handler Function Name Error

### 7.1 Write bug condition exploration test

- [ ] 7.1.1 Write exploration test
  - **Property 1: Bug Condition** - getAudioCtx ReferenceError
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate ReferenceError when bounty clicked
  - **Scoped PBT Approach**: Focus on playCoinAudio and playChopperChime function calls
  - Test implementation: Click wanted poster bounty and Chopper elements with error listeners attached
  - Verify ReferenceError is thrown with message containing "getAudioCtx is not defined"
  - The test assertions should verify: `noReferenceError AND calledFunction == 'getAudioContext'` (will fail on unfixed code)
  - Run test on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Test FAILS showing ReferenceError (this is correct - it proves the bug exists)
  - Document counterexamples found (which functions throw the error)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

### 7.2 Write preservation property tests

- [ ] 7.2.1 Write preservation tests
  - **Property 2: Preservation** - Existing Audio Functions
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Trigger playPenScratch and playPaperRustle on UNFIXED code
  - Observe: Verify they call getAudioContext correctly and audio plays
  - Observe: Verify audio parameters (frequency, gain, timing) for all functions
  - Write property-based test: For all audio functions already using correct name, behavior matches observed patterns
  - Property-based testing generates many audio trigger scenarios
  - Run tests on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2_

### 7.3 Fix function name error

- [ ] 7.3.1 Fix playCoinAudio function call
  - File: `js/main.js`, function `playCoinAudio()`
  - Find and replace: `const ctx = getAudioCtx();` with `const ctx = getAudioContext();`
  - Verify no other logic changes are made
  - _Bug_Condition: isBugCondition(input) where functionName == 'playCoinAudio' AND callsFunction == 'getAudioCtx'_
  - _Expected_Behavior: calledFunction == 'getAudioContext' AND NOT threwReferenceError_
  - _Preservation: Other audio functions unchanged, audio parameters unchanged, sound preference unchanged_
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 7.3.2 Fix playChopperChime function call
  - File: `js/main.js`, function `playChopperChime()`
  - Find and replace: `const ctx = getAudioCtx();` with `const ctx = getAudioContext();`
  - Verify no other logic changes are made
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 7.3.3 Verify no other instances exist
  - File: `js/main.js`
  - Search entire codebase for any other instances of `getAudioCtx()`
  - Replace with `getAudioContext()` if found
  - _Requirements: 2.3_

- [ ] 7.3.4 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Correct Function Name
  - **IMPORTANT**: Re-run the SAME test from task 7.1 - do NOT write a new test
  - The test from task 7.1 encodes the expected behavior
  - When this test passes, it confirms the expected behavior is satisfied
  - Run bug condition exploration test from step 7.1
  - **EXPECTED OUTCOME**: Test PASSES showing no ReferenceError (confirms bug is fixed)
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 7.3.5 Verify preservation tests still pass
  - **Property 2: Preservation** - Existing Audio Functions
  - **IMPORTANT**: Re-run the SAME tests from task 7.2 - do NOT write new tests
  - Run preservation property tests from step 7.2
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Verify playPenScratch and playPaperRustle continue working correctly
  - Verify audio parameters unchanged across all functions

---

## Bug 8: Theme Persistence Race Condition

### 8.1 Write bug condition exploration test

- [ ] 8.1.1 Write exploration test
  - **Property 1: Bug Condition** - Theme Color Flashing
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate color flashing on page load
  - **Scoped PBT Approach**: Test with various saved themes (sepia, blueprint, botanical)
  - Test implementation: Save different themes in localStorage, reload page, capture screenshots at various millisecond intervals during load
  - Compare colors to detect flash (parchment colors appearing before saved theme applies)
  - The test assertions should verify: `noColorFlash AND cssVariablesReadyBeforeAnimations` (will fail on unfixed code)
  - Run test on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Test FAILS showing color flash (this is correct - it proves the bug exists)
  - Document counterexamples found (specific themes and flash timing)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

### 8.2 Write preservation property tests

- [ ] 8.2.1 Write preservation tests
  - **Property 2: Preservation** - Manual Theme Changes
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Open theme menu and switch themes on UNFIXED code
  - Observe: Verify smooth transitions occur during manual changes
  - Observe: Verify localStorage saves theme correctly on user change
  - Observe: Clear localStorage, reload, verify parchment loads as default
  - Write property-based test: For all manual theme changes via menu, behavior matches observed smooth transitions
  - Property-based testing generates many theme combinations
  - Run tests on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2_

### 8.3 Fix theme race condition

- [ ] 8.3.1 Move theme loading to document head
  - File: `index.html` (and other HTML pages), add inline script in `<head>` before CSS
  - Move theme loading logic from `js/main.js` to blocking inline script
  - Read from localStorage and apply theme attribute before page render
  - Alternative: Use CSS to set default theme immediately, override with JavaScript
  - _Bug_Condition: isBugCondition(input) where themeLoadedFrom == 'localStorage' AND cssVariablesComputedBefore != 'animations'_
  - _Expected_Behavior: noColorFlash AND cssVariablesReadyBeforeAnimations_
  - _Preservation: Manual theme changes, theme menu interaction, localStorage saving, default theme fallback_
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

- [ ] 8.3.2 Add pre-render class management
  - File: `index.html` or `js/main.js`
  - Add class like `theme-loading` to html element initially
  - Remove after theme applied and CSS variables ready
  - Delay animation start until theme ready
  - _Requirements: 2.2_

- [ ] 8.3.3 Force style computation
  - File: Inline script in `<head>` or `js/main.js`
  - After setting theme attribute, force browser to compute styles
  - Use `getComputedStyle(document.documentElement).getPropertyValue('--paper')`
  - Ensure CSS variables are ready before proceeding
  - _Requirements: 2.3_

- [ ] 8.3.4 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - Pre-Paint Theme Application
  - **IMPORTANT**: Re-run the SAME test from task 8.1 - do NOT write a new test
  - The test from task 8.1 encodes the expected behavior
  - When this test passes, it confirms the expected behavior is satisfied
  - Run bug condition exploration test from step 8.1
  - **EXPECTED OUTCOME**: Test PASSES showing no color flash (confirms bug is fixed)
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 8.3.5 Verify preservation tests still pass
  - **Property 2: Preservation** - Manual Theme Changes
  - **IMPORTANT**: Re-run the SAME tests from task 8.2 - do NOT write new tests
  - Run preservation property tests from step 8.2
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Verify manual theme switching remains smooth
  - Verify theme menu and localStorage saving unchanged

---

## Bug 10: Missing Error Boundaries for localStorage Operations

### 10.1 Write bug condition exploration test

- [ ] 10.1.1 Write exploration test
  - **Property 1: Bug Condition** - localStorage Exception Crashes
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate crashes when localStorage fails
  - **Scoped PBT Approach**: Mock localStorage to throw various errors (SecurityError, QuotaExceededError)
  - Test implementation: Mock getItem and setItem to throw errors, trigger cursor toggle, theme change, sound preference operations
  - Verify operations throw unhandled exceptions
  - The test assertions should verify: `NOT threwException AND usedFallbackValue` (will fail on unfixed code)
  - Run test on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Test FAILS showing uncaught exceptions (this is correct - it proves the bug exists)
  - Document counterexamples found (specific operations and error types)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

### 10.2 Write preservation property tests

- [ ] 10.2.1 Write preservation tests
  - **Property 2: Preservation** - Working localStorage
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: With functional localStorage on UNFIXED code, toggle cursor and verify preference persists across reload
  - Observe: Change theme, reload, verify theme persisted
  - Observe: Verify pin and achievement operations (already with try-catch) continue working
  - Write property-based test: For all localStorage operations where storage is available, persistence behavior matches observed patterns
  - Property-based testing generates many storage scenarios
  - Run tests on UNFIXED code in `js/main.js`
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3_

### 10.3 Fix localStorage error handling

- [ ] 10.3.1 Create safeLocalStorage helper
  - File: `js/main.js`, module-level utility
  - Create helper object with `getItem(key, defaultValue)` and `setItem(key, value)` methods
  - Wrap localStorage operations in try-catch consistently
  - Return default value on getItem error, silently fail on setItem error
  - _Bug_Condition: isBugCondition(input) where localStorage operation AND (storageDisabled OR privacyMode OR quotaExceeded)_
  - _Expected_Behavior: NOT threwException AND usedFallbackValue_
  - _Preservation: Working storage persists preferences, existing try-catch operations unchanged_
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

- [ ] 10.3.2 Wrap cursor localStorage operations
  - File: `js/main.js`, cursor toggle handlers
  - Wrap `localStorage.getItem("portfolio_zoro_cursor")` in try-catch, return "enabled" as default on error
  - Wrap `localStorage.setItem("portfolio_zoro_cursor", value)` in try-catch, silently fail on error
  - Use safeLocalStorage helper
  - _Requirements: 2.1, 2.2_

- [ ] 10.3.3 Wrap theme localStorage operations
  - File: `js/main.js`, theme handling code (around lines 485, 501)
  - Wrap `localStorage.getItem("portfolio_theme")` in try-catch, return "parchment" as default on error
  - Wrap `localStorage.setItem("portfolio_theme", value)` in try-catch, log warning on QuotaExceededError
  - Use safeLocalStorage helper
  - _Requirements: 2.1, 2.3_

- [ ] 10.3.4 Wrap sound localStorage operations
  - File: `js/main.js`, sound toggle code (around lines 383, 473)
  - Wrap `localStorage.getItem("portfolio_sound")` in try-catch, return "false" as default on error
  - Wrap `localStorage.setItem("portfolio_sound", value)` in try-catch, continue with in-memory state on error
  - Use safeLocalStorage helper
  - _Requirements: 2.1, 2.4_

- [ ] 10.3.5 Verify all localStorage operations wrapped
  - File: `js/main.js`
  - Search codebase for remaining unwrapped localStorage operations
  - Wrap any found operations using safeLocalStorage helper
  - Exclude operations already wrapped in try-catch (pins, achievements, live tracker)
  - _Requirements: 2.5_

- [ ] 10.3.6 Verify bug condition exploration test now passes
  - **Property 1: Expected Behavior** - localStorage Error Boundaries
  - **IMPORTANT**: Re-run the SAME test from task 10.1 - do NOT write a new test
  - The test from task 10.1 encodes the expected behavior
  - When this test passes, it confirms the expected behavior is satisfied
  - Run bug condition exploration test from step 10.1
  - **EXPECTED OUTCOME**: Test PASSES showing graceful error handling (confirms bug is fixed)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 10.3.7 Verify preservation tests still pass
  - **Property 2: Preservation** - Working localStorage
  - **IMPORTANT**: Re-run the SAME tests from task 10.2 - do NOT write new tests
  - Run preservation property tests from step 10.2
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Verify preferences persist correctly when storage works
  - Verify existing try-catch operations unchanged

---

## Final Verification

- [ ] 11. Checkpoint - Ensure all tests pass
  - Run complete E2E test suite across all tiers
  - Verify all 8 bug fixes are working correctly
  - Verify no regressions introduced
  - Test cross-browser compatibility if possible
  - Review console for any warnings or errors
  - Ask the user if questions arise

