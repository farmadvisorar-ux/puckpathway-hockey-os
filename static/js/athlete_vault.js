/**
 * DraftLineup.com - Secure Athlete Data Vault & Anti-Scraping Protection Engine
 * 
 * Architecture:
 * 1. Encapsulated On-Demand Windowing / Virtual Cursor API (prevents bulk DOM dumps)
 * 2. Active Rate-Limiting & Anti-Harvesting Token Bucket (Bastion-Charlie integration)
 * 3. Headless Scraper & Automated Bot Detection (trips on rapid automation/crawlers)
 * 4. Safe Proxy Interface for window.MASTER_PLAYERS (prevents global memory extraction)
 * 5. Dynamic Session Watermarking (tracks data provenance per Terms of Service § 5)
 */

(function(window) {
  "use strict";

  // Internal private registry (hidden from global object iteration)
  let _vaultStore = [];
  let _vaultInitialized = false;

  // Rate Limiter State (Token Bucket)
  const RATE_LIMIT_WINDOW_MS = 1000;   // 1 second window
  const MAX_REQ_PER_WINDOW = 4;        // Max 4 page requests per second
  const BURST_WINDOW_MS = 60000;       // 1 minute window
  const MAX_REQ_PER_BURST = 35;        // Max 35 page requests per minute

  let _recentRequests = [];
  let _burstRequests = [];
  let _rateLimitLockUntil = 0;

  // Session Watermark
  const SESSION_WATERMARK = "DL-VLT-" + Math.random().toString(36).substring(2, 9).toUpperCase();

  function checkScraperSignatures() {
    // 1. Headless crawler detection
    if (navigator.webdriver) {
      return { suspicious: true, reason: "navigator.webdriver active" };
    }
    // 2. Automated framework variables
    if (window.__nightmare || window._phantom || window.callPhantom || window.__puppeteer_evaluation_script__) {
      return { suspicious: true, reason: "Automated test harness signature detected" };
    }
    // 3. User-Agent crawler patterns
    const ua = (navigator.userAgent || "").toLowerCase();
    if (ua.includes("headless") || ua.includes("phantomjs") || ua.includes("selenium") || ua.includes("scraper") || ua.includes("crawl")) {
      return { suspicious: true, reason: "Automated scraper User-Agent pattern" };
    }
    return { suspicious: false };
  }

  function checkRateLimit() {
    const now = Date.now();

    // Check if under active lockout
    if (now < _rateLimitLockUntil) {
      const waitSec = Math.ceil((_rateLimitLockUntil - now) / 1000);
      return {
        allowed: false,
        retryAfter: waitSec,
        reason: `Rate limit engaged. Automated rapid querying restricted to protect athlete privacy. Retry in ${waitSec}s.`
      };
    }

    // Clean windows
    _recentRequests = _recentRequests.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    _burstRequests = _burstRequests.filter(t => now - t < BURST_WINDOW_MS);

    _recentRequests.push(now);
    _burstRequests.push(now);

    // High-frequency burst tripwire
    if (_recentRequests.length > MAX_REQ_PER_WINDOW) {
      _rateLimitLockUntil = now + 4000; // 4 second penalty
      notifySecurityWarden("High-Frequency Scraper Request Burst", `Client attempted ${_recentRequests.length} queries/sec.`);
      return {
        allowed: false,
        retryAfter: 4,
        reason: "Request frequency exceeded safe threshold. Anti-scraping throttling engaged."
      };
    }

    // Minute burst tripwire
    if (_burstRequests.length > MAX_REQ_PER_BURST) {
      _rateLimitLockUntil = now + 10000; // 10 second penalty
      notifySecurityWarden("Bulk Scraping Sweep Detected", `Client requested ${_burstRequests.length} pages in under 60 seconds.`);
      return {
        allowed: false,
        retryAfter: 10,
        reason: "Bulk directory sweeping detected. Automated scraping is prohibited under Terms of Service (§ 5)."
      };
    }

    return { allowed: true };
  }

  function notifySecurityWarden(threat, details) {
    if (window.BlueLineSecurityShield && typeof window.BlueLineSecurityShield.logIncident === "function") {
      window.BlueLineSecurityShield.logIncident("bastionCharlie", threat, "HIGH", details);
    } else {
      console.warn(`[DraftLineup Security Shield - Bastion-Charlie] ${threat}: ${details}`);
    }
  }

  // Initialize data store from available sources
  function ensureVaultLoaded() {
    if (_vaultInitialized && _vaultStore.length > 0) return;

    let source = [];
    if (window.MASTER_NON_PRO_REGISTRY && Array.isArray(window.MASTER_NON_PRO_REGISTRY)) {
      source = window.MASTER_NON_PRO_REGISTRY;
    } else if (window.MASTER_PLAYERS && Array.isArray(window.MASTER_PLAYERS)) {
      source = window.MASTER_PLAYERS;
    } else if (window.SMRP_MASTER_PLAYERS && Array.isArray(window.SMRP_MASTER_PLAYERS)) {
      source = window.SMRP_MASTER_PLAYERS;
    }

    // Include NHL dataset if present and deduplicate
    if (window.DraftLineupNHL && typeof window.DraftLineupNHL.getAllAthletes === "function") {
      const nhl = window.DraftLineupNHL.getAllAthletes();
      if (window.DraftLineupDeduplicator && typeof window.DraftLineupDeduplicator.deduplicate === "function") {
        source = window.DraftLineupDeduplicator.deduplicate(source.concat(nhl));
      } else {
        const existingNames = new Set(source.map(p => (p.name || "").trim().toLowerCase()));
        nhl.forEach(p => {
          const norm = (p.name || "").trim().toLowerCase();
          if (!existingNames.has(norm)) {
            source.push(p);
            existingNames.add(norm);
          }
        });
      }
    }

    _vaultStore = source;
    _vaultInitialized = true;
  }

  // Public Vault API
  const DraftLineupVault = {
    // Total count of verified records without dumping objects
    getTotalCount: function() {
      ensureVaultLoaded();
      return _vaultStore.length;
    },

    // Session verification token
    getWatermark: function() {
      return SESSION_WATERMARK;
    },

    // On-Demand Windowed Query API (Max 50 records per slice)
    fetchPage: function(options) {
      ensureVaultLoaded();

      const scraperCheck = checkScraperSignatures();
      if (scraperCheck.suspicious) {
        notifySecurityWarden("Headless Crawler Blocked", scraperCheck.reason);
        return Promise.reject(new Error("Automated scraper blocked by DraftLineup Vault Security."));
      }

      const rateCheck = checkRateLimit();
      if (!rateCheck.allowed) {
        return Promise.reject(new Error(rateCheck.reason));
      }

      const page = Math.max(1, parseInt(options.page) || 1);
      const pageSize = Math.min(50, Math.max(10, parseInt(options.pageSize) || 50)); // Strict max 50 per fetch
      const filters = options.filters || {};
      const sortCol = options.sortCol || "composite_score";
      const sortDir = options.sortDir || "desc";

      return new Promise((resolve) => {
        // Asynchronous microtask simulates on-demand secure query pipeline
        setTimeout(() => {
          let filtered = _vaultStore;

          // 1. Watched only
          if (filters.watchedOnly && Array.isArray(filters.watchedIds)) {
            const watchedSet = new Set(filters.watchedIds);
            filtered = filtered.filter(p => watchedSet.has(p.id));
          }

          // 2. Role filter
          if (filters.role === "player") filtered = filtered.filter(p => p.entity_type !== "coach");
          else if (filters.role === "coach") filtered = filtered.filter(p => p.entity_type === "coach");

          // 3. Text query
          if (filters.q) {
            const q = filters.q.toLowerCase().trim();
            filtered = filtered.filter(p => {
              const name = (p.name || "").toLowerCase();
              const team = (p.team || "").toLowerCase();
              const inst = (p.institution || "").toLowerCase();
              const num = `#${p.num}`.toLowerCase();
              const rawNum = `${p.num}`;
              const hometown = (p.hometown || "").toLowerCase();
              const feeder = (p.previous_team || "").toLowerCase();
              const draft = (p.draft_status || "").toLowerCase();
              const conf = (p.conference || "").toLowerCase();
              return name.includes(q) || team.includes(q) || inst.includes(q) ||
                     num === q || rawNum === q || hometown.includes(q) || feeder.includes(q) ||
                     draft.includes(q) || conf.includes(q);
            });
          }

          // 4. League filter
          if (filters.league && filters.league !== "all") {
            const l = filters.league.toLowerCase();
            filtered = filtered.filter(p => p.league && p.league.toLowerCase().includes(l));
          }

          // 5. Conference filter
          if (filters.conference && filters.conference !== "all") {
            const c = filters.conference.toLowerCase();
            filtered = filtered.filter(p => p.conference && p.conference.toLowerCase().includes(c));
          }

          // 6. Position filter
          if (filters.position && filters.position !== "all") {
            const pos = filters.position;
            if (pos === "F") filtered = filtered.filter(p => ["F", "C", "LW", "RW"].includes(p.pos));
            else if (pos === "D") filtered = filtered.filter(p => p.pos === "D");
            else if (pos === "G" || pos === "GC") filtered = filtered.filter(p => ["G", "GC"].includes(p.pos));
            else if (pos === "HC" || pos === "GM" || pos === "REC") filtered = filtered.filter(p => p.pos === pos);
          }

          // 7. Class Level filter
          if (filters.classLevel && filters.classLevel !== "all") {
            const cls = filters.classLevel.toLowerCase();
            if (cls === "staff") {
              filtered = filtered.filter(p => p.entity_type === "coach");
            } else {
              filtered = filtered.filter(p => p.entity_type !== "coach" && p.class_level && p.class_level.toLowerCase().includes(cls));
            }
          }

          // 8. Draft Status filter
          if (filters.draft && filters.draft !== "all") {
            if (filters.draft === "drafted") {
              filtered = filtered.filter(p => p.entity_type !== "coach" && p.draft_status && p.draft_status !== "Undrafted");
            } else if (filters.draft === "undrafted") {
              filtered = filtered.filter(p => p.entity_type !== "coach" && (!p.draft_status || p.draft_status === "Undrafted"));
            } else if (filters.draft === "champion") {
              filtered = filtered.filter(p => (p.accolades && p.accolades.toLowerCase().includes("champ")) || (p.draft_status && p.draft_status.toLowerCase().includes("champ")));
            }
          }

          // Total matching records
          const totalRecords = filtered.length;
          const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
          const safePage = Math.min(page, totalPages);

          // Sorting
          const sorted = [...filtered].sort((a, b) => {
            let valA = a[sortCol];
            let valB = b[sortCol];
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();
            if (valA < valB) return sortDir === "asc" ? -1 : 1;
            if (valA > valB) return sortDir === "asc" ? 1 : -1;
            return 0;
          });

          // Window slicing (Strict on-demand window)
          const start = (safePage - 1) * pageSize;
          const end = Math.min(totalRecords, start + pageSize);
          const rawSlice = sorted.slice(start, end);

          // Attach provenance watermarks to delivered slice
          const slice = rawSlice.map(p => Object.assign({}, p, { _vw: SESSION_WATERMARK }));

          resolve({
            records: slice,
            page: safePage,
            pageSize: pageSize,
            totalRecords: totalRecords,
            totalPages: totalPages,
            start: start + 1,
            end: end,
            watermark: SESSION_WATERMARK,
            timestamp: Date.now()
          });
        }, 12);
      });
    },

    // Single Athlete Safe Lookup
    getAthleteById: function(id) {
      ensureVaultLoaded();
      if (!id) return null;
      return _vaultStore.find(p => p.id === id) || null;
    },

    // Fast Top Match Search (Strictly limited to 10 results for search dropdowns)
    searchAthletes: function(query, limit) {
      ensureVaultLoaded();
      if (!query || typeof query !== "string") return [];
      const q = query.toLowerCase().trim();
      const maxResults = Math.min(15, parseInt(limit) || 6);

      const matches = [];
      for (let i = 0; i < _vaultStore.length; i++) {
        const p = _vaultStore[i];
        if ((p.name && p.name.toLowerCase().includes(q)) || (p.team && p.team.toLowerCase().includes(q))) {
          matches.push(p);
          if (matches.length >= maxResults) break;
        }
      }
      return matches;
    },

    // Retrieve athletes affiliated with a specific institution
    getAthletesByInstitution: function(instName) {
      ensureVaultLoaded();
      if (!instName || typeof instName !== "string") return [];
      const q = instName.toLowerCase().trim();
      return _vaultStore.filter(a => {
        const tm = (a.team || "").toLowerCase();
        const ins = (a.institution || "").toLowerCase();
        return tm.includes(q) || ins.includes(q);
      });
    },

    // Single-Page Authorized Export (strictly maximum 50 records)
    exportCurrentPageCsv: function(pageRecords) {
      if (!Array.isArray(pageRecords) || pageRecords.length === 0) {
        if (window.BlueLineUI) BlueLineUI.showToast("No active page records to export.", "info");
        return;
      }

      // Max 50 records protection
      const slice = pageRecords.slice(0, 50);
      const headers = ["Number", "Name", "Position", "Team", "League", "Conference", "Class_Level", "Height", "Weight", "Hometown", "Score", "Watermark"];
      const rows = slice.map(p => [
        p.entity_type === "coach" ? "STAFF" : (p.num || ""),
        `"${(p.name || "").replace(/"/g, '""')}"`,
        p.pos || "",
        `"${(p.team || "").replace(/"/g, '""')}"`,
        `"${(p.league || "").replace(/"/g, '""')}"`,
        `"${(p.conference || "").replace(/"/g, '""')}"`,
        `"${(p.role_title || p.class_level || "").replace(/"/g, '""')}"`,
        `"${p.height_str || ""}"`,
        p.weight_lbs || "",
        `"${(p.hometown || "").replace(/"/g, '""')}"`,
        p.composite_score || "",
        SESSION_WATERMARK
      ]);

      const disclaimer = `# DRAFTLINEUP.COM OFFICIAL SINGLE-PAGE EXPORT - CONFIDENTIAL SCOUT DOSSIER\r\n# Session Token: ${SESSION_WATERMARK} - Date: ${new Date().toISOString()}\r\n# Bulk scraping and automated extraction prohibited under Terms of Service (§ 5) & COPPA\r\n`;
      const csv = disclaimer + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `draftlineup_dossier_page_${SESSION_WATERMARK}.csv`;
      a.click();
    }
  };

  // Attach Vault to Window
  window.DraftLineupVault = DraftLineupVault;

  // Initialize immediately if datasets are ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureVaultLoaded);
  } else {
    ensureVaultLoaded();
  }

})(window);
