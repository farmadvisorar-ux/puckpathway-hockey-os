/**
 * BlueLine DataWorks: Multi-Player Head-to-Head Comparison & Radar Matrix Engine
 * 
 * Capabilities:
 * - Benchmarks 2 to 4 athletes simultaneously across 8 core scouting dimensions
 * - 8-Axis Radar Polygon Analytics (Skating, Shooting, Hockey IQ, Physicality, Defense, Transition, Biometrics, Clutch)
 * - Multi-league NHLe Translation & Age-Based Career Trajectory Modeling (Ages 15-28)
 * - Automated "Tale of the Tape" Category Edge Analysis & Scouting Verdict
 * - Curated Rivalry Presets (2024 #1 Pick Debate, Elite Blue-Liners, BC Triplets, Future Phenoms)
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
    }
  };

  // ==========================================
  // 2. CURATED RIVALRY PRESETS
  // ==========================================
  const COMPARISON_PRESETS = [
    {
      id: "celebrini_vs_levshunov",
      title: "The 2024 #1 Draft Pick Debate",
      subtitle: "Franchise 1C vs Franchise Right-Shot #1D",
      playerIds: ["celebrini", "levshunov"]
    },
    {
      id: "buium_vs_hutson",
      title: "Elite NCAA Offensive Blue-Liners",
      subtitle: "Zeev Buium (Denver) vs Lane Hutson (BU)",
      playerIds: ["buium", "hutson"]
    },
    {
      id: "bedard_vs_celebrini",
      title: "Back-to-Back Generational 1st Overalls",
      subtitle: "Connor Bedard (2023) vs Macklin Celebrini (2024)",
      playerIds: ["bedard", "celebrini"]
    },
    {
      id: "celebrini_vs_smith_vs_hagens",
      title: "NCAA Freshmen Scoring Phenoms",
      subtitle: "Celebrini (BU) vs Will Smith (BC) vs James Hagens (BC)",
      playerIds: ["celebrini", "smith", "hagens"]
    },
    {
      id: "levshunov_vs_buium_vs_parekh",
      title: "2024 First-Round Defensemen Trinity",
      subtitle: "Levshunov (2nd) vs Parekh (9th) vs Buium (12th)",
      playerIds: ["levshunov", "buium", "parekh"]
    }
  ];

  // ==========================================
  // 3. COMPARISON & RADAR CALCULATIONS
  // ==========================================
  const RADAR_METRICS = [
    { key: "skating", label: "Pure Skating", max: 100 },
    { key: "shooting", label: "Shot Release", max: 100 },
    { key: "hockeyIQ", label: "Hockey IQ", max: 100 },
    { key: "physicality", label: "Physicality", max: 100 },
    { key: "defense", label: "Defensive 200ft", max: 100 },
    { key: "transition", label: "Transition Zone", max: 100 },
    { key: "biometrics", label: "Biometrics & Vitals", max: 100 },
    { key: "clutch", label: "Playoff / Clutch", max: 100 }
  ];

  /**
   * Calculates category-by-category advantages and declares scouting verdict
   */
  function calculateComparisonVerdict(playerA, playerB) {
    if (!playerA || !playerB) return null;

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

    const avgA = Object.values(playerA.ratings).reduce((a, b) => a + b, 0) / 8;
    const avgB = Object.values(playerB.ratings).reduce((a, b) => a + b, 0) / 8;

    let overallVerdict = "";
    if (avgA > avgB + 1.5) {
      overallVerdict = `**${playerA.name} holds the comprehensive tactical edge** with superior ${winsA} category advantages, notably in play driving and transitional tempo.`;
    } else if (avgB > avgA + 1.5) {
      overallVerdict = `**${playerB.name} holds the comprehensive tactical edge** with superior ${winsB} category advantages, driven by high-impact execution.`;
    } else {
      overallVerdict = `**Dead Heat Technical Split:** ${playerA.name} and ${playerB.name} exhibit near-identical aggregate value (${avgA.toFixed(1)} vs ${avgB.toFixed(1)}), each dominating distinct tactical phases.`;
    }

    return {
      playerA: playerA,
      playerB: playerB,
      edges: edges,
      winsA: winsA,
      winsB: winsB,
      ties: ties,
      avgA: avgA.toFixed(1),
      avgB: avgB.toFixed(1),
      overallVerdict: overallVerdict
    };
  }

  // ==========================================
  // 4. RADAR CANVAS DRAWER
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

    // Draw background concentric webs
    ctx.lineWidth = 1;
    for (let level = 1; level <= 5; level++) {
      const levelRadius = (radius / 5) * level;
      ctx.strokeStyle = level === 5 ? "rgba(148, 163, 184, 0.3)" : "rgba(148, 163, 184, 0.1)";
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
    }

    // Draw axis lines and labels
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleSlice - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Axis line
      ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Label text
      const labelX = centerX + Math.cos(angle) * (radius + 24);
      const labelY = centerY + Math.sin(angle) * (radius + 24);
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(RADAR_METRICS[i].label, labelX, labelY);
    }

    // Palette for comparison players
    const colorPalette = [
      { stroke: "#38bdf8", fill: "rgba(56, 189, 248, 0.25)", point: "#38bdf8" },
      { stroke: "#f59e0b", fill: "rgba(245, 158, 11, 0.25)", point: "#f59e0b" },
      { stroke: "#10b981", fill: "rgba(16, 185, 129, 0.25)", point: "#10b981" },
      { stroke: "#ec4899", fill: "rgba(236, 72, 153, 0.25)", point: "#ec4899" }
    ];

    // Draw each player's polygon
    players.forEach((player, pIdx) => {
      const style = colorPalette[pIdx % colorPalette.length];
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = 2.5;
      ctx.fillStyle = style.fill;

      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const metric = RADAR_METRICS[i];
        const val = Math.max(50, Math.min(100, player.ratings[metric.key] || 75));
        const normalized = (val - 50) / 50; // map 50-100 to 0-1
        const r = radius * (0.2 + normalized * 0.8);
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw points
      for (let i = 0; i < numAxes; i++) {
        const metric = RADAR_METRICS[i];
        const val = Math.max(50, Math.min(100, player.ratings[metric.key] || 75));
        const normalized = (val - 50) / 50;
        const r = radius * (0.2 + normalized * 0.8);
        const angle = i * angleSlice - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        ctx.fillStyle = style.point;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // ==========================================
  // 5. SOCIAL WIRE BROADCAST
  // ==========================================
  function broadcastComparisonToWire(verdictData) {
    const pA = verdictData.playerA;
    const pB = verdictData.playerB;

    const post = {
      id: `post-compare-${Date.now()}`,
      authorId: "usr_blueline_scout",
      timestamp: "Just now",
      content: `⚖️ **OFFICIAL SCOUTING DUEL: ${pA.name.toUpperCase()} vs ${pB.name.toUpperCase()}**\n\n8-Axis Radar Comparison complete. Verdict: ${verdictData.overallVerdict}\n\n• ${pA.name}: Avg Rating ${verdictData.avgA}/100 (${verdictData.winsA} Category Advantages)\n• ${pB.name}: Avg Rating ${verdictData.avgB}/100 (${verdictData.winsB} Category Advantages)\n\n#TaleOfTheTape #PlayerComparison #DraftScout #BlueLineDataWorks`,
      likes: 63,
      reposts: 28,
      replies: 19,
      likedByMe: false,
      pinned: false,
      tags: ["#TaleOfTheTape", "#PlayerComparison", "#DraftScout", "#BlueLineDataWorks"],
      media: {
        type: "banner",
        title: `${pA.name.toUpperCase()} vs ${pB.name.toUpperCase()}`,
        subtitle: `Tale of the Tape: ${verdictData.winsA}-${verdictData.winsB} Edge Split`
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

  // Export to Global
  window.BlueLineCompareEngine = {
    COMPARISON_PLAYERS,
    COMPARISON_PRESETS,
    RADAR_METRICS,
    calculateComparisonVerdict,
    drawRadarChart,
    broadcastComparisonToWire
  };

})(window);
