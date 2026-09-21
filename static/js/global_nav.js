/**
 * BlueLine DataWorks: Unified Enterprise Navigation & Module Launcher
 * 
 * Provides:
 * - Responsive, zero-overflow top navigation architecture
 * - Categorized 22-Module Command Palette & Mega-Menu (App Launcher)
 * - Self-contained scoped styles (immune to missing external CSS / Tailwind)
 * - Keyboard shortcuts (Cmd+K / Ctrl+K to open, Esc to close)
 * - Real-time module search and filtering with institutional matches
 * - High-contrast readable cyber-slate typography (zero raw blue links)
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
    { id: "coach", name: "Coach Command Center", icon: "📋", url: "coach.html", cat: "coaching", desc: "Tactical lineup chemistry, practice drills, 24-skater roster & scout attendance" },
    { id: "tactics", name: "Tactics Lab", icon: "📊", url: "tactics.html", cat: "coaching", desc: "AI lineup optimizer, 5v5/PP/PK chemistry & xGF%" },
    { id: "scout", name: "Scout Workspace", icon: "🔭", url: "scout.html", cat: "coaching", desc: "🔒 Recruiter Pro Only ($22.99/mo) • Live micro-telemetry & prospect directory" },
    { id: "tournament", name: "Tournaments", icon: "🏆", url: "tournament.html", cat: "coaching", desc: "Bracketology war room: Frozen Four, Memorial Cup, WJC" },
    { id: "international", name: "International", icon: "🌍", url: "international.html", cat: "coaching", desc: "4 Nations Face-Off & 2026 Olympic Hub (85ft vs 100ft)" },

    // 4. Front Office & Career Market
    { id: "parent", name: "Parent & Family Advisor", icon: "🛡️", url: "parent.html", cat: "frontoffice", desc: "NCAA Clearinghouse eligibility, safe recruiter contact log & tournament travel" },
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
    rink: { title: "Rink & Game Operations", icon: "🏟️" },
    labs: { title: "Performance & Analytics Labs", icon: "🔬" },
    coaching: { title: "Coaching & Tournaments", icon: "📋" },
    frontoffice: { title: "Front Office & Career Market", icon: "💼" },
    system: { title: "Security & Intelligence", icon: "🛡️" }
  };

  // Self-Contained Scoped CSS Injection
  function ensureScopedStyles() {
    if (document.getElementById("blueline-global-nav-css")) return;

    const style = document.createElement("style");
    style.id = "blueline-global-nav-css";
    style.textContent = `
      #globalAppLauncherModal.hidden,
      #globalAppLauncherModal .hidden {
        display: none !important;
      }

      #globalAppLauncherModal {
        position: fixed !important;
        inset: 0 !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 999999 !important;
        background: rgba(2, 6, 23, 0.88) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 1rem !important;
        box-sizing: border-box !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
      }

      #globalAppLauncherModal * {
        box-sizing: border-box !important;
      }

      #globalAppLauncherModal .launcher-dialog {
        position: relative !important;
        width: 100% !important;
        max-width: 56rem !important;
        max-height: 88vh !important;
        background: #090d16 !important;
        border: 1px solid rgba(56, 189, 248, 0.3) !important;
        border-radius: 1.5rem !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.15) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }

      #globalAppLauncherModal .launcher-header {
        padding: 1.1rem 1.4rem !important;
        border-bottom: 1px solid rgba(51, 65, 85, 0.6) !important;
        background: rgba(15, 23, 42, 0.8) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 1rem !important;
      }

      #globalAppLauncherModal .launcher-brand {
        display: flex !important;
        align-items: center !important;
        gap: 0.75rem !important;
      }

      #globalAppLauncherModal .launcher-logo-box {
        width: 2.5rem !important;
        height: 2.5rem !important;
        border-radius: 0.875rem !important;
        background: linear-gradient(135deg, #0284c7, #6366f1) !important;
        padding: 2px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 0 15px rgba(56, 189, 248, 0.3) !important;
      }

      #globalAppLauncherModal .launcher-logo-inner {
        width: 100% !important;
        height: 100% !important;
        background: #030712 !important;
        border-radius: 0.75rem !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.1rem !important;
        color: #38bdf8 !important;
      }

      #globalAppLauncherModal .launcher-title-text {
        font-size: 1rem !important;
        font-weight: 800 !important;
        color: #ffffff !important;
        margin: 0 !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
      }

      #globalAppLauncherModal .launcher-badge-count {
        font-size: 0.65rem !important;
        font-family: monospace !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        padding: 0.15rem 0.5rem !important;
        border-radius: 9999px !important;
        background: rgba(56, 189, 248, 0.15) !important;
        color: #38bdf8 !important;
        border: 1px solid rgba(56, 189, 248, 0.4) !important;
      }

      #globalAppLauncherModal .launcher-subtitle {
        font-size: 0.75rem !important;
        color: #94a3b8 !important;
        margin: 0.15rem 0 0 0 !important;
      }

      #globalAppLauncherModal .launcher-close-btn {
        width: 2rem !important;
        height: 2rem !important;
        border-radius: 0.65rem !important;
        background: rgba(15, 23, 42, 0.8) !important;
        border: 1px solid rgba(51, 65, 85, 0.8) !important;
        color: #94a3b8 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        transition: all 0.15s ease !important;
        font-size: 0.9rem !important;
      }

      #globalAppLauncherModal .launcher-close-btn:hover {
        background: #ef4444 !important;
        border-color: #ef4444 !important;
        color: #ffffff !important;
      }

      #globalAppLauncherModal .launcher-search-wrap {
        padding: 0.75rem 1.4rem !important;
        border-bottom: 1px solid rgba(51, 65, 85, 0.6) !important;
        background: #06090e !important;
        position: relative !important;
      }

      #globalAppLauncherModal .launcher-search-icon {
        position: absolute !important;
        left: 2.1rem !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        color: #64748b !important;
        font-size: 0.85rem !important;
        pointer-events: none !important;
      }

      #globalAppLauncherModal .launcher-search-input {
        width: 100% !important;
        padding: 0.65rem 1rem 0.65rem 2.4rem !important;
        background: rgba(15, 23, 42, 0.9) !important;
        border: 1px solid rgba(56, 189, 248, 0.3) !important;
        border-radius: 0.75rem !important;
        color: #ffffff !important;
        font-size: 0.85rem !important;
        outline: none !important;
        transition: all 0.2s ease !important;
      }

      #globalAppLauncherModal .launcher-search-input:focus {
        border-color: #38bdf8 !important;
        box-shadow: 0 0 15px rgba(56, 189, 248, 0.3) !important;
        background: rgba(15, 23, 42, 1) !important;
      }

      #globalAppLauncherModal .launcher-body {
        padding: 1.25rem 1.4rem !important;
        overflow-y: auto !important;
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 1.25rem !important;
      }

      #globalAppLauncherModal .category-group {
        display: flex !important;
        flex-direction: column !important;
        gap: 0.5rem !important;
      }

      #globalAppLauncherModal .category-header {
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        padding: 0 0.25rem !important;
      }

      #globalAppLauncherModal .category-title {
        font-size: 0.75rem !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
        color: #38bdf8 !important;
      }

      #globalAppLauncherModal .category-badge {
        font-size: 0.65rem !important;
        font-family: monospace !important;
        padding: 0.1rem 0.45rem !important;
        border-radius: 9999px !important;
        background: rgba(56, 189, 248, 0.15) !important;
        color: #38bdf8 !important;
        border: 1px solid rgba(56, 189, 248, 0.3) !important;
      }

      #globalAppLauncherModal .modules-grid {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
        gap: 0.65rem !important;
      }

      #globalAppLauncherModal .module-card {
        display: flex !important;
        align-items: flex-start !important;
        gap: 0.75rem !important;
        padding: 0.75rem 0.85rem !important;
        border-radius: 0.875rem !important;
        background: rgba(15, 23, 42, 0.85) !important;
        border: 1px solid rgba(51, 65, 85, 0.7) !important;
        text-decoration: none !important;
        color: #ffffff !important;
        transition: all 0.15s ease !important;
        cursor: pointer !important;
      }

      #globalAppLauncherModal .module-card:hover {
        background: rgba(30, 41, 59, 0.95) !important;
        border-color: rgba(56, 189, 248, 0.6) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px -2px rgba(56, 189, 248, 0.25) !important;
      }

      #globalAppLauncherModal .module-card.active-module {
        background: rgba(14, 165, 233, 0.15) !important;
        border-color: rgba(56, 189, 248, 0.8) !important;
        box-shadow: 0 0 15px rgba(56, 189, 248, 0.2) !important;
      }

      #globalAppLauncherModal .module-icon-box {
        width: 2.25rem !important;
        height: 2.25rem !important;
        border-radius: 0.65rem !important;
        background: #020617 !important;
        border: 1px solid rgba(56, 189, 248, 0.3) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.1rem !important;
        flex-shrink: 0 !important;
      }

      #globalAppLauncherModal .module-content {
        min-width: 0 !important;
        flex: 1 !important;
      }

      #globalAppLauncherModal .module-title-row {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 0.5rem !important;
      }

      #globalAppLauncherModal .module-name {
        font-size: 0.82rem !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        text-decoration: none !important;
      }

      #globalAppLauncherModal .module-card:hover .module-name {
        color: #38bdf8 !important;
      }

      #globalAppLauncherModal .module-desc {
        font-size: 0.7rem !important;
        color: #94a3b8 !important;
        margin: 0.2rem 0 0 0 !important;
        line-height: 1.3 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        text-decoration: none !important;
      }

      #globalAppLauncherModal .module-active-tag {
        font-size: 0.6rem !important;
        font-family: monospace !important;
        font-weight: 800 !important;
        color: #38bdf8 !important;
        background: rgba(2, 6, 23, 0.8) !important;
        padding: 0.1rem 0.4rem !important;
        border-radius: 9999px !important;
        border: 1px solid rgba(56, 189, 248, 0.5) !important;
      }

      #globalAppLauncherModal .launcher-footer {
        padding: 0.75rem 1.4rem !important;
        border-top: 1px solid rgba(51, 65, 85, 0.6) !important;
        background: rgba(15, 23, 42, 0.7) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 1rem !important;
        color: #94a3b8 !important;
        font-size: 0.72rem !important;
      }

      #globalAppLauncherModal #noModulesFound {
        text-align: center !important;
        padding: 2.5rem 1rem !important;
        color: #94a3b8 !important;
        font-family: monospace !important;
        font-size: 0.8rem !important;
      }

      /* =========================================================================
         MOBILE APP BOTTOM NAVIGATION BAR & RESPONSIVE ARCHITECTURE
         ========================================================================= */
      @media (min-width: 769px) {
        #bluelineBottomNavBar {
          display: none !important;
        }
      }

      @media (max-width: 768px) {
        body {
          padding-bottom: calc(4.25rem + env(safe-area-inset-bottom, 0px)) !important;
        }

        #bluelineBottomNavBar {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
          height: calc(3.85rem + env(safe-area-inset-bottom, 0px)) !important;
          padding: 0.35rem 0.5rem calc(0.35rem + env(safe-area-inset-bottom, 0px)) 0.5rem !important;
          box-sizing: border-box !important;
          z-index: 99998 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-around !important;
          background: rgba(6, 9, 14, 0.94) !important;
          backdrop-filter: blur(24px) !important;
          -webkit-backdrop-filter: blur(24px) !important;
          border-top: 1px solid rgba(56, 189, 248, 0.28) !important;
          box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.5) !important;
        }

        .blueline-bottom-nav-item {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          flex: 1 !important;
          min-width: 0 !important;
          height: 100% !important;
          min-height: 44px !important;
          text-decoration: none !important;
          background: transparent !important;
          border: none !important;
          color: #94a3b8 !important;
          padding: 0.2rem 0 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          transition: all 0.15s ease !important;
          cursor: pointer !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .blueline-bottom-nav-item .bottom-nav-icon {
          font-size: 1.25rem !important;
          line-height: 1 !important;
          margin-bottom: 0.2rem !important;
          transition: transform 0.15s ease !important;
        }

        .blueline-bottom-nav-item .bottom-nav-label {
          font-size: 0.65rem !important;
          font-weight: 700 !important;
          letter-spacing: -0.01em !important;
          white-space: nowrap !important;
          line-height: 1 !important;
        }

        .blueline-bottom-nav-item:active {
          transform: scale(0.92) !important;
        }

        .blueline-bottom-nav-item.active {
          color: #38bdf8 !important;
        }

        .blueline-bottom-nav-item.active .bottom-nav-icon {
          transform: scale(1.1) !important;
          filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.6)) !important;
        }

        .blueline-bottom-nav-item.active .bottom-nav-label {
          color: #38bdf8 !important;
          font-weight: 800 !important;
        }

        /* Adjust Toast container on mobile to sit above bottom nav */
        #blueline-toast-container {
          bottom: calc(4.5rem + env(safe-area-inset-bottom, 0px)) !important;
          left: 0 !important;
          right: 0 !important;
          margin: 0 auto !important;
          max-width: 92% !important;
        }
      }

      /* Global Mobile Touch Ergonomics, Canvas Scaling & Anti-Horizontal-Wobble */
      html, body {
        max-width: 100vw !important;
        overflow-x: hidden !important;
        position: relative !important;
        -webkit-text-size-adjust: 100% !important;
        text-size-adjust: 100% !important;
      }

      img, video, svg {
        max-width: 100% !important;
        height: auto !important;
      }

      canvas {
        max-width: 100% !important;
      }

      @media screen and (max-width: 768px) {
        input[type="text"], input[type="email"], input[type="password"], input[type="search"], input[type="number"], select, textarea {
          font-size: 16px !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }

        button, a, select, input[type="button"], input[type="submit"], .role-chip-btn, .tab-btn {
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .blueline-bottom-nav-item, .nav-btn-sm, .btn-action-sm {
          min-height: 40px !important;
        }

        /* Responsive table scrolling */
        .table-responsive, .overflow-x-auto, [data-mobile-scroll="true"] {
          -webkit-overflow-scrolling: touch !important;
        }
      }

      @media (pointer: coarse) {
        ::-webkit-scrollbar {
          width: 4px !important;
          height: 4px !important;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(56, 189, 248, 0.3) !important;
          border-radius: 9999px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }


  // Role-Specific Feature Suites
  const ATHLETE_MODULE_IDS = ["app", "player", "community", "database", "combine", "compare", "pathway", "film"];
  const PARENT_MODULE_IDS = ["parent", "app", "community", "database", "combine", "pathway", "compare"];

  function getUserActiveRole() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const qRole = urlParams.get('role');
      if (qRole && ['athlete', 'parent', 'coach', 'scout', 'admin'].includes(qRole.toLowerCase())) {
        return qRole.toLowerCase();
      }
    } catch (e) {}

    try {
      if (window.BlueLineAuth && typeof window.BlueLineAuth.getCurrentUser === 'function') {
        const u = window.BlueLineAuth.getCurrentUser();
        if (u && u.role) return u.role.toLowerCase();
      }
    } catch (e) {}

    try {
      const raw = localStorage.getItem("blueline_auth_user");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.role) return parsed.role.toLowerCase();
      }
    } catch (e) {}

    const cur = getCurrentPageFilename();
    if (cur === "parent.html") return "parent";
    if (cur === "coach.html") return "coach";
    if (cur === "scout.html") return "scout";
    return "athlete";
  }

  function getCurrentPageFilename() {
    const path = window.location.pathname;
    const filename = path.split("/").pop();
    return filename && filename.length > 0 ? filename : "index.html";
  }

  function renderAppLauncherModal() {
    ensureScopedStyles();

    const activeRole = getUserActiveRole();
    const existingModal = document.getElementById("globalAppLauncherModal");
    if (existingModal) {
      if (existingModal.getAttribute("data-rendered-role") === activeRole) {
        return;
      }
      existingModal.remove();
    }

    const modal = document.createElement("div");
    modal.id = "globalAppLauncherModal";
    modal.className = "hidden";
    modal.style.display = "none";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("data-rendered-role", activeRole);

    const currentFile = getCurrentPageFilename();

    // Role-based module filtering: athletes and parents never see full suite of coach/scout tools
    let visibleModules = MODULES;
    let suiteTitle = "All Enterprise Modules";
    let suiteBadge = "22 Active";
    let suiteSub = "BlueLine DataWorks Integrated Hockey Analytics Ecosystem";
    let searchPlaceholder = "Search 22 modules, 170 colleges & high schools, or athletes... (e.g. 'Denver', 'Edina', 'scout', 'draft')";
    let upgradeBannerHtml = "";

    if (activeRole === "athlete") {
      visibleModules = MODULES.filter(m => ATHLETE_MODULE_IDS.includes(m.id));
      suiteTitle = "Athlete OS Suite";
      suiteBadge = `${visibleModules.length} Tools Active`;
      suiteSub = "Personal Athlete Intelligence, Bio-Telemetry & Career Development";
      searchPlaceholder = "Search athlete tools, colleges & high schools, or players... (e.g. 'Denver', 'combine', 'pathway')";
      upgradeBannerHtml = `
        <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.25); border-radius:0.75rem; padding:0.65rem 0.85rem; margin-bottom:1rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; font-size:0.75rem; color:#94a3b8;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span>⚡</span>
            <span>Player OS ($4.99/mo) • Filtered exclusively to athlete development features.</span>
          </div>
          <a href="signup.html" style="color:#38bdf8; font-weight:700; text-decoration:none;">Upgrade to Coach & Recruiter Pro ($22.99/mo) &rarr;</a>
        </div>
      `;
    } else if (activeRole === "parent") {
      visibleModules = MODULES.filter(m => PARENT_MODULE_IDS.includes(m.id));
      suiteTitle = "Family Advisor Suite";
      suiteBadge = `${visibleModules.length} Tools Active`;
      suiteSub = "NCAA Clearinghouse, Safe Recruiter Messaging & Travel Operations";
      searchPlaceholder = "Search family tools, colleges, or athlete directory... (e.g. 'clearinghouse', 'travel', 'Michigan')";
      upgradeBannerHtml = `
        <div style="background:rgba(15,23,42,0.9); border:1px solid rgba(236,72,153,0.25); border-radius:0.75rem; padding:0.65rem 0.85rem; margin-bottom:1rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; font-size:0.75rem; color:#94a3b8;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span>🛡️</span>
            <span>Family Guardian Mode Active • 100% NCAA Clearinghouse & Safe Recruiter DMs.</span>
          </div>
        </div>
      `;
    }

    // Group filtered modules by category
    const grouped = {};
    Object.keys(CATEGORIES).forEach(k => grouped[k] = []);
    visibleModules.forEach(m => {
      if (grouped[m.cat]) grouped[m.cat].push(m);
    });

    let sectionsHtml = "";
    Object.keys(CATEGORIES).forEach(catKey => {
      const cat = CATEGORIES[catKey];
      const mods = grouped[catKey] || [];
      if (mods.length === 0) return; // Skip non-applicable categories!

      sectionsHtml += `
        <div class="category-group" data-cat="${catKey}">
          <div class="category-header">
            <span style="font-size:0.85rem;">${cat.icon}</span>
            <span class="category-title">${cat.title}</span>
            <span class="category-badge">${mods.length}</span>
          </div>
          <div class="modules-grid">
      `;

      mods.forEach(m => {
        const isCurrent = currentFile === m.url;
        sectionsHtml += `
          <a href="${m.url}" class="module-card ${isCurrent ? 'active-module' : ''}" data-name="${m.name.toLowerCase()}" data-desc="${m.desc.toLowerCase()}" data-url="${m.url}">
            <div class="module-icon-box">
              ${m.icon}
            </div>
            <div class="module-content">
              <div class="module-title-row">
                <span class="module-name">${m.name}</span>
                ${isCurrent ? '<span class="module-active-tag">ACTIVE</span>' : ''}
              </div>
              <p class="module-desc">${m.desc}</p>
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
      <div class="launcher-dialog">
        
        <!-- Modal Header -->
        <div class="launcher-header">
          <div class="launcher-brand">
            <div class="launcher-logo-box">
              <div class="launcher-logo-inner">❖</div>
            </div>
            <div>
              <div class="launcher-title-text">
                ${suiteTitle}
                <span class="launcher-badge-count">${suiteBadge}</span>
              </div>
              <p class="launcher-subtitle">${suiteSub}</p>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem;">
            <kbd style="padding:0.2rem 0.5rem; font-size:0.7rem; font-family:monospace; font-weight:bold; color:#94a3b8; background:rgba(15,23,42,0.9); border:1px solid #334155; border-radius:0.4rem;">ESC</kbd>
            <button id="closeAppLauncherBtn" class="launcher-close-btn" title="Close (Esc)">✕</button>
          </div>
        </div>

        <!-- Real-Time Omni-Search Bar -->
        <div class="launcher-search-wrap">
          <span class="launcher-search-icon">🔍</span>
          <input id="moduleSearchInput" type="text" placeholder="${searchPlaceholder}" class="launcher-search-input">
        </div>

        <!-- Scrollable Module & Entity Cards Grid -->
        <div id="moduleCardsContainer" class="launcher-body">
          ${upgradeBannerHtml}
          <div id="omniSearchEntityResults" class="hidden" style="display:none;"></div>
          ${sectionsHtml}
          <div id="noModulesFound" class="hidden" style="display:none;">
            No matching tools or institutions found. Try searching by keyword like "Denver", "Edina", "combine", "pathway", or "wire".
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="launcher-footer">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="width:0.5rem; height:0.5rem; border-radius:50%; background:#10b981; display:inline-block;"></span>
            <span style="font-family:monospace; font-size:0.75rem;">Press <strong style="color:#e2e8f0;">Ctrl+K</strong> anywhere to open</span>
          </div>
          <div style="font-size:0.72rem; color:#64748b; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
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

          if (window.BlueLineInstitutionsCatalog && typeof window.BlueLineInstitutionsCatalog.search === "function") {
            const matchingInsts = window.BlueLineInstitutionsCatalog.search(query).slice(0, 6);
            if (matchingInsts.length > 0) {
              entityMatchCount += matchingInsts.length;
              entityHtml += `
                <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem; border-bottom:1px solid rgba(51,65,85,0.6); padding-bottom:1rem;">
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:0 0.25rem;">
                    <span style="font-size:0.75rem; font-family:monospace; font-weight:bold; color:#10b981; letter-spacing:0.05em; text-transform:uppercase;">
                      🏫 COLLEGES & HIGH SCHOOLS (${matchingInsts.length} Matches)
                    </span>
                    <a href="database.html?q=${encodeURIComponent(query)}" style="font-size:0.72rem; color:#38bdf8; font-weight:bold; text-decoration:none;">View in Directory &rarr;</a>
                  </div>
                  <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:0.65rem;">
                    ${matchingInsts.map(inst => `
                      <a href="database.html?inst=${encodeURIComponent(inst.id)}&q=${encodeURIComponent(inst.shortName || inst.name)}" class="module-card" style="border-color:rgba(16,185,129,0.4);">
                        <div class="module-icon-box" style="border-color:rgba(16,185,129,0.4); color:#10b981;">
                          🏫
                        </div>
                        <div class="module-content">
                          <div class="module-name" style="color:#ffffff;">${inst.name}</div>
                          <div class="module-desc" style="color:#94a3b8;">${inst.category || inst.league} · ${inst.city}, ${inst.state}</div>
                        </div>
                      </a>
                    `).join('')}
                  </div>
                </div>
              `;
            }
          }

          if (window.MASTER_PLAYERS && Array.isArray(window.MASTER_PLAYERS)) {
            const matchingPlayers = window.MASTER_PLAYERS.filter(p => {
              return (p.name && p.name.toLowerCase().includes(query)) ||
                     (p.team && p.team.toLowerCase().includes(query));
            }).slice(0, 4);

            if (matchingPlayers.length > 0) {
              entityMatchCount += matchingPlayers.length;
              entityHtml += `
                <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem; border-bottom:1px solid rgba(51,65,85,0.6); padding-bottom:1rem;">
                  <div style="display:flex; align-items:center; justify-content:space-between; padding:0 0.25rem;">
                    <span style="font-size:0.75rem; font-family:monospace; font-weight:bold; color:#38bdf8; letter-spacing:0.05em; text-transform:uppercase;">
                      🏒 VERIFIED ATHLETES (${matchingPlayers.length} Matches)
                    </span>
                    <a href="database.html?q=${encodeURIComponent(query)}" style="font-size:0.72rem; color:#38bdf8; font-weight:bold; text-decoration:none;">Search All Athletes &rarr;</a>
                  </div>
                  <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:0.65rem;">
                    ${matchingPlayers.map(p => `
                      <a href="player.html?id=${p.id}" class="module-card" style="border-color:rgba(56,189,248,0.4);">
                        <div class="module-icon-box" style="border-color:rgba(56,189,248,0.4); color:#38bdf8; font-weight:bold; font-size:0.75rem;">
                          #${p.num || '--'}
                        </div>
                        <div class="module-content">
                          <div class="module-name">${p.name}</div>
                          <div class="module-desc">${p.pos} · ${p.team} · Score: ${p.composite_score ? p.composite_score.toFixed(1) : '88.0'}</div>
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
            entityContainer.style.display = "block";
          } else {
            entityContainer.classList.add("hidden");
            entityContainer.style.display = "none";
            entityContainer.innerHTML = "";
          }
        } else if (entityContainer) {
          entityContainer.classList.add("hidden");
          entityContainer.style.display = "none";
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
            card.style.display = "flex";
            visibleCount++;
          } else {
            card.classList.add("hidden");
            card.style.display = "none";
          }
        });

        // Hide empty category groups
        categoryGroups.forEach(group => {
          const visibleInGroup = group.querySelectorAll(".module-card:not(.hidden)").length;
          if (visibleInGroup === 0) {
            group.classList.add("hidden");
            group.style.display = "none";
          } else {
            group.classList.remove("hidden");
            group.style.display = "flex";
          }
        });

        const noFoundEl = document.getElementById("noModulesFound");
        if (noFoundEl) {
          if (visibleCount === 0 && entityMatchCount === 0) {
            noFoundEl.classList.remove("hidden");
            noFoundEl.style.display = "block";
          } else {
            noFoundEl.classList.add("hidden");
            noFoundEl.style.display = "none";
          }
        }
      });
    }
  }

  function openAppLauncher() {
    renderAppLauncherModal();
    const modal = document.getElementById("globalAppLauncherModal");
    if (modal) {
      modal.classList.remove("hidden");
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";
      const input = document.getElementById("moduleSearchInput");
      if (input) {
        input.value = "";
        input.focus();
        input.dispatchEvent(new Event("input"));
      }
    }
  }

  function closeAppLauncher() {
    const modal = document.getElementById("globalAppLauncherModal");
    if (modal) {
      modal.classList.add("hidden");
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  }

  function toggleAppLauncher() {
    const modal = document.getElementById("globalAppLauncherModal");
    if (modal && modal.style.display !== "none" && !modal.classList.contains("hidden")) {
      closeAppLauncher();
    } else {
      openAppLauncher();
    }
  }

  function renderMobileBottomNav() {
    ensureScopedStyles();
    const activeRole = getUserActiveRole();
    const existingNav = document.getElementById("bluelineBottomNavBar");
    if (existingNav) {
      if (existingNav.getAttribute("data-rendered-role") === activeRole) {
        return;
      }
      existingNav.remove();
    }

    const nav = document.createElement("nav");
    nav.id = "bluelineBottomNavBar";
    nav.setAttribute("aria-label", "Mobile Quick Navigation");
    nav.setAttribute("data-rendered-role", activeRole);

    const currentFile = getCurrentPageFilename();

    let items = [];
    if (activeRole === "athlete") {
      // Athletes only see features applying to them (No Scout Desk, No 22 Modules)
      items = [
        { id: "home", label: "Home", icon: "🏠", url: "index.html", match: (f) => f === "index.html" || f === "" },
        { id: "athlete", label: "Player OS", icon: "⚡", url: "app.html?role=athlete", match: (f) => f === "app.html" },
        { id: "wire", label: "The Wire", icon: "🌐", url: "community.html", match: (f) => f === "community.html" },
        { id: "database", label: "Directory", icon: "📊", url: "database.html", match: (f) => f === "database.html" },
        { id: "passport", label: "Passport", icon: "👤", url: "player.html", match: (f) => f === "player.html" }
      ];
    } else if (activeRole === "parent") {
      // Parents only see features applying to them (No Scout Desk, No 22 Modules)
      items = [
        { id: "home", label: "Home", icon: "🏠", url: "index.html", match: (f) => f === "index.html" || f === "" },
        { id: "parent", label: "Parent Hub", icon: "🛡️", url: "parent.html", match: (f) => f === "parent.html" },
        { id: "athlete", label: "Player OS", icon: "⚡", url: "app.html?role=parent", match: (f) => f === "app.html" },
        { id: "wire", label: "The Wire", icon: "🌐", url: "community.html", match: (f) => f === "community.html" },
        { id: "database", label: "Directory", icon: "📊", url: "database.html", match: (f) => f === "database.html" }
      ];
    } else {
      // Coaches and Scouts see full pro tools & modules
      items = [
        { id: "home", label: "Home", icon: "🏠", url: "index.html", match: (f) => f === "index.html" || f === "" },
        { id: "desk", label: activeRole === "coach" ? "Coach Desk" : "Scout Desk", icon: activeRole === "coach" ? "📋" : "🔭", url: activeRole === "coach" ? "coach.html" : "scout.html", match: (f) => f === "coach.html" || f === "scout.html" },
        { id: "database", label: "Directory", icon: "📊", url: "database.html", match: (f) => f === "database.html" },
        { id: "scoreboard", label: "Game Center", icon: "📡", url: "scoreboard.html", match: (f) => f === "scoreboard.html" },
        { id: "modules", label: "22 Modules", icon: "❖", action: "openAppLauncher", match: () => false }
      ];
    }

    let itemsHtml = "";
    items.forEach(item => {
      const isActive = item.match(currentFile);
      if (item.action) {
        itemsHtml += `
          <button type="button" onclick="window.toggleAppLauncher()" class="blueline-bottom-nav-item ${isActive ? 'active' : ''}">
            <span class="bottom-nav-icon">${item.icon}</span>
            <span class="bottom-nav-label">${item.label}</span>
          </button>
        `;
      } else {
        itemsHtml += `
          <a href="${item.url}" class="blueline-bottom-nav-item ${isActive ? 'active' : ''}">
            <span class="bottom-nav-icon">${item.icon}</span>
            <span class="bottom-nav-label">${item.label}</span>
          </a>
        `;
      }
    });

    nav.innerHTML = itemsHtml;
    document.body.appendChild(nav);
  }

  function updateRoleNavigation() {
    renderAppLauncherModal();
    renderMobileBottomNav();
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
    renderMobileBottomNav,
    updateRoleNavigation,
    getUserActiveRole,
    modules: MODULES
  };

  // Expose global convenience functions
  window.openAppLauncher = openAppLauncher;
  window.closeAppLauncher = closeAppLauncher;
  window.toggleAppLauncher = toggleAppLauncher;
  window.updateRoleNavigation = updateRoleNavigation;

  // Auto-render modal & bottom nav in background on load
  function initGlobalNav() {
    renderAppLauncherModal();
    renderMobileBottomNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobalNav);
  } else {
    initGlobalNav();
  }

})(window);

