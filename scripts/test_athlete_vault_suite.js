const assert = require('assert');
const path = require('path');

// Mock browser environment for node
global.window = global;
global.navigator = { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0", webdriver: false };
global.document = {
  readyState: "complete",
  addEventListener: () => {}
};

// Load dependencies
require('../static/js/bundle_data.js');
require('../static/js/overseas_players_database.js');
require('../static/js/rosters_expansion_database.js');
require('../static/js/austin_ice_bats_roster.js');
require('../static/js/master_players.js');
require('../static/js/nhl_analytics_database.js');
require('../static/js/athlete_vault.js');

async function runVaultTests() {
  console.log('=== DraftLineup Athlete Data Vault & Anti-Scraping Test Suite ===\n');

  assert(window.DraftLineupVault, "DraftLineupVault must be defined");
  console.log('  ✓ Test 1: DraftLineupVault initialized');

  // Test 2: Total count
  const count = window.DraftLineupVault.getTotalCount();
  assert(count > 10000, `Total count should be > 10,000, got ${count}`);
  console.log(`  ✓ Test 2: getTotalCount returns ${count.toLocaleString()} records`);

  // Test 3: Watermark
  const wm = window.DraftLineupVault.getWatermark();
  assert(wm && wm.startsWith("DL-VLT-"), "Watermark should have DL-VLT- prefix");
  console.log(`  ✓ Test 3: Session watermark generated (${wm})`);

  // Test 4: Single Page Fetch (50 records) - Lightweight Stubs
  const page1 = await window.DraftLineupVault.fetchPage({ page: 1, pageSize: 50 });
  assert.strictEqual(page1.page, 1, "Page should be 1");
  assert.strictEqual(page1.records.length, 50, "Page 1 should have exactly 50 records");
  assert(page1.totalRecords > 10000, "Total records should match vault");
  assert(page1.records[0]._vw, "Records must carry watermark token");
  // CRITICAL ANTI-SCRAPING CHECK: Public directory rows must NOT expose raw telemetry blobs
  assert.strictEqual(page1.records[0].telemetry, undefined, "Directory rows must not expose raw telemetry blobs");
  assert.strictEqual(page1.records[0].audit_ledger, undefined, "Directory rows must not expose audit ledger blocks");
  console.log('  ✓ Test 4: fetchPage returns exactly 50 windowed lightweight stubs without exposing raw telemetry blobs');

  // Test 5: Page 2 is distinct
  const page2 = await window.DraftLineupVault.fetchPage({ page: 2, pageSize: 50 });
  assert.strictEqual(page2.page, 2, "Page should be 2");
  assert.strictEqual(page2.records.length, 50, "Page 2 should have 50 records");
  assert.notStrictEqual(page1.records[0].id, page2.records[0].id, "Page 1 and Page 2 first records must be distinct");
  console.log('  ✓ Test 5: Pagination works smoothly across distinct windows');

  // Test 6: Text filtering
  const searchResult = await window.DraftLineupVault.fetchPage({ page: 1, pageSize: 50, filters: { q: "Michigan" } });
  assert(searchResult.records.length > 0, "Should find Michigan athletes");
  assert(searchResult.records.every(r => {
    const q = "michigan";
    return (r.team && r.team.toLowerCase().includes(q)) ||
           (r.name && r.name.toLowerCase().includes(q)) ||
           (r.institution && r.institution.toLowerCase().includes(q)) ||
           (r.hometown && r.hometown.toLowerCase().includes(q)) ||
           (r.previous_team && r.previous_team.toLowerCase().includes(q));
  }), "All results must match query across indexed fields");
  console.log(`  ✓ Test 6: Filter query matches correctly (${searchResult.totalRecords} found)`);

  // Test 7: Individual athlete stub lookup
  const athlete = window.DraftLineupVault.getAthleteById("mp_0013");
  assert(athlete, "Athlete mp_0013 should exist");
  assert.strictEqual(athlete.name, "Michael Hage", "mp_0013 should be Michael Hage");
  console.log('  ✓ Test 7: getAthleteById safely resolves single record');

  // Test 8: Institution roster lookup
  const denverRoster = window.DraftLineupVault.getAthletesByInstitution("Denver");
  assert(denverRoster.length > 0, "Denver roster should have athletes");
  console.log(`  ✓ Test 8: getAthletesByInstitution resolves school roster (${denverRoster.length} athletes)`);

  // Test 9: Proof-of-Work Challenge Generation, Solving, & Verification
  console.log('  Testing Proof-of-Work (PoW) SHA-256 micro-challenge...');
  const challenge = window.DraftLineupVault.generatePoWChallenge("mp_0013");
  assert(challenge.challengeId.startsWith("DL-POW-"), "Challenge ID must have DL-POW- prefix");
  assert.strictEqual(challenge.athleteId, "mp_0013", "Challenge must bind to athlete ID");

  const proof = window.DraftLineupVault.solvePoWChallenge(challenge);
  assert(proof.hash.startsWith("0000"), "PoW solution hash must satisfy difficulty prefix");
  assert(typeof proof.nonce === "number" && proof.nonce >= 0, "Nonce must be a non-negative number");

  const isValidProof = window.DraftLineupVault.verifyPoWProof(challenge, proof, "mp_0013");
  assert(isValidProof, "Proof verification must succeed for valid solution");

  const isInvalidProof = window.DraftLineupVault.verifyPoWProof(challenge, { ...proof, nonce: proof.nonce + 999 }, "mp_0013");
  assert(!isInvalidProof, "Proof verification must fail for forged nonce");
  console.log(`  ✓ Test 9: PoW challenge generated, solved in ${proof.durationMs}ms (nonce=${proof.nonce}), and cryptographically verified`);

  // Test 10: Strictly One-Player-At-A-Time Full Dossier Resolution
  console.log('  Testing strictly one-player-at-a-time dossier resolution...');
  const dossier = await window.DraftLineupVault.resolveAthleteDossier("mp_0013", { challenge, proof });
  assert(dossier, "Dossier must be returned");
  assert.strictEqual(dossier.id, "mp_0013", "Resolved dossier must match ID");
  assert.strictEqual(dossier.name, "Michael Hage", "Resolved dossier name must match");
  assert(dossier.telemetry, "Resolved dossier must include rich telemetry");
  assert(dossier.combine, "Resolved dossier must include combine metrics");
  assert(dossier.micro_kpis, "Resolved dossier must include micro-KPIs");
  assert(dossier._dossierToken.startsWith("DL-DOSSIER-"), "Dossier must carry cryptographic token");
  assert(dossier._sessionWatermark.startsWith("DL-VLT-"), "Dossier must carry session watermark");
  assert.strictEqual(dossier._proofNonce, proof.nonce, "Dossier must record proof nonce");
  console.log(`  ✓ Test 10: resolveAthleteDossier returns rich single dossier with watermark ${dossier._dossierToken}`);

  // Test 11: Concurrent Scraping Extraction Denial (Hardware Queue Trips on Parallel Bursts)
  console.log('  Testing concurrent multi-player extraction denial (Promise.all scraper block)...');
  await new Promise(r => setTimeout(r, 1300)); // Cooldown from previous single-athlete resolution
  let concurrentDenied = false;
  try {
    // Fire two resolutions simultaneously to simulate automated bulk harvester
    const p1 = window.DraftLineupVault.resolveAthleteDossier("mp_0001");
    const p2 = window.DraftLineupVault.resolveAthleteDossier("mp_0002");
    await Promise.all([p1, p2]);
  } catch (err) {
    if (err.message.includes("429") || err.message.includes("concurrent") || err.message.includes("paced") || err.message.includes("Rate limit")) {
      concurrentDenied = true;
      console.log(`  ✓ Test 11: Automated concurrent harvesting blocked: "${err.message}"`);
    }
  }
  assert(concurrentDenied, "Vault must reject concurrent bulk scraping attempts with 429 denial");

  // Test 12: Decoy Canary Honeypot Trap & Scraper Poisoning
  console.log('  Testing canary honeypot trap and scraper data poisoning...');
  const honeypotId = window.DraftLineupVault.getHoneypotId();
  assert.strictEqual(honeypotId, "dl_canary_honeytoken_77", "Canary honeypot ID must match");

  const poisonedResult = await window.DraftLineupVault.resolveAthleteDossier(honeypotId);
  assert(poisonedResult._poisoned, "Honeypot payload must be flagged as poisoned");
  assert.strictEqual(poisonedResult.composite_score, -1.0, "Poisoned record must carry decoy score");
  assert(window.DraftLineupVault.isSessionPoisoned(), "Vault session must enter permanently poisoned mode");

  // Subsequent requests from this session must also receive poisoned decoy metrics
  const poisonedSubsequent = await window.DraftLineupVault.resolveAthleteDossier("mp_0013");
  assert(poisonedSubsequent._poisoned, "Subsequent queries must remain contaminated with decoy data");
  console.log(`  ✓ Test 12: Honeypot tripped! Session poisoned: decoy telemetry injected into scraper stream`);

  console.log('\n🎉 SUCCESS: All 12 Vault, PoW, Pacing Queue, and Anti-Scraping tests passed with 100% accuracy!');
}

runVaultTests().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
