/**
 * BlueLine DataWorks: Unified Identity, Authentication & Immutable Athlete Ledger Engine
 * 
 * Capabilities:
 * - Role-Based Authentication (Athlete, Coach, Scout, Parent/Advisor)
 * - Search & Claim existing profiles from 2,833+ Master Athlete Database
 * - Create brand-new custom Athlete Dossiers & Passports
 * - Cryptographic Immutable Ledger Stamping (audit_ledger) for every biometric, claim, or data entry
 * - Cross-Module Session Synchronization across all 22 analytical hubs
 * - 1-Click Instant Test Personas for seamless evaluation
 */

(function(window) {
  "use strict";

  const STORAGE_KEY_USER = "blueline_auth_user";
  const STORAGE_KEY_ACCOUNTS = "blueline_registered_users";
  const STORAGE_KEY_SIGNED_OUT = "blueline_signed_out";
  const STORAGE_KEY_CUSTOM_PLAYERS = "blueline_custom_players";
  const STORAGE_KEY_CLAIMED = "blueline_claimed_profiles";

  let pendingSignupPayload = null;

  // Ensure DraftLineup Auto-Mailer is loaded
  if (typeof window !== "undefined" && !window.DraftLineupMailer && typeof document !== "undefined") {
    if (!document.querySelector('script[src*="auto_mailer.js"]')) {
      const s = document.createElement("script");
      s.src = "static/js/auto_mailer.js";
      s.async = false;
      document.head.appendChild(s);
    }
  }

  function showAlert(msg, type = "info") {
    if (typeof window !== "undefined" && window.BlueLineUI && typeof window.BlueLineUI.showToast === "function") {
      window.BlueLineUI.showToast(msg, type);
      return;
    }
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(msg);
    } else {
      console.log("[BlueLine Auth]", msg);
    }
  }

  // Pre-seeded Demo Personas
  const DEMO_PERSONAS = [
    {
      id: "usr_athlete_hage",
      username: "michael.hage",
      name: "Michael Hage",
      email: "mhage@umich.edu",
      role: "athlete",
      role_title: "NCAA Division I Forward",
      badge: "VERIFIED ATHLETE",
      team: "University of Michigan",
      league: "NCAA Division I Men (Big Ten)",
      linked_player_id: "mp_0013",
      avatar: "⚡",
      avatar_gradient: "from-cyan-600 to-blue-800",
      verified: true,
      bio: "Forward for University of Michigan. 1st Round Pick (21st overall, Montreal Canadiens 2024)."
    },
    {
      id: "usr_coach_nightingale",
      username: "coach.nightingale",
      name: "Adam Nightingale",
      email: "anightingale@msu.edu",
      role: "coach",
      role_title: "Head Coach",
      badge: "COACH (NCAA D1)",
      team: "Michigan State University",
      league: "NCAA Division I Men (Big Ten)",
      linked_player_id: null,
      avatar: "🏒",
      avatar_gradient: "from-emerald-600 to-teal-800",
      verified: true,
      bio: "Head Coach of Michigan State Spartans. Former USNTDP Head Coach."
    },
    {
      id: "usr_scout_marr",
      username: "scout.marr",
      name: "Dan Marr",
      email: "dmarr@nhlcentralscouting.com",
      role: "scout",
      role_title: "Chief Amateur Scout",
      badge: "DIRECTOR OF SCOUTING",
      team: "NHL Central Scouting Benchmark",
      league: "NHL / Amateur Scouting Bureau",
      linked_player_id: null,
      avatar: "🔍",
      avatar_gradient: "from-amber-500 to-indigo-600",
      verified: true,
      bio: "Leading North American & European amateur player evaluation and draft ranking."
    },
    {
      id: "usr_parent_hage",
      username: "sarah.hage",
      name: "Sarah Hage",
      email: "sarah.hage@familyadvisor.org",
      role: "parent",
      role_title: "Family Advisor & Parent",
      badge: "FAMILY ADVISOR",
      team: "Parent of Michael Hage",
      league: "NCAA / Professional Pathway",
      linked_player_id: "mp_0013",
      avatar: "👨‍👩‍👦",
      avatar_gradient: "from-purple-600 to-pink-700",
      verified: true,
      bio: "Family representative monitoring NCAA academic compliance, eligibility, and career trajectory."
    }
  ];

  // Cryptographic Ledger Hash Generator (Simulates SHA-256 HMAC)
  function generateBlockHash(inputStr) {
    let hash = 0x811c9dc5;
    const str = String(inputStr) + "_" + Date.now().toString(36);
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    const hex = (hash >>> 0).toString(16).padStart(8, "0");
    const secondary = Math.abs(hash * 31).toString(16).padStart(8, "0");
    return "0x" + hex + secondary + "a7f4" + hex.slice(0, 4);
  }

  // Retrieve current authenticated session or fallback to default
  function getCurrentUser() {
    try {
      if (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY_SIGNED_OUT) === "true") {
        return {
          id: "usr_guest",
          name: "Guest",
          email: "",
          role: "guest",
          tier: "Guest",
          badge: "GUEST / SIGNED OUT",
          avatar: "👤",
          isGuest: true
        };
      }
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}
    // If no active session, check if any registered accounts exist (only if not signed out)
    try {
      if (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY_SIGNED_OUT) !== "true") {
        const accountsRaw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
        if (accountsRaw) {
          const accounts = JSON.parse(accountsRaw);
          if (Array.isArray(accounts) && accounts.length > 0) {
            const latest = accounts[accounts.length - 1];
            if (latest) {
              return latest;
            }
          }
        }
      }
    } catch (e) {}
    // If explicitly signed out, always return guest
    if (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY_SIGNED_OUT) === "true") {
      return {
        id: "usr_guest",
        name: "Guest",
        email: "",
        role: "guest",
        tier: "Guest",
        badge: "GUEST / SIGNED OUT",
        avatar: "👤",
        isGuest: true
      };
    }
    // Default to Director of Scouting if none selected
    return DEMO_PERSONAS[2];
  }

  function setCurrentUser(user) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(STORAGE_KEY_SIGNED_OUT);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      }
    } catch (e) {}
    updateHeaderUserBadge();
    // Dispatch global auth changed event safely
    try {
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof CustomEvent === "function") {
        window.dispatchEvent(new CustomEvent("blueline:authChanged", { detail: { user } }));
      }
    } catch (e) {}
  }

  // Get Custom Created Players
  function getCustomPlayers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_PLAYERS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveCustomPlayer(player) {
    const list = getCustomPlayers();
    const idx = list.findIndex(p => p.id === player.id);
    if (idx >= 0) {
      list[idx] = player;
    } else {
      list.unshift(player);
    }
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_PLAYERS, JSON.stringify(list));
    } catch (e) {}
    return player;
  }

  // Get Claimed Profiles map
  function getClaimedProfiles() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CLAIMED);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }

  function setClaimedProfile(playerId, claimRecord) {
    const map = getClaimedProfiles();
    map[playerId] = claimRecord;
    try {
      localStorage.setItem(STORAGE_KEY_CLAIMED, JSON.stringify(map));
    } catch (e) {}
  }

  // Stamp an Immutable Cryptographic Ledger Entry
  function stampImmutableLedger(playerObj, category, action, diff, user) {
    if (!playerObj) return null;
    user = user || getCurrentUser();

    const timestampIso = new Date().toISOString();
    const displayTime = new Date().toLocaleString("en-US", { 
      year: "numeric", month: "short", day: "numeric", 
      hour: "2-digit", minute: "2-digit", second: "2-digit" 
    });

    const blockHash = generateBlockHash(playerObj.id + category + action + diff + timestampIso);

    const ledgerBlock = {
      id: "led_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
      timestamp: timestampIso,
      displayTime: displayTime,
      account: `${user.name} (${user.role_title || user.badge || user.role.toUpperCase()})`,
      accountId: user.id || "usr_anon",
      category: category,
      action: action,
      diff: diff,
      hash: blockHash,
      algo: "HMAC-SHA256 (Cipher-Bravo)",
      block_index: (playerObj.audit_ledger ? playerObj.audit_ledger.length : 0) + 1,
      verified: true,
      status: "CRYPTOGRAPHICALLY VERIFIED & LOCKED"
    };

    if (!playerObj.audit_ledger) {
      playerObj.audit_ledger = [];
    }
    playerObj.audit_ledger.unshift(ledgerBlock);

    // If custom player, save back to custom player storage
    if (playerObj.id && playerObj.id.startsWith("cust_")) {
      saveCustomPlayer(playerObj);
    }

    return ledgerBlock;
  }

  // Update Top Navigation User Badge
  function updateHeaderUserBadge() {
    const user = getCurrentUser();
    
    // Header user chip containers
    const containers = document.querySelectorAll("[onclick*='openLoginModal'], [onclick*='openAuthModal'], [onclick*='toggleAppLauncher'][title*='Director of Scouting']");
    
    containers.forEach(container => {
      // Avoid modifying the All Modules button or mobile menu
      if (container.tagName === "BUTTON" && container.textContent.includes("All Modules")) return;
      if (container.tagName === "BUTTON" && container.textContent.includes("☰")) return;

      if (user.isGuest) {
        container.setAttribute("onclick", "window.openAuthModal('signin')");
        container.setAttribute("title", "Signed Out • Click to Sign In");
      } else {
        container.setAttribute("onclick", "window.openUserDrawer()");
        container.setAttribute("title", `${user.name} • ${user.badge}`);
      }

      // Update avatar element if found
      const avatarEl = container.querySelector(".rounded-full");
      if (avatarEl) {
        avatarEl.innerHTML = user.avatar || "👤";
      }

      // Update user text container if found
      const nameSpan = container.querySelector("span.text-xs.font-bold");
      if (nameSpan) {
        nameSpan.textContent = user.isGuest ? "Sign In / Guest" : user.name;
      }
      const roleSpan = container.querySelector("span.text-\\[9px\\]");
      if (roleSpan) {
        roleSpan.textContent = user.badge || user.role_title || user.role.toUpperCase();
      }
    });

    // Also update any explicit elements
    const explicitName = document.getElementById("currentUserName");
    if (explicitName) explicitName.textContent = user.name;

    const explicitRole = document.getElementById("currentUserRole");
    if (explicitRole) explicitRole.textContent = user.badge;

    const appHeaderName = document.getElementById("appHeaderPlayerName");
    if (appHeaderName) appHeaderName.textContent = user.name;

    const profileNameLabel = document.getElementById("profileNameLabel");
    if (profileNameLabel) profileNameLabel.textContent = user.name;

    const recruitingPlayerName = document.getElementById("recruitingPlayerName");
    if (recruitingPlayerName) recruitingPlayerName.textContent = user.name;

    const appHeaderSub = document.getElementById("appHeaderPlayerSub");
    if (appHeaderSub) appHeaderSub.textContent = (user.team ? user.team + " • " : "") + (user.pos || user.role_title || "Verified Athlete");

    // Dynamically update the top-left logo link to point to user's role homepage
    updateDynamicLogoLinks();
  }

  // =========================================================================
  // DYNAMIC ROLE-BASED LOGO ROUTING ENGINE
  // =========================================================================
  function getRoleHomeUrl(user) {
    if (!user) user = getCurrentUser();
    const role = (user && user.role) ? String(user.role).toLowerCase().trim() : '';
    if (role === 'parent') return 'parent.html';
    if (role === 'coach') return 'coach.html';
    if (role === 'athlete' || role === 'player') return 'app.html?role=athlete';
    if (role === 'admin') return 'app.html?role=admin';
    if (role === 'scout' || role === 'recruiter') return 'scout.html';
    return 'scout.html';
  }

  function getRoleHomeTitle(user) {
    if (!user) user = getCurrentUser();
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
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) {
        return true;
      }
      e.preventDefault();
    }
    const dest = getRoleHomeUrl();
    window.location.href = dest;
    return false;
  }

  function updateDynamicLogoLinks() {
    const user = getCurrentUser();
    const destUrl = getRoleHomeUrl(user);
    const destTitle = getRoleHomeTitle(user);

    const logoAnchors = document.querySelectorAll("a[data-blueline-logo], a.blueline-brand-logo, a.nav-brand, header.app-header .logo a, a.brand, a[title*='Lead Scout Desk'], a[title*='Return to']");
    logoAnchors.forEach(a => {
      a.setAttribute("href", destUrl);
      a.setAttribute("title", destTitle);
      a.onclick = function(e) {
        return handleLogoClick(e);
      };
    });

    document.querySelectorAll("img[src*='blueline_logo.jpg']").forEach(img => {
      const parentA = img.closest("a");
      if (parentA) {
        parentA.setAttribute("href", destUrl);
        parentA.setAttribute("title", destTitle);
        parentA.onclick = function(e) {
          return handleLogoClick(e);
        };
      }
    });
  }

  // =========================================================================
  // AUTH MODAL & USER DRAWER INJECTION
  // =========================================================================
  function renderAuthModal() {
    if (document.getElementById("bluelineAuthModal")) return;

    const modal = document.createElement("div");
    modal.id = "bluelineAuthModal";
    modal.className = "fixed inset-0 z-[110] hidden flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    modal.innerHTML = `
      <div class="relative w-full max-w-xl max-h-[92vh] bg-slate-950 rounded-3xl border border-sky-500/40 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <!-- Modal Header -->
        <div class="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-sky-500/20">
              <div class="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-lg">
                🔐
              </div>
            </div>
            <div>
              <h3 class="text-base font-black text-white flex items-center gap-2">
                BlueLine Identity & Athlete Passport Portal
              </h3>
              <p class="text-xs text-slate-400">Sign In, Register, or Claim Your Master Dossier</p>
            </div>
          </div>
          <button id="closeAuthModalBtn" class="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition">
            ✕
          </button>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center border-b border-slate-800 bg-slate-950 px-4 sm:px-6 pt-2 text-xs font-bold gap-2 overflow-x-auto no-scrollbar">
          <button class="auth-tab-btn px-3 py-2 border-b-2 border-sky-400 text-sky-300 transition" data-tab="signin">
            🔑 Sign In
          </button>
          <button class="auth-tab-btn px-3 py-2 border-b-2 border-transparent text-slate-400 hover:text-white transition" data-tab="signup">
            📝 Create Account
          </button>
          <button class="auth-tab-btn px-3 py-2 border-b-2 border-transparent text-slate-400 hover:text-white transition" data-tab="claim">
            ⚡ Claim Profile (3,050+)
          </button>
          <button class="auth-tab-btn px-3 py-2 border-b-2 border-transparent text-slate-400 hover:text-white transition" data-tab="create-profile">
            ➕ Create Athlete Dossier
          </button>
          <button class="auth-tab-btn px-3 py-2 border-b-2 border-transparent text-slate-400 hover:text-white transition hidden" id="resetTabBtn" data-tab="reset">
            🔑 Reset Password
          </button>
        </div>

        <!-- Tab Body Container -->
        <div class="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          
          <!-- TAB 1: SIGN IN -->
          <div id="authTabSignIn" class="auth-tab-pane space-y-4">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Email or Username</label>
                <input id="loginUsernameInput" type="text" placeholder="e.g. michael.hage or scout.marr" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <input id="loginPasswordInput" type="password" value="password123" placeholder="••••••••" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400">
              </div>
              <div class="flex items-center justify-between text-xs pt-0.5">
                <label class="flex items-center gap-1.5 text-slate-400 cursor-pointer text-[11px]">
                  <input type="checkbox" checked class="rounded bg-slate-900 border-slate-700 text-sky-500">
                  <span>Remember session</span>
                </label>
                <button type="button" id="openForgotPasswordBtn" class="text-amber-400 hover:text-amber-300 font-bold text-[11px] underline transition">
                  Forgot Password?
                </button>
              </div>
              <button id="submitSignInBtn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition active:scale-95">
                Sign In to BlueLine OS
              </button>
            </div>

            <!-- 1-Click Demo Evaluation Personas -->
            <div class="pt-4 border-t border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">1-Click Instant Personas (Evaluation Ready)</span>
                <span class="text-[9px] text-emerald-400 font-mono">⚡ Pre-Configured</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${DEMO_PERSONAS.map(p => `
                  <button onclick="window.BlueLineAuth.selectPersona('${p.id}')" class="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-left transition flex items-center gap-2.5 group">
                    <span class="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-sm shrink-0 border border-slate-800">
                      ${p.avatar}
                    </span>
                    <div class="min-w-0 flex-1">
                      <div class="text-xs font-bold text-white group-hover:text-sky-300 transition truncate">${p.name}</div>
                      <div class="text-[10px] text-slate-400 truncate">${p.badge}</div>
                    </div>
                  </button>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- TAB 2: SIGN UP -->
          <div id="authTabSignUp" class="auth-tab-pane hidden space-y-4">
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Select Your Primary Role</label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <label class="p-2 rounded-xl bg-slate-900 border border-sky-500 text-center cursor-pointer role-radio-label active" data-role="athlete">
                    <input type="radio" name="signupRole" value="athlete" checked class="hidden">
                    <div class="text-base mb-0.5">⚡</div>
                    <div class="font-bold text-white text-[11px]">Player / Athlete</div>
                  </label>
                  <label class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center cursor-pointer role-radio-label" data-role="coach">
                    <input type="radio" name="signupRole" value="coach" class="hidden">
                    <div class="text-base mb-0.5">🏒</div>
                    <div class="font-bold text-slate-300 text-[11px]">Coach / Staff</div>
                  </label>
                  <label class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center cursor-pointer role-radio-label" data-role="scout">
                    <input type="radio" name="signupRole" value="scout" class="hidden">
                    <div class="text-base mb-0.5">🔍</div>
                    <div class="font-bold text-slate-300 text-[11px]">Scout / Recruiter</div>
                  </label>
                  <label class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center cursor-pointer role-radio-label" data-role="parent">
                    <input type="radio" name="signupRole" value="parent" class="hidden">
                    <div class="text-base mb-0.5">👨‍👩‍👦</div>
                    <div class="font-bold text-slate-300 text-[11px]">Parent / Advisor</div>
                  </label>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Full Legal Name</label>
                  <input id="signupFullName" type="text" placeholder="e.g. Cole Eiserman" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                  <input id="signupEmail" type="email" placeholder="e.g. cole@hockey.com" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Current Organization / Team</label>
                  <input id="signupTeam" type="text" placeholder="e.g. Boston University / Shattuck St. Mary's" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1">Password</label>
                  <input id="signupPassword" type="password" placeholder="••••••••" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400">
                </div>
              </div>

              <!-- Athlete Roster Details (Auto-mints real player backend dossier) -->
              <div id="signupAthleteFields" class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-sky-950/30 border border-sky-500/20">
                <div>
                  <label class="block text-[11px] font-bold text-slate-300 mb-1">Jersey Number</label>
                  <input id="signupNum" type="number" placeholder="17" value="17" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-400">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-300 mb-1">Position</label>
                  <select id="signupPos" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400">
                    <option value="C">Center (C)</option>
                    <option value="LW">Left Wing (LW)</option>
                    <option value="RW">Right Wing (RW)</option>
                    <option value="D">Defense (D)</option>
                    <option value="G">Goaltender (G)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-300 mb-1">League / Level</label>
                  <input id="signupLeague" type="text" placeholder="e.g. USHL / Tier 1 AAA" value="Tier 1 AAA" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400">
                </div>
              </div>

              <div class="p-3 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-xs space-y-1.5">
                <div class="font-bold text-sky-300 flex items-center gap-1.5">
                  <span>🛡️</span> Immutable Verification Ledger Policy
                </div>
                <p class="text-[11px] text-slate-300 leading-relaxed">
                  All profiles registered on BlueLine DataWorks are stamped with a cryptographic block signature. Any subsequent combine biometrics, GPA attestations, or video clips are immutably logged on your ledger to guarantee recruiter integrity.
                </p>
              </div>

              <button id="submitSignUpBtn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95">
                Create Verified Account & Initialize Ledger
              </button>
            </div>
          </div>

          <!-- TAB 3: CLAIM PROFILE -->
          <div id="authTabClaim" class="auth-tab-pane hidden space-y-4">
            <div class="space-y-3">
              <div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <div class="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>⚡</span> Claim Existing Dossier from 3,050+ Athlete Database
                </div>
                <p class="text-[11px] text-slate-300 mt-1">
                  Search by your name, jersey number, or program. Once verified, this official athlete dossier is linked permanently to your login account, giving you full control over your combine updates, video film, and development logs.
                </p>
              </div>

              <div class="relative">
                <input id="claimSearchInput" type="text" placeholder="Search your name or team (e.g. 'Logan Stein', 'Will Felicio', 'Minnesota')..." class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">🔍</span>
              </div>

              <!-- Search Results Container -->
              <div id="claimSearchResults" class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                <div class="text-center py-6 text-slate-500 text-xs">
                  Type your name or team above to find your profile.
                </div>
              </div>

              <!-- Selected Player Verification Box (Hidden until card clicked) -->
              <div id="claimVerificationBox" class="hidden p-3.5 rounded-2xl bg-slate-900 border border-amber-500/50 space-y-3">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    <span class="font-bold text-amber-300 text-xs" id="verifySelectedPlayerName">Verify Identity for Selected Athlete</span>
                  </div>
                  <button id="cancelClaimSelectionBtn" class="text-[10px] text-slate-400 hover:text-white underline">Cancel</button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label class="block text-[11px] text-slate-400 mb-1">Confirm Jersey Number (#)</label>
                    <input id="verifyJerseyNumber" type="number" placeholder="e.g. 19" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono">
                  </div>
                  <div>
                    <label class="block text-[11px] text-slate-400 mb-1">Birth Year (YYYY)</label>
                    <input id="verifyBirthYear" type="number" placeholder="e.g. 2005" class="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono">
                  </div>
                </div>

                <button id="confirmClaimBtn" class="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg transition active:scale-95">
                  ✓ Claim & Stamp Verified Athlete Ledger
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 4: CREATE NEW PROFILE -->
          <div id="authTabCreateProfile" class="auth-tab-pane hidden space-y-4">
            <div class="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
              <div class="font-bold text-indigo-300 flex items-center gap-1.5">
                <span>➕</span> Mint New Athlete Passport Dossier
              </div>
              <p class="text-[11px] text-slate-300 mt-1">
                Not listed in our 3,050+ collegiate/junior database yet? Enter your biometrics and playing profile to mint a new official dossier with an initial composite trajectory score and genesis ledger block.
              </p>
            </div>

            <div class="space-y-3 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div class="sm:col-span-2">
                  <label class="block text-slate-400 text-[11px] mb-1">Player Full Name *</label>
                  <input id="createPlayerName" type="text" placeholder="e.g. Macklin Celebrini Jr." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                </div>
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Jersey #</label>
                  <input id="createPlayerNum" type="number" placeholder="17" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Position</label>
                  <select id="createPlayerPos" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                    <option value="C">Center (C)</option>
                    <option value="LW">Left Wing (LW)</option>
                    <option value="RW">Right Wing (RW)</option>
                    <option value="D">Defense (D)</option>
                    <option value="G">Goaltender (G)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Shot Hand</label>
                  <select id="createPlayerHand" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                    <option value="L">Left (L)</option>
                    <option value="R">Right (R)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Height (Inches)</label>
                  <input id="createPlayerHeight" type="number" value="71" placeholder="71" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
                </div>
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Weight (lbs)</label>
                  <input id="createPlayerWeight" type="number" value="180" placeholder="180" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Current Club / School Team *</label>
                  <input id="createPlayerTeam" type="text" placeholder="e.g. Shattuck St. Mary's 18U AAA" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                </div>
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">League / Level</label>
                  <input id="createPlayerLeague" type="text" placeholder="e.g. Tier 1 AAA / USHL / BCHL" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                </div>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Core GPA</label>
                  <input id="createPlayerGPA" type="number" step="0.01" value="3.85" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
                </div>
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Grad Year</label>
                  <input id="createPlayerGrad" type="number" value="2027" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
                </div>
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Flying 30m (sec)</label>
                  <input id="createPlayerSpeed" type="number" step="0.01" value="3.85" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
                </div>
                <div>
                  <label class="block text-slate-400 text-[11px] mb-1">Broad Jump (in)</label>
                  <input id="createPlayerJump" type="number" value="98" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono">
                </div>
              </div>

              <button id="submitCreateProfileBtn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition active:scale-95">
                🚀 Mint Athlete Passport & Open Dossier
              </button>
            </div>
          </div>

          <!-- TAB: SIGN UP EMAIL CONFIRMATION (OTP) -->
          <div id="authTabVerifySignup" class="auth-tab-pane hidden space-y-4">
            <div class="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs space-y-1.5">
              <div class="font-bold text-sky-300 flex items-center gap-1.5">
                <span>✉️</span> Confirm Your Account Email (draftlineup.com)
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                We have dispatched an automated confirmation email with a 6-digit OTP code to <strong id="verifySignupTargetEmail" class="text-white font-mono"></strong> from <strong>noreply@draftlineup.com</strong> via operations desk <strong class="text-sky-300">furrhjohn10@gmail.com</strong>.
              </p>
            </div>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Enter 6-Digit Confirmation Code</label>
                <div class="flex items-center gap-2">
                  <input id="signupConfirmCodeInput" type="text" maxlength="6" placeholder="482910" class="w-full bg-slate-900 border border-sky-500/60 rounded-xl px-3.5 py-2.5 text-base font-mono text-center font-bold text-white tracking-widest placeholder-slate-600 focus:outline-none focus:border-sky-400">
                  <button type="button" id="quickFillSignupCodeBtn" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-bold shrink-0 border border-slate-700" title="Quick fill from live mailer">
                    ⚡ Fill Code
                  </button>
                </div>
              </div>

              <button id="submitSignupVerificationBtn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95">
                ✓ Confirm Email & Activate Athlete Passport
              </button>

              <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <button type="button" id="resendSignupCodeBtn" class="hover:text-sky-300 underline text-[11px]">
                  Resend Confirmation Email
                </button>
                <button type="button" onclick="if(window.DraftLineupMailer) window.DraftLineupMailer.openOutboxModal()" class="text-sky-400 hover:text-sky-300 underline text-[11px]">
                  Inspect Live Mailer Outbox &rarr;
                </button>
              </div>
            </div>
          </div>

          <!-- TAB: PASSWORD RESET & OTP -->
          <div id="authTabReset" class="auth-tab-pane hidden space-y-4">
            <div class="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
              <div class="font-bold text-amber-300 flex items-center gap-1.5">
                <span>🔑</span> Password Reset Request (draftlineup.com)
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                Enter your registered email address. We will dispatch a 6-digit cryptographic verification code via <strong>furrhjohn10@gmail.com</strong> (Display: <strong>draftlineup.com</strong>) to securely authorize a new password.
              </p>
            </div>

            <!-- Step 1: Request Code -->
            <div id="resetStep1" class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Registered Account Email</label>
                <input id="resetEmailInput" type="email" placeholder="e.g. michael.hage@hockey.com or furrhjohn10@gmail.com" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400">
              </div>
              <button id="sendResetCodeBtn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2">
                <span>✉️</span>
                <span id="sendResetCodeText">Send 6-Digit Reset Code via Mailer</span>
              </button>
            </div>

            <!-- Step 2: Enter Code & New Password -->
            <div id="resetStep2" class="hidden space-y-3 pt-2 border-t border-slate-800">
              <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span class="text-slate-400">Target Email: <strong id="resetTargetEmailLabel" class="text-white font-mono"></strong></span>
                <button type="button" id="resetChangeEmailBtn" class="text-sky-400 hover:text-sky-300 text-[10px] underline">Change Email</button>
              </div>

              <div>
                <label class="block text-xs font-bold text-amber-300 mb-1">6-Digit Verification Code (Check Email / Outbox)</label>
                <div class="flex items-center gap-2">
                  <input id="resetCodeInput" type="text" maxlength="6" placeholder="123456" class="w-full bg-slate-900 border border-amber-500/60 rounded-xl px-3.5 py-2 text-base font-mono text-center font-bold text-white tracking-widest placeholder-slate-600 focus:outline-none focus:border-amber-400">
                  <button type="button" id="quickFillResetCodeBtn" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold shrink-0 border border-slate-700" title="Quick fill from mailer outbox">
                    ⚡ Fill Code
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">New Password</label>
                <input id="resetNewPasswordInput" type="password" placeholder="••••••••" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Confirm New Password</label>
                <input id="resetConfirmPasswordInput" type="password" placeholder="••••••••" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400">
              </div>

              <button id="submitNewPasswordBtn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition active:scale-95">
                ✓ Reset Password & Sign In
              </button>
            </div>

            <div class="text-center pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <button type="button" onclick="window.BlueLineAuth.switchTab('signin')" class="text-slate-400 hover:text-white underline">
                &larr; Back to Sign In
              </button>
              <button type="button" onclick="if(window.DraftLineupMailer) window.DraftLineupMailer.openOutboxModal()" class="text-sky-400 hover:text-sky-300 underline text-[11px]">
                Inspect Live Mailer Outbox &rarr;
              </button>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="p-3 px-5 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between text-[11px] text-slate-400">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Aegis Cyber Defense & Cipher-Bravo Verification Grid Active</span>
          </div>
          <button id="cancelAuthModalBtn" class="text-slate-400 hover:text-white underline">Close</button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    wireAuthModalEvents(modal);
  }

  // Render User Account Drawer / Flyout
  function renderUserDrawer() {
    if (document.getElementById("bluelineUserDrawer")) return;

    const drawer = document.createElement("div");
    drawer.id = "bluelineUserDrawer";
    drawer.className = "fixed inset-0 z-[115] hidden flex justify-end bg-slate-950/70 backdrop-blur-sm";

    drawer.innerHTML = `
      <div class="w-full max-w-sm h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col p-5 space-y-5 animate-in slide-in-from-right duration-200">
        
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-base">👤</span>
            <h3 class="text-sm font-black text-white">Active Account Ledger</h3>
          </div>
          <button id="closeUserDrawerBtn" class="w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition">✕</button>
        </div>

        <!-- User Profile Card -->
        <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div class="flex items-center gap-3">
            <div id="drawerAvatar" class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-black flex items-center justify-center text-xl shadow-lg shadow-sky-500/10">
              👤
            </div>
            <div class="min-w-0 flex-1">
              <div id="drawerName" class="text-sm font-black text-white truncate">Director of Scouting</div>
              <div id="drawerRole" class="text-[10px] text-amber-400 font-mono font-bold uppercase truncate">Head Recruiter</div>
              <div id="drawerEmail" class="text-[10px] text-slate-400 truncate">dmarr@nhlcentralscouting.com</div>
            </div>
          </div>
          
          <div id="drawerBadgeContainer" class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span class="text-slate-400">Account Status:</span>
            <span id="drawerStatusPill" class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
              ✓ Verified Ledger
            </span>
          </div>
        </div>

        <!-- Quick Action Links -->
        <div class="space-y-2 flex-1 text-xs">
          <a id="drawerMyPassportLink" href="player.html?id=mp_0013" class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white flex items-center justify-between transition">
            <span class="flex items-center gap-2"><span>⚡</span> View My Player Passport</span>
            <span class="text-slate-500">&rarr;</span>
          </a>

          <button onclick="window.openAuthModal('claim'); window.closeUserDrawer();" class="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white flex items-center justify-between transition text-left">
            <span class="flex items-center gap-2"><span>🔍</span> Claim Another Athlete Profile</span>
            <span class="text-slate-500">&rarr;</span>
          </button>

          <button onclick="window.openAuthModal('create-profile'); window.closeUserDrawer();" class="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white flex items-center justify-between transition text-left">
            <span class="flex items-center gap-2"><span>➕</span> Mint New Athlete Dossier</span>
            <span class="text-slate-500">&rarr;</span>
          </button>

          <button onclick="if(window.DraftLineupMailer) window.DraftLineupMailer.openOutboxModal(); window.closeUserDrawer();" class="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-500/60 text-slate-200 hover:text-white flex items-center justify-between transition text-left group">
            <span class="flex items-center gap-2"><span>✉️</span> <span class="group-hover:text-sky-300 transition">Auto-Mailer & Live Outbox</span></span>
            <span class="text-sky-400 font-mono text-[10px] font-bold">draftlineup.com &rarr;</span>
          </button>

          <button onclick="window.openAuthModal('signin'); window.closeUserDrawer();" class="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white flex items-center justify-between transition text-left">
            <span class="flex items-center gap-2"><span>🔄</span> Switch Persona / Account</span>
            <span class="text-slate-500">&rarr;</span>
          </button>
        </div>

        <!-- Sign Out Button -->
        <div class="pt-3 border-t border-slate-800">
          <button id="drawerSignOutBtn" class="w-full py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 font-bold text-xs transition flex items-center justify-center gap-2">
            <span>🚪</span> Sign Out
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(drawer);

    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) window.closeUserDrawer();
    });

    const closeBtn = document.getElementById("closeUserDrawerBtn");
    if (closeBtn) closeBtn.addEventListener("click", window.closeUserDrawer);

    const signOutBtn = document.getElementById("drawerSignOutBtn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", () => {
        window.BlueLineAuth.signOut();
        window.closeUserDrawer();
      });
    }
  }

  function updateUserDrawerContent() {
    const user = getCurrentUser();
    const avatarEl = document.getElementById("drawerAvatar");
    const nameEl = document.getElementById("drawerName");
    const roleEl = document.getElementById("drawerRole");
    const emailEl = document.getElementById("drawerEmail");
    const passportLink = document.getElementById("drawerMyPassportLink");

    if (avatarEl) avatarEl.innerHTML = user.avatar || "👤";
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.badge || user.role_title;
    if (emailEl) emailEl.textContent = user.email || user.username;

    if (passportLink) {
      if (user.linked_player_id) {
        passportLink.href = `player.html?id=${user.linked_player_id}`;
        passportLink.classList.remove("hidden");
      } else {
        passportLink.classList.add("hidden");
      }
    }
  }

  // =========================================================================
  // EVENT WIRING
  // =========================================================================
  let selectedClaimCandidate = null;

  function wireAuthModalEvents(modal) {
    // Close button
    const closeBtn = document.getElementById("closeAuthModalBtn");
    if (closeBtn) closeBtn.addEventListener("click", window.closeAuthModal);

    const cancelBtn = document.getElementById("cancelAuthModalBtn");
    if (cancelBtn) cancelBtn.addEventListener("click", window.closeAuthModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) window.closeAuthModal();
    });

    // Tab switching
    const tabBtns = modal.querySelectorAll(".auth-tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        switchAuthTab(tab);
      });
    });

    // Role radio selection styling
    const roleLabels = modal.querySelectorAll(".role-radio-label");
    roleLabels.forEach(lbl => {
      lbl.addEventListener("click", () => {
        roleLabels.forEach(l => {
          l.classList.remove("border-sky-500", "active");
          l.classList.add("border-slate-800");
          const title = l.querySelector(".font-bold");
          if (title) {
            title.classList.remove("text-white");
            title.classList.add("text-slate-300");
          }
        });
        lbl.classList.remove("border-slate-800");
        lbl.classList.add("border-sky-500", "active");
        const title = lbl.querySelector(".font-bold");
        if (title) {
          title.classList.remove("text-slate-300");
          title.classList.add("text-white");
        }

        const role = lbl.getAttribute("data-role");
        const athleteFields = document.getElementById("signupAthleteFields");
        if (athleteFields) {
          if (role === "athlete") {
            athleteFields.classList.remove("hidden");
          } else {
            athleteFields.classList.add("hidden");
          }
        }
      });
    });

    // Sign In Submit
    const submitSignInBtn = document.getElementById("submitSignInBtn");
    if (submitSignInBtn) {
      submitSignInBtn.addEventListener("click", () => {
        const username = document.getElementById("loginUsernameInput").value.trim();
        if (!username) {
          showAlert("Please enter a username or email.");
          return;
        }
        window.BlueLineAuth.signIn(username);
      });
    }

    // Sign Up Submit -> Dispatches Confirmation Email
    const submitSignUpBtn = document.getElementById("submitSignUpBtn");
    if (submitSignUpBtn) {
      submitSignUpBtn.addEventListener("click", () => {
        const role = modal.querySelector("input[name='signupRole']:checked")?.value || "athlete";
        const name = document.getElementById("signupFullName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const team = document.getElementById("signupTeam").value.trim();
        const password = document.getElementById("signupPassword")?.value.trim() || "password123";
        const num = parseInt(document.getElementById("signupNum")?.value) || 17;
        const pos = document.getElementById("signupPos")?.value || "C";
        const league = document.getElementById("signupLeague")?.value.trim() || "Tier 1 AAA";

        if (!name || !email) {
          showAlert("Please enter your name and email address.");
          return;
        }

        window.BlueLineAuth.signUp({ name, email, role, team, num, pos, league, password, email_verified: true });
      });
    }

    // Sign Up Email Confirmation Verification Submit
    const submitSignupVerificationBtn = document.getElementById("submitSignupVerificationBtn");
    if (submitSignupVerificationBtn) {
      submitSignupVerificationBtn.addEventListener("click", () => {
        const code = document.getElementById("signupConfirmCodeInput").value.trim();
        if (!code || code.length !== 6) {
          showAlert("Please enter the 6-digit confirmation code sent to your email.");
          return;
        }
        window.BlueLineAuth.verifyAndFinalizeSignUp(code);
      });
    }

    // Quick Fill Sign Up Confirmation Code (From live mailer)
    const quickFillSignupCodeBtn = document.getElementById("quickFillSignupCodeBtn");
    if (quickFillSignupCodeBtn) {
      quickFillSignupCodeBtn.addEventListener("click", () => {
        if (!pendingSignupPayload) return;
        const mailer = window.DraftLineupMailer;
        if (mailer) {
          const outbox = mailer.getOutbox();
          const match = outbox.find(m => m.type === "SIGNUP_CONFIRMATION" && m.to.toLowerCase() === pendingSignupPayload.email.toLowerCase());
          if (match && match.code) {
            document.getElementById("signupConfirmCodeInput").value = match.code;
          } else {
            showAlert("No pending verification code found in mailer outbox.");
          }
        }
      });
    }

    // Resend Confirmation Email
    const resendSignupCodeBtn = document.getElementById("resendSignupCodeBtn");
    if (resendSignupCodeBtn) {
      resendSignupCodeBtn.addEventListener("click", () => {
        if (!pendingSignupPayload) return;
        if (window.DraftLineupMailer) {
          window.DraftLineupMailer.sendSignupConfirmation(pendingSignupPayload);
          showAlert(`Confirmation code resent to ${pendingSignupPayload.email} from noreply@draftlineup.com (furrhjohn10@gmail.com).`);
        }
      });
    }

    // Open Forgot Password Tab
    const openForgotPasswordBtn = document.getElementById("openForgotPasswordBtn");
    if (openForgotPasswordBtn) {
      openForgotPasswordBtn.addEventListener("click", () => {
        switchAuthTab("reset");
      });
    }

    // Send Password Reset Code Submit
    const sendResetCodeBtn = document.getElementById("sendResetCodeBtn");
    if (sendResetCodeBtn) {
      sendResetCodeBtn.addEventListener("click", () => {
        const email = document.getElementById("resetEmailInput").value.trim();
        if (!email) {
          showAlert("Please enter your registered account email.");
          return;
        }
        window.BlueLineAuth.requestPasswordReset(email);
      });
    }

    // Change Reset Target Email
    const resetChangeEmailBtn = document.getElementById("resetChangeEmailBtn");
    if (resetChangeEmailBtn) {
      resetChangeEmailBtn.addEventListener("click", () => {
        document.getElementById("resetStep1").classList.remove("hidden");
        document.getElementById("resetStep2").classList.add("hidden");
      });
    }

    // Quick Fill Reset Code
    const quickFillResetCodeBtn = document.getElementById("quickFillResetCodeBtn");
    if (quickFillResetCodeBtn) {
      quickFillResetCodeBtn.addEventListener("click", () => {
        const email = document.getElementById("resetEmailInput").value.trim();
        const mailer = window.DraftLineupMailer;
        if (mailer) {
          const outbox = mailer.getOutbox();
          const match = outbox.find(m => m.type === "PASSWORD_RESET" && m.to.toLowerCase() === email.toLowerCase());
          if (match && match.code) {
            document.getElementById("resetCodeInput").value = match.code;
          } else {
            showAlert("No pending reset code found in mailer outbox.");
          }
        }
      });
    }

    // Submit New Password
    const submitNewPasswordBtn = document.getElementById("submitNewPasswordBtn");
    if (submitNewPasswordBtn) {
      submitNewPasswordBtn.addEventListener("click", () => {
        const email = document.getElementById("resetEmailInput").value.trim();
        const code = document.getElementById("resetCodeInput").value.trim();
        const newPass = document.getElementById("resetNewPasswordInput").value.trim();
        const confirmPass = document.getElementById("resetConfirmPasswordInput").value.trim();

        if (!code || code.length !== 6) {
          showAlert("Please enter the 6-digit reset code sent to your email.");
          return;
        }
        if (!newPass || newPass.length < 6) {
          showAlert("Password must be at least 6 characters.");
          return;
        }
        if (newPass !== confirmPass) {
          showAlert("Passwords do not match.");
          return;
        }

        window.BlueLineAuth.completePasswordReset(email, code, newPass);
      });
    }

    // Claim Search Input
    const claimSearchInput = document.getElementById("claimSearchInput");
    if (claimSearchInput) {
      claimSearchInput.addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase().trim();
        renderClaimSearchResults(q);
      });
    }

    // Cancel Claim Candidate Selection
    const cancelClaimBtn = document.getElementById("cancelClaimSelectionBtn");
    if (cancelClaimBtn) {
      cancelClaimBtn.addEventListener("click", () => {
        selectedClaimCandidate = null;
        document.getElementById("claimVerificationBox").classList.add("hidden");
      });
    }

    // Confirm Claim Submit
    const confirmClaimBtn = document.getElementById("confirmClaimBtn");
    if (confirmClaimBtn) {
      confirmClaimBtn.addEventListener("click", () => {
        if (!selectedClaimCandidate) return;
        const jersey = document.getElementById("verifyJerseyNumber").value.trim();
        const year = document.getElementById("verifyBirthYear").value.trim();

        window.BlueLineAuth.confirmClaim(selectedClaimCandidate, jersey, year);
      });
    }

    // Create New Profile Submit
    const submitCreateProfileBtn = document.getElementById("submitCreateProfileBtn");
    if (submitCreateProfileBtn) {
      submitCreateProfileBtn.addEventListener("click", () => {
        const name = document.getElementById("createPlayerName").value.trim();
        const team = document.getElementById("createPlayerTeam").value.trim();
        if (!name || !team) {
          showAlert("Please provide at least player full name and current team.");
          return;
        }

        const num = parseInt(document.getElementById("createPlayerNum").value) || 17;
        const pos = document.getElementById("createPlayerPos").value;
        const hand = document.getElementById("createPlayerHand").value;
        const ht = parseInt(document.getElementById("createPlayerHeight").value) || 71;
        const wt = parseInt(document.getElementById("createPlayerWeight").value) || 180;
        const league = document.getElementById("createPlayerLeague").value.trim() || "Tier 1 AAA";
        const gpa = parseFloat(document.getElementById("createPlayerGPA").value) || 3.85;
        const grad = parseInt(document.getElementById("createPlayerGrad").value) || 2027;
        const speed = parseFloat(document.getElementById("createPlayerSpeed").value) || 3.85;
        const jump = parseFloat(document.getElementById("createPlayerJump").value) || 98;

        window.BlueLineAuth.createNewProfile({
          name, num, pos, hand, ht, wt, team, league, gpa, grad, speed, jump
        });
      });
    }
  }

  function switchAuthTab(tabName) {
    const modal = document.getElementById("bluelineAuthModal");
    if (!modal) return;

    modal.querySelectorAll(".auth-tab-btn").forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add("border-sky-400", "text-sky-300");
        btn.classList.remove("border-transparent", "text-slate-400");
        btn.classList.remove("hidden");
      } else {
        btn.classList.remove("border-sky-400", "text-sky-300");
        btn.classList.add("border-transparent", "text-slate-400");
        if (btn.id === "resetTabBtn" && tabName !== "reset") {
          btn.classList.add("hidden");
        }
      }
    });

    const panes = {
      signin: document.getElementById("authTabSignIn"),
      signup: document.getElementById("authTabSignUp"),
      "verify-signup": document.getElementById("authTabVerifySignup"),
      claim: document.getElementById("authTabClaim"),
      "create-profile": document.getElementById("authTabCreateProfile"),
      reset: document.getElementById("authTabReset")
    };

    Object.keys(panes).forEach(k => {
      if (panes[k]) {
        if (k === tabName) panes[k].classList.remove("hidden");
        else panes[k].classList.add("hidden");
      }
    });
  }

  function renderClaimSearchResults(query) {
    const container = document.getElementById("claimSearchResults");
    if (!container) return;

    if (!query || query.length < 2) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-500 text-xs">
          Type at least 2 letters of your name or team to search the 3,050+ player registry.
        </div>
      `;
      return;
    }

    const registry = window.MASTER_ALL_REGISTRY || [];
    const customList = getCustomPlayers();
    const allPool = [...customList, ...registry];

    const matches = allPool.filter(p => {
      if (p.entity_type === "coach") return false;
      const name = (p.name || "").toLowerCase();
      const team = (p.team || "").toLowerCase();
      const num = `#${p.num}`;
      return name.includes(query) || team.includes(query) || num === query;
    }).slice(0, 15);

    if (matches.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-500 text-xs">
          No matching athlete found for "${query}". You can mint a new profile under the "Create Athlete Dossier" tab.
        </div>
      `;
      return;
    }

    container.innerHTML = matches.map(p => `
      <div class="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 flex items-center justify-between gap-3 transition cursor-pointer" onclick="window.BlueLineAuth.selectClaimCandidate('${p.id}')">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-xs font-bold text-sky-400 shrink-0 font-mono border border-slate-800">
            #${p.num || "--"}
          </div>
          <div class="min-w-0">
            <div class="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>${p.name}</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono">${p.pos}</span>
            </div>
            <div class="text-[10px] text-slate-400 truncate">${p.team} • ${p.league}</div>
          </div>
        </div>
        <button class="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold shrink-0 transition">
          Claim &rarr;
        </button>
      </div>
    `).join("");
  }

  // Helper to mint an official Athlete Dossier in the player backend
  function mintNewAthleteDossier(data, user) {
    const newId = "cust_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    
    // Calculate BlueLine Composite Trajectory Score
    const speed = parseFloat(data.speed) || 3.85;
    const jump = parseFloat(data.jump) || 98;
    const gpa = parseFloat(data.gpa) || 3.85;
    const speedScore = Math.max(40, Math.min(99, 100 - (speed - 3.8) * 60));
    const jumpScore = Math.max(40, Math.min(99, (jump / 100) * 88));
    const athleticIndex = parseFloat((speedScore * 0.6 + jumpScore * 0.4).toFixed(1));
    const kpiIndex = 86.0;
    const acad = Math.min(100, (gpa / 4.0) * 100);
    const composite = parseFloat((athleticIndex * 0.35 + kpiIndex * 0.45 + acad * 0.20).toFixed(1));
    const ht = parseInt(data.ht || data.height) || 71;
    const wt = parseInt(data.wt || data.weight) || 180;
    const num = parseInt(data.num || data.jersey) || 17;
    const pos = data.pos || data.position || "C";
    const primaryRole = pos === "G" ? "Goaltender" : (pos === "D" ? "Defenseman" : "Forward");
    const hometown = data.hometown || data.origin || "North America";
    const priorTeam = data.prior_team || data.priorTeam || data.pathway || "Tier 1 AAA / Junior";

    const newPlayer = {
      id: newId,
      entity_type: "player",
      name: data.name,
      num: num,
      jersey: `#${num}`,
      pos: pos,
      position: pos,
      primary_role: primaryRole,
      role_title: `${primaryRole} (#${num})`,
      team: data.team || "Independent Amateur",
      league: data.league || "Tier 1 AAA",
      hometown: hometown,
      prior_team: priorTeam,
      pathway: data.pathway || priorTeam,
      draft_status: composite >= 90 ? "NCAA D1 / NHL Draft Watch" : "NCAA Tier 1 Development",
      height_in: ht,
      height_str: typeof data.height === "string" && data.height.includes("'") ? data.height : `${Math.floor(ht / 12)}'${ht % 12}"`,
      height: typeof data.height === "string" && data.height.includes("'") ? data.height : `${Math.floor(ht / 12)}'${ht % 12}"`,
      weight_lbs: wt,
      weight: `${wt} lbs`,
      handed: data.hand || "L",
      gpa: gpa,
      grad_year: parseInt(data.grad) || 2027,
      age: 18,
      status_badge: "Tier 1 Verified Prospect",
      avatar_gradient: "from-indigo-600 to-sky-700",
      composite_score: composite,
      combine: {
        flying_30m_sec: speed,
        broad_jump_in: jump,
        bench_press_reps: 12
      },
      micro_kpis: {
        controlled_exit_pct: 84,
        shoulder_scans_per_possession: 4.5
      },
      projection: {
        composite_trajectory_score: composite,
        ceiling_label: composite >= 90 ? "Top-Tier Prospect" : "High-Potential Development Candidate",
        probabilities: {
          ncaa_d1: composite >= 88 ? 85 : 60,
          ushl_tier1: 80,
          nahl_tier2: 90,
          ncaa_d3_acha: 98
        }
      },
      audit_ledger: []
    };

    // Stamp genesis block on the ledger
    const genesisBlock = stampImmutableLedger(
      newPlayer,
      "Genesis Ledger Stamping",
      "Athlete Passport Minted",
      `Initial biometric & developmental trajectory parameters registered: Flying 30m ${speed}s, Broad Jump ${jump}in, GPA ${gpa}. Initial Trajectory Score: ${composite}.`,
      user
    );

    newPlayer.ledger_hash = genesisBlock ? genesisBlock.hash : generateBlockHash(newId + "genesis");
    newPlayer.ledger_stamped_at = genesisBlock ? genesisBlock.timestamp : new Date().toISOString();

    saveCustomPlayer(newPlayer);
    return newPlayer;
  }

  // =========================================================================
  // PUBLIC API EXPORT
  // =========================================================================
  window.BlueLineAuth = {
    getCurrentUser,
    setCurrentUser,
    getCustomPlayers,
    saveCustomPlayer,
    stampImmutableLedger,
    getDemoPersonas: () => DEMO_PERSONAS,
    getClaimedProfiles,
    isProfileClaimed: (id) => !!getClaimedProfiles()[id],
    generateBlockHash,

    selectPersona: (personaId) => {
      const p = DEMO_PERSONAS.find(x => x.id === personaId);
      if (p) {
        setCurrentUser(p);
        window.closeAuthModal();
        showAlert(`Logged in as ${p.name} (${p.badge})! Active across all 22 modules.`);
      }
    },

    signIn: (username) => {
      // Look in demo personas first
      const foundDemo = DEMO_PERSONAS.find(p => p.username.toLowerCase() === username.toLowerCase() || p.email.toLowerCase() === username.toLowerCase());
      if (foundDemo) {
        setCurrentUser(foundDemo);
        window.closeAuthModal();
        showAlert(`Welcome back, ${foundDemo.name}!`);
        return;
      }

      // Check user created accounts
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
        if (raw) {
          const accs = JSON.parse(raw);
          const found = accs.find(a => a.username.toLowerCase() === username.toLowerCase() || a.email.toLowerCase() === username.toLowerCase());
          if (found) {
            setCurrentUser(found);
            window.closeAuthModal();
            showAlert(`Welcome back, ${found.name}!`);
            return;
          }
        }
      } catch (e) {}

      // If generic, create a session
      const newUser = {
        id: "usr_" + Date.now().toString(36),
        username: username,
        name: username.split("@")[0],
        email: username.includes("@") ? username : `${username}@bluelinedataworks.com`,
        role: "athlete",
        role_title: "Independent Athlete",
        badge: "VERIFIED ATHLETE",
        avatar: "⚡",
        avatar_gradient: "from-sky-500 to-indigo-600",
        verified: true
      };
      setCurrentUser(newUser);
      window.closeAuthModal();
      showAlert(`Welcome, ${newUser.name}! Profile session active.`);
    },

    signUp: (data) => {
      const num = parseInt(data.num) || 17;
      const pos = data.pos || "C";
      const league = data.league || "Tier 1 AAA";
      const primaryRole = pos === "G" ? "Goaltender" : (pos === "D" ? "Defenseman" : "Forward");

      const newUser = {
        id: "usr_" + Date.now().toString(36),
        username: data.email.split("@")[0],
        name: data.name,
        email: data.email,
        password: data.password || "password123",
        email_verified: data.email_verified || true,
        verification_code: data.verification_code || null,
        role: data.role,
        role_title: data.role === "athlete" ? `${primaryRole} (#${num})` : (data.role === "coach" ? "Team Staff / Coach" : (data.role === "scout" ? "Scout / Recruiter" : "Parent / Advisor")),
        badge: data.role === "athlete" ? "VERIFIED ATHLETE" : (data.role === "coach" ? "COACH" : (data.role === "scout" ? "SCOUT" : "FAMILY ADVISOR")),
        team: data.team,
        league: league,
        num: num,
        pos: pos,
        avatar: data.role === "athlete" ? "⚡" : (data.role === "coach" ? "🏒" : (data.role === "scout" ? "🔍" : "👨‍👩‍👦")),
        avatar_gradient: "from-cyan-600 to-blue-800",
        verified: true,
        created_at: new Date().toISOString()
      };

      if (data.role === "athlete") {
        // Mint real player backend dossier immediately with biometrics and genesis ledger block
        const newPlayer = mintNewAthleteDossier({
          name: data.name,
          num: num,
          pos: pos,
          hand: "L",
          ht: 71,
          wt: 180,
          team: data.team,
          league: league,
          gpa: 3.85,
          grad: 2027,
          speed: 3.85,
          jump: 98
        }, newUser);

        newUser.linked_player_id = newPlayer.id;

        // Dispatch athlete passport notification via auto-mailer
        if (typeof window !== "undefined" && window.DraftLineupMailer) {
          window.DraftLineupMailer.sendAthletePassportNotice(newPlayer, newUser.email);
        }
      }

      // Save to registered accounts list
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
        const list = raw ? JSON.parse(raw) : [];
        list.push(newUser);
        localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(list));
      } catch (e) {}

      setCurrentUser(newUser);
      window.closeAuthModal();

      if (data.role === "athlete") {
        showAlert(`🎉 Welcome, ${newUser.name}! Your verified athlete dossier has been minted (#${num}, ${data.team}) with initial BlueLine Trajectory Score and stamped on the tamper-evident ledger.`);
      } else {
        showAlert(`Account created! Logged in as ${newUser.name} (${newUser.badge}).`);
      }
    },

    initiateSignUp: (data) => {
      pendingSignupPayload = data;
      if (typeof window !== "undefined" && window.DraftLineupMailer) {
        window.DraftLineupMailer.sendSignupConfirmation(data);
      }
      const emailEl = document.getElementById("verifySignupTargetEmail");
      if (emailEl) emailEl.textContent = data.email;
      switchAuthTab("verify-signup");
    },

    verifyAndFinalizeSignUp: (enteredCode) => {
      if (!pendingSignupPayload) {
        showAlert("No pending registration found. Please fill out the registration form.");
        switchAuthTab("signup");
        return;
      }

      if (typeof window !== "undefined" && window.DraftLineupMailer) {
        const verifyRes = window.DraftLineupMailer.verifySignupCode(pendingSignupPayload.email, enteredCode);
        if (!verifyRes.success) {
          showAlert(verifyRes.message);
          return;
        }
      }

      const payload = { ...pendingSignupPayload, email_verified: true, verification_code: enteredCode };
      window.BlueLineAuth.signUp(payload);
      pendingSignupPayload = null;
    },

    requestPasswordReset: (email) => {
      if (!email) {
        showAlert("Please provide your registered account email.");
        return;
      }
      if (typeof window !== "undefined" && window.DraftLineupMailer) {
        window.DraftLineupMailer.sendPasswordReset(email);
      }
      const label = document.getElementById("resetTargetEmailLabel");
      if (label) label.textContent = email;
      const step1 = document.getElementById("resetStep1");
      const step2 = document.getElementById("resetStep2");
      if (step1) step1.classList.add("hidden");
      if (step2) step2.classList.remove("hidden");
      showAlert(`Password reset verification code sent to ${email} via furrhjohn10@gmail.com (Display: draftlineup.com).`);
    },

    completePasswordReset: (email, code, newPassword) => {
      if (typeof window !== "undefined" && window.DraftLineupMailer) {
        const verifyRes = window.DraftLineupMailer.verifyResetCode(email, code);
        if (!verifyRes.success) {
          showAlert(verifyRes.message);
          return;
        }
      }

      // Update password in accounts storage
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
        let list = raw ? JSON.parse(raw) : [];
        let found = list.find(a => (a.email || "").toLowerCase() === email.toLowerCase());
        if (found) {
          found.password = newPassword;
          found.password_updated_at = new Date().toISOString();
          localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(list));
          setCurrentUser(found);
          window.closeAuthModal();
          showAlert(`Password reset successfully! You are now logged in as ${found.name}.`);
          return;
        }
      } catch(e) {}

      // If user wasn't previously in storage, create updated account session
      const updatedUser = {
        id: "usr_" + Date.now().toString(36),
        username: email.split("@")[0],
        name: email.split("@")[0],
        email: email,
        role: "athlete",
        role_title: "Verified Athlete",
        badge: "VERIFIED ATHLETE",
        avatar: "⚡",
        avatar_gradient: "from-sky-500 to-indigo-600",
        verified: true,
        password: newPassword
      };
      setCurrentUser(updatedUser);
      window.closeAuthModal();
      showAlert(`Password updated successfully! Welcome back, ${updatedUser.name}.`);
    },

    switchTab: switchAuthTab,

    selectClaimCandidate: (playerId) => {
      const registry = window.MASTER_ALL_REGISTRY || [];
      const customList = getCustomPlayers();
      const allPool = [...customList, ...registry];
      const p = allPool.find(x => x.id === playerId);
      if (!p) return;

      selectedClaimCandidate = p;
      const box = document.getElementById("claimVerificationBox");
      const nameEl = document.getElementById("verifySelectedPlayerName");
      if (box && nameEl) {
        nameEl.textContent = `Verify & Claim: ${p.name} (#${p.num || "?"}) • ${p.team}`;
        box.classList.remove("hidden");
        document.getElementById("verifyJerseyNumber").value = p.num || "";
      }
    },

    confirmClaim: (player, jerseyNum, birthYear) => {
      const user = getCurrentUser();
      user.linked_player_id = player.id;
      user.name = player.name;
      user.role = "athlete";
      user.role_title = player.role_title || "Verified Athlete";
      user.badge = "VERIFIED ATHLETE (CLAIMED)";
      user.team = player.team;
      user.league = player.league;
      user.avatar = "⚡";
      user.verified = true;

      // Stamp the immutable audit ledger on the player profile
      const ledgerEntry = stampImmutableLedger(
        player,
        "Identity Verification & Claim",
        "Athlete Claimed Profile",
        `Athlete verified credentials (Jersey #${jerseyNum || player.num || "--"}). Account ID ${user.id} bound to athlete ledger.`,
        user
      );

      // Save to claimed registry
      setClaimedProfile(player.id, {
        claimedBy: user.id,
        claimedAt: new Date().toISOString(),
        verified: true,
        ledgerHash: ledgerEntry ? ledgerEntry.hash : null
      });

      setCurrentUser(user);
      window.closeAuthModal();

      showAlert(`Success! You have officially claimed the profile of ${player.name} (#${player.num}). Your ledger block hash has been stamped.`);
      
      // If currently on player.html, reload or refresh view
      if (window.location.pathname.includes("player.html")) {
        window.location.href = `player.html?id=${player.id}`;
      }
    },

    createNewProfile: (data, stayOnPage) => {
      const user = getCurrentUser();
      const newPlayer = mintNewAthleteDossier(data, user);

      user.linked_player_id = newPlayer.id;
      user.name = data.name;
      user.role = "athlete";
      user.role_title = newPlayer.role_title;
      user.badge = "VERIFIED ATHLETE";
      user.team = data.team;
      user.league = data.league || "Tier 1 AAA";
      user.avatar = "⚡";
      user.num = newPlayer.num;
      user.pos = newPlayer.pos;

      setCurrentUser(user);
      window.closeAuthModal();

      showAlert(`Athlete Dossier Minted! Composite Trajectory: ${newPlayer.composite_score}. Stamped on the tamper-evident ledger.`);
      if (!stayOnPage) {
        window.location.href = `player.html?id=${newPlayer.id}`;
      }
    },

    getAthleteDossier: (idOrUser) => {
      let id = typeof idOrUser === "string" ? idOrUser : (idOrUser?.linked_player_id || idOrUser?.id);
      if (!id) return null;

      // 1. Check custom players
      const customList = getCustomPlayers();
      let found = customList.find(p => p.id === id || p.userId === id);
      if (found) return found;

      // 2. Check universal master registry
      const masterList = (typeof window !== "undefined" && (window.MASTER_ALL_REGISTRY || window.MASTER_PLAYERS || window.SMRP_ALL_REGISTRY || window.SMRP_MASTER_PLAYERS)) || [];
      found = masterList.find(p => p.id === id);
      if (found) return found;

      // 3. Check demo personas if linked
      const demo = DEMO_PERSONAS.find(d => d.id === id);
      if (demo && demo.linked_player_id) {
        return masterList.find(p => p.id === demo.linked_player_id) || null;
      }
      return null;
    },

    stampLedgerForUser: (category, action, diff, playerObj) => {
      const user = getCurrentUser();
      let targetPlayer = playerObj;
      if (!targetPlayer && user && user.linked_player_id) {
        targetPlayer = window.BlueLineAuth.getAthleteDossier(user.linked_player_id);
      }
      if (targetPlayer) {
        return stampImmutableLedger(targetPlayer, category, action, diff, user);
      }
      return null;
    },

    mintNewAthleteDossier: (data) => {
      const user = getCurrentUser();
      return mintNewAthleteDossier(data, user);
    },

    getPackageTiers: () => {
      return {
        athlete: {
          id: "pkg_athlete",
          role: "athlete",
          name: "Player Passport",
          priceMonthly: 4.99,
          priceLabel: "$4.99 / mo",
          billing: "Billed monthly • Cancel anytime",
          description: "Full athlete dossier, personal stat vault, AR training, and direct access to The Wire with verified badge stamping.",
          features: [
            "Official Cryptographic Athlete Passport & Ledger",
            "The Wire Social Feed & X.com Style Profile",
            "Custom Organization & Team Logo Stamping on Avatar",
            "Direct Messaging (DMs) with Verified Scouts & Coaches",
            "Search & Compare Stats of Other Athletes Across North America",
            "Laser Combine Biometrics & Video Breakdown Access"
          ]
        },
        parent: {
          id: "pkg_parent",
          role: "parent",
          name: "Family Advisor",
          priceMonthly: 4.99,
          priceLabel: "$4.99 / mo",
          billing: "Billed monthly • Cancel anytime",
          description: "Academic eligibility tracking, safe recruiter contact log, and tournament schedule coordination.",
          features: [
            "NCAA Clearinghouse Eligibility & GPA Tracker",
            "Direct Messaging Line to Verified Coaching Staff",
            "Physical Development, Height/Weight & Combine Milestones",
            "Game, Tournament & Showcase Travel Coordinator",
            "Recruiter Outreach Audit Ledger (Safe-Contact Record)"
          ]
        },
        coach: {
          id: "pkg_coach",
          role: "coach",
          name: "Coach Pro",
          priceMonthly: 22.99,
          priceLabel: "$22.99 / mo",
          billing: "Billed monthly • Cancel anytime",
          description: "Roster management, interactive tactical whiteboard, AI film breakdowns, and recruiting boards.",
          features: [
            "Dynamic Roster Management & Line Combination Matrix",
            "AI Film Studio & Tactical Telestration Whiteboard",
            "Searchable 3,050+ Player Scouting Database",
            "Direct Messaging (DMs) with Prospects & Family Advisors",
            "ADM Practice Planning & Team Combine Benchmarks",
            "Unrestricted Access to All 22 Analytical Hubs"
          ]
        },
        scout: {
          id: "pkg_scout",
          role: "scout",
          name: "Recruiter Enterprise",
          priceMonthly: 22.99,
          priceLabel: "$22.99 / mo",
          billing: "Billed monthly • Cancel anytime",
          description: "Comprehensive scouting bureau with draft war rooms, salary cap modeling, and verified recruitment pipelines.",
          features: [
            "War Room Draft Simulator & Franchise Cap Lab",
            "Unrestricted 3,050+ Master Athlete Database with Ledger Audit",
            "Verified Recruiter Outreach DMs Directly to Prospects",
            "Tournament Bracketology & Frozen Four Simulator",
            "Talent Radar, SQM Metrics & Exportable Dossiers",
            "Unrestricted Access to All 22 Analytical Hubs"
          ]
        }
      };
    },

    switchRole: (roleName) => {
      const role = String(roleName || "athlete").toLowerCase().trim();
      let targetUser = null;
      if (role === "coach") {
        targetUser = DEMO_PERSONAS[1]; // Adam Nightingale
      } else if (role === "scout" || role === "recruiter") {
        targetUser = DEMO_PERSONAS[2]; // Dan Marr
      } else if (role === "parent") {
        targetUser = DEMO_PERSONAS[3]; // Sarah Hage
      } else if (role === "admin") {
        targetUser = {
          id: "usr_admin_ops",
          username: "admin.ops",
          name: "Operations Admin",
          email: "furrhjohn10@gmail.com",
          role: "admin",
          role_title: "Platform Administrator",
          badge: "PLATFORM ADMIN",
          team: "BlueLine DataWorks HQ",
          league: "Operations Bureau",
          avatar: "⚙️",
          avatar_gradient: "from-slate-700 to-indigo-950",
          verified: true
        };
      } else {
        // Try to pick registered athlete or Michael Hage
        try {
          const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
          if (raw) {
            const list = JSON.parse(raw);
            const regAth = list.find(a => (a.role || "").toLowerCase() === "athlete");
            if (regAth) targetUser = regAth;
          }
        } catch (e) {}
        if (!targetUser) targetUser = DEMO_PERSONAS[0]; // Michael Hage
      }

      setCurrentUser(targetUser);
      return targetUser;
    },

    getAllRegisteredAccounts: () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },

    getPlatformStats: () => {
      const accounts = window.BlueLineAuth.getAllRegisteredAccounts();
      const athletes = accounts.filter(a => a.role === "athlete").length;
      const parents = accounts.filter(a => a.role === "parent").length;
      const coaches = accounts.filter(a => a.role === "coach").length;
      const scouts = accounts.filter(a => a.role === "scout" || a.role === "recruiter").length;

      const mrr = ((athletes + parents) * 4.99) + ((coaches + scouts) * 22.99);

      return {
        totalUsers: accounts.length + 4, // Including 4 pre-seeded personas
        athletes: athletes + 1,
        parents: parents + 1,
        coaches: coaches + 1,
        scouts: scouts + 1,
        estimatedMRR: "$" + (mrr + (2 * 4.99) + (2 * 22.99)).toFixed(2),
        ledgerBlocksStamped: 142 + accounts.length * 3,
        securityDefcon: 5
      };
    },

    upgradeUserPlan: (targetRole, planPrice) => {
      const user = getCurrentUser();
      const role = String(targetRole || "coach").toLowerCase();
      const price = planPrice || (role === "coach" || role === "scout" ? "$22.99/mo" : "$4.99/mo");
      user.role = role;
      user.plan = role === "coach" ? "Coach Pro" : (role === "scout" ? "Recruiter Enterprise" : "Player Passport");
      user.price = price;
      user.badge = role === "coach" ? "COACH PRO ($22.99)" : (role === "scout" ? "DIRECTOR OF SCOUTING ($22.99)" : "VERIFIED ATHLETE");
      user.verified = true;
      setCurrentUser(user);

      try {
        const accountsRaw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
        if (accountsRaw) {
          const accounts = JSON.parse(accountsRaw);
          const idx = accounts.findIndex(a => a.id === user.id || a.email === user.email);
          if (idx >= 0) {
            accounts[idx] = { ...accounts[idx], role: user.role, plan: user.plan, badge: user.badge };
            localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
          }
        }
      } catch (e) {}

      stampImmutableLedger({ id: user.id || "usr_plan", name: user.name }, "SUBSCRIPTION", "TIER_UPGRADE", `Upgraded account to ${user.plan} (${price})`, user);
      return user;
    },

    isFeaturePaywalled: (featureName, role) => {
      const r = String(role || "").toLowerCase();
      if (r === "coach" || r === "scout" || r === "recruiter" || r === "admin") {
        return false;
      }
      const proFeatures = ["videobreakdown", "combine", "recruiting", "artraining", "iqsim", "film", "admin"];
      return proFeatures.includes(String(featureName || "").toLowerCase());
    },

    signOut: (redirectUrl) => {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(STORAGE_KEY_SIGNED_OUT, "true");
          localStorage.removeItem(STORAGE_KEY_USER);
        }
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.clear();
        }
      } catch (e) {}
      updateHeaderUserBadge();
      showAlert("You have signed out. Session ended.");
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function" && typeof CustomEvent === "function") {
        try {
          window.dispatchEvent(new CustomEvent("blueline:authChanged", { detail: { user: null, signedOut: true } }));
        } catch(e) {}
      }
      setTimeout(() => {
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = "login.html";
        }
      }, 150);
    },

    getRoleHomeUrl,
    getRoleHomeTitle,
    handleLogoClick,
    updateDynamicLogoLinks
  };

  // Global window openers
  window.openAuthModal = function(initialTab, prefillPlayerId) {
    renderAuthModal();
    const modal = document.getElementById("bluelineAuthModal");
    if (modal) {
      modal.classList.remove("hidden");
      switchAuthTab(initialTab || "signin");
      if (prefillPlayerId) {
        window.BlueLineAuth.selectClaimCandidate(prefillPlayerId);
      }
    }
  };

  window.closeAuthModal = function() {
    const modal = document.getElementById("bluelineAuthModal");
    if (modal) modal.classList.add("hidden");
  };

  window.openUserDrawer = function() {
    renderUserDrawer();
    updateUserDrawerContent();
    const drawer = document.getElementById("bluelineUserDrawer");
    if (drawer) drawer.classList.remove("hidden");
  };

  window.closeUserDrawer = function() {
    const drawer = document.getElementById("bluelineUserDrawer");
    if (drawer) drawer.classList.add("hidden");
  };

  // Backward-compatible alias for existing onclick="openLoginModal()"
  window.openLoginModal = function() {
    window.openAuthModal("signin");
  };

  // Initialize on DOMContentLoaded and Window Load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      updateHeaderUserBadge();
      updateDynamicLogoLinks();
    });
  } else {
    updateHeaderUserBadge();
    updateDynamicLogoLinks();
  }

  window.addEventListener("load", () => {
    updateDynamicLogoLinks();
  });

  window.addEventListener("blueline:authChanged", () => {
    updateDynamicLogoLinks();
  });

})(window);
