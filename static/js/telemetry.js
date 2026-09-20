/**
 * BlueLine DataWorks: Client-Side Visitor & Session Telemetry Engine
 * 
 * Tracks visitor IP addresses, active dwell time, session duration, and page journeys
 * for static hosting environments (such as GitHub Pages) where raw web server access logs
 * are not provided by the host.
 */

(function(window) {
  "use strict";

  const STORAGE_KEY = "blueline_telemetry_v1";
  const SESSION_KEY = "blueline_active_session";

  // Session state in memory
  const state = {
    ip: "Detecting...",
    city: "",
    country: "",
    org: "",
    sessionId: null,
    sessionStartTime: Date.now(),
    pageStartTime: Date.now(),
    totalDwellSeconds: 0,
    pageDwellSeconds: 0,
    currentPage: (typeof window !== "undefined" && window.location && window.location.pathname ? window.location.pathname.split("/").pop() : "") || "index.html",
    history: []
  };

  // 1. Initialize or resume session
  function initSession() {
    let activeSession = null;
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        activeSession = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("[Telemetry] Session storage unavailable", e);
    }

    if (activeSession && activeSession.id) {
      state.sessionId = activeSession.id;
      state.sessionStartTime = activeSession.startTime || Date.now();
      state.ip = activeSession.ip || "Detecting...";
      state.city = activeSession.city || "";
      state.country = activeSession.country || "";
    } else {
      state.sessionId = "sess_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);
      state.sessionStartTime = Date.now();
      saveActiveSession();
    }

    loadHistory();
    fetchVisitorIp();
    startDwellTimer();
    renderTelemetryWidget();
    logPageView();
  }

  function saveActiveSession() {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        id: state.sessionId,
        startTime: state.sessionStartTime,
        ip: state.ip,
        city: state.city,
        country: state.country
      }));
    } catch (e) {}
  }

  // 2. Fetch Visitor Public IP & Geo info
  async function fetchVisitorIp() {
    // If IP is already resolved in this session, skip re-fetching
    if (state.ip && state.ip !== "Detecting..." && state.ip !== "Offline / Local") return;

    try {
      // Primary: ipify (fast, HTTPS, CORS enabled, no rate limit)
      const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        state.ip = data.ip || "Unknown";
      } else {
        throw new Error("ipify non-200");
      }
    } catch (err) {
      // Fallback: ipapi
      try {
        const res2 = await fetch("https://ipapi.co/json/", { cache: "no-store" });
        if (res2.ok) {
          const data2 = await res2.json();
          state.ip = data2.ip || "Unknown";
          state.city = data2.city || "";
          state.country = data2.country_name || "";
          state.org = data2.org || "";
        }
      } catch (err2) {
        state.ip = navigator.onLine ? "Private / Shielded" : "Offline / Local";
      }
    }

    saveActiveSession();
    updateTelemetryWidget();
    updateStorageLog();
  }

  // 3. Active dwell timer (increments every second)
  function startDwellTimer() {
    setInterval(() => {
      // Only increment if tab is active / visible
      if (!document.hidden) {
        state.pageDwellSeconds++;
        state.totalDwellSeconds = Math.floor((Date.now() - state.sessionStartTime) / 1000);
        updateTelemetryDisplay();
      }
    }, 1000);

    // Persist every 10 seconds and on unload
    setInterval(updateStorageLog, 10000);
    window.addEventListener("beforeunload", updateStorageLog);
    window.addEventListener("pagehide", updateStorageLog);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) updateStorageLog();
    });
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // 4. Storage & History Management
  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        state.history = JSON.parse(raw);
      }
    } catch (e) {
      state.history = [];
    }
  }

  function logPageView() {
    const entry = {
      sessionId: state.sessionId,
      ip: state.ip,
      page: state.currentPage,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      dwellSeconds: 0
    };

    const existingIdx = state.history.findIndex(h => h.sessionId === state.sessionId && h.page === state.currentPage);
    if (existingIdx >= 0) {
      state.history[existingIdx].timestamp = entry.timestamp;
    } else {
      state.history.unshift(entry);
      if (state.history.length > 100) state.history = state.history.slice(0, 100);
    }
    updateStorageLog();
  }

  function updateStorageLog() {
    try {
      const existingIdx = state.history.findIndex(h => h.sessionId === state.sessionId && h.page === state.currentPage);
      if (existingIdx >= 0) {
        state.history[existingIdx].ip = state.ip;
        state.history[existingIdx].dwellSeconds = state.pageDwellSeconds;
        state.history[existingIdx].totalSessionDwell = state.totalDwellSeconds;
        if (state.city) state.history[existingIdx].city = state.city;
        if (state.country) state.history[existingIdx].country = state.country;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
    } catch (e) {}
  }

  // 5. UI Widget & Modal
  function renderTelemetryWidget() {
    if (document.getElementById("blueline-telemetry-badge")) return;

    const badge = document.createElement("div");
    badge.id = "blueline-telemetry-badge";
    badge.className = "fixed bottom-3 right-3 z-50 flex items-center gap-2 bg-slate-950/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl text-[11px] font-mono text-slate-300 select-none cursor-pointer hover:border-sky-500/50 transition duration-200 group";
    badge.title = "Click to open Visitor Analytics & Session Telemetry Console";
    badge.innerHTML = `
      <div class="flex items-center gap-1.5">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span class="text-slate-400 font-sans text-[10px] uppercase font-bold tracking-wider">Session</span>
        <span id="telemetry-dwell-time" class="text-sky-400 font-bold">00:00</span>
      </div>
      <span class="text-slate-700">|</span>
      <div class="flex items-center gap-1 text-[10px]">
        <span class="text-slate-500">IP:</span>
        <span id="telemetry-ip-display" class="text-emerald-400 font-semibold truncate max-w-[100px]">Detecting...</span>
      </div>
      <div class="hidden group-hover:block ml-1 text-sky-400 text-xs">
        <i class="fa-solid fa-chart-line"></i>
      </div>
    `;

    badge.addEventListener("click", showTelemetryModal);
    document.body.appendChild(badge);
  }

  function updateTelemetryDisplay() {
    const timeEl = document.getElementById("telemetry-dwell-time");
    if (timeEl) timeEl.textContent = formatTime(state.pageDwellSeconds);

    const modalTimeEl = document.getElementById("modal-dwell-page");
    if (modalTimeEl) modalTimeEl.textContent = formatTime(state.pageDwellSeconds);

    const modalTotalTimeEl = document.getElementById("modal-dwell-session");
    if (modalTotalTimeEl) modalTotalTimeEl.textContent = formatTime(state.totalDwellSeconds);
  }

  function updateTelemetryWidget() {
    const ipEl = document.getElementById("telemetry-ip-display");
    if (ipEl) ipEl.textContent = state.ip;
  }

  // 6. Analytics Modal Dialog
  function showTelemetryModal() {
    let modal = document.getElementById("blueline-telemetry-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "blueline-telemetry-modal";
      modal.className = "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 transition duration-200";
      document.body.appendChild(modal);
    }

    // Compute aggregate metrics
    const uniqueIps = new Set(state.history.map(h => h.ip).filter(ip => ip && ip !== "Detecting..."));
    const totalPagesLogged = state.history.length;
    const totalDwellAllSessions = state.history.reduce((acc, h) => acc + (h.dwellSeconds || 0), 0);

    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-200">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <i class="fa-solid fa-chart-pie text-base"></i>
            </div>
            <div>
              <h3 class="font-bold text-base text-white">Visitor & Session Telemetry Console</h3>
              <p class="text-xs text-slate-400">Real-Time Client IP, Dwell Time & Audit Logs</p>
            </div>
          </div>
          <button id="close-telemetry-modal" class="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Metrics Grid -->
        <div class="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/30 border-b border-slate-800">
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Active IP</div>
            <div class="text-sm font-mono font-bold text-emerald-400 mt-1 truncate" title="${state.ip}">${state.ip}</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Page Dwell</div>
            <div id="modal-dwell-page" class="text-sm font-mono font-bold text-sky-400 mt-1">${formatTime(state.pageDwellSeconds)}</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Session Dwell</div>
            <div id="modal-dwell-session" class="text-sm font-mono font-bold text-purple-400 mt-1">${formatTime(state.totalDwellSeconds)}</div>
          </div>
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div class="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Unique IPs Logged</div>
            <div class="text-sm font-mono font-bold text-amber-400 mt-1">${uniqueIps.size}</div>
          </div>
        </div>

        <!-- Details & Activity History -->
        <div class="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
          <!-- Current Session Info -->
          <div class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-2">
              <span class="font-semibold text-white">Current Client Context</span>
              <span class="font-mono text-emerald-400">Live Active Connection</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div><span class="text-slate-500">Session ID:</span> <span class="text-slate-300">${state.sessionId}</span></div>
              <div><span class="text-slate-500">Current Page:</span> <span class="text-sky-300">${state.currentPage}</span></div>
              <div><span class="text-slate-500">Location:</span> <span class="text-slate-300">${state.city ? `${state.city}, ${state.country}` : "Resolved via Public IP"}</span></div>
              <div><span class="text-slate-500">Screen Resolution:</span> <span class="text-slate-300">${window.screen.width}x${window.screen.height}</span></div>
            </div>
          </div>

          <!-- Session Audit Log Table -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Session Page Journeys</h4>
              <span class="text-[10px] font-mono text-slate-500">${state.history.length} logged records</span>
            </div>
            <div class="rounded-xl border border-slate-800 overflow-hidden">
              <div class="max-h-48 overflow-y-auto custom-scrollbar">
                <table class="w-full text-left text-xs font-mono">
                  <thead class="bg-slate-950 text-slate-400 text-[10px] sticky top-0 border-b border-slate-800">
                    <tr>
                      <th class="p-2">Page</th>
                      <th class="p-2">Visitor IP</th>
                      <th class="p-2">Dwell Time</th>
                      <th class="p-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-800/50 bg-slate-900/40">
                    ${state.history.slice(0, 20).map(h => `
                      <tr class="hover:bg-slate-800/50 transition">
                        <td class="p-2 text-sky-400 font-semibold truncate max-w-[120px]">${h.page}</td>
                        <td class="p-2 text-emerald-300">${h.ip || "—"}</td>
                        <td class="p-2 text-purple-300 font-bold">${formatTime(h.dwellSeconds || 0)}</td>
                        <td class="p-2 text-slate-400 text-[10px]">${new Date(h.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs">
          <button id="clear-telemetry-logs" class="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1.5 transition">
            <i class="fa-solid fa-trash-can"></i> Clear Session Logs
          </button>
          <button id="close-telemetry-btn" class="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition">
            Close Console
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    document.getElementById("close-telemetry-modal").onclick = () => modal.classList.add("hidden");
    document.getElementById("close-telemetry-btn").onclick = () => modal.classList.add("hidden");
    document.getElementById("clear-telemetry-logs").onclick = () => {
      localStorage.removeItem(STORAGE_KEY);
      state.history = [];
      showTelemetryModal();
    };
  }

  // 7. Public API
  window.BlueLineTelemetry = {
    getStats: () => ({
      ip: state.ip,
      currentPage: state.currentPage,
      pageDwellSeconds: state.pageDwellSeconds,
      totalSessionDwellSeconds: state.totalDwellSeconds,
      history: state.history
    }),
    showConsole: showTelemetryModal
  };

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSession);
  } else {
    initSession();
  }

})(window);
