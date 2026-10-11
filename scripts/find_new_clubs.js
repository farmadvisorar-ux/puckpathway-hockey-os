const { execSync } = require('child_process');
const fs = require('fs');

const oldJs = execSync('git show 7d36148:static/js/overseas_clubs_database.js', { maxBuffer: 10 * 1024 * 1024 }).toString();
const oldClubs = [];
const idRegex = /"id":\s*"([^"]+)"/g;
let m;
while ((m = idRegex.exec(oldJs)) !== null) {
  oldClubs.push(m[1]);
}
const oldSet = new Set(oldClubs);

const currentJs = fs.readFileSync('static/js/overseas_clubs_database.js', 'utf8');
const curClubs = [];
while ((m = idRegex.exec(currentJs)) !== null) {
  curClubs.push(m[1]);
}
const newlyAdded = curClubs.filter(id => !oldSet.has(id));

const path = require('path');
require(path.join(__dirname, '../static/js/overseas_clubs_database.js'));
const allClubs = global.DRAFTLINEUP_OVERSEAS_CLUBS || [];
const clubObjMap = new Map(allClubs.map(c => [c.id, c]));

console.log('Old count:', oldClubs.length, 'Cur count:', curClubs.length, 'Newly added:', newlyAdded.length);

console.log('\nNext 10 newly added clubs (21 to 30):');
newlyAdded.slice(20, 30).forEach((id, idx) => {
  const c = clubObjMap.get(id);
  console.log(`${idx + 21}. [${id}] ${c ? c.name : ''} (${c ? c.league : ''}, ${c ? c.country : ''})`);
  console.log('   Arena: ' + (c ? c.arena : '') + ', Capacity: ' + (c ? c.capacity : '') + ', City: ' + (c ? c.city : ''));
});

