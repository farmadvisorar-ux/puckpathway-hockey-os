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

  // Test 4: Single Page Fetch (50 records)
  const page1 = await window.DraftLineupVault.fetchPage({ page: 1, pageSize: 50 });
  assert.strictEqual(page1.page, 1, "Page should be 1");
  assert.strictEqual(page1.records.length, 50, "Page 1 should have exactly 50 records");
  assert(page1.totalRecords > 10000, "Total records should match vault");
  assert(page1.records[0]._vw, "Records must carry watermark token");
  console.log('  ✓ Test 4: fetchPage returns exactly 50 windowed records with watermark');

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

  // Test 7: Individual athlete lookup
  const athlete = window.DraftLineupVault.getAthleteById("mp_0013");
  assert(athlete, "Athlete mp_0013 should exist");
  assert.strictEqual(athlete.name, "Michael Hage", "mp_0013 should be Michael Hage");
  console.log('  ✓ Test 7: getAthleteById safely resolves single record');

  // Test 8: Institution roster lookup
  const denverRoster = window.DraftLineupVault.getAthletesByInstitution("Denver");
  assert(denverRoster.length > 0, "Denver roster should have athletes");
  console.log(`  ✓ Test 8: getAthletesByInstitution resolves school roster (${denverRoster.length} athletes)`);

  // Test 9: Anti-scraping rate limiter tripwire
  console.log('  Testing anti-scraping rate-limit tripwire with rapid automated queries...');
  let rateLimitHit = false;
  for (let i = 0; i < 10; i++) {
    try {
      await window.DraftLineupVault.fetchPage({ page: i + 1, pageSize: 50 });
    } catch (err) {
      if (err.message.includes("Rate limit") || err.message.includes("Anti-scraping") || err.message.includes("restricted")) {
        rateLimitHit = true;
        console.log(`  ✓ Test 9: Rapid automated scraping blocked at query ${i + 1}: "${err.message}"`);
        break;
      }
    }
  }
  assert(rateLimitHit, "Rate limiter must trip upon high-frequency requests");

  console.log('\n🎉 SUCCESS: All 9 Vault & Anti-Scraping tests passed with 100% accuracy!');
}

runVaultTests().catch(err => {
  console.error("Test failure:", err);
  process.exit(1);
});
