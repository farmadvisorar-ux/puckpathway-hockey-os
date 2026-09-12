/**
 * PuckPathway OS - Live Broadcast Commentary & Voice AI Telemetry Studio
 * 
 * Ingestion Channels:
 * 1. Live Continuous Broadcast Microphone (Web Speech API)
 * 2. Coach Voice Dictation Studio with Web Audio Visualizer
 * 3. Browser Tab / Stream Audio Capture
 * 4. Post-Game Media Audio/Video File Upload
 * 5. Live Closed Caption / Text Stream & Instant Championship Simulations
 */

let appData = window.EMBEDDED_PUCKPATHWAY_DATA || { teams: [], players: [] };
let homeTeam = null;
let awayTeam = null;
let homeRoster = [];
let awayRoster = [];

// Game State
let gameState = {
  homeScore: 3,
  awayScore: 2,
  period: "3rd Period",
  clock: "14:28",
  homeMomentum: 58,
  awayMomentum: 42
};

// Events & Telemetry Store
let parsedEvents = [];
let playerStats = {}; // Keyed by player.id
let coachNotes = [];
let reportScope = 'all'; // 'all', 'home', 'away', 'custom'
let selectedCustomPlayerIds = new Set();

// Speech Recognition & Audio State
let broadcastRecognizer = null;
let isBroadcastListening = false;
let coachRecognizer = null;
let isCoachListening = false;
let audioContext = null;
let analyserNode = null;
let visualizerAnimId = null;

// Simulation State
let simInterval = null;
let isSimRunning = false;
let simIndex = 0;

// Presets Data
const PRESETS = {
  ncaa_final: [
    { text: "Jack Devine carries the puck across the blue line on a controlled zone entry for Denver.", clock: "14:28", period: "3rd" },
    { text: "Devine protects the puck along the half-board and feeds Zeev Buium at the point.", clock: "14:15", period: "3rd" },
    { text: "Buium walks the line, head up, brilliant shoulder scan, and snaps a wrist shot through traffic!", clock: "14:02", period: "3rd" },
    { text: "Jacob Fowler flashes the glove with a tremendous save for Boston College, freezing the puck!", clock: "13:58", period: "3rd" },
    { text: "Clean faceoff win by Carter King in the offensive zone back to the Denver point.", clock: "13:45", period: "3rd" },
    { text: "Ryan Leonard intercepts the clearing attempt with a stick check at the blue line!", clock: "13:30", period: "3rd" },
    { text: "Leonard dishes across the seam to Gabe Perreault, who cuts into the high danger slot!", clock: "13:14", period: "3rd" },
    { text: "Perreault fires a laser into the top corner, GOAL Boston College! What a release!", clock: "13:02", period: "3rd" },
    { text: "Matt Davis responds on the next shift with a sprawling pad save to deny Will Smith on the doorstep!", clock: "12:44", period: "3rd" },
    { text: "Heavy crunching body check along the glass by Ryan Leonard on Zeev Buium!", clock: "12:20", period: "3rd" },
    { text: "Jack Devine strips the puck at center ice, takeaway Denver, and counters on an odd-man rush!", clock: "11:55", period: "3rd" },
    { text: "Devine snipes it glove-side past Fowler, GOAL Denver! A clutch response by the Hobey Baker finalist!", clock: "11:40", period: "3rd" }
  ],
  ushl_ot: [
    { text: "Sudden death overtime underway in Game 7 of the Clark Cup Finals!", clock: "19:45", period: "OT" },
    { text: "Fargo Force wins the opening draw and moves into the attack zone.", clock: "19:30", period: "OT" },
    { text: "Quick release wrist shot on goal by Fargo, turned aside by the Steel netminder.", clock: "19:10", period: "OT" },
    { text: "Chicago Steel breaks out with speed, controlled zone entry down the right wing.", clock: "18:45", period: "OT" },
    { text: "Turnover coughed up in the neutral zone, intercepted by Fargo!", clock: "18:20", period: "OT" },
    { text: "Slap shot blast from the high slot, finds the back of the net, GOAL and the championship!", clock: "17:55", period: "OT" }
  ],
  coach_scrimmage: [
    { text: "Coach Observation: Devine displayed exceptional pre-touch shoulder scanning before initiating the breakout.", clock: "15:00", period: "Practice", isCoach: true },
    { text: "Coach Observation: Leonard won three consecutive wall battles down low, elite puck protection.", clock: "14:10", period: "Practice", isCoach: true },
    { text: "Coach Observation: Defensive gap control needs tightening on cross-ice saucer passes.", clock: "13:20", period: "Practice", isCoach: true },
    { text: "Coach Observation: Buium executed a flawless deception fake along the blue line to create open shooting lanes.", clock: "12:05", period: "Practice", isCoach: true }
  ]
};

// Initialization on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTeamSelectors();
  setupChannelTabs();
  setupSpeechRecognition();
  setupCoachVoiceStudio();
  setupMediaChannels();
  setupSimulationControls();
  setupExportModal();
  setupManualInputs();

  // Load initial simulated data so the page is immediately alive and populated
  runInitialPresetIngestion();
});

/* --------------------------------------------------------------------------
   TEAM SELECTORS & ROSTERS
   -------------------------------------------------------------------------- */
function initTeamSelectors() {
  const homeSelect = document.getElementById('homeTeamSelect');
  const awaySelect = document.getElementById('awayTeamSelect');

  if (!appData.teams || appData.teams.length === 0) return;

  // Clear existing options
  if (homeSelect) homeSelect.innerHTML = '';
  if (awaySelect) awaySelect.innerHTML = '';

  appData.teams.forEach(team => {
    const optHome = document.createElement('option');
    optHome.value = team.id;
    optHome.textContent = `${team.name} (${team.tier || 'Team'})`;
    homeSelect.appendChild(optHome);

    const optAway = document.createElement('option');
    optAway.value = team.id;
    optAway.textContent = `${team.name} (${team.tier || 'Team'})`;
    awaySelect.appendChild(optAway);
  });

  // Default to Denver Pioneers vs Boston College if present, otherwise first 2 teams
  const denver = appData.teams.find(t => t.id === 'team_denver_pioneers') || appData.teams[0];
  const bc = appData.teams.find(t => t.id === 'team_boston_college') || appData.teams[1] || appData.teams[0];

  if (homeSelect && denver) homeSelect.value = denver.id;
  if (awaySelect && bc) awaySelect.value = bc.id;

  updateActiveMatchup();

  homeSelect.addEventListener('change', updateActiveMatchup);
  awaySelect.addEventListener('change', updateActiveMatchup);
}

function updateActiveMatchup() {
  const homeId = document.getElementById('homeTeamSelect').value;
  const awayId = document.getElementById('awayTeamSelect').value;

  homeTeam = appData.teams.find(t => t.id === homeId) || { name: "Home Team", id: homeId };
  awayTeam = appData.teams.find(t => t.id === awayId) || { name: "Away Team", id: awayId };

  // Filter Rosters
  homeRoster = (appData.players || []).filter(p => p.current_team_id === homeId);
  awayRoster = (appData.players || []).filter(p => p.current_team_id === awayId);

  // If collegiate teams have 0 or few explicit roster ties, backfill relevant players
  if (homeRoster.length === 0 && appData.players) {
    homeRoster = appData.players.filter(p => (p.team && p.team.toLowerCase().includes(homeTeam.name.toLowerCase())) || (p.current_team_id && p.current_team_id.includes('den')));
  }
  if (awayRoster.length === 0 && appData.players) {
    awayRoster = appData.players.filter(p => (p.team && p.team.toLowerCase().includes(awayTeam.name.toLowerCase())) || (p.current_team_id && p.current_team_id.includes('bc')));
  }

  // Update UI Labels
  const homeCountEl = document.getElementById('homeRosterCountLabel');
  const awayCountEl = document.getElementById('awayRosterCountLabel');
  if (homeCountEl) homeCountEl.textContent = `${homeRoster.length} active skaters tracked`;
  if (awayCountEl) awayCountEl.textContent = `${awayRoster.length} active skaters tracked`;

  const homeAbbr = homeTeam.name.replace('University of ', '').split(' ')[0].toUpperCase();
  const awayAbbr = awayTeam.name.replace('University of ', '').split(' ')[0].toUpperCase();
  const homeAbbrEl = document.getElementById('homeAbbrLabel');
  const awayAbbrEl = document.getElementById('awayAbbrLabel');
  if (homeAbbrEl) homeAbbrEl.textContent = homeAbbr;
  if (awayAbbrEl) awayAbbrEl.textContent = awayAbbr;

  // Initialize player stats tracking
  [...homeRoster, ...awayRoster].forEach(p => {
    if (!playerStats[p.id]) {
      playerStats[p.id] = {
        player: p,
        teamId: p.current_team_id || (homeRoster.includes(p) ? homeTeam.id : awayTeam.id),
        mentions: 0,
        goals: 0,
        assists: 0,
        points: 0,
        sog: 0,
        saves: 0,
        hits: 0,
        takeaways: 0,
        turnovers: 0,
        blocks: 0,
        faceoffs_w: 0,
        faceoffs_l: 0,
        entries: 0,
        exits: 0,
        impactScore: 78.0,
        quotes: []
      };
    }
  });

  renderPlayerTelemetryCards();
  populateCustomPlayerChecklist();
}

/* --------------------------------------------------------------------------
   INGESTION CHANNEL TABS
   -------------------------------------------------------------------------- */
function setupChannelTabs() {
  document.querySelectorAll('.channel-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.channel-tab-btn').forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white', 'shadow-lg', 'shadow-purple-600/20');
        b.classList.add('bg-slate-900', 'text-slate-300', 'border', 'border-slate-800');
      });
      btn.classList.add('bg-purple-600', 'text-white', 'shadow-lg', 'shadow-purple-600/20');
      btn.classList.remove('bg-slate-900', 'text-slate-300', 'border', 'border-slate-800');

      const channel = btn.dataset.channel;
      document.querySelectorAll('.channel-panel').forEach(p => p.classList.add('hidden'));
      const activePanel = document.getElementById(`channelPanel-${channel}`);
      if (activePanel) activePanel.classList.remove('hidden');
    });
  });
}

/* --------------------------------------------------------------------------
   CHANNEL 1: CONTINUOUS BROADCAST ROOM SPEECH RECOGNITION
   -------------------------------------------------------------------------- */
function setupSpeechRecognition() {
  const toggleBtn = document.getElementById('toggleMicListenBtn');
  const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechClass) {
    if (toggleBtn) {
      toggleBtn.disabled = false;
      toggleBtn.addEventListener('click', () => {
        showToast("Browser native SpeechRecognition not active. Falling back to Live Text & Preset Simulation Mode!", "info");
        document.querySelector('[data-channel="text"]').click();
      });
    }
    return;
  }

  broadcastRecognizer = new SpeechClass();
  broadcastRecognizer.continuous = true;
  broadcastRecognizer.interimResults = false;
  broadcastRecognizer.lang = 'en-US';

  broadcastRecognizer.onresult = (event) => {
    const lastResultIndex = event.results.length - 1;
    const transcript = event.results[lastResultIndex][0].transcript.trim();
    if (transcript) {
      ingestCommentarySentence(transcript, { source: 'broadcast_mic' });
    }
  };

  broadcastRecognizer.onerror = (err) => {
    console.warn("Broadcast mic recognition error:", err);
    updateMicStatus(false, `Mic Error: ${err.error || 'Blocked'}`);
  };

  broadcastRecognizer.onend = () => {
    if (isBroadcastListening) {
      try { broadcastRecognizer.start(); } catch (e) {}
    } else {
      updateMicStatus(false, "Microphone Idle");
    }
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      if (isBroadcastListening) {
        isBroadcastListening = false;
        broadcastRecognizer.stop();
        updateMicStatus(false, "Microphone Stopped");
      } else {
        try {
          isBroadcastListening = true;
          broadcastRecognizer.start();
          updateMicStatus(true, "Listening to Broadcast...");
        } catch (e) {
          console.warn("Could not start recognizer:", e);
        }
      }
    });
  }
}

function updateMicStatus(active, text) {
  const dot = document.getElementById('micStatusDot');
  const label = document.getElementById('micStatusText');
  const btnText = document.getElementById('micBtnText');
  const btnIcon = document.getElementById('micBtnIcon');

  if (dot) {
    dot.className = active ? 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse' : 'w-2.5 h-2.5 rounded-full bg-slate-600';
  }
  if (label) label.textContent = text;
  if (btnText) btnText.textContent = active ? 'Stop Listening' : 'Start Listening to Broadcast';
  if (btnIcon) btnIcon.textContent = active ? '⏹️' : '🎙️';
}

/* --------------------------------------------------------------------------
   CHANNEL 2: COACH VOICE DICTATION & WEBAUDIO OSCILLOSCOPE
   -------------------------------------------------------------------------- */
function setupCoachVoiceStudio() {
  const pttBtn = document.getElementById('toggleCoachPttBtn');
  const pttText = document.getElementById('coachPttBtnText');
  const canvas = document.getElementById('coachAudioVisualizer');
  const dbLabel = document.getElementById('coachAudioDbLabel');

  const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechClass) {
    coachRecognizer = new SpeechClass();
    coachRecognizer.continuous = true;
    coachRecognizer.interimResults = false;
    coachRecognizer.lang = 'en-US';

    coachRecognizer.onresult = (event) => {
      const lastIndex = event.results.length - 1;
      const text = event.results[lastIndex][0].transcript.trim();
      if (text) {
        ingestCommentarySentence(text, { source: 'coach_voice', isCoach: true });
      }
    };
    coachRecognizer.onerror = (e) => console.warn("Coach voice recognizer error:", e);
    coachRecognizer.onend = () => {
      if (isCoachListening) {
        try { coachRecognizer.start(); } catch (e) {}
      }
    };
  }

  async function startAudioVisualizer() {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);

      drawVisualizer();
      if (dbLabel) dbLabel.textContent = "INPUT: ACTIVE (SPEAK NOW)";
    } catch (err) {
      console.warn("Could not access microphone for visualizer:", err);
      if (dbLabel) dbLabel.textContent = "INPUT: SIMULATED WAVEFORM";
      drawSimulatedWaveform();
    }
  }

  function drawVisualizer() {
    if (!canvas || !analyserNode) return;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function render() {
      visualizerAnimId = requestAnimationFrame(render);
      analyserNode.getByteTimeDomainData(dataArray);

      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }
    render();
  }

  function drawSimulatedWaveform() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;
    function renderSim() {
      visualizerAnimId = requestAnimationFrame(renderSim);
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.05 + phase) * (canvas.height * 0.25) * (isCoachListening ? 1.0 : 0.1);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      phase += 0.1;
    }
    renderSim();
  }

  // PTT and Click Toggles
  if (pttBtn) {
    pttBtn.addEventListener('click', () => {
      isCoachListening = !isCoachListening;
      if (isCoachListening) {
        pttBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500');
        pttBtn.classList.add('bg-rose-600', 'hover:bg-rose-500');
        if (pttText) pttText.textContent = "Listening... (Click to Stop)";
        startAudioVisualizer();
        if (coachRecognizer) {
          try { coachRecognizer.start(); } catch (e) {}
        }
        showToast("Coach Voice Ingestion Active! Speak your tactical observations.", "success");
      } else {
        pttBtn.classList.remove('bg-rose-600', 'hover:bg-rose-500');
        pttBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500');
        if (pttText) pttText.textContent = "Hold to Talk (or Click for Hands-Free)";
        if (coachRecognizer) {
          try { coachRecognizer.stop(); } catch (e) {}
        }
        if (dbLabel) dbLabel.textContent = "INPUT: IDLE";
      }
    });
  }

  // Quick Preset Coach Quotes
  document.querySelectorAll('.coach-quick-quote').forEach(btn => {
    btn.addEventListener('click', () => {
      const quote = btn.textContent.trim().replace(/^"|"$/g, '');
      ingestCommentarySentence(quote, { source: 'coach_preset', isCoach: true });
      showToast("Ingested Coach Tactical Observation!", "info");
    });
  });
}

/* --------------------------------------------------------------------------
   CHANNELS 3 & 4: TAB STREAM CAPTURE & MEDIA FILE UPLOAD
   -------------------------------------------------------------------------- */
function setupMediaChannels() {
  const tabBtn = document.getElementById('startTabAudioBtn');
  if (tabBtn) {
    tabBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        showToast("Connected to live broadcast stream! Ingesting audio...", "success");
        setupSpeechRecognition();
      } catch (err) {
        console.warn("Display media cancelled or unsupported:", err);
        showToast("Tab stream cancelled or audio track not selected.", "info");
      }
    });
  }

  const mediaInput = document.getElementById('mediaUploadInput');
  if (mediaInput) {
    mediaInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        const audioEl = document.getElementById('mediaAudioElement');
        const container = document.getElementById('mediaPlayerContainer');
        const filenameLabel = document.getElementById('mediaFileNameLabel');

        if (filenameLabel) filenameLabel.textContent = file.name;
        if (audioEl) {
          audioEl.src = url;
          audioEl.play();
        }
        if (container) container.classList.remove('hidden');
        showToast(`Loaded audio file: ${file.name}`, 'success');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   CHANNEL 5: TEXT STREAM & SIMULATION
   -------------------------------------------------------------------------- */
function setupManualInputs() {
  const manualInput = document.getElementById('manualCommentaryInput');
  const parseBtn = document.getElementById('sendManualCommentaryBtn');

  function submitManual() {
    if (!manualInput) return;
    const text = manualInput.value.trim();
    if (text) {
      ingestCommentarySentence(text, { source: 'manual' });
      manualInput.value = '';
    }
  }

  if (parseBtn) parseBtn.addEventListener('click', submitManual);
  if (manualInput) {
    manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitManual();
      }
    });
  }
}

function setupSimulationControls() {
  const runBtn = document.getElementById('runSimBtn');
  const simIcon = document.getElementById('simBtnIcon');
  const simText = document.getElementById('simBtnText');

  if (runBtn) {
    runBtn.addEventListener('click', () => {
      if (isSimRunning) {
        // Stop Simulation
        clearInterval(simInterval);
        isSimRunning = false;
        if (simIcon) simIcon.textContent = '▶️';
        if (simText) simText.textContent = 'Run Live Simulation';
        showToast("Simulation Paused", "info");
      } else {
        // Start Simulation
        isSimRunning = true;
        if (simIcon) simIcon.textContent = '⏸️';
        if (simText) simText.textContent = 'Pause Simulation';
        
        const presetKey = document.getElementById('simPresetSelect')?.value || 'ncaa_final';
        const script = PRESETS[presetKey] || PRESETS.ncaa_final;

        showToast(`Running Live Commentary Simulation: ${presetKey.toUpperCase()}`, "success");

        simInterval = setInterval(() => {
          if (simIndex >= script.length) {
            simIndex = 0; // Loop or finish
          }
          const item = script[simIndex];
          ingestCommentarySentence(item.text, {
            source: 'simulation',
            clock: item.clock,
            period: item.period,
            isCoach: !!item.isCoach
          });
          simIndex++;
        }, 2600);
      }
    });
  }
}

function runInitialPresetIngestion() {
  // Pre-load the first 4 lines of NCAA final so initial view has rich live data
  const initialLines = PRESETS.ncaa_final.slice(0, 4);
  initialLines.forEach(item => {
    ingestCommentarySentence(item.text, {
      source: 'initial_preload',
      clock: item.clock,
      period: item.period,
      silentToast: true
    });
  });
}

/* --------------------------------------------------------------------------
   REAL-TIME HOCKEY NLP & EVENT PARSER ENGINE
   -------------------------------------------------------------------------- */
function ingestCommentarySentence(text, options = {}) {
  if (!text || typeof text !== 'string') return;

  const clock = options.clock || gameState.clock;
  const period = options.period || gameState.period;
  const isCoach = !!options.isCoach;

  // 1. Identify Skater / Player in Text
  const identified = matchPlayerInText(text);

  // 2. Classify Event Type
  const eventType = classifyEventType(text, isCoach);

  // 3. Highlight Entities in Text
  const highlightedHtml = highlightEntities(text, identified ? identified.player.name : null, eventType);

  // 4. Determine Coordinates on Rink
  const coords = estimateRinkCoordinates(eventType, identified);

  // 5. Update Telemetry & Momentum
  updateTelemetryState(identified, eventType, text, isCoach);

  // 6. Record Event Object
  const eventObj = {
    id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    text: text,
    highlightedHtml: highlightedHtml,
    clock: clock,
    period: period,
    player: identified ? identified.player : null,
    teamId: identified ? identified.teamId : null,
    eventType: eventType,
    coords: coords,
    isCoach: isCoach,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };

  parsedEvents.unshift(eventObj); // Most recent at top

  // 7. Update UI
  renderLiveFeedItem(eventObj);
  dropRinkRadarPin(eventObj);
  renderPlayerTelemetryCards();
  updateScoreboardUI();

  if (!options.silentToast && isCoach) {
    showToast(`Recorded Coach Observation: "${text.substring(0, 40)}..."`, 'info');
  }
}

function matchPlayerInText(text) {
  const allTracked = [...homeRoster, ...awayRoster];
  const lowerText = text.toLowerCase();

  // 1. Exact full name match
  for (const p of allTracked) {
    if (lowerText.includes(p.name.toLowerCase())) {
      const isHome = homeRoster.some(hp => hp.id === p.id);
      return { player: p, teamId: isHome ? homeTeam.id : awayTeam.id };
    }
  }

  // 2. Last name match
  for (const p of allTracked) {
    const parts = p.name.split(' ');
    const lastName = parts[parts.length - 1].toLowerCase();
    if (lastName.length >= 3 && lowerText.includes(lastName)) {
      const isHome = homeRoster.some(hp => hp.id === p.id);
      return { player: p, teamId: isHome ? homeTeam.id : awayTeam.id };
    }
  }

  // 3. Number match (#4, #8, #12, etc.)
  for (const p of allTracked) {
    if (p.jersey_number && lowerText.includes(`#${p.jersey_number}`)) {
      const isHome = homeRoster.some(hp => hp.id === p.id);
      return { player: p, teamId: isHome ? homeTeam.id : awayTeam.id };
    }
  }

  // 4. Fallback search across non-pro players and coaches
  const registryCandidates = window.MASTER_NON_PRO_REGISTRY || window.MASTER_PLAYERS;
  if (registryCandidates && registryCandidates.length) {
    for (const p of registryCandidates) {
      if (lowerText.includes(p.name.toLowerCase())) {
        return { player: p, teamId: p.team || 'Collegiate Roster' };
      }
    }
    for (const p of registryCandidates) {
      const parts = p.name.split(' ');
      const lastName = parts[parts.length - 1].toLowerCase();
      if (lastName.length >= 4 && lowerText.includes(lastName)) {
        return { player: p, teamId: p.team || 'Collegiate Roster' };
      }
    }
  }

  return null;
}

function classifyEventType(text, isCoach) {
  if (isCoach) return 'coach_note';
  const lower = text.toLowerCase();

  if (/(scores?|scored|finds the back of the net|snipes?|lights? the lamp|puts? it home|buries? it|beats? the goalie|goal!)/i.test(lower)) {
    return 'goal';
  }
  if (/(assist(ed)?|set up by|feed from|dishes? to|saucer pass from|primary helper|cycles? (it )?to)/i.test(lower)) {
    return 'assist';
  }
  if (/(saves?|stops?|glove save|pad save|kicks? away|denied by|covers? the puck|flash the leather)/i.test(lower)) {
    return 'save';
  }
  if (/(shots?|fires?|rips?|wrist shot|slap shot|one-timer|snaps? a quick shot|tested the keeper)/i.test(lower)) {
    return 'shot';
  }
  if (/(hits?|crunching hit|body check|levels?|pins? him to the boards|heavy hit)/i.test(lower)) {
    return 'hit';
  }
  if (/(steals?|stolen|interception|strips? the puck|stick check|pokes? it away|forces? the turnover)/i.test(lower)) {
    return 'takeaway';
  }
  if (/(turnover|coughed up|giveaway|lost control|misplayed pass)/i.test(lower)) {
    return 'turnover';
  }
  if (/(wins? the draw|faceoff win|controlled the draw)/i.test(lower)) {
    return 'faceoff_win';
  }
  if (/(carries? across the blue line|gains? the zone|controlled entry|rushes? in)/i.test(lower)) {
    return 'zone_entry';
  }
  if (/(blocks?|gets? in front of the shot|lays? out to block)/i.test(lower)) {
    return 'block';
  }
  return 'general_play';
}

function highlightEntities(text, playerName, eventType) {
  let res = text;
  if (playerName) {
    const reg = new RegExp(`(${playerName}|${playerName.split(' ').pop()})`, 'gi');
    res = res.replace(reg, '<span class="entity-player">$1</span>');
  }

  // Highlight action verbs
  const posRegex = /(scores?|scored|goal!|assist(ed)?|snipes?|buries?|great save|laser|flashes? the glove|clean faceoff win)/gi;
  res = res.replace(posRegex, '<span class="entity-action-pos">$1</span>');

  const negRegex = /(turnover|coughed up|giveaway|penalty|missed|failed)/gi;
  res = res.replace(negRegex, '<span class="entity-action-neg">$1</span>');

  const physRegex = /(crunching hit|body check|levels?|pins? him|hits?)/gi;
  res = res.replace(physRegex, '<span class="entity-action-phys">$1</span>');

  return res;
}

function estimateRinkCoordinates(eventType, identified) {
  let isHome = true;
  if (identified && identified.teamId === awayTeam?.id) isHome = false;

  // Rink coordinates in percentages (x_pct: 0 to 100, y_pct: 0 to 100)
  // Left is home attacking right, or vice versa
  let x = 50;
  let y = 50;

  if (eventType === 'goal' || eventType === 'shot') {
    x = isHome ? 82 + (Math.random() * 8 - 4) : 18 + (Math.random() * 8 - 4);
    y = 50 + (Math.random() * 26 - 13);
  } else if (eventType === 'save') {
    x = isHome ? 15 : 85;
    y = 50;
  } else if (eventType === 'hit') {
    x = 30 + Math.random() * 40;
    y = Math.random() > 0.5 ? 18 : 82;
  } else if (eventType === 'takeaway' || eventType === 'turnover') {
    x = 40 + Math.random() * 20;
    y = 35 + Math.random() * 30;
  } else if (eventType === 'zone_entry') {
    x = isHome ? 65 : 35;
    y = 25 + Math.random() * 50;
  }
  return { x: Math.round(x), y: Math.round(y) };
}

function updateTelemetryState(identified, eventType, text, isCoach) {
  let momentumShift = 0;
  let isHome = true;

  if (identified) {
    const stats = playerStats[identified.player.id];
    if (stats) {
      stats.mentions++;
      stats.quotes.push(text);

      if (eventType === 'goal') {
        stats.goals++;
        stats.points++;
        stats.sog++;
        stats.impactScore = Math.min(99.5, stats.impactScore + 4.5);
        momentumShift = 8;
        if (identified.teamId === homeTeam?.id) gameState.homeScore++;
        else gameState.awayScore++;
      } else if (eventType === 'assist') {
        stats.assists++;
        stats.points++;
        stats.impactScore = Math.min(99.5, stats.impactScore + 3.0);
        momentumShift = 4;
      } else if (eventType === 'shot') {
        stats.sog++;
        stats.impactScore = Math.min(99.5, stats.impactScore + 1.2);
        momentumShift = 2;
      } else if (eventType === 'save') {
        stats.saves++;
        stats.impactScore = Math.min(99.5, stats.impactScore + 2.5);
        momentumShift = 3;
      } else if (eventType === 'hit') {
        stats.hits++;
        stats.impactScore = Math.min(99.5, stats.impactScore + 1.5);
        momentumShift = 2;
      } else if (eventType === 'takeaway') {
        stats.takeaways++;
        stats.impactScore = Math.min(99.5, stats.impactScore + 2.2);
        momentumShift = 3;
      } else if (eventType === 'turnover') {
        stats.turnovers++;
        stats.impactScore = Math.max(50.0, stats.impactScore - 2.8);
        momentumShift = -4;
      } else if (eventType === 'zone_entry') {
        stats.entries++;
        stats.impactScore = Math.min(99.5, stats.impactScore + 1.0);
        momentumShift = 2;
      }
    }
    if (identified.teamId === awayTeam?.id) isHome = false;
  }

  // Shift momentum tug-of-war
  if (isHome) {
    gameState.homeMomentum = Math.min(85, Math.max(15, gameState.homeMomentum + momentumShift));
    gameState.awayMomentum = 100 - gameState.homeMomentum;
  } else {
    gameState.awayMomentum = Math.min(85, Math.max(15, gameState.awayMomentum + momentumShift));
    gameState.homeMomentum = 100 - gameState.awayMomentum;
  }
}

/* --------------------------------------------------------------------------
   UI RENDERING FUNCTIONS
   -------------------------------------------------------------------------- */
function renderLiveFeedItem(ev) {
  const feed = document.getElementById('liveCommentaryFeed');
  const emptyNotice = document.getElementById('emptyFeedNotice');
  if (emptyNotice) emptyNotice.remove();
  if (!feed) return;

  const countBadge = document.getElementById('liveEventCountBadge');
  if (countBadge) countBadge.textContent = `${parsedEvents.length} events parsed`;

  let badgeHtml = '';
  if (ev.eventType === 'goal') badgeHtml = '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-[9px]">🚨 GOAL</span>';
  else if (ev.eventType === 'assist') badgeHtml = '<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-black text-[9px]">🎯 ASSIST</span>';
  else if (ev.eventType === 'save') badgeHtml = '<span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-black text-[9px]">🧤 SAVE</span>';
  else if (ev.eventType === 'shot') badgeHtml = '<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold text-[9px]">🏒 SOG</span>';
  else if (ev.eventType === 'hit') badgeHtml = '<span class="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-[9px]">💥 HIT</span>';
  else if (ev.eventType === 'takeaway') badgeHtml = '<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[9px]">⚡ STEAL</span>';
  else if (ev.eventType === 'turnover') badgeHtml = '<span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[9px]">⚠️ TURNOVER</span>';
  else if (ev.isCoach) badgeHtml = '<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-[9px]">🗣️ COACH NOTE</span>';
  else badgeHtml = '<span class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px]">🏒 PLAY</span>';

  const itemEl = document.createElement('div');
  itemEl.className = 'p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 transition hover:border-purple-500/40';
  itemEl.innerHTML = `
    <div class="flex items-center justify-between text-[11px]">
      <div class="flex items-center gap-2">
        ${badgeHtml}
        ${ev.player ? `<span class="font-bold text-white">${ev.player.name} (${ev.player.position || 'F'})</span>` : ''}
      </div>
      <div class="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
        <span>${ev.period}</span>
        <span>•</span>
        <span>${ev.clock}</span>
      </div>
    </div>
    <p class="text-xs text-slate-300 leading-relaxed">${ev.highlightedHtml}</p>
  `;

  feed.insertBefore(itemEl, feed.firstChild);
}

function dropRinkRadarPin(ev) {
  const container = document.getElementById('rinkRadarPins');
  if (!container) return;

  let pinColor = 'bg-sky-400';
  let pinLabel = '•';
  if (ev.eventType === 'goal') {
    pinColor = 'bg-emerald-400 animate-ping';
    pinLabel = '🚨';
  } else if (ev.eventType === 'hit') {
    pinColor = 'bg-purple-500';
    pinLabel = '💥';
  } else if (ev.eventType === 'takeaway') {
    pinColor = 'bg-amber-400';
    pinLabel = '⚡';
  }

  const pin = document.createElement('div');
  pin.className = `absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300`;
  pin.style.left = `${ev.coords.x}%`;
  pin.style.top = `${ev.coords.y}%`;
  pin.innerHTML = `
    <div class="w-4 h-4 rounded-full ${pinColor} text-slate-950 font-bold text-[9px] flex items-center justify-center shadow-lg shadow-black" title="${ev.text}">
      ${pinLabel}
    </div>
  `;
  container.appendChild(pin);

  // Keep max 25 pins
  if (container.children.length > 25) {
    container.removeChild(container.firstChild);
  }
}

function renderPlayerTelemetryCards() {
  const container = document.getElementById('playerTelemetryCards');
  if (!container) return;

  const filter = document.getElementById('leaderboardTeamFilter')?.value || 'all';

  // Get active players with stats, sort by impact score
  let entries = Object.values(playerStats);
  if (filter === 'home') entries = entries.filter(e => e.teamId === homeTeam?.id);
  else if (filter === 'away') entries = entries.filter(e => e.teamId === awayTeam?.id);

  entries.sort((a, b) => b.impactScore - a.impactScore);

  container.innerHTML = entries.map(s => {
    const isHome = s.teamId === homeTeam?.id;
    const teamBadge = isHome ? `<span class="text-[9px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">${homeTeam.name.split(' ')[0]}</span>` :
                             `<span class="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">${awayTeam.name.split(' ')[0]}</span>`;

    return `
      <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-sky-500/40 transition">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
              #${s.player.jersey_number || (s.player.position || 'F')}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <a href="player.html?id=${s.player.id}" class="font-bold text-xs text-white hover:text-sky-400 transition underline-offset-2 hover:underline">${s.player.name}</a>
                ${teamBadge}
              </div>
              <span class="text-[10px] text-slate-400">${s.player.position || 'Forward'} • ${s.mentions} mentions in broadcast</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[9px] text-slate-400 uppercase font-bold block">Live Impact</span>
            <span class="text-sm font-black text-emerald-400 font-mono">${s.impactScore.toFixed(1)}</span>
          </div>
        </div>

        <div class="grid grid-cols-5 gap-1.5 text-center text-[10px] pt-1 border-t border-slate-800/60 font-mono">
          <div class="p-1 rounded bg-slate-950">
            <span class="text-slate-500 block text-[8px] uppercase">PTS</span>
            <span class="font-bold text-white">${s.points}</span>
          </div>
          <div class="p-1 rounded bg-slate-950">
            <span class="text-slate-500 block text-[8px] uppercase">G / A</span>
            <span class="font-bold text-slate-200">${s.goals}/${s.assists}</span>
          </div>
          <div class="p-1 rounded bg-slate-950">
            <span class="text-slate-500 block text-[8px] uppercase">SOG</span>
            <span class="font-bold text-sky-400">${s.sog}</span>
          </div>
          <div class="p-1 rounded bg-slate-950">
            <span class="text-slate-500 block text-[8px] uppercase">HITS</span>
            <span class="font-bold text-purple-400">${s.hits}</span>
          </div>
          <div class="p-1 rounded bg-slate-950">
            <span class="text-slate-500 block text-[8px] uppercase">STEALS</span>
            <span class="font-bold text-amber-400">${s.takeaways}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateScoreboardUI() {
  const homeScoreEl = document.getElementById('homeScoreDisplay');
  const awayScoreEl = document.getElementById('awayScoreDisplay');
  const homeMomentumEl = document.getElementById('momentumBarHome');
  const awayMomentumEl = document.getElementById('momentumBarAway');
  const homeMomLabel = document.getElementById('homeTeamMomentumLabel');
  const awayMomLabel = document.getElementById('awayTeamMomentumLabel');

  if (homeScoreEl) homeScoreEl.textContent = gameState.homeScore;
  if (awayScoreEl) awayScoreEl.textContent = gameState.awayScore;

  if (homeMomentumEl) homeMomentumEl.style.width = `${gameState.homeMomentum}%`;
  if (awayMomentumEl) awayMomentumEl.style.width = `${gameState.awayMomentum}%`;

  if (homeMomLabel) homeMomLabel.textContent = `${homeTeam.name.split(' ')[0]} Momentum: ${gameState.homeMomentum}%`;
  if (awayMomLabel) awayMomLabel.textContent = `${awayTeam.name.split(' ')[0]} Momentum: ${gameState.awayMomentum}%`;
}

/* --------------------------------------------------------------------------
   CUSTOM EXPORT & SCOPE STUDIO
   -------------------------------------------------------------------------- */
function setupExportModal() {
  const openBtn = document.getElementById('triggerReportBtn');
  const modal = document.getElementById('reportPreviewModal');
  const closeBtn = document.getElementById('closeReportModalBtn');
  const closeBottomBtn = document.getElementById('closeReportModalBottomBtn');

  function openModal() {
    buildPrintableReport();
    if (modal) modal.classList.remove('hidden');
  }
  function closeModal() {
    if (modal) modal.classList.add('hidden');
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeBottomBtn) closeBottomBtn.addEventListener('click', closeModal);

  // Scope Switcher Buttons
  const scopeBtns = {
    all: document.getElementById('scopeAllTeamsBtn'),
    home: document.getElementById('scopeHomeBtn'),
    away: document.getElementById('scopeAwayBtn'),
    custom: document.getElementById('scopeCustomBtn')
  };

  Object.entries(scopeBtns).forEach(([scope, btn]) => {
    if (btn) {
      btn.addEventListener('click', () => {
        reportScope = scope;
        Object.values(scopeBtns).forEach(b => {
          b.classList.remove('bg-purple-600', 'text-white');
          b.classList.add('bg-slate-800', 'text-slate-300');
        });
        btn.classList.add('bg-purple-600', 'text-white');
        btn.classList.remove('bg-slate-800', 'text-slate-300');

        const customSection = document.getElementById('customPlayerSelectorSection');
        if (customSection) {
          if (scope === 'custom') customSection.classList.remove('hidden');
          else customSection.classList.add('hidden');
        }

        buildPrintableReport();
      });
    }
  });

  // Select/Deselect All Custom Players
  document.getElementById('selectAllCustomPlayersBtn')?.addEventListener('click', () => {
    Object.keys(playerStats).forEach(id => selectedCustomPlayerIds.add(id));
    document.querySelectorAll('.custom-player-checkbox').forEach(cb => cb.checked = true);
    buildPrintableReport();
  });

  document.getElementById('deselectAllCustomPlayersBtn')?.addEventListener('click', () => {
    selectedCustomPlayerIds.clear();
    document.querySelectorAll('.custom-player-checkbox').forEach(cb => cb.checked = false);
    buildPrintableReport();
  });

  // Download Handlers
  document.getElementById('downloadCsvBtn')?.addEventListener('click', downloadCsvReport);
  document.getElementById('downloadJsonBtn')?.addEventListener('click', downloadJsonReport);
  document.getElementById('copyMarkdownBtn')?.addEventListener('click', copyMarkdownReport);
}

function populateCustomPlayerChecklist() {
  const container = document.getElementById('customPlayerChecklistGrid');
  if (!container) return;

  const allPlayers = [...homeRoster, ...awayRoster];
  // Default select first 3 of each team
  selectedCustomPlayerIds.clear();
  homeRoster.slice(0, 3).forEach(p => selectedCustomPlayerIds.add(p.id));
  awayRoster.slice(0, 3).forEach(p => selectedCustomPlayerIds.add(p.id));

  container.innerHTML = allPlayers.map(p => {
    const isChecked = selectedCustomPlayerIds.has(p.id);
    const isHome = homeRoster.some(hp => hp.id === p.id);
    return `
      <label class="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700">
        <input type="checkbox" value="${p.id}" class="custom-player-checkbox rounded text-purple-600 focus:ring-0" ${isChecked ? 'checked' : ''}>
        <span class="truncate text-[11px] ${isHome ? 'text-sky-300' : 'text-amber-300'}">${p.name}</span>
      </label>
    `;
  }).join('');

  container.querySelectorAll('.custom-player-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      if (e.target.checked) selectedCustomPlayerIds.add(e.target.value);
      else selectedCustomPlayerIds.delete(e.target.value);
      buildPrintableReport();
    });
  });
}

function buildPrintableReport() {
  // Update header text
  const matchupTitle = document.getElementById('reportMatchupTitle');
  if (matchupTitle) matchupTitle.textContent = `${homeTeam.name} vs. ${awayTeam.name}`;

  const homeMom = document.getElementById('reportHomeMomentumVal');
  if (homeMom) homeMom.textContent = `${homeTeam.name.split(' ')[0]} (${gameState.homeMomentum}%)`;

  const totalEv = document.getElementById('reportTotalEventsVal');
  if (totalEv) totalEv.textContent = `${parsedEvents.length} Events Parsed`;

  // Find top performer
  const sorted = Object.values(playerStats).sort((a, b) => b.impactScore - a.impactScore);
  const top = sorted[0];
  if (top) {
    const topPerformer = document.getElementById('reportTopPerformerVal');
    const topDesc = document.getElementById('reportTopPerformerDesc');
    if (topPerformer) topPerformer.textContent = top.player.name;
    if (topDesc) topDesc.textContent = `${top.goals} Goals, ${top.assists} Assists, ${top.impactScore.toFixed(1)} Impact Rating`;
  }

  // Filter players based on scope
  let filteredPlayers = [];
  if (reportScope === 'all') {
    filteredPlayers = sorted;
  } else if (reportScope === 'home') {
    filteredPlayers = sorted.filter(s => s.teamId === homeTeam?.id);
  } else if (reportScope === 'away') {
    filteredPlayers = sorted.filter(s => s.teamId === awayTeam?.id);
  } else if (reportScope === 'custom') {
    filteredPlayers = sorted.filter(s => selectedCustomPlayerIds.has(s.player.id));
  }

  const countBadge = document.getElementById('reportPlayerCountBadge');
  if (countBadge) countBadge.textContent = `${filteredPlayers.length} skaters selected`;

  // Render player performance cards in report
  const playersContainer = document.getElementById('reportPlayersContainer');
  if (playersContainer) {
    if (filteredPlayers.length === 0) {
      playersContainer.innerHTML = '<div class="p-6 text-center text-slate-500 text-xs">No players currently match the selected scope filter.</div>';
    } else {
      playersContainer.innerHTML = filteredPlayers.map(s => {
        const isHome = s.teamId === homeTeam?.id;
        const teamColor = isHome ? 'border-sky-500/30' : 'border-amber-500/30';
        const teamName = isHome ? homeTeam.name : awayTeam.name;

        return `
          <div class="p-4 rounded-2xl bg-slate-900/70 border ${teamColor} space-y-2 print-border">
            <div class="flex justify-between items-center text-xs">
              <div>
                <span class="font-black text-white text-sm">${s.player.name}</span>
                <span class="text-[11px] text-slate-400 ml-2">(${teamName} • #${s.player.jersey_number || 'F'})</span>
              </div>
              <div class="flex items-center gap-3 font-mono">
                <span class="text-emerald-400 font-bold">Impact Rating: ${s.impactScore.toFixed(1)}</span>
                <span class="text-slate-400 text-[10px]">${s.mentions} broadcast mentions</span>
              </div>
            </div>

            <!-- Stats Bar -->
            <div class="flex gap-4 text-xs font-mono text-slate-300 py-1 border-y border-slate-800/80">
              <span><strong>Goals:</strong> ${s.goals}</span>
              <span><strong>Assists:</strong> ${s.assists}</span>
              <span><strong>Points:</strong> ${s.points}</span>
              <span><strong>SOG:</strong> ${s.sog}</span>
              <span><strong>Hits:</strong> ${s.hits}</span>
              <span><strong>Takeaways:</strong> ${s.takeaways}</span>
              <span><strong>Turnovers:</strong> ${s.turnovers}</span>
            </div>

            <!-- Attributed Commentator Quotes -->
            <div class="space-y-1 text-xs">
              <span class="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Commentator Observations:</span>
              ${s.quotes.length > 0 ? s.quotes.slice(0, 2).map(q => `
                <p class="text-slate-300 italic pl-3 border-l-2 border-purple-500/40">"${q}"</p>
              `).join('') : '<p class="text-slate-500 italic text-[11px]">No direct broadcast quote captured yet.</p>'}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Render Chronological Event Ledger in Report
  const ledgerTable = document.getElementById('reportEventLedgerTable');
  if (ledgerTable) {
    ledgerTable.innerHTML = parsedEvents.slice(0, 10).map(ev => `
      <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs print-border">
        <div class="flex items-center gap-2">
          <span class="font-mono text-[10px] text-slate-400">${ev.period} ${ev.clock}</span>
          <span class="font-bold text-white">${ev.player ? ev.player.name : 'Team Play'}</span>
          <span class="text-slate-400 truncate max-w-md">${ev.text}</span>
        </div>
        <span class="text-[10px] font-bold text-purple-400 uppercase">${ev.eventType}</span>
      </div>
    `).join('');
  }
}

/* --------------------------------------------------------------------------
   CSV & JSON EXPORT UTILITIES
   -------------------------------------------------------------------------- */
function downloadCsvReport() {
  let csv = 'Timestamp,Period,Clock,Player,Team,EventType,CommentaryText\n';
  parsedEvents.forEach(e => {
    const cleanText = e.text.replace(/"/g, '""');
    const playerName = e.player ? e.player.name : '';
    const team = e.teamId === homeTeam?.id ? homeTeam.name : (e.teamId === awayTeam?.id ? awayTeam.name : '');
    csv += `"${e.timestamp}","${e.period}","${e.clock}","${playerName}","${team}","${e.eventType}","${cleanText}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blueline_broadcast_telemetry_${Date.now()}.csv`;
  a.click();
  showToast("Exported CSV event ledger!", "success");
}

function downloadJsonReport() {
  const exportData = {
    matchup: {
      home: homeTeam.name,
      away: awayTeam.name,
      homeScore: gameState.homeScore,
      awayScore: gameState.awayScore,
      homeMomentum: gameState.homeMomentum,
      awayMomentum: gameState.awayMomentum
    },
    generatedAt: new Date().toISOString(),
    playerTelemetry: Object.values(playerStats).map(s => ({
      name: s.player.name,
      team: s.teamId === homeTeam?.id ? homeTeam.name : awayTeam.name,
      position: s.player.position,
      impactScore: s.impactScore,
      goals: s.goals,
      assists: s.assists,
      points: s.points,
      sog: s.sog,
      hits: s.hits,
      takeaways: s.takeaways,
      turnovers: s.turnovers,
      quotes: s.quotes
    })),
    events: parsedEvents
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blueline_broadcast_report_${Date.now()}.json`;
  a.click();
  showToast("Exported JSON telemetry dataset!", "success");
}

function copyMarkdownReport() {
  let md = `# BlueLine DataWorks - Broadcast Telemetry & Scout Report\n`;
  md += `**Matchup:** ${homeTeam.name} (${gameState.homeScore}) vs. ${awayTeam.name} (${gameState.awayScore})\n`;
  md += `**Momentum:** ${homeTeam.name.split(' ')[0]} ${gameState.homeMomentum}% | ${awayTeam.name.split(' ')[0]} ${gameState.awayMomentum}%\n\n`;
  md += `## Top Performer Highlights\n`;

  const sorted = Object.values(playerStats).sort((a, b) => b.impactScore - a.impactScore);
  sorted.slice(0, 5).forEach(s => {
    md += `- **${s.player.name}** (${s.teamId === homeTeam?.id ? homeTeam.name : awayTeam.name}): Impact ${s.impactScore.toFixed(1)} | ${s.goals}G, ${s.assists}A, ${s.sog} SOG, ${s.hits} Hits\n`;
    if (s.quotes.length > 0) md += `  *Commentator Quote:* "${s.quotes[0]}"\n`;
  });

  navigator.clipboard.writeText(md).then(() => {
    showToast("Copied Formatted Markdown Report to clipboard!", "success");
  }).catch(() => {
    showToast("Could not access clipboard.", "info");
  });
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMessage');
  const iconEl = document.getElementById('toastIcon');
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  if (iconEl) {
    if (type === 'success') iconEl.textContent = '✅';
    else if (type === 'error') iconEl.textContent = '⚠️';
    else iconEl.textContent = '🎙️';
  }

  toast.classList.remove('opacity-0', 'translate-y-4');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-4');
  }, 3500);
}