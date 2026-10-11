const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('=== PATCHING OVERSEAS CLUB DOSSIER CONTROLLERS ===');

const controllerScript = `
  <!-- Overseas Club Dossier Controller -->
  <script>
    window.openOverseasClubModal = function(clubId) {
      const clubs = window.DRAFTLINEUP_OVERSEAS_CLUBS || [];
      const club = clubs.find(c => c.id === clubId || c.name === clubId);
      if (!club) {
        console.warn('Overseas club not found:', clubId);
        return;
      }

      const flagEl = document.getElementById('clubModalFlag');
      const leagueEl = document.getElementById('clubModalLeague');
      const tierEl = document.getElementById('clubModalTier');
      const estEl = document.getElementById('clubModalEst');
      const nameEl = document.getElementById('clubModalName');
      const locEl = document.getElementById('clubModalLocation');
      const arenaEl = document.getElementById('clubModalArena');
      const capEl = document.getElementById('clubModalCapacity');
      const rinkEl = document.getElementById('clubModalRinkSize');
      const noteEl = document.getElementById('clubModalTacticalNote');
      const countEl = document.getElementById('clubModalAthletesCount');
      const listEl = document.getElementById('clubModalAthletesList');
      const scoutBtn = document.getElementById('clubModalScoutBtn');
      const compareBtn = document.getElementById('clubModalCompareBtn');

      if (flagEl) flagEl.textContent = club.flag || '🏒';
      if (leagueEl) leagueEl.textContent = club.league || 'Overseas Pro';
      if (tierEl) tierEl.textContent = club.tier || 'Tier 1 Pro';
      if (estEl) estEl.textContent = club.established ? ('Est. ' + club.established) : '';
      if (nameEl) nameEl.textContent = club.name;
      if (locEl) locEl.textContent = (club.city || '') + (club.city && club.country ? ', ' : '') + (club.country || '');
      if (arenaEl) arenaEl.textContent = club.arena || 'Home Arena';
      if (capEl) capEl.textContent = club.capacity ? (club.capacity.toLocaleString() + ' Seats') : 'Capacity N/A';
      if (rinkEl) rinkEl.textContent = club.rinkSize || 'Olympic Rink (30m × 60m)';

      const isOlympic = (club.rinkSize || '').toLowerCase().includes('olympic') || (club.rinkSize || '').includes('30m');
      if (noteEl) {
        noteEl.innerHTML = isOlympic
          ? '<span class="text-cyan-400 font-bold">Olympic 30m Ice Surface:</span> 15.4% greater surface area than North American rinks (100ft vs 85ft width). Maximizes east-west puck circulation, lateral skating agility, and extended perimeter cycling.'
          : '<span class="text-amber-400 font-bold">Standard 26m Ice Surface:</span> Compact North American rink dimensions prioritizing vertical transition pace, immediate wall-battle pressure, and rapid north-south counterattacks.';
      }

      // Query affiliated players across MASTER_PLAYERS and DRAFTLINEUP_OVERSEAS_PLAYERS
      const masterList = window.MASTER_PLAYERS || window.DRAFTLINEUP_OVERSEAS_PLAYERS || [];
      const roster = masterList.filter(p => 
        (p.team && p.team.toLowerCase() === club.name.toLowerCase()) ||
        (p.institution && p.institution.toLowerCase() === club.name.toLowerCase()) ||
        (p.previous_team && p.previous_team.toLowerCase().includes(club.name.toLowerCase()))
      );

      if (countEl) countEl.textContent = roster.length + ' Registered Prospects';

      if (listEl) {
        if (roster.length === 0) {
          listEl.innerHTML = '<div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs font-mono">No affiliated DraftLineup prospects currently registered in database for this club.</div>';
        } else {
          listEl.innerHTML = roster.map(p => \`
            <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 transition flex items-center justify-between gap-3 text-xs font-mono">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br \${p.avatar_gradient || 'from-sky-500 to-blue-700'} flex items-center justify-center text-white font-black text-xs shrink-0">
                  #\${p.num || '--'}
                </div>
                <div class="min-w-0">
                  <div class="font-bold text-white truncate flex items-center gap-1.5">
                    <span>\${p.name}</span>
                    <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">\${p.country || ''}</span>
                  </div>
                  <div class="text-[10px] text-slate-400 truncate">
                    \${p.pos} • \${p.role_title || 'Player'} • \${p.draft_status || 'Eligible'}
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <span class="text-[11px] font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                  \${p.composite_score ? p.composite_score.toFixed(1) : '85.0'}
                </span>
                <a href="scout.html?player=\${p.id}" class="px-2 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] transition" title="Scout Athlete">
                  Scout
                </a>
              </div>
            </div>
          \`).join('');
        }
      }

      if (scoutBtn) scoutBtn.href = 'scout.html?club=' + encodeURIComponent(club.name);
      if (compareBtn) compareBtn.href = 'database.html?search=' + encodeURIComponent(club.name);

      const modal = document.getElementById('overseasClubModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    };

    window.closeOverseasClubModal = function() {
      const modal = document.getElementById('overseasClubModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    };

    // Close on backdrop click
    document.addEventListener('DOMContentLoaded', () => {
      const modal = document.getElementById('overseasClubModal');
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            window.closeOverseasClubModal();
          }
        });
      }
    });
  </script>
`;

['database.html', 'international.html'].forEach(fileName => {
  const filePath = path.join(ROOT, fileName);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Clean up `n</body>
  content = content.replace(/`n\s*<\/body>/g, '</body>');
  content = content.replace(/`n/g, '');

  // 2. Remove existing duplicate controller if any
  if (content.includes('window.openOverseasClubModal = function')) {
    content = content.replace(/<!-- Overseas Club Dossier Controller -->[\s\S]*?<\/script>/g, '');
  }

  // 3. In database.html, make sure table rows and action button call openOverseasClubModal
  if (fileName === 'database.html') {
    // Action button
    content = content.replace(
      /<a href="scout\.html\?search=\${encodeURIComponent\(c\.name\)}" class="px-3 py-1\.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer">[\s\S]*?<span>🔭 Scout Club<\/span>[\s\S]*?<\/a>/g,
      `<button type="button" onclick="openOverseasClubModal('\${c.id}')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer">
                <span>🌍 Club Dossier</span>
              </button>`
    );
  }

  // 4. Inject controller before </body>
  const isCrlf = content.includes('\r\n');
  const bodyClose = isCrlf ? '</body>' : '</body>';
  const injected = (isCrlf ? controllerScript.replace(/\n/g, '\r\n') : controllerScript) + (isCrlf ? '\r\n</body>' : '\n</body>');

  content = content.replace(bodyClose, injected);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Successfully patched ${fileName}`);
});

console.log('=== PATCH COMPLETED ===');
