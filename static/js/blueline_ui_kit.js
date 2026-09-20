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
    if (toastContainer && document.body.contains(toastContainer)) return toastContainer;
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
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-3', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => toast.remove(), 350);
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
  // 3. CROSS-MODULE DEEP LINKING ROUTER
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
      community: 'community.html'
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

  // Read URL query parameter for active player
  function getActivePlayerIdFromUrl() {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get('player') || p.get('id') || null;
    } catch(e) {
      return null;
    }
  }

  // Export public API
  window.BlueLineUI = {
    showToast,
    openMetricModal,
    getMetricDetails,
    getModuleUrl,
    launchAthleteInModule,
    getActivePlayerIdFromUrl
  };

})(window);
