/**
 * BlueLine DataWorks: Unified Enterprise Navigation & Module Launcher
 * 
 * Provides:
 * - Responsive, zero-overflow top navigation architecture
 * - Categorized 22-Module Command Palette & Mega-Menu (App Launcher)
 * - Keyboard shortcuts (Cmd+K / Ctrl+K to open, Esc to close)
 * - Real-time module search and filtering
 * - Active page highlighting
 */

(function(window) {
  "use strict";

  // Master registry of all 22 enterprise modules
  const MODULES = [
    // 1. Rink & Game Simulation
    { id: "app", name: "Player OS", icon: "⚡", url: "app.html", cat: "rink", desc: "Logged-In Athlete Command Center & Passport" },
    { id: "index", name: "Public Home", icon: "🌐", url: "index.html", cat: "rink", desc: "Public Marketing Homepage & Platform Overview" },
    { id: "scoreboard", name: "Game Center", icon: "📡", url: "scoreboard.html", cat: "rink", desc: "Live multi-game scoreboard, shot tracking & xG feeds" },
    { id: "rink3d", name: "3D Virtual Rink", icon: "🧊", url: "rink3d.html", cat: "rink", desc: "Interactive WebGL 3D rink simulator & physics" },
    { id: "film", name: "AI Film Studio", icon: "🎬", url: "film.html", cat: "rink", desc: "Telestration, video breakdown & play tagging" },
    { id: "broadcast_ai", name: "Voice AI Studio", icon: "🎙️", url: "broadcast_ai.html", cat: "rink", desc: "Automated play-by-play synthesis & audio broadcast" },

    // 2. Player Performance & Analytics Labs
    { id: "tracking", name: "Microstat Studio", icon: "🔬", url: "tracking.html", cat: "labs", desc: "Spatial passing web, Royal Road & zone transitions" },
    { id: "crease", name: "Crease Lab", icon: "🥅", url: "crease.html", cat: "labs", desc: "Goalie geometry, RVH post-seals, GSAx & fatigue" },
    { id: "combine", name: "Combine Lab", icon: "🧬", url: "combine.html", cat: "labs", desc: "Biometrics, Wingate anaerobic testing & physiology" },
    { id: "compare", name: "Compare Lab", icon: "⚖️", url: "compare.html", cat: "labs", desc: "8-axis radar benchmarks & NHLe trajectory curves" },

    // 3. Strategy & Tournaments
    { id: "tactics", name: "Tactics Lab", icon: "📋", url: "tactics.html", cat: "coaching", desc: "AI lineup optimizer, 5v5/PP/PK chemistry & xGF%" },
    { id: "scout", name: "Scout Workspace", icon: "🔭", url: "scout.html", cat: "coaching", desc: "Lead Scout live micro-telemetry logger & prospect directory" },
    { id: "tournament", name: "Tournaments", icon: "🏆", url: "tournament.html", cat: "coaching", desc: "Bracketology war room: Frozen Four, Memorial Cup, WJC" },
    { id: "international", name: "International", icon: "🌍", url: "international.html", cat: "coaching", desc: "4 Nations Face-Off & 2026 Olympic Hub (85ft vs 100ft)" },

    // 4. Front Office & Career Market
    { id: "market", name: "Trade Desk", icon: "💼", url: "market.html", cat: "frontoffice", desc: "Multi-team trade machine, retention & free agency" },
    { id: "caplab", name: "Cap Lab", icon: "💵", url: "caplab.html", cat: "frontoffice", desc: "NHL salary cap ledger, buyouts & LTIR simulator" },
    { id: "pathway", name: "Career Pathway", icon: "🛣️", url: "pathway.html", cat: "frontoffice", desc: "Lifelong 5-stage career ladder & NCAA vs CHL" },
    { id: "draft", name: "Draft Room", icon: "🎯", url: "draft.html", cat: "frontoffice", desc: "7-round Monte Carlo mock draft & scouting boards" },
    { id: "portal", name: "Portal & NIL", icon: "⚡", url: "portal.html", cat: "frontoffice", desc: "NCAA transfer portal & athlete NIL valuation exchange" },

    // 5. System, Social & Intelligence
    { id: "security", name: "Cyber Shield", icon: "🛡️", url: "security.html", cat: "system", desc: "Military-grade RASP defense & AI co-pilot swarm" },
    { id: "agents", name: "AI Swarm", icon: "🤖", url: "agents.html", cat: "system", desc: "Autonomous multi-agent cooperative scouting mesh" },
    { id: "community", name: "The Wire", icon: "🌐", url: "community.html", cat: "system", desc: "Scouting social network, direct messaging & bulletins" },
    { id: "database", name: "Master Directory", icon: "📊", url: "database.html", cat: "system", desc: "Comprehensive directory of 2,974 athlete dossiers" },
    { id: "player", name: "Player Passport", icon: "👤", url: "player.html", cat: "system", desc: "Comprehensive athlete dossier & development logs" }
  ];

  // Category labels and styling
  const CATEGORIES = {
    rink: { title: "Rink & Game Operations", icon: "🏟️", badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
    labs: { title: "Performance & Analytics Labs", icon: "🔬", badgeClass: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
    coaching: { title: "Coaching & Tournaments", icon: "📋", badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    frontoffice: { title: "Front Office & Career Market", icon: "💼", badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
    system: { title: "Security & Intelligence", icon: "🛡️", badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" }
  };

  function getCurrentPageFilename() {
    const path = window.location.pathname;
    const filename = path.split("/").pop();
    return filename && filename.length > 0 ? filename : "index.html";
  }

  function renderAppLauncherModal() {
    // If already exists, return
    if (document.getElementById("globalAppLauncherModal")) return;

    const modal = document.createElement("div");
    modal.id = "globalAppLauncherModal";
    modal.className = "fixed inset-0 z-[100] hidden flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    const currentFile = getCurrentPageFilename();

    // Group modules by category
    const grouped = {};
    Object.keys(CATEGORIES).forEach(k => grouped[k] = []);
    MODULES.forEach(m => {
      if (grouped[m.cat]) grouped[m.cat].push(m);
    });

    let sectionsHtml = "";
    Object.keys(CATEGORIES).forEach(catKey => {
      const cat = CATEGORIES[catKey];
      const mods = grouped[catKey] || [];

      sectionsHtml += `
        <div class="space-y-2 category-group" data-cat="${catKey}">
          <div class="flex items-center gap-2 px-1">
            <span class="text-xs">${cat.icon}</span>
            <span class="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">${cat.title}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-full ${cat.badgeClass}">${mods.length}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      `;

      mods.forEach(m => {
        const isCurrent = currentFile === m.url;
        sectionsHtml += `
          <a href="${m.url}" class="module-card group p-2.5 sm:p-3 rounded-2xl border transition-all duration-150 flex items-start gap-3 ${
            isCurrent 
              ? "bg-sky-500/15 border-sky-400/60 shadow-lg shadow-sky-500/10 text-white ring-1 ring-sky-400/40" 
              : "bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
          }" data-name="${m.name.toLowerCase()}" data-desc="${m.desc.toLowerCase()}" data-url="${m.url}">
            <div class="w-8 h-8 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-base shrink-0 group-hover:scale-110 transition">
              ${m.icon}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <span class="text-xs font-bold truncate group-hover:text-sky-300 transition">${m.name}</span>
                ${isCurrent ? '<span class="text-[9px] font-mono font-bold text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded-full border border-sky-800/60">ACTIVE</span>' : ''}
              </div>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">${m.desc}</p>
            </div>
          </a>
        `;
      });

      sectionsHtml += `
          </div>
        </div>
      `;
    });

    modal.innerHTML = `
      <div class="relative w-full max-w-4xl max-h-[90vh] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Modal Header -->
        <div class="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-lg">
                ❖
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-black text-white">All Enterprise Modules</h3>
                <span class="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">22 Active</span>
              </div>
              <p class="text-xs text-slate-400">BlueLine DataWorks Integrated Hockey Analytics Ecosystem</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <kbd class="hidden sm:inline-block px-2 py-1 text-[10px] font-mono font-bold text-slate-400 bg-slate-900 border border-slate-800 rounded-lg">ESC</kbd>
            <button id="closeAppLauncherBtn" class="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition">
              ✕
            </button>
          </div>
        </div>

        <!-- Real-Time Omni-Search Bar -->
        <div class="px-4 sm:px-5 py-3 border-b border-slate-800/80 bg-slate-950">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 text-xs">
              🔍
            </span>
            <input id="moduleSearchInput" type="text" placeholder="Search 22 modules, 170 colleges & high schools, or athletes... (e.g. 'Denver', 'Edina', 'Shattuck', 'draft', 'cap')" class="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition font-sans">
          </div>
        </div>

        <!-- Scrollable Module & Entity Cards Grid -->
        <div id="moduleCardsContainer" class="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          <!-- Dynamic Institutional & Player Matches Strip -->
          <div id="omniSearchEntityResults" class="hidden space-y-4 pb-2 border-b border-slate-800/80">
            <!-- Populated on live query -->
          </div>

          ${sectionsHtml}
          <div id="noModulesFound" class="hidden text-center py-12 text-slate-500 text-xs font-mono">
            No matching modules or institutions found. Try searching by keyword like "Denver", "Edina", "Shattuck", "trade", "rink", or "portal".
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-3.5 px-5 border-t border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-[11px] font-mono">Press <kbd class="text-slate-300 font-bold bg-slate-900 px-1 py-0.5 rounded border border-slate-800">Ctrl+K</kbd> anywhere to open</span>
          </div>
          <div class="text-[11px] text-slate-500 truncate max-w-md">
            BlueLine DataWorks • The only hockey analytics platform tracking athletes from youth through pro careers.
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Wire close events
    const closeBtn = document.getElementById("closeAppLauncherBtn");
    if (closeBtn) closeBtn.addEventListener("click", closeAppLauncher);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAppLauncher();
    });

    // Wire live search filter
    const searchInput = document.getElementById("moduleSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = modal.querySelectorAll(".module-card");
        const categoryGroups = modal.querySelectorAll(".category-group");
        const entityContainer = document.getElementById("omniSearchEntityResults");
        let visibleCount = 0;
        let entityMatchCount = 0;

        // 1. Check Institutions & Athletes if query has at least 2 characters
        if (query.length >= 2 && entityContainer) {
          let entityHtml = "";

          // Sourced from window.BlueLineInstitutionsCatalog
          if (window.BlueLineInstitutionsCatalog && typeof window.BlueLineInstitutionsCatalog.search === "function") {
            const matchingInsts = window.BlueLineInstitutionsCatalog.search(query).slice(0, 6);
            if (matchingInsts.length > 0) {
              entityMatchCount += matchingInsts.length;
              entityHtml += `
                <div class="space-y-2">
                  <div class="flex items-center justify-between px-1">
                    <span class="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span>🏫</span> COLLEGES & HIGH SCHOOLS (${matchingInsts.length} Matches)
                    </span>
                    <a href="database.html?q=${encodeURIComponent(query)}" class="text-[10px] text-sky-400 hover:text-sky-300 font-bold">View in Directory &rarr;</a>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    ${matchingInsts.map(inst => `
                      <a href="database.html?inst=${encodeURIComponent(inst.id)}&q=${encodeURIComponent(inst.shortName || inst.name)}" class="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-400 flex items-start gap-2.5 transition group">
                        <div class="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-sm shrink-0">
                          🏫
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="text-xs font-bold text-white group-hover:text-emerald-300 truncate">${inst.name}</div>
                          <div class="text-[10px] text-slate-400 truncate">${inst.category || inst.league} · ${inst.city}, ${inst.state}</div>
                        </div>
                      </a>
                    `).join('')}
                  </div>
                </div>
              `;
            }
          }

          // Check window.MASTER_PLAYERS if available
          if (window.MASTER_PLAYERS && Array.isArray(window.MASTER_PLAYERS)) {
            const matchingPlayers = window.MASTER_PLAYERS.filter(p => {
              return (p.name && p.name.toLowerCase().includes(query)) ||
                     (p.team && p.team.toLowerCase().includes(query));
            }).slice(0, 4);

            if (matchingPlayers.length > 0) {
              entityMatchCount += matchingPlayers.length;
              entityHtml += `
                <div class="space-y-2">
                  <div class="flex items-center justify-between px-1">
                    <span class="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <span>🏒</span> VERIFIED ATHLETES (${matchingPlayers.length} Matches)
                    </span>
                    <a href="database.html?q=${encodeURIComponent(query)}" class="text-[10px] text-sky-400 hover:text-sky-300 font-bold">Search All Athletes &rarr;</a>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${matchingPlayers.map(p => `
                      <a href="player.html?id=${p.id}" class="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-400 flex items-center gap-2.5 transition group">
                        <div class="w-8 h-8 rounded-lg bg-gradient-to-br ${p.avatar_gradient || 'from-sky-600 to-indigo-600'} text-white font-black text-xs flex items-center justify-center shrink-0">
                          #${p.num || '--'}
                        </div>
                        <div class="min-w-0 flex-1">
                          <div class="text-xs font-bold text-white group-hover:text-sky-300 truncate">${p.name}</div>
                          <div class="text-[10px] text-slate-400 truncate">${p.pos} · ${p.team} · Score: ${p.composite_score ? p.composite_score.toFixed(1) : '88.0'}</div>
                        </div>
                      </a>
                    `).join('')}
                  </div>
                </div>
              `;
            }
          }

          if (entityHtml) {
            entityContainer.innerHTML = entityHtml;
            entityContainer.classList.remove("hidden");
          } else {
            entityContainer.classList.add("hidden");
            entityContainer.innerHTML = "";
          }
        } else if (entityContainer) {
          entityContainer.classList.add("hidden");
          entityContainer.innerHTML = "";
        }

        // 2. Filter standard module cards
        cards.forEach(card => {
          const name = card.getAttribute("data-name") || "";
          const desc = card.getAttribute("data-desc") || "";
          const url = card.getAttribute("data-url") || "";
          const match = query.length === 0 || name.includes(query) || desc.includes(query) || url.includes(query);
          
          if (match) {
            card.classList.remove("hidden");
            visibleCount++;
          } else {
            card.classList.add("hidden");
          }
        });

        // Hide empty category groups
        categoryGroups.forEach(group => {
          const visibleInGroup = group.querySelectorAll(".module-card:not(.hidden)").length;
          if (visibleInGroup === 0) {
            group.classList.add("hidden");
          } else {
            group.classList.remove("hidden");
          }
        });

        const noFoundEl = document.getElementById("noModulesFound");
        if (noFoundEl) {
          if (visibleCount === 0 && entityMatchCount === 0) noFoundEl.classList.remove("hidden");
          else noFoundEl.classList.add("hidden");
        }
      });
    }
  }

  function openAppLauncher() {
    renderAppLauncherModal();
    const modal = document.getElementById("globalAppLauncherModal");
    if (modal) {
      modal.classList.remove("hidden");
      document.body.style.overflow = "hidden";
      const input = document.getElementById("moduleSearchInput");
      if (input) {
        input.value = "";
        input.focus();
        // Trigger input event to reset view
        input.dispatchEvent(new Event("input"));
      }
    }
  }

  function closeAppLauncher() {
    const modal = document.getElementById("globalAppLauncherModal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.style.overflow = "";
    }
  }

  function toggleAppLauncher() {
    const modal = document.getElementById("globalAppLauncherModal");
    if (modal && !modal.classList.contains("hidden")) {
      closeAppLauncher();
    } else {
      openAppLauncher();
    }
  }

  // Keyboard shortcut: Cmd+K / Ctrl+K / Escape
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      toggleAppLauncher();
    } else if (e.key === "Escape") {
      closeAppLauncher();
    }
  });

  // Export public API
  window.GlobalNav = {
    openAppLauncher,
    closeAppLauncher,
    toggleAppLauncher,
    modules: MODULES
  };

  // Expose global convenience functions
  window.openAppLauncher = openAppLauncher;
  window.closeAppLauncher = closeAppLauncher;
  window.toggleAppLauncher = toggleAppLauncher;

  // Auto-render modal in background on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderAppLauncherModal);
  } else {
    renderAppLauncherModal();
  }

})(window);
