/**
 * BlueLine DataWorks: Multi-Player Head-to-Head Comparison & Radar Matrix Engine
 * 
 * Capabilities:
 * - Benchmarks 2 to 5 athletes simultaneously across 8 core scouting dimensions
 * - 8-Axis Radar Polygon Analytics (Skating, Shooting, Hockey IQ, Physicality, Defense, Transition, Biometrics, Clutch)
 * - Multi-league NHLe Translation & Age-Based Career Trajectory Modeling (Ages 15-28)
 * - Automated "Tale of the Tape" Percentile Matrix & Category Edge Analysis
 * - 1-Click Executive Scouting Dossier & PDF Export Engine
 * - Curated Rivalry & Multi-Draft Presets (2024 Top 5 Draft Stars, Phenoms Trinity, Elite Blue-Liners)
 * - The BlueLine Wire Broadcast Engine (#TaleOfTheTape, #PlayerComparison, #BlueLineDataWorks)
 */

(function(window) {
  "use strict";

  // ==========================================
  // 1. ATHLETE COMPARISON DATABASE
  // ==========================================
  const COMPARISON_PLAYERS = {
    celebrini: {
      id: "celebrini",
      name: "Macklin Celebrini",
      team: "San Jose Sharks / Boston University",
      league: "NHL / NCAA (Hockey East)",
      pos: "C",
      hand: "L",
      age: 18,
      height: "6'0\"",
      weight: "197 lbs",
      draft: "2024 1st Overall (SJS)",
      avatar: "🦈",
      color: "#006d75",
      accent: "#0ea5e9",
      nhlComp: "Jonathan Toews / Sidney Crosby hybrid",
      scoutSummary: "Complete 200-foot franchise center. Hobey Baker Award winner at age 17. Unrivaled motor, dynamic transitional drive, and elite shooting release.",
      ratings: {
        skating: 96,
        shooting: 95,
        hockeyIQ: 98,
        physicality: 88,
        defense: 91,
        transition: 97,
        biometrics: 94,
        clutch: 96
      },
      nhleTrajectory: [
        { age: 15, nhle: 28, league: "Prep / U16" },
        { age: 16, nhle: 48, league: "Chicago Steel (USHL)" },
        { age: 17, nhle: 76, league: "Boston Univ (NCAA)" },
        { age: 18, nhle: 65, league: "San Jose Sharks (NHL)" },
        { age: 19, nhle: 78, league: "NHL Projected" },
        { age: 20, nhle: 89, league: "NHL Projected" },
        { age: 22, nhle: 98, league: "NHL Prime" },
        { age: 25, nhle: 104, league: "NHL Peak" }
      ]
    },

    levshunov: {
      id: "levshunov",
      name: "Artyom Levshunov",
      team: "Chicago Blackhawks / Michigan State",
      league: "NHL / NCAA (Big Ten)",
      pos: "RHD",
      hand: "R",
      age: 18,
      height: "6'2\"",
      weight: "208 lbs",
      draft: "2024 2nd Overall (CHI)",
      avatar: "⚔️",
      color: "#cf112d",
      accent: "#f59e0b",
      nhlComp: "Alex Pietrangelo / John Carlson",
      scoutSummary: "Franchise right-shot #1 defenseman. Massive pro frame, explosive four-way mobility, heavy point blast, and outstanding offensive blue-line activation.",
      ratings: {
        skating: 93,
        shooting: 90,
        hockeyIQ: 92,
        physicality: 95,
        defense: 90,
        transition: 93,
        biometrics: 98,
        clutch: 91
      },
      nhleTrajectory: [
        { age: 15, nhle: 22, league: "Belarus U17" },
        { age: 16, nhle: 38, league: "Green Bay (USHL)" },
        { age: 17, nhle: 58, league: "Michigan State (NCAA)" },
        { age: 18, nhle: 42, league: "Rockford / Chicago" },
        { age: 19, nhle: 52, league: "Blackhawks (NHL)" },
        { age: 20, nhle: 64, league: "NHL Projected" },
        { age: 22, nhle: 74, league: "NHL Prime" },
        { age: 25, nhle: 82, league: "NHL Peak" }
      ]
    },

    buium: {
      id: "buium",
      name: "Zeev Buium",
      team: "Minnesota Wild / Denver Pioneers",
      league: "NHL / NCAA (NCHC)",
      pos: "LHD",
      hand: "L",
      age: 18,
      height: "6'0\"",
      weight: "186 lbs",
      draft: "2024 12th Overall (MIN)",
      avatar: "🏔️",
      color: "#15803d",
      accent: "#86efac",
      nhlComp: "Quinn Hughes / Adam Fox hybrid",
      scoutSummary: "Elite transitional wizard and national champion. Unmatched lateral deception, walks the offensive blue line effortlessly, and processes the game 2 steps ahead.",
      ratings: {
        skating: 95,
        shooting: 86,
        hockeyIQ: 99,
        physicality: 82,
        defense: 89,
        transition: 99,
        biometrics: 88,
        clutch: 97
      },
      nhleTrajectory: [
        { age: 15, nhle: 24, league: "Shattuck St. Mary's" },
        { age: 16, nhle: 40, league: "USNTDP (USHL)" },
        { age: 17, nhle: 68, league: "Denver Pioneers (NCAA)" },
        { age: 18, nhle: 50, league: "Denver / Iowa" },
        { age: 19, nhle: 58, league: "Minnesota Wild (NHL)" },
        { age: 20, nhle: 70, league: "NHL Projected" },
        { age: 22, nhle: 82, league: "NHL Prime" },
        { age: 25, nhle: 88, league: "NHL Peak" }
      ]
    },

    smith: {
      id: "smith",
      name: "Will Smith",
      team: "San Jose Sharks / Boston College",
      league: "NHL / NCAA (Hockey East)",
      pos: "C",
      hand: "R",
      age: 19,
      height: "6'0\"",
      weight: "181 lbs",
      draft: "2023 4th Overall (SJS)",
      avatar: "🦅",
      color: "#991b1b",
      accent: "#f97316",
      nhlComp: "Jack Hughes / Trevor Zegras with more bite",
      scoutSummary: "Nation's leading collegiate scorer (71 points in 41 games). Silky east-west playmaking vision, deceptive head fakes, and world-class puck poise.",
      ratings: {
        skating: 93,
        shooting: 93,
        hockeyIQ: 98,
        physicality: 81,
        defense: 85,
        transition: 96,
        biometrics: 89,
        clutch: 95
      },
      nhleTrajectory: [
        { age: 15, nhle: 26, league: "St. Sebastian's" },
        { age: 16, nhle: 46, league: "USNTDP (USHL)" },
        { age: 17, nhle: 74, league: "USNTDP 127 Pts" },
        { age: 18, nhle: 79, league: "Boston College (NCAA)" },
        { age: 19, nhle: 62, league: "San Jose Sharks (NHL)" },
        { age: 20, nhle: 76, league: "NHL Projected" },
        { age: 22, nhle: 90, league: "NHL Prime" },
        { age: 25, nhle: 96, league: "NHL Peak" }
      ]
    },

    parekh: {
      id: "parekh",
      name: "Zayne Parekh",
      team: "Calgary Flames / Saginaw Spirit",
      league: "NHL / OHL (Memorial Cup Champs)",
      pos: "RHD",
      hand: "R",
      age: 18,
      height: "6'0\"",
      weight: "181 lbs",
      draft: "2024 9th Overall (CGY)",
      avatar: "🦅",
      color: "#c2410c",
      accent: "#fed7aa",
      nhlComp: "Erik Karlsson / Brian Leetch",
      scoutSummary: "33 goals and 96 points as an OHL draft-eligible defenseman. Historically prolific offensive instincts, lethal wrist shot, and Memorial Cup champion.",
      ratings: {
        skating: 94,
        shooting: 93,
        hockeyIQ: 96,
        physicality: 79,
        defense: 82,
        transition: 97,
        biometrics: 87,
        clutch: 95
      },
      nhleTrajectory: [
        { age: 15, nhle: 20, league: "Markham Majors" },
        { age: 16, nhle: 42, league: "Saginaw Spirit 21G" },
        { age: 17, nhle: 69, league: "Saginaw Spirit 96P" },
        { age: 18, nhle: 46, league: "Calgary / Saginaw" },
        { age: 19, nhle: 58, league: "Calgary Flames (NHL)" },
        { age: 20, nhle: 70, league: "NHL Projected" },
        { age: 22, nhle: 82, league: "NHL Prime" },
        { age: 25, nhle: 90, league: "NHL Peak" }
      ]
    },

    bedard: {
      id: "bedard",
      name: "Connor Bedard",
      team: "Chicago Blackhawks",
      league: "NHL",
      pos: "C",
      hand: "R",
      age: 19,
      height: "5'10\"",
      weight: "185 lbs",
      draft: "2023 1st Overall (CHI)",
      avatar: "🔥",
      color: "#b91c1c",
      accent: "#fbbf24",
      nhlComp: "Auston Matthews release / Patrick Kane hands",
      scoutSummary: "Generational shooter. Exceptional toe-drag wrist shot release that changes angles inside 0.12 seconds. Calder Trophy winner as NHL Rookie of the Year.",
      ratings: {
        skating: 92,
        shooting: 99,
        hockeyIQ: 97,
        physicality: 82,
        defense: 84,
        transition: 95,
        biometrics: 91,
        clutch: 98
      },
      nhleTrajectory: [
        { age: 15, nhle: 40, league: "Regina Pats (WHL)" },
        { age: 16, nhle: 62, league: "Regina Pats (WHL)" },
        { age: 17, nhle: 94, league: "Regina 143 Pts (WHL)" },
        { age: 18, nhle: 61, league: "Chicago Blackhawks (NHL)" },
        { age: 19, nhle: 80, league: "NHL Projected" },
        { age: 20, nhle: 95, league: "NHL Projected" },
        { age: 22, nhle: 110, league: "NHL Prime" },
        { age: 25, nhle: 120, league: "NHL Peak" }
      ]
    },

    hutson: {
      id: "hutson",
      name: "Lane Hutson",
      team: "Montreal Canadiens / Boston University",
      league: "NHL / NCAA (Hockey East)",
      pos: "LHD",
      hand: "L",
      age: 20,
      height: "5'10\"",
      weight: "162 lbs",
      draft: "2022 62nd Overall (MTL)",
      avatar: "🔵",
      color: "#1e3a8a",
      accent: "#38bdf8",
      nhlComp: "Quinn Hughes / Cale Makar power play profile",
      scoutSummary: "Electric offensive defenseman. Jaw-dropping spin-o-ramas, uncanny escape ability, and one of the highest deceptive passing rates ever recorded in college hockey.",
      ratings: {
        skating: 96,
        shooting: 88,
        hockeyIQ: 99,
        physicality: 74,
        defense: 83,
        transition: 99,
        biometrics: 85,
        clutch: 94
      },
      nhleTrajectory: [
        { age: 15, nhle: 22, league: "Honeybaked U15" },
        { age: 16, nhle: 39, league: "USNTDP (USHL)" },
        { age: 17, nhle: 65, league: "USNTDP (USHL)" },
        { age: 18, nhle: 68, league: "Boston Univ (NCAA)" },
        { age: 19, nhle: 72, league: "Boston Univ (NCAA)" },
        { age: 20, nhle: 56, league: "Canadiens (NHL)" },
        { age: 22, nhle: 74, league: "NHL Prime" },
        { age: 25, nhle: 84, league: "NHL Peak" }
      ]
    },

    hagens: {
      id: "hagens",
      name: "James Hagens",
      team: "Boston College / USNTDP",
      league: "NCAA / 2025 NHL Draft Eligible",
      pos: "C",
      hand: "L",
      age: 17,
      height: "5'10\"",
      weight: "172 lbs",
      draft: "Projected 2025 #1 Overall Pick",
      avatar: "⭐",
      color: "#991b1b",
      accent: "#facc15",
      nhlComp: "Jack Hughes / Brayden Point",
      scoutSummary: "Broke Nikita Kucherov's all-time IIHF U18 scoring record with 22 points in 7 games. Pure playmaking lightning with telepathic passing vision.",
      ratings: {
        skating: 96,
        shooting: 91,
        hockeyIQ: 99,
        physicality: 78,
        defense: 86,
        transition: 98,
        biometrics: 89,
        clutch: 96
      },
      nhleTrajectory: [
        { age: 15, nhle: 32, league: "Mount St. Charles" },
        { age: 16, nhle: 54, league: "USNTDP 85 Pts" },
        { age: 17, nhle: 78, league: "USNTDP 102 Pts (Record)" },
        { age: 18, nhle: 70, league: "Boston College (NCAA)" },
        { age: 19, nhle: 72, league: "NHL Rookie Year" },
        { age: 20, nhle: 86, league: "NHL Projected" },
        { age: 22, nhle: 98, league: "NHL Prime" },
        { age: 25, nhle: 106, league: "NHL Peak" }
      ]
    },

    demidov: {
      id: "demidov",
      name: "Ivan Demidov",
      team: "SKA Saint Petersburg / Montreal Canadiens",
      league: "KHL / NHL (2024 5th Overall)",
      pos: "RW",
      hand: "L",
      age: 18,
      height: "5'11\"",
      weight: "181 lbs",
      draft: "2024 5th Overall (MTL)",
      avatar: "🎯",
      color: "#0f766e",
      accent: "#2dd4bf",
      nhlComp: "Nikita Kucherov / Artemi Panarin",
      scoutSummary: "Electrifying 1-on-1 attacker. 10-and-2 skating stance, elite puck protection on outside edges, and world-class playmaking audacity.",
      ratings: {
        skating: 95,
        shooting: 94,
        hockeyIQ: 98,
        physicality: 80,
        defense: 84,
        transition: 97,
        biometrics: 90,
        clutch: 97
      },
      nhleTrajectory: [
        { age: 15, nhle: 26, league: "Vityaz U16" },
        { age: 16, nhle: 48, league: "SKA-1946 (MHL)" },
        { age: 17, nhle: 72, league: "SKA-1946 60 Pts" },
        { age: 18, nhle: 64, league: "SKA (KHL)" },
        { age: 19, nhle: 76, league: "Montreal (NHL)" },
        { age: 20, nhle: 88, league: "NHL Projected" },
        { age: 22, nhle: 98, league: "NHL Prime" },
        { age: 25, nhle: 108, league: "NHL Peak" }
      ]
    },

    eiserman: {
      id: "eiserman",
      name: "Cole Eiserman",
      team: "Boston University / USNTDP",
      league: "NCAA / NHL (2024 20th Overall)",
      pos: "LW",
      hand: "L",
      age: 18,
      height: "6'0\"",
      weight: "198 lbs",
      draft: "2024 20th Overall (NYI)",
      avatar: "⚡",
      color: "#0369a1",
      accent: "#38bdf8",
      nhlComp: "Brett Hull / Cole Caufield size profile",
      scoutSummary: "All-time USNTDP goal scoring champion (127 career goals). Lethal one-timer from right circle, heavy wrist shot through goalie screens.",
      ratings: {
        skating: 91,
        shooting: 99,
        hockeyIQ: 89,
        physicality: 86,
        defense: 81,
        transition: 90,
        biometrics: 92,
        clutch: 95
      },
      nhleTrajectory: [
        { age: 15, nhle: 30, league: "Shattuck St. Mary's" },
        { age: 16, nhle: 56, league: "USNTDP 69 Pts" },
        { age: 17, nhle: 75, league: "USNTDP 58 Goals" },
        { age: 18, nhle: 60, league: "Boston Univ (NCAA)" },
        { age: 19, nhle: 68, league: "NY Islanders (NHL)" },
        { age: 20, nhle: 80, league: "NHL Projected" },
        { age: 22, nhle: 92, league: "NHL Prime" },
        { age: 25, nhle: 98, league: "NHL Peak" }
      ]
    }
  };

  // ==========================================
  // 2. CURATED RIVALRY & MULTI-PLAYER PRESETS
  // ==========================================
  const COMPARISON_PRESETS = [
    {
      id: "top5_2024_draft",
      title: "2024 Top 5 Draft Stars",
      subtitle: "Celebrini • Levshunov • Buium • Smith • Parekh",
      playerIds: ["celebrini", "levshunov", "buium", "smith", "parekh"],
      badge: "5-Player Matrix"
    },
    {
      id: "generational_phenoms",
      title: "Generational Phenoms & 1st Overalls",
      subtitle: "Celebrini (2024) • Bedard (2023) • Hagens (2025)",
      playerIds: ["celebrini", "bedard", "hagens"],
      badge: "3-Player Radar"
    },
    {
      id: "celebrini_vs_levshunov",
      title: "The 2024 #1 Draft Pick Debate",
      subtitle: "Franchise 1C vs Franchise Right-Shot #1D",
      playerIds: ["celebrini", "levshunov"],
      badge: "Classic 1v1"
    },
    {
      id: "defensemen_trinity",
      title: "2024 First-Round Defensemen Trinity",
      subtitle: "Levshunov (2nd) • Parekh (9th) • Buium (12th)",
      playerIds: ["levshunov", "parekh", "buium"],
      badge: "3 Blue-Liners"
    },
    {
      id: "buium_vs_hutson",
      title: "Elite NCAA Offensive Blue-Liners",
      subtitle: "Zeev Buium (Denver) vs Lane Hutson (BU)",
      playerIds: ["buium", "hutson"],
      badge: "1v1 Duel"
    },
    {
      id: "ncaa_scoring_kings",
      title: "NCAA Freshmen Scoring Kings",
      subtitle: "Celebrini (BU) • Will Smith (BC) • James Hagens (BC)",
      playerIds: ["celebrini", "smith", "hagens"],
      badge: "3 NCAA Stars"
    },
    {
      id: "montreal_future_core",
      title: "Habs Pipeline: Demidov vs Hutson",
      subtitle: "Ivan Demidov (5th Overall) vs Lane Hutson (62nd)",
      playerIds: ["demidov", "hutson"],
      badge: "Montreal Core"
    }
  ];

  // ==========================================
  // 3. COLOR PALETTES (UP TO 5 PLAYERS)
  // ==========================================
  const PLAYER_PALETTE = [
    {
      id: 0,
      label: "Player 1",
      stroke: "#38bdf8",
      fill: "rgba(56, 189, 248, 0.22)",
      point: "#38bdf8",
      glow: "rgba(56, 189, 248, 0.5)",
      badgeBg: "bg-sky-500/20",
      textClass: "text-sky-400",
      borderClass: "border-sky-500/40",
      solidBg: "bg-sky-500"
    },
    {
      id: 1,
      label: "Player 2",
      stroke: "#f59e0b",
      fill: "rgba(245, 158, 11, 0.22)",
      point: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.5)",
      badgeBg: "bg-amber-500/20",
      textClass: "text-amber-400",
      borderClass: "border-amber-500/40",
      solidBg: "bg-amber-500"
    },
    {
      id: 2,
      label: "Player 3",
      stroke: "#10b981",
      fill: "rgba(16, 185, 129, 0.22)",
      point: "#10b981",
      glow: "rgba(16, 185, 129, 0.5)",
      badgeBg: "bg-emerald-500/20",
      textClass: "text-emerald-400",
      borderClass: "border-emerald-500/40",
      solidBg: "bg-emerald-500"
    },
    {
      id: 3,
      label: "Player 4",
      stroke: "#c084fc",
      fill: "rgba(192, 132, 252, 0.22)",
      point: "#c084fc",
      glow: "rgba(192, 132, 252, 0.5)",
      badgeBg: "bg-purple-500/20",
      textClass: "text-purple-400",
      borderClass: "border-purple-500/40",
      solidBg: "bg-purple-500"
    },
    {
      id: 4,
      label: "Player 5",
      stroke: "#f87171",
      fill: "rgba(248, 113, 113, 0.22)",
      point: "#f87171",
      glow: "rgba(248, 113, 113, 0.5)",
      badgeBg: "bg-rose-500/20",
      textClass: "text-rose-400",
      borderClass: "border-rose-500/40",
      solidBg: "bg-rose-500"
    }
  ];

  // ==========================================
  // 4. RADAR METRICS DEFINITIONS
  // ==========================================
  const RADAR_METRICS = [
    { key: "skating", label: "Pure Skating", max: 100, desc: "Acceleration, top speed, edge agility & lateral escape" },
    { key: "shooting", label: "Shot Release", max: 100, desc: "Release velocity, angle change deception & catch-and-shoot accuracy" },
    { key: "hockeyIQ", label: "Hockey IQ", max: 100, desc: "Anticipation, playmaking vision & spatial awareness 2 steps ahead" },
    { key: "physicality", label: "Physicality", max: 100, desc: "Wall battle leverage, body checking & puck protection strength" },
    { key: "defense", label: "Defensive 200ft", max: 100, desc: "Stick checking, backcheck discipline & d-zone coverage" },
    { key: "transition", label: "Transition Zone", max: 100, desc: "Controlled exits, neutral zone carry & offensive blue-line activation" },
    { key: "biometrics", label: "Biometrics & Vitals", max: 100, desc: "Physical stature, reach leverage & athletic durability profile" },
    { key: "clutch", label: "Playoff / Clutch", max: 100, desc: "Performance in one-goal games, tournament elimination & high-leverage shifts" }
  ];

  // ==========================================
  // 5. PLAYER RESOLVER / REGISTRY BRIDGE
  // ==========================================
  function resolvePlayer(idOrObj) {
    if (!idOrObj) return null;
    if (typeof idOrObj === 'object' && idOrObj.ratings) return idOrObj;
    const pid = String(idOrObj);
    if (COMPARISON_PLAYERS[pid]) return COMPARISON_PLAYERS[pid];

    // Master non-pro registry search
    const allList = (typeof window !== 'undefined' ? (window.MASTER_NON_PRO_REGISTRY || window.MASTER_PLAYERS) : null) || [];
    const mp = allList.find(p => p.id === pid || (p.name && p.name.toLowerCase() === pid.toLowerCase()));
    if (mp) {
      const composite = mp.composite_score || 88;
      const resolved = {
        id: mp.id,
        name: mp.name,
        team: mp.team || "Collegiate Program",
        league: mp.league || "NCAA Division I",
        pos: mp.pos || "F",
        hand: (mp.num && mp.num % 2 === 0) ? "L" : "R",
        age: mp.date_of_birth ? Math.max(16, 2026 - parseInt(mp.date_of_birth.substring(0, 4))) : 20,
        height: mp.height_str || (mp.height_in ? `${Math.floor(mp.height_in/12)}'${mp.height_in%12}\"` : "6'1\""),
        weight: mp.weight_lbs ? `${mp.weight_lbs} lbs` : "190 lbs",
        draft: mp.draft_status || "Active Non-Pro Roster",
        avatar: mp.pos === 'G' ? "🥅" : (mp.pos === 'D' ? "🛡️" : "⚡"),
        color: "#0284c7",
        accent: "#38bdf8",
        nhlComp: mp.nhl_comp || "Developing Collegiate Prospect",
        scoutSummary: mp.notes || `Elite ${mp.pos} verified with ${Math.round(composite)} composite rating under BlueLine DataWorks tracking.`,
        ratings: {
          skating: Math.min(99, Math.round(composite * 1.04)),
          shooting: Math.min(99, Math.round(composite * 0.98)),
          hockeyIQ: Math.min(99, Math.round(composite * 1.02)),
          physicality: Math.min(99, Math.round(composite * 0.94)),
          defense: Math.min(99, Math.round(composite * 0.96)),
          transition: Math.min(99, Math.round(composite * 1.03)),
          biometrics: 90,
          clutch: 92
        },
        nhleTrajectory: [
          { age: 16, nhle: 32, league: "Prep / U16" },
          { age: 17, nhle: 52, league: "Junior / USHL" },
          { age: 18, nhle: 68, league: "NCAA D1" },
          { age: 19, nhle: 62, league: "Current Roster" },
          { age: 20, nhle: 76, league: "Projected Pro" },
          { age: 22, nhle: 88, league: "Pro Prime" },
          { age: 25, nhle: 94, league: "Peak Form" }
        ]
      };
      COMPARISON_PLAYERS[mp.id] = resolved;
      return resolved;
    }
    return null;
  }

  // ==========================================
  // 6. MULTI-PLAYER COMPARISON & PERCENTILE CALCULATION
  // ==========================================
  /**
   * Evaluates 2 to 5 athletes across 8 scouting dimensions.
   * Backward compatible with calculateComparisonVerdict(playerA, playerB)
   */
  function calculateComparisonVerdict(playersInput, secondPlayerOptional) {
    let players = [];
    if (Array.isArray(playersInput)) {
      players = playersInput.map(p => resolvePlayer(p)).filter(Boolean);
    } else if (playersInput && secondPlayerOptional) {
      players = [resolvePlayer(playersInput), resolvePlayer(secondPlayerOptional)].filter(Boolean);
    } else if (playersInput) {
      players = [resolvePlayer(playersInput)].filter(Boolean);
    }

    if (players.length === 0) return null;

    const isDuel = players.length === 2;
    const playerA = players[0];
    const playerB = players[1] || players[0];

    // Compute player aggregates
    const playerStats = players.map((p, idx) => {
      const ratingsArr = Object.values(p.ratings || {});
      const avgRating = ratingsArr.length > 0 ? (ratingsArr.reduce((a, b) => a + b, 0) / ratingsArr.length) : 80;
      const palette = PLAYER_PALETTE[idx % PLAYER_PALETTE.length];
      
      // Tier assessment
      let tier = "Tier 4: Projected Asset";
      if (avgRating >= 94) tier = "Tier 1: Franchise Cornerstone (Lottery Consensus)";
      else if (avgRating >= 90) tier = "Tier 2: Top-Line / 1st-Pair Impact";
      else if (avgRating >= 85) tier = "Tier 3: Core NHL Roster Prospect";

      // NHLe Peak
      const traj = p.nhleTrajectory || [];
      const peakNhle = traj.length > 0 ? Math.max(...traj.map(t => t.nhle)) : 75;

      return {
        player: p,
        index: idx,
        palette: palette,
        avgRating: parseFloat(avgRating.toFixed(1)),
        categoryWins: 0,
        tier: tier,
        peakNhle: peakNhle
      };
    });

    // Metric Breakdown & Leader detection across up to 5 athletes
    const metricBreakdown = RADAR_METRICS.map(m => {
      const scores = playerStats.map(ps => {
        const val = ps.player.ratings[m.key] || 75;
        // Normalized percentile benchmark: maps 60-100 to 50-99
        const percentile = Math.min(99, Math.max(50, Math.round(50 + (val - 70) * 1.6)));
        return {
          player: ps.player,
          playerId: ps.player.id,
          playerName: ps.player.name,
          palette: ps.palette,
          value: val,
          percentile: percentile
        };
      });

      const maxVal = Math.max(...scores.map(s => s.value));
      const leaders = scores.filter(s => s.value === maxVal);
      
      // Give category win points to leaders
      leaders.forEach(l => {
        const ps = playerStats.find(p => p.player.id === l.playerId);
        if (ps) ps.categoryWins++;
      });

      // Rank scores descending
      const rankedScores = [...scores].sort((a, b) => b.value - a.value).map((s, rankIdx) => ({
        ...s,
        rank: rankIdx + 1,
        isLeader: s.value === maxVal
      }));

      return {
        key: m.key,
        label: m.label,
        desc: m.desc,
        maxVal: maxVal,
        leaders: leaders,
        scores: rankedScores,
        isTie: leaders.length > 1
      };
    });

    // Sort player overall rankings by avgRating descending
    const rankings = [...playerStats].sort((a, b) => b.avgRating - a.avgRating);
    const overallLeader = rankings[0];

    // Build category edges map for 1v1 backward compatibility
    const edges = {};
    let winsA = 0;
    let winsB = 0;
    let ties = 0;

    RADAR_METRICS.forEach(m => {
      const valA = playerA.ratings[m.key] || 80;
      const valB = playerB.ratings[m.key] || 80;
      const delta = valA - valB;

      if (delta >= 2) {
        edges[m.key] = { winner: playerA.id, winnerName: playerA.name, delta: `+${delta}`, level: delta >= 5 ? "Decisive" : "Slight" };
        winsA++;
      } else if (delta <= -2) {
        edges[m.key] = { winner: playerB.id, winnerName: playerB.name, delta: `+${Math.abs(delta)}`, level: Math.abs(delta) >= 5 ? "Decisive" : "Slight" };
        winsB++;
      } else {
        edges[m.key] = { winner: "tie", winnerName: "Even Match", delta: "0", level: "Tie" };
        ties++;
      }
    });

    // Construct Overall Verdict Text
    let overallVerdict = "";
    if (isDuel) {
      if (playerStats[0].avgRating > playerStats[1].avgRating + 1.2) {
        overallVerdict = `**${playerA.name} holds the comprehensive tactical edge** with ${winsA} category advantages, notably in dynamic pace, transitional drive, and hockey IQ.`;
      } else if (playerStats[1].avgRating > playerStats[0].avgRating + 1.2) {
        overallVerdict = `**${playerB.name} holds the comprehensive tactical edge** with ${winsB} category advantages, driven by pro-ready execution and elite single-skill ceiling.`;
      } else {
        overallVerdict = `**Dead Heat Technical Split:** ${playerA.name} and ${playerB.name} exhibit near-identical aggregate value (${playerStats[0].avgRating} vs ${playerStats[1].avgRating}), each dominating distinct tactical phases of the game.`;
      }
    } else {
      overallVerdict = `**Multi-Player Draft Matrix Verdict:** ${overallLeader.player.name} paces the comparison group with an aggregate rating of ${overallLeader.avgRating}/100 and ${overallLeader.categoryWins} category crowns. ` +
        rankings.slice(1).map(r => `${r.player.name} (${r.avgRating}/100, ${r.categoryWins} edges)`).join(', ') + ` follow in sequence with specialized elite tools.`;
    }

    return {
      players: players,
      playerStats: playerStats,
      rankings: rankings,
      overallLeader: overallLeader,
      metricBreakdown: metricBreakdown,
      isDuel: isDuel,
      // Backward compatibility fields
      playerA: playerA,
      playerB: playerB,
      edges: edges,
      winsA: winsA,
      winsB: winsB,
      ties: ties,
      avgA: playerStats[0].avgRating.toFixed(1),
      avgB: (playerStats[1] ? playerStats[1].avgRating.toFixed(1) : playerStats[0].avgRating.toFixed(1)),
      overallVerdict: overallVerdict
    };
  }

  // ==========================================
  // 7. RADAR CANVAS DRAWER (2 TO 5 PLAYERS)
  // ==========================================
  function drawRadarChart(canvas, players) {
    if (!canvas || !players || players.length === 0) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 45;

    ctx.clearRect(0, 0, width, height);

    const numAxes = RADAR_METRICS.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Draw background concentric polygon webs (5 levels)
    ctx.lineWidth = 1;
    for (let level = 1; level <= 5; level++) {
      const levelRadius = (radius / 5) * level;
      ctx.strokeStyle = level === 5 ? "rgba(148, 163, 184, 0.35)" : "rgba(148, 163, 184, 0.12)";
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + Math.cos(angle) * levelRadius;
        const y = centerY + Math.sin(angle) * levelRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Benchmark level label
      if (level === 3 || level === 5) {
        ctx.font = "8px monospace";
        ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
        ctx.textAlign = "center";
        ctx.fillText(`${level * 20}%`, centerX, centerY - levelRadius + 9);
      }
    }

    // Draw axis spokes and outer metric labels
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Spoke line
      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Spoke vertex dot
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Label text with slight offset
      const labelX = centerX + Math.cos(angle) * (radius + 26);
      const labelY = centerY + Math.sin(angle) * (radius + 26);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(RADAR_METRICS[i].label, labelX, labelY);
    }

    // Draw each player's polygon overlay (up to 5 players)
    players.forEach((player, pIdx) => {
      const palette = PLAYER_PALETTE[pIdx % PLAYER_PALETTE.length];
      
      // Fill and outline polygon
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const metric = RADAR_METRICS[i];
        const val = Math.max(50, Math.min(100, (player.ratings && player.ratings[metric.key]) || 75));
        const normalized = (val - 50) / 50; // map 50-100 to 0-1
        const r = radius * (0.2 + normalized * 0.8);
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Fill polygon with alpha
      ctx.fillStyle = palette.fill;
      ctx.fill();

      // Stroke polygon
      ctx.strokeStyle = palette.stroke;
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // Draw vertex anchor points
      for (let i = 0; i < numAxes; i++) {
        const metric = RADAR_METRICS[i];
        const val = Math.max(50, Math.min(100, (player.ratings && player.ratings[metric.key]) || 75));
        const normalized = (val - 50) / 50;
        const r = radius * (0.2 + normalized * 0.8);
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        // Outer dark ring
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner color dot
        ctx.fillStyle = palette.point;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // ==========================================
  // 8. EXECUTIVE SCOUTING DOSSIER GENERATOR
  // ==========================================
  function generateExecutiveScoutingDossier(players, verdictData) {
    if (!players || players.length === 0) return null;
    const verdict = verdictData || calculateComparisonVerdict(players);
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const dossier = {
      title: "BLUELINE DATAWORKS // EXECUTIVE SCOUTING EVALUATION & DRAFT MATRIX",
      date: currentDate,
      securityClearance: "CONFIDENTIAL // ORGANIZATIONAL DISTRIBUTION ONLY",
      athleteCount: players.length,
      leader: verdict.overallLeader.player.name,
      leaderRating: verdict.overallLeader.avgRating,
      overallVerdict: verdict.overallVerdict,
      players: verdict.playerStats.map(ps => ({
        id: ps.player.id,
        name: ps.player.name,
        team: ps.player.team,
        league: ps.player.league,
        pos: ps.player.pos,
        age: ps.player.age,
        height: ps.player.height,
        weight: ps.player.weight,
        draft: ps.player.draft,
        nhlComp: ps.player.nhlComp,
        scoutSummary: ps.player.scoutSummary,
        avgRating: ps.avgRating,
        tier: ps.tier,
        categoryWins: ps.categoryWins,
        peakNhle: ps.peakNhle,
        color: ps.palette.stroke,
        ratings: ps.player.ratings
      })),
      metrics: verdict.metricBreakdown
    };

    return dossier;
  }

  // ==========================================
  // 9. SOCIAL WIRE BROADCAST
  // ==========================================
  function broadcastComparisonToWire(verdictData) {
    if (!verdictData || !verdictData.players) return null;

    const names = verdictData.players.map(p => p.name).join(" vs ");
    const isMulti = verdictData.players.length > 2;

    const post = {
      id: `post-compare-${Date.now()}`,
      authorId: "usr_blueline_scout",
      timestamp: "Just now",
      content: isMulti 
        ? `⚖️ **MULTI-PLAYER DRAFT MATRIX: ${names.toUpperCase()}**\n\nSimultaneous ${verdictData.players.length}-way radar benchmark complete. Leader: ${verdictData.overallLeader.player.name} (${verdictData.overallLeader.avgRating}/100 with ${verdictData.overallLeader.categoryWins} crowns).\n\n${verdictData.overallVerdict}\n\n#TaleOfTheTape #PlayerComparison #DraftScout #BlueLineDataWorks`
        : `⚖️ **OFFICIAL SCOUTING DUEL: ${verdictData.playerA.name.toUpperCase()} vs ${verdictData.playerB.name.toUpperCase()}**\n\n8-Axis Radar Comparison complete. Verdict: ${verdictData.overallVerdict}\n\n• ${verdictData.playerA.name}: Avg Rating ${verdictData.avgA}/100 (${verdictData.winsA} Category Advantages)\n• ${verdictData.playerB.name}: Avg Rating ${verdictData.avgB}/100 (${verdictData.winsB} Category Advantages)\n\n#TaleOfTheTape #PlayerComparison #DraftScout #BlueLineDataWorks`,
      likes: 84,
      reposts: 37,
      replies: 24,
      likedByMe: false,
      pinned: false,
      tags: ["#TaleOfTheTape", "#PlayerComparison", "#DraftScout", "#BlueLineDataWorks"],
      media: {
        type: "banner",
        title: names,
        subtitle: isMulti ? `${verdictData.players.length}-Way Radar Overlay` : `Tale of the Tape: ${verdictData.winsA}-${verdictData.winsB} Edge Split`
      }
    };

    try {
      const wireRaw = localStorage.getItem("blueline_social_state");
      let wireState = wireRaw ? JSON.parse(wireRaw) : { posts: [] };
      if (!Array.isArray(wireState.posts)) wireState.posts = [];
      wireState.posts.unshift(post);
      localStorage.setItem("blueline_social_state", JSON.stringify(wireState));
    } catch (e) {
      console.warn("Could not publish comparison post to Wire:", e);
    }

    return post;
  }

  // Export to Global Window
  window.BlueLineCompareEngine = {
    COMPARISON_PLAYERS,
    COMPARISON_PRESETS,
    PLAYER_PALETTE,
    RADAR_METRICS,
    resolvePlayer,
    calculateComparisonVerdict,
    drawRadarChart,
    generateExecutiveScoutingDossier,
    broadcastComparisonToWire
  };

})(typeof window !== 'undefined' ? window : global);
