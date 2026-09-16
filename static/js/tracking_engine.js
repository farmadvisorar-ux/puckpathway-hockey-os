/**
 * BlueLine DataWorks: Microstat & Spatial Passing Network Engine
 * 
 * Capabilities:
 * - Controlled Zone Transition Tracking (Carry-In% vs Dump-In% vs Entry Turnovers)
 * - Defensive Blue-Line Denial & Target Suppression Metrics
 * - 2D Spatial Passing Network Web with Royal Road Cross-Slot Link Identification
 * - Loose Puck Retrievals & Corner Battle Recovery Rates
 * - Interactive 5-Step Transition & Scoring Sequence Player
 * - Ingestion of Elite Microstat Profiles (Celebrini, Makar, Q. Hughes, Matthews, McDavid, Bedard, Hutson)
 * - The BlueLine Wire Broadcast Engine (#Microstats, #ZoneTransitions, #RoyalRoad)
 */

(function(window) {
  "use strict";

  // =========================================================================
  // 1. CURATED MICROSTAT PLAYER DOSSIERS
  // =========================================================================
  const MICROSTAT_PLAYERS = [
    {
      id: "ms_celebrini",
      name: "Macklin Celebrini",
      pos: "C",
      team: "San Jose Sharks",
      league: "NHL / NCAA Alum (BU)",
      controlledEntryPct: "76.4%",
      carryInXgPer60: "3.12",
      controlledExitPct: "81.5%",
      denialRate: "62.0%",
      royalRoadPassesPer60: "4.35",
      puckRecoveriesPer60: "19.8",
      forecheckPressureScore: 94,
      profile: "Elite two-way transition engine. Drives blue-line entries through speed deception and immediately targets the weak-side flank.",
      passingLinks: [
        { from: "C", to: "LW", passes: 14, completion: "92%", royalRoad: false },
        { from: "C", to: "RW", passes: 18, completion: "94%", royalRoad: true },
        { from: "C", to: "LD", passes: 8, completion: "98%", royalRoad: false },
        { from: "C", to: "RD", passes: 11, completion: "96%", royalRoad: false },
        { from: "LW", to: "RW", passes: 9, completion: "86%", royalRoad: true },
        { from: "LD", to: "RD", passes: 22, completion: "99%", royalRoad: false }
      ]
    },
    {
      id: "ms_makar",
      name: "Cale Makar",
      pos: "D",
      team: "Colorado Avalanche",
      league: "NHL / NCAA Alum (UMass)",
      controlledEntryPct: "84.2%",
      carryInXgPer60: "3.48",
      controlledExitPct: "91.8%",
      denialRate: "73.5%",
      royalRoadPassesPer60: "4.82",
      puckRecoveriesPer60: "22.4",
      forecheckPressureScore: 89,
      profile: "Unprecedented transitional defenseman. Leads all NHL defensemen in controlled entries with possession and offensive blue-line walking.",
      passingLinks: [
        { from: "RD", to: "LD", passes: 26, completion: "98%", royalRoad: false },
        { from: "RD", to: "C", passes: 19, completion: "95%", royalRoad: false },
        { from: "RD", to: "LW", passes: 15, completion: "91%", royalRoad: true },
        { from: "RD", to: "RW", passes: 13, completion: "94%", royalRoad: false },
        { from: "C", to: "LW", passes: 16, completion: "90%", royalRoad: true },
        { from: "LW", to: "C", passes: 12, completion: "88%", royalRoad: false }
      ]
    },
    {
      id: "ms_hughes",
      name: "Quinn Hughes",
      pos: "D",
      team: "Vancouver Canucks",
      league: "NHL / NCAA Alum (Michigan)",
      controlledEntryPct: "82.5%",
      carryInXgPer60: "3.25",
      controlledExitPct: "93.4%",
      denialRate: "69.0%",
      royalRoadPassesPer60: "5.10",
      puckRecoveriesPer60: "24.1",
      forecheckPressureScore: 86,
      profile: "Norris Trophy maestro. Unmatched escape-skating behind his own goal line and pinpoint seam distribution across the offensive slot.",
      passingLinks: [
        { from: "LD", to: "RD", passes: 28, completion: "99%", royalRoad: false },
        { from: "LD", to: "C", passes: 21, completion: "94%", royalRoad: false },
        { from: "LD", to: "RW", passes: 18, completion: "92%", royalRoad: true },
        { from: "LD", to: "LW", passes: 14, completion: "96%", royalRoad: false },
        { from: "C", to: "RW", passes: 17, completion: "91%", royalRoad: true },
        { from: "RW", to: "LW", passes: 10, completion: "85%", royalRoad: true }
      ]
    },
    {
      id: "ms_mcdavid",
      name: "Connor McDavid",
      pos: "C",
      team: "Edmonton Oilers",
      league: "NHL",
      controlledEntryPct: "88.9%",
      carryInXgPer60: "4.20",
      controlledExitPct: "88.4%",
      denialRate: "58.5%",
      royalRoadPassesPer60: "6.24",
      puckRecoveriesPer60: "21.6",
      forecheckPressureScore: 92,
      profile: "The ultimate transition engine in hockey history. Carries across the neutral zone at 24.2 mph, forcing defensemen onto their heels.",
      passingLinks: [
        { from: "C", to: "LW", passes: 24, completion: "94%", royalRoad: true },
        { from: "C", to: "RW", passes: 22, completion: "95%", royalRoad: true },
        { from: "C", to: "LD", passes: 12, completion: "97%", royalRoad: false },
        { from: "C", to: "RD", passes: 10, completion: "98%", royalRoad: false },
        { from: "LW", to: "C", passes: 18, completion: "92%", royalRoad: false },
        { from: "LD", to: "RD", passes: 20, completion: "99%", royalRoad: false }
      ]
    },
    {
      id: "ms_matthews",
      name: "Auston Matthews",
      pos: "C",
      team: "Toronto Maple Leafs",
      league: "NHL / USNTDP Alum",
      controlledEntryPct: "72.8%",
      carryInXgPer60: "2.95",
      controlledExitPct: "79.2%",
      denialRate: "66.5%",
      royalRoadPassesPer60: "3.45",
      puckRecoveriesPer60: "20.2",
      forecheckPressureScore: 95,
      profile: "Dominant interior scoring center. Unrivaled stick-checking turnover creation and lightning-fast low-slot puck retrievals.",
      passingLinks: [
        { from: "C", to: "LW", passes: 15, completion: "90%", royalRoad: false },
        { from: "C", to: "RW", passes: 19, completion: "93%", royalRoad: true },
        { from: "RW", to: "C", passes: 25, completion: "91%", royalRoad: true },
        { from: "C", to: "LD", passes: 9, completion: "96%", royalRoad: false },
        { from: "LD", to: "RD", passes: 18, completion: "98%", royalRoad: false },
        { from: "LW", to: "C", passes: 14, completion: "89%", royalRoad: false }
      ]
    },
    {
      id: "ms_bedard",
      name: "Connor Bedard",
      pos: "C",
      team: "Chicago Blackhawks",
      league: "NHL / WHL Alum (Regina)",
      controlledEntryPct: "78.9%",
      carryInXgPer60: "3.55",
      controlledExitPct: "77.4%",
      denialRate: "54.2%",
      royalRoadPassesPer60: "4.90",
      puckRecoveriesPer60: "18.5",
      forecheckPressureScore: 88,
      profile: "Generational release with exceptional deception entering the offensive zone. Uses toe-drag release angles to disguise cross-seam dishes.",
      passingLinks: [
        { from: "C", to: "LW", passes: 19, completion: "91%", royalRoad: true },
        { from: "C", to: "RW", passes: 21, completion: "92%", royalRoad: true },
        { from: "C", to: "LD", passes: 10, completion: "95%", royalRoad: false },
        { from: "C", to: "RD", passes: 12, completion: "97%", royalRoad: false },
        { from: "LW", to: "C", passes: 16, completion: "88%", royalRoad: true },
        { from: "RD", to: "LD", passes: 18, completion: "98%", royalRoad: false }
      ]
    },
    {
      id: "ms_hutson",
      name: "Lane Hutson",
      pos: "D",
      team: "Montreal Canadiens",
      league: "NHL / NCAA Alum (BU)",
      controlledEntryPct: "81.6%",
      carryInXgPer60: "3.10",
      controlledExitPct: "89.5%",
      denialRate: "67.8%",
      royalRoadPassesPer60: "5.40",
      puckRecoveriesPer60: "21.2",
      forecheckPressureScore: 91,
      profile: "Dynamic offensive blueliner. Elite head fakes and edge-work opening lanes along the blue line to generate high-danger Royal Road feeds.",
      passingLinks: [
        { from: "LD", to: "RD", passes: 24, completion: "98%", royalRoad: false },
        { from: "LD", to: "C", passes: 18, completion: "93%", royalRoad: false },
        { from: "LD", to: "RW", passes: 20, completion: "91%", royalRoad: true },
        { from: "LD", to: "LW", passes: 15, completion: "95%", royalRoad: false },
        { from: "C", to: "RW", passes: 14, completion: "89%", royalRoad: true },
        { from: "RW", to: "C", passes: 11, completion: "87%", royalRoad: false }
      ]
    }
  ];

  // =========================================================================
  // 2. INTERACTIVE 5-STEP TRANSITION SEQUENCE KEYFRAMES
  // =========================================================================
  const SEQUENCE_STEPS = [
    {
      step: 1,
      title: "Defensive Zone Wall Battle & Controlled Exit",
      zone: "Defensive Zone",
      puckLoc: { x: 18, y: 72 },
      description: "Left Defenseman pins oncoming forechecker to the half-wall, executes a clean reverse rim to Center, who wheels with full speed.",
      statHighlight: "Controlled Exit with Possession: 84% success rate vs 18% on glass clears.",
      tacticalNote: "Avoiding blind panic clears preserves continuous offensive momentum."
    },
    {
      step: 2,
      title: "Neutral Zone Regroup & Pace Generation",
      zone: "Neutral Zone",
      puckLoc: { x: 45, y: 50 },
      description: "Center accelerates through the middle lane, forcing opponent defensemen to yield the blue line to prevent a clean rush blowout.",
      statHighlight: "Neutral Zone Speed Differential: +3.8 mph over retreating defenders.",
      tacticalNote: "Puck carrier speed forces gap control collapse."
    },
    {
      step: 3,
      title: "Controlled Blue-Line Entry with Possession",
      zone: "Offensive Blue Line",
      puckLoc: { x: 65, y: 35 },
      description: "Puck carrier gains the offensive line with control, delays at the top of the circle, and draws two penalty killers toward the boards.",
      statHighlight: "Carry-In Shot Generation: Generates 3.2x more xG than dump-and-chase.",
      tacticalNote: "Delay move creates trailing support lane for the weak-side defenseman."
    },
    {
      step: 4,
      title: "Low-to-High Cycle & Weak-Side Shift",
      zone: "Offensive Zone",
      puckLoc: { x: 78, y: 22 },
      description: "Puck cycled low to Right Wing in the corner, who threads a high diagonal pass to Left Defenseman walking down the half-wall.",
      statHighlight: "High-to-Low Movement: Forces goalie to slide across crease 3 separate times.",
      tacticalNote: "Lateral puck rotation fractures defensive box integrity."
    },
    {
      step: 5,
      title: "The Royal Road Cross-Slot Seam & One-Timer Finish",
      zone: "Slot & Crease",
      puckLoc: { x: 88, y: 50 },
      description: "Left Defenseman fires a tape-to-tape seam pass across the Royal Road to Right Wing for a high-danger one-timer into the open net!",
      statHighlight: "Royal Road Cross-Slot Pass: Elevates shooting conversion probability to 32.4%.",
      tacticalNote: "Goalie caught transitioning across goal mouth with zero post seal."
    }
  ];

  // =========================================================================
  // 3. THE BLUE LINE WIRE BROADCAST GENERATOR
  // =========================================================================
  function broadcastMicrostatReport(player) {
    const wireStateKey = "blueline_social_state";
    let wire = { posts: [] };
    try {
      const stored = localStorage.getItem(wireStateKey);
      if (stored) wire = JSON.parse(stored);
    } catch (e) {}

    const newPost = {
      id: "post_micro_" + Date.now(),
      author: "BlueLine Microstat Desk",
      handle: "@BlueLineMicrostats",
      avatar: "📊",
      badge: "SPATIAL TRACKING VERIFIED",
      timestamp: "Just now",
      content: `🔬 MICROSTAT TRANSITION DOSSIER: ${player.name} (${player.team})\n\n` +
        `• Controlled Entry %: ${player.controlledEntryPct} | Carry-In xG/60: ${player.carryInXgPer60}\n` +
        `• Controlled Exit %: ${player.controlledExitPct} | Blue-Line Denial Rate: ${player.denialRate}\n` +
        `• Royal Road Seam Passes / 60: ${player.royalRoadPassesPer60} | Loose Puck Recoveries / 60: ${player.puckRecoveriesPer60}\n` +
        `• Tactical Scouting Report: "${player.profile}"\n\n` +
        `#Microstats #ZoneTransitions #RoyalRoad #PassingWeb #BlueLineDataWorks`,
      likes: 63,
      reposts: 29,
      replies: 12
    };

    wire.posts.unshift(newPost);
    try {
      localStorage.setItem(wireStateKey, JSON.stringify(wire));
    } catch (e) {}

    return newPost;
  }

  // =========================================================================
  // PUBLIC API EXPORT
  // =========================================================================
  window.TrackingEngine = {
    players: MICROSTAT_PLAYERS,
    sequenceSteps: SEQUENCE_STEPS,
    broadcastMicrostatReport
  };

})(window);
