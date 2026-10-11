const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('--- STARTING SITE-WIDE COUNT UNIFICATION TO 4,220 PLAYERS / 4,361 PERSONNEL ---');

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(ROOT, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  let count = 0;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      count++;
    }
  }
  if (count > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Updated ${filePath} (${count} replacements)`);
  }
}

const targetFiles = [
  'database.html',
  'index.html',
  'scout.html',
  'app.html',
  'coach.html',
  'community.html',
  'login.html',
  'manifest.json',
  'static/js/agent_mesh_engine.js',
  'static/js/ai_scouting_copilot.js',
  'static/js/app.js',
  'static/js/auth_engine.js',
  'static/js/blueline-core.js',
  'static/js/global_nav.js',
  'static/js/social_mesh_engine.js',
  'static/js/tournament_engine.js'
];

targetFiles.forEach(file => {
  replaceInFile(file, [
    ['4,331', '4,361'],
    ['4,190+', '4,220+'],
    ['4,190', '4,220'],
    ['4,160+', '4,220+'],
    ['4,160', '4,220']
  ]);
});

// Also scan all other HTML and JS files for any leftover 4,190 or 4,331
fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).forEach(file => {
  if (!targetFiles.includes(file)) {
    replaceInFile(file, [
      ['4,331', '4,361'],
      ['4,190+', '4,220+'],
      ['4,190', '4,220']
    ]);
  }
});

fs.readdirSync(path.join(ROOT, 'static/js')).filter(f => f.endsWith('.js')).forEach(file => {
  const relPath = path.join('static/js', file);
  if (!targetFiles.includes(relPath)) {
    replaceInFile(relPath, [
      ['4,331', '4,361'],
      ['4,190+', '4,220+'],
      ['4,190', '4,220']
    ]);
  }
});

console.log('--- SITE-WIDE COUNT UNIFICATION COMPLETED ---');
