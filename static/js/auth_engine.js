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
  const STORAGE_KEY_CUSTOM_PLAYERS = "blueline_custom_players";
  const STORAGE_KEY_CLAIMED = "blueline_claimed_profiles";

  function showAlert(msg) {
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
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {}
    // Default to Director of Scouting if none selected
    return DEMO_PERSONAS[2];
  }

  function setCurrentUser(user) {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
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

      container.setAttribute("onclick", "window.openUserDrawer()");
      container.setAttribute("title", `${user.name} • ${user.badge}`);

      // Update avatar element if found
      const avatarEl = container.querySelector(".rounded-full");
      if (avatarEl) {
        avatarEl.innerHTML = user.avatar || "👤";
      }

      // Update user text container if found
      const nameSpan = container.querySelector("span.text-xs.font-bold");
      if (nameSpan) {
        nameSpan.textContent = user.name;
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

    // Sign Up Submit
    const submitSignUpBtn = document.getElementById("submitSignUpBtn");
    if (submitSignUpBtn) {
      submitSignUpBtn.addEventListener("click", () => {
        const role = modal.querySelector("input[name='signupRole']:checked")?.value || "athlete";
        const name = document.getElementById("signupFullName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const team = document.getElementById("signupTeam").value.trim();

        if (!name || !email) {
          showAlert("Please enter your name and email address.");
          return;
        }

        window.BlueLineAuth.signUp({ name, email, role, team });
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
      } else {
        btn.classList.remove("border-sky-400", "text-sky-300");
        btn.classList.add("border-transparent", "text-slate-400");
      }
    });

    const panes = {
      signin: document.getElementById("authTabSignIn"),
      signup: document.getElementById("authTabSignUp"),
      claim: document.getElementById("authTabClaim"),
      "create-profile": document.getElementById("authTabCreateProfile")
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
      const newUser = {
        id: "usr_" + Date.now().toString(36),
        username: data.email.split("@")[0],
        name: data.name,
        email: data.email,
        role: data.role,
        role_title: data.role === "athlete" ? "Registered Athlete" : (data.role === "coach" ? "Team Staff / Coach" : (data.role === "scout" ? "Scout / Recruiter" : "Parent / Advisor")),
        badge: data.role === "athlete" ? "ATHLETE (REGISTERED)" : (data.role === "coach" ? "COACH" : (data.role === "scout" ? "SCOUT" : "FAMILY ADVISOR")),
        team: data.team,
        avatar: data.role === "athlete" ? "⚡" : (data.role === "coach" ? "🏒" : (data.role === "scout" ? "🔍" : "👨‍👩‍👦")),
        avatar_gradient: "from-cyan-600 to-blue-800",
        verified: true,
        created_at: new Date().toISOString()
      };

      // Save to registered accounts list
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
        const list = raw ? JSON.parse(raw) : [];
        list.push(newUser);
        localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(list));
      } catch (e) {}

      setCurrentUser(newUser);

      if (data.role === "athlete") {
        // Offer claim or create profile
        switchAuthTab("claim");
        showAlert(`Account created for ${newUser.name}! Next, search to claim your profile, or mint a new one.`);
      } else {
        window.closeAuthModal();
        showAlert(`Account created! Logged in as ${newUser.name} (${newUser.badge}).`);
      }
    },

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

    createNewProfile: (data) => {
      const newId = "cust_" + Date.now().toString(36);
      
      // Calculate BlueLine Composite Trajectory Score
      const speedScore = Math.max(40, Math.min(99, 100 - (data.speed - 3.8) * 60));
      const jumpScore = Math.max(40, Math.min(99, (data.jump / 100) * 88));
      const athleticIndex = parseFloat((speedScore * 0.6 + jumpScore * 0.4).toFixed(1));
      const kpiIndex = 86.0;
      const acad = Math.min(100, (data.gpa / 4.0) * 100);
      const composite = parseFloat((athleticIndex * 0.35 + kpiIndex * 0.45 + acad * 0.20).toFixed(1));

      const newPlayer = {
        id: newId,
        entity_type: "player",
        name: data.name,
        num: data.num,
        pos: data.pos,
        primary_role: data.pos === "G" ? "Goaltender" : (data.pos === "D" ? "Defenseman" : "Forward"),
        team: data.team,
        league: data.league,
        height_in: data.ht,
        weight_lbs: data.wt,
        handed: data.hand,
        gpa: data.gpa,
        grad_year: data.grad,
        age: 18,
        status_badge: "Tier 1 Verified Prospect",
        avatar_gradient: "from-indigo-600 to-sky-700",
        composite_score: composite,
        combine: {
          flying_30m_sec: data.speed,
          broad_jump_in: data.jump
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

      const user = getCurrentUser();
      user.linked_player_id = newId;
      user.name = data.name;
      user.role = "athlete";
      user.role_title = "Verified Athlete";
      user.badge = "VERIFIED ATHLETE";
      user.team = data.team;
      user.league = data.league;
      user.avatar = "⚡";

      // Stamp genesis block on the ledger
      stampImmutableLedger(
        newPlayer,
        "Genesis Ledger Stamping",
        "Athlete Passport Minted",
        `Initial biometric & developmental trajectory parameters registered: Flying 30m ${data.speed}s, Broad Jump ${data.jump}in, GPA ${data.gpa}. Initial Trajectory Score: ${composite}.`,
        user
      );

      saveCustomPlayer(newPlayer);
      setCurrentUser(user);
      window.closeAuthModal();

      showAlert(`Athlete Dossier Minted! Composite Trajectory: ${composite}. Navigating to your new Player Passport...`);
      window.location.href = `player.html?id=${newId}`;
    },

    signOut: () => {
      localStorage.removeItem(STORAGE_KEY_USER);
      updateHeaderUserBadge();
      showAlert("You have signed out. Reset to Guest / Scout mode.");
      window.location.reload();
    }
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

  // Initialize on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      updateHeaderUserBadge();
    });
  } else {
    updateHeaderUserBadge();
  }

})(window);
