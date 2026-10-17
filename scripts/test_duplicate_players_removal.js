const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('🧪 DRAFTLINEUP DEDUPLICATION & SINGLE PROFILE AUDIT');
console.log('====================================================\n');

// 1. Setup Sandbox simulating browser DOM and script load order
const sandbox = {
  window: {},
  global: {},
  document: {
    addEventListener: () => {},
    getElementById: () => null
  },
  console: console
};
sandbox.window = sandbox;
sandbox.global = sandbox;
vm.createContext(sandbox);

// Load in real page sequence
const scriptsToLoad = [
  'bundle_data.js',
  'overseas_players_database.js',
  'rosters_expansion_database.js',
  'austin_ice_bats_roster.js',
  'master_players.js',
  'nhl_analytics_database.js'
];

for (const s of scriptsToLoad) {
  const p = path.join(ROOT, 'static', 'js', s);
  console.log(`Loading static/js/${s}...`);
  vm.runInContext(fs.readFileSync(p, 'utf8'), sandbox);
}

console.log('\n--- 1. MASTER_PLAYERS DEDUPLICATION CHECK ---');
const masterPlayers = sandbox.MASTER_PLAYERS || [];
console.log(`Total Master Players: ${masterPlayers.length.toLocaleString()}`);

const nameCounts = new Map();
masterPlayers.forEach(p => {
  const norm = (p.name || '').trim().toLowerCase();
  nameCounts.set(norm, (nameCounts.get(norm) || 0) + 1);
});

let duplicateProfiles = 0;
const duplicateNamesList = [];
nameCounts.forEach((cnt, name) => {
  if (cnt > 1) {
    duplicateProfiles += (cnt - 1);
    duplicateNamesList.push({ name, count: cnt });
  }
});

console.log(`Duplicate Profiles in MASTER_PLAYERS: ${duplicateProfiles}`);
if (duplicateProfiles > 0) {
  console.error('FAIL: Found duplicate player names in MASTER_PLAYERS:', duplicateNamesList.slice(0, 10));
  process.exit(1);
} else {
  console.log('✅ PASS: Exactly ZERO duplicate player names exist in MASTER_PLAYERS!');
}

console.log('\n--- 2. ROSTER EXPANSIONS INTERNAL DEDUPLICATION CHECK ---');
const expPlayers = sandbox.DRAFTLINEUP_ROSTER_EXPANSIONS || [];
console.log(`Total Expansion Players: ${expPlayers.length.toLocaleString()}`);
const expNameCounts = new Map();
let expDups = 0;
expPlayers.forEach(p => {
  const norm = (p.name || '').trim().toLowerCase();
  if (expNameCounts.has(norm)) expDups++;
  expNameCounts.set(norm, (expNameCounts.get(norm) || 0) + 1);
});
console.log(`Duplicate Profiles in DRAFTLINEUP_ROSTER_EXPANSIONS: ${expDups}`);
if (expDups > 0) {
  console.error('FAIL: Found duplicate names in expansion dataset!');
  process.exit(1);
} else {
  console.log('✅ PASS: Exactly ZERO duplicate player names exist in DRAFTLINEUP_ROSTER_EXPANSIONS!');
}

console.log('\n--- 3. DATABASE.HTML RUNTIME ATHLETES DEDUPLICATION CHECK ---');
let dbAthletes = [...sandbox.MASTER_ALL_REGISTRY];
if (sandbox.DraftLineupDeduplicator && typeof sandbox.DraftLineupDeduplicator.deduplicate === 'function') {
  dbAthletes = sandbox.DraftLineupDeduplicator.deduplicate(dbAthletes.concat(sandbox.DraftLineupNHL.getAllAthletes()));
}
console.log(`Total Personnel in database.html simulation: ${dbAthletes.length.toLocaleString()}`);

const dbPlayerCounts = new Map();
let dbDups = 0;
dbAthletes.forEach(p => {
  if (p.entity_type === 'player' || !p.entity_type) {
    const norm = (p.name || '').trim().toLowerCase();
    if (dbPlayerCounts.has(norm)) dbDups++;
    dbPlayerCounts.set(norm, (dbPlayerCounts.get(norm) || 0) + 1);
  }
});
console.log(`Duplicate Player Profiles in database.html: ${dbDups}`);
if (dbDups > 0) {
  console.error('FAIL: Found duplicate player profiles in database.html!');
  process.exit(1);
} else {
  console.log('✅ PASS: Exactly ZERO duplicate player profiles in database.html!');
}

console.log('\n--- 4. CANONICAL PROFILE MERGE ACCURACY VERIFICATION ---');
const testCases = [
  { name: 'Isaac Howard', expectedTeam: 'Edmonton Oilers', expectedLeague: 'NHL', expectedPrior: 'Michigan State University' },
  { name: 'Sam Rinzel', expectedTeam: 'Chicago Blackhawks', expectedLeague: 'NHL', expectedPrior: 'University of Minnesota' },
  { name: 'Oliver Moore', expectedTeam: 'Chicago Blackhawks', expectedLeague: 'NHL', expectedPrior: 'University of Minnesota' },
  { name: 'Zeev Buium', expectedTeam: 'Vancouver Canucks', expectedLeague: 'NHL', expectedPrior: 'University of Denver' },
  { name: 'Guhnar Hillman', expectedTeam: 'Austin Ice Bats', expectedLeague: 'NA3HL', expectedPrior: '' }
];

testCases.forEach(tc => {
  const matches = masterPlayers.filter(p => p.name.toLowerCase() === tc.name.toLowerCase());
  if (matches.length !== 1) {
    console.error(`FAIL: ${tc.name} has ${matches.length} profiles (expected exactly 1)!`);
    process.exit(1);
  }
  const athlete = matches[0];
  console.log(`Athlete: ${athlete.name}`);
  console.log(`  - Single ID: ${athlete.id}`);
  console.log(`  - Team: ${athlete.team}`);
  console.log(`  - League: ${athlete.league}`);
  console.log(`  - Draft Status: ${athlete.draft_status}`);
  console.log(`  - Career History: ${athlete.previous_team}`);
  console.log(`  - Alternate IDs Mapped: ${JSON.stringify(athlete.all_ids || [athlete.id])}`);
  
  if (!athlete.team.includes(tc.expectedTeam)) {
    console.error(`FAIL: ${tc.name} team expected to include '${tc.expectedTeam}', got '${athlete.team}'`);
    process.exit(1);
  }
  if (tc.expectedPrior && (!athlete.previous_team || !athlete.previous_team.includes(tc.expectedPrior))) {
    console.error(`FAIL: ${tc.name} previous_team expected to include '${tc.expectedPrior}', got '${athlete.previous_team}'`);
    process.exit(1);
  }
  console.log(`  ✓ Verification passed for ${athlete.name}\n`);
});

console.log('====================================================');
console.log('🎉 AUDIT RESULT: 100% COMPLIANT - ZERO DUPLICATES');
console.log('Every athlete has strictly ONE single unified profile!');
console.log('====================================================');
