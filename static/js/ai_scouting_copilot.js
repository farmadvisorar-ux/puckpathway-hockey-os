/**
 * DraftLineup.com - AI Scouting Co-Pilot & Conversational Intelligence Widget
 * 
 * Capabilities:
 * - Isomorphic floating chat widget on all 28 HTML modules
 * - Natural Language Scouting Engine:
 *   • Athlete Trajectory & Bio Evaluation (4,130+ dossiers)
 *   • Overseas Pro League & Rink Geometry Queries (61 clubs across SHL, Liiga, NL, DEL, etc.)
 *   • College & Prep Program Reconnaissance (170+ institutions)
 *   • Trade Machine Cap & Draft Pick Point Valuations
 * - Interactive 1-click navigation shortcuts to platform modules
 * - Keyboard shortcut: Ctrl+J / Cmd+J to toggle
 */

(function(window) {
  'use strict';

  // Prevent double-initialization
  if (window.BlueLineAIScoutingCopilot) return;

  const KNOWLEDGE_BASE = {
    greetings: [
      "Welcome to DraftLineup.com! I am your AI Scouting Co-Pilot. Ask me about athlete trajectory scores, 61 overseas pro clubs, draft pick trade values, or NCAA commitments!",
      "Greetings Recruiter! I can compare prospect stats, evaluate 85ft vs 98.4ft rink geometry, or calculate trade machine surplus values. What can I analyze for you today?"
    ]
  };

  // Scoped CSS Styles for Floating Widget
  function injectCopilotStyles() {
    if (document.getElementById('blueline-copilot-css')) return;

    const style = document.createElement('style');
    style.id = 'blueline-copilot-css';
    style.textContent = `
      #bluelineCopilotFab {
        position: fixed;
        bottom: 5.5rem;
        right: 1.25rem;
        z-index: 99990;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%);
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 0.75rem;
        font-weight: 800;
        border-radius: 9999px;
        border: 1px solid rgba(56, 189, 248, 0.5);
        box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.4), 0 0 15px rgba(99, 102, 241, 0.3);
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
      }
      @media (min-width: 769px) {
        #bluelineCopilotFab {
          bottom: 1.5rem;
        }
      }
      #bluelineCopilotFab:hover {
        transform: translateY(-3px) scale(1.03);
        box-shadow: 0 15px 30px -5px rgba(14, 165, 233, 0.6), 0 0 20px rgba(99, 102, 241, 0.5);
      }
      #bluelineCopilotFab:active {
        transform: scale(0.96);
      }

      #bluelineCopilotDrawer {
        position: fixed;
        bottom: 5rem;
        right: 1.25rem;
        width: 23rem;
        max-width: calc(100vw - 2.5rem);
        height: 30rem;
        max-height: calc(100vh - 7rem);
        z-index: 99995;
        background: #090d16;
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 1.25rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      #bluelineCopilotDrawer.hidden {
        display: none !important;
      }

      .copilot-header {
        padding: 0.85rem 1rem;
        background: rgba(15, 23, 42, 0.95);
        border-bottom: 1px solid rgba(51, 65, 85, 0.8);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .copilot-messages {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        background: rgba(2, 6, 23, 0.6);
      }
      .copilot-msg {
        max-width: 88%;
        padding: 0.65rem 0.85rem;
        border-radius: 0.85rem;
        font-size: 0.75rem;
        line-height: 1.45;
        word-wrap: break-word;
      }
      .copilot-msg.bot {
        align-self: flex-start;
        background: rgba(15, 23, 42, 0.9);
        color: #e2e8f0;
        border: 1px solid rgba(56, 189, 248, 0.25);
        border-bottom-left-radius: 0.2rem;
      }
      .copilot-msg.user {
        align-self: flex-end;
        background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
        color: #ffffff;
        font-weight: 600;
        border-bottom-right-radius: 0.2rem;
      }
      .copilot-input-area {
        padding: 0.75rem;
        background: rgba(15, 23, 42, 0.95);
        border-top: 1px solid rgba(51, 65, 85, 0.8);
        display: flex;
        gap: 0.5rem;
      }
      .copilot-input {
        flex: 1;
        background: #020617;
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 0.75rem;
        padding: 0.5rem 0.75rem;
        color: #ffffff;
        font-size: 0.75rem;
        outline: none;
      }
      .copilot-input:focus {
        border-color: #38bdf8;
      }
      .copilot-send-btn {
        background: #0284c7;
        color: white;
        border: none;
        border-radius: 0.75rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
      }
      .copilot-send-btn:hover {
        background: #0369a1;
      }
      .copilot-quick-chip {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        margin: 0.15rem;
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.3);
        border-radius: 0.5rem;
        font-size: 0.65rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s;
      }
      .copilot-quick-chip:hover {
        background: #0284c7;
        color: white;
      }
    `;
    document.head.appendChild(style);
  }

  // AI Response Generator
  function generateAIResponse(query) {
    const q = query.toLowerCase().trim();

    // 1. Athlete Prospect Query
    if (q.includes("hage") || q.includes("michael")) {
      return {
        text: "<strong>Michael Hage (C · #13)</strong><br>• Trajectory Score: <strong>92.4 / 100</strong><br>• Team: 🇨🇦 Team Canada U20 / Chicago Steel (USHL) / NCAA D1 Prospect<br>• Scouting Verdict: High-end top-six playmaking center with elite puck protection and 200ft vision.",
        link: "player.html?player=mp_0013",
        linkText: "Open Hage Passport →"
      };
    }
    if (q.includes("buium") || q.includes("zeev")) {
      return {
        text: "<strong>Zeev Buium (D)</strong><br>• Trajectory Score: <strong>94.1 / 100</strong><br>• Team: Denver Pioneers (NCAA D1)<br>• Scouting Verdict: Premier puck-moving transition defender with elite edge mobility and blue-line quarterbacking.",
        link: "player.html?player=mp_0002",
        linkText: "Inspect Buium Dossier →"
      };
    }
    if (q.includes("player") || q.includes("prospect") || q.includes("athlete")) {
      return {
        text: "DraftLineup.com tracks <strong>4,130+ verifiable non-NHL athletes</strong> across NCAA D1/D3, USHL, BCHL, CHL, and Prep Academies with real-time 8-axis radar metrics.",
        link: "database.html",
        linkText: "Search All 4,130 Athletes →"
      };
    }

    // 2. Overseas Pro Hockey Clubs Query
    if (q.includes("shl") || q.includes("sweden") || q.includes("frolunda") || q.includes("farjestad") || q.includes("vaxjo")) {
      return {
        text: "<strong>Swedish Hockey League (SHL) Directory:</strong><br>• 14 Premier Tier-1 Clubs (Frölunda 12,044 seats, Färjestad, Skellefteå, Rögle, etc.)<br>• Rink Size: <strong>98.4 ft (Olympic Width)</strong> — rewards perimeter edge speed and 2-point passing.",
        link: "database.html#overseas",
        linkText: "Explore 61 Overseas Clubs →"
      };
    }
    if (q.includes("liiga") || q.includes("finland") || q.includes("tappara") || q.includes("ilves")) {
      return {
        text: "<strong>Finnish Liiga Directory:</strong><br>• Top European Clubs (Tappara & Ilves at 13,455-capacity Nokia Arena)<br>• Rink Size: Hybrid 90 ft width — fast forechecking & tactical defensive structure.",
        link: "international.html",
        linkText: "International War Room →"
      };
    }
    if (q.includes("overseas") || q.includes("europe") || q.includes("club") || q.includes("del") || q.includes("swiss")) {
      return {
        text: "DraftLineup.com indexes <strong>61 elite overseas pro clubs</strong> across 10 leagues (SHL, Liiga, Swiss NL, DEL, Extraliga, EIHL, ALIH, AIHL) with seating capacities, arena geometry, and import roster limits.",
        link: "database.html#overseas",
        linkText: "View Overseas Pro Clubs Registry →"
      };
    }

    // 3. Trade & Cap Query
    if (q.includes("trade") || q.includes("pick") || q.includes("draft") || q.includes("cap") || q.includes("salary")) {
      return {
        text: "<strong>Trade Desk & Pick Valuation Barometer:</strong><br>• Pick #1 Overall = 1,000 pts<br>• Pick #16 = 260 pts<br>• Pick #32 = 132 pts<br>• Supports 50% double-salary retention and amateur prospect rights.",
        link: "market.html",
        linkText: "Launch Trade Machine →"
      };
    }

    // 4. Colleges & Prep Query
    if (q.includes("ncaa") || q.includes("college") || q.includes("denver") || q.includes("michigan") || q.includes("shattuck") || q.includes("edina")) {
      return {
        text: "<strong>Institutions Registry (170 Programs):</strong><br>• NCAA D1 Men & Women, NCAA D3, ACHA, USHL, NAHL, and Prep Academies (Shattuck-St. Mary's, Edina HS, Avon Old Farms).",
        link: "database.html?mode=institutions",
        linkText: "Browse Institutions Registry →"
      };
    }

    // Default Fallback
    return {
      text: `Analyzed query "${query}". I can inspect prospect trajectories, evaluate 61 overseas pro teams, calculate draft pick trade points, or search NCAA/Prep rosters.`,
      link: "database.html",
      linkText: "Search Master Directory →"
    };
  }

  // Render UI
  function initCopilotUI() {
    injectCopilotStyles();

    // Floating Button
    const fab = document.createElement('div');
    fab.id = 'bluelineCopilotFab';
    fab.innerHTML = `<span>🤖</span> <span>AI Scout Co-Pilot</span>`;
    document.body.appendChild(fab);

    // Chat Drawer
    const drawer = document.createElement('div');
    drawer.id = 'bluelineCopilotDrawer';
    drawer.className = 'hidden';
    drawer.innerHTML = `
      <div class="copilot-header">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <div style="width:1.75rem; height:1.75rem; border-radius:0.5rem; background:linear-gradient(135deg, #0284c7, #6366f1); display:flex; align-items:center; justify-content:center; font-size:0.9rem;">🤖</div>
          <div>
            <div style="font-size:0.8rem; font-weight:800; color:#ffffff;">AI Scout Co-Pilot</div>
            <div style="font-size:0.65rem; color:#10b981; font-family:monospace;">● DraftLineup.com Swarm Active</div>
          </div>
        </div>
        <button id="closeCopilotDrawerBtn" style="background:none; border:none; color:#94a3b8; font-size:1rem; cursor:pointer;" title="Close (Esc)">✕</button>
      </div>

      <div class="copilot-messages" id="copilotMessagesContainer">
        <div class="copilot-msg bot">
          ${KNOWLEDGE_BASE.greetings[0]}
          <div style="margin-top:0.5rem; display:flex; flex-wrap:wrap; gap:0.2rem;">
            <span class="copilot-quick-chip" onclick="window.BlueLineAIScoutingCopilot.sendQuery('Michael Hage')">🏒 Michael Hage</span>
            <span class="copilot-quick-chip" onclick="window.BlueLineAIScoutingCopilot.sendQuery('SHL Overseas Clubs')">🌍 SHL Teams</span>
            <span class="copilot-quick-chip" onclick="window.BlueLineAIScoutingCopilot.sendQuery('Draft Pick Values')">💼 Pick Values</span>
          </div>
        </div>
      </div>

      <div class="copilot-input-area">
        <input type="text" id="copilotInput" placeholder="Ask about prospects, SHL clubs, trade values..." class="copilot-input">
        <button id="sendCopilotBtn" class="copilot-send-btn">Send</button>
      </div>
    `;
    document.body.appendChild(drawer);

    // Event Handlers
    function toggleDrawer() {
      drawer.classList.toggle('hidden');
      if (!drawer.classList.contains('hidden')) {
        const input = document.getElementById('copilotInput');
        if (input) input.focus();
      }
    }

    fab.addEventListener('click', toggleDrawer);
    document.getElementById('closeCopilotDrawerBtn').addEventListener('click', toggleDrawer);

    // Keyboard Shortcut Ctrl+J / Cmd+J
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleDrawer();
      }
    });

    const sendBtn = document.getElementById('sendCopilotBtn');
    const inputEl = document.getElementById('copilotInput');

    function handleSend() {
      const q = inputEl.value.trim();
      if (!q) return;

      window.BlueLineAIScoutingCopilot.sendQuery(q);
      inputEl.value = '';
    }

    sendBtn.addEventListener('click', handleSend);
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // Public API
  window.BlueLineAIScoutingCopilot = {
    toggle: function() {
      const drawer = document.getElementById('bluelineCopilotDrawer');
      if (drawer) drawer.classList.toggle('hidden');
    },
    sendQuery: function(queryText) {
      const container = document.getElementById('copilotMessagesContainer');
      const drawer = document.getElementById('bluelineCopilotDrawer');
      if (!container || !drawer) return;

      if (drawer.classList.contains('hidden')) drawer.classList.remove('hidden');

      // User Msg
      const uMsg = document.createElement('div');
      uMsg.className = 'copilot-msg user';
      uMsg.textContent = queryText;
      container.appendChild(uMsg);

      // Bot Msg
      const res = generateAIResponse(queryText);
      const bMsg = document.createElement('div');
      bMsg.className = 'copilot-msg bot';
      bMsg.innerHTML = res.text + (res.link ? `<br><a href="${res.link}" class="copilot-quick-chip" style="margin-top:0.4rem; display:inline-block;">${res.linkText || 'Open Module →'}</a>` : '');
      container.appendChild(bMsg);

      container.scrollTop = container.scrollHeight;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCopilotUI);
  } else {
    initCopilotUI();
  }

})(typeof window !== 'undefined' ? window : global);
