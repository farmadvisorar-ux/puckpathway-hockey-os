const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('=== IMPLEMENTING DRAFTLINEUP.COM NEXT PHASE UPGRADES ===');

// =========================================================================
// 1. UPGRADE draft.html
// =========================================================================
console.log('1. Upgrading draft.html with On-The-Clock Command Console & 64-Pick 2-Round Simulator...');

let draftHtml = fs.readFileSync(path.join(ROOT, 'draft.html'), 'utf8');

// A. Insert On-The-Clock Command Console right after the Hero banner (after stat completed picks)
const otcConsoleMarkup = `
    <!-- ON THE CLOCK & SIMULATION COMMAND CONSOLE -->
    <div class="glass-panel p-4 sm:p-5 rounded-3xl border border-sky-500/40 shadow-2xl bg-slate-950/80 space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <!-- OTC Franchise Status -->
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-3xl shadow-inner shrink-0" id="otcTeamLogo">
            🦈
          </div>
          <div class="space-y-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span id="clockBadge" class="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 font-mono font-bold text-[11px] border border-red-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-400 animate-ping"></span> ROUND 1 • ON THE CLOCK
              </span>
              <span class="text-xs font-mono text-cyan-400 font-bold">PICK #<span id="currentPickNumDisplay">1</span> OVERALL</span>
              <span class="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                ⏱️ <span id="pickTimerDisplay">02:00</span>
              </span>
            </div>
            <h2 class="text-lg sm:text-xl font-black text-white truncate" id="otcTeamName">San Jose Sharks</h2>
            <p class="text-xs text-slate-400 font-mono truncate" id="otcNeeds">Needs: 1C Franchise Center, Top-Pair RHD, Puck-Moving D</p>
          </div>
        </div>

        <!-- User Franchise Selector & Action Buttons -->
        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <!-- Select Your Team -->
          <div class="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span class="text-xs font-mono text-slate-400 font-bold">YOUR TEAM:</span>
            <select id="userTeamSelect" class="bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-2 py-1 font-mono outline-none focus:border-cyan-400 cursor-pointer">
              <!-- Populated by JS -->
            </select>
          </div>

          <!-- Trade Machine Button -->
          <button id="openTradeModalBtn" type="button" class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer">
            🤝 Trade Machine
          </button>

          <!-- Simulation Actions -->
          <button id="simNextPickBtn" type="button" class="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer">
            <i class="fa-solid fa-play"></i> Sim Next Pick
          </button>

          <button id="simToUserBtn" type="button" class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer">
            ⏩ Sim to Your Pick
          </button>

          <button id="simRoundBtn" type="button" class="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer">
            ⚡ Sim Round 1
          </button>

          <button id="simFullDraftBtn" type="button" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer">
            🏆 Sim Entire Draft (64 Picks)
          </button>

          <button id="resetDraftBtn" type="button" class="px-3 py-2 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800 font-bold text-xs transition active:scale-95 cursor-pointer" title="Reset Draft">
            🔄 Reset
          </button>
        </div>

      </div>
    </div>
`;

// Insert right before `<!-- MAIN TWO-COLUMN WORKSPACE -->`
if (!draftHtml.includes('id="otcTeamLogo"')) {
  draftHtml = draftHtml.replace(
    '<!-- MAIN TWO-COLUMN WORKSPACE -->',
    otcConsoleMarkup + '\n    <!-- MAIN TWO-COLUMN WORKSPACE -->'
  );
  console.log('✓ Added On-The-Clock Command Console markup to draft.html');
}

// B. Update stat completed picks from `0 / 32` to `0 / 64`
draftHtml = draftHtml.replace('0 / 32', '0 / 64');
draftHtml = draftHtml.replace('32 Available', '64 Available');

// C. Update Draft Board Header with Round Selector Tabs
const oldDraftBoardHeader = `<div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>📋</span> Round 1 Draft Order & Selections
            </h2>
            <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] border border-sky-500/30 font-bold">32 Picks</span>
          </div>

          <div class="flex items-center gap-1.5 text-xs font-mono">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> <span class="text-slate-400 text-[11px]">Drafted</span>
            <span class="w-2.5 h-2.5 rounded-full bg-sky-400 ml-2 animate-pulse"></span> <span class="text-slate-400 text-[11px]">On Clock</span>
          </div>
        </div>`;

const newDraftBoardHeader = `<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <h2 class="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>📋</span> Global Mock Draft Board (64 Picks)
            </h2>
            <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px] border border-sky-500/30 font-bold" id="boardPicksBadge">64 Picks</span>
          </div>

          <!-- Round Filter Tabs -->
          <div class="flex items-center gap-1.5 text-xs font-mono">
            <button class="round-tab-btn px-2.5 py-1 rounded-lg font-bold bg-cyan-600 text-white transition active cursor-pointer" data-round="all">All (1-64)</button>
            <button class="round-tab-btn px-2.5 py-1 rounded-lg font-bold bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer" data-round="1">Round 1 (1-32)</button>
            <button class="round-tab-btn px-2.5 py-1 rounded-lg font-bold bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer" data-round="2">Round 2 (33-64)</button>
          </div>
        </div>`;

draftHtml = draftHtml.replace(oldDraftBoardHeader, newDraftBoardHeader);

// D. Add `EURO` European Pro pipeline button to Big Board filter pills if not present
if (!draftHtml.includes('data-pipe="EURO"')) {
  draftHtml = draftHtml.replace(
    '<button class="filter-pipe-btn px-2 py-0.5 rounded-lg font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition" data-pipe="PREP">🏛️ Prep Academies</button>',
    `<button class="filter-pipe-btn px-2 py-0.5 rounded-lg font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition" data-pipe="PREP">🏛️ Prep Academies</button>
              <button class="filter-pipe-btn px-2 py-0.5 rounded-lg font-bold bg-slate-900 text-slate-300 border border-slate-800 hover:text-white transition" data-pipe="EURO">🌍 European Pro</button>`
  );
}

// E. Update script logic in draft.html for 64 picks & round filtering
draftHtml = draftHtml.replace(
  "let activePipeFilter = 'all';",
  "let activePipeFilter = 'all';\n      let activeRoundFilter = 'all';"
);

// Update renderDraftBoard to filter by activeRoundFilter
const oldRenderDraftBoard = `function renderDraftBoard() {
        const container = document.getElementById('draftBoardContainer');
        container.innerHTML = state.draftOrder.map((slot, idx) => {`;

const newRenderDraftBoard = `function renderDraftBoard() {
        const container = document.getElementById('draftBoardContainer');
        const displayedSlots = state.draftOrder.filter(slot => {
          if (activeRoundFilter === 'all') return true;
          return String(slot.round) === String(activeRoundFilter);
        });

        container.innerHTML = displayedSlots.map((slot) => {
          const idx = slot.pickNum - 1;`;

draftHtml = draftHtml.replace(oldRenderDraftBoard, newRenderDraftBoard);

// Add event listeners for round filter buttons and simFullDraftBtn
const oldSimControls = `document.getElementById('simRoundBtn').addEventListener('click', () => {
        engine.simRound1();
        updateUI();
      });`;

const newSimControls = `document.getElementById('simRoundBtn').addEventListener('click', () => {
        engine.simRound1();
        updateUI();
      });

      const simFullDraftBtn = document.getElementById('simFullDraftBtn');
      if (simFullDraftBtn) {
        simFullDraftBtn.addEventListener('click', () => {
          engine.simFullDraft();
          updateUI();
          if (window.BlueLineUI) BlueLineUI.showToast("Completed full 64-pick 2-round draft simulation!", "success");
        });
      }

      document.querySelectorAll('.round-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          document.querySelectorAll('.round-tab-btn').forEach(b => {
            b.classList.remove('bg-cyan-600', 'text-white', 'active');
            b.classList.add('bg-slate-900', 'text-slate-400');
          });
          btn.classList.add('bg-cyan-600', 'text-white', 'active');
          btn.classList.remove('bg-slate-900', 'text-slate-400');
          activeRoundFilter = btn.dataset.round;
          renderDraftBoard();
        });
      });`;

draftHtml = draftHtml.replace(oldSimControls, newSimControls);

// Update statCompletedPicks label in updateUI()
draftHtml = draftHtml.replace(
  "document.getElementById('statCompletedPicks').textContent = `${state.draftLog.length} / 32`;",
  "document.getElementById('statCompletedPicks').textContent = `${state.draftLog.length} / 64`;"
);

fs.writeFileSync(path.join(ROOT, 'draft.html'), draftHtml, 'utf8');
console.log('✓ Successfully upgraded draft.html to Global Mock Draft Simulator 2.0');


// =========================================================================
// 2. OVERSEAS CLUB DOSSIER MODAL MARKUP
// =========================================================================
const overseasClubModalMarkup = `
  <!-- ==================== OVERSEAS CLUB DOSSIER MODAL ==================== -->
  <div id="overseasClubModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md hidden items-center justify-center p-3 sm:p-5">
    <div class="glass-panel w-full max-w-2xl rounded-3xl border border-rose-500/40 p-5 sm:p-6 space-y-5 shadow-2xl bg-slate-950 text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
      
      <!-- Modal Header -->
      <div class="flex items-start justify-between border-b border-slate-800 pb-4 gap-3">
        <div class="flex items-center gap-3">
          <span class="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shrink-0" id="clubModalFlag">🏒</span>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30" id="clubModalLeague">SHL</span>
              <span class="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] font-mono" id="clubModalTier">Tier 1 Pro</span>
              <span class="text-[10px] font-mono text-slate-400" id="clubModalEst">Est. 1938</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-white mt-1" id="clubModalName">Frölunda HC</h2>
            <p class="text-xs text-slate-400 font-mono" id="clubModalLocation">Gothenburg, Sweden</p>
          </div>
        </div>
        <button type="button" onclick="closeOverseasClubModal()" class="text-slate-400 hover:text-white text-xl p-1.5 rounded-xl hover:bg-slate-900 transition cursor-pointer" aria-label="Close Club Dossier">
          ✕
        </button>
      </div>

      <!-- Arena & Surface Telemetry Card -->
      <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
        <div class="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span>🏟️</span> <span>Home Venue & Ice Surface Specifications</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span class="text-[10px] text-slate-400 block">ARENA NAME</span>
            <strong class="text-white text-sm block mt-0.5" id="clubModalArena">Scandinavium</strong>
            <span class="text-[10px] text-cyan-400 mt-1 block" id="clubModalCapacity">12,044 Seats</span>
          </div>

          <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <span class="text-[10px] text-slate-400 block">RINK DIMENSIONS</span>
            <strong class="text-rose-300 text-sm block mt-0.5" id="clubModalRinkSize">Olympic Rink (30m × 60m)</strong>
            <span class="text-[10px] text-slate-400 mt-1 block">Width: 30 meters / 98.4 ft</span>
          </div>
        </div>

        <!-- Tactical Surface Implications -->
        <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[11px] leading-relaxed text-slate-300" id="clubModalTacticalNote">
          Olympic 30m width provides 15.4% greater surface area than North American rinks, rewarding lateral agility, east-west puck circulation, and layered cycle play.
        </div>
      </div>

      <!-- Affiliated Prospects & DraftLineup Athletes Section -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs font-mono">
          <span class="font-bold text-white flex items-center gap-1.5">
            <span>⭐</span> <span>Rostered & Affiliated DraftLineup Athletes</span>
          </span>
          <span class="text-[10px] text-slate-400" id="clubModalAthletesCount">0 Athletes</span>
        </div>

        <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar" id="clubModalAthletesList">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
        <div class="flex items-center gap-2 flex-wrap">
          <a id="clubModalScoutBtn" href="scout.html" class="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition">
            <span>🔭</span> <span>Open in Scout Desk</span>
          </a>
          <a id="clubModalCompareBtn" href="compare.html" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition">
            <span>⚖️</span> <span>Compare Club</span>
          </a>
          <a href="international.html" class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition">
            <span>🌍</span> <span>War Room</span>
          </a>
        </div>

        <button type="button" onclick="closeOverseasClubModal()" class="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold text-xs transition cursor-pointer">
          Close
        </button>
      </div>

    </div>
  </div>
`;

// Helper JS functions for modal controller
const overseasModalControllerScript = `
    // Overseas Club Dossier Modal Controller
    window.openOverseasClubModal = function(clubId) {
      const clubs = window.DRAFTLINEUP_OVERSEAS_CLUBS || [];
      const club = clubs.find(c => c.id === clubId);
      if (!club) return;

      document.getElementById('clubModalFlag').textContent = club.flag || '🏒';
      document.getElementById('clubModalName').textContent = club.name;
      document.getElementById('clubModalLeague').textContent = club.league;
      document.getElementById('clubModalTier').textContent = club.tier;
      document.getElementById('clubModalEst').textContent = club.established ? 'Est. ' + club.established : 'Pro Club';
      document.getElementById('clubModalLocation').textContent = club.city + ', ' + club.country;
      document.getElementById('clubModalArena').textContent = club.arena || 'Arena';
      document.getElementById('clubModalCapacity').textContent = (club.capacity ? club.capacity.toLocaleString() : 'N/A') + ' Seats';
      document.getElementById('clubModalRinkSize').textContent = club.rinkSize || 'Olympic Rink (30m × 60m)';

      const isOlympic = (club.rinkSize || '').toLowerCase().includes('olympic');
      document.getElementById('clubModalTacticalNote').textContent = isOlympic
        ? "Olympic 30m rink width offers 15.4% greater surface area. Favors transition speed, east-west puck circulation, and wide-zone perimeter delay tactics."
        : "NHL Standard 26m rink width forces north-south pacing, aggressive puck pursuit on the forecheck, and high-density net-front containment.";

      // Scan for affiliated athletes in MASTER_PLAYERS & DRAFTLINEUP_OVERSEAS_PLAYERS
      const allPlayers = window.MASTER_PLAYERS || window.DRAFTLINEUP_OVERSEAS_PLAYERS || [];
      const cleanClubName = club.name.toLowerCase();
      const affiliated = allPlayers.filter(p => {
        const teamMatch = p.team && p.team.toLowerCase().includes(cleanClubName);
        const prevMatch = p.previous_team && p.previous_team.toLowerCase().includes(cleanClubName);
        return teamMatch || prevMatch;
      });

      document.getElementById('clubModalAthletesCount').textContent = affiliated.length + ' Athletes In Catalog';

      const athletesListEl = document.getElementById('clubModalAthletesList');
      if (affiliated.length === 0) {
        athletesListEl.innerHTML = '<div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-400 text-center">No active athlete dossiers currently cataloged for this club. Scouts can submit verified prospects through the Scout Desk.</div>';
      } else {
        athletesListEl.innerHTML = affiliated.map(a => \`
          <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono hover:border-slate-700 transition">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white shrink-0">#\${a.num || '--'}</span>
              <div class="min-w-0">
                <div class="font-bold text-white truncate">\${a.name}</div>
                <div class="text-[10px] text-slate-400 truncate">\${a.pos} • \${a.draft_status || 'Draft Eligible'}</div>
              </div>
            </div>
            <div class="text-right shrink-0">
              <a href="player.html?id=\${a.id}" class="px-2 py-1 rounded bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 text-[10px] font-bold border border-sky-500/30 transition">Passport &rarr;</a>
            </div>
          </div>
        \`).join('');
      }

      // Configure Action Links
      document.getElementById('clubModalScoutBtn').href = 'scout.html?club=' + encodeURIComponent(club.name);
      document.getElementById('clubModalCompareBtn').href = 'compare.html?club=' + encodeURIComponent(club.name);

      const modal = document.getElementById('overseasClubModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    };

    window.closeOverseasClubModal = function() {
      const modal = document.getElementById('overseasClubModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    };
`;

// =========================================================================
// 3. UPGRADE database.html
// =========================================================================
console.log('2. Upgrading database.html with Overseas Club Dossier Modal...');

let dbHtml = fs.readFileSync(path.join(ROOT, 'database.html'), 'utf8');

// Insert modal markup right before mobile bottom nav if not present
if (!dbHtml.includes('id="overseasClubModal"')) {
  dbHtml = dbHtml.replace(
    '<!-- Mobile Sticky Bottom Navigation Dock (< 1024px) -->',
    overseasClubModalMarkup + '\n  <!-- Mobile Sticky Bottom Navigation Dock (< 1024px) -->'
  );
  console.log('✓ Added overseas club modal markup to database.html');
}

// Update overseas table rows to trigger modal on click
const oldDbTableRow = `<td class="py-3.5 px-4 font-bold text-white">
              <div class="flex items-center gap-2">
                <span class="text-base">\${c.flag || '🏒'}</span>
                <div>
                  <div class="font-extrabold text-sm text-white group-hover:text-rose-300 transition">\${c.name}</div>
                  <div class="text-[10px] font-mono text-slate-400">\${c.country}</div>
                </div>
              </div>
            </td>`;

const newDbTableRow = `<td class="py-3.5 px-4 font-bold text-white cursor-pointer" onclick="openOverseasClubModal('\${c.id}')">
              <div class="flex items-center gap-2">
                <span class="text-base">\${c.flag || '🏒'}</span>
                <div>
                  <div class="font-extrabold text-sm text-white group-hover:text-rose-300 transition flex items-center gap-1.5">
                    <span>\${c.name}</span>
                    <span class="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300 font-mono">Dossier</span>
                  </div>
                  <div class="text-[10px] font-mono text-slate-400">\${c.country}</div>
                </div>
              </div>
            </td>`;

dbHtml = dbHtml.replace(oldDbTableRow, newDbTableRow);

// Update table action button to open modal
const oldDbActionBtn = `<a href="scout.html?search=\${encodeURIComponent(c.name)}" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer">
                <span>🔭 Scout Club</span>
              </a>`;

const newDbActionBtn = `<button type="button" onclick="openOverseasClubModal('\${c.id}')" class="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer">
                <span>🌍 Club Dossier</span>
              </button>`;

dbHtml = dbHtml.replace(oldDbActionBtn, newDbActionBtn);

// Add controller script inside database.html
if (!dbHtml.includes('window.openOverseasClubModal')) {
  dbHtml = dbHtml.replace(
    '</script>\n</body>',
    overseasModalControllerScript + '\n  </script>\n</body>'
  );
  if (!dbHtml.includes('window.openOverseasClubModal')) {
    dbHtml = dbHtml.replace(
      '</script>\r\n</body>',
      overseasModalControllerScript + '\r\n  </script>\r\n</body>'
    );
  }
}

fs.writeFileSync(path.join(ROOT, 'database.html'), dbHtml, 'utf8');
console.log('✓ Successfully upgraded database.html with interactive overseas club dossier modal.');


// =========================================================================
// 4. UPGRADE international.html
// =========================================================================
console.log('3. Upgrading international.html with Overseas Club Dossier Modal...');

let intlHtml = fs.readFileSync(path.join(ROOT, 'international.html'), 'utf8');

// Insert modal markup right before toast notification
if (!intlHtml.includes('id="overseasClubModal"')) {
  intlHtml = intlHtml.replace(
    '<!-- Global Toast Notification Container -->',
    overseasClubModalMarkup + '\n  <!-- Global Toast Notification Container -->'
  );
  console.log('✓ Added overseas club modal markup to international.html');
}

// Update overseas clubs card in international.html to be clickable and trigger modal
const oldIntlCard = `<div class="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-rose-500/50 transition-all duration-200 space-y-3 flex flex-col justify-between group">`;
const newIntlCard = `<div class="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-rose-500/50 transition-all duration-200 space-y-3 flex flex-col justify-between group cursor-pointer" onclick="openOverseasClubModal('\${c.id}')">`;

intlHtml = intlHtml.replace(oldIntlCard, newIntlCard);

// Add modal controller script into international.html
if (!intlHtml.includes('window.openOverseasClubModal')) {
  intlHtml = intlHtml.replace(
    '</script>\n</body>',
    overseasModalControllerScript + '\n  </script>\n</body>'
  );
  if (!intlHtml.includes('window.openOverseasClubModal')) {
    intlHtml = intlHtml.replace(
      '</script>\r\n</body>',
      overseasModalControllerScript + '\r\n  </script>\r\n</body>'
    );
  }
}

fs.writeFileSync(path.join(ROOT, 'international.html'), intlHtml, 'utf8');
console.log('✓ Successfully upgraded international.html with interactive overseas club dossier modal.');


// =========================================================================
// 5. UPGRADE scout.html (Universal Query Parameter Deep-Linking)
// =========================================================================
console.log('4. Upgrading scout.html with Universal Query Parameter Deep-Linking...');

let scoutHtml = fs.readFileSync(path.join(ROOT, 'scout.html'), 'utf8');

const oldScoutUrlLogic = `// 4. Check for URL Parameter ?player=... or ?id=...
      const urlPlayerId = (typeof BlueLineUI !== 'undefined' && BlueLineUI.getActivePlayerIdFromUrl) ? BlueLineUI.getActivePlayerIdFromUrl() : null;
      if (urlPlayerId) {
        const found = allAthletes.find(p => p.id === urlPlayerId || (p.name && p.name.toLowerCase().includes(urlPlayerId.toLowerCase())));
        if (found) {
          setActiveAthlete(found);
          if (typeof BlueLineUI !== 'undefined' && BlueLineUI.showToast) {
            BlueLineUI.showToast(\`Loaded \${found.name} into Live Micro-Telemetry Desk.\`, 'success');
          }
        } else {
          setDefaultAthlete();
        }
      } else {
        setDefaultAthlete();
      }`;

const newScoutUrlLogic = `// 4. Check for Universal Query Parameters (?player=, ?id=, ?club=, ?search=, ?q=, ?team=)
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

scoutHtml = scoutHtml.replace(oldScoutUrlLogic, newScoutUrlLogic);

fs.writeFileSync(path.join(ROOT, 'scout.html'), scoutHtml, 'utf8');
console.log('✓ Successfully upgraded scout.html with universal query parameter routing.');

console.log('=== ALL NEXT PHASE UPGRADES APPLIED SUCCESSFULLY ===');
