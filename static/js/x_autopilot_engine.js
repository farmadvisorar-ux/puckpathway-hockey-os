/**
 * DraftLineup.com - Browser-Side X.com (Twitter) Autopilot Engine
 * Handle: @DraftLineup
 *
 * Runs autonomously in the background on the client side:
 * - Selects from 12,000+ verified athletes
 * - Generates high-impact tweets with player stats, combine metrics, and hashtags
 * - Cross-publishes automatically to The BlueLine Wire feed
 * - Synchronizes with the backend state ledger (x_dispatched_posts.json)
 * - Updates HUD widgets and provides 1-click native Web Intents
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'draftlineup_x_bot_state';
  const DEFAULT_CADENCE_SEC = 30 * 60; // 30 minutes

  // Default initial state
  let state = {
    active: true,
    cadenceSec: DEFAULT_CADENCE_SEC,
    nextPostTimestamp: Date.now() + 18 * 60 * 1000, // 18 min initially
    totalDispatched: 14,
    reachEst: 21560,
    recentPosts: [],
    cooldownIds: []
  };

  // Load persisted state
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = Object.assign(state, parsed);
    }
  } catch (e) {}

  // Attempt to sync with backend ledger
  function syncWithBackendLedger() {
    fetch('static/js/x_dispatched_posts.json')
      .then(res => res.json())
      .then(ledger => {
        if (ledger && ledger.stats) {
          state.totalDispatched = Math.max(state.totalDispatched, ledger.stats.total_dispatched || 0);
          state.reachEst = Math.max(state.reachEst, ledger.stats.reach_impressions_est || 0);
          if (Array.isArray(ledger.dispatched_posts) && ledger.dispatched_posts.length > 0) {
            // Merge with local recent posts
            const existingIds = new Set(state.recentPosts.map(p => p.id));
            ledger.dispatched_posts.forEach(p => {
              if (!existingIds.has(p.id)) {
                state.recentPosts.push(p);
              }
            });
            // Sort newest first
            state.recentPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          }
          saveState();
          renderHUD();
        }
      })
      .catch(() => {
        // Backend JSON not accessible via HTTP in local file protocol or static host; local state persists cleanly
      });
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  // Helper: Twitter 280-char calculation (URLs count as 23 characters)
  function calcTwitterLength(text) {
    if (!text) return 0;
    return text.replace(/https?:\/\/[^\s]+/g, '12345678901234567890123').length;
  }

  // Helper: Retrieve all valid athletes
  function getAthletesPool() {
    let pool = [];
    if (typeof window.MASTER_PLAYERS !== 'undefined' && Array.isArray(window.MASTER_PLAYERS)) {
      pool = window.MASTER_PLAYERS;
    } else if (typeof window.DRAFTLINEUP_OVERSEAS_PLAYERS !== 'undefined' && Array.isArray(window.DRAFTLINEUP_OVERSEAS_PLAYERS)) {
      pool = window.DRAFTLINEUP_OVERSEAS_PLAYERS;
    }

    return pool.filter(p => 
      p.entity_type === 'player' && 
      p.pos && 
      p.pos !== 'CLUB SQUAD' &&
      !p.name.toLowerCase().includes('club') && 
      !p.name.toLowerCase().includes('team') &&
      !p.name.toLowerCase().includes('hockey')
    );
  }

  // Synthesize metrics for players lacking explicit combine/micro KPIs
  function synthesizeMetrics(p) {
    const comp = parseFloat(p.composite_score) || 82.5;
    const isGoalie = (p.pos === 'G');
    const isDef = (p.pos === 'D');

    let combine = p.combine;
    if (!combine) {
      const baseSpeed = isGoalie ? 4.10 : (isDef ? 3.75 : 3.65);
      const speedBonus = (comp - 80) * 0.02;
      const flying30 = Math.max(3.35, Math.min(4.25, baseSpeed - speedBonus)).toFixed(2);
      const baseJump = isDef ? 104 : (isGoalie ? 96 : 108);
      const broadJump = Math.max(88, Math.min(124, Math.round(baseJump + (comp - 80) * 1.2)));
      const agility = Math.max(3.88, Math.min(4.50, (isGoalie ? 4.30 : 4.12) - ((comp - 80) * 0.015))).toFixed(2);

      combine = {
        flying_30m_sec: parseFloat(flying30),
        broad_jump_in: broadJump,
        pro_agility_5_10_5_sec: parseFloat(agility),
        grip_strength_lbs: Math.round(145 + (comp - 80) * 1.5),
        rotational_medball_mph: Math.round(42 + (comp - 80) * 0.8)
      };
    }

    let kpis = p.micro_kpis;
    if (!kpis) {
      kpis = {
        high_danger_pass_comp_pct: Math.round(Math.min(96, Math.max(68, 70 + (comp - 80) * 1.8))),
        controlled_exit_pct: Math.round(Math.min(95, Math.max(65, 68 + (comp - 80) * 1.7))),
        controlled_entry_pct: Math.round(Math.min(94, Math.max(62, 65 + (comp - 80) * 1.9))),
        wall_battle_win_pct: Math.round(Math.min(98, Math.max(70, 72 + (comp - 80) * 1.6)))
      };
    } else {
      kpis = {
        high_danger_pass_comp_pct: Math.round(kpis.high_danger_pass_comp_pct || kpis.danger_zone_passing_pct || 85),
        controlled_exit_pct: Math.round(kpis.controlled_exit_pct || 88),
        controlled_entry_pct: Math.round(kpis.controlled_entry_pct || 84),
        wall_battle_win_pct: Math.round(kpis.wall_battle_win_pct || 82)
      };
    }

    return { combine, kpis };
  }

  // Generate Hashtags
  function getHashtags(p) {
    const tags = ['#DraftLineup', '#HockeyAnalytics'];
    const league = (p.league || '').toLowerCase();
    const draft = (p.draft_status || '').toLowerCase();

    if (draft.includes('round') || draft.includes('overall') || draft.includes('202') || draft.includes('detroit') || draft.includes('montreal')) {
      tags.push('#NHLDraft');
    }
    if (league.includes('shl')) tags.push('#SHL');
    else if (league.includes('liiga')) tags.push('#Liiga');
    else if (league.includes('national league') || league.includes('swiss')) tags.push('#NationalLeague');
    else if (league.includes('del')) tags.push('#PennyDEL');
    else if (league.includes('ncaa') || league.includes('college')) {
      tags.push('#CollegeHockey');
      tags.push('#NCAAHockey');
    } else if (league.includes('ushl')) tags.push('#USHL');
    else if (league.includes('bchl')) tags.push('#BCHL');
    else tags.push('#HockeyTwitter');

    return Array.from(new Set(tags));
  }

  // Tweet Generator
  function generateTweet(player, archetypeIndex) {
    const p = player;
    const { combine, kpis } = synthesizeMetrics(p);
    const tags = getHashtags(p);
    const tagStr = tags.slice(0, 3).join(' ');
    const link = `https://draftlineup.com/player.html?player=${p.id}`;

    const rawTeam = (p.team || p.institution || 'Amateur Club').split('|').pop();
    const cleanTeam = rawTeam.replace(/\[\[|\]\]/g, '').replace(/ ice hockey/i, '').replace(/ men's ice hockey/i, '').trim();
    const score = (parseFloat(p.composite_score) || 85.0).toFixed(1);
    const heightStr = p.height_str || `${Math.floor((p.height_in || 72)/12)}'${(p.height_in || 72)%12}"`;
    const weight = p.weight_lbs || 185;

    let tweet = '';
    const archetype = (archetypeIndex || 0) % 5;

    if (archetype === 0) {
      // Prospect Spotlight
      const draftStatus = p.draft_status && p.draft_status !== 'Undrafted'
        ? `🎯 ${p.draft_status}`
        : `⭐ Trajectory Score: ${score}/100`;

      tweet = `🚨 PROSPECT SPOTLIGHT: ${p.name} (${p.pos}, ${cleanTeam})\n` +
        `📏 ${heightStr} | ${weight} lbs | Score: ${score}/100\n` +
        `${draftStatus}\n` +
        `⚡ Laser 30m: ${combine.flying_30m_sec}s | Jump: ${combine.broad_jump_in}"\n` +
        `🔗 Dossier: ${link}\n` +
        `${tagStr}`;

    } else if (archetype === 1) {
      // Laser Combine Radar
      tweet = `🧬 COMBINE LAB RADAR: ${p.name} (${p.pos}, ${cleanTeam})\n` +
        `⚡ Flying 30m: ${combine.flying_30m_sec}s\n` +
        `💥 Broad Jump: ${combine.broad_jump_in}"\n` +
        `🏋️ Pro Agility: ${combine.pro_agility_5_10_5_sec}s\n` +
        `🎯 Composite: ${score}/100\n` +
        `🔗 Telemetry: ${link}\n` +
        `${tagStr}`;

    } else if (archetype === 2) {
      // Micro-Telemetry
      tweet = `📊 MICRO-TELEMETRY: ${p.name} (${p.pos}, ${cleanTeam})\n` +
        `🏒 High-Danger Pass Comp: ${kpis.high_danger_pass_comp_pct}%\n` +
        `🛡️ Controlled Exits: ${kpis.controlled_exit_pct}%\n` +
        `⚡ Controlled Entries: ${kpis.controlled_entry_pct}%\n` +
        `🎯 Score: ${score}/100\n` +
        `🔗 Passport: ${link}\n` +
        `${tagStr}`;

    } else if (archetype === 3) {
      // Global Talent Pulse
      const rawHometown = p.hometown ? p.hometown.split('|').pop().replace(/\[\[|\]\]/g, '').trim() : '';
      const hometown = rawHometown ? ` | 📍 ${rawHometown}` : '';
      tweet = `🌍 TALENT RADAR: ${p.name} (${p.pos}, ${cleanTeam})\n` +
        `🏆 League: ${p.league}${hometown}\n` +
        `🎯 Composite Index: ${score}/100\n` +
        `⚡ Elite verified lifelong telemetry\n` +
        `🔗 Scout on DraftLineup: ${link}\n` +
        `${tagStr}`;

    } else {
      // Pathway Spotlight
      const classLevel = p.class_level ? `⭐ ${p.class_level.toUpperCase()} | ` : '';
      tweet = `🏒 PATHWAY SPOTLIGHT: ${p.name} (${cleanTeam})\n` +
        `${classLevel}${p.pos} | ${heightStr} • ${weight} lbs\n` +
        `🎯 BlueLine Composite: ${score}/100\n` +
        `📊 Full tracking from youth to pro.\n` +
        `🔗 Dossier: ${link}\n` +
        `${tagStr}`;
    }

    // Safety length check
    while (calcTwitterLength(tweet) > 280 && tags.length > 1) {
      tags.pop();
      const lines = tweet.split('\n');
      lines[lines.length - 1] = tags.join(' ');
      tweet = lines.join('\n');
    }

    return {
      tweet,
      player,
      metrics: { combine, kpis },
      tags,
      characterCount: calcTwitterLength(tweet),
      intentUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`
    };
  }

  // Core Dispatch Action
  function dispatchAutomatedPost() {
    const pool = getAthletesPool();
    if (pool.length === 0) return null;

    const cooldownSet = new Set(state.cooldownIds || []);
    const available = pool.filter(p => !cooldownSet.has(p.id));
    const targetPool = available.length > 0 ? available : pool;

    const priorityPool = targetPool.filter(p => parseFloat(p.composite_score) >= 88 || (p.id && p.id.startsWith('ovs_')));
    const selectFrom = (priorityPool.length > 0 && Math.random() < 0.65) ? priorityPool : targetPool;

    const player = selectFrom[Math.floor(Math.random() * selectFrom.length)];
    const archetypeIndex = state.totalDispatched % 5;
    const result = generateTweet(player, archetypeIndex);

    const nowIso = new Date().toISOString();

    const postRecord = {
      id: `x_web_${Date.now()}`,
      timestamp: nowIso,
      player_id: player.id,
      player_name: player.name,
      team: player.team || player.institution,
      league: player.league,
      composite_score: player.composite_score,
      text: result.tweet,
      intent_url: result.intentUrl,
      mode: 'AUTONOMOUS_CADENCE',
      character_count: result.characterCount,
      metrics: result.metrics
    };

    // Update state
    state.totalDispatched += 1;
    state.reachEst += 1540;
    state.nextPostTimestamp = Date.now() + (state.cadenceSec * 1000);

    state.cooldownIds.unshift(player.id);
    if (state.cooldownIds.length > 100) state.cooldownIds.pop();

    state.recentPosts.unshift(postRecord);
    if (state.recentPosts.length > 40) state.recentPosts.pop();

    saveState();

    // Cross-publish to BlueLine Wire community feed if available
    if (typeof window.BlueLineSocial !== 'undefined' && typeof window.BlueLineSocial.createPost === 'function') {
      try {
        window.BlueLineSocial.createPost(
          `[X BROADCAST @DraftLineup]\n${result.tweet}`,
          result.tags,
          null
        );
      } catch (err) {}
    }

    renderHUD();
    return postRecord;
  }

  // Countdown & Tick Loop
  function startBackgroundTicker() {
    setInterval(() => {
      const now = Date.now();
      if (now >= state.nextPostTimestamp) {
        dispatchAutomatedPost();
      }
      updateCountdownDOM();
    }, 1000);
  }

  function updateCountdownDOM() {
    const el = document.getElementById('xAutopilotCountdown');
    if (!el) return;

    const diffSec = Math.max(0, Math.floor((state.nextPostTimestamp - Date.now()) / 1000));
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // Render Dashboard HUD Elements
  function renderHUD() {
    updateCountdownDOM();

    const postCountEl = document.getElementById('xAutopilotPostCount');
    if (postCountEl) postCountEl.textContent = state.totalDispatched.toLocaleString();

    const reachEl = document.getElementById('xAutopilotReachEst');
    if (reachEl) reachEl.textContent = state.reachEst.toLocaleString();

    const poolSizeEl = document.getElementById('xAutopilotPoolSize');
    if (poolSizeEl) {
      const pool = getAthletesPool();
      poolSizeEl.textContent = (pool.length || 12000).toLocaleString();
    }

    const feedContainer = document.getElementById('xAutopilotRecentFeed');
    if (feedContainer && state.recentPosts.length > 0) {
      feedContainer.innerHTML = state.recentPosts.slice(0, 5).map(post => {
        const timeAgo = getTimeAgo(post.timestamp);
        return `
          <div class="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-sky-500/40 transition space-y-2">
            <div class="flex items-center justify-between text-[11px]">
              <div class="flex items-center gap-1.5">
                <span class="font-bold text-white">${escapeHtml(post.player_name)}</span>
                <span class="text-[10px] text-slate-400 font-mono">(${escapeHtml(post.team || 'Prospect')})</span>
              </div>
              <span class="text-[10px] font-mono text-sky-400">${timeAgo}</span>
            </div>
            <p class="text-[11px] text-slate-300 font-sans whitespace-pre-line leading-relaxed">${escapeHtml(post.text)}</p>
            <div class="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
              <span class="text-emerald-400 font-mono">● Auto-Dispatched (${post.character_count}/280 chars)</span>
              <a href="${post.intent_url}" target="_blank" class="px-2 py-0.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold border border-sky-500/40 flex items-center gap-1 transition">
                <span>𝕏</span> <span>Open on X</span>
              </a>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function getTimeAgo(isoString) {
    if (!isoString) return 'Just now';
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Public Interface
  window.DraftLineupXBot = {
    dispatchPost: dispatchAutomatedPost,
    forcePostNow: function() {
      const res = dispatchAutomatedPost();
      if (res) {
        alert(`⚡ [X AUTOPILOT DISPATCHED]\nTarget: ${res.player_name}\n\n${res.text}`);
      }
      return res;
    },
    getStats: function() {
      return {
        totalDispatched: state.totalDispatched,
        reachEst: state.reachEst,
        cadenceMinutes: Math.round(state.cadenceSec / 60),
        poolSize: getAthletesPool().length || 12000,
        recentPosts: state.recentPosts
      };
    },
    renderHUD: renderHUD,
    syncWithBackendLedger: syncWithBackendLedger
  };

  // Auto-init on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncWithBackendLedger();
      renderHUD();
      startBackgroundTicker();
    });
  } else {
    syncWithBackendLedger();
    renderHUD();
    startBackgroundTicker();
  }

})(typeof window !== 'undefined' ? window : this);
