const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'static', 'js', 'master_players.js');
let content = fs.readFileSync(filePath, 'utf8');

const target = `  if (expansions.length > 0) COMBINED_PLAYERS = COMBINED_PLAYERS.concat(expansions);`;

const replacement = `  if (expansions.length > 0) COMBINED_PLAYERS = COMBINED_PLAYERS.concat(expansions);
  const iceBats = (typeof window !== 'undefined' && window.AUSTIN_ICE_BATS && window.AUSTIN_ICE_BATS.players) || 
                  (typeof global !== 'undefined' && global.AUSTIN_ICE_BATS && global.AUSTIN_ICE_BATS.players) || [];
  const iceBatsCoaches = (typeof window !== 'undefined' && window.AUSTIN_ICE_BATS && window.AUSTIN_ICE_BATS.coaches) || 
                         (typeof global !== 'undefined' && global.AUSTIN_ICE_BATS && global.AUSTIN_ICE_BATS.coaches) || [];
  if (iceBats.length > 0) {
    const existingIds = new Set(COMBINED_PLAYERS.map(p => p.id));
    iceBats.forEach(p => {
      if (!existingIds.has(p.id)) {
        COMBINED_PLAYERS.push(p);
        existingIds.add(p.id);
      }
    });
  }
  let COMBINED_STAFF = SMRP_STAFF;
  if (iceBatsCoaches.length > 0) {
    const existingStaffIds = new Set(COMBINED_STAFF.map(c => c.id));
    iceBatsCoaches.forEach(c => {
      if (!existingStaffIds.has(c.id)) {
        COMBINED_STAFF.push(c);
        existingStaffIds.add(c.id);
      }
    });
  }`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  content = content.replace(
    'const SMRP_ALL_REGISTRY = COMBINED_PLAYERS.concat(SMRP_STAFF);',
    'const SMRP_ALL_REGISTRY = COMBINED_PLAYERS.concat(COMBINED_STAFF);'
  );
  content = content.replace(
    'root.MASTER_STAFF = SMRP_STAFF;',
    'root.MASTER_STAFF = COMBINED_STAFF;'
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Successfully updated master_players.js with Austin Ice Bats');
} else {
  console.warn('Target chunk not found in master_players.js');
}
