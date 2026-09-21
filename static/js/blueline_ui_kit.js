/**
 * BlueLine DataWorks: Enterprise UI & Data Clarity Kit
 * 
 * Provides:
 * - Enterprise HUD Notification Toasts (replaces browser alerts)
 * - Hockey Metric Tooltip & Formula Engine (xG, NHLe, GSAx, SQM, Wingate, etc.)
 * - Cross-Module Deep-Link Router (?player=<id>)
 * - Data Provenance & Verification Badge Stamping
 */

(function(window) {
  "use strict";

  // =========================================================================
  // 1. ENTERPRISE HUD TOAST NOTIFICATION SYSTEM
  // =========================================================================
  let toastContainer = null;

  function ensureToastContainer() {
    if (toastContainer && document.body && (typeof document.body.contains === 'function' ? document.body.contains(toastContainer) : true)) return toastContainer;
    toastContainer = document.createElement('div');
    toastContainer.id = 'blueline-toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-md w-full px-4';
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function showToast(msg, type = 'info', duration = 3800) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    
    let borderClass = 'border-sky-500/50';
    let iconClass = 'fa-solid fa-circle-info text-sky-400';
    let bgGradient = 'from-slate-950 via-slate-900 to-sky-950/80';
    let title = 'System Notification';

    if (type === 'success') {
      borderClass = 'border-emerald-500/60';
      iconClass = 'fa-solid fa-circle-check text-emerald-400';
      bgGradient = 'from-slate-950 via-slate-900 to-emerald-950/80';
      title = 'Action Verified';
    } else if (type === 'warning') {
      borderClass = 'border-amber-500/60';
      iconClass = 'fa-solid fa-triangle-exclamation text-amber-400';
      bgGradient = 'from-slate-950 via-slate-900 to-amber-950/80';
      title = 'Clearance Notice';
    } else if (type === 'error') {
      borderClass = 'border-rose-500/60';
      iconClass = 'fa-solid fa-circle-exclamation text-rose-400';
      bgGradient = 'from-slate-950 via-slate-900 to-rose-950/80';
      title = 'Security Alert';
    }

    toast.className = `pointer-events-auto bg-gradient-to-r ${bgGradient} border ${borderClass} rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl text-white font-sans text-xs flex items-start gap-3 transition-all duration-300 transform translate-y-3 opacity-0`;
    toast.innerHTML = `
      <div class="mt-0.5 text-base shrink-0">
        <i class="${iconClass}"></i>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-0.5">
          <span class="font-bold text-white uppercase tracking-wider text-[10px] font-mono">${title}</span>
          <span class="text-[9px] text-slate-400 font-mono">${new Date().toLocaleTimeString()}</span>
        </div>
        <p class="text-slate-200 leading-snug font-medium text-xs">${msg}</p>
      </div>
      <button type="button" class="text-slate-400 hover:text-white p-1 transition cursor-pointer text-xs" onclick="this.parentElement.remove()">
        ✕
      </button>
    `;

    container.appendChild(toast);

    // Smooth enter
    const rAF = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : (cb => setTimeout(cb, 16));
    rAF(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto dismiss
    setTimeout(() => {
      setTimeout(() => {
        if (typeof toast.remove === 'function') {
          toast.remove();
        } else if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 350);
    }, duration);
  }

  // Override window.alert for modern experience when enabled
  window.bluelineToast = showToast;

  // =========================================================================
  // 2. HOCKEY METRIC DEFINITIONS & FORMULAS REGISTRY
  // =========================================================================
  const METRICS = {
    xg: {
      name: "xG (Expected Goals)",
      category: "Offensive Generation",
      formula: "xG = Σ P(Goal | Location, Angle, ShotType, GoaliePosition, PreShotMovement)",
      desc: "Statistical probability (from 0.00 to 1.00) that an unblocked shot will result in a goal. Factoring distance to center of net, shot angle, rush speed, and whether the pass crossed the Royal Road.",
      benchmark: "Amateur Tier 1: 0.35 xG/GP | NCAA D1 Forward: 0.58 xG/GP | Elite Prospect: >0.85 xG/GP",
      source: "Computer Vision Tracking Matrix & Game Center Telemetry"
    },
    nhle: {
      name: "NHLe (NHL Equivalency)",
      category: "Pro Trajectory",
      formula: "NHLe = Points/Game × LeagueFactor × 82",
      desc: "Mathematical translation projecting collegiate or junior scoring rates into anticipated 82-game NHL point production during prime developmental years.",
      benchmark: "NCAA Big Ten: 0.44 Factor | USHL: 0.28 Factor | OHL/WHL: 0.30 Factor | BCHL: 0.21 Factor",
      source: "Historical 15-Year Cohort Conversion Model"
    },
    gsax: {
      name: "GSAx (Goals Saved Above Expected)",
      category: "Goaltending",
      formula: "GSAx = Cumulative xG Faced − Actual Goals Allowed",
      desc: "The true measure of goaltender performance isolating goalie skill from team defensive quality. A positive GSAx indicates the goalie stopped more pucks than an average goaltender facing the identical shot profile.",
      benchmark: "Starter Average: +0.00 | Quality Starter: >+5.5 | Elite Amateur Trophy Candidate: >+14.0",
      source: "Crease Lab Shot Geometry Engine"
    },
    sqm: {
      name: "SQM (Signal Quality Metric)",
      category: "Swarm Ingestion",
      formula: "SQM = (RegistrarMatch × 0.50) + (AmateurIntegrity × 0.30) + (LatencyScore × 0.20)",
      desc: "Real-time crawler data veracity score (0-100) calculated by BlueLine's 24-agent autonomous swarm. Verifies that profiles contain zero NHL commercial contracts and correspond to verified academic student-athletes.",
      benchmark: "Tier S (95-100): Direct Registrar Sync | Tier A (85-94): Verified Box Score | Tier B (70-84): Scouting Digest",
      source: "24-Agent Autonomous Swarm Consensus Engine"
    },
    wingate: {
      name: "Wingate Anaerobic Power Index",
      category: "Bio-Mechanics",
      formula: "Peak Watts/kg = (Force × Distance) / (Time × Mass)",
      desc: "30-second all-out cycle ergometer test evaluating explosive lower-body anaerobic power, instantaneous sprint capacity, and rate of fatigue deceleration across third periods.",
      benchmark: "Prep Varsity: 11.2 W/kg | NCAA D1 Recruit: 13.8 W/kg | Draft Elite: >15.4 W/kg",
      source: "Combine Lab Wingate Biometric Sensors"
    },
    royal_road: {
      name: "Royal Road Passing",
      category: "Spatial Passing",
      formula: "Crossing Line between Faceoff Dots in Offensive Zone below Top of Circles",
      desc: "A lateral puck transit that crosses the imaginary center line dividing the offensive zone into halves within 22 feet of the net. Forces goaltenders to move laterally, increasing shot conversion rate by 2.4x.",
      benchmark: "Average USHL Forward: 1.4/GP | Playmaker Star: >3.2/GP",
      source: "Microstat Studio Spatial Passing Web"
    },
    corsi: {
      name: "Corsi For % (CF%)",
      category: "Possession",
      formula: "CF% = (Shot Attempts For) / (Shot Attempts For + Shot Attempts Against) × 100",
      desc: "Puck possession proxy measuring the total volume of 5v5 shot attempts (goals, saves, missed shots, and blocked shots) occurring while the skater is on the ice.",
      benchmark: "Break-even: 50.0% | Dominant Play-Driver: >54.5% | Heavy Defensive Zone Start: ~47.0%",
      source: "Live Game Center Play-by-Play Ingestion"
    }
  };

  function getMetricDetails(key) {
    return METRICS[key.toLowerCase()] || null;
  }

  function openMetricModal(key) {
    const data = getMetricDetails(key);
    if (!data) return;

    let modal = document.getElementById('bluelineMetricModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'bluelineMetricModal';
      modal.className = 'fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-slate-950 border border-sky-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden text-slate-200 font-sans space-y-4">
        <div class="absolute -top-12 -right-12 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-sm font-mono">
              📊
            </span>
            <div>
              <h3 class="text-base font-black text-white">${data.name}</h3>
              <span class="text-[10px] uppercase font-mono font-bold text-sky-400">${data.category}</span>
            </div>
          </div>
          <button type="button" class="text-slate-400 hover:text-white text-lg p-1 transition cursor-pointer" onclick="document.getElementById('bluelineMetricModal').remove()">
            ✕
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Mathematical Formulation:</span>
            <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-sky-300 text-[11px] select-all">
              ${data.formula}
            </div>
          </div>

          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Scouting Definition:</span>
            <p class="text-slate-300 leading-relaxed">${data.desc}</p>
          </div>

          <div>
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Benchmark Standards:</span>
            <div class="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-700/40 text-emerald-300 text-[11px] font-mono">
              ${data.benchmark}
            </div>
          </div>

          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Source: ${data.source}</span>
            <span class="text-emerald-400">✓ Non-NHL Amateur Verified</span>
          </div>
        </div>

        <button type="button" class="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg transition cursor-pointer" onclick="document.getElementById('bluelineMetricModal').remove()">
          Understood & Close
        </button>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // =========================================================================
  // 3. CROSS-MODULE DEEP LINKING ROUTER & PER-PLAYER FEATURE HUB
  // =========================================================================
  function getModuleUrl(moduleName, playerId) {
    const validModules = {
      scout: 'scout.html',
      player: 'player.html',
      film: 'film.html',
      rink3d: 'rink3d.html',
      compare: 'compare.html',
      crease: 'crease.html',
      combine: 'combine.html',
      database: 'database.html',
      community: 'community.html',
      tactics: 'tactics.html',
      pathway: 'pathway.html',
      draft: 'draft.html',
      portal: 'portal.html',
      tracking: 'tracking.html',
      caplab: 'caplab.html',
      tournament: 'tournament.html',
      scoreboard: 'scoreboard.html',
      agents: 'agents.html',
      app: 'app.html'
    };
    const file = validModules[moduleName] || 'scout.html';
    const param = file === 'player.html' ? 'id' : 'player';
    return playerId ? `${file}?${param}=${encodeURIComponent(playerId)}` : file;
  }

  function launchAthleteInModule(moduleName, playerId) {
    const target = getModuleUrl(moduleName, playerId);
    showToast(`Launching ${playerId} in ${moduleName.toUpperCase()}...`, 'info', 1500);
    setTimeout(() => {
      window.location.href = target;
    }, 300);
  }

  function getActivePlayerIdFromUrl() {
    if (typeof window === 'undefined' || !window.location || !window.location.search) return null;
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('player') || params.get('id') || params.get('athlete') || params.get('p') || null;
    } catch (e) {
      return null;
    }
  }

  const SCOUT_LEDGER_STORAGE_KEY = 'blueline_scout_watching_ledger';
  const SCOUT_TRACKING_META_KEY = 'blueline_scout_tracking_metadata';

  function getScoutWatchingLedger() {
    try {
      const raw = localStorage.getItem(SCOUT_LEDGER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveScoutWatchingLedger(ledger) {
    try {
      localStorage.setItem(SCOUT_LEDGER_STORAGE_KEY, JSON.stringify(ledger || []));
    } catch (e) {}
  }

  function getScoutTrackingMetadata() {
    try {
      const raw = localStorage.getItem(SCOUT_TRACKING_META_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveScoutTrackingMetadata(metaObj) {
    try {
      localStorage.setItem(SCOUT_TRACKING_META_KEY, JSON.stringify(metaObj || {}));
    } catch (e) {}
  }

  function getTrackedPlayerMeta(athleteId) {
    if (!athleteId) return { priority: 'Tier 1 - Priority Target', status: 'In Evaluation', notes: '' };
    const allMeta = getScoutTrackingMetadata();
    return allMeta[athleteId] || { priority: 'Tier 1 - Priority Target', status: 'In Evaluation', notes: '' };
  }

  function setTrackedPlayerMeta(athleteId, meta) {
    if (!athleteId) return;
    const allMeta = getScoutTrackingMetadata();
    allMeta[athleteId] = { ...(allMeta[athleteId] || {}), ...(meta || {}), updated_at: new Date().toISOString() };
    saveScoutTrackingMetadata(allMeta);
  }

  function isInWatchingLedger(athleteId) {
    if (!athleteId) return false;
    const ledger = getScoutWatchingLedger();
    return ledger.includes(athleteId);
  }

  function togglePlayerInLedger(athleteId, athleteName) {
    if (!athleteId) return false;
    let ledger = getScoutWatchingLedger();
    const name = athleteName || athleteId;
    let isAdded = false;

    if (ledger.includes(athleteId)) {
      ledger = ledger.filter(id => id !== athleteId);
      showToast(`Removed ${name} from Watched Prospects Ledger.`, 'info');
      isAdded = false;
    } else {
      ledger.unshift(athleteId);
      showToast(`⭐ Added ${name} to Watched Prospects Ledger!`, 'success');
      isAdded = true;
    }
    saveScoutWatchingLedger(ledger);
    return isAdded;
  }

  // =========================================================================
  // PER-PLAYER ALL-FEATURE ACTION HUB MODAL
  // =========================================================================
  function openPlayerFeatureHubModal(playerId) {
    if (!playerId) return;
    const existing = document.getElementById('playerFeatureHubModal');
    if (existing) existing.remove();

    let athlete = null;
    if (typeof allAthletes !== 'undefined' && Array.isArray(allAthletes)) {
      athlete = allAthletes.find(p => p.id === playerId);
    }
    if (!athlete && typeof MASTER_PLAYERS !== 'undefined' && Array.isArray(MASTER_PLAYERS)) {
      athlete = MASTER_PLAYERS.find(p => p.id === playerId);
    }
    if (!athlete) {
      athlete = { id: playerId, name: playerId, pos: 'F', team: 'Prospect Dossier', composite_score: 88.5 };
    }

    const meta = getTrackedPlayerMeta(athlete.id);
    const score = athlete.composite_score ? athlete.composite_score.toFixed(1) : '88.5';
    const isWatched = isInWatchingLedger(athlete.id);

    const modules = [
      { id: 'film', name: 'AI Film Room', icon: '🎥', desc: 'Biomechanical shift telestration & stride cadence analysis', tag: 'AI Vision' },
      { id: 'combine', name: 'Combine Lab', icon: '🔬', desc: 'Laser 30m sprint, vertical leap & physical test telemetry', tag: 'Biometrics' },
      { id: 'compare', name: 'Compare Radar', icon: '⚖️', desc: 'Head-to-head radar benchmark against peer cohort or NHL standard', tag: 'Analytics' },
      { id: 'player', name: 'Verified Passport', icon: '👤', desc: 'Official biometric dossier, certified measurables & career records', tag: 'Verified' },
      { id: 'pathway', name: 'Career Pathway', icon: '📈', desc: 'Monte Carlo career simulator & D1/NHL advancement odds', tag: 'Trajectory' },
      { id: 'rink3d', name: '3D Virtual Rink', icon: '🧊', desc: 'Spatial 3D shot angle replay & release telemetry', tag: 'Spatial' },
      { id: 'tactics', name: 'Tactics Board', icon: '📐', desc: 'Tactical system fit, forecheck chemistry & PP/PK deployment', tag: 'Systems' },
      { id: 'crease', name: 'Crease Analysis', icon: '🥅', desc: 'High-danger scoring chances & shot angle heatmaps', tag: 'Expected Goals' },
      { id: 'tracking', name: 'CV Shift Tracking', icon: '📊', desc: 'Computer vision tracking, zone transitions & microstats', tag: 'Computer Vision' },
      { id: 'draft', name: 'Mock Draft Room', icon: '🎯', desc: 'Consensus draft ranking, round projection & scout board', tag: 'Scout Bureau' },
      { id: 'portal', name: 'NCAA Portal Hub', icon: '🎓', desc: 'Clearinghouse eligibility, core credits & transfer status', tag: 'Compliance' },
      { id: 'scout', name: 'Rinkside Logger', icon: '📋', desc: 'Load prospect directly into Live Micro-Telemetry Logger', tag: 'Live Desk' },
      { id: 'community', name: 'Direct Recruiter DM', icon: '💬', desc: 'Send direct recruiter inquiry via The Wire social mesh', tag: 'Comms' },
      { id: 'database', name: 'Directory Record', icon: '🌐', desc: 'Inspect full directory entry & institutional affiliation', tag: 'Database' }
    ];

    const modal = document.createElement('div');
    modal.id = 'playerFeatureHubModal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl bg-slate-950 border border-sky-500/40 shadow-2xl p-4 sm:p-6 text-white my-2 sm:my-8 max-h-[92vh] overflow-y-auto space-y-4 sm:space-y-5" style="background:#020617; border:1px solid rgba(56,189,248,0.4);">
        <!-- Close Button -->
        <button type="button" onclick="document.getElementById('playerFeatureHubModal').remove()" class="absolute right-3 sm:right-4 top-3 sm:top-4 w-9 h-9 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition z-10" aria-label="Close Modal">✕</button>

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-3 sm:pb-4 pr-8 sm:pr-8">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-800 text-white flex items-center justify-center text-xl sm:text-2xl font-black shadow-lg border border-sky-400/40 shrink-0">
              ${athlete.pos === 'G' ? '🥅' : (athlete.pos === 'D' ? '🛡️' : '⚡')}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] sm:text-[10px] font-mono font-bold uppercase">
                  ${athlete.tier || 'VERIFIED PROSPECT'}
                </span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-mono font-bold">
                  Score: ${score}
                </span>
                <span class="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[9px] sm:text-[10px] font-mono font-bold">
                  ${meta.priority || 'Tier 1 - Priority Target'}
                </span>
              </div>
              <h2 class="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5 truncate">${athlete.name}</h2>
              <p class="text-[11px] sm:text-xs text-slate-300 font-sans truncate">${athlete.team || 'Independent'} · Position: <strong class="text-white">${athlete.pos || 'F'}</strong> · Status: <strong class="text-amber-400">${meta.status || 'In Evaluation'}</strong></p>
            </div>
          </div>

          <!-- Watchlist Toggle -->
          <div class="flex items-center gap-2 pt-1 sm:pt-0">
            <button type="button" id="modalToggleLedgerBtn" onclick="window.BlueLineUI.togglePlayerInLedger('${athlete.id}', '${athlete.name.replace(/'/g, "\\'")}'); window.BlueLineUI.openPlayerFeatureHubModal('${athlete.id}');" class="w-full sm:w-auto px-3.5 py-1.5 rounded-xl ${isWatched ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-900 border border-amber-500/50 text-amber-300 hover:text-white'} text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md min-h-[40px]">
              <span>${isWatched ? '⭐ Tracked on List' : '+ Add to Tracked List'}</span>
            </button>
          </div>
        </div>

        <!-- Instructions -->
        <div>
          <h3 class="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🚀</span> Recruiter Multi-Feature Workspace (${modules.length} Enterprise Tools)
          </h3>
          <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Launch any analytics lab or command desk contextualized for <strong>${athlete.name}</strong>. All telemetry and data will pre-load automatically.
          </p>
        </div>

        <!-- Modules Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          ${modules.map(m => `
            <div onclick="window.BlueLineUI.launchAthleteInModule('${m.id}', '${athlete.id}')" class="p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-sky-400/60 transition cursor-pointer flex flex-col justify-between space-y-2 shadow-sm group">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-xl">${m.icon}</span>
                  <span class="px-1.5 py-0.5 rounded bg-sky-950 border border-sky-700/50 text-sky-300 text-[9px] font-mono font-bold">${m.tag}</span>
                </div>
                <h4 class="text-sm font-bold text-white group-hover:text-sky-300 transition">${m.name}</h4>
                <p class="text-[11px] text-slate-400 leading-snug">${m.desc}</p>
              </div>
              <div class="pt-1 text-[11px] font-mono text-sky-400 group-hover:text-sky-300 flex items-center justify-between font-bold">
                <span>Launch for ${athlete.name.split(' ')[0]}</span>
                <span>→</span>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Modal Footer -->
        <div class="pt-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono text-slate-400">
          <span>Official Recruit ID: <strong class="text-white">${athlete.id}</strong></span>
          <button type="button" onclick="document.getElementById('playerFeatureHubModal').remove()" class="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // =========================================================================
  // 4. UNIVERSAL FEATURE ACCESS & ROLE PERMISSIONS GUARD
  // =========================================================================
  function checkFeatureAccess(featureKey) {
    const user = window.BlueLineAuth ? window.BlueLineAuth.getCurrentUser() : null;
    const role = (user && user.role) ? user.role.toLowerCase() : 'guest';
    const isPro = (role === 'coach' || role === 'scout' || role === 'admin' || (user && user.plan && user.plan.toLowerCase().includes('pro')));
    
    // Pro-only features
    const proFeatures = ['film', 'coach', 'scout', 'combine', 'tactics', 'broadcast_ai', 'portal', 'draft', 'agents', 'videobreakdown'];
    if (proFeatures.includes(featureKey.toLowerCase())) {
      return isPro;
    }
    // Wire and open features are universally accessible
    return true;
  }

  function showAccessRestrictedModal(options = {}) {
    const existing = document.getElementById('bluelineAccessRestrictedModal');
    if (existing) existing.remove();

    const featureName = options.featureName || 'Coach & Recruiter Pro Feature';
    const requiredTier = options.requiredTier || 'Coach & Recruiter Pro ($22.99/mo)';
    const targetUrl = options.targetUrl || '';
    const description = options.description || 'This advanced feature includes professional tactical tools, AI telestration, or scouting evaluation workflows reserved for certified coaches and recruiters.';

    const user = window.BlueLineAuth ? window.BlueLineAuth.getCurrentUser() : null;
    const currentRole = options.currentRole || (user ? (user.role_title || user.badge || user.role || 'Guest / Standard') : 'Parent / Family Advisor ($4.99/mo)');

    const modal = document.createElement('div');
    modal.id = 'bluelineAccessRestrictedModal';
    modal.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:99999; display:flex; align-items:center; justify-content:center; background:rgba(2,6,23,0.88); backdrop-filter:blur(14px); padding:1rem;';

    modal.innerHTML = `
      <div style="background:linear-gradient(135deg, #090e17 0%, #030712 100%); border:1px solid rgba(56,189,248,0.35); box-shadow:0 25px 50px -12px rgba(0,0,0,0.8), 0 0 40px rgba(14,165,233,0.2); border-radius:24px; max-width:540px; width:100%; padding:1.75rem; color:#f8fafc; font-family:Inter,system-ui,sans-serif; position:relative;" class="space-y-4">
        
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; border-bottom:1px solid rgba(51,65,85,0.7); padding-bottom:1rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg,#f59e0b,#ea580c); display:flex; align-items:center; justify-content:center; font-size:1.4rem; box-shadow:0 4px 14px rgba(245,158,11,0.35); flex-shrink:0;">
              🔒
            </div>
            <div>
              <span style="display:inline-block; font-family:monospace; font-size:0.65rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; padding:2px 8px; border-radius:9999px; background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid rgba(245,158,11,0.4); margin-bottom:4px;">
                Access Clearance Required
              </span>
              <h3 style="font-size:1.15rem; font-weight:800; color:#ffffff; margin:0; line-height:1.2;">
                ${featureName}
              </h3>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('bluelineAccessRestrictedModal').remove()" style="background:transparent; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer; padding:4px 8px; border-radius:8px; line-height:1;" title="Close">
            ✕
          </button>
        </div>

        <!-- Explanation -->
        <div style="background:rgba(15,23,42,0.8); border:1px solid rgba(51,65,85,0.5); border-radius:14px; padding:0.9rem 1.1rem; font-size:0.8rem; line-height:1.5; color:#cbd5e1;">
          <p style="margin:0 0 0.5rem 0;">${description}</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-family:monospace; font-size:0.75rem; border-top:1px solid rgba(51,65,85,0.4); padding-top:0.5rem; margin-top:0.5rem;">
            <div>
              <span style="color:#94a3b8; display:block;">Your Current Plan:</span>
              <strong style="color:#f472b6;">${currentRole}</strong>
            </div>
            <div>
              <span style="color:#94a3b8; display:block;">Required Plan:</span>
              <strong style="color:#38bdf8;">${requiredTier}</strong>
            </div>
          </div>
        </div>

        <!-- The Wire Notice -->
        <div style="background:rgba(2,132,199,0.12); border:1px solid rgba(56,189,248,0.3); border-radius:12px; padding:0.65rem 0.9rem; font-size:0.75rem; color:#7dd3fc; display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:1.1rem;">🌐</span>
          <span><strong>Remember:</strong> <em>The Wire</em> and student-athlete directories are <strong>100% accessible to all parents & athletes</strong> anytime without pro upgrades!</span>
        </div>

        <!-- 1-Click Test Drive / Actions -->
        <div style="display:flex; flex-direction:column; gap:0.5rem; padding-top:0.25rem;">
          <button type="button" id="btnTestDriveCoach" style="width:100%; padding:0.65rem 1rem; border-radius:12px; background:linear-gradient(90deg,#0284c7,#2563eb); border:1px solid rgba(56,189,248,0.5); color:#ffffff; font-weight:800; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem; box-shadow:0 4px 12px rgba(2,132,199,0.3); transition:all 0.2s ease;">
            <span>🏒</span> <span>Test Drive as Coach (Adam Nightingale — NCAA D1)</span>
          </button>
          
          <button type="button" id="btnTestDriveScout" style="width:100%; padding:0.65rem 1rem; border-radius:12px; background:rgba(30,41,59,0.9); border:1px solid rgba(245,158,11,0.4); color:#fbbf24; font-weight:800; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem; transition:all 0.2s ease;">
            <span>🔍</span> <span>Test Drive as Scout (Dan Marr — Central Scouting)</span>
          </button>

          <div style="display:flex; gap:0.5rem; margin-top:0.25rem;">
            <button type="button" onclick="window.location.href='community.html'" style="flex:1; padding:0.5rem 0.75rem; border-radius:10px; background:rgba(15,23,42,0.9); border:1px solid rgba(71,85,105,0.7); color:#94a3b8; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.4rem;">
              <span>🌐</span> <span>Open The Wire</span>
            </button>
            <button type="button" onclick="document.getElementById('bluelineAccessRestrictedModal').remove()" style="flex:1; padding:0.5rem 0.75rem; border-radius:10px; background:rgba(15,23,42,0.9); border:1px solid rgba(71,85,105,0.7); color:#94a3b8; font-size:0.75rem; font-weight:700; cursor:pointer;">
              Close & Return
            </button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Wire up Test Drive buttons
    const btnCoach = modal.querySelector('#btnTestDriveCoach');
    if (btnCoach) {
      btnCoach.addEventListener('click', () => {
        modal.remove();
        if (window.BlueLineAuth && window.BlueLineAuth.selectPersona) {
          window.BlueLineAuth.selectPersona('usr_coach_nightingale');
        } else {
          const coachUser = {
            id: 'usr_coach_nightingale',
            name: 'Adam Nightingale',
            role: 'coach',
            badge: 'COACH (NCAA D1)',
            team: 'Michigan State University',
            avatar: '👔',
            verified: true,
            isGuest: false
          };
          localStorage.setItem('blueline_auth_user', JSON.stringify(coachUser));
        }
        showToast('✓ Switched to Coach Adam Nightingale (Pro Clearance Unlocked)!', 'success', 3000);
        setTimeout(() => {
          window.location.href = targetUrl || 'coach.html';
        }, 500);
      });
    }

    const btnScout = modal.querySelector('#btnTestDriveScout');
    if (btnScout) {
      btnScout.addEventListener('click', () => {
        modal.remove();
        if (window.BlueLineAuth && window.BlueLineAuth.selectPersona) {
          window.BlueLineAuth.selectPersona('usr_scout_marr');
        } else {
          const scoutUser = {
            id: 'usr_scout_marr',
            name: 'Dan Marr',
            role: 'scout',
            badge: 'DIRECTOR OF SCOUTING',
            team: 'NHL Central Scouting Benchmark',
            avatar: '🔍',
            verified: true,
            isGuest: false
          };
          localStorage.setItem('blueline_auth_user', JSON.stringify(scoutUser));
        }
        showToast('✓ Switched to Scout Dan Marr (Pro Clearance Unlocked)!', 'success', 3000);
        setTimeout(() => {
          window.location.href = targetUrl || 'scout.html';
        }, 500);
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // =========================================================================
  // 5. ROLE-BASED DYNAMIC NAVIGATION & HOME RESOLUTION
  // =========================================================================
  function getRoleHomeUrl(user) {
    if (window.BlueLineAuth && typeof window.BlueLineAuth.getRoleHomeUrl === 'function') {
      return window.BlueLineAuth.getRoleHomeUrl(user);
    }
    if (!user) {
      try {
        const raw = localStorage.getItem('blueline_auth_user');
        if (raw) user = JSON.parse(raw);
      } catch(e) {}
    }
    const role = (user && user.role) ? String(user.role).toLowerCase().trim() : '';
    if (role === 'parent') return 'parent.html';
    if (role === 'coach') return 'coach.html';
    if (role === 'athlete' || role === 'player') return 'app.html?role=athlete';
    if (role === 'admin') return 'app.html?role=admin';
    if (role === 'scout' || role === 'recruiter') return 'scout.html';
    return 'scout.html';
  }

  function getRoleHomeTitle(user) {
    if (window.BlueLineAuth && typeof window.BlueLineAuth.getRoleHomeTitle === 'function') {
      return window.BlueLineAuth.getRoleHomeTitle(user);
    }
    const role = (user && user.role) ? String(user.role).toLowerCase().trim() : '';
    if (role === 'parent') return 'Return to Parent & Family Advisor Portal (parent.html)';
    if (role === 'coach') return 'Return to Coach Command Center (coach.html)';
    if (role === 'athlete' || role === 'player') return 'Return to Athlete Dashboard (app.html)';
    if (role === 'admin') return 'Return to Platform Admin Hub (app.html)';
    if (role === 'scout' || role === 'recruiter') return 'Return to Lead Scout Desk (scout.html)';
    return 'Return to Lead Scout Desk (scout.html)';
  }

  function handleLogoClick(e) {
    if (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return true;
      e.preventDefault();
    }
    window.location.href = getRoleHomeUrl();
    return false;
  }

  // Export public API
  window.BlueLineUI = {
    showToast,
    openMetricModal,
    getMetricDetails,
    getModuleUrl,
    launchAthleteInModule,
    getActivePlayerIdFromUrl,
    checkFeatureAccess,
    showAccessRestrictedModal,
    getRoleHomeUrl,
    getRoleHomeTitle,
    handleLogoClick,
    getScoutWatchingLedger,
    saveScoutWatchingLedger,
    isInWatchingLedger,
    togglePlayerInLedger,
    openPlayerFeatureHubModal,
    getScoutTrackingMetadata,
    saveScoutTrackingMetadata,
    getTrackedPlayerMeta,
    setTrackedPlayerMeta
  };

  // Expose global convenience function
  window.openPlayerFeatureHubModal = openPlayerFeatureHubModal;

})(window);
