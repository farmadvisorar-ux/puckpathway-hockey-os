const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Update database.html
const dbPath = path.join(rootDir, 'database.html');
let dbContent = fs.readFileSync(dbPath, 'utf8');

// Badge count
dbContent = dbContent.replace(
  'id="badgeOverseasCount">61 Teams</span>',
  'id="badgeOverseasCount">118 Teams</span>'
);

// Search placeholder
dbContent = dbContent.replace(
  'placeholder="🔍 Search 61 overseas pro clubs, cities, arenas, leagues..."',
  'placeholder="🔍 Search 118 overseas pro clubs, cities, arenas, leagues..."'
);

// All Overseas Leagues select label
dbContent = dbContent.replace(
  '<option value="ALL">All Overseas Leagues (61 Teams)</option>',
  '<option value="ALL">All Overseas Leagues (118 Teams)</option>'
);

// Add missing overseas leagues to overseasDbLeagueFilter
const oldOverseasFilterRegex = /<option value="Extraliga">🇨🇿 Czechia - Extraliga \(Tier 1\)<\/option>/;
const newOverseasFilterAdditions = `<option value="Mestis">🇫🇮 Finland - Mestis (Tier 2)</option>
              <option value="Extraliga">🇨🇿 Czechia - Tipsport Extraliga (Tier 1)</option>
              <option value="ICEHL">🇦🇹/🇮🇹/🇭🇺 Austria - ICEHL (Tier 1)</option>
              <option value="EliteHockey">🇳🇴 Norway - EliteHockey (Tier 1)</option>`;

if (!dbContent.includes('value="ICEHL"')) {
  dbContent = dbContent.replace(oldOverseasFilterRegex, newOverseasFilterAdditions);
}

if (!dbContent.includes('value="KHL"')) {
  dbContent = dbContent.replace(
    '<option value="AIHL">🇦🇺 Australia - AIHL</option>',
    `<option value="AIHL">🇦🇺 Australia - AIHL</option>\n              <option value="KHL">🇷🇺 Europe/KHL Pro</option>`
  );
}

// Result count label
dbContent = dbContent.replace(
  'id="overseasDbResultCountLabel">Showing 61 Overseas Clubs</span>',
  'id="overseasDbResultCountLabel">Showing 118 Overseas Clubs</span>'
);

// Add overseas leagues to main Athletes & Staff filterLeague
const oldAthletesLeagueTarget = '<option value="Prep">High School & Prep</option>';
const newAthletesLeagueAdditions = `<option value="Prep">High School & Prep</option>
            <option value="SHL">🇸🇪 Sweden - SHL Pro</option>
            <option value="HockeyAllsvenskan">🇸🇪 Sweden - Allsvenskan</option>
            <option value="Liiga">🇫🇮 Finland - Liiga Pro</option>
            <option value="Mestis">🇫🇮 Finland - Mestis</option>
            <option value="National League">🇨🇭 Swiss National League</option>
            <option value="DEL">🇩🇪 Germany - DEL</option>
            <option value="Extraliga">🇨🇿 Czech Tipsport Extraliga</option>
            <option value="ICEHL">🇦🇹 Austria - ICEHL</option>
            <option value="EliteHockey">🇳🇴 Norway - EliteHockey</option>
            <option value="EIHL">🇬🇧 UK - EIHL</option>
            <option value="Asia League">🇯🇵/🇰🇷 Asia League</option>
            <option value="AIHL">🇦🇺 Australia - AIHL</option>
            <option value="KHL">🇷🇺 Europe/KHL Pro</option>`;

if (!dbContent.includes('<option value="SHL">')) {
  dbContent = dbContent.replace(oldAthletesLeagueTarget, newAthletesLeagueAdditions);
}

// Script import
if (!dbContent.includes('overseas_players_database.js')) {
  dbContent = dbContent.replace(
    '<script src="static/js/master_players.js"></script>',
    '<script src="static/js/overseas_players_database.js"></script>\n  <script src="static/js/master_players.js"></script>'
  );
}

// Dynamic badge update
if (!dbContent.includes("document.getElementById('badgeOverseasCount').textContent")) {
  dbContent = dbContent.replace(
    'let allOverseasClubs = window.DRAFTLINEUP_OVERSEAS_CLUBS || [];',
    `let allOverseasClubs = window.DRAFTLINEUP_OVERSEAS_CLUBS || [];
      if (document.getElementById('badgeOverseasCount')) {
        document.getElementById('badgeOverseasCount').textContent = \`\${allOverseasClubs.length} Teams\`;
      }`
  );
}

fs.writeFileSync(dbPath, dbContent, 'utf8');
console.log('✓ Updated database.html with 118 clubs, overseas leagues, and overseas players script.');

// 2. Update international.html
const intlPath = path.join(rootDir, 'international.html');
let intlContent = fs.readFileSync(intlPath, 'utf8');

intlContent = intlContent.replace(
  'id="overseasClubCountBadge">61 VERIFIED CLUBS</span>',
  'id="overseasClubCountBadge">118 VERIFIED CLUBS</span>'
);

intlContent = intlContent.replace(
  '<option value="ALL">All Overseas Leagues (61)</option>',
  '<option value="ALL">All Overseas Leagues (118 Clubs)</option>'
);

if (!intlContent.includes('value="ICEHL"')) {
  intlContent = intlContent.replace(
    '<option value="Extraliga">🇨🇿 Czechia - Extraliga (Tier 1)</option>',
    `<option value="Mestis">🇫🇮 Finland - Mestis (Tier 2)</option>
              <option value="Extraliga">🇨🇿 Czechia - Tipsport Extraliga (Tier 1)</option>
              <option value="ICEHL">🇦🇹/🇮🇹/🇭🇺 Austria - ICEHL (Tier 1)</option>
              <option value="EliteHockey">🇳🇴 Norway - EliteHockey (Tier 1)</option>`
  );
}

if (!intlContent.includes('value="KHL"')) {
  intlContent = intlContent.replace(
    '<option value="AIHL">🇦🇺 Australia - AIHL</option>',
    `<option value="AIHL">🇦🇺 Australia - AIHL</option>\n              <option value="KHL">🇷🇺 Europe/KHL Pro</option>`
  );
}

if (!intlContent.includes('overseas_players_database.js')) {
  intlContent = intlContent.replace(
    '<script src="static/js/overseas_clubs_database.js"></script>',
    '<script src="static/js/overseas_players_database.js"></script>\n  <script src="static/js/overseas_clubs_database.js"></script>'
  );
}

fs.writeFileSync(intlPath, intlContent, 'utf8');
console.log('✓ Updated international.html with 118 clubs badge and leagues.');

// 3. Update scout.html
const scoutPath = path.join(rootDir, 'scout.html');
let scoutContent = fs.readFileSync(scoutPath, 'utf8');

if (!scoutContent.includes('overseas_players_database.js')) {
  scoutContent = scoutContent.replace(
    '<script src="static/js/master_players.js"></script>',
    '<script src="static/js/overseas_players_database.js"></script>\n  <script src="static/js/master_players.js"></script>'
  );
  fs.writeFileSync(scoutPath, scoutContent, 'utf8');
  console.log('✓ Added overseas_players_database.js to scout.html.');
}

// 4. Update player.html
const playerPath = path.join(rootDir, 'player.html');
let playerContent = fs.readFileSync(playerPath, 'utf8');

if (!playerContent.includes('overseas_players_database.js')) {
  playerContent = playerContent.replace(
    '<script src="static/js/master_players.js"></script>',
    '<script src="static/js/overseas_players_database.js"></script>\n  <script src="static/js/master_players.js"></script>'
  );
}

// Normalize combine, micro_kpis, and skill_rubric from athlete record
const oldCombineBlock = `combine: {
                flying_30m_sec: (mp.pos === 'G') ? 3.65 : 3.48,
                broad_jump_in: 116,
                pro_agility_5_10_5_sec: 4.12,
                grip_strength_lbs: 165,
                rotational_medball_mph: 51.0
              },
              micro_kpis: {
                controlled_entry_pct: 88.0,
                controlled_exit_pct: 92.0,
                faceoff_win_pct: (mp.pos === 'C' ? 54.0 : 0.0),
                high_danger_pass_comp_pct: 85.0,
                shoulder_scans_per_possession: 6.8,
                wall_battle_win_pct: 90.0
              },
              skill_rubric: {
                edges: 92,
                puck_skills: 90,
                shooting: 88,
                hockey_iq: 92,
                contact: 88,
                d_zone: 90,
                transition: 91,
                goalie: (mp.pos === 'G' ? 92 : 0)
              },`;

const newCombineBlock = `combine: mp.combine || {
                flying_30m_sec: (mp.pos === 'G') ? 3.65 : 3.48,
                broad_jump_in: 116,
                pro_agility_5_10_5_sec: 4.12,
                grip_strength_lbs: 165,
                rotational_medball_mph: 51.0
              },
              micro_kpis: mp.micro_kpis || {
                controlled_entry_pct: 88.0,
                controlled_exit_pct: 92.0,
                faceoff_win_pct: (mp.pos === 'C' ? 54.0 : 0.0),
                high_danger_pass_comp_pct: 85.0,
                shoulder_scans_per_possession: 6.8,
                wall_battle_win_pct: 90.0
              },
              skill_rubric: mp.skill_rubric || {
                edges: 92,
                puck_skills: 90,
                shooting: 88,
                hockey_iq: 92,
                contact: 88,
                d_zone: 90,
                transition: 91,
                goalie: (mp.pos === 'G' ? 92 : 0)
              },`;

// Replace with normalizing regex or exact string
playerContent = playerContent.replace('combine: {', 'combine: mp.combine || {');
playerContent = playerContent.replace('micro_kpis: {', 'micro_kpis: mp.micro_kpis || {');
playerContent = playerContent.replace('skill_rubric: {', 'skill_rubric: mp.skill_rubric || {');

fs.writeFileSync(playerPath, playerContent, 'utf8');
console.log('✓ Updated player.html with overseas player support and biometric mapping.');

console.log('✓ All modules successfully updated for Overseas Hockey integration.');
