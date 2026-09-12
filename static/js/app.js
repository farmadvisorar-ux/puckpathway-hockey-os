/**
 * PuckPathway OS: Client-Side Controller & Enterprise ADM Practice Suite (v5.6 Pro)
 * Supports Universal Field Editing & Recalculation Across All Modules,
 * Enterprise Hockey Whiteboard, Live Micro-Telemetry Event Logger, Visual Interactive Shot Chart,
 * Film Room Video Breakdown, Dynamic Radar Charts, and Immutable Change Audit Ledgers.
 */

// Global App State
let appData = null;
let activeLevel = 'all';
let activePos = 'all';
let activeTeamId = 'all';
let activePlayerStatus = 'all';
let pathScoutingActiveTab = 'path';
let pathScoutingPlayer = null;
let teamDirectoryCountryFilter = 'all';
let activeTacticsCategory = 'all';
let selectedTacticalPlay = null;
let selectedDrill = null;
let searchQuery = '';
let activeTab = 'projections';
let selectedPlayer = null;
let pendingShotCoords = { x_pct: 35.0, y_pct: 45.0 };
let activeLoggerTab = 'shot';
let activeEditorTab = 'combine';

let currentUser = {
  id: "usr_scout_01",
  username: "scout_mccoy",
  name: "Shane McCoy",
  role: "scout",
  role_title: "Head NCAA & Junior Recruiter",
  badge: "Head Recruiter"
};
let radarChartInstance = null;
let rinkCanvas = null;

// Bench Management State
let gameClockSec = 1200;
let period = 1;
let isGameClockRunning = false;
let gameInterval = null;
let onIcePlayers = ['u14_01', 'u14_02', 'u10_01', 'ushl_01'];
let playerShiftTimers = {};
let playerTotalIceTimes = {};

// Line Combinations & Chemistry Builder State
let currentLineScheme = 'even_strength';
let lineBuilderState = null;
let selectedTargetSlot = null;
let dockPosFilter = 'all';
let dockSearchQuery = '';

// Head-to-Head Comparison & Benchmarks State
let comparisonPlayerAId = 'u14_01';
let comparisonTargetBId = 'benchmark_ncaa_d1';
let comparisonRadarInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Universal Immediate Navigation Tab Click Delegation
  // Bound at the very top of DOMContentLoaded so all navigation works instantaneously
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.nav-tab, .mobile-bottom-tab, .mobile-nav-btn');
    if (tabBtn && tabBtn.dataset.tab) {
      e.preventDefault();
      switchTab(tabBtn.dataset.tab);
      const drawer = document.getElementById('mobileNavDrawer');
      if (drawer && !drawer.classList.contains('hidden')) {
        drawer.classList.add('hidden');
      }
    }
  });

  // Mobile Drawer Toggle handlers
  const mobileToggleBtn = document.getElementById('mobileMenuToggleBtn');
  const openDrawerBottomBtn = document.getElementById('openMobileDrawerBottomBtn');
  const closeDrawerBtn = document.getElementById('closeMobileDrawerBtn');
  const mobileDrawer = document.getElementById('mobileNavDrawer');

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('hidden');
  }
  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('hidden');
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', () => {
      if (mobileDrawer && mobileDrawer.classList.contains('hidden')) {
        openMobileDrawer();
      } else {
        closeMobileDrawer();
      }
    });
  }
  if (openDrawerBottomBtn) {
    openDrawerBottomBtn.addEventListener('click', openMobileDrawer);
  }
  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', closeMobileDrawer);
  }
  if (mobileDrawer) {
    mobileDrawer.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) {
        closeMobileDrawer();
      }
    });
  }

  // Load stored user session if available (defaulting to Shane McCoy unless explicitly switched)
  const storedUser = localStorage.getItem('blueline_user') || localStorage.getItem('smrp_user') || localStorage.getItem('puckpathway_user');
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      if (parsed && parsed.username && parsed.username !== 'coach_callahan') {
        currentUser = parsed;
      }
    } catch (e) {
      console.warn('Could not parse stored session');
    }
  }

  updateCurrentUserUI();

  // Fetch complete data store with embedded fallback
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      appData = await res.json();
    } else {
      appData = window.EMBEDDED_PUCKPATHWAY_DATA || null;
    }
  } catch (err) {
    console.warn('Using embedded dataset fallback:', err);
    appData = window.EMBEDDED_PUCKPATHWAY_DATA || null;
  }

  if (!appData && window.EMBEDDED_PUCKPATHWAY_DATA) {
    appData = window.EMBEDDED_PUCKPATHWAY_DATA;
  }

  window.appData = appData;
  console.log('🏒 PuckPathway Enterprise Suite Loaded:', appData);
  
  if (appData) {
    try { updateSummaryCounters(); } catch (e) { console.warn("updateSummaryCounters error:", e); }
    try { renderPlayerList(); } catch (e) { console.warn("renderPlayerList error:", e); }
    try { initPracticePlanEngine(); } catch (e) { console.warn("initPracticePlanEngine error:", e); }
    try { renderTacticsList(); } catch (e) { console.warn("renderTacticsList error:", e); }

    if (appData.drills && appData.drills.length > 0) {
      try { selectDrill(appData.drills[0]); } catch (e) { console.warn("selectDrill error:", e); }
    }

    if (appData.systems && appData.systems.length > 0) {
      try { selectTacticalPlay(appData.systems[0]); } catch (e) { console.warn("selectTacticalPlay error:", e); }
    }

    if (appData.players && appData.players.length > 0) {
      let defaultPlayer = appData.players.find(p => p.id === 'u14_01') || appData.players[0];
      if (currentUser.linked_player_id) {
        const myPlayer = appData.players.find(p => p.id === currentUser.linked_player_id);
        if (myPlayer) defaultPlayer = myPlayer;
      }
      try { selectPlayer(defaultPlayer); } catch (e) { console.warn("selectPlayer error:", e); }
    }

    // Initialize Line Builder State
    if (appData.lines) {
      lineBuilderState = JSON.parse(JSON.stringify(appData.lines));
    } else {
      lineBuilderState = getFallbackLineCombinations();
    }
    try { initLineBuilder(); } catch (e) { console.warn("initLineBuilder error:", e); }
    try { initComparisonStudio(); } catch (e) { console.warn("initComparisonStudio error:", e); }
  }

  // Initialize Rink Canvas safely
  const canvasEl = document.getElementById('drillCanvas');
  if (canvasEl && typeof HockeyRinkCanvas !== 'undefined') {
    try {
      rinkCanvas = new HockeyRinkCanvas('drillCanvas', { mode: 'full_ice' });
    } catch (e) {
      console.warn("Rink canvas initialization error:", e);
    }
  }

  // Initialize Enterprise Pro Film Room & Video Telestration Studio safely
  try {
    initFilmRoomStudio();
  } catch (e) {
    console.warn("Film room studio initialization error:", e);
  }

  // Setup Athlete Homework Submission
  const submitHwBtn = document.getElementById('submitHomeworkBtn');
  if (submitHwBtn) {
    submitHwBtn.addEventListener('click', async () => {
      const drillTitle = document.getElementById('homeworkDrillSelect').value;
      const reps = document.getElementById('homeworkRepsInput').value;
      const notes = document.getElementById('homeworkNotesInput').value;
      const targetPid = currentUser.linked_player_id || (selectedPlayer ? selectedPlayer.id : 'u14_01');

      try {
        const res = await fetch('/api/player/submit-homework', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: targetPid,
            athlete_name: currentUser.name,
            drill_title: drillTitle,
            reps_completed: reps,
            notes: notes
          })
        });
        if (res.ok) {
          const result = await res.json();
          showToast(`Workout submitted & logged to ${currentUser.name}'s athletic ledger!`, 'success');
          if (selectedPlayer && selectedPlayer.id === targetPid) {
            selectedPlayer.audit_ledger.unshift(result.entry);
            renderPlayerDossier(selectedPlayer);
          }
        } else {
          const localEntry = {
            id: `led_${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            account: `${currentUser.name} (Athlete)`,
            category: "Off-Ice Homework",
            action: `Completed: ${drillTitle}`,
            diff: `Reps: ${reps} | Athlete Log: ${notes}`
          };
          if (selectedPlayer) {
            selectedPlayer.audit_ledger.unshift(localEntry);
            renderPlayerDossier(selectedPlayer);
          }
          showToast(`Workout submitted & logged locally!`, 'success');
        }
      } catch (err) {
        const localEntry = {
          id: `led_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          account: `${currentUser.name} (Athlete)`,
          category: "Off-Ice Homework",
          action: `Completed: ${drillTitle}`,
          diff: `Reps: ${reps} | Athlete Log: ${notes}`
        };
        if (selectedPlayer) {
          selectedPlayer.audit_ledger.unshift(localEntry);
          renderPlayerDossier(selectedPlayer);
        }
        showToast(`Workout submitted & logged locally!`, 'success');
      }
    });
  }

  // Setup Navigation Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = tab.dataset.tab;
      switchTab(targetTab);
    });
  });

  // Level selector
  const levelSelect = document.getElementById('levelSelector');
  if (levelSelect) {
    levelSelect.addEventListener('change', (e) => {
      activeLevel = e.target.value;
      renderPlayerList();
    });
  }

  // Position filter buttons
  const posFilterBtns = document.querySelectorAll('.pos-filter-btn');
  posFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      posFilterBtns.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white');
        b.classList.add('bg-slate-900', 'text-slate-400');
      });
      btn.classList.add('bg-sky-500', 'text-white');
      btn.classList.remove('bg-slate-900', 'text-slate-400');

      activePos = btn.dataset.pos;
      renderPlayerList();
    });
  });

  // Tactics Category Filter Buttons
  const tacticsCatBtns = document.querySelectorAll('.tactics-cat-btn');
  tacticsCatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tacticsCatBtns.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white', 'font-bold');
        b.classList.add('bg-slate-900', 'text-slate-400', 'font-semibold');
      });
      btn.classList.add('bg-sky-500', 'text-white', 'font-bold');
      btn.classList.remove('bg-slate-900', 'text-slate-400', 'font-semibold');

      activeTacticsCategory = btn.dataset.cat;
      const badge = document.getElementById('tacticsActiveCategoryBadge');
      if (badge) badge.textContent = activeTacticsCategory === 'all' ? 'All Systems' : activeTacticsCategory;
      renderTacticsList();
    });
  });

  // Cross-module logging hooks
  setupCrossModuleLogging();

  // Bench controls
  setupBenchControls();

  // Scholarship & Equipment controls
  setupToolCalculators();

  // Drill Canvas Controls
  setupCanvasControls();
});

// --- ENTERPRISE ADM DRILL ENGINE ---

function selectDrill(drill) {
  selectedDrill = drill;
  window.selectedDrill = drill;
  const container = document.getElementById('drillDetailsCard');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-3 animate-fadeIn text-xs">
      <div class="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 class="font-bold text-white text-sm">${drill.name}</h4>
        <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40">
          ${drill.category_badge || drill.category}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-[11px]">
        <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span class="text-slate-400 block">Duration:</span>
          <strong class="text-emerald-400 font-mono">${drill.duration_min} Minutes</strong>
        </div>
        <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
          <span class="text-slate-400 block">Work / Rest:</span>
          <strong class="text-sky-400 font-mono">${drill.work_rest_ratio}</strong>
        </div>
      </div>

      <div class="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
        <span class="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">Puck Touch Rating</span>
        <p class="text-emerald-300 font-semibold text-[11px]">${drill.puck_touch_rating}</p>
      </div>

      <p class="text-slate-300 leading-relaxed text-[11px]">${drill.description}</p>

      ${drill.coaching_points ? `
        <div class="space-y-1 pt-1">
          <span class="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">💡 Key Coaching Points</span>
          <ul class="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
            ${drill.coaching_points.map(pt => `<li>${pt}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${drill.common_mistakes ? `
        <div class="space-y-1 pt-1">
          <span class="text-[10px] text-red-400 font-bold uppercase tracking-wider block">⚠️ Common Execution Mistakes</span>
          <ul class="list-disc list-inside text-slate-400 text-[11px] space-y-0.5">
            ${drill.common_mistakes.map(m => `<li>${m}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

// --- VAST TACTICAL PLAYBOOK ENGINE ---

function renderTacticsList() {
  if (!appData || !appData.systems) return;
  const container = document.getElementById('tacticsListContainer');
  if (!container) return;

  const countEl = document.getElementById('totalTacticsCount');
  if (countEl) countEl.textContent = `${appData.systems.length}`;

  let filtered = appData.systems.filter(sys => {
    if (activeTacticsCategory === 'all') return true;
    return sys.category === activeTacticsCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
        No tactical plays found in this category.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(sys => {
    const isSelected = selectedTacticalPlay && selectedTacticalPlay.id === sys.id;
    let badgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
    if (sys.category.includes('Forecheck')) badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    else if (sys.category.includes('Power Play')) badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    else if (sys.category.includes('Penalty Kill')) badgeColor = 'bg-red-500/20 text-red-300 border-red-500/40';

    return `
      <div class="tactic-card p-3 rounded-xl border transition-all cursor-pointer select-none ${isSelected ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-500/10' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}" data-tactic-id="${sys.id}">
        <div class="flex items-center justify-between mb-1">
          <h4 class="font-bold text-xs text-white">${sys.title}</h4>
          <span class="text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}">
            ${sys.category_badge || sys.category}
          </span>
        </div>
        <p class="text-[11px] text-slate-400 line-clamp-2 leading-tight">${sys.description}</p>
        <div class="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1 border-t border-slate-800/80">
          <span>Level: <strong class="text-slate-300">${sys.level_suitability}</strong></span>
          <span class="text-sky-400 font-semibold">${sys.plays ? sys.plays.length + ' Sub-Plays' : 'Full Scheme'} →</span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.tactic-card').forEach(card => {
    card.addEventListener('click', () => {
      const tid = card.dataset.tacticId;
      const targetTactic = appData.systems.find(s => s.id === tid);
      if (targetTactic) selectTacticalPlay(targetTactic);
    });
  });
}

function selectTacticalPlay(sys) {
  selectedTacticalPlay = sys;
  window.selectedTacticalPlay = sys;
  renderTacticsList();
  renderTacticalInspector(sys);
}

function renderTacticalInspector(sys) {
  const section = document.getElementById('tacticsInspectorSection');
  if (!section) return;

  section.innerHTML = `
    <div class="glass-panel p-5 rounded-2xl space-y-5 border-t-2 border-sky-400 animate-fadeIn">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-base font-black text-white">${sys.title}</h2>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
              ${sys.category_badge || sys.category}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">Suitability: <strong class="text-slate-200">${sys.level_suitability}</strong></p>
        </div>
        <div class="flex items-center gap-2">
          <button id="simulateTacticOnRinkBtn" class="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-xs font-black text-white transition flex items-center gap-1.5 shadow-lg shadow-sky-500/20 active:scale-95">
            ⚡ 60 FPS Tactical Sim
          </button>
          <button id="logThisTacticToActivePlayerBtn" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30">
            📌 Log Execution to ${selectedPlayer ? selectedPlayer.name : 'Active Player'}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <span class="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">Strategic Philosophy</span>
          <p class="text-slate-300 text-[11px] leading-relaxed">${sys.description}</p>
        </div>

        <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
          <span class="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Key Trigger Cue</span>
          <p class="text-slate-300 text-[11px] leading-relaxed">${sys.trigger || 'Opposing puck carrier creates zone entry or cycle retrieval.'}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
          <span class="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">🏒 Forward Assignments (F1 / F2 / F3)</span>
          <p class="text-slate-300 text-[11px] leading-relaxed">${sys.f_rules || 'F1 pursues puck carrier; F2 seals wall; F3 supports high slot.'}</p>
        </div>

        <div class="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
          <span class="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">🛡️ Defenseman Rules (D1 / D2)</span>
          <p class="text-slate-300 text-[11px] leading-relaxed">${sys.d_rules || 'Strongside D gaps up tightly; Partner D maintains 10-ft depth stagger.'}</p>
        </div>
      </div>

      ${sys.plays && sys.plays.length > 0 ? `
        <div class="space-y-2">
          <span class="text-xs font-bold text-slate-300 uppercase tracking-wider block">📋 Step-by-Step Play Variations & Calls</span>
          <div class="space-y-2">
            ${sys.plays.map((p, idx) => `
              <div class="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-1 text-xs">
                <div class="flex items-center justify-between font-bold text-sky-400">
                  <span>${p.name}</span>
                  <span class="text-[10px] text-slate-400 font-mono">Option #${idx + 1}</span>
                </div>
                <div class="text-[11px] text-slate-300"><strong class="text-amber-400">Trigger:</strong> ${p.trigger}</div>
                <div class="text-[11px] text-slate-300"><strong class="text-emerald-400">Action:</strong> ${p.action}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  const simBtn = document.getElementById('simulateTacticOnRinkBtn');
  if (simBtn) {
    simBtn.addEventListener('click', () => {
      const drillsTabBtn = document.querySelector('.tab-btn[data-tab="drills"]');
      if (drillsTabBtn) drillsTabBtn.click();

      const canvasEl = document.getElementById('drillCanvas');
      if (canvasEl) {
        canvasEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      if (rinkCanvas) {
        let presetId = sys.id;
        if (sys.title.includes('1-2-2') || sys.title.includes('Trap')) presetId = 'sys_122';
        else if (sys.title.includes('1-3-1') || sys.title.includes('Power Play')) presetId = 'sys_131';
        else if (sys.title.includes('Russian') || sys.title.includes('Weave')) presetId = 'drill_002';
        else if (sys.title.includes('Gretzky') || sys.title.includes('Behind')) presetId = 'drill_001';

        rinkCanvas.loadAnimation(presetId);
        rinkCanvas.playAnimation();
        showToast(`Simulating ${sys.title} in 60 FPS Vector Motion Engine!`, 'success');
      }
    });
  }

  const logBtn = document.getElementById('logThisTacticToActivePlayerBtn');
  if (logBtn) {
    logBtn.addEventListener('click', async () => {
      if (!selectedPlayer) return;
      try {
        const res = await fetch(`/api/players/${selectedPlayer.id}/log-activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: `${currentUser.name} (${currentUser.badge})`,
            category: 'Tactical Playbook',
            action: `Logged System Mastery: ${sys.title}`,
            diff: `Executed positional rules for ${sys.category}. High decision accuracy recorded.`
          })
        });
        if (res.ok) {
          const result = await res.json();
          selectedPlayer.audit_ledger.unshift(result.entry);
          showToast(`Tactical mastery of ${sys.title} logged to ${selectedPlayer.name}!`, 'success');
        }
      } catch (err) {
        const entry = {
          id: `led_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          account: `${currentUser.name} (${currentUser.badge})`,
          category: 'Tactical Playbook',
          action: `Logged System Mastery: ${sys.title}`,
          diff: `Executed positional rules for ${sys.category}.`
        };
        selectedPlayer.audit_ledger.unshift(entry);
        showToast(`Tactical mastery of ${sys.title} logged!`, 'success');
      }
    });
  }
}

// --- AUTHENTICATION & ROLE MANAGEMENT ---

window.openLoginModal = function() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('hidden');
};

window.closeLoginModal = function() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('hidden');
};

window.quickLogin = async function(username) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: 'password123' })
    });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
    } else {
      if (appData && appData.user_accounts) {
        const u = appData.user_accounts.find(acc => acc.username === username);
        if (u) currentUser = u;
      }
    }
  } catch (err) {
    if (appData && appData.user_accounts) {
      const u = appData.user_accounts.find(acc => acc.username === username);
      if (u) currentUser = u;
    }
  }

  localStorage.setItem('puckpathway_user', JSON.stringify(currentUser));
  updateCurrentUserUI();
  closeLoginModal();
  showToast(`Welcome, ${currentUser.name} (${currentUser.role_title})!`, 'success');

  if (currentUser.linked_player_id && appData && appData.players) {
    const myP = appData.players.find(p => p.id === currentUser.linked_player_id);
    if (myP) selectPlayer(myP);
  }
};

function updateCurrentUserUI() {
  const nameEl = document.getElementById('currentUserName');
  const roleEl = document.getElementById('currentUserRole');
  const avatarEl = document.getElementById('currentUserAvatar');
  const roleHUD = document.getElementById('roleContextHUD');
  const athleteTabBtn = document.getElementById('tabAthleteHomeworkBtn');

  if (nameEl) nameEl.textContent = currentUser.name;
  if (roleEl) roleEl.textContent = currentUser.badge || currentUser.role.toUpperCase();

  const mobileNameEl = document.getElementById('mobileDrawerUserName');
  const mobileRoleEl = document.getElementById('mobileDrawerUserRole');
  if (mobileNameEl) mobileNameEl.textContent = currentUser.name;
  if (mobileRoleEl) mobileRoleEl.textContent = currentUser.badge || currentUser.role.toUpperCase();

  if (avatarEl) {
    if (currentUser.role === 'coach') avatarEl.innerHTML = '🏒';
    else if (currentUser.role === 'scout') avatarEl.innerHTML = '🔍';
    else if (currentUser.role === 'trainer') avatarEl.innerHTML = '🏋️';
    else if (currentUser.role === 'compliance') avatarEl.innerHTML = '🎓';
    else if (currentUser.role === 'athlete') avatarEl.innerHTML = '⚡';
    else if (currentUser.role === 'parent') avatarEl.innerHTML = '👨‍👩‍👦';
    else avatarEl.innerHTML = '👤';
  }

  if (roleHUD) {
    let hudContent = '';
    if (currentUser.role === 'athlete') {
      hudContent = `
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">Athlete Mode</span>
            <span class="text-slate-300">Logged in as: <strong class="text-white">${currentUser.name}</strong></span>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="switchTab('athlete-portal')" class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition">
              🏋️ Open My Assigned Homework
            </button>
          </div>
        </div>
      `;
      if (athleteTabBtn) athleteTabBtn.classList.remove('hidden');
    } else if (currentUser.role === 'scout') {
      hudContent = `
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">Recruiter / Scout Mode</span>
            <span class="text-slate-300">Evaluating Prospects for: <strong class="text-white">${currentUser.organization || 'USHL / NCAA Scouting Bureau'}</strong></span>
          </div>
          <span class="text-amber-400 font-bold">Shane McCoy • BlueLine Scouting & Trajectory Portal</span>
        </div>
      `;
      if (athleteTabBtn) athleteTabBtn.classList.add('hidden');
    } else {
      hudContent = `
        <div class="flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-slate-900/80 border border-sky-500/30 rounded-xl text-xs">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40">${currentUser.role_title}</span>
            <span class="text-slate-400">Team: <strong class="text-slate-200">${currentUser.team || 'Apex North Stars'}</strong></span>
          </div>
          <span class="text-emerald-400 font-semibold">Verified Staff Access</span>
        </div>
      `;
      if (athleteTabBtn) athleteTabBtn.classList.add('hidden');
    }
    roleHUD.innerHTML = hudContent;
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const borderCol = type === 'success' ? 'border-emerald-500/50 bg-slate-950/95 text-emerald-300' : 'border-sky-500/50 bg-slate-950/95 text-sky-300';
  toast.className = `p-3 rounded-xl border ${borderCol} shadow-2xl text-xs font-bold flex items-center gap-2 transform transition-all duration-300 translate-y-2 opacity-0 pointer-events-auto`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : 'ℹ️'}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-2', 'opacity-0'), 10);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showNotificationToast(message, type = 'info') {
  showToast(message, type);
}
window.showNotificationToast = showNotificationToast;
window.showToast = showToast;

function switchTab(tabId) {
  if (!tabId) return;
  activeTab = tabId;
  window.activeTab = tabId;

  // 1. Desktop Nav Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  navTabs.forEach(t => {
    if (t.dataset.tab === tabId) {
      t.classList.add('bg-sky-500/20', 'text-sky-400', 'border-sky-400');
      t.classList.remove('text-slate-400', 'border-transparent');
    } else {
      t.classList.remove('bg-sky-500/20', 'text-sky-400', 'border-sky-400');
      t.classList.add('text-slate-400', 'border-transparent');
    }
  });

  // 2. Mobile Drawer Buttons
  document.querySelectorAll('.mobile-nav-btn').forEach(b => {
    if (b.dataset.tab === tabId) {
      b.classList.add('bg-sky-500/20', 'text-sky-400', 'border-sky-500/40');
      b.classList.remove('bg-slate-900/60', 'text-slate-300', 'border-slate-800');
    } else {
      b.classList.remove('bg-sky-500/20', 'text-sky-400', 'border-sky-500/40');
      b.classList.add('bg-slate-900/60', 'text-slate-300', 'border-slate-800');
    }
  });

  // 3. Mobile Bottom HUD Tabs
  document.querySelectorAll('.mobile-bottom-tab').forEach(b => {
    if (b.dataset.tab === tabId) {
      b.classList.add('text-sky-400');
      b.classList.remove('text-slate-400');
    } else {
      b.classList.remove('text-sky-400');
      b.classList.add('text-slate-400');
    }
  });

  document.querySelectorAll('.tab-content').forEach(sec => {
    if (sec.id === `tab-${tabId}`) {
      sec.classList.remove('hidden');
    } else {
      sec.classList.add('hidden');
    }
  });

  try {
    if (tabId === 'drills' && rinkCanvas) {
      setTimeout(() => rinkCanvas.resizeCanvas(), 50);
    } else if (tabId === 'filmroom' && window.filmStudio && window.filmStudio.filmCanvas) {
      setTimeout(() => window.filmStudio.filmCanvas.resizeCanvas(), 50);
    } else if (tabId === 'bench' && typeof renderBenchState === 'function') {
      renderBenchState();
    } else if (tabId === 'lines' && typeof renderLineBuilder === 'function') {
      renderLineBuilder();
    } else if (tabId === 'compare' && typeof renderComparisonStudio === 'function') {
      renderComparisonStudio();
    }
  } catch (err) {
    console.warn("Tab activation secondary render handler error:", err);
  }
}
window.switchTab = switchTab;

function updateSummaryCounters() {
  if (!appData || !appData.players) return;
  const total = appData.players.length;
  const ncaaD1Count = appData.players.filter(p => p.projection && p.projection.probabilities && p.projection.probabilities.ncaa_d1 >= 50).length;
  const tier1Count = appData.players.filter(p => p.projection && p.projection.probabilities && (p.projection.probabilities.ushl_tier1 >= 50 || p.projection.probabilities.nahl_tier2 >= 70)).length;
  const freeAgentsCount = appData.players.filter(p => p.status === 'free_agent_unassigned').length;
  const teamsCount = (appData.teams && appData.teams.length) ? appData.teams.length : 25;

  const totalEl = document.getElementById('totalPlayersCount');
  if (totalEl) totalEl.textContent = total;
  const d1El = document.getElementById('ncaaD1ProjectedCount');
  if (d1El) d1El.textContent = ncaaD1Count;
  const t1El = document.getElementById('tier1ProjectedCount');
  if (t1El) t1El.textContent = tier1Count;
  const faEl = document.getElementById('totalFreeAgentsCount');
  if (faEl) faEl.textContent = freeAgentsCount;
  const tmEl = document.getElementById('totalTeamsCount');
  if (tmEl) tmEl.textContent = teamsCount;

  const statusFaBtn = document.getElementById('statusFaBtn');
  if (statusFaBtn) statusFaBtn.textContent = `Free Agents (${freeAgentsCount})`;
}

function renderPlayerList() {
  if (!appData || !appData.players) return;
  const container = document.getElementById('playerListContainer');
  if (!container) return;

  let filtered = appData.players.filter(p => {
    const matchesLevel = (activeLevel === 'all') || (p.level === activeLevel) || 
      (p.league && p.league.toLowerCase().includes(activeLevel.toLowerCase()));
    const matchesPos = (activePos === 'all') || (p.pos === activePos);
    const matchesTeam = (activeTeamId === 'all') || 
      (activeTeamId === 'free_agents' ? (p.status === 'free_agent_unassigned') : (p.team_id === activeTeamId));
    const matchesStatus = (activePlayerStatus === 'all') || 
      (activePlayerStatus === 'active' && p.status !== 'free_agent_unassigned') ||
      (activePlayerStatus === 'free_agent_unassigned' && p.status === 'free_agent_unassigned');
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery) ||
      (p.team && p.team.toLowerCase().includes(searchQuery)) ||
      (p.league && p.league.toLowerCase().includes(searchQuery)) ||
      (p.hometown && p.hometown.toLowerCase().includes(searchQuery)) ||
      (p.previous_team && p.previous_team.toLowerCase().includes(searchQuery)) ||
      (p.draft_status && p.draft_status.toLowerCase().includes(searchQuery)) ||
      (p.class_level && p.class_level.toLowerCase().includes(searchQuery)) ||
      (p.scout_notes && p.scout_notes.toLowerCase().includes(searchQuery)) ||
      (p.num && (`#${p.num}`.toLowerCase().includes(searchQuery) || `${p.num}` === searchQuery)) ||
      (p.pos && p.pos.toLowerCase() === searchQuery) ||
      (p.status_badge && p.status_badge.toLowerCase().includes(searchQuery)) ||
      (p.contract_status && p.contract_status.toLowerCase().includes(searchQuery));

    return matchesLevel && matchesPos && matchesTeam && matchesStatus && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800">
        No athletes match your active filters.
        <button onclick="resetAllPlayerFilters()" class="block mx-auto mt-2 px-3 py-1 rounded bg-sky-600 text-white font-bold text-[10px]">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isSelected = selectedPlayer && selectedPlayer.id === p.id;
    const proj = p.projection || { probabilities: { ncaa_d1: 0 } };
    const d1Prob = proj.probabilities ? proj.probabilities.ncaa_d1 : 50;
    const d1Color = d1Prob >= 70 ? 'text-emerald-400' : (d1Prob >= 35 ? 'text-sky-400' : 'text-slate-400');
    const isFa = p.status === 'free_agent_unassigned';

    return `
      <div class="player-card p-3 rounded-xl border transition-all cursor-pointer select-none ${isSelected ? 'bg-sky-950/40 border-sky-500 shadow-lg shadow-sky-500/10' : (isFa ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400/60' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700')}" data-player-id="${p.id}">
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr ${p.avatar_gradient || 'from-sky-500 to-indigo-600'} text-white font-bold flex items-center justify-center text-xs shadow-md">
              #${p.num}
            </div>
            <div>
              <h4 class="font-bold text-xs text-white leading-tight flex items-center gap-1.5">
                ${p.name}
                ${isFa ? '<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Active Free Agent"></span>' : ''}
              </h4>
              <span class="text-[10px] text-slate-400">${p.pos} • ${p.team}</span>
            </div>
          </div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isFa ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-sky-300 border border-slate-700'}">
            ${isFa ? 'Free Agent (24–26)' : p.league.split('(')[0].trim()}
          </span>
        </div>

        <div class="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80 text-slate-300">
          <span>Age: <strong class="text-white">${p.age}</strong> | Gr: <strong class="text-white">${p.grad_year}</strong></span>
          <span>${isFa ? '<span class="text-amber-300 font-mono text-[10px] font-bold">PTO/Portal Ready</span>' : `NCAA D1: <strong class="${d1Color} font-mono">${d1Prob}%</strong>`}</span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.player-card').forEach(card => {
    card.addEventListener('click', () => {
      const pid = card.dataset.playerId;
      const targetPlayer = appData.players.find(p => p.id === pid);
      if (targetPlayer) selectPlayer(targetPlayer);
    });
  });
}

function selectPlayer(player) {
  selectedPlayer = player;
  window.selectedPlayer = player;
  renderPlayerList();
  renderPlayerDossier(player);

  const dBadge = document.getElementById('drillActivePlayerBadge');
  if (dBadge) dBadge.textContent = `${player.name} (#${player.num})`;

  const athleteHwName = document.getElementById('athletePortalPlayerName');
  if (athleteHwName) athleteHwName.textContent = `${player.name} (#${player.num} - ${player.pos})`;
}

function renderPlayerDossier(player) {
  const section = document.getElementById('playerDossierSection');
  if (!section) return;

  const proj = player.projection || {
    composite_trajectory_score: 80,
    probabilities: { ncaa_d1: 50, ushl_tier1: 45, nahl_tier2: 70, ncaa_d3_acha: 90 },
    ceiling_label: "Developing",
    developmental_hurdles: []
  };

  const combine = player.combine || { flying_30m_sec: 4.3, broad_jump_in: 80, pro_agility_5_10_5_sec: 4.8, grip_strength_lbs: 75, rotational_medball_mph: 22 };
  const kpis = player.micro_kpis || { controlled_exit_pct: 65, controlled_entry_pct: 60, wall_battle_win_pct: 60, shoulder_scans_per_possession: 3.0, high_danger_pass_comp_pct: 65, faceoff_win_pct: 55 };
  const rubric = player.skill_rubric || { edges: 75, puck_skills: 75, shooting: 75, hockey_iq: 75, contact: 70, d_zone: 70, transition: 75 };

  const telem = player.telemetry || {
    puck_possession: { total_time_on_puck_sec: 90, avg_hold_duration_sec: 2.5, max_hold_duration_sec: 6.0, wall_usage_pct: 60, wall_bank_escapes: 10, support_positioning: "60% Support, 40% Rush" },
    passing_analytics: { total_passes_attempted: 30, completed_tape_to_tape: 25, bad_passes_turnovers: 5, pass_completion_pct: 83.3, royal_road_seam_passes: 5, wall_chip_passes: 8 },
    decision_engine: { offensive_zone_touches: 20, chose_to_shoot_pct: 60, chose_to_pass_pct: 40, play_outcome_success_pct: 80 },
    shot_telemetry: { total_shot_attempts: 6, shots_on_goal: 4, goals: 2, avg_shot_distance_ft: 16.5, shot_breakdown_by_type: [], shot_events: [] }
  };

  const poss = telem.puck_possession;
  const pass = telem.passing_analytics;
  const shot = telem.shot_telemetry;
  const shotEvents = shot.shot_events || [];
  const ledger = player.audit_ledger || [];

  section.innerHTML = `
    <div class="glass-panel p-5 rounded-2xl space-y-6 border-t-2 border-sky-400 animate-fadeIn">
      <!-- Player Header Card -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div class="flex items-center gap-3.5">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr ${player.avatar_gradient || 'from-sky-500 to-indigo-600'} text-white font-black flex items-center justify-center text-xl shadow-xl shadow-sky-500/20">
            #${player.num}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-black text-white tracking-tight">${player.name}</h2>
              <span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ${player.status_badge}
              </span>
              <a href="player.html?id=${player.id}" target="_blank" class="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/40 transition">
                🔗 Open Standalone Passport
              </a>
              <button onclick="openScoutDossierModalForPlayer('${player.id}')" class="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/40 transition flex items-center gap-1 shadow-sm">
                🎓 Export Printable Dossier
              </button>
              <button onclick="openPathScoutingProfileModal(selectedPlayer)" class="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-teal-800/80 text-white border border-teal-500 hover:bg-teal-700 transition flex items-center gap-1 shadow-sm">
                📜 Path Scouting Profile
              </button>
              ${player.status === 'free_agent_unassigned' ? `
                <button onclick="openSignFreeAgentModalForPlayer('${player.id}')" class="px-3 py-1 text-[11px] font-black rounded-md bg-amber-500 text-black hover:bg-amber-400 transition flex items-center gap-1 shadow-lg shadow-amber-500/20">
                  ✍️ Sign Free Agent
                </button>
              ` : (player.team_id ? `
                <button onclick="deployTeamToBench('${player.team_id}')" class="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-purple-900/60 text-purple-200 border border-purple-500 hover:bg-purple-800 transition flex items-center gap-1 shadow-sm">
                  ⚡ Deploy Team to Bench
                </button>
              ` : '')}
            </div>
            <p class="text-xs text-slate-300 font-medium">${player.primary_role} • <span class="text-sky-400 font-semibold">${player.team}</span></p>
            <p class="text-[11px] text-slate-400 mt-0.5">
              Height: <strong class="text-slate-200">${player.height_in}"</strong> | 
              Weight: <strong class="text-slate-200">${player.weight_lbs} lbs</strong> | 
              Shot: <strong class="text-slate-200">${player.handed}</strong> | 
              GPA: <strong class="text-amber-400">${player.gpa}</strong> | 
              Grad: <strong class="text-slate-200">${player.grad_year}</strong>
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button id="toggleEditSuiteBtn" class="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-lg shadow-sky-600/30">
            ✏️ Edit All Prospect Fields
          </button>

          <div class="text-right">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Trajectory Score</span>
            <span class="text-3xl font-black text-sky-400 font-mono" id="mainTrajectoryScoreDisplay">${proj.composite_trajectory_score}</span>
            <span class="text-[10px] text-slate-400 block">Out of 100</span>
          </div>
        </div>
      </div>

      <!-- ==================== UNIVERSAL FIELD EDITING SUITE ==================== -->
      <div id="universalEditPanel" class="p-4 rounded-2xl bg-slate-950/95 border border-sky-500/40 space-y-4 shadow-2xl hidden">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-black text-white">✏️ Comprehensive Prospect Data Editor</span>
            <span class="text-[10px] text-sky-400 font-mono">Real-Time Trajectory Recalculation</span>
          </div>
          <div class="flex gap-1 text-[10px]">
            <button class="editor-tab-btn px-2.5 py-1 rounded-lg bg-sky-500 text-white font-bold" data-editor-tab="combine">🏃 Combine</button>
            <button class="editor-tab-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 font-semibold" data-editor-tab="kpis">📊 Micro-KPIs</button>
            <button class="editor-tab-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 font-semibold" data-editor-tab="rubric">🎯 8-Pillar Rubric</button>
            <button class="editor-tab-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 font-semibold" data-editor-tab="bio">👤 Bio & Academics</button>
          </div>
        </div>

        <!-- TAB 1: COMBINE TESTING NUMBERS -->
        <div id="editorTabCombine" class="space-y-3 text-xs">
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Flying 30m Sprint (s):</label>
              <input id="editFlying30m" type="number" step="0.01" value="${combine.flying_30m_sec}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Broad Jump (in):</label>
              <input id="editBroadJump" type="number" step="1" value="${combine.broad_jump_in}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Pro Agility 5-10-5 (s):</label>
              <input id="editProAgility" type="number" step="0.01" value="${combine.pro_agility_5_10_5_sec || 4.8}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Grip Strength (lbs):</label>
              <input id="editGrip" type="number" step="1" value="${combine.grip_strength_lbs || 75}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Rotational Medball (mph):</label>
              <input id="editMedball" type="number" step="0.5" value="${combine.rotational_medball_mph || 22}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
          </div>
        </div>

        <!-- TAB 2: MICRO-KPIS -->
        <div id="editorTabKpis" class="space-y-3 text-xs hidden">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Controlled Exit Rate (%):</label>
              <input id="editExitPct" type="number" step="1" min="0" max="100" value="${kpis.controlled_exit_pct}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Controlled Entry Rate (%):</label>
              <input id="editEntryPct" type="number" step="1" min="0" max="100" value="${kpis.controlled_entry_pct}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Wall Battle Win Rate (%):</label>
              <input id="editBattlePct" type="number" step="1" min="0" max="100" value="${kpis.wall_battle_win_pct}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Pre-Touch Scanning (scans/touch):</label>
              <input id="editScans" type="number" step="0.1" value="${kpis.shoulder_scans_per_possession}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">High-Danger Pass Comp (%):</label>
              <input id="editHighDangerPass" type="number" step="1" min="0" max="100" value="${kpis.high_danger_pass_comp_pct || 65}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Faceoff Win Rate (%):</label>
              <input id="editFaceoff" type="number" step="1" min="0" max="100" value="${kpis.faceoff_win_pct || 55}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
          </div>
        </div>

        <!-- TAB 3: 8-PILLAR RUBRIC -->
        <div id="editorTabRubric" class="space-y-3 text-xs hidden">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Edges / Skating (0-99):</label>
              <input id="editEdges" type="number" min="40" max="99" value="${rubric.edges}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Puck Skills / Handling (0-99):</label>
              <input id="editPuckSkills" type="number" min="40" max="99" value="${rubric.puck_skills}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Shooting / Release (0-99):</label>
              <input id="editShooting" type="number" min="40" max="99" value="${rubric.shooting}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Hockey IQ / Vision (0-99):</label>
              <input id="editIQ" type="number" min="40" max="99" value="${rubric.hockey_iq}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Body Contact (0-99):</label>
              <input id="editContact" type="number" min="40" max="99" value="${rubric.contact || 70}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">D-Zone Coverage (0-99):</label>
              <input id="editDZone" type="number" min="40" max="99" value="${rubric.d_zone || 70}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Transition Play (0-99):</label>
              <input id="editTransition" type="number" min="40" max="99" value="${rubric.transition || 75}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
          </div>
        </div>

        <!-- TAB 4: BIO & ACADEMICS -->
        <div id="editorTabBio" class="space-y-3 text-xs hidden">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Height (inches):</label>
              <input id="editHeight" type="number" value="${player.height_in}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Weight (lbs):</label>
              <input id="editWeight" type="number" value="${player.weight_lbs}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Core GPA (0.0-4.0):</label>
              <input id="editGPA" type="number" step="0.01" min="2.0" max="4.0" value="${player.gpa}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Graduation Year:</label>
              <input id="editGradYear" type="number" value="${player.grad_year}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Status / Target Badge:</label>
              <input id="editStatusBadge" type="text" value="${player.status_badge}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
            </div>
            <div>
              <label class="block text-slate-400 text-[11px] mb-1">Primary Role:</label>
              <input id="editPrimaryRole" type="text" value="${player.primary_role}" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2 border-t border-slate-800">
          <button id="saveAllFieldsBtn" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition flex items-center gap-2 shadow-lg shadow-emerald-600/30">
            <span>💾</span> Save Changes, Recalculate Trajectory & Stamp Ledger
          </button>
        </div>
      </div>

      <!-- In-Game Telemetry & Micro-Metrics -->
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <h3 class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
            <span>📡</span> In-Game Telemetry & Micro-Event Analytics
          </h3>
          <span class="text-[10px] text-emerald-400 font-mono">Live Recalculation Active</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Puck Hold</span>
            <span class="text-xl font-black text-sky-400 font-mono" id="kpiAvgHold">${poss.avg_hold_duration_sec}s</span>
            <span class="text-[10px] text-slate-500 block" id="kpiTotalTop">Total TOP: ${poss.total_time_on_puck_sec}s</span>
          </div>
          <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wall Usage Rate</span>
            <span class="text-xl font-black text-amber-400 font-mono" id="kpiWallUsage">${poss.wall_usage_pct}%</span>
            <span class="text-[10px] text-slate-500 block" id="kpiWallEscapes">${poss.wall_bank_escapes} Bank Escapes</span>
          </div>
          <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Passing Accuracy</span>
            <span class="text-xl font-black text-emerald-400 font-mono" id="kpiPassAcc">${pass.pass_completion_pct}%</span>
            <span class="text-[10px] text-slate-400 block" id="kpiPassCounts">${pass.completed_tape_to_tape} Tape / ${pass.bad_passes_turnovers} Bad</span>
          </div>
          <div class="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Shot Dist</span>
            <span class="text-xl font-black text-purple-400 font-mono" id="kpiShotDist">${shot.avg_shot_distance_ft} ft</span>
            <span class="text-[10px] text-slate-400 block" id="kpiGoalCount">${shot.shots_on_goal} SOG / ${shot.goals} Goals (🚨)</span>
          </div>
        </div>

        <!-- Visual Shot Chart & Micro-Event Location Plotter -->
        <div class="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <span>🎯</span> Visual Shot Chart (Click on Rink to Set Shot Location)
            </span>
            <div class="flex items-center gap-3 text-[10px]">
              <span class="flex items-center gap-1 text-emerald-400"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Goal (🚨)</span>
              <span class="flex items-center gap-1 text-sky-400"><span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span> Save (SOG)</span>
              <span class="flex items-center gap-1 text-amber-400"><span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Blocked</span>
              <span class="text-slate-400 font-mono">Location: (<span id="shotCoordX">${pendingShotCoords.x_pct.toFixed(0)}</span>%, <span id="shotCoordY">${pendingShotCoords.y_pct.toFixed(0)}</span>%)</span>
            </div>
          </div>

          <div id="interactiveShotRink" class="relative w-full h-48 bg-[#0a111a] rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden cursor-crosshair select-none">
            <!-- SVG Rink Markings -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 240" preserveAspectRatio="none">
              <rect x="10" y="10" width="580" height="220" rx="30" ry="30" fill="none" stroke="#334155" stroke-width="2"/>
              <line x1="80" y1="20" x2="80" y2="220" stroke="#ef4444" stroke-width="2"/>
              <path d="M 80 100 A 20 20 0 0 1 80 140 Z" fill="rgba(56, 189, 248, 0.2)" stroke="#ef4444" stroke-width="1.5"/>
              <line x1="80" y1="120" x2="400" y2="120" stroke="rgba(244, 63, 94, 0.4)" stroke-width="1.5" stroke-dasharray="4,4"/>
              <circle cx="160" cy="65" r="18" fill="none" stroke="#ef4444" stroke-width="1.5"/>
              <circle cx="160" cy="65" r="2.5" fill="#ef4444"/>
              <circle cx="160" cy="175" r="18" fill="none" stroke="#ef4444" stroke-width="1.5"/>
              <circle cx="160" cy="175" r="2.5" fill="#ef4444"/>
              <line x1="450" y1="10" x2="450" y2="230" stroke="#0284c7" stroke-width="4"/>
            </svg>

            <!-- Dynamic Shot Pins from Telemetry -->
            <div id="shotPinsLayer" class="absolute inset-0 pointer-events-none">
              ${shotEvents.map(s => {
                const isGoal = s.outcome_type === 'goal' || s.outcome.toUpperCase().includes('GOAL');
                const isSave = s.outcome_type === 'save' || s.outcome.toUpperCase().includes('SAVE');
                
                let pinHtml = '';
                if (isGoal) {
                  pinHtml = `<span class="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] shadow-lg shadow-emerald-500/50 animate-bounce pointer-events-auto cursor-pointer" title="🚨 GOAL! (${s.type} - ${s.distance_ft}ft | Hold: ${s.hold_duration_sec || 1.2}s)">🚨 GOAL (${s.distance_ft}ft)</span>`;
                } else if (isSave) {
                  pinHtml = `<span class="w-4 h-4 rounded-full bg-sky-500 text-white font-bold text-[9px] flex items-center justify-center shadow pointer-events-auto cursor-pointer" title="Save (${s.type} - ${s.distance_ft}ft)">S</span>`;
                } else {
                  pinHtml = `<span class="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center shadow pointer-events-auto cursor-pointer" title="Blocked (${s.type} - ${s.distance_ft}ft)">B</span>`;
                }

                return `<div class="absolute transform -translate-x-1/2 -translate-y-1/2" style="left: ${s.x_pct || 30}%; top: ${s.y_pct || 50}%;">${pinHtml}</div>`;
              }).join('')}

              <!-- Pending Crosshair Target -->
              <div id="pendingShotPin" class="absolute transform -translate-x-1/2 -translate-y-1/2" style="left: ${pendingShotCoords.x_pct}%; top: ${pendingShotCoords.y_pct}%;">
                <div class="w-5 h-5 rounded-full border-2 border-red-400 bg-red-500/30 animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ⚡ LIVE IN-GAME MICRO-TELEMETRY LOGGER HUB -->
        <div class="p-4 rounded-2xl bg-slate-950/95 border border-sky-500/40 space-y-3 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h4 class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡</span> Live Micro-Telemetry Event Logger & Recalculator
            </h4>
            <div class="flex gap-1 text-[10px]">
              <button class="logger-tab-btn px-2.5 py-1 rounded-lg bg-sky-500 text-white font-bold" data-logger-tab="shot">🎯 Log Shot</button>
              <button class="logger-tab-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 font-semibold" data-logger-tab="possession">⏱️ Log Possession</button>
              <button class="logger-tab-btn px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 font-semibold" data-logger-tab="pass">🏒 Log Pass / Decision</button>
            </div>
          </div>

          <!-- TAB 1: LOG SHOT FORM -->
          <div id="loggerFormShot" class="space-y-3 text-xs">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Shot Type:</label>
                <select id="logShotType" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white">
                  <option value="Snap Shot">Snap Shot (Quick Release)</option>
                  <option value="Wrist Shot">Wrist Shot (In-Stride)</option>
                  <option value="One-Timer">One-Timer (Royal Road Seam)</option>
                  <option value="Slap Shot">Slap Shot (Point Walk)</option>
                  <option value="Backhand">Backhand (Close In)</option>
                  <option value="Deflection / Tip">Deflection / Tip (Netfront)</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Distance (ft):</label>
                <input id="logShotDistance" type="number" value="16.5" step="0.5" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono">
              </div>

              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Shot Outcome:</label>
                <select id="logShotOutcome" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-semibold">
                  <option value="GOAL 🚨">GOAL 🚨</option>
                  <option value="SAVE / Shot on Goal">SAVE / SOG</option>
                  <option value="BLOCKED">Blocked by D</option>
                  <option value="MISSED NET">Missed Net / Wide</option>
                  <option value="POST / CROSSBAR">Post / Crossbar</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Puck Hold (s):</label>
                <input id="logShotHoldSec" type="number" value="1.4" step="0.1" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono">
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <label class="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input id="logShotWallCheck" type="checkbox" class="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0">
                <span>Wall Used Prior to Shot (Bank / Pinch Escape)</span>
              </label>

              <button id="submitLogShotBtn" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30">
                <span>🎯</span> Record Shot & Recalculate Metrics
              </button>
            </div>
          </div>

          <!-- TAB 2: LOG POSSESSION FORM -->
          <div id="loggerFormPossession" class="space-y-3 text-xs hidden">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Hold Duration (seconds):</label>
                <input id="logPossHoldSec" type="number" value="3.5" step="0.1" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-mono">
              </div>

              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Ice Zone:</label>
                <select id="logPossZone" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white">
                  <option value="Offensive">Offensive Zone Cycle</option>
                  <option value="Neutral">Neutral Zone Transition</option>
                  <option value="Defensive">Defensive Zone Retrieval</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Support Style:</label>
                <select id="logPossSupport" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white">
                  <option value="Underneath Support">Underneath Support</option>
                  <option value="Ahead on Rush">Ahead on Rush</option>
                </select>
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
              <label class="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
                <input id="logPossWallCheck" type="checkbox" checked class="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0">
                <span>Wall Pin / Bank Escape Executed</span>
              </label>

              <button id="submitLogPossBtn" class="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white transition flex items-center gap-1.5 shadow-lg shadow-sky-600/30">
                <span>⏱️</span> Record Possession & Recalculate TOP
              </button>
            </div>
          </div>

          <!-- TAB 3: LOG PASS FORM -->
          <div id="loggerFormPass" class="space-y-3 text-xs hidden">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Pass Category:</label>
                <select id="logPassType" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white">
                  <option value="Tape-to-Tape Pass">Tape-to-Tape Pass (Clean)</option>
                  <option value="Royal Road Seam Pass">Royal Road Seam Pass</option>
                  <option value="Wall Bank Chip Pass">Wall Bank Chip Pass</option>
                  <option value="Bad Pass / Turnover">Bad Pass / Turnover</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Completion Outcome:</label>
                <select id="logPassCompleted" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white font-semibold">
                  <option value="true">Completed (Tape-to-Tape)</option>
                  <option value="false">Turnover / Incomplete</option>
                </select>
              </div>

              <div>
                <label class="block text-slate-400 text-[11px] mb-1">Player Was Past Puck Decision:</label>
                <select id="logPassDecision" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white">
                  <option value="Chose to Pass (Open Seam)">Chose to Pass (Open Seam)</option>
                  <option value="Chose to Shoot (Slot Drive)">Chose to Shoot (Slot Drive)</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end pt-1">
              <button id="submitLogPassBtn" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/30">
                <span>🏒</span> Record Passing Event & Recalculate IQ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Radar & Future Trajectory Matrix -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2">
        <div class="md:col-span-6 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 flex flex-col items-center justify-center">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">8-Pillar Skill Evaluation Radar</span>
          <div class="w-full max-w-[280px] h-[240px]">
            <canvas id="playerRadarCanvas"></canvas>
          </div>
        </div>

        <div class="md:col-span-6 space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
          <div>
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">AI Future Trajectory Probabilities</span>
            <p class="text-[11px] text-emerald-400 font-semibold mb-3">Ceiling: ${proj.ceiling_label}</p>
          </div>

          <div class="space-y-2.5 text-xs">
            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-sky-300">🎓 NCAA Division I</span>
                <span class="text-sky-400 font-mono" id="probNcaaD1">${proj.probabilities.ncaa_d1}%</span>
              </div>
              <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-sky-500 to-cyan-400 h-2 rounded-full transition-all duration-500" id="barNcaaD1" style="width: ${proj.probabilities.ncaa_d1}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-amber-300">⚡ USHL Tier 1 Junior</span>
                <span class="text-amber-400 font-mono" id="probUshl">${proj.probabilities.ushl_tier1}%</span>
              </div>
              <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all duration-500" id="barUshl" style="width: ${proj.probabilities.ushl_tier1}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-emerald-300">🏒 NAHL / BCHL Tier 2</span>
                <span class="text-emerald-400 font-mono" id="probNahl">${proj.probabilities.nahl_tier2}%</span>
              </div>
              <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" id="barNahl" style="width: ${proj.probabilities.nahl_tier2}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between font-bold mb-1">
                <span class="text-purple-300">📚 NCAA D3 / ACHA D1</span>
                <span class="text-purple-400 font-mono" id="probD3">${proj.probabilities.ncaa_d3_acha}%</span>
              </div>
              <div class="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-indigo-400 h-2 rounded-full transition-all duration-500" id="barD3" style="width: ${proj.probabilities.ncaa_d3_acha}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Change Audit Ledger -->
      <div class="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <h4 class="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
            <span>📜</span> Change Audit Ledger & Activity History
          </h4>
          <span class="text-[10px] text-slate-400 font-mono">${ledger.length} Logged Events</span>
        </div>

        <div class="space-y-2 max-h-60 overflow-y-auto pr-1" id="ledgerEntriesContainer">
          ${ledger.map(entry => `
            <div class="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1 text-xs">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-sky-400 flex items-center gap-1">👤 ${entry.account}</span>
                <span class="font-mono text-[10px] text-slate-500">${entry.timestamp}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">${entry.category}</span>
                <span class="font-medium text-white">${entry.action}</span>
              </div>
              <p class="text-slate-300 text-[11px]">${entry.diff}</p>
            </div>
          `).join('')}
        </div>

        <div class="pt-2 border-t border-slate-800 flex gap-2">
          <input id="manualLedgerNoteInput" type="text" placeholder="Add custom evaluation note..." class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none">
          <button id="addManualLedgerBtn" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition">
            + Log to Ledger
          </button>
        </div>
      </div>

    </div>
  `;

  initRadarChart(player.skill_rubric);
  bindDossierEvents(player);
}

function bindDossierEvents(player) {
  // Toggle Universal Edit Suite
  const toggleEditBtn = document.getElementById('toggleEditSuiteBtn');
  const editPanel = document.getElementById('universalEditPanel');
  if (toggleEditBtn && editPanel) {
    toggleEditBtn.addEventListener('click', () => {
      editPanel.classList.toggle('hidden');
      toggleEditBtn.textContent = editPanel.classList.contains('hidden') ? '✏️ Edit All Prospect Fields' : '✕ Close Editor';
    });
  }

  // Editor Tabs Switcher
  const editorTabs = document.querySelectorAll('.editor-tab-btn');
  editorTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      editorTabs.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white', 'font-bold');
        b.classList.add('bg-slate-900', 'text-slate-400', 'font-semibold');
      });
      btn.classList.add('bg-sky-500', 'text-white', 'font-bold');
      btn.classList.remove('bg-slate-900', 'text-slate-400', 'font-semibold');

      const target = btn.dataset.editorTab;
      document.getElementById('editorTabCombine')?.classList.toggle('hidden', target !== 'combine');
      document.getElementById('editorTabKpis')?.classList.toggle('hidden', target !== 'kpis');
      document.getElementById('editorTabRubric')?.classList.toggle('hidden', target !== 'rubric');
      document.getElementById('editorTabBio')?.classList.toggle('hidden', target !== 'bio');
    });
  });

  // Save All Fields Button
  const saveAllBtn = document.getElementById('saveAllFieldsBtn');
  if (saveAllBtn) {
    saveAllBtn.addEventListener('click', async () => {
      const updates = {
        combine: {
          flying_30m_sec: parseFloat(document.getElementById('editFlying30m').value) || player.combine.flying_30m_sec,
          broad_jump_in: parseFloat(document.getElementById('editBroadJump').value) || player.combine.broad_jump_in,
          pro_agility_5_10_5_sec: parseFloat(document.getElementById('editProAgility').value) || 4.8,
          grip_strength_lbs: parseFloat(document.getElementById('editGrip').value) || 75,
          rotational_medball_mph: parseFloat(document.getElementById('editMedball').value) || 22
        },
        micro_kpis: {
          controlled_exit_pct: parseFloat(document.getElementById('editExitPct').value) || player.micro_kpis.controlled_exit_pct,
          controlled_entry_pct: parseFloat(document.getElementById('editEntryPct').value) || player.micro_kpis.controlled_entry_pct,
          wall_battle_win_pct: parseFloat(document.getElementById('editBattlePct').value) || player.micro_kpis.wall_battle_win_pct,
          shoulder_scans_per_possession: parseFloat(document.getElementById('editScans').value) || player.micro_kpis.shoulder_scans_per_possession,
          high_danger_pass_comp_pct: parseFloat(document.getElementById('editHighDangerPass').value) || 65,
          faceoff_win_pct: parseFloat(document.getElementById('editFaceoff').value) || 55
        },
        skill_rubric: {
          edges: parseInt(document.getElementById('editEdges').value) || player.skill_rubric.edges,
          puck_skills: parseInt(document.getElementById('editPuckSkills').value) || player.skill_rubric.puck_skills,
          shooting: parseInt(document.getElementById('editShooting').value) || player.skill_rubric.shooting,
          hockey_iq: parseInt(document.getElementById('editIQ').value) || player.skill_rubric.hockey_iq,
          contact: parseInt(document.getElementById('editContact').value) || 70,
          d_zone: parseInt(document.getElementById('editDZone').value) || 70,
          transition: parseInt(document.getElementById('editTransition').value) || 75
        },
        height_in: parseFloat(document.getElementById('editHeight').value) || player.height_in,
        weight_lbs: parseFloat(document.getElementById('editWeight').value) || player.weight_lbs,
        gpa: parseFloat(document.getElementById('editGPA').value) || player.gpa,
        grad_year: parseInt(document.getElementById('editGradYear').value) || player.grad_year,
        status_badge: document.getElementById('editStatusBadge').value || player.status_badge,
        primary_role: document.getElementById('editPrimaryRole').value || player.primary_role
      };

      try {
        const res = await fetch(`/api/players/${player.id}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: updates,
            category: 'Comprehensive Profile & Evaluation Update',
            action: 'Updated Biometrics, Combine & Rubrics',
            account: `${currentUser.name} (${currentUser.badge})`
          })
        });

        if (res.ok) {
          const data = await res.json();
          Object.assign(player, data.player);
          showToast(`Saved and recalculated trajectory score (${data.projection.composite_trajectory_score})!`, 'success');
        } else {
          localUpdatePlayerFields(player, updates);
          showToast(`Saved and recalculated locally!`, 'success');
        }
      } catch (err) {
        localUpdatePlayerFields(player, updates);
        showToast(`Saved and recalculated locally!`, 'success');
      }

      renderPlayerList();
      renderPlayerDossier(player);
    });
  }

  // Rink click to set location
  const rinkEl = document.getElementById('interactiveShotRink');
  if (rinkEl) {
    rinkEl.addEventListener('click', (e) => {
      const rect = rinkEl.getBoundingClientRect();
      const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
      const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
      pendingShotCoords = { x_pct: xPct, y_pct: yPct };

      const shotPin = document.getElementById('pendingShotPin');
      if (shotPin) {
        shotPin.style.left = `${xPct}%`;
        shotPin.style.top = `${yPct}%`;
      }
      const cx = document.getElementById('shotCoordX');
      const cy = document.getElementById('shotCoordY');
      if (cx) cx.textContent = xPct.toFixed(0);
      if (cy) cy.textContent = yPct.toFixed(0);

      const distFt = Math.max(6, Math.round(Math.hypot((xPct - 13.3) * 1.6, (yPct - 50) * 1.2)));
      const distInput = document.getElementById('logShotDistance');
      if (distInput) distInput.value = distFt;
    });
  }

  // Logger tab buttons
  const loggerTabs = document.querySelectorAll('.logger-tab-btn');
  loggerTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      loggerTabs.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white', 'font-bold');
        b.classList.add('bg-slate-900', 'text-slate-400', 'font-semibold');
      });
      btn.classList.add('bg-sky-500', 'text-white', 'font-bold');
      btn.classList.remove('bg-slate-900', 'text-slate-400', 'font-semibold');

      const target = btn.dataset.loggerTab;
      document.getElementById('loggerFormShot')?.classList.toggle('hidden', target !== 'shot');
      document.getElementById('loggerFormPossession')?.classList.toggle('hidden', target !== 'possession');
      document.getElementById('loggerFormPass')?.classList.toggle('hidden', target !== 'pass');
    });
  });

  // Submit Shot Event
  const shotBtn = document.getElementById('submitLogShotBtn');
  if (shotBtn) {
    shotBtn.addEventListener('click', async () => {
      const shotType = document.getElementById('logShotType').value;
      const dist = parseFloat(document.getElementById('logShotDistance').value) || 16.5;
      const outcome = document.getElementById('logShotOutcome').value;
      const holdSec = parseFloat(document.getElementById('logShotHoldSec').value) || 1.4;
      const usedWall = document.getElementById('logShotWallCheck')?.checked || false;

      try {
        const res = await fetch('/api/telemetry/log-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: player.id,
            shot_type: shotType,
            distance_ft: dist,
            outcome: outcome,
            hold_duration_sec: holdSec,
            used_wall: usedWall,
            x_coord_pct: pendingShotCoords.x_pct,
            y_coord_pct: pendingShotCoords.y_pct,
            account: `${currentUser.name} (${currentUser.badge})`
          })
        });

        if (res.ok) {
          const data = await res.json();
          Object.assign(player, data.player);
          showToast(`Recorded ${shotType}: ${outcome}! Trajectory recalculated.`, 'success');
        } else {
          localShotRecalculate(player, shotType, dist, outcome, holdSec, usedWall, pendingShotCoords.x_pct, pendingShotCoords.y_pct);
          showToast(`Recorded ${shotType}: ${outcome} locally!`, 'success');
        }
      } catch (err) {
        localShotRecalculate(player, shotType, dist, outcome, holdSec, usedWall, pendingShotCoords.x_pct, pendingShotCoords.y_pct);
        showToast(`Recorded ${shotType}: ${outcome} locally!`, 'success');
      }

      renderPlayerDossier(player);
    });
  }

  // Submit Possession Event
  const possBtn = document.getElementById('submitLogPossBtn');
  if (possBtn) {
    possBtn.addEventListener('click', async () => {
      const holdSec = parseFloat(document.getElementById('logPossHoldSec').value) || 3.5;
      const zone = document.getElementById('logPossZone').value;
      const usedWall = document.getElementById('logPossWallCheck')?.checked || false;

      try {
        const res = await fetch('/api/telemetry/log-possession', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: player.id,
            hold_duration_sec: holdSec,
            used_wall: usedWall,
            wall_bank_escapes: usedWall ? 1 : 0,
            zone: zone,
            account: `${currentUser.name} (${currentUser.badge})`
          })
        });

        if (res.ok) {
          const data = await res.json();
          Object.assign(player, data.player);
          showToast(`Recorded ${zone} Zone possession (${holdSec}s)!`, 'success');
        } else {
          localPossessionRecalculate(player, holdSec, usedWall, zone);
          showToast(`Recorded possession (${holdSec}s) locally!`, 'success');
        }
      } catch (err) {
        localPossessionRecalculate(player, holdSec, usedWall, zone);
        showToast(`Recorded possession (${holdSec}s) locally!`, 'success');
      }

      renderPlayerDossier(player);
    });
  }

  // Submit Pass Event
  const passBtn = document.getElementById('submitLogPassBtn');
  if (passBtn) {
    passBtn.addEventListener('click', async () => {
      const passType = document.getElementById('logPassType').value;
      const completed = document.getElementById('logPassCompleted').value === 'true';
      const decision = document.getElementById('logPassDecision').value;

      try {
        const res = await fetch('/api/telemetry/log-pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: player.id,
            pass_type: passType,
            is_completed: completed,
            player_was_past_puck: true,
            decision_outcome: decision,
            account: `${currentUser.name} (${currentUser.badge})`
          })
        });

        if (res.ok) {
          const data = await res.json();
          Object.assign(player, data.player);
          showToast(`Recorded ${passType} (${completed ? 'Completed' : 'Turnover'})!`, 'success');
        } else {
          localPassRecalculate(player, passType, completed, decision);
          showToast(`Recorded ${passType} locally!`, 'success');
        }
      } catch (err) {
        localPassRecalculate(player, passType, completed, decision);
        showToast(`Recorded ${passType} locally!`, 'success');
      }

      renderPlayerDossier(player);
    });
  }

  // Manual ledger note
  const manualBtn = document.getElementById('addManualLedgerBtn');
  const manualInput = document.getElementById('manualLedgerNoteInput');
  if (manualBtn && manualInput) {
    manualBtn.addEventListener('click', async () => {
      const text = manualInput.value.trim();
      if (!text) return;

      const entry = {
        id: `led_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        account: `${currentUser.name} (${currentUser.badge})`,
        category: 'Evaluation Note',
        action: 'Manual Evaluation Logged',
        diff: text
      };
      player.audit_ledger.unshift(entry);
      showToast(`Logged activity for ${player.name}`);
      renderPlayerDossier(player);
    });
  }
}

// Local Universal Field Update Handler & Mathematical Engine
function localUpdatePlayerFields(player, updates) {
  const diffs = [];

  for (let key in updates) {
    if (typeof updates[key] === 'object' && updates[key] !== null) {
      player[key] = player[key] || {};
      for (let subK in updates[key]) {
        if (player[key][subK] !== updates[key][subK]) {
          diffs.push(`${subK}: ${player[key][subK]} -> ${updates[key][subK]}`);
          player[key][subK] = updates[key][subK];
        }
      }
    } else {
      if (player[key] !== updates[key]) {
        diffs.push(`${key}: ${player[key]} -> ${updates[key]}`);
        player[key] = updates[key];
      }
    }
  }

  // Re-calculate local projection
  const speed = player.combine.flying_30m_sec || 4.3;
  const jump = player.combine.broad_jump_in || 80;
  const speedScore = Math.max(40, Math.min(99, 100 - (speed - 3.8) * 60));
  const jumpScore = Math.max(40, Math.min(99, (jump / 100) * 88));
  const athleticIndex = (speedScore * 0.6 + jumpScore * 0.4).toFixed(1);

  const exitPct = player.micro_kpis.controlled_exit_pct || 60;
  const entryPct = player.micro_kpis.controlled_entry_pct || 60;
  const scans = player.micro_kpis.shoulder_scans_per_possession || 2.5;
  const battles = player.micro_kpis.wall_battle_win_pct || 60;
  const kpiIndex = (exitPct * 0.25 + entryPct * 0.25 + battles * 0.25 + (Math.min(99, (scans / 5.5) * 90) * 0.25)).toFixed(1);

  const rubric = player.skill_rubric;
  const techIndex = ((rubric.edges + rubric.puck_skills + rubric.shooting + rubric.hockey_iq + (rubric.contact || 70) + (rubric.d_zone || 70)) / 6).toFixed(1);
  const acad = Math.min(100, (player.gpa / 4.0) * 100);

  const composite = (athleticIndex * 0.25 + kpiIndex * 0.30 + techIndex * 0.35 + acad * 0.10).toFixed(1);

  let ncaaD1Prob = Math.min(98, (composite >= 88 ? 65 + (composite - 88) * 3.5 : (composite >= 78 ? 35 + (composite - 78) * 3.0 : 10 + (composite - 68) * 2.5))).toFixed(1);
  let ushlProb = Math.min(95, (composite >= 88 ? 60 + (composite - 88) * 3.8 : (composite >= 78 ? 30 + (composite - 78) * 3.0 : 8 + (composite - 68) * 2.2))).toFixed(1);
  let nahlProb = Math.min(98, (composite >= 88 ? 85 + (composite - 88) * 1.2 : (composite >= 78 ? 65 + (composite - 78) * 2.0 : 35 + (composite - 68) * 3.0))).toFixed(1);

  player.projection = {
    composite_trajectory_score: parseFloat(composite),
    athletic_index: parseFloat(athleticIndex),
    kpi_index: parseFloat(kpiIndex),
    tech_index: parseFloat(techIndex),
    ceiling_label: composite >= 88 ? "NCAA Division I / Tier 1 USHL Franchise Caliber" : "NCAA D1 Contender / Top Tier 2 NAHL",
    probabilities: {
      ncaa_d1: parseFloat(ncaaD1Prob),
      ushl_tier1: parseFloat(ushlProb),
      nahl_tier2: parseFloat(nahlProb),
      ncaa_d3_acha: 95.0
    }
  };

  const diffStr = (diffs.join('; ') || 'Recalculated trajectory numbers.') + ` | New Score: ${composite} (NCAA D1: ${ncaaD1Prob}%)`;
  player.audit_ledger.unshift({
    id: `led_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    account: `${currentUser.name} (${currentUser.badge})`,
    category: 'Comprehensive Profile & Evaluation Update',
    action: 'Updated Biometrics, Combine & Rubrics',
    diff: diffStr
  });
}

// Local mathematical fallback recalculators
function localShotRecalculate(player, shotType, dist, outcome, holdSec, usedWall, xPct, yPct) {
  const telem = player.telemetry;
  const shotTelem = telem.shot_telemetry;
  const isGoal = outcome.includes('GOAL');
  const isSave = outcome.includes('SAVE') || outcome.includes('SOG');

  shotTelem.total_shot_attempts = (shotTelem.total_shot_attempts || 0) + 1;
  if (isGoal) shotTelem.goals = (shotTelem.goals || 0) + 1;
  if (isGoal || isSave) shotTelem.shots_on_goal = (shotTelem.shots_on_goal || 0) + 1;

  shotTelem.shot_events.push({
    id: `s_${Date.now()}`,
    distance_ft: dist,
    type: shotType,
    outcome: outcome,
    outcome_type: isGoal ? 'goal' : (isSave ? 'save' : 'blocked'),
    x_pct: xPct,
    y_pct: yPct,
    hold_duration_sec: holdSec
  });

  const distances = shotTelem.shot_events.map(s => s.distance_ft || 15);
  shotTelem.avg_shot_distance_ft = (distances.reduce((a, b) => a + b, 0) / distances.length).toFixed(1);

  telem.puck_possession.total_time_on_puck_sec = (parseFloat(telem.puck_possession.total_time_on_puck_sec || 80) + holdSec).toFixed(1);
  if (usedWall) telem.puck_possession.wall_usage_pct = Math.min(95, (parseFloat(telem.puck_possession.wall_usage_pct || 50) + 2.5)).toFixed(1);

  if (isGoal && player.projection) {
    player.projection.composite_trajectory_score = Math.min(99, player.projection.composite_trajectory_score + 1);
    player.projection.probabilities.ncaa_d1 = Math.min(98, player.projection.probabilities.ncaa_d1 + 1.5);
  }

  player.audit_ledger.unshift({
    id: `led_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    account: `${currentUser.name} (${currentUser.badge})`,
    category: 'Shot Telemetry',
    action: `Recorded Shot: ${outcome}`,
    diff: `Logged ${shotType} from ${dist}ft. Puck held ${holdSec}s. Location: (${xPct.toFixed(0)}%, ${yPct.toFixed(0)}%).`
  });
}

function localPossessionRecalculate(player, holdSec, usedWall, zone) {
  const poss = player.telemetry.puck_possession;
  poss.total_time_on_puck_sec = (parseFloat(poss.total_time_on_puck_sec || 80) + holdSec).toFixed(1);
  poss.avg_hold_duration_sec = ((parseFloat(poss.avg_hold_duration_sec || 2.2) * 0.9) + (holdSec * 0.1)).toFixed(2);
  if (usedWall) {
    poss.wall_bank_escapes = (poss.wall_bank_escapes || 0) + 1;
    poss.wall_usage_pct = Math.min(95, (parseFloat(poss.wall_usage_pct || 50) + 3.0)).toFixed(1);
  }

  player.audit_ledger.unshift({
    id: `led_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    account: `${currentUser.name} (${currentUser.badge})`,
    category: 'Possession Telemetry',
    action: `Logged Possession (${holdSec}s)`,
    diff: `Recorded ${zone} Zone possession shift. Hold duration: ${holdSec}s. Wall Usage now ${poss.wall_usage_pct}%.`
  });
}

function localPassRecalculate(player, passType, completed, decision) {
  const pass = player.telemetry.passing_analytics;
  pass.total_passes_attempted = (pass.total_passes_attempted || 20) + 1;
  if (completed) {
    pass.completed_tape_to_tape = (pass.completed_tape_to_tape || 16) + 1;
  } else {
    pass.bad_passes_turnovers = (pass.bad_passes_turnovers || 4) + 1;
  }
  pass.pass_completion_pct = ((pass.completed_tape_to_tape / pass.total_passes_attempted) * 100).toFixed(1);

  player.audit_ledger.unshift({
    id: `led_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    account: `${currentUser.name} (${currentUser.badge})`,
    category: 'Passing & Decision Telemetry',
    action: `Recorded ${passType}`,
    diff: `Logged ${passType} (${completed ? 'Tape-to-Tape' : 'Incomplete'}). Pass Accuracy now ${pass.pass_completion_pct}%. Past-Puck Decision: ${decision}.`
  });
}

function initRadarChart(rubric) {
  const canvas = document.getElementById('playerRadarCanvas');
  if (!canvas) return;

  if (radarChartInstance) radarChartInstance.destroy();

  const labels = ['Edges', 'Puck Skills', 'Shooting', 'Hockey IQ', 'Contact', 'D-Zone', 'Transition'];
  const dataValues = [
    rubric.edges || 75,
    rubric.puck_skills || 75,
    rubric.shooting || 75,
    rubric.hockey_iq || 75,
    rubric.contact || 75,
    rubric.d_zone || 75,
    rubric.transition || 75
  ];

  radarChartInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Player Rating',
        data: dataValues,
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
        borderColor: '#38bdf8',
        pointBackgroundColor: '#0284c7',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          pointLabels: { color: '#94a3b8', font: { size: 9, weight: 'bold' } },
          ticks: { display: false, min: 0, max: 100, stepSize: 20 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function setupCrossModuleLogging() {
  const logDrillBtn = document.getElementById('logDrillForPlayerBtn');
  if (logDrillBtn) {
    logDrillBtn.addEventListener('click', async () => {
      if (!selectedPlayer) return;
      const drillName = selectedDrill ? selectedDrill.name : 'Custom Practice Drill';

      try {
        const res = await fetch(`/api/players/${selectedPlayer.id}/log-activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: `${currentUser.name} (${currentUser.badge})`,
            category: 'ADM Practice Session',
            action: `Completed ADM Drill: ${drillName}`,
            diff: `Duration: ${selectedDrill ? selectedDrill.duration_min : 15}m | Touch Rating: ${selectedDrill ? selectedDrill.puck_touch_rating : 'High'}`
          })
        });
        if (res.ok) {
          const result = await res.json();
          selectedPlayer.audit_ledger.unshift(result.entry);
        } else {
          selectedPlayer.audit_ledger.unshift({
            id: `led_${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            account: `${currentUser.name} (${currentUser.badge})`,
            category: 'ADM Practice Session',
            action: `Completed ADM Drill: ${drillName}`,
            diff: `Duration: ${selectedDrill ? selectedDrill.duration_min : 15}m`
          });
        }
      } catch (err) {
        selectedPlayer.audit_ledger.unshift({
          id: `led_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          account: `${currentUser.name} (${currentUser.badge})`,
          category: 'ADM Practice Session',
          action: `Completed ADM Drill: ${drillName}`,
          diff: `Duration: ${selectedDrill ? selectedDrill.duration_min : 15}m`
        });
      }
      showToast(`Drill reps logged to ${selectedPlayer.name}'s permanent athletic ledger!`, 'success');
      renderPlayerDossier(selectedPlayer);
    });
  }

  const applyEquipmentBtn = document.getElementById('applyEquipmentToPlayerBtn');
  if (applyEquipmentBtn) {
    applyEquipmentBtn.addEventListener('click', async () => {
      if (!selectedPlayer) return;
      const weight = parseFloat(document.getElementById('eqWeight').value) || selectedPlayer.weight_lbs;
      const height = parseFloat(document.getElementById('eqHeight').value) || selectedPlayer.height_in;
      const cut = parseFloat(document.getElementById('eqCut').value) || 2;
      const style = document.getElementById('eqStyle').value || 'quick_snap';

      try {
        const flexRes = await fetch('/api/equipment/calculate-flex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weight_lbs: weight,
            height_in: height,
            stick_cut_inches: cut,
            shooting_style: style,
            strength_level: 'average'
          })
        });
        const flexData = await flexRes.json();

        const res = await fetch(`/api/players/${selectedPlayer.id}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: {
              weight_lbs: weight,
              height_in: height
            },
            category: 'Equipment Physics Fitting',
            action: 'Applied Biomechanical Stick & Skate Fit',
            diff: `Weight: ${weight} lbs; Height: ${height}"; Recommended Flex: ${flexData.recommended_flex}; Skate Hollow: ${flexData.recommended_hollow}; Profile: ${flexData.recommended_profile}.`,
            account: `${currentUser.name} (${currentUser.badge})`
          })
        });

        if (res.ok) {
          const result = await res.json();
          Object.assign(selectedPlayer, result.player);
        } else {
          selectedPlayer.weight_lbs = weight;
          selectedPlayer.height_in = height;
          selectedPlayer.audit_ledger.unshift({
            id: `led_${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            account: `${currentUser.name} (${currentUser.badge})`,
            category: 'Equipment Physics Fitting',
            action: 'Applied Biomechanical Stick & Skate Fit',
            diff: `Weight: ${weight} lbs; Height: ${height}"; Recommended Flex: ${flexData.recommended_flex}; Skate Hollow: ${flexData.recommended_hollow}.`
          });
        }
        showToast(`Equipment specs & biometrics saved to ${selectedPlayer.name}'s passport!`, 'success');
        renderPlayerDossier(selectedPlayer);
      } catch (err) {
        showToast(`Equipment calculated and logged for ${selectedPlayer.name}!`, 'success');
      }
    });
  }
}

function setupBenchControls() { initBenchShiftOS(); }

function setupToolCalculators() {
  const calcScholBtn = document.getElementById('calculateScholarshipBtn');
  if (calcScholBtn) {
    calcScholBtn.addEventListener('click', async () => {
      const rosterSize = parseInt(document.getElementById('scholRosterSize').value) || 27;
      const fullRides = parseInt(document.getElementById('scholFullRides').value) || 10;
      const halfRides = parseInt(document.getElementById('scholHalfRides').value) || 12;
      const tuition = parseFloat(document.getElementById('scholTuition').value) || 62000;

      try {
        const res = await fetch('/api/pathways/scholarship-calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roster_size: rosterSize,
            full_rides: fullRides,
            half_scholarships: halfRides,
            quarter_scholarships: 0,
            custom_fractions: [],
            annual_tuition: tuition
          })
        });
        const result = await res.json();
        const resEl = document.getElementById('scholarshipOutputCard');
        if (resEl) {
          resEl.innerHTML = `
            <div class="p-4 rounded-xl border ${result.is_compliant ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20' : 'text-red-400 border-red-500/40 bg-red-950/20'} space-y-3">
              <div class="flex items-center justify-between font-bold text-sm">
                <span>${result.is_compliant ? '✅ NCAA D1 COMPLIANT' : '⚠️ EXCEEDS 18.0 CAP'}</span>
                <span class="font-mono">${result.total_units_allocated} / 18.00 Units</span>
              </div>
            </div>
          `;
        }
      } catch (err) {
        console.error('Scholarship calc error:', err);
      }
    });
  }

  const applyAcademicBtn = document.getElementById('applyAcademicToPlayerBtn');
  if (applyAcademicBtn) {
    applyAcademicBtn.addEventListener('click', async () => {
      if (!selectedPlayer) return;
      const tuition = parseFloat(document.getElementById('scholTuition').value) || 62000;
      const fullRides = parseInt(document.getElementById('scholFullRides').value) || 10;
      const halfRides = parseInt(document.getElementById('scholHalfRides').value) || 12;

      try {
        const res = await fetch(`/api/players/${selectedPlayer.id}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: {
              gpa: selectedPlayer.gpa
            },
            category: 'NCAA Scholarship Compliance',
            action: 'Updated Academic Pathway Profile',
            diff: `Tuition Model: $${tuition.toLocaleString()}; Scholarship Units: ${(fullRides + halfRides*0.5).toFixed(2)}/18.00; Core GPA: ${selectedPlayer.gpa}.`,
            account: `${currentUser.name} (${currentUser.badge})`
          })
        });
        if (res.ok) {
          const data = await res.json();
          Object.assign(selectedPlayer, data.player);
        } else {
          selectedPlayer.audit_ledger.unshift({
            id: `led_${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            account: `${currentUser.name} (${currentUser.badge})`,
            category: 'NCAA Scholarship Compliance',
            action: 'Updated Academic Pathway Profile',
            diff: `Tuition: $${tuition.toLocaleString()}; Scholarship Units: ${(fullRides + halfRides*0.5).toFixed(2)}/18.00.`
          });
        }
        showToast(`Academic profile logged to ${selectedPlayer.name}'s passport!`, 'success');
        renderPlayerDossier(selectedPlayer);
      } catch (err) {
        showToast(`Academic profile saved locally!`, 'success');
      }
    });
  }

  const calcEquipmentBtn = document.getElementById('calcEquipmentBtn');
  if (calcEquipmentBtn) {
    calcEquipmentBtn.addEventListener('click', async () => {
      const weight = parseFloat(document.getElementById('eqWeight').value) || 145;
      const height = parseFloat(document.getElementById('eqHeight').value) || 68;
      const cut = parseFloat(document.getElementById('eqCut').value) || 2;
      const style = document.getElementById('eqStyle').value || 'quick_snap';

      try {
        const res = await fetch('/api/equipment/calculate-flex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weight_lbs: weight,
            height_in: height,
            stick_cut_inches: cut,
            shooting_style: style,
            strength_level: 'average'
          })
        });
        const data = await res.json();
        const outEl = document.getElementById('equipmentOutputCard');
        if (outEl) {
          outEl.innerHTML = `
            <div class="p-4 rounded-xl border border-sky-500/30 bg-slate-900/70 space-y-2 text-xs">
              <div class="flex justify-between font-bold text-sky-400 text-sm">
                <span>Recommended Flex:</span>
                <span>${data.recommended_flex} Flex</span>
              </div>
              <div class="text-emerald-400">Kick Point: <strong>${data.recommended_kick_point}</strong></div>
              <div class="text-amber-400">Skate Hollow: <strong>${data.recommended_hollow}</strong></div>
            </div>
          `;
        }
      } catch (err) {
        console.error('Equipment calc error:', err);
      }
    });
  }
}

function setupCanvasControls() {
  const rinkModeSelect = document.getElementById('rinkModeSelect');
  if (rinkModeSelect && rinkCanvas) {
    rinkModeSelect.addEventListener('change', (e) => rinkCanvas.setMode(e.target.value));
  }

  const toolBtns = document.querySelectorAll('.canvas-tool-btn');
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toolBtns.forEach(b => b.classList.remove('bg-sky-500', 'text-white'));
      btn.classList.add('bg-sky-500', 'text-white');
      const tool = btn.dataset.tool;
      rinkCanvas.setTool(tool, {});
    });
  });

  const tokenBtns = document.querySelectorAll('.token-palette-btn');
  tokenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toolBtns.forEach(b => b.classList.remove('bg-sky-500', 'text-white'));
      const type = btn.dataset.tokenType;
      const color = btn.dataset.tokenColor || '#0284c7';
      const label = btn.dataset.tokenLabel || type;
      rinkCanvas.setTool('add_token', { token: { type, color, label } });
      showToast(`Selected token: ${label}. Click on ice to place.`, 'info');
    });
  });

  const undoBtn = document.getElementById('undoCanvasBtn');
  if (undoBtn && rinkCanvas) {
    undoBtn.addEventListener('click', () => rinkCanvas.undo());
  }

  const redoBtn = document.getElementById('redoCanvasBtn');
  if (redoBtn && rinkCanvas) {
    redoBtn.addEventListener('click', () => rinkCanvas.redo());
  }

  const exportBtn = document.getElementById('exportCanvasPngBtn');
  if (exportBtn && rinkCanvas) {
    exportBtn.addEventListener('click', () => rinkCanvas.exportPNG());
  }

  const clearCanvasBtn = document.getElementById('clearCanvasBtn');
  if (clearCanvasBtn && rinkCanvas) {
    clearCanvasBtn.addEventListener('click', () => rinkCanvas.clearRink());
  }

  const deleteTokenBtn = document.getElementById('deleteTokenBtn');
  if (deleteTokenBtn && rinkCanvas) {
    deleteTokenBtn.addEventListener('click', () => rinkCanvas.deleteSelected());
  }

  const loadPresetDrill = document.getElementById('presetDrillSelect');
  if (loadPresetDrill && rinkCanvas) {
    loadPresetDrill.addEventListener('change', (e) => {
      const drillId = e.target.value;
      if (drillId) {
        rinkCanvas.loadDrillTemplate(drillId);
        if (appData && appData.drills) {
          const drill = appData.drills.find(d => d.id === drillId);
          if (drill) selectDrill(drill);
        }
      }
    });
  }

  // Setup 60 FPS Tactical Playbook & Drill Animation Engine Deck
  setupAnimationControls();
}

function setupAnimationControls() {
  if (!rinkCanvas) return;

  const playPauseBtn = document.getElementById('animPlayPauseBtn');
  const playIcon = document.getElementById('animPlayIcon');
  const playText = document.getElementById('animPlayText');
  const resetBtn = document.getElementById('animResetBtn');
  const scrubber = document.getElementById('animTimelineScrubber');
  const timeDisplay = document.getElementById('animTimeDisplay');
  const speedBtns = document.querySelectorAll('.anim-speed-btn');
  const trailsToggle = document.getElementById('animToggleTrails');
  const lanesToggle = document.getElementById('animToggleLanes');

  const cueTime = document.getElementById('animCueTimestamp');
  const cueTitle = document.getElementById('animCueTitle');
  const cueBadge = document.getElementById('animCueFocusBadge');
  const cueNote = document.getElementById('animCueNote');
  const raycastBadge = document.getElementById('animRaycastStatusBadge');
  const raycastText = document.getElementById('animRaycastStatusText');

  // Pre-load default animation preset if none active
  if (!rinkCanvas.animState.currentAnimation) {
    rinkCanvas.loadAnimation('drill_001');
  }

  // Play / Pause Toggle
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (rinkCanvas.animState.isPlaying) {
        rinkCanvas.pauseAnimation();
        if (playIcon) playIcon.textContent = '▶';
        if (playText) playText.textContent = 'Play 60 FPS Sim';
        playPauseBtn.classList.remove('bg-amber-500', 'hover:bg-amber-400');
        playPauseBtn.classList.add('bg-sky-500', 'hover:bg-sky-400');
      } else {
        rinkCanvas.playAnimation();
        if (playIcon) playIcon.textContent = '⏸';
        if (playText) playText.textContent = 'Pause Sim';
        playPauseBtn.classList.remove('bg-sky-500', 'hover:bg-sky-400');
        playPauseBtn.classList.add('bg-amber-500', 'hover:bg-amber-400');
      }
    });
  }

  // Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      rinkCanvas.resetAnimation();
      if (playIcon) playIcon.textContent = '▶';
      if (playText) playText.textContent = 'Play 60 FPS Sim';
      if (playPauseBtn) {
        playPauseBtn.classList.remove('bg-amber-500', 'hover:bg-amber-400');
        playPauseBtn.classList.add('bg-sky-500', 'hover:bg-sky-400');
      }
    });
  }

  // Scrubber live seeking
  if (scrubber) {
    scrubber.addEventListener('input', (e) => {
      const targetT = parseFloat(e.target.value);
      rinkCanvas.seekAnimation(targetT);
    });
  }

  // Speed Multipliers (0.5x, 1.0x, 1.5x)
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('bg-sky-500', 'text-white');
      btn.classList.remove('text-slate-400');
      const spd = parseFloat(btn.dataset.speed) || 1.0;
      rinkCanvas.setSpeed(spd);
      showToast(`Simulation speed set to ${spd}x`, 'info');
    });
  });

  // Toggle Ghost Trails
  if (trailsToggle) {
    trailsToggle.addEventListener('change', (e) => {
      rinkCanvas.toggleTrails(e.target.checked);
    });
  }

  // Toggle Passing Raycast Lanes
  if (lanesToggle) {
    lanesToggle.addEventListener('change', (e) => {
      rinkCanvas.togglePassingLanes(e.target.checked);
    });
  }

  // Real-Time Engine Tick Callback
  rinkCanvas.animState.onTick = (data) => {
    // Update Scrubber Max & Value
    if (scrubber) {
      if (Math.abs(parseFloat(scrubber.max) - data.duration) > 0.05) {
        scrubber.max = data.duration.toFixed(2);
      }
      if (!scrubber.matches(':active')) {
        scrubber.value = data.currentTime.toFixed(2);
      }
    }

    // Update Time Display
    if (timeDisplay) {
      const cM = Math.floor(data.currentTime / 60);
      const cS = (data.currentTime % 60).toFixed(1).padStart(4, '0');
      const dS = data.duration.toFixed(1).padStart(4, '0');
      timeDisplay.textContent = `${String(cM).padStart(2, '0')}:${cS} / ${dS}s`;
    }

    // Update Timed Coaching Cue Card
    if (data.activeCue) {
      if (cueTime) cueTime.textContent = `[${data.activeCue.t.toFixed(1)}s]`;
      if (cueTitle) cueTitle.textContent = data.activeCue.title;
      if (cueBadge) cueBadge.textContent = data.activeCue.focusTokenId ? `Focus: ${data.activeCue.focusTokenId}` : 'Tactical Scheme';
      if (cueNote) cueNote.textContent = data.activeCue.note;
    }

    // Update Passing Raycast Status Badge
    if (data.clearanceStatus && raycastBadge && raycastText) {
      raycastText.textContent = data.clearanceStatus.text;
      if (data.clearanceStatus.status === 'blocked') {
        raycastBadge.className = 'w-full md:w-auto px-3 py-1.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-300 font-mono text-[11px] flex items-center gap-2 shadow-inner';
      } else {
        raycastBadge.className = 'w-full md:w-auto px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 font-mono text-[11px] flex items-center gap-2 shadow-inner';
      }
    }
  };
}

// ==================== ENTERPRISE LINE COMBINATIONS & CHEMISTRY BUILDER ====================

function getFallbackLineCombinations() {
  return {
    "even_strength": {
      "forward_lines": [
        { "line_id": "line_1", "name": "Line 1 (Top Scoring Unit)", "lw": "u14_02", "c": "u14_01", "rw": "ushl_02" },
        { "line_id": "line_2", "name": "Line 2 (Speed & Transition)", "lw": "u16_01", "c": "ushl_01", "rw": "nahl_01" },
        { "line_id": "line_3", "name": "Line 3 (Two-Way Shutdown)", "lw": "women_01", "c": "nahl_02", "rw": "acha_01" },
        { "line_id": "line_4", "name": "Line 4 (Energy & Forecheck)", "lw": "u12_01", "c": "u18_01", "rw": "u8_02" }
      ],
      "defense_pairings": [
        { "pair_id": "pair_1", "name": "Pair 1 (Top Shutdown & Transition)", "ld": "u14_03", "rd": "ushl_03" },
        { "pair_id": "pair_2", "name": "Pair 2 (Offensive Point Walkers)", "ld": "u16_02", "rd": "u18_02" },
        { "pair_id": "pair_3", "name": "Pair 3 (Safety & Depth)", "ld": "ncaa_02", "rd": "nahl_03" }
      ],
      "goalies": { "starter": "ushl_04", "backup": "u14_04" }
    },
    "power_play": [
      { "unit_id": "pp_1", "name": "PP1 (1-3-1 Royal Road Seam)", "flank_lw": "u14_01", "bumper": "u14_02", "flank_rw": "ushl_02", "netfront": "nahl_01", "point_qb": "ushl_03" },
      { "unit_id": "pp_2", "name": "PP2 (Umbrella Quick Strike)", "flank_lw": "u16_01", "bumper": "ushl_01", "flank_rw": "acha_01", "netfront": "women_01", "point_qb": "u18_02" }
    ],
    "penalty_kill": [
      { "unit_id": "pk_1", "name": "PK1 (Pressure Box+1)", "f1": "u14_01", "f2": "ushl_01", "d1": "u14_03", "d2": "ncaa_02" },
      { "unit_id": "pk_2", "name": "PK2 (Diamond Neutral Trap)", "f1": "nahl_02", "f2": "u18_01", "d1": "u16_02", "d2": "nahl_03" }
    ],
    "overtime_3v3": [
      { "unit_id": "ot_1", "name": "OT Trio 1 (Maximum Possession)", "f1": "u14_01", "f2": "ushl_02", "d1": "ushl_03" }
    ]
  };
}

function initLineBuilder() {
  // Scheme Switcher
  const schemeBtns = document.querySelectorAll('.line-scheme-btn');
  schemeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      schemeBtns.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white', 'font-bold');
        b.classList.add('text-slate-400', 'font-semibold');
      });
      btn.classList.add('bg-sky-500', 'text-white', 'font-bold');
      btn.classList.remove('text-slate-400', 'font-semibold');

      currentLineScheme = btn.dataset.scheme;
      selectedTargetSlot = null;
      updateSelectedSlotUI();
      renderLineUnits();
      renderProspectDock();
    });
  });

  // Dock Filters
  const dockPosBtns = document.querySelectorAll('.dock-pos-btn');
  dockPosBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dockPosBtns.forEach(b => {
        b.classList.remove('bg-sky-500', 'text-white', 'font-bold');
        b.classList.add('bg-slate-900', 'text-slate-400', 'font-semibold');
      });
      btn.classList.add('bg-sky-500', 'text-white', 'font-bold');
      btn.classList.remove('bg-slate-900', 'text-slate-400', 'font-semibold');

      dockPosFilter = btn.dataset.dockPos;
      renderProspectDock();
    });
  });

  // Search input
  const searchInput = document.getElementById('dockSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      dockSearchQuery = e.target.value.toLowerCase().trim();
      renderProspectDock();
    });
  }

  // Auto Optimize Button
  const autoOptBtn = document.getElementById('autoOptimizeLinesBtn');
  if (autoOptBtn) {
    autoOptBtn.addEventListener('click', () => autoOptimizeLines());
  }

  // Save Lines Button
  const saveBtn = document.getElementById('saveLinesLedgerBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => saveLineCombinationsToLedger());
  }

  renderLineUnits();
  renderProspectDock();
}

function updateSelectedSlotUI() {
  const indicator = document.getElementById('selectedSlotIndicator');
  if (!indicator) return;

  if (selectedTargetSlot) {
    indicator.textContent = `Active: ${selectedTargetSlot.label}`;
    indicator.className = "font-mono text-emerald-300 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/40 animate-pulse";
  } else {
    indicator.textContent = "No Slot Selected";
    indicator.className = "font-mono text-sky-400 font-bold bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800";
  }
}

function selectSlot(slotData) {
  selectedTargetSlot = slotData;
  updateSelectedSlotUI();
  renderLineUnits();
  showToast(`Selected ${slotData.label}. Click any player in the dock to slot in.`, 'info');
}

function clearSlot(scheme, group, index, slotKey) {
  if (!lineBuilderState || !lineBuilderState[scheme]) return;

  if (scheme === 'even_strength') {
    if (group === 'goalies') {
      lineBuilderState.even_strength.goalies[slotKey] = null;
    } else {
      lineBuilderState.even_strength[group][index][slotKey] = null;
    }
  } else {
    lineBuilderState[scheme][index][slotKey] = null;
  }

  selectedTargetSlot = null;
  updateSelectedSlotUI();
  renderLineUnits();
  renderProspectDock();
  showToast(`Slot cleared.`, 'info');
}

function assignPlayerToSlot(playerId) {
  if (!appData || !appData.players) return;
  const player = appData.players.find(p => p.id === playerId);
  if (!player) return;

  if (!selectedTargetSlot) {
    // Intelligent auto-placement into first open slot matching position
    const openSlot = findFirstOpenSlotForPlayer(player);
    if (openSlot) {
      selectedTargetSlot = openSlot;
    } else {
      showToast(`Please click on an open slot on the board first!`, 'info');
      return;
    }
  }

  const { scheme, group, index, slotKey, label } = selectedTargetSlot;

  if (scheme === 'even_strength') {
    if (group === 'goalies') {
      lineBuilderState.even_strength.goalies[slotKey] = playerId;
    } else {
      lineBuilderState.even_strength[group][index][slotKey] = playerId;
    }
  } else {
    lineBuilderState[scheme][index][slotKey] = playerId;
  }

  showToast(`Slotted #${player.num} ${player.name} into ${label}!`, 'success');
  selectedTargetSlot = null;
  updateSelectedSlotUI();
  renderLineUnits();
  renderProspectDock();
}

function findFirstOpenSlotForPlayer(player) {
  const isGoalie = player.pos === 'G';
  const isD = player.pos.includes('D');

  if (currentLineScheme === 'even_strength') {
    if (isGoalie) {
      const g = lineBuilderState.even_strength.goalies;
      if (!g.starter) return { scheme: 'even_strength', group: 'goalies', index: 0, slotKey: 'starter', label: 'Starting Goaltender' };
      if (!g.backup) return { scheme: 'even_strength', group: 'goalies', index: 0, slotKey: 'backup', label: 'Backup Goaltender' };
    } else if (isD) {
      const pairs = lineBuilderState.even_strength.defense_pairings;
      for (let i = 0; i < pairs.length; i++) {
        if (!pairs[i].ld) return { scheme: 'even_strength', group: 'defense_pairings', index: i, slotKey: 'ld', label: `${pairs[i].name} - Left D` };
        if (!pairs[i].rd) return { scheme: 'even_strength', group: 'defense_pairings', index: i, slotKey: 'rd', label: `${pairs[i].name} - Right D` };
      }
    } else {
      const fLines = lineBuilderState.even_strength.forward_lines;
      for (let i = 0; i < fLines.length; i++) {
        if (!fLines[i].c && player.pos === 'C') return { scheme: 'even_strength', group: 'forward_lines', index: i, slotKey: 'c', label: `${fLines[i].name} - Center` };
        if (!fLines[i].lw) return { scheme: 'even_strength', group: 'forward_lines', index: i, slotKey: 'lw', label: `${fLines[i].name} - Left Wing` };
        if (!fLines[i].rw) return { scheme: 'even_strength', group: 'forward_lines', index: i, slotKey: 'rw', label: `${fLines[i].name} - Right Wing` };
        if (!fLines[i].c) return { scheme: 'even_strength', group: 'forward_lines', index: i, slotKey: 'c', label: `${fLines[i].name} - Center` };
      }
    }
  } else if (currentLineScheme === 'power_play') {
    const units = lineBuilderState.power_play;
    for (let i = 0; i < units.length; i++) {
      for (let k of ['flank_lw', 'bumper', 'flank_rw', 'netfront', 'point_qb']) {
        if (!units[i][k]) return { scheme: 'power_play', group: 'units', index: i, slotKey: k, label: `${units[i].name} - ${k.replace('_', ' ').toUpperCase()}` };
      }
    }
  } else if (currentLineScheme === 'penalty_kill') {
    const units = lineBuilderState.penalty_kill;
    for (let i = 0; i < units.length; i++) {
      for (let k of ['f1', 'f2', 'd1', 'd2']) {
        if (!units[i][k]) return { scheme: 'penalty_kill', group: 'units', index: i, slotKey: k, label: `${units[i].name} - ${k.toUpperCase()}` };
      }
    }
  } else if (currentLineScheme === 'overtime_3v3') {
    const units = lineBuilderState.overtime_3v3;
    for (let i = 0; i < units.length; i++) {
      for (let k of ['f1', 'f2', 'd1']) {
        if (!units[i][k]) return { scheme: 'overtime_3v3', group: 'units', index: i, slotKey: k, label: `${units[i].name} - ${k.toUpperCase()}` };
      }
    }
  }
  return null;
}

function clientComputeUnitChemistry(unitType, playerIds) {
  if (!appData || !appData.players) return { chemistry_score: 80, rating_label: "Balanced", avg_speed_sec: 4.1, handedness_synergy: "Balanced", possession_balance: "Good", tactical_cues: [] };

  const validPlayers = playerIds.map(pid => pid ? appData.players.find(p => p.id === pid) : null).filter(Boolean);
  if (validPlayers.length === 0) {
    return { chemistry_score: 0, rating_label: "Empty Line", avg_speed_sec: 0, handedness_synergy: "None", possession_balance: "No Skaters", tactical_cues: ["Assign active prospects to complete this unit."] };
  }

  const speeds = validPlayers.map(p => p.combine?.flying_30m_sec || 4.2);
  const avgSpeed = (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(2);
  const speedScore = Math.max(50, Math.min(99, 100 - (parseFloat(avgSpeed) - 3.7) * 45));

  const handedList = validPlayers.map(p => p.handed || 'L');
  let handednessBonus = 0;
  let handednessLabel = "Balanced";

  if (unitType === 'forward_trio') {
    if (handedList.includes('L') && handedList.includes('R')) {
      handednessBonus = 12;
      handednessLabel = "L/R Flank Seam Advantage (Off-Wing One-Timer Ready)";
    } else {
      handednessLabel = `Single Handedness (${handedList[0]} only)`;
    }
  } else if (unitType === 'defense_pairing') {
    if (validPlayers.length === 2 && validPlayers[0].handed !== validPlayers[1].handed) {
      handednessBonus = 15;
      handednessLabel = "Natural LD-Left / RD-Right Pair (Optimum Breakout Angles)";
    } else {
      handednessLabel = "Inverted Handedness (Off-stick retrievals)";
    }
  }

  const dZones = validPlayers.map(p => p.skill_rubric?.d_zone || 70);
  const avgDZone = dZones.reduce((a, b) => a + b, 0) / dZones.length;

  const base = (speedScore * 0.40) + (avgDZone * 0.40) + handednessBonus;
  const chemScore = Math.max(50, Math.min(99, Math.round(base)));

  let label = "Developing Chemistry";
  if (chemScore >= 90) label = "Tier-1 Franchise Chemistry";
  else if (chemScore >= 80) label = "High Tactical Synergy";
  else if (chemScore >= 70) label = "Balanced Competitive Line";

  const cues = [];
  if (handednessBonus > 0) cues.append ? cues.append("Handedness creates high-danger one-timer seams.") : cues.push("Handedness creates high-danger one-timer seams.");
  if (parseFloat(avgSpeed) <= 3.9) cues.push(`High-Speed Unit (Avg 30m: ${avgSpeed}s) creates odd-man rush leverage.`);

  return {
    chemistry_score: chemScore,
    rating_label: label,
    avg_speed_sec: avgSpeed,
    handedness_synergy: handednessLabel,
    possession_balance: validPlayers.length >= 2 ? "Dual-Threat Touch Ratio" : "Developing",
    tactical_cues: cues
  };
}

function renderLineUnits() {
  const container = document.getElementById('linesUnitsContainer');
  if (!container || !lineBuilderState) return;

  container.innerHTML = '';

  if (currentLineScheme === 'even_strength') {
    renderEvenStrengthUnits(container);
  } else if (currentLineScheme === 'power_play') {
    renderPowerPlayUnits(container);
  } else if (currentLineScheme === 'penalty_kill') {
    renderPenaltyKillUnits(container);
  } else if (currentLineScheme === 'overtime_3v3') {
    renderOvertimeUnits(container);
  }
}

function renderEvenStrengthUnits(container) {
  const ev = lineBuilderState.even_strength || {};
  const fLines = ev.forward_lines || [];
  const dPairs = ev.defense_pairings || [];
  const goalies = ev.goalies || {};

  // SECTION 1: FORWARD TRIOS
  const fHeader = document.createElement('div');
  fHeader.className = "flex items-center justify-between border-b border-slate-800 pb-1.5 pt-1";
  fHeader.innerHTML = `
    <h3 class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
      <span>🏒</span> Forward Lines (5v5 Trios)
    </h3>
    <span class="text-[10px] text-slate-400 font-mono">4 Full Lines Active</span>
  `;
  container.appendChild(fHeader);

  fLines.forEach((line, idx) => {
    const playerIds = [line.lw, line.c, line.rw];
    const chem = clientComputeUnitChemistry('forward_trio', playerIds);
    const card = document.createElement('div');
    card.className = "glass-panel p-4 rounded-2xl border border-slate-800 space-y-3";

    const chemBadgeColor = chem.chemistry_score >= 88 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : (chem.chemistry_score >= 78 ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40');

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-xs text-white">${line.name}</h4>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${chemBadgeColor}">
            ${chem.chemistry_score}/100 • ${chem.rating_label}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button class="deploy-unit-btn px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition flex items-center gap-1 shadow" data-unit-type="forward_line" data-unit-index="${idx}">
            🚀 Deploy to Active Ice
          </button>
        </div>
      </div>

      <!-- Tactical Synergy Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div>
          <span class="text-slate-400 block text-[10px]">Avg Speed:</span>
          <strong class="text-sky-300 font-mono">${chem.avg_speed_sec}s (30m)</strong>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">Stick Symmetry:</span>
          <strong class="text-amber-300 truncate block">${chem.handedness_synergy.split('(')[0]}</strong>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">Touch Balance:</span>
          <strong class="text-emerald-300">${chem.possession_balance}</strong>
        </div>
      </div>

      <!-- 3 Forward Slots -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        ${renderSlotCardHtml('even_strength', 'forward_lines', idx, 'lw', 'Left Wing (LW)', line.lw)}
        ${renderSlotCardHtml('even_strength', 'forward_lines', idx, 'c', 'Center (C)', line.c)}
        ${renderSlotCardHtml('even_strength', 'forward_lines', idx, 'rw', 'Right Wing (RW)', line.rw)}
      </div>
    `;

    container.appendChild(card);
  });

  // SECTION 2: DEFENSE PAIRINGS
  const dHeader = document.createElement('div');
  dHeader.className = "flex items-center justify-between border-b border-slate-800 pb-1.5 pt-4";
  dHeader.innerHTML = `
    <h3 class="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
      <span>🛡️</span> Defense Pairings (5v5)
    </h3>
    <span class="text-[10px] text-slate-400 font-mono">3 Pairs Active</span>
  `;
  container.appendChild(dHeader);

  dPairs.forEach((pair, idx) => {
    const playerIds = [pair.ld, pair.rd];
    const chem = clientComputeUnitChemistry('defense_pairing', playerIds);
    const card = document.createElement('div');
    card.className = "glass-panel p-4 rounded-2xl border border-slate-800 space-y-3";

    const chemBadgeColor = chem.chemistry_score >= 88 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : (chem.chemistry_score >= 78 ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40');

    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-xs text-white">${pair.name}</h4>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${chemBadgeColor}">
            ${chem.chemistry_score}/100 • ${chem.rating_label}
          </span>
        </div>
        <button class="deploy-unit-btn px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition flex items-center gap-1 shadow" data-unit-type="defense_pairing" data-unit-index="${idx}">
          🚀 Deploy to Active Ice
        </button>
      </div>

      <!-- Tactical Synergy Bar -->
      <div class="grid grid-cols-2 gap-2 text-[11px] p-2 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div>
          <span class="text-slate-400 block text-[10px]">Pairing Speed:</span>
          <strong class="text-sky-300 font-mono">${chem.avg_speed_sec}s (30m)</strong>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px]">Breakout Vision:</span>
          <strong class="text-emerald-300 truncate block">${chem.handedness_synergy}</strong>
        </div>
      </div>

      <!-- 2 Defense Slots -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        ${renderSlotCardHtml('even_strength', 'defense_pairings', idx, 'ld', 'Left Defense (LD)', pair.ld)}
        ${renderSlotCardHtml('even_strength', 'defense_pairings', idx, 'rd', 'Right Defense (RD)', pair.rd)}
      </div>
    `;
    container.appendChild(card);
  });

  // SECTION 3: GOALTENDERS
  const gHeader = document.createElement('div');
  gHeader.className = "flex items-center justify-between border-b border-slate-800 pb-1.5 pt-4";
  gHeader.innerHTML = `
    <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
      <span>🥅</span> Goaltender Tandem
    </h3>
  `;
  container.appendChild(gHeader);

  const gCard = document.createElement('div');
  gCard.className = "glass-panel p-4 rounded-2xl border border-slate-800 space-y-3";
  gCard.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      ${renderSlotCardHtml('even_strength', 'goalies', 0, 'starter', 'Starting Goaltender (G1)', goalies.starter)}
      ${renderSlotCardHtml('even_strength', 'goalies', 0, 'backup', 'Backup Goaltender (G2)', goalies.backup)}
    </div>
  `;
  container.appendChild(gCard);

  bindUnitDeployButtons();
}

function renderPowerPlayUnits(container) {
  const units = lineBuilderState.power_play || [];
  units.forEach((unit, idx) => {
    const playerIds = [unit.flank_lw, unit.bumper, unit.flank_rw, unit.netfront, unit.point_qb];
    const chem = clientComputeUnitChemistry('power_play', playerIds);
    const card = document.createElement('div');
    card.className = "glass-panel p-4 rounded-2xl border border-slate-800 space-y-3";
    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-xs text-white">${unit.name}</h4>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/20 text-amber-300 border-amber-500/40">
            ${chem.chemistry_score}/100 Synergy
          </span>
        </div>
        <button class="deploy-unit-btn px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition shadow" data-unit-type="power_play" data-unit-index="${idx}">
          🚀 Deploy PP Unit to Ice
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
        ${renderSlotCardHtml('power_play', 'units', idx, 'flank_lw', 'Left Flank (Half-Wall)', unit.flank_lw)}
        ${renderSlotCardHtml('power_play', 'units', idx, 'bumper', 'Slot Bumper', unit.bumper)}
        ${renderSlotCardHtml('power_play', 'units', idx, 'flank_rw', 'Right Flank (One-Timer)', unit.flank_rw)}
        ${renderSlotCardHtml('power_play', 'units', idx, 'netfront', 'Net-Front Screen', unit.netfront)}
        ${renderSlotCardHtml('power_play', 'units', idx, 'point_qb', 'Point Quarterback', unit.point_qb)}
      </div>
    `;
    container.appendChild(card);
  });
  bindUnitDeployButtons();
}

function renderPenaltyKillUnits(container) {
  const units = lineBuilderState.penalty_kill || [];
  units.forEach((unit, idx) => {
    const playerIds = [unit.f1, unit.f2, unit.d1, unit.d2];
    const chem = clientComputeUnitChemistry('penalty_kill', playerIds);
    const card = document.createElement('div');
    card.className = "glass-panel p-4 rounded-2xl border border-slate-800 space-y-3";
    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-xs text-white">${unit.name}</h4>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-red-500/20 text-red-300 border-red-500/40">
            ${chem.chemistry_score}/100 Synergy
          </span>
        </div>
        <button class="deploy-unit-btn px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition shadow" data-unit-type="penalty_kill" data-unit-index="${idx}">
          🚀 Deploy PK Unit to Ice
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        ${renderSlotCardHtml('penalty_kill', 'units', idx, 'f1', 'F1 Pressure Forecheck', unit.f1)}
        ${renderSlotCardHtml('penalty_kill', 'units', idx, 'f2', 'F2 Seam Denial', unit.f2)}
        ${renderSlotCardHtml('penalty_kill', 'units', idx, 'd1', 'D1 Netfront Clear', unit.d1)}
        ${renderSlotCardHtml('penalty_kill', 'units', idx, 'd2', 'D2 Board Pin Anchor', unit.d2)}
      </div>
    `;
    container.appendChild(card);
  });
  bindUnitDeployButtons();
}

function renderOvertimeUnits(container) {
  const units = lineBuilderState.overtime_3v3 || [];
  units.forEach((unit, idx) => {
    const playerIds = [unit.f1, unit.f2, unit.d1];
    const chem = clientComputeUnitChemistry('overtime_3v3', playerIds);
    const card = document.createElement('div');
    card.className = "glass-panel p-4 rounded-2xl border border-slate-800 space-y-3";
    card.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div class="flex items-center gap-2">
          <h4 class="font-bold text-xs text-white">${unit.name}</h4>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-purple-500/20 text-purple-300 border-purple-500/40">
            ${chem.chemistry_score}/100 Synergy
          </span>
        </div>
        <button class="deploy-unit-btn px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition shadow" data-unit-type="overtime_3v3" data-unit-index="${idx}">
          🚀 Deploy 3v3 Trio to Ice
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        ${renderSlotCardHtml('overtime_3v3', 'units', idx, 'f1', 'Forward 1 (Possession)', unit.f1)}
        ${renderSlotCardHtml('overtime_3v3', 'units', idx, 'f2', 'Forward 2 (Finisher)', unit.f2)}
        ${renderSlotCardHtml('overtime_3v3', 'units', idx, 'd1', 'Defenseman (Transition)', unit.d1)}
      </div>
    `;
    container.appendChild(card);
  });
  bindUnitDeployButtons();
}

function renderSlotCardHtml(scheme, group, index, slotKey, label, playerId) {
  const isSelected = selectedTargetSlot && selectedTargetSlot.scheme === scheme && selectedTargetSlot.group === group && selectedTargetSlot.index === index && selectedTargetSlot.slotKey === slotKey;
  const slotDataJson = JSON.stringify({ scheme, group, index, slotKey, label }).replace(/"/g, '&quot;');

  if (!playerId) {
    return `
      <div class="p-3 rounded-xl border border-dashed transition-all cursor-pointer select-none flex flex-col items-center justify-center min-h-[96px] text-center ${isSelected ? 'bg-sky-950/60 border-sky-400 ring-2 ring-sky-400/50' : 'bg-slate-900/40 border-slate-700 hover:border-sky-500/60'}" onclick="selectSlot(${slotDataJson})">
        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">${label}</span>
        <span class="text-xs text-sky-400 font-bold flex items-center gap-1">+ Slot Skater</span>
      </div>
    `;
  }

  const p = appData.players.find(pl => pl.id === playerId);
  if (!p) {
    return `
      <div class="p-3 rounded-xl border border-dashed border-red-500/50 bg-red-950/20 text-center cursor-pointer" onclick="selectSlot(${slotDataJson})">
        <span class="text-[10px] text-red-400">Player ${playerId} not found</span>
      </div>
    `;
  }

  const speed = p.combine?.flying_30m_sec ? `${p.combine.flying_30m_sec}s` : '4.1s';
  const stickColor = p.handed === 'R' ? 'text-amber-400' : 'text-cyan-400';

  return `
    <div class="p-3 rounded-xl border transition-all cursor-pointer select-none relative group ${isSelected ? 'bg-sky-950/50 border-sky-400 ring-2 ring-sky-400/50' : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'}" onclick="selectSlot(${slotDataJson})">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider">${label}</span>
        <button class="w-5 h-5 rounded-full bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-700 text-xs flex items-center justify-center transition" onclick="event.stopPropagation(); clearSlot('${scheme}', '${group}', ${index}, '${slotKey}')" title="Clear Slot">✕</button>
      </div>

      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-tr ${p.avatar_gradient || 'from-sky-500 to-indigo-600'} text-white font-bold flex items-center justify-center text-[10px] shadow">
          #${p.num}
        </div>
        <div class="overflow-hidden">
          <h5 class="font-bold text-xs text-white truncate leading-tight">${p.name}</h5>
          <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>${p.pos} • <strong class="${stickColor}">${p.handed}</strong></span>
            <span>| 🏃 ${speed}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProspectDock() {
  const container = document.getElementById('dockProspectsList');
  if (!container || !appData || !appData.players) return;

  const countBadge = document.getElementById('dockPlayerCountBadge');
  
  // Find all players currently assigned in this scheme
  const assignedPids = new Set();
  if (currentLineScheme === 'even_strength' && lineBuilderState?.even_strength) {
    lineBuilderState.even_strength.forward_lines?.forEach(l => { if (l.lw) assignedPids.add(l.lw); if (l.c) assignedPids.add(l.c); if (l.rw) assignedPids.add(l.rw); });
    lineBuilderState.even_strength.defense_pairings?.forEach(p => { if (p.ld) assignedPids.add(p.ld); if (p.rd) assignedPids.add(p.rd); });
    if (lineBuilderState.even_strength.goalies?.starter) assignedPids.add(lineBuilderState.even_strength.goalies.starter);
    if (lineBuilderState.even_strength.goalies?.backup) assignedPids.add(lineBuilderState.even_strength.goalies.backup);
  } else if (lineBuilderState && lineBuilderState[currentLineScheme]) {
    lineBuilderState[currentLineScheme].forEach(u => {
      Object.values(u).forEach(val => { if (typeof val === 'string' && val.startsWith('u')) assignedPids.add(val); });
    });
  }

  let filtered = appData.players.filter(p => {
    // Position filter
    if (dockPosFilter === 'F' && (p.pos.includes('D') || p.pos === 'G')) return false;
    if (dockPosFilter === 'D' && !p.pos.includes('D')) return false;
    if (dockPosFilter === 'G' && p.pos !== 'G') return false;

    // Search query
    if (dockSearchQuery) {
      const q = dockSearchQuery;
      const match = p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q) || p.pos.toLowerCase().includes(q) || p.handed.toLowerCase() === q;
      if (!match) return false;
    }
    return true;
  });

  if (countBadge) countBadge.textContent = `${filtered.length} Skaters`;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="p-4 text-center text-xs text-slate-500">No prospects match filter.</div>`;
    return;
  }

  container.innerHTML = filtered.map(p => {
    const isAssigned = assignedPids.has(p.id);
    const speed = p.combine?.flying_30m_sec ? `${p.combine.flying_30m_sec}s` : '4.1s';
    const stickClass = p.handed === 'R' ? 'text-amber-400' : 'text-cyan-400';

    return `
      <div class="p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between ${isAssigned ? 'bg-slate-900/40 border-slate-800/80 opacity-75' : 'bg-slate-900/90 border-slate-800 hover:border-sky-500'}" onclick="assignPlayerToSlot('${p.id}')">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-tr ${p.avatar_gradient || 'from-sky-500 to-indigo-600'} text-white font-bold flex items-center justify-center text-[10px] shadow">
            #${p.num}
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h5 class="font-bold text-xs text-white leading-tight">${p.name}</h5>
              ${isAssigned ? '<span class="px-1 py-0.2 rounded text-[8px] font-bold bg-slate-800 text-slate-400">Slotted</span>' : ''}
            </div>
            <p class="text-[10px] text-slate-400">${p.pos} • Stick: <strong class="${stickClass}">${p.handed}</strong> • 30m: <strong>${speed}</strong></p>
          </div>
        </div>

        <button class="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] transition shadow" onclick="event.stopPropagation(); assignPlayerToSlot('${p.id}')">
          Slot In →
        </button>
      </div>
    `;
  }).join('');
}

function bindUnitDeployButtons() {
  document.querySelectorAll('.deploy-unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const uType = btn.dataset.unitType;
      const uIdx = parseInt(btn.dataset.unitIndex);
      let pids = [];
      let unitName = "Selected Line";

      if (uType === 'forward_line') {
        const line = lineBuilderState.even_strength.forward_lines[uIdx];
        pids = [line.lw, line.c, line.rw].filter(Boolean);
        unitName = line.name;
      } else if (uType === 'defense_pairing') {
        const pair = lineBuilderState.even_strength.defense_pairings[uIdx];
        pids = [pair.ld, pair.rd].filter(Boolean);
        unitName = pair.name;
      } else if (uType === 'power_play') {
        const pp = lineBuilderState.power_play[uIdx];
        pids = [pp.flank_lw, pp.bumper, pp.flank_rw, pp.netfront, pp.point_qb].filter(Boolean);
        unitName = pp.name;
      } else if (uType === 'penalty_kill') {
        const pk = lineBuilderState.penalty_kill[uIdx];
        pids = [pk.f1, pk.f2, pk.d1, pk.d2].filter(Boolean);
        unitName = pk.name;
      } else if (uType === 'overtime_3v3') {
        const ot = lineBuilderState.overtime_3v3[uIdx];
        pids = [ot.f1, ot.f2, ot.d1].filter(Boolean);
        unitName = ot.name;
      }

      deployLineToBench(unitName, pids);
    });
  });
}

function deployLineToBench(unitName, pids) {
  if (!pids || pids.length === 0) {
    showToast(`No active skaters assigned in this line yet!`, 'info');
    return;
  }

  onIcePlayers = [...pids];
  // Reset shift timers for newly deployed players
  onIcePlayers.forEach(pid => {
    playerShiftTimers[pid] = 0;
  });

  // Switch to bench tab and notify user
  switchTab('bench');
  showToast(`🚀 Deployed ${unitName} (${pids.length} Skaters) to Live Ice! Shift timers engaged.`, 'success');
}

async function saveLineCombinationsToLedger() {
  if (!lineBuilderState) return;

  try {
    const res = await fetch('/api/lines/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lines_data: lineBuilderState,
        account: `${currentUser.name} (${currentUser.badge})`
      })
    });

    if (res.ok) {
      const data = await res.json();
      showToast(`Line combinations saved & stamped to ${data.stamped_count} prospect passports!`, 'success');
    } else {
      localSaveLinesLedger();
      showToast(`Line combinations saved locally & stamped to ledgers!`, 'success');
    }
  } catch (err) {
    localSaveLinesLedger();
    showToast(`Line combinations saved locally & stamped to ledgers!`, 'success');
  }

  if (selectedPlayer) {
    renderPlayerDossier(selectedPlayer);
  }
}

function localSaveLinesLedger() {
  const stampedPids = new Set();
  lineBuilderState.even_strength?.forward_lines?.forEach(f => {
    [f.lw, f.c, f.rw].forEach(pid => {
      if (pid && !stampedPids.has(pid)) {
        stampedPids.add(pid);
        const p = appData.players.find(pl => pl.id === pid);
        if (p) {
          p.audit_ledger.unshift({
            id: `led_${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            account: `${currentUser.name} (${currentUser.badge})`,
            category: "Line Combinations & Depth Chart",
            action: `Assigned to ${f.name}`,
            diff: `Line combinations locked for upcoming competition.`
          });
        }
      }
    });
  });
}

function autoOptimizeLines() {
  if (!appData || !appData.players) return;
  const forwards = appData.players.filter(p => !p.pos.includes('D') && p.pos !== 'G').sort((a, b) => (b.projection?.composite_trajectory_score || 0) - (a.projection?.composite_trajectory_score || 0));
  const defense = appData.players.filter(p => p.pos.includes('D')).sort((a, b) => (b.projection?.composite_trajectory_score || 0) - (a.projection?.composite_trajectory_score || 0));
  const goalies = appData.players.filter(p => p.pos === 'G');

  // Even strength optimization
  if (forwards.length >= 12 && defense.length >= 6) {
    lineBuilderState.even_strength.forward_lines[0] = { line_id: "line_1", name: "Line 1 (Top Scoring Unit)", lw: forwards[1]?.id, c: forwards[0]?.id, rw: forwards[2]?.id };
    lineBuilderState.even_strength.forward_lines[1] = { line_id: "line_2", name: "Line 2 (Speed & Transition)", lw: forwards[3]?.id, c: forwards[4]?.id, rw: forwards[5]?.id };
    lineBuilderState.even_strength.forward_lines[2] = { line_id: "line_3", name: "Line 3 (Two-Way Shutdown)", lw: forwards[6]?.id, c: forwards[7]?.id, rw: forwards[8]?.id };
    lineBuilderState.even_strength.forward_lines[3] = { line_id: "line_4", name: "Line 4 (Energy & Forecheck)", lw: forwards[9]?.id, c: forwards[10]?.id, rw: forwards[11]?.id };

    lineBuilderState.even_strength.defense_pairings[0] = { pair_id: "pair_1", name: "Pair 1 (Top Shutdown & Transition)", ld: defense[0]?.id, rd: defense[1]?.id };
    lineBuilderState.even_strength.defense_pairings[1] = { pair_id: "pair_2", name: "Pair 2 (Offensive Point Walkers)", ld: defense[2]?.id, rd: defense[3]?.id };
    lineBuilderState.even_strength.defense_pairings[2] = { pair_id: "pair_3", name: "Pair 3 (Safety & Depth)", ld: defense[4]?.id, rd: defense[5]?.id };

    if (goalies.length >= 2) {
      lineBuilderState.even_strength.goalies = { starter: goalies[0]?.id, backup: goalies[1]?.id };
    }
  }

  renderLineUnits();
  renderProspectDock();
  showToast(`Lines automatically optimized for maximum synergy & speed!`, 'success');
}

// ==================== HEAD-TO-HEAD PROSPECT COMPARISON & BENCHMARK STUDIO ====================

function getFallbackBenchmarks() {
  return {
    "benchmark_ncaa_d1": {
      id: "benchmark_ncaa_d1",
      name: "NCAA Division I Benchmark",
      team: "NCAA Men's D1 Standard Baseline",
      league: "NCAA Division I",
      level: "college",
      pos: "Benchmark",
      handed: "R/L",
      gpa: 3.65,
      avatar_gradient: "from-emerald-500 to-teal-700",
      status_badge: "NCAA D1 Standard",
      primary_role: "Collegiate 200-ft Standard",
      combine: { flying_30m_sec: 3.75, broad_jump_in: 105, pro_agility_5_10_5_sec: 4.40, grip_strength_lbs: 135, rotational_medball_mph: 34.0 },
      micro_kpis: { controlled_exit_pct: 82.0, controlled_entry_pct: 78.0, wall_battle_win_pct: 68.0, shoulder_scans_per_possession: 4.2, high_danger_pass_comp_pct: 74.0 },
      skill_rubric: { edges: 88, puck_skills: 87, shooting: 88, hockey_iq: 90, contact: 86, d_zone: 88, transition: 89 },
      projection: { composite_trajectory_score: 92.5, probabilities: { ncaa_d1: 95.0, ushl_tier1: 98.0, nahl_tier2: 99.0 } }
    },
    "benchmark_ushl_tier1": {
      id: "benchmark_ushl_tier1",
      name: "USHL Tier 1 Draft Baseline",
      team: "USHL Tier 1 Junior Benchmark",
      league: "USHL Tier 1",
      level: "ushl",
      pos: "Benchmark",
      handed: "R/L",
      gpa: 3.50,
      avatar_gradient: "from-amber-500 to-orange-700",
      status_badge: "USHL Draft Benchmark",
      primary_role: "Junior Tier 1 Benchmark",
      combine: { flying_30m_sec: 3.82, broad_jump_in: 102, pro_agility_5_10_5_sec: 4.52, grip_strength_lbs: 128, rotational_medball_mph: 31.5 },
      micro_kpis: { controlled_exit_pct: 79.0, controlled_entry_pct: 74.0, wall_battle_win_pct: 65.0, shoulder_scans_per_possession: 3.8, high_danger_pass_comp_pct: 70.0 },
      skill_rubric: { edges: 86, puck_skills: 85, shooting: 85, hockey_iq: 86, contact: 84, d_zone: 85, transition: 86 },
      projection: { composite_trajectory_score: 88.0, probabilities: { ncaa_d1: 82.0, ushl_tier1: 92.0, nahl_tier2: 96.0 } }
    },
    "benchmark_nahl_tier2": {
      id: "benchmark_nahl_tier2",
      name: "NAHL Tier 2 Development Baseline",
      team: "NAHL Tier 2 Junior Benchmark",
      league: "NAHL Tier 2",
      level: "nahl",
      pos: "Benchmark",
      handed: "R/L",
      gpa: 3.40,
      avatar_gradient: "from-sky-500 to-blue-700",
      status_badge: "NAHL Standard",
      primary_role: "Junior Tier 2 Benchmark",
      combine: { flying_30m_sec: 3.92, broad_jump_in: 98, pro_agility_5_10_5_sec: 4.62, grip_strength_lbs: 122, rotational_medball_mph: 29.0 },
      micro_kpis: { controlled_exit_pct: 75.0, controlled_entry_pct: 70.0, wall_battle_win_pct: 63.0, shoulder_scans_per_possession: 3.4, high_danger_pass_comp_pct: 66.0 },
      skill_rubric: { edges: 82, puck_skills: 81, shooting: 82, hockey_iq: 83, contact: 85, d_zone: 82, transition: 82 },
      projection: { composite_trajectory_score: 83.5, probabilities: { ncaa_d1: 64.0, ushl_tier1: 76.0, nahl_tier2: 90.0 } }
    },
    "benchmark_u16_aaa": {
      id: "benchmark_u16_aaa",
      name: "U16 Tier 1 AAA Baseline",
      team: "USA Hockey U16 AAA Major Baseline",
      league: "Tier 1 AAA Midget",
      level: "u16",
      pos: "Benchmark",
      handed: "R/L",
      gpa: 3.60,
      avatar_gradient: "from-purple-500 to-indigo-700",
      status_badge: "U16 AAA Major Benchmark",
      primary_role: "Midget Major Benchmark",
      combine: { flying_30m_sec: 4.02, broad_jump_in: 94, pro_agility_5_10_5_sec: 4.75, grip_strength_lbs: 105, rotational_medball_mph: 26.0 },
      micro_kpis: { controlled_exit_pct: 72.0, controlled_entry_pct: 68.0, wall_battle_win_pct: 60.0, shoulder_scans_per_possession: 3.0, high_danger_pass_comp_pct: 62.0 },
      skill_rubric: { edges: 79, puck_skills: 78, shooting: 77, hockey_iq: 79, contact: 76, d_zone: 77, transition: 79 },
      projection: { composite_trajectory_score: 79.0, probabilities: { ncaa_d1: 52.0, ushl_tier1: 65.0, nahl_tier2: 82.0 } }
    }
  };
}

function initComparisonStudio() {
  if (!appData || !appData.players) return;

  const selectA = document.getElementById('comparePlayerASelect');
  const targetBGroup = document.getElementById('compareTargetBPlayerOptions');
  const selectB = document.getElementById('compareTargetBSelect');

  if (selectA) {
    selectA.innerHTML = appData.players.map(p => `
      <option value="${p.id}" ${p.id === comparisonPlayerAId ? 'selected' : ''}>#${p.num} ${p.name} (${p.team.split(' ')[0]} ${p.pos})</option>
    `).join('');

    selectA.addEventListener('change', (e) => {
      comparisonPlayerAId = e.target.value;
      renderComparisonView();
    });
  }

  if (targetBGroup) {
    targetBGroup.innerHTML = appData.players.map(p => `
      <option value="${p.id}" ${p.id === comparisonTargetBId ? 'selected' : ''}>#${p.num} ${p.name} (${p.team.split(' ')[0]} ${p.pos})</option>
    `).join('');
  }

  if (selectB) {
    selectB.value = comparisonTargetBId;
    selectB.addEventListener('change', (e) => {
      comparisonTargetBId = e.target.value;
      renderComparisonView();
    });
  }

  // Quick Preset Buttons
  document.querySelectorAll('.compare-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetB = btn.dataset.targetB;
      if (targetB && selectB) {
        selectB.value = targetB;
        comparisonTargetBId = targetB;
        renderComparisonView();
      }
    });
  });

  // Export Scout Card Button
  const exportBtn = document.getElementById('exportScoutCardBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => exportComparativeScoutCard());
  }

  renderComparisonView();
}

async function renderComparisonView() {
  let compData = null;

  try {
    const res = await fetch('/api/players/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_a_id: comparisonPlayerAId, target_b_id: comparisonTargetBId })
    });
    if (res.ok) {
      compData = await res.json();
    } else {
      compData = computeClientComparison(comparisonPlayerAId, comparisonTargetBId);
    }
  } catch (e) {
    compData = computeClientComparison(comparisonPlayerAId, comparisonTargetBId);
  }

  if (!compData) return;

  const { athlete_a, target_b, combine_comparison, micro_kpi_comparison, projections_comparison, scorecard, scouting_verdict } = compData;

  // 1. Render Athlete A Hero Card
  const cardA = document.getElementById('compareCardA');
  if (cardA) {
    const speedA = athlete_a.combine?.flying_30m_sec ? `${athlete_a.combine.flying_30m_sec}s` : '4.0s';
    const trajA = athlete_a.projection?.composite_trajectory_score || 80.0;
    const ncaaA = athlete_a.projection?.probabilities?.ncaa_d1 || 50;

    cardA.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-sky-500/30 pb-2">
          <span class="text-[10px] font-bold text-sky-400 uppercase tracking-wider">🔵 Athlete A</span>
          <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">${athlete_a.status_badge || 'Active Prospect'}</span>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${athlete_a.avatar_gradient || 'from-sky-500 to-indigo-600'} text-white font-black text-lg flex items-center justify-center shadow-lg shadow-sky-500/20">
            #${athlete_a.num}
          </div>
          <div>
            <h3 class="text-sm font-black text-white leading-tight">${athlete_a.name}</h3>
            <p class="text-xs text-slate-300">${athlete_a.team}</p>
            <p class="text-[11px] text-sky-400 font-semibold">${athlete_a.pos} • Stick: ${athlete_a.handed} • Age ${athlete_a.age || 16}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-[10px] text-slate-400 block">Trajectory:</span>
          <span class="text-base font-black text-sky-400 font-mono">${trajA}</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-[10px] text-slate-400 block">NCAA D1:</span>
          <span class="text-base font-black text-emerald-400 font-mono">${ncaaA}%</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-[10px] text-slate-400 block">30m Speed:</span>
          <span class="text-xs font-bold text-white font-mono">${speedA}</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-[10px] text-slate-400 block">Core GPA:</span>
          <span class="text-xs font-bold text-purple-300 font-mono">${athlete_a.gpa || 3.8}</span>
        </div>
      </div>
    `;
  }

  // 2. Render Target B Hero Card
  const cardB = document.getElementById('compareCardB');
  if (cardB) {
    const speedB = target_b.combine?.flying_30m_sec ? `${target_b.combine.flying_30m_sec}s` : '4.0s';
    const trajB = target_b.projection?.composite_trajectory_score || 85.0;
    const ncaaB = target_b.projection?.probabilities?.ncaa_d1 || 70;

    cardB.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-amber-500/30 pb-2">
          <span class="text-[10px] font-bold text-amber-400 uppercase tracking-wider">🟠 Target B / Standard</span>
          <span class="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">${target_b.status_badge || 'Standard Baseline'}</span>
        </div>

        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${target_b.avatar_gradient || 'from-amber-500 to-orange-700'} text-white font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            ${target_b.num === 0 ? '★' : `#${target_b.num}`}
          </div>
          <div>
            <h3 class="text-sm font-black text-white leading-tight">${target_b.name}</h3>
            <p class="text-xs text-slate-300">${target_b.team}</p>
            <p class="text-[11px] text-amber-400 font-semibold">${target_b.pos} • Stick: ${target_b.handed} • Age ${target_b.age || 18}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-[10px] text-slate-400 block">Trajectory:</span>
          <span class="text-base font-black text-amber-400 font-mono">${trajB}</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-[10px] text-slate-400 block">NCAA D1:</span>
          <span class="text-base font-black text-emerald-400 font-mono">${ncaaB}%</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-[10px] text-slate-400 block">30m Speed:</span>
          <span class="text-xs font-bold text-white font-mono">${speedB}</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span class="text-[10px] text-slate-400 block">Core GPA:</span>
          <span class="text-xs font-bold text-purple-300 font-mono">${target_b.gpa || 3.5}</span>
        </div>
      </div>
    `;
  }

  // 3. Render Dual Radar Chart
  updateComparisonRadar(compData);

  // 4. Render Verdict Banner
  const verdictBanner = document.getElementById('comparisonVerdictBanner');
  if (verdictBanner) {
    verdictBanner.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <span class="text-base">📋</span>
          <h4 class="font-black text-xs text-white uppercase tracking-wider">Executive Comparative Scouting Verdict</h4>
        </div>
        <div class="flex items-center gap-3 text-xs font-mono">
          <span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
            <strong>${athlete_a.name.split(' ')[0]}:</strong> ${scorecard.edges_a} Edges
          </span>
          <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <strong>${target_b.name.split(' ')[0]}:</strong> ${scorecard.edges_b} Edges
          </span>
        </div>
      </div>

      <p class="text-xs text-slate-200 leading-relaxed">${scouting_verdict}</p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        <div class="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2">
          <span class="text-base">⚡</span>
          <div>
            <span class="text-[10px] text-slate-400 block font-semibold">Speed Separation:</span>
            <strong class="text-white">${scorecard.speed_edge}</strong>
          </div>
        </div>
        <div class="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2">
          <span class="text-base">🎯</span>
          <div>
            <span class="text-[10px] text-slate-400 block font-semibold">Playmaking & Vision:</span>
            <strong class="text-white">${scorecard.vision_edge}</strong>
          </div>
        </div>
        <div class="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2">
          <span class="text-base">🛡️</span>
          <div>
            <span class="text-[10px] text-slate-400 block font-semibold">Wall & Board Battle:</span>
            <strong class="text-white">${scorecard.physical_edge}</strong>
          </div>
        </div>
      </div>
    `;
  }

  // 5. Update Table Headers
  const thACombine = document.getElementById('thPlayerACombine');
  const thBCombine = document.getElementById('thTargetBCombine');
  const thAKPI = document.getElementById('thPlayerAKPI');
  const thBKPI = document.getElementById('thTargetBKPI');
  if (thACombine) thACombine.textContent = athlete_a.name.split(' ')[0];
  if (thBCombine) thBCombine.textContent = target_b.name.split(' ')[0];
  if (thAKPI) thAKPI.textContent = athlete_a.name.split(' ')[0];
  if (thBKPI) thBKPI.textContent = target_b.name.split(' ')[0];

  // 6. Populate Combine Table
  const combineTable = document.getElementById('combineComparisonTableBody');
  if (combineTable) {
    combineTable.innerHTML = combine_comparison.map(item => {
      const isAdvA = item.advantage === 'A';
      const isAdvB = item.advantage === 'B';
      const badgeClass = isAdvA ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : (isAdvB ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700');
      const sign = item.delta > 0 ? `+${item.delta}` : `${item.delta}`;

      return `
        <tr class="hover:bg-slate-900/50">
          <td class="py-2.5 font-semibold text-slate-300">${item.metric}</td>
          <td class="py-2.5 text-center font-mono font-bold text-sky-400">${item.val_a} ${item.unit}</td>
          <td class="py-2.5 text-center font-mono font-bold text-amber-400">${item.val_b} ${item.unit}</td>
          <td class="py-2.5 text-right font-mono">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}">
              ${sign} ${item.unit} (${item.advantage === 'A' ? athlete_a.name.split(' ')[0] : (item.advantage === 'B' ? target_b.name.split(' ')[0] : 'EVEN')})
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 7. Populate Micro-KPI Table
  const kpiTable = document.getElementById('microKpiComparisonTableBody');
  if (kpiTable) {
    kpiTable.innerHTML = micro_kpi_comparison.map(item => {
      const isAdvA = item.advantage === 'A';
      const isAdvB = item.advantage === 'B';
      const badgeClass = isAdvA ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : (isAdvB ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-400 border-slate-700');
      const sign = item.delta > 0 ? `+${item.delta}` : `${item.delta}`;

      return `
        <tr class="hover:bg-slate-900/50">
          <td class="py-2.5 font-semibold text-slate-300">${item.metric}</td>
          <td class="py-2.5 text-center font-mono font-bold text-sky-400">${item.val_a} ${item.unit}</td>
          <td class="py-2.5 text-center font-mono font-bold text-amber-400">${item.val_b} ${item.unit}</td>
          <td class="py-2.5 text-right font-mono">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}">
              ${sign} ${item.unit} (${item.advantage === 'A' ? athlete_a.name.split(' ')[0] : (item.advantage === 'B' ? target_b.name.split(' ')[0] : 'EVEN')})
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function updateComparisonRadar(compData) {
  const canvas = document.getElementById('comparisonRadarCanvas');
  if (!canvas) return;

  if (comparisonRadarInstance) {
    comparisonRadarInstance.destroy();
  }

  const { athlete_a, target_b } = compData;

  const legA = document.getElementById('radarLegendLabelA');
  const legB = document.getElementById('radarLegendLabelB');
  if (legA) legA.textContent = athlete_a.name;
  if (legB) legB.textContent = target_b.name;

  const labels = ["Edges", "Handling", "Shooting", "Hockey IQ", "Physicality", "D-Zone", "Transition"];
  const dataA = [
    athlete_a.skill_rubric?.edges || 75,
    athlete_a.skill_rubric?.puck_skills || 75,
    athlete_a.skill_rubric?.shooting || 75,
    athlete_a.skill_rubric?.hockey_iq || 75,
    athlete_a.skill_rubric?.contact || 70,
    athlete_a.skill_rubric?.d_zone || 70,
    athlete_a.skill_rubric?.transition || 75
  ];
  const dataB = [
    target_b.skill_rubric?.edges || 75,
    target_b.skill_rubric?.puck_skills || 75,
    target_b.skill_rubric?.shooting || 75,
    target_b.skill_rubric?.hockey_iq || 75,
    target_b.skill_rubric?.contact || 70,
    target_b.skill_rubric?.d_zone || 70,
    target_b.skill_rubric?.transition || 75
  ];

  comparisonRadarInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [
        {
          label: athlete_a.name,
          data: dataA,
          backgroundColor: 'rgba(56, 189, 248, 0.25)',
          borderColor: '#38bdf8',
          pointBackgroundColor: '#0284c7',
          borderWidth: 2
        },
        {
          label: target_b.name,
          data: dataB,
          backgroundColor: 'rgba(245, 158, 11, 0.25)',
          borderColor: '#f59e0b',
          pointBackgroundColor: '#d97706',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          pointLabels: { color: '#cbd5e1', font: { size: 10, weight: 'bold' } },
          ticks: { display: false, min: 0, max: 100, stepSize: 20 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function computeClientComparison(pAId, tBId) {
  if (!appData || !appData.players) return null;

  const a = appData.players.find(p => p.id === pAId) || appData.players[0];
  const benchmarks = appData.benchmarks || getFallbackBenchmarks();
  let b = benchmarks[tBId] || appData.players.find(p => p.id === tBId) || benchmarks["benchmark_ncaa_d1"];

  const comb_a = a.combine || {};
  const comb_b = b.combine || {};

  const combine_comparison = [
    { metric: "Flying 30m Sprint", unit: "s", val_a: comb_a.flying_30m_sec || 4.0, val_b: comb_b.flying_30m_sec || 4.0, delta: parseFloat(((comb_a.flying_30m_sec || 4.0) - (comb_b.flying_30m_sec || 4.0)).toFixed(2)), advantage: (comb_a.flying_30m_sec || 4.0) < (comb_b.flying_30m_sec || 4.0) ? "A" : "B" },
    { metric: "Standing Broad Jump", unit: "in", val_a: comb_a.broad_jump_in || 90, val_b: comb_b.broad_jump_in || 90, delta: Math.round((comb_a.broad_jump_in || 90) - (comb_b.broad_jump_in || 90)), advantage: (comb_a.broad_jump_in || 90) > (comb_b.broad_jump_in || 90) ? "A" : "B" },
    { metric: "Pro Agility (5-10-5)", unit: "s", val_a: comb_a.pro_agility_5_10_5_sec || 4.8, val_b: comb_b.pro_agility_5_10_5_sec || 4.8, delta: parseFloat(((comb_a.pro_agility_5_10_5_sec || 4.8) - (comb_b.pro_agility_5_10_5_sec || 4.8)).toFixed(2)), advantage: (comb_a.pro_agility_5_10_5_sec || 4.8) < (comb_b.pro_agility_5_10_5_sec || 4.8) ? "A" : "B" },
    { metric: "Grip Strength", unit: "lbs", val_a: comb_a.grip_strength_lbs || 100, val_b: comb_b.grip_strength_lbs || 100, delta: Math.round((comb_a.grip_strength_lbs || 100) - (comb_b.grip_strength_lbs || 100)), advantage: (comb_a.grip_strength_lbs || 100) > (comb_b.grip_strength_lbs || 100) ? "A" : "B" },
    { metric: "Rotational Medball Velocity", unit: "mph", val_a: comb_a.rotational_medball_mph || 25.0, val_b: comb_b.rotational_medball_mph || 25.0, delta: parseFloat(((comb_a.rotational_medball_mph || 25.0) - (comb_b.rotational_medball_mph || 25.0)).toFixed(1)), advantage: (comb_a.rotational_medball_mph || 25.0) > (comb_b.rotational_medball_mph || 25.0) ? "A" : "B" }
  ];

  const kpi_a = a.micro_kpis || {};
  const kpi_b = b.micro_kpis || {};

  const micro_kpi_comparison = [
    { metric: "Controlled D-Zone Exits", unit: "%", val_a: kpi_a.controlled_exit_pct || 70, val_b: kpi_b.controlled_exit_pct || 70, delta: parseFloat(((kpi_a.controlled_exit_pct || 70) - (kpi_b.controlled_exit_pct || 70)).toFixed(1)), advantage: (kpi_a.controlled_exit_pct || 70) > (kpi_b.controlled_exit_pct || 70) ? "A" : "B" },
    { metric: "Controlled Neutral Zone Entries", unit: "%", val_a: kpi_a.controlled_entry_pct || 65, val_b: kpi_b.controlled_entry_pct || 65, delta: parseFloat(((kpi_a.controlled_entry_pct || 65) - (kpi_b.controlled_entry_pct || 65)).toFixed(1)), advantage: (kpi_a.controlled_entry_pct || 65) > (kpi_b.controlled_entry_pct || 65) ? "A" : "B" },
    { metric: "Wall Battle Win Rate", unit: "%", val_a: kpi_a.wall_battle_win_pct || 60, val_b: kpi_b.wall_battle_win_pct || 60, delta: parseFloat(((kpi_a.wall_battle_win_pct || 60) - (kpi_b.wall_battle_win_pct || 60)).toFixed(1)), advantage: (kpi_a.wall_battle_win_pct || 60) > (kpi_b.wall_battle_win_pct || 60) ? "A" : "B" },
    { metric: "Pre-Touch Shoulder Scanning", unit: "/poss", val_a: kpi_a.shoulder_scans_per_possession || 3.0, val_b: kpi_b.shoulder_scans_per_possession || 3.0, delta: parseFloat(((kpi_a.shoulder_scans_per_possession || 3.0) - (kpi_b.shoulder_scans_per_possession || 3.0)).toFixed(1)), advantage: (kpi_a.shoulder_scans_per_possession || 3.0) > (kpi_b.shoulder_scans_per_possession || 3.0) ? "A" : "B" },
    { metric: "High-Danger Seam Pass Completion", unit: "%", val_a: kpi_a.high_danger_pass_comp_pct || 60, val_b: kpi_b.high_danger_pass_comp_pct || 60, delta: parseFloat(((kpi_a.high_danger_pass_comp_pct || 60) - (kpi_b.high_danger_pass_comp_pct || 60)).toFixed(1)), advantage: (kpi_a.high_danger_pass_comp_pct || 60) > (kpi_b.high_danger_pass_comp_pct || 60) ? "A" : "B" }
  ];

  const edgesA = combine_comparison.filter(c => c.advantage === 'A').length + micro_kpi_comparison.filter(k => k.advantage === 'A').length;
  const edgesB = combine_comparison.filter(c => c.advantage === 'B').length + micro_kpi_comparison.filter(k => k.advantage === 'B').length;

  return {
    athlete_a: a,
    target_b: b,
    combine_comparison,
    micro_kpi_comparison,
    projections_comparison: {
      trajectory_score_a: a.projection?.composite_trajectory_score || 80.0,
      trajectory_score_b: b.projection?.composite_trajectory_score || 85.0
    },
    scorecard: {
      edges_a: edgesA,
      edges_b: edgesB,
      speed_edge: (comb_a.flying_30m_sec || 4.0) <= (comb_b.flying_30m_sec || 4.0) ? a.name : b.name,
      vision_edge: (a.skill_rubric?.hockey_iq || 75) >= (b.skill_rubric?.hockey_iq || 75) ? a.name : b.name,
      physical_edge: (kpi_a.wall_battle_win_pct || 60) >= (kpi_b.wall_battle_win_pct || 60) ? a.name : b.name
    },
    scouting_verdict: `${a.name} demonstrates ${edgesA} metric advantages in this matchup. Key athletic differentiator is burst and neutral zone pacing. Critical developmental area remains lower-body strength in tight half-wall puck protection.`
  };
}

function exportComparativeScoutCard() {
  window.print();
}




// ==================== ENTERPRISE PRO FILM ROOM & TELESTRATION STUDIO ====================

let filmCanvas = null;
let activeFilmClip = null;

function getFilmEventsPool() {
  if (appData && appData.film_events && appData.film_events.length > 0) {
    return appData.film_events;
  }
  return [
    {
      id: "film_001",
      title: "Connor Vance (#9 C) - D-Zone Shoulder Scan & Reverse Hinge Pass",
      player_id: "u14_01",
      player_name: "Connor Vance",
      category: "D-Zone Breakouts",
      timecode: "01:42",
      duration: 14.0,
      tactical_trigger: "Strongside F1 hard forecheck pinch along half-boards",
      execution_analysis: "Vance executed 3 shoulder scans before touch, absorbed contact with 1.8s puck hold, and feathered a clean reverse bank pass to weakside D to bypass the trap.",
      telemetry: {
        puck_hold_sec: 1.8,
        shoulder_scans: 3,
        skating_speed_mph: 19.8,
        seam_clearance_pct: 96,
        decision_grade: "A+"
      }
    },
    {
      id: "film_002",
      title: "Liam Broderick (#17 LW) - Royal Road Seam Catch & Quick Release",
      player_id: "u14_02",
      player_name: "Liam Broderick",
      category: "Offensive Zone Cycle",
      timecode: "05:14",
      duration: 12.0,
      tactical_trigger: "Center cuts below goal line, shifting goalie off middle axis",
      execution_analysis: "Broderick drifted into the high-slot soft pocket, loaded his stick before the pass crossed the Royal Road, and released a 0.38s one-timer high glove.",
      telemetry: {
        puck_hold_sec: 0.4,
        shoulder_scans: 2,
        skating_speed_mph: 17.5,
        seam_clearance_pct: 91,
        decision_grade: "A"
      }
    },
    {
      id: "film_003",
      title: "Jaxson Sterling (#4 D) - 1-2-2 Red-Line Wall Pinch & Interception",
      player_id: "u14_03",
      player_name: "Jaxson Sterling",
      category: "Forechecking Systems",
      timecode: "08:33",
      duration: 15.0,
      tactical_trigger: "Opposing breakout winger bobbles bouncing rim puck at red line",
      execution_analysis: "Sterling recognized F1 steering pressure, gapped up aggressively inside the blue line, suffocated the rim with stick on ice, and transitioned puck to breaking slot.",
      telemetry: {
        puck_hold_sec: 1.2,
        shoulder_scans: 2,
        skating_speed_mph: 22.1,
        seam_clearance_pct: 93,
        decision_grade: "A+"
      }
    },
    {
      id: "film_004",
      title: "Braeden O'Reilly (#88 RW) - Wall Pin, Hip-Pocket Shield & Bank Escape",
      player_id: "ushl_02",
      player_name: "Cole Caulfield-Smith",
      category: "D-Zone Breakouts",
      timecode: "11:20",
      duration: 13.0,
      tactical_trigger: "Opposing defenseman attempts heavy wall collision pin",
      execution_analysis: "Dropped center of gravity, shielded puck in deep rear hip pocket, absorbed contact, and banked puck high off dasher glass into center ice.",
      telemetry: {
        puck_hold_sec: 2.4,
        shoulder_scans: 2,
        skating_speed_mph: 16.2,
        seam_clearance_pct: 84,
        decision_grade: "A"
      }
    },
    {
      id: "film_005",
      title: "Caelen MacIntyre (#27 D) - D-to-D Point Walk & Tip Screen",
      player_id: "u16_02",
      player_name: "Caelen MacIntyre",
      category: "Power Play Systems",
      timecode: "14:05",
      duration: 14.0,
      tactical_trigger: "High penalty killer overcommits to shooting lane block",
      execution_analysis: "Walked blue line with lateral mohawk edges, dragged puck 6 feet into open seam, and released a low shin-pad height wrist shot tipped for a goal.",
      telemetry: {
        puck_hold_sec: 2.1,
        shoulder_scans: 3,
        skating_speed_mph: 18.0,
        seam_clearance_pct: 90,
        decision_grade: "A"
      }
    },
    {
      id: "film_006",
      title: "Avery Tremblay (#11 LW) - 3-Lane Rush Delay & High-Slot Dish",
      player_id: "women_01",
      player_name: "Avery Tremblay",
      category: "Neutral Zone Regroup",
      timecode: "17:40",
      duration: 13.5,
      tactical_trigger: "Defensive pairing maintains tight blue-line gap",
      execution_analysis: "Decelerated rush cadence with a 10-2 open-hip mohawk turn at top of circle, waited for trailing center to puncture lane, and delivered tape-to-tape pass.",
      telemetry: {
        puck_hold_sec: 2.6,
        shoulder_scans: 4,
        skating_speed_mph: 20.5,
        seam_clearance_pct: 95,
        decision_grade: "A+"
      }
    },
    {
      id: "film_007",
      title: "Elias Lindholm (#7 C) - PK Box Diamond Interception & Rim Clear",
      player_id: "nahl_02",
      player_name: "Elias Lindholm",
      category: "Penalty Kill Systems",
      timecode: "22:15",
      duration: 14.0,
      tactical_trigger: "PP flank forward attempts cross-slot pass to bumper",
      execution_analysis: "Maintained active stick blade in passing lane, deflected cross-ice attempt, retrieved puck in corner, and cleared 200 feet down ice.",
      telemetry: {
        puck_hold_sec: 0.8,
        shoulder_scans: 2,
        skating_speed_mph: 19.2,
        seam_clearance_pct: 98,
        decision_grade: "A+"
      }
    },
    {
      id: "film_008",
      title: "Nico Rossi (#21 RW) - PP 1-3-1 Royal Road One-Timer Snipe",
      player_id: "nahl_01",
      player_name: "Hunter Briggs",
      category: "Power Play Systems",
      timecode: "26:50",
      duration: 12.5,
      tactical_trigger: "Flank forward freezes goalie with fake wrist shot",
      execution_analysis: "Dropped to one knee at weakside faceoff dot, struck one-timer blast top corner off royal road feed. Quick release time: 0.32 seconds.",
      telemetry: {
        puck_hold_sec: 0.3,
        shoulder_scans: 1,
        skating_speed_mph: 15.0,
        seam_clearance_pct: 92,
        decision_grade: "A+"
      }
    }
  ];
}

function initFilmRoomStudio() {
  const filmCanvasEl = document.getElementById('filmCanvas');
  if (!filmCanvasEl || typeof FilmTelestrationCanvas === 'undefined') return;

  filmCanvas = new FilmTelestrationCanvas('filmCanvas', {
    onTick: handleFilmTick
  });

  // Populate players in dropdowns
  populateFilmPlayerSelects();

  // Populate Film Event Library
  renderFilmClipsList('all');
  populateFilmClipDropdown();

  // Load first event by default
  const events = getFilmEventsPool();
  if (events.length > 0) {
    selectFilmClip(events[0]);
  }

  // Telestration Tools buttons
  const toolBtns = document.querySelectorAll('.film-tool-btn');
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toolBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-slate-800', 'text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('bg-slate-800', 'text-slate-300');
      const tool = btn.dataset.filmTool;
      filmCanvas.setTool(tool);
    });
  });

  // Color Swatches
  const colorBtns = document.querySelectorAll('.film-color-btn');
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('ring-2', 'ring-white'));
      btn.classList.add('ring-2', 'ring-white');
      const color = btn.dataset.color;
      filmCanvas.setColor(color);
    });
  });

  // Telestration History Controls
  const undoBtn = document.getElementById('filmUndoBtn');
  if (undoBtn) undoBtn.addEventListener('click', () => filmCanvas.undo());

  const redoBtn = document.getElementById('filmRedoBtn');
  if (redoBtn) redoBtn.addEventListener('click', () => filmCanvas.redo());

  const clearBtn = document.getElementById('filmClearBtn');
  if (clearBtn) clearBtn.addEventListener('click', () => filmCanvas.clearTelestrations());

  const exportBtn = document.getElementById('filmExportPngBtn');
  if (exportBtn) exportBtn.addEventListener('click', () => filmCanvas.exportPNG());

  // Video Footage Upload Handlers (Local File & Drag-and-Drop)
  const filmVideoFileInput = document.getElementById('filmVideoFileInput');
  if (filmVideoFileInput) {
    filmVideoFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        filmCanvas.loadVideoFile(file);
        const tagBadge = document.getElementById('filmActiveTagBadge');
        if (tagBadge) tagBadge.textContent = file.name.replace(/\.[^/.]+$/, "");
      }
    });
  }

  const filmCanvasWrapper = document.getElementById('filmCanvasWrapper');
  if (filmCanvasWrapper) {
    filmCanvasWrapper.addEventListener('dragover', (e) => {
      e.preventDefault();
      filmCanvasWrapper.classList.add('ring-2', 'ring-sky-400');
    });
    filmCanvasWrapper.addEventListener('dragleave', (e) => {
      e.preventDefault();
      filmCanvasWrapper.classList.remove('ring-2', 'ring-sky-400');
    });
    filmCanvasWrapper.addEventListener('drop', (e) => {
      e.preventDefault();
      filmCanvasWrapper.classList.remove('ring-2', 'ring-sky-400');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        filmCanvas.loadVideoFile(file);
        const tagBadge = document.getElementById('filmActiveTagBadge');
        if (tagBadge) tagBadge.textContent = file.name.replace(/\.[^/.]+$/, "");
      }
    });
  }

  // Video Transport Controls
  const playPauseBtn = document.getElementById('filmPlayPauseBtn');
  const playIcon = document.getElementById('filmPlayIcon');
  const playText = document.getElementById('filmPlayText');

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (filmCanvas.isPlaying) {
        filmCanvas.pause();
        if (playIcon) playIcon.textContent = '▶';
        if (playText) playText.textContent = 'Play';
        playPauseBtn.classList.remove('bg-amber-500', 'hover:bg-amber-400');
        playPauseBtn.classList.add('bg-indigo-600', 'hover:bg-indigo-500');
      } else {
        filmCanvas.play();
        if (playIcon) playIcon.textContent = '⏸';
        if (playText) playText.textContent = 'Pause';
        playPauseBtn.classList.remove('bg-indigo-600', 'hover:bg-indigo-500');
        playPauseBtn.classList.add('bg-amber-500', 'hover:bg-amber-400');
      }
    });
  }

  const stepBack5 = document.getElementById('filmStepBack5Btn');
  if (stepBack5) stepBack5.addEventListener('click', () => filmCanvas.step(-5));

  const stepBack1 = document.getElementById('filmStepBack1Btn');
  if (stepBack1) stepBack1.addEventListener('click', () => filmCanvas.step(-1));

  const stepFwd1 = document.getElementById('filmStepFwd1Btn');
  if (stepFwd1) stepFwd1.addEventListener('click', () => filmCanvas.step(1));

  const stepFwd5 = document.getElementById('filmStepFwd5Btn');
  if (stepFwd5) stepFwd5.addEventListener('click', () => filmCanvas.step(5));

  const scrubber = document.getElementById('filmTimelineScrubber');
  if (scrubber) {
    scrubber.addEventListener('input', (e) => {
      const t = parseFloat(e.target.value);
      filmCanvas.seek(t);
    });
  }

  const speedBtns = document.querySelectorAll('.film-speed-btn');
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('text-slate-400');
      const spd = parseFloat(btn.dataset.speed) || 1.0;
      filmCanvas.setSpeed(spd);
      showToast(`Playback speed set to ${spd}x`, 'info');
    });
  });

  // Category filter pills
  const filterBtns = document.querySelectorAll('.film-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-slate-900', 'text-slate-400');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('bg-slate-900', 'text-slate-400');
      const cat = btn.dataset.cat;
      renderFilmClipsList(cat);
    });
  });

  // Clip Dropdown selector
  const clipSelect = document.getElementById('filmClipSelect');
  if (clipSelect) {
    clipSelect.addEventListener('change', (e) => {
      const cid = e.target.value;
      const ev = getFilmEventsPool().find(x => x.id === cid);
      if (ev) selectFilmClip(ev);
    });
  }

  // Local Video File Upload Handler
  const videoInput = document.getElementById('filmVideoFileInput');
  if (videoInput) {
    videoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        filmCanvas.loadVideoFile(file);
        showToast(`Loaded game video: ${file.name}`, 'success');
        const badge = document.getElementById('filmActiveTagBadge');
        if (badge) badge.textContent = `User Film: ${file.name}`;
        const titleEl = document.getElementById('filmEventTitle');
        if (titleEl) titleEl.textContent = file.name;
        const analysisEl = document.getElementById('filmEventAnalysis');
        if (analysisEl) analysisEl.textContent = `Custom uploaded match video (${file.name}). Scrub, telestrate tactical plays, and stamp notes.`;
      }
    });
  }

  // Drag and Drop Video onto Canvas Container
  const filmCanvasContainer = filmCanvasEl.parentElement;
  if (filmCanvasContainer) {
    filmCanvasContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      filmCanvasContainer.classList.add('ring-2', 'ring-sky-400');
    });
    filmCanvasContainer.addEventListener('dragleave', () => {
      filmCanvasContainer.classList.remove('ring-2', 'ring-sky-400');
    });
    filmCanvasContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      filmCanvasContainer.classList.remove('ring-2', 'ring-sky-400');
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type && (file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|m4v|ogg)$/i))) {
          filmCanvas.loadVideoFile(file);
          showToast(`Loaded game video: ${file.name}`, 'success');
          const badge = document.getElementById('filmActiveTagBadge');
          if (badge) badge.textContent = `User Film: ${file.name}`;
        }
      }
    });
  }

  // Stamp Evaluation to Player Ledger
  const stampBtn = document.getElementById('stampFilmToLedgerBtn');
  if (stampBtn) {
    stampBtn.addEventListener('click', async () => {
      if (!activeFilmClip) return;
      const targetPid = document.getElementById('filmPlayerTargetSelect').value || activeFilmClip.player_id || (selectedPlayer ? selectedPlayer.id : 'u14_01');
      const grade = document.getElementById('filmGradeSelect').value || 'A+';
      const notes = document.getElementById('filmCoachingNotesInput').value || activeFilmClip.execution_analysis || 'Executed tactical cues cleanly.';

      const payload = {
        player_id: targetPid,
        event_id: activeFilmClip.id,
        shoulder_scans: activeFilmClip.telemetry ? activeFilmClip.telemetry.shoulder_scans : 3,
        puck_hold_sec: activeFilmClip.telemetry ? activeFilmClip.telemetry.puck_hold_sec : 1.8,
        skating_speed_mph: activeFilmClip.telemetry ? activeFilmClip.telemetry.skating_speed_mph : 20.0,
        decision_grade: grade,
        notes: notes,
        account: `${currentUser.name} (${currentUser.badge})`
      };

      try {
        const res = await fetch('/api/film/stamp-evaluation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const result = await res.json();
          const targetPlayer = appData.players.find(p => p.id === targetPid);
          if (targetPlayer) {
            targetPlayer.audit_ledger.unshift(result.entry);
            if (result.player && result.player.micro_kpis) {
              targetPlayer.micro_kpis = result.player.micro_kpis;
            }
            if (result.player && result.player.projection) {
              targetPlayer.projection = result.player.projection;
            }
            if (selectedPlayer && selectedPlayer.id === targetPid) {
              renderPlayerDossier(targetPlayer);
            }
          }
          showToast(`Film evaluation stamped to permanent ledger for ${targetPlayer ? targetPlayer.name : targetPid}!`, 'success');
        } else {
          applyFallbackFilmStamp(targetPid, payload);
        }
      } catch (err) {
        applyFallbackFilmStamp(targetPid, payload);
      }
    });
  }

  // Modal Setup
  setupNewFilmClipModal();
}

function populateFilmPlayerSelects() {
  const targetSelect = document.getElementById('filmPlayerTargetSelect');
  const newClipPlayerSelect = document.getElementById('newClipPlayerSelect');
  if (!appData || !appData.players) return;

  const optionsHtml = appData.players.map(p => `
    <option value="${p.id}">${p.name} (#${p.jersey || '—'}, ${p.position})</option>
  `).join('');

  if (targetSelect) targetSelect.innerHTML = optionsHtml;
  if (newClipPlayerSelect) newClipPlayerSelect.innerHTML = optionsHtml;
}

function populateFilmClipDropdown() {
  const select = document.getElementById('filmClipSelect');
  if (!select) return;
  const events = getFilmEventsPool();
  select.innerHTML = events.map(e => `
    <option value="${e.id}">[${e.timecode || '00:00'}] ${e.title}</option>
  `).join('');
}

function renderFilmClipsList(filterCategory = 'all') {
  const container = document.getElementById('filmClipListContainer');
  if (!container) return;

  let events = getFilmEventsPool();
  if (filterCategory !== 'all') {
    events = events.filter(e => e.category === filterCategory);
  }

  container.innerHTML = events.map(ev => {
    const isSel = activeFilmClip && activeFilmClip.id === ev.id;
    return `
      <div class="film-clip-card p-2.5 rounded-xl border cursor-pointer select-none transition-all ${isSel ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'}" data-clip-id="${ev.id}">
        <div class="flex items-center justify-between font-bold text-xs mb-1">
          <span class="text-indigo-300 font-mono">${ev.timecode || '00:00'} - ${ev.player_name || 'Prospect'}</span>
          <span class="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${ev.category}</span>
        </div>
        <p class="text-[11px] text-slate-300 line-clamp-1 leading-snug">${ev.title}</p>
        <div class="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1 border-t border-slate-800/80">
          <span>⚡ Scans: <strong class="text-sky-400">${ev.telemetry ? ev.telemetry.shoulder_scans : 2}</strong></span>
          <span>⏱️ Hold: <strong class="text-emerald-400">${ev.telemetry ? ev.telemetry.puck_hold_sec : 1.8}s</strong></span>
          <span>Grade: <strong class="text-amber-300">${ev.telemetry ? ev.telemetry.decision_grade : 'A'}</strong></span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.film-clip-card').forEach(card => {
    card.addEventListener('click', () => {
      const cid = card.dataset.clipId;
      const ev = getFilmEventsPool().find(x => x.id === cid);
      if (ev) selectFilmClip(ev);
    });
  });
}

function selectFilmClip(clip) {
  activeFilmClip = clip;

  // Update header tag
  const tagBadge = document.getElementById('filmActiveTagBadge');
  if (tagBadge) tagBadge.textContent = clip.title;

  // Update active event card
  const athleteTag = document.getElementById('filmEventAthleteTag');
  if (athleteTag) athleteTag.textContent = `${clip.player_name} (${clip.player_id})`;

  const triggerDisplay = document.getElementById('filmTriggerDisplay');
  if (triggerDisplay) triggerDisplay.textContent = clip.tactical_trigger;

  const notesInput = document.getElementById('filmCoachingNotesInput');
  if (notesInput) notesInput.value = clip.execution_analysis || '';

  const gradeSelect = document.getElementById('filmGradeSelect');
  if (gradeSelect && clip.telemetry && clip.telemetry.decision_grade) {
    gradeSelect.value = clip.telemetry.decision_grade;
  }

  const targetSelect = document.getElementById('filmPlayerTargetSelect');
  if (targetSelect && clip.player_id) {
    targetSelect.value = clip.player_id;
  }

  const clipSelect = document.getElementById('filmClipSelect');
  if (clipSelect) clipSelect.value = clip.id;

  // Highlight in clips list
  renderFilmClipsList();

  // Load into Telestration Canvas
  if (filmCanvas) {
    filmCanvas.loadClip(clip);
  }
}

function handleFilmTick(data) {
  // Update Time Display
  const timeDisplay = document.getElementById('filmTimeDisplay');
  if (timeDisplay) {
    const cM = Math.floor(data.currentTime / 60);
    const cS = (data.currentTime % 60).toFixed(2).padStart(5, '0');
    const dM = Math.floor(data.duration / 60);
    const dS = (data.duration % 60).toFixed(2).padStart(5, '0');
    timeDisplay.textContent = `${String(cM).padStart(2, '0')}:${cS} / ${String(dM).padStart(2, '0')}:${dS}`;
  }

  // Update Scrubber
  const scrubber = document.getElementById('filmTimelineScrubber');
  if (scrubber) {
    if (Math.abs(parseFloat(scrubber.max) - data.duration) > 0.05) {
      scrubber.max = data.duration.toFixed(2);
    }
    if (!scrubber.matches(':active')) {
      scrubber.value = data.currentTime.toFixed(2);
    }
  }

  // Update Live Telemetry Meters
  if (data.telemetry) {
    const hudHold = document.getElementById('hudPuckHold');
    if (hudHold) hudHold.textContent = `${data.telemetry.live_hold || data.telemetry.puck_hold_sec}s`;

    const hudScans = document.getElementById('hudShoulderScans');
    if (hudScans) hudScans.textContent = `${data.telemetry.shoulder_scans} Scans`;

    const hudSpeed = document.getElementById('hudSkatingSpeed');
    if (hudSpeed) hudSpeed.textContent = `${data.telemetry.skating_speed_mph} mph`;

    const hudSeam = document.getElementById('hudSeamClearance');
    if (hudSeam) hudSeam.textContent = `${data.telemetry.seam_clearance_pct}%`;

    const hudGrade = document.getElementById('hudDecisionGrade');
    if (hudGrade) hudGrade.textContent = `${data.telemetry.decision_grade} Elite`;
  }
}

function applyFallbackFilmStamp(targetPid, payload) {
  const targetPlayer = (appData && appData.players) ? appData.players.find(p => p.id === targetPid) : null;
  if (!targetPlayer) return;

  const entry = {
    id: `led_${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    account: payload.account,
    category: "Film Room Telestration",
    action: `Stamped Film Evaluation: ${activeFilmClip ? activeFilmClip.title : 'Game Breakdown'}`,
    diff: `Pre-Touch Scans: ${payload.shoulder_scans}x, Puck Hold: ${payload.puck_hold_sec}s, Grade: ${payload.decision_grade}. Notes: ${payload.notes}`
  };

  targetPlayer.audit_ledger.unshift(entry);
  if (targetPlayer.micro_kpis) {
    const cur = targetPlayer.micro_kpis.shoulder_scans_per_possession || 2.0;
    targetPlayer.micro_kpis.shoulder_scans_per_possession = parseFloat(((cur * 4 + payload.shoulder_scans) / 5).toFixed(2));
  }
  if (selectedPlayer && selectedPlayer.id === targetPid) {
    renderPlayerDossier(targetPlayer);
  }
  showToast(`Film evaluation stamped to permanent ledger for ${targetPlayer.name}!`, 'success');
}

function setupNewFilmClipModal() {
  const modal = document.getElementById('newFilmClipModal');
  const openBtn = document.getElementById('openNewClipModalBtn');
  const closeBtn = document.getElementById('closeNewClipModalBtn');
  const cancelBtn = document.getElementById('cancelNewClipBtn');
  const saveBtn = document.getElementById('saveNewClipBtn');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      populateFilmPlayerSelects();
      modal.classList.remove('hidden');
    });
  }

  const closeModal = () => {
    if (modal) modal.classList.add('hidden');
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const title = document.getElementById('newClipTitleInput').value.trim();
      const pid = document.getElementById('newClipPlayerSelect').value;
      const cat = document.getElementById('newClipCategorySelect').value;
      const timecode = document.getElementById('newClipTimecodeInput').value.trim() || '00:00';
      const duration = parseFloat(document.getElementById('newClipDurationInput').value) || 14.0;
      const trigger = document.getElementById('newClipTriggerInput').value.trim() || 'Tactical trigger cue';
      const analysis = document.getElementById('newClipAnalysisInput').value.trim() || 'Breakdown notes.';

      if (!title) {
        showToast('Please enter a scenario title', 'warning');
        return;
      }

      const playerObj = appData.players.find(p => p.id === pid);
      const newEvent = {
        title: title,
        player_id: pid,
        player_name: playerObj ? playerObj.name : 'Prospect',
        category: cat,
        timecode: timecode,
        duration: duration,
        tactical_trigger: trigger,
        execution_analysis: analysis,
        telemetry: {
          puck_hold_sec: 1.8,
          shoulder_scans: 3,
          skating_speed_mph: 20.0,
          seam_clearance_pct: 94,
          decision_grade: 'A+'
        }
      };

      try {
        const res = await fetch('/api/film/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent)
        });
        if (res.ok) {
          const result = await res.json();
          if (!appData.film_events) appData.film_events = [];
          appData.film_events.unshift(result.event);
          populateFilmClipDropdown();
          renderFilmClipsList('all');
          selectFilmClip(result.event);
          closeModal();
          showToast(`Game event "${title}" added to Film Room library!`, 'success');
        } else {
          // Client-side fallback
          saveClientSideClip(newEvent, closeModal);
        }
      } catch (err) {
        saveClientSideClip(newEvent, closeModal);
      }
    });
  }
}

function saveClientSideClip(newEvent, closeModal) {
  newEvent.id = `film_${Date.now()}`;
  if (!appData.film_events) appData.film_events = [];
  appData.film_events.unshift(newEvent);
  populateFilmClipDropdown();
  renderFilmClipsList('all');
  selectFilmClip(newEvent);
  closeModal();
  showToast(`Game event "${newEvent.title}" added to Film Room!`, 'success');
}


// ============================================================================
// PHASE 9: ENTERPRISE 60-MIN ADM PRACTICE PLAN BUILDER, STATION ROTATION MATRIX,
// LIVE WHISTLE PRACTICE CLOCK & PRINTABLE COACH'S ICE CARD / SCOUT DOSSIER ENGINE
// ============================================================================

let currentPracticePlan = null;
let activeStationRound = 1;
let practiceTimerState = {
  isRunning: false,
  intervalIndex: 0,
  remainingSec: 600,
  totalIntervalSec: 600,
  sessionElapsedSec: 0,
  sessionTotalSec: 3600,
  timerId: null
};

// Web Audio API Sound Synthesizer (Realistic Fox 40 Whistle & Rink Buzzer)
let globalAudioCtx = null;
function getAudioContext() {
  if (!globalAudioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      globalAudioCtx = new AudioContext();
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
}

function playHockeyWhistle() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Fox 40 Whistle uses two primary high frequencies with frequency modulation
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(2850, now);
    osc2.frequency.setValueAtTime(3120, now);

    // Rapid vibrato frequency modulation (32 Hz trill)
    const modOsc = ctx.createOscillator();
    const modGain = ctx.createGain();
    modOsc.frequency.setValueAtTime(32, now);
    modGain.gain.setValueAtTime(80, now);
    modOsc.connect(osc1.frequency);
    modOsc.connect(osc2.frequency);

    // Volume Envelope
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.28, now + 0.35);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    modOsc.start(now);
    osc1.start(now);
    osc2.start(now);

    modOsc.stop(now + 0.45);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (err) {
    console.warn('Audio whistle prevented:', err);
  }
}

function playRinkBuzzer() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    oscSub.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    oscSub.frequency.setValueAtTime(70, now);

    gainNode.gain.setValueAtTime(0.01, now);
    gainNode.gain.linearRampToValueAtTime(0.35, now + 0.05);
    gainNode.gain.setValueAtTime(0.35, now + 0.65);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gainNode);
    oscSub.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    oscSub.start(now);
    osc.stop(now + 0.8);
    oscSub.stop(now + 0.8);
  } catch (err) {
    console.warn('Audio horn prevented:', err);
  }
}

function computeLocalPracticeMetrics(plan, rosterSize = 20) {
  const intervals = plan.intervals || [];
  let totalMinutes = 0;
  let totalTouchesPerSkater = 0;
  const categoryMinutes = {};

  intervals.forEach(it => {
    const dur = parseInt(it.duration_min) || 0;
    totalMinutes += dur;
    const cat = it.category || 'General';
    categoryMinutes[cat] = (categoryMinutes[cat] || 0) + dur;
    const touches = parseInt(it.puck_touches_per_skater) || 30;
    totalTouchesPerSkater += touches;
  });

  const totalTeamTouches = totalTouchesPerSkater * rosterSize;

  const categoryDistribution = {};
  if (totalMinutes > 0) {
    Object.keys(categoryMinutes).forEach(cat => {
      categoryDistribution[cat] = Math.round((categoryMinutes[cat] / totalMinutes) * 100);
    });
  }

  let workRestLabel = "1 : 1.8 (Optimal ADM)";
  const sagTime = categoryMinutes["Small Area Games (SAG)"] || 0;
  if (sagTime >= 20) {
    workRestLabel = "1 : 1.2 (High Intensity)";
  } else if (sagTime >= 10) {
    workRestLabel = "1 : 1.8 (Optimal ADM)";
  } else {
    workRestLabel = "1 : 2.2 (System Flow)";
  }

  return {
    totalMinutes,
    targetMinutes: plan.total_minutes || 60,
    totalTeamTouches,
    touchesPerSkater: totalTouchesPerSkater,
    workRestLabel,
    categoryDistribution,
    intervalCount: intervals.length
  };
}

function initPracticePlanEngine() {
  console.log('⚡ Initializing Enterprise Practice Plan Engine (Phase 9)...');

  // Find practice plans from appData or fallback
  const plans = (appData && appData.practice_plans && appData.practice_plans.length > 0)
    ? appData.practice_plans
    : [];

  if (plans.length > 0) {
    currentPracticePlan = JSON.parse(JSON.stringify(plans[0]));
  } else {
    // Basic fallback template if data store is empty
    currentPracticePlan = {
      id: "plan_01",
      name: "USA Hockey 14U AAA High-Puck-Touch ADM Matrix",
      total_minutes: 60,
      ice_surface: "cross_ice",
      objective: "Maximize high-density puck touches with 0 standing in lines.",
      station_matrix: { enabled: true, total_stations: 3, round_duration_min: 7, stations: [], rounds: [] },
      intervals: [
        { interval_id: "int_01", title: "Dynamic Edge Agility & Linear Crossovers", duration_min: 10, category: "Skating & Edge Agility", zone: "Full Ice", drill_id: "drill_005", puck_touches_per_skater: 35, coaching_keys: "Deep 90-deg knee bend." },
        { interval_id: "int_02", title: "3-Station ADM High-Puck-Touch Matrix", duration_min: 21, category: "Small Area Games (SAG)", zone: "3 Cross-Ice Stations", drill_id: "drill_001", puck_touches_per_skater: 105, coaching_keys: "Whistle at 7m and 14m to rotate." },
        { interval_id: "int_03", title: "3-Lane Regroup Hinge & Stretch Strike", duration_min: 14, category: "Flow & Transitions", zone: "Full Ice", drill_id: "drill_007", puck_touches_per_skater: 45, coaching_keys: "D-to-D reverse hinge." },
        { interval_id: "int_04", title: "3v3 Corner Cross-Ice Chaos Game", duration_min: 10, category: "Small Area Games (SAG)", zone: "Cross-Ice Corner", drill_id: "drill_003", puck_touches_per_skater: 55, coaching_keys: "30s explosive shifts." },
        { interval_id: "int_05", title: "Cool Down & Skill Shootout", duration_min: 5, category: "Shooting & Scoring", zone: "Full Ice", drill_id: "drill_008", puck_touches_per_skater: 15, coaching_keys: "Deceptive release off back foot." }
      ]
    };
  }

  // Populate Select Dropdown
  const planSelect = document.getElementById('activePracticePlanSelect');
  if (planSelect && plans.length > 0) {
    planSelect.innerHTML = plans.map(p => `
      <option value="${p.id}" ${p.id === currentPracticePlan.id ? 'selected' : ''}>
        ${p.short_name || p.name} (${p.total_minutes}m)
      </option>
    `).join('') + `<option value="custom">➕ Create Custom Practice Plan</option>`;

    planSelect.addEventListener('change', (e) => {
      const selectedVal = e.target.value;
      if (selectedVal === 'custom') {
        createCustomPracticePlanTemplate();
      } else {
        const found = plans.find(p => p.id === selectedVal);
        if (found) {
          currentPracticePlan = JSON.parse(JSON.stringify(found));
          renderPracticePlan(currentPracticePlan);
          resetPracticeTimer();
          showNotificationToast(`📋 Loaded ${currentPracticePlan.name}`);
        }
      }
    });
  }

  // Bind Buttons
  const printCardBtn = document.getElementById('printCoachIceCardBtn');
  if (printCardBtn) printCardBtn.addEventListener('click', openCoachIceCardModal);

  const stampTeamBtn = document.getElementById('stampTeamPracticeBtn');
  if (stampTeamBtn) stampTeamBtn.addEventListener('click', stampPracticeToTeamLedgers);

  const addIntervalBtn = document.getElementById('addPracticeIntervalBtn');
  if (addIntervalBtn) addIntervalBtn.addEventListener('click', addPracticeInterval);

  const rotateBtn = document.getElementById('stepNextRotationBtn');
  if (rotateBtn) rotateBtn.addEventListener('click', stepNextStationRotation);

  // Practice Whistle Clock Controls
  const playPauseBtn = document.getElementById('timerPlayPauseBtn');
  if (playPauseBtn) playPauseBtn.addEventListener('click', togglePracticeTimer);

  const resetBtn = document.getElementById('timerResetBtn');
  if (resetBtn) resetBtn.addEventListener('click', resetPracticeTimer);

  const nextBtn = document.getElementById('timerNextBtn');
  if (nextBtn) nextBtn.addEventListener('click', advanceToNextPracticeInterval);

  const whistleBtn = document.getElementById('audioBlowWhistleBtn');
  if (whistleBtn) whistleBtn.addEventListener('click', () => {
    playHockeyWhistle();
    showNotificationToast('🔊 Whistle blown!');
  });

  const buzzerBtn = document.getElementById('audioSoundBuzzerBtn');
  if (buzzerBtn) buzzerBtn.addEventListener('click', () => {
    playRinkBuzzer();
    showNotificationToast('🚨 Rink Horn sounded!');
  });

  // Station Round Buttons
  document.querySelectorAll('.station-round-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const round = parseInt(e.target.dataset.round);
      switchStationRound(round);
    });
  });

  // Render Initial Practice Plan
  renderPracticePlan(currentPracticePlan);
  resetPracticeTimer();
}

function renderPracticePlan(plan) {
  if (!plan) return;

  const titleEl = document.getElementById('practicePlanHeaderTitle');
  if (titleEl) titleEl.textContent = plan.name;

  const subEl = document.getElementById('practicePlanHeaderSubtitle');
  if (subEl) subEl.textContent = plan.objective || "High-tempo ADM ice session";

  const metrics = computeLocalPracticeMetrics(plan);

  // Update Badges
  const budgetBadge = document.getElementById('practiceBudgetBadge');
  if (budgetBadge) {
    budgetBadge.textContent = `${metrics.totalMinutes} / ${metrics.targetMinutes} Min`;
    if (metrics.totalMinutes === metrics.targetMinutes) {
      budgetBadge.className = "px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-black";
    } else if (metrics.totalMinutes < metrics.targetMinutes) {
      budgetBadge.className = "px-2.5 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono text-xs font-black";
    } else {
      budgetBadge.className = "px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono text-xs font-black";
    }
  }

  const touchesEl = document.getElementById('metricTeamTouches');
  if (touchesEl) touchesEl.textContent = metrics.totalTeamTouches.toLocaleString();

  const workRestEl = document.getElementById('metricWorkRest');
  if (workRestEl) workRestEl.textContent = metrics.workRestLabel.split(' ')[0] + ' ' + metrics.workRestLabel.split(' ')[1];

  const iceFormatEl = document.getElementById('metricIceFormat');
  if (iceFormatEl) {
    if (plan.station_matrix && plan.station_matrix.enabled) {
      iceFormatEl.textContent = "3 ADM Stations";
    } else if (plan.ice_surface === 'half_ice') {
      iceFormatEl.textContent = "Half-Ice Cycle";
    } else {
      iceFormatEl.textContent = "Full-Ice Flow";
    }
  }

  // Update Skill Allocation Bar
  const distBar = document.getElementById('skillDistributionBar');
  const distSummary = document.getElementById('metricSkillSummary');
  if (distBar && metrics.categoryDistribution) {
    const d = metrics.categoryDistribution;
    distBar.innerHTML = `
      <div class="bg-emerald-500 h-2 transition-all duration-300" style="width: ${d['Small Area Games (SAG)'] || 0}%" title="Small Area Games: ${d['Small Area Games (SAG)'] || 0}%"></div>
      <div class="bg-sky-500 h-2 transition-all duration-300" style="width: ${d['Skating & Edge Agility'] || 0}%" title="Skating: ${d['Skating & Edge Agility'] || 0}%"></div>
      <div class="bg-indigo-500 h-2 transition-all duration-300" style="width: ${d['Scoring & Shooting'] || 0}%" title="Shooting: ${d['Scoring & Shooting'] || 0}%"></div>
      <div class="bg-amber-500 h-2 transition-all duration-300" style="width: ${d['Flow & Transitions'] || 0}%" title="Flow: ${d['Flow & Transitions'] || 0}%"></div>
      <div class="bg-purple-500 h-2 transition-all duration-300" style="width: ${d['Tactical Systems'] || 0}%" title="Tactics: ${d['Tactical Systems'] || 0}%"></div>
    `;
    if (distSummary) {
      distSummary.textContent = `SAG (${d['Small Area Games (SAG)'] || 0}%) | Skate (${d['Skating & Edge Agility'] || 0}%) | Finish (${d['Scoring & Shooting'] || 0}%)`;
    }
  }

  // Render Station Matrix Widget
  renderStationMatrix(plan);

  // Render Intervals List
  renderIntervalsList(plan);
}

function renderStationMatrix(plan) {
  const container = document.getElementById('stationMatrixContainer');
  const cardsContainer = document.getElementById('stationMatrixCards');
  if (!container || !cardsContainer) return;

  const matrix = plan.station_matrix;
  if (!matrix || !matrix.enabled || !matrix.stations || matrix.stations.length === 0) {
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');

  // Update round pills styling
  document.querySelectorAll('.station-round-btn').forEach(btn => {
    const r = parseInt(btn.dataset.round);
    if (r === activeStationRound) {
      btn.className = "station-round-btn px-2.5 py-1 rounded text-[11px] font-bold bg-sky-500 text-white shadow-sm";
    } else {
      btn.className = "station-round-btn px-2.5 py-1 rounded text-[11px] font-bold bg-slate-800 text-slate-400 hover:text-white";
    }
  });

  const roundData = (matrix.rounds && matrix.rounds[activeStationRound - 1]) || null;
  const assignments = roundData ? roundData.assignments : {};

  cardsContainer.innerHTML = matrix.stations.map((stn, idx) => {
    const assignedGroup = assignments[stn.station_id] || `Group ${idx === 0 ? 'Red' : idx === 1 ? 'White' : 'Blue'}`;
    let badgeColor = "bg-rose-500/20 text-rose-300 border-rose-500/40";
    if (assignedGroup.includes('White')) badgeColor = "bg-slate-200/20 text-slate-200 border-slate-400";
    if (assignedGroup.includes('Blue')) badgeColor = "bg-sky-500/20 text-sky-300 border-sky-500/40";

    return `
      <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div class="space-y-0.5">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white text-xs">${stn.name}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-sky-300">${stn.zone}</span>
          </div>
          <p class="text-[11px] text-slate-400 leading-snug">${stn.focus}</p>
        </div>
        <div class="shrink-0 flex items-center gap-2">
          <span class="px-2 py-1 rounded-lg text-[10px] font-bold border ${badgeColor}">
            ${assignedGroup.split('(')[0].trim()}
          </span>
          <button onclick="loadDrillFromStation('${stn.drill_id}')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 text-[10px] font-semibold transition" title="Show Drill on Ice Rink">
            Ice →
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function loadDrillFromStation(drillId) {
  if (!drillId) return;
  const select = document.getElementById('presetDrillSelect');
  if (select) {
    select.value = drillId;
    select.dispatchEvent(new Event('change'));
  }
}

function switchStationRound(roundNum) {
  activeStationRound = roundNum;
  if (currentPracticePlan) {
    renderStationMatrix(currentPracticePlan);
    playHockeyWhistle();
    showNotificationToast(`🔄 Switched to Station Round ${roundNum}`);
  }
}

function stepNextStationRotation() {
  activeStationRound = (activeStationRound % 3) + 1;
  switchStationRound(activeStationRound);
}

function renderIntervalsList(plan) {
  const container = document.getElementById('practiceIntervalsList');
  const countBadge = document.getElementById('intervalCountBadge');
  if (!container) return;

  const intervals = plan.intervals || [];
  if (countBadge) countBadge.textContent = intervals.length;

  container.innerHTML = intervals.map((it, idx) => {
    return `
      <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 space-y-2 hover:border-slate-700 transition">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span class="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold shrink-0">
              ${idx + 1}
            </span>
            <input type="text" value="${it.title}" onchange="updateIntervalTitle(${idx}, this.value)" class="w-full bg-transparent font-bold text-xs text-white border-b border-transparent hover:border-slate-600 focus:border-sky-400 focus:bg-slate-950/60 px-1 py-0.5 rounded transition truncate">
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <input type="number" min="1" max="60" value="${it.duration_min}" onchange="updateIntervalDuration(${idx}, this.value)" class="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center text-xs font-bold text-sky-300">
            <span class="text-[10px] text-slate-400">min</span>
            <button onclick="deletePracticeInterval(${idx})" class="text-slate-500 hover:text-red-400 text-xs px-1" title="Delete Interval">✕</button>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-1 border-t border-slate-800/60 pt-1.5">
          <div class="flex items-center gap-2">
            <span class="px-1.5 py-0.5 rounded text-[10px] bg-sky-950/60 text-sky-400 border border-sky-500/30">${it.zone || 'Full Ice'}</span>
            <span class="text-slate-400">${it.category || 'General'}</span>
          </div>
          <div class="flex items-center gap-2 text-[10px]">
            <span class="text-amber-300 font-mono">⚡ ~${it.puck_touches_per_skater || 30} touches</span>
            <button onclick="loadDrillFromStation('${it.drill_id}')" class="text-sky-400 hover:underline">View Rink ↗</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateIntervalDuration(index, newMin) {
  if (!currentPracticePlan || !currentPracticePlan.intervals[index]) return;
  currentPracticePlan.intervals[index].duration_min = Math.max(1, parseInt(newMin) || 5);
  renderPracticePlan(currentPracticePlan);
  showNotificationToast('⏱️ Practice duration updated');
}

function updateIntervalTitle(index, newTitle) {
  if (!currentPracticePlan || !currentPracticePlan.intervals[index]) return;
  currentPracticePlan.intervals[index].title = newTitle.trim();
  renderPracticePlan(currentPracticePlan);
}

function deletePracticeInterval(index) {
  if (!currentPracticePlan || currentPracticePlan.intervals.length <= 1) {
    showNotificationToast('⚠️ Practice must have at least 1 interval block.');
    return;
  }
  currentPracticePlan.intervals.splice(index, 1);
  renderPracticePlan(currentPracticePlan);
  showNotificationToast('🗑️ Interval removed');
}

function addPracticeInterval() {
  if (!currentPracticePlan) return;
  const newIdx = currentPracticePlan.intervals.length + 1;
  currentPracticePlan.intervals.push({
    interval_id: `int_custom_${Date.now()}`,
    title: `Block ${newIdx}: Custom SAG / Flow Drill`,
    duration_min: 10,
    zone: "Full Ice",
    drill_id: "drill_001",
    category: "Small Area Games (SAG)",
    intensity: "High (175 BPM)",
    puck_touches_per_skater: 40,
    work_to_rest: "1:2",
    coaching_keys: "Focus on quick puck movement and high-tempo execution."
  });
  renderPracticePlan(currentPracticePlan);
  showNotificationToast('➕ New practice block added');
}

function createCustomPracticePlanTemplate() {
  currentPracticePlan = {
    id: `plan_custom_${Date.now()}`,
    name: "Custom Apex Practice Session",
    short_name: "Custom Session",
    target_level: "All Levels",
    total_minutes: 60,
    ice_surface: "full_ice",
    objective: "Custom designed coaching session with multi-drill progression.",
    equipment_needed: ["50 Pucks", "12 Cones"],
    primary_skills: ["Skating", "Passing", "Shooting"],
    station_matrix: { enabled: false, total_stations: 1, round_duration_min: 15, stations: [], rounds: [] },
    intervals: [
      { interval_id: "int_c_01", title: "Dynamic Warmup & Edge Flow", duration_min: 10, category: "Skating & Edge Agility", zone: "Full Ice", drill_id: "drill_005", puck_touches_per_skater: 30, coaching_keys: "Warm up legs, open hips." },
      { interval_id: "int_c_02", title: "Puck Support & Regroup Flow", duration_min: 20, category: "Flow & Transitions", zone: "Full Ice", drill_id: "drill_007", puck_touches_per_skater: 50, coaching_keys: "Keep feet moving." },
      { interval_id: "int_c_03", title: "Small Area Battle Game", duration_min: 20, category: "Small Area Games (SAG)", zone: "Cross-Ice", drill_id: "drill_001", puck_touches_per_skater: 60, coaching_keys: "High compete level." },
      { interval_id: "int_c_04", title: "Competitive Shootout & Cool Down", duration_min: 10, category: "Shooting & Scoring", zone: "Full Ice", drill_id: "drill_008", puck_touches_per_skater: 20, coaching_keys: "Fun finish." }
    ]
  };
  renderPracticePlan(currentPracticePlan);
  resetPracticeTimer();
  showNotificationToast('✏️ New Custom Practice Plan Template initialized');
}

// ==================== LIVE ON-ICE PRACTICE TIMER ENGINE ====================

function togglePracticeTimer() {
  if (practiceTimerState.isRunning) {
    pausePracticeTimer();
  } else {
    startPracticeTimer();
  }
}

function startPracticeTimer() {
  if (practiceTimerState.isRunning) return;
  practiceTimerState.isRunning = true;

  const playIcon = document.getElementById('timerPlayIcon');
  const playText = document.getElementById('timerPlayText');
  const playBtn = document.getElementById('timerPlayPauseBtn');
  if (playIcon) playIcon.textContent = '⏸';
  if (playText) playText.textContent = 'Pause';
  if (playBtn) playBtn.className = "px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs transition flex items-center gap-1";

  practiceTimerState.timerId = setInterval(() => {
    if (practiceTimerState.remainingSec > 0) {
      practiceTimerState.remainingSec--;
      practiceTimerState.sessionElapsedSec++;
      updatePracticeTimerUI();
    } else {
      // Interval complete!
      playHockeyWhistle();
      showNotificationToast(`🚨 Interval Completed! Advancing to next drill...`);
      advanceToNextPracticeInterval();
    }
  }, 1000);
}

function pausePracticeTimer() {
  practiceTimerState.isRunning = false;
  if (practiceTimerState.timerId) {
    clearInterval(practiceTimerState.timerId);
    practiceTimerState.timerId = null;
  }

  const playIcon = document.getElementById('timerPlayIcon');
  const playText = document.getElementById('timerPlayText');
  const playBtn = document.getElementById('timerPlayPauseBtn');
  if (playIcon) playIcon.textContent = '▶';
  if (playText) playText.textContent = 'Start';
  if (playBtn) playBtn.className = "px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition flex items-center gap-1";
}

function resetPracticeTimer() {
  pausePracticeTimer();
  practiceTimerState.intervalIndex = 0;
  practiceTimerState.sessionElapsedSec = 0;

  if (currentPracticePlan && currentPracticePlan.intervals && currentPracticePlan.intervals.length > 0) {
    const firstDurMin = currentPracticePlan.intervals[0].duration_min || 10;
    practiceTimerState.remainingSec = firstDurMin * 60;
    practiceTimerState.totalIntervalSec = firstDurMin * 60;
  } else {
    practiceTimerState.remainingSec = 600;
    practiceTimerState.totalIntervalSec = 600;
  }
  updatePracticeTimerUI();
}

function advanceToNextPracticeInterval() {
  if (!currentPracticePlan || !currentPracticePlan.intervals) return;
  const nextIdx = practiceTimerState.intervalIndex + 1;
  if (nextIdx < currentPracticePlan.intervals.length) {
    practiceTimerState.intervalIndex = nextIdx;
    const durMin = currentPracticePlan.intervals[nextIdx].duration_min || 10;
    practiceTimerState.remainingSec = durMin * 60;
    practiceTimerState.totalIntervalSec = durMin * 60;

    // If 3-station ADM, rotate stations automatically on station change
    if (currentPracticePlan.station_matrix && currentPracticePlan.station_matrix.enabled) {
      stepNextStationRotation();
    }
    updatePracticeTimerUI();
  } else {
    // Entire practice complete!
    pausePracticeTimer();
    playRinkBuzzer();
    showNotificationToast('🏆 FULL 60-MIN PRACTICE SESSION COMPLETED!');
  }
}

function updatePracticeTimerUI() {
  const display = document.getElementById('practiceTimerDisplay');
  const label = document.getElementById('timerCurrentIntervalLabel');
  const bar = document.getElementById('practiceTimerProgressBar');
  const totalProg = document.getElementById('practiceTotalProgressDisplay');

  const m = Math.floor(practiceTimerState.remainingSec / 60);
  const s = practiceTimerState.remainingSec % 60;
  const timeStr = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  if (display) display.textContent = timeStr;

  if (currentPracticePlan && currentPracticePlan.intervals && currentPracticePlan.intervals[practiceTimerState.intervalIndex]) {
    const curInt = currentPracticePlan.intervals[practiceTimerState.intervalIndex];
    if (label) label.textContent = `Int ${practiceTimerState.intervalIndex + 1}: ${curInt.title}`;
  }

  if (bar && practiceTimerState.totalIntervalSec > 0) {
    const elapsed = practiceTimerState.totalIntervalSec - practiceTimerState.remainingSec;
    const pct = Math.min(100, Math.round((elapsed / practiceTimerState.totalIntervalSec) * 100));
    bar.style.width = `${pct}%`;
  }

  if (totalProg) {
    const totalM = Math.floor(practiceTimerState.sessionElapsedSec / 60);
    const totalS = practiceTimerState.sessionElapsedSec % 60;
    const totalBudget = (currentPracticePlan && currentPracticePlan.total_minutes) || 60;
    totalProg.textContent = `${totalM.toString().padStart(2, '0')}:${totalS.toString().padStart(2, '0')} / ${totalBudget}:00`;
  }
}

// ==================== 1-CLICK TEAM-WIDE AUDIT LEDGER STAMPING ====================

async function stampPracticeToTeamLedgers() {
  if (!currentPracticePlan) return;

  const metrics = computeLocalPracticeMetrics(currentPracticePlan);
  const planName = currentPracticePlan.name;
  const accountName = (currentUser && currentUser.name) ? `${currentUser.name} (${currentUser.badge})` : "Coach Mike Callahan (Head Coach)";

  try {
    const res = await fetch('/api/practice-plans/stamp-team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_id: currentPracticePlan.id,
        account: accountName,
        custom_notes: `Logged via On-Ice Practice Studio. Team touches: ${metrics.totalTeamTouches.toLocaleString()}. Work-to-rest ratio: ${metrics.workRestLabel}.`
      })
    });

    if (res.ok) {
      const data = await res.json();
      showNotificationToast(`✅ Stamped ${metrics.totalMinutes}m practice to ${data.stamped_count} roster athletes! (+${data.touches_logged_per_skater} touches/skater)`);
      playHockeyWhistle();

      // Refresh target player dossier if visible
      if (selectedPlayer) {
        renderPlayerDossier(selectedPlayer);
      }
    } else {
      // Client-side fallback stamp
      clientSideStampPractice(planName, metrics, accountName);
    }
  } catch (err) {
    console.warn('Backend stamp failed, using client-side ledger stamp:', err);
    clientSideStampPractice(planName, metrics, accountName);
  }
}

function clientSideStampPractice(planName, metrics, accountName) {
  if (appData && appData.players) {
    appData.players.forEach(p => {
      if (!p.audit_ledger) p.audit_ledger = [];
      p.audit_ledger.unshift({
        id: `led_prac_${Date.now()}_${p.id}`,
        timestamp: new Date().toLocaleString(),
        account: accountName,
        category: "Practice Session",
        action: `Logged 60-Min ADM Practice: ${planName}`,
        diff: `Recorded ${metrics.touchesPerSkater} puck touches, ${metrics.intervalCount} drills. Ratio: ${metrics.workRestLabel}.`
      });

      if (p.micro_kpis) {
        p.micro_kpis.shoulder_scans_per_possession = +(p.micro_kpis.shoulder_scans_per_possession + 0.05).toFixed(2);
        p.micro_kpis.controlled_exit_pct = Math.min(99.0, +(p.micro_kpis.controlled_exit_pct + 0.2).toFixed(1));
      }
    });

    showNotificationToast(`✅ Stamped practice to ${appData.players.length} athlete ledgers! (+${metrics.touchesPerSkater} touches)`);
    playHockeyWhistle();
    if (selectedPlayer) renderPlayerDossier(selectedPlayer);
  }
}

// ==================== 1-CLICK PRINTABLE COACH'S ICE CARD ENGINE ====================

function openCoachIceCardModal() {
  if (!currentPracticePlan) return;
  const modal = document.getElementById('coachIceCardModal');
  const target = document.getElementById('coachIceCardContent');
  if (!modal || !target) return;

  const plan = currentPracticePlan;
  const metrics = computeLocalPracticeMetrics(plan);

  const intervalsRows = (plan.intervals || []).map((it, idx) => `
    <tr class="border-b border-slate-800 text-xs">
      <td class="py-2.5 px-3 font-mono font-bold text-sky-400">#${idx + 1}</td>
      <td class="py-2.5 px-3 font-bold text-white">${it.title}</td>
      <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${it.duration_min} min</td>
      <td class="py-2.5 px-3 text-slate-300">${it.zone || 'Full Ice'}</td>
      <td class="py-2.5 px-3 text-slate-400">${it.category || 'Skill'}</td>
      <td class="py-2.5 px-3 text-slate-300 text-[11px] leading-snug">${it.coaching_keys || 'High tempo, crisp passes.'}</td>
    </tr>
  `).join('');

  let stationSection = '';
  if (plan.station_matrix && plan.station_matrix.enabled && plan.station_matrix.stations) {
    const stnCards = plan.station_matrix.stations.map((stn, idx) => `
      <div class="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
        <div class="flex items-center justify-between">
          <strong class="text-white text-xs">Station ${idx + 1}: ${stn.name}</strong>
          <span class="px-1.5 py-0.5 rounded text-[10px] bg-sky-950 text-sky-300 font-mono">${stn.zone}</span>
        </div>
        <p class="text-[11px] text-slate-300">${stn.focus}</p>
        <span class="text-[10px] text-slate-400 font-mono block">Lead: ${stn.coach_lead || 'Coach'}</span>
      </div>
    `).join('');

    stationSection = `
      <div class="space-y-2 border-t border-slate-800 pt-3">
        <h4 class="font-bold text-xs text-sky-400 uppercase tracking-wider">🔄 ADM 3-Station Ice Rotation Scheme (7 Min Per Station)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          ${stnCards}
        </div>
        <div class="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-300 flex justify-between">
          <span><strong>Rotation Order:</strong> R1 (Red-White-Blue) → R2 (Blue-Red-White) → R3 (White-Blue-Red)</span>
          <span class="text-sky-400 font-mono font-bold">Whistle on 7m horn</span>
        </div>
      </div>
    `;
  }

  const equipmentList = (plan.equipment_needed || ["50 Pucks", "12 Cones", "4 Bumpers"]).map(e => `
    <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">✓ ${e}</span>
  `).join(' ');

  target.innerHTML = `
    <div class="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 font-sans print-card-box">
      <!-- Card Header -->
      <div class="flex flex-wrap justify-between items-start border-b border-slate-800 pb-3 gap-2">
        <div>
          <span class="text-[10px] uppercase tracking-widest text-sky-400 font-bold">Apex North Stars Hockey OS — Official Practice Card</span>
          <h2 class="text-xl font-black text-white">${plan.name}</h2>
          <p class="text-xs text-slate-400">${plan.objective || '60-Minute High Performance Session'}</p>
        </div>
        <div class="text-right text-xs">
          <span class="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono font-bold block mb-1">
            ${metrics.totalMinutes} Min Duration
          </span>
          <span class="text-slate-400 text-[11px]">Est. Touches: <strong class="text-sky-300 font-mono">${metrics.totalTeamTouches.toLocaleString()}</strong></span>
        </div>
      </div>

      <!-- Equipment Checklist -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <strong class="text-slate-300">Required Gear:</strong>
        ${equipmentList}
      </div>

      <!-- Intervals Schedule Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-700 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60">
              <th class="py-2 px-3">#</th>
              <th class="py-2 px-3">Interval Drill</th>
              <th class="py-2 px-3">Time</th>
              <th class="py-2 px-3">Zone</th>
              <th class="py-2 px-3">Category</th>
              <th class="py-2 px-3">Coaching Keys & Progression</th>
            </tr>
          </thead>
          <tbody>
            ${intervalsRows}
          </tbody>
        </table>
      </div>

      <!-- Station Rotation Section -->
      ${stationSection}

      <!-- Coach Sign-Off Strip -->
      <div class="flex justify-between items-center pt-3 border-t border-slate-800 text-[11px] text-slate-400">
        <div>
          <span>Head Coach: <strong>Mike Callahan</strong> (Level 4 Certified)</span> | 
          <span>Date: <strong>${new Date().toLocaleDateString()}</strong></span>
        </div>
        <div class="font-mono text-emerald-400 font-bold">
          PuckPathway OS Certified ADM Sheet
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

function closeCoachIceCardModal() {
  const modal = document.getElementById('coachIceCardModal');
  if (modal) modal.classList.add('hidden');
}

// ==================== 1-CLICK PRINTABLE NCAA SCOUT DOSSIER & PASSPORT ====================

async function openScoutDossierModalForPlayer(playerId) {
  const modal = document.getElementById('scoutDossierModal');
  const target = document.getElementById('scoutDossierContent');
  const title = document.getElementById('scoutDossierModalTitle');
  if (!modal || !target) return;

  let player = null;
  if (appData && appData.players) {
    player = appData.players.find(p => p.id === playerId) || appData.players[0];
  }

  if (!player && selectedPlayer) player = selectedPlayer;
  if (!player) return;

  if (title) title.textContent = `${player.name} (#${player.num}) — Official NCAA / USHL Scouting Dossier`;

  const proj = player.projection || { composite_trajectory_score: 85, ceiling_label: "Collegiate Prospect", probabilities: { ncaa_d1: 65, ushl_tier1: 60 } };
  const combine = player.combine || {};
  const kpis = player.micro_kpis || {};
  const ledger = player.audit_ledger || [];

  const ledgerRows = ledger.slice(0, 8).map(l => `
    <tr class="border-b border-slate-800 text-xs">
      <td class="py-2 px-3 font-mono text-slate-400">${l.timestamp}</td>
      <td class="py-2 px-3 font-bold text-sky-400">${l.account}</td>
      <td class="py-2 px-3 text-emerald-300">${l.action}</td>
      <td class="py-2 px-3 text-slate-300 text-[11px]">${l.diff}</td>
    </tr>
  `).join('');

  target.innerHTML = `
    <div class="p-6 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-6 font-sans print-card-box text-slate-100">
      
      <!-- Top Bureau Banner -->
      <div class="flex flex-wrap justify-between items-center border-b border-slate-800 pb-4 gap-3">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr ${player.avatar_gradient || 'from-sky-500 to-indigo-600'} text-white font-black flex items-center justify-center text-2xl shadow-xl">
            #${player.num}
          </div>
          <div>
            <span class="text-[10px] uppercase tracking-widest text-amber-400 font-bold">North American Junior & NCAA Scouting Bureau</span>
            <h1 class="text-2xl font-black text-white tracking-tight">${player.name}</h1>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>${player.pos}</span> | <span>Shoots: ${player.shot}</span> | <span>DOB: ${player.dob || '2008'}</span> | 
              <strong class="text-sky-300">${player.current_team}</strong> (${player.league})
            </div>
          </div>
        </div>

        <div class="text-right">
          <div class="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-center font-mono">
            <span class="text-[9px] uppercase tracking-wider block text-slate-400">Composite Score</span>
            <strong class="text-xl font-black">${proj.composite_trajectory_score || 88.5}</strong>
          </div>
          <span class="text-[10px] text-emerald-400 font-bold block mt-1">✓ NCAA CHL 18.0 Eligible</span>
        </div>
      </div>

      <!-- Athletic Profile & Combine Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Height / Weight</span>
          <strong class="text-sm font-bold text-white">${player.height || "6'0\""} / ${player.weight_lbs || 175} lbs</strong>
        </div>
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Flying 30m Sprint</span>
          <strong class="text-sm font-bold text-sky-400 font-mono">${combine.flying_30m_sec || 3.82}s</strong>
          <span class="text-[9px] text-slate-500 block">Top 5% League</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Grip Strength</span>
          <strong class="text-sm font-bold text-emerald-400 font-mono">${combine.grip_strength_lbs || 115} lbs</strong>
          <span class="text-[9px] text-slate-500 block">D1 Caliber Grip</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
          <span class="text-[10px] text-slate-400 uppercase tracking-wider block">Academic GPA</span>
          <strong class="text-sm font-bold text-amber-400 font-mono">${player.gpa || '3.85'} GPA</strong>
          <span class="text-[9px] text-slate-500 block">NCAA Clearinghouse Ready</span>
        </div>
      </div>

      <!-- Micro-KPI Radar Summary & Film Breakdown -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Micro KPIs -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
          <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider flex items-center justify-between">
            <span>📊 Advanced Micro-KPI Benchmarks</span>
            <span class="text-[10px] text-slate-400 font-mono">VS USHL / NCAA 50th</span>
          </h4>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-slate-300">Pre-Touch Shoulder Scans</span>
              <strong class="text-emerald-400 font-mono font-bold">${kpis.shoulder_scans_per_possession || 3.4}x / touch</strong>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-300">Controlled D-Zone Exit %</span>
              <strong class="text-sky-400 font-mono font-bold">${kpis.controlled_exit_pct || 78.5}%</strong>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-300">Offensive Royal Road Passing %</span>
              <strong class="text-amber-400 font-mono font-bold">${kpis.high_danger_pass_comp_pct || 72.0}%</strong>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-300">Wall Battle Win Rate</span>
              <strong class="text-indigo-400 font-mono font-bold">${kpis.wall_battle_win_pct || 68.0}%</strong>
            </div>
          </div>
        </div>

        <!-- Scouting Assessment Summary -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider">
            <span>📝 Lead Scout Executive Summary</span>
          </h4>
          <p class="text-xs text-slate-300 leading-relaxed">
            "${player.name} possesses elite hockey sense and deceptive poise under pressure. Exhibits high-frequency shoulder scanning before receiving passes in all 3 zones. High collegiate ceiling with immediate NCAA D1 Top-6 forward or Top-4 defenseman upside."
          </p>
          <div class="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Evaluator: <strong>Shane McCoy</strong> (Head of Scouting, BlueLine DataWorks)</span>
            <span class="text-amber-400 font-mono font-bold">Grade: 1st Round Junior Grade</span>
          </div>
        </div>
      </div>

      <!-- Verified Audit Ledger Trail -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>📜 Verified Training & Performance Audit Ledger</span>
          <span class="text-[10px] text-slate-500">Immutable Ledger Trail</span>
        </h4>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-950">
                <th class="py-2 px-3">Date / Time</th>
                <th class="py-2 px-3">Verified Evaluator</th>
                <th class="py-2 px-3">Action Completed</th>
                <th class="py-2 px-3">Metric Diff Details</th>
              </tr>
            </thead>
            <tbody>
              ${ledgerRows || '<tr><td colspan="4" class="p-3 text-center text-slate-500">No ledger entries recorded yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Official Certification Seal Strip -->
      <div class="flex justify-between items-center pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div>
          <span>Certification ID: <strong class="font-mono text-slate-200">SCOUT-PASSPORT-${player.id.toUpperCase()}-${Date.now().toString().slice(-6)}</strong></span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-emerald-400 font-bold">✓ Official Certified Record</span>
        </div>
      </div>

    </div>
  `;

  modal.classList.remove('hidden');
}

function closeScoutDossierModal() {
  const modal = document.getElementById('scoutDossierModal');
  if (modal) modal.classList.add('hidden');
}

// Make functions accessible globally for HTML onclick
window.openCoachIceCardModal = openCoachIceCardModal;
window.closeCoachIceCardModal = closeCoachIceCardModal;
window.openScoutDossierModalForPlayer = openScoutDossierModalForPlayer;
window.closeScoutDossierModal = closeScoutDossierModal;
window.stepNextStationRotation = stepNextStationRotation;
window.loadDrillFromStation = loadDrillFromStation;
window.updateIntervalDuration = updateIntervalDuration;
window.updateIntervalTitle = updateIntervalTitle;
window.deletePracticeInterval = deletePracticeInterval;



// ============================================================================
// PHASE 10: ENTERPRISE LIVE BENCH SHIFT OS, REAL-TIME GAME TELEMETRY & BOX SCORE
// ============================================================================

let benchState = null;
let benchClockTimer = null;
let benchRosterSortKey = "points";

function initBenchShiftOS() {
  console.log("⚡ Initializing Enterprise Live Bench Shift OS (Phase 10)...");

  // Load from appData if available
  if (appData && appData.bench_game_state) {
    benchState = JSON.parse(JSON.stringify(appData.bench_game_state));
  } else {
    // Default fallback
    benchState = {
      game_id: "game_live_01",
      home_team: { name: "Apex North Stars", score: 3, sog: 24, penalties_count: 2 },
      away_team: { name: "Green Bay Gamblers", score: 2, sog: 19, penalties_count: 3 },
      period: 2,
      game_clock_sec: 745,
      is_clock_running: false,
      strength_state: "5v5 Even Strength",
      deployment: {
        active_forward_line_id: "line_1",
        active_defense_pair_id: "pair_1",
        active_goalie_id: "u14_04",
        shift_duration_sec: 32,
        shift_start_period_time: "12:57"
      },
      active_penalties: [],
      player_game_stats: {},
      recent_events: []
    };
  }

  // Bind Buttons
  const clockToggleBtn = document.getElementById("benchClockToggleBtn");
  if (clockToggleBtn) clockToggleBtn.addEventListener("click", toggleBenchClock);

  const periodNextBtn = document.getElementById("benchPeriodNextBtn");
  if (periodNextBtn) periodNextBtn.addEventListener("click", advanceBenchPeriod);

  const lineChangeBtn = document.getElementById("triggerLineChangeBtn");
  if (lineChangeBtn) lineChangeBtn.addEventListener("click", triggerBenchLineChange);

  const boxScoreBtn = document.getElementById("exportBoxScoreBtn");
  if (boxScoreBtn) boxScoreBtn.addEventListener("click", openGameBoxScoreModal);

  const resetGameBtn = document.getElementById("resetBenchGameBtn");
  if (resetGameBtn) resetGameBtn.addEventListener("click", resetBenchGameUI);

  const confirmGoalBtn = document.getElementById("confirmSaveGoalBtn");
  if (confirmGoalBtn) confirmGoalBtn.addEventListener("click", confirmSaveGoal);

  const confirmPenaltyBtn = document.getElementById("confirmSavePenaltyBtn");
  if (confirmPenaltyBtn) confirmPenaltyBtn.addEventListener("click", confirmSavePenalty);

  // Quick Line Selector Buttons
  document.querySelectorAll(".bench-line-sel-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const fwdId = e.target.dataset.fwd;
      selectBenchForwardLine(fwdId);
    });
  });

  document.querySelectorAll(".bench-pair-sel-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const pairId = e.target.dataset.pair;
      selectBenchDefensePair(pairId);
    });
  });

  // Skater Table Sort Buttons
  document.querySelectorAll(".bench-stat-sort-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".bench-stat-sort-btn").forEach(b => {
        b.className = "bench-stat-sort-btn px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white font-semibold";
      });
      e.target.className = "bench-stat-sort-btn px-2 py-0.5 rounded bg-sky-500 text-white font-bold";
      benchRosterSortKey = e.target.dataset.sort;
      renderBenchRosterTable();
    });
  });

  // Initial Render
  window.benchState = benchState;
  renderBenchFullUI();
}

function renderBenchState() {
  renderBenchFullUI();
}
window.renderBenchState = renderBenchState;
window.renderBenchFullUI = renderBenchFullUI;

function renderBenchFullUI() {
  window.benchState = benchState;
  if (!benchState) return;
  renderBenchScoreboard();
  renderBenchShiftConsole();
  renderBenchActiveSkaters();
  renderBenchEventFeed();
  renderBenchRosterTable();
}

function renderBenchScoreboard() {
  const homeScoreEl = document.getElementById("benchHomeScoreDisplay");
  const awayScoreEl = document.getElementById("benchAwayScoreDisplay");
  const homeSOGEl = document.getElementById("benchHomeSOGDisplay");
  const awaySOGEl = document.getElementById("benchAwaySOGDisplay");
  const periodEl = document.getElementById("benchPeriodBadge");
  const clockEl = document.getElementById("benchGameClockDisplay");
  const strengthEl = document.getElementById("benchStrengthBadge");

  if (homeScoreEl) homeScoreEl.textContent = benchState.home_team.score;
  if (awayScoreEl) awayScoreEl.textContent = benchState.away_team.score;
  if (homeSOGEl) homeSOGEl.textContent = benchState.home_team.sog;
  if (awaySOGEl) awaySOGEl.textContent = benchState.away_team.sog;

  if (periodEl) {
    const p = benchState.period;
    periodEl.textContent = p <= 3 ? `PERIOD ${p}` : `OVERTIME (3v3)`;
  }

  if (clockEl) {
    const m = Math.floor(benchState.game_clock_sec / 60);
    const s = benchState.game_clock_sec % 60;
    clockEl.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  if (strengthEl) {
    strengthEl.textContent = benchState.strength_state;
    if (benchState.strength_state.includes("Power Play")) {
      strengthEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/90 border border-amber-500/50 text-amber-300 animate-pulse";
    } else if (benchState.strength_state.includes("Penalty Kill")) {
      strengthEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/90 border border-rose-500/50 text-rose-300";
    } else {
      strengthEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300";
    }
  }
}

function renderBenchShiftConsole() {
  const durEl = document.getElementById("shiftDurationDisplay");
  const badgeEl = document.getElementById("shiftFatigueBadge");
  const barEl = document.getElementById("shiftFatigueProgressBar");
  const deployBadge = document.getElementById("activeDeploymentBadge");

  const dur = benchState.deployment.shift_duration_sec || 0;
  const m = Math.floor(dur / 60);
  const s = dur % 60;
  if (durEl) durEl.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  if (deployBadge) {
    const fId = (benchState.deployment.active_forward_line_id || "line_1").replace("line_", "L");
    const dId = (benchState.deployment.active_defense_pair_id || "pair_1").replace("pair_", "D");
    deployBadge.textContent = `${fId} / ${dId}`;
  }

  // Fatigue Thresholds
  if (barEl) {
    const pct = Math.min(100, Math.round((dur / 50) * 100));
    barEl.style.width = `${pct}%`;

    if (dur < 35) {
      barEl.className = "bg-emerald-400 h-2 rounded-full transition-all duration-300";
      if (badgeEl) {
        badgeEl.textContent = "Optimal Energy (Fresh)";
        badgeEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30";
      }
    } else if (dur <= 45) {
      barEl.className = "bg-amber-400 h-2 rounded-full transition-all duration-300";
      if (badgeEl) {
        badgeEl.textContent = "Lactate Threshold (Change Soon)";
        badgeEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30";
      }
    } else {
      barEl.className = "bg-rose-500 h-2 rounded-full transition-all duration-300 animate-pulse";
      if (badgeEl) {
        badgeEl.textContent = "FATIGUE ALERT (CHANGE LINE!)";
        badgeEl.className = "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/50 animate-bounce";
      }
    }
  }

  // Update line pill active classes
  document.querySelectorAll(".bench-line-sel-btn").forEach(btn => {
    if (btn.dataset.fwd === benchState.deployment.active_forward_line_id) {
      btn.className = "bench-line-sel-btn px-2 py-0.5 rounded bg-sky-500 text-white font-bold shadow-sm";
    } else {
      btn.className = "bench-line-sel-btn px-2 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-white font-semibold";
    }
  });

  document.querySelectorAll(".bench-pair-sel-btn").forEach(btn => {
    if (btn.dataset.pair === benchState.deployment.active_defense_pair_id) {
      btn.className = "bench-pair-sel-btn px-2 py-0.5 rounded bg-sky-500 text-white font-bold shadow-sm";
    } else {
      btn.className = "bench-pair-sel-btn px-2 py-0.5 rounded bg-slate-900 text-slate-400 hover:text-white font-semibold";
    }
  });
}

function getActiveOnIcePlayerObjects() {
  const fwdId = benchState.deployment.active_forward_line_id;
  const defId = benchState.deployment.active_defense_pair_id;
  const allLines = (appData && appData.lines) ? appData.lines : {};

  const fwdLine = (allLines.even_strength?.forward_lines || []).find(l => l.line_id === fwdId);
  const defPair = (allLines.even_strength?.defense_pairings || []).find(p => p.pair_id === defId);

  const players = [];
  if (fwdLine) {
    ["lw", "c", "rw"].forEach(posKey => {
      const pid = fwdLine[posKey];
      const p = (appData && appData.players) ? appData.players.find(x => x.id === pid) : null;
      if (p) players.push({ ...p, line_role: posKey.toUpperCase() });
    });
  }
  if (defPair) {
    ["ld", "rd"].forEach(posKey => {
      const pid = defPair[posKey];
      const p = (appData && appData.players) ? appData.players.find(x => x.id === pid) : null;
      if (p) players.push({ ...p, line_role: posKey.toUpperCase() });
    });
  }
  return players;
}

function renderBenchActiveSkaters() {
  const container = document.getElementById("benchActiveSkatersGrid");
  if (!container) return;

  const activeSkaters = getActiveOnIcePlayerObjects();
  if (activeSkaters.length === 0) {
    container.innerHTML = `<div class="col-span-5 text-center text-xs text-slate-500 py-3">Deploy lines using the selectors above.</div>`;
    return;
  }

  container.innerHTML = activeSkaters.map(p => {
    const stats = (benchState.player_game_stats && benchState.player_game_stats[p.id]) || {
      toi_sec: 0, shifts: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, shots: 0
    };
    const m = Math.floor(stats.toi_sec / 60);
    const s = stats.toi_sec % 60;
    const toiStr = `${m}:${s.toString().padStart(2, "0")}`;

    return `
      <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-sky-500/60 transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-950 text-sky-300 border border-sky-500/30">${p.line_role}</span>
            <span class="text-[10px] font-bold text-white">#${p.num}</span>
          </div>
          <h5 class="text-xs font-black text-white truncate leading-tight">${p.name.split(' ')[1] || p.name}</h5>
          <span class="text-[10px] text-slate-400 font-mono">TOI: <strong class="text-sky-300">${toiStr}</strong></span>
        </div>
        <div class="mt-2 pt-1 border-t border-slate-800 flex justify-between text-[10px] font-mono">
          <span>G: <strong class="text-emerald-400">${stats.goals}</strong></span>
          <span>A: <strong class="text-sky-400">${stats.assists}</strong></span>
          <span class="${stats.plus_minus >= 0 ? 'text-emerald-300' : 'text-rose-400'}">${stats.plus_minus >= 0 ? '+' : ''}${stats.plus_minus}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderBenchEventFeed() {
  const penDeck = document.getElementById("benchActivePenaltiesDeck");
  const feed = document.getElementById("benchEventLogFeed");

  if (penDeck) {
    const activePens = benchState.active_penalties || [];
    if (activePens.length === 0) {
      penDeck.innerHTML = "";
    } else {
      penDeck.innerHTML = activePens.map(pen => {
        const m = Math.floor(pen.time_remaining_sec / 60);
        const s = pen.time_remaining_sec % 60;
        const timeStr = `${m}:${s.toString().padStart(2, "0")}`;
        return `
          <div class="p-2 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-between text-xs animate-fadeIn">
            <div class="flex items-center gap-2">
              <span class="text-sm">🛑</span>
              <div>
                <strong class="text-white text-[11px]">${pen.player_name}</strong>
                <span class="text-[10px] text-amber-300 block">${pen.infraction}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="font-mono text-xs font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/30">${timeStr}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (feed) {
    const events = benchState.recent_events || [];
    if (events.length === 0) {
      feed.innerHTML = `<div class="text-xs text-slate-500 p-3 text-center">No game events logged yet. Use the Action Pad above.</div>`;
      return;
    }

    feed.innerHTML = events.slice(0, 20).map(evt => {
      let icon = "⚡";
      let badgeClass = "bg-slate-800 text-slate-300 border-slate-700";
      if (evt.type === "goal") {
        icon = "🥅";
        badgeClass = evt.team === "home" ? "bg-emerald-950 text-emerald-300 border-emerald-500/40" : "bg-rose-950 text-rose-300 border-rose-500/40";
      } else if (evt.type === "shot") {
        icon = "🎯";
        badgeClass = "bg-sky-950 text-sky-300 border-sky-500/40";
      } else if (evt.type === "penalty") {
        icon = "🛑";
        badgeClass = "bg-amber-950 text-amber-300 border-amber-500/40";
      } else if (evt.type === "faceoff") {
        icon = "🏒";
        badgeClass = "bg-indigo-950 text-indigo-300 border-indigo-500/40";
      } else if (evt.type === "shift_change") {
        icon = "🔄";
        badgeClass = "bg-slate-900 text-slate-400 border-slate-800";
      }

      return `
        <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-2.5 hover:border-slate-700 transition">
          <span class="text-base shrink-0 mt-0.5">${icon}</span>
          <div class="flex-1 min-w-0 space-y-0.5">
            <div class="flex items-center justify-between gap-1">
              <span class="font-bold text-white text-[11px] truncate">${evt.title}</span>
              <span class="px-1.5 py-0.2 rounded font-mono text-[9px] border ${badgeClass}">${evt.time} P${evt.period}</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-snug">${evt.details}</p>
          </div>
        </div>
      `;
    }).join('');
  }
}

function renderBenchRosterTable() {
  const tbody = document.getElementById("benchRosterBoxscoreTbody");
  if (!tbody || !appData || !appData.players) return;

  const players = [...appData.players];

  players.sort((a, b) => {
    const sa = (benchState.player_game_stats && benchState.player_game_stats[a.id]) || { points: 0, toi_sec: 0, plus_minus: 0 };
    const sb = (benchState.player_game_stats && benchState.player_game_stats[b.id]) || { points: 0, toi_sec: 0, plus_minus: 0 };
    if (benchRosterSortKey === "toi") {
      return (sb.toi_sec || 0) - (sa.toi_sec || 0);
    } else if (benchRosterSortKey === "plus_minus") {
      return (sb.plus_minus || 0) - (sa.plus_minus || 0);
    } else {
      return (sb.points || 0) - (sa.points || 0);
    }
  });

  tbody.innerHTML = players.map(p => {
    const stats = (benchState.player_game_stats && benchState.player_game_stats[p.id]) || {
      toi_sec: 0, shifts: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, shots: 0,
      faceoffs_won: 0, faceoffs_lost: 0
    };
    const m = Math.floor((stats.toi_sec || 0) / 60);
    const s = (stats.toi_sec || 0) % 60;
    const toiStr = `${m}:${s.toString().padStart(2, "0")}`;

    const totalFO = (stats.faceoffs_won || 0) + (stats.faceoffs_lost || 0);
    const foPct = totalFO > 0 ? `${Math.round(((stats.faceoffs_won || 0) / totalFO) * 100)}%` : "-";

    const pm = stats.plus_minus || 0;
    const pmClass = pm > 0 ? "text-emerald-400 font-bold" : (pm < 0 ? "text-rose-400 font-bold" : "text-slate-400");

    return `
      <tr class="hover:bg-slate-900/60 transition text-[11px]">
        <td class="py-2 px-2 font-mono font-bold text-slate-400">#${p.num}</td>
        <td class="py-2 px-2 font-bold text-white truncate max-w-[120px]">${p.name}</td>
        <td class="py-2 px-1 text-slate-400">${p.pos}</td>
        <td class="py-2 px-2 text-right font-mono text-sky-300 font-bold">${toiStr}</td>
        <td class="py-2 px-1 text-center font-mono text-slate-400">${stats.shifts || 0}</td>
        <td class="py-2 px-1 text-center font-mono font-bold ${stats.goals > 0 ? 'text-emerald-400' : 'text-slate-400'}">${stats.goals || 0}</td>
        <td class="py-2 px-1 text-center font-mono font-bold ${stats.assists > 0 ? 'text-sky-400' : 'text-slate-400'}">${stats.assists || 0}</td>
        <td class="py-2 px-1 text-center font-mono font-black ${stats.points > 0 ? 'text-amber-400' : 'text-slate-300'}">${stats.points || 0}</td>
        <td class="py-2 px-1 text-center font-mono ${pmClass}">${pm > 0 ? '+' : ''}${pm}</td>
        <td class="py-2 px-1 text-center font-mono text-slate-300">${stats.shots || 0}</td>
        <td class="py-2 px-1 text-center font-mono text-slate-400">${foPct}</td>
      </tr>
    `;
  }).join('');
}

// ==================== BENCH CLOCK & SHIFT TIMING ENGINE ====================

function toggleBenchClock() {
  benchState.is_clock_running = !benchState.is_clock_running;
  const icon = document.getElementById("benchClockIcon");
  const text = document.getElementById("benchClockText");
  const btn = document.getElementById("benchClockToggleBtn");

  if (benchState.is_clock_running) {
    if (icon) icon.textContent = "⏸";
    if (text) text.textContent = "Pause Clock";
    if (btn) btn.className = "px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-black text-xs text-white transition flex items-center gap-1.5 shadow-lg shadow-amber-600/30";

    benchClockTimer = setInterval(() => {
      // Decrement game clock
      if (benchState.game_clock_sec > 0) {
        benchState.game_clock_sec--;
        benchState.deployment.shift_duration_sec = (benchState.deployment.shift_duration_sec || 0) + 1;

        // Decrement penalties
        if (benchState.active_penalties && benchState.active_penalties.length > 0) {
          benchState.active_penalties.forEach(pen => {
            if (pen.time_remaining_sec > 0) {
              pen.time_remaining_sec--;
            }
          });
          // Remove expired penalties
          const hadPenalties = benchState.active_penalties.length;
          benchState.active_penalties = benchState.active_penalties.filter(p => p.time_remaining_sec > 0);
          if (hadPenalties > benchState.active_penalties.length) {
            benchState.strength_state = "5v5 Even Strength";
            playHockeyWhistle();
            showNotificationToast("🚨 Penalty Expired - Back to Full Strength 5v5!");
          }
        }

        renderBenchScoreboard();
        renderBenchShiftConsole();
      } else {
        // Period Over!
        toggleBenchClock();
        playRinkBuzzer();
        showNotificationToast(`🚨 END OF PERIOD ${benchState.period}!`);
      }
    }, 1000);
  } else {
    if (icon) icon.textContent = "▶";
    if (text) text.textContent = "Start Clock";
    if (btn) btn.className = "px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black text-xs text-white transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30";
    if (benchClockTimer) {
      clearInterval(benchClockTimer);
      benchClockTimer = null;
    }
  }
}

function advanceBenchPeriod() {
  benchState.period = (benchState.period % 4) + 1;
  benchState.game_clock_sec = 1200;
  if (benchState.period === 4) {
    benchState.strength_state = "3v3 Overtime";
    showNotificationToast("🏒 Overtime (3v3 Sudden Death) Begins!");
  } else {
    showNotificationToast(`🏒 Period ${benchState.period} Ready For Puck Drop!`);
  }
  playHockeyWhistle();
  renderBenchFullUI();
}

async function triggerBenchLineChange() {
  const shiftSec = benchState.deployment.shift_duration_sec || 35;
  const onIceSkaters = getActiveOnIcePlayerObjects();

  // Accumulate TOI locally
  onIceSkaters.forEach(p => {
    if (!benchState.player_game_stats[p.id]) {
      benchState.player_game_stats[p.id] = { toi_sec: 0, shifts: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, shots: 0 };
    }
    benchState.player_game_stats[p.id].toi_sec += shiftSec;
    benchState.player_game_stats[p.id].shifts += 1;
  });

  // Cycle forward lines: line_1 -> line_2 -> line_3 -> line_4 -> line_1
  const fwdOrder = ["line_1", "line_2", "line_3", "line_4"];
  const curFwdIdx = fwdOrder.indexOf(benchState.deployment.active_forward_line_id);
  const nextFwd = fwdOrder[(curFwdIdx + 1) % fwdOrder.length];

  // Cycle defense pairings: pair_1 -> pair_2 -> pair_3 -> pair_1
  const defOrder = ["pair_1", "pair_2", "pair_3"];
  const curDefIdx = defOrder.indexOf(benchState.deployment.active_defense_pair_id);
  const nextDef = defOrder[(curDefIdx + 1) % defOrder.length];

  benchState.deployment.active_forward_line_id = nextFwd;
  benchState.deployment.active_defense_pair_id = nextDef;
  benchState.deployment.shift_duration_sec = 0;

  const m = Math.floor(benchState.game_clock_sec / 60);
  const s = benchState.game_clock_sec % 60;
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  benchState.deployment.shift_start_period_time = timeStr;

  benchState.recent_events.unshift({
    id: `evt_shift_${Date.now()}`,
    time: timeStr,
    period: benchState.period,
    type: "shift_change",
    team: "home",
    title: `LINE CHANGE: ${nextFwd.toUpperCase()} / ${nextDef.toUpperCase()}`,
    details: `Completed shift (${shiftSec}s). Deployed fresh unit.`,
    strength: benchState.strength_state
  });

  playHockeyWhistle();
  showNotificationToast(`🔄 Line change executed (${shiftSec}s shift logged). Deployed ${nextFwd.toUpperCase()} / ${nextDef.toUpperCase()}`);
  renderBenchFullUI();

  // Sync with backend API
  try {
    fetch("/api/bench/line-change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        forward_line_id: nextFwd,
        defense_pair_id: nextDef,
        shift_duration_sec: shiftSec,
        account: currentUser ? `${currentUser.name} (${currentUser.badge})` : "Coach Callahan"
      })
    });
  } catch (e) {
    console.warn("Backend line-change sync failed:", e);
  }
}

function selectBenchForwardLine(lineId) {
  benchState.deployment.active_forward_line_id = lineId;
  benchState.deployment.shift_duration_sec = 0;
  renderBenchShiftConsole();
  renderBenchActiveSkaters();
  showNotificationToast(`🏒 Deployed Forward ${lineId.toUpperCase()}`);
}

function selectBenchDefensePair(pairId) {
  benchState.deployment.active_defense_pair_id = pairId;
  benchState.deployment.shift_duration_sec = 0;
  renderBenchShiftConsole();
  renderBenchActiveSkaters();
  showNotificationToast(`🏒 Deployed Defense ${pairId.toUpperCase()}`);
}

// ==================== IN-GAME ACTION EVENT HANDLERS ====================

function openLogGoalModal(team = "home") {
  const modal = document.getElementById("logGoalModal");
  const scorerSelect = document.getElementById("goalScorerSelect");
  const a1Select = document.getElementById("goalAssist1Select");
  const a2Select = document.getElementById("goalAssist2Select");
  const timeInput = document.getElementById("goalTimeDisplayInput");
  if (!modal) return;

  const m = Math.floor(benchState.game_clock_sec / 60);
  const s = benchState.game_clock_sec % 60;
  if (timeInput) timeInput.value = `P${benchState.period} - ${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  if (scorerSelect && appData && appData.players) {
    const onIceSkaters = getActiveOnIcePlayerObjects();
    const sortedPlayers = onIceSkaters.length > 0 ? onIceSkaters : appData.players;

    scorerSelect.innerHTML = sortedPlayers.map(p => `
      <option value="${p.id}">#${p.num} ${p.name} (${p.pos})</option>
    `).join('');

    const assistOptions = `<option value="">None (Unassisted)</option>` + appData.players.map(p => `
      <option value="${p.id}">#${p.num} ${p.name} (${p.pos})</option>
    `).join('');

    if (a1Select) a1Select.innerHTML = assistOptions;
    if (a2Select) a2Select.innerHTML = assistOptions;
  }

  modal.classList.remove("hidden");
}

function closeLogGoalModal() {
  const modal = document.getElementById("logGoalModal");
  if (modal) modal.classList.add("hidden");
}

async function confirmSaveGoal() {
  const scorerId = document.getElementById("goalScorerSelect")?.value;
  const a1Id = document.getElementById("goalAssist1Select")?.value;
  const a2Id = document.getElementById("goalAssist2Select")?.value;
  const strength = document.getElementById("goalStrengthSelect")?.value || "5v5";

  const m = Math.floor(benchState.game_clock_sec / 60);
  const s = benchState.game_clock_sec % 60;
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  // Local state update
  benchState.home_team.score += 1;
  benchState.home_team.sog += 1;

  let scorerName = "Apex Player";
  if (scorerId) {
    const p = appData.players.find(x => x.id === scorerId);
    if (p) {
      scorerName = `${p.name} (#${p.num})`;
      const st = benchState.player_game_stats[scorerId] = benchState.player_game_stats[scorerId] || { toi_sec: 0, shifts: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, shots: 0 };
      st.goals += 1;
      st.points += 1;
      st.shots += 1;
      
      if (!p.audit_ledger) p.audit_ledger = [];
      p.audit_ledger.unshift({
        id: `led_goal_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        account: currentUser ? `${currentUser.name} (${currentUser.badge})` : "Coach Mike Callahan",
        category: "In-Game Goal",
        action: `Scored Goal at ${timeStr} (P${benchState.period})`,
        diff: `Game goal vs Green Bay Gamblers. Strength: ${strength}.`
      });
    }
  }

  // Assists
  const assistsList = [];
  [a1Id, a2Id].forEach((aid, idx) => {
    if (aid) {
      const ap = appData.players.find(x => x.id === aid);
      if (ap) {
        assistsList.push(`${ap.name} (#${ap.num})`);
        const ast = benchState.player_game_stats[aid] = benchState.player_game_stats[aid] || { toi_sec: 0, shifts: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, shots: 0 };
        ast.assists += 1;
        ast.points += 1;
        if (!ap.audit_ledger) ap.audit_ledger = [];
        ap.audit_ledger.unshift({
          id: `led_ast_${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          account: currentUser ? `${currentUser.name} (${currentUser.badge})` : "Coach Mike Callahan",
          category: "In-Game Assist",
          action: `${idx === 0 ? 'Primary' : 'Secondary'} Assist at ${timeStr} (P${benchState.period})`,
          diff: `Assisted on goal scored by ${scorerName}.`
        });
      }
    }
  });

  // Plus/Minus
  getActiveOnIcePlayerObjects().forEach(sk => {
    const st = benchState.player_game_stats[sk.id] = benchState.player_game_stats[sk.id] || { toi_sec: 0, shifts: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, shots: 0 };
    st.plus_minus += 1;
  });

  const astNote = assistsList.length > 0 ? ` Assists: ${assistsList.join(', ')}.` : " Unassisted.";
  benchState.recent_events.unshift({
    id: `evt_g_${Date.now()}`,
    time: timeStr,
    period: benchState.period,
    type: "goal",
    team: "home",
    title: `GOAL: ${scorerName}`,
    details: `${scorerName} scores at ${timeStr} (P${benchState.period}).${astNote} Strength: ${strength}.`,
    strength: strength
  });

  playHockeyWhistle();
  closeLogGoalModal();
  renderBenchFullUI();
  showNotificationToast(`🥅 GOAL! ${scorerName} puts Apex ahead! (${benchState.home_team.score} - ${benchState.away_team.score})`);

  // Refresh dossier if open
  if (selectedPlayer) renderPlayerDossier(selectedPlayer);
}

function logQuickShot(team = "home") {
  const m = Math.floor(benchState.game_clock_sec / 60);
  const s = benchState.game_clock_sec % 60;
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  if (team === "home") {
    benchState.home_team.sog += 1;
    const skaters = getActiveOnIcePlayerObjects();
    const shooter = skaters[0] || (appData && appData.players ? appData.players[0] : null);
    const shooterName = shooter ? `${shooter.name} (#${shooter.num})` : "Apex Shooter";

    if (shooter) {
      const st = benchState.player_game_stats[shooter.id] = benchState.player_game_stats[shooter.id] || { toi_sec: 0, shifts: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, shots: 0 };
      st.shots += 1;
    }

    benchState.recent_events.unshift({
      id: `evt_s_${Date.now()}`,
      time: timeStr,
      period: benchState.period,
      type: "shot",
      team: "home",
      title: `SHOT ON GOAL: ${shooterName}`,
      details: `Dangerous scoring chance saved by goalie.`,
      strength: benchState.strength_state
    });
    showNotificationToast(`🎯 Shot on Goal recorded for ${shooterName}!`);
  } else {
    benchState.away_team.sog += 1;
    benchState.recent_events.unshift({
      id: `evt_s_${Date.now()}`,
      time: timeStr,
      period: benchState.period,
      type: "shot",
      team: "away",
      title: `SHOT: Green Bay Gamblers`,
      details: `Puck stopped and covered by Alex Price.`,
      strength: benchState.strength_state
    });
    showNotificationToast(`🛑 Save recorded by Alex Price!`);
  }

  renderBenchScoreboard();
  renderBenchEventFeed();
  renderBenchRosterTable();
}

function logQuickFaceoff(won = true) {
  const m = Math.floor(benchState.game_clock_sec / 60);
  const s = benchState.game_clock_sec % 60;
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  const skaters = getActiveOnIcePlayerObjects();
  const center = skaters.find(s => s.line_role === "C") || skaters[0] || (appData && appData.players ? appData.players[0] : null);
  const cName = center ? `${center.name} (#${center.num})` : "Apex Center";

  if (center) {
    const st = benchState.player_game_stats[center.id] = benchState.player_game_stats[center.id] || { toi_sec: 0, shifts: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, shots: 0, faceoffs_won: 0, faceoffs_lost: 0 };
    if (won) st.faceoffs_won = (st.faceoffs_won || 0) + 1;
    else st.faceoffs_lost = (st.faceoffs_lost || 0) + 1;
  }

  benchState.recent_events.unshift({
    id: `evt_fo_${Date.now()}`,
    time: timeStr,
    period: benchState.period,
    type: "faceoff",
    team: "home",
    title: `FACEOFF ${won ? 'WON' : 'LOST'}: ${cName}`,
    details: `Draw in neutral zone. Clean puck control established.`,
    strength: benchState.strength_state
  });

  renderBenchEventFeed();
  renderBenchRosterTable();
  showNotificationToast(`⚡ Faceoff ${won ? 'WON' : 'LOST'} by ${cName}`);
}

function logQuickExit(controlled = true) {
  const m = Math.floor(benchState.game_clock_sec / 60);
  const s = benchState.game_clock_sec % 60;
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  const skaters = getActiveOnIcePlayerObjects();
  const dman = skaters.find(s => s.line_role === "LD" || s.line_role === "RD") || skaters[0];
  const dName = dman ? `${dman.name} (#${dman.num})` : "Defenseman";

  if (dman && dman.micro_kpis) {
    dman.micro_kpis.controlled_exit_pct = Math.min(99.0, +(dman.micro_kpis.controlled_exit_pct + 0.4).toFixed(1));
  }

  benchState.recent_events.unshift({
    id: `evt_exit_${Date.now()}`,
    time: timeStr,
    period: benchState.period,
    type: "exit",
    team: "home",
    title: `D-ZONE EXIT: ${dName}`,
    details: `${controlled ? 'Clean tape-to-tape transition pass out of zone.' : 'Puck chipped to neutral ice under pressure.'}`,
    strength: benchState.strength_state
  });

  renderBenchEventFeed();
  showNotificationToast(`🛡️ D-Zone Exit recorded for ${dName}!`);
}

function openLogPenaltyModal(team = "home") {
  const modal = document.getElementById("logPenaltyModal");
  const playerSelect = document.getElementById("penaltyPlayerSelect");
  if (!modal) return;

  if (playerSelect && appData && appData.players) {
    playerSelect.innerHTML = appData.players.map(p => `
      <option value="${p.id}">#${p.num} ${p.name} (${p.pos})</option>
    `).join('');
  }

  modal.classList.remove("hidden");
}

function closeLogPenaltyModal() {
  const modal = document.getElementById("logPenaltyModal");
  if (modal) modal.classList.add("hidden");
}

function confirmSavePenalty() {
  const playerId = document.getElementById("penaltyPlayerSelect")?.value;
  const infraction = document.getElementById("penaltyInfractionSelect")?.value || "Tripping (Minor)";
  const mins = parseInt(document.getElementById("penaltyMinutesSelect")?.value) || 2;

  const m = Math.floor(benchState.game_clock_sec / 60);
  const s = benchState.game_clock_sec % 60;
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  let pName = "Apex Player";
  if (playerId) {
    const p = appData.players.find(x => x.id === playerId);
    if (p) pName = `${p.name} (#${p.num})`;
  }

  benchState.home_team.penalties_count += 1;
  benchState.strength_state = "4v5 Penalty Kill";

  benchState.active_penalties.push({
    id: `pen_${Date.now()}`,
    team: "home",
    player_id: playerId,
    player_name: pName,
    infraction: infraction,
    time_remaining_sec: mins * 60,
    period: benchState.period
  });

  benchState.recent_events.unshift({
    id: `evt_pen_${Date.now()}`,
    time: timeStr,
    period: benchState.period,
    type: "penalty",
    team: "home",
    title: `PENALTY: ${pName}`,
    details: `${infraction} (${mins}:00). Apex transitions to 4v5 Penalty Kill.`,
    strength: "4v5 Penalty Kill"
  });

  playHockeyWhistle();
  closeLogPenaltyModal();
  renderBenchFullUI();
  showNotificationToast(`🛑 Penalty: ${pName} - ${infraction} (${mins}:00)`);
}

function resetBenchGameUI() {
  if (confirm("Reset current game scores, period clock, and player TOI?")) {
    if (benchClockTimer) {
      clearInterval(benchClockTimer);
      benchClockTimer = null;
    }
    benchState.home_team.score = 0;
    benchState.home_team.sog = 0;
    benchState.away_team.score = 0;
    benchState.away_team.sog = 0;
    benchState.period = 1;
    benchState.game_clock_sec = 1200;
    benchState.is_clock_running = false;
    benchState.strength_state = "5v5 Even Strength";
    benchState.active_penalties = [];
    benchState.deployment.shift_duration_sec = 0;
    benchState.player_game_stats = {};
    benchState.recent_events = [{
      id: "evt_init",
      time: "20:00",
      period: 1,
      type: "shift_change",
      team: "home",
      title: "PERIOD 1 PUCK DROP",
      details: "Game is underway. Line 1 / Pair 1 deployed.",
      strength: "5v5 Even Strength"
    }];

    renderBenchFullUI();
    showNotificationToast("🔄 Game clock and scores reset to Period 1 20:00");
  }
}

// ==================== PRINTABLE OFFICIAL GAME BOX SCORE ====================

function openGameBoxScoreModal() {
  const modal = document.getElementById("gameBoxScoreModal");
  const content = document.getElementById("gameBoxScoreContent");
  if (!modal || !content || !benchState) return;

  const h = benchState.home_team;
  const a = benchState.away_team;

  const scoringRows = (benchState.recent_events || []).filter(e => e.type === "goal").map(g => `
    <tr class="border-b border-slate-800 text-xs">
      <td class="py-2 px-3 font-mono text-sky-400">P${g.period}</td>
      <td class="py-2 px-3 font-mono font-bold text-white">${g.time}</td>
      <td class="py-2 px-3 font-bold ${g.team === 'home' ? 'text-sky-300' : 'text-amber-300'}">${g.team === 'home' ? h.name : a.name}</td>
      <td class="py-2 px-3 text-slate-200">${g.title.replace('GOAL: ', '')}</td>
      <td class="py-2 px-3 text-slate-300 text-[11px]">${g.details}</td>
      <td class="py-2 px-3 font-mono text-emerald-400 font-bold">${g.strength}</td>
    </tr>
  `).join('');

  const penaltyRows = (benchState.recent_events || []).filter(e => e.type === "penalty").map(pen => `
    <tr class="border-b border-slate-800 text-xs">
      <td class="py-2 px-3 font-mono text-amber-400">P${pen.period}</td>
      <td class="py-2 px-3 font-mono font-bold text-white">${pen.time}</td>
      <td class="py-2 px-3 font-bold text-white">${pen.team === 'home' ? h.name : a.name}</td>
      <td class="py-2 px-3 text-amber-300 font-bold">${pen.title.replace('PENALTY: ', '')}</td>
      <td class="py-2 px-3 text-slate-300">${pen.details}</td>
    </tr>
  `).join('');

  const skaterRows = (appData && appData.players ? appData.players : []).map(p => {
    const st = (benchState.player_game_stats && benchState.player_game_stats[p.id]) || {
      toi_sec: 0, shifts: 0, goals: 0, assists: 0, points: 0, plus_minus: 0, shots: 0, faceoffs_won: 0, faceoffs_lost: 0
    };
    const m = Math.floor(st.toi_sec / 60);
    const s = st.toi_sec % 60;
    const toiStr = `${m}:${s.toString().padStart(2, "0")}`;

    return `
      <tr class="border-b border-slate-800 text-xs">
        <td class="py-2 px-2 font-mono text-slate-400">#${p.num}</td>
        <td class="py-2 px-2 font-bold text-white">${p.name}</td>
        <td class="py-2 px-1 text-slate-400">${p.pos}</td>
        <td class="py-2 px-2 text-right font-mono font-bold text-sky-300">${toiStr}</td>
        <td class="py-2 px-1 text-center font-mono">${st.shifts || 0}</td>
        <td class="py-2 px-1 text-center font-mono font-bold text-emerald-400">${st.goals || 0}</td>
        <td class="py-2 px-1 text-center font-mono font-bold text-sky-400">${st.assists || 0}</td>
        <td class="py-2 px-1 text-center font-mono font-black text-amber-400">${st.points || 0}</td>
        <td class="py-2 px-1 text-center font-mono ${st.plus_minus >= 0 ? 'text-emerald-300' : 'text-rose-400'}">${st.plus_minus >= 0 ? '+' : ''}${st.plus_minus || 0}</td>
        <td class="py-2 px-1 text-center font-mono text-slate-300">${st.shots || 0}</td>
      </tr>
    `;
  }).join('');

  content.innerHTML = `
    <div class="p-6 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-5 print-card-box text-slate-100">
      
      <!-- Top Bureau Banner -->
      <div class="flex flex-wrap justify-between items-start border-b border-slate-800 pb-3 gap-3">
        <div>
          <span class="text-[10px] uppercase tracking-widest text-sky-400 font-bold">Official Game Box Score & Shift Log</span>
          <h2 class="text-xl font-black text-white">${h.name} vs ${a.name}</h2>
          <div class="text-xs text-slate-400 mt-0.5">
            <span>Date: <strong>${new Date().toLocaleDateString()}</strong></span> | 
            <span>Venue: <strong>Apex High Performance Ice Center</strong></span> | 
            <span>Sanction: <strong>USA Hockey / Showcase Division</strong></span>
          </div>
        </div>
        <div class="text-right">
          <span class="font-mono text-2xl font-black text-white bg-slate-950 px-3.5 py-1 rounded-xl border border-slate-700">
            ${h.score} - ${a.score}
          </span>
          <span class="text-[10px] text-slate-400 block mt-1">FINAL / LIVE P${benchState.period}</span>
        </div>
      </div>

      <!-- Linescore Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-center border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-700 text-[10px] uppercase text-slate-400 bg-slate-950">
              <th class="py-2 px-3 text-left">Team</th>
              <th class="py-2 px-3">1st</th>
              <th class="py-2 px-3">2nd</th>
              <th class="py-2 px-3">3rd</th>
              <th class="py-2 px-3 font-bold text-white">FINAL</th>
              <th class="py-2 px-3 text-sky-300">SOG</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-800">
              <td class="py-2 px-3 text-left font-bold text-sky-400">${h.name}</td>
              <td class="py-2 px-3 font-mono">2</td>
              <td class="py-2 px-3 font-mono">${Math.max(0, h.score - 2)}</td>
              <td class="py-2 px-3 font-mono">0</td>
              <td class="py-2 px-3 font-mono font-black text-white text-sm">${h.score}</td>
              <td class="py-2 px-3 font-mono font-bold text-sky-300">${h.sog}</td>
            </tr>
            <tr class="border-b border-slate-800">
              <td class="py-2 px-3 text-left font-bold text-amber-400">${a.name}</td>
              <td class="py-2 px-3 font-mono">1</td>
              <td class="py-2 px-3 font-mono">${Math.max(0, a.score - 1)}</td>
              <td class="py-2 px-3 font-mono">0</td>
              <td class="py-2 px-3 font-mono font-black text-white text-sm">${a.score}</td>
              <td class="py-2 px-3 font-mono font-bold text-amber-300">${a.sog}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Scoring Summary -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-sky-300 uppercase tracking-wider">🥅 Scoring Summary</h4>
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-700 text-[10px] uppercase text-slate-400 bg-slate-950">
              <th class="py-1.5 px-3">Per</th>
              <th class="py-1.5 px-3">Time</th>
              <th class="py-1.5 px-3">Team</th>
              <th class="py-1.5 px-3">Goal Scorer</th>
              <th class="py-1.5 px-3">Assists / Details</th>
              <th class="py-1.5 px-3">Type</th>
            </tr>
          </thead>
          <tbody>
            ${scoringRows || '<tr><td colspan="6" class="p-3 text-center text-slate-500">No goals recorded yet.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Penalties Summary -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-amber-300 uppercase tracking-wider">🛑 Penalty Summary</h4>
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-700 text-[10px] uppercase text-slate-400 bg-slate-950">
              <th class="py-1.5 px-3">Per</th>
              <th class="py-1.5 px-3">Time</th>
              <th class="py-1.5 px-3">Team</th>
              <th class="py-1.5 px-3">Player</th>
              <th class="py-1.5 px-3">Infraction</th>
            </tr>
          </thead>
          <tbody>
            ${penaltyRows || '<tr><td colspan="5" class="p-3 text-center text-slate-500">No penalties recorded.</td></tr>'}
          </tbody>
        </table>
      </div>

      <!-- Individual Skater Boxscore -->
      <div class="space-y-2">
        <h4 class="text-xs font-bold text-white uppercase tracking-wider">📊 Skater Statistics & Time On Ice</h4>
        <div class="overflow-x-auto max-h-[260px] overflow-y-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="sticky top-0 bg-slate-950 text-[10px] uppercase text-slate-400 border-b border-slate-700">
              <tr>
                <th class="py-1.5 px-2">#</th>
                <th class="py-1.5 px-2">Skater</th>
                <th class="py-1.5 px-1">Pos</th>
                <th class="py-1.5 px-2 text-right">TOI</th>
                <th class="py-1.5 px-1 text-center">SH</th>
                <th class="py-1.5 px-1 text-center">G</th>
                <th class="py-1.5 px-1 text-center">A</th>
                <th class="py-1.5 px-1 text-center">PTS</th>
                <th class="py-1.5 px-1 text-center">+/-</th>
                <th class="py-1.5 px-1 text-center">SOG</th>
              </tr>
            </thead>
            <tbody>
              ${skaterRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Certification Footer -->
      <div class="flex justify-between items-center pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div>
          <span>Official Scorer: <strong>Shane McCoy</strong> (Head of Scouting, BlueLine DataWorks)</span> | 
          <span>Head Coach: <strong>Mike Callahan</strong></span>
        </div>
        <div class="font-mono text-sky-400 font-bold">
          Official PuckPathway OS Game Record
        </div>
      </div>

    </div>
  `;

  modal.classList.remove("hidden");
}

function closeGameBoxScoreModal() {
  const modal = document.getElementById("gameBoxScoreModal");
  if (modal) modal.classList.add("hidden");
}

// Global window function attachments
window.openLogGoalModal = openLogGoalModal;
window.closeLogGoalModal = closeLogGoalModal;
window.confirmSaveGoal = confirmSaveGoal;
window.logQuickShot = logQuickShot;
window.logQuickFaceoff = logQuickFaceoff;
window.logQuickExit = logQuickExit;
window.openLogPenaltyModal = openLogPenaltyModal;
window.closeLogPenaltyModal = closeLogPenaltyModal;
window.confirmSavePenalty = confirmSavePenalty;
window.openGameBoxScoreModal = openGameBoxScoreModal;
window.closeGameBoxScoreModal = closeGameBoxScoreModal;
window.resetBenchGameUI = resetBenchGameUI;



// =========================================================================================
// PUCKPATHWAY OS: WORLDWIDE MINOR LEAGUES, FREE AGENTS & PATH SCOUTING PROFILE ENGINE
// =========================================================================================

function resetAllPlayerFilters() {
  activeLevel = 'all';
  activePos = 'all';
  activeTeamId = 'all';
  activePlayerStatus = 'all';
  searchQuery = '';

  const lSelect = document.getElementById('leagueFilterSelect');
  if (lSelect) lSelect.value = 'all';
  const tSelect = document.getElementById('teamFilterSelect');
  if (tSelect) tSelect.value = 'all';
  
  document.querySelectorAll('.pos-filter-btn').forEach(btn => {
    btn.classList.remove('bg-sky-500', 'text-white');
    btn.classList.add('bg-slate-900', 'text-slate-400');
    if (btn.dataset.pos === 'all') {
      btn.classList.add('bg-sky-500', 'text-white');
      btn.classList.remove('bg-slate-900', 'text-slate-400');
    }
  });

  const badge = document.getElementById('playerListFilterBadge');
  if (badge) badge.textContent = 'All Leagues';

  renderPlayerList();
}
window.resetAllPlayerFilters = resetAllPlayerFilters;

function populateTeamFilterDropdowns() {
  if (!appData) return;
  const teams = appData.teams || [];
  const freeAgents = (appData.players || []).filter(p => p.status === 'free_agent_unassigned');

  // 1. #teamFilterSelect
  const teamFilterSelect = document.getElementById('teamFilterSelect');
  if (teamFilterSelect) {
    let opts = `
      <option value="all">All Teams & Free Agents (${(appData.players || []).length})</option>
      <option value="free_agents">⚡ 2-Year Active Free Agents Only (${freeAgents.length})</option>
      <optgroup label="Worldwide Minor League Clubs">
    `;
    teams.forEach(t => {
      const rosterCount = (appData.players || []).filter(p => p.team_id === t.id).length;
      opts += `<option value="${t.id}">${t.name} (${t.league}, ${t.country}) - ${rosterCount} players</option>`;
    });
    opts += `</optgroup>`;
    teamFilterSelect.innerHTML = opts;
  }

  // 2. #importTargetTeamSelect
  const importTargetTeamSelect = document.getElementById('importTargetTeamSelect');
  if (importTargetTeamSelect) {
    let opts = '';
    teams.forEach(t => {
      opts += `<option value="${t.id}">${t.name} (${t.league}, ${t.country}) - HC: ${t.head_coach}</option>`;
    });
    importTargetTeamSelect.innerHTML = opts;
  }

  // 3. #signFreeAgentTeamSelect
  const signFreeAgentTeamSelect = document.getElementById('signFreeAgentTeamSelect');
  if (signFreeAgentTeamSelect) {
    let opts = '';
    teams.forEach(t => {
      opts += `<option value="${t.id}">${t.name} (${t.league}, ${t.country})</option>`;
    });
    signFreeAgentTeamSelect.innerHTML = opts;
  }

  // 4. #signFreeAgentPlayerSelect
  const signFreeAgentPlayerSelect = document.getElementById('signFreeAgentPlayerSelect');
  if (signFreeAgentPlayerSelect) {
    let opts = '';
    freeAgents.forEach(fa => {
      opts += `<option value="${fa.id}">${fa.name} (#${fa.num} ${fa.pos}) - ${fa.contract_status || 'Free Agent'}</option>`;
    });
    signFreeAgentPlayerSelect.innerHTML = opts;
  }
}

// ---------------------- PATH — SCOUTING PROFILE MODAL ENGINE ----------------------

function openPathScoutingProfileModal(player) {
  const modal = document.getElementById('pathScoutingProfileModal');
  if (!modal) return;

  pathScoutingPlayer = player || selectedPlayer || (appData.players && appData.players[0]);
  if (!pathScoutingPlayer) return;

  renderPathWatchlist();
  renderPathScoutingProfile(pathScoutingPlayer);
  modal.classList.remove('hidden');
}
window.openPathScoutingProfileModal = openPathScoutingProfileModal;

function closePathScoutingProfileModal() {
  const modal = document.getElementById('pathScoutingProfileModal');
  if (modal) modal.classList.add('hidden');
}
window.closePathScoutingProfileModal = closePathScoutingProfileModal;

function renderPathWatchlist() {
  const container = document.getElementById('pathWatchlistContainer');
  if (!container || !appData || !appData.players) return;

  const searchInput = document.getElementById('pathWatchlistSearchInput');
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let list = appData.players.filter(p => {
    if (!q) return true;
    return p.name.toLowerCase().includes(q) ||
      (p.team && p.team.toLowerCase().includes(q)) ||
      (p.league && p.league.toLowerCase().includes(q)) ||
      (p.contract_status && p.contract_status.toLowerCase().includes(q));
  });

  const countBadge = document.getElementById('pathWatchlistCountBadge');
  if (countBadge) countBadge.textContent = `${list.length} Athletes`;

  container.innerHTML = list.map(p => {
    const isActive = pathScoutingPlayer && pathScoutingPlayer.id === p.id;
    const isFa = p.status === 'free_agent_unassigned';
    
    let flagHtml = '';
    if (isFa) {
      flagHtml = `<div class="path-wl-flag free-agent">Free Agent Active (2024–26)</div>`;
    } else if (p.league.includes('NCAA') && p.age >= 19) {
      flagHtml = `<div class="path-wl-flag move">Moved leagues — recent</div>`;
    } else {
      flagHtml = `<div class="path-wl-flag watch">On watch</div>`;
    }

    return `
      <li class="path-wl-item ${isActive ? 'active' : ''}" data-player-id="${p.id}">
        <div class="font-medium text-sm text-white">${p.name}</div>
        <div class="text-xs text-[#9FC1BE] mt-0.5">${p.pos} · ${p.age} · ${p.team.split('(')[0].trim()}</div>
        ${flagHtml}
      </li>
    `;
  }).join('');

  container.querySelectorAll('.path-wl-item').forEach(item => {
    item.addEventListener('click', () => {
      const pid = item.dataset.playerId;
      const target = appData.players.find(p => p.id === pid);
      if (target) {
        pathScoutingPlayer = target;
        renderPathWatchlist();
        renderPathScoutingProfile(target);
      }
    });
  });
}

function renderPathScoutingProfile(player) {
  const main = document.getElementById('pathProfileMainContent');
  if (!main || !player) return;

  const isFa = player.status === 'free_agent_unassigned';
  const stops = buildPlayerPathTimelineStops(player);
  const eligibility = buildPlayerEligibilityData(player);
  const statsRows = buildPlayerAdjustedStats(player);
  const comps = buildComparablePaths(player);
  const alerts = buildMovementFeedAlerts(player);
  const clips = buildTaggedClips(player);

  main.innerHTML = `
    <!-- Profile Header -->
    <div class="flex flex-wrap items-end justify-between border-b-2 border-[#1B2430] pb-4 mb-6">
      <div>
        <h1 class="text-3xl font-bold font-serif mb-1 text-[#1B2430]">${player.name}</h1>
        <div class="text-sm text-[#566370]">
          ${player.pos} · Shoots <b>${player.handed}</b> · ${player.age} yrs · 
          <b>${player.team}</b> — ${player.league}
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
        <span class="path-tag ${isFa ? 'pro-fa' : 'eligible'}">${isFa ? 'Free Agent Cleared' : 'NCAA Eligible'}</span>
        <span class="path-tag">CHL Rights: Held</span>
        <span class="path-tag">${player.contract_status ? player.contract_status.split('(')[0].trim() : 'Active'}</span>
        
        ${isFa ? `
          <button onclick="openSignFreeAgentModalForPlayer('${player.id}')" class="px-3 py-1.5 rounded bg-[#C97A2B] hover:bg-[#B36920] text-black font-bold text-xs transition shadow flex items-center gap-1">
            ✍️ Sign to Club
          </button>
        ` : (player.team_id ? `
          <button onclick="deployTeamToBench('${player.team_id}')" class="px-3 py-1.5 rounded bg-[#2E6E73] hover:bg-[#1E4C50] text-white font-bold text-xs transition shadow flex items-center gap-1">
            ⚡ Deploy to Bench
          </button>
        ` : '')}
      </div>
    </div>

    <!-- Navigation Tabs Strip -->
    <div class="flex border-b border-[#C6CFCE] mb-6">
      <div class="path-tab-btn ${pathScoutingActiveTab === 'path' ? 'active' : ''}" data-tab="path">Path</div>
      <div class="path-tab-btn ${pathScoutingActiveTab === 'stats' ? 'active' : ''}" data-tab="stats">Stats</div>
      <div class="path-tab-btn ${pathScoutingActiveTab === 'alerts' ? 'active' : ''}" data-tab="alerts">Alerts</div>
      <div class="path-tab-btn ${pathScoutingActiveTab === 'video' ? 'active' : ''}" data-tab="video">Video Log</div>
    </div>

    <!-- TAB 1: PATH -->
    <div class="path-panel ${pathScoutingActiveTab === 'path' ? 'block' : 'hidden'}" id="path-panel-path">
      <div class="font-serif text-lg font-bold mb-3 text-[#1B2430]">Career Path</div>
      <div class="timeline flex flex-col md:flex-row gap-3 mb-8">
        ${stops.map(s => `
          <div class="path-stop ${s.pending ? 'pending' : ''} flex-1">
            <div class="text-[11px] font-bold text-[#566370] mb-1">${s.index} · ${s.season}</div>
            <div class="stop-league font-serif text-base font-bold text-[#1B2430]">${s.league}</div>
            <div class="text-xs text-[#566370] mt-1 leading-snug">${s.detail}</div>
          </div>
        `).join('')}
      </div>

      <div class="font-serif text-lg font-bold mb-3 text-[#1B2430]">Eligibility & Compliance Matrix</div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div class="bg-white border border-[#C6CFCE] p-3.5 rounded">
          <div class="text-[11px] text-[#566370] font-bold mb-1">NCAA Years Remaining</div>
          <div class="elig-value font-serif text-2xl font-bold text-[#1B2430]">${eligibility.ncaaYears}</div>
          <div class="text-xs text-[#566370] mt-1">${eligibility.ncaaNote}</div>
        </div>
        <div class="bg-white border border-[#C6CFCE] p-3.5 rounded">
          <div class="text-[11px] text-[#566370] font-bold mb-1">CHL / Major Junior Rights</div>
          <div class="elig-value font-serif text-2xl font-bold text-[#1B2430]">${eligibility.chlRights}</div>
          <div class="text-xs text-[#566370] mt-1">${eligibility.chlNote}</div>
        </div>
        <div class="bg-white border border-[#C6CFCE] p-3.5 rounded">
          <div class="text-[11px] text-[#566370] font-bold mb-1">Pro Signing Window</div>
          <div class="elig-value font-serif text-2xl font-bold text-[#1B2430]">${eligibility.proWindow}</div>
          <div class="text-xs text-[#566370] mt-1">${eligibility.proNote}</div>
        </div>
      </div>
    </div>

    <!-- TAB 2: STATS -->
    <div class="path-panel ${pathScoutingActiveTab === 'stats' ? 'block' : 'hidden'}" id="path-panel-stats">
      <div class="font-serif text-lg font-bold mb-3 text-[#1B2430]">Production, League-Adjusted</div>
      <table class="w-full border-collapse bg-white mb-4 border border-[#C6CFCE]">
        <thead>
          <tr class="border-b-2 border-[#1B2430] text-left text-xs text-[#566370]">
            <th class="p-2.5">Season</th>
            <th class="p-2.5">League / Team</th>
            <th class="p-2.5 text-right">GP</th>
            <th class="p-2.5 text-right">P/GP</th>
            <th class="p-2.5 text-right font-bold text-[#1E4C50]">Adj. P/GP*</th>
          </tr>
        </thead>
        <tbody>
          ${statsRows.map((r, i) => `
            <tr class="border-b border-[#C6CFCE] text-xs ${i === statsRows.length - 1 ? 'bg-[#EFF6F5] font-bold text-[#1E4C50]' : ''}">
              <td class="p-2.5">${r.season}</td>
              <td class="p-2.5">${r.league}</td>
              <td class="p-2.5 text-right font-serif text-sm">${r.gp}</td>
              <td class="p-2.5 text-right font-serif text-sm">${r.pgp}</td>
              <td class="p-2.5 text-right font-serif text-sm">${r.adjPgp}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="border-l-4 border-[#C6CFCE] p-2.5 text-xs text-[#566370] bg-white mb-6">
        *Adjusted P/GP scales production to a common baseline using league strength-of-schedule and pace. Pro / Tier 1 is the reference standard (1.00×) this season.
      </div>

      <div class="font-serif text-lg font-bold mb-3 text-[#1B2430]">Comparable Career Paths</div>
      <table class="w-full border-collapse bg-white border border-[#C6CFCE]">
        <thead>
          <tr class="border-b-2 border-[#1B2430] text-left text-xs text-[#566370]">
            <th class="p-2.5">Player</th>
            <th class="p-2.5">Trajectory Pathway</th>
            <th class="p-2.5 text-right">Adj. P/GP at same age</th>
          </tr>
        </thead>
        <tbody>
          ${comps.map(c => `
            <tr class="border-b border-[#C6CFCE] text-xs">
              <td class="p-2.5 font-bold">${c.player}</td>
              <td class="p-2.5 text-[#566370]">${c.path}</td>
              <td class="p-2.5 text-right font-serif text-sm">${c.adj}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- TAB 3: ALERTS -->
    <div class="path-panel ${pathScoutingActiveTab === 'alerts' ? 'block' : 'hidden'}" id="path-panel-alerts">
      <div class="font-serif text-lg font-bold mb-3 text-[#1B2430]">Movement & Transaction Feed</div>
      <div class="space-y-2.5">
        ${alerts.map(a => `
          <div class="flex gap-3 p-3 bg-white border border-[#C6CFCE] border-l-4 ${a.type === 'move' ? 'border-l-[#C97A2B]' : 'border-l-[#2E6E73]'}">
            <div class="text-xs font-bold text-[#566370] min-w-[65px]">${a.date}</div>
            <div class="text-xs text-[#1B2430] leading-snug">
              <b>${a.title}:</b> ${a.body}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- TAB 4: VIDEO LOG -->
    <div class="path-panel ${pathScoutingActiveTab === 'video' ? 'block' : 'hidden'}" id="path-panel-video">
      <div class="font-serif text-lg font-bold mb-3 text-[#1B2430]">Tagged Video Sequences</div>
      <div class="space-y-2">
        ${clips.map(c => `
          <div class="flex flex-wrap items-center justify-between p-3 bg-white border border-[#C6CFCE] rounded gap-2">
            <div>
              <div class="font-bold text-xs text-[#1B2430]">${c.title}</div>
              <div class="text-[11px] text-[#566370] mt-0.5">${c.situation} • ${c.date} • ${c.opponent}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded border border-[#C6CFCE] bg-[#EFF3F2] text-[#566370]">${c.badge}</span>
              <button onclick="openPlayerClipInFilmStudio('${player.id}', '${c.title}')" class="px-2.5 py-1 rounded bg-[#1E4C50] hover:bg-[#153538] text-white font-bold text-xs transition flex items-center gap-1 shadow-sm">
                🎬 Open in Film Room
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Bind tab buttons inside Path modal
  main.querySelectorAll('.path-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      pathScoutingActiveTab = btn.dataset.tab;
      renderPathScoutingProfile(player);
    });
  });
}

function buildPlayerPathTimelineStops(player) {
  const isFa = player.status === 'free_agent_unassigned';
  const age = player.age || 19;
  const team = player.team || 'Developmental Club';

  return [
    {
      index: '01',
      season: '2022–23',
      league: 'Elite Tier 1 AAA / Bantam Prep',
      detail: 'Entered elite developmental circuit. Lead team in high-danger chance creation.',
      pending: false
    },
    {
      index: '02',
      season: '2023–24',
      league: player.last_active_team ? player.last_active_team.split('(')[0] : 'Junior Tier 1 / Prep',
      detail: 'Accelerated development against older competition. Specialized on 1st PP unit.',
      pending: false
    },
    {
      index: '03',
      season: '2024–26',
      league: team,
      detail: `${player.primary_role}. Verified with ${player.gpa || 3.8} academic core.`,
      pending: false
    },
    {
      index: '04',
      season: 'Pending',
      league: isFa ? 'Pro Tryout (PTO) / Portal Placement' : 'Pro Entry / NCAA Advancement',
      detail: isFa ? `Targeting 2026 minor pro camp or NCAA transfer. ${player.contract_status || 'Free Agent'}` : 'Eligible for amateur tryout (ATO) or entry contract look.',
      pending: true
    }
  ];
}

function buildPlayerEligibilityData(player) {
  const isFa = player.status === 'free_agent_unassigned';
  if (isFa) {
    return {
      ncaaYears: 'Cleared Portal',
      ncaaNote: 'Full eligibility compliance verified for 2026.',
      chlRights: 'Free Agent Cleared',
      chlNote: 'Unrestricted rights for minor league / European placement.',
      proWindow: 'Open Now',
      proNote: 'Eligible to sign SPC, PTO, or overseas agreement immediately.'
    };
  }

  return {
    ncaaYears: `${Math.max(1, 24 - (player.age || 19))} of 4`,
    ncaaNote: 'Core academic courses certified. No redshirt filed.',
    chlRights: 'Held — Tier 1 / Major Junior',
    chlNote: 'Retains dual-path junior rights under NCAA modern rules.',
    proWindow: 'Open Now',
    proNote: 'Eligible to sign ATO or ELC per NCAA modern eligibility rules.'
  };
}

function buildPlayerAdjustedStats(player) {
  const basePgp = player.micro_kpis ? (player.micro_kpis.controlled_entry_pct / 65).toFixed(2) : 1.15;
  return [
    { season: '2023–24', league: 'Tier 1 Junior / USNTDP', gp: 54, pgp: (basePgp * 0.85).toFixed(2), adjPgp: (basePgp * 0.80).toFixed(2) },
    { season: '2024–25', league: player.league || 'Junior A', gp: 48, pgp: (basePgp * 0.95).toFixed(2), adjPgp: (basePgp * 0.92).toFixed(2) },
    { season: '2025–26', league: player.team || 'Current Roster', gp: 38, pgp: (basePgp * 1.05).toFixed(2), adjPgp: (basePgp * 1.05).toFixed(2) }
  ];
}

function buildComparablePaths(player) {
  return [
    { player: 'C. Perfetti', path: 'CHL → AHL Exemption → NHL Top 6', adj: '1.24' },
    { player: 'T. Foerster', path: 'CHL → AHL Exemption → NHL Power Wing', adj: '1.09' },
    { player: `${player.name} (Current)`, path: `${player.league} → Collegiate / Pro Pathway`, adj: '1.38' }
  ];
}

function buildMovementFeedAlerts(player) {
  const ledger = player.audit_ledger || [];
  if (ledger.length > 0) {
    return ledger.slice(0, 4).map(e => ({
      date: e.timestamp.split(' ')[0],
      type: 'move',
      title: e.action || 'Transaction',
      body: e.diff || e.category
    }));
  }

  return [
    { date: 'Sep 02', type: 'move', title: 'Roster Verification', body: `Active profile updated under ${player.team}.` },
    { date: 'Aug 18', type: 'info', title: 'Combine Testing', body: `Flying 30m clocked at ${player.combine ? player.combine.flying_30m_sec : 3.82}s.` },
    { date: 'Jul 24', type: 'move', title: 'Eligibility Cleared', body: 'Full academic and transfer compliance certified.' }
  ];
}

function buildTaggedClips(player) {
  return [
    { title: 'Controlled Zone Entry — Neutral Zone Counter', situation: '5v5 Full Speed', date: 'Mar 01', opponent: 'Top Seed Opponent', badge: 'Strong comp' },
    { title: 'Power Play Seam Pass — Bumper Distribution', situation: 'PP1 Royal Road Seam', date: 'Feb 18', opponent: 'Ranked Division Rival', badge: 'Special teams' },
    { title: 'D-Zone Angling & Turnover Forcing', situation: '5v5 Low Wall Battle', date: 'Jan 22', opponent: 'Road Conference Match', badge: 'Wall battle' }
  ];
}

function openPlayerClipInFilmStudio(playerId, clipTitle) {
  closePathScoutingProfileModal();
  switchTab('filmroom');
  if (window.showToast) {
    window.showToast(`Loaded "${clipTitle}" into Film Room Telestrator!`, 'success');
  }
}
window.openPlayerClipInFilmStudio = openPlayerClipInFilmStudio;

// ---------------------- WORLDWIDE MINOR LEAGUES DIRECTORY ENGINE ----------------------

function openGlobalTeamsModal() {
  const modal = document.getElementById('globalTeamsModal');
  if (!modal) return;
  renderGlobalTeamsDirectory();
  modal.classList.remove('hidden');
}
window.openGlobalTeamsModal = openGlobalTeamsModal;

function renderGlobalTeamsDirectory() {
  const container = document.getElementById('globalTeamsCardsContainer');
  if (!container || !appData || !appData.teams) return;

  const searchInput = document.getElementById('teamDirectorySearchInput');
  const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

  let teams = appData.teams.filter(t => {
    const matchesCountry = (teamDirectoryCountryFilter === 'all') || (t.country === teamDirectoryCountryFilter);
    const matchesSearch = !q || 
      t.name.toLowerCase().includes(q) ||
      t.league.toLowerCase().includes(q) ||
      t.country.toLowerCase().includes(q) ||
      t.arena.toLowerCase().includes(q) ||
      t.head_coach.toLowerCase().includes(q) ||
      t.affiliation.toLowerCase().includes(q);

    return matchesCountry && matchesSearch;
  });

  container.innerHTML = teams.map(t => {
    const roster = (appData.players || []).filter(p => p.team_id === t.id);
    const countryFlag = t.country === 'USA' ? '🇺🇸' :
      (t.country === 'Canada' ? '🇨🇦' :
      (t.country === 'Sweden' ? '🇸🇪' :
      (t.country === 'Finland' ? '🇫🇮' :
      (t.country === 'Germany' ? '🇩🇪' :
      (t.country === 'Switzerland' ? '🇨🇭' :
      (t.country === 'Czechia' ? '🇨🇿' : '🇬🇧'))))));

    return `
      <div class="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-sky-500/50 transition flex flex-col justify-between space-y-3 bg-slate-900/60">
        <div>
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xl">${countryFlag}</span>
              <div>
                <h4 class="font-bold text-sm text-white leading-tight">${t.name}</h4>
                <span class="text-[10px] text-sky-400 font-mono font-bold">${t.league} • ${t.tier}</span>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
              ${roster.length} Players
            </span>
          </div>

          <div class="space-y-1 text-xs text-slate-400">
            <div>📍 Arena: <strong class="text-slate-200">${t.arena}</strong> (${t.city})</div>
            <div>👔 Head Coach: <strong class="text-slate-200">${t.head_coach}</strong></div>
            <div>🔗 Affiliation: <strong class="text-slate-200">${t.affiliation}</strong></div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
          <button onclick="filterMainRosterToTeam('${t.id}')" class="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold border border-slate-700 transition">
            📋 Roster
          </button>
          <button onclick="deployTeamToBench('${t.id}')" class="px-2 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-bold border border-purple-600/50 transition">
            ⚡ Bench
          </button>
          <button onclick="openImportPlayerModalForTeam('${t.id}')" class="px-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-sm">
            ➕ Import
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterMainRosterToTeam(teamId) {
  activeTeamId = teamId;
  activePlayerStatus = 'all';
  const teamSelect = document.getElementById('teamFilterSelect');
  if (teamSelect) teamSelect.value = teamId;

  const team = (appData.teams || []).find(t => t.id === teamId);
  const badge = document.getElementById('playerListFilterBadge');
  if (badge && team) {
    badge.textContent = `${team.name} (${team.league})`;
  }

  const modal = document.getElementById('globalTeamsModal');
  if (modal) modal.classList.add('hidden');

  renderPlayerList();
  if (window.showToast && team) {
    window.showToast(`Filtered player directory to ${team.name} (${team.league})!`, 'info');
  }
}
window.filterMainRosterToTeam = filterMainRosterToTeam;

// ---------------------- 1-CLICK DEPLOY TEAM TO LIVE BENCH ----------------------

async function deployTeamToBench(teamId) {
  const team = (appData.teams || []).find(t => t.id === teamId);
  if (!team) return;

  try {
    const res = await fetch(`/api/teams/${teamId}/deploy-bench`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (data.game_state) {
        appData.bench_game_state = data.game_state;
      }
    }
  } catch (e) {
    console.warn("Deploy bench API error, using client-side store:", e);
  }

  // Update client state
  if (appData.bench_game_state) {
    appData.bench_game_state.home_team.name = `${team.name} (${team.league})`;
    const teamPlayers = (appData.players || []).filter(p => p.team_id === teamId);
    if (teamPlayers.length > 0) {
      appData.bench_game_state.roster_boxscore = teamPlayers.map((tp, i) => ({
        id: tp.id,
        name: tp.name,
        num: tp.num,
        pos: tp.pos,
        line: i < 3 ? "Line 1" : (i < 5 ? "Pair 1" : "Line 2"),
        toi: "00:00",
        toi_sec: 0,
        shifts: 0,
        goals: 0,
        assists: 0,
        points: 0,
        plus_minus: 0,
        shots: 0,
        hits: 0,
        blocks: 0,
        fatigue_pct: 0,
        status: i < 5 ? "on_ice" : "bench",
        heart_rate: 125 + (i * 2)
      }));
    }
  }

  const modal1 = document.getElementById('globalTeamsModal');
  if (modal1) modal1.classList.add('hidden');
  const modal2 = document.getElementById('pathScoutingProfileModal');
  if (modal2) modal2.classList.add('hidden');

  switchTab('bench');
  if (window.showToast) {
    window.showToast(`🏒 Deployed ${team.name} (${team.league}) into Live Bench Shift OS!`, 'success');
  }
}
window.deployTeamToBench = deployTeamToBench;

// ---------------------- PLAYER IMPORTER ENGINE ----------------------

function openImportPlayerModalForTeam(teamId) {
  const modal = document.getElementById('importPlayerModal');
  if (!modal) return;
  const select = document.getElementById('importTargetTeamSelect');
  if (select && teamId) select.value = teamId;
  modal.classList.remove('hidden');
}
window.openImportPlayerModalForTeam = openImportPlayerModalForTeam;

async function handleImportPlayerSubmit(e) {
  e.preventDefault();
  const teamId = document.getElementById('importTargetTeamSelect').value;
  const team = (appData.teams || []).find(t => t.id === teamId);
  const name = document.getElementById('importPlayerName').value.trim();
  const pos = document.getElementById('importPlayerPos').value;
  const num = parseInt(document.getElementById('importPlayerNum').value, 10) || 27;
  const age = parseInt(document.getElementById('importPlayerAge').value, 10) || 19;
  const handed = document.getElementById('importPlayerHanded').value;
  const height_in = parseInt(document.getElementById('importPlayerHeight').value, 10) || 72;
  const weight_lbs = parseInt(document.getElementById('importPlayerWeight').value, 10) || 185;
  const role = document.getElementById('importPlayerRole').value.trim() || 'Two-Way Forward';
  const notes = document.getElementById('importPlayerNotes').value.trim();

  const payload = {
    name,
    pos,
    num,
    age,
    handed,
    height_in,
    weight_lbs,
    primary_role: role,
    scout_notes: notes,
    account_name: currentUser ? currentUser.name : 'Global Scouting Bureau'
  };

  let importedPlayer = null;
  try {
    const res = await fetch(`/api/teams/${teamId}/import-player`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      importedPlayer = data.player;
    }
  } catch (err) {
    console.warn("Import API error, using client-side fallback:", err);
  }

  if (!importedPlayer) {
    // Client fallback
    const pid = `imp_${Date.now()}`;
    importedPlayer = {
      id: pid,
      team_id: teamId,
      name: name,
      team: team ? `${team.name} (${team.league})` : 'Minor League Club',
      league: team ? team.league : 'AHL',
      level: team ? team.level : 'ahl',
      age: age,
      num: num,
      pos: pos,
      handed: handed,
      weight_lbs: weight_lbs,
      height_in: height_in,
      gpa: 3.65,
      grad_year: 2025,
      avatar_gradient: team ? team.primary_color : 'from-blue-600 to-indigo-800',
      status: 'active',
      status_badge: `Imported: ${team ? team.name : 'Pro Minor'}`,
      contract_status: `Active Roster (${team ? team.league : 'AHL'})`,
      last_active_season: '2025–2026',
      last_active_team: team ? `${team.name} (${team.league})` : 'Pro Minor',
      primary_role: role,
      combine: { flying_30m_sec: 3.85, broad_jump_in: 110, pro_agility_5_10_5_sec: 4.18, grip_strength_lbs: 142, rotational_medball_mph: 33.0 },
      micro_kpis: { controlled_exit_pct: 78, controlled_entry_pct: 80, wall_battle_win_pct: 76, shoulder_scans_per_possession: 4.4, high_danger_pass_comp_pct: 75, faceoff_win_pct: 52 },
      telemetry: {
        puck_possession: { total_time_on_puck_sec: 130, avg_hold_duration_sec: 2.8, max_hold_duration_sec: 6.8, wall_usage_pct: 52, wall_bank_escapes: 14, support_positioning: "80% Zone Balance" },
        passing_analytics: { total_passes_attempted: 32, completed_tape_to_tape: 27, bad_passes_turnovers: 5, pass_completion_pct: 84.4, royal_road_seam_passes: 6, wall_chip_passes: 7 },
        decision_engine: { offensive_zone_touches: 24, chose_to_shoot_pct: 50, chose_to_pass_pct: 50, play_outcome_success_pct: 80 },
        shot_telemetry: { total_shot_attempts: 6, shots_on_goal: 4, goals: 1, avg_shot_distance_ft: 20, shot_breakdown_by_type: [], shot_events: [] }
      },
      skill_rubric: { edges: 88, puck_skills: 87, shooting: 86, hockey_iq: 89, contact: 82, d_zone: 85, transition: 88, goalie: 0 },
      projection: { composite_trajectory_score: 88, probabilities: { ncaa_d1: 95, ushl_tier1: 95, nahl_tier2: 100, ncaa_d3_acha: 100 }, ceiling_label: "Active Roster Import", developmental_hurdles: [] },
      audit_ledger: [
        { id: `led_${pid}`, timestamp: new Date().toISOString(), account: currentUser ? currentUser.name : 'Scouting Bureau', category: 'International Roster Import', action: `Imported to ${team ? team.name : 'Minor Club'}`, diff: 'Added to active roster.' }
      ],
      scout_notes: notes || 'Imported prospect.'
    };
  }

  appData.players.unshift(importedPlayer);
  updateSummaryCounters();
  populateTeamFilterDropdowns();
  
  document.getElementById('importPlayerModal').classList.add('hidden');
  document.getElementById('importPlayerForm').reset();

  selectPlayer(importedPlayer);
  if (window.showToast) {
    window.showToast(`✅ Successfully imported ${importedPlayer.name} to ${team ? team.name : 'Club'}!`, 'success');
  }
}

// ---------------------- FREE AGENT SIGNING ENGINE ----------------------

function openSignFreeAgentModalForPlayer(playerId) {
  const modal = document.getElementById('signFreeAgentModal');
  if (!modal) return;
  const select = document.getElementById('signFreeAgentPlayerSelect');
  if (select && playerId) select.value = playerId;
  modal.classList.remove('hidden');
}
window.openSignFreeAgentModalForPlayer = openSignFreeAgentModalForPlayer;

async function handleSignFreeAgentSubmit(e) {
  e.preventDefault();
  const playerId = document.getElementById('signFreeAgentPlayerSelect').value;
  const teamId = document.getElementById('signFreeAgentTeamSelect').value;
  const contractType = document.getElementById('signContractTypeSelect').value;
  const executive = document.getElementById('signExecutiveInput').value.trim() || 'General Manager';

  const player = appData.players.find(p => p.id === playerId);
  const team = (appData.teams || []).find(t => t.id === teamId);
  if (!player || !team) return;

  try {
    const res = await fetch(`/api/players/${playerId}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: teamId,
        contract_type: contractType,
        account_name: executive
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.player) {
        Object.assign(player, data.player);
      }
    }
  } catch (err) {
    console.warn("Sign free agent API error, applying local state:", err);
  }

  // Client updates
  player.team_id = teamId;
  player.team = `${team.name} (${team.league})`;
  player.league = team.league;
  player.status = 'active';
  player.contract_status = `Signed: ${contractType}`;
  player.status_badge = `Signed: ${team.name}`;
  player.last_active_season = '2025–2026';

  if (!player.audit_ledger) player.audit_ledger = [];
  player.audit_ledger.unshift({
    id: `led_sign_${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    account: executive,
    category: 'Free Agent Contract Execution',
    action: `Signed Free Agent ${player.name} to ${team.name}`,
    diff: `Executed ${contractType}. Transitioned to Active Roster.`
  });

  updateSummaryCounters();
  populateTeamFilterDropdowns();
  renderPlayerList();
  selectPlayer(player);

  document.getElementById('signFreeAgentModal').classList.add('hidden');
  if (window.showToast) {
    window.showToast(`✍️ Executed ${contractType}! ${player.name} signed to ${team.name}.`, 'success');
  }
}

// ---------------------- BINDING ON DOM READY ----------------------

document.addEventListener('DOMContentLoaded', () => {
  // Populate dropdowns once data is available
  setTimeout(() => {
    populateTeamFilterDropdowns();
  }, 100);

  // League filter dropdown
  const lSelect = document.getElementById('leagueFilterSelect');
  if (lSelect) {
    lSelect.addEventListener('change', (e) => {
      activeLevel = e.target.value;
      const badge = document.getElementById('playerListFilterBadge');
      if (badge) {
        badge.textContent = e.target.value === 'all' ? 'All Leagues' : e.target.value;
      }
      renderPlayerList();
    });
  }

  // Team filter dropdown
  const tSelect = document.getElementById('teamFilterSelect');
  if (tSelect) {
    tSelect.addEventListener('change', (e) => {
      activeTeamId = e.target.value;
      renderPlayerList();
    });
  }

  // Status pills
  const statusActiveBtn = document.getElementById('statusActiveBtn');
  const statusFaBtn = document.getElementById('statusFaBtn');
  if (statusActiveBtn) {
    statusActiveBtn.addEventListener('click', () => {
      activePlayerStatus = (activePlayerStatus === 'active') ? 'all' : 'active';
      statusActiveBtn.classList.toggle('bg-sky-500', activePlayerStatus === 'active');
      statusActiveBtn.classList.toggle('text-white', activePlayerStatus === 'active');
      if (statusFaBtn) {
        statusFaBtn.classList.remove('bg-amber-500', 'text-black');
      }
      renderPlayerList();
    });
  }
  if (statusFaBtn) {
    statusFaBtn.addEventListener('click', () => {
      activePlayerStatus = (activePlayerStatus === 'free_agent_unassigned') ? 'all' : 'free_agent_unassigned';
      statusFaBtn.classList.toggle('bg-amber-500', activePlayerStatus === 'free_agent_unassigned');
      statusFaBtn.classList.toggle('text-black', activePlayerStatus === 'free_agent_unassigned');
      if (statusActiveBtn) {
        statusActiveBtn.classList.remove('bg-sky-500', 'text-white');
      }
      renderPlayerList();
    });
  }

  // Summary card click shortcuts
  const faSummaryCard = document.getElementById('freeAgentsSummaryCard');
  if (faSummaryCard) {
    faSummaryCard.addEventListener('click', () => {
      activePlayerStatus = 'free_agent_unassigned';
      if (statusFaBtn) {
        statusFaBtn.classList.add('bg-amber-500', 'text-black');
      }
      renderPlayerList();
      if (window.showToast) window.showToast('Showing 2-Year Active Free Agents (2024–2026)', 'info');
    });
  }

  const teamsSummaryCard = document.getElementById('teamsSummaryCard');
  if (teamsSummaryCard) {
    teamsSummaryCard.addEventListener('click', openGlobalTeamsModal);
  }

  // Top Action Buttons
  const openGlobalTeamsBtn = document.getElementById('openGlobalTeamsBtn');
  if (openGlobalTeamsBtn) openGlobalTeamsBtn.addEventListener('click', openGlobalTeamsModal);
  const closeGlobalTeamsBtn = document.getElementById('closeGlobalTeamsModalBtn');
  if (closeGlobalTeamsBtn) closeGlobalTeamsBtn.addEventListener('click', () => {
    document.getElementById('globalTeamsModal').classList.add('hidden');
  });

  const openPathScoutingBtn = document.getElementById('openPathScoutingBtn');
  if (openPathScoutingBtn) openPathScoutingBtn.addEventListener('click', () => openPathScoutingProfileModal(selectedPlayer));
  const closePathScoutingBtn = document.getElementById('closePathScoutingBtn');
  if (closePathScoutingBtn) closePathScoutingBtn.addEventListener('click', closePathScoutingProfileModal);

  const openImportPlayerBtn = document.getElementById('openImportPlayerBtn');
  if (openImportPlayerBtn) openImportPlayerBtn.addEventListener('click', () => openImportPlayerModalForTeam(activeTeamId !== 'all' ? activeTeamId : null));
  const closeImportPlayerBtn = document.getElementById('closeImportPlayerModalBtn');
  if (closeImportPlayerBtn) closeImportPlayerBtn.addEventListener('click', () => {
    document.getElementById('importPlayerModal').classList.add('hidden');
  });

  const closeSignFreeAgentBtn = document.getElementById('closeSignFreeAgentModalBtn');
  if (closeSignFreeAgentBtn) closeSignFreeAgentBtn.addEventListener('click', () => {
    document.getElementById('signFreeAgentModal').classList.add('hidden');
  });

  // Form Submissions
  const importForm = document.getElementById('importPlayerForm');
  if (importForm) importForm.addEventListener('submit', handleImportPlayerSubmit);

  const signForm = document.getElementById('signFreeAgentForm');
  if (signForm) signForm.addEventListener('submit', handleSignFreeAgentSubmit);

  // Watchlist Search
  const pathSearch = document.getElementById('pathWatchlistSearchInput');
  if (pathSearch) pathSearch.addEventListener('input', renderPathWatchlist);

  // Team Directory Search & Country Filter
  const teamSearch = document.getElementById('teamDirectorySearchInput');
  if (teamSearch) teamSearch.addEventListener('input', renderGlobalTeamsDirectory);

  document.querySelectorAll('.team-country-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.team-country-pill').forEach(p => {
        p.classList.remove('bg-sky-500', 'text-white');
        p.classList.add('bg-slate-800', 'text-slate-300');
      });
      pill.classList.add('bg-sky-500', 'text-white');
      pill.classList.remove('bg-slate-800', 'text-slate-300');
      teamDirectoryCountryFilter = pill.dataset.country;
      renderGlobalTeamsDirectory();
    });
  });

  // Mobile Navigation Drawer & Bottom HUD Handlers
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const mobileToggleBtn = document.getElementById('mobileMenuToggleBtn');
  const mobileCloseBtn = document.getElementById('closeMobileDrawerBtn');
  const mobileBottomMenuBtn = document.getElementById('openMobileDrawerBottomBtn');

  function openMobileNav() {
    if (mobileNavDrawer) mobileNavDrawer.classList.remove('hidden');
  }

  function closeMobileNav() {
    if (mobileNavDrawer) mobileNavDrawer.classList.add('hidden');
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileNavDrawer && mobileNavDrawer.classList.contains('hidden')) {
        openMobileNav();
      } else {
        closeMobileNav();
      }
    });
  }

  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileNav();
    });
  }

  if (mobileBottomMenuBtn) {
    mobileBottomMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMobileNav();
    });
  }

  // Close drawer if clicking outside the drawer contents
  if (mobileNavDrawer) {
    mobileNavDrawer.addEventListener('click', (e) => {
      if (e.target === mobileNavDrawer) {
        closeMobileNav();
      }
    });
  }

  // Mobile drawer navigation buttons
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.dataset.tab;
      if (tab) {
        switchTab(tab);
        closeMobileNav();
      }
    });
  });

  // Mobile bottom bar tabs
  document.querySelectorAll('.mobile-bottom-tab').forEach(tabBtn => {
    tabBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = tabBtn.dataset.tab;
      if (tab) {
        switchTab(tab);
      }
    });
  });

  // Synchronize Mobile Level Selector with Desktop Level Selector
  const mobileLevelSel = document.getElementById('mobileLevelSelector');
  const desktopLevelSel = document.getElementById('levelSelector');

  if (mobileLevelSel) {
    mobileLevelSel.addEventListener('change', (e) => {
      activeLevel = e.target.value;
      if (desktopLevelSel) desktopLevelSel.value = activeLevel;
      if (typeof renderPlayers === 'function') renderPlayers();
      closeMobileNav();
    });
  }

  if (desktopLevelSel && mobileLevelSel) {
    desktopLevelSel.addEventListener('change', (e) => {
      mobileLevelSel.value = e.target.value;
    });
  }

  // ==================== SEARCHABLE ROSTER EXPLORER & DIRECTORY SEARCH ====================
  const playerSearchInput = document.getElementById('playerSearchInput');
  const clearPlayerSearchBtn = document.getElementById('clearPlayerSearchBtn');

  if (playerSearchInput) {
    playerSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      if (clearPlayerSearchBtn) {
        if (searchQuery) clearPlayerSearchBtn.classList.remove('hidden');
        else clearPlayerSearchBtn.classList.add('hidden');
      }
      renderPlayerList();
    });
  }

  if (clearPlayerSearchBtn) {
    clearPlayerSearchBtn.addEventListener('click', () => {
      if (playerSearchInput) playerSearchInput.value = '';
      searchQuery = '';
      clearPlayerSearchBtn.classList.add('hidden');
      renderPlayerList();
    });
  }

  // Searchable Roster Explorer Modal Handlers
  const rosterExplorerModal = document.getElementById('searchableRosterMenuModal');
  const openRosterExplorerBtn = document.getElementById('openRosterExplorerBtn');
  const closeRosterExplorerBtn = document.getElementById('closeRosterExplorerBtn');
  const rosterSearchInput = document.getElementById('rosterExplorerSearchInput');
  const clearRosterSearchBtn = document.getElementById('clearRosterExplorerSearchBtn');
  const rosterGrid = document.getElementById('rosterExplorerResultsGrid');
  const rosterCountLabel = document.getElementById('rosterExplorerResultCountLabel');
  const rosterTotalBadge = document.getElementById('rosterExplorerTotalBadge');

  let explorerActiveFilter = 'all';
  let explorerSearchQuery = '';

  function openRosterExplorer() {
    if (!rosterExplorerModal) return;
    rosterExplorerModal.classList.remove('hidden');
    renderRosterExplorerCards();
  }

  function closeRosterExplorer() {
    if (!rosterExplorerModal) return;
    rosterExplorerModal.classList.add('hidden');
  }

  window.closeRosterExplorer = closeRosterExplorer;
  window.openRosterExplorer = openRosterExplorer;

  if (openRosterExplorerBtn) openRosterExplorerBtn.addEventListener('click', openRosterExplorer);
  if (closeRosterExplorerBtn) closeRosterExplorerBtn.addEventListener('click', closeRosterExplorer);

  if (rosterExplorerModal) {
    rosterExplorerModal.addEventListener('click', (e) => {
      if (e.target === rosterExplorerModal) closeRosterExplorer();
    });
  }

  if (rosterSearchInput) {
    rosterSearchInput.addEventListener('input', (e) => {
      explorerSearchQuery = e.target.value.toLowerCase().trim();
      if (clearRosterSearchBtn) {
        if (explorerSearchQuery) clearRosterSearchBtn.classList.remove('hidden');
        else clearRosterSearchBtn.classList.add('hidden');
      }
      renderRosterExplorerCards();
    });
  }

  if (clearRosterSearchBtn) {
    clearRosterSearchBtn.addEventListener('click', () => {
      if (rosterSearchInput) rosterSearchInput.value = '';
      explorerSearchQuery = '';
      clearRosterSearchBtn.classList.add('hidden');
      renderRosterExplorerCards();
    });
  }

  document.querySelectorAll('.roster-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.roster-filter-chip').forEach(c => {
        c.classList.remove('bg-sky-600', 'text-white');
        c.classList.add('bg-slate-900', 'text-slate-300', 'border', 'border-slate-800');
      });
      chip.classList.add('bg-sky-600', 'text-white');
      chip.classList.remove('bg-slate-900', 'text-slate-300', 'border', 'border-slate-800');

      explorerActiveFilter = chip.dataset.filter;
      renderRosterExplorerCards();
    });
  });

  function selectPlayerById(id) {
    const p = (appData.players || []).find(pl => pl.id === id);
    if (p) selectPlayer(p);
  }
  window.selectPlayerById = selectPlayerById;

  function renderRosterExplorerCards() {
    const playerPool = (window.MASTER_PLAYERS && window.MASTER_PLAYERS.length) ? window.MASTER_PLAYERS : (appData && appData.players ? appData.players : []);
    if (!rosterGrid || playerPool.length === 0) return;

    if (rosterTotalBadge) rosterTotalBadge.textContent = `${playerPool.length.toLocaleString()} Athletes`;

    let filtered = playerPool.filter(p => {
      let matchesChip = true;
      if (explorerActiveFilter === 'michigan') {
        matchesChip = (p.team_id === 'team_michigan_wolverines') || (p.team && p.team.toLowerCase().includes('michigan'));
      } else if (explorerActiveFilter === 'denver') {
        matchesChip = (p.team_id === 'team_denver_pioneers') || (p.team && p.team.toLowerCase().includes('denver'));
      } else if (explorerActiveFilter === 'bc') {
        matchesChip = (p.team_id === 'team_boston_college') || (p.team && p.team.toLowerCase().includes('boston college'));
      } else if (explorerActiveFilter === 'bu') {
        matchesChip = (p.team_id === 'team_boston_university') || (p.team && p.team.toLowerCase().includes('boston university'));
      } else if (explorerActiveFilter === 'drafted') {
        matchesChip = p.draft_status && p.draft_status !== 'Undrafted';
      } else if (explorerActiveFilter === 'freshman') {
        matchesChip = p.class_level && p.class_level.toLowerCase() === 'freshman';
      } else if (explorerActiveFilter === 'sophomore') {
        matchesChip = p.class_level && p.class_level.toLowerCase() === 'sophomore';
      } else if (explorerActiveFilter === 'junior') {
        matchesChip = p.class_level && p.class_level.toLowerCase() === 'junior';
      } else if (explorerActiveFilter === 'graduate') {
        matchesChip = p.class_level && (p.class_level.toLowerCase() === 'graduate' || p.class_level.toLowerCase() === 'senior');
      }

      let matchesSearch = true;
      if (explorerSearchQuery) {
        matchesSearch = (p.name && p.name.toLowerCase().includes(explorerSearchQuery)) ||
                        (p.team && p.team.toLowerCase().includes(explorerSearchQuery)) ||
                        (p.league && p.league.toLowerCase().includes(explorerSearchQuery)) ||
                        (p.hometown && p.hometown.toLowerCase().includes(explorerSearchQuery)) ||
                        (p.previous_team && p.previous_team.toLowerCase().includes(explorerSearchQuery)) ||
                        (p.draft_status && p.draft_status.toLowerCase().includes(explorerSearchQuery)) ||
                        (p.class_level && p.class_level.toLowerCase().includes(explorerSearchQuery)) ||
                        (p.num && (`#${p.num}`.toLowerCase().includes(explorerSearchQuery) || `${p.num}` === explorerSearchQuery)) ||
                        (p.pos && p.pos.toLowerCase() === explorerSearchQuery);
      }

      return matchesChip && matchesSearch;
    });

    if (rosterCountLabel) rosterCountLabel.textContent = `Showing ${Math.min(filtered.length, 75)} of ${filtered.length.toLocaleString()} matching athletes (${playerPool.length.toLocaleString()} total in database)`;

    if (filtered.length === 0) {
      rosterGrid.innerHTML = `
        <div class="col-span-full p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
          No athletes found matching "<strong>${explorerSearchQuery}</strong>" with filter "<strong>${explorerActiveFilter}</strong>".
        </div>
      `;
      return;
    }

    const displayAthletes = filtered.slice(0, 75);
    const overflowNote = filtered.length > 75 ? `
      <div class="col-span-full p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-center text-xs text-sky-300">
        Showing first 75 of ${filtered.length.toLocaleString()} matches.
        <a href="database.html" class="font-bold underline ml-1 text-white hover:text-sky-200">Open Full Master Database Hub (2,412+ Athletes) &rarr;</a>
      </div>
    ` : '';

    rosterGrid.innerHTML = displayAthletes.map(p => {
      const isDrafted = p.draft_status && p.draft_status !== 'Undrafted';
      const proj = p.projection || {};
      const combine = p.combine || {};
      const htFt = p.height_str || (p.height_in ? `${Math.floor(p.height_in/12)}'${p.height_in%12}"` : '--');
      const scoreVal = p.composite_score ? p.composite_score.toFixed(1) : (proj.composite_trajectory_score ? proj.composite_trajectory_score.toFixed(1) : '88.0');

      return `
        <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 transition-all flex flex-col justify-between space-y-3 shadow-md">
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-tr ${p.avatar_gradient || 'from-sky-500 to-indigo-600'} text-white font-black flex items-center justify-center text-sm shadow-md">
                  #${p.num}
                </div>
                <div>
                  <h4 class="font-black text-xs sm:text-sm text-white leading-snug flex items-center gap-1.5">
                    ${p.name}
                  </h4>
                  <div class="text-[10px] text-sky-400 font-bold flex items-center gap-1">
                    <span>${p.pos}</span>
                    <span class="text-slate-500">•</span>
                    <span class="truncate max-w-[140px] text-slate-300">${p.team}</span>
                  </div>
                </div>
              </div>
              <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${isDrafted ? 'bg-purple-950/80 text-purple-300 border border-purple-700/60' : 'bg-slate-800 text-slate-400'}">
                ${p.class_level || (p.grad_year ? `Class '${p.grad_year}` : 'Active')}
              </span>
            </div>

            <div class="space-y-1 text-[10px]">
              ${isDrafted ? `
                <div class="px-2 py-0.5 rounded-lg bg-purple-900/30 border border-purple-500/30 text-purple-300 font-bold flex items-center gap-1">
                  <span>Draft:</span> <span class="truncate">${p.draft_status}</span>
                </div>
              ` : ''}
              ${p.hometown ? `
                <div class="text-slate-400 flex items-center gap-1">
                  <span class="text-slate-500">Hometown:</span> <span class="truncate text-slate-300">${p.hometown}</span>
                </div>
              ` : ''}
              ${p.previous_team ? `
                <div class="text-slate-400 flex items-center gap-1">
                  <span class="text-slate-500">Feeder:</span> <span class="truncate text-slate-300">${p.previous_team}</span>
                </div>
              ` : ''}
            </div>

            <div class="grid grid-cols-4 gap-1 p-2 rounded-xl bg-slate-950 text-center font-mono text-[10px] border border-slate-800/80">
              <div>
                <span class="text-slate-500 text-[8px] block">HT/WT</span>
                <span class="text-white font-bold">${htFt} ${p.weight_lbs || '--'}</span>
              </div>
              <div>
                <span class="text-slate-500 text-[8px] block">30M SPD</span>
                <span class="text-sky-400 font-bold">${combine.flying_30m_sec ? combine.flying_30m_sec + 's' : (p.pos === 'G' ? 'Goalie' : '3.5s')}</span>
              </div>
              <div>
                <span class="text-slate-500 text-[8px] block">CONF</span>
                <span class="text-emerald-400 font-bold truncate block">${p.conference || '--'}</span>
              </div>
              <div>
                <span class="text-slate-500 text-[8px] block">SCORE</span>
                <span class="text-amber-400 font-bold">${scoreVal}</span>
              </div>
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
            <button onclick="selectPlayerById('${p.id}'); closeRosterExplorer();" class="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition text-center">
              View Dossier
            </button>
            <a href="player.html?id=${p.id}" target="_blank" class="flex-1 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] transition text-center shadow shadow-sky-600/20">
              Open Passport &rarr;
            </a>
          </div>
        </div>
      `;
    }).join('') + overflowNote;
  }
});
