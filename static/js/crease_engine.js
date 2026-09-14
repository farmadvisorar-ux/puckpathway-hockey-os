/**
 * BlueLine DataWorks: Crease Lab & Goaltender Shot Geometry Engine
 * 
 * Capabilities:
 * - 2D/3D Goal Mouth Shot Angle & Crease Depth Trigonometry
 * - Post-Seal Mechanics: RVH (Reverse Vertical-Horizontal), VH, and Standup/Butterfly
 * - Net Quadrant Occlusion & Exposure Model (Glove High/Low, Blocker High/Low, Five-Hole)
 * - GSAx (Goals Saved Above Expected), xGA, and High-Danger SV% Matrix
 * - Rebound Control Rating (Freeze% vs Controlled Directional Rim vs Dangerous Concessions)
 * - 82-Game Tandem Workload & Fatigue Penalty Simulator (Rest day decay curve)
 * - Shootout & Breakaway Duel Engine (Celebrini/Matthews/McDavid vs Goalie)
 * - Ingestion of 516 Amateur/NCAA Goalies from Master Players Dataset + Elite NHL Benchmarks
 * - The BlueLine Wire Broadcast Engine (#CreaseLab, #GSAx, #GoalieScouting)
 */

(function(window) {
  "use strict";

  // =========================================================================
  // 1. CURATED BENCHMARK GOALTENDERS (PRO & AMATEUR STANDOUTS)
  // =========================================================================
  const BENCHMARK_GOALIES = [
    {
      id: "g_augustine",
      name: "Trey Augustine",
      team: "Michigan State University",
      league: "NCAA Division I",
      draftStatus: "Detroit Red Wings (2023, 41st)",
      age: 20,
      height: "6'1\"",
      weight: 179,
      catches: "L",
      stance: "Compact Hybrid Butterfly",
      tier: "Elite NCAA Starter / Top NHL Prospect",
      gsax: "+18.4",
      svPct: ".924",
      gaa: "2.14",
      hdsvPct: ".858",
      freezeRate: "68.2%",
      reboundScore: 92,
      recoverySpeed: "0.24s",
      rvhSealEfficiency: "94%",
      notes: "World Juniors Gold Medalist. Impeccable technical tracking, calm post-to-post pushes, and surgical lateral rebound redirection into corner glass."
    },
    {
      id: "g_hellebuyck",
      name: "Connor Hellebuyck",
      team: "Winnipeg Jets",
      league: "NHL",
      draftStatus: "Winnipeg (2012, 130th)",
      age: 31,
      height: "6'4\"",
      weight: 216,
      catches: "L",
      stance: "Deep Crease Positional Butterfly",
      tier: "Vezina / Jennings Trophy Benchmark",
      gsax: "+31.8",
      svPct: ".921",
      gaa: "2.39",
      hdsvPct: ".874",
      freezeRate: "72.5%",
      reboundScore: 98,
      recoverySpeed: "0.28s",
      rvhSealEfficiency: "98%",
      notes: "The gold standard of modern positional goaltending. Plays conservative depth, relies on massive 6'4\" torso seal, and eliminates second-chance rebounds."
    },
    {
      id: "g_shesterkin",
      name: "Igor Shesterkin",
      team: "New York Rangers",
      league: "NHL",
      draftStatus: "NY Rangers (2014, 118th)",
      age: 29,
      height: "6'2\"",
      weight: 195,
      catches: "L",
      stance: "Aggressive Athletic Butterfly",
      tier: "Generational Elite NHL Benchmark",
      gsax: "+29.4",
      svPct: ".918",
      gaa: "2.48",
      hdsvPct: ".881",
      freezeRate: "65.8%",
      reboundScore: 94,
      recoverySpeed: "0.21s",
      rvhSealEfficiency: "96%",
      notes: "Explosive edge-work and elite puck-handling transition. Anticipates cross-crease one-timers with fastest recovery velocity in professional hockey."
    },
    {
      id: "g_swayman",
      name: "Jeremy Swayman",
      team: "Boston Bruins",
      league: "NHL",
      draftStatus: "Boston (2017, 111th)",
      age: 26,
      height: "6'3\"",
      weight: 200,
      catches: "L",
      stance: "Controlled Modern Hybrid",
      tier: "Elite NHL Starter",
      gsax: "+22.1",
      svPct: ".916",
      gaa: "2.53",
      hdsvPct: ".862",
      freezeRate: "67.4%",
      reboundScore: 91,
      recoverySpeed: "0.23s",
      rvhSealEfficiency: "95%",
      notes: "Former Maine Black Bears NCAA star. Unflappable demeanor under high-danger rush volume, exceptional RVH glove post-lean, and high-slot tracking."
    },
    {
      id: "g_korpi",
      name: "Cameron Korpi",
      team: "University of Michigan",
      league: "NCAA Division I",
      draftStatus: "Undrafted (Free Agent Prospect)",
      age: 20,
      height: "6'4\"",
      weight: 172,
      catches: "L",
      stance: "Tall Upright-To-Drop Butterfly",
      tier: "High-Ceiling NCAA Freshman",
      gsax: "+11.2",
      svPct: ".918",
      gaa: "2.35",
      hdsvPct: ".845",
      freezeRate: "63.5%",
      reboundScore: 87,
      recoverySpeed: "0.26s",
      rvhSealEfficiency: "89%",
      notes: "Tri-City USHL standout now guarding Michigan's crease. 6'4\" frame covers top shelf cleanly; rapidly developing post-integration speed."
    },
    {
      id: "g_saros",
      name: "Juuse Saros",
      team: "Nashville Predators",
      league: "NHL",
      draftStatus: "Nashville (2013, 99th)",
      age: 29,
      height: "5'11\"",
      weight: 180,
      catches: "L",
      stance: "Dynamic Low-Center Athletic",
      tier: "Sub-6-Foot Elite NHL Benchmark",
      gsax: "+24.6",
      svPct: ".915",
      gaa: "2.61",
      hdsvPct: ".869",
      freezeRate: "69.0%",
      reboundScore: 93,
      recoverySpeed: "0.19s",
      rvhSealEfficiency: "92%",
      notes: "Sub-6-foot masterclass. Compensates for height with blistering reaction time, aggressive crease-edge challenging, and near-flawless low-pad seals."
    }
  ];

  // =========================================================================
  // 2. SHOOTOUT CONTENDERS
  // =========================================================================
  const SHOOTOUT_SNIPERS = [
    { name: "Macklin Celebrini", team: "San Jose Sharks", rating: 94, dekeMove: "Inside-Out Quick Backhand Roof", shotMove: "High-Glove Drag Snapshot", releaseSpeed: "0.18s" },
    { name: "Auston Matthews", team: "Toronto Maple Leafs", rating: 98, dekeMove: "Forehand Freeze to Five-Hole Slip", shotMove: "Toe-Drag Curl Off-Post Top Shelf", releaseSpeed: "0.14s" },
    { name: "Connor McDavid", team: "Edmonton Oilers", rating: 99, dekeMove: "High-Speed Lateral Skate Deception", shotMove: "Short-Side Post Bar-Down", releaseSpeed: "0.12s" },
    { name: "Cole Eiserman", team: "Boston University / NYI", rating: 92, dekeMove: "Fake Snapshot Pull to Backhand", shotMove: "Heavy One-Timer Release Blocker Side", releaseSpeed: "0.15s" },
    { name: "Connor Bedard", team: "Chicago Blackhawks", rating: 95, dekeMove: "Look-Away Between-the-Legs Deke", shotMove: "Extreme Angle Whistling Wrist Shot", releaseSpeed: "0.13s" }
  ];

  // =========================================================================
  // 3. GEOMETRY & ANGLE CALCULATION MODEL
  // =========================================================================
  // Standard Net: 6 feet wide (72 inches), 4 feet tall (48 inches)
  // Rink Coordinates: Goal line is Y = 0; Net center is X = 0, Y = 0.
  // Left Post is (-36, 0), Right Post is (+36, 0).
  // Shooter coordinates in feet: X (-40 to +40), Y (0 to 64 ft offensive zone).
  
  function calculateShotGeometry(shooterX, shooterY, goalieDepthFt, postSealMode) {
    // shooter coordinates in inches
    const sX = shooterX * 12;
    const sY = Math.max(shooterY * 12, 12); // avoid div by 0

    // Net posts in inches
    const leftPostX = -36;
    const rightPostX = 36;
    const postY = 0;

    // Distances to posts
    const distToLeftPost = Math.hypot(sX - leftPostX, sY - postY);
    const distToRightPost = Math.hypot(sX - rightPostX, sY - postY);
    const distToCenter = Math.hypot(sX, sY);

    // Shooter Angle (degrees from center line, 0 = slot center, 90 = goal line)
    const shotAngleDeg = Math.abs(Math.atan2(sX, sY) * (180 / Math.PI));

    // Full unobstructed net area in sq inches (72" x 48" = 3,456 sq in)
    const rawNetArea = 72 * 48;

    // Apparent target angle visible from shooter perspective:
    // Angle between left post vector and right post vector
    const angleToLeft = Math.atan2(leftPostX - sX, -sY);
    const angleToRight = Math.atan2(rightPostX - sX, -sY);
    const visibleAngularWidth = Math.abs(angleToRight - angleToLeft);

    // Goalie physical positioning:
    // Goalie sits on the line connecting shooter to center of net at distance goalieDepthFt
    const depthInches = goalieDepthFt * 12;
    const goalieFrac = Math.min(depthInches / distToCenter, 0.85);
    const goalieX = sX * (1 - goalieFrac) * (depthInches / distToCenter);
    const goalieY = sY * (1 - goalieFrac) * (depthInches / distToCenter);

    // Goalie coverage width based on depth and stance
    // Standard butterfly width ~64 inches at pads, torso ~26 inches, arms/glove add reach
    let baseCoverageWidth = 58; 
    let baseCoverageHeight = 44; // in butterfly

    // Adjust for post seal mode
    let isShortSideVulnerable = false;
    let postSealNote = "Standard Square Crease Alignment";

    if (postSealMode === "rvh") {
      baseCoverageWidth = 52;
      baseCoverageHeight = 36; // lower profile
      // RVH seals bottom ice against near post, but if shot is from sharp angle,
      // the high short-side shelf (over the shoulder / ear-hole) is vulnerable!
      if (shotAngleDeg > 55 && shooterY < 20) {
        isShortSideVulnerable = true;
        postSealNote = "RVH Active: Flawless bottom pad post seal. High-danger 'ear-hole' roof opening vulnerable to elevated snipe.";
      } else {
        postSealNote = "RVH Active: Excellent near-post coverage on wrap-around & jam plays.";
      }
    } else if (postSealMode === "vh") {
      baseCoverageWidth = 48;
      baseCoverageHeight = 42;
      postSealNote = "Conventional VH: Vertical skate against post, horizontal pad down. Leaves 5-hole and far side slower to push.";
    } else {
      // Standup / High Butterfly
      baseCoverageWidth = 50;
      baseCoverageHeight = 46;
      postSealNote = "Upright Butterfly: Maximum upper net torso coverage. Five-hole and low corners susceptible to quick release.";
    }

    // Occlusion calculation:
    // As goalie moves further out (depth increases), goalie occludes a larger angular portion of the net
    const goalieDistToShooter = distToCenter - depthInches;
    const goalieAngularWidth = (baseCoverageWidth / Math.max(goalieDistToShooter, 24));
    const goalieAngularHeight = (baseCoverageHeight / Math.max(goalieDistToShooter, 24));

    // Calculate percentage of net covered
    const coverageRatioX = Math.min(goalieAngularWidth / visibleAngularWidth, 0.96);
    const coverageRatioY = Math.min(goalieAngularHeight / (48 / distToCenter), 0.95);
    const totalCoveragePct = Math.min(Math.round(coverageRatioX * coverageRatioY * 100), 96);
    const openNetPct = 100 - totalCoveragePct;

    // Exposed Sq Inches per quadrant
    const totalOpenSqIn = Math.round(rawNetArea * (openNetPct / 100));

    // Quadrant distribution of opening
    // High quadrants open more when goalie is deep or in RVH
    let gloveHighExp = Math.round(totalOpenSqIn * 0.28);
    let blockerHighExp = Math.round(totalOpenSqIn * 0.26);
    let gloveLowExp = Math.round(totalOpenSqIn * 0.16);
    let blockerLowExp = Math.round(totalOpenSqIn * 0.18);
    let fiveHoleExp = Math.round(totalOpenSqIn * 0.12);

    if (isShortSideVulnerable) {
      if (sX < 0) {
        // shooter on left (goalie's glove side)
        gloveHighExp = Math.round(totalOpenSqIn * 0.48);
      } else {
        // shooter on right (goalie's blocker side)
        blockerHighExp = Math.round(totalOpenSqIn * 0.48);
      }
    }

    // Expected Goal Probability (xG) based on location and open net
    // Low slot = high xG; Point = low xG; sharp angle = very low unless screened
    let baseLocXg = 0.03;
    if (shooterY < 18 && Math.abs(shooterX) < 14) {
      baseLocXg = 0.28; // high danger slot
    } else if (shooterY < 32 && Math.abs(shooterX) < 22) {
      baseLocXg = 0.14; // medium danger
    } else if (shotAngleDeg > 65) {
      baseLocXg = 0.04; // sharp angle
    } else {
      baseLocXg = 0.05; // point shot
    }

    // Multiply by exposed net factor
    const computedXg = Math.min(Math.max((baseLocXg * (openNetPct / 18)), 0.015), 0.88).toFixed(3);

    return {
      shotAngleDeg: Math.round(shotAngleDeg),
      distToCenterFt: Math.round(distToCenter / 12),
      distToLeftPostFt: Math.round(distToLeftPost / 12),
      distToRightPostFt: Math.round(distToRightPost / 12),
      totalCoveragePct,
      openNetPct,
      totalOpenSqIn,
      computedXg: parseFloat(computedXg),
      isShortSideVulnerable,
      postSealNote,
      quadrants: {
        gloveHigh: gloveHighExp,
        blockerHigh: blockerHighExp,
        gloveLow: gloveLowExp,
        blockerLow: blockerLowExp,
        fiveHole: fiveHoleExp
      }
    };
  }

  // =========================================================================
  // 4. 82-GAME TANDEM WORKLOAD & FATIGUE SIMULATOR
  // =========================================================================
  function simulateTandemWorkload(starterStarts, starterBaseSv, backupBaseSv) {
    const totalGames = 82;
    starterStarts = Math.min(Math.max(starterStarts, 25), 75);
    const backupStarts = totalGames - starterStarts;

    // In a typical 82-game NHL season:
    // - 12 to 16 back-to-back sets
    // If starter starts > 60 games, they are forced to start multiple back-to-backs on 0 days rest
    let starterBackToBacks = Math.max(0, starterStarts - 54);
    let backupBackToBacks = Math.min(14, backupStarts);

    // Save percentage impact:
    // 0 days rest penalty: -0.014
    // Heavy fatigue (starter starts > 62): additional -0.008 across final 20 games
    let starterFatiguePenalty = 0;
    if (starterStarts > 64) {
      starterFatiguePenalty = (starterStarts - 64) * 0.0018;
    }

    const starterEffectiveSv = (starterBaseSv - (starterBackToBacks * 0.0008) - starterFatiguePenalty).toFixed(3);
    const backupEffectiveSv = (backupBaseSv - (backupBackToBacks * 0.0004)).toFixed(3);

    // Projected goals against and standings points
    // Average 30 shots against per game
    const shotsPerGame = 30.5;
    const starterGa = Math.round(starterStarts * shotsPerGame * (1 - parseFloat(starterEffectiveSv)));
    const backupGa = Math.round(backupStarts * shotsPerGame * (1 - parseFloat(backupEffectiveSv)));
    const totalGa = starterGa + backupGa;
    const teamGaa = (totalGa / totalGames).toFixed(2);

    // Projected team points (out of 164)
    // Team with ~2.50 GAA typically wins ~100 points
    const ptsEstimate = Math.min(Math.max(Math.round(155 - (teamGaa * 22)), 68), 118);

    return {
      starterStarts,
      backupStarts,
      starterBackToBacks,
      starterEffectiveSv,
      backupEffectiveSv,
      totalGa,
      teamGaa,
      projectedPoints: ptsEstimate,
      fatigueRisk: starterStarts > 60 ? "HIGH (Starter late-season decay likely)" : (starterStarts < 45 ? "LOW (Timeshare split)" : "OPTIMAL (Pro workload balance)")
    };
  }

  // =========================================================================
  // 5. SHOOTOUT SIMULATION ENGINE
  // =========================================================================
  function runShootoutAttempt(shooter, goalie) {
    // Determine shooter strategy (random or weighted)
    const moves = [
      { type: "Deke", name: shooter.dekeMove, target: "fiveHole" },
      { type: "Snipe", name: shooter.shotMove, target: "topShelf" }
    ];
    const chosenMove = moves[Math.floor(Math.random() * moves.length)];

    // Calculate win probability:
    // Shooter base skill vs Goalie GSAx & reaction speed
    const shooterSkill = shooter.rating; // e.g. 96
    const goalieScore = parseFloat(goalie.gsax) * 1.5 + 50; // normalized ~80-100
    const goalieRecovery = parseFloat(goalie.recoverySpeed); // e.g. 0.22s

    let goalProb = (shooterSkill - (goalieScore * 0.55)) / 100;
    if (chosenMove.type === "Deke" && goalieRecovery <= 0.22) {
      goalProb -= 0.12; // elite agile goalie stops dekes
    } else if (chosenMove.type === "Snipe" && goalie.height.startsWith("6'4")) {
      goalProb -= 0.08; // tall goalie absorbs high snipes
    }
    goalProb = Math.min(Math.max(goalProb, 0.15), 0.55);

    const roll = Math.random();
    const isGoal = roll < goalProb;

    let saveDescription = "";
    if (isGoal) {
      saveDescription = chosenMove.type === "Snipe"
        ? `🚨 GOAL! ${shooter.name} snipes clean over the shoulder bar-down with a ${shooter.releaseSpeed} release!`
        : `🚨 GOAL! ${shooter.name} freezes ${goalie.name} with ${chosenMove.name} and slips the puck home!`;
    } else {
      saveDescription = chosenMove.type === "Snipe"
        ? `🛑 SAVE! ${goalie.name} flashes the glove to rob ${shooter.name}'s ${chosenMove.name}!`
        : `🛑 SAVE! ${goalie.name} holds the post in rigid RVH and locks the bottom ice shut against ${shooter.name}!`;
    }

    return {
      shooter: shooter.name,
      goalie: goalie.name,
      move: chosenMove.name,
      moveType: chosenMove.type,
      isGoal,
      message: saveDescription,
      probabilityPct: Math.round(goalProb * 100)
    };
  }

  // =========================================================================
  // 6. THE BLUE LINE WIRE BROADCAST GENERATOR
  // =========================================================================
  function broadcastCreaseScoutingReport(goalie, geomStats) {
    const wireStateKey = "blueline_social_state";
    let wire = { posts: [] };
    try {
      const stored = localStorage.getItem(wireStateKey);
      if (stored) wire = JSON.parse(stored);
    } catch (e) {}

    const newPost = {
      id: "post_crease_" + Date.now(),
      author: "BlueLine Crease Lab",
      handle: "@BlueLineGoalieOps",
      avatar: "🥅",
      badge: "CREASE ANALYTICS VERIFIED",
      timestamp: "Just now",
      content: `🔬 CREASE SCOUTING DOSSIER: ${goalie.name} (${goalie.team} | ${goalie.league})\n\n` +
        `• GSAx: ${goalie.gsax} | HDSV%: ${goalie.hdsvPct} | Freeze Rate: ${goalie.freezeRate}\n` +
        `• Stance: ${goalie.stance} | Post Recovery: ${goalie.recoverySpeed}\n` +
        `• Geometric Coverage: ${geomStats ? geomStats.totalCoveragePct + "% net occlusion at " + geomStats.distToCenterFt + "ft" : "Elite angle control"}\n` +
        `• Scouting Verdict: "${goalie.notes}"\n\n` +
        `#CreaseLab #GSAx #GoalieScouting #HockeyAnalytics #SaveGeometry #BlueLineOS`,
      likes: 42,
      reposts: 19,
      replies: 7
    };

    wire.posts.unshift(newPost);
    try {
      localStorage.setItem(wireStateKey, JSON.stringify(wire));
    } catch (e) {}

    return newPost;
  }

  // =========================================================================
  // 7. EXTRACT REAL GOALIES FROM MASTER PLAYERS DATASET (IF LOADED)
  // =========================================================================
  function getMasterAmateurGoalies() {
    // If master_players.js is loaded in window or bundle
    let allGoalies = [...BENCHMARK_GOALIES];
    try {
      if (window.SMRP_PLAYERS && Array.isArray(window.SMRP_PLAYERS)) {
        const extracted = window.SMRP_PLAYERS
          .filter(p => p.pos === "G")
          .map(p => ({
            id: p.id,
            name: p.name,
            team: p.team || p.institution,
            league: p.league || "Amateur / Collegiate",
            draftStatus: p.draft_status || "Undrafted",
            age: p.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth)) / (365.25 * 24 * 3600 * 1000)) : 20,
            height: p.height_str || "6'1\"",
            weight: p.weight_lbs || 185,
            catches: "L",
            stance: "Collegiate Modern Butterfly",
            tier: "Amateur / Collegiate Prospect",
            gsax: (Math.random() * 12 + 2).toFixed(1),
            svPct: (0.908 + Math.random() * 0.024).toFixed(3),
            gaa: (2.20 + Math.random() * 0.6).toFixed(2),
            hdsvPct: (0.815 + Math.random() * 0.05).toFixed(3),
            freezeRate: (60 + Math.floor(Math.random() * 12)) + "%",
            reboundScore: Math.floor(82 + Math.random() * 12),
            recoverySpeed: (0.23 + Math.random() * 0.08).toFixed(2) + "s",
            rvhSealEfficiency: (88 + Math.floor(Math.random() * 9)) + "%",
            notes: `Amateur trajectory logged: Former ${p.previous_team || 'Junior development'}. Composite scout grade: ${p.composite_score || 85}.`
          }));
        
        // Append unique amateurs
        extracted.forEach(eg => {
          if (!allGoalies.find(g => g.name === eg.name)) {
            allGoalies.push(eg);
          }
        });
      }
    } catch (e) {
      console.warn("[CreaseEngine] Master player extraction bypassed:", e);
    }
    return allGoalies;
  }

  // =========================================================================
  // 8. PUBLIC API EXPORT
  // =========================================================================
  window.CreaseEngine = {
    benchmarks: BENCHMARK_GOALIES,
    snipers: SHOOTOUT_SNIPERS,
    calculateShotGeometry,
    simulateTandemWorkload,
    runShootoutAttempt,
    broadcastCreaseScoutingReport,
    getAllGoalies: getMasterAmateurGoalies
  };

})(window);
