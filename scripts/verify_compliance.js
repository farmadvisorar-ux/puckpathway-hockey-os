const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

console.log('Validating JavaScript syntax across static/js...');
const jsFiles = fs.readdirSync(path.join(ROOT, 'static', 'js')).filter(f => f.endsWith('.js'));
for (const f of jsFiles) {
  try {
    execSync(`node -c "${path.join(ROOT, 'static', 'js', f)}"`);
    console.log(`  ✓ static/js/${f}`);
  } catch (err) {
    console.error(`  ✗ Syntax error in static/js/${f}`);
    process.exit(1);
  }
}

console.log('\nValidating system invariants across HTML files...');
const EXACT_MISSION = "BlueLine DataWorks is the only hockey analytics platform that tracks athletes from their earliest competitive stages through their professional careers — giving scouts, coaches, and organizations a complete view of a player’s evolution, potential, and performance trajectory.";
const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));

for (const f of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (!content.includes(EXACT_MISSION)) {
    console.error(`  ✗ Missing exact mission in ${f}`);
    process.exit(1);
  }
  if (!content.includes('security_shield.js')) {
    console.error(`  ✗ Missing security_shield.js in ${f}`);
    process.exit(1);
  }
  if (content.toLowerCase().includes('shane mccoy')) {
    console.error(`  ✗ Forbidden string found in ${f}`);
    process.exit(1);
  }
  console.log(`  ✓ ${f}`);
}

console.log(`\nSUCCESS: All ${jsFiles.length} JS scripts and ${htmlFiles.length} HTML files verified with 100% compliance!`);
