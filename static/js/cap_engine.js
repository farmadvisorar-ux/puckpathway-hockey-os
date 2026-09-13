/**
 * BlueLine DataWorks: AI Contract, Salary Cap & ELC Trajectory Engine
 * 
 * Features:
 * - 32 NHL Franchise Cap Sheets (2024-25 Upper Limit: $88.0M, Floor: $65.0M)
 * - Collective Bargaining Agreement (CBA) Entry-Level Contract (ELC) Matrix
 * - Schedule A ($1.0M max) and Schedule B ($2.5M max) Performance Bonuses
 * - 18/19-Year-Old ELC Slide Rule Simulator
 * - Standard NHL Buyout Formula (1/3 for <26, 2/3 for >=26, 2x duration)
 * - Salary Retention Trade Calculator (10%-50%, max 3 retained slots)
 * - Lifelong Career Earnings Trajectory Curve (Amateur -> NIL -> ELC -> Prime -> Veteran)
 * - Integration with The BlueLine Wire (#CapLab)
 */

(function(window) {
  "use strict";

  const CBA_RULES = {
    capUpperLimit: 88000000,
    capLowerLimit: 65000000,
    projectedNextCap: 92500000,
    maxElcBaseSalary: 975000,
    maxSigningBonusPct: 0.10, // 10% of base
    maxScheduleABonus: 1000000,
    maxScheduleBBonus: 2500000,
    maxRetentionPct: 0.50,
    maxRetentionSlots: 3,
    minNhlSalary: 775000
  };

  // 1. 32 NHL FRANCHISES CAP SITUATION (2024-25 Season)
  const NHL_TEAMS_CAP = [
    {
      id: "SJS",
      name: "San Jose Sharks",
      city: "San Jose",
      logo: "🦈",
      color: "#006d75",
      capHit: 73450000,
      capSpace: 14550000,
      ltirPool: 0,
      deadCap: 4125000,
      retainedSlotsUsed: 2,
      topContracts: [
        { player: "Logan Couture", aav: 8000000, term: "2027" },
        { player: "Marc-Edouard Vlasic", aav: 7000000, term: "2026" },
        { player: "Tyler Toffoli", aav: 6000000, term: "2028" }
      ],
      draftPickCapital: "9 Picks (2x 1st Rd)"
    },
    {
      id: "CHI",
      name: "Chicago Blackhawks",
      city: "Chicago",
      logo: "🦅",
      color: "#cf0a2c",
      capHit: 71200000,
      capSpace: 16800000,
      ltirPool: 0,
      deadCap: 2850000,
      retainedSlotsUsed: 1,
      topContracts: [
        { player: "Seth Jones", aav: 9500000, term: "2030" },
        { player: "Tyler Bertuzzi", aav: 5500000, term: "2028" },
        { player: "Teuvo Teravainen", aav: 5400000, term: "2027" }
      ],
      draftPickCapital: "8 Picks (2x 1st Rd)"
    },
    {
      id: "MTL",
      name: "Montreal Canadiens",
      city: "Montreal",
      logo: "🔴",
      color: "#af1e2d",
      capHit: 82100000,
      capSpace: 5900000,
      ltirPool: 10500000, // Carey Price
      deadCap: 3800000,
      retainedSlotsUsed: 2,
      topContracts: [
        { player: "Nick Suzuki", aav: 7875000, term: "2030" },
        { player: "Cole Caufield", aav: 7850000, term: "2031" },
        { player: "Juraj Slafkovsky", aav: 7600000, term: "2033" }
      ],
      draftPickCapital: "10 Picks (2x 1st Rd)"
    },
    {
      id: "UTA",
      name: "Utah Hockey Club",
      city: "Salt Lake City",
      logo: "🏔️",
      color: "#010101",
      capHit: 78900000,
      capSpace: 9100000,
      ltirPool: 0,
      deadCap: 1500000,
      retainedSlotsUsed: 1,
      topContracts: [
        { player: "Mikhail Sergachev", aav: 8500000, term: "2031" },
        { player: "Clayton Keller", aav: 7150000, term: "2028" },
        { player: "Nick Schmaltz", aav: 5850000, term: "2026" }
      ],
      draftPickCapital: "7 Picks"
    },
    {
      id: "TOR",
      name: "Toronto Maple Leafs",
      city: "Toronto",
      logo: "🍁",
      color: "#00205b",
      capHit: 87650000,
      capSpace: 350000,
      ltirPool: 0,
      deadCap: 0,
      retainedSlotsUsed: 0,
      topContracts: [
        { player: "Auston Matthews", aav: 13250000, term: "2028" },
        { player: "William Nylander", aav: 11500000, term: "2032" },
        { player: "John Tavares", aav: 11000000, term: "2025" }
      ],
      draftPickCapital: "5 Picks"
    },
    {
      id: "EDM",
      name: "Edmonton Oilers",
      city: "Edmonton",
      logo: "⚡",
      color: "#041e42",
      capHit: 87900000,
      capSpace: 100000,
      ltirPool: 4000000, // Evander Kane
      deadCap: 3200000,
      retainedSlotsUsed: 0,
      topContracts: [
        { player: "Connor McDavid", aav: 12500000, term: "2026" },
        { player: "Leon Draisaitl", aav: 14000000, term: "2033" },
        { player: "Darnell Nurse", aav: 9250000, term: "2030" }
      ],
      draftPickCapital: "6 Picks"
    },
    {
      id: "NYR",
      name: "New York Rangers",
      city: "New York",
      logo: "🗽",
      color: "#0038a8",
      capHit: 87250000,
      capSpace: 750000,
      ltirPool: 0,
      deadCap: 1200000,
      retainedSlotsUsed: 0,
      topContracts: [
        { player: "Artemi Panarin", aav: 11642857, term: "2026" },
        { player: "Adam Fox", aav: 9500000, term: "2029" },
        { player: "Mika Zibanejad", aav: 8500000, term: "2030" }
      ],
      draftPickCapital: "6 Picks"
    },
    {
      id: "FLA",
      name: "Florida Panthers",
      city: "Sunrise",
      logo: "🐆",
      color: "#041e42",
      capHit: 87400000,
      capSpace: 600000,
      ltirPool: 0,
      deadCap: 1540000,
      retainedSlotsUsed: 0,
      topContracts: [
        { player: "Aleksander Barkov", aav: 10000000, term: "2030" },
        { player: "Matthew Tkachuk", aav: 9500000, term: "2030" },
        { player: "Sam Reinhart", aav: 8625000, term: "2032" }
      ],
      draftPickCapital: "5 Picks"
    },
    {
      id: "COL",
      name: "Colorado Avalanche",
      city: "Denver",
      logo: "🏔️",
      color: "#6f263d",
      capHit: 87800000,
      capSpace: 200000,
      ltirPool: 7000000, // Landeskog
      deadCap: 0,
      retainedSlotsUsed: 0,
      topContracts: [
        { player: "Nathan MacKinnon", aav: 12600000, term: "2031" },
        { player: "Cale Makar", aav: 9000000, term: "2027" },
        { player: "Mikko Rantanen", aav: 9250000, term: "2025" }
      ],
      draftPickCapital: "6 Picks"
    },
    {
      id: "BOS",
      name: "Boston Bruins",
      city: "Boston",
      logo: "🐻",
      color: "#ffb81c",
      capHit: 86800000,
      capSpace: 1200000,
      ltirPool: 0,
      deadCap: 0,
      retainedSlotsUsed: 0,
      topContracts: [
        { player: "David Pastrnak", aav: 11250000, term: "2031" },
        { player: "Charlie McAvoy", aav: 9500000, term: "2030" },
        { player: "Elias Lindholm", aav: 7750000, term: "2031" }
      ],
      draftPickCapital: "6 Picks"
    }
  ];

  // 2. SCHEDULE A & B ROOKIE PERFORMANCE BONUS CRITERIA
  const SCHEDULE_A_CATEGORIES = [
    { id: "goals_20", label: "20 Goals (Forwards) / 10 Goals (Defense)", amount: 250000 },
    { id: "assists_35", label: "35 Assists (Forwards) / 25 Assists (Defense)", amount: 250000 },
    { id: "points_60", label: "60 Points (Forwards) / 40 Points (Defense)", amount: 250000 },
    { id: "ppg_073", label: "0.73 Points-Per-Game (min 42 games)", amount: 250000 },
    { id: "toi_top3", label: "Top 3 Team Time on Ice (min 42 games)", amount: 250000 },
    { id: "plus_10", label: "+10 Plus/Minus Rating (min 42 games)", amount: 250000 },
    { id: "all_rookie", label: "NHL All-Rookie Team Selection", amount: 250000 }
  ];

  const SCHEDULE_B_CATEGORIES = [
    { id: "calder_win", label: "Calder Memorial Trophy Winner", amount: 2500000 },
    { id: "calder_top3", label: "Calder Memorial Trophy Top 3 Finalist", amount: 1500000 },
    { id: "hart_top5", label: "Hart / Norris / Vezina Top 5 Voting", amount: 2000000 },
    { id: "nhl_first_allstar", label: "NHL First All-Star Team", amount: 2500000 },
    { id: "nhl_second_allstar", label: "NHL Second All-Star Team", amount: 1750000 },
    { id: "top10_scoring", label: "Top 10 League-Wide Scoring / Assists", amount: 2000000 }
  ];

  // 3. ELC CALCULATOR FUNCTION
  function calculateELC(params) {
    const age = parseInt(params.age || 18, 10);
    const baseSalary = Math.min(CBA_RULES.maxElcBaseSalary, Math.max(CBA_RULES.minNhlSalary, parseFloat(params.baseSalary || 975000)));
    const signingBonus = Math.min(baseSalary * CBA_RULES.maxSigningBonusPct, parseFloat(params.signingBonus || 97500));
    
    // ELC Term by CBA Age
    let term = 3;
    if (age >= 24) term = 1;
    else if (age >= 22) term = 2;

    // Performance Bonuses
    let schedATotal = 0;
    if (params.schedAChecked && Array.isArray(params.schedAChecked)) {
      schedATotal = params.schedAChecked.reduce((sum, id) => {
        const item = SCHEDULE_A_CATEGORIES.find(c => c.id === id);
        return sum + (item ? item.amount : 0);
      }, 0);
    }
    schedATotal = Math.min(CBA_RULES.maxScheduleABonus, schedATotal);

    let schedBTotal = 0;
    if (params.schedBChecked && Array.isArray(params.schedBChecked)) {
      schedBTotal = params.schedBChecked.reduce((sum, id) => {
        const item = SCHEDULE_B_CATEGORIES.find(c => c.id === id);
        return sum + (item ? item.amount : 0);
      }, 0);
    }
    schedBTotal = Math.min(CBA_RULES.maxScheduleBBonus, schedBTotal);

    const capHit = baseSalary + signingBonus;
    const maxEarningsPerYear = capHit + schedATotal + schedBTotal;
    const totalContractValue = (capHit * term) + (schedATotal * term) + (schedBTotal * term);

    // ELC Slide Eligibility: 18 or 19 years old playing < 10 NHL games
    const gamesPlayed = parseInt(params.nhlGamesPlayed || 0, 10);
    const slides = (age === 18 || age === 19) && gamesPlayed < 10;

    return {
      age: age,
      term: term,
      baseSalary: baseSalary,
      signingBonus: signingBonus,
      capHit: capHit,
      schedATotal: schedATotal,
      schedBTotal: schedBTotal,
      maxEarningsPerYear: maxEarningsPerYear,
      totalContractValue: totalContractValue,
      slides: slides,
      slideReason: slides ? `Contract SLIDES for 1 season (Age ${age}, played ${gamesPlayed} < 10 NHL games). Term remains ${term} years next season.` : "Contract does NOT slide (Standard ELC burn)."
    };
  }

  // 4. BUYOUT CALCULATOR FUNCTION (CBA Formula)
  function calculateBuyout(currentAge, remainingTermYears, baseSalaryPerYear, signingBonusPerYear) {
    const age = parseInt(currentAge || 27, 10);
    const yearsLeft = Math.max(1, parseInt(remainingTermYears || 2, 10));
    const base = parseFloat(baseSalaryPerYear || 5000000);
    const bonus = parseFloat(signingBonusPerYear || 0);
    
    // CBA Buyout Ratio: 1/3 if age < 26 on June 15, 2/3 if age >= 26
    const ratio = age < 26 ? (1 / 3) : (2 / 3);
    const buyoutSpreadYears = yearsLeft * 2;

    const totalBaseRemaining = base * yearsLeft;
    const totalBonusRemaining = bonus * yearsLeft; // Signing bonus is 100% guaranteed, cannot be bought out
    const totalBuyoutCost = (totalBaseRemaining * ratio) + totalBonusRemaining;
    const annualBuyoutPayout = (totalBaseRemaining * ratio) / buyoutSpreadYears;

    const originalCapHit = base + bonus;
    const breakdown = [];

    for (let yr = 1; yr <= buyoutSpreadYears; yr++) {
      let capHitInYear;
      if (yr <= yearsLeft) {
        // Active original contract years: Buyout Cap Hit = Original Cap Hit - (Original Base - Annual Payout)
        capHitInYear = originalCapHit - (base - annualBuyoutPayout);
      } else {
        // Extension years: pure annual buyout payout
        capHitInYear = annualBuyoutPayout;
      }

      const savings = yr <= yearsLeft ? (originalCapHit - capHitInYear) : -capHitInYear;

      breakdown.push({
        year: yr,
        label: `Year ${yr}`,
        capHit: Math.round(capHitInYear),
        savings: Math.round(savings),
        originalCapHit: yr <= yearsLeft ? originalCapHit : 0
      });
    }

    return {
      age: age,
      ratioLabel: age < 26 ? "1/3 (Age < 26 Discount)" : "2/3 (Age 26+ Standard)",
      originalCapHit: originalCapHit,
      yearsLeft: yearsLeft,
      buyoutSpreadYears: buyoutSpreadYears,
      totalBuyoutCost: Math.round(totalBuyoutCost),
      annualBuyoutPayout: Math.round(annualBuyoutPayout),
      breakdown: breakdown
    };
  }

  // 5. SALARY RETENTION CALCULATOR
  function calculateRetention(capHit, retentionPct) {
    const original = parseFloat(capHit || 6000000);
    const pct = Math.min(0.50, Math.max(0.10, parseFloat(retentionPct || 0.50)));
    const retainedAmount = original * pct;
    const acquiringTeamCapHit = original - retainedAmount;

    return {
      originalCapHit: original,
      retentionPct: Math.round(pct * 100),
      retainedAmount: Math.round(retainedAmount),
      acquiringTeamCapHit: Math.round(acquiringTeamCapHit)
    };
  }

  // 6. LIFELONG CAREER FINANCIAL TRAJECTORY MODEL
  function getCareerFinancialTrajectory(prospectRank) {
    const rank = parseInt(prospectRank || 1, 10);
    
    // Tier multipliers based on draft pedigree
    const isTop5 = rank <= 5;
    const isFirstRound = rank <= 32;

    return [
      {
        stage: "Youth / Feeder (14-17)",
        ageRange: "14-17",
        netEarnings: isTop5 ? 0 : -25000,
        compensationType: "Family Development / Equipment Sponsorship",
        aavStr: "$0",
        marketValue: 15
      },
      {
        stage: "NCAA D1 / USHL (18-19)",
        ageRange: "18-19",
        netEarnings: isTop5 ? 120000 : 45000,
        compensationType: "NIL Endorsement + Full Tuition & Stipends",
        aavStr: isTop5 ? "$120,000 NIL" : "$45,000 NIL",
        marketValue: 45
      },
      {
        stage: "NHL Entry-Level (20-22)",
        ageRange: "20-22",
        netEarnings: isTop5 ? 3850000 : 975000,
        compensationType: "ELC Base + Signing + Sched A/B Bonuses",
        aavStr: isTop5 ? "$3,850,000 /yr" : "$975,000 /yr",
        marketValue: 75
      },
      {
        stage: "RFA Bridge Deal (23-25)",
        ageRange: "23-25",
        netEarnings: isTop5 ? 7500000 : 3800000,
        compensationType: "Arbitration-Eligible 3-Year Bridge",
        aavStr: isTop5 ? "$7,500,000 /yr" : "$3,800,000 /yr",
        marketValue: 88
      },
      {
        stage: "Franchise Prime Extension (26-33)",
        ageRange: "26-33",
        netEarnings: isTop5 ? 11800000 : 6500000,
        compensationType: "8-Year Maximum Long-Term UFA Anchor",
        aavStr: isTop5 ? "$11,800,000 /yr" : "$6,500,000 /yr",
        marketValue: 95
      },
      {
        stage: "Veteran Depth / Cup Chaser (34-37)",
        ageRange: "34-37",
        netEarnings: 1750000,
        compensationType: "1-2 Year 35+ Performance-Incentivized Deal",
        aavStr: "$1,750,000 /yr",
        marketValue: 60
      }
    ];
  }

  // 7. CANVAS TRAJECTORY CHART RENDERER
  function drawCareerTrajectoryChart(canvas, trajectoryData) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 30, bottom: 50, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Grid lines
    ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const val = 12 - (i * 3);
      ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(`$${val}M`, padding.left - 8, y + 3);
    }

    const points = trajectoryData.map((d, i) => {
      const x = padding.left + (chartW / (trajectoryData.length - 1)) * i;
      const earningsMillions = Math.max(0, d.netEarnings) / 1000000;
      const y = padding.top + chartH - (earningsMillions / 12) * chartH;
      return { x, y, data: d };
    });

    // Draw Line and Gradient
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });

    // Stroke line
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, "rgba(14, 165, 233, 0.35)");
    grad.addColorStop(1, "rgba(14, 165, 233, 0.02)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw points and labels
    points.forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#0ea5e9";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Stage label on X axis
      ctx.fillStyle = "#94a3b8";
      ctx.font = "9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`Age ${pt.data.ageRange}`, pt.x, height - padding.bottom + 18);
      ctx.fillStyle = "#64748b";
      ctx.fillText(pt.data.aavStr, pt.x, height - padding.bottom + 32);
    });
  }

  // 8. BROADCAST SIGNING TO THE WIRE
  function broadcastContractToWire(contractSummary) {
    const post = {
      id: `post-cap-${Date.now()}`,
      authorId: "usr_blueline_caplab",
      timestamp: "Just now",
      content: `💼 **OFFICIAL CONTRACT TRANSACTION: ${contractSummary.playerName.toUpperCase()}**\n\n${contractSummary.teamName} has officially registered a ${contractSummary.term}-year contract valued at **$${(contractSummary.aav / 1000000).toFixed(2)}M AAV** ($${(contractSummary.totalValue / 1000000).toFixed(2)}M total).\n\nDetails: Base: $${contractSummary.baseSalary.toLocaleString()} • Signing Bonus: $${contractSummary.signingBonus.toLocaleString()} • Performance Bonuses: $${contractSummary.bonuses.toLocaleString()} • Slide: ${contractSummary.slides ? "YES" : "NO"}.\n\n#CapLab #ContractSigning #NHLContracts #BlueLineDataWorks`,
      likes: 38,
      reposts: 12,
      replies: 7,
      likedByMe: false,
      pinned: false,
      tags: ["#CapLab", "#ContractSigning", "#NHLContracts", "#BlueLineDataWorks"],
      media: {
        type: "stats_card",
        playerName: contractSummary.playerName,
        team: contractSummary.teamName,
        stat1: `${contractSummary.term} Yrs`,
        stat2: `$${(contractSummary.aav / 1000000).toFixed(2)}M AAV`,
        stat3: contractSummary.slides ? "Slide Eligible" : "Active Roster"
      }
    };

    try {
      const wireRaw = localStorage.getItem("blueline_social_state");
      let wireState = wireRaw ? JSON.parse(wireRaw) : { posts: [] };
      if (!Array.isArray(wireState.posts)) wireState.posts = [];
      wireState.posts.unshift(post);
      localStorage.setItem("blueline_social_state", JSON.stringify(wireState));
    } catch (e) {
      console.warn("Could not publish contract post to Wire:", e);
    }

    return post;
  }

  // Export to Global
  window.BlueLineCapEngine = {
    CBA_RULES,
    NHL_TEAMS_CAP,
    SCHEDULE_A_CATEGORIES,
    SCHEDULE_B_CATEGORIES,
    calculateELC,
    calculateBuyout,
    calculateRetention,
    getCareerFinancialTrajectory,
    drawCareerTrajectoryChart,
    broadcastContractToWire
  };

})(window);
