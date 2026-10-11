const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('--- STARTING SITE-WIDE COUNT UNIFICATION ---');

// Helper to replace text safely in a file
function replaceInFile(filePath, replacements) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      count++;
    } else {
      console.warn(`Warning in ${filePath}: target string not found: "${from.slice(0, 50)}..."`);
    }
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ Updated ${filePath} (${count} replacements)`);
}

// 1. database.html
const newDbSelectContent = `<select id="overseasDbLeagueFilter" class="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer focus:border-rose-500 transition font-mono">
              <option value="ALL">All Overseas Leagues (195 Teams)</option>
              <option value="SHL">🇸🇪 Sweden - SHL (Tier 1)</option>
              <option value="HockeyAllsvenskan">🇸🇪 Sweden - Allsvenskan (Tier 2)</option>
              <option value="Liiga">🇫🇮 Finland - Liiga (Tier 1)</option>
              <option value="Mestis">🇫🇮 Finland - Mestis (Tier 2)</option>
              <option value="National League">🇨🇭 Switzerland - NL (Tier 1)</option>
              <option value="Swiss League">🇨🇭 Switzerland - Swiss League (Tier 2)</option>
              <option value="DEL">🇩🇪 Germany - DEL (Tier 1)</option>
              <option value="DEL2">🇩🇪 Germany - DEL2 (Tier 2)</option>
              <option value="Extraliga">🇨🇿 Czechia - Tipsport Extraliga (Tier 1)</option>
              <option value="Maxa Liga">🇨🇿 Czechia - Maxa Liga (Tier 2)</option>
              <option value="Tipos Extraliga">🇸🇰 Slovakia - Tipos Extraliga (Tier 1)</option>
              <option value="ICEHL">🇦🇹/🇮🇹/🇭🇺 Austria - ICEHL (Tier 1)</option>
              <option value="EliteHockey">🇳🇴 Norway - EliteHockey (Tier 1)</option>
              <option value="Ligue Magnus">🇫🇷 France - Ligue Magnus (Tier 1)</option>
              <option value="Metal Ligaen">🇩🇰 Denmark - Metal Ligaen (Tier 1)</option>
              <option value="TAURON Hokej Liga">🇵🇱 Poland - TAURON Hokej Liga (Tier 1)</option>
              <option value="EIHL">🇬🇧 UK - EIHL (Tier 1)</option>
              <option value="Asia League">🇯🇵/🇰🇷 Asia League</option>
              <option value="AIHL">🇦🇺 Australia - AIHL</option>
              <option value="KHL">🇷🇺 Eurasia/KHL Pro</option>
            </select>`;

let dbContent = fs.readFileSync(path.join(ROOT, 'database.html'), 'utf8');
dbContent = dbContent.replace(/<select id="overseasDbLeagueFilter"[\s\S]*?<\/select>/, newDbSelectContent.replace(/\n/g, '\r\n'));
fs.writeFileSync(path.join(ROOT, 'database.html'), dbContent, 'utf8');
console.log('✓ Successfully injected updated leagues dropdown into database.html');

// 2. international.html
const newIntlSelectContent = `<select id="overseasLeagueFilter" class="bg-slate-900 border border-slate-700 text-slate-100 text-xs rounded-xl px-3 py-2 outline-none cursor-pointer focus:border-rose-500 transition">
              <option value="ALL">All Overseas Leagues (195 Clubs)</option>
              <option value="SHL">🇸🇪 Sweden - SHL (Tier 1)</option>
              <option value="HockeyAllsvenskan">🇸🇪 Sweden - Allsvenskan (Tier 2)</option>
              <option value="Liiga">🇫🇮 Finland - Liiga (Tier 1)</option>
              <option value="Mestis">🇫🇮 Finland - Mestis (Tier 2)</option>
              <option value="National League">🇨🇭 Switzerland - NL (Tier 1)</option>
              <option value="Swiss League">🇨🇭 Switzerland - Swiss League (Tier 2)</option>
              <option value="DEL">🇩🇪 Germany - DEL (Tier 1)</option>
              <option value="DEL2">🇩🇪 Germany - DEL2 (Tier 2)</option>
              <option value="Extraliga">🇨🇿 Czechia - Tipsport Extraliga (Tier 1)</option>
              <option value="Maxa Liga">🇨🇿 Czechia - Maxa Liga (Tier 2)</option>
              <option value="Tipos Extraliga">🇸🇰 Slovakia - Tipos Extraliga (Tier 1)</option>
              <option value="ICEHL">🇦🇹/🇮🇹/🇭🇺 Austria - ICEHL (Tier 1)</option>
              <option value="EliteHockey">🇳🇴 Norway - EliteHockey (Tier 1)</option>
              <option value="Ligue Magnus">🇫🇷 France - Ligue Magnus (Tier 1)</option>
              <option value="Metal Ligaen">🇩🇰 Denmark - Metal Ligaen (Tier 1)</option>
              <option value="TAURON Hokej Liga">🇵🇱 Poland - TAURON Hokej Liga (Tier 1)</option>
              <option value="EIHL">🇬🇧 UK - EIHL (Tier 1)</option>
              <option value="Asia League">🇯🇵/🇰🇷 Asia League</option>
              <option value="AIHL">🇦🇺 Australia - AIHL</option>
              <option value="KHL">🇷🇺 Eurasia/KHL Pro</option>
            </select>`;

let intlContent = fs.readFileSync(path.join(ROOT, 'international.html'), 'utf8');
intlContent = intlContent.replace(/<select id="overseasLeagueFilter"[\s\S]*?<\/select>/, newIntlSelectContent.replace(/\n/g, '\r\n'));
fs.writeFileSync(path.join(ROOT, 'international.html'), intlContent, 'utf8');
console.log('✓ Successfully injected updated leagues dropdown into international.html');

// 3. app.html
replaceInFile('app.html', [
  ["Personal athlete OS, 3,050+ player database, skill tree, and full access to The Wire", "Personal athlete OS, 4,130+ player database, skill tree, and full access to The Wire"]
]);

// 4. index.html
replaceInFile('index.html', [
  ['4,019+ ATHLETES • 190 PROGRAMS', '4,130+ ATHLETES • 365 GLOBAL CLUBS & PROGRAMS'],
  ['<strong>3,050+ Master Player Directory</strong>: Unrestricted search across all 4,000+ athletes with deep league and NHLe filters.', '<strong>4,130+ Master Player Directory</strong>: Unrestricted search across all 4,130+ athletes with deep league and NHLe filters.'],
  ['<strong>3,050+ Player Directory & Comparison</strong>: Full database access and 8-axis radar comparison charts for game prep.', '<strong>4,130+ Player Directory & Comparison</strong>: Full database access and 8-axis radar comparison charts for game prep.'],
  ['<strong>3,050+ Player Database Search</strong>: Research profiles, developmental trajectories, and career stats of over 3,050 athletes.', '<strong>4,130+ Player Database Search</strong>: Research profiles, developmental trajectories, and career stats of over 4,130 athletes.'],
  ['<strong>3,050+ Player & Team Directory</strong>: Research competitive teams, leagues, prep academies, and college programs.', '<strong>4,130+ Player & Team Directory</strong>: Research competitive teams, leagues, prep academies, and college programs.'],
  ['<strong>3,050+ Master Player Directory & Search</strong>', '<strong>4,130+ Master Player Directory & Search</strong>'],
  ['Comprehensive database of 4,000+ athletes across leagues', 'Comprehensive database of 4,130+ athletes across leagues'],
  ['Comprehensive directory of 2,974 athlete dossiers', 'Comprehensive directory of 4,130+ athlete dossiers'],
  ['4,019+ Player Directory:', '4,130+ Player Directory:']
]);

// 5. scout.html
replaceInFile('scout.html', [
  ['<span>4,019+ Database</span>', '<span>4,130+ Database</span>'],
  ['<span>Browse 3,050+ Directory →</span>', '<span>Browse 4,130+ Directory →</span>'],
  ['Live database of <strong class="text-white" id="directoryTotalCount">4,019</strong> verified collegiate', 'Live database of <strong class="text-white" id="directoryTotalCount">4,130</strong> verified collegiate'],
  ['Access to this live micro-telemetry logger, 4,019+ verified non-NHL amateur athlete dossiers', 'Access to this live micro-telemetry logger, 4,130+ verified non-NHL amateur athlete dossiers'],
  ['<span>4,019+ Non-NHL Amateur Athlete Dossiers & Verified Registrar Match</span>', '<span>4,130+ Non-NHL Amateur Athlete Dossiers & Verified Registrar Match</span>'],
  ['or the 4,019+ athlete database to add players', 'or the 4,130+ athlete database to add players']
]);

// 6. coach.html
replaceInFile('coach.html', [
  ['<option value="">Select from 4,019+ Catalog...</option>', '<option value="">Select from 4,130+ Catalog...</option>'],
  ["let optHtml = '<option value=\"\">Select from 4,019+ Catalog...</option>';", "let optHtml = '<option value=\"\">Select from 4,130+ Catalog...</option>';"]
]);

// 7. community.html
replaceInFile('community.html', [
  ['Claim Profile (3,050+)', 'Claim Profile (4,130+)']
]);

// 8. login.html
replaceInFile('login.html', [
  ['4,019+ Player Directory', '4,130+ Player Directory']
]);

// 9. manifest.json
replaceInFile('manifest.json', [
  ['3,770+ Athlete Directory & Scout Desk', '4,130+ Athlete Directory & Scout Desk']
]);

// 10. JS Engines
replaceInFile('static/js/agent_mesh_engine.js', [
  ['Cross-checked 2,974 athlete profiles', 'Cross-checked 4,130+ athlete profiles'],
  ['totalCandidatesIngested: 2974,', 'totalCandidatesIngested: 4130,'],
  ['Audits candidates against 3,050+ registered master players', 'Audits candidates against 4,130+ registered master players']
]);

replaceInFile('static/js/ai_scouting_copilot.js', [
  ['• Athlete Trajectory & Bio Evaluation (3,770+ dossiers)', '• Athlete Trajectory & Bio Evaluation (4,130+ dossiers)'],
  ['tracks <strong>3,770+ verifiable non-NHL athletes</strong>', 'tracks <strong>4,130+ verifiable non-NHL athletes</strong>'],
  ['Search All 3,770 Athletes →', 'Search All 4,130 Athletes →']
]);

replaceInFile('static/js/app.js', [
  ['Open Full Master Database Hub (2,412+ Athletes) &rarr;', 'Open Full Master Database Hub (4,130+ Athletes) &rarr;']
]);

replaceInFile('static/js/auth_engine.js', [
  ['⚡ Claim Profile (3,050+)', '⚡ Claim Profile (4,130+)'],
  ['Claim Existing Dossier from 3,050+ Athlete Database', 'Claim Existing Dossier from 4,130+ Athlete Database'],
  ['Not listed in our 3,050+ collegiate/junior database yet?', 'Not listed in our 4,130+ collegiate/junior database yet?'],
  ['search the 3,050+ player registry.', 'search the 4,130+ player registry.'],
  ['"Searchable 3,050+ Player Scouting Database"', '"Searchable 4,130+ Player Scouting Database"'],
  ['"Unrestricted 3,050+ Master Athlete Database with Ledger Audit"', '"Unrestricted 4,130+ Master Athlete Database with Ledger Audit"']
]);

replaceInFile('static/js/blueline-core.js', [
  ['placeholder="Search DraftLineup.com (2,974 athletes, draft board, suites...)"', 'placeholder="Search DraftLineup.com (4,130+ athletes, draft board, suites...)"'],
  ['<div className="text-xs text-slate-400">2,974 verified athletes, scouts & evaluation ledgers</div>', '<div className="text-xs text-slate-400">4,130+ verified athletes, scouts & evaluation ledgers</div>']
]);

replaceInFile('static/js/global_nav.js', [
  ['Comprehensive directory of 2,974 athlete dossiers', 'Comprehensive directory of 4,130+ athlete dossiers']
]);

replaceInFile('static/js/social_mesh_engine.js', [
  ['Tracking 3,770+ non-NHL athletes across NCAA D1, USHL, NAHL, and prep academies.', 'Tracking 4,130+ non-NHL athletes across NCAA D1, USHL, NAHL, European Pro, and prep academies.']
]);

replaceInFile('static/js/tournament_engine.js', [
  ['linked to 2,974 Master Player Directory', 'linked to 4,130+ Master Player Directory']
]);

// 11. Add overseas databases script imports before master_players.js where missing
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
for (const f of htmlFiles) {
  const filePath = path.join(ROOT, f);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('static/js/master_players.js') && !content.includes('static/js/overseas_players_database.js')) {
    content = content.replace(
      '<script src="static/js/master_players.js"></script>',
      '<script src="static/js/overseas_players_database.js"></script>\n  <script src="static/js/overseas_clubs_database.js"></script>\n  <script src="static/js/master_players.js"></script>'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Added overseas script tags to ${f}`);
  }
}

console.log('--- SITE-WIDE COUNT UNIFICATION COMPLETED ---');
