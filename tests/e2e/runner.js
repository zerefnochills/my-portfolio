#!/usr/bin/env node

/**
 * E2E Test Suite Runner for Portfolio Modernization
 *
 * Runs 4 tiers of comprehensive opaque-box E2E tests:
 * - Tier 1: Feature Coverage (>= 35 assertions)
 * - Tier 2: Boundary & Corner Cases (>= 35 assertions)
 * - Tier 3: Cross-Feature Combinations (>= 7 tests)
 * - Tier 4: Real-World Scenarios (>= 5 workflows)
 *
 * Usage:
 *   node tests/e2e/runner.js
 *   node tests/e2e/runner.js --tier=1
 *   node tests/e2e/runner.js --tier=1,2
 *   node tests/e2e/runner.js --tier=all
 *   node tests/e2e/runner.js --json=test_results.json
 */

const fs = require('fs');
const path = require('path');
const { TestHarness } = require('./harness');
const { runTier1 } = require('./tier1_feature_coverage');
const { runTier2 } = require('./tier2_boundary_corner');
const { runTier3 } = require('./tier3_cross_feature');
const { runTier4 } = require('./tier4_real_world');

// Parse CLI flags
const args = process.argv.slice(2);
const tierArg = args.find(a => a.startsWith('--tier='));
const jsonArg = args.find(a => a.startsWith('--json='));
const bail = args.includes('--bail');

let selectedTiers = [1, 2, 3, 4];
if (tierArg) {
  const val = tierArg.split('=')[1].toLowerCase();
  if (val !== 'all') {
    selectedTiers = val.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
  }
}

let jsonReportPath = null;
if (jsonArg) {
  jsonReportPath = path.resolve(process.cwd(), jsonArg.split('=')[1]);
}

async function main() {
  const startTime = Date.now();
  console.log('\n======================================================');
  console.log('  PORTFOLIO MODERNIZATION: AUTOMATED E2E TEST RUNNER');
  console.log('======================================================');
  console.log(`Active Tiers: [ ${selectedTiers.join(', ')} ]`);
  console.log(`Time: ${new Date().toISOString()}`);

  const harness = new TestHarness();

  // Safety process signal handlers
  const cleanup = async () => {
    try { await harness.close(); } catch (e) {}
  };
  process.on('SIGINT', async () => { await cleanup(); process.exit(130); });
  process.on('SIGTERM', async () => { await cleanup(); process.exit(143); });

  try {
    console.log('\n[1/3] Starting local HTTP static server...');
    const serverPort = await harness.startServer();
    console.log(`      Server listening on http://127.0.0.1:${serverPort}`);

    console.log('[2/3] Launching Headless Chrome via CDP...');
    await harness.launchChrome();
    console.log(`      Headless Chrome attached on CDP port ${harness.cdpPort}`);

    console.log('[3/3] Commencing E2E Test Execution...');

    if (selectedTiers.includes(1)) {
      await runTier1(harness);
      if (bail && harness.reporter.tiers[1].failed > 0) throw new Error('Bail on Tier 1 failure');
    }

    if (selectedTiers.includes(2)) {
      await runTier2(harness);
      if (bail && harness.reporter.tiers[2].failed > 0) throw new Error('Bail on Tier 2 failure');
    }

    if (selectedTiers.includes(3)) {
      await runTier3(harness);
      if (bail && harness.reporter.tiers[3].failed > 0) throw new Error('Bail on Tier 3 failure');
    }

    if (selectedTiers.includes(4)) {
      await runTier4(harness);
      if (bail && harness.reporter.tiers[4].failed > 0) throw new Error('Bail on Tier 4 failure');
    }

  } catch (err) {
    console.error('\n\x1b[31m[FATAL ERROR]\x1b[0m Test runner encountered an unhandled exception:');
    console.error(err.stack || err.message);
  } finally {
    console.log('\n[Teardown] Shutting down browser and server harness...');
    await cleanup();
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const summary = harness.reporter.summary();

  // Print Formatted Report Summary
  console.log('\n======================================================');
  console.log('             E2E TEST EXECUTION SUMMARY');
  console.log('======================================================');
  console.log(`Total Execution Time: ${durationSec}s`);
  console.log(`Total Assertions/Tests Evaluated: ${summary.totalAssertions}`);
  console.log(`\x1b[32mPassed Assertions:\x1b[0m ${summary.totalPassed}`);
  console.log(`\x1b[31mFailed Assertions:\x1b[0m ${summary.totalFailed}`);
  console.log(`Success Rate: ${summary.successRate}`);
  console.log('------------------------------------------------------');
  console.log('Tier Breakdown:');
  for (const [tId, tData] of Object.entries(summary.tiers)) {
    if (selectedTiers.includes(parseInt(tId, 10))) {
      const color = tData.failed === 0 && tData.assertions > 0 ? '\x1b[32m' : '\x1b[31m';
      console.log(`  Tier ${tId} (${tData.name}): ${color}${tData.passed}/${tData.assertions} passed (${tData.failed} failed)\x1b[0m`);
    }
  }
  console.log('======================================================\n');

  if (summary.failures.length > 0) {
    console.log('\x1b[31m[FAILURES DETECTED]\x1b[0m Breakdown of Failed Assertions:');
    summary.failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. [T${f.tier}][${f.feature}] ${f.name}`);
      if (f.details) {
        if (f.details.expected) console.log(`     Expected: ${JSON.stringify(f.details.expected)}`);
        if (f.details.actual) console.log(`     Actual:   ${JSON.stringify(f.details.actual)}`);
      }
    });
    console.log('\n');
  }

  // Export JSON report if requested
  if (jsonReportPath) {
    fs.writeFileSync(jsonReportPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`Wrote JSON report to ${jsonReportPath}`);
  }

  // Return exit code 0 if all tests passed, 1 if any failed
  if (summary.totalFailed > 0) {
    process.exit(1);
  } else {
    console.log('\x1b[32m✔ ALL E2E ASSERTIONS PASSED SUCCESSFULLY!\x1b[0m\n');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
