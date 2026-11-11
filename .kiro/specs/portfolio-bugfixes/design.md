# Portfolio Bugfixes Design

## Overview

This design document addresses 8 critical bugs affecting the portfolio's page transitions, audio playback, test infrastructure, responsive layout, memory management, and local storage operations. The fixes maintain backward compatibility with existing features, follow established code patterns, and are testable by the existing E2E test suite while minimizing performance impact.

The bugs span multiple domains:
- **UI/UX**: Page transition timing, responsive overflow
- **Audio**: Context initialization, function naming errors
- **Testing**: Exit code standardization
- **Performance**: Memory leak prevention
- **Reliability**: localStorage error boundaries, theme persistence

## Glossary

- **Bug_Condition (C)**: The condition that triggers each specific bug
- **Property (P)**: The desired behavior when the bug condition holds
- **Preservation**: Existing functionality that must remain unchanged by the fix
- **AudioContext**: Web Audio API context for sound synthesis
- **CDP**: Chrome DevTools Protocol for headless browser automation
- **localStorage**: Browser storage API for persisting user preferences
- **sessionStorage**: Session-only browser storage for transition state
- **CRDT**: Conflict-free Replicated Data Type (referenced in config)
- **Viewport**: Browser's visible area measured in CSS pixels
- **Event Listener**: JavaScript function bound to DOM events

---

## Bug 1: Page Transition Animation Timing Issue

### Bug Condition

The page entrance animation includes an unnecessary 80ms delay before adding the "reveal-out" class, causing a visible flash where the curtain briefly covers completed content. This delay was intended to let layout settle but creates a jarring visual pause.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type PageTransitionState
  OUTPUT: boolean
  
  RETURN input.transitionDirection == 'entering'
         AND input.curtainState == 'covering'
         AND input.delayBeforeReveal == 80
         AND input.hasVisibleFlash == true
END FUNCTION
```

### Examples

- **Entering index.html**: Curtain covers page → 80ms pause → reveal animation starts (flash visible)
- **Entering doodle.html**: Curtain covers page → 80ms pause → reveal animation starts (flash visible)
- **Entering stash-trial.html**: Curtain covers page → 80ms pause → reveal animation starts (flash visible)
- **Edge case - Fast navigation**: Multiple rapid clicks cause multiple 80ms delays to queue

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Departure (leaving) animation timing must continue with existing 780ms duration
- Title letter pop animation must continue to display correctly without repetition
- Navigation link interception must continue to work for all .html links
- BFCache handling for back/forward buttons must continue functioning

**Scope:**
All transitions that do NOT involve the entrance reveal animation should be completely unaffected by this fix. This includes:
- Outbound/departure animations when leaving a page
- Title badge rendering and letter splitting
- Audio playback during transitions
- Navigation link click handlers

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Unnecessary Layout Settling Delay**: The 80ms `setTimeout` in `checkEntrance()` was added to ensure layout stabilizes, but modern browsers handle this automatically

2. **Class Application Timing**: The delay between adding `is-entering` and `reveal-out` creates a visible gap where CSS animations pause

3. **CSS Animation Coordination**: The reveal-out animation may need better synchronization with the is-entering state

## Correctness Properties

Property 1: Bug Condition - Instant Reveal Animation

_For any_ page entrance where the curtain covers the page, the fixed `checkEntrance` function SHALL immediately add the "reveal-out" class without the 80ms delay, eliminating the visible flash and ensuring smooth, seamless transition from curtain-covered to revealed state.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Departure Animation Timing

_For any_ page transition that is NOT an entrance (departure/leaving animations, title rendering, navigation handling), the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing departure animation timing, audio playback, and link interception functionality.

**Validates: Requirements 3.1, 3.2**

## Fix Implementation

### Changes Required

**File**: `js/page-transition.js`

**Function**: `checkEntrance()`

**Specific Changes**:
1. **Remove 80ms Delay**: Remove the `setTimeout(function() { curtainEl.classList.add('reveal-out'); }, 80)` wrapper

2. **Immediate Class Application**: Apply `reveal-out` class immediately after `is-entering` is added

3. **Adjust Final Cleanup Timing**: Reduce the final cleanup timeout from 620ms to 540ms (620 - 80 = 540) to maintain the same total duration

4. **Maintain Curtain Covering**: Ensure curtain still covers page initially with `is-active` and `is-entering` classes before reveal

5. **Preserve Animation Coordination**: Keep all other timing and class applications unchanged

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by measuring the delay timing, then verify the fix eliminates the flash and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the 80ms delay bug BEFORE implementing the fix. Confirm the visible flash occurs and measure the timing gap.

**Test Plan**: Use the E2E harness to navigate to pages with transition parameters and measure the time between `is-entering` class addition and `reveal-out` class addition. Also visually inspect for flash using screenshot comparison. Run these tests on the UNFIXED code to observe the 80ms delay.

**Test Cases**:
1. **Index Page Entrance**: Navigate to index.html with transition parameter and measure class application timing (will show ~80ms gap on unfixed code)
2. **Doodle Page Entrance**: Navigate to doodle.html and verify flash occurs during entrance (will fail on unfixed code)
3. **Stash Page Entrance**: Navigate to stash-trial.html and measure reveal timing (will show delay on unfixed code)
4. **Rapid Navigation**: Click multiple links quickly and verify no queued delays accumulate (may show issues on unfixed code)

**Expected Counterexamples**:
- Timing measurements showing exactly 80ms between `is-entering` and `reveal-out`
- Screenshot comparisons showing visible curtain covering completed content
- Possible causes: setTimeout delay, CSS animation timing mismatch

### Fix Checking

**Goal**: Verify that for all entrance transitions where the bug condition holds, the fixed function eliminates the delay.

**Pseudocode:**
```
FOR ALL entrance WHERE isBugCondition(entrance) DO
  result := checkEntrance_fixed(entrance)
  ASSERT timeBetweenClasses(result) < 5ms
  ASSERT noVisibleFlash(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all transitions where the bug condition does NOT hold (departures, other animations), the fixed function produces the same result as the original.

**Pseudocode:**
```
FOR ALL transition WHERE NOT isBugCondition(transition) DO
  ASSERT navigate_original(url) = navigate_fixed(url)
  ASSERT departureTimingPreserved(transition)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because it can generate many navigation scenarios automatically and verify timing remains consistent.

**Test Plan**: Observe departure animation behavior on UNFIXED code first, measuring the 780ms duration and audio timing, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Departure Animation Preservation**: Click navigation links and verify 780ms departure animation continues unchanged
2. **Title Rendering Preservation**: Verify title letter pop animation displays correctly without repetition
3. **Audio Playback Preservation**: Verify curtain audio plays at correct times
4. **BFCache Preservation**: Use browser back/forward and verify reset behavior continues working

### Unit Tests

- Test entrance timing with various page configurations
- Test edge case of no transition state in sessionStorage
- Test that departure animations maintain 780ms duration
- Test curtain audio playback triggers correctly

### Property-Based Tests

- Generate random navigation sequences and verify entrance transitions have no flash
- Generate random page configurations and verify departure timing remains 780ms
- Test across different viewport sizes to ensure timing consistency

### Integration Tests

- Test full navigation flow from index to doodle to stash with visual inspection
- Test rapid sequential navigation and verify no timing issues
- Test back/forward button with BFCache and verify clean state

---

## Bug 2: Audio Context Initialization Race Condition

### Bug Condition

The audio playback functions (`playPenScratch`, `playPaperRustle`, `playCoinAudio`, `playChopperChime`) do not verify AudioContext state before attempting playback. When the AudioContext is suspended (common on page load due to browser autoplay policies), audio fails silently without user feedback or recovery attempts.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type AudioPlaybackAttempt
  OUTPUT: boolean
  
  RETURN input.functionCalled IN ['playPenScratch', 'playPaperRustle', 'playCoinAudio', 'playChopperChime']
         AND audioContext.state == 'suspended'
         AND NOT attemptedResume()
END FUNCTION
```

### Examples

- **Page load pen scratch**: User hovers over interactive element triggering `playPenScratch()` but AudioContext is suspended → no sound, no error
- **Paper rustle on click**: User clicks cursor toggle calling `playPaperRustle()` but context is suspended → silent failure
- **Coin audio on bounty**: User clicks wanted poster bounty calling `playCoinAudio()` but context is suspended → no chime
- **Edge case - Multiple rapid calls**: User triggers multiple audio events quickly, each one failing silently due to suspended context

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When sound is disabled by user preference, audio playback must continue to be skipped
- When AudioContext is already running (state === 'running'), audio must continue to play normally without additional overhead
- Audio synthesis parameters (frequency, gain, filter settings) must remain identical
- Audio cooldown throttling (220ms) must continue to function

**Scope:**
All audio-related code that does NOT involve AudioContext state verification should be completely unaffected. This includes:
- Audio buffer generation and noise synthesis
- Filter and gain node configuration
- User sound preference toggle functionality
- Audio cooldown timing logic

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Missing State Check**: The audio functions create or get AudioContext but don't check if state is 'suspended'

2. **No Resume Attempt**: Functions call `getAudioContext()` but don't call `ctx.resume()` when suspended

3. **Silent Failure Pattern**: The try-catch blocks swallow errors without logging or retry logic

4. **Race Condition on Page Load**: User interactions happen before AudioContext has been resumed by user gesture

## Correctness Properties

Property 1: Bug Condition - AudioContext Resume Attempt

_For any_ audio playback function call where the AudioContext is suspended, the fixed functions SHALL attempt to resume the AudioContext before playing audio and gracefully handle resume failures with optional warning logging.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Enabled Audio Playback

_For any_ audio playback call where sound is disabled by user preference OR where AudioContext is already running, the fixed code SHALL produce exactly the same behavior as the original code, preserving skip logic and normal playback without additional overhead.

**Validates: Requirements 3.1, 3.2**

## Fix Implementation

### Changes Required

**File**: `js/main.js`

**Functions**: `playPenScratch`, `playPaperRustle`, `playCoinAudio`, `playChopperChime`

**Specific Changes**:
1. **Add State Verification**: After calling `getAudioContext()`, check if `ctx.state === 'suspended'`

2. **Attempt Resume**: If suspended, call `await ctx.resume()` or wrap in Promise for synchronous functions

3. **Early Return on Failure**: If resume fails or context unavailable, return early without proceeding to audio synthesis

4. **Optional Console Warning**: Add `console.warn()` for debugging when AudioContext fails to resume (can be removed in production)

5. **Preserve Existing Checks**: Keep sound preference check and cooldown throttling exactly as is

**Note**: Since these functions are synchronous, we'll use `ctx.resume()` which returns a Promise but allow it to resolve asynchronously while proceeding if state changes immediately.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, simulate suspended AudioContext state on unfixed code to observe silent failures, then verify the fix attempts resume and plays audio successfully.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate silent audio failures BEFORE implementing the fix. Confirm AudioContext remains suspended and audio doesn't play.

**Test Plan**: Use E2E harness to mock or force AudioContext into suspended state, then trigger audio functions and verify no sound plays and no resume attempt is made. Run these tests on the UNFIXED code to observe silent failures.

**Test Cases**:
1. **Suspended Pen Scratch**: Force AudioContext to suspended state, trigger hover → pen scratch, verify no audio plays (will fail on unfixed code)
2. **Suspended Paper Rustle**: Force suspended state, click cursor toggle, verify no audio plays (will fail on unfixed code)
3. **Suspended Coin Audio**: Force suspended state, click wanted poster bounty, verify no chime (will fail on unfixed code)
4. **Multiple Rapid Calls**: Force suspended state, trigger multiple audio events quickly, verify all fail silently (will fail on unfixed code)

**Expected Counterexamples**:
- AudioContext remains in 'suspended' state after playback attempts
- No errors logged or warnings displayed
- Possible causes: missing resume() call, no state verification

### Fix Checking

**Goal**: Verify that for all audio playback attempts where AudioContext is suspended, the fixed functions attempt resume.

**Pseudocode:**
```
FOR ALL audioCall WHERE isBugCondition(audioCall) DO
  result := audioFunction_fixed(audioCall)
  ASSERT audioContext.resume() WAS called
  ASSERT audioPlaysIfResumeSucceeds(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all audio calls where sound is disabled OR AudioContext is running, behavior is unchanged.

**Pseudocode:**
```
FOR ALL audioCall WHERE soundDisabled(audioCall) OR audioContextRunning(audioCall) DO
  ASSERT audioFunction_original(audioCall) = audioFunction_fixed(audioCall)
END FOR
```

**Testing Approach**: Property-based testing is recommended because it can generate many combinations of user preferences, AudioContext states, and timing scenarios to ensure preservation across the input domain.

**Test Plan**: Observe audio behavior on UNFIXED code first with sound enabled and AudioContext running, then write property-based tests capturing that playback behavior continues identically.

**Test Cases**:
1. **Sound Disabled Preservation**: Disable sound preference, trigger audio functions, verify they skip playback as before
2. **Running Context Preservation**: Ensure AudioContext is running, trigger audio, verify identical playback without extra overhead
3. **Cooldown Preservation**: Trigger pen scratch rapidly, verify 220ms cooldown still applies
4. **Parameter Preservation**: Verify audio frequency, gain, and filter settings remain unchanged

### Unit Tests

- Test each audio function with suspended AudioContext and verify resume attempt
- Test each function with running AudioContext and verify no extra resume calls
- Test sound disabled preference continues to skip all audio
- Test error handling when AudioContext is unavailable

### Property-Based Tests

- Generate random sequences of audio triggers with varying AudioContext states and verify correct behavior
- Generate random user preference states and verify sound disable is always respected
- Test rapid audio triggering with cooldown and verify throttling works correctly

### Integration Tests

- Test full user journey: page load (suspended) → user interaction (resume) → audio plays
- Test theme switching and cursor toggling with audio feedback across different contexts
- Test achievement unlocking and coin audio across multiple scenarios

---

## Bug 4: Test Runner Exit Code Handling

### Bug Condition

The test runner exits with non-standard exit codes on Windows when tests timeout or fail. Specifically, it uses `-1` instead of the standard exit code `1` for test failures, and doesn't provide detailed error reporting when Chrome CDP connections fail or the harness crashes.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type TestRunResult
  OUTPUT: boolean
  
  RETURN (input.platform == 'windows' AND input.testTimeout == true AND input.exitCode == -1)
         OR (input.cdpConnectionFailed == true AND NOT input.hasDetailedDiagnostics)
         OR (input.harnessCrashed == true AND NOT input.hasStackTrace)
END FUNCTION
```

### Examples

- **Windows timeout**: Tests hang and timeout on Windows → runner exits with code -1 instead of 1
- **CDP connection failure**: Chrome fails to attach → generic error without connection diagnostics
- **Harness crash**: Test harness throws exception → runner terminates without full stack trace
- **Edge case - Normal pass**: All tests pass → exits with code 0 (correct, should be preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When all tests pass successfully, the system must continue to exit with code 0
- When tests are run with --bail flag, stopping on first failure must continue to work
- Test tier selection (--tier=1,2,3,4) must continue to function correctly
- JSON report output (--json) must continue to work as designed

**Scope:**
All test runner functionality that does NOT involve exit code normalization or error diagnostics should be completely unaffected. This includes:
- Test tier execution logic
- Reporter assertion tracking and summary generation
- Server and browser harness lifecycle management
- CLI argument parsing

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Platform-Specific Exit Code**: Windows returns -1 for certain process terminations while Unix expects 1 for test failures

2. **Generic Error Catching**: The try-catch in `main()` catches errors but doesn't differentiate between CDP failures, timeouts, and crashes

3. **Missing Diagnostic Logging**: Error handler only logs `err.stack || err.message` without context about what operation failed

4. **No Exit Code Normalization**: No logic to convert -1 or other non-standard codes to 1

## Correctness Properties

Property 1: Bug Condition - Standardized Exit Codes

_For any_ test run where tests timeout, fail, or the harness crashes, the fixed test runner SHALL exit with code 1 (standard test failure) regardless of platform, and SHALL provide detailed diagnostic information including CDP connection details and complete stack traces.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Success Exit Code

_For any_ test run where all tests pass successfully OR where --bail flag behavior is triggered, the fixed runner SHALL produce exactly the same exit code (0 for success, 1 for bail) and behavior as the original runner.

**Validates: Requirements 3.1, 3.2**

## Fix Implementation

### Changes Required

**File**: `tests/e2e/runner.js`

**Function**: `main()` error handling

**Specific Changes**:
1. **Normalize Exit Codes**: In the catch block, convert any exit code to 1 for failures (never use -1 or other non-standard codes)

2. **Add CDP Diagnostics**: When catching errors, check if error relates to Chrome/CDP and add specific diagnostic logging (port, connection status, Chrome version)

3. **Enhance Stack Trace Logging**: Always log `err.stack` if available, with fallback to `err.message`, and add context about which phase failed (server startup, browser launch, test execution)

4. **Add Error Type Detection**: Differentiate between timeout errors, connection errors, and general failures for better diagnostics

5. **Preserve Success Code**: Keep `process.exit(0)` for successful test runs unchanged

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, force various failure modes on unfixed runner to observe non-standard exit codes and poor diagnostics, then verify the fix standardizes codes and provides detailed output.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the exit code issue BEFORE implementing the fix. Simulate timeouts and failures on Windows if possible.

**Test Plan**: Run the E2E test runner with forced failures (invalid Chrome path, test timeouts, harness crashes) and capture the exit codes and error output. Run on both Windows and Unix to observe platform differences. Run these tests on the UNFIXED code to observe -1 exit codes and poor diagnostics.

**Test Cases**:
1. **Forced Timeout Windows**: Simulate test timeout on Windows environment, verify exits with -1 (will fail on unfixed code)
2. **Invalid CDP Port**: Configure invalid CDP port, trigger connection failure, verify poor diagnostics (will fail on unfixed code)
3. **Harness Crash**: Inject error in test harness, verify missing stack trace (will fail on unfixed code)
4. **Normal Pass**: Run successful test suite, verify exits with 0 (should pass on unfixed code)

**Expected Counterexamples**:
- Exit code -1 instead of 1 on Windows timeouts
- Generic "unhandled exception" message without CDP details
- Possible causes: no exit code normalization, insufficient error context logging

### Fix Checking

**Goal**: Verify that for all test failures where the bug condition holds, the fixed runner exits with code 1 and provides diagnostics.

**Pseudocode:**
```
FOR ALL testRun WHERE isBugCondition(testRun) DO
  result := runTests_fixed(testRun)
  ASSERT result.exitCode == 1
  ASSERT result.hasDetailedDiagnostics == true
END FOR
```

### Preservation Checking

**Goal**: Verify that for all successful test runs, the fixed runner produces the same exit code and behavior.

**Pseudocode:**
```
FOR ALL testRun WHERE testsPass(testRun) OR bailTriggered(testRun) DO
  ASSERT runTests_original(testRun).exitCode == runTests_fixed(testRun).exitCode
END FOR
```

**Testing Approach**: Property-based testing is recommended because it can generate many test scenarios (different tier combinations, success/failure patterns) and verify exit code consistency.

**Test Plan**: Observe runner behavior on UNFIXED code first with successful runs, recording exit codes and output, then write tests verifying the fixed code maintains those behaviors.

**Test Cases**:
1. **All Tests Pass Preservation**: Run full test suite successfully, verify exits with 0
2. **Bail Behavior Preservation**: Use --bail flag with failing test, verify stops on first failure as before
3. **Tier Selection Preservation**: Run --tier=1,2 and verify only those tiers execute
4. **JSON Report Preservation**: Use --json flag and verify report generation continues working

### Unit Tests

- Test exit code normalization logic converts -1 to 1
- Test error message formatting includes CDP diagnostics
- Test stack trace logging handles missing stack gracefully
- Test that success path exits with 0

### Property-Based Tests

- Generate random test failure scenarios and verify all exit with code 1
- Generate random success scenarios and verify all exit with code 0
- Test across different tier combinations and verify exit codes are consistent

### Integration Tests

- Run full E2E suite on Windows and Unix, verify consistent exit codes
- Simulate CDP connection failure and verify detailed diagnostics logged
- Force harness crash and verify complete stack trace is printed
- Test successful run end-to-end and verify clean exit

---

## Bug 5: Horizontal Overflow on Mobile Devices

### Bug Condition

On mobile devices with viewport width 375px or smaller, horizontal scrolling is possible despite `overflow-x: clip` on root elements. The coffee stain element with absolute positioning and the wanted poster frame with transforms extend beyond the viewport boundary, causing the overflow.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ViewportState
  OUTPUT: boolean
  
  RETURN input.viewportWidth <= 375
         AND (input.coffeeStainOverflows == true 
              OR input.wantedPosterOverflows == true)
         AND input.horizontalScrollPossible == true
END FUNCTION
```

### Examples

- **iPhone SE (375px)**: Coffee stain positioned with fixed right causes horizontal scroll
- **Galaxy Fold (280px)**: Wanted poster frame transform causes content to exceed viewport
- **Narrow portrait mode (320px)**: Absolute positioned elements break out of containment
- **Edge case - Desktop (1920px)**: No overflow occurs, layout functions correctly (should be preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When viewport is desktop width (>768px), layout and positioning must continue to function correctly
- When elements use absolute positioning for desktop layouts, they must continue to display as designed
- Coffee stain hover effects and visual styling must remain unchanged on desktop
- Wanted poster frame animations and transforms must continue working on desktop

**Scope:**
All layout and positioning that does NOT involve mobile viewport constraints should be completely unaffected. This includes:
- Desktop layout grid and spacing
- Desktop coffee stain positioning and sizing
- Desktop wanted poster transforms
- Other absolutely positioned elements on desktop

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Insufficient Containment**: Root elements have `overflow-x: clip` but fixed/absolute children can still escape

2. **Coffee Stain Right Positioning**: The coffee stain uses `right: clamp(16px, 3.5vw, 48px)` but this may still allow overflow on very narrow viewports

3. **Transform Expansion**: The wanted poster frame uses transforms that expand beyond computed dimensions, breaking containment

4. **Missing Mobile Constraints**: Media queries for mobile don't apply sufficient width/max-width constraints to prevent overflow

## Correctness Properties

Property 1: Bug Condition - Mobile Overflow Prevention

_For any_ viewport with width 375px or smaller, the fixed CSS SHALL prevent all horizontal scrolling by constraining the coffee stain element within viewport bounds using proper containment, ensuring the wanted poster frame transforms stay within viewport constraints, and applying max-width limits.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Desktop Layout

_For any_ viewport with width greater than 768px, the fixed CSS SHALL produce exactly the same layout and positioning as the original code, preserving desktop coffee stain positioning, wanted poster transforms, and all other absolute positioning.

**Validates: Requirements 3.1, 3.2**

## Fix Implementation

### Changes Required

**File**: `css/style.css`

**Selectors**: `html`, `body`, `.coffee-stain`, `.wanted-poster` (and related)

**Specific Changes**:
1. **Add Viewport Width Constraint**: Add `max-width: 100vw` to html and body to enforce strict viewport bounds

2. **Constrain Coffee Stain**: Modify `.coffee-stain` media queries to use stricter `right` values on mobile, ensuring element never exceeds viewport

3. **Add Transform Containment**: Add `contain: layout paint` to wanted poster frame to prevent transform expansion

4. **Strengthen Overflow Clipping**: Change `overflow-x: clip` to `overflow-x: hidden` if browser compatibility requires, or add `overflow: clip` to parent containers

5. **Mobile-Specific Max Width**: In mobile media queries, add explicit `max-width: 100%` to .coffee-stain and other fixed elements

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, test on narrow viewports (375px and below) on unfixed code to observe horizontal scrolling, then verify the fix prevents all overflow while preserving desktop layouts.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate horizontal overflow BEFORE implementing the fix. Measure scroll width on narrow viewports.

**Test Plan**: Use E2E harness to set viewport to 375px, 320px, and 280px widths, then check if `document.documentElement.scrollWidth > window.innerWidth`. Also manually scroll horizontally to detect overflow. Run these tests on the UNFIXED code to observe overflow.

**Test Cases**:
1. **375px Viewport**: Set viewport to 375px width, check for horizontal scroll (will fail on unfixed code)
2. **320px Viewport**: Set viewport to 320px, verify coffee stain causes overflow (will fail on unfixed code)
3. **280px Viewport (Galaxy Fold)**: Set to 280px, verify wanted poster frame overflows (will fail on unfixed code)
4. **Scroll Detection**: Attempt horizontal scroll on mobile viewport, verify scroll occurs (will fail on unfixed code)

**Expected Counterexamples**:
- `document.documentElement.scrollWidth` exceeds `window.innerWidth`
- Horizontal scrollbar appears or touch drag allows horizontal scroll
- Possible causes: coffee stain right positioning, transform expansion, insufficient containment

### Fix Checking

**Goal**: Verify that for all mobile viewports where overflow occurred, the fixed CSS prevents horizontal scrolling.

**Pseudocode:**
```
FOR ALL viewport WHERE isBugCondition(viewport) DO
  result := renderPage_fixed(viewport)
  ASSERT result.scrollWidth <= viewport.innerWidth
  ASSERT result.horizontalScrollDisabled == true
END FOR
```

### Preservation Checking

**Goal**: Verify that for all desktop viewports (>768px), layout and positioning remain unchanged.

**Pseudocode:**
```
FOR ALL viewport WHERE viewport.width > 768 DO
  ASSERT renderPage_original(viewport) = renderPage_fixed(viewport)
END FOR
```

**Testing Approach**: Property-based testing is recommended because it can generate many viewport widths and verify consistent behavior across the range.

**Test Plan**: Observe desktop layout on UNFIXED code first at various widths (768px, 1024px, 1920px), capturing element positions and sizes, then write tests verifying the fixed code maintains those exact layouts.

**Test Cases**:
1. **Desktop Layout Preservation (768px)**: Set viewport to 768px, verify coffee stain and poster positioning unchanged
2. **Large Desktop Preservation (1920px)**: Set to 1920px, verify all absolute positioning remains identical
3. **Coffee Stain Hover Preservation**: Test hover effects on desktop viewports remain unchanged
4. **Transform Preservation**: Verify wanted poster transforms continue working correctly on desktop

### Unit Tests

- Test viewport constraint logic at boundary widths (375px, 376px)
- Test coffee stain positioning calculations on mobile
- Test wanted poster transform containment
- Test that desktop widths (>768px) maintain original positioning

### Property-Based Tests

- Generate random viewport widths from 280px to 2560px and verify no horizontal overflow
- Generate random scroll attempts and verify horizontal scrolling is prevented on mobile
- Test element positioning remains correct across all viewport sizes

### Integration Tests

- Test full page render on iPhone SE viewport (375px) with no horizontal scroll
- Test responsive breakpoints transition smoothly without overflow
- Test coffee stain and wanted poster display correctly across mobile and desktop
- Test touch gestures on mobile cannot trigger horizontal scroll

---

## Bug 6: Journey Scroll Progression Event Listener Memory Leak

### Bug Condition

Scroll event listeners for journey progression tracking remain attached when modals are opened and are not removed during page transitions. When the same page section is visited multiple times, duplicate scroll event listeners accumulate, causing redundant calculations and memory leaks.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ScrollListenerState
  OUTPUT: boolean
  
  RETURN (input.modalOpen == true AND input.scrollListenersActive == true)
         OR (input.pageTransitioned == true AND input.scrollObserversNotRemoved == true)
         OR (input.sectionRevisited == true AND input.duplicateListenersAdded == true)
END FUNCTION
```

### Examples

- **Modal opens**: User opens achievement modal → scroll listeners for journey progression remain active, continuing to fire events
- **Page transition**: User navigates from index to doodle → scroll observers not cleaned up, causing memory accumulation
- **Section revisit**: User scrolls through journey, returns to top, scrolls again → duplicate listeners added each time
- **Edge case - Normal scrolling**: User scrolls during normal page use without modals or transitions → listeners should function correctly (preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When scrolling occurs during normal page use (no modals, no transitions), journey progression tracking must continue to update correctly
- When the page first loads, scroll observers must continue to initialize properly
- Visual scroll progress indicators must continue to function as designed
- Scroll-triggered animations must continue to fire at correct thresholds

**Scope:**
All scroll-related functionality that does NOT involve listener cleanup or modal/transition scenarios should be completely unaffected. This includes:
- Initial scroll observer setup on page load
- Scroll position calculation and progress tracking
- Visual feedback during scrolling
- Scroll-triggered content reveals

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Missing Modal Listener Cleanup**: When modals open, no logic pauses or removes scroll listeners

2. **No Transition Cleanup**: Page transition code doesn't call cleanup functions for scroll observers

3. **Re-initialization Without Cleanup**: Returning to page sections re-runs initialization code without removing old listeners first

4. **No Listener Reference Tracking**: Scroll listeners are anonymous functions without stored references, making removal difficult

## Correctness Properties

Property 1: Bug Condition - Scroll Listener Cleanup

_For any_ scenario where modals are opened, page transitions occur, or page sections are revisited, the fixed code SHALL pause or remove scroll event listeners during modal display, properly clean up all scroll observers during transitions, and reuse or recreate listeners without accumulation on revisits.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Normal Scroll Tracking

_For any_ scrolling that occurs during normal page use without modals or transitions, the fixed code SHALL produce exactly the same journey progression tracking behavior as the original code, preserving initialization, position calculation, and visual feedback.

**Validates: Requirements 3.1, 3.2**

## Fix Implementation

### Changes Required

**File**: `js/main.js`

**Functions**: Journey scroll tracking, modal open/close handlers, page transition listeners

**Specific Changes**:
1. **Store Listener References**: Store scroll event listener references in variables at module scope for later removal

2. **Add Modal Cleanup**: In modal open handlers, call `window.removeEventListener('scroll', journeyScrollHandler)` to pause tracking

3. **Restore on Modal Close**: In modal close handlers, re-attach listeners with `window.addEventListener('scroll', journeyScrollHandler)`

4. **Add Transition Cleanup**: In page transition code (before navigate), call cleanup function to remove all scroll observers

5. **Check Before Adding**: Before attaching scroll listeners, check if they're already attached to prevent duplicates

6. **Implement Cleanup Function**: Create `cleanupScrollListeners()` function that removes all journey scroll observers and resets state

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, monitor listener count on unfixed code during modals and transitions to observe accumulation, then verify the fix prevents leaks while preserving functionality.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate listener accumulation BEFORE implementing the fix. Count active listeners using browser devtools or instrumentation.

**Test Plan**: Use E2E harness to instrument scroll listener attachment. Open modals, transition pages, and revisit sections while counting active listeners. Run these tests on the UNFIXED code to observe listener accumulation and redundant calculations.

**Test Cases**:
1. **Modal Listener Leak**: Count listeners, open modal, verify listeners remain active (will fail on unfixed code)
2. **Transition Cleanup Missing**: Count listeners, trigger page transition, verify observers not removed (will fail on unfixed code)
3. **Duplicate on Revisit**: Scroll through journey, return to top, scroll again, count duplicate listeners (will fail on unfixed code)
4. **Performance Degradation**: Open/close modals 10 times, measure scroll event frequency increase (will show degradation on unfixed code)

**Expected Counterexamples**:
- Listener count increases with each modal open
- Listener count increases with each page transition
- Scroll event fires multiple times per frame due to duplicates
- Possible causes: missing removeEventListener calls, no cleanup on transition

### Fix Checking

**Goal**: Verify that for all scenarios where listeners accumulate, the fixed code prevents leaks.

**Pseudocode:**
```
FOR ALL scenario WHERE isBugCondition(scenario) DO
  result := executeScenario_fixed(scenario)
  ASSERT result.listenerCount == expectedCount
  ASSERT result.noLeaksDetected == true
END FOR
```

### Preservation Checking

**Goal**: Verify that for normal scrolling without modals or transitions, behavior is unchanged.

**Pseudocode:**
```
FOR ALL scrollEvent WHERE normalPageUse(scrollEvent) DO
  ASSERT handleScroll_original(scrollEvent) = handleScroll_fixed(scrollEvent)
END FOR
```

**Testing Approach**: Property-based testing is recommended because it can generate many scroll scenarios and verify consistent tracking behavior while preventing leaks.

**Test Plan**: Observe scroll progression on UNFIXED code first during normal use, recording progress updates and visual feedback, then write tests verifying the fixed code maintains that tracking behavior.

**Test Cases**:
1. **Normal Scroll Preservation**: Scroll through journey normally, verify progression updates correctly
2. **Initial Load Preservation**: Verify scroll observers initialize properly on page load
3. **Visual Feedback Preservation**: Scroll and verify progress indicators update as before
4. **Animation Trigger Preservation**: Scroll to trigger content reveals, verify timing unchanged

### Unit Tests

- Test listener reference storage and removal logic
- Test modal open removes listeners
- Test modal close restores listeners
- Test page transition calls cleanup function
- Test duplicate prevention logic

### Property-Based Tests

- Generate random sequences of modal opens/closes and verify listener count remains stable
- Generate random page transitions and verify no listeners accumulate
- Test scroll tracking accuracy remains consistent across scenarios

### Integration Tests

- Test full user journey: scroll → open modal → close modal → scroll → verify no leaks
- Test multiple page transitions and verify clean state on each page
- Test rapid modal toggling and verify no performance degradation
- Test section revisits and verify single listener per tracked element

---

## Bug 7: Wanted Poster Bounty Click Handler Function Name Error

### Bug Condition

The `playCoinAudio()` and `playChopperChime()` functions call `getAudioCtx()` which does not exist. The correct function name is `getAudioContext()`. This causes a ReferenceError when the bounty is clicked or when Chopper animations are triggered.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type FunctionCall
  OUTPUT: boolean
  
  RETURN input.functionName IN ['playCoinAudio', 'playChopperChime']
         AND input.callsFunction == 'getAudioCtx'
         AND NOT functionExists('getAudioCtx')
END FUNCTION
```

### Examples

- **Wanted poster bounty click**: User clicks bounty display → `playCoinAudio()` calls `getAudioCtx()` → ReferenceError thrown
- **Chopper animation**: User clicks Chopper element → `playChopperChime()` calls `getAudioCtx()` → ReferenceError thrown
- **Achievement unlock**: User unlocks achievement → `playCoinAudio()` called → ReferenceError breaks audio
- **Edge case - Other audio functions**: `playPenScratch()` and `playPaperRustle()` correctly call `getAudioContext()` (should be preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When other audio functions call `getAudioContext()` correctly, they must continue to work as expected
- When the audio context is initialized, the oscillator and gain nodes must continue to be created properly
- Audio synthesis parameters and timing must remain unchanged
- Sound preference toggling must continue to function

**Scope:**
All audio functionality that does NOT involve the incorrect function name should be completely unaffected. This includes:
- `playPenScratch()` and `playPaperRustle()` which already use correct function name
- AudioContext creation and configuration
- Audio buffer synthesis
- Sound preference checks

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Typo/Copy-Paste Error**: `getAudioCtx()` was likely typed as a shortened version during code duplication

2. **Inconsistent Naming**: Some functions use the full name `getAudioContext()` while others use abbreviated incorrect name

3. **Missing Function Definition**: No `getAudioCtx()` function is defined anywhere in the codebase

4. **Late Addition**: `playCoinAudio()` and `playChopperChime()` may have been added after initial implementation and used wrong name

## Correctness Properties

Property 1: Bug Condition - Correct Function Name

_For any_ call to `playCoinAudio()` or `playChopperChime()` where audio context is needed, the fixed functions SHALL call the correctly defined function name `getAudioContext()` without throwing ReferenceError.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Existing Audio Functions

_For any_ audio function that already correctly calls `getAudioContext()` (such as `playPenScratch()` and `playPaperRustle()`), the fixed code SHALL produce exactly the same behavior as the original code, preserving function calls and audio context handling.

**Validates: Requirements 3.1, 3.2**

## Fix Implementation

### Changes Required

**File**: `js/main.js`

**Functions**: `playCoinAudio`, `playChopperChime`

**Specific Changes**:
1. **Find and Replace**: In `playCoinAudio()`, replace `const ctx = getAudioCtx();` with `const ctx = getAudioContext();`

2. **Find and Replace**: In `playChopperChime()`, replace `const ctx = getAudioCtx();` with `const ctx = getAudioContext();`

3. **Verify All Calls**: Search codebase for any other instances of `getAudioCtx()` and replace with `getAudioContext()`

4. **No Logic Changes**: Keep all other logic in both functions exactly as is (oscillator creation, gain, timing)

5. **Test Error Cleared**: Verify ReferenceError no longer thrown

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, trigger bounty clicks and Chopper animations on unfixed code to observe ReferenceError, then verify the fix allows audio to play successfully.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the ReferenceError BEFORE implementing the fix. Capture error stack traces.

**Test Plan**: Use E2E harness to click wanted poster bounty and Chopper elements with error listeners attached. Verify ReferenceError is thrown with message containing "getAudioCtx is not defined". Run these tests on the UNFIXED code to observe the error.

**Test Cases**:
1. **Bounty Click Error**: Click wanted poster bounty, verify ReferenceError thrown (will fail on unfixed code)
2. **Chopper Click Error**: Click Chopper animation, verify ReferenceError thrown (will fail on unfixed code)
3. **Achievement Unlock Error**: Trigger achievement unlock calling playCoinAudio, verify error (will fail on unfixed code)
4. **Error Message Verification**: Verify error message specifically mentions "getAudioCtx" (will show on unfixed code)

**Expected Counterexamples**:
- `ReferenceError: getAudioCtx is not defined`
- Audio completely fails to play
- Console errors break audio functionality
- Possible causes: typo in function name, function not defined

### Fix Checking

**Goal**: Verify that for all calls to playCoinAudio and playChopperChime, the fixed functions call the correct function name.

**Pseudocode:**
```
FOR ALL audioCall WHERE isBugCondition(audioCall) DO
  result := audioFunction_fixed(audioCall)
  ASSERT result.calledFunction == 'getAudioContext'
  ASSERT NOT result.threwReferenceError
END FOR
```

### Preservation Checking

**Goal**: Verify that for audio functions already using correct name, behavior is unchanged.

**Pseudocode:**
```
FOR ALL audioFunction WHERE usesCorrectName(audioFunction) DO
  ASSERT audioFunction_original() = audioFunction_fixed()
END FOR
```

**Testing Approach**: Property-based testing is recommended because it can trigger many audio events across different functions and verify consistent naming.

**Test Plan**: Observe audio behavior on UNFIXED code first for functions that work correctly (playPenScratch, playPaperRustle), then write tests verifying those continue to work identically after the fix.

**Test Cases**:
1. **Pen Scratch Preservation**: Trigger playPenScratch, verify calls getAudioContext correctly as before
2. **Paper Rustle Preservation**: Trigger playPaperRustle, verify calls getAudioContext correctly as before
3. **Audio Parameters Preservation**: Verify oscillator frequency, gain, and timing remain unchanged
4. **Sound Preference Preservation**: Verify sound disable still skips all audio functions

### Unit Tests

- Test playCoinAudio calls getAudioContext (not getAudioCtx)
- Test playChopperChime calls getAudioContext (not getAudioCtx)
- Test no ReferenceError thrown when functions execute
- Test audio oscillator and gain nodes created successfully

### Property-Based Tests

- Generate random audio triggers across all functions and verify no ReferenceError
- Generate random sequences of bounty clicks and verify audio plays consistently
- Test that all audio functions use consistent naming

### Integration Tests

- Test full wanted poster interaction: click bounty → audio plays without error
- Test Chopper animation sequence: click Chopper → chime plays successfully
- Test achievement unlock flow: pin achievement → coin audio plays
- Test treasure chest bounty boost: bounty increases → coin audio plays

---

## Bug 8: Theme Persistence Race Condition

### Bug Condition

The theme is loaded from localStorage and applied synchronously on page load, but page animations may start before theme CSS variables are fully computed. This causes brief visual flashing of wrong colors as CSS variables are computed and applied.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type PageLoadState
  OUTPUT: boolean
  
  RETURN input.themeLoadedFrom == 'localStorage'
         AND input.themeApplied == 'synchronous'
         AND input.cssVariablesComputedBefore == 'animations'
         AND input.colorFlashingOccurs == true
END FUNCTION
```

### Examples

- **Saved sepia theme**: User has sepia theme saved → page loads → brief flash of parchment colors before sepia applies
- **Saved blueprint theme**: User has blueprint theme saved → page animations start → CSS variables still computing, wrong colors show
- **Fast navigation**: User quickly navigates between pages → theme attribute set but variables not ready → flash occurs
- **Edge case - Default theme**: No saved theme, using default parchment → should load without flash (preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When users manually change themes using the theme menu, the transition must continue to occur smoothly
- When no saved theme exists, the default "parchment" theme must continue to be applied
- Theme menu interaction and animation must continue to function correctly
- localStorage saving on theme change must continue to work

**Scope:**
All theme functionality that does NOT involve initial page load race condition should be completely unaffected. This includes:
- Manual theme switching via theme menu
- Theme menu open/close animation
- localStorage persistence on user change
- Default theme fallback logic

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Synchronous Application**: Theme attribute is set on `documentElement` synchronously, but browser hasn't computed CSS variables before paint

2. **Animation Timing**: Page entrance animations start immediately while theme CSS is still processing

3. **No Pre-Render Block**: No blocking mechanism ensures theme is applied before first paint

4. **CSS Variable Cascade Delay**: CSS custom properties take time to cascade and compute, causing brief default values to show

## Correctness Properties

Property 1: Bug Condition - Pre-Paint Theme Application

_For any_ page load where a theme is loaded from localStorage, the fixed code SHALL apply the theme before any page animations begin by ensuring CSS variable computation completes before the first paint, eliminating color flashing during initialization.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Manual Theme Changes

_For any_ theme change that is triggered manually by the user using the theme menu, the fixed code SHALL produce exactly the same smooth transition behavior as the original code, preserving menu interactions, localStorage saving, and default theme fallback.

**Validates: Requirements 3.1, 3.2**

## Fix Implementation

### Changes Required

**File**: `js/main.js`

**Location**: Theme initialization code (around line 485)

**Specific Changes**:
1. **Move to Document Head**: Move theme loading and application logic to a blocking inline script in `<head>` before any CSS or body content

2. **Add Pre-Render Class**: Add a class like `theme-loading` to html element initially, remove after theme applied

3. **Force Style Computation**: After setting theme attribute, force browser to compute styles with `getComputedStyle(document.documentElement).getPropertyValue('--paper')`

4. **Delay Animation Start**: Only start page entrance animations after confirming theme CSS variables are ready

5. **Keep localStorage Read**: Maintain the localStorage read and fallback logic exactly as is

**Alternative Approach**: If inline script is not feasible, use CSS to set default theme immediately and override with JavaScript, ensuring no flash.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, observe color flashing on page load with saved themes on unfixed code, then verify the fix eliminates flashing while preserving manual theme changes.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate color flashing BEFORE implementing the fix. Capture screenshots during page load.

**Test Plan**: Use E2E harness to set different themes in localStorage, then reload page and capture screenshots at various millisecond intervals during load. Compare colors to detect flash. Run these tests on the UNFIXED code to observe flashing.

**Test Cases**:
1. **Sepia Theme Flash**: Save sepia theme, reload page, capture colors during first 100ms (will show flash on unfixed code)
2. **Blueprint Theme Flash**: Save blueprint theme, reload, verify parchment colors briefly show (will show flash on unfixed code)
3. **Botanical Theme Flash**: Save botanical theme, reload, check for color mismatch during load (will show flash on unfixed code)
4. **Animation Timing**: Measure when page animations start vs when CSS variables are ready (will show race condition on unfixed code)

**Expected Counterexamples**:
- Screenshots show parchment colors for first few frames even with different theme saved
- CSS variable queries return parchment values before switching to saved theme
- Possible causes: synchronous application, CSS cascade delay, animation starts too early

### Fix Checking

**Goal**: Verify that for all page loads with saved themes, the fixed code eliminates flashing.

**Pseudocode:**
```
FOR ALL pageLoad WHERE isBugCondition(pageLoad) DO
  result := loadPage_fixed(pageLoad)
  ASSERT result.noColorFlash == true
  ASSERT result.cssVariablesReadyBeforeAnimations == true
END FOR
```

### Preservation Checking

**Goal**: Verify that for manual theme changes via menu, behavior is unchanged.

**Pseudocode:**
```
FOR ALL themeChange WHERE userInitiated(themeChange) DO
  ASSERT changeTheme_original(themeChange) = changeTheme_fixed(themeChange)
END FOR
```

**Testing Approach**: Property-based testing is recommended because it can generate many theme combinations and test loading/changing scenarios comprehensively.

**Test Plan**: Observe manual theme changes on UNFIXED code first, recording transition smoothness and localStorage behavior, then write tests verifying the fixed code maintains that behavior.

**Test Cases**:
1. **Manual Change Preservation**: Open theme menu, switch themes, verify smooth transition continues
2. **Default Theme Preservation**: Clear localStorage, reload, verify parchment loads without flash
3. **Menu Animation Preservation**: Open/close theme menu, verify animation timing unchanged
4. **localStorage Persistence Preservation**: Change theme, reload, verify saved theme applied correctly

### Unit Tests

- Test theme loading logic reads from localStorage correctly
- Test CSS variable computation check works
- Test pre-render class logic adds/removes correctly
- Test animation delay logic waits for theme ready

### Property-Based Tests

- Generate random theme selections and verify no flash on reload
- Generate random sequences of theme changes and page reloads, verify consistency
- Test across different browser states (cache, no cache) for flash detection

### Integration Tests

- Test full page load sequence with saved theme: no flash, correct colors immediately
- Test theme menu interaction: change theme → reload → verify persisted without flash
- Test rapid page navigation with themes: verify no flashing across transitions
- Test default theme fallback: clear storage → reload → verify smooth parchment load

---

## Bug 10: Missing Error Boundaries for localStorage Operations

### Bug Condition

The code performs localStorage operations (`getItem`, `setItem`) at multiple locations (lines 383, 473, 485, 501 and others) without try-catch error handling. In browsers with disabled storage (privacy mode, storage quotas exceeded, permissions denied), these operations throw exceptions that crash the application or break functionality.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type LocalStorageOperation
  OUTPUT: boolean
  
  RETURN input.operation IN ['getItem', 'setItem']
         AND input.key IN ['portfolio_zoro_cursor', 'portfolio_theme', 'portfolio_sound']
         AND (input.storageDisabled == true OR input.privacyMode == true OR input.quotaExceeded == true)
         AND NOT input.wrappedInTryCatch
END FUNCTION
```

### Examples

- **Privacy mode cursor**: Browser in privacy mode → `localStorage.getItem("portfolio_zoro_cursor")` throws → application crashes
- **Disabled storage theme**: Storage disabled in settings → `localStorage.setItem("portfolio_theme", value)` throws → theme cannot be saved
- **Quota exceeded sound**: localStorage quota full → `localStorage.setItem("portfolio_sound", value)` throws QuotaExceededError → sound preference fails to save
- **Edge case - Existing error handling**: Pin and achievement operations already wrapped in try-catch → continue working correctly (preserved)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When localStorage is available and working, preferences must continue to persist across sessions
- When localStorage operations for user pins and achievements (already wrapped in try-catch) occur, they must continue to function correctly
- When the live viewer tracker uses localStorage with existing error handling, it must continue to work as designed
- localStorage key names and value formats must remain unchanged

**Scope:**
All localStorage operations that already have error handling should be completely unaffected. This includes:
- Session tracking operations in live viewer tracker (already has try-catch)
- User pin operations (already has error handling)
- Achievement unlock operations (already has error handling)
- Wanted photo upload operations (already has error handling)

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Inconsistent Error Handling**: Some localStorage operations are wrapped in try-catch (pins, achievements) while others are not (cursor, theme, sound)

2. **Privacy Mode Assumptions**: Code assumes localStorage is always available without checking

3. **No QuotaExceededError Handling**: setItem operations don't handle storage quota limits

4. **Missing Fallback Logic**: No in-memory state fallback when localStorage fails

## Correctness Properties

Property 1: Bug Condition - localStorage Error Boundaries

_For any_ localStorage operation for cursor state, theme preferences, or sound preferences where storage is disabled, privacy mode is active, or quota is exceeded, the fixed code SHALL wrap all getItem calls in try-catch returning default values on failure, wrap all setItem calls in try-catch handling QuotaExceededError gracefully, and allow the application to continue functioning with in-memory state.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Working localStorage

_For any_ localStorage operation where storage is available and working, the fixed code SHALL produce exactly the same persistence behavior as the original code, preserving cross-session preference storage and maintaining existing error-handled operations unchanged.

**Validates: Requirements 3.1, 3.2, 3.3**

## Fix Implementation

### Changes Required

**File**: `js/main.js`

**Locations**: Lines 383 (sound getItem), 473 (sound setItem), 485 (theme getItem), 501 (theme setItem), cursor toggle handler

**Specific Changes**:
1. **Wrap Cursor getItem**: Wrap `localStorage.getItem("portfolio_zoro_cursor")` in try-catch, return "enabled" as default on error

2. **Wrap Cursor setItem**: Wrap `localStorage.setItem("portfolio_zoro_cursor", value)` in try-catch, silently fail on error

3. **Wrap Theme getItem**: Wrap `localStorage.getItem("portfolio_theme")` in try-catch, return "parchment" as default on error

4. **Wrap Theme setItem**: Wrap `localStorage.setItem("portfolio_theme", value)` in try-catch, log warning on QuotaExceededError

5. **Wrap Sound getItem**: Wrap `localStorage.getItem("portfolio_sound")` in try-catch, return "false" as default on error

6. **Wrap Sound setItem**: Wrap `localStorage.setItem("portfolio_sound", value)` in try-catch, continue with in-memory state on error

7. **Add Helper Function**: Create `safeLocalStorage` helper object with `getItem(key, defaultValue)` and `setItem(key, value)` methods that handle errors consistently

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, mock disabled localStorage on unfixed code to observe crashes and errors, then verify the fix handles all error cases gracefully with fallbacks.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate localStorage exceptions BEFORE implementing the fix. Simulate disabled storage and quota exceeded errors.

**Test Plan**: Use E2E harness to mock localStorage methods to throw errors (SecurityError for privacy mode, QuotaExceededError for quota limits). Trigger cursor toggle, theme change, and sound preference operations. Run these tests on the UNFIXED code to observe crashes.

**Test Cases**:
1. **Privacy Mode Cursor**: Mock getItem to throw SecurityError, toggle cursor, verify crash (will fail on unfixed code)
2. **Disabled Theme Storage**: Mock setItem to throw, change theme, verify unhandled exception (will fail on unfixed code)
3. **Quota Exceeded Sound**: Mock setItem to throw QuotaExceededError, toggle sound, verify crash (will fail on unfixed code)
4. **Multiple Operations**: Disable storage, perform multiple localStorage operations, verify application breaks (will fail on unfixed code)

**Expected Counterexamples**:
- Uncaught SecurityError: localStorage.getItem is not available
- Uncaught QuotaExceededError: localStorage.setItem quota exceeded
- Application functionality completely broken
- Possible causes: no try-catch wrappers, no default value fallbacks

### Fix Checking

**Goal**: Verify that for all localStorage operations where storage fails, the fixed code handles errors gracefully.

**Pseudocode:**
```
FOR ALL operation WHERE isBugCondition(operation) DO
  result := performOperation_fixed(operation)
  ASSERT NOT result.threwException
  ASSERT result.usedFallbackValue == true
END FOR
```

### Preservation Checking

**Goal**: Verify that for localStorage operations where storage is working, behavior is unchanged.

**Pseudocode:**
```
FOR ALL operation WHERE storageAvailable(operation) DO
  ASSERT performOperation_original(operation) = performOperation_fixed(operation)
END FOR
```

**Testing Approach**: Property-based testing is recommended because it can generate many storage scenarios (available, disabled, quota exceeded) and verify consistent behavior.

**Test Plan**: Observe localStorage operations on UNFIXED code first with working storage, recording persistence behavior, then write tests verifying the fixed code maintains that behavior when storage works.

**Test Cases**:
1. **Working Storage Preservation**: With functional localStorage, toggle cursor, verify preference persists across reload
2. **Theme Persistence Preservation**: With working storage, change theme, reload, verify theme persisted
3. **Existing Error Handling Preservation**: Verify pin and achievement operations continue with existing try-catch
4. **Live Tracker Preservation**: Verify live viewer tracker continues functioning with existing error handling

### Unit Tests

- Test each localStorage operation with mocked errors returns fallback value
- Test QuotaExceededError handling logs warning but continues execution
- Test SecurityError handling returns default without crashing
- Test safeLocalStorage helper methods work correctly

### Property-Based Tests

- Generate random localStorage states (available, disabled, quota exceeded) and verify graceful handling
- Generate random sequences of preference changes and verify application never crashes
- Test that defaults are consistent across all error scenarios

### Integration Tests

- Test full user journey with disabled localStorage: cursor toggle → theme change → sound toggle, all work with in-memory state
- Test privacy mode scenario: navigate site with all localStorage throwing errors, verify functional
- Test quota exceeded scenario: fill storage, trigger setItem operations, verify graceful degradation
- Test normal storage scenario: verify all preferences persist correctly when storage works

---

## Cross-Cutting Concerns

### Performance Impact

All fixes are designed to minimize performance impact:
- Bug 1: Removes unnecessary 80ms delay, improving perceived performance
- Bug 2: AudioContext state check is negligible (<1ms)
- Bug 4: Exit code normalization has zero runtime cost
- Bug 5: CSS containment may improve layout performance by reducing reflows
- Bug 6: Listener cleanup reduces memory usage and event overhead
- Bug 7: Function name fix has zero performance impact
- Bug 8: Pre-paint theme application may add <10ms to page load but eliminates flash
- Bug 10: try-catch wrappers have negligible performance cost (<0.1ms per call)

### Backward Compatibility

All fixes maintain backward compatibility:
- No public API changes
- No breaking changes to existing event handlers
- No changes to localStorage key names or value formats
- All existing functionality preserved via comprehensive preservation testing

### Browser Compatibility

All fixes use widely supported features:
- CSS `overflow: clip` with fallback to `overflow: hidden`
- AudioContext with vendor prefixes already in place
- Standard exit codes work across platforms
- CSS containment supported in modern browsers with graceful degradation
- localStorage error handling is standard try-catch
- All testing uses Headless Chrome via CDP

### Testing Coverage

The existing E2E test suite covers:
- Tier 1: Feature Coverage (35+ assertions)
- Tier 2: Boundary & Corner Cases (35+ assertions)
- Tier 3: Cross-Feature Combinations (7+ tests)
- Tier 4: Real-World Scenarios (5+ workflows)

Each bugfix will add specific test cases to appropriate tiers to verify the fix and prevent regression.
