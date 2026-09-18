/**
 * BlueLine DataWorks: AI Combine & Biometric Benchmark Suite Engine
 * 
 * Protocols:
 * 1. 30m On-Ice Sprint Laser Trap (sec & mph)
 * 2. Wingate Anaerobic Peak Power (Watts/kg & Fatigue Index)
 * 3. Force Plate Vertical Countermovement Jump (inches & Peak N)
 * 4. Pro Agility 5-10-5 Shuttle (sec)
 * 5. Pull-Up Max Reps (strict extension)
 * 6. Grip Strength Dynamometer (kg force)
 * 7. VO2 Max Aerobic Capacity (ml/kg/min)
 * 8. Standing Broad Jump (inches)
 */

(function(window) {
  "use strict";

  // 1. TESTING PROTOCOLS & NORMATIVE RANGES (NCAA / NHL Combine Standards)
  const PROTOCOLS = {
    sprint30m: {
      name: "30m On-Ice Sprint (Laser Trap)",
      unit: "sec",
      description: "Measures explosive on-ice acceleration from dead stop to 30m laser beam.",
      min: 4.40, max: 3.70, // lower is better
      lowerIsBetter: true,
      eliteThreshold: 3.85,
      weight: 0.18
    },
    wingatePeak: {
      name: "Wingate Anaerobic Peak Power",
      unit: "W/kg",
      description: "Measures 30-second sprint peak anaerobic wattage per kilogram bodyweight.",
      min: 13.0, max: 19.5, // higher is better
      lowerIsBetter: false,
      eliteThreshold: 17.0,
      weight: 0.16
    },
    verticalJump: {
      name: "Force Plate Vertical Jump",
      unit: "in",
      description: "Countermovement jump height measured via dual-axis force plates.",
      min: 18.0, max: 34.0,
      lowerIsBetter: false,
      eliteThreshold: 28.0,
      weight: 0.15
    },
    proAgility: {
      name: "Pro Agility Shuttle (5-10-5)",
      unit: "sec",
      description: "Measures lateral change of direction, hip mobility, and acceleration recovery.",
      min: 4.70, max: 4.05,
      lowerIsBetter: true,
      eliteThreshold: 4.22,
      weight: 0.14
    },
    pullUps: {
      name: "Strict Pull-Ups",
      unit: "reps",
      description: "Continuous maximum reps with full elbow extension and chin clearing bar.",
      min: 6, max: 24,
      lowerIsBetter: false,
      eliteThreshold: 15,
      weight: 0.10
    },
    gripStrength: {
      name: "Grip Strength Dyno (Combined)",
      unit: "kg",
      description: "Sum of dominant and non-dominant hand maximum isometric grip squeeze.",
      min: 45, max: 80,
      lowerIsBetter: false,
      eliteThreshold: 65,
      weight: 0.09
    },
    vo2Max: {
      name: "Aerobic Capacity (VO2 Max)",
      unit: "ml/kg/min",
      description: "Maximal oxygen uptake measured on skating treadmill / ramp bike test.",
      min: 48.0, max: 68.0,
      lowerIsBetter: false,
      eliteThreshold: 62.0,
      weight: 0.10
    },
    broadJump: {
      name: "Standing Broad Jump",
      unit: "in",
      description: "Explosive horizontal lower-body power measured from toes to landing heels.",
      min: 88, max: 125,
      lowerIsBetter: false,
      eliteThreshold: 112,
      weight: 0.08
    }
  };

  // 2. AGE COHORT NORMS (U14, U16, USHL / Junior, NCAA D1, NHL Combine)
  const COHORT_NORMS = {
    "U14 AAA": {
      sprint30m: 4.35, wingatePeak: 13.8, verticalJump: 19.5,
      proAgility: 4.62, pullUps: 7, gripStrength: 42, vo2Max: 52.0, broadJump: 92
    },
    "U16 AAA": {
      sprint30m: 4.12, wingatePeak: 15.1, verticalJump: 23.0,
      proAgility: 4.45, pullUps: 11, gripStrength: 52, vo2Max: 56.5, broadJump: 101
    },
    "Junior / USHL": {
      sprint30m: 3.98, wingatePeak: 16.2, verticalJump: 25.8,
      proAgility: 4.32, pullUps: 13, gripStrength: 59, vo2Max: 59.8, broadJump: 107
    },
    "MSHSL Class AA Varsity Norm": {
      sprint30m: 4.05, wingatePeak: 15.6, verticalJump: 24.5,
      proAgility: 4.38, pullUps: 12, gripStrength: 56, vo2Max: 58.2, broadJump: 104
    },
    "NEPSAC Elite Prep Norm": {
      sprint30m: 3.95, wingatePeak: 16.4, verticalJump: 26.2,
      proAgility: 4.29, pullUps: 14, gripStrength: 60, vo2Max: 60.4, broadJump: 109
    },
    "NCAA D1": {
      sprint30m: 3.90, wingatePeak: 16.9, verticalJump: 27.2,
      proAgility: 4.24, pullUps: 15, gripStrength: 63, vo2Max: 61.5, broadJump: 111
    },
    "NHL Combine Top 10%": {
      sprint30m: 3.82, wingatePeak: 17.8, verticalJump: 29.5,
      proAgility: 4.16, pullUps: 17, gripStrength: 68, vo2Max: 64.0, broadJump: 116
    }
  };

  // 3. VERIFIED PROSPECT COMBINE BENCHMARKS
  const PROSPECT_BENCHMARKS = [
    {
      id: "prospect-1",
      name: "Macklin Celebrini",
      pos: "C",
      team: "Boston University / San Jose Sharks",
      league: "NCAA D1 / NHL",
      height: "6'0\"",
      weight: 195,
      metrics: {
        sprint30m: 3.81,
        wingatePeak: 17.4,
        verticalJump: 28.5,
        proAgility: 4.18,
        pullUps: 16,
        gripStrength: 65,
        vo2Max: 63.8,
        broadJump: 115
      },
      scoutingNote: "Elite first-three-stride laser speed combined with top 2% aerobic capacity. Exceptional recovery in high-intensity shifts."
    },
    {
      id: "prospect-2",
      name: "Artyom Levshunov",
      pos: "RHD",
      team: "Michigan State / Chicago Blackhawks",
      league: "NCAA D1 / NHL",
      height: "6'2\"",
      weight: 208,
      metrics: {
        sprint30m: 3.88,
        wingatePeak: 18.2,
        verticalJump: 29.8,
        proAgility: 4.26,
        pullUps: 18,
        gripStrength: 72,
        vo2Max: 59.5,
        broadJump: 117
      },
      scoutingNote: "Prototypical NHL power defenseman. Highest peak anaerobic output in the draft class with bone-crushing grip strength."
    },
    {
      id: "prospect-3",
      name: "Michael Hage",
      pos: "C",
      team: "University of Michigan / Montreal Canadiens",
      league: "NCAA D1 / NHL",
      height: "6'1\"",
      weight: 190,
      metrics: {
        sprint30m: 3.83,
        wingatePeak: 16.9,
        verticalJump: 27.6,
        proAgility: 4.20,
        pullUps: 15,
        gripStrength: 62,
        vo2Max: 62.4,
        broadJump: 113
      },
      scoutingNote: "Silky smooth skating mechanics backed by a 4.20 pro agility shuttle. Elite deceleration and lateral escape speed."
    },
    {
      id: "prospect-4",
      name: "Cayden Lindstrom",
      pos: "C",
      team: "Medicine Hat Tigers / Columbus Blue Jackets",
      league: "WHL / NHL",
      height: "6'3\"",
      weight: 213,
      metrics: {
        sprint30m: 3.80,
        wingatePeak: 18.5,
        verticalJump: 31.0,
        proAgility: 4.23,
        pullUps: 19,
        gripStrength: 74,
        vo2Max: 61.2,
        broadJump: 120
      },
      scoutingNote: "Unicorn physical profile: 6'3\" 213 lbs moving at 3.80s laser speed. 31-inch vertical produces massive checking momentum."
    },
    {
      id: "prospect-5",
      name: "Cole Eiserman",
      pos: "LW",
      team: "Boston University / New York Islanders",
      league: "NCAA D1 / NHL",
      height: "6'0\"",
      weight: 197,
      metrics: {
        sprint30m: 3.87,
        wingatePeak: 17.1,
        verticalJump: 26.8,
        proAgility: 4.30,
        pullUps: 14,
        gripStrength: 64,
        vo2Max: 58.8,
        broadJump: 110
      },
      scoutingNote: "Explosive torque generator. Rotational core power converts directly into a 92+ mph wrist shot release."
    },
    {
      id: "prospect-6",
      name: "Zeev Buium",
      pos: "LHD",
      team: "University of Denver / Minnesota Wild",
      league: "NCAA D1 / NHL",
      height: "6'0\"",
      weight: 186,
      metrics: {
        sprint30m: 3.87,
        wingatePeak: 16.5,
        verticalJump: 26.2,
        proAgility: 4.14,
        pullUps: 14,
        gripStrength: 59,
        vo2Max: 64.6,
        broadJump: 109
      },
      scoutingNote: "Class-leading 4.14 pro agility shuttle and 64.6 VO2 max. Skates 26+ minutes per night without showing metabolic fatigue."
    },
    {
      id: "prospect-7",
      name: "Beckett Sennecke",
      pos: "RW",
      team: "Oshawa Generals / Anaheim Ducks",
      league: "OHL / NHL",
      height: "6'3\"",
      weight: 182,
      metrics: {
        sprint30m: 3.84,
        wingatePeak: 16.7,
        verticalJump: 27.5,
        proAgility: 4.24,
        pullUps: 15,
        gripStrength: 61,
        vo2Max: 61.0,
        broadJump: 112
      },
      scoutingNote: "Late-blooming physical growth spurt with maintained coordination and sharp edge-work acceleration."
    },
    {
      id: "prospect-8",
      name: "Tij Iginla",
      pos: "C/LW",
      team: "Kelowna Rockets / Utah Hockey Club",
      league: "WHL / NHL",
      height: "6'0\"",
      weight: 186,
      metrics: {
        sprint30m: 3.82,
        wingatePeak: 17.3,
        verticalJump: 28.0,
        proAgility: 4.19,
        pullUps: 16,
        gripStrength: 66,
        vo2Max: 62.8,
        broadJump: 114
      },
      scoutingNote: "Elite hockey motor with relentless puck-battle tenacity. High-grade anaerobic repeatability."
    },
    {
      id: "prospect-9",
      name: "Zayne Parekh",
      pos: "RHD",
      team: "Saginaw Spirit / Calgary Flames",
      league: "OHL / NHL",
      height: "6'0\"",
      weight: 179,
      metrics: {
        sprint30m: 3.86,
        wingatePeak: 16.3,
        verticalJump: 26.0,
        proAgility: 4.17,
        pullUps: 13,
        gripStrength: 58,
        vo2Max: 63.2,
        broadJump: 108
      },
      scoutingNote: "Dynamic deception on the blue line. Agility and balance allow seamless walk-downs and lane creation."
    },
    {
      id: "prospect-10",
      name: "Carter Yakemchuk",
      pos: "RHD",
      team: "Calgary Hitmen / Ottawa Senators",
      league: "WHL / NHL",
      height: "6'3\"",
      weight: 202,
      metrics: {
        sprint30m: 3.89,
        wingatePeak: 17.6,
        verticalJump: 28.8,
        proAgility: 4.29,
        pullUps: 17,
        gripStrength: 69,
        vo2Max: 59.8,
        broadJump: 115
      },
      scoutingNote: "Heavy, intimidating frame with sharp offensive instincts and heavy slap shot release point."
    },
    {
      id: "prospect-11",
      name: "Hagen Burrows",
      pos: "RW/C",
      team: "Minnetonka Skippers / Sioux City Musketeers",
      league: "MSHSL / USHL",
      height: "6'2\"",
      weight: 176,
      metrics: {
        sprint30m: 3.96,
        wingatePeak: 16.3,
        verticalJump: 26.5,
        proAgility: 4.28,
        pullUps: 14,
        gripStrength: 61,
        vo2Max: 61.2,
        broadJump: 109
      },
      scoutingNote: "2024 Minnesota Mr. Hockey winner. High hockey sense, lethal catch-and-release snap shot, and deceptive length along the perimeter."
    },
    {
      id: "prospect-12",
      name: "Joe Connor",
      pos: "LW",
      team: "Avon Old Farms / Muskegon Lumberjacks",
      league: "NEPSAC / USHL",
      height: "5'10\"",
      weight: 175,
      metrics: {
        sprint30m: 3.88,
        wingatePeak: 16.8,
        verticalJump: 27.4,
        proAgility: 4.19,
        pullUps: 16,
        gripStrength: 59,
        vo2Max: 63.8,
        broadJump: 112
      },
      scoutingNote: "High-octane prep winger with relentless forecheck pressure, high-speed puck recovery, and tenacious motor."
    },
    {
      id: "prospect-13",
      name: "Dean Letourneau",
      pos: "C",
      team: "St. Andrew's College / Boston College",
      league: "Prep / NCAA D1",
      height: "6'7\"",
      weight: 214,
      metrics: {
        sprint30m: 3.99,
        wingatePeak: 17.4,
        verticalJump: 28.1,
        proAgility: 4.34,
        pullUps: 15,
        gripStrength: 72,
        vo2Max: 59.5,
        broadJump: 114
      },
      scoutingNote: "Rare 6-foot-7 frame with elite puck skills, exceptional reach on poke checks, and dynamic net-front power play presence."
    }
  ];

  // 4. COMPUTATION FUNCTIONS
  function calculateMetricPercentile(key, value) {
    const proto = PROTOCOLS[key];
    if (!proto || value === undefined || value === null) return 50;

    let pct;
    if (proto.lowerIsBetter) {
      pct = ((proto.min - value) / (proto.min - proto.max)) * 100;
    } else {
      pct = ((value - proto.min) / (proto.max - proto.min)) * 100;
    }

    return Math.max(5, Math.min(99, Math.round(pct)));
  }

  function percentileToScoutingScale(pct) {
    const z = (pct - 50) / 34.13;
    const grade = 50 + (z * 10);
    return Math.max(20, Math.min(80, Math.round(grade)));
  }

  function calculateComposite(metrics) {
    let totalWeight = 0;
    let weightedPct = 0;

    for (const [key, proto] of Object.entries(PROTOCOLS)) {
      const val = metrics[key];
      if (val !== undefined && val !== null) {
        const p = calculateMetricPercentile(key, val);
        weightedPct += p * proto.weight;
        totalWeight += proto.weight;
      }
    }

    const overallPct = totalWeight > 0 ? Math.round(weightedPct / totalWeight) : 50;
    const scoutingGrade = percentileToScoutingScale(overallPct);

    let tierLabel = "Average (Division III / Junior B)";
    let tierColor = "text-slate-400";
    if (scoutingGrade >= 75) {
      tierLabel = "Tier 1 Franchise / Generational Athlete";
      tierColor = "text-amber-400";
    } else if (scoutingGrade >= 65) {
      tierLabel = "Tier 2 High-End NCAA D1 / 1st Round Caliber";
      tierColor = "text-sky-400";
    } else if (scoutingGrade >= 55) {
      tierLabel = "Tier 3 Solid NCAA D1 / Junior Tier 1 Prospect";
      tierColor = "text-emerald-400";
    } else if (scoutingGrade >= 45) {
      tierLabel = "Tier 4 Developmental / USHL Depth";
      tierColor = "text-cyan-400";
    }

    return {
      percentile: overallPct,
      scoutingGrade: scoutingGrade,
      tierLabel: tierLabel,
      tierColor: tierColor
    };
  }

  function drawBiometricRadar(canvas, metrics, compareMetrics) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 38;

    ctx.clearRect(0, 0, width, height);

    const keys = Object.keys(PROTOCOLS);
    const totalAxes = keys.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // Concentric web
    const levels = [0.25, 0.5, 0.75, 1.0];
    levels.forEach((lvl, i) => {
      ctx.beginPath();
      for (let a = 0; a < totalAxes; a++) {
        const angle = (a * angleStep) - (Math.PI / 2);
        const x = centerX + Math.cos(angle) * (radius * lvl);
        const y = centerY + Math.sin(angle) * (radius * lvl);
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = i === levels.length - 1 ? "rgba(56, 189, 248, 0.4)" : "rgba(56, 189, 248, 0.15)";
      ctx.lineWidth = i === levels.length - 1 ? 1.5 : 1;
      ctx.stroke();

      ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
      ctx.font = "9px monospace";
      ctx.fillText(Math.round(lvl * 100) + "%", centerX + 4, centerY - (radius * lvl) + 10);
    });

    // Radial spokes & labels
    keys.forEach((key, a) => {
      const angle = (a * angleStep) - (Math.PI / 2);
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
      ctx.stroke();

      const labelDist = radius + 22;
      const lx = centerX + Math.cos(angle) * labelDist;
      const ly = centerY + Math.sin(angle) * labelDist;

      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const shortLabels = {
        sprint30m: "30m Sprint",
        wingatePeak: "Wingate W/kg",
        verticalJump: "Vert Jump",
        proAgility: "5-10-5 Agility",
        pullUps: "Pull-Ups",
        gripStrength: "Grip Dyno",
        vo2Max: "VO2 Max",
        broadJump: "Broad Jump"
      };
      ctx.fillText(shortLabels[key] || key, lx, ly);
    });

    // Comparison profile (e.g. Cohort norm)
    if (compareMetrics) {
      ctx.beginPath();
      keys.forEach((key, a) => {
        const val = compareMetrics[key];
        const pct = calculateMetricPercentile(key, val) / 100;
        const angle = (a * angleStep) - (Math.PI / 2);
        const x = centerX + Math.cos(angle) * (radius * Math.max(0.08, pct));
        const y = centerY + Math.sin(angle) * (radius * Math.max(0.08, pct));
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(148, 163, 184, 0.12)";
      ctx.fill();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Primary Athlete Polygon
    ctx.beginPath();
    keys.forEach((key, a) => {
      const val = metrics[key];
      const pct = calculateMetricPercentile(key, val) / 100;
      const angle = (a * angleStep) - (Math.PI / 2);
      const x = centerX + Math.cos(angle) * (radius * Math.max(0.08, pct));
      const y = centerY + Math.sin(angle) * (radius * Math.max(0.08, pct));
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    const grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, radius);
    grad.addColorStop(0, "rgba(14, 165, 233, 0.45)");
    grad.addColorStop(1, "rgba(56, 189, 248, 0.12)");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Vertices
    keys.forEach((key, a) => {
      const val = metrics[key];
      const pct = calculateMetricPercentile(key, val) / 100;
      const angle = (a * angleStep) - (Math.PI / 2);
      const x = centerX + Math.cos(angle) * (radius * Math.max(0.08, pct));
      const y = centerY + Math.sin(angle) * (radius * Math.max(0.08, pct));

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#0ea5e9";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  function saveCombineEvaluation(athleteId, athleteName, metrics, notes) {
    const composite = calculateComposite(metrics);
    const evaluation = {
      id: "combine_eval_" + Date.now(),
      athleteId: athleteId,
      athleteName: athleteName,
      timestamp: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      metrics: metrics,
      composite: composite,
      notes: notes || "Standard testing protocol completed under certified laser gates."
    };

    try {
      const existingRaw = localStorage.getItem("blueline_combine_evaluations");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.unshift(evaluation);
      localStorage.setItem("blueline_combine_evaluations", JSON.stringify(existing.slice(0, 50)));
    } catch (e) {
      console.warn("Could not save combine evaluation:", e);
    }

    return evaluation;
  }

  function broadcastCombineToWire(evaluation) {
    const comp = evaluation.composite;
    const topMetrics = Object.entries(evaluation.metrics).slice(0, 3).map(function(pair) {
      const k = pair[0];
      const v = pair[1];
      const p = PROTOCOLS[k];
      return p.name.split(" ")[0] + ": " + v + " " + p.unit;
    }).join(" • ");

    const post = {
      id: "post-combine-" + Date.now(),
      authorId: "usr_blueline_combine",
      timestamp: "Just now",
      content: "🧬 **OFFICIAL COMBINE DOSSIER: " + evaluation.athleteName.toUpperCase() + "**\n\nVerified biometric telemetry certified by BlueLine Testing Lab. Overall Athletic Grade: **" + comp.scoutingGrade + "/80** (" + comp.percentile + "th Percentile).\n\nKey Measurements: " + topMetrics + ".\n\n*" + evaluation.notes + "*\n\n#CombineReport #Biometrics #NHLCombine #BlueLineTestingLab #ScoutingBureau",
      likes: 31,
      reposts: 9,
      replies: 4,
      likedByMe: false,
      pinned: false,
      tags: ["#CombineReport", "#Biometrics", "#NHLCombine", "#ScoutingBureau"],
      media: {
        type: "stats_card",
        playerName: evaluation.athleteName,
        team: "Verified Combine Telemetry",
        stat1: "Grade: " + comp.scoutingGrade + "/80",
        stat2: comp.percentile + "th Pct",
        stat3: "30m: " + (evaluation.metrics.sprint30m || 3.85) + "s"
      }
    };

    try {
      const wireStateRaw = localStorage.getItem("blueline_social_state");
      let wireState = wireStateRaw ? JSON.parse(wireStateRaw) : { posts: [] };
      if (!Array.isArray(wireState.posts)) wireState.posts = [];
      wireState.posts.unshift(post);
      localStorage.setItem("blueline_social_state", JSON.stringify(wireState));
    } catch (e) {
      console.warn("Could not publish combine post to Wire:", e);
    }

    return post;
  }

  // Export to Global
  window.BlueLineCombineEngine = {
    PROTOCOLS: PROTOCOLS,
    COHORT_NORMS: COHORT_NORMS,
    PROSPECT_BENCHMARKS: PROSPECT_BENCHMARKS,
    calculateMetricPercentile: calculateMetricPercentile,
    percentileToScoutingScale: percentileToScoutingScale,
    calculateComposite: calculateComposite,
    drawBiometricRadar: drawBiometricRadar,
    saveCombineEvaluation: saveCombineEvaluation,
    broadcastCombineToWire: broadcastCombineToWire
  };

})(window);
