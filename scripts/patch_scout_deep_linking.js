const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'scout.html');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\/\/ 4\. Check for URL Parameter[\s\S]*?setDefaultAthlete\(\);\s*\}/;

const replacement = `// 4. Check for Universal Query Parameters (?player=, ?id=, ?club=, ?search=, ?q=, ?team=)
      let queryTarget = null;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTarget = urlParams.get('search') || urlParams.get('q') || urlParams.get('club') || urlParams.get('team');
        const playerTarget = urlParams.get('player') || urlParams.get('id') || ((typeof BlueLineUI !== 'undefined' && BlueLineUI.getActivePlayerIdFromUrl) ? BlueLineUI.getActivePlayerIdFromUrl() : null);

        if (playerTarget) {
          queryTarget = allAthletes.find(p => p.id === playerTarget || (p.name && p.name.toLowerCase().includes(playerTarget.toLowerCase())));
        } else if (searchTarget) {
          const dirInput = document.getElementById('directorySearchInput');
          if (dirInput) {
            dirInput.value = searchTarget;
          }
          const globalInput = document.getElementById('scoutGlobalPlayerSearch');
          if (globalInput) {
            globalInput.value = searchTarget;
          }
          switchScoutTab('directory');
          queryTarget = allAthletes.find(p => (p.team && p.team.toLowerCase().includes(searchTarget.toLowerCase())) || (p.name && p.name.toLowerCase().includes(searchTarget.toLowerCase())));
        }
      } catch (err) {}

      if (queryTarget) {
        setActiveAthlete(queryTarget);
        if (typeof BlueLineUI !== 'undefined' && BlueLineUI.showToast) {
          BlueLineUI.showToast(\`Loaded \${queryTarget.name} into Live Micro-Telemetry Desk.\`, 'success');
        }
      } else {
        setDefaultAthlete();
      }`;

if (regex.test(content)) {
  content = content.replace(regex, replacement.replace(/\n/g, '\r\n'));
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Successfully patched scout.html with universal deep linking!');
} else {
  console.log('Regex did not match scout.html target.');
}
