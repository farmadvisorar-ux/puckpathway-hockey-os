const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

let updated = 0;
for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('austin_ice_bats_roster.js')) {
    continue;
  }

  if (content.includes('<script src="static/js/master_players.js"></script>')) {
    content = content.replace(
      '<script src="static/js/master_players.js"></script>',
      '<script src="static/js/austin_ice_bats_roster.js"></script>\r\n  <script src="static/js/master_players.js"></script>'
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Linked austin_ice_bats_roster.js in: ${file}`);
    updated++;
  }
}

console.log(`Total HTML files updated with Austin Ice Bats script: ${updated}`);
